// src/Context.ts

import { type Character, CharType } from './Character.ts';
import { TokenType } from './Tokenizer.ts';

enum State {
    INITIAL,
    IN_IDENTIFIER,
    IN_STRING,
    IN_HEXVALUE,
    IN_NUMBER,
    IN_PERCENT,
    IN_DIMENSION,
    IN_EQUALS,
    IN_PLUS,
    IN_MINUS,
    IN_STAR,
    IN_DOT,
    IN_COMMA,
    IN_SLASH,
    IN_LPAREN,
    IN_RPAREN,
    IN_ESCAPE,
    IN_SYMBOL,
    IN_NEWLINE,
    IN_WHITESPACE,
    IN_EOF,
    IN_OTHER,
    IN_ERROR,
    END,
}

// The instructions the Context gives back to the Tokenizer.
interface ContextAction {
    emit: boolean;        // Should the current buffer be emitted as a token?
    reprocess: boolean;   // Should the current character be re-processed in the new state?
    ignore: boolean;      // Should the current character be ignored and not buffered?
    tokenType: TokenType; // What type of token should be emitted?
}

/**
 * The Context class is a state machine that tracks the current tokenizing state.
 * It receives characters one by one and tells the Tokenizer how to handle them.
 */
class Context {
    private state: State = State.INITIAL;
    private quoteType: CharType.Backtick | CharType.SingleQuote | CharType.DoubleQuote | null = null;

    /**
     * Resets the context to its initial clean state.
     */
    public reset(): void {
        this.state = State.INITIAL;
        this.quoteType = null;
    }

    /**
     * Gets the current state of the context.
     * @returns {State} The current state.
     */
    public getState(): State {
        return this.state;
    }

    /**
     * The core processing logic of the state machine.
     * @param char The character to process.
     * @returns {ContextAction} The action for the Tokenizer to take.
     */
    public process(char: Character): ContextAction {
        switch (this.state) {
            case State.INITIAL:
                return this.processInitial(char);
            case State.IN_IDENTIFIER:
                return this.processIdentifier(char);
            case State.IN_HEXVALUE:
                return this.processHex(char);
            case State.IN_NUMBER:
                return this.processNumber(char);
            case State.IN_PERCENT:
                return this.processPercent(char);
            case State.IN_STRING:
                return this.processString(char);
            case State.IN_ESCAPE:
                return this.processEscape(char);
            case State.IN_SYMBOL:
                return this.processSymbol(char);
        }
        // This part is effectively unreachable with a complete switch, which is good.
        /* v8 ignore next -- @preserve */
        this.state = State.INITIAL;
        /* v8 ignore next -- @preserve */
        return { emit: false, reprocess: true, ignore: true, tokenType: TokenType.OTHER };
    }

    // Handles characters when in the initial state (between tokens).
    private processInitial(char: Character): ContextAction {
        // This is the main dispatcher. It decides where to go based on the first character.
        switch (char.type) {
            case CharType.Letter:
                this.state = State.IN_IDENTIFIER;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.IDENTIFIER };
            case CharType.Number:
                this.state = State.IN_NUMBER;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };
            case CharType.Hash:
                this.state = State.IN_HEXVALUE;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.HEXVALUE };
            case CharType.Backtick:
            case CharType.SingleQuote:
            case CharType.DoubleQuote:
                this.state = State.IN_STRING;
                this.quoteType = char.type;
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.STRING };
            case CharType.Whitespace:
            case CharType.NewLine:
            case CharType.EOF:
                // Ignore whitespace between tokens
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.OTHER };
            // For all other single-character symbols, we use a generic handler.
            default:
                this.state = State.IN_SYMBOL;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.SYMBOL };
        }
    }

    // Handles characters when building an identifier.
    private processIdentifier(char: Character): ContextAction {
        if (char.type === CharType.Letter || char.type === CharType.Number) {
            // Continue building the identifier.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.IDENTIFIER };
        }
        // End of identifier. Emit it and reprocess the current char in the INITIAL state.
        this.state = State.INITIAL;
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.IDENTIFIER };
    }

    // Handles characters when building a number.
    private processNumber(char: Character): ContextAction {
        // If we see a number or a dot, continue building the NUMBER.
        if (char.type === CharType.Number || char.type === CharType.Dot) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };
        }

        // If we see a percent sign, transition to the IN_PERCENTAGE state.
        if (char.type === CharType.Percent) {
            this.state = State.IN_PERCENT;
            // Tell the tokenizer to keep buffering, as this '%' is part of our token.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.PERCENT };
        }

        // For any other character, the number is finished.
        this.state = State.INITIAL;
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.NUMBER };
    }

    // Handles the token when the character *after* the '%' arrives.
    private processPercent(char: Character): ContextAction {
        // The percentage token is complete as soon as we see any new character.
        this.state = State.INITIAL;
        // Emit the buffered "56%" and reprocess the new character.
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.PERCENT };
    }

    // Handles characters when building a hex value.
    private processHex(char: Character): ContextAction {
        // FIX: The regex was incorrect. It should not contain extra brackets.
        if (char.type === CharType.Number ||
            (char.type === CharType.Letter && /^[0-9a-fA-F]$/i.test(char.value))) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.HEXVALUE };
        }
        /* v8 ignore next -- @preserve */
        this.state = State.INITIAL;
        /* v8 ignore next -- @preserve */
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.HEXVALUE };
    }

    // Handles characters when inside a string.
    private processString(char: Character): ContextAction {
        // If we see a backslash, set the escape flag for the *next* character.
        if (char.type === CharType.BackSlash) {
            this.state = State.IN_ESCAPE;
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
        }

        // If we see the matching closing quote (and it was not escaped), the string ends.
        if (char.type === this.quoteType) {
            this.state = State.INITIAL;
            this.quoteType = null;
            return { emit: true, reprocess: false, ignore: true, tokenType: TokenType.STRING };
        }

        // Any other character is just content to be buffered.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles escaped characters inside of a string.
    private processEscape(char: Character): ContextAction {
        // After processing an escaped character, we must return to the IN_STRING state,
        this.state = State.IN_STRING;
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles emitting single-character symbols.
    private processSymbol(char: Character): ContextAction {
        // Any new character means the single symbol is complete.
        this.state = State.INITIAL;
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.SYMBOL };
    }
}

export {
    State,
    type ContextAction,
    Context
}
