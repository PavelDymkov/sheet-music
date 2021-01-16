import { not } from "logical-not";

import { Note } from "./note";
import { NoteValue, NoteValueCombination } from "./note-value";

const position = Symbol("position");
const item = Symbol("item");
const itemPosition = Symbol("itemPosition");

export class Part {
    readonly cursor = new PartCursor(this);

    [position] = 0;
    [item]: PartItem = new PartItemSpacer();
    [itemPosition] = 0;

    get item(): PartItemNotes | null {
        return this[item] instanceof PartItemNotes
            ? (this[item] as PartItemNotes)
            : null;
    }

    insert(noteValue: NoteValue): PartItemNotes {
        const newItemNotes = new PartItemNotes(noteValue);
        const newItemSpacer = new PartItemSpacer();

        let nextItem: PartItemSpacer;

        if (this[item] instanceof PartItemNotes) {
            nextItem = this[item][next] as PartItemSpacer;

            this[position] = this[itemPosition] =
                this[itemPosition] + this[item][value].size;
        } else {
            nextItem = this[item] as PartItemSpacer;

            const delta = this[position] - this[itemPosition];

            newItemSpacer[value].size += delta;
            nextItem[value].size -= delta;

            this[itemPosition] = this[position];
        }

        const prevItem = nextItem[prev];

        nextItem[value].shrink(noteValue);

        link(prevItem, newItemSpacer);
        link(newItemSpacer, newItemNotes);
        link(newItemNotes, nextItem);

        return (this[item] = newItemNotes);
    }

    remove(): void {
        if (this[item] instanceof PartItemNotes) {
            const nextItem = this[item][next];
            const prevItem = this[item][prev];

            unlink(this[item]);

            this[item] = prevItem as PartItemSpacer;
            this[position] = this[itemPosition];
            this[itemPosition] -= this[item][value].size;

            link(prevItem, nextItem);
        }
    }

    expand(noteValues: NoteValueCombination): NoteValueCombination {
        if (this[item] instanceof PartItemNotes) {
            const restSize =
                noteValues.size - (this[position] - this[itemPosition]);

            if (restSize > 0) {
                const restNoteValues = NoteValueCombination.fromNumber(
                    restSize,
                );
                const nextItem = this[item][next] as PartItemSpacer;

                nextItem[value].size += restNoteValues.size;

                return restNoteValues;
            }
        }

        if (this[item] instanceof PartItemSpacer) {
            this[item][value].size += noteValues.size;

            return noteValues;
        }

        return NoteValueCombination.fromNumber(0);
    }

    shrink(noteValues: NoteValueCombination): NoteValueCombination {
        if (this[item] instanceof PartItemNotes) {
            const restSize =
                noteValues.size - (this[position] - this[itemPosition]);

            if (restSize > 0) {
                const restNoteValues = NoteValueCombination.fromNumber(
                    restSize,
                );
                const prevItem = this[item][prev] as PartItemSpacer;

                prevItem[value].size += restNoteValues.size;

                return restNoteValues;
            }
        }

        if (this[item] instanceof PartItemSpacer) {
            this[item][value].size += noteValues.size;

            return noteValues;
        }

        return NoteValueCombination.fromNumber(0);
    }
}

function link(prevItem: PartItem | null, nextItem: PartItem | null): void {
    if (
        prevItem instanceof PartItemSpacer &&
        nextItem instanceof PartItemSpacer
    ) {
        (prevItem as PartItemSpacer)[
            value
        ].size += (nextItem as PartItemSpacer)[value].size;

        link(prevItem, nextItem[next]);
        unlink(nextItem);
    } else {
        if (prevItem) prevItem[next] = nextItem;
        if (nextItem) nextItem[prev] = prevItem;
    }
}

function unlink(item: PartItem): void {
    if (item[prev]) (item[prev] as PartItem)[next] = null;
    if (item[next]) (item[next] as PartItem)[prev] = null;

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

export class PartCursor {
    constructor(private part: Part) {}

    forward(noteValues: NoteValueCombination): void {
        moveForward(this.part, noteValues.size);
    }

    backward(noteValues: NoteValueCombination): void {
        moveBackward(this.part, noteValues.size);
    }

    next(): NoteValueCombination {
        const { part } = this;

        const currentSize = part[item][value].size;
        const delta = currentSize - (part[position] - part[itemPosition]);

        moveForward(part, delta);

        return NoteValueCombination.fromNumber(delta);
    }

    prev(): NoteValueCombination {
        const { part } = this;

        const delta = part[position] - part[itemPosition];

        moveBackward(part, delta);

        return NoteValueCombination.fromNumber(delta);
    }
}

function moveForward(part: Part, delta: number): void {
    if (
        delta === 0 &&
        part[item] instanceof PartItemSpacer &&
        part[item][value].size === 0 &&
        part[item][next]
    ) {
        part[item] = part[item][next] as PartItem;
    }

    if (delta > 0) {
        const currentItem = part[item];
        const nextItem = currentItem[next];
        const nextPosition = part[itemPosition] + currentItem[value].size;

        if (part[position] + delta < nextPosition) {
            part[position] += delta;
        } else if (nextItem) {
            part[position] = part[itemPosition] = nextPosition;
            part[item] = nextItem;

            delta = Math.max(delta - (nextPosition - part[position]), delta);

            moveForward(part, delta);
        } else {
            part[position] = part[itemPosition] + part[item][value].size;
        }
    }
}

function moveBackward(part: Part, delta: number, didJump = false): void {
    if (
        delta === 0 &&
        part[item] instanceof PartItemSpacer &&
        part[item][value].size === 0 &&
        part[item][prev]
    ) {
        part[item] = part[item][prev] as PartItem;
    }

    if (delta > 0) {
        const prevItem = part[item][prev];

        if (part[position] - delta >= part[itemPosition]) {
            part[position] -= delta;

            if (
                part[position] === part[itemPosition] &&
                prevItem &&
                not(didJump)
            ) {
                part[itemPosition] -= prevItem[value].size;
                part[item] = prevItem;
            }
        } else if (prevItem) {
            const currentDecrease = part[position] - part[itemPosition];

            delta -= currentDecrease;

            part[position] -= currentDecrease;
            part[itemPosition] -= prevItem[value].size;
            part[item] = prevItem;

            moveBackward(part, delta, true);
        } else {
            part[position] = part[itemPosition] = 0;
        }
    }
}
