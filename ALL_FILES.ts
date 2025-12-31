// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';

const inspectOptions: InspectOptions = {
    showHidden: false,
    depth: null,
    colors: true,
    compact: false,
};

console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

// Test cases
const testCases = [
    '1 + 2',
    '10 - 5 + 3',
    '2 * 3 + 4',
    'rgb(255, 0, 0)',
    '#ff0000',
    '50%',
    '(1 + 2) * 3',
    '-5 + 10',
    'rgba(255, 128, 0, 50%)',
];

for (const input of testCases) {
    console.log(`\nINPUT: ${input}`);
    console.log('─'.repeat(50));

    // Step 1: Tokenize
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.tokenizeString(input);

    console.log('\nTOKENS:');
    tokens.forEach(token => {
        console.log(`  ${token.type.padEnd(15)} "${token.value}"`);
    });

    // Step 2: Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    console.log('\nAST:');
    console.log(inspect(ast, inspectOptions));
}

const old_test = () => {
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

    // Fluent usage
    const tokenizer = new Tokenizer();

    // Test 1
    tokenizer
        .withLogging('TEST (1): Direct Tokenization from String')
        .tokenizeString('67 a b c 1 word 2 3+2-0');

    // Test 2
    const characters = tokenizer
        .withLogging('TEST (2): Character Stream Only')
        .getCharacters('67 a b c 1 word 2 3+2-0');

    // Test 3
    tokenizer
        .withLogging('TEST (3): Tokenize from Character Array')
        .tokenizeCharacters(characters);

    // Test 4 - With logging
    const newChar = tokenizer
        .withLogging('TEST (4): Character Stream and Tokenize from Character Array')
        .getCharacters('quick test')

    // Test 4 - Without logging
    const tokens = tokenizer.tokenizeCharacters(newChar);

    // ...output for testing only
    for (const t of tokens) {
        console.log('\nTOKEN:', inspect(t, inspectOptions));
    }

    // Test 5
    tokenizer
        .withLogging('TEST (5): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100 128 255 / 0.5)');

    // Test 6
    tokenizer
        .withLogging('TEST (6): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100% 360 220  / 50%)');

    // Test 7
    tokenizer
        .withLogging('TEST (7): Direct Tokenization from Hex Color String')
        .tokenizeString('#ff00ff00');
}





// src/Transition.ts

import { State } from './States.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: State }
    | { kind: 'EmitAndTo'; state: State }
    | { kind: 'End' };

export const Transition = {
    Stay: (): Transition => ({ kind: 'Stay' }),
    To: (state: State): Transition => ({ kind: 'To', state }),
    EmitAndTo: (state: State): Transition => ({ kind: 'EmitAndTo', state }),
    End: (): Transition => ({ kind: 'End' }),
};





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

        result.push({ value: '', type: TokenType.EOF });

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





// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
import { Transition } from './Transition';

/**
 * Abstract base class for all DFA states
 * Each state handles character transitions and determines if it's an accepting state
 */
abstract class State {
    /** Inspect options for debugging and logging */
    protected inspectOptions: InspectOptions = {
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

    /**
     * Returns a formatted string representation of this state
     * @returns Formatted string for debugging
     */
    public toString(): string {
        return `\n\t${inspect(this, this.inspectOptions)} \n`;
    }

    /**
     * Processes a character and determines state transitions
     * Must be implemented by each concrete state
     * @param char - The character to handle
     */
    public abstract handle(char: Character): Transition;

    /**
     * Indicates whether this state accepts tokens
     * Accepting states can emit tokens when exited
     * @returns True if this is an accepting state
     */
    public abstract isAccepting(): boolean;
}


/**
 * Initial non-accepting state
 * Routes characters to appropriate accepting states
 * Used as the default state between tokens
 */
class Initial_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Initial_State
     * @returns The singleton Initial_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    /**
     * Routes characters to appropriate accepting states based on character type
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Whitespace:
                return Transition.To(Whitespace_State.instance);
            case CharType.EOF:
                return Transition.To(End_State.instance);
            case CharType.Hash:
                return Transition.To(Hex_State.instance);
            case CharType.Operator:
                return Transition.To(Operator_State.instance);
            case CharType.Letter:
                return Transition.To(Letter_State.instance);
            case CharType.Number:
                return Transition.To(Number_State.instance);
            default:
                return Transition.Stay();
        }
    }

    /**
     * Initial state is non-accepting (doesn't emit tokens)
     * @returns False - this state doesn't accept tokens
     */
    public isAccepting(): boolean {
        return false;
    }
}

