// src/PrintLine.ts

import { styleText } from 'node:util';
import figlet from 'figlet';
import standard from "figlet/fonts/Standard";
import { BoxStyle, BoxStyles, LineType, Themes, type PrintLineOptions, type BoxTextOptions } from './types/PrintLine.types';

const MAX_WIDTH: number = 80;
const TAB_WIDTH: number = 4;
const SPACE: string = ' ';
const FIGLET_FONT = 'Standard';
figlet.parseFont(FIGLET_FONT, standard);

/**
 * @function Spacer
 * @description Creates a string of repeated characters, useful for padding.
 * @param {number} [width=TAB_WIDTH] - Number of characters to repeat.
 * @param {string} [char=SPACE] - The character to repeat.
 * @returns {string} A string of repeated characters.
 */
const Spacer = (width: number = TAB_WIDTH, char: string = SPACE): string => char.repeat(width);

/**
 * @function CenterText
 * @description Centers a line of text within a given width by adding padding.
 * @param {string} text - The text to center.
 * @param {number} [width=MAX_WIDTH] - The total width to center within.
 * @returns {string} The centered text string.
 * @requires spacer - Function that return a string for spacing.
 */
const CenterText = (text: string, width: number = MAX_WIDTH): string => {
    // Remove any existing styling for accurate length calculation
    const unstyledText = text.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = Math.max(0, Math.floor((width - unstyledText.length) / 2));
    return `${Spacer(padding)}${text}`;
};

/**
 * @function CenteredFiglet
 * @description Generates and centers multi-line FIGlet (ASCII) text.
 * @param {string} text - The text to convert to ASCII art.
 * @param {number} [width=MAX_WIDTH] - The total width to center the art within.
 * @returns {string} The centered, multi-line ASCII art as a single string.
 * @requires centerText
 */
const CenteredFiglet = (text: string, width: number = MAX_WIDTH): string => {
    const rawFiglet = figlet.textSync(text, {
        font: FIGLET_FONT,
        width: width,
        whitespaceBreak: true
    });

    return rawFiglet.split('\n')
        .map(line => CenterText(line, width))
        .join('\n');
}

/**
 * @function PrintLine
 * @description Outputs a styled horizontal line to the console.
 * @param {PrintLineOptions} [options={}] - Configuration options for the line.
 * @returns {string}
 */
const PrintLine = (options: PrintLineOptions = {}): string => {
    /**
     * @description Default options object for the printLine function.
     */
    const defaultOptions: PrintLineOptions = {
        preNewLine: false,      // No preceding new line
        postNewLine: false,     // No successive new line
        width: MAX_WIDTH,       // Use global const MAX_WIDTH = 80
        line: LineType.Double,  // Use global line enum
        color: ['gray', 'bold'] // styleText formatting         
    } as const;

    const themeOptions = options.theme ? (Themes as any)[options.theme] : {};
    const mergedOptions = {
        ...defaultOptions,
        ...themeOptions,
        ...options
    };
    const {
        preNewLine,
        postNewLine,
        width,
        line,
        color,
        bgColor,
        gradient,
        styles,
        text,
        textAlign = 'center',
        textColor
    } = mergedOptions;

    const colorStyles = color ? (Array.isArray(color) ? color : [color]) : [];
    const bgColorStyles = bgColor ? (Array.isArray(bgColor) ? bgColor : [bgColor]) : [];
    const otherStyles = styles || [];
    const lineStyles = [...colorStyles, ...bgColorStyles, ...otherStyles];
    const textStyles = textColor ? (Array.isArray(textColor) ? textColor : [textColor]) : lineStyles;
    const newLine = '\n';
    const pre = preNewLine ? newLine : '';
    const post = postNewLine ? newLine : '';
    let finalOutput: string;

    if (gradient) {
        const [startColor, endColor] = gradient;
        const halfWidth = Math.floor(width! / 2);

        const startSegment = styleText([startColor], line!.repeat(halfWidth));
        const endSegment = styleText([endColor], line!.repeat(width! - halfWidth));

        const styledDivider = startSegment + endSegment;

        const result = `${pre}${styledDivider}${post}`;
        console.log(result);
        return result;
    }


    if (!text) {
        // Simple case: No text, just style the whole line as before.
        finalOutput = styleText(lineStyles, line!.repeat(width!));
    } else {
        // Advanced case: Text exists, so build the line in pieces.
        const paddedText = ` ${text} `; // Add padding

        // Style the text separately
        const styledText = styleText(textStyles, paddedText);

        const lineCharCount = width! - paddedText.length;
        if (lineCharCount < 0) {
            // If the text is too long, just print the styled text.
            finalOutput = styledText;
        } else {
            // Otherwise, calculate and style the line segments.
            switch (textAlign) {
                case 'left': {
                    const rightLine = styleText(lineStyles, line!.repeat(lineCharCount));
                    finalOutput = styledText + rightLine;
                    break;
                }
                case 'right': {
                    const leftLine = styleText(lineStyles, line!.repeat(lineCharCount));
                    finalOutput = leftLine + styledText;
                    break;
                }
                case 'center':
                default: {
                    const leftCount = Math.floor(lineCharCount / 2);
                    const rightCount = lineCharCount - leftCount;
                    const leftLine = styleText(lineStyles, line!.repeat(leftCount));
                    const rightLine = styleText(lineStyles, line!.repeat(rightCount));
                    finalOutput = leftLine + styledText + rightLine;
                    break;
                }
            }
        }
    }

    // 5. Log the final constructed string
    const result = `${pre}${finalOutput}${post}`;
    console.log(result);
    return result;
};

