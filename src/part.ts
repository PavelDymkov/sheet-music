import { Note } from "./note";
import { NoteValue, NoteValueCombination } from "./note-value";

const position = Symbol("position");
const item = Symbol("item");
const itemPosition = Symbol("itemPosition");

export class Part {
    // readonly cursor = new PartCursor(this);

    [position] = 0;
    [item]: PartItem = new PartItemSpacer();
    [itemPosition] = 0;

    get item(): PartItemNotes | null {
        return this[item] instanceof PartItemNotes
            ? (this[item] as PartItemNotes)
            : null;
    }

    insert(noteValue: NoteValue): PartItemNotes {
        let nextItem: PartItemSpacer;

        if (this[item] instanceof PartItemNotes) {
            nextItem = this[item][next] as PartItemSpacer;

            this[position] = this[itemPosition] =
                this[itemPosition] + this[item][value].size;
        } else {
            nextItem = this[item] as PartItemSpacer;

            this[position] = this[itemPosition];
        }

        const prevItem = nextItem[prev];

        nextItem[value].shrink(noteValue);

        const newItemNotes = new PartItemNotes(noteValue);
        const newItemSpacer = new PartItemSpacer();

        link(prevItem, newItemSpacer);
        link(newItemSpacer, newItemNotes);
        link(newItemNotes, nextItem);

        return (this[item] = newItemNotes);
    }

    remove(): void {
        // if (this[item] instanceof PartItemNotes) {
        //     const nextItem = this[item][next];
        //     const prevItem = this[item][prev];
        //     unlink(this[item]);
        //     if (prevItem)
        //         this[position] = this[itemPosition] = prevItem
        //             ? this[itemPosition] - prevItem[value]
        //             : 0;
        //     link(prevItem, nextItem);
        //     this[item] = prevItem ? prevItem : new PartItemSpacer();
        // }
    }

    expand(noteValue: NoteValue): void {}
}

function link(prevItem: PartItem | null, nextItem: PartItem | null): void {
    if (
        prevItem instanceof PartItemSpacer &&
        nextItem instanceof PartItemSpacer &&
        prevItem[prev] &&
        nextItem[next]
    ) {
        (prevItem as PartItemSpacer)[value].merge(
            (nextItem as PartItemSpacer)[value],
        );

        link(prevItem, nextItem[next]);
        unlink(nextItem);
    } else {
        if (prevItem) prevItem[next] = nextItem;
        if (nextItem) nextItem[prev] = prevItem;
    }
}

function unlink(item: PartItem): void {
    item[next] = item[prev] = null;
}

const next = Symbol("next");
const prev = Symbol("prev");
const value = Symbol("value");

export class PartItem {
    [next]: PartItem | null = null;
    [prev]: PartItem | null = null;

    [value]: NoteValueCombination;

    constructor(noteValue?: NoteValue) {
        this[value] = new NoteValueCombination(noteValue);
    }
}

export class PartItemNotes extends PartItem {
    readonly notes: Set<Note> = new Set();

    constructor(noteValue: NoteValue) {
        super(noteValue);
    }
}

export class PartItemSpacer extends PartItem {}

// export class PartCursor {
//     constructor(private part: Part) {}

//     forward(noteValue: NoteValueName, dot = false): void {
//         const delta = noteValueToNumber(noteValue);

//         moveForward(this.part, dot ? delta * 1.5 : delta);
//     }

//     backward(noteValue: NoteValueName, dot = false): void {
//         const delta = noteValueToNumber(noteValue);

//         moveBackward(this.part, dot ? delta * 1.5 : delta);
//     }

//     next(): void {
//         const { part } = this;

//         const nextItem = part[item][next];

//         if (nextItem) {
//             const nextPosition = part[itemPosition] + part[item][value];

//             part[position] = part[itemPosition] = nextPosition;
//             part[item] = nextItem;
//         }
//     }

//     prev(): void {
//         const { part } = this;

//         const prevItem = part[item][prev];

//         if (prevItem) {
//             const nextPosition = part[itemPosition] - prevItem[value];

//             part[position] = part[itemPosition] = nextPosition;
//             part[item] = prevItem;
//         }
//     }
// }

// function moveForward(part: Part, delta: number): void {
//     if (delta > 0) {
//         const currentItem = part[item];
//         const nextItem = currentItem[next];
//         const nextPosition = part[itemPosition] + currentItem[value];

//         if (part[position] + delta < nextPosition) {
//             part[position] += delta;
//         } else if (nextItem) {
//             part[position] = part[itemPosition] = nextPosition;
//             part[item] = nextItem;

//             delta = Math.max(delta - (nextPosition - part[position]), delta);

//             moveForward(part, delta);
//         }
//     }
// }

// function moveBackward(part: Part, delta: number): void {
//     if (delta > 0) {
//         const prevItem = part[item][prev];

//         if (part[position] - delta >= part[itemPosition]) {
//             part[position] -= delta;
//         } else if (prevItem) {
//             const currentDecrease = part[position] - part[itemPosition];

//             delta -= currentDecrease;

//             part[position] -= currentDecrease;
//             part[itemPosition] -= prevItem[value];

//             moveBackward(part, delta);
//         } else {
//             part[position] = part[itemPosition] = 0;
//         }
//     }
// }