/**
 * Whitespace accepting state
 * Accumulates consecutive whitespace characters into a single token
 */
class Whitespace_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Whitespace_State
     * @returns The singleton Whitespace_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Whitespace_State();
        }
        return this.#instance;
    }

    /**
     * Stays in whitespace state for consecutive whitespace
     * Transitions to initial state for any non-whitespace character
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        if (char.type === CharType.Whitespace) {
            return Transition.Stay();
        }
        return Transition.EmitAndTo(Initial_State.instance);
    }

    /**
     * Whitespace state accepts tokens
     * @returns True - whitespace can be emitted as a token
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Hexadecimal value accepting state
 * Handles hex color codes like #ff0000 or #abc
 */
class Hex_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Hex_State
     * @returns The singleton Hex_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Hex_State();
        }
        return this.#instance;
    }

    /**
     * Accumulates hash, letters, and numbers for hex values
     * Transitions to initial state for any other character
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Hash:
            case CharType.Letter:
            case CharType.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }

    /**
     * Hex state accepts tokens
     * @returns True - hex values can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Letter/Identifier accepting state
 * Accumulates consecutive letter characters into identifiers
 */
class Letter_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Letter_State
     * @returns The singleton Letter_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    /**
     * Stays in letter state for consecutive letters
     * Transitions to initial state for non-letter characters
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        if (char.type === CharType.Letter) {
            return Transition.Stay();
        }
        return Transition.EmitAndTo(Initial_State.instance)
    }

    /**
     * Letter state accepts tokens
     * @returns True - identifiers can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Number accepting state
 * Accumulates consecutive digit characters into numbers
 * Can transition to percent state if followed by %
 */
class Number_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Number_State
     * @returns The singleton Number_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    /**
     * Stays in number state for consecutive digits
     * Transitions to percent state if % follows a number
     * Transitions to initial state for other characters
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Number:
                return Transition.Stay();
            case CharType.Percent:
                return Transition.To(Percent_State.instance);
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }

    /**
     * Number state accepts tokens
     * @returns True - numbers can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Percent accepting state
 * Handles percentage values (e.g., 50%)
 */
class Percent_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Percent_State
     * @returns The singleton Percent_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    /**
     * Transitions to initial state for any non-percent character
     * Percent is typically a single-character suffix
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }

    /**
     * Percent state accepts tokens
     * @returns True - percentage values can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * Operator accepting state
 * Handles operator characters like +, -, *, /, etc.
 */
class Operator_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of Operator_State
     * @returns The singleton Operator_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Operator_State();
        }
        return this.#instance;
    }

    /**
     * Transitions to initial state for any non-operator character
     * Operators are typically single characters or short sequences
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        /* istanbul ignore if -- @preserve */
        if (char.type === CharType.Operator) {
            return Transition.Stay();
        }
        return Transition.EmitAndTo(Initial_State.instance);
    }

    /**
     * Operator state accepts tokens
     * @returns True - operators can be emitted as tokens
     */
    public isAccepting(): boolean {
        return true;
    }
}


/**
 * End/EOF accepting state
 * Terminal state when end of file is reached
 */
class End_State extends State {
    /** Singleton instance */
    static #instance: State;

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of End_State
     * @returns The singleton End_State instance
     */
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    /**
     * Transitions to initial state if more input arrives after EOF
     * Typically EOF is terminal, but this handles edge cases
     * @param char - The character to process
     */
    public handle(char: Character): Transition {
        return Transition.End();
    }

    /**
     * End state accepts tokens
     * @returns True - EOF can be emitted as a token
     */
    public isAccepting(): boolean {
        return true;
    }
}


// Export singleton instance aliases for convenience
const InitialState = Initial_State.instance;
const WhitespaceState = Whitespace_State.instance;
const HexState = Hex_State.instance;
const LetterState = Letter_State.instance;
const NumberState = Number_State.instance;
const PercentState = Percent_State.instance;
const OperatorState = Operator_State.instance;
const EndState = End_State.instance;

export {
    State,
    InitialState,
    WhitespaceState,
    HexState,
    LetterState,
    NumberState,
    PercentState,
    OperatorState,
    EndState,
    Initial_State,
    Whitespace_State,
    Hex_State,
    Letter_State,
    Number_State,
    Percent_State,
    Operator_State,
    End_State,
}






