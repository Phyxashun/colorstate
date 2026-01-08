

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\Transition.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Transition.ts

import { State } from './States.ts';
import Char from '../src/Character.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: State }
    | { kind: 'EmitAndTo'; state: State }
    | { kind: 'ToContinue'; state: State }
    | { kind: 'BeginString'; state: State; quoteType: Char.Type }
    | { kind: 'EndString'; state: State; quoteType: Char.Type }
    | { kind: 'EscapeNext'; state: State };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: State) => Transition; }
    & { EmitAndTo: (state: State) => Transition; }
    & { ToContinue: (state: State) => Transition; }
    & { BeginString: (state: State, quoteType: Char.Type) => Transition; }
    & { EndString: (state: State, quoteType: Char.Type) => Transition; }
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
    
    BeginString: (state: State, quoteType: Char.Type): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: State, quoteType: Char.Type): Transition =>
        ({ kind: 'EndString', state, quoteType }),

    EscapeNext: (state: State): Transition =>
        ({ kind: 'EscapeNext', state }),
};




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\Transition.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\Tokenizer.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';
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

describe('Tokenizer', () => {
    it('tokenizes identifiers and numbers', () => {
        const tokens = new Tokenizer().tokenize('foo 123');

        expect(tokens.map(t => t.type)).toContain(TokenType.IDENTIFIER);
        expect(tokens.map(t => t.type)).toContain(TokenType.NUMBER);
    });

    it('tokenizes strings', () => {
        const tokens = new Tokenizer().tokenize("'abc'");
        const str = tokens.find(t => t.type === TokenType.STRING);

        expect(str?.value).toBe('abc');
    });

    it('tokenizes hex colors', () => {
        const tokens = new Tokenizer().tokenize('#ff00ff');

        expect(tokens[0].type).toBe(TokenType.HEXVALUE);
    });

    it('tokenizes percentages and dimensions', () => {
        const tokens = new Tokenizer().tokenize('50% 90deg');

        expect(tokens.some(t => t.type === TokenType.PERCENT)).toBe(true);
        expect(tokens.some(t => t.type === TokenType.DIMENSION)).toBe(true);
    });

    it('classifies unknown characters as Other', () => {
        const tokens = new Tokenizer().tokenize('©');

        expect(tokens[0].type).toBe(TokenType.SYMBOL);
    });

    it('rejects escape outside string', () => {
        const tokens = new Tokenizer().tokenize('\\a');

        expect(tokens[0].type).toBe(TokenType.SYMBOL);
    });

    it('flushes buffer at EOF', () => {
        const tokens = new Tokenizer().tokenize('abc');

        expect(tokens.at(0)?.value).toBe('abc');
    });

    it('reprocesses character after emit', () => {
        const tokens = new Tokenizer().tokenize('1+2');

        expect(tokens.map(t => t.value)).toContain('+');
    });

    it('treats backslash as symbol outside string', () => {
        const tokens = new Tokenizer().tokenize('\\a');

        expect(tokens[0].type).toBe(TokenType.SYMBOL);
    });

    it('handles escaped quotes in strings', () => {
        const tokens = new Tokenizer().tokenize("'\\''");
        console.log(inspect(tokens, inspectOptions));
        expect(tokens[0].value).toBe("'");
    });

    it('handles escaped character in strings', () => {
        const tokens = new Tokenizer().tokenize('"\\""');
        console.log(inspect(tokens, inspectOptions));
        expect(tokens[0].value).toBe('"');
    });
});




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\Tokenizer.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\States.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import Char, { type Character } from './Character.ts';
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
            case Char.Type.SingleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.SingleQuote);
            case Char.Type.DoubleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.DoubleQuote);
            case Char.Type.Backtick:
                return Transition.BeginString(String_State.instance, Char.Type.Backtick);

            // Whitespace
            case Char.Type.Whitespace:
                return Transition.To(Whitespace_State.instance);
            case Char.Type.NewLine:
                return Transition.To(NewLine_State.instance);

            // Letters
            case Char.Type.Letter:
                return Transition.To(Letter_State.instance);

            // Numbers
            case Char.Type.Number:
                return Transition.To(Number_State.instance);

            // Hexadecimal
            case Char.Type.Hash:
                return Transition.To(Hex_State.instance);

            // All single-character tokens
            case Char.Type.Comma:
            case Char.Type.LParen:
            case Char.Type.RParen:
            case Char.Type.LBracket:
            case Char.Type.RBracket:
            case Char.Type.LBrace:
            case Char.Type.RBrace:
            case Char.Type.SemiColon:
            case Char.Type.Dot:
            case Char.Type.Plus:
            case Char.Type.Minus:
            case Char.Type.Star:
            case Char.Type.Slash:
            case Char.Type.EqualSign:
            case Char.Type.GreaterThan:
            case Char.Type.LessThan:
            case Char.Type.Exclamation:
            case Char.Type.Question:
            case Char.Type.Colon:
            case Char.Type.Caret:
            case Char.Type.Ampersand:
            case Char.Type.Pipe:
            case Char.Type.Tilde:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.BackSlash:
            case Char.Type.Unicode:
                return Transition.To(Symbol_State.instance);

            case Char.Type.Other:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.EOF:
                return Transition.To(End_State.instance);

            case Char.Type.Error:
                return Transition.To(End_State.instance);

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
            case Char.Type.Whitespace:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
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
        return Transition.EmitAndTo(Initial_State.instance);
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
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
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
            case Char.Type.Number:
            case Char.Type.Dot:
                return Transition.Stay();

            case Char.Type.Percent:
                return Transition.ToContinue(Percent_State.instance);

            case Char.Type.Letter:
                return Transition.ToContinue(Dimension_State.instance);

            default:
                return Transition.EmitAndTo(Initial_State.instance);
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
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
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
            case Char.Type.Hash:
            case Char.Type.Hex:
            case Char.Type.Letter:
            case Char.Type.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
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
            case Char.Type.BackSlash:
                return Transition.EscapeNext(String_State.instance);

            case Char.Type.SingleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.SingleQuote);

            case Char.Type.DoubleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.DoubleQuote);

            case Char.Type.Backtick:
                return Transition.EndString(Initial_State.instance, Char.Type.Backtick);

            case Char.Type.EOF:
            case Char.Type.NewLine:
                return Transition.EmitAndTo(Initial_State.instance);

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

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
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
        return Transition.EmitAndTo(Initial_State.instance);
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
            case Char.Type.Unicode:
            case Char.Type.BackSlash:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
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




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\States.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\States.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

