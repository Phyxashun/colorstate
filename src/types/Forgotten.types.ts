type TokenKind = typeof TokenType[keyof typeof TokenType];
type CharKind = typeof CharType[keyof typeof CharType];
type CharClassifyFn = (char: string) => boolean;
type State = typeof State[keyof typeof State];
type StateType<T extends string> = { [K in T]: `<${Lowercase<K>}>`; }; // QType
type CharKindType = [CharKind, CharClassifyFn][] // SigmaType
type TransitionType = Record<State, Partial<Record<CharKind, State>>>; // DeltaType
type AcceptingType = Partial<Record<State, TokenKind>>; // Ftype

// Terminals used in accepting states
const TokenType = {
    // String and Numeric Literals
    IDENTIFIER: 'IDENTIFIER',  // words
    STRING: 'STRING',          // string literals
    HEXVALUE: 'HEXVALUE',      // hexadecimal values
    NUMBER: 'NUMBER',          // numeric literals
    PERCENT: 'PERCENT',        // numeric literals followed by '%'
    DIMENSION: 'DIMENSION',    // numeric literals followed by units
    UNICODE: 'UNICODE',        // unicode characters

    // Operator Tokens
    PLUS: 'PLUS',              // '+'
    MINUS: 'MINUS',            // '-'

    // Delimiter Tokens
    COMMA: 'COMMA',            // ','
    SLASH: 'SLASH',            // '/'
    LPAREN: 'LPAREN',          // '('
    RPAREN: 'RPAREN',          // ')'
    DELIMITER: 'DELIMITER',    // all other delimiters, puntuators
    OPERATOR: 'OPERATOR',

    // Possibly ignored Tokens
    WHITESPACE: 'WHITESPACE',  // all whitespace
    EOF: '<end>',              // end of file/line
    ERROR: '<error>',          // token error
} as const;

// Σ (Sigma) - the set of allowed characters
const CharType = {
    Whitespace: 'Whitespace',
    Quote: 'Quote',
    Letter: 'Letter',
    Digit: 'Digit',
    Exponent: 'Exponent',
    Percent: 'Percent',
    Dot: 'Dot',
    LParen: 'LParen',
    RParen: 'RParen',
    Comma: 'Comma',
    Slash: 'Slash',
    Plus: 'Plus',
    Minus: 'Minus',
    Hash: 'Hash',
    Hex: 'Hex',
    Unicode: 'Unicode',
    Operator: 'Operator',
    Other: 'Other',
    EOF: 'EOF',
} as const;

// Q - the set of all possible states
const State = {
    Start: '<start>',
    Whitespace: '<whitespace>',
    InsideQuote: '<inside-quote>',
    EndQuote: '<end-quote>',
    Identifier: '<identifier>',
    HexValue: '<hexvalue>',
    Integer: '<integer>',
    Float: '<float>',
    Exponent: '<exponent>',
    Delimiter: '<delimiter>',
    Operator: '<operator>',
    Error: '<error>',
    Percent: '<percent>',
    Dimension: '<dimension>',
    Unicode: '<unicode>',
} as const;

