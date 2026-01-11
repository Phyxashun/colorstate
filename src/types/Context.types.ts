// src/types/Context.types.ts

import { CharType } from '../Character/utils/CharType.ts';
import { TokenType } from './Tokenizer.types.ts';

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

// The instructions the Context gives back to the Tokenizer.
export interface Action {
    emit: boolean;          // Should the current buffer be emitted as a token?
    reprocess: boolean;     // Should the current character be re-processed in the new state?
    ignore: boolean;        // Should the current character be ignored and not buffered?
    charType?: CharType;    // What character type triggered this action?  
    tokenType: TokenType;   // What type of token should be emitted?
}

export type QuoteType = CharType.Backtick | CharType.SingleQuote | CharType.DoubleQuote;


