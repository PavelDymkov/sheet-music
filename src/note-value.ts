import { not } from "logical-not";

import { TimeSignature } from "./time-signature";

enum NoteValueName {
    Maxima = "maxima",
    Longa = "longa",
    DoubleWhole = "double-whole",
    Whole = "whole",
    Half = "half",
    Quarter = "quarter",
    Eight = "eight",
    Sixteenth = "sixteenth",
    ThirtySecond = "thirty-second",
    SixtyFourth = "sixty-fourth",
}

const noteValueNames = [
    NoteValueName.SixtyFourth,
    NoteValueName.ThirtySecond,
    NoteValueName.Sixteenth,
    NoteValueName.Eight,
    NoteValueName.Quarter,
    NoteValueName.Half,
    NoteValueName.Whole,
    NoteValueName.DoubleWhole,
    NoteValueName.Longa,
    NoteValueName.Maxima,
];

const noteValueCache = {} as Record<number, NoteValue>;
const noteValueNameSizeMap = {} as Record<NoteValueName, number>;

noteValueNames.forEach(
    (noteValueName, i) =>
        (noteValueNameSizeMap[noteValueName] = Math.pow(2, i + 1)),
);

const token = Symbol();
const set = Symbol();
const sizeCache = Symbol();

export class NoteValue {
    static create(): NoteValue {
        return NoteValue.fromNumber(0);
    }

    static fromNumber(size: number): NoteValue {
        if (size < 0) size = 0;

        if (not(size in noteValueCache)) {
            if (size === 0) {
                noteValueCache[0] = new NoteValue(token);
            } else {
                const instance = new NoteValue(token);

                const maxNoteValueName =
                    noteValueNames[noteValueNames.length - 1];
                const maxSize = noteValueNameSizeMap[maxNoteValueName];

                let counter = size;

                while (counter >= maxSize) {
                    instance[set].push(maxNoteValueName);

                    counter -= maxSize;
                }

                for (let i = noteValueNames.length - 2; i >= 0; i--) {
                    const current = noteValueNames[i];
                    const currentSize = noteValueNameSizeMap[current];

                    if (counter >= currentSize) {
                        instance[set].push(current);

                        counter -= currentSize;
                    }
                }

                if (counter > 0) {
                    size -= counter;
                }

                if (not(size in noteValueCache)) {
                    noteValueCache[size] = instance;
                }
            }
        }

        return noteValueCache[size];
    }

    static dotted(noteValue: NoteValue): NoteValue {
        return NoteValue.fromNumber(noteValue.size * 1.5);
    }

    static Maxima = create(NoteValueName.Maxima);
    static Longa = create(NoteValueName.Longa);
    static DoubleWhole = create(NoteValueName.DoubleWhole);
    static Whole = create(NoteValueName.Whole);
    static Half = create(NoteValueName.Half);
    static Quarter = create(NoteValueName.Quarter);
    static Eight = create(NoteValueName.Eight);
    static Sixteenth = create(NoteValueName.Sixteenth);
    static ThirtySecond = create(NoteValueName.ThirtySecond);
    static SixtyFourth = create(NoteValueName.SixtyFourth);

    [set]: NoteValueName[] = [];
    [sizeCache]: number = -1;

    get size(): number {
        if (this[sizeCache] === -1) {
            this[sizeCache] = this[set].reduce(
                (size, noteValueName) =>
                    size + noteValueNameSizeMap[noteValueName],
                0,
            );
        }

        return this[sizeCache];
    }

    get dotted(): boolean {
        return (
            this[set].length === 2 &&
            Math.abs(indexOf(this[set][0]) - indexOf(this[set][1])) === 1
        );
    }

    constructor(_: symbol) {
        if (_ !== token) {
            throw new Error("Illegal constructor");
        }
    }

    expand(noteValue: NoteValue): NoteValue {
        return NoteValue.fromNumber(this.size + noteValue.size);
    }

    shrink(noteValue: NoteValue): NoteValue {
        return NoteValue.fromNumber(this.size - noteValue.size);
    }

    split(timeSignature: TimeSignature, offset?: NoteValue): NoteValue[] {
        const array: NoteValue[] = [];

        const barSize = timeSignature.barValue.size;

        let size = barSize - (offset ? offset.size : 0);
        let currentNoteValue = NoteValue.fromNumber(0);

        this[set].forEach(noteValueName => {
            let currentSize = noteValueNameSizeMap[noteValueName];

            if (currentSize <= size) {
                size -= currentSize;

                currentNoteValue = currentNoteValue.expand(
                    NoteValue.fromNumber(currentSize),
                );
            } else {
                array.push(currentNoteValue.expand(NoteValue.fromNumber(size)));

                currentSize -= size;

                while (currentSize > barSize) {
                    array.push(NoteValue.fromNumber(barSize));

                    currentSize -= barSize;
                }

                size = barSize - currentSize;

                currentNoteValue = NoteValue.fromNumber(currentSize);
            }
        });

        if (array[array.length - 1] !== currentNoteValue) {
            array.push(currentNoteValue);
        }

        return array;
    }
}

function create(noteValueName: NoteValueName): NoteValue {
    return NoteValue.fromNumber(noteValueNameSizeMap[noteValueName]);
}

function indexOf(noteValueName: NoteValueName): number {
    return noteValueNames.indexOf(noteValueName);
}
