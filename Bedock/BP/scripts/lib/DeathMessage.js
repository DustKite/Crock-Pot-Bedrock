import { EntityDamageCause, system, world } from "@minecraft/server";

const customHitTargets = new Map();
const recentAttackers = new Map();

export function applyCustomDamage(target, damage, deathKey) {
    if (!target?.isValid || damage <= 0) return;

    const isPlayer = target.typeId === "minecraft:player";
    const name = isPlayer ? target.name : target.nameTag;
    if (isPlayer || (name && name.trim().length > 0)) {
        customHitTargets.set(target.id, {
            key: deathKey,
            name: name
        });
        system.runTimeout(() => {
            customHitTargets.delete(target.id);
        }, 10);
    }

    const dim = target.dimension;
    try {
        dim.runCommand("gamerule sendcommandfeedback false");
        dim.runCommand("gamerule showdeathmessages false");
    } catch { }

    target.applyDamage(damage, { cause: EntityDamageCause.void });

    system.runTimeout(() => {
        try {
            dim.runCommand("gamerule showdeathmessages true");
            dim.runCommand("gamerule sendcommandfeedback true");
        } catch { }
    }, 2);
}

world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
    const attacker = damageSource?.damagingEntity;
    if (hurtEntity && attacker?.isValid) {
        const attackerName = attacker.typeId === "minecraft:player" ? attacker.name : (attacker.nameTag || attacker.typeId);
        recentAttackers.set(hurtEntity.id, {
            name: attackerName,
            tick: system.currentTick
        });
    }
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
    if (!deadEntity) return;
    const hitInfo = customHitTargets.get(deadEntity.id);
    if (!hitInfo) return;

    customHitTargets.delete(deadEntity.id);

    const attackerInfo = recentAttackers.get(deadEntity.id);
    const inCombat = attackerInfo && (system.currentTick - attackerInfo.tick <= 100);

    const key = inCombat ? `${hitInfo.key}.player` : hitInfo.key;
    const withParams = inCombat ? [hitInfo.name, attackerInfo.name] : [hitInfo.name];

    world.sendMessage({
        translate: key,
        with: withParams
    });
});