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
    if (!player) return undefined;
    const equip = player.getComponent(EntityComponentTypes.Equippable);
    if (equip) {
        if (typeof equip.getEquipment === "function") {
            const item = equip.getEquipment(EquipmentSlot.Mainhand);
            if (item) return item;
        }
        if (typeof equip.getEquipmentSlot === "function") {
            const item = equip.getEquipmentSlot(EquipmentSlot.Mainhand)?.getItem?.();
            if (item) return item;
        }
    }
    const inv = player.getComponent(EntityComponentTypes.Inventory);
    const container = inv?.container;
    if (container && typeof player.selectedSlotIndex === "number") {
        return container.getItem(player.selectedSlotIndex);
    }
    return undefined;
}

function isEntityOnFire(entity, damageSource) {
    const onFireComp = entity.getComponent("minecraft:onfire") ?? entity.getComponent("onfire");
    if (onFireComp && onFireComp.onFireTicksRemaining > 0) return true;
    const cause = damageSource?.cause;
    if (
        cause === EntityDamageCause.fire ||
        cause === EntityDamageCause.fireTick ||
        cause === EntityDamageCause.lava
    ) {
        return true;
    }
    return false;
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
            const count = Math.min(4, 1 + bonus);
            spawnStack(new ItemStack(dropItemId, count), deadEntity);
            return;
        }

        if (typeId === "minecraft:hoglin") {
            const chance = 0.30 + (lootingLevel * 0.03);
            if (Math.random() < chance) {
                const dropItemId = onFire ? "crockpot:cooked_hoglin_nose" : "crockpot:hoglin_nose";
                spawnStack(new ItemStack(dropItemId, 1), deadEntity);
            }
            return;
        }
    }

    onPlayerBreakBlock(event) {
        const { block, brokenBlockPermutation, player } = event;
        if (!player || !brokenBlockPermutation) return;
        if (!hasLimitedMaterials(player)) return;

        const brokenId = brokenBlockPermutation.type.id;
        if (
            brokenId === "minecraft:short_grass" ||
            brokenId === "minecraft:tallgrass" ||
            brokenId === "minecraft:tall_grass" ||
            brokenId === "minecraft:fern" ||
            brokenId === "minecraft:large_fern"
        ) {
            const mainhand = getMainhandItem(player);
            if (mainhand?.typeId === "minecraft:shears" || mainhand?.hasTag?.("minecraft:is_shears")) return;

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