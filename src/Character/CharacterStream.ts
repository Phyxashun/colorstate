import { CharType, type Position, type Character } from './utils/CharType.ts';
import { CharSpec } from './utils/CharSpec.ts';
import { CharClassify } from './utils/CharClassify.ts'
import { inspect, styleText, type InspectOptions } from 'node:util';
import { PrintLine, CenteredText, BoxText, Spacer } from '../Logging.ts';
import { BoxType } from '../types/Logging.types.ts';

/**
 * Provides a stateful, iterable stream of `Character` objects from a source string.
 * It supports Unicode, peeking, backtracking, and speculative parsing via marks.
 */
class CharacterStream implements Iterable<Character> {
    // The Unicode-normalized (NFC) source string being processed.
    private source: string = ''.normalize('NFC');
    // The current byte index of the cursor in the source string.
    private index: number = 0;
    // The current 1-based line number of the cursor.
    private line: number = 1;
    // The current 1-based column number of the cursor.
    private column: number = 1;
    private shouldLog: boolean = false;
    private isLoggingActive: boolean = false;
    private logMessage = 'CHARACTER STREAM DEMONSTRATION:';
    private inspectOptions: InspectOptions = {
        showHidden: true,
        depth: null,
        colors: true,
        customInspect: false,
        showProxy: false,
        maxArrayLength: null,
        maxStringLength: null,
        breakLength: 100,
        compact: true,
        sorted: false,
        getters: false,
        numericSeparator: true,
    };

    /**
     * A buffer of all previously processed `Character` objects. This serves as the
     * stream's history, enabling backtracking (`back()`) and lookbehind (`lookbackWhile()`).
     * Using the full `Character` object is a design choice to retain type and
     * position info, not just the raw value.
     */
    private charsBuffer: Character[] = [];

    /** 
     * A stack storing the lengths of `charsBuffer` at points where `mark()` was called. 
     */
    private marks: number[] = [];

    /**
     * Initializes a new character stream.
     * @param {string} [input] - The optional initial source string. It will be normalized to NFC.
     */
    constructor(input?: string) {
        this.source = (input || '').normalize('NFC');
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.charsBuffer = [];
        this.marks = [];
        return this;
    }

    /**
     * Gets the current source string of the stream.
     * @returns {string} The source string.
     */
    public get(): string {
        return this.source;
    }

    /**
     * Sets the current source string of the stream.
     * @param {string} input The new source string.
     */
    public set(input: string) {
        this.source = (input || '').normalize('NFC');
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.charsBuffer = [];
        this.marks = [];
        return this;
    }

    /**
     * Gets the current stream position.
     * @returns {Position} An object containing the current index, line, and column.
     */
    public getPosition(): Position {
        return {
            index: this.index,
            line: this.line,
            column: this.column,
        };
    }

    /**
     * Manually sets the stream's cursor to a specific position.
     * @param {number} indexOrPosition - The character index.
     * @param {number} line - The line number.
     * @param {number} column - The column number.
     *
     * or
     * 
     * Manually set to a specific position using a Position object.
     * @param {Position} indexOrPosition - The Position object to apply.
     */
    public setPosition(indexOrPosition: number | Position, line: number = 1, column: number = 1): void {
        if (typeof indexOrPosition === 'object') {
            this.index = indexOrPosition.index;
            this.line = indexOrPosition.line;
            this.column = indexOrPosition.column;
        } else {
            this.index = indexOrPosition;
            this.line = line;
            this.column = column;
        }
    }

    /**
     * Makes the stream class itself an iterable, allowing it to be used in `for...of` loops.
     * @returns {Iterator<Character>} The stream instance.
     */
    public [Symbol.iterator](): Iterator<Character> {
        this.isLoggingActive = false;
        return this;
    }

