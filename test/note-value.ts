import { ok } from "assert";

import {
    NoteValue,
    NoteValueName,
    NoteValueCombination,
} from "../package/lib/note-value";

describe("sheet-music/note-value", () => {
    it("should check NoteValue for all note value names", () => {
        Object.keys(NoteValueName).forEach(noteValueName => {
            ok(noteValueName in NoteValue);
        });
    });

    it("should check NoteValue items equality", () => {
        ok(NoteValue.get(NoteValueName.Quarter) === NoteValue.Quarter);

        const eight1 = NoteValue.get(NoteValueName.Eight, true);
        const eight2 = NoteValue.get(NoteValueName.Eight, true);

        ok(eight1 === eight2);
    });

    it("should check NoteValueCombination.toArray()", () => {
        const combination = new NoteValueCombination(NoteValue.Half);
        const array = combination.toArray();

        ok(
            Array.isArray(array) &&
                array.length === 1 &&
                array[0] === NoteValue.Half,
        );
    });

    it("should check NoteValueCombination.expand()", () => {
        const combination1 = new NoteValueCombination(NoteValue.Half);

        combination1.expand(NoteValue.Eight);

        combinationTester(combination1, [NoteValue.Half, NoteValue.Eight]);

        const combination2 = new NoteValueCombination(NoteValue.Half);

        combination2.expand(NoteValue.Quarter);

        combinationTester(combination2, [
            NoteValue.get(NoteValueName.Half, true),
        ]);
    });

    it("should check NoteValueCombination.shrink()", () => {
        const combination1 = new NoteValueCombination(NoteValue.Half);

        combination1.shrink(NoteValue.Quarter);

        combinationTester(combination1, [NoteValue.Quarter]);

        const combination2 = new NoteValueCombination(NoteValue.Half);

        combination2.shrink(NoteValue.Eight);

        combinationTester(combination2, [
            NoteValue.get(NoteValueName.Quarter, true),
        ]);
    });

    it("should check combining of note values #1", () => {
        const combination = new NoteValueCombination(NoteValue.Half);

        combination.expand(NoteValue.Quarter);
        combination.expand(NoteValue.Eight);
        combination.expand(NoteValue.Eight);

        combinationTester(combination, [NoteValue.Whole]);
    });

    it("should check combining of note values #2", () => {
        const combination = new NoteValueCombination(NoteValue.Maxima);

        combination.expand(NoteValue.Longa);
        combination.expand(NoteValue.Longa);

        combinationTester(combination, [NoteValue.Maxima, NoteValue.Maxima]);
    });

    it("should check combining of note values #3", () => {
        const combination = new NoteValueCombination(NoteValue.Eight);

        combination.expand(NoteValue.Half);
        combination.expand(NoteValue.Sixteenth);
        combination.expand(NoteValue.Quarter);

        combinationTester(combination, [
            NoteValue.get(NoteValueName.Half, true),
            NoteValue.get(NoteValueName.Eight, true),
        ]);
    });

    // it("should check combining of note values #", () => {});
});

function combinationTester(
    combination: NoteValueCombination,
    expectedArray: NoteValue[],
): void {
    const array = combination.toArray();

    ok(array.length === expectedArray.length);

    array.forEach((item, i) => {
        ok(item === expectedArray[i]);
    });
}
