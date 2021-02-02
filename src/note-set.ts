import { not } from "logical-not";

import { Articulation, Ornament } from "./articulation";
import { InstrumentSpecificNotation } from "./instrument-specific-notation";
import { Note } from "./note";
import { NoteValue } from "./note-value";

const notes = Symbol();
const duration = Symbol();
const specifier = Symbol();

export class NoteSet {
    readonly [notes]: Note[] = [];
    readonly [duration]: NoteValue;
    readonly [specifier]: Articulation | Ornament | InstrumentSpecificNotation;

    get notes(): Note[] {
        return this[notes].slice();
    }

    get value(): NoteValue {
        return this[duration];
    }

    constructor(
        noteValue: NoteValue,
        marker?: Articulation | Ornament | InstrumentSpecificNotation,
    ) {
        this[duration] = noteValue;

        if (marker) this[specifier] = marker;
    }

    insert(note: Note): void {
        if (this[notes].every(item => not(item.isEqual(note)))) {
            this[notes].push(note);
        }
    }

    remove(note: Note): void {
        const i = this[notes].findIndex(item => item.isEqual(note));

        this[notes].splice(i, 1);
    }
}
