var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityComponentTypes, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";

export class ParrotEgg {
    static onHit(event) {
        const { projectile, location, dimension } = event;
        if (!projectile) return;

        const variantMap = {
            "crockpot:parrot_egg_red_blue": 0,
            "crockpot:parrot_egg_blue": 1,
            "crockpot:parrot_egg_green": 2,
            "crockpot:parrot_egg_yellow_blue": 3,
            "crockpot:parrot_egg_gray": 4
        };

        const targetVariant = variantMap[projectile.typeId];
        if (targetVariant === undefined) return;

        if (Math.random() >= 1 / 16) return;

        const loc = { x: location.x, y: location.y + 0.1, z: location.z };
        let parrot = dimension.spawnEntity("minecraft:parrot", loc);
        for (let i = 0; i < 30; i++) {
            if (parrot.getComponent(EntityComponentTypes.Variant)?.value === targetVariant) break;
            parrot.remove();
            parrot = dimension.spawnEntity("minecraft:parrot", loc);
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.projectileHitBlock),
    EventAPI.register(world.afterEvents.projectileHitEntity),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParrotEgg, "onHit", null);