    /**
     * Consumes and returns the next character in the stream, advancing the cursor.
     * Part of the Iterator protocol.
     * @returns {IteratorResult<Character>} An object with `done` and `value` properties.
     */
    public next(): IteratorResult<Character> {
        if (this.shouldLog && !this.isLoggingActive) {
            this.logHeaderAndSource();
            this.isLoggingActive = true;
        }

        if (this.isEOF()) {
            if (this.isLoggingActive) {
                this.logFooter();
                this.isLoggingActive = false;
                this.shouldLog = false; // Reset for the next iteration
            }
            return { done: true, value: this.atEOF() };
        }

        const nextChar = this.peek();
        this.advance(nextChar.value);
        this.charsBuffer.push(nextChar);

        if (this.isLoggingActive) {
            this.logCharacter(nextChar);
        }

        return { done: false, value: nextChar };
    }

    /**
     * Looks at a character ahead in the stream *without consuming it*.
     * The stream's position is not changed by this method.
     * @param {number} [n=0] - The number of characters to look ahead (0 for the current character).
     * @returns {Character} The character at the specified lookahead position, or an EOF character if out of bounds.
     */
    public peek(n: number = 0): Character {
        const pos = this.peekPosition(n);
        if (this.isEOF(pos.index)) return this.atEOF(pos);

        const value = String.fromCodePoint(this.source.codePointAt(pos.index)!);

        return {
            value,
            type: CharClassify(value),
            position: pos
        };
    }

    /**
     * Simulates `n` advances to find the position of a future character.
     * @private
     * @param {number} n - The number of characters to peek forward.
     * @returns {Position} The calculated position `n` characters from the current cursor.
     * @throws {Error} If `n` is negative.
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
     * The core logic for calculating the position of the character immediately
     * after a given position, correctly handling multi-byte characters and newlines.
     * @private
     * @param {Position} pos - The starting position.
     * @returns {Position} The position of the next character.
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
     * A simplified version of `peek` that returns only the string value of a future character.
     * @param {number} [n=0] - The number of characters to look ahead.
     * @returns {string} The string value of the character, or an empty string if at EOF.
     */
    public lookahead(n: number = 0): string {
        const lookaheadIndex = this.peekPosition(n).index;
        if (this.isEOF(lookaheadIndex)) return '';
        const codePoint = this.source.codePointAt(lookaheadIndex)!;
        return String.fromCodePoint(codePoint);
    }

    /**
     * Searches backwards through the character buffer and collects a contiguous
     * sequence of characters that match a predicate. The stream's position is not changed.
     * @param predicate A function returning true for characters to include.
     * @returns {Character[]} An array of matching characters, in their original forward order.
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
        // Reverse the array to return them in their natural, forward-read order.
        return lookedBackChars.reverse();
    }

    public lookback(): Character {
        if (this.charsBuffer.length === 0) return null as unknown as Character;
        return this.charsBuffer[this.charsBuffer.length - 1]!;
    }

    /**
     * The internal method for moving the stream's cursor forward after a character has been processed.
     * @param {string} charValue - The value of the character being advanced past.
     */
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
     * Rewinds the stream's position by a given number of steps by popping
     * characters from the history buffer.
     * @param {number} [steps=1] - The number of characters to rewind.
     * @throws {Error} If `steps` is greater than the number of characters in the history buffer.
     */
    public back(steps: number = 1): void {
        if (steps <= 0) return;

        if (steps > this.charsBuffer.length) {
            throw new Error(
                `Cannot go back ${steps} steps. History only contains ${this.charsBuffer.length} characters to go back to.`
            );
        }

        for (let i = 0; i < steps; i++) this.charsBuffer.pop();

        const newPosition = this.charsBuffer.length > 0
            ? this.calculateNextPosition(this.charsBuffer[this.charsBuffer.length - 1]!.position)
            : { index: 0, line: 1, column: 1 };

        this.setPosition(newPosition);
    }

    /**
     * Saves the current stream position to a stack. This is useful for speculative
     * parsing, allowing you to "try" a path and then either `reset()` on failure
     * or `commit()` on success.
     */
    public mark(): void {
        this.marks.push(this.charsBuffer.length);
    }

