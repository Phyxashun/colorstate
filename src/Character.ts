// src/Character.ts

/**
 * Function type for classifying a character into a CharType
 * @param char - The character string to classify
 * @returns The CharType classification
 */
type ClassifyFunction = (char: string) => CharType;

/**
 * Function type for testing if a character matches a specific type
 * @param char - The character string to test
 * @returns True if the character matches the type
 */
type CharTypeFn = (char: string) => boolean;

/**
 * Map specification for character type testing functions
 */
type Spec = Map<CharType, CharTypeFn>;

/**
 * Enumeration of all possible character types recognized by the tokenizer
 */
enum CharType {
    /** Initial state, not yet classified */
    Start = 'Start',
    /** Space or tab character */
    Whitespace = 'Whitespace',
    /** Newline or carriage return */
    NewLine = 'NewLine',
    /** Single or double quote */
    Quote = 'Quote',
    /** Unicode letter character */
    Letter = 'Letter',
    /** Numeric digit 0-9 */
    Number = 'Number',
    /** Scientific notation exponent (e/E) */
    Exponent = 'Exponent',
    /** Percent symbol */
    Percent = 'Percent',
    /** Decimal point */
    Dot = 'Dot',
    /** Left parenthesis */
    LParen = 'LParen',
    /** Right parenthesis */
    RParen = 'RParen',
    /** Comma */
    Comma = 'Comma',
    /** Forward slash */
    Slash = 'Slash',
    /** Plus sign */
    Plus = 'Plus',
    /** Minus/hyphen sign */
    Minus = 'Minus',
    /** Hash/pound symbol */
    Hash = 'Hash',
    /** Hexadecimal digit */
    Hex = 'Hex',
    /** Unicode character */
    Unicode = 'Unicode',
    /** Generic operator character */
    Operator = 'Operator',
    /** Unrecognized character type */
    Other = 'Other',
    /** End of file marker */
    EOF = 'EOF'
}

abstract class ICharacter {
    /** The actual character value as a string */
    public value: string = '';
    /** The classified type of this character */
    public type: CharType = CharType.Start;
    /** Byte index in the source input */
    public index: number = 0;
    /** Line number (1-indexed) */
    public line: number = 1;
    /** Column number (1-indexed) */
    public column: number = 1;
}

/**
 * Represents a single character with position metadata
 * Used for tracking characters through the tokenization process
 */
class Character extends ICharacter {
    /**
     * Static method to classify a character string into a CharType
     * Iterates through CharSpec map and returns first matching type
     * @param char - The character string to classify
     * @returns The CharType classification, or CharType.Other if no match
     */
    public static classify: ClassifyFunction = (char: string): CharType => {
        if (char) {
            for (const [charType, fn] of Character.CharSpec) {
                if (fn(char)) return charType as CharType;
            }
        }
        return CharType.Other;
    };

    /**
    * Set of characters classified as operators
    */
    public static Operators: Set<string> = new Set([
        '%', '.', ',', '/', '(', ')', '+', '-', '_', '#', '!',
        '\\', '*', '@', '$', '^', '&', '{', '}', '[', ']', '|',
        ':', ';', '<', '>', '?', '~', '`', '"', "'", '='
    ]);

    /**
     * Specification map for character type testing functions
     * Tests are performed in order, first match wins
     */
    public static CharSpec: Spec = new Map<CharType, CharTypeFn>([
        [CharType.EOF, (char) => char === 'EOF'],
        [CharType.Whitespace, (char) => char === ' ' || char === '\t'],
        [CharType.NewLine, (char) => char === '\n' || char === '\r'],
        [CharType.Hash, (char: string) => char === '#'],
        [CharType.Percent, (char: string) => char === '%'],
        [CharType.Letter, (char) => /\p{L}/u.test(char)],
        [CharType.Number, (char) => /\d/.test(char)],
        [CharType.Operator, (char) => Character.Operators.has(char)],
    ]);
}

/**
 * Streaming iterator for processing string input character by character
 * Handles Unicode normalization, position tracking, and EOF emission
 */
class CharacterStream extends Character implements IterableIterator<ICharacter> {
    /** Flag to track if EOF has been emitted */
    private eofEmitted = false;

    /**
     * Creates a new CharacterStream from a string input
     * Input is normalized using NFC (Canonical Decomposition followed by Canonical Composition)
     * @param input - The string to tokenize
     */
    constructor(input: string) {
        super();
        this.value = input.normalize('NFC');
    }

