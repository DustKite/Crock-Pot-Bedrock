export const FoodValues = {

    "minecraft:beef": { MEAT: 1 },
    "minecraft:cooked_beef": { MEAT: 1 },
    "minecraft:porkchop": { MEAT: 1 },
    "minecraft:cooked_porkchop": { MEAT: 1 },
    "minecraft:mutton": { MEAT: 0.5 },
    "minecraft:cooked_mutton": { MEAT: 0.5 },
    "minecraft:chicken": { MEAT: 0.5 },
    "minecraft:cooked_chicken": { MEAT: 0.5 },
    "minecraft:rabbit": { MEAT: 0.5 },
    "minecraft:cooked_rabbit": { MEAT: 0.5 },
    "minecraft:rabbit_foot": { MEAT: 0.5 },
    "crockpot:frog_legs": { MEAT: 0.5 },
    "crockpot:cooked_frog_legs": { MEAT: 0.5 },
    "crockpot:hoglin_nose": { MEAT: 0.5 },
    "crockpot:cooked_hoglin_nose": { MEAT: 0.5 },

    "minecraft:rotten_flesh": { MEAT: 0.5, MONSTER: 1 },
    "minecraft:spider_eye": { MEAT: 0.5, MONSTER: 1 },
    "minecraft:crimson_fungus": { VEGGIE: 0.5, MONSTER: 1 },
    "minecraft:warped_fungus": { VEGGIE: 0.5, MONSTER: 1 },

    "minecraft:cod": { MEAT: 0.5, FISH: 0.5 },
    "minecraft:cooked_cod": { MEAT: 0.5, FISH: 0.5 },
    "minecraft:salmon": { MEAT: 0.5, FISH: 1 },
    "minecraft:cooked_salmon": { MEAT: 0.5, FISH: 1 },
    "minecraft:tropical_fish": { FISH: 1 },
    "minecraft:pufferfish": { FISH: 0.5, MONSTER: 1 },

    "minecraft:egg": { EGG: 1 },
    "crockpot:cooked_egg": { EGG: 1 },
    "crockpot:parrot_egg_red_blue": { EGG: 1 },
    "crockpot:parrot_egg_blue": { EGG: 1 },
    "crockpot:parrot_egg_green": { EGG: 1 },
    "crockpot:parrot_egg_yellow_blue": { EGG: 1 },
    "crockpot:parrot_egg_grey": { EGG: 1 },
    "minecraft:turtle_egg": { EGG: 2 },
    "minecraft:sniffer_egg": { EGG: 4 },

    "minecraft:carrot": { VEGGIE: 1 },
    "minecraft:potato": { VEGGIE: 1 },
    "minecraft:baked_potato": { VEGGIE: 1 },
    "minecraft:poisonous_potato": { VEGGIE: 0.5 },
    "minecraft:beetroot": { VEGGIE: 1 },
    "minecraft:pumpkin": { VEGGIE: 1 },
    "minecraft:chorus_flower": { VEGGIE: 0.5 },
    "minecraft:fern": { VEGGIE: 0.25 },
    "minecraft:allium": { VEGGIE: 0.25 },
    "minecraft:dandelion": { VEGGIE: 0.25 },
    "minecraft:kelp": { VEGGIE: 0.5, INEDIBLE: 0.25 },
    "minecraft:dried_kelp": { VEGGIE: 0.5, INEDIBLE: 0.25 },
    "crockpot:asparagus": { VEGGIE: 1 },
    "crockpot:corn": { VEGGIE: 1 },
    "crockpot:popcorn": { VEGGIE: 1 },
    "crockpot:eggplant": { VEGGIE: 1 },
    "crockpot:cooked_eggplant": { VEGGIE: 1 },
    "crockpot:garlic": { VEGGIE: 1 },
    "crockpot:onion": { VEGGIE: 1 },
    "crockpot:pepper": { VEGGIE: 1 },
    "crockpot:tomato": { VEGGIE: 1 },

    "minecraft:apple": { FRUIT: 1 },
    "minecraft:melon": { FRUIT: 1 },
    "minecraft:melon_slice": { FRUIT: 0.5 },
    "minecraft:sweet_berries": { FRUIT: 0.5 },
    "minecraft:glow_berries": { FRUIT: 0.5 },
    "minecraft:chorus_fruit": { FRUIT: 0.5 },
    "minecraft:cocoa_beans": { FRUIT: 0.5 },

    "minecraft:honey_bottle": { SWEETENER: 1 },
    "minecraft:honeycomb": { SWEETENER: 0.5 },
    "crockpot:syrup": { SWEETENER: 1 },

    "minecraft:milk_bucket": { DAIRY: 1 },
    "crockpot:milk_bottle": { DAIRY: 1 },

    "minecraft:ice": { FROZEN: 1 },
    "minecraft:blue_ice": { FROZEN: 1 },
    "minecraft:packed_ice": { FROZEN: 1 },
    "minecraft:snow_block": { FROZEN: 0.5 },

    "minecraft:stick": { INEDIBLE: 1 },
    "minecraft:bone": { INEDIBLE: 1 },
    "minecraft:bamboo": { INEDIBLE: 1 },
    "crockpot:collected_dust": { INEDIBLE: 1 },
    "crockpot:volt_goat_horn": { INEDIBLE: 1 }
};

export const TagFoodValues = {
    "minecraft:egg": { EGG: 1 },
    "c:berries": { FRUIT: 0.5 },
    "c:crab_meats": { FISH: 0.5, MEAT: 0.5 },
    "c:butter": { DAIRY: 1 },
    "c:milk": { DAIRY: 1 },
    "c:bottles/milk": { DAIRY: 1 },
    "c:cooked_eggs": { EGG: 1 },
    "c:fried_eggs": { EGG: 1 },
    "c:foods/eggs": { EGG: 1 },
    "c:foods/cooked_eggs": { EGG: 1 },
    "c:foods/fried_eggs": { EGG: 1 },
    "c:fruits": { FRUIT: 1 },
    "c:bones": { INEDIBLE: 1 },
    "c:mushrooms": { VEGGIE: 0.5 },
    "c:vegetables": { VEGGIE: 1 },
    "c:cooked_vegetables": { VEGGIE: 1 },
    "c:corn": { VEGGIE: 1 },
    "c:pumpkins": { VEGGIE: 1 },
    "c:grains/corn": { VEGGIE: 1 },
    "c:rods/wooden": { INEDIBLE: 1 },
    "c:foods/raw_meats": { MEAT: 0.5 },
    "c:foods/cooked_meats": { MEAT: 0.5 },
    "minecraft:fishes": { FISH: 1, MEAT: 0.5 }
};

export function getItemFoodValues(item) {
    if (!item) return null;
    const typeId = typeof item === "string" ? item : item.typeId;
    if (FoodValues[typeId]) return FoodValues[typeId];
    if (typeof item === "object" && typeof item.hasTag === "function") {
        for (const [tag, values] of Object.entries(TagFoodValues)) {
            try {
                if (item.hasTag(tag)) return values;
            } catch (e) { }
        }
    }
    return null;
}