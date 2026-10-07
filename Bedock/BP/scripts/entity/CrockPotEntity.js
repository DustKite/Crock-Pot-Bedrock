var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { ItemTypes, ItemStack, system, world, PlayerBreakBlockAfterEvent, BlockExplodeAfterEvent } from "@minecraft/server";
import ObjectUtil from "../lib/ObjectUtil";
import { EventAPI } from "../lib/EventAPI";
import { BlockEntity } from "../lib/BlockWithEntity";
import { ItemAPI } from "../lib/ItemAPI";
import { getItemFoodValues } from "../data/FoodValues";
import { CrockPotRecipes } from "../data/CrockPotRecipes";
import { getFuelBurnTime } from "../data/FuelValues";
import { getReturnItem, getReturnInfo } from "../data/ItemReturn";

function potEntitiesAt(block) {
    const { x, y, z } = block.location;
    const location = { x: x + 0.5, y: y, z: z + 0.5 };
    return block.dimension.getEntities({ location: location, maxDistance: 1 })
        .filter(entity => (entity.typeId === "crockpot:crock_pot" || entity.typeId === "crockpot:portable_crock_pot") &&
            ObjectUtil.isEqual(entity.getDynamicProperty("crockpot:blockEntityDataLocation"), location));
}

function popOutItem(dim, blockLoc, itemId, count = 1) {
    const pos = {
        x: blockLoc.x + 0.5,
        y: blockLoc.y + 0.85,
        z: blockLoc.z + 0.5
    };
    const itemEntity = dim.spawnItem(new ItemStack(itemId, count), pos);
    if (itemEntity) {
        itemEntity.applyImpulse({
            x: (Math.random() - 0.5) * 0.02,
            y: 0.04,
            z: (Math.random() - 0.5) * 0.02
        });
    }
}

function matchIngredient(item, ingredient) {
    if (Array.isArray(ingredient)) return ingredient.some(ing => matchIngredient(item, ing));
    if (ingredient.item && item.typeId === ingredient.item) return true;
    if (ingredient.tag && typeof item.hasTag === "function" && item.hasTag(ingredient.tag)) return true;
    return false;
}

function evaluateRequirement(req, foodValues, items) {
    switch (req.type) {
        case "contain":
            return items.filter(it => matchIngredient(it, req.ingredient)).length >= (req.quantity ?? 1);
        case "min":
            return (foodValues[req.category] ?? 0) >= req.value;
        case "gt":
            return (foodValues[req.category] ?? 0) > req.value;
        case "max":
            return (foodValues[req.category] ?? 0) <= req.value;
        case "lt":
            return (foodValues[req.category] ?? 0) < req.value;
        case "without":
            return (foodValues[req.category] ?? 0) <= 0;
        case "and":
            return evaluateRequirement(req.first, foodValues, items) && evaluateRequirement(req.second, foodValues, items);
        case "or":
            return evaluateRequirement(req.first, foodValues, items) || evaluateRequirement(req.second, foodValues, items);
        default:
            return false;
    }
}

function matchRecipe(items, potLevel) {
    if (items.length !== 4) return null;

    const mergedValues = {};
    for (const item of items) {
        const val = getItemFoodValues(item);
        if (val) {
            for (const [cat, num] of Object.entries(val)) {
                mergedValues[cat] = (mergedValues[cat] ?? 0) + num;
            }
        }
    }

    const matched = CrockPotRecipes.filter(r => {
        if (potLevel < r.potlevel) return false;
        return r.requirements.every(req => evaluateRequirement(req, mergedValues, items));
    });

    if (matched.length === 0) return null;

    const maxPriority = Math.max(...matched.map(r => r.priority));
    const highest = matched.filter(r => r.priority === maxPriority);

    if (highest.length === 1) return highest[0];

    const totalWeight = highest.reduce((sum, r) => sum + r.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const r of highest) {
        rand -= r.weight;
        if (rand <= 0) return r;
    }
    return highest[0];
}

function calculateArrow(progress, total) {
    if (total <= 0) return "crockpot:arrow_0";
    const percentage = Math.min(10, Math.floor((progress / total) * 10)) * 10;
    return `crockpot:arrow_${percentage}`;
}

function calculateFlame(burnRemaining, burnTotal) {
    if (burnTotal <= 0 || burnRemaining <= 0) return "crockpot:flame_0";
    const percentage = Math.min(10, Math.floor((burnRemaining / burnTotal) * 10)) * 10;
    return `crockpot:flame_${percentage}`;
}

