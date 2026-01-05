// @ts-nocheck


// ==================== Start of file: index.ts ====================

// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import { CharacterStream } from './src/Character.ts';

/**
 * @TODO Add character, token, and state support for quotes
 */

const compactInspectOptions: InspectOptions = {
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

const inspectOptions: InspectOptions = {
    showHidden: true,
    depth: null,
    colors: true,
    customInspect: false,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 100,
    compact: false,
    sorted: false,
    getters: false,
    numericSeparator: true,
};

const line = (newLine: boolean = true, width: number = 80): void => {
    if (newLine) console.log(`${'─'.repeat(width)}\n`);
    if (!newLine) console.log(`${'─'.repeat(width)}`);
}

const characterStreamTest = () => {
    line();
    console.log('=== CHARACTERSTREAM DEMO ===\n');
    line();

    const input = 'rgb(255, 100, 75)';

    const stream = new CharacterStream(input);

    console.log(`INPUT: '${input}'\n`);
    console.log('RESULT OF CHARACTERSTREAM:\n');
    for (const char of stream) {
        console.log('\t', inspect(char, compactInspectOptions));
    }
    console.log();
    line();
}

const tokenizerTest = () => {
    // Fluent usage
    const tokenizer = new Tokenizer();

    // Test 1
    tokenizer
        .withLogging('TEST (1): Direct Tokenization from String')
        .tokenize('67 a, b, c / 1 word 2 3+(2-0)');

    // Test 2
    tokenizer
        .withLogging('TEST (2): Direct Tokenization from CSS Color String')
        .tokenize('rgba(100 128 255 / 0.5)');

    // Test 3
    tokenizer
        .withLogging('TEST (3): Direct Tokenization from CSS Color String')
        .tokenize('rgba(100grad 360 220  / 50%)');

    // Test 4
    tokenizer
        .withLogging('TEST (4): Direct Tokenization from Hex Color String')
        .tokenize('#ff00ff00');
    
    // Test 5
    tokenizer
        .withLogging('TEST (5): Direct Tokenization from percentage')
        .tokenize('56%');
    
    // Test 6
    tokenizer
        .withLogging('TEST (6): Direct Tokenization from units')
        .tokenize('100grad');
}

const parserTest = () => {
    console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

    // Test cases
    // Commented out cases are not working
    const testCases = [
        //'1 + 2',
        //'10 - 5 + 3',
        //'2 * 3 + 4',
        //'rgb(255, 0, 0)',
        //'#ff0000',
        //'50%',
        //'(1 + 2) * 3',
        //'-5 + 10',
        //'rgba(255, 128, 0, 50%)',
`const characterStreamTest = () => {
line();
console.log('=== CHARACTERSTREAM DEMO ===');
line();

const input = 'rgb(255, 100, 75)';

const stream = new CharacterStream(input);

console.log('INPUT:');
console.log('RESULT OF CHARACTERSTREAM:');
for (const char of stream) {
    console.log(inspect(char, compactInspectOptions));
}
console.log();
line();
}`
    ];


    for (const input of testCases) {
        line();

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withLogging(`PARSER TEST:\n\nINPUT:\n\t'${input}'\n${'─'.repeat(80)}`)
            .tokenize(input);

        // Step 2: Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();

        // Step 3: Console log the AST
        console.log('\nAST:\n');
        const defaultAST = inspect(ast, inspectOptions);
        const fourSpaceAST = defaultAST.replace(/^ +/gm, match => ' '.repeat(match.length * 2));
        console.log(fourSpaceAST, '\n');
        line();
    }
}

//characterStreamTest();
//tokenizerTest();
parserTest();
// ==================== End of file: index.ts ====================





// @ts-nocheck


// ==================== Start of file: src/AST.ts ====================

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
    StringLiteral = 'StringLiteral',
    NumericLiteral = 'NumericLiteral',
    HexLiteral = 'HexLiteral',
    PercentLiteral = 'PercentLiteral',
    DimensionLiteral = 'DimensionLiteral',
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
    | StringLiteral
    | NumericLiteral
    | HexLiteral
    | PercentLiteral
    | DimensionLiteral
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
 * String literal node
 * Example: "hello", 'world'
 */
export interface StringLiteral extends ASTNode {
    type: NodeType.StringLiteral;
    value: string;
    raw: string;
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

export interface DimensionLiteral extends ASTNode {
    type: NodeType.DimensionLiteral;
    value: number;
    unit: string;
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
// ==================== End of file: src/AST.ts ====================





// @ts-nocheck


// ==================== Start of file: src/Character.ts ====================

// src/Character.ts

type ClassifyFn = (char: string) => CharType;
type CharTypeFn = (char: string) => boolean;
type Spec = Map<CharType, CharTypeFn>;

enum CharType {
    Unicode = 'Unicode',
    Start = 'Start',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Dimension = 'Dimension',
    Percent = 'Percent',
    Hash = 'Hash',
    Slash = 'Slash',
    BackSlash = 'BackSlash',
    Comma = 'Comma',
    RParen = 'RParen',
    LParen = 'LParen',
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Dot = 'Dot',
    Backtick = 'Backtick',
    SingleQuote = 'SingleQuote',
    DoubleQuote = 'DoubleQuote',
    Tilde = 'Tilde',
    Exclamation = 'Exclamation',
    At = 'At',
    Dollar = 'Dollar',
    Question = 'Question',
    Caret = 'Caret',
    Ampersand = 'Ampersand',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',
    Underscore = 'Underscore',
    EqualSign = 'EqualSign',
    LBracket = 'LBracket',
    RBracket = 'RBracket',
    LBrace = 'LBrace',
    RBrace = 'RBrace',
    SemiColon = 'SemiColon',
    Colon = 'Colon',
    Pipe = 'Pipe',
    Symbol = 'Symbol',
    Other = 'Other',
    EOF = 'EOF',
    Error = 'Error',
}

interface Position {
    index: number;
    line: number;
    column: number;
}

interface Character {
    value: string;
    type: CharType;
    position: Position;
}

class CharUtility {
    public static Letters: Set<string> = new Set([
        // Uppercase
        'A', 'B', 'C', 'D', 'E',
        'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y',
        'Z',

        // Lowercase
        'a', 'b', 'c', 'd', 'e',
        'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y',
        'z',
    ]);

    public static Numbers: Set<string> = new Set([
        '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '0',
    ]);

    public static Symbols: Set<string> = new Set([
    ]);

    public static Whitespace: Set<string> = new Set([
        ' ', '\t',
    ]);

    public static NewLine: Set<string> = new Set([
        '\n', '\r',
    ]);

    public static CharSpec: Spec = new Map<CharType, CharTypeFn>([
        [CharType.EOF, (char) => char === ''],
        [CharType.Hash, (char) => char === '#'],
        [CharType.Percent, (char) => char === '%'],
        [CharType.Slash, (char) => char === '/'],
        [CharType.Comma, (char) => char === ','],
        [CharType.LParen, (char) => char === '('],
        [CharType.RParen, (char) => char === ')'],
        [CharType.Plus, (char) => char === '+'],
        [CharType.Minus, (char) => char === '-'],
        [CharType.Star, (char) => char === '*'],
        [CharType.Dot, (char) => char === '.'],
        [CharType.Backtick, (char) => char === '`'],
        [CharType.SingleQuote, (char) => char === "'"],
        [CharType.DoubleQuote, (char) => char === '"'],
        [CharType.BackSlash, (char) => char === '\\'],
        [CharType.Tilde, (char) => char === '~'],
        [CharType.Exclamation, (char) => char === '!'],
        [CharType.At, (char) => char === '@'],
        [CharType.Dollar, (char) => char === '$'],
        [CharType.Question, (char) => char === '?'],
        [CharType.Caret, (char) => char === '^'],
        [CharType.Ampersand, (char) => char === '&'],
        [CharType.LessThan, (char) => char === '<'],
        [CharType.GreaterThan, (char) => char === '>'],
        [CharType.Underscore, (char) => char === '_'],
        [CharType.EqualSign, (char) => char === '='],
        [CharType.LBracket, (char) => char === '['],
        [CharType.RBracket, (char) => char === ']'],
        [CharType.LBrace, (char) => char === '{'],
        [CharType.RBrace, (char) => char === '}'],
        [CharType.SemiColon, (char) => char === ';'],
        [CharType.Colon, (char) => char === ':'],
        [CharType.Pipe, (char) => char === '|'],
        [CharType.Symbol, (char) => CharUtility.Symbols.has(char)],
        //[CharType.Letter,       (char) => CharUtility.Letters.has(char)],
        //[CharType.Number,       (char) => CharUtility.Numbers.has(char)],
        //[CharType.Whitespace,   (char) => CharUtility.Whitespace.has(char)],
        //[CharType.NewLine,      (char) => CharUtility.NewLine.has(char)],
        [CharType.Letter, (char) => /\p{L}/u.test(char)],
        [CharType.Number, (char) => /\p{N}/u.test(char)],
        [CharType.NewLine, (char) => char === '\n' || char === '\r'],
        [CharType.Whitespace, (char) => /\s/u.test(char)],
        [CharType.Unicode, (char) => /[^\x00-\x7F]/.test(char)]
    ]);

    public static classify: ClassifyFn = (char: string): CharType => {
        if (char === '') return CharType.EOF;

        for (const [charType, fn] of CharUtility.CharSpec) {
            if (fn(char)) return charType as CharType;
        }

        return CharType.Other;
    };
}

class CharacterStream implements IterableIterator<Character> {
    private readonly source: string;
    private value: string = '';
    private index: number = 0;
    private line: number = 1;
    private column: number = 1;

    private get position(): Position {
        return {
            index: this.index,
            line: this.line,
            column: this.column,
        };
    }

    private set position(value: Position) {
        this.index = value.index;
        this.line = value.line;
        this.column = value.column;
    }

    constructor(input: string) {
        this.source = input.normalize('NFC');
    }

    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    public next(): IteratorResult<Character> {
        if (this.isEOF()) {
            return {
                done: true,
                value: {
                    value: '',
                    type: CharType.EOF,
                    position: { ...this.position }
                }
            };
        }

        const codePoint = this.source.codePointAt(this.index);
        this.value = String.fromCodePoint(codePoint!);

        const char: Character = {
            value: this.value,
            type: CharUtility.classify(this.value),
            position: { ...this.position }
        };

        this.advance();
        return { done: false, value: char };
    }

    public advance(): void {
        const charLength = this.value.length;
        const newPosition = { ...this.position };

        newPosition.index += charLength;
        if (this.value === '\n') {
            newPosition.line++;
            newPosition.column = 1;
        } else {
            newPosition.column++;
        }

        this.position = { ...newPosition };
    }

    public isEOF(): boolean {
        return this.index >= this.source.length;
    }

    public atEOF(): Character {
        return ({
            value: '',
            type: CharType.EOF,
            position: { ...this.position }
        });
    }

    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            position: { ...this.position }
        };
    }
}

export {
    type Position,
    type Character,
    CharType,
    CharacterStream,
}
// ==================== End of file: src/Character.ts ====================





// @ts-nocheck


// ==================== Start of file: src/Context.ts ====================

// src/Context.ts

import { type Character, CharType } from './Character.ts';
import { InitialState, State } from './States.ts';
import { Transition } from './Transition.ts';

interface StringContext {
    openingQuoteType: CharType | null;
    isEscaping: boolean;
    nestingLevel: number;
}

class Context {
    private stringContext: StringContext = {
        openingQuoteType: null,
        isEscaping: false,
        nestingLevel: 0,
    };

    constructor(private state: State = InitialState) { }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public getCurrentState(): State {
        return this.state;
    }

    public beginString(quoteType: CharType): void {
        this.stringContext.openingQuoteType = quoteType;
        this.stringContext.nestingLevel++;
    }

    public endString(): void {
        this.stringContext.nestingLevel = Math.max(0, this.stringContext.nestingLevel - 1);
        if (this.stringContext.nestingLevel === 0) {
            this.stringContext.openingQuoteType = null;
        }
    }

    public setEscaping(value: boolean): void {
        this.stringContext.isEscaping = value;
    }

    public isEscaping(): boolean {
        return this.stringContext.isEscaping;
    }

    public isInString(): boolean {
        return this.stringContext.nestingLevel > 0;
    }

    public getOpeningQuoteType(): CharType | null {
        return this.stringContext.openingQuoteType;
    }

    public isMatchingQuote(quoteType: CharType): boolean {
        return this.stringContext.openingQuoteType === quoteType;
    }

    public process(char: Character): { emit: boolean; reprocess: boolean, endString?: boolean } {
        const wasAccepting = this.isAccepting();
        const transition: Transition = this.state.handle(char);

        if (this.isEscaping() && transition.kind !== "EscapeNext") {
            this.setEscaping(false);
            return { emit: false, reprocess: false };
        }

        if (transition.kind === "EndString" && this.isInString()) {
            if (this.isMatchingQuote(char.type)) {
                this.endString();
                this.transitionTo(transition.state);
                return { emit: true, reprocess: false, endString: true };
            } else {
                return { emit: false, reprocess: false };
            }
        }

        switch (transition.kind) {
            case "BeginString": {
                this.beginString(transition.quoteType);
                this.transitionTo(transition.state);
                return { emit: false, reprocess: false };
            }

            case "EscapeNext": {
                this.setEscaping(true);
                this.transitionTo(transition.state);
                return { emit: false, reprocess: false };
            }

            case "EndString": {
                this.endString();
                this.transitionTo(transition.state);
                return { emit: true, reprocess: false, endString: true };
            }

            case "ToContinue": {
                this.transitionTo(transition.state);
                break;
            }

            case "EmitAndTo": {
                this.transitionTo(transition.state);
                return { emit: true, reprocess: true };
            }

            case "To": {
                const shouldEmit = wasAccepting;
                this.transitionTo(transition.state);
                if (shouldEmit) return { emit: true, reprocess: false };
                break;
            }

            case "Stay": {
                break;
            }
        }

        return { emit: false, reprocess: false };
    }

    public isAccepting(): boolean {
        return this.state.isAccepting;
    }
}

export {
    type StringContext,
    Context
}
// ==================== End of file: src/Context.ts ====================





// @ts-nocheck


// ==================== Start of file: src/Parser.ts ====================

// src/Parser.ts

import { type Token, TokenType } from './Tokenizer.ts';
import {
    NodeType,
    type Program,
    type Expression,
    type Statement,
    type ExpressionStatement,
    type Identifier,
    type StringLiteral,
    type NumericLiteral,
    type HexLiteral,
    type PercentLiteral,
    type BinaryExpression,
    type UnaryExpression,
    type CallExpression,
    type GroupExpression,
} from './AST.ts';

/**
 * Recursive descent parser
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
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t =>
            t.type !== TokenType.WHITESPACE &&
            t.type !== TokenType.NEWLINE
        );
    }

    public parse(): Program {
        const statements: Statement[] = [];

        while (!this.isAtEnd()) {
            if (this.check(TokenType.EOF)) {
                this.advance();
                continue;
            }
            const stmt = this.statement();
            if (stmt) statements.push(stmt);
        }

        return {
            type: NodeType.Program,
            body: statements,
        };
    }

    private statement(): Statement {
        return this.expressionStatement();
    }

    private expressionStatement(): ExpressionStatement {
        const expr = this.expression();
        return {
            type: NodeType.ExpressionStatement,
            expression: expr,
        };
    }

    private expression(): Expression {
        return this.addition();
    }

    private addition(): Expression {
        let expr = this.multiplication();

        while (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
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

    private multiplication(): Expression {
        let expr = this.unary();

        while (
            !this.isAtEnd() &&
            this.match(TokenType.STAR, TokenType.SLASH)  // ✅ Fixed: Added STAR
        ) {
            const operator = this.previous().value as '*' | '/';
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

    private unary(): Expression {
        if (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
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

    private call(): Expression {
        let expr = this.primary();

        // Only parse call if expr is Identifier
        /*while (
            expr &&
            expr.type === NodeType.Identifier &&
            this.match(TokenType.LPAREN)
        ) //*/
        if (
            expr.type === NodeType.Identifier &&
            this.match(TokenType.LPAREN)
        ) {
            const args: Expression[] = [];

            // Parse arguments, skipping commas
            while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
                // Skip comma if present
                if (this.check(TokenType.COMMA)) {
                    this.advance();
                    continue;
                }

                const arg = this.expression();
                if (arg) args.push(arg);
            }

            this.consume(TokenType.RPAREN, "Expected ')' after arguments");

            expr = {
                type: NodeType.CallExpression,
                callee: expr as Identifier,
                arguments: args,
            } as CallExpression;
        }

        return expr as Expression;
    }

    private primary(): Expression {
        if (this.isAtEnd()) {
            throw this.error(this.peek(), 'Unexpected end of input');
        }

        const currentType = this.peek().type;

        switch (currentType) {
            case TokenType.STRING: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.StringLiteral,
                    value: token.value,
                    raw: token.value
                } as StringLiteral;
            }

            case TokenType.NUMBER: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.NumericLiteral,
                    value: parseFloat(token.value),
                    raw: token.value
                } as NumericLiteral;
            }

            case TokenType.PERCENT: {
                this.advance();
                const token = this.previous();
                const numStr = token.value.replace('%', '');
                return {
                    type: NodeType.PercentLiteral,
                    value: parseFloat(numStr),
                    raw: token.value
                } as PercentLiteral;
            }

            case TokenType.DIMENSION: {
                this.advance();
                const token = this.previous();
                const match = token.value.match(/^([\d.]+)([a-zA-Z]+)$/)!;

                return {
                    type: NodeType.DimensionLiteral,
                    value: parseFloat(match[1]!),
                    unit: match[2]!,
                    raw: token.value
                };
            }

            case TokenType.HEXVALUE: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.HexLiteral,
                    value: token.value,
                    raw: token.value
                } as HexLiteral;
            }

            case TokenType.IDENTIFIER: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.Identifier,
                    name: token.value
                } as Identifier;
            }

            case TokenType.LPAREN: {
                this.advance();
                const expr = this.expression();
                this.consume(TokenType.RPAREN, "Expected ')' after expression");
                return {
                    type: NodeType.GroupExpression,
                    expression: expr
                } as GroupExpression;
            }

            default:
                throw this.error(this.peek(), `Expected expression, got ${currentType}`);
        }
    }


    // ===== Helper Methods =====
    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.current >= this.tokens.length || this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current] as Token;
    }

    private previous(): Token {
        return this.tokens[this.current - 1] as Token;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): Error {
        return new Error(`Parse error at '${token.value}': ${message}`);
    }
}
// ==================== End of file: src/Parser.ts ====================





