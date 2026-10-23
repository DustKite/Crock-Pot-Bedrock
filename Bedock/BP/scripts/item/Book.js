var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { ItemUseAfterEvent, system, world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { showPage } from "../lib/GuideRenderer";

const BOOK_ITEM_ID = "crockpot:book";

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