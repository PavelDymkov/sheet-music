import { ok } from "assert";

import { Part, Spacer } from "../package/lib/part";
import { NoteValue } from "../package/lib/note-value";
import { Fraction } from "../package/lib/tools/fraction";

import {
    partAssertion,
    spacer,
    note,
    tuplet,
    cursor,
} from "./tools/part-comparator";

describe("sheet-music/part", () => {
    it("should check empty part", () => {
        const part = new Part();

        partAssertion(part, [spacer()]);
    });

    it("should insert eight note", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);

        partAssertion(part, [
            spacer(),
            cursor(),
            note(NoteValue.Eight),
            spacer(),
        ]);
    });

    it("should remove last inserted", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);
        part.insert(NoteValue.Quarter);

        part.remove();

        partAssertion(part, [
            spacer(),
            note(NoteValue.Eight),
            cursor(),
            spacer(),
        ]);
    });

    it("should test cursor forward and backward", () => {
        const part = new Part();

        part.insert(NoteValue.Eight);

        const note1 = part.cursor.node;

        part.insert(NoteValue.Quarter);

        const note2 = part.cursor.node;

        part.cursor.forward(NoteValue.Quarter.size);

        ok(part.cursor.node instanceof Spacer);

        part.cursor.backward(NoteValue.Eight.size);

        ok(part.cursor.node === note2);

        part.cursor.backward(NoteValue.Eight.size);

        ok(part.cursor.node === note2);

        part.cursor.backward(Fraction.Zero);

        ok(part.cursor.node instanceof Spacer);

        part.cursor.backward(NoteValue.Sixteenth.size);

        ok(part.cursor.node === note1);

        partAssertion(part, [
            spacer(),
            cursor({ offset: NoteValue.Sixteenth.size }),
            note(NoteValue.Eight),
            spacer(),
            note(NoteValue.Quarter),
            spacer(),
        ]);
    });

    it("should test some sequence #1", () => {
        const part = new Part();

        part.cursor.forward(NoteValue.Half.size);
        part.cursor.backward(NoteValue.dotted(NoteValue.Quarter).size);

        part.insert(NoteValue.Quarter);

        partAssertion(part, [
            spacer(NoteValue.Eight.size),
            cursor(),
            note(NoteValue.Quarter),
            spacer(NoteValue.Eight.size),
        ]);
    });

    // it("should ", () => {
    //     // code...
    // });
});
