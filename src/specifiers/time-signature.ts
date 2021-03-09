import { Specifier } from "./specifier";

import { SheetMusic } from "../sheet-music";
import { TimeSignature } from "../time-signature";

export class SpecifierTimeSignature extends Specifier {
    readonly target = SheetMusic;

    constructor(readonly timeSignature: TimeSignature) {
        super();
    }
}
