// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { type Character, CharType } from './Character.ts';
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
            case CharType.SingleQuote:
                return Transition.BeginString(StringState, CharType.SingleQuote);
            case CharType.DoubleQuote:
                return Transition.BeginString(StringState, CharType.DoubleQuote);
            case CharType.Backtick:
                return Transition.BeginString(StringState, CharType.Backtick);

            // Whitespace
            case CharType.Whitespace:
                return Transition.To(WhitespaceState);
            case CharType.NewLine:
                return Transition.To(NewLineState);

            // Letters
            case CharType.Letter:
                return Transition.To(LetterState);

            // Numbers
            case CharType.Number:
                return Transition.To(NumberState);

            // Hexadecimal
            case CharType.Hash:
                return Transition.To(HexState);
            
            // Percent
            case CharType.Percent:
                return Transition.To(PercentState);

            // All single-character tokens
            case CharType.Comma:
            case CharType.LParen:
            case CharType.RParen:
            case CharType.LBracket:
            case CharType.RBracket:
            case CharType.LBrace:
            case CharType.RBrace:
            case CharType.SemiColon:
            case CharType.Dot:
            case CharType.Plus:
            case CharType.Minus:
            case CharType.Star:
            case CharType.Slash:
            case CharType.EqualSign:
            case CharType.GreaterThan:
            case CharType.LessThan:
            case CharType.Exclamation:
            case CharType.Question:
            case CharType.Colon:
            case CharType.Caret:
            case CharType.Ampersand:
            case CharType.Pipe:
            case CharType.Tilde:
            case CharType.At:
            case CharType.Dollar:
            case CharType.Underscore:
            case CharType.Symbol:
                return Transition.To(SingleCharState);

            case CharType.BackSlash:
            case CharType.Unicode:
                return Transition.To(SymbolState);

            case CharType.Other:
                return Transition.To(SingleCharState);

            case CharType.EOF:
                return Transition.To(EndState);

            case CharType.Error:
                return Transition.To(EndState);

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
            case CharType.Whitespace:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
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
        return Transition.EmitAndTo(InitialState);
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
            case CharType.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
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
            case CharType.Percent:
                return Transition.ToContinue(PercentState);
            case CharType.Letter:
                return Transition.ToContinue(DimensionState);
            case CharType.Number:
            case CharType.Dot:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
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
            case CharType.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
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
            case CharType.Hash:
            case CharType.Letter:
            case CharType.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
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
            case CharType.BackSlash:
                return Transition.EscapeNext(StringState);

            case CharType.SingleQuote:
            case CharType.DoubleQuote:
            case CharType.Backtick:
                return Transition.EndString(InitialState);

            case CharType.EOF:
            case CharType.NewLine:
                return Transition.EmitAndTo(InitialState);

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
        return Transition.EmitAndTo(InitialState);
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
        return Transition.EmitAndTo(InitialState);
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
            case CharType.Unicode:
            case CharType.BackSlash:
            case CharType.At:
            case CharType.Dollar:
            case CharType.Underscore:
            case CharType.Symbol:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
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