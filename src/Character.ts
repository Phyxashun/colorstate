// src/Character.ts

/**
 * The Char namespace encapsulates all character and stream-related logic.
 */
//namespace Char {

/**
 * Represents a specific location within the source string, tracked by index,
 * line number, and column number.
 */
export interface Position {
    /** The zero-based index of the character in the overall string. */
    index: number;
    /** The one-based line number where the character appears. */
    line: number;
    /** The one-based column number of the character on its line. */
    column: number;
}

/**
 * Represents a single character processed from the stream, containing its
 * value, classified type, and original position.
 */
export interface Character {
    /** The string value of the character. May be multi-byte. */
    value: string;
    /** The type of the character, as classified by the CharUtility class. */
    type: CharType;
    /** The position of the character in the source string. */
    position: Position;
}

/**
 * A detailed enumeration of all possible character types recognized by the classifier.
 * This includes stream control types, general categories, and specific, common symbols.
 */
export enum CharType {
    // CharacterStream Control
    EOF = 'EOF',
    Error = 'Error',
    Other = 'Other',

    // Whitespace & Formatting
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',

    // Primary Literals
    Letter = 'Letter',
    Number = 'Number',
    Hex = 'Hex',

    // Quotes & Strings
    SingleQuote = 'SingleQuote',
    DoubleQuote = 'DoubleQuote',
    Backtick = 'Backtick',

    // Brackets & Enclosures
    LParen = 'LParen',
    RParen = 'RParen',
    LBracket = 'LBracket',
    RBracket = 'RBracket',
    LBrace = 'LBrace',
    RBrace = 'RBrace',

    // Common Operators & Mathematical
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Slash = 'Slash',
    BackSlash = 'BackSlash',
    EqualSign = 'EqualSign',
    Percent = 'Percent',
    Caret = 'Caret',
    Tilde = 'Tilde',
    Pipe = 'Pipe',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',

    // Punctuation & Delimiters
    Dot = 'Dot',
    Comma = 'Comma',
    Colon = 'Colon',
    SemiColon = 'SemiColon',
    Exclamation = 'Exclamation',
    Question = 'Question',
    Punctuation = 'Punctuation',

    // Special Symbols & Identifiers
    Hash = 'Hash',
    At = 'At',
    Ampersand = 'Ampersand',
    Dollar = 'Dollar',
    Underscore = 'Underscore',
    Currency = 'Currency',
    Symbol = 'Symbol',

    // International / Multi-byte
    Emoji = 'Emoji',
    Unicode = 'Unicode',
} // End enum CharType

/**
 * A stateless CharUtility class for classifying characters.
 */
export class CharUtility {

