// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import { CharacterStream } from './src/Character.ts';

const OLD_inspectOptions: InspectOptions = {
    showHidden: false,
    depth: null,
    colors: true,
    compact: false,
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

const old_old_test = () => {
    console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

    // Test cases
    const testCases = [
        //'1 + 2',
        //'10 - 5 + 3',
        //'2 * 3 + 4',
        'rgb(255, 0, 0)',
        //'#ff0000',
        //'50%',
        //'(1 + 2) * 3',
        //'-5 + 10',
        //'rgba(255, 128, 0, 50%)',
    ];

    for (const input of testCases) {

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withLogging()
            .tokenizeString(input);

        // Step 2: Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();

        console.log('\nAST:');
        console.log('\t', inspect(ast, inspectOptions));
    }
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

    // Test 3
    tokenizer
        .withLogging('TEST (3): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100 128 255 / 0.5)');

    // Test 4
    tokenizer
        .withLogging('TEST (4): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100% 360 220  / 50%)');

    // Test 5
    tokenizer
        .withLogging('TEST (5): Direct Tokenization from Hex Color String')
        .tokenizeString('#ff00ff00');
}

////old_test();
old_old_test();





// src/Transition.ts

import { State } from './States.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: State }
    | { kind: 'EmitAndTo'; state: State };

export const Transition: TransitionFn = {
    Stay: (): Transition => ({ kind: 'Stay' }),
    To: (state: State): Transition => ({ kind: 'To', state }),
    EmitAndTo: (state: State): Transition => ({ kind: 'EmitAndTo', state }),
};

type TransitionFn =
    & { Stay:       () => Transition; } 
    & { To:         (state: State) => Transition; } 
    & { EmitAndTo:  (state: State) => Transition; }





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





// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
import { Transition } from './Transition';

abstract class State {
    public name: string = 'State';
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

    constructor(name: string) {
        this.name = name;
    }

    public toString(): string {
        return `\t${inspect(this, this.inspectOptions)}`;
    }

    public abstract handle(char: Character): Transition;
}

class Initial_State extends State {
    public isAccepting: boolean = false;

    private constructor() {
        super('InitialState');
    }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Start:
                return Transition.Stay();
            case CharType.Whitespace:
                return Transition.To(WhitespaceState);
            case CharType.NewLine:
                return Transition.To(NewLineState);
            case CharType.Letter:
                return Transition.To(LetterState);
            case CharType.Number:
                return Transition.To(NumberState);
            case CharType.Operator:
                return Transition.To(OperatorState);
            case CharType.Other:
            case CharType.EOF:
            case CharType.Error:
                return Transition.To(EndState);
            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('WhitespaceState');
    }

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

    constructor() {
        super('HexState');
    }

    static #instance: State;
    
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new NewLine_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.NewLine:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('LetterState');
    }

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

    constructor() {
        super('NumberState');
    }

    static #instance: State;
    
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class Operator_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('OperatorState');
    }

    static #instance: State;
    
    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Operator_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Operator:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(InitialState);
        }
    }
}

