import { ok } from "assert";

import {
    Part,
    PartItem,
    PartNoteSet,
    PartSpacer,
    PartTuplet,
    PartTupletState,
} from "../../package/part";
import { NoteValue } from "../../package/note-value";
import { Fraction } from "../../package/tools/fraction";

export function partAssertion(part: Part, expect: ExpectedNode[]): void {
    const comparator = new Comparator(part);

    comparator.compare(expect);
}

class Comparator {
    constructor(private readonly part: Part) {}

    compare(expectArray: ExpectedNode[]): void {
        expectArray = [...expectArray];

        let node = this.getFirstNode(this.part.cursor.item);

        do {
            if (this.checkCursor(node, expectArray[0])) expectArray.shift();

            this.compareNode(node, expectArray.shift());
        } while ((node = node.next));

        ok(expectArray.length === 0, "33");
    }

    private getFirstNode(node: PartItem): PartItem {
        if (node.parent) return this.getFirstNode(node.parent);
        if (node.prev) return this.getFirstNode(node.prev);

        return node;
    }

    private checkCursor(node: PartItem, mayBeCursor: ExpectedNode): boolean {
        if (mayBeCursor instanceof Cursor) {
            ok(node === this.part.cursor.item, "45");

            const [, nodeOffsetKey] = Object.getOwnPropertySymbols(this.part);

            ok(mayBeCursor.offset.compare("=", this.part[nodeOffsetKey]), "49");

            return true;
        }

        return false;
    }

    private compareNode(node: PartItem, expect: ExpectedNode): void {
        switch (node.constructor) {
            case PartNoteSet:
                this.compareNoteSet(node as PartNoteSet, expect as Note);
                break;
            case PartSpacer:
                this.compareSpacer(node as PartSpacer, expect as Spacer);
                break;
            case PartTuplet:
                this.compareIrregularRhythm(
                    node as PartTuplet,
                    expect as Tuplet,
                );
                break;
        }
    }

    private compareNoteSet(node: PartNoteSet, expect: Note): void {
        ok(expect instanceof Note, "75");
        ok(node.noteValue === expect.value, "76");
    }

    private compareSpacer(node: PartSpacer, expect: Spacer): void {
        ok(expect instanceof Spacer, "80");
        ok(node.duration.compare("=", expect.size), "81");
    }

    private compareIrregularRhythm(node: PartTuplet, expect: Tuplet): void {
        ok(expect instanceof Tuplet, "88");
        ok(node.index === expect.index, "89");
        ok(node.baseNoteValue === expect.baseNoteValue, "90");
        ok(node.state === expect.state, "91");

        const expectedChildren = [...expect.children];

        for (let childNode of node.iterate()) {
            if (this.checkCursor(childNode, expectedChildren[0]))
                expectedChildren.shift();

            this.compareNode(childNode, expectedChildren.shift());
        }

        ok(expectedChildren.length === 0, "");
    }
}

class ExpectedNode {}

class Spacer implements ExpectedNode {
    constructor(readonly size: Fraction) {}
}

class Note implements ExpectedNode {
    constructor(readonly value: NoteValue) {}
}

class Tuplet implements ExpectedNode {
    constructor(
        readonly index: number,
        readonly baseNoteValue: NoteValue,
        readonly state: PartTupletState,
        readonly children: ExpectedNode[],
    ) {}
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

export function tuplet({
    index,
    baseNoteValue,
    state,
    children,
}: {
    index: number;
    baseNoteValue: NoteValue;
    state: PartTupletState;
    children: ExpectedNode[];
}): Tuplet {
    return new Tuplet(index, baseNoteValue, state, children);
}

export function cursor({ offset = Fraction.Zero } = {}): Cursor {
    return new Cursor(offset);
}