    /**
     * An ordered list of regular expression rules used as a fallback mechanism
     * for characters not found in the `SymbolMap`. The order is critical for
     * correct classification, testing for more specific categories (like Emoji)
     * before more general ones (like Symbol).
     */
    private static readonly RegexMap: [CharType, (char: string) => boolean][] = [
        /**
         ** ASCII Whitespace Checks
         */
        [CharType.NewLine, (char: string) => /[\n\r]/.test(char)],
        [CharType.Whitespace, (char: string) => /^\s+$/.test(char)],

        /**
         * UNICODE LETTERS
         * 
         ** L	Letter (includes):
         *      Lu	Uppercase Letter
         *      Ll	Lowercase Letter
         *      Lt	Titlecase Letter
         *      Lm	Modifier Letter
         *      Lo	Other Letter
         */
        [CharType.Letter, (char: string) => /\p{L}/u.test(char)],

        /**
         * UNICODE NUMBERS
         * 
         ** N	Number (includes):
         *      Nd	Decimal Digit Number
         *      Nl	Letter Number
         *      No	Other Number
         */
        [CharType.Number, (char: string) => /\p{N}/u.test(char)],

        [CharType.Emoji, (char: string) => /\p{Emoji_Presentation}/v.test(char)],
        [CharType.Currency, (char: string) => /\p{Sc}/u.test(char)],
        [CharType.Punctuation, (char: string) => /\p{P}/u.test(char)],

        /**
         * UNICODE SYMBOLS
         * 
         ** S	Symbol (includes):
         *      Sm	Math Symbol
         *      Sc	Currency Symbol
         *      Sk	Modifier Symbol
         *      So	Other Symbol
         */
        [CharType.Symbol, (char: string) => /\p{S}/u.test(char)],

        /**
         * UNICODE
         * 
         ** ASCII (includes):
         *      all ASCII characters ([\u{0}-\u{7F}])
         */
        [CharType.Unicode, (char: string) => /\P{ASCII}/u.test(char)],

        /**
         * UNICODE
         * 
         * Not Currently, Directly Implemented:
         * 
         ** M	Mark (includes):
         *      Mn	Non-Spacing Mark
         *      Mc	Spacing Combining Mark
         *      Me	Enclosing Mark
         * 
         ** P	Punctuation (includes):
         *      Pc	Connector Punctuation
         *      Pd	Dash Punctuation
         *      Ps	Open Punctuation
         *      Pe	Close Punctuation
         *      Pi	Initial Punctuation
         *      Pf	Final Punctuation
         *      Po	Other Punctuation
         * 
         ** Z	Separator (includes):
         *      Zs	Space Separator
         *      Zl	Line Separator
         *      Zp	Paragraph Separator
         * 
         ** C	Other (includes):
         *      Cc	Control
         *      Cf	Format
         *      Cs	Surrogate
         *      Co	Private Use
         *      Cn	Unassigned
         **      -	*Any
         **      -	*Assigned
         **      -	*ASCII (implemented above)
         * 
         ** *Any (includes):
         *      all code points ([\u{0}-\u{10FFFF}])
         * 
         ** *Assigned (includes):
         *      all assigned characters (\P{Cn})
         */

        /**
         * OTHER UNICODE CHARACTER PROPERTIES TO CONSIDER:
         * 
         *      GENERAL	                        CASE	                        SHAPING AND RENDERING
         *      Name (Name_Alias)	            Uppercase	                    Join_Control
         *      Block	                        Lowercase	                    Joining_Group
         *      Age	                            Simple_Lowercase_Mapping	    Joining_CharType
         *      General_Category	            Simple_Titlecase_Mapping	    Vertical_Orientation
         *      Script (Script_Extensions)	    Simple_Uppercase_Mapping	    Line_Break
         *      White_Space	                    Simple_Case_Folding	            Grapheme_Cluster_Break
         *      Alphabetic	                    Soft_Dotted	                    Sentence_Break
         *      Hangul_Syllable_CharType	        Cased	                        Word_Break
         *      Noncharacter_Code_Point	        Case_Ignorable	                East_Asian_Width
         *      Default_Ignorable_Code_Point	Changes_When_Lowercased	        Prepended_Concatenation_Mark
         *      Deprecated	                    Changes_When_Uppercased	 
         *      Logical_Order_Exception	        Changes_When_Titlecased	        BIDIRECTIONAL
         *      Variation_Selector	            Changes_When_Casefolded	        Bidi_Class
         *                                      Changes_When_Casemapped	        Bidi_Control
         *      NUMERIC	 	                                                    Bidi_Mirrored
         *      Numeric_Value	                NORMALIZATION	                Bidi_Mirroring_Glyph
         *      Numeric_CharType	                Canonical_Combining_Class	    Bidi_Paired_Bracket
         *      Hex_Digit	                    Decomposition_CharType	            Bidi_Paired_Bracket_CharType
         *      ASCII_Hex_Digit	                NFC_Quick_Check	 
         *                                      NFKC_Quick_Check	            MISCELLANEOUS
         *      IDENTIFIERS	                    NFD_Quick_Check	                Math
         *      ID_Continue	                    NFKD_Quick_Check	            Quotation_Mark
         *      ID_Start	                    NFKC_Casefold	                Dash
         *      XID_Continue	                Changes_When_NFKC_Casefolded	Sentence_Terminal
         *      XID_Start	 	                                                Terminal_Punctuation
         *      Pattern_Syntax	                EMOJI	                        Diacritic
         *      Pattern_White_Space	            Emoji	                        Extender
         *      Identifier_Status	            Emoji_Presentation	            Grapheme_Base
         *      Identifier_CharType	                Emoji_Modifier	                Grapheme_Extend
         *                                      Emoji_Modifier_Base	            Regional_Indicator
         *      CJK	                            Emoji_Component	 
         *      Ideographic	                    Extended_Pictographic	 
         *      Unified_Ideograph	            Basic_Emoji*	 
         *      Radical	                        Emoji_Keycap_Sequence*	 
         *      IDS_Binary_Operator	            RGI_Emoji_Modifier_Sequence*	 
         *      IDS_Trinary_Operator	        RGI_Emoji_Flag_Sequence*	 
         *      Equivalent_Unified_Ideograph	RGI_Emoji_Tag_Sequence*	 
         *      RGI_Emoji_ZWJ_Sequence*	 
         *      RGI_Emoji*	 
         */

        /**
         ** Table 12. General_Category Values
         * 
         *      ABBR    LONG	                    DESCRIPTION
         *--------------------------------------------------------------------------------------------------------------
         *      Lu  	Uppercase_Letter	        an uppercase letter
         *      Ll  	Lowercase_Letter	        a lowercase letter
         *      Lt  	Titlecase_Letter	        a digraph encoded as a single character, with first part uppercase
         *      LC  	Cased_Letter	            Lu | Ll | Lt
         *      Lm  	Modifier_Letter	            a modifier letter
         *      Lo  	Other_Letter	            other letters, including syllables and ideographs
         *      L   	Letter	                    Lu | Ll | Lt | Lm | Lo
         *      Mn  	Nonspacing_Mark	            a nonspacing combining mark (zero advance width)
         *      Mc  	Spacing_Mark	            a spacing combining mark (positive advance width)
         *      Me  	Enclosing_Mark	            an enclosing combining mark
         *      M   	Mark	                    Mn | Mc | Me
         *      Nd  	Decimal_Number	            a decimal digit
         *      Nl  	Letter_Number	            a letterlike numeric character
         *      No  	Other_Number	            a numeric character of other type
         *      N   	Number	                    Nd | Nl | No
         *      Pc  	Connector_Punctuation       a connecting punctuation mark, like a tie
         *      Pd  	Dash_Punctuation	        a dash or hyphen punctuation mark
         *      Ps  	Open_Punctuation	        an opening punctuation mark (of a pair)
         *      Pe  	Close_Punctuation	        a closing punctuation mark (of a pair)
         *      Pi  	Initial_Punctuation	        an initial quotation mark
         *      Pf  	Final_Punctuation	        a final quotation mark
         *      Po  	Other_Punctuation	        a punctuation mark of other type
         *      P   	Punctuation	                Pc | Pd | Ps | Pe | Pi | Pf | Po
         *      Sm  	Math_Symbol	                a symbol of mathematical use
         *      Sc  	Currency_Symbol	            a currency sign
         *      Sk  	Modifier_Symbol	            a non-letterlike modifier symbol
         *      So  	Other_Symbol	            a symbol of other type
         *      S   	Symbol	                    Sm | Sc | Sk | So
         *      Zs  	Space_Separator	            a space character (of various non-zero widths)
         *      Zl  	Line_Separator	            U+2028 LINE SEPARATOR only
         *      Zp  	Paragraph_Separator	        U+2029 PARAGRAPH SEPARATOR only
         *      Z   	Separator	                Zs | Zl | Zp
         *      Cc  	Control	                    a C0 or C1 control code
         *      Cf  	Format	                    a format control character
         *      Cs  	Surrogate	                a surrogate code point
         *      Co  	Private_Use	                a private-use character
         *      Cn  	Unassigned	                a reserved unassigned code point or a noncharacter
         *      C   	Other	                    Cc | Cf | Cs | Co | Cn
         */
    ];

