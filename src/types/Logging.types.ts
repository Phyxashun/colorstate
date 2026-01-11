// src/types/PrintLine.types.ts

/** 
 * @type AlignType
 * @description Type defining text alignment options.
 */
export type AlignType = 'left' | 'center' | 'right';

/** 
 * @enum Align
 * @description Enum for different text alignments.
 */
export enum Align {
    left =   'left',
    center = 'center',
    right =  'right',
}

/** 
 * @type StyleType
 * @description Type defining available text styles.
 */
export type StyleType =
    | "bold" | "reset" | "dim" | "italic" | "underline" 
    | "blink" | "inverse" | "hidden" | "strikethrough" | "doubleunderline"
;

/** 
 * @enum Style
 * @description Enum for different text styles.
 */
export enum Style {
    bold =          'bold',
    reset =         'reset',
    dim =           'dim',
    italic =        'italic',
    underline =     'underline',
    blink =         'blink',
    inverse =       'inverse',
    hidden =        'hidden',
    strikethrough = 'strikethrough',
    doubleunderline = 'doubleunderline',
}

/** 
 * @type ColorType
 * @description Type defining available text colors.
 */
export type ColorType =
    | "green" | "red" | "yellow" | "cyan" | "black" | "blue" 
    | "magenta" | "white" | "gray" | "redBright" | "greenBright" | "yellowBright" 
    | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright"
; 

/** 
 * @enum Color
 * @description Enum for different text colors.
 */
export enum Color {
    green =         'green',
    red =           'red',
    yellow =        'yellow',
    cyan =          'cyan',
    black =         'black',
    blue =          'blue',
    magenta =       'magenta',
    white =         'white',
    gray =          'gray',
    redBright =     'redBright',
    greenBright =   'greenBright',
    yellowBright =  'yellowBright',
    blueBright =    'blueBright',
    magentaBright = 'magentaBright',
    cyanBright =    'cyanBright',
    whiteBright =   'whiteBright',
}

/** 
 * @type BackgroundColorType
 * @description Type defining available background colors.
 */
export type BackgroundColorType =
    | "bgGreen" | "bgRed" | "bgYellow" | "bgCyan" | "bgBlack" | "bgBlue" | "bgMagenta" 
    | "bgWhite" | "bgGray" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" 
    | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright"
;

/** 
 * @enum BackgroundColor
 * @description Enum for different background colors.
 */
export enum BackgroundColor {
    bgGreen =         'bgGreen',
    bgRed =           'bgRed',
    bgYellow =        'bgYellow',
    bgCyan =          'bgCyan',
    bgBlack =         'bgBlack',
    bgBlue =          'bgBlue',
    bgMagenta =       'bgMagenta',
    bgWhite =         'bgWhite',
    bgGray =          'bgGray',
    bgRedBright =     'bgRedBright',
    bgGreenBright =   'bgGreenBright',
    bgYellowBright =  'bgYellowBright',
    bgBlueBright =    'bgBlueBright',
    bgMagentaBright = 'bgMagentaBright',
    bgCyanBright =    'bgCyanBright',
    bgWhiteBright =   'bgWhiteBright',
}

/** 
 * @type InspectColor
 * @description Type defining available inspect colors.
 */
type InspectColor = StyleType | ColorType | BackgroundColorType; // From 'node:util'

/**
 * @enum LineType
 * @description Enum for different line types.
 */
export enum LineType {
    default =          '─',
    dashed =           '-',
    underscore =       '_',
    doubleUnderscore = '‗',
    equals =           '=',
    double =           '═',
    diaeresis =        '¨',
    macron =           '¯',
    section =          '§',
    interpunct =       '·',
    lightBlock =       '░',
    mediumBlock =      '▒',
    heavyBlock =       '▓',
    boldBlock =        '█',
    boldSquare =       '■',
    boldBottom =       '▄',
    boldTop =          '▀',
};

/**
 * @enum BoxStyle
 * @description Enum for different box styles.
 */
export enum BoxType {
    single,
    double,
    light,
    medium,
    heavy,
    bold,
    half,
    star,
    circle,
    square,
    hash
}

/**
 * @type BoxPartKeys
 * @description Type defining the keys for box parts.
 */
export enum BoxPart { tl = 'tl', t = 't', tr = 'tr', l = 'l', r = 'r', bl = 'bl', b = 'b', br = 'br' }

/**
 * @type BoxParts
 * @description Type defining the structure for box parts.
 */
export type BoxParts = Record<BoxPart, string>;

/**
 * @constant BoxStyles
 * @description Predefined box styles with their corresponding characters.
 */
