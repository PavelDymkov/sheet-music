import { ok } from "assert";

import { Part, Item, Spacer } from "../../package/lib/part";
import { NoteValue } from "../../package/lib/note-value";
import { Fraction } from "../../package/lib/tools/fraction";

import {
    partAssertion as assert,
    spacer,
    note,
    tuplet,
    cursor,
} from "../tools/part-comparator";
import { delta } from "../tools/delta";

const { Sixteenth, Eight, Quarter, Half, dotted } = NoteValue;
const { Zero } = Fraction;

describe("sheet-music/part", () => {
    it("should check empty part", () => {
        const part = new Part();

        assert(part, [spacer()]);
    });

    it("should insert eight note", () => {
        const part = new Part();

        delta(part.insert(Eight), Zero);

        assert(part, [spacer(), cursor(), note(Eight), spacer()]);
    });

    it("should remove last inserted", () => {
        const part = new Part();

        delta(part.insert(Eight), Zero);
        delta(part.insert(Quarter), Eight.size);

        assert(part, [
            spacer(),
            note(Eight),
            spacer(),
            cursor(),
            note(Quarter),
            spacer(),
        ]);

        delta(part.remove(), Zero);

        assert(part, [spacer(), note(Eight), cursor(), spacer()]);
    });

    it("should test cursor forward and backward", () => {
        const part = new Part();

        part.insert(Eight);

        const note1 = part.cursor.node;

        ok(note1 instanceof Item);

        part.insert(Quarter);

        const note2 = part.cursor.node;

        ok(note2 instanceof Item);

        part.cursor.forward(Quarter.size);

        ok(part.cursor.node instanceof Spacer);

        part.cursor.backward(Eight.size);

        // @ts-ignore
        ok(part.cursor.node === note2);

        part.cursor.backward(Eight.size);

        ok(part.cursor.node === note2);

        part.cursor.backward(Fraction.Zero);

        // @ts-ignore
        ok(part.cursor.node instanceof Spacer);

        part.cursor.backward(Sixteenth.size);

        ok(part.cursor.node === note1);

        assert(part, [
            spacer(),
            cursor({ offset: Sixteenth.size }),
            note(Eight),
            spacer(),
            note(Quarter),
            spacer(),
        ]);
    });

    it("should test some sequence #1", () => {
        const part = new Part();

        part.cursor.forward(Half.size);
        part.cursor.backward(dotted(Quarter).size);

        part.insert(Quarter);

        assert(part, [
            spacer(Eight.size),
            cursor(),
            note(Quarter),
            spacer(Eight.size),
        ]);
    });

    it("should test some sequence #2", () => {
        const part = new Part();
    });

    // it("should ", () => {
    //     // code...
    // });
});
