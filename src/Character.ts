// src/Character.ts

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

enum CharType {
    Unicode = 'Unicode',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Punctuation = 'Punctuation',
    Percent = 'Percent',
    Hash = 'Hash',
    Hex = 'Hex',
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

type CharClassifyFn = (char: string) => boolean;

const CharRegexMap: Partial<Record<CharType, CharClassifyFn>> = {
    // Handle Whitespace and Newlines
    [CharType.NewLine]: (char: string) => /[\n\r]/.test(char),
    [CharType.Whitespace]: (char: string) => /^\s+$/.test(char) && !/[\n\r]/.test(char),

    // Handle Letters and Numbers (Unicode aware)
    [CharType.Letter]: (char: string) => /\p{L}/u.test(char),
    [CharType.Number]: (char: string) => /\p{N}/u.test(char),

    // Handle specific Unicode categories
    [CharType.Punctuation]: (char: string) => /\p{P}/u.test(char),
    [CharType.Currency]: (char: string) => /\p{Sc}/u.test(char),
    [CharType.Symbol]: (char: string) => /\p{S}/u.test(char),
    [CharType.Unicode]: (char: string) => /\P{ASCII}/u.test(char),
};

/**
 * Map of single characters to their specific types.
 * This provides O(1) lookup for common symbols.
 */
const CharSymbolMap: Record<string, CharType> = {
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

class CharUtility {
    /**
     * Classifies a character using a fast switch for single chars
     * and regex for character categories.
     * This method is now stateless and side-effect free.
    */
    public static classify(char: string): CharType {
        // 1. Handle EOF, undefined and null
        if (char === '') return CharUtility.handleEOF();
        if (char === undefined || char === null) return CharUtility.handleError(char);

        // 2. Handle characters in the symbol map
        if (CharSymbolMap[char]) return CharSymbolMap[char];

        // 3. Loop through the regex map for character categories.
        for (const type in CharRegexMap) {
            if (CharRegexMap[type as CharType]!(char)) return type as CharType;
        }

        // 4. Fallback type
        return CharUtility.handleOther(char);
    }

    private static handleOther(char: string): CharType {
        return CharType.Other;
    }

    private static handleError(char: string): CharType {
        return CharType.Error
    }

    private static handleEOF(): CharType {
        return CharType.EOF;
    }
} // End class CharUtility

class CharacterStream implements IterableIterator<Character> {
    // Unicode safe source string for the stream
    private source: string;

    // Current stream cursor/character position information
    private index: number;
    private line: number;
    private column: number;

    // Get the current stream position
    public getPosition(): Position {
        return {
            index: this.index,
            line: this.line,
            column: this.column,
        };
    }

    // Set the current stream position (for back tracking)
    public setPosition(index: number, line: number, column: number): void;
    public setPosition(position: Position): void;
    public setPosition(indexOrPosition: number | Position, line?: number, column?: number): void {
        if (typeof indexOrPosition === 'object') {
            // Handling the Position object case
            this.index = indexOrPosition.index;
            this.line = indexOrPosition.line;
            this.column = indexOrPosition.column;
        } else {
            // Handling the three number arguments case
            this.index = indexOrPosition;
            this.line = line!;
            this.column = column!;
        }
    }

    // Previous character information for backtracking and marking
    // Specific design choice to use a charsBuffer (a buffer of Character 
    // objects) instead of a positionHistory. This provides direct access 
    // to the type and value of historical characters if ever needed.
    public readonly charsBuffer: Character[] = [];
    // Store buffer length, not position of the mark
    private readonly marks: number[] = [];

    constructor(input?: string) {
        this.source = input ? input.normalize('NFC') : ''.normalize('NFC');
        this.index = 0;
        this.line = 1;
        this.column = 1;
    }

    // Get the current source
    public get() {
        return this.source;
    }

    // Create a new stream from a different source;
    public set(input: string) {
        this.source = input.normalize('NFC');
        this.setPosition(0, 1, 1);
        this.charsBuffer.length = 0;
        this.marks.length = 0;
    }

    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    public next(): IteratorResult<Character> {
        if (this.isEOF()) return { done: true, value: null };
        const nextChar = this.peek(0);
        this.advance(nextChar.value);
        this.charsBuffer.push(nextChar);
        return { done: false, value: nextChar };
    }

    /**
     * Peeks at a character 'n' positions ahead without advancing the stream.
     * @param n The number of characters to look ahead (default: 0, the current character).
     * @returns The character at the specified lookahead position.
     */
    public peek(n: number = 0): Character {
        const { index, line, column } = this.peekPosition(n);
        if (this.isEOF(index)) return this.atEOF({ index, line, column });
        const value = String.fromCodePoint(this.source.codePointAt(index)!);
        return {
            value,
            type: CharUtility.classify(value),
            position: {
                index,
                line,
                column
            }
        };
    }

    /**
     * Orchestrate the simulation by calling peekAdvance n times.
     * @param n The number of positions forward to look
     * @returns the position of the cursor n charactes forward
     */
    private peekPosition(n: number): Position {
        if (n < 0) throw new Error("Lookahead distance `n` must be non-negative.");
        if (n === 0) return this.getPosition();

        let pos = this.getPosition();
        for (let i = 0; i < n; i++) {
            if (this.isEOF(pos.index)) return pos;
            pos = this.calculateNextPosition(pos);
        }
        return pos;
    }

    /**
     * Calculate the position of the next character based on a given starting position.
     * @param peekPosition The start position for peeking forward
     * @returns The actual position of the peeked character
     */
    private calculateNextPosition(currentPos: Position): Position {
        const charValue = String.fromCodePoint(this.source.codePointAt(currentPos.index)!);
        const newIndex = currentPos.index + charValue.length;
        if (charValue === '\n') {
            return {
                index: newIndex,
                line: currentPos.line + 1,
                column: 1
            };
        } else {
            return {
                index: newIndex,
                line: currentPos.line,
                column: currentPos.column + [...charValue].length
            };
        }
    }

    /**
     * Looks ahead at a character 'n' positions ahead without advancing the stream.
     * @param n The number of characters to look ahead (default: 0, the current character).
     * @returns The character at the specified lookahead position.
     */
    public lookahead(n: number = 0): string {
        const lookaheadIndex = this.peekPosition(n).index;
        if (this.isEOF(lookaheadIndex)) return '';
        return String.fromCodePoint(this.source.codePointAt(lookaheadIndex)!);
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

    /**
     * Moves the stream's position back by a given number of steps.
     * @param steps The number of characters to rewind (default: 1).
     */
    public back(steps: number = 1): void {
        if (steps <= 0) return;

        // The history includes the current position, so the number of "backable"
        // steps is the history length minus one.
        if (steps >= this.charsBuffer.length) {
            throw new Error(
                `Cannot go back ${steps} steps. History only contains ${this.charsBuffer.length - 1} previous positions.`
            );
        }

        // Pop the requested number of states.
        for (let i = 0; i < steps; i++) this.charsBuffer.pop();

        // The new current position is the one now at the end of the stack.
        const newPosition = this.charsBuffer[this.charsBuffer.length - 1]!.position;
        this.setPosition(newPosition);
    }

    /**
     * Saves the current stream position to a stack.
     * This is useful for speculative parsing, allowing you to "try" a path
     * and then either reset() on failure or commit() on success.
     */
    public mark(): void {
        // Mark the current length of the buffer.
        this.marks.push(this.charsBuffer.length);
    }

    /**
     * Restores the stream to the last saved position from the mark() stack.
     * If no mark is present, it throws an error.
     * This consumes the mark.
     */
    public reset(): void {
        if (this.marks.length === 0) throw new Error("Cannot reset. No mark has been set.");
        const markedLength = this.marks.pop()!;

        // Find the character right before this marked point to get the position.
        const lastCharPos = this.charsBuffer[markedLength - 1]?.position;

        // The position to reset to is after the last valid character.
        const resetPosition = lastCharPos
            ? this.calculateNextPosition(lastCharPos)
            : { index: 0, line: 1, column: 1 }; // Or reset to the beginning.

        // Truncate the buffer *and* reset the position.
        this.charsBuffer.length = markedLength;
        this.setPosition(resetPosition);
    }


    /**
     * Removes the last saved mark from the stack without changing the stream's position.
     * This should be called after a speculative parse succeeds.
     */
    public commit(): void {
        if (this.marks.length === 0) {
            throw new Error("Cannot commit. No mark has been set.");
        }
        this.marks.pop();
    }

    /**
     * Consumes characters from the stream as long as the predicate is true.
     * @param predicate A function that takes a Character and returns a boolean.
     * @returns An array of the consumed characters.
     */
    public consumeWhile(predicate: (char: Character) => boolean): Character[] {
        const consumed: Character[] = [];
        while (!this.isEOF() && predicate(this.peek())) {
            // Must call next() to consume and advance
            const result = this.next();
            if (!result.done) {
                consumed.push(result.value);
            }
        }
        return consumed;
    }

    public isEOF(index = this.index): boolean {
        return index >= this.source.length;
    }

    public atEOF(pos: Position = this.getPosition()): Character {
        return ({
            value: '',
            type: CharType.EOF,
            position: pos,
        });
    }

    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            position: this.getPosition(),
        };
    }
} // End class CharacterStream

export {
    CharType,
    type Position,
    type Character,
    CharUtility,
    CharacterStream,
}
