import { SheetMusic } from "../sheet-music";
import { Staff } from "../staff";

export abstract class Specifier {
    abstract readonly target: typeof SheetMusic | typeof Staff;
}
