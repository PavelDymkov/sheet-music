import { not } from "logical-not";

import { NoteValue } from "./note-value";

const lowerMap: Record<number, NoteValue> = {
    4: NoteValue.Quarter,
    8: NoteValue.Eight,
    16: NoteValue.Sixteenth,
};

const barValue = Symbol();

export class TimeSignature {
    static fromString(source: string): TimeSignature | null {
        const [upper, lower] = String(source)
            .split("/")
            .map(item => Number(item));

        return upper && lower ? new TimeSignature(upper, lower) : null;
    }

    readonly upper: number[];
    readonly lower: NoteValue;

    [barValue]: NoteValue | null = null;

    get barValue(): NoteValue {
        if (not(this[barValue])) {
            const size = this.upper.reduce(
                (rest, item) => this.lower.size.valueOf() * item + rest,
                0,
            );

            this[barValue] = NoteValue.fromNumber(size);
        }

        return this[barValue] as NoteValue;
    }

    constructor(upperSource: number | number[], lowerSource: number) {
        this.upper =
            typeof upperSource === "number" ? [upperSource] : upperSource;

        if (not(lowerSource in lowerMap)) {
            throw new TypeError(`invalid lower value`);
        }

        this.lower = lowerMap[lowerSource];
    }
}
