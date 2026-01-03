// src/Tokenizer.ts

import { inspect, type InspectOptions } from 'node:util';
import { State, InitialState } from './States.ts';
import { Context } from './Context.ts';
import { Character, CharType, CharacterStream } from './Character.ts';
import type { Transition } from './Transition.ts';

enum TokenType {
    START = 'START',
    IDENTIFIER = 'IDENTIFIER',
    STRING = 'STRING',
    HEXVALUE = 'HEXVALUE',
    NUMBER = 'NUMBER',
    PERCENT = 'PERCENT',
    DIMENSION = 'DIMENSION',
    UNICODE = 'UNICODE',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    COMMA = 'COMMA',
    SLASH = 'SLASH',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    DELIMITER = 'DELIMITER',
    OPERATOR = 'OPERATOR',
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

    constructor(private ctx = new Context(InitialState)) { }

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
            console.log(`\n${this.message}\n`);
            return;
        }

        this.line();
        console.log('TOKENIZATION DEMO:\n');
        this.line();
    }

    private logSource(input: TokenizerInput): void {
        if (!this.shouldLog) return;
        console.log(`SOURCE:\t${input}\n`);
        this.line();
    }

    private logResults(result: Token[]): void {
        if (!this.shouldLog) return;

        console.log(`RESULT (TOKENS):\n`);

        for (const item of result) {
            console.log(`\t${inspect(item, this.inspectOptions)}`);
        }

        console.log(`\n`);
        this.line();

        this.shouldLog = false;
        this.message = undefined;
    }

    public tokenizeString(input: string): Token[] {
        return this.tokenize(input);
    }

    private tokenize(input: TokenizerInput): Token[] {
        const stream = new CharacterStream(input);
        const tokens: Token[] = [];

        this.logHeader();
        this.logSource(input);

        for (const char of stream) {
            const emitted: boolean = this.ctx.process(char);

            switch (emitted) {
                case false: {
                    this.buffer.push(char);
                    break;
                }

                case true: {
                    const token =
                        this.buffer.length > 0
                            ? Tokenizer.createToken(this.buffer)
                            : undefined;
                    this.buffer = [];
                    if (token) tokens.push(token);
                    console.log(`C. EmitAndTo.\tTOKEN: ${inspect(token, this.inspectOptions)}`);
                    break;
                }
            }

            if (char.type === CharType.EOF) {
                const token = { value: '', type: TokenType.EOF };
                console.log(`D. EOF Char.\tTOKEN: ${inspect(token, this.inspectOptions)}\n`);
                tokens.push(token)
            }
        }
        this.buffer = [];
        this.logResults(tokens);
        return tokens;
    }

    public static createToken(chars: Character[]): Token {
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

        const token = Tokenizer.toTokenType(ch);
        return token;
    }

    public static toTokenType(char: Character): Token {
        const value = char.value;

        if (value.endsWith("%")) {
            return { value, type: TokenType.PERCENT };
        }

        switch (char.type) {
            case CharType.EOF:
                return { value, type: TokenType.EOF };

            case CharType.Whitespace:
                return { value, type: TokenType.WHITESPACE };

            case CharType.NewLine:
                return { value, type: TokenType.NEWLINE }

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



            default:
                return { value, type: TokenType.ERROR };
        }
    }
}

export {
    type Token,
    TokenType,
    Tokenizer
}