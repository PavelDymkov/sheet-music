import { ok } from "assert";

import {
    Part,
    PartItem,
    PartItemNotes,
    PartItemSpacer,
} from "../package/lib/part";
import { NoteValue, NoteValueCombination } from "../package/lib/note-value";

describe("sheet-music/part", () => {
    it("should check empty part", () => {
        const part = new Part();

        contains(part, [spacer()]);
    });

    it("should insert eight note", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);

        contains(part, [spacer(), [NoteValue.Eight], spacer()]);
    });

    it("should remove last inserted", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);
        part.insert(NoteValue.Quarter);

        part.remove();

        contains(part, [spacer(), [NoteValue.Eight], spacer()]);
    });

    it("should test cursor forward and backward", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);

        const note1 = part.item;

        part.insert(NoteValue.Quarter);

        const note2 = part.item;

        const quarter = new NoteValueCombination(NoteValue.Quarter);
        const eight = new NoteValueCombination(NoteValue.Eight);

        part.cursor.forward(quarter);

        ok(part.item === null);

        part.cursor.backward(eight);

        ok(part.item === note2);

        part.cursor.backward(eight);

        ok(part.item === null);

        part.cursor.backward(eight);

        ok(part.item === note1);
    });

    it("should test some sequence #1", () => {
        const half = new NoteValueCombination(NoteValue.Half);
        const quarterDotted = new NoteValueCombination(
            NoteValue.dotted(NoteValue.Quarter),
        );
        const eight = new NoteValueCombination(NoteValue.Eight);

        const part = new Part();

        part.expand(half);
        part.cursor.forward(half);
        part.cursor.backward(quarterDotted);
        part.insert(NoteValue.Quarter);

        contains(part, [spacer(eight), [NoteValue.Quarter], spacer(eight)]);
    });
});

type PartItemExpect = NoteValue[] | string;

function contains(part: Part, expected: PartItemExpect[]): void {
    const [, itemKey] = Object.getOwnPropertySymbols(part);

    const currentItem = part[itemKey] as PartItem;

    const [nextKey, prevKey, valueKey] = Object.getOwnPropertySymbols(
        currentItem,
    );

    const items: PartItem[] = [currentItem];

    let item: PartItem;

    item = currentItem;

    while ((item = item[nextKey])) items.push(item);

    item = currentItem;

    while ((item = item[prevKey])) items.unshift(item);

    ok(items.length === expected.length);

    items.forEach((item, i) => {
        if (item instanceof PartItemNotes) {
            const actual = item[valueKey].toArray() as NoteValue[];
            const expect = expected[i];

            ok(actual.length === expect.length);

            actual.forEach((item, i) => ok(item === expect[i]));
        }

        if (item instanceof PartItemSpacer) {
            ok(expected[i] === spacer(item[valueKey]));
        }
    });
}

function spacer(value?: NoteValueCombination): string {
    const size = value ? value.size : 0;

    return `spacer (${size})`;
}
