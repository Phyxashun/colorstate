// src/Character.ts

type ClassifyFn = (char: string) => CharType;

enum CharType {
    Unicode = 'Unicode',
    Start = 'Start',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Punctuation = 'Punctuation',
    SymbolMark = 'SymbolMark',
    Dimension = 'Dimension',
    Percent = 'Percent',
    Hash = 'Hash',
    Slash = 'Slash',
    BackSlash = 'BackSlash',
    Comma = 'Comma',
    RParen = 'RParen',
    LParen = 'LParen',
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Dot = 'Dot',
    Backtick = 'Backtick',
    SingleQuote = 'SingleQuote',
    DoubleQuote = 'DoubleQuote',
    Tilde = 'Tilde',
    Exclamation = 'Exclamation',
    At = 'At',
    Dollar = 'Dollar',
    Question = 'Question',
    Caret = 'Caret',
    Ampersand = 'Ampersand',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',
    Underscore = 'Underscore',
    EqualSign = 'EqualSign',
    LBracket = 'LBracket',
    RBracket = 'RBracket',
    LBrace = 'LBrace',
    RBrace = 'RBrace',
    SemiColon = 'SemiColon',
    Colon = 'Colon',
    Pipe = 'Pipe',
    Currency = 'Currency',
    Symbol = 'Symbol',
    Other = 'Other',
    EOF = 'EOF',
    Error = 'Error',
} // End enum CharType

class CharUtility {
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

    // Pre-compiled regex for performance and clarity
    private static readonly IS_NEWLINE = /[\n\r]/;
    private static readonly IS_WHITESPACE = /\s/u;
    private static readonly IS_LETTER = /\p{L}/u;
    private static readonly IS_NUMBER = /\p{N}/u;
    private static readonly IS_PUNCTUATION = /\p{P}/u;
    private static readonly IS_SYMBOL = /\p{S}/u;

    /**
     * Classifies a character using the symbol map and regex for categories.
     */
    public static classify: ClassifyFn = (char: string): CharType => {
        // 1. Handle End-Of-File character
        if (char === '') return CharType.EOF;

        // 2. Handle characters in the symbol map
        if (this.SYMBOL_MAP[char]) return this.SYMBOL_MAP[char];

        // 3. Handle Whitespace and Newlines
        if (this.IS_NEWLINE.test(char)) return CharType.NewLine;
        if (this.IS_WHITESPACE.test(char)) return CharType.Whitespace;

        // 4. Handle Letters and Numbers (Unicode aware)
        if (this.IS_LETTER.test(char)) return CharType.Letter;
        if (this.IS_NUMBER.test(char)) return CharType.Number;

        // 5. Handle specific Unicode categories
        if (this.IS_PUNCTUATION.test(char)) return CharType.Punctuation;
        if (this.IS_SYMBOL.test(char)) return CharType.SymbolMark;

        // 6. All remaining characters fall here
        return CharType.Other;
    }
} // End class CharUtility

interface Position {
    index: number;
    line: number;
    column: number;
}

interface Character {
    value: string;
    type: CharType;
    position: Position;
}

class CharacterStream implements IterableIterator<Character> {
    private readonly source: string;
    private index: number = 0;
    private line: number = 1;
    private column: number = 1;

    public chars: Character[] = [];

    constructor(input: string) {
        this.source = input.normalize('NFC');
    }

    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    public peek(): Character {
        if (this.isEOF()) return this.atEOF();

        const value = String.fromCodePoint(this.source.codePointAt(this.index)!);

        const nextChar: Character = {
            value,
            type: CharUtility.classify(value),
            position: {
                index: this.index,
                line: this.line,
                column: this.column
            }
        };

        return nextChar;
    }

    public next(): IteratorResult<Character> {
        if (this.isEOF()) {
            return {
                done: true,
                value: {
                    value: '',
                    type: CharType.EOF,
                    position: {
                        index: this.index,
                        line: this.line,
                        column: this.column
                    }
                }
            };
        }

        const nextChar = this.peek();
        this.advance(nextChar.value);
        this.chars.push(nextChar);
        return { done: false, value: nextChar };
    }

    public advance(charValue: string): void {
        this.index += charValue.length;
        if (charValue === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column += [...charValue].length;
        }
    }

    public isEOF(): boolean {
        return this.index >= this.source.length;
    }

    public atEOF(): Character {
        return ({
            value: '',
            type: CharType.EOF,
            position: {
                index: this.index,
                line: this.line,
                column: this.column
            }
        });
    }

    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            position: {
                index: this.index,
                line: this.line,
                column: this.column
            }
        };
    }
} // End class CharacterStream

export {
    CharType,
    type Position,
    type Character,
    CharacterStream,
}