import { describe, it, expect } from 'vitest';
import { InitialState, StringState } from '../src/States';
import { CharType } from '../src/Character';

describe('State transitions', () => {
    it('enters string state', () => {
        const t = InitialState.handle({
            value: '"',
            type: CharType.DoubleQuote,
            position: { index: 0, line: 1, column: 1 }
        });

        expect(t.kind).toBe('BeginString');
    });

    it('string escapes next character', () => {
        const t = StringState.handle({
            value: '\\',
            type: CharType.BackSlash,
            position: { index: 0, line: 1, column: 1 }
        });

        expect(t.kind).toBe('EscapeNext');
    });

    
});




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\States.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\Parser.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Parser.ts

import { type Token, TokenType } from './Tokenizer.ts';
import {
    NodeType,
    type Program,
    type Expression,
    type Statement,
    type ExpressionStatement,
    type VariableDeclaration,
    type Identifier,
    type StringLiteral,
    type NumericLiteral,
    type HexLiteral,
    type PercentLiteral,
    type BinaryExpression,
    type UnaryExpression,
    type CallExpression,
    type GroupExpression,
    type ASTNode,
} from '../test_old/AST.ts';

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

    private get nextToken(): Token {
        return this.peek();
    } 

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t =>
            t.type !== TokenType.WHITESPACE &&
            t.type !== TokenType.NEWLINE
        );
    }

    public parse(): Program {
        const statements: Statement[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }
        return {
            type: NodeType.Program,
            body: statements
        };
    }

    private declaration(): Statement {
        if (this.match(TokenType.CONST)) {
            return this.variableDeclaration('const');
        }
        // Add checks for `let`, `function`, etc. here in the future

        // If it's not a known declaration, assume it's a regular statement
        return this.statement();
    }

    private variableDeclaration(kind: 'const' | 'let'): VariableDeclaration {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.').value;

        this.consume(TokenType.EQUALS, "Expect '=' after variable name.");

        const initializer = this.expression();

        // Assuming you have a Semicolon token type or will handle it
        // this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");

        return {
            type: NodeType.VariableDeclaration,
            kind,
            identifier: { type: NodeType.Identifier, name },
            initializer,
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
            this.match(TokenType.STAR, TokenType.SLASH)
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
        if (
            expr &&
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
        const token = this.nextToken;

        if (this.isAtEnd()) {
            throw this.error(token, 'Unexpected end of input');
        }

        // Check if it's any type of literal
        if (this.match(
            TokenType.NUMBER,
            TokenType.STRING,
            TokenType.HEXVALUE,
            TokenType.PERCENT,
            TokenType.DIMENSION
        )) {
            return this.createLiteralNode(this.previous());
        }

        switch (token.type) {
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
                throw this.error(token, `Expected expression, got ${token.type}`);
        }
    }

    private createLiteralNode(token: Token): Expression {
        switch (token.type) {
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

            default:
                throw this.error(token, `Expected expression, got ${token.type}`);
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
        return this.nextToken.type === type;
    }

    private advance(): Token {
        this.current++;
        
        while (!this.isAtEnd() && this.isIgnored(this.nextToken)) {
            this.current++;
        }
        return this.previous();
    }

    private isIgnored(token: Token): boolean {
        return token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE;
    }

    private isAtEnd(): boolean {
        return this.current >= this.tokens.length || this.nextToken.type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current] as Token;
    }

    private previous(): Token {
        return this.tokens[this.current - 1] as Token;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.nextToken, message);
    }

    private error(token: Token, message: string): Error {
        return new Error(`Parse error at '${token.value}': ${message}`);
    }
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\Parser.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/Tokenizer';
import { Parser } from '../src/Parser';
import { NodeType } from '../src/AST';

describe('Parser', () => {
    it('parses arithmetic expressions', () => {
        const tokens = new Tokenizer().tokenize('1 + 2 * 3');
        const ast = new Parser(tokens).parse();

        expect(ast.type).toBe(NodeType.Program);
        expect(ast.body[0].expression.type).toBe(NodeType.BinaryExpression);
    });

    it('parses function calls', () => {
        const tokens = new Tokenizer().tokenize('rgb(1, 2, 3)');
        const ast = new Parser(tokens).parse();

        expect(ast.body[0].expression.type).toBe(NodeType.CallExpression);
    });

    it('parses grouped expressions', () => {
        const tokens = new Tokenizer().tokenize('(1 + 2)');
        const ast = new Parser(tokens).parse();

        expect(ast.body[0].expression.type).toBe(NodeType.GroupExpression);
    });

    it('throws on invalid binary expression', () => {
        const tokens = new Tokenizer().tokenize('1 +');
        
        expect(() => new Parser(tokens).parse()).toThrow();
    });
});




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\originial_consolidate.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

/**
 * @file ./consolidate.ts
 * @description A utility script to consolidate various project files (configurations, source code, tests) 
 *              into single, combined files for easier review or distribution. It uses glob patterns
 *              to find relevant files and appends their content into specified output files.
 * @copyright 2026 Dustin Dew
 * @license MIT
 * @author Dustin Dew <phyxashun@gmail.com>
 */

import figlet from 'figlet';
import standard from "figlet/fonts/Standard";
import * as fs from 'node:fs';
import { styleText } from 'node:util';
import { globSync } from 'glob';

/**
 * Prints a styled horizontal line to the console.
 * @param {number} [width=80] - The width of the line in characters.
 * @returns {void}
 */
const line = (width: number = 80): void => {
    console.log(styleText(['black', 'bold', 'bgGray'], '='.repeat(width)));
};

// Initial setup and ASCII Art display
console.log();
line();

figlet.parseFont('Standard', standard);

const asciiArt = await figlet.text('     Consolidator!', {
    font: 'Standard',
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true
});

const coloredArt = styleText(['yellowBright', 'bold'], asciiArt);
console.log(coloredArt);

/**
 * Finds files matching given glob patterns, reads their content, and appends it to a single output file.
 * Each appended file's content is separated by a header comment for clarity.
 *
 * @param {string} what - A descriptive name for the type of files being processed (e.g., 'Configuration', 'Typescript').
 * @param {string} outputFile - The path to the file where all content will be consolidated. The file will be deleted if it already exists.
 * @param {string[]} patterns - An array of glob patterns used to find the files to consolidate.
 * @returns {void}
 */
const processFiles = (what: string, outputFile: string, patterns: string[]) => {
    // Ensure the output file is empty before starting
    if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
    }

    console.log(styleText('cyan', `Consolidating all project ${what} files into`), `${outputFile}...\n`);

    patterns.forEach(pattern => {
        const files = globSync(pattern, { ignore: ['node_modules/**', outputFile] });

        files.forEach(file => {
            console.log(styleText('blue', `\tAppending:`), `${file}`);
            const content = fs.readFileSync(file, 'utf-8');
            
            // Add a ts-nocheck and a header to separate files in the output
            fs.appendFileSync(outputFile, `// @ts-nocheck\n\n`, 'utf-8');
            fs.appendFileSync(outputFile, `\n// ==================== Start of file: ${file} ====================\n\n`, 'utf-8');
            fs.appendFileSync(outputFile, content, 'utf-8');
            fs.appendFileSync(outputFile, `\n// ==================== End of file: ${file} ====================\n\n\n\n\n\n`, 'utf-8');
        });
    });

    console.log(styleText(['green', 'bold'], '\nConsolidation complete!!!\n'));
    line();
    console.log();
};

