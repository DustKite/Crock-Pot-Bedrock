var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BlockPermutation, PlayerBreakBlockAfterEvent, StartupEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { hasLimitedMaterials } from "../lib/EntityUtil";
import { takeItem } from "../lib/ItemUtil";

const UnknownCrops = [
    "crockpot:asparagus_crop",
    "crockpot:corn_bottom",
    "crockpot:eggplant_crop",
    "crockpot:garlic_crop",
    "crockpot:onion_crop",
    "crockpot:pepper_crop",
    "crockpot:tomato_crop"
];

function pickRandomCrop() {
    if (UnknownCrops.length === 0) return null;
    return UnknownCrops[Math.floor(Math.random() * UnknownCrops.length)];
}

function getGrowth(permutation) {
    if (!permutation) return 0;
    const val = permutation.getState("crockpot:growth");
    return typeof val === "number" ? val : 0;
}

function setGrowth(block, newGrowth) {
    block.setPermutation(block.permutation.withState("crockpot:growth", newGrowth));
}

function resolveWithGrowth(typeId, growthVal) {
    return BlockPermutation.resolve(typeId, { "crockpot:growth": growthVal });
}

function getBlockLightLevel(block) {
    if (typeof block.getLightLevel === "function") return block.getLightLevel();
    if (typeof block.dimension.getLightLevel === "function") return block.dimension.getLightLevel(block.location);
    return 9;
}

function getCropConfig(param) {
    const p = param?.params || {};
    return {
        isCorn: p.is_corn ?? false,
        isUnknown: p.is_unknown ?? false,
        maxGrowth: p.max_growth ?? 3,
        growthChance: p.growth_chance ?? 0.75,
        minLightLevel: p.min_light_level ?? 9
    };
}

class CropsComponent {
    constructor() {
        this.onRandomTick = this.onRandomTick.bind(this);
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
        this.onPlayerDestroy = this.onPlayerDestroy.bind(this);
    }

    grow(block, config) {
        if (config.isUnknown) return this.growUnknown(block);
        const currentGrowth = getGrowth(block.permutation);
        if (config.isCorn) {
            if (block.typeId === "crockpot:corn_top") {
                if (currentGrowth < 7) {
                    setGrowth(block, currentGrowth + 1);
                    return true;
                }
                return false;
            }
            if (currentGrowth < 3) {
                setGrowth(block, currentGrowth + 1);
                return true;
            }
            if (currentGrowth === 3) {
                const above = block.above();
                if (above && above.isAir) {
                    above.setPermutation(resolveWithGrowth("crockpot:corn_top", 4));
                    return true;
                }
                if (above && above.typeId === "crockpot:corn_top") {
                    const topGrowth = getGrowth(above.permutation);
                    if (topGrowth < 7) {
                        setGrowth(above, topGrowth + 1);
                        return true;
                    }
                }
            }
            return false;
        }
        if (currentGrowth < config.maxGrowth) {
            setGrowth(block, currentGrowth + 1);
            return true;
        }
        return false;
    }

    growUnknown(block) {
        const cropId = pickRandomCrop();
        if (!cropId) return false;
        block.setPermutation(resolveWithGrowth(cropId, 0));
        return true;
    }

    onRandomTick(args, param) {
        const block = args.block;
        const config = getCropConfig(param);
        if (config.minLightLevel > 0 && getBlockLightLevel(block) < config.minLightLevel) return;
        if (Math.random() > config.growthChance) return;
        this.grow(block, config);
    }

    onPlayerInteract(args, param) {
        const { block, player } = args;
        if (!player) return;
        const container = player.getComponent("inventory")?.container;
        const itemStack = container?.getItem(player.selectedSlotIndex);
        if (itemStack?.typeId === "minecraft:bone_meal") {
            const config = getCropConfig(param);
            const grew = this.grow(block, config);
            if (grew) {
                block.dimension.spawnParticle("minecraft:crop_growth_emitter", {
                    x: block.location.x + 0.5,
                    y: block.location.y + 0.5,
                    z: block.location.z + 0.5
                });
                player.playSound("item.bone_meal.use", block.location);
                if (hasLimitedMaterials(player)) takeItem(container, player.selectedSlotIndex, 1);
            }
        }
    }

    onPlayerDestroy(args) {
        const { block, destroyedBlockPermutation, dimension, player } = args;
        Crops.breakCornPartner(block, destroyedBlockPermutation?.type?.id, dimension, player);
    }
}

export class Crops {
    static breakCornPartner(block, brokenId, dimension, player) {
        if (!brokenId) return;
        const isCreative = player?.getGameMode?.() === "creative";

        if (brokenId === "crockpot:corn_top") {
            const below = block.below();
            if (below && below.typeId === "crockpot:corn_bottom") {
                const { x, y, z } = below.location;
                if (isCreative) {
                    dimension.setBlockType(below.location, "minecraft:air");
                } else {
                    dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
                }
            }
        } else if (brokenId === "crockpot:corn_bottom") {
            const above = block.above();
            if (above && above.typeId === "crockpot:corn_top") {
                const { x, y, z } = above.location;
                if (isCreative) {
                    dimension.setBlockType(above.location, "minecraft:air");
                } else {
                    dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
                }
            }
        }
    }

    register(args) {
        args.blockComponentRegistry.registerCustomComponent("crockpot:crops", new CropsComponent());
    }

    onPlayerBreakBlock(event) {
        const { block, brokenBlockPermutation, dimension, player } = event;
        if (!brokenBlockPermutation) return;
        Crops.breakCornPartner(block, brokenBlockPermutation.type.id, dimension, player);
    }
}

__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartupEvent]),
    __metadata("design:returntype", void 0)
], Crops.prototype, "register", null);

__decorate([
    EventAPI.register(world.afterEvents.playerBreakBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerBreakBlockAfterEvent]),
    __metadata("design:returntype", void 0)
], Crops.prototype, "onPlayerBreakBlock", null);