import { Specifier } from "./specifier";

import { TimeSignature } from "../time-signature";

export class SpecifierTimeSignature extends Specifier {
    constructor(readonly timeSignature: TimeSignature) {
        super();
    }
}
