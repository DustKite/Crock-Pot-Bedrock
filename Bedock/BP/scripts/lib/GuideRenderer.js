import { ActionFormData } from "@minecraft/server-ui";
import { system } from "@minecraft/server";
import { PAGES } from "./GuidePages";

export function showPage(player, id, params = {}) {
    if (!player?.isValid) return;
    const raw = PAGES[id];
    if (!raw) return;
    const page = typeof raw === "function" ? raw(params) : raw;
    if (!page) return;

    const titleRaw = typeof page.title === "function" ? page.title() : page.title;
    const bodyRaw = typeof page.body === "function" ? page.body() : page.body;
    const buttons = page.buttons ?? [];

    const form = new ActionFormData().title({ rawtext: titleRaw }).body({ rawtext: bodyRaw });
    for (const b of buttons) {
        if (b.icon) form.button({ rawtext: [{ translate: b.label }] }, b.icon);
        else form.button({ rawtext: [{ translate: b.label }] });
    }

    form.show(player).then((res) => {
        if (!res || res.canceled || res.selection === undefined) return;
        const btn = buttons[res.selection];
        if (!btn) return;
        system.runTimeout(() => showPage(player, btn.next, btn.params ?? {}), 1);
    }).catch((e) => console.warn("Form show error:", e));
}