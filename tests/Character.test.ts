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
