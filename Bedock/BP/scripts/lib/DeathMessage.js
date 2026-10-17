import { EntityDamageCause, system, world } from "@minecraft/server";

const customHitTargets = new Map();
const recentAttackers = new Map();

function entityTranslateKey(typeId) {
    const idx = typeId.indexOf(":");
    if (idx === -1) return `entity.${typeId}.name`;
    const ns = typeId.slice(0, idx);
    const name = typeId.slice(idx + 1);
    if (ns === "minecraft") return `entity.${name}.name`;
    return `entity.${typeId}.name`;
}

function resolveAttackerName(attacker) {
    if (!attacker?.isValid) return null;
    if (attacker.typeId === "minecraft:player") {
        return { text: attacker.name };
    }
    const tag = attacker.nameTag;
    if (tag && tag.trim().length > 0 && tag !== attacker.typeId) {
        return { text: tag };
    }
    return { translate: entityTranslateKey(attacker.typeId) };
}

function resolveVictimName(target) {
    if (target.typeId === "minecraft:player") {
        return { text: target.name };
    }
    const tag = target.nameTag;
    if (tag && tag.trim().length > 0 && tag !== target.typeId) {
        return { text: tag };
    }
    return { translate: entityTranslateKey(target.typeId) };
}

export function applyCustomDamage(target, damage, deathKey) {
    if (!target?.isValid || damage <= 0) return;

    const isPlayer = target.typeId === "minecraft:player";
    const name = isPlayer ? target.name : target.nameTag;
    if (isPlayer || (name && name.trim().length > 0)) {
        customHitTargets.set(target.id, {
            key: deathKey,
            targetObj: resolveVictimName(target)
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
    let attacker = damageSource?.damagingEntity;
    if (!hurtEntity || !attacker?.isValid) return;

    try {
        const proj = attacker.getComponent("minecraft:projectile");
        if (proj?.owner?.isValid) attacker = proj.owner;
    } catch { }

    const attackerName = resolveAttackerName(attacker);
    if (!attackerName) return;

    recentAttackers.set(hurtEntity.id, {
        nameObj: attackerName,
        tick: system.currentTick
    });
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
    if (!deadEntity) return;
    const hitInfo = customHitTargets.get(deadEntity.id);
    if (!hitInfo) return;

    customHitTargets.delete(deadEntity.id);

    const attackerInfo = recentAttackers.get(deadEntity.id);
    const inCombat = attackerInfo && (system.currentTick - attackerInfo.tick <= 100);

    const key = inCombat ? `${hitInfo.key}.player` : hitInfo.key;
    const params = inCombat
        ? { rawtext: [hitInfo.targetObj, attackerInfo.nameObj] }
        : { rawtext: [hitInfo.targetObj] };

    const rawMessage = {
        rawtext: [
            {
                translate: key,
                with: params
            }
        ]
    };

    world.sendMessage(rawMessage);
});