// src/Parser.ts

import { type Token, TokenType } from './Tokenizer.ts';
import {
    NodeType,
    type Program,
    type Expression,
    type Statement,
    type ExpressionStatement,
    type Identifier,
    type NumericLiteral,
    type HexLiteral,
    type PercentLiteral,
    type BinaryExpression,
    type UnaryExpression,
    type CallExpression,
    type GroupExpression,
    type SourceLocation,
} from './AST.ts';

/**
 * Recursive descent parser for converting tokens into an AST
 * 
 * Grammar:
 * Program         → Statement*
 * Statement       → Expression
 * Expression      → Addition
 * Addition        → Multiplication ( ("+" | "-") Multiplication )*
 * Multiplication  → Unary ( ("*" | "/") Unary )*
 * Unary           → ("+" | "-") Unary | Call
 * Call            → Primary ( "(" Arguments? ")" )?
 * Arguments       → Expression ( "," Expression )*
 * Primary         → NUMBER | PERCENT | HEXVALUE | IDENTIFIER | "(" Expression ")"
 */
export class Parser {
    /** Array of tokens to parse */
    private tokens: Token[];
    /** Current position in token array */
    private current: number = 0;

    /**
     * Creates a new Parser instance
     * @param tokens - Array of tokens from the tokenizer
     */
    constructor(tokens: Token[]) {
        // Filter out whitespace tokens
        this.tokens = tokens.filter(t => t.type !== TokenType.WHITESPACE);
    }

    /**
     * Parses tokens into an AST
     * @returns Program node containing all statements
     */
    public parse(): Program {
        const statements: Statement[] = [];

        while (!this.isAtEnd()) {
            // Skip EOF tokens
            if (this.check(TokenType.EOF)) {
                this.advance();
                continue;
            }

            const stmt = this.statement();
            if (stmt) {
                statements.push(stmt);
            }
        }

        return {
            type: NodeType.Program,
            body: statements,
        };
    }

    /**
     * Parses a statement
     * Currently only supports expression statements
     * @returns Statement node
     */
    private statement(): Statement {
        return this.expressionStatement();
    }

    /**
     * Parses an expression statement
     * @returns ExpressionStatement node
     */
    private expressionStatement(): ExpressionStatement {
        const expr = this.expression();
        return {
            type: NodeType.ExpressionStatement,
            expression: expr,
        };
    }

    /**
     * Parses an expression (entry point)
     * @returns Expression node
     */
    private expression(): Expression {
        return this.addition();
    }

    /**
     * Parses addition and subtraction (left-associative)
     * Addition → Multiplication ( ("+" | "-") Multiplication )*
     * @returns Expression node
     */
    private addition(): Expression {
        let expr = this.multiplication();

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value as '+' | '-';
            const right = this.multiplication();
            expr = {
                type: NodeType.BinaryExpression,
                operator,
                left: expr,
                right,
            } as BinaryExpression;
        }

