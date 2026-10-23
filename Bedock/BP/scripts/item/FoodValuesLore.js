var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityComponentTypes, EntitySpawnAfterEvent, EquipmentSlot, PlayerInteractWithBlockBeforeEvent, PlayerInteractWithEntityBeforeEvent, PlayerInventoryItemChangeAfterEvent, PlayerSpawnAfterEvent, StartupEvent, system, world } from "@minecraft/server";
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

const TYPE_CACHE = new Map();
const PENDING_SLOTS = new Set();

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

function flattenRaw(msg) {
    if (!msg) return "";
    if (typeof msg === "string") return msg;
    if (msg.rawtext) return msg.rawtext.map(flattenRaw).join("");
    if (msg.text !== undefined) return msg.text;
    if (msg.translate !== undefined) return `#${msg.translate}`;
    if (msg.with) return msg.with.map(flattenRaw).join("");
    return "";
}

function flattenLoreEntry(entry) {
    if (typeof entry === "string") {
        if (!entry.startsWith("{")) return entry;
        try {
            return flattenRaw(JSON.parse(entry));
        } catch {
            return entry;
        }
    }
    return typeof entry === "object" && entry ? flattenRaw(entry) : "";
}

function isCrockpotLore(entry) {
    if (typeof entry === "string") {
        return entry.includes("item.crockpot:food_category") || entry.includes("tooltip.crockpot.");
    }
    const s = flattenLoreEntry(entry);
    return s.includes("item.crockpot:food_category") || s.includes("tooltip.crockpot.");
}

function getOrComputeTypeInfo(item) {
    const typeId = item.typeId;
    let info = TYPE_CACHE.get(typeId);
    if (info !== undefined) return info;

    const customTooltip = CUSTOM_TOOLTIPS[typeId];
    const values = getItemFoodValues(item);
    if (!customTooltip && !values) {
        TYPE_CACHE.set(typeId, null);
        return null;
    }

    const expected = [];
    if (customTooltip) {
        expected.push({ rawtext: [{ text: customTooltip.color }, { translate: customTooltip.key }, { text: "§r" }] });
    }
    if (values) {
        expected.push(...formatFoodLore(values));
    }

    const expectedNorm = expected.map(flattenLoreEntry);
    info = { expected, expectedNorm };
    TYPE_CACHE.set(typeId, info);
    return info;
}

function processItemLore(item) {
    if (!item) return null;

    const info = getOrComputeTypeInfo(item);
    if (!info) return null;

    const current = item.getLore() ?? [];
    if (current.length === 0) {
        item.setLore(info.expected);
        return item;
    }

    const currentManaged = current.filter(isCrockpotLore);
    if (currentManaged.length === info.expectedNorm.length) {
        let match = true;
        for (let i = 0; i < currentManaged.length; i++) {
            if (flattenLoreEntry(currentManaged[i]) !== info.expectedNorm[i]) {
                match = false;
                break;
            }
        }
        if (match) return null;
    }

    const preserved = current.filter(l => !isCrockpotLore(l));
    item.setLore([...preserved, ...info.expected]);
    return item;
}

function updateContainerBlock(targetBlock) {
    if (!targetBlock) return;
    try {
        const container = targetBlock.getComponent("minecraft:inventory")?.container;
        if (!container) return;
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item) {
                const updated = processItemLore(item);
                if (updated) container.setItem(i, updated);
            }
        }
    } catch (e) { }
}

export class FoodValuesLore {
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
                    const off = equip.getEquipment(EquipmentSlot.Offhand);
                    if (off) {
                        const updatedOff = processItemLore(off);
                        if (updatedOff) equip.setEquipment(EquipmentSlot.Offhand, updatedOff);
                    }
                }
            }
        }, 200);
    }

    onInventoryItemChange(event) {
        const { player, slot, itemStack } = event;
        if (!player || !itemStack) return;
        if (typeof slot !== "number") return;

        const key = `${player.id}:${slot}`;
        if (PENDING_SLOTS.has(key)) return;

        const updated = processItemLore(itemStack);
        if (updated) {
            const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
            if (container) {
                PENDING_SLOTS.add(key);
                container.setItem(slot, updated);
                system.runTimeout(() => PENDING_SLOTS.delete(key), 1);
            }
        }
    }

    onPlayerSpawn(event) {
        const player = event.player;
        if (!player || !event.initialSpawn) return;
        system.run(() => {
            const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
            if (container) {
                for (let slot = 0; slot < container.size; slot++) {
                    const item = container.getItem(slot);
                    if (item) {
                        const updated = processItemLore(item);
                        if (updated) container.setItem(slot, updated);
                    }
                }
            }
            const equip = player.getComponent(EntityComponentTypes.Equippable);
            if (equip) {
                const offhand = equip.getEquipment(EquipmentSlot.Offhand);
                if (offhand) {
                    const updatedOff = processItemLore(offhand);
                    if (updatedOff) equip.setEquipment(EquipmentSlot.Offhand, updatedOff);
                }
            }
        });
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
}

__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartupEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesLore.prototype, "register", null);

__decorate([
    EventAPI.register(world.afterEvents.playerInventoryItemChange),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInventoryItemChangeAfterEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesLore.prototype, "onInventoryItemChange", null);

__decorate([
    EventAPI.register(world.afterEvents.playerSpawn),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerSpawnAfterEvent]),
    __metadata("design:returntype", void 0)
], FoodValuesLore.prototype, "onPlayerSpawn", null);

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