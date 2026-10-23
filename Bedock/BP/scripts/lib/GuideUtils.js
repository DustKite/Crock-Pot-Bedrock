import { ItemTypes } from "@minecraft/server";

let _hasFD = null;
export function hasFarmersDelight() {
    if (_hasFD === null) {
        _hasFD = ItemTypes.get("farmersdelight:book_farmersdelight") !== undefined;
    }
    return _hasFD;
}

export const ICON_BACK = "textures/ui/recap_glyph_color_2x";
export const ICON_PREV = "textures/ui/book_shiftleft_default";
export const ICON_NEXT = "textures/ui/book_shiftright_default";

export const ICON = {
    devices: "textures/book/crockpot/crock_pot",
    recipes: "textures/items/crockpot/meat_balls",
    farming: "textures/items/crockpot/unknown_seeds",
    entities: "textures/items/crockpot/volt_goat_spawn_egg",
    effects: "textures/items/crockpot/volt_goat_horn",
    thanks: "textures/items/nether_star",
    crock_pot: "textures/book/crockpot/crock_pot",
    portable_crock_pot: "textures/book/crockpot/portable_crock_pot",
    birdcage: "textures/items/crockpot/birdcage",
    soup: "textures/items/crockpot/asparagus_soup",
    main: "textures/items/crockpot/meat_balls",
    dessert: "textures/items/crockpot/candy",
    beverage: "textures/items/crockpot/tea",
    special: "textures/items/crockpot/wet_goop",
    volt_goat: "textures/items/crockpot/volt_goat_spawn_egg",
    milk_bottle: "textures/items/crockpot/milk_bottle",
    charge: "textures/mob_effect/charge",
    well_fed: "textures/mob_effect/well_fed",
    wither_resistance: "textures/mob_effect/wither_resistance",
    ocean_affinity: "textures/mob_effect/ocean_affinity"
};

const ITEM_ICON_OVERRIDE = {
    "crockpot:crock_pot": "textures/book/crockpot/crock_pot",
    "crockpot:portable_crock_pot": "textures/book/crockpot/portable_crock_pot"
};

export const CATEGORY_COLOR = {
    MEAT: "§d",
    MONSTER: "§5",
    FISH: "§9",
    EGG: "§2",
    FRUIT: "§6",
    VEGGIE: "§a",
    DAIRY: "§b",
    SWEETENER: "§e",
    FROZEN: "§3",
    INEDIBLE: "§7"
};

export const CATEGORY_KEY = {
    MEAT: "item.crockpot:food_category_meat",
    MONSTER: "item.crockpot:food_category_monster",
    FISH: "item.crockpot:food_category_fish",
    EGG: "item.crockpot:food_category_egg",
    FRUIT: "item.crockpot:food_category_fruit",
    VEGGIE: "item.crockpot:food_category_veggie",
    DAIRY: "item.crockpot:food_category_dairy",
    SWEETENER: "item.crockpot:food_category_sweetener",
    FROZEN: "item.crockpot:food_category_frozen",
    INEDIBLE: "item.crockpot:food_category_inedible"
};

