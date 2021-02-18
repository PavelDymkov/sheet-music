import { ok } from "assert";

import { NoteValue } from "../../package/lib/note-value";
import { TimeSignature } from "../../package/lib/time-signature";

describe("sheet-music/time-signature", () => {
    it("should create time signature by constructor", () => {
        const timeSignature = new TimeSignature(4, 4);

        ok(timeSignature.barValue === NoteValue.Whole);
    });

    it("should create time signature by string", () => {
        const timeSignature = TimeSignature.fromString("3/4");

        ok(timeSignature.barValue === NoteValue.dotted(NoteValue.Half));
    });
});
