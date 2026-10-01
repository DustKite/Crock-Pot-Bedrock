var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EquipmentSlot, StartupEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { FOOD_CATEGORIES, getItemFoodValues } from "../data/FoodValuesData";

function formatFoodLore(values) {
    const rawtext = [];
    const entries = Object.entries(values).filter(([_, val]) => val > 0);
    if (entries.length === 0) return [];

    entries.forEach(([catName, val], index) => {
        const cat = FOOD_CATEGORIES[catName];
        if (!cat) return;
        if (index > 0) {
            rawtext.push({ text: "§f, §r" });
        }
        const valStr = parseFloat(val.toFixed(2)).toString();
        rawtext.push(
            { text: cat.color },
            { translate: cat.key },
            { text: ` ×${valStr}§r` }
        );
    });

    return [{ rawtext }];
}

function processItemLore(item) {
    if (!item) return null;

    const values = getItemFoodValues(item);
    if (!values) return null;

    const lore = item.getLore();
    if (lore && lore.length > 0 && lore.some(l => l.includes("×") || l.includes("item.crockpot."))) {
        return null;
    }

    item.setLore(formatFoodLore(values));
    return item;
}

export class FoodValuesRegister {
    register() {
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                const inv = player.getComponent("inventory");
                const container = inv?.container;

                if (container) {
                    for (let slot = 0; slot < container.size; slot++) {
                        const item = container.getItem(slot);
                        const updated = processItemLore(item);
                        if (updated) {
                            container.setItem(slot, updated);
                        }
                    }
                }

                const equip = player.getComponent("minecraft:equippable");
                if (equip) {
                    const offItem = equip.getEquipment(EquipmentSlot.Offhand);
                    const updatedOff = processItemLore(offItem);
                    if (updatedOff) {
                        equip.setEquipment(EquipmentSlot.Offhand, updatedOff);
                    }
                }
            }
        }, 10);
    }
}

__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartupEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesRegister.prototype, "register", null);