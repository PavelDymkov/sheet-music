import { Part } from "../../package/lib/part";
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

const { Eight, Quarter } = NoteValue;
const { Zero } = Fraction;

const tripletFactor = Fraction.create(3, 2);
const quintupletFactor = Fraction.create(5, 4);

it("part special: case 1", () => {
    const part = new Part();

    part.insertIrregularRhythm();

    part.insert(Quarter);
    part.insert(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Quarter,
            complete: false,
            children: [
                spacer(),
                note(Quarter),
                spacer(),
                cursor(),
                note(Quarter),
                spacer(Quarter.size),
            ],
        }),
        spacer(),
    ]);

    part.insert(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Quarter,
            complete: true,
            children: [
                spacer(),
                note(Quarter),
                spacer(),
                note(Quarter),
                spacer(),
                cursor(),
                note(Quarter),
                spacer(),
            ],
        }),
        spacer(),
    ]);

    part.insert(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 5,
            baseNoteValue: Quarter,
            complete: false,
            children: [
                spacer(),
                note(Quarter),
                spacer(),
                note(Quarter),
                spacer(),
                note(Quarter),
                spacer(),
                cursor(),
                note(Quarter),
                spacer(Quarter.size),
            ],
        }),
        spacer(),
    ]);

    part.insert(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 5,
            baseNoteValue: Quarter,
            complete: true,
            children: [
                spacer(),
                note(Quarter),
                spacer(),
                note(Quarter),
                spacer(),
                note(Quarter),
                spacer(),
                note(Quarter),
                spacer(),
                cursor(),
                note(Quarter),
                spacer(),
            ],
        }),
        spacer(),
    ]);
});
