import { Accidental } from "./accidental";
import { NoteName } from "./note-name";
import { Octave } from "./octave";

export class Note {
    static readonly CFlat = new Note(NoteName.C, Accidental.Flat);
    static readonly C = new Note(NoteName.C);
    static readonly CSharp = new Note(NoteName.C, Accidental.Sharp);

    static readonly DFlat = new Note(NoteName.D, Accidental.Flat);
    static readonly D = new Note(NoteName.D);
    static readonly DSharp = new Note(NoteName.D, Accidental.Sharp);

    static readonly EFlat = new Note(NoteName.E, Accidental.Flat);
    static readonly E = new Note(NoteName.E);
    static readonly ESharp = new Note(NoteName.E, Accidental.Sharp);

    static readonly FFlat = new Note(NoteName.F, Accidental.Flat);
    static readonly F = new Note(NoteName.F);
    static readonly FSharp = new Note(NoteName.F, Accidental.Sharp);

    static readonly GFlat = new Note(NoteName.G, Accidental.Flat);
    static readonly G = new Note(NoteName.G);
    static readonly GSharp = new Note(NoteName.G, Accidental.Sharp);

    static readonly AFlat = new Note(NoteName.A, Accidental.Flat);
    static readonly A = new Note(NoteName.A);
    static readonly ASharp = new Note(NoteName.A, Accidental.Sharp);

    static readonly BFlat = new Note(NoteName.B, Accidental.Flat);
    static readonly B = new Note(NoteName.B);
    static readonly BSharp = new Note(NoteName.B, Accidental.Sharp);

    constructor(
        readonly note: NoteName,
        readonly accidental = Accidental.Natural,
        readonly octave: Octave = 0,
        readonly ghost = false,
    ) {}

    isEqual(note: Note): boolean {
        return (
            this.note === note.note &&
            this.accidental === note.accidental &&
            this.octave === note.octave
        );
    }
}
