// src/Context.ts

import { State, TokenType } from '../types/Types.ts';
import { type Character, CharType } from './Character.ts';

// The instructions the Context gives back to the Tokenizer.
interface ContextAction {
    emit: boolean;        // Should the current buffer be emitted as a token?
    reprocess: boolean;   // Should the current character be re-processed in the new state?
    ignore: boolean;      // Should the current character be ignored and not buffered?
    tokenType: TokenType; // What type of token should be emitted?
}

type QuoteType = CharType.Backtick | CharType.SingleQuote | CharType.DoubleQuote;

/**
 * The Context class is a state machine that tracks the current tokenizing state.
 * It receives characters one by one and tells the Tokenizer how to handle them.
 */
class Context {
    private _state: State = State.INITIAL;
    private quoteType: QuoteType | null = null;

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
    public get state(): State {
        return this._state;
    }

    /**
     * Sets the current state of the context.
     * @param {State} value The new current state.
     */
    public set state(value: State) {
        this._state = value ?? State.INITIAL;
    }

    /**
     * Transitions the current state of the context.
     * @param {State} value The new current state.
     */
    public transitionTo(value: State): void {
        this._state = value ?? State.INITIAL;
    }

    private readonly STATEPROCESS_MAP: Partial<Record<State, (char: Character) => ContextAction>> = {
        [State.INITIAL]: (char) => this.processInitial(char),
        [State.IN_IDENTIFIER]: (char) => this.processIdentifier(char),
        [State.IN_HEXVALUE]: (char) => this.processHex(char),
        [State.IN_NUMBER]: (char) => this.processNumber(char),
        [State.IN_DIMENSION]: (char) => this.processDimension(char),
        [State.IN_PERCENT]: (char) => this.processPercent(char),
        [State.IN_STRING]: (char) => this.processString(char),
        [State.IN_ESCAPE]: (char) => this.processEscape(char),
        [State.IN_SYMBOL]: (char) => this.processSymbol(char),
        [State.SEEN_SLASH]:                     (char) => this.processSeenSlash(char),
        [State.IN_SINGLE_LINE_COMMENT]:         (char) => this.processSingleLineComment(char),
        [State.IN_MULTI_LINE_COMMENT]:          (char) => this.processMultiLineComment(char),
        [State.IN_MULTI_LINE_COMMENT_SAW_STAR]: (char) => this.processMultiLineCommentSawStar(char),
    };

    /**
     * The core processing logic of the state machine.
     * @param char The character to process.
     * @returns {ContextAction} The action for the Tokenizer to take.
     */
    public process(char: Character): ContextAction {
        const processFn = this.STATEPROCESS_MAP[this.state];
        if (processFn) return processFn(char);

        this.transitionTo(State.INITIAL);
        return { emit: false, reprocess: true, ignore: true, tokenType: TokenType.OTHER };
    }

    // Handles characters when in the initial state (between tokens).
    private processInitial(char: Character): ContextAction {
        switch (char.type) {
            case CharType.Letter:
                this.transitionTo(State.IN_IDENTIFIER);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.IDENTIFIER };

            case CharType.Number:
                this.transitionTo(State.IN_NUMBER);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };

