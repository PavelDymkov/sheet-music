// import { ok } from "assert";

// import {
//     Part,
//     PartItem,
//     PartItemNotes,
//     PartItemSpace,
// } from "../package/lib/part";
// import { NoteValue } from "../package/lib/note-value";

// describe("sheet-music/part", () => {
//     it("should check empty part", () => {
//         const [part, contains] = createPart();

//         contains([spacer(), spacer()]);
//     });

//     it("should insert eight note", () => {
//         const [part, contains] = createPart();

//         part.insert(NoteValue.Eight);

//         contains([spacer(), notes(NoteValue.Eight), spacer()]);
//     });
// });

// function createPart(): [Part, (structure: string[]) => void] {
//     const part = new Part();
//     const firstItem = getFirstItem();
//     const [next, value] = getItemSymbols();

//     return [
//         part,
//         (structure: string[]) => {
//             structure = structure.slice();

//             let item = firstItem;

//             do test(item, structure.shift());
//             while ((item = item[next]));

//             console.log(structure);
//             ok(structure.length === 0);
//         },
//     ];

//     function getFirstItem(): PartItem {
//         const symbols = Object.getOwnPropertySymbols(part);

//         for (let i = 0, lim = symbols.length; i < lim; i++) {
//             const item = part[symbols[i]];

//             if (item instanceof PartItem) {
//                 return item;
//             }
//         }
//     }

//     function getItemSymbols(): [symbol, symbol] {
//         let next: symbol;
//         let value: symbol;

//         const symbols = Object.getOwnPropertySymbols(firstItem);

//         for (let i = 0, lim = symbols.length; i < lim; i++) {
//             const symbol = symbols[i];
//             const item = firstItem[symbol];

//             if (item instanceof PartItemSpace) {
//                 next = symbol;
//             }

//             if (typeof item === "number") {
//                 value = symbol;
//             }
//         }

//         return [next, value];
//     }

//     function test(item: PartItem, expect: string): void {
//         if (item instanceof PartItemNotes) {
//             ok(notes(item.value, item.hasDot) === expect);
//         }

//         if (item instanceof PartItemSpace) {
//             ok(spacer(item[value]) === expect);
//         }
//     }
// }

// function spacer(value = 0): string {
//     return `spacer (${value})`;
// }

// function notes(noteValue: NoteValue, dot = false) {
//     return dot ? `${noteValue} + dot` : `${noteValue}`;
// }
