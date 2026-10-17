var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityComponentTypes, EntitySpawnAfterEvent, EquipmentSlot, PlayerInteractWithBlockBeforeEvent, PlayerInteractWithEntityBeforeEvent, ScriptEventCommandMessageAfterEvent, StartupEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { getItemFoodValues } from "../data/FoodValues";

export const FOOD_CATEGORIES = {
    MEAT: { key: "item.crockpot:food_category_meat", color: "§d" },
    MONSTER: { key: "item.crockpot:food_category_monster", color: "§5" },
    FISH: { key: "item.crockpot:food_category_fish", color: "§9" },
    EGG: { key: "item.crockpot:food_category_egg", color: "§3" },
    FRUIT: { key: "item.crockpot:food_category_fruit", color: "§6" },
    VEGGIE: { key: "item.crockpot:food_category_veggie", color: "§a" },
    DAIRY: { key: "item.crockpot:food_category_dairy", color: "§b" },
    SWEETENER: { key: "item.crockpot:food_category_sweetener", color: "§e" },
    FROZEN: { key: "item.crockpot:food_category_frozen", color: "§w" },
    INEDIBLE: { key: "item.crockpot:food_category_inedible", color: "§7" }
};

const CUSTOM_TOOLTIPS = {
    "crockpot:pot_upgrade_smithing_template": { color: "§9", key: "tooltip.crockpot.pot_upgrade_smithing_template" },
    "crockpot:steamed_sticks": { color: "§s", key: "tooltip.crockpot.steamed_sticks" },
    "crockpot:candy": { color: "§s", key: "tooltip.crockpot.candy" }
};

function formatFoodValue(val) {
    return Number.isInteger(val) ? val.toFixed(1) : String(val);
}

function formatFoodLore(values) {
    const rawtext = [];
    const entries = Object.entries(values).filter(([_, val]) => val > 0);
    if (entries.length === 0) return [];
    entries.forEach(([catName, val], index) => {
        const cat = FOOD_CATEGORIES[catName];
        if (!cat) return;
        if (index > 0) rawtext.push({ text: "§f, §r" });
        rawtext.push({ text: cat.color }, { translate: cat.key }, { text: ` ×${formatFoodValue(val)}§r` });
    });
    return [{ rawtext }];
}

function flattenLoreEntry(entry) {
    try {
        const obj = typeof entry === "string" ? JSON.parse(entry) : entry;
        return flattenRaw(obj);
    } catch {
        return typeof entry === "string" ? entry : "";
    }
}

function flattenRaw(msg) {
    if (!msg) return "";
    if (typeof msg === "string") return msg;
    if (msg.rawtext) return msg.rawtext.map(flattenRaw).join("");
    if (msg.text !== undefined) return msg.text;
    if (msg.translate !== undefined) return `#${msg.translate}`;
    if (msg.with) return msg.with.map(flattenRaw).join("");
    return "";
}

function isCrockpotLore(entry) {
    const s = flattenLoreEntry(entry);
    return s.includes("item.crockpot:food_category") || s.includes("tooltip.crockpot.");
}

function processItemLore(item) {
    if (!item) return null;

    const customTooltip = CUSTOM_TOOLTIPS[item.typeId];
    const values = getItemFoodValues(item);
    if (!customTooltip && !values) return null;

    const expected = [];
    if (customTooltip) {
        expected.push({ rawtext: [{ text: customTooltip.color }, { translate: customTooltip.key }, { text: "§r" }] });
    }
    if (values) {
        expected.push(...formatFoodLore(values));
    }
    if (expected.length === 0) return null;

    const expectedNorm = expected.map(flattenLoreEntry);

    const current = item.getLore() ?? [];
    const currentManaged = current.filter(isCrockpotLore);
    const currentNorm = currentManaged.map(flattenLoreEntry);

    if (JSON.stringify(expectedNorm) === JSON.stringify(currentNorm)) {
        return null;
    }

    const preserved = current.filter(l => !isCrockpotLore(l));
    item.setLore([...preserved, ...expected]);
    return item;
}

