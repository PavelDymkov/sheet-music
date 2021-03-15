import { Part, PartTupletState } from "../../package/part";
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

const { Eight, Quarter } = NoteValue;
const { Zero } = Fraction;

const tripletFactor = Fraction.create(3, 2);
const quintupletFactor = Fraction.create(5, 4);

it("part special: case 1", () => {
    const part = new Part();

    part.insertTuplet();

    part.insertNoteSet(Quarter);
    part.insertNoteSet(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Quarter,
            state: PartTupletState.Incomplete,
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

    part.insertNoteSet(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Quarter,
            state: PartTupletState.Complete,
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

    part.insertNoteSet(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 5,
            baseNoteValue: Quarter,
            state: PartTupletState.Incomplete,
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

    part.insertNoteSet(Quarter);

    assert(part, [
        spacer(),
        tuplet({
            index: 5,
            baseNoteValue: Quarter,
            state: PartTupletState.Complete,
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
