var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { EntityComponentTypes, ItemCompleteUseAfterEvent, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { applyCustomEffect } from "../effect/CustomEffects";

function healPlayer(player, amount) {
    const health = player.getComponent(EntityComponentTypes.Health);
    if (health) {
        health.setCurrentValue(Math.min(health.currentValue + amount, health.effectiveMax));
    }
}

export class Food {
    static onConsume(event) {
        if (event.useDuration) return;
        const player = event.source;
        const itemStack = event.itemStack;
        if (!player || !itemStack) return;

        const itemId = itemStack.typeId;

        switch (itemId) {
            case "crockpot:asparagus_soup":
                player.removeEffect("weakness");
                player.removeEffect("mining_fatigue");
                player.removeEffect("blindness");
                player.removeEffect("bad_omen");
                break;

            case "crockpot:avaj":
                player.addEffect("speed", 1940 * 20, { amplifier: 2 });
                break;

            case "crockpot:bacon_eggs":
                healPlayer(player, 4.0);
                break;

            case "crockpot:bone_soup":
                player.addEffect("absorption", 120 * 20, { amplifier: 1 });
                break;

            case "crockpot:bone_stew":
                player.addEffect("instant_health", 1, { amplifier: 1 });
                break;

            case "crockpot:bunny_stew":
                player.addEffect("regeneration", 5 * 20, { amplifier: 0 });
                applyCustomEffect(player, "well_fed", 120 * 20);
                break;

            case "crockpot:california_roll":
                healPlayer(player, 4.0);
                player.addEffect("absorption", 60 * 20, { amplifier: 0 });
                break;

            case "crockpot:candy": {
                const rand = Math.random();
                if (rand < 0.25) {
                    player.removeEffect("slowness");
                } else if (rand < 0.45) {
                    player.removeEffect("hunger");
                    player.addEffect("saturation", 1, { amplifier: 1 });
                } else if (rand < 0.55) {
                    player.removeEffect("mining_fatigue");
                    player.addEffect("haste", 20 * 20, { amplifier: 0 });
                } else if (rand < 0.60) {
                    player.addEffect("weakness", 10 * 20, { amplifier: 0 });
                    player.applyDamage(2.0);
                } else if (rand < 0.605) {
                    player.applyDamage(10.0);
                }
                break;
            }

            case "crockpot:ceviche":
                player.addEffect("resistance", 20 * 20, { amplifier: 1 });
                player.addEffect("absorption", 20 * 20, { amplifier: 1 });
                break;

            case "crockpot:fish_sticks":
                player.addEffect("regeneration", 30 * 20, { amplifier: 0 });
                break;

            case "crockpot:fish_tacos":
                healPlayer(player, 2.0);
                break;

            case "crockpot:flower_salad":
                healPlayer(player, 4.0);
                player.addEffect("regeneration", 20 * 20, { amplifier: 0 });
                Food.teleportPlayer(player);
                break;

            case "crockpot:fruit_medley":
                player.addEffect("speed", 180 * 20, { amplifier: 0 });
                break;

            case "crockpot:gazpacho":
                player.addEffect("fire_resistance", 600 * 20, { amplifier: 0 });
                break;

            case "crockpot:honey_ham":
                healPlayer(player, 6.0);
                player.addEffect("regeneration", 20 * 20, { amplifier: 0 });
                player.addEffect("absorption", 60 * 20, { amplifier: 1 });
                break;

            case "crockpot:honey_nuggets":
                healPlayer(player, 4.0);
                player.addEffect("regeneration", 10 * 20, { amplifier: 0 });
                player.addEffect("absorption", 60 * 20, { amplifier: 1 });
                break;

            case "crockpot:hot_chili":
                player.addEffect("strength", 90 * 20, { amplifier: 0 });
                player.addEffect("haste", 90 * 20, { amplifier: 0 });
                break;

            case "crockpot:hot_cocoa":
                player.addEffect("speed", 480 * 20, { amplifier: 1 });
                player.removeEffect("slowness");
                player.removeEffect("mining_fatigue");
                break;

            case "crockpot:ice_cream":
            case "crockpot:milk_bottle":
                for (const eff of player.getEffects()) {
                    player.removeEffect(eff.typeId);
                }
                break;

            case "crockpot:iced_tea":
                player.addEffect("speed", 600 * 20, { amplifier: 1 });
                player.addEffect("jump_boost", 300 * 20, { amplifier: 1 });
                break;

            case "crockpot:mashed_potatoes":
                player.addEffect("resistance", 240 * 20, { amplifier: 0 });
                break;

            case "crockpot:monster_lasagna":
                player.addEffect("hunger", 15 * 20, { amplifier: 0 });
                player.addEffect("poison", 2 * 20, { amplifier: 0 });
                player.applyDamage(6.0);
                break;

            case "crockpot:monster_tartare":
                player.addEffect("strength", 120 * 20, { amplifier: 1 });
                break;

            case "crockpot:moqueca":
                healPlayer(player, 6.0);
                player.addEffect("health_boost", 90 * 20, { amplifier: 2 });
                break;

            case "crockpot:mushy_cake":
                applyCustomEffect(player, "wither_resistance", 60 * 20);
                break;

            case "crockpot:pepper":
            case "crockpot:pow_cake":
                player.applyDamage(1.0);
                break;

            case "crockpot:pepper_popper":
                player.addEffect("strength", 60 * 20, { amplifier: 1 });
                break;

            case "crockpot:perogies":
                healPlayer(player, 6.0);
                break;

            case "crockpot:potato_souffle":
                player.addEffect("resistance", 90 * 20, { amplifier: 1 });
                break;

            case "crockpot:potato_tornado":
            case "crockpot:pumpkin_cookie":
                player.removeEffect("hunger");
                break;

            case "crockpot:salmon_sushi":
                healPlayer(player, 1.0);
                break;

            case "crockpot:salsa":
                player.addEffect("haste", 360 * 20, { amplifier: 0 });
                break;

            case "crockpot:seafood_gumbo":
                player.addEffect("regeneration", 120 * 20, { amplifier: 0 });
                break;

            case "crockpot:stuffed_eggplant":
                healPlayer(player, 2.0);
                break;

            case "crockpot:surf_n_turf":
                healPlayer(player, 8.0);
                player.addEffect("regeneration", 30 * 20, { amplifier: 1 });
                break;

            case "crockpot:taffy":
                player.applyDamage(1.0);
                player.removeEffect("poison");
                break;

            case "crockpot:tea":
                player.addEffect("speed", 600 * 20, { amplifier: 1 });
                player.addEffect("haste", 300 * 20, { amplifier: 1 });
                break;

            case "crockpot:tropical_bouillabaisse":
                applyCustomEffect(player, "ocean_affinity", 150 * 20);
                break;

            case "crockpot:turkey_dinner":
                player.addEffect("health_boost", 180 * 20, { amplifier: 0 });
                break;

            case "crockpot:veg_stinger":
                player.addEffect("night_vision", 600 * 20, { amplifier: 0 });
                break;

            case "crockpot:volt_goat_jelly":
                applyCustomEffect(player, "charge", 360 * 20);
                break;

            case "crockpot:watermelon_icle":
                player.addEffect("speed", 180 * 20, { amplifier: 0 });
                player.addEffect("jump_boost", 180 * 20, { amplifier: 0 });
                player.removeEffect("slowness");
                break;

            case "crockpot:wet_goop":
                player.addEffect("nausea", 10 * 20, { amplifier: 0 });
                break;
        }
    }

    static teleportPlayer(player) {
        const dimension = player.dimension;
        const startLocation = { x: player.location.x, y: player.location.y, z: player.location.z };

        const isPassable = (block) => {
            if (!block || block.isAir) return true;
            const typeId = block.typeId;
            if (block.isLiquid || /water|lava|sea|kelp|coral/.test(typeId)) return false;
            return /sapling|mushroom|plant|vine|fern|bush|torch|lantern|carpet|snow|button|lever|rail|redstone|flower|rose|tulip|orchid|grass/.test(typeId) && !/_block|_path|pot|chorus/.test(typeId);
        };

        const spawnBodyFX = (loc) => {
            dimension.playSound("mob.endermen.portal", loc);
            for (let j = 0; j < 20; j++) {
                dimension.spawnParticle("minecraft:basic_portal_particle", {
                    x: loc.x + (Math.random() - 0.5),
                    y: loc.y + (Math.random() * 2),
                    z: loc.z + (Math.random() - 0.5)
                });
            }
        };

        const spawnTrail = (start, end) => {
            const dx = end.x - start.x, dy = end.y - start.y, dz = end.z - start.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const steps = Math.floor(distance * 3);
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const lx = start.x + dx * t;
                const ly = start.y + dy * t;
                const lz = start.z + dz * t;
                for (let k = 0; k < 2; k++) {
                    dimension.spawnParticle("minecraft:basic_portal_particle", {
                        x: lx + (Math.random() - 0.5) * 0.3,
                        y: ly + (Math.random() * 2),
                        z: lz + (Math.random() - 0.5) * 0.3
                    });
                }
            }
        };

        for (let i = 0; i < 1000; i++) {
            const targetX = Math.floor(startLocation.x + Math.random() * 17 - 8);
            const targetY = Math.floor(startLocation.y + Math.random() * 17 - 8);
            const targetZ = Math.floor(startLocation.z + Math.random() * 17 - 8);
            if (targetY < -64 || targetY > 319) continue;

            const blockBelow = dimension.getBlock({ x: targetX, y: targetY - 1, z: targetZ });
            const blockFeet = dimension.getBlock({ x: targetX, y: targetY, z: targetZ });
            const blockHead = dimension.getBlock({ x: targetX, y: targetY + 1, z: targetZ });
            if (!blockBelow || !blockFeet || !blockHead) continue;

            const isWater = (b) => b.isLiquid || /water|sea|kelp|coral/.test(b.typeId);
            const isSolid = (b) => !b.isAir && !isPassable(b) && !isWater(b) && !/lava|fire|magma/.test(b.typeId);

            if (isSolid(blockBelow) && isPassable(blockFeet) && isPassable(blockHead) && !isWater(blockFeet)) {
                const offset = /(wall|fence|gate)/.test(blockBelow.typeId) ? 0.5 : 0.06;
                const targetLocation = { x: targetX + 0.5, y: targetY + offset, z: targetZ + 0.5 };

                spawnBodyFX(startLocation);
                spawnTrail(startLocation, targetLocation);
                player.teleport(targetLocation, { checkForBlocks: false, keepVelocity: false });
                spawnBodyFX(targetLocation);
                return;
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.itemCompleteUse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ItemCompleteUseAfterEvent]),
    __metadata("design:returntype", void 0)
], Food, "onConsume", null);