// δ (delta) - the set of rules for transitioning between states
const Transition: TransitionType = {
    [State.Start]: {
        [CharType.Quote]: State.InsideQuote,
        [CharType.Whitespace]: State.Whitespace,
        [CharType.Hash]: State.HexValue,
        [CharType.Letter]: State.Identifier,
        [CharType.Dot]: State.Delimiter,
        [CharType.Digit]: State.Integer,
        [CharType.Percent]: State.Percent,
        [CharType.Plus]: State.Operator,
        [CharType.Minus]: State.Operator,
        [CharType.LParen]: State.Delimiter,
        [CharType.RParen]: State.Delimiter,
        [CharType.Comma]: State.Delimiter,
        [CharType.Slash]: State.Delimiter,
        [CharType.Unicode]: State.Unicode,
        [CharType.Operator]: State.Operator,
        [CharType.Other]: State.Error,
    },

    [State.Whitespace]: {
        [CharType.Whitespace]: State.Whitespace,
    },

    [State.HexValue]: {
        [CharType.Hex]: State.HexValue,
        [CharType.Exponent]: State.HexValue,
        [CharType.Letter]: State.HexValue,
        [CharType.Digit]: State.HexValue,
    },

    [State.InsideQuote]: {
        [CharType.Whitespace]: State.InsideQuote,
        [CharType.Hash]: State.InsideQuote,
        [CharType.Exponent]: State.InsideQuote,
        [CharType.Letter]: State.InsideQuote,
        [CharType.Digit]: State.InsideQuote,
        [CharType.Percent]: State.InsideQuote,
        [CharType.Plus]: State.InsideQuote,
        [CharType.Minus]: State.InsideQuote,
        [CharType.LParen]: State.InsideQuote,
        [CharType.RParen]: State.InsideQuote,
        [CharType.Comma]: State.InsideQuote,
        [CharType.Slash]: State.InsideQuote,
        [CharType.Unicode]: State.InsideQuote,
        [CharType.Operator]: State.InsideQuote,
        [CharType.Quote]: State.EndQuote,
    },

    [State.EndQuote]: {
        [CharType.Hash]: State.InsideQuote,
        [CharType.Exponent]: State.InsideQuote,
        [CharType.Letter]: State.InsideQuote,
        [CharType.Digit]: State.InsideQuote,
        [CharType.Percent]: State.InsideQuote,
        [CharType.Plus]: State.InsideQuote,
        [CharType.Minus]: State.InsideQuote,
        [CharType.LParen]: State.InsideQuote,
        [CharType.RParen]: State.InsideQuote,
        [CharType.Comma]: State.InsideQuote,
        [CharType.Slash]: State.InsideQuote,
        [CharType.Unicode]: State.InsideQuote,
        [CharType.Operator]: State.InsideQuote,
        [CharType.Quote]: State.EndQuote,
    },

    [State.Identifier]: {
        [CharType.Exponent]: State.Identifier,
        [CharType.Letter]: State.Identifier,
        [CharType.Digit]: State.Identifier,
        [CharType.Minus]: State.Identifier,
    },

    [State.Integer]: {
        [CharType.Operator]: State.Integer,
        [CharType.Exponent]: State.Integer,
        [CharType.Dot]: State.Float,
        [CharType.Percent]: State.Percent,
        [CharType.Letter]: State.Dimension,
        [CharType.Digit]: State.Integer,
    },

    [State.Float]: {
        [CharType.Exponent]: State.Float,
        [CharType.Percent]: State.Percent,
        [CharType.Letter]: State.Dimension,
        [CharType.Digit]: State.Float,
    },

    [State.Exponent]: {
        [CharType.Letter]: State.Identifier,
        [CharType.Digit]: State.Exponent,
    },

    [State.Percent]: {
    },

    [State.Dimension]: {
        [CharType.Digit]: State.Exponent,
        [CharType.Letter]: State.Dimension,
    },

    [State.Unicode]: {
        [CharType.Unicode]: State.Unicode,
    },

    [State.Delimiter]: {
        [CharType.LParen]: State.Delimiter,
        [CharType.RParen]: State.Delimiter,
        [CharType.Comma]: State.Delimiter,
        [CharType.Slash]: State.Delimiter,
        [CharType.Dot]: State.Delimiter,
    },

    [State.Operator]: {
        [CharType.Plus]: State.Operator,
        [CharType.Minus]: State.Operator,
        [CharType.Operator]: State.Operator,
    },

    [State.Error]: {
        [CharType.Other]: State.Error,
    }
}
// End of // δ (delta)

// F - the set of accepting states
const Accepting: AcceptingType = {
    [State.Whitespace]: TokenType.WHITESPACE,
    [State.HexValue]: TokenType.HEXVALUE,
    [State.Unicode]: TokenType.UNICODE,
    [State.EndQuote]: TokenType.STRING,
    [State.Identifier]: TokenType.IDENTIFIER,
    [State.Exponent]: TokenType.NUMBER,
    [State.Integer]: TokenType.NUMBER,
    [State.Float]: TokenType.NUMBER,
    [State.Percent]: TokenType.PERCENT,
    [State.Dimension]: TokenType.DIMENSION,
    [State.Delimiter]: TokenType.DELIMITER,
    [State.Operator]: TokenType.OPERATOR,
    [State.Error]: TokenType.ERROR,
}
// End of F