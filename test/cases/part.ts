import { ok } from "assert";

import { Part, PartNoteSet, PartSpacer } from "../../package/part";
import { NoteValue } from "../../package/note-value";
import { Fraction } from "../../package/tools/fraction";

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

        delta(part.insertNoteSet(Eight), Zero);

        assert(part, [spacer(), cursor(), note(Eight), spacer()]);
    });

    it("should remove last inserted", () => {
        const part = new Part();

        delta(part.insertNoteSet(Eight), Zero);
        delta(part.insertNoteSet(Quarter), Eight.size);

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

        part.insertNoteSet(Eight);

        const note1 = part.cursor.item;

        ok(note1 instanceof PartNoteSet);

        part.insertNoteSet(Quarter);

        const note2 = part.cursor.item;

        ok(note2 instanceof PartNoteSet);

        part.cursor.forward(Quarter.size);

        ok(part.cursor.item instanceof PartSpacer);

        part.cursor.backward(Eight.size);

        // @ts-ignore
        ok(part.cursor.item === note2);

        part.cursor.backward(Eight.size);

        ok(part.cursor.item === note2);

        part.cursor.backward(Fraction.Zero);

        // @ts-ignore
        ok(part.cursor.item instanceof PartSpacer);

        part.cursor.backward(Sixteenth.size);

        ok(part.cursor.item === note1);

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

        part.insertNoteSet(Quarter);

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
