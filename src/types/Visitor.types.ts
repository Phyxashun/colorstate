// src/types/Parser.types.ts


export interface Visitor<T> {
    visitProgram(node: Program): T;
    visitVariableDeclaration(node: any): T; // Replace 'any' with your interface
    visitBinaryExpression(node: any): T;
    visitNumericLiteral(node: any): T;
    visitIdentifier(node: any): T;
    visitSeriesExpression(node: any): T;
    visitCallExpression(node: any): T;
    visitAssignmentExpression(node: any): T;
    visitDimensionLiteral(node: any): T;
    visitUnaryExpression(node: any): T;
    visitGroupExpression(node: any): T;
    visitSequenceExpression(node: any): T;
    visitUnknownNode(node: any): T;
    visitStatement(node: Statement): T;
    visitExpression(node: Expression): T;
    visit(node: any): T;
}

/**
 * Node Types
 */
enum NodeType {
    Program = 'Program',
    Declaration = 'Declaration',
    VariableDeclaration = 'VariableDeclaration',
    Statement = 'Statement',
    SequenceExpression = 'SequenceExpression',
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
    SeriesExpression = 'SeriesExpression',
    AssignmentExpression = 'AssignmentExpression',
}


type VariableDeclarationKind = 'const' | 'let' | 'var';
type DimensionKind = 'deg' | 'grad' | 'rad' | 'turn';
type ColorFunctionKind = 'rgb' | 'rgba' | 'hsl' | 'hsla' |
    'hwb' | 'lab' | 'lch' | 'oklab' | 'oklch' | 'ictcp' |
    'jzazbz' | 'jzczhz' | 'alpha' | 'color';

/**
 * Base interface for all AST nodes
 */
interface BaseNode {
    /** Type of the AST node */
    type: NodeType;
}

/**
 * Program root node - contains all statements
 */
interface Program extends BaseNode {
    type: NodeType.Program;
    body: Statement[];
}

/**
 * Base type for all statements
 */
type Statement = ExpressionStatement | VariableDeclaration;

/**
 * Expression wrapped as a statement
 */
interface ExpressionStatement extends BaseNode {
    type: NodeType.ExpressionStatement;
    expression: Expression;
}

/**
 * Variable declaration node
 * Example: const x = 5;
 */
interface VariableDeclaration extends BaseNode {
    type: NodeType.VariableDeclaration;
    /** The kind of declaration (e.g., const, let, var) */
    kind: VariableDeclarationKind;
    /** The identifier being x */
    identifier: { name: string, type: NodeType };
    /** The expression the variable is initialized to (optional) */
    initializer?: Expression;
}

/**
 * Assignment to an existing variable
 * Example: myVar = 100
 */
interface AssignmentExpression extends BaseNode {
    type: NodeType.AssignmentExpression;
    left: Identifier; // The variable being assigned to
    right: Expression; // The value being assigned
}

/**
 * Base type for all expressions
 */
type Expression =
    | Identifier
    | StringLiteral
    | NumericLiteral
    | HexLiteral
    | PercentLiteral
    | DimensionLiteral
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | GroupExpression
    | SeriesExpression
    | SequenceExpression
    | AssignmentExpression;

/**
 * Identifier node (variable names, function names)
 * Example: red, myVar
 */
interface Identifier extends BaseNode {
    type: NodeType.Identifier;
    name: string;
}

/**
 * String literal node
 * Example: "hello", 'world'
 */
interface StringLiteral extends BaseNode {
    type: NodeType.StringLiteral;
    value: string;
    raw: string;
}

/**
 * Numeric literal node
 * Example: 42, 3.14
 */
interface NumericLiteral extends BaseNode {
    type: NodeType.NumericLiteral;
    value: number;
    raw: string;
}

/**
 * Hexadecimal color literal
 * Example: #ff0000, #abc
 */
interface HexLiteral extends BaseNode {
    type: NodeType.HexLiteral;
    value: string;
    raw: string;
}

/**
 * Percentage literal
 * Example: 50%, 100%
 */
interface PercentLiteral extends BaseNode {
    type: NodeType.PercentLiteral;
    value: number;
    raw: string;
}

interface DimensionLiteral extends BaseNode {
    type: NodeType.DimensionLiteral;
    value: number;
    unit: string;
    raw: string;
}

/**
 * Binary operation (two operands and an operator)
 * Example: 1 + 2, a - b
 */
interface BinaryExpression extends BaseNode {
    type: NodeType.BinaryExpression;
    operator: '+' | '-' | '*' | '/' | '%';
    left: Expression;
    right: Expression;
}

/**
 * Unary operation (one operand and an operator)
 * Example: -5, +10
 */
interface UnaryExpression extends BaseNode {
    type: NodeType.UnaryExpression;
    operator: '+' | '-';
    argument: Expression;
}

/**
 * Function call expression
 * Example: rgb(255, 0, 0)
 */
interface CallExpression extends BaseNode {
    type: NodeType.CallExpression;
    callee: Identifier;
    arguments: Expression[];
}

/**
 * Grouped expression (parentheses)
 * Example: (1 + 2)
 */
interface GroupExpression extends BaseNode {
    type: NodeType.GroupExpression;
    expression: Expression;
}

/**
 * Series of expressions separated by commas
 * Example: a, b, c
 */
interface SeriesExpression extends BaseNode {
    type: NodeType.SeriesExpression;
    expressions: Expression[];
}

/**
 * Sequence of expressions separated by whitespace
 * Example: a; b; c
 */
interface SequenceExpression extends BaseNode {
    type: NodeType.SequenceExpression;
    expressions: Expression[];
}

// EXPORTS
export {
    // Enumeration
    NodeType,

    // Types
    type BaseNode,
    type Statement,
    type Expression,
    type VariableDeclarationKind,
    type DimensionKind,
    type ColorFunctionKind,

    // Interfaces
    type Program,
    type ExpressionStatement,
    type VariableDeclaration,
    type Identifier,
    type StringLiteral,
    type NumericLiteral,
    type HexLiteral,
    type PercentLiteral,
    type DimensionLiteral,
    type BinaryExpression,
    type UnaryExpression,
    type CallExpression,
    type GroupExpression,
    type SeriesExpression,
    type SequenceExpression,
    type AssignmentExpression,
};
