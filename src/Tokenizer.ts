// src/Tokenizer.ts

import { inspect, styleText, type InspectOptions } from 'node:util';
import { Context, State } from './Context.ts';
import { type Character, CharType, CharacterStream } from './Character.ts';
import PrintLine, { Divider } from './PrintLine.ts';

export const MAX_WIDTH: number = 80;

enum TokenType {
    START = 'START',
    IDENTIFIER = 'IDENTIFIER',
    KEYWORD = 'KEYWORD',
    STRING = 'STRING',
    HEXVALUE = 'HEXVALUE',
    NUMBER = 'NUMBER',
    PERCENT = 'PERCENT',
    DIMENSION = 'DIMENSION',
    EQUALS = 'EQUALS',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    STAR = 'STAR',
    DOT = 'DOT',
    COMMA = 'COMMA',
    SLASH = 'SLASH',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    ESCAPE = 'ESCAPE',
    SYMBOL = 'SYMBOL',
    NEWLINE = 'NEWLINE',
    WHITESPACE = 'WHITESPACE',
    EOF = 'EOF',
    OTHER = 'OTHER',
    ERROR = 'ERROR',
    CONST = 'CONST',
    LET = 'LET',
    FOR = 'FOR',
    OF = 'OF',
    NEW = 'NEW',
}

interface Token {
    value: string;
    type: TokenType;
}

class Tokenizer {
    private printLine;
    private inspectOptions: InspectOptions;
    private ctx;
    private buffer: Character[];
    private stream: CharacterStream | null;
    private shouldLog: boolean;
    private message: string;

    constructor() {
        this.ctx = new Context();
        this.buffer = [];
        this.stream = null;
        this.shouldLog = false;
        this.message = '';

        this.inspectOptions = {
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

        this.printLine = PrintLine;
        return this;
    }

    /**
     * Resets the tokenizer's internal state for a new run.
     */
    private reset(): void {
        this.ctx.reset(); // Reset the state machine
        this.buffer = [];   // Clear the character buffer
    }

    public withLogging(message?: string): this {
        this.shouldLog = true;
        this.message = message || `TOKENIZATION DEMONSTRATION:`;
        return this;
    }

    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = '';
        return this;
    }

    private logHeader(): void {
        if (!this.shouldLog) return;
        this.printLine();
        console.log(`TOKENIZER:\n\n\t${this.message}\n`);
    }

    private logSource(input: CharacterStream): void {
        if (!this.shouldLog) return;
        console.log(`\tSOURCE:\n\n\t${inspect(input.get(), this.inspectOptions)}\n`);
        this.printLine();
    }

    private logResults(result: Token[]): void {
        if (!this.shouldLog) return;

        console.log(`RESULT (TOKENS):\n`);

        for (const item of result) {
            console.log(`\t${inspect(item, this.inspectOptions)}`);
        }

        console.log();
        this.printLine();

        this.shouldLog = false;
        this.message = '';
    }

    /**
     * A map of recognized keywords. Used to convert IDENTIFIER tokens into KEYWORD tokens.
     */
    private static readonly KEYWORDS: Record<string, TokenType> = {
        'deg':  TokenType.DIMENSION,
        'grad': TokenType.DIMENSION,
        'rad': TokenType.DIMENSION,
        'turn': TokenType.DIMENSION,
        'const': TokenType.CONST,
        'let': TokenType.LET,
        'for': TokenType.FOR,
        'of': TokenType.OF,
        'new': TokenType.NEW,
    };

    /**
     * Maps the first character of a generic SYMBOL token to a specific TokenType.
     */
    private static readonly SYMBOL_MAP: Record<string, TokenType> = {
        '=': TokenType.EQUALS, '+': TokenType.PLUS, '-': TokenType.MINUS,
        '*': TokenType.STAR, '.': TokenType.DOT, ',': TokenType.COMMA,
        '/': TokenType.SLASH, '(': TokenType.LPAREN, ')': TokenType.RPAREN,
        '%': TokenType.PERCENT,
        // Add other single-character symbols here
    };

