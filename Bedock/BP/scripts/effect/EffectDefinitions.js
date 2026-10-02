import { EntityComponentTypes } from "@minecraft/server";

export function isWet(entity) {
    if (!entity || !entity.isValid) return false;
    try {
        if (entity.isSwimming) return true;
        const block = entity.dimension.getBlock(entity.location);
        if (block && (block.isLiquid || block.typeId.includes("water") || block.typeId.includes("bubble_column") || block.typeId.includes("cauldron"))) {
            return true;
        }
        const headBlock = entity.dimension.getBlock({ x: entity.location.x, y: entity.location.y + 1, z: entity.location.z });
        if (headBlock && (headBlock.isLiquid || headBlock.typeId.includes("water"))) {
            return true;
        }
    } catch (e) { }
    return false;
}

export const CUSTOM_EFFECTS = {
    charge: {
        color: { red: 78 / 255, green: 164 / 255, blue: 255 / 255, alpha: 1.0 },
        getMultiplier(target) {
            let mult = 1.35;
            if (isWet(target)) {
                mult += 0.30;
            }
            return mult;
        }
    },

    well_fed: {
        color: { red: 218 / 255, green: 118 / 255, blue: 91 / 255, alpha: 1.0 },
        baseBonus: 1.0,
        onHurt(player, damage) {
            if (damage >= 2) {
                const health = player.getComponent(EntityComponentTypes.Health);
                if (health && health.currentValue > 0) {
                    health.setCurrentValue(Math.min(health.currentValue + 1, health.effectiveMax));
                }
            }
        }
    },

    wither_resistance: {
        color: { red: 114 / 255, green: 0 / 255, blue: 143 / 255, alpha: 1.0 },
        onApply(player) {
            player.removeEffect("wither");
        },
        onTick(player) {
            player.removeEffect("wither");
        }
    },

    ocean_affinity: {
        color: { red: 21 / 255, green: 221 / 255, blue: 244 / 255, alpha: 1.0 },
        onTick(player) {
            if (player.isSwimming) {
                const dir = player.getViewDirection();
                player.applyImpulse({ x: dir.x * 0.035, y: dir.y * 0.035, z: dir.z * 0.035 });
            }
        }
    }
};