// @ts-nocheck


// ==================== Start of file: src/States.ts ====================

// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { type Character, CharType } from './Character.ts';
import { Transition } from './Transition';

abstract class State {
    public abstract isAccepting: boolean;

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

    public toString(): string {
        return `\t${inspect(this, this.inspectOptions)}`;
    }

    public abstract handle(char: Character): Transition;
}

class Initial_State extends State {
    public isAccepting: boolean = false;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            // String delimiters
            case CharType.SingleQuote:
                return Transition.BeginString(StringState, CharType.SingleQuote);
            case CharType.DoubleQuote:
                return Transition.BeginString(StringState, CharType.DoubleQuote);
            case CharType.Backtick:
                return Transition.BeginString(StringState, CharType.Backtick);

            // Whitespace
            case CharType.Whitespace:
                return Transition.To(WhitespaceState);
            case CharType.NewLine:
                return Transition.To(NewLineState);

            // Letters
            case CharType.Letter:
                return Transition.To(LetterState);

            // Numbers
            case CharType.Number:
                return Transition.To(NumberState);

            // Hexadecimal
            case CharType.Hash:
                return Transition.To(HexState);

            // All single-character tokens
            case CharType.Comma:
            case CharType.LParen:
            case CharType.RParen:
            case CharType.LBracket:
            case CharType.RBracket:
            case CharType.LBrace:
            case CharType.RBrace:
            case CharType.SemiColon:
            case CharType.Dot:
            case CharType.Plus:
            case CharType.Minus:
            case CharType.Star:
            case CharType.Slash:
            case CharType.Percent:
            case CharType.EqualSign:
            case CharType.GreaterThan:
            case CharType.LessThan:
            case CharType.Exclamation:
            case CharType.Question:
            case CharType.Colon:
            case CharType.Caret:
            case CharType.Ampersand:
            case CharType.Pipe:
            case CharType.Tilde:
            case CharType.At:
            case CharType.Dollar:
            case CharType.Underscore:
            case CharType.Symbol:
                return Transition.To(SingleCharState);