    /**
     * Tokenizes a given character stream.
     * @param {Stream} stream - The input stream to tokenize.
     * @returns {Token[]} An array of tokens.
     */
    public tokenize(stream: CharacterStream): Token[] {
        this.reset();

        this.stream = stream;
        const tokens: Token[] = [];
        let reprocess = false;

        this.logHeader();
        this.logSource(stream);

        for (const char of this.stream) {
            do {
                const action = this.ctx.process(char);
                reprocess = action.reprocess;

                // 1. Handle emitting a token
                if (action.emit && this.buffer.length > 0) {
                    const tokenType = this.ctx.getState() === State.INITIAL
                        ? action.tokenType // Use the type from the action that caused the emit
                        : this.getTokenTypeFromState(this.ctx.getState()); // Or the state we were in

                    tokens.push(this.createToken(tokenType));
                    this.buffer = [];
                }

                // 2. Handle the current character
                if (!action.ignore && !reprocess) {
                    this.buffer.push(char);
                }

            } while (reprocess);
        }

        // After the loop, flush any remaining characters in the buffer.
        if (this.buffer.length > 0) {
            tokens.push(this.createToken(this.getTokenTypeFromState(this.ctx.getState())));
        }

        tokens.push({ value: '', type: TokenType.EOF });
        this.logResults(tokens);
        return tokens;
    }

    /**
     * Maps the final state of the context to a TokenType.
     * @param {State} state - The context state.
     * @returns {TokenType} The corresponding token type.
     */
    private getTokenTypeFromState(state: State): TokenType {
        switch (state) {
            case State.IN_IDENTIFIER: return TokenType.IDENTIFIER;
            case State.IN_NUMBER: return TokenType.NUMBER;
            case State.IN_STRING: return TokenType.STRING;
            case State.IN_HEXVALUE: return TokenType.HEXVALUE;
            case State.IN_PERCENT: return TokenType.PERCENT;
            case State.IN_SYMBOL: return TokenType.SYMBOL;
            /* v8 ignore next -- @preserve */
            default: return TokenType.OTHER;
        }
    }

    /**
     * Creates a token from the current buffer and a given type.
     * This is where keyword checking and string unescaping happens.
     * @param {TokenType} type - The type of token to create, as determined by the Context.
     * @returns {Token} The final token.
     */
    private createToken(type: TokenType): Token {
        if (this.buffer.length === 0) {
            throw new Error('Cannot create token from empty buffer');
        }
        const value = this.buffer.map(c => c.value).join('');

        if (type === TokenType.STRING) {
            return { value: Tokenizer.unescapeString(value), type: TokenType.STRING };
        }

        if (type === TokenType.IDENTIFIER) {
            const keywordType = Tokenizer.KEYWORDS[value];
            if (keywordType) {
                return { value, type: keywordType };
            }
        }

        // If the context identified it as a generic symbol, we now specify it.
        if (type === TokenType.SYMBOL) {
            const specificSymbolType = Tokenizer.SYMBOL_MAP[value];
            if (specificSymbolType) {
                return { value, type: specificSymbolType };
            }
        }

        return { value, type };
    }

    /**
     * Converts escaped sequences in a string to their actual characters.
     * @param {string} input - The raw string content.
     * @returns {string} The unescaped string.
     */
    private static unescapeString(input: string): string {
        // A map for replacements.
        const replacements: Record<string, string> = {
            '\\n': '\n',
            '\\r': '\r',
            '\\t': '\t',
            '\\"': '"',
            "\\'": "'",
            '\\\\': '\\'
        };

        // This regex finds either a simple escape sequence (like \n) or a unicode/hex escape.
        return input.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[nrt'"\\])/g, (match, seq) => {
            if (replacements[match]) return replacements[match];
            if (seq.startsWith('u') || seq.startsWith('x')) {
                return String.fromCharCode(parseInt(seq.slice(1), 16));
            }
            /* v8 ignore next -- @preserve */
            return match;
        });
    }
}

export {
    type Token,
    TokenType,
    Tokenizer
}
