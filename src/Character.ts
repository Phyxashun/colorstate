// src/Character.ts

type ClassifyFn = (char: string) => CharType;
type CharTypeFn = (char: string) => boolean;
type Spec = Map<CharType, CharTypeFn>;

enum CharType {
    Start = 'Start',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
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
    Quote = 'Quote',
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
    Symbol = 'Symbol',
    Other = 'Other',
    EOF = 'EOF',
    Error = 'Error',
}

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

class CharUtility {
    public static Letters: Set<string> = new Set([
        // Uppercase
        'A', 'B', 'C', 'D', 'E',
        'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y',
        'Z',

        // Lowercase
        'a', 'b', 'c', 'd', 'e',
        'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y',
        'z',
    ]);

    public static Numbers: Set<string> = new Set([
        '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '0',
    ]);

    public static Symbols: Set<string> = new Set([
    ]);

    public static Whitespace: Set<string> = new Set([
        ' ', '\t',
    ]);

    public static NewLine: Set<string> = new Set([
        '\n', '\r',
    ]);

    public static CharSpec: Spec = new Map<CharType, CharTypeFn>([
        [CharType.EOF,          (char) => char === ''],
        [CharType.Hash,         (char) => char === '#'],
        [CharType.Percent,      (char) => char === '%'],
        [CharType.Slash,        (char) => char === '/'],
        [CharType.Comma,        (char) => char === ','],
        [CharType.LParen,       (char) => char === '('],
        [CharType.RParen,       (char) => char === ')'],
        [CharType.Plus,         (char) => char === '+'],
        [CharType.Minus,        (char) => char === '-'],
        [CharType.Star,         (char) => char === '*'],
        [CharType.Dot,          (char) => char === '.'],
        [CharType.Quote,        (char) => char === '`'],
        [CharType.SingleQuote,  (char) => char === "'"],
        [CharType.DoubleQuote,  (char) => char === '"'],
        [CharType.BackSlash,    (char) => char === '\\'],
        [CharType.Tilde,        (char) => char === '~'],
        [CharType.Exclamation,  (char) => char === '!'],
        [CharType.At,           (char) => char === '@'],
        [CharType.Dollar,       (char) => char === '$'],
        [CharType.Question,     (char) => char === '?'],
        [CharType.Caret,        (char) => char === '^'],
        [CharType.Ampersand,    (char) => char === '&'],
        [CharType.LessThan,     (char) => char === '<'],
        [CharType.GreaterThan,  (char) => char === '>'],
        [CharType.Underscore,   (char) => char === '_'],
        [CharType.EqualSign,    (char) => char === '='],
        [CharType.LBracket,     (char) => char === '['],
        [CharType.RBracket,     (char) => char === ']'],
        [CharType.LBrace,       (char) => char === '{'],
        [CharType.RBrace,       (char) => char === '}'],
        [CharType.SemiColon,    (char) => char === ';'],
        [CharType.Colon,        (char) => char === ':'],
        [CharType.Pipe,         (char) => char === '|'],
        [CharType.Whitespace,   (char) => CharUtility.Whitespace.has(char)],
        [CharType.NewLine,      (char) => CharUtility.NewLine.has(char)],
        [CharType.Letter,       (char) => CharUtility.Letters.has(char)],
        [CharType.Number,       (char) => CharUtility.Numbers.has(char)],
        [CharType.Symbol,       (char) => CharUtility.Symbols.has(char)],
    ]);

    public static classify: ClassifyFn = (char: string): CharType => {
        if (!char) return CharType.Other;

        for (const [charType, fn] of CharUtility.CharSpec) {
            if (fn(char)) return charType as CharType;
        }

        return CharType.Error;
    };
}

class CharacterStream implements IterableIterator<Character> {
    private readonly source: string;
    private value: string = '';
    private index: number = 0;
    private line: number = 1;
    private column: number = 1;

    private get position(): Position {
        return {
            index: this.index,
            line: this.line,
            column: this.column,
        };
    }

    private set position(value: Position) {
        this.index = value.index;
        this.line = value.line;
        this.column = value.column;
    }

    constructor(input: string) {
        this.source = input;
    }

    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    public next(): IteratorResult<Character> {
        if (this.isEOF()) {
            return {
                done: true,
                value: {
                    value: '',
                    type: CharType.EOF,
                    position: { ...this.position }
                }
            };
        }

        this.value = this.source[this.index] as string;
        
        const char: Character = {
            value: this.value,
            type: CharUtility.classify(this.value),
            position: { ...this.position }
        };

        this.advance();
        return { done: false, value: char };
    }

    public advance(): void {
        const newPosition = { ...this.position };

        newPosition.index++;
        if (this.value === '\n') {
            newPosition.line++;
            newPosition.column = 1;
        } else {
            newPosition.column++;
        }

        this.position = { ...newPosition };
    }

    public isEOF(): boolean {
        return this.index >= this.source.length;
    }

    public atEOF(): Character {
        return ({
            value: '',
            type: CharType.EOF,
            position: { ...this.position }
        });
    }

    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            position: { ...this.position }
        };
    }
}

export {
    type Position,
    type Character,
    CharType,
    CharacterStream,
}