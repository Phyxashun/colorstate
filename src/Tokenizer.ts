// src/Tokenizer.ts

import { inspect, styleText, type InspectOptions } from 'node:util';
import { Context } from './Context.ts';
import Char, { type Character } from './Character.ts';

export const MAX_WIDTH: number = 80;

enum Line  {
    Default = '─',
    Square = '■',
    Bold = '█',
    Dashed = '-',
    Underscore = '_',
    DoubleUnderscore = '‗',
    Equals = '=',
    Double = '═',
    BoldBottom = '▄',
    BoldTop = '▀',
    Diaeresis = '¨',
    Macron = '¯',
    Section = '§',
    Interpunct = '·',
    LightBlock = '░',
    MediumBlock = '▒',
    HeavyBlock = '▓',
};

const inspectOptions: InspectOptions = {
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

type ClassifyTokenFn = (char: Character, isInString: boolean) => TokenType;
type TokenTypeFn = (type: Char.Type) => boolean;
type TokenSpec = Map<TokenType, TokenTypeFn>;

enum TokenType {
    START = 'START',
    IDENTIFIER = 'IDENTIFIER',
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

/**
 * @interface PrintLineOptions
 * @description Defines the structure for a printLine options object.
 * @property {boolean} preNewLine - If true, adds a newline before the divider.
 * @property {boolean} postNewLine - If true, adds a newline after the divider.
 * @property {number} width - The width of the line.
 * @property {string} line - The character to use for the line.
 */
interface PrintLineOptions {
    preNewLine?: boolean;
    postNewLine?: boolean;
    width?: number;
    line?: Line;
}

/**
 * @description Default options object for the printLine function.
 */
const defaultPrintLineOptions: PrintLineOptions = {
    preNewLine: false,  // No preceding new line
    postNewLine: false, // No successive new line
    width: MAX_WIDTH,   // Use global const MAX_WIDTH = 80
    line: Line.Double,    // Use global const LINE_CHAR = '='          
};

interface Token {
    value: string;
    type: TokenType;
}

type TokenizerInput = Char.Stream;

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
    private message: string | undefined = undefined;

    constructor() { }

    public withLogging(message?: string): this {
        this.shouldLog = true;
        this.message = message || undefined;
        return this;
    }

    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = undefined;
        return this;
    }

    /**
     * @function printLine
     * @description Prints a styled horizontal line to the console.
     * @param {PrintLineOptions} [options={}] - Configuration options for the line.
     * @returns {void}
     */
    private printLine = (options: PrintLineOptions = {}): void => {
        const { preNewLine, postNewLine, width, line } = {
            ...defaultPrintLineOptions,
            ...options
        };
        const pre = preNewLine ? '\n' : '';
        const post = postNewLine ? '\n' : '';
        const styledDivider = styleText(['gray', 'bold'], line!.repeat(width!));
        console.log(`${pre}${styledDivider}${post}`);
    };

    private logHeader(): void {
        if (!this.shouldLog) return;
        this.printLine();
        this.message = this.message ? this.message : `TOKENIZATION DEMONSTRATION:`;
        console.log(`TOKENIZER:\n\t${this.message}\n`);
    }

    private logSource(input: TokenizerInput): void {
        if (!this.shouldLog) return;
        console.log(`SOURCE:\t${inspect(input.get(), this.inspectOptions)}\n`);
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
        this.message = undefined;
    }

    public tokenize(stream: Char.Stream): Token[] {
        const tokens: Token[] = [];

        this.logHeader();
        this.logSource(stream);

        for (const char of stream) {
            const wasInString = this.ctx.isInString();
            let result = this.ctx.process(char);

            // 1. Handle Emitting (Flush buffer)
            if (result.emit && this.buffer.length > 0) {
                tokens.push(Tokenizer.createToken(this.buffer, wasInString));
                this.buffer = [];
            }

            // 2. Handle Reprocessing (If the char belongs to the next state)
            if (result.reprocess) {
                result = this.ctx.process(char);
                if (result.emit && this.buffer.length > 0) {
                    tokens.push(Tokenizer.createToken(this.buffer, wasInString));
                    this.buffer = [];
                }
            }

            // 3. Buffer the character based on the Context's decision
            if (result.action === 'buffer' && char.type !== Char.Type.EOF) {
                this.buffer.push(char);
            }
        }

        // Flush remaining buffer
        if (this.buffer.length > 0) {
            tokens.push(Tokenizer.createToken(this.buffer, this.ctx.isInString()));
        }

        tokens.push({ value: '', type: TokenType.EOF });

        this.buffer = [];
        this.logResults(tokens);
        return tokens;
    }

    public static createToken(chars: Character[], isInString: boolean = false): Token {
        if (chars.length === 0) throw new Error('Cannot create token from empty buffer');

        let value = '';
        for (const ch of chars) {
            value += ch.value;
        }

        if (isInString) {
            const unescaped = Tokenizer.unescapeString(value);
            console.log('CREATETOKEN: VALUE:', inspect(value, inspectOptions))
            return {
                value: unescaped,
                type: TokenType.STRING
            };
        }

        const keywordType = Tokenizer.KEYWORDS[value];
        if (keywordType) return { value, type: keywordType };

        const ch = {
            value,
            type: chars[0]!.type,
            position: chars[0]!.position
        };

        return {
            value,
            type: Tokenizer.classify(ch, isInString)
        };
    }

    private static KEYWORDS: Record<string, TokenType> = {
        'const': TokenType.CONST,
        'let': TokenType.LET,
        'for': TokenType.FOR,
        'of': TokenType.OF,
        'new': TokenType.NEW,
    };

    private static TokenSpec: TokenSpec = new Map<TokenType, TokenTypeFn>([
        [TokenType.IDENTIFIER, (type) => type === Char.Type.Letter],
        [TokenType.HEXVALUE, (type) => type === Char.Type.Hash || type === Char.Type.Hex],
        [TokenType.NUMBER, (type) => type === Char.Type.Number],
        [TokenType.PERCENT, (type) => type === Char.Type.Percent],
        [TokenType.PLUS, (type) => type === Char.Type.Plus],
        [TokenType.MINUS, (type) => type === Char.Type.Minus],
        [TokenType.STAR, (type) => type === Char.Type.Star],
        [TokenType.DOT, (type) => type === Char.Type.Dot],
        [TokenType.COMMA, (type) => type === Char.Type.Comma],
        [TokenType.SLASH, (type) => type === Char.Type.Slash],
        [TokenType.LPAREN, (type) => type === Char.Type.LParen],
        [TokenType.RPAREN, (type) => type === Char.Type.RParen],
        [TokenType.NEWLINE, (type) => type === Char.Type.NewLine],
        [TokenType.WHITESPACE, (type) => type === Char.Type.Whitespace],
        [TokenType.EOF, (type) => type === Char.Type.EOF],
        [TokenType.OTHER, (type) => type === Char.Type.Other],
        [TokenType.ERROR, (type) => type === Char.Type.Error],
    ])

    private static classify: ClassifyTokenFn = (char: Character, isInString: boolean = false): TokenType => {
        const value = char.value;

        if (isInString) return TokenType.STRING;

        if (value.endsWith('%')) {
            return TokenType.PERCENT;
        }

        if (value.startsWith('#')) return TokenType.HEXVALUE;

        if (value.endsWith('deg') || value.endsWith('grad') ||
            value.endsWith('rad') || value.endsWith('turn')) {
            return TokenType.DIMENSION;
        }

        switch (char.type) {
            case Char.Type.BackSlash:
                return isInString ? TokenType.ESCAPE : TokenType.SYMBOL;

            case Char.Type.EqualSign:
                return TokenType.EQUALS;

            case Char.Type.Unicode:
            case Char.Type.Tilde:
            case Char.Type.Exclamation:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Question:
            case Char.Type.Caret:
            case Char.Type.Ampersand:
            case Char.Type.LessThan:
            case Char.Type.GreaterThan:
            case Char.Type.Underscore:
            case Char.Type.LBracket:
            case Char.Type.RBracket:
            case Char.Type.LBrace:
            case Char.Type.RBrace:
            case Char.Type.SemiColon:
            case Char.Type.Colon:
            case Char.Type.Pipe:
            case Char.Type.Symbol:
                return TokenType.SYMBOL;

            default:
                for (const [tokenType, fn] of Tokenizer.TokenSpec) {
                    if (fn(char.type)) {
                        return tokenType;
                    }
                }
                break;
        }
        return TokenType.OTHER;
    };

    /**
     * Converts escaped sequences in a string to their actual characters
     * Supports: \n, \t, \r, \', \", \\, \uXXXX, \xXX
     */
    private static unescapeString(input: string): string {
        return input.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[nrt'\"\\])/g, (match, seq) => {
            switch (true) {
                // Unicode escape: \uXXXX
                case /^u[0-9a-fA-F]{4}$/.test(seq):
                    return String.fromCharCode(parseInt(seq.slice(1), 16));

                // Hex escape: \xXX
                case /^x[0-9a-fA-F]{2}$/.test(seq):
                    return String.fromCharCode(parseInt(seq.slice(1), 16));

                // Single-character escapes
                case seq === 'n':
                    return '\n';
                case seq === 'r':
                    return '\r';
                case seq === 't':
                    return '\t';
                case seq === "'":
                    return "'";
                case seq === '"':
                    return '"';
                case seq === '\\':
                    return '\\';

                default:
                    return seq;
            }
        });
    }

}

export {
    type Token,
    TokenType,
    Tokenizer
}