import { CharType } from './CharType';
import { CharSpec } from './CharSpec.ts';

export type CharClassifyFn = (char: string) => CharType;

/**
 * Classifies a character using a multi-step, stateless process.
 * The algorithm is:
 * 1. Handle stream control cases (EOF, null).
 * 2. Attempt a fast O(1) lookup in `CHARSYMBOL_MAP`.
 * 3. If not found, iterate through the ordered `CHARREGEX_MAP`.
 * 4. If no rule matches, return a fallback `CharType`.
 * @param char The character string to classify.
 * @returns The classified `CharType` of the character.
 */
export const CharClassify: CharClassifyFn = (char: string): CharType => {
    if (char === undefined || char === null) return CharType.Error;

    // Loop through the ordered classification rules (fallback).
    for (const [type, predicate] of CharSpec) {
        if (predicate(char)) return type;
    }

    // Fallback type
    return CharType.Other;
};
