var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EquipmentSlot, ItemCompleteUseAfterEvent, PlayerInteractWithEntityBeforeEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { applyCustomEffect } from "../effect/CustomEffects";
import { takeEquippedItem } from "../lib/ItemUtil";
import { hasLimitedMaterials } from "../lib/EntityUtil";
import { applyCustomDamage } from "../lib/DeathMessage";

export const HORSE_FEED_TARGETS = new Set([
    "minecraft:donkey",
    "minecraft:horse",
    "minecraft:mule",
    "minecraft:llama",
    "minecraft:trader_llama",
]);

function healPlayer(player, amount) {
    const health = player.getComponent("minecraft:health");
    if (health) {
        health.setCurrentValue(Math.min(health.currentValue + amount, health.effectiveMax));
    }
}

function consumeEquippedFood(player) {
    if (hasLimitedMaterials(player)) {
        takeEquippedItem(player, EquipmentSlot.Mainhand, 1, false);
    }
}

function growBaby(target, player, propertyKey) {
    consumeEquippedFood(player);

    const loc = target.location;
    for (let i = 0; i < 5; i++) {
        target.dimension.spawnParticle("minecraft:villager_happy", {
            x: loc.x + (Math.random() - 0.5) * 0.8,
            y: loc.y + 0.3 + Math.random() * 0.5,
            z: loc.z + (Math.random() - 0.5) * 0.8
        });
    }

    const feeds = (target.getDynamicProperty(propertyKey) ?? 0) + 1;
    if (feeds >= 10) {
        target.setDynamicProperty(propertyKey, undefined);
        const ageable = target.getComponent("minecraft:ageable");
        if (typeof ageable?.growUp === "function") {
            ageable.growUp();
        } else {
            target.triggerEvent("minecraft:ageable_grow_up");
        }
    } else {
        target.setDynamicProperty(propertyKey, feeds);
    }
}

