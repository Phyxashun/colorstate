// src/Tokenizer.ts

import { inspect, type InspectOptions } from 'node:util';
import { State, InitialState } from './States.ts';
import { Context } from './Context.ts';
import { Character, CharType, CharacterStream, CharacterArrayStream } from './Character.ts';

/**
 * Represents a semantic token with type and value
 */
interface Token {
    /** The string value of the token */
    value: string;
    /** The semantic type of the token */
    type: TokenType;
}

/**
 * Enumeration of all token types produced by the tokenizer
 * Provides semantic meaning to character sequences
 */
enum TokenType {
    // String and Numeric Literals
    /** Word/identifier tokens (e.g., 'red', 'myVar') */
    IDENTIFIER = 'IDENTIFIER',
    /** String literal tokens */
    STRING = 'STRING',
    /** Hexadecimal color values (e.g., '#ff0000') */
    HEXVALUE = 'HEXVALUE',
    /** Numeric literal tokens (e.g., '42', '3.14') */
    NUMBER = 'NUMBER',
    /** Percentage values (e.g., '50%') */
    PERCENT = 'PERCENT',
    /** Numeric values with units (e.g., '10px', '2em') */
    DIMENSION = 'DIMENSION',
    /** Unicode character tokens */
    UNICODE = 'UNICODE',

    // Operator Tokens
    /** Plus operator '+' */
    PLUS = 'PLUS',
    /** Minus operator '-' */
    MINUS = 'MINUS',

    // Delimiter Tokens
    /** Comma delimiter ',' */
    COMMA = 'COMMA',
    /** Slash delimiter '/' */
    SLASH = 'SLASH',
    /** Left parenthesis '(' */
    LPAREN = 'LPAREN',
    /** Right parenthesis ')' */
    RPAREN = 'RPAREN',
    /** Generic delimiter for punctuation */
    DELIMITER = 'DELIMITER',
    /** Generic operator token */
    OPERATOR = 'OPERATOR',

    // Special Tokens
    /** Whitespace token (spaces, tabs) */
    WHITESPACE = 'WHITESPACE',
    /** End of file marker */
    EOF = '<end>',
    /** Error token for unrecognized input */
    ERROR = '<error>',
}

/**
 * Main tokenizer class that processes input into semantic tokens
 * Supports both multi-character token accumulation and single-character emission
 * Uses a fluent interface for optional logging
 */
class Tokenizer {
    /** Options for inspect output formatting */
    private inspectOptions: InspectOptions;
    /** Initial state for the DFA */
    private initialState: State;
    /** Flag to enable console logging */
    private shouldLog: boolean = false;
    /** Optional message to display when logging */
    private message?: string;

    /**
     * Creates a new Tokenizer instance
     * @param initialState - The starting state for the DFA (default: InitialState)
     */
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

    /**
     * Enables logging with an optional message
     * Part of the fluent interface - returns this for chaining
     * @param message - Optional message to display when logging
     * @returns This tokenizer instance for method chaining
     * @example
     * tokenizer.withLogging('Test 1').tokenizeString(input);
     */
    public withLogging(message?: string): this {
        this.shouldLog = true;
        this.message = message;
        return this;
    }

    /**
     * Disables logging
     * Part of the fluent interface - returns this for chaining
     * @returns This tokenizer instance for method chaining
     */
    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = undefined;
        return this;
    }

    /**
     * Tokenizes a string input into semantic tokens
     * Accumulates multi-character sequences (e.g., 'hello', '123')
     * @param input - The string to tokenize
     * @returns Array of semantic tokens
     * @example
     * const tokens = tokenizer.tokenizeString('rgb(255, 0, 0)');
     * // Returns: [IDENTIFIER, LPAREN, NUMBER, COMMA, NUMBER, COMMA, NUMBER, RPAREN]
     */
    public tokenizeString(input: string): Token[] {
        return this.tokenize(input, 'tokens') as Token[];
    }

    /**
     * Extracts individual characters from a string input
     * Each character is emitted separately with position metadata
     * @param input - The string to process
     * @returns Array of individual characters
     * @example
     * const chars = tokenizer.getCharacters('hi');
     * // Returns: [{value: 'h', ...}, {value: 'i', ...}]
     */
    public getCharacters(input: string): Character[] {
        return this.tokenize(input, 'characters') as Character[];
    }

    /**
     * Tokenizes an array of characters into semantic tokens
     * Useful for re-tokenizing previously extracted characters
     * @param input - Array of characters to tokenize
     * @returns Array of semantic tokens
     * @example
     * const chars = tokenizer.getCharacters('hello');
     * const tokens = tokenizer.tokenizeCharacters(chars);
     */
    public tokenizeCharacters(input: Character[]): Token[] {
        return this.tokenize(input, 'tokens') as Token[];
    }

    /**
     * Internal tokenization engine
     * Processes input through the DFA and emits tokens or characters
     * @param input - String or character array to process
     * @param mode - 'tokens' for multi-character tokens, 'characters' for single chars
     * @returns Array of tokens or characters depending on mode
     */
    private tokenize<T extends 'tokens' | 'characters'>(
        input: string | Character[],
        mode: T
    ): T extends 'tokens' ? Token[] : Character[] {
        // Create appropriate stream based on input type
        const stream = typeof input === 'string'
            ? new CharacterStream(input)
            : new CharacterArrayStream(input);

        const dfa: Context = new Context(this.initialState);
        const result: any[] = [];

        // Log header if enabled
        if (this.shouldLog && this.message) {
            console.log(`\n${this.message}\n`);
        }

        // Log source input
        if (this.shouldLog) {
            const sourceInfo = typeof input === 'string'
                ? input
                : `${input.length} characters`;
            console.log(`SOURCE:\t${sourceInfo}\n`);
        }

        // Process each character through the DFA
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

        // Log results if enabled
        if (this.shouldLog) {
            this.logResults(result, mode);
        }

        // Reset logging state for next call
        this.shouldLog = false;
        this.message = undefined;

        return result as any;
    }

    /**
     * Logs the results of tokenization to the console
     * Formats output based on mode (tokens vs characters)
     * @param result - Array of tokens or characters to log
     * @param mode - The processing mode used
     */
    private logResults(result: any[], mode: 'tokens' | 'characters'): void {
        const resultHeader = mode === 'tokens'
            ? 'TOKENS'
            : `${result.length} CHARACTERS`;
        console.log(`RESULT (${resultHeader}):\n`);

        for (const item of result) {
            console.log(`\t`, inspect(item, this.inspectOptions));
        }
    }
}

export {
    type Token,
    TokenType,
    Tokenizer
}