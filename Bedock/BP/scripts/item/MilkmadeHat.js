var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityComponentTypes, EquipmentSlot, ItemComponentTypes, StartupEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { hasLimitedMaterials, increaseAttribute } from "../lib/EntityUtil";
import { hurtItemInSlot } from "../lib/ItemUtil";

function handleMilkmadeHat(player) {
    const equip = player.getComponent(EntityComponentTypes.Equippable);
    if (!equip) return;

    const headSlot = equip.getEquipmentSlot(EquipmentSlot.Head);
    const headItem = headSlot?.getItem();
    if (!headItem) return;

    const isNormalHat = headItem.typeId === "crockpot:milkmade_hat";
    const isCreativeHat = headItem.typeId === "crockpot:creative_milkmade_hat";
    if (!isNormalHat && !isCreativeHat) return;

    const cooldown = headItem.getComponent(ItemComponentTypes.Cooldown);
    if (!cooldown || cooldown.getCooldownTicksRemaining(player) > 0) return;

    const hunger = player.getComponent(EntityComponentTypes.Hunger);
    if (!hunger || hunger.currentValue >= hunger.effectiveMax) return;

    increaseAttribute(player, EntityComponentTypes.Hunger, 1);
    increaseAttribute(player, EntityComponentTypes.Saturation, 0.1);
    cooldown.startCooldown(player);

    if (isNormalHat && hasLimitedMaterials(player)) {
        hurtItemInSlot(headSlot, headItem);
        if (!headSlot.hasItem()) {
            player.dimension.playSound("random.break", player.location);
        } else {
            system.run(() => {
                player.runCommand("stopsound @s armor.equip_generic");
            });
        }
    }
}

export class MilkmadeHat {
    register() {
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                if (player.isValid) handleMilkmadeHat(player);
            }
        }, 5);
    }
}

__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartupEvent]),
    __metadata("design:returntype", void 0)
], MilkmadeHat.prototype, "register", null);