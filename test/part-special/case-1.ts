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

    delta(part.insertIrregularRhythm(), Zero);
    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: NoteValue.create(),
            complete: false,
            children: [cursor(), spacer()],
        }),
        spacer(),
    ]);

    delta(part.insert(Eight), Zero);
    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Eight,
            complete: false,
            children: [spacer(), cursor(), note(Eight), spacer(Quarter.size)],
        }),
        spacer(),
    ]);

    delta(part.insert(Quarter), Eight.size.divide(tripletFactor));
    assert(part, [
        spacer(),
        tuplet({
            index: 3,
            baseNoteValue: Eight,
            complete: true,
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

    delta(part.insert(Quarter), Quarter.size.divide(quintupletFactor));
    assert(part, [
        spacer(),
        tuplet({
            index: 5,
            baseNoteValue: Eight,
            complete: true,
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
            complete: true,
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
            complete: true,
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
