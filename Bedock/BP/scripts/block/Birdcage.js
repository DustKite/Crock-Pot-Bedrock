var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { BlockPermutation, Direction, EntityComponentTypes, EquipmentSlot, ItemStack, PlayerBreakBlockBeforeEvent, PlayerInteractWithBlockBeforeEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { getEquipment, hasLimitedMaterials } from "../lib/EntityUtil";
import { takeEquippedItem, takeItem } from "../lib/ItemUtil";
import { offsetByDirection } from "../lib/DirectionUtil";
import { getItemFoodValues } from "../data/FoodValues";
import { seedRecipes } from "../data/SeedRecipes";

const breakingLocks = new Set();
const fedCooldowns = new Map();
const placingPositions = new Set();

function spawnSmokeParticles(dim, centerPos) {
    dim.spawnParticle("minecraft:basic_smoke_particle", { x: centerPos.x, y: centerPos.y + 0.3, z: centerPos.z });
    dim.spawnParticle("minecraft:basic_smoke_particle", { x: centerPos.x + 0.15, y: centerPos.y + 0.35, z: centerPos.z + 0.15 });
    dim.spawnParticle("minecraft:basic_smoke_particle", { x: centerPos.x - 0.15, y: centerPos.y + 0.35, z: centerPos.z - 0.15 });
}

function consumeHeldItem(player) {
    if (!hasLimitedMaterials(player)) return;
    if (typeof takeEquippedItem === "function") {
        takeEquippedItem(player, EquipmentSlot.Mainhand, 1, false);
    } else if (typeof takeItem === "function") {
        takeItem(player.getComponent(EntityComponentTypes.Inventory)?.container, player.selectedSlotIndex, 1);
    }
}

export class Birdcage {
    static interact(event) {
        const { player, block, itemStack, blockFace, isFirstEvent } = event;
        if (!player || !block) return;

        if (itemStack?.typeId === "crockpot:birdcage") {
            event.cancel = true;

            const dim = block.dimension;
            const isRep = !block || block.isAir || /short_grass|short_dry_grass|tall_dry_grass|tall_grass|fern|large_fern|deadbush|snow_layer/.test(block.typeId);
            const targetPos = isRep ? block.location : offsetByDirection(blockFace, { x: block.x, y: block.y, z: block.z });
            const lowerPos = blockFace === Direction.Down ? { x: targetPos.x, y: targetPos.y - 1, z: targetPos.z } : targetPos;
            const upperPos = { x: lowerPos.x, y: lowerPos.y + 1, z: lowerPos.z };

            if (lowerPos.y < -64 || upperPos.y > 319) return;
            const floor = dim.getBlock({ x: lowerPos.x, y: lowerPos.y - 1, z: lowerPos.z });
            const ceiling = dim.getBlock({ x: upperPos.x, y: upperPos.y + 1, z: upperPos.z });
            const floorSolid = floor && !floor.isAir && !floor.isLiquid;
            const ceilingSolid = ceiling && !ceiling.isAir && !ceiling.isLiquid;
            if (!floorSolid && !ceilingSolid) return;

            const posKey = `${dim.id}:${lowerPos.x},${lowerPos.y},${lowerPos.z}`;
            if (placingPositions.has(posKey)) return;
            placingPositions.add(posKey);

            system.run(() => {
                try {
                    const curLower = dim.getBlock(lowerPos);
                    const curUpper = dim.getBlock(upperPos);
                    if (!curLower || !curUpper) return;
                    const canLower = curLower.isAir || curLower.typeId === "crockpot:birdcage_lower" || /short_grass|short_dry_grass|tall_dry_grass|tall_grass|fern|large_fern|deadbush|snow_layer/.test(curLower.typeId);
                    const canUpper = curUpper.isAir || curUpper.typeId === "crockpot:birdcage_upper" || /short_grass|short_dry_grass|tall_dry_grass|tall_grass|fern|large_fern|deadbush|snow_layer/.test(curUpper.typeId);
                    if (!canLower || !canUpper) return;

                    curLower.setPermutation(BlockPermutation.resolve("crockpot:birdcage_lower", {
                        "crockpot:hanging": !floorSolid,
                        "crockpot:has_parrot": false,
                        "crockpot:parrot_variant": 0
                    }));
                    curUpper.setPermutation(BlockPermutation.resolve("crockpot:birdcage_upper", {
                        "crockpot:hanging": ceilingSolid,
                        "crockpot:has_parrot": false,
                        "crockpot:parrot_variant": 0
                    }));
                    dim.playSound("dig.stone", lowerPos);
                    consumeHeldItem(player);
                } finally {
                    system.run(() => placingPositions.delete(posKey));
                }
            });
            return;
        }

        if (isFirstEvent === false) return;

        if (block.typeId !== "crockpot:birdcage_lower" && block.typeId !== "crockpot:birdcage_upper") return;
        const lower = block.typeId === "crockpot:birdcage_lower" ? block : block.below(1);
        const upper = block.typeId === "crockpot:birdcage_upper" ? block : block.above(1);
        if (!lower || !upper || lower.typeId !== "crockpot:birdcage_lower" || upper.typeId !== "crockpot:birdcage_upper") return;

        const dim = lower.dimension;
        const centerPos = { x: lower.x + 0.5, y: lower.y + 0.5, z: lower.z + 0.5 };
        const perchPos = { x: lower.x + 0.5, y: lower.y + 0.62, z: lower.z + 0.4375 };
        const cageTag = `cage_${lower.x}_${lower.y}_${lower.z}`;
        const cagePosStr = `${lower.x},${lower.y},${lower.z}`;

        const seat = dim.getEntities({ location: perchPos, maxDistance: 0.8, type: "crockpot:birdcage", tags: [cageTag] })[0];
        let parrot = null;
        if (seat && seat.isValid) {
            const riders = (seat.getComponent(EntityComponentTypes.Rideable) ?? seat.getComponent("minecraft:rideable"))?.getRiders() || [];
            parrot = riders.find(r => r.typeId === "minecraft:parrot" && r.isValid);
        }
        if (!parrot) {
            const nearby = dim.getEntities({ location: perchPos, maxDistance: 0.8, type: "minecraft:parrot", tags: ["crockpot:caged"] });
            parrot = nearby.find(p => p.isValid && p.getDynamicProperty("caged_in") === cagePosStr) || null;
        }
        const hasRealParrot = !!(parrot && parrot.isValid);

        if (player.isSneaking && !itemStack) {
            if (!hasRealParrot) return;
            const tameable = parrot.getComponent(EntityComponentTypes.Tameable) ?? parrot.getComponent("minecraft:tameable");
            const ownerId = parrot.getDynamicProperty("owner_id") ?? tameable?.tamedToPlayerId ?? tameable?.tamedToPlayer?.id;
            if (ownerId && ownerId !== player.id) {
                event.cancel = true;
                system.run(() => player.onScreenDisplay.setActionBar({ translate: "tooltip.crockpot.birdcage.not_owner" }));
                return;
            }

            event.cancel = true;
            system.run(() => {
                if (seat && seat.isValid) {
                    seat.getComponent(EntityComponentTypes.Rideable)?.ejectRiders?.();
                    seat.remove();
                }
                if (parrot && parrot.isValid) {
                    parrot.removeTag("crockpot:caged");
                    parrot.setDynamicProperty("caged_in", undefined);
                    parrot.setDynamicProperty("owner_id", undefined);
                    parrot.teleport({ x: player.location.x, y: player.location.y, z: player.location.z }, { checkForBlocks: false });

                    const pTag = `cp_rec_p_${Date.now()}`;
                    const parrotTag = `cp_rec_b_${Date.now()}`;
                    player.addTag(pTag);
                    parrot.addTag(parrotTag);

                    system.runTimeout(() => {
                        try {
                            if (player.isValid && parrot.isValid) {
                                dim.runCommand(`ride @e[type=minecraft:parrot,tag="${parrotTag}",c=1] start_riding @a[tag="${pTag}",c=1] teleport_rider`);
                            }
                        } catch (e) {
                            if (parrot.isValid && player.isValid) parrot.teleport(player.location, { checkForBlocks: false });
                        } finally {
                            if (player.isValid) player.removeTag(pTag);
                            if (parrot.isValid) parrot.removeTag(parrotTag);
                        }
                    }, 1);
                }
                lower.setPermutation(lower.permutation.withState("crockpot:has_parrot", false).withState("crockpot:parrot_variant", 0));
                upper.setPermutation(upper.permutation.withState("crockpot:has_parrot", false).withState("crockpot:parrot_variant", 0));
                dim.playSound("mob.parrot.idle", centerPos);
            });
            return;
        }

        if (!player.isSneaking && !itemStack) {
            if (hasRealParrot) return;
            const pRiders = (player.getComponent(EntityComponentTypes.Rideable) ?? player.getComponent("minecraft:rideable"))?.getRiders() || [];
            const shoulderParrot = pRiders.find(r => r && r.isValid && r.typeId === "minecraft:parrot");
            if (!shoulderParrot || !shoulderParrot.isValid) return;

            event.cancel = true;
            system.run(() => {
                if (!shoulderParrot.isValid) return;
                const pRide = player.getComponent(EntityComponentTypes.Rideable) ?? player.getComponent("minecraft:rideable");
                if (typeof pRide?.ejectRider === "function") pRide.ejectRider(shoulderParrot);

                shoulderParrot.addTag("crockpot:caged");
                shoulderParrot.setDynamicProperty("caged_in", cagePosStr);
                shoulderParrot.setDynamicProperty("owner_id", player.id);
                shoulderParrot.teleport(perchPos, { checkForBlocks: false, keepVelocity: false });
                shoulderParrot.clearVelocity?.();

                system.runTimeout(() => {
                    if (!shoulderParrot.isValid) return;
                    const oldSeats = dim.getEntities({ location: perchPos, maxDistance: 0.8, type: "crockpot:birdcage", tags: [cageTag] });
                    for (const s of oldSeats) {
                        s.getComponent(EntityComponentTypes.Rideable)?.ejectRiders?.();
                        s.remove();
                    }
                    const newSeat = dim.spawnEntity("crockpot:birdcage", perchPos);
                    newSeat.addTag(cageTag);
                    newSeat.setDynamicProperty("cage_pos", cagePosStr);

                    shoulderParrot.teleport(perchPos, { checkForBlocks: false, keepVelocity: false });
                    const sRide = newSeat.getComponent(EntityComponentTypes.Rideable) ?? newSeat.getComponent("minecraft:rideable");
                    sRide?.addRider(shoulderParrot);

                    const variant = shoulderParrot.getComponent(EntityComponentTypes.Variant)?.value ?? 0;
                    lower.setPermutation(lower.permutation.withState("crockpot:has_parrot", true).withState("crockpot:parrot_variant", variant));
                    upper.setPermutation(upper.permutation.withState("crockpot:has_parrot", true).withState("crockpot:parrot_variant", variant));
                    dim.playSound("mob.parrot.idle", centerPos);
                }, 1);
            });
            return;
        }

        if (hasRealParrot && itemStack) {
            const cdKey = cagePosStr;
            if (system.currentTick < (fedCooldowns.get(cdKey) ?? 0)) {
                event.cancel = true;
                return;
            }

            const heldId = itemStack.typeId;
            let meatValues = null;
            const val = getItemFoodValues(itemStack);
            if (val && (val.MEAT > 0 || val.MONSTER > 0)) meatValues = val;

            if (!meatValues) {
                if (heldId === "minecraft:rotten_flesh") meatValues = { MEAT: 0.5, MONSTER: 1.0 };
                else if (/beef|porkchop|mutton|chicken|rabbit|cod|salmon|tropical_fish|frog_legs|hoglin_nose/.test(heldId)) meatValues = { MEAT: 1.0, MONSTER: 0.0 };
            }

            const seedRecipe = seedRecipes[heldId];

            if (meatValues && meatValues.MEAT > 0) {
                event.cancel = true;
                fedCooldowns.set(cdKey, system.currentTick + 10);
                system.run(() => {
                    consumeHeldItem(player);

                    const parrotPitch = (meatValues.MONSTER > 0) ? 0.75 : 1.25;
                    dim.playSound("mob.parrot.eat", centerPos, { pitch: parrotPitch });

                    spawnSmokeParticles(dim, centerPos);

                    if (meatValues.MONSTER > 0 && Math.random() < 0.5) return;

                    system.runTimeout(() => {
                        const variantIdx = lower.permutation.getState("crockpot:parrot_variant") ?? 0;
                        const vName = ["red_blue", "blue", "green", "yellow_blue", "gray"][variantIdx] ?? "red_blue";
                        dim.spawnItem(new ItemStack(`crockpot:parrot_egg_${vName}`, 1), { x: centerPos.x, y: centerPos.y + 0.2, z: centerPos.z });
                        dim.playSound("mob.parrot.eat", centerPos, { pitch: parrotPitch });
                    }, 40);
                });
                return;
            }

            if (seedRecipe) {
                event.cancel = true;
                fedCooldowns.set(cdKey, system.currentTick + 10);
                system.run(() => {
                    consumeHeldItem(player);
                    dim.playSound("mob.parrot.eat", centerPos, { pitch: 1.0 });

                    spawnSmokeParticles(dim, centerPos);

                    system.runTimeout(() => {
                        const count = Math.floor(Math.random() * (seedRecipe.max - seedRecipe.min + 1)) + seedRecipe.min;
                        dim.spawnItem(new ItemStack(seedRecipe.seed, count), { x: centerPos.x, y: centerPos.y + 0.2, z: centerPos.z });
                        dim.playSound("mob.parrot.eat", centerPos, { pitch: 1.0 });
                    }, 40);
                });
                return;
            }
        }
    }

    static breakBlock(event) {
        const { block, player, dimension, itemStack } = event;
        if (!block || !player) return;
        if (block.typeId !== "crockpot:birdcage_lower" && block.typeId !== "crockpot:birdcage_upper") return;

        if (!hasLimitedMaterials(player)) {
            const heldItem = getEquipment(player, EquipmentSlot.Mainhand) || itemStack;
            if (heldItem && /sword|trident|mace/.test(heldItem.typeId)) {
                event.cancel = true;
                return;
            }
        }

        const lower = block.typeId === "crockpot:birdcage_lower" ? block : block.below(1);
        const upper = block.typeId === "crockpot:birdcage_upper" ? block : block.above(1);
        const lockPos = lower || block;
        const posKey = `${dimension.id}:${lockPos.x},${lockPos.y},${lockPos.z}`;

        if (breakingLocks.has(posKey)) {
            event.cancel = true;
            return;
        }
        breakingLocks.add(posKey);
        event.cancel = true;

        const lowerLoc = lower ? { x: lower.x, y: lower.y, z: lower.z } : null;
        const upperLoc = upper ? { x: upper.x, y: upper.y, z: upper.z } : null;
        const dropPos = { x: lockPos.x + 0.5, y: lockPos.y + 0.5, z: lockPos.z + 0.5 };
        const isSurvival = hasLimitedMaterials(player);
        const cageTag = `cage_${lockPos.x}_${lockPos.y}_${lockPos.z}`;
        const cagePosStr = `${lockPos.x},${lockPos.y},${lockPos.z}`;

        system.run(() => {
            try {
                const allSeats = dimension.getEntities({ location: dropPos, maxDistance: 0.8, type: "crockpot:birdcage", tags: [cageTag] });
                for (const s of allSeats) {
                    s.getComponent(EntityComponentTypes.Rideable)?.ejectRiders?.();
                    s.remove();
                }
                const nearbyParrots = dimension.getEntities({ location: dropPos, maxDistance: 0.8, type: "minecraft:parrot", tags: ["crockpot:caged"] });
                const p = nearbyParrots.find(pt => pt.isValid && pt.getDynamicProperty("caged_in") === cagePosStr);
                if (p && p.isValid) {
                    p.removeTag("crockpot:caged");
                    p.setDynamicProperty("caged_in", undefined);
                    p.teleport(dropPos, { checkForBlocks: false });
                }
                if (lowerLoc) dimension.setBlockType(lowerLoc, "minecraft:air");
                if (upperLoc) dimension.setBlockType(upperLoc, "minecraft:air");
                if (isSurvival) dimension.spawnItem(new ItemStack("crockpot:birdcage", 1), dropPos);
            } finally {
                system.run(() => breakingLocks.delete(posKey));
            }
        });
    }
}

system.runInterval(() => {
    for (const dimId of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
        const dim = world.getDimension(dimId);
        if (!dim) continue;
        const seats = dim.getEntities({ type: "crockpot:birdcage" });
        for (const s of seats) {
            if (!s.isValid) continue;
            const posStr = s.getDynamicProperty("cage_pos");
            if (!posStr) continue;
            const [x, y, z] = posStr.split(",").map(Number);
            const b = dim.getBlock({ x, y, z });
            if (!b) continue;
            if (b.typeId !== "crockpot:birdcage_lower") {
                s.getComponent(EntityComponentTypes.Rideable)?.ejectRiders?.();
                s.remove();
                continue;
            }
            const sRide = s.getComponent(EntityComponentTypes.Rideable) ?? s.getComponent("minecraft:rideable");
            const riders = sRide?.getRiders() || [];
            if (riders.length === 0 && b.permutation.getState("crockpot:has_parrot")) {
                const cagePosStr = `${x},${y},${z}`;
                const perchPos = { x: x + 0.5, y: y + 0.62, z: z + 0.4375 };
                const nearby = dim.getEntities({ location: perchPos, maxDistance: 48, type: "minecraft:parrot", tags: ["crockpot:caged"] });
                const p = nearby.find(pt => pt.isValid && pt.getDynamicProperty("caged_in") === cagePosStr);
                if (p && p.isValid) {
                    p.teleport(perchPos, { checkForBlocks: false, keepVelocity: false });
                    p.clearVelocity?.();
                    sRide?.addRider(p);
                }
            }
        }
    }
}, 20);

__decorate([
    EventAPI.register(world.beforeEvents.playerInteractWithBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithBlockBeforeEvent]),
    __metadata("design:returntype", void 0)
], Birdcage, "interact", null);

__decorate([
    EventAPI.register(world.beforeEvents.playerBreakBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerBreakBlockBeforeEvent]),
    __metadata("design:returntype", void 0)
], Birdcage, "breakBlock", null);