import { Specifier } from "./specifier";

import { Note } from "../note";
import { Scale } from "../scale";
import { SheetMusic } from "../sheet-music";

export class SpecifierTonality extends Specifier {
    readonly target = SheetMusic;

    constructor(readonly tonic: Note, readonly scale: Scale) {
        super();
    }
}