/**
 * @function BoxText
 * @description Draws a styled ASCII box around a given text string and prints it to the console.
 * @param {string | string[]} text - The text to be enclosed in the box.
 * @param {BoxTextOptions} [options={}] - Configuration options for the box.
 * @returns {string}
 */
const BoxText = (text: string | string[], options: BoxTextOptions = {}): void => {
    // --- 1. Set Defaults and Merge Options ---
    const {
        preNewLine = false,
        postNewLine = false,
        width = 'tight',
        boxStyle = 'single',
        boxAlign = 'center',
        color = ['gray', 'bold'],
        bgColor,
        styles,
        textColor = 'white',
        textBgColor,
    } = options;

    const boxChars = BoxStyles[boxStyle];

    // --- 2. Prepare Separate Styles for Box and Text ---
    const boxFinalStyles = [
        ...(color ? (Array.isArray(color) ? color : [color]) : []),
        ...(bgColor ? (Array.isArray(bgColor) ? bgColor : [bgColor]) : []),
        ...(styles || []),
    ];

    // If text styles aren't provided, they default to the box styles
    const textFinalStyles = [
        ...(textColor ? (Array.isArray(textColor) ? textColor : [textColor]) : boxFinalStyles),
        ...(textBgColor ? (Array.isArray(textBgColor) ? textBgColor : [textBgColor]) : []),
        ...(styles || []),
    ];


    // --- 3. Calculate Content Width and Wrap Text ---
    let contentWidth: number;
    let textLines: string[];

    // Add this helper inside BoxText, right after the options destructuring
    const stripAnsi = (str: string): string => str.replace(/\x1b\[[0-9;]*m/g, '');

    if (Array.isArray(text)) {
        textLines = text;
        contentWidth = Math.max(...textLines.map(line => stripAnsi(line).length));

        // If a fixed width is requested, we use it instead of the longest line
        if (typeof width === 'number') {
            contentWidth = width - 4;
        } else if (width === 'max') {
            contentWidth = MAX_WIDTH - 4;
        }
    } else {
        // --- Existing logic for single strings ---
        if (width === 'max') {
            contentWidth = MAX_WIDTH - 4;
        } else if (typeof width === 'number') {
            if (width <= 4) throw new Error('Custom width must be greater than 4.');
            contentWidth = width - 4;
        } else {
            textLines = text.split('\n');
            contentWidth = Math.max(...textLines.map(line => line.length));
        }

        // Word-wrap if width is constrained
        if (width !== 'tight') {
            const words = text.split(/\s+/);
            textLines = words.reduce((lines, word) => {
                if (lines.length === 0) return [word];
                let lastLine = lines[lines.length - 1]!;
                if ((lastLine.length + word.length + 1) > contentWidth) {
                    lines.push(word);
                } else {
                    lines[lines.length - 1] = lastLine + ' ' + word;
                }
                return lines;
            }, [] as string[]);
        } else {
            textLines = text.split('\n');
        }
    }


    // --- NEW: Calculate Outer Alignment Padding ---
    const fullBoxWidth = contentWidth + 4; // Border(1) + Space(1) + Content + Space(1) + Border(1)
    let leftPaddingAmount = 0;

    if (boxAlign === 'center') {
        leftPaddingAmount = Math.max(0, Math.floor((MAX_WIDTH - fullBoxWidth) / 2));
    } else if (boxAlign === 'right') {
        leftPaddingAmount = Math.max(0, MAX_WIDTH - fullBoxWidth);
    }

    const outerPadding = ' '.repeat(leftPaddingAmount);

    // --- Build Box Components ---
    const centerAlign = (str: string, width: number): string => {
        const padding = Math.floor((width - str.length) / 2);
        return ' '.repeat(padding) + str + ' '.repeat(width - str.length - padding);
    };

    const styledTop = styleText(boxFinalStyles, boxChars.tl + boxChars.t.repeat(contentWidth + 2) + boxChars.tr);
    const styledBottom = styleText(boxFinalStyles, boxChars.bl + boxChars.b.repeat(contentWidth + 2) + boxChars.br);
    const styledLeftBorder = styleText(boxFinalStyles, boxChars.l + ' ');
    const styledRightBorder = styleText(boxFinalStyles, ' ' + boxChars.r);

    // Assemble lines with outer padding
    const styledContentLines = textLines!.map(line => {
        const centeredText = centerAlign(line, contentWidth);
        const styledText = styleText(textFinalStyles, centeredText);
        return outerPadding + styledLeftBorder + styledText + styledRightBorder;
    });

    const fullBoxString = [
        outerPadding + styledTop,
        ...styledContentLines,
        outerPadding + styledBottom
    ].join('\n');

    const pre = preNewLine ? '\n' : '';
    const post = postNewLine ? '\n' : '';
    console.log(`${pre}${fullBoxString}${post}`);
};

const CenteredText = (text: string): void => {
    console.log(CenterText(text));
}

export {
    Themes,
    Spacer,
    CenterText,
    CenteredText,
    CenteredFiglet,
    PrintLine,
    BoxText,
}
