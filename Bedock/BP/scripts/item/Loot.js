var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityComponentTypes, EntityDamageCause, EntityDieAfterEvent, EquipmentSlot, ItemStack, PlayerBreakBlockAfterEvent, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { enchantmentLevelOf, spawnStack } from "../lib/ItemUtil";
import { hasLimitedMaterials } from "../lib/EntityUtil";

function getMainhandItem(player) {
    return player?.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand);
}

function isEntityOnFire(entity, damageSource) {
    if (entity.getComponent("minecraft:onfire")?.onFireTicksRemaining > 0) return true;
    const cause = damageSource?.cause;
    return cause === EntityDamageCause.fire || cause === EntityDamageCause.fireTick || cause === EntityDamageCause.lava;
}

export class Loot {
    onEntityDie(event) {
        const { deadEntity, damageSource } = event;
        if (!deadEntity) return;

        const killer = damageSource?.damagingEntity;
        if (!killer || killer.typeId !== "minecraft:player") return;

        const mainhand = getMainhandItem(killer);
        const lootingLevel = enchantmentLevelOf(mainhand, "looting");
        const onFire = isEntityOnFire(deadEntity, damageSource);
        const typeId = deadEntity.typeId;

        if (typeId === "minecraft:frog") {
            const dropItemId = onFire ? "crockpot:cooked_frog_legs" : "crockpot:frog_legs";
            const bonus = Math.round(lootingLevel * Math.random());
            spawnStack(new ItemStack(dropItemId, Math.min(4, 1 + bonus)), deadEntity);
            return;
        }

        if (typeId === "minecraft:hoglin") {
            if (Math.random() < 0.30 + (lootingLevel * 0.03)) {
                const dropItemId = onFire ? "crockpot:cooked_hoglin_nose" : "crockpot:hoglin_nose";
                spawnStack(new ItemStack(dropItemId, 1), deadEntity);
            }
        }
    }

    onPlayerBreakBlock(event) {
        const { block, brokenBlockPermutation, player } = event;
        if (!player || !brokenBlockPermutation || !hasLimitedMaterials(player)) return;

        if (/short_grass|tallgrass|tall_grass|fern|large_fern/.test(brokenBlockPermutation.type.id)) {
            const mainhand = getMainhandItem(player);
            if (mainhand?.typeId === "minecraft:shears" || mainhand?.hasTag("minecraft:is_shears")) return;

            if (Math.random() < 0.10) {
                spawnStack(new ItemStack("crockpot:unknown_seeds", 1), block);
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.entityDie),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EntityDieAfterEvent]),
    __metadata("design:returntype", void 0)
], Loot.prototype, "onEntityDie", null);

__decorate([
    EventAPI.register(world.afterEvents.playerBreakBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerBreakBlockAfterEvent]),
    __metadata("design:returntype", void 0)
], Loot.prototype, "onPlayerBreakBlock", null);