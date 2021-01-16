import { not } from "logical-not";

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

const noteValueNameSizeMap = {} as Record<NoteValueName, number>;

noteValueNames.forEach(
    (noteValueName, i) =>
        (noteValueNameSizeMap[noteValueName] = Math.pow(2, i + 1)),
);

type NoteValueCache = Record<NoteValueName, NoteValue[]>;

const cache = {} as NoteValueCache;
const token = Symbol();
const value = Symbol();

export class NoteValue {
    static dotted(noteValue: NoteValue): NoteValue {
        return create(noteValue[value], true);
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

    [value]: NoteValueName;

    constructor(
        readonly dotted: boolean,
        noteValueName: NoteValueName,
        _: symbol,
    ) {
        if (_ !== token) {
            throw new Error("Illegal constructor");
        }

        this[value] = noteValueName;
    }
}

function create(noteValueName: NoteValueName, dotted = false): NoteValue {
    if (not(cache[noteValueName])) {
        cache[noteValueName] = [];
    }

    const i = dotted ? 1 : 0;

    if (not(cache[noteValueName][i])) {
        cache[noteValueName][i] = new NoteValue(dotted, noteValueName, token);
    }

    return cache[noteValueName][i];
}

function split(source: NoteValue): NoteValue[] {
    const sourceNoteValueName = source[value];
    const combination = [create(sourceNoteValueName)] as NoteValue[];

    if (source.dotted && sourceNoteValueName !== noteValueNames[0]) {
        const prevName = noteValueNames[indexOf(sourceNoteValueName) - 1];

        combination.push(create(prevName));
    }

    return combination;
}

const combo = Symbol();
const sizeCache = Symbol();

export class NoteValueCombination {
    static fromNumber(size: number): NoteValueCombination {
        const instance = new NoteValueCombination();

        if (size > 0) {
            const maxNoteValueName = noteValueNames[noteValueNames.length - 1];
            const maxSize = noteValueNameSizeMap[maxNoteValueName];

            while (size >= maxSize) {
                instance[combo].push(maxNoteValueName);

                size -= maxSize;
            }

            for (let i = noteValueNames.length - 2; i >= 0; i--) {
                const current = noteValueNames[i];
                const currentSize = noteValueNameSizeMap[current];

                if (size >= currentSize) {
                    instance[combo].push(current);

                    size -= currentSize;
                }
            }
        }

        return instance;
    }

    [combo]: NoteValueName[] = [];
    [sizeCache]: number = -1;

    get size(): number {
        if (this[sizeCache] === -1) {
            this[sizeCache] = this[combo].reduce(
                (size, noteValueName) =>
                    size + noteValueNameSizeMap[noteValueName],
                0,
            );
        }

        return this[sizeCache];
    }

    set size(value: number) {
        const temp = NoteValueCombination.fromNumber(value);

        this[combo] = temp[combo];
        this[sizeCache] = -1;
    }

    constructor(initial?: NoteValue) {
        if (initial) {
            this[combo] = split(initial).map(
                ({ [value]: noteValueName }) => noteValueName,
            );
        }
    }

    expand(noteValue: NoteValue): void {
        split(noteValue).forEach(({ [value]: noteValueName }) => {
            expand(this[combo], noteValueName);
        });

        this[sizeCache] = -1;
    }

    shrink(noteValue: NoteValue): void {
        split(noteValue).forEach(({ [value]: noteValueName }) => {
            shrink(this[combo], noteValueName);
        });

        this[sizeCache] = -1;
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
                array.push(create(sorted[i], true));

                i += 1;
            } else {
                array.push(create(sorted[i]));
            }
        }

        return array;
    }
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
