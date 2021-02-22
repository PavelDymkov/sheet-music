import FractionJs from "fraction.js";
import not from "logical-not";

const token = Symbol();
const value = Symbol();

export class Fraction {
    static create(numerator: number, denominator: number): Fraction {
        return Object.assign(new Fraction(token), {
            [value]: new FractionJs(numerator, denominator),
        });
    }

    static greatestCommonDivisor(fractions: Fraction[]): Fraction {
        return fractions.reduce((current, item) =>
            current.greatestCommonDivisor(item),
        );
    }

    static Zero = Fraction.create(0, 1);

    [value]: FractionJs;

    constructor(_: symbol) {
        if (_ !== token) {
            throw new Error(
                `use create(numerator: number, denominator: number) for get instance of Fraction`,
            );
        }
    }

    add(fraction: Fraction): Fraction {
        return Object.assign(new Fraction(token), {
            [value]: this[value].add(fraction[value]),
        });
    }

    subtract(fraction: Fraction): Fraction {
        return Object.assign(new Fraction(token), {
            [value]: this[value].sub(fraction[value]),
        });
    }

    multiply(fraction: Fraction): Fraction {
        return Object.assign(new Fraction(token), {
            [value]: this[value].mul(fraction[value]),
        });
    }

    divide(fraction: Fraction): Fraction {
        return Object.assign(new Fraction(token), {
            [value]: this[value].div(fraction[value]),
        });
    }

    compare(
        operator: ">" | ">=" | "=" | "!=" | "<" | "<=",
        fraction: Fraction,
    ): boolean {
        if (operator === "!=") return not(this.compare("=", fraction));

        const result = this[value].compare(fraction[value]);

        switch (operator) {
            case ">":
                return result > 0;
            case ">=":
                return result >= 0;
            case "=":
                return result === 0;
            case "<":
                return result < 0;
            case "<=":
                return result <= 0;
        }
    }

    floor(): number {
        return this[value].floor().valueOf();
    }

    ceiling(): number {
        return this[value].ceil().valueOf();
    }

    // max(fraction: Fraction): Fraction {
    //     return this.compare(">=", fraction) ? this : fraction;
    // }

    // min(fraction: Fraction): Fraction {
    //     return this.compare("<=", fraction) ? this : fraction;
    // }

    negative(): Fraction {
        return Object.assign(new Fraction(token), {
            [value]: this[value].neg(),
        });
    }

    // leastCommonMultiple(fraction: Fraction): Fraction {
    //     return Object.assign(new Fraction(token), {
    //         [value]: this[value].lcm(fraction[value]),
    //     });
    // }

    greatestCommonDivisor(fraction: Fraction): Fraction {
        return Object.assign(new Fraction(token), {
            [value]: this[value].gcd(fraction[value]),
        });
    }

    valueOf(): number {
        return this[value].valueOf();
    }
}
