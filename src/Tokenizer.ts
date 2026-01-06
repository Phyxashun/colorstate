// src/Tokenizer.ts

import { inspect, styleText, type InspectOptions } from 'node:util';
import { Context } from './Context.ts';
import { type Character, CharType, CharacterStream } from './Character.ts';

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
type TokenTypeFn = (type: CharType) => boolean;
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

interface Token {
    value: string;
    type: TokenType;
}

type TokenizerInput = string;

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

    private line(newLine: boolean = true, width: number = 80): void {
        if (newLine) console.log(`${'─'.repeat(width)}\n`);
        if (!newLine) console.log(`${'─'.repeat(width)}`);
    }

    private logHeader(): void {
        if (!this.shouldLog) return;

        if (this.message) {
            console.log(`${this.message}\n`);
            return;
        }

        this.line();
        console.log('TOKENIZATION DEMO:\n');
        this.line();
    }

    private logSource(input: TokenizerInput): void {
        if (!this.shouldLog) return;
        console.log(`TOKENIZER:\n`);
        console.log(`SOURCE:\t'${input}'\n`);
    }

    private logResults(result: Token[]): void {
        if (!this.shouldLog) return;

        console.log(`RESULT (TOKENS):\n`);

        for (const item of result) {
            console.log(`\t${inspect(item, this.inspectOptions)}`);
        }

        console.log();
        this.line();

        this.shouldLog = false;
        this.message = undefined;
    }

    public tokenize(input: TokenizerInput): Token[] {
        const stream = new CharacterStream(input);
        const tokens: Token[] = [];

        this.logHeader();
        this.logSource(input);

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
            if (result.action === 'buffer' && char.type !== CharType.EOF) {
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
        [TokenType.START, (type) => type === CharType.Start],
        [TokenType.IDENTIFIER, (type) => type === CharType.Letter],
        [TokenType.HEXVALUE, (type) => type === CharType.Hash],
        [TokenType.NUMBER, (type) => type === CharType.Number],
        [TokenType.PERCENT, (type) => type === CharType.Percent],
        [TokenType.DIMENSION, (type) => type === CharType.Dimension],
        [TokenType.PLUS, (type) => type === CharType.Plus],
        [TokenType.MINUS, (type) => type === CharType.Minus],
        [TokenType.STAR, (type) => type === CharType.Star],
        [TokenType.DOT, (type) => type === CharType.Dot],
        [TokenType.COMMA, (type) => type === CharType.Comma],
        [TokenType.SLASH, (type) => type === CharType.Slash],
        [TokenType.LPAREN, (type) => type === CharType.LParen],
        [TokenType.RPAREN, (type) => type === CharType.RParen],
        [TokenType.NEWLINE, (type) => type === CharType.NewLine],
        [TokenType.WHITESPACE, (type) => type === CharType.Whitespace],
        [TokenType.EOF, (type) => type === CharType.EOF],
        [TokenType.OTHER, (type) => type === CharType.Other],
        [TokenType.ERROR, (type) => type === CharType.Error],
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
            case CharType.BackSlash:
                return isInString ? TokenType.ESCAPE : TokenType.SYMBOL;

            case CharType.EqualSign:
                return TokenType.EQUALS;

            case CharType.Unicode:
            case CharType.Tilde:
            case CharType.Exclamation:
            case CharType.At:
            case CharType.Dollar:
            case CharType.Question:
            case CharType.Caret:
            case CharType.Ampersand:
            case CharType.LessThan:
            case CharType.GreaterThan:
            case CharType.Underscore:
            case CharType.LBracket:
            case CharType.RBracket:
            case CharType.LBrace:
            case CharType.RBrace:
            case CharType.SemiColon:
            case CharType.Colon:
            case CharType.Pipe:
            case CharType.Symbol:
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