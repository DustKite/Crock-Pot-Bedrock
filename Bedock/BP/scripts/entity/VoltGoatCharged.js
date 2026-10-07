var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityDamageCause, EntityHurtBeforeEvent, EntitySpawnAfterEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { CUSTOM_EFFECTS } from "../effect/EffectDefinitions";

const customDamageInProgress = new Set();
const convertingGoats = new Set();
const convertedVoltGoats = new Set();

function convertGoat(goat, dim) {
    if (!goat.isValid || convertingGoats.has(goat.id)) return;
    convertingGoats.add(goat.id);
    system.runTimeout(() => convertingGoats.delete(goat.id), 40);

    const loc = { x: goat.location.x, y: goat.location.y, z: goat.location.z };
    const rot = goat.getRotation();
    const nameTag = goat.nameTag;
    const isBaby = Boolean(goat.getComponent("minecraft:is_baby"));
    goat.clearVelocity?.();

    system.runTimeout(() => {
        if (goat.isValid) {
            goat.remove();
        }

        const nearbyLightning = dim.getEntities({
            location: loc,
            maxDistance: 3,
            type: "minecraft:lightning_bolt"
        });
        for (const bolt of nearbyLightning) {
            if (bolt.isValid) bolt.remove();
        }

        const voltGoat = dim.spawnEntity("crockpot:volt_goat", loc);
        if (!voltGoat) return;

        voltGoat.clearVelocity?.();
        convertedVoltGoats.add(voltGoat.id);
        system.runTimeout(() => {
            convertedVoltGoats.delete(voltGoat.id);
        }, 60);

        voltGoat.setRotation(rot);
        if (nameTag) voltGoat.nameTag = nameTag;
        if (isBaby) voltGoat.triggerEvent("minecraft:entity_born");
    }, 2);
}

export class VoltGoatCharged {
    static onEntitySpawn(event) {
        const { entity } = event;
        if (!entity?.isValid || entity.typeId !== "minecraft:lightning_bolt") return;

        system.run(() => {
            if (!entity.isValid) return;
            const dim = entity.dimension;
            const nearbyEntities = dim.getEntities({
                location: entity.location,
                maxDistance: 3
            });

            for (const target of nearbyEntities) {
                if (!target.isValid) continue;

                if (target.typeId === "minecraft:goat") {
                    convertGoat(target, dim);
                } else if (target.typeId === "crockpot:volt_goat" && !convertedVoltGoats.has(target.id)) {
                    target.triggerEvent("crockpot:become_charged");
                }
            }
        });
    }

    static onEntityHurt(event) {
        const { hurtEntity, damageSource, damage } = event;
        if (!hurtEntity || !damageSource || customDamageInProgress.has(hurtEntity.id)) return;

        if (convertingGoats.has(hurtEntity.id)) {
            event.cancel = true;
            return;
        }

        if (damageSource.cause === EntityDamageCause.lightning) {
            if (hurtEntity.typeId === "minecraft:goat") {
                event.cancel = true;
                convertGoat(hurtEntity, hurtEntity.dimension);
                return;
            }

            if (hurtEntity.typeId === "crockpot:volt_goat") {
                event.cancel = true;
                if (!convertedVoltGoats.has(hurtEntity.id)) {
                    system.run(() => {
                        if (hurtEntity.isValid && !convertedVoltGoats.has(hurtEntity.id)) {
                            hurtEntity.triggerEvent("crockpot:become_charged");
                        }
                    });
                }
                return;
            }
        }

        if (damageSource.cause === EntityDamageCause.entityAttack) {
            const attacker = damageSource.damagingEntity;
            if (attacker?.typeId === "crockpot:volt_goat" && attacker.getProperty("crockpot:is_charged")) {
                event.cancel = true;
                const finalDamage = damage * CUSTOM_EFFECTS.charge.getMultiplier(hurtEntity);

                system.run(() => {
                    if (!hurtEntity.isValid) return;
                    customDamageInProgress.add(hurtEntity.id);
                    hurtEntity.applyDamage(finalDamage, {
                        damagingEntity: attacker,
                        cause: EntityDamageCause.entityAttack
                    });
                    customDamageInProgress.delete(hurtEntity.id);
                });
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.entitySpawn),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EntitySpawnAfterEvent]),
    __metadata("design:returntype", void 0)
], VoltGoatCharged, "onEntitySpawn", null);

__decorate([
    EventAPI.register(world.beforeEvents.entityHurt),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EntityHurtBeforeEvent]),
    __metadata("design:returntype", void 0)
], VoltGoatCharged, "onEntityHurt", null);