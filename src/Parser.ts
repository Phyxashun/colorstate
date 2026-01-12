// src/Parser.ts

import { type Token, TokenType } from './types/Tokenizer.types.ts';
import { NodeType } from './types/Parser.types.ts';
import type {
    Statement, Expression, VariableDeclarationKind, Program,
    ExpressionStatement, VariableDeclaration, Identifier,
    StringLiteral, NumericLiteral, HexLiteral, PercentLiteral,
    DimensionLiteral, BinaryExpression, UnaryExpression,
    CallExpression, GroupExpression, SeriesExpression,
    AssignmentExpression, DimensionKind, ColorFunctionKind,
    SequenceExpression,
} from './types/Parser.types.ts';
import { inspect, type InspectOptions } from 'node:util';

const inspectOptions: InspectOptions = {
    showHidden: false,
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
 * @function omitPosition
 * @description Removes the position property from a node  
 * @param obj 
 * @returns an object without the position property
 */
function omitPosition<T>(obj: T): Omit<T, 'position'> {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(omitPosition) as any;

    const result: any = {};
    for (const key in obj) {
        if (key === 'position') continue;
        result[key] = omitPosition(obj[key]);
    }
    return result;
}

/**
 * A helper to log the AST without the noise of source mapping
 */
export function inspectAST(node: any, options: InspectOptions = {}): string {
    const cleanNode = omitPosition(node);
    
    return inspect(cleanNode, {
        depth: null,
        colors: true,
        compact: false,
        ...options
    });
}

export class Parser {
    private tokens: Token[];
    private currentIndex: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t =>
            t.type !== TokenType.WHITESPACE &&
            t.type !== TokenType.NEWLINE
        );
    }

    public debug(program: Program) {
        console.log(inspectAST(program, inspectOptions));
    }

    public parse(): Program {
        // Capture the very first token for the start position.
        const start = this.peek().position.start;
        const statements: Statement[] = [];

        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }

        // Capture the last token consumed for the end position.
        // If the file is empty, this will be the same as the start.
        const end = this.tokens.length > 0 ? this.previous().position.end : start;

        const result = {
            type: NodeType.Program,
            body: statements,
            position: { start, end }
        } as Program;

        return result;
    }

    private declaration(): Statement {
        let stmt: Statement;

        // We check for a keyword WITHOUT consuming it first.
        if (this.check(TokenType.KEYWORD)) {
            const keyword = this.peek().value;

            // Check if the keyword is one we use for declarations
            if (this.isVariableDeclarationKind(keyword)) {
                // Now consume the keyword
                this.advance();
                // Assign the parsed statement to our variable instead of returning early
                stmt = this.variableDeclaration(keyword as VariableDeclarationKind);
            }
            //if (this.isColorFunctionKind(keyword)) {
            //    this.advance();
            //    stmt = this.statement();
            //}

            else {
                // If it's a keyword but not for a declaration (e.g. 'return' in the future),
                // treat it as a regular statement for now.
                stmt = this.statement();
            }
        }

        /**
         * Add future statment checks here
         */

        else {
            // If it's not a declaration keyword or not a keyword at all,
            // parse it as a simple expression statement.
            stmt = this.statement();
        }

        // After any statement, optionally consume a semicolon.
        this.match(TokenType.SEMICOLON);

        return stmt;
    }

    private variableDeclaration(kind: VariableDeclarationKind): VariableDeclaration {
        const start = this.peek().position.start;
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.').value;

        this.consume(TokenType.EQUALS, "Expect '=' after variable name.");

        const initializer = this.expression();

        // Assuming you have a Semicolon token type or will handle it
        // this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        const end = this.tokens.length > 0 ? this.previous().position.end : start;
        return {
            type: NodeType.VariableDeclaration,
            kind,
            identifier: { type: NodeType.Identifier, name },
            initializer,
            position: { start, end },
        };
    }

    private statement(): Statement {
        return this.expressionStatement();
    }

    private expressionStatement(): ExpressionStatement {
        const start = this.peek().position.start;
        const expr = this.expression();
        const end = this.tokens.length > 0 ? this.previous().position.end : start;
        return {
            type: NodeType.ExpressionStatement,
            expression: expr,
            position: { start, end },
        };
    }

    private expression(): Expression {
        return this.assignment();
    }

    private assignment(): Expression {
        // Parse the expression on the left, which might be a variable name
        const expr = this.series();

        // If the token that follows is an '=', we have an assignment
        if (this.match(TokenType.EQUALS)) {
            const equals = this.previous(); // The '=' token, for error reporting
            // Recursively call assignment() to handle right-associativity (e.g., a = b = 5)
            const right = this.assignment();

            // The left-hand side of an assignment must be a valid target.
            // For now, we'll just check if it's an Identifier.
            if (expr.type === NodeType.Identifier) {
                return {
                    type: NodeType.AssignmentExpression,
                    left: expr,
                    right: right,
                    position: {
                        start: expr.position.start,
                        end: right.position.end
                    }
                } as AssignmentExpression;
            }

            // If you try to do something like `5 = 10`, this error will be thrown.
            throw this.error(equals, "Invalid assignment target.");
        }

        // If there was no '=', it's not an assignment, so just return the expression we parsed.
        return expr;
    }

    private series(): Expression {
        // 1. Get the first sequence
        let first = this.sequence();

        if (!this.check(TokenType.COMMA)) {
            return first;
        }

        const expressions: Expression[] = [first];
        while (this.match(TokenType.COMMA)) {
            expressions.push(this.sequence());
        }

        return {
            type: NodeType.SeriesExpression,
            expressions: expressions,
            position: {
                start: expressions[0]!.position.start,
                end: expressions[expressions.length - 1]!.position.end
            }
        } as SeriesExpression;
    }

    private sequence(): Expression {
        let first = this.addition();

        // If the next token can't start a sequence, return the single expression
        if (!this.canStartExpression() ||
            this.check(TokenType.COMMA) ||
            this.check(TokenType.EQUALS) ||
            this.check(TokenType.SEMICOLON) ||
            this.check(TokenType.RPAREN)) {
            return first;
        }

        const elements: Expression[] = [first];

        // Collect all space-separated additions
        while (this.canStartExpression() &&
            !this.check(TokenType.COMMA) &&
            !this.check(TokenType.EQUALS) &&
            !this.check(TokenType.SEMICOLON) &&
            !this.check(TokenType.RPAREN)) {
            elements.push(this.addition());
        }

        return {
            type: NodeType.SequenceExpression,
            expressions: elements,
            position: {
                start: (elements[0] as any).position.start,
                end: (elements[elements.length - 1] as any).position.end
            }
        } as SequenceExpression;
    }

    private addition(): Expression {
        // Parse the left-hand side first. It contains the starting position.
        let expr = this.multiplication();

        while (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
            const operator = this.previous().value as '+' | '-';
            const right = this.multiplication();

            // The new node starts where the left side started,
            // and ends where the right side ends.
            expr = {
                type: NodeType.BinaryExpression,
                operator,
                left: expr,
                right,
                position: {
                    start: expr.position.start, // Start of the original left expression
                    end: right.position.end      // End of the new right expression
                }
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
                position: {
                    start: expr.position.start,
                    end: right.position.end
                }
            } as BinaryExpression;
        }

        return expr;
    }

    private unary(): Expression {
        if (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
            const operatorToken = this.previous();
            const operator = operatorToken.value as '+' | '-';
            const argument = this.unary();
            return {
                type: NodeType.UnaryExpression,
                operator,
                argument,
                position: {
                    start: operatorToken.position.start,
                    end: argument.position.end
                }
            } as UnaryExpression;
        }

        return this.call();
    }

    private call(): Expression {
        let expr = this.primary();

        if (
            expr &&
            expr.type === NodeType.Identifier &&
            this.match(TokenType.LPAREN)
        ) {
            const args: Expression[] = [];

            // Check if there are any arguments at all
            if (!this.check(TokenType.RPAREN)) {
                // Parse the first argument
                args.push(this.assignment());  // ✅ Use assignment() instead of expression()

                // Parse remaining arguments separated by commas
                while (this.match(TokenType.COMMA)) {
                    args.push(this.assignment());  // ✅ Use assignment() instead of expression()
                }
            }

            this.consume(TokenType.RPAREN, "Expected ')' after arguments");

            expr = {
                type: NodeType.CallExpression,
                callee: expr as Identifier,
                arguments: args,
                position: {
                    start: expr.position.start,
                    end: this.previous().position.end,
                },
            } as CallExpression;
        }

        return expr;
    }

    private primary(): Expression {
        let token = this.peek();

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

        token = this.peek();

        switch (token.type) {
            case TokenType.FUNCTION:
            case TokenType.IDENTIFIER: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.Identifier,
                    name: token.value,
                    position: {
                        start: token.position.start,
                        end: token.position.end
                    },
                } as Identifier;
            }

            case TokenType.LPAREN: {
                const startToken = this.peek();
                this.advance();

                // Handle empty parentheses - not valid, throw error
                if (this.check(TokenType.RPAREN)) {
                    this.consume(TokenType.RPAREN, "Expected expression before ')'");
                    //throw this.error(this.peek(), "Empty parentheses are not allowed");
                }

                const expr = this.expression();
                const endToken = this.consume(TokenType.RPAREN, "Expected ')' after expression");
                return {
                    type: NodeType.GroupExpression,
                    expression: expr,
                    position: {
                        start: startToken.position.start,
                        end: endToken.position.end
                    },
                } as GroupExpression;
            }

            default:
                throw this.error(token, `Expected expression, got ${token.type}`);
        }
    }

    private createLiteralNode(token: Token): Expression {
        const position = {
            start: token.position.start,
            end: token.position.end
        };

        switch (token.type) {
            case TokenType.STRING: {
                return {
                    type: NodeType.StringLiteral,
                    value: token.value,
                    raw: `"${token.value}"`,
                    position,
                } as StringLiteral;
            }

            case TokenType.NUMBER: {
                return {
                    type: NodeType.NumericLiteral,
                    value: parseFloat(token.value),
                    raw: token.value,
                    position,
                } as NumericLiteral;
            }

            case TokenType.PERCENT: {
                const numStr = token.value.replace('%', '');
                return {
                    type: NodeType.PercentLiteral,
                    value: parseFloat(numStr),
                    raw: token.value,
                    position,
                } as PercentLiteral;
            }

            case TokenType.DIMENSION: {
                const match = token.value.match(/^([\d.]+)([a-zA-Z]+)$/);
                if (match && match[1] && match[2]) {
                    if (!this.isDimensionKind(match[2])) {
                        throw this.error(token, `Invalid dimension format for '${token.value}'. '${match[2]}' is not a valid dimension.`);
                    }
                    return {
                        type: NodeType.DimensionLiteral,
                        value: parseFloat(match[1]),
                        unit: match[2],
                        raw: token.value,
                        position,
                    } as DimensionLiteral;
                } else {
                    throw this.error(token, `Invalid dimension format for '${token.value}'`);
                }
            }

            case TokenType.HEXVALUE: {
                return {
                    type: NodeType.HexLiteral,
                    value: token.value,
                    raw: token.value,
                    position,
                } as HexLiteral;
            }

            default:
                throw this.error(token, `Expected expression, got ${token.type}`);
        }
    }

    /**
     * Helper Methods
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

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        this.currentIndex++;

        while (!this.isAtEnd() && this.isIgnored(this.peek())) {
            this.currentIndex++;
        }
        return this.previous();
    }

    private isIgnored(token: Token): boolean {
        return token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE;
    }

    private isAtEnd(): boolean {
        return this.currentIndex >= this.tokens.length || this.peek().type === TokenType.END;
    }

    private isVariableDeclarationKind(value: string): value is VariableDeclarationKind {
        return value === 'const' || value === 'let' || value === 'var';
    }

    private isDimensionKind(value: string): value is DimensionKind {
        return value === 'deg' ||
            value === 'grad' ||
            value === 'rad' ||
            value === 'turn';
    }

    private isColorFunctionKind(value: string): value is ColorFunctionKind {
        return value === 'rgb' ||
            value === 'rgba' ||
            value === 'hsl' ||
            value === 'hsla' ||
            value === 'hwb' ||
            value === 'lab' ||
            value === 'lch' ||
            value === 'oklab' ||
            value === 'oklch' ||
            value === 'ictcp' ||
            value === 'jzazbz' ||
            value === 'jzczhz' ||
            value === 'alpha' ||
            value === 'color';
    }

    private canStartExpression(): boolean {
        if (this.isAtEnd()) return false;
        const type = this.peek().type;
        return (
            type === TokenType.NUMBER ||
            type === TokenType.IDENTIFIER ||
            type === TokenType.STRING ||
            type === TokenType.HEXVALUE ||
            type === TokenType.LPAREN ||
            type === TokenType.PERCENT ||
            type === TokenType.DIMENSION
        );
    }

    private peek(): Token {
        return this.tokens[this.currentIndex] as Token;
    }

    private previous(n: number = 1): Token {
        return this.tokens[this.currentIndex - n] as Token;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): Error {
        return new Error(`Parse error at '${token.value}': ${message}`);
    }
}