        return expr;
    }

    /**
     * Parses multiplication and division (left-associative)
     * Multiplication → Unary ( ("*" | "/") Unary )*
     * @returns Expression node
     */
    private multiplication(): Expression {
        let expr = this.unary();

        while (this.match(TokenType.SLASH, TokenType.OPERATOR)) {
            const op = this.previous().value;
            if (op !== '*' && op !== '/' && op !== '%') break;

            const operator = op as '*' | '/' | '%';
            const right = this.unary();
            expr = {
                type: NodeType.BinaryExpression,
                operator,
                left: expr,
                right,
            } as BinaryExpression;
        }

        return expr;
    }

    /**
     * Parses unary expressions (prefix operators)
     * Unary → ("+" | "-") Unary | Call
     * @returns Expression node
     */
    private unary(): Expression {
        if (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value as '+' | '-';
            const argument = this.unary();
            return {
                type: NodeType.UnaryExpression,
                operator,
                argument,
            } as UnaryExpression;
        }

        return this.call();
    }

    /**
     * Parses function calls
     * Call → Primary ( "(" Arguments? ")" )?
     * @returns Expression node
     */
    private call(): Expression {
        let expr = this.primary();

        // Check for function call: identifier(args)
        if (expr.type === 'Identifier' && this.match(TokenType.LPAREN)) {
            const args: Expression[] = [];

            if (!this.check(TokenType.RPAREN)) {
                do {
                    args.push(this.expression());
                } while (this.match(TokenType.COMMA));
            }

            this.consume(TokenType.RPAREN, "Expected ')' after arguments");

            expr = {
                type: NodeType.CallExpression,
                callee: expr as Identifier,
                arguments: args,
            } as CallExpression;
        }

        return expr;
    }

    /**
     * Parses primary expressions (literals and grouped expressions)
     * Primary → NUMBER | PERCENT | HEXVALUE | IDENTIFIER | "(" Expression ")"
     * @returns Expression node
     */
    private primary(): Expression {
        // Number literal
        if (this.match(TokenType.NUMBER)) {
            const token = this.previous();
            return {
                type: NodeType.NumericLiteral,
                value: parseFloat(token.value),
                raw: token.value,
            } as NumericLiteral;
        }

        // Percentage literal
        if (this.match(TokenType.PERCENT)) {
            const token = this.previous();
            const numStr = token.value.replace('%', '');
            return {
                type: NodeType.PercentLiteral,
                value: parseFloat(numStr),
                raw: token.value,
            } as PercentLiteral;
        }

        // Hex color literal
        if (this.match(TokenType.HEXVALUE)) {
            const token = this.previous();
            return {
                type: NodeType.HexLiteral,
                value: token.value,
                raw: token.value,
            } as HexLiteral;
        }

        // Identifier
        if (this.match(TokenType.IDENTIFIER)) {
            const token = this.previous();
            return {
                type: NodeType.Identifier,
                name: token.value,
            } as Identifier;
        }

        // Grouped expression
        if (this.match(TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RPAREN, "Expected ')' after expression");
            return {
                type: NodeType.GroupExpression,
                expression: expr,
            } as GroupExpression;
        }

        if (this.check(TokenType.EOF)) {
            throw this.error(this.peek(), 'Unexpected EOF');
        }

        throw this.error(this.peek(), 'Expected expression');
    }

    // ========== Helper Methods ==========

    /**
     * Checks if current token matches any of the given types
     * If match found, advances and returns true
     * @param types - Token types to check
     * @returns True if match found
     */
    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if current token is of given type
     * @param type - Token type to check
     * @returns True if current token matches type
     */
    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    /**
     * Advances to next token
     * @returns Previous token
     */
    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    /**
     * Checks if at end of tokens
     * @returns True if at end
     */
    private isAtEnd(): boolean {
        return this.current >= this.tokens.length || this.peek().type === TokenType.EOF;
    }

    /**
     * Returns current token without advancing
     * @returns Current token
     */
    private peek(): Token {
        return this.tokens[this.current] as Token;
    }

    /**
     * Returns previous token
     * @returns Previous token
     */
    private previous(): Token {
        return this.tokens[this.current - 1] as Token;
    }

    /**
     * Consumes a token of expected type or throws error
     * @param type - Expected token type
     * @param message - Error message if not found
     * @returns The consumed token
     */
    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    /**
     * Creates a parse error
     * @param token - Token where error occurred
     * @param message - Error message
     * @returns Error object
     */
    private error(token: Token, message: string): Error {
        return new Error(`Parse error at '${token.value}': ${message}`);
    }
}






// src/Context.ts

import { CharType, type Character } from "./Character.ts";
import { TokenType, type Token } from "./Tokenizer.ts";
import { State } from "./States.ts";

/**
 * Context manages the DFA (Deterministic Finite Automaton) state machine
 * Processes characters through state transitions and emits tokens
 */
class Context {
    /** Current state of the DFA */
    private state: State;

    /** Previously processed character */
    public previousChar: Character | null = null;

    /** Buffer for accumulating characters into multi-character tokens */
    public buffer: Character[] = [];

    constructor(initialState: State) {
        this.state = initialState;
    }

    /**
     * Transitions the DFA to a new state
     */
    public transitionTo(state: State): void {
        this.state = state;
    }

