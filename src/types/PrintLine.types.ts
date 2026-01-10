// src/types/PrintLine.types.ts

import type { InspectColor } from "node:util";

export enum LineType {
    Default = '─',
    Square = '■',
    Bold = '█',
    Dashed = '-',
    Underscore = '_',
    DoubleUnderscore = '‗',
    Equals = '=',
    Double = '═',
    BoldBottom = '▄',
    BoldTop = '▀',
    Diaeresis = '¨',
    Macron = '¯',
    Section = '§',
    Interpunct = '·',
    LightBlock = '░',
    MediumBlock = '▒',
    HeavyBlock = '▓',
};

declare const BOX_STYLES: {
    readonly single: {};
    readonly double: {};
    readonly light: {};
    readonly medium: {};
    readonly heavy: {};
    readonly bold: {};
}

export type BoxStyle = keyof typeof BOX_STYLES;

declare const THEMES: {
    readonly success: {
        readonly color: "green";
        readonly line: LineType.Default;
        readonly styles: readonly ["bold"];
    };
    readonly error: {
        readonly color: "red";
        readonly line: LineType.Bold;
    };
    readonly warning: {
        readonly color: "yellow";
        readonly line: LineType.Dashed;
    };
    readonly info: {
        readonly color: "cyan";
        readonly line: LineType.Default;
    };
}

/**
 * @interface PrintLineOptions
 * @description Defines the structure for a PrintLine options object.
 * @property {boolean} preNewLine - If true, adds a newline before the divider.
 * @property {boolean} postNewLine - If true, adds a newline after the divider.
 * @property {number} width - The width of the line.
 * @property {string | LineType} line - The character to use for the line.
 * @property {keyof typeof THEMES} theme - Apply a predefined theme.
 * @property {InspectColor | InspectColor[]} color - The default foreground color.
 * @property {InspectColor | InspectColor[]} bgColor - The default backgound color.
 * @property {[InspectColor, InspectColor]} gradient - Create a line of up to two colors.
 * @property {'bold' | 'italic' | 'underline' | 'inverse'} styles - The styles of the line.
 * @property {string} text - Text to include in the the line.
 * @property {'left' | 'center' | 'right'} textAlign - The text alignment in the line.
 * @property {InspectColor | InspectColor[]} textColor - The text color in the line.
 */
export interface PrintLineOptions {
    preNewLine?: boolean;
    postNewLine?: boolean;
    width?: number;
    line?: LineType;
    theme?: keyof typeof THEMES;
    color?: InspectColor | InspectColor[];
    bgColor?: InspectColor | InspectColor[];
    gradient?: [InspectColor, InspectColor];
    styles?: ('bold' | 'italic' | 'underline' | 'inverse')[];
    text?: string;
    textAlign?: 'left' | 'center' | 'right';
    textColor?: InspectColor | InspectColor[];
}

/**
 * @interface BoxTextOptions
 * @description Defines the structure for a BoxText options object.
 * @property {boolean} preNewLine - If true, adds a newline before the divider.
 * @property {boolean} postNewLine - If true, adds a newline after the divider.
 * @property {'tight' | 'max' | number} width - The width of the box.
 * @property {BoxStyle} boxStyle - The type of the lines used to create the box.
 * @property {'left' | 'center' | 'right'} width - The width of the line.
 * @property {InspectColor | InspectColor[]} color - The default foreground color.
 * @property {InspectColor | InspectColor[]} bgColor - The default backgound color.
 * @property {'bold' | 'italic' | 'underline'} styles - Additional styling for the box.
 * @property {InspectColor | InspectColor[]} textColor - The default text color.
 * @property {InspectColor | InspectColor[]} textBgColor - The default text background color.
 */
export interface BoxTextOptions {
    preNewLine?: boolean;
    postNewLine?: boolean;
    width?: 'tight' | 'max' | number;
    boxStyle?: BoxStyle;
    boxAlign?: 'left' | 'center' | 'right';
    color?: InspectColor | InspectColor[];
    bgColor?: InspectColor | InspectColor[];
    styles?: ('bold' | 'italic' | 'underline')[];

    // New! Text-specific styling
    textColor?: InspectColor | InspectColor[];
    textBgColor?: InspectColor | InspectColor[];
}

