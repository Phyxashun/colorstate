// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
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

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Whitespace:
                return Transition.To(Whitespace_State.instance);
            case CharType.EOF:
                return Transition.To(End_State.instance);
            case CharType.Hash:
                return Transition.To(Hex_State.instance);
            case CharType.Operator:
                return Transition.To(Operator_State.instance);
            case CharType.Letter:
                return Transition.To(Letter_State.instance);
            case CharType.Number:
                return Transition.To(Number_State.instance);
            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;
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

    public handle(char: Character): Transition {
        if (char.type !== CharType.Whitespace) {
            return Transition.EmitAndTo(Initial_State.instance);
        }
        return Transition.Stay();
    }
}

class Hex_State extends State {
    public isAccepting: boolean = true;
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

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Hash:
            case CharType.Letter:
            case CharType.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;
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

    public handle(char: Character): Transition {
        if (char.type !== CharType.Letter) {
            return Transition.EmitAndTo(Initial_State.instance);
        }
        return Transition.Stay();
    }
}

class Number_State extends State {
    public isAccepting: boolean = true;
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

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Number:
                return Transition.Stay();
            case CharType.Percent:
                return Transition.To(Percent_State.instance);
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Percent_State extends State {
    public isAccepting: boolean = true;
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

    public handle(char: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class Operator_State extends State {
    public isAccepting: boolean = true;
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

    public handle(char: Character): Transition {
        if (char.type !== CharType.Operator) {
            return Transition.EmitAndTo(Initial_State.instance);
        }
        return Transition.Stay();
    }
}

class End_State extends State {
    public isAccepting: boolean = true;
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

    public handle(char: Character): Transition {
        return Transition.End();
    }
}

// Export singleton instance aliases for convenience
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