    /**
     * A map of common single characters to their specific types.
     * This provides an O(1) fast-path lookup, avoiding more expensive
     * regex checks for the most frequent ASCII symbols.
     */
    private static readonly SymbolMap: Record<string, CharType> = {
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
     * Classifies a character using a multi-step, stateless process.
     * The algorithm is:
     * 1. Handle stream control cases (EOF, null).
     * 2. Attempt a fast O(1) lookup in `SymbolMap`.
     * 3. If not found, iterate through the ordered `RegexMap`.
     * 4. If no rule matches, return a fallback `CharType`.
     * @param char The character string to classify.
     * @returns The classified `CharType` of the character.
     */
    public static classify(char: string): CharType {
        // 1. Handle EOF, undefined and null
        if (char === '') return this.handleEOF();
        if (char === undefined || char === null) return this.handleError(char);
        // 2. Handle characters in the symbol map (fast path)
        if (this.SymbolMap[char]) return this.SymbolMap[char];
        // 3. Loop through the ordered classification rules (fallback).
        for (const [type, predicate] of this.RegexMap) {
            if (predicate(char)) return type;
        }
        // 4. Fallback type
        return this.handleOther(char);
    }

    /** Private helper for handling the 'Other' case. Can be expanded for custom logic. */
    private static handleOther(char: string): CharType {
        return CharType.Other;
    }

    /** Private helper for handling the 'Error' case. Can be expanded for custom logic. */
    private static handleError(char: string): CharType {
        return CharType.Error;
    }

    /** Private helper for handling the 'EOF' case. */
    private static handleEOF(): CharType {
        return CharType.EOF;
    }
} // End class CharUtility

/**
 * Provides a stateful, iterable stream of `Character` objects from a source string.
 * It supports Unicode, peeking, backtracking, and speculative parsing via marks.
 */
export class CharacterStream implements IterableIterator<Character> {
    // The Unicode-normalized (NFC) source string being processed.
    private source: string = ''.normalize('NFC');
    // The current byte index of the cursor in the source string.
    private index: number = 0;
    // The current 1-based line number of the cursor.
    private line: number = 1;
    // The current 1-based column number of the cursor.
    private column: number = 1;