/**
 * Main orchestration function for the consolidation script.
 * It defines configurations for different file types (config, typescript, tests)
 * and calls `processFiles` for each type to perform the consolidation.
 * @returns {void}
 */
const consolidate = () => {
    line();
    console.log(styleText(['magentaBright', 'bold'], '\n*** PROJECT FILE CONSOLIDATOR SCRIPT ***\n'));
    line();
    console.log();
    
    /**
     * Configuration for consolidating project configuration files.
     */
    const configWhat = styleText(['red', 'underline'], 'Configuration');
    const configOutputFile = './ALL/ALL_CONFIGS.ts';
    const configPatterns = [
        '.vscode/launch.json',
        '.vscode/settings.json',
        '.gitignore',
        '*.json',
        '*.config.ts',
        'License',
        'README.md',
    ];
    processFiles(configWhat, configOutputFile, configPatterns);

    /**
     * Configuration for consolidating TypeScript source files.
     */
    const tsWhat = styleText(['red', 'underline'], 'Typescript');
    const tsOutputFile = './ALL/ALL_FILES.ts';
    const tsPatterns = [
        'index.ts',
        'src/**/*.ts',
    ];
    processFiles(tsWhat, tsOutputFile, tsPatterns);

    /**
     * Configuration for consolidating test files.
     */
    const testWhat = styleText(['red', 'underline'], 'Test');
    const testOutputFile = './ALL/ALL_TESTS.ts';
    const testPatterns = [
        'tests/**/*.test.ts'
    ];
    processFiles(testWhat, testOutputFile, testPatterns);
}

