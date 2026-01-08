export enum TokenType {
    // State Control Tokens
    START = 'START',
    OTHER = 'OTHER',
    ERROR = 'ERROR',
    END = 'END',

    // Whitespace and Formatting Tokens
    WHITESPACE = 'WHITESPACE',
    NEWLINE = 'NEWLINE',

    // Primary Tokens
    IDENTIFIER = 'IDENTIFIER',
    NUMBER = 'NUMBER',
    HEXVALUE = 'HEXVALUE',
    SYMBOL = 'SYMBOL',

    // Context Specific Identifier Literals
    KEYWORD = 'KEYWORD',
    FUNCTION = 'FUNCTION',

    // Context Specific Numeric Literals
    PERCENT = 'PERCENT',
    DIMENSION = 'DIMENSION',

    // Context Specific String Literals
    STRING = 'STRING',
    ESCAPE = 'ESCAPE',
    COMMENT = 'COMMENT',

    // Context Specific Symbol Literals
    EQUALS = 'EQUALS',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    STAR = 'STAR',
    DOT = 'DOT',

    // Context Specific Delimiter Tokens
    COMMA = 'COMMA',
    SLASH = 'SLASH',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
}

export enum State {
    INITIAL = 'INITIAL',
    IN_IDENTIFIER = 'IN_IDENTIFIER',
    IN_STRING = 'IN_STRING',
    SEEN_SLASH = 'SEEN_SLASH',
    IN_SINGLE_LINE_COMMENT = 'IN_SINGLE_LINE_COMMENT',
    IN_MULTI_LINE_COMMENT = 'IN_MULTI_LINE_COMMENT',
    IN_MULTI_LINE_COMMENT_SAW_STAR = 'IN_MULTI_LINE_COMMENT_SAW_STAR',
    IN_HEXVALUE = 'IN_HEXVALUE',
    IN_NUMBER = 'IN_NUMBER',
    IN_PERCENT = 'IN_PERCENT',
    IN_DIMENSION = 'IN_DIMENSION',
    IN_EQUALS = 'IN_EQUALS',
    IN_PLUS = 'IN_PLUS',
    IN_MINUS = 'IN_MINUS',
    IN_STAR = 'IN_STAR',
    IN_DOT = 'IN_DOT',
    IN_COMMA = 'IN_COMMA',
    IN_SLASH = 'IN_SLASH',
    IN_LPAREN = 'IN_LPAREN',
    IN_RPAREN = 'IN_RPAREN',
    IN_ESCAPE = 'IN_ESCAPE',
    IN_SYMBOL = 'IN_SYMBOL',
    IN_NEWLINE = 'IN_NEWLINE',
    IN_WHITESPACE = 'IN_WHITESPACE',
    IN_EOF = 'IN_EOF',
    IN_OTHER = 'IN_OTHER',
    IN_ERROR = 'IN_ERROR',
    END = 'END',
}