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

    set index(index: number) {
        if (tupletIndexes.indexOf(index) === -1) {
            throw new TypeError();
        }

        const nextItems: NoteSet[] = [];

        for (let i = 0, lim = index; i < lim; i++) {
            nextItems.push(this.items[i] || new NoteSet());
        }

        this[items] = nextItems;
    }

    constructor(noteValue: NoteValue, index = 1) {
        this[value] = noteValue;

        this.index = index;
    }

    changeValue(noteValue: NoteValue): Tuplet {
        const copy = new Tuplet(noteValue, this.index);

        copy[items] = this[items];

        return copy;
    }

    increase(): void {
        const next = tupletIndexes[this[items].length];

        if (next) this.index = next;
    }

    decrease(): void {
        const next = tupletIndexes[this[items].length] - 2;

        if (next) this.index = next;
    }
}