export const BoxStyles = {
    [BoxType.single]: { tl: '┌', t: '─', tr: '┐', l: '│', r: '│', bl: '└', b: '─', br: '┘' },
    [BoxType.double]: { tl: '╔', t: '═', tr: '╗', l: '║', r: '║', bl: '╚', b: '═', br: '╝' },
    [BoxType.light]:  { tl: '░', t: '░', tr: '░', l: '░', r: '░', bl: '░', b: '░', br: '░' },
    [BoxType.medium]: { tl: '▒', t: '▒', tr: '▒', l: '▒', r: '▒', bl: '▒', b: '▒', br: '▒' },
    [BoxType.heavy]:  { tl: '▓', t: '▓', tr: '▓', l: '▓', r: '▓', bl: '▓', b: '▓', br: '▓' },
    [BoxType.bold]:   { tl: "█", t: "█", tr: "█", l: "█", r: "█", bl: "█", b: "█", br: "█" },
    [BoxType.half]:   { tl: '▄', t: '▄', tr: '▄', l: '█', r: '█', bl: '▀', b: '▀', br: '▀' },
    [BoxType.star]:   { tl: '*', t: '*', tr: '*', l: '*', r: '*', bl: '*', b: '*', br: '*' },
    [BoxType.circle]: { tl: '●', t: '●', tr: '●', l: '●', r: '●', bl: '●', b: '●', br: '●' },
    [BoxType.square]: { tl: '■', t: '■', tr: '■', l: '■', r: '■', bl: '■', b: '■', br: '■' },
    [BoxType.hash]:   { tl: '#', t: '#', tr: '#', l: '#', r: '#', bl: '#', b: '#', br: '#' },
} as const;

/** 
 * @interface Theme
 * @description Defines the structure for a theme object.
 * @property {InspectColor | InspectColor[]} color - The color(s) associated with the theme.
 * @property {LineType} line - The line type associated with the theme.
 * @property {(StyleType)[]} [styles] - Optional styles associated with the theme.
 */
export interface Theme {
    color: InspectColor | InspectColor[];
    line: LineType;
    styles?: (StyleType)[];
}

/**
 * @constant THEMES
 * @description Predefined themes for PrintLine.
 */
export const Themes: Record<string, Theme> = {
    Success: 
        { color: 'green',   line: LineType.default,     styles: ['bold']    },
    Error: 
        { color: 'red',     line: LineType.boldBlock                             },
    Warning: 
        { color: 'yellow',  line: LineType.dashed                           },
    Info: 
        { color: 'cyan',    line: LineType.default                          },
} as const;

/** 
 * @interface PrintLineOptions
 * @description Defines the structure for a PrintLine options object.
 * @property {number} width - The width of the line.
 * @property {boolean} preNewLine - If true, adds a newline before the line.
 * @property {boolean} postNewLine - If true, adds a newline after the line.
 * @property {LineType} lineType - The style of the line.
 * @property {AlignType} textAlign - The alignment of the text.
 * @property {keyof typeof THEMES} theme - Apply a predefined theme.
 * @property {InspectColor | InspectColor[]} color - The color of the line.
 * @property {InspectColor | InspectColor[]} bgColor - The background color of the line.
 * @property {StyleType | StyleType[]} styles - The styles applied to the line.
 * @property {string} text - The text to display on the line.
 */
export interface PrintLineOptions {
    // Alignment options
    width?: number;
    preNewLine?: boolean;
    postNewLine?: boolean;
    
    // Line options
    lineType?: LineType;
    theme?: keyof typeof Themes;
    color?: InspectColor | InspectColor[];
    bgColor?: InspectColor | InspectColor[];
    gradient?: [InspectColor, InspectColor];
    styles?: StyleType | StyleType[];

    // Text options
    text?: string;
    textAlign?: AlignType;
    textColor?: InspectColor | InspectColor[];
}

/** 
 * @type BoxWidth
 * @description Type defining box width options.
 * 'tight' - Width adjusts to fit the text content.
 * 'max'   - Width spans the maximum allowed width.
 * number  - Specific numeric width.
 */
type BoxWidth = 'tight' | 'max' | number;

export enum Width {
    default = 80,
    tight = 'tight',
    max =   'max',
}

/** 
 * @interface BoxTextOptions
 * @description Defines the structure for a BoxText options object.
 * @property {BoxWidth} width - The width of the box.
 * @property {boolean} preNewLine - If true, adds a newline before the box.
 * @property {boolean} postNewLine - If true, adds a newline after the box.
 * @property {BoxType} boxType - The style of the box.
 * @property {AlignType} boxAlign - The alignment of the box.
 * @property {keyof typeof THEMES} theme - Apply a predefined theme.
 * @property {InspectColor | InspectColor[]} color - The default foreground color of the box.
 * @property {InspectColor | InspectColor[]} bgColor - The default backgound color of the box.
 * @property {StyleType | StyleType[]} styles - The styles of the box.
 * @property {InspectColor | InspectColor[]} textColor - The text color inside the box.
 * @property {InspectColor | InspectColor[]} textBgColor - The text background color inside the box.
 */
export interface BoxTextOptions {
    // Alignment options
    width?: BoxWidth;
    preNewLine?: boolean;
    postNewLine?: boolean;

    // Box options
    boxType?: BoxType;
    boxAlign?: AlignType;
    theme?: keyof typeof Themes;
    color?: InspectColor | InspectColor[];
    bgColor?: InspectColor | InspectColor[];
    styles?: StyleType | StyleType[];

    // Text options
    textColor?: InspectColor | InspectColor[];
    textBgColor?: InspectColor | InspectColor[];
}

