import { not } from "logical-not";

import { Articulation, Ornament } from "./articulation";
import { InstrumentSpecificNotation } from "./instrument-specific-notation";
import { NoteValue } from "./note-value";
import { Note } from "./note";

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

    get noteValue(): NoteValue {
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

    toggle(note: Note): void {
        const i = this[notes].findIndex(item => item.isEqual(note));

        if (i === -1) this[notes].push(note);
        else this[notes].splice(i, 1);
    }

    clone(noteValue: NoteValue): NoteSet {
        const copy = new NoteSet(noteValue, this[specifier]);

        this.notes.forEach(note => copy.insert(note));

        return copy;
    }
}
