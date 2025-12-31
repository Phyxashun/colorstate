// tests/Context.test.ts

import { describe, it, expect } from 'vitest';
import { Context } from '../src/Context';
import { CharType, type Character } from '../src/Character';
import { Initial_State } from '../src/States';

function ch(
    value: string,
    type: CharType,
    index = 0,
    line = 1,
    column = 1
): Character {
    return { value, type, index, line, column };
}

describe('Context – processCharacters()', () => {
    it('emits letters individually', () => {
        const ctx = new Context(Initial_State.instance);

        const a = ctx.processCharacters(ch('a', CharType.Letter));
        const b = ctx.processCharacters(ch('b', CharType.Letter));

        expect(a?.value).toBe('a');
        expect(b?.value).toBe('b');
    });

    it('emits numbers individually', () => {
        const ctx = new Context(Initial_State.instance);

        const n = ctx.processCharacters(ch('5', CharType.Number));

        expect(n?.value).toBe('5');
    });

    it('does not emit on EOF', () => {
        const ctx = new Context(Initial_State.instance);

        const r = ctx.processCharacters(
            ch('', CharType.EOF)
        );

        expect(r).toBeNull();
    });
});

describe('Context – processTokens()', () => {
    it('emits a letter token on state change', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('a', CharType.Letter, 0, 1, 1));
        const token = ctx.processTokens(ch(' ', CharType.Whitespace, 1, 1, 2));

        expect(token).not.toBeNull();
        expect(token!.value).toBe('a');
        expect(token!.type).toBe(CharType.Letter);
    });

    it('accumulates multi-digit numbers', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('1', CharType.Number));
        ctx.processTokens(ch('2', CharType.Number));
        const token = ctx.processTokens(ch(' ', CharType.Whitespace));

        expect(token!.value).toBe('12');
        expect(token!.type).toBe(CharType.Number);
    });

    it('emits buffered token on EOF', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('9', CharType.Number));
        const token = ctx.processTokens(ch('', CharType.EOF));

        expect(token).not.toBeNull();
        expect(token!.value).toBe('9');
    });

    it('handles percent numbers correctly', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('1', CharType.Number));
        ctx.processTokens(ch('0', CharType.Number));
        const token = ctx.processTokens(ch('%', CharType.Percent));

        expect(token).not.toBeNull();
        expect(token!.value).toBe('10');
    });
});
