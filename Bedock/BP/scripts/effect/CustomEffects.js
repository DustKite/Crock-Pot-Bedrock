import { EntityComponentTypes, MolangVariableMap, system, world } from "@minecraft/server";

const playerEffects = new Map();

const DYNAMIC_PROP_KEY = "crockpot:custom_effects";

const EFFECT_COLORS = {
    charge: { red: 78 / 255, green: 164 / 255, blue: 255 / 255, alpha: 1.0 },
    well_fed: { red: 218 / 255, green: 118 / 255, blue: 91 / 255, alpha: 1.0 },
    wither_resistance: { red: 114 / 255, green: 0 / 255, blue: 143 / 255, alpha: 1.0 },
    ocean_affinity: { red: 21 / 255, green: 221 / 255, blue: 244 / 255, alpha: 1.0 }
};

function savePlayerEffects(player) {
    if (!player || !player.isValid) return;
    const effects = playerEffects.get(player.id);
    try {
        if (!effects || effects.size === 0) {
            player.setDynamicProperty(DYNAMIC_PROP_KEY, undefined);
        } else {
            const data = {};
            for (const [name, ticks] of effects) {
                if (ticks > 0) data[name] = ticks;
            }
            if (Object.keys(data).length === 0) {
                player.setDynamicProperty(DYNAMIC_PROP_KEY, undefined);
            } else {
                player.setDynamicProperty(DYNAMIC_PROP_KEY, JSON.stringify(data));
            }
        }
    } catch (e) { }
}

function loadPlayerEffects(player) {
    if (!player || !player.isValid) return;
    try {
        const raw = player.getDynamicProperty(DYNAMIC_PROP_KEY);
        if (raw && typeof raw === "string") {
            const parsed = JSON.parse(raw);
            const map = new Map();
            for (const [name, ticks] of Object.entries(parsed)) {
                if (typeof ticks === "number" && ticks > 0) {
                    map.set(name, ticks);
                }
            }
            if (map.size > 0) {
                playerEffects.set(player.id, map);
            }
        }
    } catch (e) { }
}

export function applyCustomEffect(player, effectName, durationTicks) {
    if (!player || !player.isValid) return;
    let effects = playerEffects.get(player.id);
    if (!effects) {
        effects = new Map();
        playerEffects.set(player.id, effects);
    }
    effects.set(effectName, durationTicks);

    if (effectName === "wither_resistance") {
        player.removeEffect("wither");
    }

    savePlayerEffects(player);
}

export function hasCustomEffect(player, effectName) {
    if (!player || !player.isValid) return false;
    const effects = playerEffects.get(player.id);
    if (!effects) return false;
    const remaining = effects.get(effectName);
    return remaining !== undefined && remaining > 0;
}

export function clearAllCustomEffects(player) {
    if (!player) return;
    playerEffects.delete(player.id);
    try {
        player.setDynamicProperty(DYNAMIC_PROP_KEY, undefined);
    } catch (e) { }
}

function isEntityInWater(entity) {
    if (!entity || !entity.isValid) return false;
    try {
        if (entity.isSwimming) return true;
        const block = entity.dimension.getBlock(entity.location);
        if (block && (block.isLiquid || block.typeId.includes("water") || block.typeId.includes("bubble_column"))) {
            return true;
        }
    } catch (e) { }
    return false;
}

function applyDirectExtraDamage(target, extraDamage) {
    if (!target || !target.isValid) return;
    const health = target.getComponent(EntityComponentTypes.Health);
    if (!health) return;

    if (health.currentValue <= extraDamage) {
        target.kill();
    } else {
        health.setCurrentValue(health.currentValue - extraDamage);
    }
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (!player.isValid) continue;

        if (!playerEffects.has(player.id)) {
            loadPlayerEffects(player);
        }

        const effects = playerEffects.get(player.id);
        if (effects && effects.size > 0) {
            for (const [effectName, remaining] of effects) {
                if (remaining <= 1) {
                    effects.delete(effectName);
                } else {
                    effects.set(effectName, remaining - 1);
                }
            }
            if (effects.size === 0) {
                playerEffects.delete(player.id);
                savePlayerEffects(player);
            }
        }

        if (hasCustomEffect(player, "wither_resistance")) {
            player.removeEffect("wither");
        }

        if (hasCustomEffect(player, "ocean_affinity") && player.isSwimming) {
            const dir = player.getViewDirection();
            player.applyImpulse({
                x: dir.x * 0.035,
                y: dir.y * 0.035,
                z: dir.z * 0.035
            });
        }

        if (system.currentTick % 4 === 0) {
            for (const [effectName, colorObj] of Object.entries(EFFECT_COLORS)) {
                if (hasCustomEffect(player, effectName)) {
                    try {
                        const molang = new MolangVariableMap();
                        molang.setColorRGBA("variable.color", colorObj);
                        const pos = {
                            x: player.location.x + (Math.random() - 0.5) * 0.7,
                            y: player.location.y + 0.2 + Math.random() * 1.5,
                            z: player.location.z + (Math.random() - 0.5) * 0.7
                        };
                        player.dimension.spawnParticle("minecraft:mobspell_emitter", pos, molang);
                    } catch (e) { }
                }
            }
        }
    }

    if (system.currentTick % 100 === 0) {
        for (const player of world.getAllPlayers()) {
            if (player.isValid) {
                savePlayerEffects(player);
            }
        }
    }
}, 1);

world.afterEvents.playerSpawn.subscribe((event) => {
    const { player, initialSpawn } = event;
    if (!player || !player.isValid) return;
    if (initialSpawn) {
        loadPlayerEffects(player);
    }
});

world.beforeEvents.playerLeave.subscribe((event) => {
    const { player } = event;
    if (!player || !player.isValid) return;
    savePlayerEffects(player);
    playerEffects.delete(player.id);
});

world.afterEvents.entityDie.subscribe((event) => {
    const { deadEntity } = event;
    if (deadEntity && deadEntity.typeId === "minecraft:player") {
        clearAllCustomEffects(deadEntity);
    }
});

world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity, hitEntity } = event;
    if (!damagingEntity || !hitEntity || damagingEntity.typeId !== "minecraft:player") return;

    let extraDamage = 0;

    if (hasCustomEffect(damagingEntity, "well_fed")) {
        extraDamage += 1.0;
    }

    if (hasCustomEffect(damagingEntity, "charge")) {
        extraDamage += 2.0;
        if (isEntityInWater(hitEntity)) {
            extraDamage *= 1.3;
        }
    }

    if (extraDamage > 0) {
        applyDirectExtraDamage(hitEntity, extraDamage);
    }
});

world.afterEvents.entityHurt.subscribe((event) => {
    const { hurtEntity, damage } = event;
    if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") return;

    if (hasCustomEffect(hurtEntity, "well_fed") && damage >= 2) {
        const health = hurtEntity.getComponent(EntityComponentTypes.Health);
        if (health && health.currentValue > 0) {
            health.setCurrentValue(Math.min(health.currentValue + 1, health.effectiveMax));
        }
    }
});