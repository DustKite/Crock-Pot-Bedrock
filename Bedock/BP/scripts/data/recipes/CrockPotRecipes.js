export const CrockPotRecipes = [
    {
        result: { id: "crockpot:mushy_cake", count: 1 },
        cookingtime: 400,
        potlevel: 1,
        priority: 55,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "minecraft:brown_mushroom" }, quantity: 1 },
            { type: "contain", ingredient: { item: "minecraft:red_mushroom" }, quantity: 1 },
            { type: "contain", ingredient: { item: "minecraft:crimson_fungus" }, quantity: 1 },
            { type: "contain", ingredient: { item: "minecraft:warped_fungus" }, quantity: 1 }
        ]
    },
    {
        result: { id: "crockpot:pepper_popper", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 20,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ tag: "c:vegetables/pepper" }, { tag: "c:crops/pepper" }], quantity: 1 },
            { type: "gt", category: "MEAT", value: 0.0 },
            { type: "max", category: "MEAT", value: 1.5 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:perogies", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 5,
        weight: 1,
        requirements: [
            { type: "gt", category: "EGG", value: 0.0 },
            { type: "gt", category: "MEAT", value: 0.0 },
            { type: "gt", category: "VEGGIE", value: 0.0 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:plain_omelette", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 1,
        weight: 1,
        requirements: [
            { type: "min", category: "EGG", value: 3.0 }
        ]
    },
    {
        result: { id: "crockpot:potato_souffle", count: 1 },
        cookingtime: 400,
        potlevel: 1,
        priority: 30,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:potato" }, { item: "minecraft:potato" }, { item: "minecraft:baked_potato" }], quantity: 2 },
            { type: "gt", category: "EGG", value: 0.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:potato_tornado", count: 1 },
        cookingtime: 300,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:potato" }, { item: "minecraft:potato" }, { item: "minecraft:baked_potato" }], quantity: 1 },
            { type: "contain", ingredient: [{ item: "minecraft:stick" }, { item: "minecraft:bamboo" }], quantity: 1 },
            { type: "max", category: "MONSTER", value: 1.0 },
            { type: "without", category: "MEAT" },
            { type: "max", category: "INEDIBLE", value: 2.0 }
        ]
    },
    {
        result: { id: "crockpot:pow_cake", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:stick" }, { item: "minecraft:bamboo" }], quantity: 1 },
            { type: "contain", ingredient: [{ item: "minecraft:honeycomb" }, { item: "minecraft:honey_bottle" }], quantity: 1 },
            { type: "contain", ingredient: [{ tag: "c:vegetables/corn" }, { tag: "c:crops/corn" }, { item: "crockpot:popcorn" }], quantity: 1 }
        ]
    },
    {
        result: { id: "crockpot:pumpkin_cookie", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { tag: "c:vegetables/pumpkin" }, quantity: 1 },
            { type: "min", category: "SWEETENER", value: 2.0 }
        ]
    },
    {
        result: { id: "crockpot:ratatouille", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 0,
        weight: 1,
        requirements: [
            { type: "without", category: "MEAT" },
            { type: "gt", category: "VEGGIE", value: 0.0 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:salmon_sushi", count: 2 },
        cookingtime: 200,
        potlevel: 0,
        priority: 20,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:salmon" }, { item: "minecraft:cooked_salmon" }], quantity: 1 },
            { type: "contain", ingredient: { item: "minecraft:dried_kelp" }, quantity: 1 }
        ]
    },
    {
        result: { id: "crockpot:salsa", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 20,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ tag: "c:vegetables/tomato" }, { tag: "c:crops/tomato" }], quantity: 1 },
            { type: "contain", ingredient: [{ tag: "c:vegetables/onion" }, { tag: "c:crops/onion" }], quantity: 1 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "INEDIBLE" },
            { type: "without", category: "EGG" }
        ]
    },
    {
        result: { id: "crockpot:asparagus_soup", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ tag: "c:vegetables/asparagus" }, { tag: "c:crops/asparagus" }], quantity: 1 },
            { type: "gt", category: "VEGGIE", value: 2.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:avaj", count: 1 },
        cookingtime: 200,
        potlevel: 1,
        priority: 30,
        weight: 1,
        requirements: [
            {
                type: "or",
                first: { type: "contain", ingredient: { item: "minecraft:cocoa_beans" }, quantity: 4 },
                second: {
                    type: "and",
                    first: { type: "contain", ingredient: { item: "minecraft:cocoa_beans" }, quantity: 3 },
                    second: {
                        type: "or",
                        first: { type: "gt", category: "DAIRY", value: 0.0 },
                        second: { type: "gt", category: "SWEETENER", value: 0.0 }
                    }
                }
            }
        ]
    },
    {
        result: { id: "crockpot:bacon_eggs", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "gt", category: "EGG", value: 1.0 },
            { type: "gt", category: "MEAT", value: 1.0 },
            { type: "without", category: "VEGGIE" }
        ]
    },
    {
        result: { id: "crockpot:bone_soup", count: 1 },
        cookingtime: 600,
        potlevel: 1,
        priority: 30,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:bone" }], quantity: 2 },
            { type: "contain", ingredient: [{ tag: "c:vegetables/onion" }, { tag: "c:crops/onion" }], quantity: 1 },
            { type: "lt", category: "INEDIBLE", value: 3.0 }
        ]
    },
    {
        result: { id: "crockpot:bone_stew", count: 1 },
        cookingtime: 300,
        potlevel: 0,
        priority: 0,
        weight: 1,
        requirements: [
            { type: "min", category: "MEAT", value: 3.0 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:breakfast_skillet", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 1,
        weight: 1,
        requirements: [
            { type: "min", category: "EGG", value: 1.0 },
            { type: "min", category: "VEGGIE", value: 1.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "DAIRY" }
        ]
    },
    {
        result: { id: "crockpot:bunny_stew", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 1,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:rabbit" }, { item: "minecraft:cooked_rabbit" }], quantity: 1 },
            { type: "min", category: "FROZEN", value: 2.0 },
            { type: "max", category: "MEAT", value: 0.5 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:california_roll", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 20,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "minecraft:dried_kelp" }, quantity: 2 },
            { type: "min", category: "FISH", value: 1.0 }
        ]
    },
    {
        result: { id: "crockpot:candy", count: 3 },
        cookingtime: 200,
        potlevel: 0,
        priority: 15,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "crockpot:syrup" }, quantity: 1 },
            { type: "min", category: "SWEETENER", value: 2.5 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "VEGGIE" }
        ]
    },
    {
        result: { id: "crockpot:ceviche", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 20,
        weight: 1,
        requirements: [
            { type: "min", category: "FISH", value: 2.0 },
            { type: "gt", category: "FROZEN", value: 0.0 },
            { type: "without", category: "INEDIBLE" },
            { type: "without", category: "EGG" }
        ]
    },
    {
        result: { id: "crockpot:fish_sticks", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "gt", category: "FISH", value: 0.0 },
            { type: "contain", ingredient: [{ item: "minecraft:stick" }, { item: "minecraft:bamboo" }], quantity: 1 },
            { type: "max", category: "INEDIBLE", value: 1.0 }
        ]
    },
    {
        result: { id: "crockpot:fish_tacos", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "gt", category: "FISH", value: 0.0 },
            { type: "contain", ingredient: [{ tag: "c:vegetables/corn" }, { tag: "c:crops/corn" }, { item: "crockpot:popcorn" }], quantity: 1 }
        ]
    },
    {
        result: { id: "crockpot:flower_salad", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "minecraft:chorus_flower" }, quantity: 1 },
            { type: "min", category: "VEGGIE", value: 2.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "INEDIBLE" },
            { type: "without", category: "EGG" },
            { type: "without", category: "SWEETENER" },
            { type: "without", category: "FRUIT" }
        ]
    },
    {
        result: { id: "crockpot:froggle_bunwich", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 1,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "crockpot:frog_legs" }, { item: "crockpot:cooked_frog_legs" }], quantity: 1 },
            { type: "min", category: "VEGGIE", value: 0.5 }
        ]
    },
    {
        result: { id: "crockpot:fruit_medley", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 0,
        weight: 1,
        requirements: [
            { type: "min", category: "FRUIT", value: 3.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "VEGGIE" }
        ]
    },
    {
        result: { id: "crockpot:gazpacho", count: 1 },
        cookingtime: 200,
        potlevel: 1,
        priority: 30,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ tag: "c:vegetables/asparagus" }, { tag: "c:crops/asparagus" }], quantity: 2 },
            { type: "min", category: "FROZEN", value: 2.0 }
        ]
    },
    {
        result: { id: "crockpot:glow_berry_mousse", count: 1 },
        cookingtime: 400,
        potlevel: 1,
        priority: 30,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "minecraft:glow_berries" }, quantity: 2 },
            { type: "min", category: "FRUIT", value: 2.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:honey_ham", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 2,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:honeycomb" }, { item: "minecraft:honey_bottle" }], quantity: 1 },
            { type: "gt", category: "MEAT", value: 1.5 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:honey_nuggets", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 2,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:honeycomb" }, { item: "minecraft:honey_bottle" }], quantity: 1 },
            { type: "gt", category: "MEAT", value: 0.0 },
            { type: "max", category: "MEAT", value: 1.5 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:hot_chili", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "min", category: "MEAT", value: 1.5 },
            { type: "min", category: "VEGGIE", value: 1.5 }
        ]
    },
    {
        result: { id: "crockpot:hot_cocoa", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 30,
        weight: 199,
        requirements: [
            {
                type: "or",
                first: { type: "contain", ingredient: { item: "minecraft:cocoa_beans" }, quantity: 4 },
                second: {
                    type: "and",
                    first: { type: "contain", ingredient: { item: "minecraft:cocoa_beans" }, quantity: 3 },
                    second: {
                        type: "or",
                        first: { type: "gt", category: "DAIRY", value: 0.0 },
                        second: { type: "gt", category: "SWEETENER", value: 0.0 }
                    }
                }
            }
        ]
    },
    {
        result: { id: "crockpot:ice_cream", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "gt", category: "FROZEN", value: 0.0 },
            { type: "gt", category: "DAIRY", value: 0.0 },
            { type: "gt", category: "SWEETENER", value: 0.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "VEGGIE" },
            { type: "without", category: "INEDIBLE" },
            { type: "without", category: "EGG" }
        ]
    },
    {
        result: { id: "crockpot:iced_tea", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 30,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:fern" }, { item: "minecraft:large_fern" }], quantity: 2 },
            { type: "gt", category: "SWEETENER", value: 0.0 },
            { type: "gt", category: "FROZEN", value: 0.0 }
        ]
    },
    {
        result: { id: "crockpot:jammy_preserves", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 0,
        weight: 1,
        requirements: [
            { type: "gt", category: "FRUIT", value: 0.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "VEGGIE" },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:kabobs", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 5,
        weight: 1,
        requirements: [
            { type: "gt", category: "MEAT", value: 0.0 },
            { type: "contain", ingredient: [{ item: "minecraft:stick" }, { item: "minecraft:bamboo" }], quantity: 1 },
            { type: "max", category: "MONSTER", value: 1.0 },
            { type: "max", category: "INEDIBLE", value: 1.0 }
        ]
    },
    {
        result: { id: "crockpot:mashed_potatoes", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 20,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:potato" }, { item: "minecraft:potato" }, { item: "minecraft:baked_potato" }], quantity: 2 },
            { type: "contain", ingredient: [{ tag: "c:vegetables/garlic" }, { tag: "c:crops/garlic" }, { item: "crockpot:garlic" }], quantity: 1 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:meat_balls", count: 1 },
        cookingtime: 300,
        potlevel: 0,
        priority: -1,
        weight: 1,
        requirements: [
            { type: "gt", category: "MEAT", value: 0.0 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:milkmade_hat", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 55,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "crockpot:hoglin_nose" }, { item: "crockpot:cooked_hoglin_nose" }], quantity: 1 },
            { type: "contain", ingredient: { item: "minecraft:bamboo" }, quantity: 1 },
            { type: "min", category: "DAIRY", value: 1.0 }
        ]
    },
    {
        result: { id: "crockpot:monster_lasagna", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "min", category: "MONSTER", value: 2.0 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:monster_tartare", count: 1 },
        cookingtime: 600,
        potlevel: 1,
        priority: 30,
        weight: 1,
        requirements: [
            { type: "min", category: "MONSTER", value: 2.0 },
            { type: "min", category: "EGG", value: 1.0 },
            { type: "min", category: "VEGGIE", value: 0.5 }
        ]
    },
    {
        result: { id: "crockpot:moqueca", count: 1 },
        cookingtime: 600,
        potlevel: 1,
        priority: 40,
        weight: 1,
        requirements: [
            { type: "gt", category: "FISH", value: 0.0 },
            { type: "contain", ingredient: [{ tag: "c:vegetables/onion" }, { tag: "c:crops/onion" }, { item: "crockpot:onion" }], quantity: 1 },
            { type: "contain", ingredient: [{ tag: "c:vegetables/tomato" }, { tag: "c:crops/tomato" }, { item: "crockpot:tomato" }], quantity: 1 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:scotch_egg", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "minecraft:turtle_egg" }, quantity: 1 },
            { type: "min", category: "VEGGIE", value: 1.0 }
        ]
    },
    {
        result: { id: "crockpot:seafood_gumbo", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "gt", category: "FISH", value: 2.0 }
        ]
    },
    {
        result: { id: "crockpot:stuffed_eggplant", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 1,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ tag: "c:vegetables/eggplant" }, { tag: "c:crops/eggplant" }, { item: "crockpot:cooked_eggplant" }], quantity: 1 },
            { type: "gt", category: "VEGGIE", value: 1.0 }
        ]
    },
    {
        result: { id: "crockpot:surf_n_turf", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 30,
        weight: 1,
        requirements: [
            { type: "min", category: "MEAT", value: 2.5 },
            { type: "min", category: "FISH", value: 1.5 },
            { type: "without", category: "FROZEN" }
        ]
    },
    {
        result: { id: "crockpot:syrup", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 40,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ tag: "c:vegetables/corn" }, { tag: "c:crops/corn" }, { item: "crockpot:popcorn" }, { item: "minecraft:honeycomb" }], quantity: 4 }
        ]
    },
    {
        result: { id: "crockpot:taffy", count: 1 },
        cookingtime: 400,
        potlevel: 0,
        priority: 10,
        weight: 2,
        requirements: [
            { type: "min", category: "SWEETENER", value: 3.0 },
            { type: "without", category: "MEAT" }
        ]
    },
    {
        result: { id: "crockpot:tea", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 25,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:fern" }, { item: "minecraft:large_fern" }], quantity: 2 },
            { type: "gt", category: "SWEETENER", value: 0.0 },
            { type: "without", category: "MEAT" },
            { type: "max", category: "VEGGIE", value: 0.5 },
            { type: "without", category: "INEDIBLE" }
        ]
    },
    {
        result: { id: "crockpot:tropical_bouillabaisse", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 35,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "minecraft:tropical_fish" }, quantity: 2 },
            { type: "gt", category: "FISH", value: 2.5 },
            { type: "gt", category: "VEGGIE", value: 0.0 }
        ]
    },
    {
        result: { id: "crockpot:turkey_dinner", count: 1 },
        cookingtime: 600,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:chicken" }, { item: "minecraft:cooked_chicken" }], quantity: 2 },
            { type: "gt", category: "MEAT", value: 1.0 },
            {
                type: "or",
                first: { type: "gt", category: "VEGGIE", value: 0.0 },
                second: { type: "gt", category: "FRUIT", value: 0.0 }
            }
        ]
    },
    {
        result: { id: "crockpot:veg_stinger", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 15,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ tag: "c:vegetables/asparagus" }, { tag: "c:crops/asparagus" }, { tag: "c:vegetables/tomato" }, { tag: "c:crops/tomato" }], quantity: 1 },
            { type: "gt", category: "VEGGIE", value: 2.0 },
            { type: "gt", category: "FROZEN", value: 0.0 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "INEDIBLE" },
            { type: "without", category: "EGG" }
        ]
    },
    {
        result: { id: "crockpot:volt_goat_jelly", count: 1 },
        cookingtime: 600,
        potlevel: 1,
        priority: 40,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: { item: "crockpot:volt_goat_horn" }, quantity: 1 },
            { type: "min", category: "SWEETENER", value: 2.0 },
            { type: "without", category: "MEAT" }
        ]
    },
    {
        result: { id: "crockpot:watermelon_icle", count: 1 },
        cookingtime: 200,
        potlevel: 0,
        priority: 10,
        weight: 1,
        requirements: [
            { type: "contain", ingredient: [{ item: "minecraft:melon_slice" }, { item: "minecraft:melon" }], quantity: 1 },
            { type: "gt", category: "FROZEN", value: 0.0 },
            { type: "contain", ingredient: [{ item: "minecraft:stick" }, { item: "minecraft:bamboo" }], quantity: 1 },
            { type: "without", category: "MEAT" },
            { type: "without", category: "VEGGIE" },
            { type: "without", category: "EGG" }
        ]
    }
];