import { ok } from "assert";

import { NoteValue } from "../package/lib/note-value";
import { TimeSignature } from "../package/lib/time-signature";

describe("sheet-music/note-value", () => {
    it("should check NoteValue items equality", () => {
        const eight1 = NoteValue.dotted(NoteValue.Eight);
        const eight2 = NoteValue.dotted(NoteValue.Eight);

        ok(eight1 === eight2);
    });

    it("should test NoteValue.fromNumber()", () => {
        ok(
            NoteValue.fromNumber(NoteValue.Eight.size.valueOf()) ===
                NoteValue.Eight,
        );
        ok(NoteValue.fromNumber(0) === NoteValue.fromNumber(-1));
    });

    it("should check NoteValue.split() #1", () => {
        checkSplitted(
            NoteValue.dotted(NoteValue.Quarter).split(
                TimeSignature.fromString("4/4"),
            ),
            [NoteValue.dotted(NoteValue.Quarter)],
        );
    });

    it("should check NoteValue.split() #2", () => {
        checkSplitted(
            NoteValue.dotted(NoteValue.Half).split(
                TimeSignature.fromString("4/4"),
                TimeSignature.fromString("3/4").barValue,
            ),
            [NoteValue.Quarter, NoteValue.Half],
        );
    });

    it("should check NoteValue.split() #3", () => {
        NoteValue.dotted(NoteValue.Whole).split(
            TimeSignature.fromString("4/4"),
            TimeSignature.fromString("3/4").barValue,
        ),
            [NoteValue.Quarter, NoteValue.Whole, NoteValue.Quarter];
    });
});

function checkSplitted(
    actualArray: NoteValue[],
    expectedArray: NoteValue[],
): void {
    ok(actualArray.length === expectedArray.length);

    actualArray.forEach((item, i) => ok(item === expectedArray[i]));
}
