

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

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





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/States.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

import { describe, it, expect } from 'vitest';
import { InitialState, StringState } from '../src/States';
import { CharType } from '../src/Character';

describe('State transitions', () => {
    it('enters string state', () => {
        const t = InitialState.handle({
            value: '"',
            type: CharType.DoubleQuote,
            position: { index: 0, line: 1, column: 1 }
        });

        expect(t.kind).toBe('BeginString');
    });

    it('string escapes next character', () => {
        const t = StringState.handle({
            value: '\\',
            type: CharType.BackSlash,
            position: { index: 0, line: 1, column: 1 }
        });

        expect(t.kind).toBe('EscapeNext');
    });

    
});





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/States.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

import { describe, it, expect } from 'vitest';
import { Context } from '../src/Context';
import { CharType } from '../src/Character';

describe('Context string handling', () => {
    it('opens and closes matching string quotes', () => {
        const ctx = new Context();

        ctx.beginString(CharType.SingleQuote);
        expect(ctx.isInString()).toBe(true);

        ctx.endString();
        expect(ctx.isInString()).toBe(false);
    });

    it('handles escaping correctly', () => {
        const ctx = new Context();
        ctx.setEscaping(true);
        expect(ctx.isEscaping()).toBe(true);

        ctx.setEscaping(false);
        expect(ctx.isEscaping()).toBe(false);
    });

    it('ignores endString when not in string', () => {
        const ctx = new Context();
        expect(() => ctx.endString()).not.toThrow();
    });
});





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
