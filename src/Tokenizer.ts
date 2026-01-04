// src/Tokenizer.ts

import { inspect, styleText, type InspectOptions } from 'node:util';
import { Context } from './Context.ts';
import { type Character, CharType, CharacterStream } from './Character.ts';

type ClassifyTokenFn = (char: Character) => Token;
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
    ERROR = 'ERROR',
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
    private buffer: Character[] = [];
    private shouldLog: boolean = false;
    private message: string | undefined = undefined;

    constructor(private ctx = new Context()) { }

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
            const wasInStringState = this.ctx.getCurrentState().name === 'StringState';

            let result = this.ctx.process(char);

            if (result.endString) {
                tokens.push(Tokenizer.createToken(this.buffer, true));
                this.buffer = [];
            }

            if (result.emit) {
                if (this.buffer.length > 0) {
                    tokens.push(Tokenizer.createToken(this.buffer, wasInStringState));
                    this.buffer = [];
                }

                if (result.reprocess) {
                    result = this.ctx.process(char);
                }
            }

            if (this.ctx.isInString()) {
                if (
                    char.type !== CharType.SingleQuote &&
                    char.type !== CharType.DoubleQuote &&
                    char.type !== CharType.Backtick
                ) {
                    this.buffer.push(char);
                }
            } else {
                if (
                    this.ctx.isAccepting() &&
                    char.type !== CharType.EOF
                ) {
                    this.buffer.push(char);
                }
            }
        }

        if (this.buffer.length > 0) {
            const wasInString = this.ctx.getCurrentState().name === 'StringState';
            tokens.push(Tokenizer.createToken(this.buffer, wasInString));
            this.buffer = [];
        }

        tokens.push({ value: '', type: TokenType.EOF });

        this.buffer = [];
        this.logResults(tokens);
        return tokens;
    }

    public static createToken(chars: Character[], wasInString: boolean = false): Token {
        if (chars.length === 0) throw new Error('Cannot create token from empty buffer');

        let value = '';
        for (const ch of chars) {
            value += ch.value;
        }

        const ch = {
            value,
            type: chars[0]!.type,
            position: chars[0]!.position
        };

        if (wasInString) {
            return { value, type: TokenType.STRING };
        }

        const token = Tokenizer.classify(ch);
        return token;
    }

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
        [TokenType.ESCAPE, (type) => type === CharType.BackSlash],
        [TokenType.LPAREN, (type) => type === CharType.LParen],
        [TokenType.RPAREN, (type) => type === CharType.RParen],
        [TokenType.NEWLINE, (type) => type === CharType.NewLine],
        [TokenType.WHITESPACE, (type) => type === CharType.Whitespace],
        [TokenType.EOF, (type) => type === CharType.EOF],
        [TokenType.ERROR, (type) => type === CharType.Error],
    ])

    private static classify: ClassifyTokenFn = (char: Character): Token => {
        const value = char.value;
        let result: Token = { value, type: TokenType.ERROR };

        if (value.endsWith('%')) {
            char.type = CharType.Percent;
            result = { value, type: TokenType.PERCENT };
        }

        if (
            value.endsWith('deg') ||
            value.endsWith('grad') ||
            value.endsWith('rad') ||
            value.endsWith('turn')
        ) {
            char.type = CharType.Dimension;
            result = { value, type: TokenType.DIMENSION };
        }

        switch (char.type) {
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
            case CharType.EqualSign:
            case CharType.LBracket:
            case CharType.RBracket:
            case CharType.LBrace:
            case CharType.RBrace:
            case CharType.SemiColon:
            case CharType.Colon:
            case CharType.Pipe:
            case CharType.Symbol:
                result = { value, type: TokenType.SYMBOL }
                break;

            default:
                for (const [tokenType, fn] of Tokenizer.TokenSpec) {
                    if (fn(char.type)) {
                        result = { value, type: tokenType };
                    }
                }
                break;
        }

        return result;
    };

}

export {
    type Token,
    TokenType,
    Tokenizer
}