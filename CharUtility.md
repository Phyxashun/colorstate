To streamline your `CharUtility`, you can remove the large manual `Set` objects and replace the `Map` iteration with a **direct lookup table** for symbols and **Unicode regex** for categories like letters and numbers.

This approach is significantly faster and easier to maintain because it avoids looping through a list of functions for every single character in your source code.

### Refactored `src/Character.ts`

```typescript
// src/Character.ts

// ... keep CharType enum and interfaces as they are ...

export class CharUtility {
    /**
     * Map of single characters to their specific types.
     * This provides O(1) lookup for common symbols.
     */
    private static readonly SYMBOL_MAP: Record<string, CharType> = {
        '#': CharType.Hash,
        '%': CharType.Percent,
        '/': CharType.Slash,
        ',': CharType.Comma,
        '(': CharType.LParen,
        ')': CharType.RParen,
        '+': CharType.Plus,
        '-': CharType.Minus,
        '*': CharType.Star,
        '.': CharType.Dot,
        '`': CharType.Backtick,
        "'": CharType.SingleQuote,
        '"': CharType.DoubleQuote,
        '\\': CharType.BackSlash,
        '~': CharType.Tilde,
        '!': CharType.Exclamation,
        '@': CharType.At,
        '$': CharType.Dollar,
        '?': CharType.Question,
        '^': CharType.Caret,
        '&': CharType.Ampersand,
        '<': CharType.LessThan,
        '>': CharType.GreaterThan,
        '_': CharType.Underscore,
        '=': CharType.EqualSign,
        '[': CharType.LBracket,
        ']': CharType.RBracket,
        '{': CharType.LBrace,
        '}': CharType.RBrace,
        ';': CharType.SemiColon,
        ':': CharType.Colon,
        '|': CharType.Pipe,
    };

    /**
     * Classifies a character using the symbol map and regex for categories.
     */
    public static classify(char: string): CharType {
        if (char === '') return CharType.EOF;

        // 1. Check the fast-lookup symbol map
        if (this.SYMBOL_MAP[char]) {
            return this.SYMBOL_MAP[char];
        }

        // 2. Handle Whitespace and Newlines
        if (char === '\n' || char === '\r') return CharType.NewLine;
        if (/\s/u.test(char)) return CharType.Whitespace;

        // 3. Handle Letters and Numbers (Unicode aware)
        if (/\p{L}/u.test(char)) return CharType.Letter;
        if (/\p{N}/u.test(char)) return CharType.Number;

        // 4. Handle non-ASCII Unicode characters
        if (/[^\x00-\x7F]/.test(char)) return CharType.Unicode;

        return CharType.Other;
    }
}

```

### What has changed:

1. **Removed 100+ lines of Sets**: You no longer need `Letters`, `Numbers`, `Whitespace`, or `NewLine` sets. Modern JS regex handles these more accurately (e.g., `\p{L}` handles accented characters and non-Latin scripts).
2. **O(1) Symbol Lookup**: Instead of iterating through a `Map` of functions (`CharSpec`) for every character, we now do a single property check on `SYMBOL_MAP`. This is much more performant for long files.
3. **Simplified Logic**: The `classify` method is now a flat sequence of "If-Else" checks rather than a loop. This makes it significantly easier to debug and follow.
4. **Consolidated Character Specification**: You no longer need the `CharTypeFn` or `Spec` types, reducing the overall complexity of your codebase.