import { not } from "logical-not";

import { TimeSignature } from "./time-signature";
import { Fraction } from "./tools/fraction";

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
const noteValueNameSizeMap = {
    toNumber: {} as Record<NoteValueName, number>,
    toFraction: {} as Record<NoteValueName, Fraction>,
};

noteValueNames.forEach((noteValueName, i) => {
    const n = Math.pow(2, i + 1);

    noteValueNameSizeMap.toNumber[noteValueName] = n;
    noteValueNameSizeMap.toFraction[noteValueName] = Fraction.create(n, 1);
});

const oneAndHalf = Fraction.create(3, 2);

const token = Symbol();
const set = Symbol("set");
const sizeCache = Symbol("sizeCache");

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
                const maxSize = noteValueNameSizeMap.toNumber[maxNoteValueName];

                let counter = size;

                while (counter >= maxSize) {
                    instance[set].push(maxNoteValueName);

                    counter -= maxSize;
                }

                for (let i = noteValueNames.length - 2; i >= 0; i--) {
                    const current = noteValueNames[i];
                    const currentSize = noteValueNameSizeMap.toNumber[current];

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
        return NoteValue.fromNumber(
            noteValue.size.multiply(oneAndHalf).valueOf(),
        );
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
    [sizeCache]: Fraction;

    get size(): Fraction {
        if (not(this[sizeCache])) {
            this[sizeCache] = this[set].reduce(
                (size, noteValueName) =>
                    size.add(noteValueNameSizeMap.toFraction[noteValueName]),
                Fraction.Zero,
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

    private constructor(_: symbol) {
        if (_ !== token) throw new Error("Illegal constructor");
    }

    split(timeSignature: TimeSignature, offset?: NoteValue): NoteValue[] {
        const array: NoteValue[] = [];

        const barSize = timeSignature.barValue.size;

        let size = barSize.subtract(offset ? offset.size : Fraction.Zero);
        let currentNoteValue = NoteValue.fromNumber(0);

        this[set].forEach(noteValueName => {
            let currentSize = noteValueNameSizeMap.toFraction[noteValueName];

            if (currentSize.compare("<=", size)) {
                size = size.subtract(currentSize);

                currentNoteValue = fromFraction(
                    currentNoteValue.size.add(currentSize),
                );
            } else {
                array.push(fromFraction(currentNoteValue.size.add(size)));

                currentSize = currentSize.subtract(size);

                while (currentSize > barSize) {
                    array.push(fromFraction(barSize));

                    currentSize = currentSize.subtract(barSize);
                }

                size = barSize.subtract(currentSize);
                currentNoteValue = fromFraction(currentSize);
            }
        });

        if (array[array.length - 1] !== currentNoteValue) {
            array.push(currentNoteValue);
        }

        return array;
    }
}

function create(noteValueName: NoteValueName): NoteValue {
    return NoteValue.fromNumber(noteValueNameSizeMap.toNumber[noteValueName]);
}

function indexOf(noteValueName: NoteValueName): number {
    return noteValueNames.indexOf(noteValueName);
}

function fromFraction(source: Fraction): NoteValue {
    return NoteValue.fromNumber(source.valueOf());
}
