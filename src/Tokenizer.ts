// src/Tokenizer.ts

import { styleText, inspect, type InspectOptions } from 'node:util';
import { Context } from './Context.ts';
import CharacterStream, { type Character } from './Character.ts';
import PrintLine, { Spacer, CenterText, BoxText } from './PrintLine.ts';
import { State, TokenType } from '../types/Types.ts';

interface Token {
    value: string;
    type: TokenType;
}

type CreateTokenFn = (value: string, type?: TokenType) => Token;

class Tokenizer {
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

    private ctx = new Context();
    private buffer: Character[] = [];
    private shouldLog: boolean = false;
    private message = 'TOKENIZATION DEMONSTRATION:';

    constructor() {
        return this.reset();
    }

    private get state(): State {
        return this.ctx.state;
    }

    /**
     * Resets the tokenizer's internal state for a new run.
     */
    private reset(): this {
        this.ctx.reset();
        this.buffer = [];
        return this;
    }

    /**
     * A map of recognized keywords. Used to convert IDENTIFIER tokens into KEYWORD tokens.
     */
    private static readonly KEYWORDS: Record<string, TokenType> = {
        'rgb': TokenType.FUNCTION,
        'rgba': TokenType.FUNCTION,
        'hsl': TokenType.FUNCTION,
        'hsla': TokenType.FUNCTION,
        'hwb': TokenType.FUNCTION,
        'lch': TokenType.FUNCTION,
        'lab': TokenType.FUNCTION,
        'oklch': TokenType.FUNCTION,
        'oklab': TokenType.FUNCTION,
        'alpha': TokenType.FUNCTION,
        'color': TokenType.FUNCTION,
        'from': TokenType.FUNCTION,
        'deg': TokenType.DIMENSION,
        'grad': TokenType.DIMENSION,
        'rad': TokenType.DIMENSION,
        'turn': TokenType.DIMENSION,
        'const': TokenType.KEYWORD,
        'let': TokenType.KEYWORD,
        'for': TokenType.KEYWORD,
        'of': TokenType.KEYWORD,
        'new': TokenType.KEYWORD,
        'red': TokenType.KEYWORD,
        'green': TokenType.KEYWORD,
        'blue': TokenType.KEYWORD,
    };

    /**
     * Maps the first character of a generic SYMBOL token to a specific TokenType.
     */
    private static readonly SYMBOLS: Record<string, TokenType> = {
        '=': TokenType.EQUALS,
        '+': TokenType.PLUS,
        '-': TokenType.MINUS,
        '*': TokenType.STAR,
        '.': TokenType.DOT,
        ',': TokenType.COMMA,
        '/': TokenType.SLASH,
        '(': TokenType.LPAREN,
        ')': TokenType.RPAREN,
        '%': TokenType.PERCENT,
        // Add other single-character symbols here
    };

    /**
     * Maps the final state of the context to a TokenType.
     * @param {State} state - The context state.
     * @returns {TokenType} The corresponding token type.
     */
    private static readonly STATETOKEN_MAP: Partial<Record<State, TokenType>> = {
        [State.IN_IDENTIFIER]: TokenType.IDENTIFIER,
        [State.IN_NUMBER]: TokenType.NUMBER,
        [State.IN_STRING]: TokenType.STRING,
        [State.IN_HEXVALUE]: TokenType.HEXVALUE,
        [State.IN_DIMENSION]: TokenType.DIMENSION,
        [State.IN_PERCENT]: TokenType.PERCENT,
        [State.IN_SYMBOL]: TokenType.SYMBOL,
        [State.IN_SINGLE_LINE_COMMENT]: TokenType.COMMENT,
        [State.IN_MULTI_LINE_COMMENT]: TokenType.COMMENT,
        [State.IN_MULTI_LINE_COMMENT_SAW_STAR]: TokenType.COMMENT,
    };

