// src/Context.ts

import { CharType, type Character } from "./Character.ts";
import { TokenType, type Token } from "./Tokenizer.ts";
import { State } from "./States.ts";

class Context {
    private state: State;
    public previousChar: Character | null = null;
    public buffer: Character[] = [];

    constructor(initialState: State) {
        this.state = initialState;
        this.state.setContext(this);
    }

    public transitionTo(state: State): void {
        this.state = state;
        this.state.setContext(this);
    }

    public processTokens(char: Character): Character | null {
        const wasAccepting = this.state.isAccepting();
        const previousState = this.state;

        if (char.type === CharType.EOF) {
            if (wasAccepting && this.buffer.length > 0) {
                const token = this.createToken(this.buffer);
                this.buffer = [];
                this.state.handle(char);
                this.previousChar = char;
                return token;
            }
            this.state.handle(char);
            this.previousChar = char;
            return null;
        }

        this.previousChar = char;
        this.state.handle(char);

        const isAccepting = this.state.isAccepting();
        const changedState = (this.state !== previousState);

        if (changedState && wasAccepting && !isAccepting) {
            let tokenToEmit = null;
            if (this.buffer.length > 0) {
                tokenToEmit = this.createToken(this.buffer);
                this.buffer = [];
            }

            this.state.handle(char);
            const newAccepting = this.state.isAccepting();

            if (newAccepting) {
                this.buffer.push(char);
            }

            return tokenToEmit;
        }

        if (isAccepting) {
            this.buffer.push(char);
        }

        return null;
    }

    public processCharacters(char: Character): Character | null {
        if (char.type === CharType.EOF) {
            this.state.handle(char);
            this.previousChar = char;
            return null;
        }

        const wasAccepting = this.state.isAccepting();
        const previousState = this.state;

        this.previousChar = char;
        this.state.handle(char);

        const isAccepting = this.state.isAccepting();
        const changedState = (this.state !== previousState);

        if (wasAccepting && changedState && !isAccepting) {
            this.state.handle(char);

            if (this.state.isAccepting()) {
                return char;
            }

            return this.previousChar;
        }

        if (isAccepting) {
            return char;
        }

        return null;
    }

    private createToken(chars: Character[]): Character {
        if (chars.length === 0) throw new Error('Cannot create token from empty buffer');

        let value = '';
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

    public static toTokenType(char: Character): Token {
        const value = char.value;

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
                // Map specific operators to their token types
                switch (value) {
                    case '+':
                        return { value, type: TokenType.PLUS };
                    case '-':
                        return { value, type: TokenType.MINUS };
                    case ',':
                        return { value, type: TokenType.COMMA };
                    case '/':
                        return { value, type: TokenType.SLASH };
                    case '(':
                        return { value, type: TokenType.LPAREN };
                    case ')':
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

    public isAccepted(): boolean {
        return this.state.isAccepting();
    }
} // End class Context

export { Context };