            case CharType.BackSlash:
            case CharType.Unicode:
                return Transition.To(SymbolState);

            case CharType.Other:
                return Transition.To(SingleCharState);

            case CharType.EOF:
                return Transition.To(EndState);

            case CharType.Error:
                return Transition.To(EndState);

            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Whitespace_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Whitespace:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class NewLine_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new NewLine_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        return Transition.EmitAndTo(InitialState);
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class Number_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Percent:
                return Transition.ToContinue(PercentState);
            case CharType.Letter:
                return Transition.ToContinue(DimensionState);
            case CharType.Number:
            case CharType.Dot:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class Dimension_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Dimension_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class Hex_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Hex_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Hash:
            case CharType.Letter:
            case CharType.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class String_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new String_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.BackSlash:
                return Transition.EscapeNext(StringState);

            case CharType.SingleQuote:
            case CharType.DoubleQuote:
            case CharType.Backtick:
                return Transition.EndString(InitialState);

            case CharType.EOF:
            case CharType.NewLine:
                return Transition.EmitAndTo(InitialState);

            default:
                return Transition.Stay();
        }
    }
}

class Percent_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        return Transition.EmitAndTo(InitialState);
    }
}

class SingleChar_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new SingleChar_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(InitialState);
    }
}

class Symbol_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Symbol_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Unicode:
            case CharType.BackSlash:
            case CharType.At:
            case CharType.Dollar:
            case CharType.Underscore:
            case CharType.Symbol:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class End_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.Stay();
    }
}

