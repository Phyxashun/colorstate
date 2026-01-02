// src/Context.ts

import { CharType, type Character } from "./Character.ts";
import { TokenType, type Token } from "./Tokenizer.ts";
import { State } from "./States.ts";

/**
 * Context manages the DFA (Deterministic Finite Automaton) state machine
 * Processes characters through state transitions and emits tokens
 */
class Context {
    private state: State;
    public previousChar?: Character;

    /** Buffer for accumulating characters into multi-character tokens */
    public buffer: Character[] = [];

    constructor(initialState: State) {
        this.state = initialState;
    }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public processTokens(char: Character): Character | undefined {
        const transition = this.state.handle(char);

        switch (transition.kind) {
            case "Stay": {
                if (this.state.isAccepting)
                    this.buffer.push(char);
                break;
            }

            case "To": {
                this.transitionTo(transition.state);

                if (this.state.isAccepting)
                    this.buffer.push(char);
                break;
            }

            case "EmitAndTo": {
                const token =
                    this.buffer.length > 0
                        ? this.createToken(this.buffer)
                        : undefined;
                this.buffer = [];
                this.transitionTo(transition.state);
                return token;
            }

            case "End": {
                const token =
                    this.buffer.length > 0
                        ? this.createToken(this.buffer)
                        : undefined;
                this.buffer = [];
                return token;
            }
        }
    }

    public processCharacters(char: Character): Character | undefined {
        const wasAccepting = this.state.isAccepting;
        const prevChar = this.previousChar;
        this.previousChar = char;

        const transition = this.state.handle(char);

        if (char.type === CharType.EOF) return;

        switch (transition.kind) {
            case "Stay":
                if (wasAccepting)
                    return char;
                break;

            case "To":
                this.transitionTo(transition.state);
                if (this.state.isAccepting)
                    return char;
                break;

            case "EmitAndTo": {
                this.transitionTo(transition.state);
                return prevChar;
            }

            case "End":
                break;
        }
    }

    private createToken(chars: Character[]): Character {
        if (chars.length === 0) throw new Error('Cannot create token from empty buffer');

        let value = '';
        for (const ch of chars) {
            value += ch.value;
        }

        return {
            value,
            type: chars[0]!.type,
            index: chars[0]!.index,
            line: chars[0]!.line,
            column: chars[0]!.column
        };
    }

    public static toTokenType(char: Character): Token {
        const value = char.value;

        if (value.endsWith("%")) {
            return { value, type: TokenType.PERCENT };
        }

        switch (char.type) {
            case CharType.Whitespace:
                return { value, type: TokenType.WHITESPACE };

            case CharType.Hash:
                return { value, type: TokenType.HEXVALUE };

            case CharType.Percent:
                return { value, type: TokenType.PERCENT };

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
                    case "*":
                    default:
                        return { value, type: TokenType.OPERATOR };
                }
            case CharType.Letter:
                return { value, type: TokenType.IDENTIFIER };

            case CharType.Number:
                return { value, type: TokenType.NUMBER };

            case CharType.EOF:
                return { value, type: TokenType.EOF };

            default:
                return { value, type: TokenType.ERROR };
        }
    }

    public isAccepted(): boolean {
        return this.state.isAccepting;
    }
}

export { Context };
