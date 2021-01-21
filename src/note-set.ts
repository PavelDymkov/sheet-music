import not from "logical-not";
import { Note } from "./note";

const notes = Symbol();

export class NoteSet {
    readonly [notes]: Note[] = [];

    get notes(): Note[] {
        return this[notes].slice();
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
