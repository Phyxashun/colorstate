// src/Context.ts

import { CharType, type Character } from "./Character.ts";
import { TokenType, type Token } from "./Tokenizer.ts";
import { State } from "./States.ts";
import { type Transition } from "./States.ts";

/**
 * Context manages the DFA (Deterministic Finite Automaton) state machine
 * Processes characters through state transitions and emits tokens
 */
class Context {
    /** Current state of the DFA */
    private state: State;

    /** Previously processed character */
    public previousChar: Character | null = null;

    /** Buffer for accumulating characters into multi-character tokens */
    public buffer: Character[] = [];

    constructor(initialState: State) {
        this.state = initialState;
    }

    /**
     * Transitions the DFA to a new state
     */
    public transitionTo(state: State): void {
        this.state = state;
    }

    /**
     * Token-oriented processing (multi-character tokens)
     */
    public processTokens(char: Character): Character | null {
        this.previousChar = char;

        const transition: Transition = this.state.handle(char);

        switch (transition.kind) {
            case "Stay": {
                if (this.state.isAccepting() && char.type !== CharType.EOF) {
                    this.buffer.push(char);
                }
                return null;
            }

            case "To": {
                this.transitionTo(transition.state);

                if (this.state.isAccepting() && char.type !== CharType.EOF) {
                    this.buffer.push(char);
                }
                return null;
            }

            case "EmitAndTo": {
                const token =
                    this.buffer.length > 0
                        ? this.createToken(this.buffer)
                        : null;

                this.buffer = [];
                this.transitionTo(transition.state);

                if (this.state.isAccepting() && char.type !== CharType.EOF) {
                    this.buffer.push(char);
                }

                return token;
            }

            case "End": {
                if (this.buffer.length === 0) return null;

                const token = this.createToken(this.buffer);
                this.buffer = [];
                return token;
            }
        }
    }

    /**
     * Character-oriented processing (single-character tokens)
     */
    public processCharacters(char: Character): Character | null {
        this.previousChar = char;

        const transition: Transition = this.state.handle(char);

        switch (transition.kind) {
            case "Stay": {
                return this.state.isAccepting() ? char : null;
            }

            case "To": {
                this.transitionTo(transition.state);
                return this.state.isAccepting() ? char : null;
            }

            case "EmitAndTo": {
                const emitted = this.state.isAccepting() ? char : null;
                this.transitionTo(transition.state);
                return emitted;
            }

            case "End": {
                return null;
            }
        }
    }

    /**
     * Creates a token from a buffer of characters
     */
    private createToken(chars: Character[]): Character {
        if (chars.length === 0) {
            throw new Error("Cannot create token from empty buffer");
        }

        let value = "";
        for (let i = 0; i < chars.length; i++) {
            value += chars[i]!.value;
        }

        return {
            value,
            type: chars[0]!.type,
            index: chars[0]!.index,
            line: chars[0]!.line,
            column: chars[0]!.column
        };
    }

    /**
     * Converts a Character token to a semantic Token type
     */
    public static toTokenType(char: Character): Token {
        const value = char.value;

        if (value.endsWith("%")) {
            return { value, type: TokenType.PERCENT };
        }

        switch (char.type) {
            case CharType.Hash:
                return { value, type: TokenType.HEXVALUE };

            case CharType.Percent:
                return { value, type: TokenType.PERCENT };

            case CharType.Letter:
                return { value, type: TokenType.IDENTIFIER };

            case CharType.Number:
                return { value, type: TokenType.NUMBER };

            case CharType.Whitespace:
                return { value, type: TokenType.WHITESPACE };

            case CharType.Operator:
                switch (value) {
                    case "+":
                        return { value, type: TokenType.PLUS };
                    case "-":
                        return { value, type: TokenType.MINUS };
                    case ",":
                        return { value, type: TokenType.COMMA };
                    case "/":
                        return { value, type: TokenType.SLASH };
                    case "(":
                        return { value, type: TokenType.LPAREN };
                    case ")":
                        return { value, type: TokenType.RPAREN };
                    default:
                        return { value, type: TokenType.OPERATOR };
                }

            case CharType.EOF:
                return { value, type: TokenType.EOF };

            default:
                return { value, type: TokenType.ERROR };
        }
    }

    /**
     * Checks if the current state is accepting
     */
    public isAccepted(): boolean {
        return this.state.isAccepting();
    }
}

export { Context };
