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
        ok(NoteValue.fromNumber(NoteValue.Eight.size) === NoteValue.Eight);
        ok(NoteValue.fromNumber(0) === NoteValue.fromNumber(-1));
    });

    it("should check NoteValue.expand()", () => {
        consistsOf(NoteValue.Half.expand(NoteValue.Eight), [
            NoteValue.Half,
            NoteValue.Eight,
        ]);
        consistsOf(NoteValue.Half.expand(NoteValue.Quarter), [
            NoteValue.dotted(NoteValue.Half),
        ]);
    });

    it("should check NoteValue.shrink()", () => {
        consistsOf(NoteValue.Half.shrink(NoteValue.Quarter), [
            NoteValue.Quarter,
        ]);
        consistsOf(NoteValue.Half.shrink(NoteValue.Eight), [
            NoteValue.dotted(NoteValue.Quarter),
        ]);
    });

    it("should check NoteValue.size getter", () => {
        ok(
            NoteValue.Half.shrink(NoteValue.Quarter).size ===
                NoteValue.Quarter.size,
        );
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

    it("should check combining of note values #1", () => {
        const noteValue = NoteValue.Half.expand(NoteValue.Quarter)
            .expand(NoteValue.Eight)
            .expand(NoteValue.Eight);

        consistsOf(noteValue, [NoteValue.Whole]);
    });

    it("should check combining of note values #2", () => {
        const noteValue = NoteValue.Maxima.expand(NoteValue.Longa).expand(
            NoteValue.Longa,
        );

        consistsOf(noteValue, [NoteValue.Maxima, NoteValue.Maxima]);
    });

    it("should check combining of note values #3", () => {
        const noteValue = NoteValue.Eight.expand(NoteValue.Half)
            .expand(NoteValue.Sixteenth)
            .expand(NoteValue.Quarter);

        consistsOf(noteValue, [
            NoteValue.dotted(NoteValue.Half),
            NoteValue.dotted(NoteValue.Eight),
        ]);
    });

    // it("should check combining of note values #", () => {});
});

function consistsOf(noteValue: NoteValue, expectedArray: NoteValue[]): void {
    const expectedSize = expectedArray.reduce(
        (sum, item) => sum + item.size,
        0,
    );

    ok(noteValue.size === expectedSize);
}

function checkSplitted(
    actualArray: NoteValue[],
    expectedArray: NoteValue[],
): void {
    ok(actualArray.length === expectedArray.length);

    actualArray.forEach((item, i) => ok(item === expectedArray[i]));
}
