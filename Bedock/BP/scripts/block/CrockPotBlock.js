var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { PlayerInteractWithBlockAfterEvent, PlayerInteractWithEntityAfterEvent, PlayerPlaceBlockAfterEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { BlockWithEntity } from "../lib/BlockWithEntity";
import ObjectUtil from "../lib/ObjectUtil";

function potEntitiesAt(block) {
    const { x, y, z } = block.location;
    const location = { x: x + 0.5, y: y, z: z + 0.5 };
    return block.dimension.getEntities({ location: location, maxDistance: 1 })
        .filter(entity => (entity.typeId === "crockpot:crock_pot" || entity.typeId === "crockpot:portable_crock_pot") &&
            ObjectUtil.isEqual(entity.getDynamicProperty("crockpot:blockEntityDataLocation"), location));
}

function handleOpen(entity, block, player) {
    const rot = player.getRotation();
    const loc = player.location;
    entity.setDynamicProperty("crockpot:is_open", true);
    entity.setDynamicProperty("crockpot:opener_id", player.id);
    entity.setDynamicProperty("crockpot:open_tick", system.currentTick);
    entity.setDynamicProperty("crockpot:opener_rot_x", rot.x);
    entity.setDynamicProperty("crockpot:opener_rot_y", rot.y);
    entity.setDynamicProperty("crockpot:opener_loc_x", loc.x);
    entity.setDynamicProperty("crockpot:opener_loc_z", loc.z);
    block.setPermutation(block.permutation.withState("crockpot:open", true));
    block.dimension.playSound("block.crockpot.crock_pot.open", { x: block.x + 0.5, y: block.y + 0.5, z: block.z + 0.5 });
}

export class CrockPotBlock extends BlockWithEntity {
    placeBlock(args) {
        const block = args.block;
        if (block.typeId !== "crockpot:crock_pot" && block.typeId !== "crockpot:portable_crock_pot") return;
        const { x, y, z } = block.location;
        const entity = super.setBlock(block.dimension, { x: x + 0.5, y, z: z + 0.5 }, block.typeId);
        entity.nameTag = block.typeId;
        entity.setDynamicProperty("crockpot:pot_level", block.typeId === "crockpot:portable_crock_pot" ? 1 : 0);
    }

    interactBlock(args) {
        const { player, block } = args;
        if (block.typeId !== "crockpot:crock_pot" && block.typeId !== "crockpot:portable_crock_pot") return;
        if (player.isSneaking) return;

        for (const entity of potEntitiesAt(block)) {
            handleOpen(entity, block, player);
        }
    }

    interactEntity(args) {
        const { player, target } = args;
        if (!target || !target.isValid) return;
        if (target.typeId !== "crockpot:crock_pot" && target.typeId !== "crockpot:portable_crock_pot") return;
        if (player.isSneaking) return;

        const blockLoc = target.getDynamicProperty("crockpot:blockEntityDataLocation");
        if (blockLoc) {
            const block = target.dimension.getBlock(blockLoc);
            if (block && (block.typeId === "crockpot:crock_pot" || block.typeId === "crockpot:portable_crock_pot")) {
                handleOpen(target, block, player);
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.playerPlaceBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerPlaceBlockAfterEvent]),
    __metadata("design:returntype", void 0)
], CrockPotBlock.prototype, "placeBlock", null);

__decorate([
    EventAPI.register(world.afterEvents.playerInteractWithBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithBlockAfterEvent]),
    __metadata("design:returntype", void 0)
], CrockPotBlock.prototype, "interactBlock", null);

__decorate([
    EventAPI.register(world.afterEvents.playerInteractWithEntity),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithEntityAfterEvent]),
    __metadata("design:returntype", void 0)
], CrockPotBlock.prototype, "interactEntity", null);