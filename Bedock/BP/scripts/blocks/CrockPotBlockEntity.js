var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { ItemStack, PlayerPlaceBlockAfterEvent, system, world } from "@minecraft/server";
import { attachedBlockEntity, subscribeEvent } from "../lib/EventSubscriber";
import { getBlockEntity } from "../lib/BlockWithEntity";
import { dropsItems } from "../lib/EntityUtil";
import { matchCrockPotRecipe } from "../data/recipes/CrockPotRecipes";

const FUEL_BURN_TICKS = {
    "minecraft:coal": 1600,
    "minecraft:charcoal": 1600,
    "minecraft:coal_block": 16000,
    "minecraft:blaze_rod": 2400,
    "minecraft:lava_bucket": 20000,
    "minecraft:stick": 100,
    "minecraft:bamboo": 50
};

function getFuelBurnTime(stack) {
    if (!stack) return 0;
    if (FUEL_BURN_TICKS[stack.typeId]) return FUEL_BURN_TICKS[stack.typeId];
    if (stack.typeId.includes("planks") || stack.typeId.includes("log") || stack.typeId.includes("wood")) return 300;
    return 0;
}

let CrockPotBlockEntity = class CrockPotBlockEntity {
    static onDiscard(entity) {
        const isCooking = entity.getDynamicProperty("crockpot:is_cooking") ?? false;
        dropsItems(entity);
        if (isCooking) {
            entity.dimension.spawnItem(new ItemStack("crockpot:wet_goop", 1), entity.location);
        }
        entity.dimension.setBlockType(entity.location, "minecraft:air");
    }

    static onTick(entity, block) {
        if (!block || !block.isValid) return;

        if (entity.nameTag !== "crockpot:crock_pot") {
            entity.nameTag = "crockpot:crock_pot";
        }

        const container = entity.getComponent("inventory")?.container;
        if (!container) return;

        const potLevel = block.typeId.includes("portable") ? 1 : 0;
        const { x, y, z } = entity.location;
        const dimension = entity.dimension;

        let burningTime = entity.getDynamicProperty("crockpot:burning_time") ?? 0;
        let cookingTime = entity.getDynamicProperty("crockpot:cooking_time") ?? 0;
        let cookingTotalTime = entity.getDynamicProperty("crockpot:cooking_total_time") ?? 0;
        let resultItemId = entity.getDynamicProperty("crockpot:result_item");
        let resultItemCount = entity.getDynamicProperty("crockpot:result_count") ?? 1;

        const fuelStack = container.getItem(4);
        const outputStack = container.getItem(5);

        // 1. 尝试启动烹饪流程
        if (!resultItemId && (!outputStack || outputStack.isEmpty)) {
            const inputs = [];
            for (let i = 0; i < 4; i++) {
                const item = container.getItem(i);
                if (item) inputs.push(item);
            }

            // 必须放满 4 样食材
            if (inputs.length === 4) {
                const recipe = matchCrockPotRecipe(inputs, potLevel);
                if (recipe) {
                    for (let i = 0; i < 4; i++) {
                        const item = container.getItem(i);
                        if (item.amount > 1) {
                            item.amount -= 1;
                            container.setItem(i, item);
                        } else {
                            container.setItem(i, undefined);
                        }
                    }

                    const speedMod = 0.15;
                    const finalDuration = Math.max(Math.floor(recipe.cookingtime * (1.0 - speedMod * potLevel)), 20);

                    resultItemId = recipe.result.id;
                    resultItemCount = recipe.result.count || 1;
                    cookingTotalTime = finalDuration;
                    cookingTime = 0;

                    entity.setDynamicProperty("crockpot:result_item", resultItemId);
                    entity.setDynamicProperty("crockpot:result_count", resultItemCount);
                    entity.setDynamicProperty("crockpot:cooking_total_time", cookingTotalTime);
                    entity.setDynamicProperty("crockpot:cooking_time", 0);
                    entity.setDynamicProperty("crockpot:is_cooking", true);
                }
            }
        }

        const isCooking = !!resultItemId;

        // 2. 燃料燃烧与消耗
        if (burningTime > 0) {
            burningTime--;
        } else if (isCooking && fuelStack) {
            const burnDuration = getFuelBurnTime(fuelStack);
            if (burnDuration > 0) {
                burningTime = burnDuration;
                if (fuelStack.typeId === "minecraft:lava_bucket") {
                    container.setItem(4, new ItemStack("minecraft:bucket", 1));
                } else if (fuelStack.amount > 1) {
                    fuelStack.amount -= 1;
                    container.setItem(4, fuelStack);
                } else {
                    container.setItem(4, undefined);
                }
            }
        }
        entity.setDynamicProperty("crockpot:burning_time", burningTime);

        // 3. 方块发光状态同步 (crockpot:lit)
        const isBurning = burningTime > 0;
        const currentLit = block.permutation.getState("crockpot:lit") ?? false;
        if (currentLit !== isBurning) {
            block.setPermutation(block.permutation.withState("crockpot:lit", isBurning));
        }

        // 4. 烹饪倒计时推进
        if (isCooking && isBurning) {
            cookingTime++;

            // 还原 Java 版摇锅音效与冒烟
            if (cookingTime % 5 === 0) {
                dimension.playSound("block.crock_pot.rattle", { x: x + 0.5, y: y + 0.5, z: z + 0.5 }, { volume: 0.5 });
            }
            if (system.currentTick % 10 === 0) {
                dimension.spawnParticle("minecraft:campfire_smoke_particle", { x: x + 0.5, y: y + 0.8, z: z + 0.5 });
            }

            // 完成烹饪，直接放入槽位 5
            if (cookingTime >= cookingTotalTime) {
                if (!outputStack) {
                    container.setItem(5, new ItemStack(resultItemId, resultItemCount));
                } else if (outputStack.typeId === resultItemId && outputStack.amount + resultItemCount <= outputStack.maxAmount) {
                    outputStack.amount += resultItemCount;
                    container.setItem(5, outputStack);
                }

                dimension.playSound("block.crock_pot.finish", { x: x + 0.5, y: y + 0.5, z: z + 0.5 });

                entity.setDynamicProperty("crockpot:result_item", undefined);
                entity.setDynamicProperty("crockpot:result_count", undefined);
                entity.setDynamicProperty("crockpot:cooking_total_time", undefined);
                entity.setDynamicProperty("crockpot:cooking_time", 0);
                entity.setDynamicProperty("crockpot:is_cooking", false);
                return;
            }
            entity.setDynamicProperty("crockpot:cooking_time", cookingTime);
        }
    }

    static onPlace(args) {
        const block = args.block;
        if (block.typeId !== "crockpot:crock_pot" && block.typeId !== "crockpot:portable_crock_pot") return;
        const entity = getBlockEntity(block, "crockpot:crock_pot");
        if (entity) {
            entity.nameTag = "crockpot:crock_pot";
        }
    }

    static onBreak(args) {
        const block = args.block;
        if (block.typeId !== "crockpot:crock_pot" && block.typeId !== "crockpot:portable_crock_pot") return;
        const entity = getBlockEntity(block, "crockpot:crock_pot");
        if (entity) {
            const isCooking = entity.getDynamicProperty("crockpot:is_cooking") ?? false;
            dropsItems(entity);
            if (isCooking) {
                entity.dimension.spawnItem(new ItemStack("crockpot:wet_goop", 1), entity.location);
            }
            entity.remove();
        }
    }
};

__decorate([
    subscribeEvent(world.afterEvents.playerPlaceBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerPlaceBlockAfterEvent]),
    __metadata("design:returntype", void 0)
], CrockPotBlockEntity, "onPlace", null);

__decorate([
    subscribeEvent(world.beforeEvents.playerBreakBlock, { blockTypes: ["crockpot:crock_pot", "crockpot:portable_crock_pot"] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrockPotBlockEntity, "onBreak", null);

CrockPotBlockEntity = __decorate([
    attachedBlockEntity({ eventTypes: ["crockpot:crock_pot_tick"] })
], CrockPotBlockEntity);

export { CrockPotBlockEntity };