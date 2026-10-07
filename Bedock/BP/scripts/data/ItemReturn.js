export const ItemReturns = {
    "crockpot:milk_bottle": "minecraft:glass_bottle",
    "minecraft:honey_bottle": "minecraft:glass_bottle",
    "minecraft:milk_bucket": "minecraft:bucket",
    "minecraft:lava_bucket": { id: "minecraft:bucket", inPlace: true },
    "farmersdelight:milk_bottle": "minecraft:glass_bottle"
};

export function registerRemainder(itemId, returnId, inPlace = false) {
    ItemReturns[itemId] = inPlace ? { id: returnId, inPlace: true } : returnId;
}

function normalize(entry, inPlace = false) {
    if (!entry) return null;
    if (typeof entry === "string") return { id: entry, inPlace };
    return { id: entry.id, inPlace: Boolean(entry.inPlace) };
}

export function getReturnInfo(item) {
    if (!item) return null;
    const typeId = typeof item === "string" ? item : item.typeId;

    if (typeof item === "object") {
        const dynReturn =
            item.getDynamicProperty?.("crockpot:remainder") ??
            item.getDynamicProperty?.("farmersdelight:remainder");
        if (dynReturn) return { id: String(dynReturn), inPlace: false };

        const compReturn =
            item.getComponent?.("crockpot:remainder") ??
            item.getComponent?.("farmersdelight:remainder");
        if (compReturn) {
            const val = compReturn.returnItem || compReturn.item || compReturn.value;
            if (val) return { id: String(val), inPlace: Boolean(compReturn.inPlace) };
        }

        if (typeof item.getTags === "function") {
            for (const tag of item.getTags()) {
                if (tag.startsWith("crockpot:remainder:")) {
                    return { id: tag.replace("crockpot:remainder:", ""), inPlace: false };
                }
                if (tag.startsWith("farmersdelight:remainder:")) {
                    return { id: tag.replace("farmersdelight:remainder:", ""), inPlace: false };
                }
            }
        }
    }

    return normalize(ItemReturns[typeId]);
}

export function getReturnItem(item) {
    const info = getReturnInfo(item);
    return info ? info.id : null;
}