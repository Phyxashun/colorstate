// src/Tokenizer.ts

import { inspect, type InspectOptions } from 'node:util';
import { State, Initial_State } from './States.ts';
import { Context } from './Context.ts';
import { Character, CharType, CharacterStream, CharacterArrayStream } from './Character.ts';
import type { Mode } from 'node:fs';

enum TokenType {
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
    WHITESPACE = 'WHITESPACE',
    EOF = '<end>',
    ERROR = '<error>',
}

interface Token {
    value: string;
    type: TokenType;
}

enum ModeType {
    Token = 'TOKEN',
    Character = 'CHARACTER',
}

type TokenizerInput = string | Character[];

type TokenizerReturnMap = {
    [ModeType.Token]: Token[],
    [ModeType.Character]: Character[],
}

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
    private initialState: State;
    private shouldLog: boolean = false;
    private message: string | undefined = undefined;

    constructor(initialState = new Initial_State()) {
        this.initialState = initialState;
    }

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

        const sourceInfo = typeof input === 'string'
            ? input
            : `${input.length} characters`;
        console.log(`SOURCE:\t${sourceInfo}\n`);
        this.line();
    }

    private logResults<T extends ModeType>(result: TokenizerReturnMap[T], mode: T): void {
        if (!this.shouldLog) return;

        switch (mode) {
            case ModeType.Token:
                console.log(`RESULT (TOKENS):\n`);
                break;
            case ModeType.Character:
                console.log(`RESULT (${result.length} CHARACTERS):\n`);
                break;
        }

        for (const item of result) {
            console.log(`\t${inspect(item, this.inspectOptions)}`);
        }

        console.log(`\n`);
        this.line();

        this.shouldLog = false;
        this.message = undefined;
    }

    public tokenizeString(input: string): Token[] {
        return this.tokenize(input, ModeType.Token);
    }

    public tokenizeCharacters(input: Character[]): Token[] {
        return this.tokenize(input, ModeType.Token);
    }

    public getCharacters(input: string): Character[] {
        return this.tokenize(input, ModeType.Character);
    }

    private tokenize<T extends ModeType>(input: TokenizerInput, mode: T): TokenizerReturnMap[T] {
        const stream =
            (typeof input === 'string')
                ? new CharacterStream(input)
                : new CharacterArrayStream(input);

        const dfa: Context = new Context(this.initialState);
        const result: any[] = [];

        this.logHeader();
        this.logSource(input);

        // Process each character through the DFA
        for (const char of stream) {
            switch (mode) {
                case ModeType.Token:
                    const [tokenEmitted, token] = dfa.processTokens(char);
                    if (tokenEmitted) result.push(token);
                    break;

                case ModeType.Character:
                    const emitted = dfa.processCharacters(char);
                    if (emitted) (result as Character[]).push(emitted);
                    break;
            }
            if (char.type === CharType.EOF) break;
        }

        this.logResults(result, mode);
        return result;
    }
}

export {
    type Token,
    TokenType,
    Tokenizer
}