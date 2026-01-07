// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import Char, { type Character } from '../src/Character.ts';
import { Transition } from './Transition';

abstract class State {
    public abstract isAccepting: boolean;

    protected inspectOptions: InspectOptions = {
        showHidden: true,
        depth: null,
        colors: true,
        customInspect: false,
        showProxy: false,
        maxArrayLength: null,
        maxStringLength: null,
        breakLength: 100,
        compact: true,
        sorted: false,
        getters: false,
        numericSeparator: true,
    };

    public toString(): string {
        return `\t${inspect(this, this.inspectOptions)}`;
    }

    public abstract handle(char: Character): Transition;
}

class Initial_State extends State {
    public isAccepting: boolean = false;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            // String delimiters
            case Char.Type.SingleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.SingleQuote);
            case Char.Type.DoubleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.DoubleQuote);
            case Char.Type.Backtick:
                return Transition.BeginString(String_State.instance, Char.Type.Backtick);

            // Whitespace
            case Char.Type.Whitespace:
                return Transition.To(Whitespace_State.instance);
            case Char.Type.NewLine:
                return Transition.To(NewLine_State.instance);

            // Letters
            case Char.Type.Letter:
                return Transition.To(Letter_State.instance);

            // Numbers
            case Char.Type.Number:
                return Transition.To(Number_State.instance);

            // Hexadecimal
            case Char.Type.Hash:
                return Transition.To(Hex_State.instance);

            // All single-character tokens
            case Char.Type.Comma:
            case Char.Type.LParen:
            case Char.Type.RParen:
            case Char.Type.LBracket:
            case Char.Type.RBracket:
            case Char.Type.LBrace:
            case Char.Type.RBrace:
            case Char.Type.SemiColon:
            case Char.Type.Dot:
            case Char.Type.Plus:
            case Char.Type.Minus:
            case Char.Type.Star:
            case Char.Type.Slash:
            case Char.Type.EqualSign:
            case Char.Type.GreaterThan:
            case Char.Type.LessThan:
            case Char.Type.Exclamation:
            case Char.Type.Question:
            case Char.Type.Colon:
            case Char.Type.Caret:
            case Char.Type.Ampersand:
            case Char.Type.Pipe:
            case Char.Type.Tilde:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.BackSlash:
            case Char.Type.Unicode:
                return Transition.To(Symbol_State.instance);

            case Char.Type.Other:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.EOF:
                return Transition.To(End_State.instance);

            case Char.Type.Error:
                return Transition.To(End_State.instance);

            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Whitespace_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Whitespace:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class NewLine_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new NewLine_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Number_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Number:
            case Char.Type.Dot:
                return Transition.Stay();

            case Char.Type.Percent:
                return Transition.ToContinue(Percent_State.instance);

            case Char.Type.Letter:
                return Transition.ToContinue(Dimension_State.instance);

            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Dimension_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Dimension_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Hex_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Hex_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Hash:
            case Char.Type.Hex:
            case Char.Type.Letter:
            case Char.Type.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class String_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new String_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.BackSlash:
                return Transition.EscapeNext(String_State.instance);

            case Char.Type.SingleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.SingleQuote);

            case Char.Type.DoubleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.DoubleQuote);

            case Char.Type.Backtick:
                return Transition.EndString(Initial_State.instance, Char.Type.Backtick);

            case Char.Type.EOF:
            case Char.Type.NewLine:
                return Transition.EmitAndTo(Initial_State.instance);

            default:
                return Transition.Stay();
        }
    }
}

class Percent_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class SingleChar_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new SingleChar_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class Symbol_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Symbol_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Unicode:
            case Char.Type.BackSlash:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class End_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.Stay();
    }
}

const InitialState = Initial_State.instance;
const WhitespaceState = Whitespace_State.instance;
const NewLineState = NewLine_State.instance;
const LetterState = Letter_State.instance;
const NumberState = Number_State.instance;
const DimensionState = Dimension_State.instance;
const HexState = Hex_State.instance;
const StringState = String_State.instance;
const PercentState = Percent_State.instance;
const SingleCharState = SingleChar_State.instance;
const SymbolState = Symbol_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhitespaceState,
    NewLineState,
    LetterState,
    NumberState,
    DimensionState,
    HexState,
    StringState,
    PercentState,
    SingleCharState,
    SymbolState,
    EndState,
    State,
}