import { not } from "logical-not";

export enum NoteValueName {
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

const noteValueNameSizeMap = {} as Record<NoteValueName, number>;

noteValueNames.forEach(
    (noteValueName, i) =>
        (noteValueNameSizeMap[noteValueName] = Math.pow(2, i + 1)),
);

type NoteValueCache = Record<NoteValueName, NoteValue[]>;

const cache = {} as NoteValueCache;
const token = Symbol();

export class NoteValue {
    static get(name: NoteValueName, hasDot = false): NoteValue {
        if (not(cache[name])) {
            cache[name] = [];
        }

        const i = hasDot ? 1 : 0;

        if (not(cache[name][i])) {
            cache[name][i] = new NoteValue(name, hasDot, token);
        }

        return cache[name][i];
    }

    static Maxima = NoteValue.get(NoteValueName.Maxima);
    static Longa = NoteValue.get(NoteValueName.Longa);
    static DoubleWhole = NoteValue.get(NoteValueName.DoubleWhole);
    static Whole = NoteValue.get(NoteValueName.Whole);
    static Half = NoteValue.get(NoteValueName.Half);
    static Quarter = NoteValue.get(NoteValueName.Quarter);
    static Eight = NoteValue.get(NoteValueName.Eight);
    static Sixteenth = NoteValue.get(NoteValueName.Sixteenth);
    static ThirtySecond = NoteValue.get(NoteValueName.ThirtySecond);
    static SixtyFourth = NoteValue.get(NoteValueName.SixtyFourth);

    constructor(
        readonly noteValueName: NoteValueName,
        readonly hasDot: boolean,
        _: symbol,
    ) {
        if (_ !== token) {
            throw new Error(
                `use NoteValue.get(name: NoteValueName, hasDot?: boolean) for get instance of NoteValue`,
            );
        }
    }

    split(): NoteValue[] {
        const combination = [this] as NoteValue[];

        if (this.hasDot && this.noteValueName !== noteValueNames[0]) {
            const prevName = noteValueNames[indexOf(this.noteValueName) - 1];

            combination.push(NoteValue.get(prevName));
        }

        return combination;
    }
}

const combo = Symbol();

export class NoteValueCombination {
    [combo]: NoteValueName[] = [];

    get size(): number {
        return this[combo].reduce(
            (size, noteValueName) => size + noteValueNameSizeMap[noteValueName],
            0,
        );
    }

    constructor(initial?: NoteValue) {
        if (initial) {
            this[combo] = initial
                .split()
                .map(({ noteValueName }) => noteValueName);
        }
    }

    expand(noteValue: NoteValue): void {
        noteValue.split().forEach(({ noteValueName }) => {
            expand(this[combo], noteValueName);
        });
    }

    shrink(noteValue: NoteValue): void {
        noteValue.split().forEach(({ noteValueName }) => {
            shrink(this[combo], noteValueName);
        });
    }

    toArray(): NoteValue[] {
        const sorted: NoteValueName[] = [];

        this[combo].forEach(item => {
            const itemIndex = indexOf(item);

            for (let i = 0, lim = sorted.length; i <= lim; i++) {
                if (i === lim) {
                    sorted.push(item);
                } else {
                    const currentIndex = indexOf(sorted[i]);

                    if (itemIndex > currentIndex) {
                        sorted.splice(i, 0, item);

                        break;
                    }
                }
            }
        });

        const array: NoteValue[] = [];

        for (let i = 0, lim = sorted.length; i < lim; i++) {
            if (
                i + 1 < lim &&
                indexOf(sorted[i]) - indexOf(sorted[i + 1]) === 1
            ) {
                array.push(NoteValue.get(sorted[i], true));

                i += 1;
            } else {
                array.push(NoteValue.get(sorted[i]));
            }
        }

        return array;
    }

    merge(combination: NoteValueCombination): void {}
}

function expand(array: NoteValueName[], item: NoteValueName): void {
    const i = array.indexOf(item);

    if (i === -1 || item === noteValueNames[noteValueNames.length - 1]) {
        array.push(item);
    } else {
        array.splice(i, 1);

        const double = noteValueNames[indexOf(item) + 1];

        expand(array, double);
    }
}

function shrink(array: NoteValueName[], item: NoteValueName): void {
    const i = array.indexOf(item);

    if (i !== -1) {
        array.splice(i, 1);
    } else {
        const nameIndex = indexOf(item);

        let closestIndex = -1;

        for (let j = 0, lim = array.length; j < lim; j++) {
            const currentIndex = indexOf(array[j]);

            if (currentIndex === nameIndex + 1) {
                closestIndex = currentIndex;

                break;
            }

            if (currentIndex > nameIndex) {
                closestIndex = Math.max(closestIndex, currentIndex);
            }
        }

        if (closestIndex === -1) {
            array.length = 0;
        } else {
            array.splice(array.indexOf(noteValueNames[closestIndex]));

            while (--closestIndex >= nameIndex) {
                expand(array, noteValueNames[closestIndex]);
            }
        }
    }
}

function indexOf(noteValueName: NoteValueName): number {
    return noteValueNames.indexOf(noteValueName);
}
