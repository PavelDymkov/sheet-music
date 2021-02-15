import { ok } from "assert";
import { not } from "logical-not";

import {
    Part,
    Node as PartNode,
    Item as PartItem,
    Spacer as PartSpacer,
    IrregularRhythm as PartIrregularRhythm,
    IrregularRhythm,
} from "../../package/lib/part";
import { NoteValue } from "../../package/lib/note-value";
import { Fraction } from "../../package/lib/tools/fraction";

export function partAssertion(part: Part, expect: ExpectedNode[]): void {
    const firstNode = getFirstNode(part.cursor.node);

    for (let node of iterate(firstNode)) {
        if (expect[0] instanceof Cursor) {
            ok(node === part.cursor.node);

            const cursor = expect.shift() as Cursor;

            const [, nodeOffsetKey] = Object.getOwnPropertySymbols(part);

            ok(cursor.offset.compare("=", part[nodeOffsetKey]));
        }

        switch (node.constructor) {
            case PartItem:
                compareItem(node as PartItem, expect.shift() as Note);
                break;
            case PartSpacer:
                compareSpacer(node as PartSpacer, expect.shift() as Spacer);
                break;
            case PartIrregularRhythm:
                compareIrregularRhythm(
                    node as PartIrregularRhythm,
                    expect.shift() as IrregularRhythm,
                );
                break;
        }
    }
}

function getFirstNode(node: PartNode): PartNode {
    if (node.parent) return getFirstNode(node.parent);
    if (node.prev) return getFirstNode(node.prev);

    return node;
}

function* iterate(node: PartNode): Generator<PartNode, void, void> {
    do yield node;
    while ((node = node.next));
}

function compareItem(node: PartItem, expect: Note): void {
    if (not(expect instanceof Note)) ok(false);
}

function compareSpacer(node: PartSpacer, expect: Spacer): void {
    if (not(expect instanceof Spacer)) ok(false);
}

function compareIrregularRhythm(
    node: PartIrregularRhythm,
    expect: IrregularRhythm,
): void {
    if (not(expect instanceof IrregularRhythm)) ok(false);
}

class ExpectedNode {}

class Spacer implements ExpectedNode {
    constructor(readonly size: Fraction) {}
}

class Note implements ExpectedNode {
    constructor(readonly value: NoteValue) {}
}

class Tuplet implements ExpectedNode {
    constructor(readonly index: number, readonly value: NoteValue) {}
}

class Cursor {
    constructor(readonly offset: Fraction) {}
}

export function spacer(size = Fraction.Zero): Spacer {
    return new Spacer(size);
}

export function note(value: NoteValue): Note {
    return new Note(value);
}

export function tuplet(index: number, value: NoteValue): Tuplet {
    return new Tuplet(index, value);
}

export function cursor({ offset = Fraction.Zero } = {}): Cursor {
    return new Cursor(offset);
}
