// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
import { Transition } from './Transition';

abstract class State {
    public name: string = 'State';
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

    constructor(name: string) {
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
                return Transition.To(new Whitespace_State());
            case CharType.NewLine:
                return Transition.To(new NewLine_State());
            case CharType.Letter:
                return Transition.To(new Letter_State());
            case CharType.Number:
                return Transition.To(new Number_State());
            case CharType.Operator:
                return Transition.To(new Operator_State());
            case CharType.Other:
            case CharType.EOF:
            case CharType.Error:
            default:
                return Transition.To(new End_State());
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
            default:
                return Transition.EmitAndTo(InitialState);
        }
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
const OperatorState = Operator_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhitespaceState,
    NewLineState,
    LetterState,
    NumberState,
    OperatorState,
    EndState,
    State,
}