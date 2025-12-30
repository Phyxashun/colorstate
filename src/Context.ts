// src/Context.ts

import { CharType, type Character } from "./Character.ts";
import { TokenType, type Token } from "./Tokenizer.ts";
import { State } from "./States.ts";

/**
 * Context manages the DFA (Deterministic Finite Automaton) state machine
 * Processes characters through state transitions and emits tokens
 */
class Context {
    /** Current state of the DFA */
    private state: State;
    /** Previously processed character for lookahead */
    public previousChar: Character | null = null;
    /** Buffer for accumulating characters into multi-character tokens */
    public buffer: Character[] = [];

    /**
     * Creates a new Context with an initial state
     * @param initialState - The starting state for the DFA
     */
    constructor(initialState: State) {
        this.state = initialState;
        this.state.setContext(this);
    }

    /**
     * Transitions the DFA to a new state
     * Sets the context reference in the new state
     * @param state - The state to transition to
     */
    public transitionTo(state: State): void {
        this.state = state;
        this.state.setContext(this);
    }

    /**
     * Processes a character and emits accumulated tokens when appropriate
     * Handles state transitions and buffer management for multi-character tokens
     * @param char - The character to process
     * @returns A Character token if one should be emitted, null otherwise
     */
    public processTokens(char: Character): Character | null {
        const wasAccepting = this.state.isAccepting();
        const previousState = this.state;

        // Handle EOF: emit buffered token if in accepting state
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

        // Transitioning out of accepting state: emit buffered token
        /* istanbul ignore if -- @preserve */
        if (changedState && wasAccepting && !isAccepting) {
            let tokenToEmit = null;

            if (this.buffer.length > 0) {
                tokenToEmit = this.createToken(this.buffer);
                this.buffer = [];
            }

            // Re-handle character in new state
            this.state.handle(char);
            const newAccepting = this.state.isAccepting();

            if (newAccepting) {
                this.buffer.push(char);
            }

            return tokenToEmit;
        }

        // Accumulate character if in accepting state
        /* istanbul ignore if -- @preserve */
        if (isAccepting) {
            this.buffer.push(char);
        }

        return null;
    }

    /**
     * Processes a character and emits individual characters when in accepting states
     * Used for single-character tokenization mode
     * @param char - The character to process
     * @returns The character if it should be emitted, null otherwise
     */
    public processCharacters(char: Character): Character | null {
        let result: Character | null = null;

        if (char.type === CharType.EOF) {
            this.state.handle(char);
            this.previousChar = char;
            return result;
        }

        const wasAccepting = this.state.isAccepting();
        const previousState = this.state;

        this.previousChar = char;
        this.state.handle(char);

        const isAccepting = this.state.isAccepting();
        const changedState = (this.state !== previousState);

        // Emit previous character when leaving accepting state
        if (wasAccepting && changedState && !isAccepting) {
            this.state.handle(char);
            result = this.previousChar;

            /* istanbul ignore if -- @preserve */
            if (this.state.isAccepting()) {
                result = char;
            }
        }

        // Emit current character if in accepting state
        if (isAccepting) {
            result = char;
        }

        return result;
    }

    /**
     * Creates a token from a buffer of characters
     * Concatenates character values and uses metadata from first character
     * @param chars - Array of characters to combine into a token
     * @returns A Character object representing the complete token
     * @throws Error if buffer is empty
     */
    private createToken(chars: Character[]): Character {
        /* istanbul ignore next -- @preserve */
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

    /**
     * Converts a Character token to a semantic Token type
     * Maps CharType to TokenType with specific operator handling
     * @param char - The Character to convert
     * @returns A Token with semantic type information
     */
    public static toTokenType(char: Character): Token {
        const value = char.value;

        // Check if it's a percentage (ends with %)
        if (value.endsWith('%')) {
            return { value: value, type: TokenType.PERCENT };
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

    /**
     * Checks if the current state is an accepting state
     * @returns True if in an accepting state
     */
    public isAccepted(): boolean {
        return this.state.isAccepting();
    }
}

export { Context };