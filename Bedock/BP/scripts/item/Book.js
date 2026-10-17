var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { ActionFormData } from "@minecraft/server-ui";
import { ItemUseAfterEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { CrockPotRecipes } from "../data/CrockPotRecipes";
import { RECIPE_CATEGORY } from "../lib/GuideRecipeCategories";

const BOOK_ITEM_ID = "crockpot:book";
const PAGE_SIZE = 8;

const ICON_BACK = "textures/ui/recap_glyph_color_2x";
const ICON_PREV = "textures/ui/book_shiftleft_default";
const ICON_NEXT = "textures/ui/book_shiftright_default";

const ICON = {
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
    ocean_affinity: "textures/mob_effect/ocean_affinity",
    gnaws_gift: "textures/mob_effect/gnaws_gift",
};

const ITEM_ICON_OVERRIDE = {
    "crockpot:crock_pot": "textures/book/crockpot/crock_pot",
    "crockpot:portable_crock_pot": "textures/book/crockpot/portable_crock_pot"
};

const CATEGORY_COLOR = {
    MEAT: "§d",
    MONSTER: "§5",
    FISH: "§9",
    EGG: "§2",
    FRUIT: "§6",
    VEGGIE: "§a",
    DAIRY: "§b",
    SWEETENER: "§e",
    FROZEN: "§3",
    INEDIBLE: "§7",
};

const CATEGORY_KEY = {
    MEAT: "item.crockpot:food_category_meat",
    MONSTER: "item.crockpot:food_category_monster",
    FISH: "item.crockpot:food_category_fish",
    EGG: "item.crockpot:food_category_egg",
    FRUIT: "item.crockpot:food_category_fruit",
    VEGGIE: "item.crockpot:food_category_veggie",
    DAIRY: "item.crockpot:food_category_dairy",
    SWEETENER: "item.crockpot:food_category_sweetener",
    FROZEN: "item.crockpot:food_category_frozen",
    INEDIBLE: "item.crockpot:food_category_inedible",
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

function iconOf(itemId) {
    if (ITEM_ICON_OVERRIDE[itemId]) return ITEM_ICON_OVERRIDE[itemId];
    if (itemId.startsWith("crockpot:")) {
        return `textures/items/crockpot/${itemId.substring("crockpot:".length)}`;
    }
    if (itemId.startsWith("minecraft:")) {
        return `textures/items/${itemId.substring("minecraft:".length)}`;
    }
    return ICON.recipes;
}

function itemKey(itemId) {
    if (VANILLA_KEY_MAP[itemId]) return VANILLA_KEY_MAP[itemId];
    if (itemId.startsWith("minecraft:")) return `item.${itemId.substring("minecraft:".length)}.name`;
    return `item.${itemId}`;
}

function pushCategory(out, category) {
    const color = CATEGORY_COLOR[category] ?? "§r";
    const key = CATEGORY_KEY[category] ?? category;
    out.push({ text: color });
    out.push({ translate: key });
    out.push({ text: "§r" });
}

function pushIngredientRawtext(out, ing) {
    if (Array.isArray(ing)) {
        ing.forEach((item, idx) => {
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

function buildRequirementLines(reqs, depth) {
    const out = [];
    const pad = "  ".repeat(depth) + "§7• §r";
    for (const req of reqs) {
        switch (req.type) {
            case "contain": {
                out.push({ text: pad });
                out.push({ translate: "guide.crockpot.recipe.req.contain_prefix" });
                pushIngredientRawtext(out, req.ingredient);
                out.push({ translate: "guide.crockpot.recipe.req.contain_suffix", with: [String(req.quantity ?? 1)] });
                out.push({ text: "\n" });
                break;
            }
            case "min":
                out.push({ text: pad });
                pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.min_suffix", with: [String(req.value)] });
                out.push({ text: "\n" });
                break;
            case "gt":
                out.push({ text: pad });
                pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.gt_suffix", with: [String(req.value)] });
                out.push({ text: "\n" });
                break;
            case "max":
                out.push({ text: pad });
                pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.max_suffix", with: [String(req.value)] });
                out.push({ text: "\n" });
                break;
            case "lt":
                out.push({ text: pad });
                pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.lt_suffix", with: [String(req.value)] });
                out.push({ text: "\n" });
                break;
            case "without":
                out.push({ text: pad });
                out.push({ translate: "guide.crockpot.recipe.req.without_prefix" });
                pushCategory(out, req.category);
                out.push({ text: "\n" });
                break;
            case "and":
                out.push({ text: pad });
                out.push({ translate: "guide.crockpot.recipe.req.and" });
                out.push({ text: "\n" });
                out.push(...buildRequirementLines([req.first], depth + 1));
                out.push(...buildRequirementLines([req.second], depth + 1));
                break;
            case "or":
                out.push({ text: pad });
                out.push({ translate: "guide.crockpot.recipe.req.or" });
                out.push({ text: "\n" });
                out.push(...buildRequirementLines([req.first], depth + 1));
                out.push(...buildRequirementLines([req.second], depth + 1));
                break;
        }
    }
    return out;
}

function buildRecipeDetailText(recipe) {
    const out = [];
    out.push({ translate: "guide.crockpot.recipe.detail.time", with: [String(recipe.cookingtime / 20)] });
    out.push({ text: "\n" });
    out.push({ translate: "guide.crockpot.recipe.detail.pot_level", with: [String(recipe.potlevel)] });
    out.push({ text: "\n" });
    out.push({ translate: "guide.crockpot.recipe.detail.priority", with: [String(recipe.priority)] });
    out.push({ text: "  " });
    out.push({ translate: "guide.crockpot.recipe.detail.weight", with: [String(recipe.weight ?? 1)] });
    out.push({ text: "\n\n" });
    out.push({ translate: "guide.crockpot.recipe.detail.requirements" });
    out.push({ text: "\n" });
    out.push(...buildRequirementLines(recipe.requirements ?? [], 0));
    return out;
}

function buildCategoryPage(categoryId, pageIndex) {
    const allowed = new Set(RECIPE_CATEGORY[categoryId] ?? []);
    const list = CrockPotRecipes.filter(r => allowed.has(r.result.id));
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const page = Math.max(0, Math.min(pageIndex, totalPages - 1));
    const slice = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const buttons = slice.map(r => ({
        label: itemKey(r.result.id),
        icon: iconOf(r.result.id),
        next: "recipe_detail",
        params: { recipeId: r.result.id, backCategory: categoryId, backPage: page },
    }));

    if (page > 0) {
        buttons.push({
            label: "guide.crockpot.button.prev",
            icon: ICON_PREV,
            next: `recipe_${categoryId}`,
            params: { page: page - 1 },
        });
    }
    if (page < totalPages - 1) {
        buttons.push({
            label: "guide.crockpot.button.next",
            icon: ICON_NEXT,
            next: `recipe_${categoryId}`,
            params: { page: page + 1 },
        });
    }
    buttons.push({
        label: "guide.crockpot.button.back",
        icon: ICON_BACK,
        next: "recipes",
    });

    return {
        title: () => [{ translate: `guide.crockpot.recipe.category.${categoryId}` }],
        body: () => ([
            { translate: "guide.crockpot.recipe.category.hint" },
            { text: "\n" },
            { translate: "guide.crockpot.recipe.category.page", with: [String(page + 1), String(totalPages)] },
        ]),
        buttons,
    };
}

function buildRecipeDetailPage(params) {
    const { recipeId, backCategory, backPage } = params ?? {};
    const recipe = CrockPotRecipes.find(r => r.result.id === recipeId);
    if (!recipe) {
        return {
            title: () => [{ translate: "guide.crockpot.error.title" }],
            body: () => [{ translate: "guide.crockpot.error.body" }],
            buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "recipes" }],
        };
    }
    const backTarget = backCategory ? `recipe_${backCategory}` : "recipes";
    return {
        title: () => [
            { translate: itemKey(recipe.result.id) },
            { translate: "guide.crockpot.recipe.detail.count_suffix", with: [String(recipe.result.count ?? 1)] },
        ],
        body: () => buildRecipeDetailText(recipe),
        buttons: [{
            label: "guide.crockpot.button.back",
            icon: ICON_BACK,
            next: backTarget,
            params: { page: backPage ?? 0 },
        }],
    };
}

const PAGES = {
    root: {
        title: () => [{ translate: "guide.crockpot.root.title" }],
        body: () => [{ translate: "guide.crockpot.root.body" }],
        buttons: [
            { label: "guide.crockpot.button.devices", icon: ICON.devices, next: "devices" },
            { label: "guide.crockpot.button.recipes", icon: ICON.recipes, next: "recipes" },
            { label: "guide.crockpot.button.farming", icon: ICON.farming, next: "farming" },
            { label: "guide.crockpot.button.entities", icon: ICON.entities, next: "entities" },
            { label: "guide.crockpot.button.effects", icon: ICON.effects, next: "effects" },
            { label: "guide.crockpot.button.thanks", icon: ICON.thanks, next: "thanks" },
        ],
    },

    devices: {
        title: () => [{ translate: "guide.crockpot.devices.title" }],
        body: () => [{ translate: "guide.crockpot.devices.body" }],
        buttons: [
            { label: "item.crockpot:crock_pot", icon: ICON.crock_pot, next: "crock_pot" },
            { label: "item.crockpot:portable_crock_pot", icon: ICON.portable_crock_pot, next: "portable_crock_pot" },
            { label: "item.crockpot:birdcage", icon: ICON.birdcage, next: "birdcage" },
            { label: "guide.crockpot.button.back", icon: ICON_BACK, next: "root" },
        ],
    },
    crock_pot: {
        title: () => [{ translate: "item.crockpot:crock_pot" }],
        body: () => [{ translate: "guide.crockpot.device.crock_pot.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "devices" }],
    },
    portable_crock_pot: {
        title: () => [{ translate: "item.crockpot:portable_crock_pot" }],
        body: () => [{ translate: "guide.crockpot.device.portable_crock_pot.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "devices" }],
    },
    birdcage: {
        title: () => [{ translate: "item.crockpot:birdcage" }],
        body: () => [{ translate: "guide.crockpot.device.birdcage.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "devices" }],
    },

    recipes: {
        title: () => [{ translate: "guide.crockpot.recipes.title" }],
        body: () => {
            const out = [{ translate: "guide.crockpot.recipes.intro" }];
            const cats = ["MEAT", "MONSTER", "FISH", "EGG", "FRUIT", "VEGGIE", "DAIRY", "SWEETENER", "FROZEN", "INEDIBLE"];
            cats.forEach((cat, idx) => {
                pushCategory(out, cat);
                if (idx < cats.length - 1) out.push({ text: "、" });
            });
            out.push({ text: "\n" }, { translate: "guide.crockpot.recipes.rule" });
            return out;
        },
        buttons: [
            { label: "guide.crockpot.recipe.category.soup", icon: ICON.soup, next: "recipe_soup", params: { page: 0 } },
            { label: "guide.crockpot.recipe.category.main", icon: ICON.main, next: "recipe_main", params: { page: 0 } },
            { label: "guide.crockpot.recipe.category.dessert", icon: ICON.dessert, next: "recipe_dessert", params: { page: 0 } },
            { label: "guide.crockpot.recipe.category.beverage", icon: ICON.beverage, next: "recipe_beverage", params: { page: 0 } },
            { label: "guide.crockpot.recipe.category.special", icon: ICON.special, next: "recipe_special", params: { page: 0 } },
            { label: "guide.crockpot.button.back", icon: ICON_BACK, next: "root" },
        ],
    },
    recipe_soup: (p) => buildCategoryPage("soup", p.page ?? 0),
    recipe_main: (p) => buildCategoryPage("main", p.page ?? 0),
    recipe_dessert: (p) => buildCategoryPage("dessert", p.page ?? 0),
    recipe_beverage: (p) => buildCategoryPage("beverage", p.page ?? 0),
    recipe_special: (p) => buildCategoryPage("special", p.page ?? 0),
    recipe_detail: (p) => buildRecipeDetailPage(p),

    farming: {
        title: () => [{ translate: "guide.crockpot.farming.title" }],
        body: () => [{ translate: "guide.crockpot.farming.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "root" }],
    },

    entities: {
        title: () => [{ translate: "guide.crockpot.entities.title" }],
        body: () => [{ translate: "guide.crockpot.entities.body" }],
        buttons: [
            { label: "entity.crockpot:volt_goat.name", icon: ICON.volt_goat, next: "volt_goat" },
            { label: "item.crockpot:milk_bottle", icon: ICON.milk_bottle, next: "milk_bottle" },
            { label: "guide.crockpot.button.back", icon: ICON_BACK, next: "root" },
        ],
    },
    volt_goat: {
        title: () => [{ translate: "entity.crockpot:volt_goat.name" }],
        body: () => [{ translate: "guide.crockpot.entity.volt_goat.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "entities" }],
    },
    milk_bottle: {
        title: () => [{ translate: "item.crockpot:milk_bottle" }],
        body: () => [{ translate: "guide.crockpot.entity.milk_bottle.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "entities" }],
    },

    effects: {
        title: () => [{ translate: "guide.crockpot.effects.title" }],
        body: () => [{ translate: "guide.crockpot.effects.body" }],
        buttons: [
            { label: "effect.crockpot.charge", icon: ICON.charge, next: "effect_charge" },
            { label: "effect.crockpot.well_fed", icon: ICON.well_fed, next: "effect_well_fed" },
            { label: "effect.crockpot.wither_resistance", icon: ICON.wither_resistance, next: "effect_wither_resistance" },
            { label: "effect.crockpot.ocean_affinity", icon: ICON.ocean_affinity, next: "effect_ocean_affinity" },
            { label: "guide.crockpot.button.back", icon: ICON_BACK, next: "root" },
        ],
    },
    effect_charge: {
        title: () => [{ translate: "effect.crockpot.charge" }],
        body: () => [{ translate: "guide.crockpot.effect.charge.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "effects" }],
    },
    effect_well_fed: {
        title: () => [{ translate: "effect.crockpot.well_fed" }],
        body: () => [{ translate: "guide.crockpot.effect.well_fed.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "effects" }],
    },
    effect_wither_resistance: {
        title: () => [{ translate: "effect.crockpot.wither_resistance" }],
        body: () => [{ translate: "guide.crockpot.effect.wither_resistance.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "effects" }],
    },
    effect_ocean_affinity: {
        title: () => [{ translate: "effect.crockpot.ocean_affinity" }],
        body: () => [{ translate: "guide.crockpot.effect.ocean_affinity.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "effects" }],
    },

    thanks: {
        title: () => [{ translate: "guide.crockpot.thanks.title" }],
        body: () => [{ translate: "guide.crockpot.thanks.body" }],
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "root" }],
    },
};

function showPage(player, id, params = {}) {
    if (!player?.isValid) return;
    const raw = PAGES[id];
    if (!raw) return;

    const page = typeof raw === "function" ? raw(params) : raw;
    if (!page) return;

    const titleRaw = typeof page.title === "function" ? page.title() : page.title;
    const bodyRaw = typeof page.body === "function" ? page.body() : page.body;
    const buttons = page.buttons ?? [];

    const form = new ActionFormData()
        .title({ rawtext: titleRaw })
        .body({ rawtext: bodyRaw });

    for (const b of buttons) {
        if (b.icon) {
            form.button({ rawtext: [{ translate: b.label }] }, b.icon);
        } else {
            form.button({ rawtext: [{ translate: b.label }] });
        }
    }

    form.show(player).then((res) => {
        if (!res || res.canceled || res.selection === undefined) return;
        const btn = buttons[res.selection];
        if (!btn) return;

        system.runTimeout(() => {
            showPage(player, btn.next, btn.params ?? {});
        }, 1);

    }).catch((e) => {
        console.warn("Form show error:", e);
    });
}

let lastUseTick = 0;

export class Book {
    itemUse(args) {
        const player = args.source;
        const itemStack = args.itemStack;
        if (!player || !itemStack) return;
        if (itemStack.typeId !== BOOK_ITEM_ID) return;

        const now = system.currentTick;
        if (now - lastUseTick < 10) return;
        lastUseTick = now;

        system.run(() => {
            if (player.isValid) showPage(player, "root", {});
        });
    }
}

__decorate([
    EventAPI.register(world.afterEvents.itemUse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ItemUseAfterEvent]),
    __metadata("design:returntype", void 0)
], Book.prototype, "itemUse", null);