import { not } from "logical-not";

import { Note } from "./note";
import { NoteValue } from "./note-value";
import { Tuplet } from "./tuplet";

const position = Symbol("position");
const item = Symbol("item");
const itemPosition = Symbol("itemPosition");

export class Part {
    readonly cursor = new Cursor(this);

    [position] = 0;
    [item] = new Item();
    [itemPosition] = 0;

    get item(): Item {
        return this[item];
    }

    insert(noteValue: NoteValue): NoteValue {
        const prevPosition = this[position];

        const newItem = new Item(noteValue);
        const newItemSpacer = new Item();

        let nextItem: Item;

        if (this[item].isSpacer) {
            nextItem = this[item];

            const delta = this[position] - this[itemPosition];

            nextItem[value] = NoteValue.fromNumber(
                nextItem[value].size - (delta + noteValue.size),
            );
            newItemSpacer[value] = NoteValue.fromNumber(delta);

            this[itemPosition] = this[position];
        } else {
            nextItem = this[item][next] as Item;

            this[position] = this[itemPosition] =
                this[itemPosition] + this[item][value].size;
        }

        const prevItem = nextItem[prev];

        link(prevItem, newItemSpacer);
        link(newItemSpacer, newItem);
        link(newItem, nextItem);

        this[item] = newItem;

        return NoteValue.fromNumber(this[position] - prevPosition);
    }

    remove(): NoteValue {
        if (not(this[item].isSpacer)) {
            const prevPosition = this[position];

            const nextItem = this[item][next];
            const prevItem = this[item][prev];

            unlink(this[item]);

            this[item] = prevItem as Item;
            this[position] = this[itemPosition];
            this[itemPosition] -= this[item][value].size;

            link(prevItem, nextItem);

            return NoteValue.fromNumber(this[position] - prevPosition);
        }

        return NoteValue.fromNumber(0);
    }
}

function link(prevItem: Item | null, nextItem: Item | null): void {
    if (prevItem?.isSpacer && nextItem?.isSpacer) {
        prevItem[value] = NoteValue.fromNumber(
            prevItem[value].size + nextItem[value].size,
        );

        link(prevItem, nextItem[next]);
        unlink(nextItem);
    } else {
        if (prevItem) prevItem[next] = nextItem;
        if (nextItem) nextItem[prev] = prevItem;
    }
}

function unlink(item: Item): void {
    if (item[prev]) (item[prev] as Item)[next] = null;
    if (item[next]) (item[next] as Item)[prev] = null;

    item[next] = item[prev] = null;
}

const next = Symbol("next");
const prev = Symbol("prev");
const value = Symbol("value");
const tuplet = Symbol("tuplet");
const index = Symbol("index");

export class Item {
    [next]: Item | null = null;
    [prev]: Item | null = null;

    [tuplet]: Note[][] = [];
    [index]: number = 0;

    [value]: NoteValue;

    get isSpacer(): boolean {
        return this[tuplet].length === 0;
    }

    get value(): NoteValue {
        return this[value];
    }

    get tuplet(): Tuplet {
        const instance = new Tuplet(this[value], this[tuplet].length);

        this[tuplet].forEach((noteSet, i) => {
            noteSet.forEach(note => {
                instance.insertNote(note, i);
            });
        });

        return instance;
    }

    constructor(noteValue = NoteValue.fromNumber(0)) {
        this[value] = noteValue;

        if (noteValue.size > 0) this[tuplet] = [[]];
    }
}

export class Cursor {
    constructor(private part: Part) {}

    forward(noteValue: NoteValue): void {
        moveForward(this.part, noteValue.size);
    }

    backward(noteValue: NoteValue): void {
        moveBackward(this.part, noteValue.size);
    }

    next(): NoteValue {
        const { part } = this;

        const prevPosition = part[position];
        const currentSize = part[item][value].size;
        const delta = currentSize - (part[position] - part[itemPosition]);

        moveForward(part, delta);

        return NoteValue.fromNumber(part[position] - prevPosition);
    }

    prev(): NoteValue {
        const { part } = this;

        const prevPosition = part[position];
        const delta = part[position] - part[itemPosition];

        moveBackward(part, delta);

        return NoteValue.fromNumber(part[position] - prevPosition);
    }

    insertNote(note: Note): void {
        const partItem = this.part[item];

        if (not(partItem.isSpacer)) {
            const notes = partItem[tuplet][partItem[index]];

            if (notes.every(item => not(item.isEqual(note)))) {
                notes.push(note);
            }
        }
    }

    removeNote(note: Note): void {
        const partItem = this.part[item];

        if (not(partItem.isSpacer)) {
            const notes = partItem[tuplet][partItem[index]];
            const i = notes.findIndex(item => item.isEqual(note));

            notes.splice(i, 1);
        }
    }

    changeNoteValue(noteValue: NoteValue): void {
        const partItem = this.part[item];

        if (not(partItem.isSpacer)) {
            partItem[value] = noteValue;
        }
    }

    setTupletIndex(index_: number): void {
        const partItem = this.part[item];

        if (not(partItem.isSpacer)) {
            for (let i = 0, lim = Tuplet.verify(index_); i < lim; i++) {
                partItem[tuplet][i] = partItem[tuplet][i] || [];
            }

            if (partItem[index] >= partItem[tuplet].length) {
                partItem[index] = partItem[tuplet].length - 1;
            }
        }
    }
}

function moveForward(part: Part, delta: number): void {
    if (
        delta === 0 &&
        part[item].isSpacer &&
        part[item][value].size === 0 &&
        part[item][next]
    ) {
        part[item] = part[item][next] as Item;
    }

    if (delta > 0) {
        const currentItem = part[item];
        const nextItem = currentItem[next];
        const nextPosition = part[itemPosition] + currentItem.value.size;

        if (part[position] + delta < nextPosition) {
            part[position] += delta;
        } else if (nextItem) {
            const nextDelta = delta - (nextPosition - part[position]);

            delta = nextDelta >= 0 ? nextDelta : delta;

            part[position] = part[itemPosition] = nextPosition;
            part[item] = nextItem;

            moveForward(part, delta);
        } else {
            part[item][value] = part[item][value].expand(
                NoteValue.fromNumber(delta - currentItem.value.size),
            );
            part[position] = part[itemPosition] + part[item][value].size;
        }
    }
}

function moveBackward(part: Part, delta: number, didJump = false): void {
    if (
        delta === 0 &&
        part[item].isSpacer &&
        part[item][value].size === 0 &&
        part[item][prev]
    ) {
        part[item] = part[item][prev] as Item;
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
                part[itemPosition] -= prevItem.value.size;
                part[item] = prevItem;
            }
        } else if (prevItem) {
            const currentDecrease = part[position] - part[itemPosition];

            delta -= currentDecrease;

            part[position] -= currentDecrease;
            part[itemPosition] -= prevItem.value.size;
            part[item] = prevItem;

            moveBackward(part, delta, true);
        } else {
            part[position] = part[itemPosition] = 0;
        }
    }
}
