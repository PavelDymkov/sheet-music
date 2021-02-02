import { ok } from "assert";

import { Part, Item, Spacer } from "../package/lib/part";
import { NoteValue } from "../package/lib/note-value";

describe("sheet-music/part", () => {
    it("should check empty part", () => {
        const part = new Part();

        contains(part, [spacer()]);
    });

    it("should insert eight note", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);

        contains(part, [spacer(), NoteValue.Eight, spacer()]);
    });

    it("should remove last inserted", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);
        part.insert(NoteValue.Quarter);

        part.remove();

        contains(part, [spacer(), NoteValue.Eight, spacer()]);
    });

    it("should test cursor forward and backward", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);

        const note1 = part.node;

        part.insert(NoteValue.Quarter);

        const note2 = part.node;

        part.cursor.forward(NoteValue.Quarter);

        ok(part.node instanceof Spacer);

        part.cursor.backward(NoteValue.Eight);

        ok(part.node === note2);

        part.cursor.backward(NoteValue.Eight);

        ok(part.node instanceof Spacer);

        part.cursor.backward(NoteValue.Eight);

        ok(part.node === note1);

        contains(part, [
            spacer(),
            NoteValue.Eight,
            spacer(),
            NoteValue.Quarter,
            spacer(),
        ]);
    });

    it("should test parent and children", () => {
        // code...
    });

    it("should test some sequence #1", () => {
        const part = new Part();

        part.cursor.forward(NoteValue.Half);
        part.cursor.backward(NoteValue.dotted(NoteValue.Quarter));
        part.insert(NoteValue.Quarter);

        contains(part, [
            spacer(NoteValue.Eight),
            NoteValue.Quarter,
            spacer(NoteValue.Eight),
        ]);
    });
});

type PartItemExpect = NoteValue | string;

function contains(part: Part, expected: PartItemExpect[]): void {
    const [, itemKey] = Object.getOwnPropertySymbols(part);

    const currentItem = part[itemKey] as Item;

    const [nextKey, prevKey] = Object.getOwnPropertySymbols(currentItem);

    const items: Item[] = [currentItem];

    let item;

    item = currentItem;

    while ((item = item[nextKey])) items.push(item);

    item = currentItem;

    while ((item = item[prevKey])) items.unshift(item);

    ok(items.length === expected.length);

    items.forEach((item, i) => {
        const [, , , , valueKey] = Object.getOwnPropertySymbols(item);

        if (item.isSpacer) {
            ok(expected[i] === spacer(item[valueKey]));
        } else {
            const actual = item[valueKey] as NoteValue;
            const expect = expected[i] as NoteValue;

            ok(actual instanceof NoteValue);
            ok(expect instanceof NoteValue);
            ok(actual.size === expect.size);
        }
    });
}

function spacer(value?: NoteValue): string {
    const size = value ? value.size : 0;

    return `spacer (${size})`;
}