function handleHoppers(dim, bx, by, bz, container) {
    const outputItem = container.getItem(5);
    if (outputItem) {
        const bottomBlock = dim.getBlock({ x: bx, y: by - 1, z: bz });
        if (bottomBlock?.typeId === "minecraft:hopper") {
            const bottomInv = bottomBlock.getComponent("inventory")?.container;
            if (bottomInv) {
                const leftover = bottomInv.addItem(outputItem);
                container.setItem(5, leftover);
            }
        }
    }

    const topBlock = dim.getBlock({ x: bx, y: by + 1, z: bz });
    if (topBlock?.typeId === "minecraft:hopper" && topBlock.permutation.getState("facing_direction") === 0) {
        const topInv = topBlock.getComponent("inventory")?.container;
        if (topInv) {
            for (let i = 0; i < topInv.size; i++) {
                const it = topInv.getItem(i);
                if (!it) continue;
                if (getItemFoodValues(it)) {
                    for (let s = 0; s < 4; s++) {
                        if (!container.getItem(s)) {
                            if (it.amount > 1) {
                                it.amount -= 1;
                                topInv.setItem(i, it);
                            } else {
                                topInv.setItem(i, undefined);
                            }
                            container.setItem(s, new ItemStack(it.typeId, 1));
                            break;
                        }
                    }
                }
            }
        }
    }

    const sideOffsets = [
        { x: 1, y: 0, z: 0, facing: 4 },
        { x: -1, y: 0, z: 0, facing: 5 },
        { x: 0, y: 0, z: 1, facing: 2 },
        { x: 0, y: 0, z: -1, facing: 3 }
    ];
    for (const off of sideOffsets) {
        const sideBlock = dim.getBlock({ x: bx + off.x, y: by + off.y, z: bz + off.z });
        if (sideBlock?.typeId === "minecraft:hopper" && sideBlock.permutation.getState("facing_direction") === off.facing) {
            const sideInv = sideBlock.getComponent("inventory")?.container;
            if (sideInv) {
                for (let i = 0; i < sideInv.size; i++) {
                    const it = sideInv.getItem(i);
                    if (!it) continue;
                    if (getFuelBurnTime(it) > 0) {
                        const curFuel = container.getItem(4);
                        if (!curFuel) {
                            if (it.amount > 1) {
                                it.amount -= 1;
                                sideInv.setItem(i, it);
                            } else {
                                sideInv.setItem(i, undefined);
                            }
                            container.setItem(4, new ItemStack(it.typeId, 1));
                            break;
                        } else if (curFuel.typeId === it.typeId && curFuel.amount < curFuel.maxAmount) {
                            if (it.amount > 1) {
                                it.amount -= 1;
                                sideInv.setItem(i, it);
                            } else {
                                sideInv.setItem(i, undefined);
                            }
                            curFuel.amount += 1;
                            container.setItem(4, curFuel);
                            break;
                        }
                    }
                }
            }
        }
    }
}

