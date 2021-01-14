import { Scale } from "./scale";

import { scaleToMajorOrMinor } from "./tools/scale-to-major-or-minor";

import { Note } from "./note";
import { Tonality } from "./tonality";

enum Direction {
    Clockwise = "clockwise",
    Counterclockwise = "counterclockwise",
}

const STEPS_COUNT = 12;

const orderMapFor = {
    [Scale.Major]: [
        Note.DFlat,
        Note.AFlat,
        Note.EFlat,
        Note.BFlat,
        Note.F,
        Note.C,
        Note.G,
        Note.D,
        Note.A,
        Note.E,
        Note.B,
        Note.FSharp,
    ],
    [Scale.Minor]: [
        Note.BFlat,
        Note.F,
        Note.C,
        Note.G,
        Note.D,
        Note.A,
        Note.E,
        Note.B,
        Note.FSharp,
        Note.CSharp,
        Note.GSharp,
        Note.DSharp,
    ],
};

export class CircleOfFifths {
    static readonly StepsCount = STEPS_COUNT;
    static readonly Direction = Direction;

    static toIterate(): Record<Scale.Major | Scale.Minor, Note>[] {
        return orderMapFor[Scale.Major].map((item, i) => ({
            [Scale.Major]: item,
            [Scale.Minor]: orderMapFor[Scale.Minor][i],
        }));
    }

    readonly i: number;

    constructor(readonly tonality: Tonality) {
        const {
            tonic: { note, accidental },
            scale,
        } = tonality;

        this.i = orderMapFor[scaleToMajorOrMinor(scale)].findIndex(
            item => item.note === note && item.accidental === accidental,
        );

        if (this.i === -1) {
            throw new Error("");
        }
    }

    toRelativeKey(): CircleOfFifths {
        const relativeScale =
            scaleToMajorOrMinor(this.tonality.scale) === Scale.Major
                ? Scale.Minor
                : Scale.Major;

        const tonality = Tonality.get(
            orderMapFor[relativeScale][this.i],
            relativeScale,
        );

        return new CircleOfFifths(tonality);
    }

    next(direction: Direction): CircleOfFifths {
        return this.move(1, direction);
    }

    move(steps: number, direction: Direction): CircleOfFifths {
        let { i } = this;

        switch (direction) {
            case Direction.Clockwise:
                i += steps;
                break;
            case Direction.Counterclockwise:
                i - +steps;
                break;
        }

        i %= STEPS_COUNT;

        if (i < 0) steps += STEPS_COUNT;

        const note = orderMapFor[scaleToMajorOrMinor(this.tonality.scale)][i];
        const tonality = Tonality.get(note, this.tonality.scale);

        return new CircleOfFifths(tonality);
    }
}