    /**
     * Restores the stream to the last saved position from the `mark()` stack.
     * This operation consumes the mark.
     * @throws {Error} If no mark has been set.
     */
    public reset(): void {
        if (this.marks.length === 0) throw new Error("Cannot reset. No mark has been set.");

        const markedLength = this.marks.pop()!;
        const lastCharPos = this.charsBuffer[markedLength - 1]?.position;

        const resetPosition = lastCharPos
            ? this.calculateNextPosition(lastCharPos)
            : { index: 0, line: 1, column: 1 };

        this.charsBuffer.length = markedLength;
        this.setPosition(resetPosition);
    }

    /**
     * Discards the most recent mark from the stack without changing the stream's position.
     * This should be called after a speculative parse succeeds.
     * @throws {Error} If no mark has been set.
     */
    public commit(): void {
        if (this.marks.length === 0) throw new Error("Cannot commit. No mark has been set.");
        this.marks.pop();
    }

    /**
     * Consumes characters from the stream as long as the predicate returns true.
     * @param predicate A function that takes a `Character` and returns a boolean.
     * @returns {Character[]} An array of the consumed characters.
     */
    public consumeWhile(predicate: (char: Character) => boolean): Character[] {
        const consumed: Character[] = [];
        while (!this.isEOF() && predicate(this.peek())) {
            const result = this.next();
            consumed.push(result.value as Character);
        }
        return consumed;
    }

    /**
     * Checks if the stream's cursor is at or past the end of the source string.
     * @param {number} [index=this.index] - An optional index to check; defaults to the current cursor index.
     * @returns {boolean} True if the index is at or past the end of the source.
     */
    public isEOF(index?: number): boolean {
        index = index !== undefined ? index : this.index;
        return index >= this.source.length;
    }

    /**
     * Constructs a standard `Character` object representing the End-Of-File state.
     * @param {Position} [pos=this.getPosition()] - An optional position for the EOF character; defaults to the current position.
     * @returns {Character} The EOF character object.
     */
    public atEOF(pos?: Position): Character {
        return ({
            value: '',
            type: CharType.EOF,
            position: pos || this.getPosition(),
        });
    }

    /**
     * Constructs a standard `Character` object representing an error state.
     * @returns {Character} The Error character object at the current position.
     */
    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            position: this.getPosition(),
        };
    }

    /**
     * Enables logging for the next full iteration of the stream.
     * @param {string} [message] - An optional message for the log header.
     */
    public withLogging(message?: string, width?: number): this {
        this.shouldLog = true;
        if (message) this.logMessage = message;
        if (width) this.inspectOptions.breakLength = width;
        return this;
    }

    /**
     * Disables logging.
     */
    public withoutLogging(): this {
        this.shouldLog = false;
        return this;
    }

    private logHeaderAndSource(): void {
        if (!this.shouldLog) return;

        // Output Title Line
        PrintLine({ width: this.inspectOptions.breakLength, postNewLine: true, color: 'red', textColor: 'magenta', text: this.logMessage });

        // Output Source Title
        CenteredText(styleText('yellow', 'SOURCE:\n'));

        // Output Source String
        BoxText(this.get(), { width: 50, boxType: BoxType.double, textColor: 'yellow' });

        // Output Divider between Source and Result
        PrintLine({ width: this.inspectOptions.breakLength, preNewLine: true, postNewLine: true });

        // Output Result Title
        console.log(styleText('yellow', 'RESULT (CHARACTERS):'));
    }

    private logCharacter(char: Character): void {
        // In conjunction with next() output each character
        console.log(`${Spacer(3)}${inspect(char, this.inspectOptions)}`);
    }

    private logFooter(): void {
        // Output Ending Divider after all results
        PrintLine({ width: this.inspectOptions.breakLength, preNewLine: true, color: 'red' });
    }

} // End class CharacterStream

export {
    type Position,
    type Character,
    CharType,
    CharSpec,
    CharClassify,
    CharacterStream
}

