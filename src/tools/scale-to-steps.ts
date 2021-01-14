import { Scale } from "../scale";
import { Step } from "../step";

const s = Step.Semitone;
const t = Step.Tone;

const map: Record<Scale, Step[]> = {
    [Scale.Major]: [t, t, s, t, t, t, s],
    [Scale.MajorHarmonic]: [],
    [Scale.MajorMelodic]: [],

    [Scale.Minor]: [t, s, t, t, s, t, t],
    [Scale.MinorHarmonic]: [],
    [Scale.MinorMelodic]: [t, s, t, t, t, t, s],

    [Scale.Mixolydian]: [t, t, s, t, t, s, t],
    [Scale.Lydian]: [t, t, t, s, t, t, s],
    [Scale.Phrygian]: [s, t, t, t, s, t, t],
    [Scale.Dorian]: [t, s, t, t, t, s, t],
    [Scale.Locrian]: [s, t, t, s, t, t, t],

    [Scale.PhrygianRaisedSixth]: [s, t, t, t, t, s, t],
    [Scale.LydianRaisedFifth]: [t, t, t, t, s, t, s],
    [Scale.Acoustic]: [t, t, t, s, t, s, t],
    [Scale.MajorMinor]: [t, t, s, t, s, t, t],
    [Scale.HalfDiminished]: [t, s, t, s, t, t, t],
    [Scale.Altered]: [s, t, s, t, t, t, t],
    [Scale.Neapolitan]: [s, t, t, t, s, t + s, s],
    [Scale.Gypsy]: [s, t + s, s, t, s, t + s],
    [Scale.Hungarian]: [t, s, t + s, s, s, t + s, s],
    [Scale.PhrygianDominant]: [s, t + s, s, t, s, t, t],
    [Scale.Enigmatic]: [s, t + s, t, t, t, s, s],

    // Hexatonic scale
    [Scale.WholeTone]: [t, t, t, t, t, t],
    [Scale.Synthetic]: [t, t, t, t + s, s, t],
    [Scale.Augmented]: [t + s, s, t + s, s, t + s, s],
    [Scale.Prometheus]: [t, t, t, t + s, s, t],
    [Scale.Blues]: [t + t, t, s, s, t + t],
    [Scale.Tritone]: [s, t + s, t, s, t + s, t],
    [Scale.SymmetricTriton]: [s, s, t + t, s, s, t + t],
    [Scale.Istrian]: [s, t, s, t, s, t + t + s],

    // Pentatonic scale

    [Scale.Pentatonic]: [t + s, t, t, t, t + s],

    // Octatonic, https://en.wikipedia.org/wiki/Octatonic_scale

    [Scale.Diminished]: [s, t, s, t, s, t, s, t],
    // Chromatic

    [Scale.Chromatic]: [s, s, s, s, s, s, s, s, s, s, s, s],
};

export function scaleToSteps(scale: Scale): Step[] {
    return map[scale];
}
