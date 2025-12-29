// src/Tokenizer.ts

import { inspect, type InspectOptions } from 'node:util';
import { State, InitialState } from './States.ts';
import { Context } from './Context.ts';
import { Character, CharType, CharacterStream, CharacterArrayStream } from './Character.ts';

interface Token {
    value: string;
    type: TokenType;
}

enum TokenType {
    // String and Numeric Literals
    IDENTIFIER = 'IDENTIFIER',  // words
    STRING = 'STRING',          // string literals
    HEXVALUE = 'HEXVALUE',      // hexadecimal values
    NUMBER = 'NUMBER',          // numeric literals
    PERCENT = 'PERCENT',        // numeric literals followed by '%'
    DIMENSION = 'DIMENSION',    // numeric literals followed by units
    UNICODE = 'UNICODE',        // unicode characters

    // Operator Tokens
    PLUS = 'PLUS',              // '+'
    MINUS = 'MINUS',            // '-'

    // Delimiter Tokens
    COMMA = 'COMMA',            // ','
    SLASH = 'SLASH',            // '/'
    LPAREN = 'LPAREN',          // '('
    RPAREN = 'RPAREN',          // ')'
    DELIMITER = 'DELIMITER',    // all other delimiters, punctuators
    OPERATOR = 'OPERATOR',

    // Possibly ignored Tokens
    WHITESPACE = 'WHITESPACE',  // all whitespace
    EOF = '<end>',              // end of file/line
    ERROR = '<error>',          // token error
};

class Tokenizer {
    private inspectOptions: InspectOptions;
    private initialState: State;
    private shouldLog: boolean = false;
    private message?: string;

    constructor(initialState = InitialState) {
        this.initialState = initialState;

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
    }

    // Fluent interface methods
    public withLogging(message?: string): this {
        this.shouldLog = true;
        this.message = message;
        return this;
    }

    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = undefined;
        return this;
    }

    // Main tokenize methods
    public tokenizeString(input: string): Token[] {
        return this.tokenize(input, 'tokens') as Token[];
    }

    public getCharacters(input: string): Character[] {
        return this.tokenize(input, 'characters') as Character[];
    }

    public tokenizeCharacters(input: Character[]): Token[] {
        return this.tokenize(input, 'tokens') as Token[];
    }

    private tokenize<T extends 'tokens' | 'characters'>(
        input: string | Character[],
        mode: T
    ): T extends 'tokens' ? Token[] : Character[] {
        const stream = typeof input === 'string'
            ? new CharacterStream(input)
            : new CharacterArrayStream(input);

        const dfa: Context = new Context(this.initialState);
        const result: any[] = [];

        if (this.shouldLog && this.message) {
            console.log(`\n${this.message}\n`);
        }

        if (this.shouldLog) {
            const sourceInfo = typeof input === 'string'
                ? input
                : `${input.length} characters`;
            console.log(`SOURCE:\t${sourceInfo}\n`);
        }

        for (const char of stream) {
            if (mode === 'tokens') {
                const emitted = dfa.processTokens(char);
                if (emitted) {
                    result.push(Context.toTokenType(emitted));
                }
            } else {
                const emitted = dfa.processCharacters(char);
                if (emitted) {
                    result.push(emitted);
                }
            }
            if (char.type === CharType.EOF) break;
        }

        if (this.shouldLog) {
            this.logResults(result, mode);
        }

        // Reset logging state for next call
        this.shouldLog = false;
        this.message = undefined;

        return result as any;
    }

    private logResults(result: any[], mode: 'tokens' | 'characters'): void {
        const resultHeader = mode === 'tokens'
            ? 'TOKENS'
            : `${result.length} CHARACTERS`;
        console.log(`RESULT (${resultHeader}):\n`);

        for (const item of result) {
            console.log(`\t`, inspect(item, this.inspectOptions));
        }
    }
} // End class Tokenizer

export {
    type Token,
    TokenType,
    Tokenizer
}
