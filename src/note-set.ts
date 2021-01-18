import { Note } from "./note";
import { NoteValue } from "./note-value";

const value = Symbol();

export class NoteSet {
    readonly notes: Set<Note> = new Set();

    [value]: NoteValue;

    get value(): NoteValue {
        return this[value];
    }

    constructor(noteValue: NoteValue) {
        this[value] = noteValue;
    }
}
