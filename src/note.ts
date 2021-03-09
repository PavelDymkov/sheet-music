import { Accidental } from "./accidental";
import { NoteName } from "./note-name";
import { Octave } from "./octave";

export class Note {
    static readonly CFlat = create(NoteName.C, Accidental.Flat);
    static readonly C = create(NoteName.C);
    static readonly CSharp = create(NoteName.C, Accidental.Sharp);

    static readonly DFlat = create(NoteName.D, Accidental.Flat);
    static readonly D = create(NoteName.D);
    static readonly DSharp = create(NoteName.D, Accidental.Sharp);

    static readonly EFlat = create(NoteName.E, Accidental.Flat);
    static readonly E = create(NoteName.E);
    static readonly ESharp = create(NoteName.E, Accidental.Sharp);

    static readonly FFlat = create(NoteName.F, Accidental.Flat);
    static readonly F = create(NoteName.F);
    static readonly FSharp = create(NoteName.F, Accidental.Sharp);

    static readonly GFlat = create(NoteName.G, Accidental.Flat);
    static readonly G = create(NoteName.G);
    static readonly GSharp = create(NoteName.G, Accidental.Sharp);

    static readonly AFlat = create(NoteName.A, Accidental.Flat);
    static readonly A = create(NoteName.A);
    static readonly ASharp = create(NoteName.A, Accidental.Sharp);

    static readonly BFlat = create(NoteName.B, Accidental.Flat);
    static readonly B = create(NoteName.B);
    static readonly BSharp = create(NoteName.B, Accidental.Sharp);

    readonly noteName!: NoteName;
    readonly accidental: Accidental = Accidental.Natural;
    readonly octave: Octave = Octave.SubSubContra;
    readonly ghost: boolean = false;

    constructor(params: {
        noteName: NoteName;
        accidental?: Accidental;
        octave?: Octave;
        ghost?: boolean;
    }) {
        Object.assign(this, params);
    }

    isEqual(note: Note): boolean {
        return (
            this.noteName === note.noteName &&
            this.accidental === note.accidental &&
            this.octave === note.octave
        );
    }
}

function create(
    noteName: NoteName,
    accidental: Accidental = Accidental.Natural,
): Note {
    return new Note({ noteName, accidental });
}
