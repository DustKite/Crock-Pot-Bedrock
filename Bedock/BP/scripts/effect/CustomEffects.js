import { EntityDamageCause, MolangVariableMap, system, world } from "@minecraft/server";
import { CUSTOM_EFFECTS } from "./EffectDefinitions";

const DYNAMIC_PROP_KEY = "crockpot:custom_effects";
const playerEffects = new Map();
const customDamageInProgress = new Set();

function savePlayerEffects(player) {
    if (!player?.isValid) return;
    const effects = playerEffects.get(player.id);
    if (!effects || effects.size === 0) {
        player.setDynamicProperty(DYNAMIC_PROP_KEY, undefined);
        return;
    }
    const data = {};
    for (const [name, ticks] of effects) {
        if (ticks > 0) data[name] = ticks;
    }
    player.setDynamicProperty(DYNAMIC_PROP_KEY, Object.keys(data).length > 0 ? JSON.stringify(data) : undefined);
}

function loadPlayerEffects(player) {
    if (!player?.isValid) return;
    const raw = player.getDynamicProperty(DYNAMIC_PROP_KEY);
    if (!raw || typeof raw !== "string") return;
    try {
        const parsed = JSON.parse(raw);
        const map = new Map();
        for (const [name, ticks] of Object.entries(parsed)) {
            if (typeof ticks === "number" && ticks > 0) map.set(name, ticks);
        }
        if (map.size > 0) playerEffects.set(player.id, map);
    } catch { }
}

export function applyCustomEffect(player, effectName, durationTicks) {
    if (!player?.isValid) return;
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
    return Boolean(player?.isValid && playerEffects.get(player.id)?.get(effectName) > 0);
}

export function clearAllCustomEffects(player) {
    if (!player) return;
    playerEffects.delete(player.id);
    player.setDynamicProperty(DYNAMIC_PROP_KEY, undefined);
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
                    const molang = new MolangVariableMap();
                    molang.setColorRGBA("variable.color", color);
                    const pos = {
                        x: player.location.x + (Math.random() - 0.5) * 0.7,
                        y: player.location.y + 0.2 + Math.random() * 1.5,
                        z: player.location.z + (Math.random() - 0.5) * 0.7
                    };
                    player.dimension.spawnParticle("minecraft:mobspell_emitter", pos, molang);
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
    if (deadEntity?.typeId === "minecraft:player") {
        clearAllCustomEffects(deadEntity);
    }
});

world.beforeEvents.entityHurt.subscribe((event) => {
    const { hurtEntity, damageSource, damage } = event;
    if (!hurtEntity || !damageSource || customDamageInProgress.has(hurtEntity.id)) return;
    if (damageSource.cause !== EntityDamageCause.entityAttack) return;

    const attacker = damageSource.damagingEntity;
    if (!attacker?.isValid || attacker.typeId !== "minecraft:player") return;

    const hasWellFed = hasCustomEffect(attacker, "well_fed");
    const hasCharge = hasCustomEffect(attacker, "charge");
    if (!hasWellFed && !hasCharge) return;

    event.cancel = true;

    let finalDamage = damage;
    if (hasWellFed) finalDamage += CUSTOM_EFFECTS.well_fed.baseBonus;
    if (hasCharge) finalDamage *= CUSTOM_EFFECTS.charge.getMultiplier(hurtEntity);

    system.run(() => {
        if (!hurtEntity.isValid) return;
        customDamageInProgress.add(hurtEntity.id);
        try {
            hurtEntity.applyDamage(finalDamage, {
                damagingEntity: attacker,
                cause: EntityDamageCause.entityAttack
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