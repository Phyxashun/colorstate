// test/Parser.test.ts

import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/Tokenizer.ts';
import { Parser } from '../src/Parser.ts';
import type { Program, BinaryExpression, CallExpression } from '../src/AST.ts';

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
        expect(ast.body[0]!.type).toBe('ExpressionStatement');
        expect(ast.body[0]!.expression.type).toBe('NumericLiteral');
        expect((ast.body[0]!.expression as any).value).toBe(42);
    });

    it('should parse addition', () => {
        const ast = parseInput('1 + 2');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.type).toBe('BinaryExpression');
        expect(expr.operator).toBe('+');
        expect((expr.left as any).value).toBe(1);
        expect((expr.right as any).value).toBe(2);
    });

    it('should parse operator precedence', () => {
        const ast = parseInput('2 + 3 * 4');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('+');
        expect((expr.left as any).value).toBe(2);
        expect((expr.right as BinaryExpression).operator).toBe('*');
    });

    it('should parse function calls', () => {
        const ast = parseInput('rgb(255, 0, 0)');
        const expr = ast.body[0]!.expression as CallExpression;
        expect(expr.type).toBe('CallExpression');
        expect(expr.callee.name).toBe('rgb');
        expect(expr.arguments).toHaveLength(3);
    });

    it('should parse hex literals', () => {
        const ast = parseInput('#ff0000');
        const expr = ast.body[0]!.expression as any;
        expect(expr.type).toBe('HexLiteral');
        expect(expr.value).toBe('#ff0000');
    });

    it('should parse percentage literals', () => {
        const ast = parseInput('50%');
        const expr = ast.body[0]!.expression as any;
        expect(expr.type).toBe('PercentLiteral');
        expect(expr.value).toBe(50);
    });

    it('should parse unary operators', () => {
        const ast = parseInput('-5');
        const expr = ast.body[0]!.expression as any;
        expect(expr.type).toBe('UnaryExpression');
        expect(expr.operator).toBe('-');
    });

    it('should parse grouped expressions', () => {
        const ast = parseInput('(1 + 2) * 3');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('*');
        expect((expr.left as any).type).toBe('GroupExpression');
    });
});