    /**
     * Iterator protocol implementation
     * Returns the next character in the stream with position metadata
     * @returns IteratorResult containing a Character or done flag
     */
    public next(): IteratorResult<ICharacter> {
        if (this.isEOF()) {
            if (this.eofEmitted) {
                return { done: true, value: undefined as any };
            }
            this.eofEmitted = true;
            return { done: false, value: this.atEOF() };
        }

        const codePoint = this.value.codePointAt(this.index) as number;
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

    /**
     * Makes this class iterable using for...of loops
     * @returns This stream instance as an iterator
     */
    public [Symbol.iterator](): IterableIterator<ICharacter> {
        return this;
    }

    /**
     * Advances the stream position after consuming a character
     * Updates line and column counters appropriately
     * @param char - The character that was consumed
     */
    public advance(char: string): void {
        this.index += char.length;

        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
    }

    /**
     * Peeks ahead in the stream without consuming characters
     * @param offset - Number of characters to look ahead (default: 0)
     * @returns The character at the peek position, or null if past EOF
     */
    public peek(offset: number = 0): string | null {
        const cp = this.value.codePointAt(this.index + offset);
        return cp !== undefined ? String.fromCodePoint(cp) : null;
    }

    /**
     * Checks if the stream has reached end of input
     * @returns True if at or past the end of input
     */
    public isEOF(): boolean {
        return this.index >= this.value.length;
    }

    /**
     * Creates an EOF character marker with current position
     * @returns A Character object representing EOF
     */
    public atEOF(): ICharacter {
        return {
            value: 'EOF',
            type: CharType.EOF,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }

    /**
     * Creates an error character marker
     * @returns A Character object representing an error
     */
    public atError(): ICharacter {
        return {
            value: 'Error',
            type: CharType.Other,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }
}

/**
 * Streaming iterator for processing an array of Characters
 * Useful for re-tokenizing or processing already-parsed character streams
 * Implements full Iterator protocol with helper methods
 */
class CharacterArrayStream implements IterableIterator<ICharacter> {
    /** The array of characters to iterate over */
    private characters: ICharacter[];
    /** Current index in the array */
    private index = 0;
    /** Flag to track if EOF has been emitted */
    private eofEmitted = false;

    /**
     * Creates a new CharacterArrayStream from an array of Characters
     * @param characters - The character array to iterate over
     */
    constructor(characters: ICharacter[]) {
        this.characters = characters;
    }

    /**
     * Iterator protocol implementation
     * Returns the next character from the array
     * @returns IteratorResult containing a Character or done flag
     */
    public next(): IteratorResult<ICharacter> {
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
        return { done: false, value: char as ICharacter };
    }

    /**
     * Makes this class iterable using for...of loops
     * @returns This stream instance as an iterator
     */
    [Symbol.iterator](): IterableIterator<ICharacter> {
        return this;
    }

    /**
     * Creates a new iterator that drops the first count elements
     * @param count - Number of elements to drop
     * @returns New iterator starting after the dropped elements
     */
    public drop(count: number): IterableIterator<ICharacter> {
        const newStream = new CharacterArrayStream(this.characters);
        newStream.skip(count);
        return newStream;
    }

    /**
     * Creates a new iterator that takes at most limit elements
     * @param limit - Maximum number of elements to take
     * @returns New iterator with limited elements
     */
    public take(limit: number): IterableIterator<ICharacter> {
        const limitedChars = this.characters.slice(0, limit);
        return new CharacterArrayStream(limitedChars);
    }

    /**
     * Returns the underlying array of characters
     * @returns Array of characters
     */
    public toArray(): ICharacter[] {
        return [...this.characters];
    }

    /**
     * Gets the current position in the stream
     * @returns Current index
     */
    public getPosition(): number {
        return this.index;
    }

    /**
     * Gets the total length of the character array
     * @returns Length of the array
     */
    public getLength(): number {
        return this.characters.length;
    }

    /**
     * Checks if the stream has more characters to read
     * @returns True if more characters are available
     */
    public hasNext(): boolean {
        return this.index < this.characters.length;
    }

    /**
     * Resets the stream to the beginning
     */
    public reset(): void {
        this.index = 0;
        this.eofEmitted = false;
    }

    /**
     * Peeks at the next character without consuming it
     * @param offset - Number of positions to look ahead (default: 0)
     * @returns The character at the peek position, or null if out of bounds
     */
    public peek(offset: number = 0): ICharacter | null {
        const peekIndex = this.index + offset;
        if (peekIndex >= 0 && peekIndex < this.characters.length) {
            return this.characters[peekIndex] as ICharacter;
        }
        return null;
    }

    /**
     * Skips the specified number of characters
     * @param count - Number of characters to skip
     */
    public skip(count: number): void {
        this.index = Math.min(this.index + count, this.characters.length);
    }

    /**
     * Gets a slice of characters from the stream
     * @param start - Starting index (default: current position)
     * @param end - Ending index (default: end of array)
     * @returns Array of characters in the specified range
     */
    public slice(start?: number, end?: number): ICharacter[] {
        const startIndex = start ?? this.index;
        return this.characters.slice(startIndex, end);
    }

    /**
     * Filters characters based on a predicate function
     * @param predicate - Function to test each character
     * @returns New stream with filtered characters
     */
    public filter(predicate: (char: ICharacter) => boolean): CharacterArrayStream {
        const filtered = this.characters.filter(predicate);
        return new CharacterArrayStream(filtered);
    }

    /**
     * Maps characters using a transformation function
     * @param mapper - Function to transform each character
     * @returns New stream with transformed characters
     */
    public map(mapper: (char: ICharacter) => ICharacter): CharacterArrayStream {
        const mapped = this.characters.map(mapper);
        return new CharacterArrayStream(mapped);
    }

    /**
     * Returns the character at the specified index without affecting iteration
     * @param index - Index of the character to get
     * @returns The character at the index, or null if out of bounds
     */
    public at(index: number): ICharacter | null {
        if (index >= 0 && index < this.characters.length) {
            return this.characters[index] as ICharacter;
        }
        return null;
    }
}

export {
    type ClassifyFunction,
    type CharTypeFn,
    type Spec,
    CharType,
    Character,
    CharacterStream,
    CharacterArrayStream,
}