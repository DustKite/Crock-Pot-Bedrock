import { CrockPotRecipes } from "../data/CrockPotRecipes";
import { RECIPE_CATEGORY } from "./GuideRecipeCategories";
import { SEED_RECIPES } from "../data/SeedRecipes"; 
import { ICON, ICON_BACK, ICON_PREV, ICON_NEXT, iconOf, itemKey, pushCategory, pushIngredientRawtext, hasFarmersDelight } from "./GuideUtils";

const PAGE_SIZE = 8;

function buildRequirementLines(reqs, depth) {
    const out = [];
    const pad = "  ".repeat(depth) + "§7• §r";
    for (const req of reqs) {
        switch (req.type) {
            case "contain": {
                out.push({ text: pad }, { translate: "guide.crockpot.recipe.req.contain_prefix" });
                pushIngredientRawtext(out, req.ingredient);
                out.push({ translate: "guide.crockpot.recipe.req.contain_suffix", with: [String(req.quantity ?? 1)] }, { text: "\n" });
                break;
            }
            case "min":
                out.push({ text: pad }); pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.min_suffix", with: [String(req.value)] }, { text: "\n" });
                break;
            case "gt":
                out.push({ text: pad }); pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.gt_suffix", with: [String(req.value)] }, { text: "\n" });
                break;
            case "max":
                out.push({ text: pad }); pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.max_suffix", with: [String(req.value)] }, { text: "\n" });
                break;
            case "lt":
                out.push({ text: pad }); pushCategory(out, req.category);
                out.push({ translate: "guide.crockpot.recipe.req.lt_suffix", with: [String(req.value)] }, { text: "\n" });
                break;
            case "without":
                out.push({ text: pad }, { translate: "guide.crockpot.recipe.req.without_prefix" });
                pushCategory(out, req.category);
                out.push({ text: "\n" });
                break;
            case "and":
                out.push({ text: pad }, { translate: "guide.crockpot.recipe.req.and" }, { text: "\n" });
                out.push(...buildRequirementLines([req.first], depth + 1));
                out.push(...buildRequirementLines([req.second], depth + 1));
                break;
            case "or":
                out.push({ text: pad }, { translate: "guide.crockpot.recipe.req.or" }, { text: "\n" });
                out.push(...buildRequirementLines([req.first], depth + 1));
                out.push(...buildRequirementLines([req.second], depth + 1));
                break;
        }
    }
    return out;
}

function buildRecipeDetailText(recipe) {
    const out = [];
    out.push({ translate: "guide.crockpot.recipe.detail.time", with: [String(recipe.cookingtime / 20)] }, { text: "\n" });
    out.push({ translate: "guide.crockpot.recipe.detail.pot_level", with: [String(recipe.potlevel)] }, { text: "\n" });
    out.push({ translate: "guide.crockpot.recipe.detail.priority", with: [String(recipe.priority)] }, { text: "  " });
    out.push({ translate: "guide.crockpot.recipe.detail.weight", with: [String(recipe.weight ?? 1)] }, { text: "\n\n" });
    out.push({ translate: "guide.crockpot.recipe.detail.requirements" }, { text: "\n" });
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

    if (page > 0) buttons.push({ label: "guide.crockpot.button.prev", icon: ICON_PREV, next: `recipe_${categoryId}`, params: { page: page - 1 } });
    if (page < totalPages - 1) buttons.push({ label: "guide.crockpot.button.next", icon: ICON_NEXT, next: `recipe_${categoryId}`, params: { page: page + 1 } });
    buttons.push({ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "recipes" });

    return {
        title: () => [{ translate: `guide.crockpot.recipe.category.${categoryId}` }],
        body: () => ([
            { translate: "guide.crockpot.recipe.category.hint" }, { text: "\n" },
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
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: backTarget, params: { page: backPage ?? 0 } }],
    };
}

function buildBirdcageRecipesBody() {
    const out = [{ translate: "guide.crockpot.device.birdcage.recipes.intro" }];
    
    const vanilla = [];
    const crockpot = [];
    const fd = [];
    
    for (const itemId of Object.keys(SEED_RECIPES)) {
        if (itemId.startsWith("minecraft:")) vanilla.push(itemId);
        else if (itemId.startsWith("crockpot:")) crockpot.push(itemId);
        else if (itemId.startsWith("farmersdelight:")) fd.push(itemId);
    }
    
    const pushList = (ids) => {
        ids.forEach((id, idx) => {
            out.push({ translate: itemKey(id) });
            if (idx < ids.length - 1) out.push({ text: "、" });
        });
    };

    if (vanilla.length > 0) {
        out.push({ text: "\n\n§7— " }, { translate: "guide.crockpot.device.birdcage.recipes.vanilla" }, { text: " —§r\n" });
        pushList(vanilla);
    }
    
    if (crockpot.length > 0) {
        out.push({ text: "\n\n§7— " }, { translate: "guide.crockpot.device.birdcage.recipes.crockpot" }, { text: " —§r\n" });
        pushList(crockpot);
    }
    
    if (fd.length > 0 && hasFarmersDelight()) {
        out.push({ text: "\n\n§7— " }, { translate: "guide.crockpot.device.birdcage.recipes.fd" }, { text: " —§r\n" });
        pushList(fd);
    }
    
    out.push({ text: "\n\n§7" }, { translate: "guide.crockpot.device.birdcage.recipes.note" }, { text: "§r" });
    return out;
}

export const PAGES = {
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
        buttons: [
            { label: "guide.crockpot.device.birdcage.recipes", icon: "textures/items/crockpot/unknown_seeds", next: "birdcage_recipes" },
            { label: "guide.crockpot.button.back", icon: ICON_BACK, next: "devices" }
        ],
    },
    birdcage_recipes: {
        title: () => [{ translate: "guide.crockpot.device.birdcage.recipes" }],
        body: () => buildBirdcageRecipesBody(),
        buttons: [{ label: "guide.crockpot.button.back", icon: ICON_BACK, next: "birdcage" }],
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