// Execute the main function
consolidate();





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\originial_consolidate.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\FunctionalStates.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/FunctionalStates.ts

import { inspect, type InspectOptions } from 'node:util';
import Char, { type Character } from './Character.ts';
import { Tokenizer } from './Tokenizer.ts';
import { Parser } from './Parser.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: StateName }
    | { kind: 'EmitAndTo'; state: StateName }
    | { kind: 'ToContinue'; state: StateName }
    | { kind: 'BeginString'; state: StateName; quoteType: Char.Type }
    | { kind: 'EndString'; state: StateName; quoteType: Char.Type }
    | { kind: 'EscapeNext'; state: StateName };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: StateName) => Transition; }
    & { EmitAndTo: (state: StateName) => Transition; }
    & { ToContinue: (state: StateName) => Transition; }
    & { BeginString: (state: StateName, quoteType: Char.Type) => Transition; }
    & { EndString: (state: StateName, quoteType: Char.Type) => Transition; }
    & { EscapeNext: (state: StateName) => Transition; };

export const Transition: TransitionFn = {
    Stay: (): Transition =>
        ({ kind: 'Stay' }),

    To: (state: StateName): Transition =>
        ({ kind: 'To', state }),

    EmitAndTo: (state: StateName): Transition =>
        ({ kind: 'EmitAndTo', state }),

    ToContinue: (state: StateName): Transition =>
        ({ kind: 'ToContinue', state }),

    BeginString: (state: StateName, quoteType: Char.Type): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: StateName, quoteType: Char.Type): Transition =>
        ({ kind: 'EndString', state, quoteType }),

    EscapeNext: (state: StateName): Transition =>
        ({ kind: 'EscapeNext', state }),
}

