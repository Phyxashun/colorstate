import { CharType } from './CharType';

export type CharSpecFn = (char: string) => boolean;
export type CharSpec = Map<CharType, CharSpecFn>;

/**
 * A map of common single characters to their specific types and
 * an ordered list of regular expression rules. The order is critical for
 * correct classification, testing for more specific categories (like Emoji)
 * before more general ones (like Symbol).
 */
export const CharSpec: CharSpec = new Map([
    [CharType.EOF, (char: string) => char === ''],
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

    /**
     * SPECIFIC ASCII AND
     * UNICODE SYMBOLS
     ** P	Punctuation (includes):
     *      Pc	Connector Punctuation
     *      Pd	Dash Punctuation
     *      Ps	Open Punctuation
     *      Pe	Close Punctuation
     *      Pi	Initial Punctuation
     *      Pf	Final Punctuation
     *      Po	Other Punctuation
     * 
     ** S	Symbol (includes):
     *      Sm	Math Symbol
     *      Sc	Currency Symbol
     *      Sk	Modifier Symbol
     *      So	Other Symbol
     */
    [CharType.Hash, (char: string) => char === '#'],
    [CharType.Percent, (char: string) => char === '%'],
    [CharType.Slash, (char: string) => char === '/'],
    [CharType.Comma, (char: string) => char === ','],
    [CharType.LParen, (char: string) => char === '('],
    [CharType.RParen, (char: string) => char === ')'],
    [CharType.Plus, (char: string) => char === '+'],
    [CharType.Minus, (char: string) => char === '-'],
    [CharType.Star, (char: string) => char === '*'],
    [CharType.Dot, (char: string) => char === '.'],
    [CharType.Backtick, (char: string) => char === '`'],
    [CharType.SingleQuote, (char: string) => char === "'"],
    [CharType.DoubleQuote, (char: string) => char === '"'],
    [CharType.BackSlash, (char: string) => char === '\\'],
    [CharType.Tilde, (char: string) => char === '~'],
    [CharType.Exclamation, (char: string) => char === '!'],
    [CharType.At, (char: string) => char === '@'],
    [CharType.Dollar, (char: string) => char === '$'],
    [CharType.Question, (char: string) => char === '?'],
    [CharType.Caret, (char: string) => char === '^'],
    [CharType.Ampersand, (char: string) => char === '&'],
    [CharType.LessThan, (char: string) => char === '<'],
    [CharType.GreaterThan, (char: string) => char === '>'],
    [CharType.Underscore, (char: string) => char === '_'],
    [CharType.EqualSign, (char: string) => char === '='],
    [CharType.LBracket, (char: string) => char === '['],
    [CharType.RBracket, (char: string) => char === ']'],
    [CharType.LBrace, (char: string) => char === '{'],
    [CharType.RBrace, (char: string) => char === '}'],
    [CharType.SemiColon, (char: string) => char === ';'],
    [CharType.Colon, (char: string) => char === ':'],
    [CharType.Pipe, (char: string) => char === '|'],
    [CharType.Punctuation, (char: string) => /\p{P}/u.test(char)],
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
]);

