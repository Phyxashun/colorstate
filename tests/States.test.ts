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