    /**
     * Tokenizes a given character stream.
     * @param {Stream} stream - The input stream to tokenize.
     * @returns {Token[]} An array of tokens.
     */
    public tokenize(stream: CharacterStream): Token[] {
        this.reset();
        const tokens: Token[] = [];
        let reprocess = false;
        this.logHeader(stream);

        for (const CHAR of stream) {
            do {
                const ACTION = this.ctx.process(CHAR);
                reprocess = ACTION.reprocess;

                // 1. Handle emitting a token
                if (ACTION.emit && this.buffer.length > 0) {
                    const tokenType = (this.state === State.INITIAL)
                        ? ACTION.tokenType
                        : Tokenizer.STATETOKEN_MAP[this.state] ?? TokenType.OTHER;

                    tokens.push(this.createToken(tokenType));
                    this.buffer = [];
                }

                // 2. Handle the current character
                if (!ACTION.ignore && !reprocess) this.buffer.push(CHAR);

            } while (reprocess);
        }

        // After the loop, flush any remaining characters in the buffer.
        if (this.buffer.length > 0) {
            const newState = Tokenizer.STATETOKEN_MAP[this.state] ?? TokenType.OTHER;
            tokens.push(this.createToken(newState));
        }

        tokens.push({ value: '', type: TokenType.END });
        this.logResults(tokens);
        return tokens;
    }

    private static readonly TOKENMAP: Partial<Record<TokenType, CreateTokenFn>> = {
        [TokenType.STRING]: (value) => {
            return { value: Tokenizer.unescapeString(value), type: TokenType.STRING };
        },
        [TokenType.IDENTIFIER]: (value) => {
            return { value, type: Tokenizer.KEYWORDS[value] ?? TokenType.IDENTIFIER };
        },
        [TokenType.SYMBOL]: (value) => {
            return { value, type: Tokenizer.SYMBOLS[value] ?? TokenType.SYMBOL };
        },
        [TokenType.COMMENT]: (value) => {
            return { value, type: TokenType.COMMENT };
        }
    }

    /**
     * Creates a token from the current buffer and a given type.
     * This is where keyword checking and string unescaping happens.
     * @param {TokenType} tokenType - The type of token to create, as determined by the Context.
     * @returns {Token} The final token.
     */
    private createToken(tokenType: TokenType): Token {
        if (this.buffer.length === 0) throw new Error('Cannot create token from empty buffer');
        let value = this.buffer.map(c => c.value).join('');

        // For a multi-line comment, manually add the closing slash
        // that was consumed by the state machine.
        if (tokenType === TokenType.COMMENT && value.startsWith('/*')) {
            value += '/';
        }

        const otherToken: CreateTokenFn = (newValue: string, newType?: TokenType) => {
            return { value: newValue, type: newType ?? TokenType.OTHER };
        }

        const tokenFn = Tokenizer.TOKENMAP[tokenType] ?? otherToken;
        return tokenFn(value, tokenType);
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

    public withLogging(message?: string): this {
        this.shouldLog = true;
        if (message) this.message = message;
        return this;
    }

    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = '';
        return this;
    }

    private logHeader(stream: CharacterStream): void {
        if (!this.shouldLog) return;
        PrintLine({
            preNewLine: false,
            postNewLine: true,
            color: 'red',
            textColor: 'magenta',
            text: this.message,
        });
        console.log(CenterText(styleText('yellow', 'SOURCE:\n')));
        BoxText(stream.get(), {
            width: 50,
            boxStyle: 'double',
            textColor: 'yellow',
        });
        PrintLine({ preNewLine: true, postNewLine: true });
    }

    private logResults(tokens: Token[]): void {
        if (!this.shouldLog) return;

        console.log(styleText('yellow', 'RESULT (TOKENS):'));

        for (const token of tokens) {
            console.log(`${Spacer(3)}${inspect(token, this.inspectOptions)}`);
        }

        PrintLine({ preNewLine: true, postNewLine: false, color: 'red' });
        this.shouldLog = false;
        this.message = '';
    }
}

export {
    type Token,
    Tokenizer
}