// Define the available state names as a type for safety
export type StateName =
    | 'Initial' | 'Whitespace' | 'NewLine' | 'Letter'
    | 'Number' | 'Dimension' | 'Hex' | 'String'
    | 'Percent' | 'SingleChar' | 'Symbol' | 'End';

enum State {
    Initial = 'Initial',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Dimension = 'Dimension',
    Hex = 'Hex',
    String = 'String',
    Percent = 'Percent',
    SingleChar = 'SingleChar',
    Symbol = 'Symbol',
    End = 'End',
}

// Define the functional state handler type
type StateHandler = (char: Character) => Transition;

export const FunctionalStates: Record<StateName, StateHandler> = {
    [State.Initial]: (char) => {
        switch (char.type) {
            case Char.Type.SingleQuote:
                return Transition.BeginString(State.String, Char.Type.SingleQuote);
            case Char.Type.DoubleQuote:
                return Transition.BeginString(State.String, Char.Type.DoubleQuote);
            case Char.Type.Backtick:
                return Transition.BeginString(State.String, Char.Type.Backtick);
            case Char.Type.Whitespace:
                return Transition.To(State.Whitespace);
            case Char.Type.NewLine:
                return Transition.To(State.NewLine);
            case Char.Type.Letter:
                return Transition.To(State.Letter);
            case Char.Type.Number:
                return Transition.To(State.Number);
            case Char.Type.Hash:
                return Transition.To(State.Hex);

            case Char.Type.Comma: case Char.Type.LParen: case Char.Type.RParen:
            case Char.Type.Plus: case Char.Type.Minus: case Char.Type.Star:
            case Char.Type.Slash: case Char.Type.Percent:
                return Transition.To(State.SingleChar);

            case Char.Type.EOF:
                return Transition.To(State.End);
            default:
                return Transition.To(State.SingleChar);
        }
    },

    [State.Whitespace]: (char) =>
        char.type === Char.Type.Whitespace
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.NewLine]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Letter]: (char) =>
        char.type === Char.Type.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Number]: (char) => {
        if (char.type === Char.Type.Number || char.type === Char.Type.Dot)
            return Transition.Stay();
        
        if (char.type === Char.Type.Percent)
            return Transition.ToContinue(State.Percent);

        if (char.type === Char.Type.Letter)
            return Transition.ToContinue(State.Dimension);

        return Transition.EmitAndTo(State.Initial);
    },

    [State.Dimension]: (char) =>
        char.type === Char.Type.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Hex]: (char) => {
        const isHex =
            char.type === Char.Type.Hash ||
            char.type === Char.Type.Letter ||
            char.type === Char.Type.Number;
        return isHex ? Transition.Stay() : Transition.EmitAndTo(State.Initial);
    },

    [State.String]: (char) => {
        if (char.type === Char.Type.BackSlash)
            return Transition.EscapeNext(State.String);
        if (
            char.type === Char.Type.SingleQuote ||
            char.type === Char.Type.DoubleQuote ||
            char.type === Char.Type.Backtick
        ) {
            return Transition.EndString(State.Initial, char.type);
        }

        if (char.type === Char.Type.EOF || char.type === Char.Type.NewLine)
            return Transition.EmitAndTo(State.Initial);
        return Transition.Stay();
    },

    [State.Percent]: (_) => Transition.EmitAndTo(State.Initial),

    [State.SingleChar]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Symbol]: (char) => {
        const isSym = [
            Char.Type.Unicode,
            Char.Type.BackSlash,
            Char.Type.At,
            Char.Type.Symbol
        ].includes(char.type);
        return isSym ? Transition.Stay() : Transition.EmitAndTo(State.Initial);
    },

    [State.End]: (_) => Transition.Stay(),
}

