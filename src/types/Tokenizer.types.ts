// src/types/Tokenizer.types.ts

import type { Position } from "../Character/CharacterStream";

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
    SEMICOLON = 'SEMICOLON'
}

export interface Token {
    value: string;
    type: TokenType;
    position: {
        start: Position;
        end: Position;
    }
}

export type CreateTokenFn = (value: string, type: TokenType, start: Position, end: Position) => Token;