    /**
     * Token-oriented processing (multi-character tokens)
     */
    public processTokens(char: Character): Character | null {
        this.previousChar = char;

        const transition = this.state.handle(char);

        switch (transition.kind) {
            case "Stay": {
                if (this.state.isAccepting() && char.type !== CharType.EOF) {
                    this.buffer.push(char);
                }
                return null;
            }

            case "To": {
                this.transitionTo(transition.state);

                if (this.state.isAccepting() && char.type !== CharType.EOF) {
                    this.buffer.push(char);
                }
                return null;
            }

            case "EmitAndTo": {
                const token =
                    this.buffer.length > 0
                        ? this.createToken(this.buffer)
                        : null;

                this.buffer = [];

                this.transitionTo(transition.state);
                return token;
            }

            case "End": {
                if (this.buffer.length > 0) {
                    const token = this.createToken(this.buffer);
                    this.buffer = [];
                    return token;
                }
                return null;
            }
        }
    }


    /**
     * Character-oriented processing (single-character tokens)
     */
    public processCharacters(char: Character): Character | null {
        this.previousChar = char;

        const transition = this.state.handle(char);

        if (char.type === CharType.EOF) {
            return null;
        }

        switch (transition.kind) {
            case "Stay":
                return this.state.isAccepting() ? char : null;

            case "To":
                this.transitionTo(transition.state);
                return this.state.isAccepting() ? char : null;

            case "EmitAndTo": {
                this.transitionTo(transition.state);

                this.transitionTo(transition.state);
                return null;
            }

            case "End":
                return null;
        }
    }


    /**
     * Creates a token from a buffer of characters
     */
    private createToken(chars: Character[]): Character {
        if (chars.length === 0) {
            throw new Error("Cannot create token from empty buffer");
        }

        let value = "";
        for (let i = 0; i < chars.length; i++) {
            value += chars[i]!.value;
        }

        return {
            value,
            type: chars[0]!.type,
            index: chars[0]!.index,
            line: chars[0]!.line,
            column: chars[0]!.column
        };
    }

    /**
     * Converts a Character token to a semantic Token type
     */
    public static toTokenType(char: Character): Token {
        const value = char.value;

        if (value.endsWith("%")) {
            return { value, type: TokenType.PERCENT };
        }

        switch (char.type) {
            case CharType.Hash:
                return { value, type: TokenType.HEXVALUE };

            case CharType.Percent:
                return { value, type: TokenType.PERCENT };

            case CharType.Letter:
                return { value, type: TokenType.IDENTIFIER };

            case CharType.Number:
                return { value, type: TokenType.NUMBER };

            case CharType.Whitespace:
                return { value, type: TokenType.WHITESPACE };

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

            case CharType.EOF:
                return { value, type: TokenType.EOF };

            default:
                return { value, type: TokenType.ERROR };
        }
    }

    /**
     * Checks if the current state is accepting
     */
    public isAccepted(): boolean {
        return this.state.isAccepting();
    }
}

export { Context };







// src/Character.ts

/**
 * Function type for classifying a character into a CharType
 * @param char - The character string to classify
 * @returns The CharType classification
 */
type ClassifyFunction = (char: string) => CharType;

/**
 * Function type for testing if a character matches a specific type
 * @param char - The character string to test
 * @returns True if the character matches the type
 */
type CharTypeFn = (char: string) => boolean;

/**
 * Map specification for character type testing functions
 */
type Spec = Map<CharType, CharTypeFn>;

/**
 * Enumeration of all possible character types recognized by the tokenizer
 */
enum CharType {
    /** Initial state, not yet classified */
    Start = 'Start',
    /** Space or tab character */
    Whitespace = 'Whitespace',
    /** Newline or carriage return */
    NewLine = 'NewLine',
    /** Single or double quote */
    Quote = 'Quote',
    /** Unicode letter character */
    Letter = 'Letter',
    /** Numeric digit 0-9 */
    Number = 'Number',
    /** Scientific notation exponent (e/E) */
    Exponent = 'Exponent',
    /** Percent symbol */
    Percent = 'Percent',
    /** Decimal point */
    Dot = 'Dot',
    /** Left parenthesis */
    LParen = 'LParen',
    /** Right parenthesis */
    RParen = 'RParen',
    /** Comma */
    Comma = 'Comma',
    /** Forward slash */
    Slash = 'Slash',
    /** Plus sign */
    Plus = 'Plus',
    /** Minus/hyphen sign */
    Minus = 'Minus',
    /** Hash/pound symbol */
    Hash = 'Hash',
    /** Hexadecimal digit */
    Hex = 'Hex',
    /** Unicode character */
    Unicode = 'Unicode',
    /** Generic operator character */
    Operator = 'Operator',
    /** Unrecognized character type */
    Other = 'Other',
    /** End of file marker */
    EOF = 'EOF'
}

