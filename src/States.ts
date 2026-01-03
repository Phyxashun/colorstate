// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
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
            case CharType.Start:
                return Transition.Stay();

            case CharType.Whitespace:
                return Transition.To(WhitespaceState);

            case CharType.NewLine:
                return Transition.To(NewLineState);

            case CharType.Letter:
                return Transition.To(LetterState);

            case CharType.Number:
                return Transition.To(NumberState);

            case CharType.Hash:
                return Transition.To(HexState);

            case CharType.Percent:
            case CharType.Comma:
            case CharType.Slash:
            case CharType.LParen:
            case CharType.RParen:
                return Transition.To(SingleCharState);

            case CharType.Operator:
                return Transition.To(OperatorState);

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
            case CharType.Number:
                return Transition.Stay();
            case CharType.Percent:
                return Transition.ToContinue(PercentState);
            case CharType.Letter:
                return Transition.To(UnitState);
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class Unit_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('UnitState');
    }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Unit_State();
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

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(InitialState);
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

class Operator_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('OperatorState');
    }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Operator_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Operator:
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
const UnitState = Unit_State.instance;
const HexState = Hex_State.instance;
const PercentState = Percent_State.instance;
const SingleCharState = SingleChar_State.instance;
const OperatorState = Operator_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhitespaceState,
    NewLineState,
    LetterState,
    NumberState,
    UnitState,
    HexState,
    PercentState,
    SingleCharState,
    OperatorState,
    EndState,
    State,
}