export class Food {
    static onConsume(event) {
        if (event.useDuration) return;
        const player = event.source;
        const itemStack = event.itemStack;
        if (!player || !itemStack) return;

        switch (itemStack.typeId) {
            case "crockpot:asparagus_soup":
                player.removeEffect("weakness");
                player.removeEffect("mining_fatigue");
                player.removeEffect("blindness");
                player.removeEffect("bad_omen");
                break;

            case "crockpot:avaj":
                player.addEffect("speed", 1940 * 20, { amplifier: 2 });
                break;

            case "crockpot:bacon_eggs":
                healPlayer(player, 4.0);
                break;

            case "crockpot:bone_soup":
                player.addEffect("absorption", 120 * 20, { amplifier: 1 });
                break;

            case "crockpot:bone_stew":
                player.addEffect("instant_health", 1, { amplifier: 1 });
                break;

            case "crockpot:bunny_stew":
                player.addEffect("regeneration", 5 * 20, { amplifier: 0 });
                applyCustomEffect(player, "well_fed", 120 * 20);
                break;

            case "crockpot:california_roll":
                healPlayer(player, 4.0);
                player.addEffect("absorption", 60 * 20, { amplifier: 0 });
                break;

            case "crockpot:candy": {
                const rand = Math.random();
                if (rand < 0.25) {
                    player.removeEffect("slowness");
                } else if (rand < 0.45) {
                    player.removeEffect("hunger");
                    player.addEffect("saturation", 1, { amplifier: 1 });
                } else if (rand < 0.55) {
                    player.removeEffect("mining_fatigue");
                    player.addEffect("haste", 20 * 20, { amplifier: 0 });
                } else if (rand < 0.60) {
                    player.addEffect("weakness", 10 * 20, { amplifier: 0 });
                    applyCustomDamage(player, 2.0, "death.attack.crockpot.candy");
                } else if (rand < 0.605) {
                    applyCustomDamage(player, 10.0, "death.attack.crockpot.candy");
                }
                break;
            }

            case "crockpot:ceviche":
                player.addEffect("resistance", 20 * 20, { amplifier: 1 });
                player.addEffect("absorption", 20 * 20, { amplifier: 1 });
                break;

            case "crockpot:fish_sticks":
                player.addEffect("regeneration", 30 * 20, { amplifier: 0 });
                break;

            case "crockpot:fish_tacos":
                healPlayer(player, 2.0);
                break;

            case "crockpot:flower_salad":
                healPlayer(player, 4.0);
                player.addEffect("regeneration", 20 * 20, { amplifier: 0 });
                Food.teleportPlayer(player);
                break;

            case "crockpot:fruit_medley":
                player.addEffect("speed", 180 * 20, { amplifier: 0 });
                break;

            case "crockpot:gazpacho":
                player.addEffect("fire_resistance", 600 * 20, { amplifier: 0 });
                break;

            case "crockpot:glow_berry_mousse":
                player.addEffect("regeneration", 30 * 20, { amplifier: 0 });
                break;

            case "crockpot:gummy_cake":
                if (Math.random() < 0.8) {
                    player.addEffect("slowness", 10 * 20, { amplifier: 0 });
                }
                break;

            case "crockpot:honey_ham":
                healPlayer(player, 6.0);
                player.addEffect("regeneration", 20 * 20, { amplifier: 0 });
                player.addEffect("absorption", 60 * 20, { amplifier: 1 });
                break;

            case "crockpot:honey_nuggets":
                healPlayer(player, 4.0);
                player.addEffect("regeneration", 10 * 20, { amplifier: 0 });
                player.addEffect("absorption", 60 * 20, { amplifier: 1 });
                break;

            case "crockpot:hot_chili":
                player.addEffect("strength", 90 * 20, { amplifier: 0 });
                player.addEffect("haste", 90 * 20, { amplifier: 0 });
                break;

            case "crockpot:hot_cocoa":
                player.addEffect("speed", 480 * 20, { amplifier: 1 });
                player.removeEffect("slowness");
                player.removeEffect("mining_fatigue");
                break;

            case "crockpot:ice_cream":
            case "crockpot:milk_bottle":
                for (const eff of player.getEffects()) {
                    player.removeEffect(eff.typeId);
                }
                break;

            case "crockpot:iced_tea":
                player.addEffect("speed", 600 * 20, { amplifier: 1 });
                player.addEffect("jump_boost", 300 * 20, { amplifier: 1 });
                break;

            case "crockpot:mashed_potatoes":
                player.addEffect("resistance", 240 * 20, { amplifier: 0 });
                break;

            case "crockpot:monster_lasagna":
                player.addEffect("hunger", 15 * 20, { amplifier: 0 });
                player.addEffect("poison", 2 * 20, { amplifier: 0 });
                applyCustomDamage(player, 6.0, "death.attack.crockpot.monster_food");
                break;

            case "crockpot:monster_tartare":
                player.addEffect("strength", 120 * 20, { amplifier: 1 });
                break;

            case "crockpot:moqueca":
                healPlayer(player, 6.0);
                player.addEffect("health_boost", 90 * 20, { amplifier: 2 });
                break;

            case "crockpot:mushy_cake":
                applyCustomEffect(player, "wither_resistance", 60 * 20);
                break;

            case "crockpot:pepper":
                applyCustomDamage(player, 1.0, "death.attack.crockpot.spicy");
                break;

            case "crockpot:pow_cake":
                applyCustomDamage(player, 1.0, "death.attack.crockpot.pow_cake");
                break;

            case "crockpot:pepper_popper":
                player.addEffect("strength", 60 * 20, { amplifier: 1 });
                break;

            case "crockpot:perogies":
                healPlayer(player, 6.0);
                break;

            case "crockpot:potato_souffle":
                player.addEffect("resistance", 90 * 20, { amplifier: 1 });
                break;

            case "crockpot:potato_tornado":
            case "crockpot:pumpkin_cookie":
                player.removeEffect("hunger");
                break;

            case "crockpot:salmon_sushi":
                healPlayer(player, 1.0);
                break;

            case "crockpot:salsa":
                player.addEffect("haste", 360 * 20, { amplifier: 0 });
                break;

            case "crockpot:seafood_gumbo":
                player.addEffect("regeneration", 120 * 20, { amplifier: 0 });
                break;

            case "crockpot:snake_bone_soup":
                healPlayer(player, 6.0);
                break;

            case "crockpot:steamed_ham_sandwich":
                healPlayer(player, 4.0);
                break;

            case "crockpot:stuffed_eggplant":
                healPlayer(player, 2.0);
                break;

            case "crockpot:surf_n_turf":
                healPlayer(player, 8.0);
                player.addEffect("regeneration", 30 * 20, { amplifier: 1 });
                break;

            case "crockpot:taffy":
                applyCustomDamage(player, 1.0, "death.attack.crockpot.taffy");
                player.removeEffect("poison");
                break;

            case "crockpot:tea":
                player.addEffect("speed", 600 * 20, { amplifier: 1 });
                player.addEffect("haste", 300 * 20, { amplifier: 1 });
                break;

            case "crockpot:tropical_bouillabaisse":
                applyCustomEffect(player, "ocean_affinity", 150 * 20);
                break;

            case "crockpot:turkey_dinner":
                player.addEffect("health_boost", 180 * 20, { amplifier: 0 });
                break;

            case "crockpot:veg_stinger":
                player.addEffect("night_vision", 600 * 20, { amplifier: 0 });
                break;

            case "crockpot:volt_goat_jelly":
                applyCustomEffect(player, "charge", 360 * 20);
                break;

            case "crockpot:watermelon_icle":
                player.addEffect("speed", 180 * 20, { amplifier: 0 });
                player.addEffect("jump_boost", 180 * 20, { amplifier: 0 });
                player.removeEffect("slowness");
                break;

            case "crockpot:wet_goop":
                player.addEffect("nausea", 10 * 20, { amplifier: 0 });
                break;
        }
    }