export class CrockPotEntity extends BlockEntity {
    tick(args) {
        const entityBlockData = super.blockEntityData(args.entity);
        if (!entityBlockData) return;
        const entity = entityBlockData.entity;
        if (super.entityContainerLoot(entityBlockData, entity.typeId)) return;

        const inventory = entity.getComponent("inventory");
        const container = inventory?.container;
        if (!container) return;

        const block = entityBlockData.block;
        const dim = entityBlockData.dimension;
        const potLevel = Number(entity.getDynamicProperty("crockpot:pot_level") ?? 0);
        const bx = block.location.x;
        const by = block.location.y;
        const bz = block.location.z;

        let burningTime = Number(entity.getDynamicProperty("crockpot:burning_time") ?? 0);
        let burningTotal = Number(entity.getDynamicProperty("crockpot:burning_total") ?? 0);
        let cookingTime = Number(entity.getDynamicProperty("crockpot:cooking_time") ?? 0);
        let cookingTotal = Number(entity.getDynamicProperty("crockpot:cooking_total") ?? 0);
        let targetResult = String(entity.getDynamicProperty("crockpot:target_result") ?? "");
        let resultCount = Number(entity.getDynamicProperty("crockpot:result_count") ?? 1);
        let returnItemsJson = String(entity.getDynamicProperty("crockpot:return_items") ?? "[]");

        if (system.currentTick % 8 === 0) {
            handleHoppers(dim, bx, by, bz, container);
        }

        let isOpen = Boolean(entity.getDynamicProperty("crockpot:is_open"));
        if (isOpen) {
            const openerId = entity.getDynamicProperty("crockpot:opener_id");
            const opener = openerId ? world.getAllPlayers().find(p => p.id === openerId) : undefined;
            let shouldClose = false;
            if (!opener || !opener.isValid) {
                shouldClose = true;
            } else {
                const openTick = Number(entity.getDynamicProperty("crockpot:open_tick") ?? 0);
                if (system.currentTick - openTick > 3) {
                    const rotX = Number(entity.getDynamicProperty("crockpot:opener_rot_x") ?? 0);
                    const rotY = Number(entity.getDynamicProperty("crockpot:opener_rot_y") ?? 0);
                    const locX = Number(entity.getDynamicProperty("crockpot:opener_loc_x") ?? 0);
                    const locZ = Number(entity.getDynamicProperty("crockpot:opener_loc_z") ?? 0);

                    const curRot = opener.getRotation();
                    const curLoc = opener.location;

                    const dRot = Math.abs(curRot.x - rotX) + Math.abs(curRot.y - rotY);
                    const dDistSq = (curLoc.x - locX) * (curLoc.x - locX) + (curLoc.z - locZ) * (curLoc.z - locZ);

                    if (dDistSq > 0.05 || dRot > 1.0 || opener.isSneaking) {
                        shouldClose = true;
                    }
                }
            }
            if (shouldClose) {
                isOpen = false;
                entity.setDynamicProperty("crockpot:is_open", false);
                entity.setDynamicProperty("crockpot:opener_id", undefined);
                dim.playSound("block.crockpot.crock_pot.close", entity.location);
            }
        }

        if (burningTime > 0) {
            burningTime--;
            entity.setDynamicProperty("crockpot:burning_time", burningTime);
        }

        const outputSlot = container.getItem(5);

        if (!targetResult && !outputSlot) {
            const in0 = container.getItem(0);
            const in1 = container.getItem(1);
            const in2 = container.getItem(2);
            const in3 = container.getItem(3);

            if (in0 && in1 && in2 && in3) {
                const fuelItem = container.getItem(4);
                const hasFuel = burningTime > 0 || getFuelBurnTime(fuelItem) > 0;

                if (hasFuel) {
                    const inputs = [in0, in1, in2, in3];
                    const matched = matchRecipe(inputs, potLevel);

                    if (matched) {
                        const returns = [];
                        for (let i = 0; i <= 3; i++) {
                            const item = container.getItem(i);
                            const retId = getReturnItem(item);
                            if (retId) returns.push(retId);
                            ItemAPI.clear(entity, i, 1);
                        }

                        targetResult = matched.result.id;
                        resultCount = matched.result.count ?? 1;
                        cookingTime = 0;
                        cookingTotal = Math.max(1, Math.floor(matched.cookingtime * (1.0 - 0.15 * potLevel)));

                        entity.setDynamicProperty("crockpot:target_result", targetResult);
                        entity.setDynamicProperty("crockpot:result_count", resultCount);
                        entity.setDynamicProperty("crockpot:cooking_time", 0);
                        entity.setDynamicProperty("crockpot:cooking_total", cookingTotal);
                        entity.setDynamicProperty("crockpot:return_items", JSON.stringify(returns));
                    }
                }
            }
        }

        if (targetResult) {
            if (burningTime <= 0) {
                const fuelItem = container.getItem(4);
                if (fuelItem) {
                    const burnVal = getFuelBurnTime(fuelItem);
                    if (burnVal > 0) {
                        burningTime = burnVal;
                        burningTotal = burnVal;

                        const ret = getReturnInfo(fuelItem);
                        ItemAPI.clear(entity, 4, 1);

                        if (ret) {
                            if (ret.inPlace) {
                                const slot4 = container.getItem(4);
                                if (!slot4) {
                                    container.setItem(4, new ItemStack(ret.id, 1));
                                } else if (slot4.typeId === ret.id && slot4.amount < slot4.maxAmount) {
                                    slot4.amount += 1;
                                    container.setItem(4, slot4);
                                } else {
                                    popOutItem(dim, block.location, ret.id, 1);
                                }
                            } else {
                                popOutItem(dim, block.location, ret.id, 1);
                            }
                        }

                        entity.setDynamicProperty("crockpot:burning_time", burningTime);
                        entity.setDynamicProperty("crockpot:burning_total", burningTotal);
                    }
                }
            }

            if (burningTime > 0) {
                if (cookingTime < cookingTotal) {
                    cookingTime++;
                    entity.setDynamicProperty("crockpot:cooking_time", cookingTime);

                    if (cookingTime % 25 === 0) {
                        dim.playSound("block.crockpot.crock_pot.rattle", entity.location);
                    }
                }

                const arrowId = calculateArrow(cookingTime, cookingTotal);
                if (ItemTypes.get(arrowId)) {
                    container.setItem(6, new ItemStack(arrowId));
                }

                if (cookingTime >= cookingTotal) {
                    const curOutput = container.getItem(5);
                    let canDeliver = false;

                    if (!curOutput) {
                        canDeliver = true;
                    } else if (curOutput.typeId === targetResult && curOutput.amount + resultCount <= curOutput.maxAmount) {
                        canDeliver = true;
                    }

                    if (canDeliver) {
                        if (!curOutput) {
                            container.setItem(5, new ItemStack(targetResult, resultCount));
                        } else {
                            curOutput.amount += resultCount;
                            container.setItem(5, curOutput);
                        }

                        container.setItem(6, undefined);
                        dim.playSound("block.crockpot.crock_pot.finish", entity.location);

                        const returns = JSON.parse(returnItemsJson);
                        for (const retId of returns) {
                            popOutItem(dim, block.location, retId, 1);
                        }

                        entity.setDynamicProperty("crockpot:target_result", "");
                        entity.setDynamicProperty("crockpot:cooking_time", 0);
                        entity.setDynamicProperty("crockpot:cooking_total", 0);
                        entity.setDynamicProperty("crockpot:return_items", "[]");
                    }
                }
            }
        } else {
            container.setItem(6, undefined);
        }

        if (burningTime > 0) {
            const flameId = calculateFlame(burningTime, burningTotal);
            if (ItemTypes.get(flameId)) {
                container.setItem(7, new ItemStack(flameId));
            } else if (ItemTypes.get("crockpot:flame")) {
                container.setItem(7, new ItemStack("crockpot:flame"));
            }
        } else {
            container.setItem(7, undefined);
        }

        if (block && (block.typeId === "crockpot:crock_pot" || block.typeId === "crockpot:portable_crock_pot")) {
            const isLit = burningTime > 0;
            const curLit = block.permutation.getState("crockpot:lit");
            const curOpen = block.permutation.getState("crockpot:open");
            if (curLit !== isLit || curOpen !== isOpen) {
                block.setPermutation(block.permutation.withState("crockpot:lit", isLit).withState("crockpot:open", isOpen));
            }
        }
    }

