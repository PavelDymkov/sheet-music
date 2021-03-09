import { not } from "logical-not";

import { Accidental } from "../accidental";
import { NoteName } from "../note-name";
import { Scale } from "../scale";

import { Note } from "../note";
import { Tonality } from "../tonality";

import { scaleToMajorOrMinor } from "./scale-to-major-or-minor";

type AcceptedAccidental =
    | Accidental.Flat
    | Accidental.Natural
    | Accidental.Sharp;

const AcceptedAccidentalList: AcceptedAccidental[] = [
    Accidental.Flat,
    Accidental.Natural,
    Accidental.Sharp,
];

const sharpNotes = [
    Note.FSharp,
    Note.CSharp,
    Note.GSharp,
    Note.DSharp,
    Note.ASharp,
    Note.ESharp,
    Note.BSharp,
];

const flatNotes = [
    Note.BFlat,
    Note.EFlat,
    Note.AFlat,
    Note.DFlat,
    Note.GFlat,
    Note.CFlat,
    Note.FFlat,
];

const keySignaturesMap: Record<
    NoteName,
    Record<AcceptedAccidental, Record<Scale.Major | Scale.Minor, number>>
> = {
    [NoteName.A]: {
        [Accidental.Natural]: {
            [Scale.Major]: 3,
            [Scale.Minor]: 0,
        },
        [Accidental.Sharp]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 7,
        },
        [Accidental.Flat]: {
            [Scale.Major]: -4,
            [Scale.Minor]: 7,
        },
    },
    [NoteName.B]: {
        [Accidental.Natural]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Sharp]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Flat]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
    },
    [NoteName.C]: {
        [Accidental.Natural]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Sharp]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Flat]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
    },
    [NoteName.D]: {
        [Accidental.Natural]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Sharp]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Flat]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
    },
    [NoteName.E]: {
        [Accidental.Natural]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Sharp]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Flat]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
    },
    [NoteName.F]: {
        [Accidental.Natural]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Sharp]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Flat]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
    },
    [NoteName.G]: {
        [Accidental.Natural]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Sharp]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
        [Accidental.Flat]: {
            [Scale.Major]: 0,
            [Scale.Minor]: 0,
        },
    },
};

function getAcceptedAccidental(tonality: Tonality): AcceptedAccidental {
    const accidental = tonality.tonic.accidental as AcceptedAccidental;

    if (not(AcceptedAccidentalList.includes(accidental))) {
        throw new Error("");
    }

    return accidental;
}

export function tonalityKeySignature(tonality: Tonality): Note[] {
    const accidental = getAcceptedAccidental(tonality);
    const scale = scaleToMajorOrMinor(tonality.scale);

    const i = keySignaturesMap[tonality.tonic.noteName][accidental][scale];

    if (i === 0) return [];

    const source = i > 0 ? sharpNotes : flatNotes;

    return source.splice(0, Math.abs(i));
}
