// src/types/Parser.types.ts

/**
 * Represents a specific location within the source string, tracked by index,
 * line number, and column number.
 */
type Position = {
    /** The zero-based index of the character in the overall string. */
    index: number;
    /** The one-based line number where the character appears. */
    line: number;
    /** The one-based column number of the character on its line. */
    column: number;
}

/**
 * Source code location metadata
 */
type SourcePosition = {
    /** Starting position */
    start: Position;
    /** Ending position */
    end: Position;
}

/**
 * Node Types
 */
enum NodeType {
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
type BaseNode = {
    /** Type of the AST node */
    type: NodeType;
    /** Source location information */
    position: SourcePosition;
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

interface SeriesExpression extends BaseNode {
    type: NodeType.SeriesExpression;
    expressions: Expression[];
}

// EXPORTS
export {
    // Enumeration
    NodeType,

    // Types
    type Statement,
    type Expression,
    type VariableDeclarationKind,
    type DimensionKind,
    type ColorFunctionKind,

    // Interfaces
    type BaseNode,
    type SourcePosition,
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
    type AssignmentExpression,
};
