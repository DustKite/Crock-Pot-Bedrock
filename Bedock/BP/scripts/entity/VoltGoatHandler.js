var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityHurtAfterEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { isWet } from "../effect/EffectDefinitions";

export class VoltGoatHandler {
    static onEntityHurt(event) {
        const { hurtEntity, damageSource } = event;
        if (!hurtEntity || !hurtEntity.isValid) return;

        if (damageSource.cause === "lightning" && hurtEntity.typeId === "minecraft:goat") {
            const dimension = hurtEntity.dimension;
            const location = { x: hurtEntity.location.x, y: hurtEntity.location.y, z: hurtEntity.location.z };
            const rotation = hurtEntity.getRotation();
            const nameTag = hurtEntity.nameTag;
            const isBaby = hurtEntity.hasComponent("minecraft:is_baby");

            system.run(() => {
                if (hurtEntity.isValid) {
                    hurtEntity.remove();
                }
                const voltGoat = dimension.spawnEntity("crockpot:volt_goat", location);
                if (voltGoat) {
                    voltGoat.setRotation(rotation);
                    if (nameTag) {
                        voltGoat.nameTag = nameTag;
                    }
                    if (isBaby) {
                        voltGoat.triggerEvent("crockpot:spawn_baby");
                    }
                    voltGoat.triggerEvent("crockpot:become_charged");
                }
            });
            return;
        }

        if (damageSource.cause === "lightning" && hurtEntity.typeId === "crockpot:volt_goat") {
            system.run(() => {
                if (hurtEntity.isValid) {
                    hurtEntity.triggerEvent("crockpot:become_charged");
                }
            });
            return;
        }

        const attacker = damageSource.damagingEntity;
        if (attacker?.typeId === "crockpot:volt_goat" && damageSource.cause === "entityAttack") {
            const isCharged = attacker.getProperty("crockpot:is_charged");
            if (isCharged && isWet(hurtEntity)) {
                system.run(() => {
                    if (hurtEntity.isValid) {
                        hurtEntity.applyDamage(event.damage * 0.3, {
                            cause: "magic",
                            damagingEntity: attacker
                        });
                    }
                });
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.entityHurt),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EntityHurtAfterEvent]),
    __metadata("design:returntype", void 0)
], VoltGoatHandler, "onEntityHurt", null);