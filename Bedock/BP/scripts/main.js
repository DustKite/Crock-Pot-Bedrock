import { Birdcage } from "./block/Birdcage";
import { CrockPotBlock } from "./block/CrockPotBlock";
import { Crops } from "./block/Crops";
import { PlaceFood } from "./block/PlaceFood";

import { CrockPotEntity } from "./entity/CrockPotEntity";
import { CowMilking } from "./entity/CowMilking";
import { VoltGoatCharged } from "./entity/VoltGoatCharged";

import { Food } from "./item/Food";
import { FoodValuesLore } from "./item/FoodValuesLore";
import { Loot } from "./item/Loot";
import { MilkmadeHat } from "./item/MilkmadeHat";
import { ParrotEgg } from "./item/ParrotEgg";

new Birdcage();
new CrockPotBlock();
new Crops();
new PlaceFood();

new CrockPotEntity();
new CowMilking();
new VoltGoatCharged();

new Food();
new FoodValuesLore();
new Loot();
new MilkmadeHat();
new ParrotEgg();