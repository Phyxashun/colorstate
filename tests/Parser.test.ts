import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/Tokenizer';
import { Parser } from '../src/Parser';
import { NodeType } from '../src/AST';

describe('Parser', () => {
    it('parses arithmetic expressions', () => {
        const tokens = new Tokenizer().tokenize('1 + 2 * 3');
        const ast = new Parser(tokens).parse();

        expect(ast.type).toBe(NodeType.Program);
        expect(ast.body[0].expression.type).toBe(NodeType.BinaryExpression);
    });

    it('parses function calls', () => {
        const tokens = new Tokenizer().tokenize('rgb(1, 2, 3)');
        const ast = new Parser(tokens).parse();

        expect(ast.body[0].expression.type).toBe(NodeType.CallExpression);
    });

    it('parses grouped expressions', () => {
        const tokens = new Tokenizer().tokenize('(1 + 2)');
        const ast = new Parser(tokens).parse();

        expect(ast.body[0].expression.type).toBe(NodeType.GroupExpression);
    });

    it('throws on invalid binary expression', () => {
        const tokens = new Tokenizer().tokenize('1 +');
        
        expect(() => new Parser(tokens).parse()).toThrow();
    });
});
