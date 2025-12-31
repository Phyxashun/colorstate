import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/Tokenizer.ts';
import { Parser } from '../src/Parser.ts';
import { NodeType } from '../src/AST.ts';
import type {
    Program,
    BinaryExpression,
    CallExpression,
    NumericLiteral,
    HexLiteral,
    PercentLiteral,
    Identifier,
    UnaryExpression,
    GroupExpression
} from '../src/AST.ts';

describe('Parser', () => {
    const parseInput = (input: string): Program => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenizeString(input);
        const parser = new Parser(tokens);
        return parser.parse();
    };

    it('should parse number literals', () => {
        const ast = parseInput('42');
        expect(ast.body).toHaveLength(1);
        expect(ast.body[0]!.type).toBe(NodeType.ExpressionStatement);
        const expr = ast.body[0]!.expression as NumericLiteral;
        expect(expr.type).toBe(NodeType.NumericLiteral);
        expect(expr.value).toBe(42);
    });

    it('should parse addition', () => {
        const ast = parseInput('1 + 2');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.type).toBe(NodeType.BinaryExpression);
        expect(expr.operator).toBe('+');
        expect((expr.left as NumericLiteral).value).toBe(1);
        expect((expr.right as NumericLiteral).value).toBe(2);
    });

    it('should parse operator precedence', () => {
        const ast = parseInput('2 + 3 * 4');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('+');
        expect((expr.left as NumericLiteral).value).toBe(2);

        const right = expr.right as BinaryExpression;
        expect(right.operator).toBe('*');
        expect((right.left as NumericLiteral).value).toBe(3);
        expect((right.right as NumericLiteral).value).toBe(4);
    });

    it('should parse function calls', () => {
        const ast = parseInput('rgb(255, 0, 0)');
        const expr = ast.body[0]!.expression as CallExpression;
        expect(expr.type).toBe(NodeType.CallExpression);
        expect(expr.callee.name).toBe('rgb');
        expect(expr.arguments).toHaveLength(3);
        expect((expr.arguments[0] as NumericLiteral).value).toBe(255);
        expect((expr.arguments[1] as NumericLiteral).value).toBe(0);
        expect((expr.arguments[2] as NumericLiteral).value).toBe(0);
    });

    it('should parse hex literals', () => {
        const ast = parseInput('#ff0000');
        const expr = ast.body[0]!.expression as HexLiteral;
        expect(expr.type).toBe(NodeType.HexLiteral);
        expect(expr.value).toBe('#ff0000');
    });

    it('should parse percentage literals', () => {
        const ast = parseInput('50%');
        const expr = ast.body[0]!.expression as PercentLiteral;
        expect(expr.type).toBe(NodeType.PercentLiteral);
        expect(expr.value).toBe(50);
        expect(expr.raw).toBe('50%');
    });

    it('should parse unary operators', () => {
        const ast = parseInput('-5');
        const expr = ast.body[0]!.expression as UnaryExpression;
        expect(expr.type).toBe(NodeType.UnaryExpression);
        expect(expr.operator).toBe('-');
        expect((expr.argument as NumericLiteral).value).toBe(5);
    });

    it('should parse grouped expressions', () => {
        const ast = parseInput('(1 + 2) * 3');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('*');
        expect((expr.left as GroupExpression).type).toBe(NodeType.GroupExpression);

        const grouped = (expr.left as GroupExpression).expression as BinaryExpression;
        expect(grouped.operator).toBe('+');
        expect((grouped.left as NumericLiteral).value).toBe(1);
        expect((grouped.right as NumericLiteral).value).toBe(2);

        expect((expr.right as NumericLiteral).value).toBe(3);
    });
});