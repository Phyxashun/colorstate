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
