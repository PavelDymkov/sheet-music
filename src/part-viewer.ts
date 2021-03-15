import { Part, PartTuplet, PartNoteSet, PartItem, PartSpacer } from "./part";

export function view(part: Part): void {
    const firstNode = getFirstNode(part.cursor.item);

    iterate(getTopLevelItems(firstNode), "", part.cursor.item);
}

function getFirstNode(node: PartItem): PartItem {
    if (node.prev) return getFirstNode(node.prev);
    if (node.parent) return getFirstNode(node.parent);

    return node;
}

function getTopLevelItems(node: PartItem): PartItem[] {
    return node.next ? [node].concat(getTopLevelItems(node.next)) : [node];
}

function iterate(
    items: PartItem[],
    offset: string,
    currentNode: PartItem,
): void {
    items.forEach(node => {
        const prefix = (node === currentNode ? "> " : "  ") + offset;

        switch (node.constructor) {
            case PartNoteSet:
                log(`note   (${toNoteValue(node as PartNoteSet)})`);
                break;
            case PartSpacer:
                log(`spacer (${(node as PartSpacer).duration.valueOf()})`);
                break;
            case PartTuplet:
                scope: {
                    const tuplet = node as PartTuplet;
                    const size = toNoteValue(node as PartNoteSet);

                    log(`tuplet (${tuplet.index} = ${size})`);

                    iterate(tuplet.children, offset + "    ", currentNode);
                }
                break;
        }

        function log(message: string): void {
            console.log(`${prefix}${message}`);
        }
    });
}

function toNoteValue(node: PartNoteSet): string {
    const value = node.noteValue.size.valueOf();

    switch (value) {
        case 16:
            return "Eight";
        case 32:
            return "Quarter";
        case 64:
            return "Half";
        default:
            return `${value}`;
    }
}
