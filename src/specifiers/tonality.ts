import { Specifier } from "./specifier";

import { Note } from "../note";
import { Scale } from "../scale";

export class SpecifierTonality extends Specifier {
    constructor(readonly tonic: Note, readonly scale: Scale) {
        super();
    }
}
