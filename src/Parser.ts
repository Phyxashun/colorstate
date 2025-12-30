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