    breakBlock(args) {
        for (const entity of potEntitiesAt(args.block)) {
            const entityBlockData = super.blockEntityData(entity);
            if (entityBlockData) {
                const isCooking = Boolean(entity.getDynamicProperty("crockpot:target_result"));
                if (isCooking) {
                    ItemAPI.spawn(entity, "crockpot:wet_goop", 1);
                }
                const container = entity.getComponent("inventory")?.container;
                if (container) {
                    container.setItem(6, undefined);
                    container.setItem(7, undefined);
                }
                super.entityContainerLoot(entityBlockData, entity.typeId);
            }
        }
    }

    explode(args) {
        if (args.explodedBlockPermutation.type.id !== "crockpot:crock_pot" && args.explodedBlockPermutation.type.id !== "crockpot:portable_crock_pot") return;
        for (const entity of potEntitiesAt(args.block)) {
            const entityBlockData = super.blockEntityData(entity);
            if (entityBlockData) {
                const isCooking = Boolean(entity.getDynamicProperty("crockpot:target_result"));
                if (isCooking) {
                    ItemAPI.spawn(entity, "crockpot:wet_goop", 1);
                }
                const container = entity.getComponent("inventory")?.container;
                if (container) {
                    container.setItem(6, undefined);
                    container.setItem(7, undefined);
                }
                super.entityContainerLoot(entityBlockData, entity.typeId);
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.dataDrivenEntityTrigger, {
        entityTypes: ["crockpot:crock_pot", "crockpot:portable_crock_pot"],
        eventTypes: ["crockpot:crock_pot_tick"]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrockPotEntity.prototype, "tick", null);

__decorate([
    EventAPI.register(world.afterEvents.playerBreakBlock, {
        blockTypes: ["crockpot:crock_pot", "crockpot:portable_crock_pot"]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerBreakBlockAfterEvent]),
    __metadata("design:returntype", void 0)
], CrockPotEntity.prototype, "breakBlock", null);

__decorate([
    EventAPI.register(world.afterEvents.blockExplode),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BlockExplodeAfterEvent]),
    __metadata("design:returntype", void 0)
], CrockPotEntity.prototype, "explode", null);