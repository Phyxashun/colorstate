import { inspect, type InspectOptions } from 'node:util';
import { NodeType } from './types/Parser.types.ts';

import type {
    BaseNode, Statement, Expression, VariableDeclarationKind, Program,
    ExpressionStatement, VariableDeclaration, Identifier,
    StringLiteral, NumericLiteral, HexLiteral, PercentLiteral,
    DimensionLiteral, BinaryExpression, UnaryExpression,
    CallExpression, GroupExpression, SeriesExpression,
    AssignmentExpression, DimensionKind, ColorFunctionKind,
    SequenceExpression, SourcePosition
} from './types/Parser.types.ts';

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

export abstract class BaseVisitor {
    public visit(node: any): any {
        return this.visitAnyNode(node);
    }

    protected visitProgram(node: Program) {
        return node.body.map(stmt => this.visit(stmt));
    }

    protected visitUnknownNode(node: any) {
        throw new Error(`No visitor for node type: ${node.type}`);
    }

    // Define default implementations for all node types...
    protected abstract visitAnyNode(node: any): any;
}

export class VisitorGenerator extends BaseVisitor {
    public generate(node: Program): string {
        // We visit the program, which returns an array of objects, 
        // then inspect that entire structure.
        return inspect(this.visitAnyNode(node), inspectOptions);
    }

    protected visitVariableDeclaration(node: VariableDeclaration) {
        return {
            type: node.type,
            kind: node.kind,
            identifier: node.identifier,
            initializer: node.initializer ? this.visit(node.initializer) : null
        };
    }

    protected visitBinaryExpression(node: BinaryExpression) {
        return {
            type: node.type,
            operator: node.operator,
            left: this.visit(node.left),
            right: this.visit(node.right)
        };
    }

    protected visitSeriesExpression(node: SeriesExpression) {
        return {
            type: node.type,
            expressions: node.expressions.map(expr => this.visit(expr))
        };
    }

    protected visitStringLiteral(node: StringLiteral) {
        return { type: node.type, value: node.value, raw: node.raw };
    }

    protected visitNumericLiteral(node: NumericLiteral) {
        return { type: node.type, value: node.value, raw: node.raw };
    }

    protected visitDimensionLiteral(node: DimensionLiteral) {
        return { type: node.type, value: node.value, unit: node.unit, raw: node.raw };
    }

    protected visitHexLiteral(node: HexLiteral) {
        return { type: node.type, value: node.value, raw: node.raw };
    }

    protected visitPercentLiteral(node: PercentLiteral) {
        return { type: node.type, value: node.value, raw: node.raw };
    }

    protected visitIdentifier(node: Identifier) {
        return { type: node.type, name: node.name };
    }

    protected visitCallExpression(node: CallExpression) {
        return {
            type: node.type,
            callee: this.visit(node.callee),
            arguments: node.arguments.map(arg => this.visit(arg))
        };
    }

    protected visitAssignmentExpression(node: AssignmentExpression) {
        return {
            type: node.type,
            left: this.visit(node.left),
            right: this.visit(node.right)
        };
    }

    protected visitUnaryExpression(node: UnaryExpression) {
        return {
            type: node.type,
            operator: node.operator,
            argument: this.visit(node.argument)
        };
    }

    protected visitGroupExpression(node: GroupExpression) {
        return {
            type: node.type,
            expression: this.visit(node.expression)
        };
    }

    protected visitSequenceExpression(node: SequenceExpression) {
        return {
            type: node.type,
            expressions: node.expressions.map(expr => this.visit(expr))
        };
    }

    protected visitStatement(node: Statement) {
        return this.visit(node);
    }

    protected visitExpression(node: Expression) {
        return this.visit(node);
    }

    protected visitAnyNode(node: any) {
        const result: any = { ...node }; // Copy all properties (value, raw, unit, etc.)

        // Recursively visit any property that looks like a node or an array of nodes
        for (const key in result) {
            if (result[key] && typeof result[key] === 'object') {
                if (Array.isArray(result[key])) {
                    result[key] = result[key].map((item: any) =>
                        item.type ? this.visit(item) : item
                    );
                } else if (result[key].type) {
                    result[key] = this.visit(result[key]);
                }
            }
        }
        return result;
    }
}

export class BinaryExpressionNode implements BinaryExpression {
    public type: NodeType.BinaryExpression = NodeType.BinaryExpression;

    constructor(
        public operator: '+' | '-' | '*' | '/' | '%',
        public left: Expression,
        public right: Expression,
        public position: SourcePosition
    ) { }

    // The [inspect.custom] method controls how this object prints
    [inspect.custom](depth: number, options: any, inspectFn: typeof inspect) {
        if (depth < 0) return options.stylize('[BinaryExpression]', 'special');

        const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };

        // Return a formatted string or a "proxy" object to be inspected
        return `${options.stylize('BinaryExpression', 'special')} {
    operator: ${options.stylize(`'${this.operator}'`, 'string')},
    left: ${inspectFn(this.left, newOptions)},
    right: ${inspectFn(this.right, newOptions)}
}`;
    }
}