const InitialState = Initial_State.instance;
const WhitespaceState = Whitespace_State.instance;
const NewLineState = NewLine_State.instance;
const LetterState = Letter_State.instance;
const NumberState = Number_State.instance;
const DimensionState = Dimension_State.instance;
const HexState = Hex_State.instance;
const StringState = String_State.instance;
const PercentState = Percent_State.instance;
const SingleCharState = SingleChar_State.instance;
const SymbolState = Symbol_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhitespaceState,
    NewLineState,
    LetterState,
    NumberState,
    DimensionState,
    HexState,
    StringState,
    PercentState,
    SingleCharState,
    SymbolState,
    EndState,
    State,
}
// ==================== End of file: src/States.ts ====================





// @ts-nocheck


// ==================== Start of file: src/Tokenizer.ts ====================

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

type ClassifyTokenFn = (char: Character, wasInString: boolean) => Token;
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
    OTHER = 'OTHER',
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
        const wasInStringState = this.ctx.isInString();
        const wasEscaping = this.ctx.isEscaping();

        // 1. Process the character
        let result = this.ctx.process(char);

        // 2. Handle Emitting (Flushing existing buffer)
        if (result.emit) {
            if (this.buffer.length > 0) {
                tokens.push(Tokenizer.createToken(this.buffer, wasInStringState));
                this.buffer = [];
            }

            if (result.reprocess) {
                result = this.ctx.process(char);
            }
        }

        // 3. Handle Buffer logic
        if (!result.endString && char.type !== CharType.EOF) {
            if (this.ctx.isInString()) {
                // If we are in a string, we add EVERYTHING except the starting quote
                // Transition logic: if we just transitioned TO a string, result.emit is false 
                // and the state changed.
                
                // Simplified: Check if this char is a quote. 
                // If it's a quote AND we weren't in a string before this char, it's the opener.
                const isQuote = 
                    char.type === CharType.SingleQuote || 
                    char.type === CharType.DoubleQuote || 
                    char.type === CharType.Backtick;

                if (!(isQuote && !wasInStringState)) {
                    this.buffer.push(char);
                }
            } else if (this.ctx.isAccepting()) {
                this.buffer.push(char);
            }
        }
    }

        if (this.buffer.length > 0) {
            const wasInString = this.ctx.isInString();
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

        let token = { value, type: TokenType.OTHER }

        const ch = {
            value,
            type: chars[0]!.type,
            position: chars[0]!.position
        };

        if (wasInString) {
            const unescaped = Tokenizer.unescapeString(value);
            console.log('CREATETOKEN: VALUE:', inspect(value, inspectOptions))
            return {
                value: unescaped,
                type: TokenType.STRING
            };
        } else {
            token = Tokenizer.classify(ch, wasInString);
        }

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
        [TokenType.LPAREN, (type) => type === CharType.LParen],
        [TokenType.RPAREN, (type) => type === CharType.RParen],
        [TokenType.NEWLINE, (type) => type === CharType.NewLine],
        [TokenType.WHITESPACE, (type) => type === CharType.Whitespace],
        [TokenType.EOF, (type) => type === CharType.EOF],
        [TokenType.OTHER, (type) => type === CharType.Other],
        [TokenType.ERROR, (type) => type === CharType.Error],
    ])

    private static classify: ClassifyTokenFn = (char: Character, wasInString: boolean = false): Token => {
        const value = char.value;
        let result: Token = { value, type: TokenType.OTHER };

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
            case CharType.BackSlash:
                return {
                    value,
                    type: wasInString ? TokenType.ESCAPE : TokenType.SYMBOL
                };

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
// ==================== End of file: src/Tokenizer.ts ====================





// @ts-nocheck


// ==================== Start of file: src/Transition.ts ====================

// src/Transition.ts

import { State } from './States.ts';
import { CharType } from './Character.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: State }
    | { kind: 'EmitAndTo'; state: State }
    | { kind: 'ToContinue'; state: State }
    | { kind: 'BeginString'; state: State; quoteType: CharType }
    | { kind: 'EndString'; state: State }
    | { kind: 'EscapeNext'; state: State };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: State) => Transition; }
    & { EmitAndTo: (state: State) => Transition; }
    & { ToContinue: (state: State) => Transition; }
    & { BeginString: (state: State, quoteType: CharType) => Transition; }
    & { EndString: (state: State) => Transition; }
    & { EscapeNext: (state: State) => Transition; };

export const Transition: TransitionFn = {
    Stay: (): Transition => 
        ({ kind: 'Stay' }),

    To: (state: State): Transition => 
        ({ kind: 'To', state }),

    EmitAndTo: (state: State): Transition => 
        ({ kind: 'EmitAndTo', state }),

    ToContinue: (state: State): Transition => 
        ({ kind: 'ToContinue', state }),
    
    BeginString: (state: State, quoteType: CharType): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: State): Transition =>
        ({ kind: 'EndString', state }),

    EscapeNext: (state: State): Transition =>
        ({ kind: 'EscapeNext', state }),
};
// ==================== End of file: src/Transition.ts ====================





