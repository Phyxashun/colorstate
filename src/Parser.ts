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
        tokens = tokens.filter(t => t.type !== TokenType.WHITESPACE);

        // Filter out COMMA tokens
        tokens = tokens.filter(t => t.type !== TokenType.COMMA);

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

        if (this.match(TokenType.WHITESPACE)) {
            return null;
        }

        if (this.match(TokenType.COMMA)) {
            return null;
        }

        if (this.match(TokenType.NUMBER)) {
            const token = this.previous();
            return {
                type: NodeType.NumericLiteral,
                value: parseFloat(token.value),
                raw: token.value
            } as NumericLiteral;
        }

        if (this.match(TokenType.PERCENT)) {
            const token = this.previous();
            const numStr = token.value.replace('%', '');
            return {
                type: NodeType.PercentLiteral,
                value: parseFloat(numStr),
                raw: token.value
            } as PercentLiteral;
        }

        if (this.match(TokenType.HEXVALUE)) {
            const token = this.previous();
            return {
                type: NodeType.HexLiteral,
                value: token.value,
                raw: token.value
            } as HexLiteral;
        }

        if (this.match(TokenType.IDENTIFIER)) {
            const token = this.previous();
            return {
                type: NodeType.Identifier,
                name: token.value
            } as Identifier;
        }

        if (this.match(TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RPAREN, "Expected ')' after expression");
            return {
                type: NodeType.GroupExpression,
                expression: expr
            } as GroupExpression;
        }

        throw this.error(this.peek(), 'Expected expression');
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