abstract class ICharacter {
    /** The actual character value as a string */
    public value: string = '';
    /** The classified type of this character */
    public type: CharType = CharType.Start;
    /** Byte index in the source input */
    public index: number = 0;
    /** Line number (1-indexed) */
    public line: number = 1;
    /** Column number (1-indexed) */
    public column: number = 1;
}

/**
 * Represents a single character with position metadata
 * Used for tracking characters through the tokenization process
 */
class Character extends ICharacter {
    /**
     * Static method to classify a character string into a CharType
     * Iterates through CharSpec map and returns first matching type
     * @param char - The character string to classify
     * @returns The CharType classification, or CharType.Other if no match
     */
    public static classify: ClassifyFunction = (char: string): CharType => {
        if (char) {
            for (const [charType, fn] of Character.CharSpec) {
                if (fn(char)) return charType as CharType;
            }
        }
        return CharType.Other;
    };

    /**
    * Set of characters classified as operators
    */
    public static Operators: Set<string> = new Set([
        '%', '.', ',', '/', '(', ')', '+', '-', '_', '#', '!',
        '\\', '*', '@', '$', '^', '&', '{', '}', '[', ']', '|',
        ':', ';', '<', '>', '?', '~', '`', '"', "'", '='
    ]);

    /**
     * Specification map for character type testing functions
     * Tests are performed in order, first match wins
     */
    public static CharSpec: Spec = new Map<CharType, CharTypeFn>([
        [CharType.EOF, (char) => char === 'EOF'],
        [CharType.Whitespace, (char) => char === ' ' || char === '\t'],
        [CharType.NewLine, (char) => char === '\n' || char === '\r'],
        [CharType.Hash, (char: string) => char === '#'],
        [CharType.Percent, (char: string) => char === '%'],
        [CharType.Letter, (char) => /\p{L}/u.test(char)],
        [CharType.Number, (char) => /\d/.test(char)],
        [CharType.Operator, (char) => Character.Operators.has(char)],
    ]);
}

/**
 * Streaming iterator for processing string input character by character
 * Handles Unicode normalization, position tracking, and EOF emission
 */
class CharacterStream extends Character implements IterableIterator<ICharacter> {
    /** Flag to track if EOF has been emitted */
    private eofEmitted = false;

    /**
     * Creates a new CharacterStream from a string input
     * Input is normalized using NFC (Canonical Decomposition followed by Canonical Composition)
     * @param input - The string to tokenize
     */
    constructor(input: string) {
        super();
        this.value = input.normalize('NFC');
    }

    /**
     * Iterator protocol implementation
     * Returns the next character in the stream with position metadata
     * @returns IteratorResult containing a Character or done flag
     */
    public next(): IteratorResult<ICharacter> {
        if (this.isEOF()) {
            if (this.eofEmitted) {
                return { done: true, value: undefined as any };
            }
            this.eofEmitted = true;
            return { done: false, value: this.atEOF() };
        }

        const codePoint = this.value.codePointAt(this.index) as number;
        const char = String.fromCodePoint(codePoint);

        const result = {
            value: char,
            type: Character.classify(char),
            index: this.index,
            line: this.line,
            column: this.column
        };

        this.advance(char);
        return { done: false, value: result };
    }

    /**
     * Makes this class iterable using for...of loops
     * @returns This stream instance as an iterator
     */
    public [Symbol.iterator](): IterableIterator<ICharacter> {
        return this;
    }

    /**
     * Advances the stream position after consuming a character
     * Updates line and column counters appropriately
     * @param char - The character that was consumed
     */
    public advance(char: string): void {
        this.index += char.length;

        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
    }

    /**
     * Peeks ahead in the stream without consuming characters
     * @param offset - Number of characters to look ahead (default: 0)
     * @returns The character at the peek position, or null if past EOF
     */
    public peek(offset: number = 0): string | null {
        const cp = this.value.codePointAt(this.index + offset);
        return cp !== undefined ? String.fromCodePoint(cp) : null;
    }

    /**
     * Checks if the stream has reached end of input
     * @returns True if at or past the end of input
     */
    public isEOF(): boolean {
        return this.index >= this.value.length;
    }

