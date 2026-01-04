// @ts-nocheck


// ==================== Start of file: tests/Character.test.ts ====================

import { describe, it, expect } from 'vitest';
import { CharacterStream, CharType } from '../src/Character';

describe('CharacterStream', () => {
    it('iterates characters with positions', () => {
        const stream = new CharacterStream('a\nb');
        const chars = [...stream];

        expect(chars[0].value).toBe('a');
        expect(chars[0].position.line).toBe(1);

        expect(chars[1].value).toBe('\n');
        expect(chars[1].position.line).toBe(1);

        expect(chars[2].value).toBe('b');
        expect(chars[2].position.line).toBe(2);
    });

    it('produces EOF correctly', () => {
        const stream = new CharacterStream('');
        const next = stream.next();

        expect(next.done).toBe(true);
        expect(next.value.type).toBe(CharType.EOF);
    });
});

// ==================== End of file: tests/Character.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Context.test.ts ====================

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
});

// ==================== End of file: tests/Context.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/index.test.ts ====================

// tests/index.test.ts

import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';

describe('End-to-End Tokenization Tests from index.ts', () => {
    it('Test 1: should correctly tokenize a mixed string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('67 a b c 1 word 2 3+2-0');

        expect(tokens).toEqual([
            { value: '67', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'a', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'b', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'c', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '1', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'word', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '2', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '3', type: TokenType.NUMBER },
            { value: '+', type: TokenType.PLUS },
            { value: '2', type: TokenType.NUMBER },
            { value: '-', type: TokenType.MINUS },
            { value: '0', type: TokenType.NUMBER },
        ]);
    });

    it('Test 5: should tokenize a CSS rgba color string with spaces', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('rgba(100 128 255 / 0.5)');
        expect(tokens).toEqual([
            { value: 'rgba', type: TokenType.IDENTIFIER },
            { value: '(', type: TokenType.LPAREN },
            { value: '100', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '128', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '255', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '/', type: TokenType.SLASH },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '0', type: TokenType.NUMBER },
            { value: '.', type: TokenType.SYMBOL },
            { value: '5', type: TokenType.NUMBER },
            { value: ')', type: TokenType.RPAREN },
        ]);
    });

    it('Test 6: should tokenize a CSS rgba color string with percentages', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('rgba(100% 360 220  / 50%)');
        expect(tokens).toEqual([
            { value: 'rgba', type: TokenType.IDENTIFIER },
            { value: '(', type: TokenType.LPAREN },
            { value: '100%', type: TokenType.PERCENT },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '360', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '220', type: TokenType.NUMBER },
            { value: '  ', type: TokenType.WHITESPACE },
            { value: '/', type: TokenType.SLASH },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '50%', type: TokenType.PERCENT },
            { value: ')', type: TokenType.RPAREN },
        ]);
    });

    it('Test 7: should tokenize a hex color string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('#ff00ff00');
        expect(tokens).toEqual([
            { value: '#ff00ff00', type: TokenType.HEXVALUE },
        ]);
    });
});

// ==================== End of file: tests/index.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Parser.test.ts ====================

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
});

// ==================== End of file: tests/Parser.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/States.test.ts ====================

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

// ==================== End of file: tests/States.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Tokenizer.test.ts ====================

import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';

describe('Tokenizer', () => {
    it('tokenizes identifiers and numbers', () => {
        const tokens = new Tokenizer().tokenize('foo 123');
        expect(tokens.map(t => t.type)).toContain(TokenType.IDENTIFIER);
        expect(tokens.map(t => t.type)).toContain(TokenType.NUMBER);
    });

    it('tokenizes strings', () => {
        const tokens = new Tokenizer().tokenize("'abc'");
        const str = tokens.find(t => t.type === TokenType.STRING);
        expect(str?.value).toBe('abc');
    });

    it('tokenizes hex colors', () => {
        const tokens = new Tokenizer().tokenize('#ff00ff');
        expect(tokens[0].type).toBe(TokenType.HEXVALUE);
    });

    it('tokenizes percentages and dimensions', () => {
        const tokens = new Tokenizer().tokenize('50% 90deg');
        expect(tokens.some(t => t.type === TokenType.PERCENT)).toBe(true);
        expect(tokens.some(t => t.type === TokenType.DIMENSION)).toBe(true);
    });
});

// ==================== End of file: tests/Tokenizer.test.ts ====================