    /**
     * A buffer of all previously processed `Character` objects. This serves as the
     * stream's history, enabling backtracking (`back()`) and lookbehind (`lookbackWhile()`).
     * Using the full `Character` object is a design choice to retain type and
     * position info, not just the raw value.
     */
    public charsBuffer: Character[] = [];

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
     * Replaces the stream's source and resets its entire state (position, buffers, marks)
     * to their initial values.
     * @param {string} input - The new source string.
     */
    public set(input?: string): CharacterStream {
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
     * @param {number} index - The character index.
     * @param {number} line - The line number.
     * @param {number} column - The column number.
     */
    public setPosition(index: number, line: number, column: number): void;
    /**
     * Manually sets the stream's cursor to a specific position using a Position object.
     * @param {Position} position - The Position object to apply.
     */
    public setPosition(position: Position): void;
    public setPosition(indexOrPosition: number | Position, line?: number, column?: number): void {
        if (typeof indexOrPosition === 'object') {
            this.index = indexOrPosition.index || 0;
            this.line = indexOrPosition.line || 1;
            this.column = indexOrPosition.column || 1;
        } else {
            this.index = indexOrPosition || 0;
            this.line = line || 1;
            this.column = column || 1;
        }
    }

    /**
     * Makes the stream class itself an iterable, allowing it to be used in `for...of` loops.
     * @returns {IterableIterator<Character>} The stream instance.
     */
    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    /**
     * Consumes and returns the next character in the stream, advancing the cursor.
     * Part of the Iterator protocol.
     * @returns {IteratorResult<Character>} An object with `done` and `value` properties.
     */
    public next(): IteratorResult<Character> {
        if (this.isEOF()) return { done: true, value: this.atEOF() };

        const nextChar = this.peek();
        this.advance(nextChar.value);
        this.charsBuffer.push(nextChar);
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
        if (this.isEOF(pos.index)) return this.atEOF( pos );

        const value = String.fromCodePoint(this.source.codePointAt(pos.index)!);

        return {
            value,
            type: CharUtility.classify(value),
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
} // End class CharacterStream



