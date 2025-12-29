// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
import { Context } from './Context.ts'

abstract class State {
    private inspectOptions: InspectOptions = {
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
    public context!: Context;

    public setContext(context: Context) {
        this.context = context;
    }

    public toString(): string {
        return `\n\t${inspect(this, this.inspectOptions)} \n`;
    }

    public abstract handle(char: Character): void;
    public abstract isAccepting(): boolean;
} // End abstract class State


class Initial_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        switch (char.type) {
            case CharType.Whitespace:
                this.context.transitionTo(Whitespace_State.instance);
                break;
            case CharType.EOF:
                this.context.transitionTo(End_State.instance);
                break;
            case CharType.Hash:
                this.context.transitionTo(Hex_State.instance);
                break;
            case CharType.Operator:
                this.context.transitionTo(Operator_State.instance);
                break;
            case CharType.Letter:
                this.context.transitionTo(Letter_State.instance);
                break;
            case CharType.Number:
                this.context.transitionTo(Number_State.instance);
                break;
            /* istanbul ignore next -- @preserve */
            default:
                this.context.transitionTo(Initial_State.instance);
                break;
        }
    }

    public isAccepting(): boolean {
        return false;
    }
} // End class Initial_State


class Whitespace_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Whitespace_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        if (char.type !== CharType.Whitespace) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
} // End class Whitespace_State


class Hex_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Hex_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        switch (char.type) {
            case CharType.Hash:
            case CharType.Letter:
            case CharType.Number:
                break;
            default:
                this.context.transitionTo(Initial_State.instance);
                break;
        }
    }

    public isAccepting(): boolean {
        return true;
    }
} // End class Operator_State


class Letter_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        if (char.type !== CharType.Letter) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
} // End class Letter_State


class Number_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        switch (char.type) {
            case CharType.Number:
                break;
            case CharType.Percent:
                this.context.transitionTo(Percent_State.instance);
                break;
            default:
                this.context.transitionTo(Initial_State.instance);
                break;
        }
    }

    public isAccepting(): boolean {
        return true;
    }
} // End class Number_State


class Percent_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        /* istanbul ignore if -- @preserve */
        if (char.type !== CharType.Percent) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
} // End class Operator_State


class Operator_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Operator_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        /* istanbul ignore if -- @preserve */
        if (char.type !== CharType.Operator) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
} // End class Operator_State


class End_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        /* istanbul ignore if -- @preserve */
        if (char.type !== CharType.EOF) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
} // End class End_State


// Export instance aliases
const InitialState = Initial_State.instance;
const WhitespaceState = Whitespace_State.instance;
const HexState = Hex_State.instance;
const LetterState = Letter_State.instance;
const NumberState = Number_State.instance;
const PercentState = Percent_State.instance;
const OperatorState = Operator_State.instance;
const EndState = End_State.instance;

export {
    State,
    InitialState,
    WhitespaceState,
    HexState,
    LetterState,
    NumberState,
    PercentState,
    OperatorState,
    EndState,
    Initial_State,
    Whitespace_State,
    Hex_State,
    Letter_State,
    Number_State,
    Percent_State,
    Operator_State,
    End_State,
}