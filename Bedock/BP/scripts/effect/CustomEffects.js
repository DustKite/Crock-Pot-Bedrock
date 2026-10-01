import { EntityComponentTypes, system, world } from "@minecraft/server";

const activeCustomEffects = new Map();

export function applyCustomEffect(player, effectName, durationTicks) {
    if (!player) return;
    const expireTick = system.currentTick + durationTicks;
    activeCustomEffects.set(`${player.id}:${effectName}`, expireTick);

    if (effectName === "wither_resistance") {
        player.removeEffect("wither");
    }
}

export function hasCustomEffect(player, effectName) {
    if (!player) return false;
    const expireTick = activeCustomEffects.get(`${player.id}:${effectName}`);
    if (!expireTick) return false;
    if (system.currentTick > expireTick) {
        activeCustomEffects.delete(`${player.id}:${effectName}`);
        return false;
    }
    return true;
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (!player.isValid()) continue;

        if (hasCustomEffect(player, "wither_resistance")) {
            player.removeEffect("wither");
        }

        if (hasCustomEffect(player, "ocean_affinity")) {
            if (player.isSwimming) {
                const dir = player.getViewDirection();
                player.applyImpulse({
                    x: dir.x * 0.03,
                    y: dir.y * 0.03,
                    z: dir.z * 0.03
                });
            }
        }
    }
}, 1);

world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity, hitEntity } = event;
    if (!damagingEntity || !hitEntity) return;

    if (damagingEntity.typeId === "minecraft:player" && hasCustomEffect(damagingEntity, "charge")) {
        const inWaterOrRain = hitEntity.isInWater || hitEntity.dimension.getWeather() === "rain";
        if (inWaterOrRain) {
            hitEntity.applyDamage(2);
        }
    }

    if (damagingEntity.typeId === "minecraft:player" && hasCustomEffect(damagingEntity, "well_fed")) {
        hitEntity.applyDamage(1);
    }
});