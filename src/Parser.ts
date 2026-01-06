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