    static tryFeedEntity(event) {
        const { itemStack, target, player } = event;
        if (!itemStack || !target || !player) return;

        if (itemStack.typeId === "crockpot:steamed_sticks") {
            if (!HORSE_FEED_TARGETS.has(target.typeId) || !target.hasComponent("minecraft:is_baby")) return;
            event.cancel = true;
            system.run(() => {
                if (!target.isValid || !player.isValid) return;
                target.dimension.playSound("mob.horse.eat", target.location);
                growBaby(target, player, "crockpot:horse_baby_feeds");
            });
            return;
        }

        if (itemStack.hasTag("crockpot:is_seeds")) {
            if (target.typeId === "minecraft:chicken") {
                if (!target.hasComponent("minecraft:is_baby")) return;
                event.cancel = true;
                system.run(() => {
                    if (!target.isValid || !player.isValid) return;
                    target.dimension.playSound("mob.parrot.eat", target.location);
                    growBaby(target, player, "crockpot:chicken_baby_feeds");
                });
                return;
            }

            if (target.typeId === "minecraft:parrot") {
                const tameable = target.getComponent("minecraft:tameable");
                if (tameable && !tameable.isTamed) {
                    event.cancel = true;
                    system.run(() => {
                        if (!target.isValid || !player.isValid) return;

                        const dim = target.dimension;
                        const loc = target.location;
                        dim.playSound("mob.parrot.eat", loc);
                        consumeEquippedFood(player);

                        const chance = tameable.probability ?? 0.1;
                        if (Math.random() < chance) {
                            try {
                                if (tameable.tame(player)) {
                                    dim.spawnParticle("minecraft:heart_particle", {
                                        x: loc.x,
                                        y: loc.y + 0.5,
                                        z: loc.z
                                    });
                                }
                            } catch { }
                        } else {
                            dim.spawnParticle("minecraft:basic_smoke_particle", {
                                x: loc.x,
                                y: loc.y + 0.5,
                                z: loc.z
                            });
                        }
                    });
                }
            }
        }
    }

    static teleportPlayer(player) {
        const dimension = player.dimension;
        const start = { x: player.location.x, y: player.location.y, z: player.location.z };

        const isPassable = (b) => {
            if (!b || b.isAir) return true;
            const type = b.typeId;
            if (b.isLiquid || /water|lava|sea|kelp|coral/.test(type)) return false;
            return /sapling|mushroom|plant|vine|fern|bush|torch|lantern|carpet|snow|button|lever|rail|redstone|flower|rose|tulip|orchid|grass/.test(type) && !/_block|_path|pot|chorus/.test(type);
        };

        const isSolid = (b) => b && !b.isAir && !b.isLiquid && !isPassable(b) && !/water|sea|kelp|coral|lava|fire|magma/.test(b.typeId);

        const spawnBodyFX = (loc) => {
            dimension.playSound("mob.endermen.portal", loc);
            for (let j = 0; j < 20; j++) {
                dimension.spawnParticle("minecraft:basic_portal_particle", {
                    x: loc.x + (Math.random() - 0.5),
                    y: loc.y + Math.random() * 2,
                    z: loc.z + (Math.random() - 0.5)
                });
            }
        };

        const spawnTrail = (from, to) => {
            const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
            const steps = Math.floor(Math.sqrt(dx * dx + dy * dy + dz * dz) * 3);
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                for (let k = 0; k < 2; k++) {
                    dimension.spawnParticle("minecraft:basic_portal_particle", {
                        x: from.x + dx * t + (Math.random() - 0.5) * 0.3,
                        y: from.y + dy * t + Math.random() * 2,
                        z: from.z + dz * t + (Math.random() - 0.5) * 0.3
                    });
                }
            }
        };

        for (let i = 0; i < 1000; i++) {
            const tx = Math.floor(start.x + Math.random() * 17 - 8);
            const ty = Math.floor(start.y + Math.random() * 17 - 8);
            const tz = Math.floor(start.z + Math.random() * 17 - 8);
            if (ty < -64 || ty > 319) continue;

            const blockBelow = dimension.getBlock({ x: tx, y: ty - 1, z: tz });
            const blockFeet = dimension.getBlock({ x: tx, y: ty, z: tz });
            const blockHead = dimension.getBlock({ x: tx, y: ty + 1, z: tz });
            if (!blockBelow || !blockFeet || !blockHead) continue;

            if (isSolid(blockBelow) && isPassable(blockFeet) && isPassable(blockHead) && !blockFeet.isLiquid) {
                const offset = /(wall|fence|gate)/.test(blockBelow.typeId) ? 0.5 : 0.06;
                const dest = { x: tx + 0.5, y: ty + offset, z: tz + 0.5 };

                spawnBodyFX(start);
                spawnTrail(start, dest);
                player.teleport(dest, { checkForBlocks: false, keepVelocity: false });
                spawnBodyFX(dest);
                return;
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.itemCompleteUse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ItemCompleteUseAfterEvent]),
    __metadata("design:returntype", void 0)
], Food, "onConsume", null);

__decorate([
    EventAPI.register(world.beforeEvents.playerInteractWithEntity),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithEntityBeforeEvent]),
    __metadata("design:returntype", void 0)
], Food, "tryFeedEntity", null);