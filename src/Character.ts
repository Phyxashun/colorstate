// src/Character.ts

export interface Position {
    index: number;
    line: number;
    column: number;
}

export interface Character {
    value: string;
    type: Char.Type;
    position: Position;
}

namespace Char {
    export enum Type {
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
    } // End enum Type

    export class Utility {
        private static readonly RegexMap: Partial<Record<Type, ((char: string) => boolean)>> = {
            // Handle Whitespace and Newlines
            [Type.NewLine]: (char: string) => /[\n\r]/.test(char),
            [Type.Whitespace]: (char: string) => /^\s+$/.test(char) && !/[\n\r]/.test(char),

            // Handle Letters and Numbers (Unicode aware)
            [Type.Letter]: (char: string) => /\p{L}/u.test(char),
            [Type.Number]: (char: string) => /\p{N}/u.test(char),

            // Handle specific Unicode categories
            [Type.Punctuation]: (char: string) => /\p{P}/u.test(char),
            [Type.Currency]: (char: string) => /\p{Sc}/u.test(char),
            [Type.Symbol]: (char: string) => /\p{S}/u.test(char),
            [Type.Unicode]: (char: string) => /\P{ASCII}/u.test(char),
        };

        /**
         * Map of single characters to their specific types.
         * This provides O(1) lookup for common symbols.
         */
        private static readonly SymbolMap: Record<string, Type> = {
            '#': Type.Hash,
            '%': Type.Percent,
            '/': Type.Slash,
            ',': Type.Comma,
            '(': Type.LParen,
            ')': Type.RParen,
            '+': Type.Plus,
            '-': Type.Minus,
            '*': Type.Star,
            '.': Type.Dot,
            '`': Type.Backtick,
            "'": Type.SingleQuote,
            '"': Type.DoubleQuote,
            '\\': Type.BackSlash,
            '~': Type.Tilde,
            '!': Type.Exclamation,
            '@': Type.At,
            '$': Type.Dollar,
            '?': Type.Question,
            '^': Type.Caret,
            '&': Type.Ampersand,
            '<': Type.LessThan,
            '>': Type.GreaterThan,
            '_': Type.Underscore,
            '=': Type.EqualSign,
            '[': Type.LBracket,
            ']': Type.RBracket,
            '{': Type.LBrace,
            '}': Type.RBrace,
            ';': Type.SemiColon,
            ':': Type.Colon,
            '|': Type.Pipe,
        };

        /**
         * Classifies a character using a fast switch for single chars
         * and regex for character categories.
         * This method is now stateless and side-effect free.
        */
        public static classify(char: string): Type {
            // 1. Handle EOF, undefined and null
            if (char === '') return this.handleEOF();
            if (char === undefined || char === null) return this.handleError(char);

            // 2. Handle characters in the symbol map
            if (this.SymbolMap[char]) return this.SymbolMap[char];

            // 3. Loop through the regex map for character categories.
            for (const type in this.RegexMap) {
                if (this.RegexMap[type as Type]!(char)) return type as Type;
            }

            // 4. Fallback type
            return this.handleOther(char);
        }

        private static handleOther(char: string): Type {
            return Type.Other;
        }

        private static handleError(char: string): Type {
            return Type.Error
        }

        private static handleEOF(): Type {
            return Type.EOF;
        }
    } // End class Utility

    export class Stream implements IterableIterator<Character> {
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
            if (this.isEOF()) return { done: true, value: this.atEOF() };
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
                type: Utility.classify(value),
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
         * @returns the position of the cursor n characters forward
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
        private calculateNextPosition(pos: Position): Position {
            const codePoint = this.source.codePointAt(pos.index)!;
            const charValue = String.fromCodePoint(codePoint);
            const newIndex = pos.index + charValue.length;
            if (charValue === '\n') {
                return {
                    index: newIndex,
                    line: pos.line + 1,
                    column: 1
                };
            } else {
                return {
                    index: newIndex,
                    line: pos.line,
                    column: pos.column + [...charValue].length
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
            const codePoint = this.source.codePointAt(lookaheadIndex)!;
            return String.fromCodePoint(codePoint);
        }

        /**
         * Looks backwards from the current stream position through the character buffer
         * and collects a contiguous sequence of characters that match a predicate.
         *
         * This method does NOT change the stream's position.
         *
         * @param predicate A function that takes a Character and returns a boolean.
         * @returns An array of the matching characters, in their original forward order.
         */
        public lookbackWhile(predicate: (char: Character) => boolean): Character[] {
            if (this.charsBuffer.length === 0) return [];
            const lookedBackChars: Character[] = [];

            for (let i = this.charsBuffer.length - 1; i >= 0; i--) {
                const char = this.charsBuffer[i]!;
                if (predicate(char)) {
                    lookedBackChars.push(char);
                } else {
                    break;
                }
            }

            // The characters were collected in reverse order (e.g., '3', '2', '1').
            // Reverse the array to return them in their natural order ('1', '2', '3').
            return lookedBackChars.reverse();
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
                type: Type.EOF,
                position: pos,
            });
        }

        public atError(): Character {
            return {
                value: 'Error',
                type: Type.Other,
                position: this.getPosition(),
            };
        }
    } // End class Stream
} // End namespace Char

export default Char;