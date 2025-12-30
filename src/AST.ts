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