// Define which states are "Accepting" (can produce a token)
export const AcceptingStates = new Set<StateName>([
    State.Whitespace,
    State.NewLine,
    State.Letter,
    State.Number,
    State.Dimension,
    State.Hex,
    State.String,
    State.Percent,
    State.SingleChar,
    State.Symbol,
    State.End
]);

// TESTING
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
    console.log('=== Char.Stream DEMO ===\n');
    line();

    const input = 'rgba(255, 100, 75, 50%)';

    const stream = new Char.Stream(input);
    let currentState: StateName = State.Initial;
    
    console.log(`INPUT: '${input}'\n`);
    console.log('RESULT OF Char.Stream:\n');
    
    for (const char of stream) {
        const ch = { value: char.value, type: char.type };
        const wasAccepting = AcceptingStates.has(currentState);
        const transition = FunctionalStates[currentState](char);
        console.log(inspect(ch, compactInspectOptions));
        console.log('WAS ACCEPTING:', wasAccepting, inspect(transition, compactInspectOptions));
        console.log();
        if ('state' in transition) {
            currentState = transition.state;
        }
    }
    
    line();
    console.log('NEW TEST\n')
    line();

    stream.set(input);

    // Step 1: Tokenize
    const tokenizer = new Tokenizer();
    const tokens = tokenizer
        .withLogging(`PARSER TEST:\n\nINPUT:\t'${input}'\n\n${'─'.repeat(80)}`)
        .tokenize(stream);

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

characterStreamTest();




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\FunctionalStates.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

import { describe, it, expect } from 'vitest';
import { Context } from '../src/Context';
import { CharType } from '../src/Character';

describe('Context string handling', () => {
    it('opens and closes matching string quotes', () => {
        const ctx = new Context();

        ctx.beginString(CharType.SingleQuote);
        expect(ctx.isInString()).toBe(true);

        ctx.endString();
        expect(ctx.isInString()).toBe(false);
    });

    it('handles escaping correctly', () => {
        const ctx = new Context();
        ctx.setEscaping(true);
        expect(ctx.isEscaping()).toBe(true);

        ctx.setEscaping(false);
        expect(ctx.isEscaping()).toBe(false);
    });

    it('ignores endString when not in string', () => {
        const ctx = new Context();
        expect(() => ctx.endString()).not.toThrow();
    });
});




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old\AST.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/AST.ts

/**
 * Node Types
 */
export enum NodeType {
    Program = 'Program',
    Declaration = 'Declaration',
    VariableDeclaration = 'VariableDeclaration',
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
    /** Byte index */
    index: number;
    /** Line number (1-indexed) */
    line: number;
    /** Column number (1-indexed) */
    column: number;
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
export type Statement = ExpressionStatement | VariableDeclaration;

/**
 * Expression wrapped as a statement
 */
export interface ExpressionStatement extends ASTNode {
    type: NodeType.ExpressionStatement;
    expression: Expression;
}

/**
 * Variable declaration node
 * Example: const x = 5;
 */
export interface VariableDeclaration extends ASTNode {
    type: NodeType.VariableDeclaration;
    /** The kind of declaration (e.g., const, let, var) */
    kind: 'const' | 'let' | 'var';
    /** The identifier being declared */
    identifier: Identifier;
    /** The expression the variable is initialized to (optional) */
    initializer?: Expression;
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




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old\AST.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
