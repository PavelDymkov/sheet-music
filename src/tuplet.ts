import { not } from "logical-not";

import { Note } from "./note";
import { NoteSet } from "./note-set";
import { NoteValue } from "./note-value";

const tupletIndexes: number[] = [1];

for (let i = 3, lim = 17; i <= lim; i++) {
    const exponent = Math.log2(i);

    if (exponent !== Math.floor(exponent)) {
        tupletIndexes.push(i);
    }
}

const items = Symbol();
const value = Symbol();

export class Tuplet {
    static verify(index: number): number {
        return tupletIndexes[index + 1] || -1;
    }

    [items]: NoteSet[] = [];
    [value]: NoteValue;

    get items(): NoteSet[] {
        return [...this[items]];
    }

    get value(): NoteValue {
        return this[value];
    }

    get index(): number {
        return tupletIndexes[this[items].length - 1];
    }

    constructor(noteValue: NoteValue, index = 1) {
        this[value] = noteValue;

        if (tupletIndexes.indexOf(index) === -1) {
            index = 1;
        }

        for (let i = 0, lim = index; i < lim; i++) {
            this[items].push(new NoteSet());
        }
    }

    insertNote(note: Note, index: number): void {
        const noteSet = this[items][index];

        if (noteSet && noteSet instanceof NoteSet) {
            noteSet.insert(note);
        }
    }

    removeNote(note: Note, index: number): void {
        const noteSet = this[items][index];

        if (noteSet && noteSet instanceof NoteSet) {
            noteSet.remove(note);
        }
    }

    copy(noteValue: NoteValue): Tuplet {
        const copy = new Tuplet(noteValue, this.index);

        copy[items] = this[items];

        return copy;
    }
}
