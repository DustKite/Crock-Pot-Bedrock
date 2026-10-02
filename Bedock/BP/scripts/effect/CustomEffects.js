import { MolangVariableMap, system, world } from "@minecraft/server";
import { CUSTOM_EFFECTS } from "./EffectDefinitions";

const DYNAMIC_PROP_KEY = "crockpot:custom_effects";
const playerEffects = new Map();
const customDamageInProgress = new Set();

function savePlayerEffects(player) {
    if (!player || !player.isValid) return;
    const effects = playerEffects.get(player.id);
    try {
        if (!effects || effects.size === 0) {
            player.setDynamicProperty(DYNAMIC_PROP_KEY, undefined);
            return;
        }
        const data = {};
        for (const [name, ticks] of effects) {
            if (ticks > 0) data[name] = ticks;
        }
        player.setDynamicProperty(DYNAMIC_PROP_KEY, Object.keys(data).length > 0 ? JSON.stringify(data) : undefined);
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
            if (map.size > 0) playerEffects.set(player.id, map);
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

    const currentTicks = effects.get(effectName) || 0;
    effects.set(effectName, Math.max(currentTicks, durationTicks));

    CUSTOM_EFFECTS[effectName]?.onApply?.(player);
    savePlayerEffects(player);
}

export function hasCustomEffect(player, effectName) {
    if (!player || !player.isValid) return false;
    const effects = playerEffects.get(player.id);
    return !!(effects && effects.get(effectName) > 0);
}

export function clearAllCustomEffects(player) {
    if (!player) return;
    playerEffects.delete(player.id);
    try {
        player.setDynamicProperty(DYNAMIC_PROP_KEY, undefined);
    } catch (e) { }
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
                    CUSTOM_EFFECTS[effectName]?.onTick?.(player);
                }
            }
            if (effects.size === 0) {
                playerEffects.delete(player.id);
                savePlayerEffects(player);
            }
        }

        if (system.currentTick % 4 === 0 && effects) {
            for (const effectName of effects.keys()) {
                const color = CUSTOM_EFFECTS[effectName]?.color;
                if (color) {
                    try {
                        const molang = new MolangVariableMap();
                        molang.setColorRGBA("variable.color", color);
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
            if (player.isValid) savePlayerEffects(player);
        }
    }
}, 1);

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (player?.isValid && initialSpawn) loadPlayerEffects(player);
});

world.beforeEvents.playerLeave.subscribe(({ player }) => {
    if (player?.isValid) {
        savePlayerEffects(player);
        playerEffects.delete(player.id);
    }
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
    if (deadEntity && deadEntity.typeId === "minecraft:player") {
        clearAllCustomEffects(deadEntity);
    }
});

world.beforeEvents.entityHurt.subscribe((event) => {
    const { hurtEntity, damageSource, damage } = event;
    if (!hurtEntity || !damageSource) return;

    if (customDamageInProgress.has(hurtEntity.id)) {
        return;
    }

    if (damageSource.cause !== "entityAttack" && damageSource.cause !== "entity_attack") {
        return;
    }

    const attacker = damageSource.damagingEntity;
    if (!attacker || !attacker.isValid || attacker.typeId !== "minecraft:player") {
        return;
    }

    const hasWellFed = hasCustomEffect(attacker, "well_fed");
    const hasCharge = hasCustomEffect(attacker, "charge");

    if (!hasWellFed && !hasCharge) return;

    event.cancel = true;

    let baseDamage = damage;
    if (hasWellFed) {
        baseDamage += CUSTOM_EFFECTS.well_fed.baseBonus;
    }

    let multiplier = 1.0;
    if (hasCharge) {
        multiplier = CUSTOM_EFFECTS.charge.getMultiplier(hurtEntity);
    }

    const finalDamage = baseDamage * multiplier;

    system.run(() => {
        if (!hurtEntity.isValid) return;
        customDamageInProgress.add(hurtEntity.id);
        try {
            hurtEntity.applyDamage(finalDamage, {
                damagingEntity: attacker,
                cause: "entityAttack"
            });
        } finally {
            customDamageInProgress.delete(hurtEntity.id);
        }
    });
});

world.afterEvents.entityHurt.subscribe(({ hurtEntity, damage }) => {
    if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") return;

    const effects = playerEffects.get(hurtEntity.id);
    if (!effects) return;

    for (const effectName of effects.keys()) {
        CUSTOM_EFFECTS[effectName]?.onHurt?.(hurtEntity, damage);
    }
});