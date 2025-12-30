// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
import { Context } from './Context.ts'

/**
 * Abstract base class for all DFA states
 * Each state handles character transitions and determines if it's an accepting state
 */
abstract class State {
    /** Inspect options for debugging and logging */
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

    /** Reference to the DFA context managing this state */
    protected context!: Context;

    /**
     * Sets the context reference for this state
     * Called when transitioning to this state
     * @param context - The DFA context
     */
    public setContext(context: Context) {
        this.context = context;
    }

    /**
     * Returns a formatted string representation of this state
     * @returns Formatted string for debugging
     */
    public toString(): string {
        return `\n\t${inspect(this, this.inspectOptions)} \n`;
    }

    /**
     * Processes a character and determines state transitions
     * Must be implemented by each concrete state
     * @param char - The character to handle
     */
    public abstract handle(char: Character): void;

    /**
     * Indicates whether this state accepts tokens
     * Accepting states can emit tokens when exited
     * @returns True if this is an accepting state
     */
    public abstract isAccepting(): boolean;
}


/**
 * Initial non-accepting state
 * Routes characters to appropriate accepting states
 * Used as the default state between tokens
 */
class Initial_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Initial_State
     * @returns The singleton Initial_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    /**
     * Routes characters to appropriate accepting states based on character type
     * @param char - The character to process
     */
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

    /**
     * Initial state is non-accepting (doesn't emit tokens)
     * @returns False - this state doesn't accept tokens
     */
    public isAccepting(): boolean {
        return false;
    }
}


/**
 * Whitespace accepting state
 * Accumulates consecutive whitespace characters into a single token
 */
class Whitespace_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Whitespace_State
     * @returns The singleton Whitespace_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Whitespace_State();
        }
        return this.#instance;
    }

    /**
     * Stays in whitespace state for consecutive whitespace
     * Transitions to initial state for any non-whitespace character
     * @param char - The character to process
     */
    public handle(char: Character): void {
        if (char.type !== CharType.Whitespace) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    /**
     * Whitespace state accepts tokens
     * @returns True - whitespace can be emitted as a token
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Hexadecimal value accepting state
 * Handles hex color codes like #ff0000 or #abc
 */
class Hex_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Hex_State
     * @returns The singleton Hex_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Hex_State();
        }
        return this.#instance;
    }

    /**
     * Accumulates hash, letters, and numbers for hex values
     * Transitions to initial state for any other character
     * @param char - The character to process
     */
    public handle(char: Character): void {
        switch (char.type) {
            case CharType.Hash:
            case CharType.Letter:
            case CharType.Number:
                // Stay in hex state, continue accumulating
                break;
            default:
                this.context.transitionTo(Initial_State.instance);
                break;
        }
    }

    /**
     * Hex state accepts tokens
     * @returns True - hex values can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Letter/Identifier accepting state
 * Accumulates consecutive letter characters into identifiers
 */
class Letter_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Letter_State
     * @returns The singleton Letter_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    /**
     * Stays in letter state for consecutive letters
     * Transitions to initial state for non-letter characters
     * @param char - The character to process
     */
    public handle(char: Character): void {
        if (char.type !== CharType.Letter) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    /**
     * Letter state accepts tokens
     * @returns True - identifiers can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Number accepting state
 * Accumulates consecutive digit characters into numbers
 * Can transition to percent state if followed by %
 */
class Number_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Number_State
     * @returns The singleton Number_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    /**
     * Stays in number state for consecutive digits
     * Transitions to percent state if % follows a number
     * Transitions to initial state for other characters
     * @param char - The character to process
     */
    public handle(char: Character): void {
        switch (char.type) {
            case CharType.Number:
                // Stay in number state, continue accumulating digits
                break;
            case CharType.Percent:
                this.context.transitionTo(Percent_State.instance);
                break;
            default:
                this.context.transitionTo(Initial_State.instance);
                break;
        }
    }

    /**
     * Number state accepts tokens
     * @returns True - numbers can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Percent accepting state
 * Handles percentage values (e.g., 50%)
 */
class Percent_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Percent_State
     * @returns The singleton Percent_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    /**
     * Transitions to initial state for any non-percent character
     * Percent is typically a single-character suffix
     * @param char - The character to process
     */
    public handle(char: Character): void {
        /* istanbul ignore if -- @preserve */
        if (char.type !== CharType.Percent) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    /**
     * Percent state accepts tokens
     * @returns True - percentage values can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Operator accepting state
 * Handles operator characters like +, -, *, /, etc.
 */
class Operator_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Operator_State
     * @returns The singleton Operator_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Operator_State();
        }
        return this.#instance;
    }

    /**
     * Transitions to initial state for any non-operator character
     * Operators are typically single characters or short sequences
     * @param char - The character to process
     */
    public handle(char: Character): void {
        /* istanbul ignore if -- @preserve */
        if (char.type !== CharType.Operator) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    /**
     * Operator state accepts tokens
     * @returns True - operators can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * End/EOF accepting state
 * Terminal state when end of file is reached
 */
class End_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of End_State
     * @returns The singleton End_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    /**
     * Transitions to initial state if more input arrives after EOF
     * Typically EOF is terminal, but this handles edge cases
     * @param char - The character to process
     */
    public handle(char: Character): void {
        /* istanbul ignore if -- @preserve */
        if (char.type !== CharType.EOF) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    /**
     * End state accepts tokens
     * @returns True - EOF can be emitted as a token
     */
    public isAccepting(): boolean {
        return true;
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