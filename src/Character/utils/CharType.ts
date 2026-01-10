/**
 * Represents a specific location within the source string, tracked by index,
 * line number, and column number.
 */
export type Position = {
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
export type Character = {
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
export type CharValue =
    | 'EOF'
    | 'Error'
    | 'Other'
    | 'Whitespace'
    | 'NewLine'
    | 'Letter'
    | 'Number'
    | 'Hex'
    | 'SingleQuote'
    | 'DoubleQuote'
    | 'Backtick'
    | 'LParen'
    | 'RParen'
    | 'LBracket'
    | 'RBracket'
    | 'LBrace'
    | 'RBrace'
    | 'Plus'
    | 'Minus'
    | 'Star'
    | 'Slash'
    | 'BackSlash'
    | 'EqualSign'
    | 'Percent'
    | 'Caret'
    | 'Tilde'
    | 'Pipe'
    | 'LessThan'
    | 'GreaterThan'
    | 'Dot'
    | 'Comma'
    | 'Colon'
    | 'SemiColon'
    | 'Exclamation'
    | 'Question'
    | 'Punctuation'
    | 'Hash'
    | 'At'
    | 'Ampersand'
    | 'Dollar'
    | 'Underscore'
    | 'Currency'
    | 'Symbol'
    | 'Emoji'
    | 'Unicode';

// Σ (Sigma) - the set of allowed characters
export const CharType = {
    // CharacterStream Control
    EOF: 'EOF',
    Error: 'Error',
    Other: 'Other',

    // Whitespace & Formatting
    Whitespace: 'Whitespace',
    NewLine: 'NewLine',

    // Primary Literals
    Letter: 'Letter',
    Number: 'Number',
    Hex: 'Hex',

    // Quotes & Strings
    SingleQuote: 'SingleQuote',
    DoubleQuote: 'DoubleQuote',
    Backtick: 'Backtick',

    // Brackets & Enclosures
    LParen: 'LParen',
    RParen: 'RParen',
    LBracket: 'LBracket',
    RBracket: 'RBracket',
    LBrace: 'LBrace',
    RBrace: 'RBrace',

    // Common Operators & Mathematical
    Plus: 'Plus',
    Minus: 'Minus',
    Star: 'Star',
    Slash: 'Slash',
    BackSlash: 'BackSlash',
    EqualSign: 'EqualSign',
    Percent: 'Percent',
    Caret: 'Caret',
    Tilde: 'Tilde',
    Pipe: 'Pipe',
    LessThan: 'LessThan',
    GreaterThan: 'GreaterThan',

    // Punctuation & Delimiters
    Dot: 'Dot',
    Comma: 'Comma',
    Colon: 'Colon',
    SemiColon: 'SemiColon',
    Exclamation: 'Exclamation',
    Question: 'Question',
    Punctuation: 'Punctuation',

    // Special Symbols & Identifiers
    Hash: 'Hash',
    At: 'At',
    Ampersand: 'Ampersand',
    Dollar: 'Dollar',
    Underscore: 'Underscore',
    Currency: 'Currency',
    Symbol: 'Symbol',

    // International / Multi-byte
    Emoji: 'Emoji',
    Unicode: 'Unicode',
} as const satisfies Record<string, CharValue>;

export type CharType = (typeof CharType)[CharValue];
