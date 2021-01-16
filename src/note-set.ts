import { Note } from "./note";
import { NoteValue } from "./note-value";

const value = Symbol();

export class NoteSet {
    readonly notes: Set<Note> = new Set();

    [value]: NoteValue;

    constructor(noteValue: NoteValue) {
        this[value] = noteValue;
    }
}