    /**
     * Creates an EOF character marker with current position
     * @returns A Character object representing EOF
     */
    public atEOF(): ICharacter {
        return {
            value: 'EOF',
            type: CharType.EOF,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }

    /**
     * Creates an error character marker
     * @returns A Character object representing an error
     */
    public atError(): ICharacter {
        return {
            value: 'Error',
            type: CharType.Other,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }
}

/**
 * Streaming iterator for processing an array of Characters
 * Useful for re-tokenizing or processing already-parsed character streams
 * Implements full Iterator protocol with helper methods
 */
class CharacterArrayStream implements IterableIterator<ICharacter> {
    /** The array of characters to iterate over */
    private characters: ICharacter[];
    /** Current index in the array */
    private index = 0;
    /** Flag to track if EOF has been emitted */
    private eofEmitted = false;

    /**
     * Creates a new CharacterArrayStream from an array of Characters
     * @param characters - The character array to iterate over
     */
    constructor(characters: ICharacter[]) {
        this.characters = characters;
    }

    /**
     * Iterator protocol implementation
     * Returns the next character from the array
     * @returns IteratorResult containing a Character or done flag
     */
    public next(): IteratorResult<ICharacter> {
        if (this.index >= this.characters.length) {
            if (this.eofEmitted) {
                return { done: true, value: undefined as any };
            }
            this.eofEmitted = true;
            // Create EOF character based on last position
            const lastChar = this.characters[this.characters.length - 1];
            return {
                done: false,
                value: {
                    value: 'EOF',
                    type: CharType.EOF,
                    index: lastChar ? lastChar.index + 1 : 0,
                    line: lastChar ? lastChar.line : 1,
                    column: lastChar ? lastChar.column + 1 : 1
                }
            };
        }

        const char = this.characters[this.index];
        this.index++;
        return { done: false, value: char as ICharacter };
    }

    /**
     * Makes this class iterable using for...of loops
     * @returns This stream instance as an iterator
     */
    [Symbol.iterator](): IterableIterator<ICharacter> {
        return this;
    }

    /**
     * Creates a new iterator that drops the first count elements
     * @param count - Number of elements to drop
     * @returns New iterator starting after the dropped elements
     */
    public drop(count: number): IterableIterator<ICharacter> {
        const newStream = new CharacterArrayStream(this.characters);
        newStream.skip(count);
        return newStream;
    }

    /**
     * Creates a new iterator that takes at most limit elements
     * @param limit - Maximum number of elements to take
     * @returns New iterator with limited elements
     */
    public take(limit: number): IterableIterator<ICharacter> {
        const limitedChars = this.characters.slice(0, limit);
        return new CharacterArrayStream(limitedChars);
    }

    /**
     * Returns the underlying array of characters
     * @returns Array of characters
     */
    public toArray(): ICharacter[] {
        return [...this.characters];
    }

    /**
     * Gets the current position in the stream
     * @returns Current index
     */
    public getPosition(): number {
        return this.index;
    }

    /**
     * Gets the total length of the character array
     * @returns Length of the array
     */
    public getLength(): number {
        return this.characters.length;
    }

    /**
     * Checks if the stream has more characters to read
     * @returns True if more characters are available
     */
    public hasNext(): boolean {
        return this.index < this.characters.length;
    }

    /**
     * Resets the stream to the beginning
     */
    public reset(): void {
        this.index = 0;
        this.eofEmitted = false;
    }

    /**
     * Peeks at the next character without consuming it
     * @param offset - Number of positions to look ahead (default: 0)
     * @returns The character at the peek position, or null if out of bounds
     */
    public peek(offset: number = 0): ICharacter | null {
        const peekIndex = this.index + offset;
        if (peekIndex >= 0 && peekIndex < this.characters.length) {
            return this.characters[peekIndex] as ICharacter;
        }
        return null;
    }

    /**
     * Skips the specified number of characters
     * @param count - Number of characters to skip
     */
    public skip(count: number): void {
        this.index = Math.min(this.index + count, this.characters.length);
    }

    /**
     * Gets a slice of characters from the stream
     * @param start - Starting index (default: current position)
     * @param end - Ending index (default: end of array)
     * @returns Array of characters in the specified range
     */
    public slice(start?: number, end?: number): ICharacter[] {
        const startIndex = start ?? this.index;
        return this.characters.slice(startIndex, end);
    }

    /**
     * Filters characters based on a predicate function
     * @param predicate - Function to test each character
     * @returns New stream with filtered characters
     */
    public filter(predicate: (char: ICharacter) => boolean): CharacterArrayStream {
        const filtered = this.characters.filter(predicate);
        return new CharacterArrayStream(filtered);
    }

    /**
     * Maps characters using a transformation function
     * @param mapper - Function to transform each character
     * @returns New stream with transformed characters
     */
    public map(mapper: (char: ICharacter) => ICharacter): CharacterArrayStream {
        const mapped = this.characters.map(mapper);
        return new CharacterArrayStream(mapped);
    }

    /**
     * Returns the character at the specified index without affecting iteration
     * @param index - Index of the character to get
     * @returns The character at the index, or null if out of bounds
     */
    public at(index: number): ICharacter | null {
        if (index >= 0 && index < this.characters.length) {
            return this.characters[index] as ICharacter;
        }
        return null;
    }
}

export {
    type ClassifyFunction,
    type CharTypeFn,
    type Spec,
    CharType,
    Character,
    CharacterStream,
    CharacterArrayStream,
}






// src/AST.ts

/**
 * Node Types
 */
export enum NodeType {
    Program = 'Program',
    Statement = 'Statement',
    Expression = 'Expression',
    ExpressionStatement = 'ExpressionStatement',
    Identifier = 'Identifier',
    NumericLiteral = 'NumericLiteral',
    HexLiteral = 'HexLiteral',
    PercentLiteral = 'PercentLiteral',
    BinaryExpression = 'BinaryExpression',
    UnaryExpression = 'UnaryExpression',
    CallExpression = 'CallExpression',
    GroupExpression = 'GroupExpression',
}

/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
    /** Type of the AST node */
    type: NodeType;
    /** Source location information */
    location?: SourceLocation;
}

/**
 * Source code location metadata
 */
export interface SourceLocation {
    /** Starting position */
    start: Position;
    /** Ending position */
    end: Position;
}

/**
 * Position in source code
 */
export interface Position {
    /** Line number (1-indexed) */
    line: number;
    /** Column number (1-indexed) */
    column: number;
    /** Byte index */
    index: number;
}

/**
 * Program root node - contains all statements
 */
export interface Program extends ASTNode {
    type: NodeType.Program;
    body: Statement[];
}

/**
 * Base type for all statements
 */
export type Statement = ExpressionStatement;

/**
 * Expression wrapped as a statement
 */
export interface ExpressionStatement extends ASTNode {
    type: NodeType.ExpressionStatement;
    expression: Expression;
}

/**
 * Base type for all expressions
 */
export type Expression =
    | Identifier
    | NumericLiteral
    | HexLiteral
    | PercentLiteral
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | GroupExpression;

/**
 * Identifier node (variable names, function names)
 * Example: red, myVar
 */
export interface Identifier extends ASTNode {
    type: NodeType.Identifier;
    name: string;
}

/**
 * Numeric literal node
 * Example: 42, 3.14
 */
export interface NumericLiteral extends ASTNode {
    type: NodeType.NumericLiteral;
    value: number;
    raw: string;
}

/**
 * Hexadecimal color literal
 * Example: #ff0000, #abc
 */
export interface HexLiteral extends ASTNode {
    type: NodeType.HexLiteral;
    value: string;
    raw: string;
}

/**
 * Percentage literal
 * Example: 50%, 100%
 */
export interface PercentLiteral extends ASTNode {
    type: NodeType.PercentLiteral;
    value: number;
    raw: string;
}

/**
 * Binary operation (two operands and an operator)
 * Example: 1 + 2, a - b
 */
export interface BinaryExpression extends ASTNode {
    type: NodeType.BinaryExpression;
    operator: '+' | '-' | '*' | '/' | '%';
    left: Expression;
    right: Expression;
}

/**
 * Unary operation (one operand and an operator)
 * Example: -5, +10
 */
export interface UnaryExpression extends ASTNode {
    type: NodeType.UnaryExpression;
    operator: '+' | '-';
    argument: Expression;
}

/**
 * Function call expression
 * Example: rgb(255, 0, 0)
 */
export interface CallExpression extends ASTNode {
    type: NodeType.CallExpression;
    callee: Identifier;
    arguments: Expression[];
}

/**
 * Grouped expression (parentheses)
 * Example: (1 + 2)
 */
export interface GroupExpression extends ASTNode {
    type: NodeType.GroupExpression;
    expression: Expression;
}