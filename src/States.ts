// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { type Character, CharType } from './Character.ts';
import { Transition } from './Transition';

abstract class State {
    public name: string;

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

    constructor(name: string = 'State') {
        this.name = name;
    }

    public toString(): string {
        return `\t${inspect(this, this.inspectOptions)}`;
    }

    public abstract handle(char: Character): Transition;
}

class Initial_State extends State {
    public isAccepting: boolean = false;

    private constructor() {
        super('InitialState');
    }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.SingleQuote:
                return Transition.BeginString(StringState, CharType.SingleQuote);
            
            case CharType.DoubleQuote:
                return Transition.BeginString(StringState, CharType.DoubleQuote);

            case CharType.Whitespace:
                return Transition.To(WhitespaceState);

            case CharType.Letter:
                return Transition.To(LetterState);

            case CharType.Number:
                return Transition.To(NumberState);

            case CharType.Hash:
                return Transition.To(HexState);

            case CharType.Percent:
                return Transition.To(PercentState);

            case CharType.Comma:
            case CharType.Slash:
            case CharType.LParen:
            case CharType.RParen:
            case CharType.Plus:
            case CharType.Minus:
            case CharType.Star:
                return Transition.To(SingleCharState);

            case CharType.Tilde:
            case CharType.Exclamation:
            case CharType.At:
            case CharType.Dollar:
            case CharType.Question:
            case CharType.Caret:
            case CharType.Ampersand:
            case CharType.LessThan:
            case CharType.GreaterThan:
            case CharType.Underscore:
            case CharType.EqualSign:
            case CharType.LBracket:
            case CharType.RBracket:
            case CharType.LBrace:
            case CharType.RBrace:
            case CharType.SemiColon:
            case CharType.Colon:
            case CharType.Pipe:
            case CharType.Symbol:
                return Transition.To(SymbolState);

            case CharType.Other:
            case CharType.EOF:
            case CharType.Error:
                return Transition.To(EndState);

            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('WhitespaceState');
    }

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

    constructor() {
        super('HexState');
    }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new NewLine_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.NewLine:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('LetterState');
    }

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

    constructor() {
        super('NumberState');
    }

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

    constructor() {
        super('UnitState');
    }

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

    constructor() {
        super('HexState');
    }

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

    constructor() {
        super('StringState');
    }

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

    constructor() {
        super('PercentState');
    }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Percent:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class SingleChar_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('SingleCharState');
    }

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

    constructor() {
        super('SymbolState');
    }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Symbol_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch(char.type) {
            case CharType.Plus:
            case CharType.Minus:
            case CharType.Star:
            case CharType.EqualSign:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class End_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('EndState');
    }

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