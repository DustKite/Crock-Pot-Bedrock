var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { BlockPermutation, Direction, EquipmentSlot, ItemStack, ItemUseBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerInteractWithBlockBeforeEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { offsetByDirection } from "../lib/DirectionUtil";
import { takeEquippedItem, takeItem } from "../lib/ItemUtil";
import { hasLimitedMaterials } from "../lib/EntityUtil";
import { BLOCK_TO_FOOD_MAP, FOOD_PLACE_MAP } from "../data/FoodPlaceMap";

const CARDINAL_DIRECTIONS = ["south", "west", "north", "east"];
const REPLACEABLE_BLOCKS = new Set([
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:tallgrass",
    "minecraft:fern",
    "minecraft:large_fern",
    "minecraft:deadbush",
    "minecraft:snow_layer",
    "minecraft:nether_sprouts",
    "minecraft:crimson_roots",
    "minecraft:warped_roots"
]);

const FOOD_SOUNDS = {
    "crockpot:asparagus_soup": "dig.coral",
    "crockpot:avaj": "dig.stone",
    "crockpot:bacon_eggs": "dig.wood",
    "crockpot:bone_stew": "block.lantern.place",
    "crockpot:breakfast_skillet": "block.lantern.place",
    "crockpot:candy": "dig.stone",
    "crockpot:fish_sticks": "block.sweet_berry_bush.place",
    "crockpot:fish_tacos": "block.sweet_berry_bush.place",
    "crockpot:flower_salad": "block.sweet_berry_bush.place",
    "crockpot:froggle_bunwich": "block.sweet_berry_bush.place",
    "crockpot:fruit_medley": "dig.stone",
    "crockpot:gazpacho": "dig.stone",
    "crockpot:glow_berry_mousse": "dig.coral",
    "crockpot:honey_ham": "dig.wood",
    "crockpot:honey_nuggets": "dig.wood",
    "crockpot:hot_cocoa": "dig.stone",
    "crockpot:ice_cream": "dig.coral",
    "crockpot:iced_tea": "dig.stone",
    "crockpot:jammy_preserves": "dig.coral",
    "crockpot:kabobs": "dig.wood",
    "crockpot:meat_balls": "dig.wood",
    "crockpot:monster_lasagna": "dig.coral",
    "crockpot:moqueca": "block.lantern.place",
    "crockpot:pepper_popper": "dig.wood",
    "crockpot:perogies": "dig.wood",
    "crockpot:potato_tornado": "dig.wood",
    "crockpot:pumpkin_cookie": "dig.wood",
    "crockpot:ratatouille": "block.lantern.place",
    "crockpot:scotch_egg": "block.sweet_berry_bush.place",
    "crockpot:seafood_gumbo": "dig.coral",
    "crockpot:stuffed_eggplant": "block.sweet_berry_bush.place",
    "crockpot:surf_n_turf": "dig.wood",
    "crockpot:taffy": "dig.stone",
    "crockpot:tea": "dig.stone",
    "crockpot:turkey_dinner": "block.sweet_berry_bush.place",
    "crockpot:veg_stinger": "dig.stone",
    "crockpot:volt_goat_jelly": "dig.coral",
    "crockpot:watermelon_icle": "dig.stone",
    "crockpot:wet_goop": "dig.coral"
};

function getFoodSound(blockId) {
    return FOOD_SOUNDS[blockId] ?? "dig.stone";
}

const foodPlacedTicks = new Map();
const breakingBlockLocks = new Set();

function isReplaceable(block) {
    if (!block) return false;
    return block.isAir || REPLACEABLE_BLOCKS.has(block.typeId);
}

function consumeFoodItem(player) {
    if (!hasLimitedMaterials(player)) return;
    if (typeof takeEquippedItem === "function") {
        takeEquippedItem(player, EquipmentSlot.Mainhand, 1, false);
    } else if (typeof takeItem === "function") {
        const container = player.getComponent("inventory")?.container;
        if (container) takeItem(container, player.selectedSlotIndex, 1);
    }
}

export class PlaceFood {
    static interact(event) {
        const { player, block, itemStack, isFirstEvent, blockFace } = event;
        if (!player || !block || isFirstEvent === false) return;

        const heldItemId = itemStack?.typeId;
        const blockId = block.typeId;

        const placedInfo = BLOCK_TO_FOOD_MAP.get(blockId);
        if (placedInfo && heldItemId === placedInfo.item && placedInfo.max > 1) {
            const currentStacks = Number(block.permutation.getState("crockpot:stacks") ?? 1);
            if (currentStacks < placedInfo.max) {
                foodPlacedTicks.set(player.id, system.currentTick);
                event.cancel = true;

                system.run(() => {
                    block.setPermutation(block.permutation.withState("crockpot:stacks", currentStacks + 1));
                    block.dimension.playSound(getFoodSound(blockId), block.location);
                    consumeFoodItem(player);
                });
                return;
            }
        }

        if (!heldItemId) return;
        const targetConfig = FOOD_PLACE_MAP[heldItemId];
        if (!targetConfig) return;

        if (blockId === "farmersdelight:cutting_board") return;

        let targetBlock;
        let pos;

        if (isReplaceable(block)) {
            targetBlock = block;
            pos = { x: block.x, y: block.y, z: block.z };
        } else {
            if (blockFace !== Direction.Up) return;
            pos = offsetByDirection(blockFace, { x: block.x, y: block.y, z: block.z });
            targetBlock = block.dimension.getBlock(pos);
        }

        if (!targetBlock || !isReplaceable(targetBlock)) return;

        const belowBlock = block.dimension.getBlock({ x: pos.x, y: pos.y - 1, z: pos.z });
        if (!belowBlock || belowBlock.isAir || isReplaceable(belowBlock) || belowBlock.typeId === "farmersdelight:cutting_board") {
            return;
        }

        if (!player.isSneaking) {
            system.run(() => {
                player.onScreenDisplay.setActionBar({ translate: "tooltip.crockpot.placeable_while_sneaking" });
            });
            return;
        }

        const yRot = ((player.getRotation().y % 360) + 360) % 360;
        const cardinalDirection = CARDINAL_DIRECTIONS[Math.floor(((yRot + 45) % 360) / 90)];

        foodPlacedTicks.set(player.id, system.currentTick);
        event.cancel = true;

        const dimension = block.dimension;
        system.run(() => {
            const currentBlock = dimension.getBlock(pos);
            if (!currentBlock) return;

            const stateObj = {
                "minecraft:cardinal_direction": cardinalDirection
            };
            if (targetConfig.max > 1) {
                stateObj["crockpot:stacks"] = 1;
            }

            currentBlock.setPermutation(BlockPermutation.resolve(targetConfig.block, stateObj));
            dimension.playSound(getFoodSound(targetConfig.block), pos);
            consumeFoodItem(player);
        });
    }

    static onItemUse(event) {
        const { source: player, itemStack } = event;
        if (!player || !itemStack) return;

        if (FOOD_PLACE_MAP[itemStack.typeId]) {
            const placedTick = foodPlacedTicks.get(player.id);
            if (placedTick !== undefined) {
                if (system.currentTick - placedTick <= 2) {
                    event.cancel = true;
                    return;
                }
                foodPlacedTicks.delete(player.id);
            }
        }
    }

    static breakBlock(event) {
        const { block, player, dimension } = event;
        if (!block) return;

        const info = BLOCK_TO_FOOD_MAP.get(block.typeId);
        if (!info) return;

        const { x, y, z } = block.location;
        const posKey = `${dimension.id}:${x},${y},${z}`;
        if (breakingBlockLocks.has(posKey)) {
            event.cancel = true;
            return;
        }

        breakingBlockLocks.add(posKey);
        event.cancel = true;

        const stackCount = info.max > 1 ? Number(block.permutation.getState("crockpot:stacks") ?? 1) : 1;
        const isSurvival = hasLimitedMaterials(player);
        const blockLoc = { x, y, z };
        const dropPos = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

        system.run(() => {
            try {
                dimension.setBlockType(blockLoc, "minecraft:air");
                if (isSurvival) {
                    dimension.spawnItem(new ItemStack(info.item, stackCount), dropPos);
                }
            } finally {
                breakingBlockLocks.delete(posKey);
            }
        });
    }
}

__decorate([
    EventAPI.register(world.beforeEvents.playerInteractWithBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithBlockBeforeEvent]),
    __metadata("design:returntype", void 0)
], PlaceFood, "interact", null);

__decorate([
    EventAPI.register(world.beforeEvents.itemUse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ItemUseBeforeEvent]),
    __metadata("design:returntype", void 0)
], PlaceFood, "onItemUse", null);

__decorate([
    EventAPI.register(world.beforeEvents.playerBreakBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerBreakBlockBeforeEvent]),
    __metadata("design:returntype", void 0)
], PlaceFood, "breakBlock", null);