const VANILLA_KEY_MAP = {
    "minecraft:apple": "item.apple.name",
    "minecraft:bamboo": "tile.bamboo.name",
    "minecraft:beef": "item.beef.name",
    "minecraft:cooked_beef": "item.steak.name",
    "minecraft:beetroot": "item.beetroot.name",
    "minecraft:bone": "item.bone.name",
    "minecraft:carrot": "item.carrot.name",
    "minecraft:chicken": "item.chicken.name",
    "minecraft:cooked_chicken": "item.cooked_chicken.name",
    "minecraft:chorus_flower": "tile.chorus_flower.name",
    "minecraft:chorus_fruit": "item.chorus_fruit.name",
    "minecraft:chorus_fruit_popped": "item.chorus_fruit_popped.name",
    "minecraft:cocoa_beans": "item.dye.brown.name",
    "minecraft:cod": "item.fish.name",
    "minecraft:cooked_cod": "item.cooked_fish.name",
    "minecraft:crimson_fungus": "tile.crimson_fungus.name",
    "minecraft:red_mushroom": "tile.red_mushroom.name",
    "minecraft:brown_mushroom": "tile.brown_mushroom.name",
    "minecraft:egg": "item.egg.name",
    "minecraft:fern": "tile.tallgrass.fern.name",
    "minecraft:dandelion": "tile.yellow_flower.dandelion.name",
    "minecraft:allium": "tile.red_flower.allium.name",
    "minecraft:glow_berries": "item.glow_berries.name",
    "minecraft:honeycomb": "item.honeycomb.name",
    "minecraft:honey_bottle": "item.honey_bottle.name",
    "minecraft:ice": "tile.ice.name",
    "minecraft:blue_ice": "tile.blue_ice.name",
    "minecraft:packed_ice": "tile.packed_ice.name",
    "minecraft:dried_kelp": "item.dried_kelp.name",
    "minecraft:kelp": "item.kelp.name",
    "minecraft:melon": "tile.melon_block.name",
    "minecraft:melon_slice": "item.melon.name",
    "minecraft:milk_bucket": "item.milk.name",
    "minecraft:mutton": "item.muttonRaw.name",
    "minecraft:cooked_mutton": "item.muttonCooked.name",
    "minecraft:carved_pumpkin": "tile.carved_pumpkin.name",
    "minecraft:poisonous_potato": "item.poisonous_potato.name",
    "minecraft:porkchop": "item.porkchop.name",
    "minecraft:cooked_porkchop": "item.porkchop_cooked.name",
    "minecraft:potato": "item.potato.name",
    "minecraft:baked_potato": "item.baked_potato.name",
    "minecraft:pufferfish": "item.pufferfish.name",
    "minecraft:rabbit": "item.rabbit.name",
    "minecraft:cooked_rabbit": "item.cooked_rabbit.name",
    "minecraft:rabbit_foot": "item.rabbit_foot.name",
    "minecraft:rotten_flesh": "item.rotten_flesh.name",
    "minecraft:salmon": "item.salmon.name",
    "minecraft:cooked_salmon": "item.cooked_salmon.name",
    "minecraft:slime_ball": "item.slime_ball.name",
    "minecraft:sniffer_egg": "tile.sniffer_egg.name",
    "minecraft:powder_snow_bucket": "item.bucketPowderSnow.name",
    "minecraft:snow_block": "tile.snow.name",
    "minecraft:spider_eye": "item.spider_eye.name",
    "minecraft:stick": "item.stick.name",
    "minecraft:sugar_cane": "item.reeds.name",
    "minecraft:torchflower": "tile.torchflower.name",
    "minecraft:pitcher_plant": "tile.pitcher_plant.name",
    "minecraft:sweet_berries": "item.sweet_berries.name",
    "minecraft:tropical_fish": "item.clownfish.name",
    "minecraft:turtle_egg": "tile.turtle_egg.name",
    "minecraft:warped_fungus": "tile.warped_fungus.name",
    "minecraft:pumpkin": "tile.pumpkin.name",
    "minecraft:nautilus_shell": "item.nautilus_shell.name",
    "minecraft:golden_apple": "item.golden_apple.name",
    "minecraft:golden_carrot": "item.golden_carrot.name",
    "minecraft:magma_cream": "item.magma_cream.name",
    "minecraft:blaze_powder": "item.blaze_powder.name",
    "minecraft:ghast_tear": "item.ghast_tear.name",
    "farmersdelight:ham": "item.farmersdelight:ham",
    "farmersdelight:smoked_ham": "item.farmersdelight:smoked_ham"
};

export function iconOf(itemId) {
    if (ITEM_ICON_OVERRIDE[itemId]) return ITEM_ICON_OVERRIDE[itemId];
    if (itemId.startsWith("crockpot:")) {
        return `textures/items/crockpot/${itemId.substring("crockpot:".length)}`;
    }
    if (itemId.startsWith("minecraft:")) {
        return `textures/items/${itemId.substring("minecraft:".length)}`;
    }
    return undefined;
}

export function itemKey(itemId) {
    if (VANILLA_KEY_MAP[itemId]) return VANILLA_KEY_MAP[itemId];
    if (itemId.startsWith("minecraft:")) return `item.${itemId.substring("minecraft:".length)}.name`;
    return `item.${itemId}`;
}

export function pushCategory(out, category) {
    const color = CATEGORY_COLOR[category] ?? "§r";
    const key = CATEGORY_KEY[category] ?? category;
    out.push({ text: color }, { translate: key }, { text: "§r" });
}

export function pushIngredientRawtext(out, ing) {
    if (Array.isArray(ing)) {
        const filtered = ing.filter(item => {
            if (!hasFarmersDelight()) {
                if (item.tag && item.tag.startsWith("farmersdelight:")) return false;
                if (item.item && item.item.startsWith("farmersdelight:")) return false;
            }
            return true;
        });

        if (filtered.length === 0) return;

        filtered.forEach((item, idx) => {
            if (idx > 0) out.push({ translate: "guide.crockpot.recipe.req.join" });
            pushIngredientRawtext(out, item);
        });
        return;
    }
    if (ing && ing.item) {
        out.push({ text: "§e" }, { translate: itemKey(ing.item) }, { text: "§r" });
    } else if (ing && ing.tag) {
        out.push({ text: `§b#${ing.tag}§r` });
    } else {
        out.push({ text: "?" });
    }
}