import { not } from "logical-not";

import { Accidental } from "./accidental";
import { NoteName } from "./note-name";
import { Scale } from "./scale";

import { Note } from "./note";

type TonalityCacheLevel1 = Record<NoteName, TonalityCacheLevel2>;
type TonalityCacheLevel2 = Record<Accidental, TonalityCacheLevel3>;
type TonalityCacheLevel3 = Record<Scale, Tonality>;

const cache: TonalityCacheLevel1 = {} as TonalityCacheLevel1;
const token = Symbol();

export class Tonality {
    static get(tonic: Note, scale: Scale): Tonality {
        const { noteName, accidental } = tonic;

        if (not(cache[noteName])) {
            cache[noteName] = {} as TonalityCacheLevel2;
        }

        if (not(cache[noteName][accidental])) {
            cache[noteName][accidental] = {} as TonalityCacheLevel3;
        }

        if (not(cache[noteName][accidental][scale])) {
            cache[noteName][accidental][scale] = new Tonality(
                tonic,
                scale,
                token,
            );
        }

        return cache[noteName][accidental][scale];
    }

    private constructor(
        readonly tonic: Note,
        readonly scale: Scale,
        _: symbol,
    ) {
        if (_ !== token) throw new Error("Illigal constructor");
    }
}
