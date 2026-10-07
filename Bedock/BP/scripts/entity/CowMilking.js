var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityComponentTypes, ItemStack, PlayerInteractWithEntityBeforeEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { hasLimitedMaterials } from "../lib/EntityUtil";
import { takeItem } from "../lib/ItemUtil";
import { getItemFoodValues } from "../data/FoodValues";

function createMilkBottle() {
    const bottle = new ItemStack("crockpot:milk_bottle", 1);
    const values = getItemFoodValues(bottle);
    if (values) {
        const rawtext = [];
        const entries = Object.entries(values).filter(([_, val]) => val > 0);
        entries.forEach(([catName, val], index) => {
            if (index > 0) rawtext.push({ text: "§f, §r" });
            rawtext.push(
                { text: catName === "DAIRY" ? "§b" : "§f" },
                { translate: `item.crockpot:food_category_${catName.toLowerCase()}` },
                { text: ` ×${val}§r` }
            );
        });
        if (rawtext.length > 0) bottle.setLore([{ rawtext }]);
    }
    return bottle;
}

export class CowMilking {
    static onInteract(event) {
        const { player, target, itemStack } = event;
        if (!player || !target || !itemStack) return;

        if (itemStack.typeId !== "minecraft:glass_bottle") return;
        if (target.typeId !== "minecraft:cow" && target.typeId !== "minecraft:mooshroom") return;
        if (target.hasComponent("minecraft:is_baby")) return;

        event.cancel = true;

        system.run(() => {
            if (!player.isValid || !target.isValid) return;

            const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
            if (!container) return;

            target.dimension.playSound("mob.cow.milk", target.location);

            if (hasLimitedMaterials(player)) {
                takeItem(container, player.selectedSlotIndex);
            }

            const milkBottle = createMilkBottle();
            const leftover = container.addItem(milkBottle);
            if (leftover) {
                player.dimension.spawnItem(leftover, player.location);
            }
        });
    }
}

__decorate([
    EventAPI.register(world.beforeEvents.playerInteractWithEntity),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithEntityBeforeEvent]),
    __metadata("design:returntype", void 0)
], CowMilking, "onInteract", null);