class End_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('EndState');
    }

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
const OperatorState = Operator_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhitespaceState,
    NewLineState,
    LetterState,
    NumberState,
    OperatorState,
    EndState,
    State,
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
        // Filter out WHITESPACE TOKENS
        //tokens = tokens.filter(t => t.type !== TokenType.WHITESPACE);

        // Filter out COMMA tokens
        //tokens = tokens.filter(t => t.type !== TokenType.COMMA);

        this.tokens = tokens;
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
            this.match(TokenType.SLASH, TokenType.OPERATOR)
        ) {
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
        while (
            expr &&
            expr.type === NodeType.Identifier &&
            this.match(TokenType.LPAREN)
        ) {
            const args: Expression[] = [];

            while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
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

    private primary(): Expression | null {
        if (this.isAtEnd()) return null;

        // Peek at the current token type to use in the switch statement.
        const currentType = this.peek().type;

        switch (currentType) {
            case TokenType.WHITESPACE:
                this.advance();
                return null;

            case TokenType.COMMA:
                this.advance();
                return null;

            case TokenType.NUMBER: {
                this.advance(); // Consume the token
                const token = this.previous();
                return {
                    type: NodeType.NumericLiteral,
                    value: parseFloat(token.value),
                    raw: token.value
                } as NumericLiteral;
            }

            case TokenType.PERCENT: {
                this.advance(); // Consume the token
                const token = this.previous();
                const numStr = token.value.replace('%', '');
                return {
                    type: NodeType.PercentLiteral,
                    value: parseFloat(numStr),
                    raw: token.value
                } as PercentLiteral;
            }

            case TokenType.HEXVALUE: {
                this.advance(); // Consume the token
                const token = this.previous();
                return {
                    type: NodeType.HexLiteral,
                    value: token.value,
                    raw: token.value
                } as HexLiteral;
            }

            case TokenType.IDENTIFIER: {
                this.advance(); // Consume the token
                const token = this.previous();
                return {
                    type: NodeType.Identifier,
                    name: token.value
                } as Identifier;
            }

            case TokenType.LPAREN: {
                this.advance(); // Consume the '('
                const expr = this.expression();
                // Use this.consume() to ensure the closing ')' is present
                this.consume(TokenType.RPAREN, "Expected ')' after expression");
                return {
                    type: NodeType.GroupExpression,
                    expression: expr
                } as GroupExpression;
            }

            default:
                // If none of the above match, throw an error
                throw this.error(this.peek(), 'Expected expression');
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






// src/Context.ts

import { inspect, type InspectOptions } from 'node:util';
import { type Character } from "./Character.ts";
import { State } from "./States.ts";
import { Transition } from './Transition.ts';

const EMIT = true;
const NO_EMIT = false;

class Context {
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
    private state: State;

    constructor(initialState: State) {
        this.state = initialState;
    }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public process(char: Character): boolean {
        const transition: Transition = this.state.handle(char);

        switch (transition.kind) {
            case "EmitAndTo": {
                this.transitionTo(transition.state);
                return EMIT;
            }
            
            case "To": {
                if (this.isAccepted()) {
                    return NO_EMIT;
                }
                this.transitionTo(transition.state);
                break;
            }

            case "Stay": {
                if (this.isAccepted()) {
                    return NO_EMIT;
                }
                break;
            }
        }

        return NO_EMIT;
    }

    public isAccepted(): boolean {
        return this.state.isAccepting;
    }
}

export { Context };






// src/Character.ts

import { inspect, type InspectOptions } from 'node:util';

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

type ClassifyFunction = (char: string) => CharType;
type CharTypeFn = (char: string) => boolean;
type Spec = Map<CharType, CharTypeFn>;

enum CharType {
    Start = 'Start',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Operator = 'Operator',
    Other = 'Other',
    EOF = 'EOF',
    Error = 'Error',
}

interface Position {
    index: number;
    line: number;
    column: number;
}

interface ICharacter {
    value: string;
    type: CharType;
    position: Position;
}

class Character implements ICharacter {
    public value: string = '';
    public type: CharType = CharType.Start;
    public position: Position = {
        index: 0,
        line: 1,
        column: 1
    };

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

    public static Operators: Set<string> = new Set([
        '`', '~', '!', '@', '#',
        '$', '%', '^', '&', '*',
        '(', ')', '-', '_', '=',
        '+', '[', ']', '{', '}',
        ';', ':', "'", '"', ',',
        '<', '>', '.', '/', '?',
        '|', '\\',
    ]);

    public static Whitespace: Set<string> = new Set([
        ' ', '\t',
    ]);

    public static NewLine: Set<string> = new Set([
        '\n', '\r',
    ]);

    public static CharSpec: Spec = new Map<CharType, CharTypeFn>([
        [CharType.EOF, (char) => char === ''],
        [CharType.Whitespace, (char) => Character.Whitespace.has(char)],
        [CharType.NewLine, (char) => Character.NewLine.has(char)],
        [CharType.Letter, (char) => Character.Letters.has(char)],
        [CharType.Number, (char) => Character.Numbers.has(char)],
        [CharType.Operator, (char) => Character.Operators.has(char)],
    ]);

    public static classify: ClassifyFunction = (char: string): CharType => {
        if (!char) return CharType.Other;

        for (const [charType, fn] of Character.CharSpec) {
            if (fn(char)) return charType as CharType;
        }

        return CharType.Error;
    };
}

class ListNode {
    public next: ListNode | null = null;
    constructor(public value: ICharacter) { }
}

class CharacterList implements IterableIterator<ICharacter> {
    private iteratorNode: ListNode | null = null;
    private _length: number = 0;
    
    private head: ListNode | null = null;
    private tail: ListNode | null = null;

    get length(): number { return this._length; }

    public [Symbol.iterator](): IterableIterator<ICharacter> {
        this.iteratorNode = this.head;
        return this;
    }

    public next(): IteratorResult<ICharacter> {
        if (this.iteratorNode) {
            const value = this.iteratorNode.value;
            this.iteratorNode = this.iteratorNode.next;
            return { done: false, value };
        }
        return { done: true, value: undefined as any };
    }

    public push(value: ICharacter): void {
        const newNode = new ListNode(value);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else if (this.tail) {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this._length++;
    }

    public pop(): ICharacter | undefined {
        if (!this.head) return undefined;
        const value = this.head.value;
        this.head = this.head.next;
        if (!this.head) this.tail = null;
        this._length--;
        return value;
    }

    public peek(): ICharacter | undefined {
        return this.head?.value;
    }

    public traverse(): void {
        let current = this.head;
        while (current) {
            console.log('Traversing:', inspect(current.value, inspectOptions));
            current = current.next;
        }
    }

    public display(): void {
        let current = this.head;
        const elements: ICharacter[] = [];
        while (current) {
            elements.push(current.value);
            current = current.next;
        }
        console.log(inspect(elements.join(" -> "), inspectOptions));
    }
}

class CharacterStream implements IterableIterator<ICharacter> {
    private readonly source: string;
    protected list: CharacterList;

    private currentChar: ICharacter = {
        value: '',
        type: CharType.Start,
        position: {
            index: 0,
            line: 1,
            column: 1
        }
    };

    constructor(input: string) {
        this.source = input;
        this.list = new CharacterList();
        this.init();
    }

    public init(): void {
        if (!this.source) {
            this.list.push(this.atEOF());
            return;
        }

        for (const char of this.source) {
            this.currentChar = {
                value: char,
                type: Character.classify(char),
                position: { ...this.currentChar.position }
            };

            this.list.push({ ...this.currentChar });
            this.advance();
        }

        this.list.push(this.atEOF());
    }

    public next(): IteratorResult<ICharacter> {
        return this.list.next();
    }

    public [Symbol.iterator](): IterableIterator<ICharacter> {
        return this.list[Symbol.iterator]();
    }

    public advance(): void {
        const newPosition = { ...this.currentChar.position };
        
        newPosition.index++;
        if (this.currentChar.value === '\n') {
            newPosition.line++;
            newPosition.column = 1;
        } else {
            newPosition.column++;
        }
        
        this.currentChar.position = { ...newPosition };
    }

    public peek(): ICharacter {
        return this.list.peek() ?? this.atEOF();
    }

    public isEOF(): boolean {
        return this.currentChar.position.index >= this.source.length;
    }

    public atEOF(): ICharacter {
        return ({
            value: '',
            type: CharType.EOF,
            position: { ...this.currentChar.position },
        });
    }

    public atError(): ICharacter {
        return {
            value: 'Error',
            type: CharType.Other,
            position: { ...this.currentChar.position }
        };
    }
}

export {
    type Position,
    CharType,
    Character,
    CharacterStream,
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