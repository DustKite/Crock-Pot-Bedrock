import { system, world } from "@minecraft/server";
import ObjectUtil from "./ObjectUtil";
export class BlockWithEntity {
    //名为setblock实际上是放置对应方块实体的实体，若成功则返回放置的实体
    setBlock(dimension, location, entityId) {
        const entity = dimension.spawnEntity(entityId, location);
        entity.setDynamicProperty("crockpot:blockEntityDataLocation", location);
        entity.setDynamicProperty("crockpot:entityId", entity.id);
        return entity;
    }
    //获取方块实体数据
    entityBlockData(block, opt) {
        const dimension = block.dimension;
        const entities = dimension.getEntitiesAtBlockLocation(opt.location);
        let entityBlock = undefined;
        for (const entity of entities) {
            if (ObjectUtil.isEqual(entity.getDynamicProperty('crockpot:blockEntityDataLocation'), entity.location) &&
                entity.id == entity.getDynamicProperty("crockpot:entityId") &&
                entity.typeId == opt.type) {
                entityBlock = entity;
                break;
            }
            ;
        }
        ;
        if (!entityBlock)
            return undefined;
        const scoreboardObjective = world.scoreboard.getObjective(entityBlock.typeId + entityBlock.id) ?? null;
        const blockEntityDataLocation = entityBlock.getDynamicProperty('crockpot:blockEntityDataLocation');
        return { block: block, dimension: dimension, entity: entityBlock, scoreboardObjective: scoreboardObjective, blockEntityDataLocation: blockEntityDataLocation };
    }
}
export class BlockEntity {
    //获取方块实体数据
    blockEntityData(entity) {
        try {
            const dimension = entity?.dimension ?? undefined;
            const blockEntityDataLocation = entity.getDynamicProperty('crockpot:blockEntityDataLocation');
            const block = dimension.getBlock(blockEntityDataLocation);
            const scoreboardObjective = world.scoreboard.getObjective(entity.typeId + entity.id) ?? null;
            const blockEntityData = { entity: entity, dimension: dimension, blockEntityDataLocation: blockEntityDataLocation, block: block, scoreboardObjective: scoreboardObjective };
            return blockEntityData;
        }
        catch (error) {
            return undefined;
        }
    }
    ;
    //对使用容器组件存储物品的方块实体检测掉落，方块已不在时掉落物品并清除实体，返回实体是否已被清除
    entityContainerLoot(args, id) {
        if (!ObjectUtil.isEqual(args.entity.location, args.blockEntityDataLocation))
            args.entity.teleport(args.blockEntityDataLocation);
        if (args.block?.typeId == id)
            return false;
        const entity = args.entity;
        const dimension = args.dimension;
        const inventory = entity.getComponent("inventory");
        const container = inventory.container;
        for (let i = 0, length = container.size; i < length; i++) {
            if (i == 5 || i == 7 || i == 8)
                continue;
            const itemStack = container.getItem(i);
            if (itemStack) {
                dimension.spawnItem(itemStack, entity.location);
                //实体下一刻才移除，先清空，避免期间再次触发时重复掉落
                container.setItem(i, undefined);
            }
        }
        ;
        BlockEntity.clearEntity(args);
        return true;
    }
    ;
    //清除方块实体
    static clearEntity(args) {
        if (args.scoreboardObjective) {
            world.scoreboard.removeObjective(args.entity.typeId + args.entity.id);
        }
        system.runTimeout(() => {
            if (args.entity.isValid)
                args.entity.remove();
        });
    }
}
