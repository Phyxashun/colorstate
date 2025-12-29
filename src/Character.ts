// src/Character.ts

type ClassifyFunction = (char: string) => CharType;
type CharTypeFn = (char: string) => boolean;
type Spec = Map<CharType, CharTypeFn>;

enum CharType {
    Start = 'Start',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Quote = 'Quote',
    Letter = 'Letter',
    Number = 'Number',
    Exponent = 'Exponent',
    Percent = 'Percent',
    Dot = 'Dot',
    LParen = 'LParen',
    RParen = 'RParen',
    Comma = 'Comma',
    Slash = 'Slash',
    Plus = 'Plus',
    Minus = 'Minus',
    Hash = 'Hash',
    Hex = 'Hex',
    Unicode = 'Unicode',
    Operator = 'Operator',
    Other = 'Other',
    EOF = 'EOF'
};

const Operators = new Set([
    '%', '.', ',', '/', '(', ')', '+', '-', '_', '#', '!',
    '\\', '*', '@', '$', '^', '&', '{', '}', '[', ']', '|',
    ':', ';', '<', '>', '?', '~', '`', '"', "'", '='
]);

const CharSpec: Spec = new Map<CharType, CharTypeFn>([
    [CharType.EOF, (char) => char === 'EOF'],
    [CharType.Whitespace, (char) => char === ' ' || char === '\t'],
    [CharType.NewLine, (char) => char === '\n' || char === '\r'],
    [CharType.Hash, (char: string) => char === '#'],
    [CharType.Percent, (char: string) => char === '%'],
    [CharType.Letter, (char) => /\p{L}/u.test(char)],
    [CharType.Number, (char) => /\d/.test(char)],
    [CharType.Operator, (char) => Operators.has(char)],
]);

class Character {
    value: string = '';
    type: CharType = CharType.Start;
    index: number = 0;
    line: number = 1;
    column: number = 1;

    public static classify: ClassifyFunction = (char: string): CharType => {
        if (char) {
            for (const [charType, fn] of CharSpec) {
                if (fn(char)) return charType as CharType;
            }
        }
        return CharType.Other;
    };
} // End class Character

class CharacterStream implements IterableIterator<Character> {
    private input: string = '';
    private index = 0;
    private line = 1;
    private column = 1;
    private eofEmitted = false;

    constructor(input: string) {
        this.input = input.normalize('NFC');
    }

    public next(): IteratorResult<Character> {
        if (this.isEOF()) {
            if (this.eofEmitted) {
                return { done: true, value: undefined as any };
            }
            this.eofEmitted = true;
            return { done: false, value: this.atEOF() };  // ✅ Return EOF with done:false
        }

        const codePoint = this.input.codePointAt(this.index) as number;
        const char = String.fromCodePoint(codePoint);

        const result = {
            value: char,
            type: Character.classify(char),
            index: this.index,
            line: this.line,
            column: this.column
        };

        this.advance(char);
        return { done: false, value: result };
    }

    [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    public advance(char: string): void {
        this.index += char.length;

        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
    }

    public peek(): string | null {
        const cp = this.input.codePointAt(this.index);
        return cp !== undefined ? String.fromCodePoint(cp) : null;
    }

    public isEOF(): boolean {
        return this.index >= this.input.length;
    }

    public atEOF(): Character {
        return {
            value: 'EOF',
            type: CharType.EOF,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }

    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }
} // End class CharacterStream

class CharacterArrayStream implements IterableIterator<Character> {
    private characters: Character[];
    private index = 0;
    private eofEmitted = false;

    constructor(characters: Character[]) {
        this.characters = characters;
    }

    public next(): IteratorResult<Character> {
        if (this.index >= this.characters.length) {
            if (this.eofEmitted) {
                return { done: true, value: undefined as any };
            }
            this.eofEmitted = true;
            // Create EOF character based on last position
            const lastChar = this.characters[this.characters.length - 1];
            return {
                done: false,
                value: {
                    value: 'EOF',
                    type: CharType.EOF,
                    index: lastChar ? lastChar.index + 1 : 0,
                    line: lastChar ? lastChar.line : 1,
                    column: lastChar ? lastChar.column + 1 : 1
                }
            };
        }

        const char = this.characters[this.index];
        this.index++;
        return { done: false, value: char as Character };
    }

    [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }
} // End class CharacterArrayStream

export {
    type ClassifyFunction,
    type CharTypeFn,
    type Spec,
    CharType,
    Operators,
    CharSpec,
    Character,
    CharacterStream,
    CharacterArrayStream,
}