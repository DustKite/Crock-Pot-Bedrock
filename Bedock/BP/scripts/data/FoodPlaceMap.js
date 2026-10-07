export const FOOD_PLACE_MAP = {

    "crockpot:candy": { block: "crockpot:candy", max: 6 },
    "crockpot:taffy": { block: "crockpot:taffy", max: 6 },

    "crockpot:mashed_potatoes": { block: "crockpot:mashed_potatoes", max: 4 },
    "crockpot:potato_souffle": { block: "crockpot:potato_souffle", max: 4 },

    "crockpot:avaj": { block: "crockpot:avaj", max: 1 },
    "crockpot:netherosia": { block: "crockpot:netherosia", max: 1 },
    "crockpot:pow_cake": { block: "crockpot:pow_cake", max: 1 },
    "crockpot:steamed_sticks": { block: "crockpot:steamed_sticks", max: 1 },

    "crockpot:asparagus_soup": { block: "crockpot:asparagus_soup", max: 3 },
    "crockpot:bacon_eggs": { block: "crockpot:bacon_eggs", max: 3 },
    "crockpot:bone_soup": { block: "crockpot:bone_soup", max: 3 },
    "crockpot:bone_stew": { block: "crockpot:bone_stew", max: 3 },
    "crockpot:breakfast_skillet": { block: "crockpot:breakfast_skillet", max: 3 },
    "crockpot:bunny_stew": { block: "crockpot:bunny_stew", max: 3 },
    "crockpot:california_roll": { block: "crockpot:california_roll", max: 3 },
    "crockpot:ceviche": { block: "crockpot:ceviche", max: 3 },
    "crockpot:fish_sticks": { block: "crockpot:fish_sticks", max: 3 },
    "crockpot:fish_tacos": { block: "crockpot:fish_tacos", max: 3 },
    "crockpot:flower_salad": { block: "crockpot:flower_salad", max: 3 },
    "crockpot:froggle_bunwich": { block: "crockpot:froggle_bunwich", max: 3 },
    "crockpot:fruit_medley": { block: "crockpot:fruit_medley", max: 3 },
    "crockpot:gazpacho": { block: "crockpot:gazpacho", max: 3 },
    "crockpot:glow_berry_mousse": { block: "crockpot:glow_berry_mousse", max: 3 },
    "crockpot:gummy_cake": { block: "crockpot:gummy_cake", max: 3 },
    "crockpot:honey_ham": { block: "crockpot:honey_ham", max: 3 },
    "crockpot:honey_nuggets": { block: "crockpot:honey_nuggets", max: 3 },
    "crockpot:hot_chili": { block: "crockpot:hot_chili", max: 3 },
    "crockpot:hot_cocoa": { block: "crockpot:hot_cocoa", max: 3 },
    "crockpot:iced_tea": { block: "crockpot:iced_tea", max: 3 },
    "crockpot:ice_cream": { block: "crockpot:ice_cream", max: 3 },
    "crockpot:jammy_preserves": { block: "crockpot:jammy_preserves", max: 3 },
    "crockpot:kabobs": { block: "crockpot:kabobs", max: 3 },
    "crockpot:meat_balls": { block: "crockpot:meat_balls", max: 3 },
    "crockpot:monster_lasagna": { block: "crockpot:monster_lasagna", max: 3 },
    "crockpot:monster_tartare": { block: "crockpot:monster_tartare", max: 3 },
    "crockpot:moqueca": { block: "crockpot:moqueca", max: 3 },
    "crockpot:mushy_cake": { block: "crockpot:mushy_cake", max: 3 },
    "crockpot:pepper_popper": { block: "crockpot:pepper_popper", max: 3 },
    "crockpot:perogies": { block: "crockpot:perogies", max: 3 },
    "crockpot:plain_omelette": { block: "crockpot:plain_omelette", max: 3 },
    "crockpot:potato_tornado": { block: "crockpot:potato_tornado", max: 3 },
    "crockpot:pumpkin_cookie": { block: "crockpot:pumpkin_cookie", max: 3 },
    "crockpot:ratatouille": { block: "crockpot:ratatouille", max: 3 },
    "crockpot:salmon_sushi": { block: "crockpot:salmon_sushi", max: 3 },
    "crockpot:salsa": { block: "crockpot:salsa", max: 3 },
    "crockpot:scotch_egg": { block: "crockpot:scotch_egg", max: 3 },
    "crockpot:seafood_gumbo": { block: "crockpot:seafood_gumbo", max: 3 },
    "crockpot:snake_bone_soup": { block: "crockpot:snake_bone_soup", max: 3 },
    "crockpot:steamed_ham_sandwich": { block: "crockpot:steamed_ham_sandwich", max: 3 },
    "crockpot:stuffed_eggplant": { block: "crockpot:stuffed_eggplant", max: 3 },
    "crockpot:surf_n_turf": { block: "crockpot:surf_n_turf", max: 3 },
    "crockpot:tea": { block: "crockpot:tea", max: 3 },
    "crockpot:tropical_bouillabaisse": { block: "crockpot:tropical_bouillabaisse", max: 3 },
    "crockpot:turkey_dinner": { block: "crockpot:turkey_dinner", max: 3 },
    "crockpot:veg_stinger": { block: "crockpot:veg_stinger", max: 3 },
    "crockpot:volt_goat_jelly": { block: "crockpot:volt_goat_jelly", max: 3 },
    "crockpot:watermelon_icle": { block: "crockpot:watermelon_icle", max: 3 },
    "crockpot:wet_goop": { block: "crockpot:wet_goop", max: 3 }
};

export const BLOCK_TO_FOOD_MAP = new Map();

for (const [itemId, config] of Object.entries(FOOD_PLACE_MAP)) {
    BLOCK_TO_FOOD_MAP.set(config.block, {
        item: itemId,
        max: config.max ?? 1
    });
}