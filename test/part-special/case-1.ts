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

    delta(part.insertTuplet(), Zero);
    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: NoteValue.create(),
            state: PartTupletState.Incomplete,
            children: [cursor(), spacer()],
        }),
        spacer(),
    ]);

    delta(part.insertNoteSet(Eight), Zero);
    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Eight,
            state: PartTupletState.Incomplete,
            children: [spacer(), cursor(), note(Eight), spacer(Quarter.size)],
        }),
        spacer(),
    ]);

    delta(part.insertNoteSet(Quarter), Eight.size.divide(tripletFactor));
    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Eight,
            state: PartTupletState.Complete,
            children: [
                spacer(),
                note(Eight),
                spacer(),
                cursor(),
                note(Quarter),
                spacer(),
            ],
        }),
        spacer(),
    ]);

    delta(part.insertNoteSet(Quarter), Quarter.size.divide(quintupletFactor));
    assert(part, [
        spacer(),
        tuplet({
            index: 5,
            baseNoteValue: Eight,
            state: PartTupletState.Complete,
            children: [
                spacer(),
                note(Eight),
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

    part.cursor.backward(Eight.size.divide(quintupletFactor));
    assert(part, [
        spacer(),
        tuplet({
            index: 5,
            baseNoteValue: Eight,
            state: PartTupletState.Complete,
            children: [
                spacer(),
                note(Eight),
                spacer(),
                cursor({
                    offset: Eight.size.divide(quintupletFactor),
                }),
                note(Quarter),
                spacer(),
                note(Quarter),
                spacer(),
            ],
        }),
        spacer(),
    ]);

    delta(part.remove(), Eight.size.divide(quintupletFactor));
    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Eight,
            state: PartTupletState.Complete,
            children: [
                spacer(),
                note(Eight),
                cursor(),
                spacer(),
                note(Quarter),
                spacer(),
            ],
        }),
        spacer(),
    ]);
});
