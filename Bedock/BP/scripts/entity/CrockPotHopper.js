import { ItemStack } from "@minecraft/server";
import { getItemFoodValues } from "../data/FoodValues";
import { getFuelBurnTime } from "../data/FuelValues";

export function handleHoppers(dim, bx, by, bz, container) {
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