import { NoteSet } from "./note-set";
import { NoteValue } from "./note-value";

const items = Symbol();
const index = Symbol();

export class Tuplet {
    readonly [items]: (NoteSet | Tuplet)[];
    readonly [index]: number;

    get items(): (NoteSet | Tuplet)[] {
        return [...this[items]];
    }

    get index(): number {
        return this[index];
    }

    get irregular(): boolean {
        const exponent = Math.log2(this[index]);

        return exponent === Math.floor(exponent);
    }

    constructor(sourceItems: (NoteSet | Tuplet)[], rhythmIndex = 1) {
        this[items] = sourceItems;
        this[index] = rhythmIndex > 1 ? Math.floor(rhythmIndex) : 1;
    }

    at(i: number): NoteSet | Tuplet {
        return this[items][i] || new NoteSet(NoteValue.create());
    }
}