            case CharType.Hash:
                this.transitionTo(State.IN_HEXVALUE);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.HEXVALUE };

            case CharType.Slash:
                this.transitionTo(State.SEEN_SLASH);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };

            case CharType.Backtick:
            case CharType.SingleQuote:
            case CharType.DoubleQuote:
                this.quoteType = char.type as QuoteType;
                this.transitionTo(State.IN_STRING);
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.STRING };

            case CharType.Whitespace:
            case CharType.NewLine:
            case CharType.EOF:
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.OTHER };

            default:
                this.transitionTo(State.IN_SYMBOL);
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
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.IDENTIFIER };
    }

    // Handles characters when building a number.
    private processNumber(char: Character): ContextAction {
        // If we see a number or a dot, continue building the NUMBER.
        if (char.type === CharType.Number || char.type === CharType.Dot) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };
        }

        // Transition to IN_DIMENSION if a letter is found
        if (char.type === CharType.Letter) {
            this.transitionTo(State.IN_DIMENSION);
            // Continue buffering this character as part of the new dimension token.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.DIMENSION };
        }

        // If we see a percent sign, transition to the IN_PERCENTAGE state.
        if (char.type === CharType.Percent) {
            this.transitionTo(State.IN_PERCENT);
            // Tell the tokenizer to keep buffering, as this '%' is part of our token.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.PERCENT };
        }

        // For any other character, the number is finished.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.NUMBER };
    }

    // Handles the token when a dimension arrives.
    private processDimension(char: Character): ContextAction {
        // Continue consuming as long as we see letters.
        if (char.type === CharType.Letter) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.DIMENSION };
        }
        // Any other character ends the dimension. Emit and reprocess.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.DIMENSION };
    }

    // Handles the token when the character *after* the '%' arrives.
    private processPercent(char: Character): ContextAction {
        // The percentage token is complete as soon as we see any new character.
        this.transitionTo(State.INITIAL);
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

        // Any other character ends the hex value. Emit and reprocess.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.HEXVALUE };
    }

    // Handles characters when inside a string.
    private processString(char: Character): ContextAction {
        // If we see a backslash, set the escape flag for the *next* character.
        if (char.type === CharType.BackSlash) {
            this.transitionTo(State.IN_ESCAPE);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
        }

        // If we see the matching closing quote (and it was not escaped), the string ends.
        if (char.type === this.quoteType) {
            this.transitionTo(State.INITIAL);
            this.quoteType = null;
            return { emit: true, reprocess: false, ignore: true, tokenType: TokenType.STRING };
        }

        // Any other character is just content to be buffered.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles the character AFTER a '/'
    private processSeenSlash(char: Character): ContextAction {
        if (char.type === CharType.Slash) {
            // It's a single-line comment. Keep consuming.
            this.transitionTo(State.IN_SINGLE_LINE_COMMENT);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }
        if (char.type === CharType.Star) {
            // It's a multi-line comment. Keep consuming.
            this.transitionTo(State.IN_MULTI_LINE_COMMENT);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }

        // It was a false alarm. The previous '/' was just a division operator.
        this.transitionTo(State.INITIAL);
        // Emit the buffered '/' as a SLASH token, then reprocess the current character.
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.SLASH };
    }

    // Handles '//' comments
    private processSingleLineComment(char: Character): ContextAction {
        if (char.type === CharType.NewLine || char.type === CharType.EOF) {
            // Comment ends at a newline.
            this.transitionTo(State.INITIAL);
            // Emit the comment, then reprocess the newline/EOF so it can be handled properly (usually ignored).
            return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.COMMENT };
        }
        // Otherwise, keep consuming characters as part of the comment.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
    }

    // Handles '/*' comments
    private processMultiLineComment(char: Character): ContextAction {
        if (char.type === CharType.Star) {
            // We might be at the end of the comment. Transition to check the next character.
            this.transitionTo(State.IN_MULTI_LINE_COMMENT_SAW_STAR);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }
        // Keep consuming any other character.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
    }

    // Handles when we've just seen a '*' inside a '/*' comment
    private processMultiLineCommentSawStar(char: Character): ContextAction {
        if (char.type === CharType.Slash) {
            // This is the closing '*/'. The comment is finished.
            this.transitionTo(State.INITIAL);
            // Buffer this final '/', then emit the whole comment token.
            return { emit: true, reprocess: false, ignore: true, tokenType: TokenType.COMMENT };
        }
        if (char.type === CharType.Star) {
            // We saw another star, like in `/**`. Stay in this state.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }

        // False alarm. The '*' was just part of the comment text. Go back to the general multi-line state.
        this.transitionTo(State.IN_MULTI_LINE_COMMENT);
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
    }

    // Handles escaped characters inside of a string.
    private processEscape(char: Character): ContextAction {
        // After processing an escaped character, we must return to the IN_STRING state,
        this.transitionTo(State.IN_STRING);
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles emitting single-character symbols.
    private processSymbol(char: Character): ContextAction {
        // Any new character means the single symbol is complete.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.SYMBOL };
    }
}

export {
    type ContextAction,
    Context
}