function updateContainerBlock(targetBlock) {
    if (!targetBlock) return;
    try {
        const invComp = targetBlock.getComponent("inventory") ?? targetBlock.getComponent("minecraft:inventory");
        const container = invComp?.container;
        if (container) {
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (item) {
                    const updated = processItemLore(item);
                    if (updated) container.setItem(i, updated);
                }
            }
        }
    } catch (e) { }
}

export class FoodValuesLore {
    onScriptEvent(event) {
        if (event.id !== "crockpot:refreshlore") return;
        for (const p of world.getAllPlayers()) {
            const container = p.getComponent(EntityComponentTypes.Inventory)?.container;
            if (container) {
                for (let slot = 0; slot < container.size; slot++) {
                    const updated = processItemLore(container.getItem(slot));
                    if (updated) container.setItem(slot, updated);
                }
            }
            const equip = p.getComponent(EntityComponentTypes.Equippable);
            if (equip) {
                const updatedOff = processItemLore(equip.getEquipment(EquipmentSlot.Offhand));
                if (updatedOff) equip.setEquipment(EquipmentSlot.Offhand, updatedOff);
            }
        }
        if (event.sourceEntity && event.sourceEntity.typeId === "minecraft:player") {
            event.sourceEntity.sendMessage("§aCrockpot Lore 已刷新");
        }
    }

    onEntitySpawn(event) {
        const entity = event.entity;
        if (!entity?.isValid || entity.typeId !== "minecraft:item") return;
        system.run(() => {
            if (!entity.isValid) return;
            const itemComp = entity.getComponent(EntityComponentTypes.Item);
            if (!itemComp) return;
            const updated = processItemLore(itemComp.itemStack);
            if (updated) {
                const loc = entity.location;
                const dim = entity.dimension;
                const vel = entity.getVelocity();
                entity.remove();
                const newEntity = dim.spawnItem(updated, loc);
                if (newEntity && vel) newEntity.applyImpulse({ x: vel.x, y: 0, z: vel.z });
            }
        });
    }

    onPlayerInteractWithBlock(event) {
        const block = event.block;
        if (!block) return;
        system.run(() => {
            updateContainerBlock(block);
            if (block.typeId === "minecraft:chest" || block.typeId === "minecraft:trapped_chest") {
                const neighbors = [block.north(), block.south(), block.east(), block.west()];
                for (const n of neighbors) {
                    if (n && n.typeId === block.typeId) updateContainerBlock(n);
                }
            }
        });
    }

    onPlayerInteractWithEntity(event) {
        const target = event.target;
        if (!target) return;
        system.run(() => {
            try {
                const invComp = target.getComponent(EntityComponentTypes.Inventory);
                const container = invComp?.container;
                if (container) {
                    for (let i = 0; i < container.size; i++) {
                        const item = container.getItem(i);
                        if (item) {
                            const updated = processItemLore(item);
                            if (updated) container.setItem(i, updated);
                        }
                    }
                }
            } catch (e) { }
        });
    }

    register() {
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
                if (container) {
                    for (let slot = 0; slot < container.size; slot++) {
                        const updated = processItemLore(container.getItem(slot));
                        if (updated) container.setItem(slot, updated);
                    }
                }
                const equip = player.getComponent(EntityComponentTypes.Equippable);
                if (equip) {
                    const updatedOff = processItemLore(equip.getEquipment(EquipmentSlot.Offhand));
                    if (updatedOff) equip.setEquipment(EquipmentSlot.Offhand, updatedOff);
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
], FoodValuesLore.prototype, "register", null);

__decorate([
    EventAPI.register(world.afterEvents.entitySpawn),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EntitySpawnAfterEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesLore.prototype, "onEntitySpawn", null);

__decorate([
    EventAPI.register(world.beforeEvents.playerInteractWithBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithBlockBeforeEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesLore.prototype, "onPlayerInteractWithBlock", null);

__decorate([
    EventAPI.register(world.beforeEvents.playerInteractWithEntity),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithEntityBeforeEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesLore.prototype, "onPlayerInteractWithEntity", null);

__decorate([
    EventAPI.register(system.afterEvents.scriptEventReceive),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ScriptEventCommandMessageAfterEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesLore.prototype, "onScriptEvent", null);