import { getItemFoodValues } from "./FoodValues";
import { CrockPotRecipes } from "./CrockPotRecipes";

export function matchIngredient(item, ingredient) {
    if (Array.isArray(ingredient)) return ingredient.some(ing => matchIngredient(item, ing));
    if (ingredient.item && item.typeId === ingredient.item) return true;
    if (ingredient.tag && typeof item.hasTag === "function" && item.hasTag(ingredient.tag)) return true;
    return false;
}

export function evaluateRequirement(req, foodValues, items) {
    switch (req.type) {
        case "contain":
            return items.filter(it => matchIngredient(it, req.ingredient)).length >= (req.quantity ?? 1);
        case "min":
            return (foodValues[req.category] ?? 0) >= req.value;
        case "gt":
            return (foodValues[req.category] ?? 0) > req.value;
        case "max":
            return (foodValues[req.category] ?? 0) <= req.value;
        case "lt":
            return (foodValues[req.category] ?? 0) < req.value;
        case "without":
            return (foodValues[req.category] ?? 0) <= 0;
        case "and":
            return evaluateRequirement(req.first, foodValues, items) && evaluateRequirement(req.second, foodValues, items);
        case "or":
            return evaluateRequirement(req.first, foodValues, items) || evaluateRequirement(req.second, foodValues, items);
        default:
            return false;
    }
}

export function matchRecipe(items, potLevel) {
    if (items.length !== 4) return null;

    for (const item of items) {
        const val = getItemFoodValues(item);
        if (!val || !Object.values(val).some(v => Number(v) > 0)) return null;
    }

    const mergedValues = {};
    for (const item of items) {
        const val = getItemFoodValues(item);
        if (val) {
            for (const [cat, num] of Object.entries(val)) {
                mergedValues[cat] = (mergedValues[cat] ?? 0) + num;
            }
        }
    }

    const matched = CrockPotRecipes.filter(r => {
        if (potLevel < r.potlevel) return false;
        return r.requirements.every(req => evaluateRequirement(req, mergedValues, items));
    });

    if (matched.length === 0) {
        return { result: { id: "crockpot:wet_goop", count: 1 }, cookingtime: 200 };
    }

    const maxPriority = Math.max(...matched.map(r => r.priority));
    const highest = matched.filter(r => r.priority === maxPriority);

    if (highest.length === 1) return highest[0];

    const totalWeight = highest.reduce((sum, r) => sum + r.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const r of highest) {
        rand -= r.weight;
        if (rand <= 0) return r;
    }
    return highest[0];
}