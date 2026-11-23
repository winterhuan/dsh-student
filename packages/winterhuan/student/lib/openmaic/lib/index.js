import { createRequire } from "node:module";
import { defineTool } from "@deepseek-ai/dsh-tools";
import z from "@deepseek-ai/schemastery";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
//#endregion
//#region node_modules/.pnpm/@openmaic+generation@0.3.33/node_modules/@openmaic/generation/dist/interactive-libraries.js
/** Single source of truth for prompt URLs, CDN compatibility, and copied assets. */
const INTERACTIVE_ASSET_PATH = "/vendor/interactive";
const INTERACTIVE_LIBRARIES = [
	{
		package: "katex",
		license: "LICENSE",
		version: "0.16.38",
		compatibility: "minor",
		entry: "dist/katex.min.js",
		files: [
			"dist/katex.min.js",
			"dist/katex.min.css",
			"dist/contrib/auto-render.min.js",
			"dist/fonts"
		],
		aliases: {},
		cdnjs: "KaTeX"
	},
	{
		package: "three",
		license: "LICENSE",
		version: "0.160.0",
		compatibility: "minor",
		entry: "build/three.module.js",
		files: ["build", "examples/jsm"],
		aliases: {},
		cdnjs: "three.js"
	},
	{
		package: "chart.js",
		license: "LICENSE.md",
		version: "4.4.8",
		compatibility: "major",
		entry: "dist/chart.umd.js",
		files: ["dist/chart.umd.js"],
		aliases: {
			"dist/chart.umd.min.js": "dist/chart.umd.js",
			"chart.umd.js": "dist/chart.umd.js",
			"chart.umd.min.js": "dist/chart.umd.js"
		},
		cdnjs: "Chart.js"
	},
	{
		package: "@tailwindcss/browser",
		license: "LICENSE",
		version: "4.1.18",
		compatibility: "major",
		entry: "dist/index.global.js",
		files: ["dist/index.global.js"],
		aliases: {},
		cdnjs: void 0
	}
];
function interactiveAssetBaseUrl() {
	try {
		return process.env.INTERACTIVE_ASSET_BASE_URL?.trim() || "/vendor/interactive";
	} catch {
		return INTERACTIVE_ASSET_PATH;
	}
}
function interactiveLibraryUrl(name, file, baseUrl = interactiveAssetBaseUrl()) {
	const library = INTERACTIVE_LIBRARIES.find((entry) => entry.package === name);
	if (!library) throw new Error(`Unknown interactive library: ${name}`);
	return `${baseUrl.replace(/\/$/, "")}/${name}@${library.version}/${file ?? library.entry}`;
}
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/common/unicode.js
const UNDEFINED_CODE_POINTS = /* @__PURE__ */ new Set([
	65534,
	65535,
	131070,
	131071,
	196606,
	196607,
	262142,
	262143,
	327678,
	327679,
	393214,
	393215,
	458750,
	458751,
	524286,
	524287,
	589822,
	589823,
	655358,
	655359,
	720894,
	720895,
	786430,
	786431,
	851966,
	851967,
	917502,
	917503,
	983038,
	983039,
	1048574,
	1048575,
	1114110,
	1114111
]);
var CODE_POINTS;
(function(CODE_POINTS) {
	CODE_POINTS[CODE_POINTS["EOF"] = -1] = "EOF";
	CODE_POINTS[CODE_POINTS["NULL"] = 0] = "NULL";
	CODE_POINTS[CODE_POINTS["TABULATION"] = 9] = "TABULATION";
	CODE_POINTS[CODE_POINTS["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
	CODE_POINTS[CODE_POINTS["LINE_FEED"] = 10] = "LINE_FEED";
	CODE_POINTS[CODE_POINTS["FORM_FEED"] = 12] = "FORM_FEED";
	CODE_POINTS[CODE_POINTS["SPACE"] = 32] = "SPACE";
	CODE_POINTS[CODE_POINTS["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
	CODE_POINTS[CODE_POINTS["QUOTATION_MARK"] = 34] = "QUOTATION_MARK";
	CODE_POINTS[CODE_POINTS["AMPERSAND"] = 38] = "AMPERSAND";
	CODE_POINTS[CODE_POINTS["APOSTROPHE"] = 39] = "APOSTROPHE";
	CODE_POINTS[CODE_POINTS["HYPHEN_MINUS"] = 45] = "HYPHEN_MINUS";
	CODE_POINTS[CODE_POINTS["SOLIDUS"] = 47] = "SOLIDUS";
	CODE_POINTS[CODE_POINTS["DIGIT_0"] = 48] = "DIGIT_0";
	CODE_POINTS[CODE_POINTS["DIGIT_9"] = 57] = "DIGIT_9";
	CODE_POINTS[CODE_POINTS["SEMICOLON"] = 59] = "SEMICOLON";
	CODE_POINTS[CODE_POINTS["LESS_THAN_SIGN"] = 60] = "LESS_THAN_SIGN";
	CODE_POINTS[CODE_POINTS["EQUALS_SIGN"] = 61] = "EQUALS_SIGN";
	CODE_POINTS[CODE_POINTS["GREATER_THAN_SIGN"] = 62] = "GREATER_THAN_SIGN";
	CODE_POINTS[CODE_POINTS["QUESTION_MARK"] = 63] = "QUESTION_MARK";
	CODE_POINTS[CODE_POINTS["LATIN_CAPITAL_A"] = 65] = "LATIN_CAPITAL_A";
	CODE_POINTS[CODE_POINTS["LATIN_CAPITAL_Z"] = 90] = "LATIN_CAPITAL_Z";
	CODE_POINTS[CODE_POINTS["RIGHT_SQUARE_BRACKET"] = 93] = "RIGHT_SQUARE_BRACKET";
	CODE_POINTS[CODE_POINTS["GRAVE_ACCENT"] = 96] = "GRAVE_ACCENT";
	CODE_POINTS[CODE_POINTS["LATIN_SMALL_A"] = 97] = "LATIN_SMALL_A";
	CODE_POINTS[CODE_POINTS["LATIN_SMALL_Z"] = 122] = "LATIN_SMALL_Z";
})(CODE_POINTS || (CODE_POINTS = {}));
const SEQUENCES = {
	DASH_DASH: "--",
	CDATA_START: "[CDATA[",
	DOCTYPE: "doctype",
	SCRIPT: "script",
	PUBLIC: "public",
	SYSTEM: "system"
};
function isSurrogate(cp) {
	return cp >= 55296 && cp <= 57343;
}
function isSurrogatePair(cp) {
	return cp >= 56320 && cp <= 57343;
}
function getSurrogatePairCodePoint(cp1, cp2) {
	return (cp1 - 55296) * 1024 + 9216 + cp2;
}
function isControlCodePoint(cp) {
	return cp !== 32 && cp !== 10 && cp !== 13 && cp !== 9 && cp !== 12 && cp >= 1 && cp <= 31 || cp >= 127 && cp <= 159;
}
function isUndefinedCodePoint(cp) {
	return cp >= 64976 && cp <= 65007 || UNDEFINED_CODE_POINTS.has(cp);
}
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/common/error-codes.js
var ERR;
(function(ERR) {
	ERR["controlCharacterInInputStream"] = "control-character-in-input-stream";
	ERR["noncharacterInInputStream"] = "noncharacter-in-input-stream";
	ERR["surrogateInInputStream"] = "surrogate-in-input-stream";
	ERR["nonVoidHtmlElementStartTagWithTrailingSolidus"] = "non-void-html-element-start-tag-with-trailing-solidus";
	ERR["endTagWithAttributes"] = "end-tag-with-attributes";
	ERR["endTagWithTrailingSolidus"] = "end-tag-with-trailing-solidus";
	ERR["unexpectedSolidusInTag"] = "unexpected-solidus-in-tag";
	ERR["unexpectedNullCharacter"] = "unexpected-null-character";
	ERR["unexpectedQuestionMarkInsteadOfTagName"] = "unexpected-question-mark-instead-of-tag-name";
	ERR["invalidFirstCharacterOfTagName"] = "invalid-first-character-of-tag-name";
	ERR["unexpectedEqualsSignBeforeAttributeName"] = "unexpected-equals-sign-before-attribute-name";
	ERR["missingEndTagName"] = "missing-end-tag-name";
	ERR["unexpectedCharacterInAttributeName"] = "unexpected-character-in-attribute-name";
	ERR["unknownNamedCharacterReference"] = "unknown-named-character-reference";
	ERR["missingSemicolonAfterCharacterReference"] = "missing-semicolon-after-character-reference";
	ERR["unexpectedCharacterAfterDoctypeSystemIdentifier"] = "unexpected-character-after-doctype-system-identifier";
	ERR["unexpectedCharacterInUnquotedAttributeValue"] = "unexpected-character-in-unquoted-attribute-value";
	ERR["eofBeforeTagName"] = "eof-before-tag-name";
	ERR["eofInTag"] = "eof-in-tag";
	ERR["missingAttributeValue"] = "missing-attribute-value";
	ERR["missingWhitespaceBetweenAttributes"] = "missing-whitespace-between-attributes";
	ERR["missingWhitespaceAfterDoctypePublicKeyword"] = "missing-whitespace-after-doctype-public-keyword";
	ERR["missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers"] = "missing-whitespace-between-doctype-public-and-system-identifiers";
	ERR["missingWhitespaceAfterDoctypeSystemKeyword"] = "missing-whitespace-after-doctype-system-keyword";
	ERR["missingQuoteBeforeDoctypePublicIdentifier"] = "missing-quote-before-doctype-public-identifier";
	ERR["missingQuoteBeforeDoctypeSystemIdentifier"] = "missing-quote-before-doctype-system-identifier";
	ERR["missingDoctypePublicIdentifier"] = "missing-doctype-public-identifier";
	ERR["missingDoctypeSystemIdentifier"] = "missing-doctype-system-identifier";
	ERR["abruptDoctypePublicIdentifier"] = "abrupt-doctype-public-identifier";
	ERR["abruptDoctypeSystemIdentifier"] = "abrupt-doctype-system-identifier";
	ERR["cdataInHtmlContent"] = "cdata-in-html-content";
	ERR["incorrectlyOpenedComment"] = "incorrectly-opened-comment";
	ERR["eofInScriptHtmlCommentLikeText"] = "eof-in-script-html-comment-like-text";
	ERR["eofInDoctype"] = "eof-in-doctype";
	ERR["nestedComment"] = "nested-comment";
	ERR["abruptClosingOfEmptyComment"] = "abrupt-closing-of-empty-comment";
	ERR["eofInComment"] = "eof-in-comment";
	ERR["incorrectlyClosedComment"] = "incorrectly-closed-comment";
	ERR["eofInCdata"] = "eof-in-cdata";
	ERR["absenceOfDigitsInNumericCharacterReference"] = "absence-of-digits-in-numeric-character-reference";
	ERR["nullCharacterReference"] = "null-character-reference";
	ERR["surrogateCharacterReference"] = "surrogate-character-reference";
	ERR["characterReferenceOutsideUnicodeRange"] = "character-reference-outside-unicode-range";
	ERR["controlCharacterReference"] = "control-character-reference";
	ERR["noncharacterCharacterReference"] = "noncharacter-character-reference";
	ERR["missingWhitespaceBeforeDoctypeName"] = "missing-whitespace-before-doctype-name";
	ERR["missingDoctypeName"] = "missing-doctype-name";
	ERR["invalidCharacterSequenceAfterDoctypeName"] = "invalid-character-sequence-after-doctype-name";
	ERR["duplicateAttribute"] = "duplicate-attribute";
	ERR["nonConformingDoctype"] = "non-conforming-doctype";
	ERR["missingDoctype"] = "missing-doctype";
	ERR["misplacedDoctype"] = "misplaced-doctype";
	ERR["endTagWithoutMatchingOpenElement"] = "end-tag-without-matching-open-element";
	ERR["closingOfElementWithOpenChildElements"] = "closing-of-element-with-open-child-elements";
	ERR["disallowedContentInNoscriptInHead"] = "disallowed-content-in-noscript-in-head";
	ERR["openElementsLeftAfterEof"] = "open-elements-left-after-eof";
	ERR["abandonedHeadElementChild"] = "abandoned-head-element-child";
	ERR["misplacedStartTagForHeadElement"] = "misplaced-start-tag-for-head-element";
	ERR["nestedNoscriptInHead"] = "nested-noscript-in-head";
	ERR["eofInElementThatCanContainOnlyText"] = "eof-in-element-that-can-contain-only-text";
})(ERR || (ERR = {}));
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/tokenizer/preprocessor.js
const DEFAULT_BUFFER_WATERLINE = 65536;
var Preprocessor = class {
	constructor(handler) {
		this.handler = handler;
		this.html = "";
		this.pos = -1;
		this.lastGapPos = -2;
		this.gapStack = [];
		this.skipNextNewLine = false;
		this.lastChunkWritten = false;
		this.endOfChunkHit = false;
		this.bufferWaterline = DEFAULT_BUFFER_WATERLINE;
		this.isEol = false;
		this.lineStartPos = 0;
		this.droppedBufferSize = 0;
		this.line = 1;
		this.lastErrOffset = -1;
	}
	/** The column on the current line. If we just saw a gap (eg. a surrogate pair), return the index before. */
	get col() {
		return this.pos - this.lineStartPos + Number(this.lastGapPos !== this.pos);
	}
	get offset() {
		return this.droppedBufferSize + this.pos;
	}
	getError(code, cpOffset) {
		const { line, col, offset } = this;
		const startCol = col + cpOffset;
		const startOffset = offset + cpOffset;
		return {
			code,
			startLine: line,
			endLine: line,
			startCol,
			endCol: startCol,
			startOffset,
			endOffset: startOffset
		};
	}
	_err(code) {
		if (this.handler.onParseError && this.lastErrOffset !== this.offset) {
			this.lastErrOffset = this.offset;
			this.handler.onParseError(this.getError(code, 0));
		}
	}
	_addGap() {
		this.gapStack.push(this.lastGapPos);
		this.lastGapPos = this.pos;
	}
	_processSurrogate(cp) {
		if (this.pos !== this.html.length - 1) {
			const nextCp = this.html.charCodeAt(this.pos + 1);
			if (isSurrogatePair(nextCp)) {
				this.pos++;
				this._addGap();
				return getSurrogatePairCodePoint(cp, nextCp);
			}
		} else if (!this.lastChunkWritten) {
			this.endOfChunkHit = true;
			return CODE_POINTS.EOF;
		}
		this._err(ERR.surrogateInInputStream);
		return cp;
	}
	willDropParsedChunk() {
		return this.pos > this.bufferWaterline;
	}
	dropParsedChunk() {
		if (this.willDropParsedChunk()) {
			this.html = this.html.substring(this.pos);
			this.lineStartPos -= this.pos;
			this.droppedBufferSize += this.pos;
			this.pos = 0;
			this.lastGapPos = -2;
			this.gapStack.length = 0;
		}
	}
	write(chunk, isLastChunk) {
		if (this.html.length > 0) this.html += chunk;
		else this.html = chunk;
		this.endOfChunkHit = false;
		this.lastChunkWritten = isLastChunk;
	}
	insertHtmlAtCurrentPos(chunk) {
		this.html = this.html.substring(0, this.pos + 1) + chunk + this.html.substring(this.pos + 1);
		this.endOfChunkHit = false;
	}
	startsWith(pattern, caseSensitive) {
		if (this.pos + pattern.length > this.html.length) {
			this.endOfChunkHit = !this.lastChunkWritten;
			return false;
		}
		if (caseSensitive) return this.html.startsWith(pattern, this.pos);
		for (let i = 0; i < pattern.length; i++) if ((this.html.charCodeAt(this.pos + i) | 32) !== pattern.charCodeAt(i)) return false;
		return true;
	}
	peek(offset) {
		const pos = this.pos + offset;
		if (pos >= this.html.length) {
			this.endOfChunkHit = !this.lastChunkWritten;
			return CODE_POINTS.EOF;
		}
		const code = this.html.charCodeAt(pos);
		return code === CODE_POINTS.CARRIAGE_RETURN ? CODE_POINTS.LINE_FEED : code;
	}
	advance() {
		this.pos++;
		if (this.isEol) {
			this.isEol = false;
			this.line++;
			this.lineStartPos = this.pos;
		}
		if (this.pos >= this.html.length) {
			this.endOfChunkHit = !this.lastChunkWritten;
			return CODE_POINTS.EOF;
		}
		let cp = this.html.charCodeAt(this.pos);
		if (cp === CODE_POINTS.CARRIAGE_RETURN) {
			this.isEol = true;
			this.skipNextNewLine = true;
			return CODE_POINTS.LINE_FEED;
		}
		if (cp === CODE_POINTS.LINE_FEED) {
			this.isEol = true;
			if (this.skipNextNewLine) {
				this.line--;
				this.skipNextNewLine = false;
				this._addGap();
				return this.advance();
			}
		}
		this.skipNextNewLine = false;
		if (isSurrogate(cp)) cp = this._processSurrogate(cp);
		if (!(this.handler.onParseError === null || cp > 31 && cp < 127 || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.CARRIAGE_RETURN || cp > 159 && cp < 64976)) this._checkForProblematicCharacters(cp);
		return cp;
	}
	_checkForProblematicCharacters(cp) {
		if (isControlCodePoint(cp)) this._err(ERR.controlCharacterInInputStream);
		else if (isUndefinedCodePoint(cp)) this._err(ERR.noncharacterInInputStream);
	}
	retreat(count) {
		this.pos -= count;
		while (this.pos < this.lastGapPos) {
			this.lastGapPos = this.gapStack.pop();
			this.pos--;
		}
		this.isEol = false;
	}
};
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/common/token.js
var TokenType;
(function(TokenType) {
	TokenType[TokenType["CHARACTER"] = 0] = "CHARACTER";
	TokenType[TokenType["NULL_CHARACTER"] = 1] = "NULL_CHARACTER";
	TokenType[TokenType["WHITESPACE_CHARACTER"] = 2] = "WHITESPACE_CHARACTER";
	TokenType[TokenType["START_TAG"] = 3] = "START_TAG";
	TokenType[TokenType["END_TAG"] = 4] = "END_TAG";
	TokenType[TokenType["COMMENT"] = 5] = "COMMENT";
	TokenType[TokenType["DOCTYPE"] = 6] = "DOCTYPE";
	TokenType[TokenType["EOF"] = 7] = "EOF";
	TokenType[TokenType["HIBERNATION"] = 8] = "HIBERNATION";
})(TokenType || (TokenType = {}));
function getTokenAttr(token, attrName) {
	for (let i = token.attrs.length - 1; i >= 0; i--) if (token.attrs[i].name === attrName) return token.attrs[i].value;
	return null;
}
//#endregion
//#region node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/decode-codepoint.js
/**
* C1 Unicode control character reference replacements (code points 128–159).
* Index i gives the replacement for code point 128+i; 0 means "no replacement".
*/
const c1 = [
	8364,
	0,
	8218,
	402,
	8222,
	8230,
	8224,
	8225,
	710,
	8240,
	352,
	8249,
	338,
	0,
	381,
	0,
	0,
	8216,
	8217,
	8220,
	8221,
	8226,
	8211,
	8212,
	732,
	8482,
	353,
	8250,
	339,
	0,
	382,
	376
];
/**
* True for NUL, UTF-16 surrogates, and values past U+10FFFF.
* @param codePoint Unicode code point to check.
*/
function isInvalidCodePoint(codePoint) {
	return codePoint === 0 || codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111;
}
/**
* Replace the given code point with U+FFFD if it is NUL (0), a surrogate, or
* outside the valid Unicode range. Code points in the C1 controls range
* (128–159) are remapped to their Windows-1252 equivalents, following the
* HTML spec. All other code points are returned unchanged.
* @param codePoint Unicode code point to convert.
*/
function replaceCodePoint(codePoint) {
	if (isInvalidCodePoint(codePoint)) return 65533;
	if (codePoint >= 128 && codePoint <= 159) return c1[codePoint - 128] || codePoint;
	return codePoint;
}
/**
* XML numeric character references are the referenced Unicode code point.
* Invalid values still become U+FFFD; the HTML Windows-1252 C1 remap is not
* applied.
* @see https://www.w3.org/TR/xml/#NT-CharRef
* @param codePoint Unicode code point to convert.
*/
function replaceCodePointXML(codePoint) {
	return isInvalidCodePoint(codePoint) ? 65533 : codePoint;
}
//#endregion
//#region node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/internal/decode-shared.js
const BASE91_INVERSE = /* #__PURE__ */ (() => {
	const table = /* @__PURE__ */ new Uint8Array(127);
	let code = 0;
	for (let char = 33; char <= 126; char++) if (char !== 34 && char !== 36 && char !== 92) table[char] = code++;
	return table;
})();
/**
* Decode a dictionary-encoded trie string back into its Uint16Array.
*
* Stream layout (consumed in this order):
*   1. dict1 atoms — `dict1AtomCount` uint16 values, delta+RLE encoded.
*   2. dict2 atoms — `atomCount - dict1AtomCount` values, delta+RLE.
*   3. dict2 ngrams — `ngramCount - (dictSize - dict1AtomCount)` entries,
*      each a pair of slot codes that resolve to earlier slots.
*   4. dict1 ngrams — `dictSize - dict1AtomCount` entries, same shape.
*   5. data — slot codes, each expanding to one or more uint16 values.
*
* Codes use a 91-char base (printable ASCII minus `"`, `$`, `\`):
*   - char1 < dictSize  → 1-char code, slot = char1
*   - char1 ≥ dictSize  → 2-char code, slot = dictSize + (char1 - dictSize)*91 + char2
*
* Slot index → token kind:
*   [0, A)                  dict1 atoms     (1-char codes)
*   [A, dictSize)           dict1 ngrams    (1-char codes)
*   [dictSize, dictSize+D)  dict2 atoms     (2-char codes)
*   [dictSize+D, end)       dict2 ngrams    (2-char codes)
*
* Both atom dicts decode before any ngram, and dict2 ngrams decode before
* dict1 ngrams. So every ngram entry references slots whose contents are
* already filled — no forward references to handle.
*
* This runs on library import. Flat typed arrays store each slot as either
* a plain value (`single`, covering every atom) or a range in a shared
* `pool` (ngrams).
* @param input Packed trie string.
* @param resultLength Expected number of uint16 values in the output.
* @param atomCount Total number of distinct uint16 values in the trie.
* @param dict1AtomCount Atoms in the 1-char range (`A` above).
* @param ngramCount Total number of ngram entries (dict1 + dict2).
* @param dictSize Number of 1-char code slots; the rest of `BASE - dictSize`
*   first-byte values are 2-char codes.
*/
function decodeTrieDict(input, resultLength, atomCount, dict1AtomCount, ngramCount, dictSize) {
	const base = 91;
	const inputLength = input.length;
	const twoCharBias = dictSize * 90;
	let pos = 0;
	/** Read one slot code at `pos` and return its slot index, advancing pos. */
	const readSlotCode = () => {
		const c1 = BASE91_INVERSE[input.charCodeAt(pos++)];
		return c1 < dictSize ? c1 : c1 * base - twoCharBias + BASE91_INVERSE[input.charCodeAt(pos++)];
	};
	const dict2AtomCount = atomCount - dict1AtomCount;
	const slotCount = atomCount + ngramCount;
	const single = new Int32Array(slotCount);
	single.fill(-1, dict1AtomCount, dictSize);
	single.fill(-1, dictSize + dict2AtomCount, slotCount);
	const start = new Int32Array(slotCount);
	const length = new Int32Array(slotCount);
	/**
	* Decode `count` ascending uint16 values from a delta+RLE stream into
	* `single[off..off+count)`.
	*
	*   code < 89   → delta = code
	*   code == 89  → run-length: next char encodes runLength-2; emit `runLength` consecutive +1 values
	*   code == 90, next < 90  → escape: delta = 89 + next * BASE + after-next
	*   code == 90, next == 90 → double-escape: extra char for very large deltas
	* @param count
	* @param off
	*/
	function decodeDelta(count, off) {
		let previous = 0;
		let slot = off;
		const end = off + count;
		while (slot < end) {
			const code = BASE91_INVERSE[input.charCodeAt(pos++)];
			if (code < 89) {
				previous += code;
				single[slot++] = previous;
			} else if (code === 89) {
				let runLength = BASE91_INVERSE[input.charCodeAt(pos++)] + 2;
				while (runLength--) single[slot++] = ++previous;
			} else {
				const next = BASE91_INVERSE[input.charCodeAt(pos++)];
				previous += 89 + (next < 90 ? next * base + BASE91_INVERSE[input.charCodeAt(pos++)] : BASE91_INVERSE[input.charCodeAt(pos++)] * 8281 + BASE91_INVERSE[input.charCodeAt(pos++)] * base + BASE91_INVERSE[input.charCodeAt(pos++)]);
				single[slot++] = previous;
			}
		}
	}
	decodeDelta(dict1AtomCount, 0);
	decodeDelta(dict2AtomCount, dictSize);
	const references = new Int32Array(ngramCount * 2);
	let poolSize = 0;
	let ngramIndex = 0;
	/**
	* Read `count` ngram entries (each = 2 slot-code references) for the slots
	* starting at `startSlot`, recording references and assigning pool ranges.
	* @param count
	* @param startSlot
	*/
	function readNgramReferences(count, startSlot) {
		for (let index = 0; index < count; index++) {
			const slot = startSlot + index;
			const a = readSlotCode();
			const b = readSlotCode();
			references[ngramIndex * 2] = a;
			references[ngramIndex * 2 + 1] = b;
			ngramIndex += 1;
			start[slot] = poolSize;
			const entryLength = (single[a] < 0 ? length[a] : 1) + (single[b] < 0 ? length[b] : 1);
			length[slot] = entryLength;
			poolSize += entryLength;
		}
	}
	readNgramReferences(ngramCount - dictSize + dict1AtomCount, dictSize + dict2AtomCount);
	readNgramReferences(dictSize - dict1AtomCount, dict1AtomCount);
	const pool = new Uint16Array(poolSize);
	let write = 0;
	for (let index = 0; index < ngramIndex; index++) for (let half = 0; half < 2; half++) {
		const source = references[index * 2 + half];
		const value = single[source];
		if (value < 0) {
			let read = start[source];
			const readEnd = read + length[source];
			while (read < readEnd) pool[write++] = pool[read++];
		} else pool[write++] = value;
	}
	const out = new Uint16Array(resultLength);
	let outIndex = 0;
	while (pos < inputLength) {
		let slot = BASE91_INVERSE[input.charCodeAt(pos++)];
		if (slot >= dictSize) slot = slot * base - twoCharBias + BASE91_INVERSE[input.charCodeAt(pos++)];
		const value = single[slot];
		if (value < 0) {
			let read = start[slot];
			const readEnd = read + length[slot];
			while (read < readEnd) out[outIndex++] = pool[read++];
		} else out[outIndex++] = value;
	}
	return out;
}
//#endregion
//#region node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/generated/decode-data-html.js
/** Packed HTML decode trie data. */
const htmlDecodeTree = /* #__PURE__ */ decodeTrieDict("!}.&u%}'&}*'~!6*)%&,~!J~!J~%L~y<~!R,~~%Lu~~#GD~~#|)1#%}^%}2%+#.##%##%}&%##%'#%##&%#%#'%#&#%#&#'#%%#&#%##%#)%''%&%#%#'%#%%#%%}%%%#%#&(23#%%#&-%0%('1#(##%#'##+%'*.:1}#%#6-+(%'%%#%%%}#L'2351&('%}&/N'(0(/*-%(%%}#'+&T%7.2}#&%&#%#36/5##%&%%#&#%%#))2%%##%&&'0~!#*+&'%1~!%).'3q?&%'1~!.##%6(~!+%%%(Gw'rT~!E#<nA%#jZ~!H%(~!42##~!*31&~!G%U~#)5~#`3~!J~!Z~%]~%Y~%C~!q~!u~#kz~%#~!6'~!D~!U~!?~#T~!c%~!G#'~%7|~!G~!J~!G&~#pb~(Df}#%}*&}#%##%##%##&#-}&'#'&%#.++}%mI,#,@&(}*%}*'%&##&#%##%}&0}#.},U},%}+%}&%}#%##&}B%(}(%}+%)})%##%#&}&%##%&}<%}>%#%&}*%}(%}9%}/%})%}*%}*%}?&}&%}3%}&*#%})%#%#)}#&#-#+*%E%%'%'#%}#*V##&##I}#&&##%&%#&&Qf%%))w/0+&%#(#.%-''''++++7}>%4'',##1,#%#&%##&#'##&#*#9)%&%}#*}%,#+P(%A&%#'&##wSD',9E00#y#@}(+}&%&>~!#~!X}#*}(&&}(&}(,%}%&#+&}#&}I%#%}%)#(},'%#*}4%%#%}(''}#/##(##),%-##%%)#&}(.}&%#&}%%}*&#%},&&}&%}#%*'#%})%}D&}&%}-&}6&#&}-,%}#%})-(~+`~,=?~I9'9%~!,#%})%})%}@%}?%}(~!?~#<~#pP~#BG~#=1#%K+~#?#~%;)~#A~#mF1~#A'~'X%'~#lR~#N~'N~#r~#m#-~#i'?%#'%~#B%##%,%#~#_%#0%~#]732~,w~2+#:&#%&'0%&>%}#>##F+)#%&&#(+_}4&}-%}(&}@&}O7Fdf0@+/v4}&WU##&/0#&'('B#%}.%}'+#%}#%%&#&%#%##+#&#)#6#'#.},%}c%},%#%##%&#&%#&~#>'*-.%##%##%}#%%}%'~#)D1}#%*&~#_%%'(~#S2%'.}#~#=##*'*-%}&'%'##&&~'E%.#&~#M4}%%##&'%#~#O1##%&#'+~#<B%##%%'%+~#;#@%}#&%#&&%#(~#H1}'%'##&&~#?A}&'~#D#%32}'&&&&~#[}'(#%}'~#;C})&}%%#%~#=&%,3}%'(#%%~#^'#&&)#%'~#Y%-~#d-%'~#^%%&#&&&}#~#b~2t*&'~&(~&@~0%~e~3}%*''0})&}+~!9##-}#%-hD*)1fC#%/&/fB#40~!+#)*4~!+~!K'&:~!/*7~!.#~!H~!L':~%x&~!H#~!*~%1~!I#~!+A~#p'~!F~~#-#~,,(~.Z~!V~%;'B'mq-W~!N~%I%#&&#&}#%},%%}'%}+X#%}#&}(%}'%}<%}#%}%%'}'%}:~![)9@~%>~#UA%-%##&~!C%~!-.9:~!1~!-^2/:a~!y,D*J#-5)/4~%23,~#G~!L1~!0X3`~!2+~!!0-~&E~!W~!o,>Y&]~%cZx_&~#O*9#A#'#+I'%#)~!0B*-5A+-((F&*M#)(-7-5+'-3a5Vi~!Y~!?+[)%3),ERHm~!+:D,VG.+)?fB%%*(%)'(#&80%1'8`K8?`+'Z#&O&'H5#*9)A%%5&3))0%39+.*7#()&&*=4@**L)<'_&*+..;(#*+)./&0#3)%')-8(4ixD(&.}%,('aI:,)%,k2231T)I'#/-W7,/'Q#.'Y24+h')37</31&83##&0#),H(?'&?/1##%#&&#%''-%&&&#(&''&#.-'%#%%(,')*'&#&#'##%(%(#%('#&##%%%%('%#%#%%#%#&%##h>w+v<ayvyvcg.uuhKr}g/v|g>u9i[~>g5uI~=RvdwEg;v/g;uk!!TTSx]@RT!U!#!@VBRUU!'UTe-d0c`e&gSdicedFcrdTaqb.kYcAohdYd@a3e+d}dMdtd.aJ#bqcK`dle/e.e'dwdPdodddjbEb}ogd^ofdpduc6j?l%d{drdqc)d7bacOdQ%T#Y)X.sR[yH>6Vyv3[xwLu>vo'!*.[yBacahoj>6Rew3[xqdZa#!a&#^(X-[yG>6Vyu3[xvg3sEr|g.u/Ri9db0T#^(Xa)!-[y;>6Vylg4wKs{JwNZt3@3r=c4Z([xlg;wKt!cpq's@v7A'*a(a+!-a#[y<3Dt?3Dt'>6Vym3[xmg9rxsNJwLZt4~?r?db1T#`-!(Xa,!0[yS>6Vz%NuQs.g4wKtnJwNZtS@3r>c4Z([y%g;wKtrdga8!a(!#&T*Y-Xa#!a0<or[yc3Dtq>6Vz43[y3JwNZtf@3s!Ju}!%Dti:pm3c_%X#tjB5pkd6q!r]u?voC'*-a.a2!0a&a+[yI3DtI3Ds~3DtH>6Vyw3[xx;:s#~<5pKJwNZtE@3r~d`a)!a2T#a.(!+U.X1[yT3Dt`3Dtv>6Vz&3[y&g9rxwzcxstPu.<rAJwLZtT~?r@dZa%!a.&^*Za(/Reu[ya>6Vz23[y1g3sEr}wkg{NuQRg{ci(U#5@b`~,cg#U(2WnH5wugcRh7dX#T(Y,a'Ta!!a,[yZ<]mj>6Vz,3[y+Pv#5ReZKu+=,%!H}7ABwkaS?Rh:BcW(X#<]mrj:ubv/ARekdg%!(!a.*Ta(Y.X1!#sP>Rl*Dt6[y>>6Vyo3Wf*jOvuumvuRgRJuq*!:9<B@bX~3jVv&v@s@5Re[d/rQt{uAvo&a&a*)a2!,0Wf!3Dt0=Bs'>6Re}3[xy~<5s%JwJZt1~Gs)c;&!#2sJkNuXvzq7rxu,Re8dka4!a8(aEZ+a@Y.X1Xa)[yd=Bs(3DtP>6Vz53[y4cX#X&Re:avRe9~<5s&JwJZtQ~Gs*i^rzvdRg+Jv{%!2sbB@bX}kdga,!Za?&^*T1/!a'Dt+[y6>6Vyf3Wf%g/u;s4hGu6?Rh-JvZ,!c%#&RoX54Rivj7uyvf8RgTKvZB%*!2sGh<vu5Rgq<=C::9bb~#dZ#T&Ta6Y.X*Dt>[y93Wf)coZ(T,6VyifluvRgC@95@B@bX~/hFu34cC#T,k/unq8w8Q5RkUklwQuzunq8w8Q5Rk8d/rJu?v8w9)-&!a0a;a&aIWejg3sEr/h1s<DtDJvyZqY5aws3Jvy!&Wei~Hr1:au5@Bag>23E~5c:Z&bX};kKv?w&unuVu5Rjc;>bs)#~@:Rh.=ay<a]C;b`}Vd6s/t{uAvoaxa()!a,a7%-a#a2Dt,[yF2Wo[>6Vyt3[xuNuPRi&NuPwpi#RoWh?vf8Ri%Jv]!%Ri:KvxD!.'2WeAjZu`q9rxu,Re7woeAg-unLq(qA_/*2Wg_g3u5q^9:4E}/jTrxrzv=Wkkd~0UX#^^Xa-a1a5T&a=U1a'*aEa]!a*aPaA-adok[y54Rn>;:p3~Dp5g9rpsFNvZqjg3uJp4~<5p0Pw;5qlJwNZt*@3p1Pw:5p/Ou!5p2JvG'!6Vye=<qnJvh_[xhg3v,Rh3kOwOw-sDuev/Re^dha[a%!%!a+#Ta7)-5TaCaO!aka!a)sf[yb2>Rl!9ARiq5E}Qg=ucRkBE|oJrJ_@Wk~@Wk{JrJ_@Wk|@WkyJrJ_@Wk}@WkzJvO_[y2g-vMRmiKuYC!)&>Ri;>Ri<@3RkNc](X#@9Rk=g5vuRmhKvDB!+'=]meg3u4Rmgd)#Y'Vz3CARmfd`a+!%T'!+#Ta1Ta6TaM-sTDt9[yA9sYd'%Y#s[[xpj:ueunaXRgEjRq,v-vuqdd2'`#6Rev<32@5>:2<E}5xIo9a*X#Y(;5RePJvD_g>vyRgNj8w)v8<wggs:RgXiZt|vjx,hSq3ah!-(~@:Ro/Ou!5RhWj^v(pyw8unRhUdx-UY#^Ua.a3a70!)%UX1TaDa)'omRiRRhE[y:3Dsz=Br,>6Vyj3[xkg6ruwjcqsrPw;5r*Ku]D'Zt-@3r(~?r.i[vwv]dU1a--U#`a4(g/vsRhPOu!5RhLj:rmu9Wo!~@:wdh@g/vsRiTjXuvvNr}:RhBj^v(pyw8unRn]dz1UYa'a+^Y(!aETZalaRY.Ta?a4[yDJw1!#qLsW>6Vyrfzq-pLflpwRe|Js>%!Dt@3Dt&Jvy_[xs~HrnjMuwpsw'RecKu+D#'!t<~Grl~?rjg5u-x,gwp{ah!-(~@:Rg~Ou!5Rh'jXuvvNr}:Rh#cW#X/c;&!#2sLi[v7u7RgpJv)(!iLrxu,Re6j7v@s@5Se[e7d`aW!Za(a`T.a#!a3!&aDa-!9)Dt_=6s+3[x~~DR|h~DS6avhGun5RkZj3w)v-]mkKunB!&*]kb97R|i<ARk<c:Z(6Vy}Juh'!wziMRoS:F|vkLuauJv5vtvQRh1d='T+Y#VyO~DR|jcF#T'7R|g97R|kJv3'!ay<Rj,Jvh&!:ReXcsa6*a+#a#_aIRf9aLRf?c,Z&Rf5Rf7c.Z&Rf;Rf>cQ#%T'p-Rf8Rf=ct#%'(*!,p,Rf4p+Rf6Rf:Rf<d~'Ua%U*^UYa(!a,-!#a4YaTalaEX0a8a<Weo3Dt/3Dsx=Br93Wen~Dr;~<5p<JwNZt2@3p=Pw:5p;Ou!5r3c7&!#:p>3Ds}KvGB)_6Vyk2sM=<r7x'eovA(!hFu1ARf}cV#X&@r5j6rvwQa^Rf3c=Za'wkghJv__g;unRggA53B9=b^}%j6uduo5Jq;!(hIv%2Re`Ou4ARe_e%a#^^^Xa&!a*a2!&a6YaP!*ad!#a:aE/5Rn?[y@>6Vyp;:pE~DrY~<5pBJwNZt8@3pCh=rt3rWPw:5pAJup_[xoNuPpF9c!#'45pD5ARn)d8#X'X*3@rU72s]h>v<<sSjJpqvewOJq/(!hNw'5ReBk0s2u3w/w'5ReE5@Jq.!a+JQ!&WeU23d(#Y&RjG5]jBk!u7w&u0udARjEe#+^^^Ub#!a2/a`Z(agT1!a-a;|@TaG!aS[yV=Re~fow'RguNuPRe?bz#'>RoUWeL>:Cbb|?JwPZtVg6ruRmzJvD'!6Vz(g/vmRh~Jvy_[y(g9voRgyx*cy(#2>Ri2B9b]~9kIw9u7rluJu3Rg]dI#a%UY'@=p%CAx.gQZ&RhwwygtRm{x5g_Z'+ABqR9Woa=Bp&dV#^*Xa'!&@o{g4v]Rk;Jv{!%Rk[wkkiA5RkiwwfUB=x,fUuqC&*!>RfTg8v0RfV~ARfSd;rJsAuAv9wR'ae+/aO!a@aza/a#[yQ@Wg!2Wemg3sEr0JvB_g>uvReWg2v+Re=KupB_+[y!2AbY~-~Hr2AJwD!(h<~El>h<~El?Kun@+_:9b`}Kg-v/Ri3g;vtwyk_9]k_d=&T#*U.6qh@Ab`|K9:H|CJv[!&3Dtex'fDwC%!Rf[9WlMd[(^X,!a%Z06Vz!@WgBg=v~Rgvg,QRe@awd,#Y+jTv|Q~EfWj]uNr|~FRfXdy#Y&^Ua%!aO.!(a)Ua;=!a@aKap!a-,a!Ta]a[rSa]p?[y82sK=Bq~;:p:~<5p8Pw:5p7d'#Y'Wf(;RnRi[u4w&RgJJvG'!6Vyh=<r#ijuuv/sIKuYD'ZtG@3p9~Gr&d2#`(g<vtRgFj`u5w&rqpxRf2CJuY!+:wfnTOu!5Rg}jNs1ucv&RfwJvA!&3@q|BDcC#T,k/unq8w8Q5RkTklwQuzunq8w8Q5Rk9dga#!a'!a=#a0!:+Tb*b@aO.a4!aba8aFJv^}?!VyR~Dr<g;u%Rn.~<5p[x'e`wNZtR@3p]Pw:5pZhNvjBp.woe_g5u-r4JwF!%DtO3:ooc7&!#:p^3DtpLuGw(!+%)Dtk6Vz#2sd=<r8d'#Y([y#<x3gJt`w@!)%}MRiowzikRij=]ilxAf3,U(#B2Rf#g0v-Rm[ck{`U#]giKv3>)!&6Ri154s,KuGB_%@r68r:dJ|t`#X(9<E|u2@H|rx3gJu?w'!+'1Nu7Reg4=H~+9<wxgY95Rm]xLggZ-`(X}U2:Ri4h<uOawRmsJv__5@bb{jbV~3dka#a'a]!,#a+U=a>b6a3b%!/aKa/)!arwve^VyJ;:pR~DpTg3uJpS~<5pOPw;5qmPw:5pNOu!5pQJvG'!6Vyx=<qoJvA!{~Jup!%@qk7Rn/KvyD!}''[xz;>wkh'?Rh,x8gyt`w5D!&),(SgyccRgztJ@3pPB5p#d'(Y#<]mmifubw&RgoJvE&!82s^JvF&!8Rf,ADb]~;x=h'rNu]vK!,%'*0RnORh)4Rh*AqQg-vaRnNg;wHwkh'ba~4cE#Ta*x3gctyw@'!+%RnFRnD<4Rn@hFvK5RnCxWg[#`&a0Ua()`1Rm75Rg[c]%X#qi8Rg^NvdRj>BwzgZauwji7Rm6A4wgg]d1#&(*,.0a#Rm;Rm<Rm=Rm>Rm?Rm@RmARmBe%#^^^Xaea?aC/b+(,!a+a#!a/!>a&Ta<aKbD!2wphBRnk[yPw}hE|.=Br-3Dtm>6Vy~g6urRf.x,hPrNav!%'RnqRo%Ro#Nu;q[Pw;5r+JwNZtM@3r)d'#Y'Weh;xChL#`&RnmRnoKu}>%(!Rne~Bs-;2wjcussJv+'!aYSO}6@B<5?ba~8LrNvj!.%*ROwungw~ng~:9;Ri^>wtnig;wHRnixDh@|(UZ.x1h@|)!#:2<H|*xHn]#-UX'3Ro)z=iT}6ARns=Bwsn_wpnaRncw]aR(#UXa&Ua*a/=]iPd'#Y&Ro'WnXf{QRm2hNvj]nZd`'T~&1`{|`#9b]{}c:'!#Wl{>@=be}]?cl{{U#:5Abb}Jds#^YaF!a*b4a#a3aPa>&Tb!bH!*a_!Eau?/a&RjY<]gj>6Vz*;:pe~DrZg,QRj1JwNZtX@wihspcJvZ&!VyX9WmOJu|!|N2WmHJvh&!]ht~Bpbcn&T(!#RmQ<s7Nu;padH#X'`+WmJ@>RmKCARhnKup=!)&Wf+:RhqNuPpf9c!#'45pd5AwghpARn(Ls@w!%,)!RmP@Wfe<E|IJva!&WmNg8vsRmLd`*.`#Y'Xa!axRn*]hrA8Rhug5s@rXg8u!RmMd8#X'X*3@rV72smdI*#UY&RmICARho~GsgxVgd)Ta'U-Y&Xa!T#RnEWnA@Wffg1uDRi0hFvK5RnBxGnG&#`%owp)@wsf+bX}Ze-*1!a*^^^Ua|!#a.aq&Ya2!a>.a6!a:aO`aJDtL[y`@Wg#>6Vz12@wzoYRoZNuPRi!NuPRhzg=ucRi,@=b`{Yg=ucRi-ACJvB!&Sh[ebSh]ebi`wUuFRm4Jw2_[y0JvB!.<Ju(!&SoG}6Shd}6<Ju(!&SoH}6She}6Kur@._g5vHRieJvx!{L2G{Kx6gd'T#?Rh82Wi5cZ#X(g1w)Rm5dW-Y(Ta#!a)!#aYa=wnfE=su2>>bU{0j9udv:<svj8uQv-7RgHdE%#^'sq9sp=>Bb_{TJv`!&g/r|snj6v(us5d,#Y(56H}[978H}]Jw5!&g1rushJvB!+j;v{u5?zDhd}6}bj;v{u5?zDhe}6}ce*#`(^^^a[aea!=!a6a*aoXb1a.!aAbL!b>,b'aL!aV@Wf|2Wlg3[y/JwNZt^@3piPw:5pgJunZou3@rsJva&!Vy_g<v~Rm#JvG'!6Vz0=<r{Ju{%!:pj@WfsiXuJu3Rm:JvZ&!WfA~Bph@c4Z&Dtwax5rubx(#:awRk1@d,#Y&RfjRfid1#,Y(@Wfp2Wlrg5s@ryKu[@!,'=]ig9wlk?Rk>g5u-rqJvy'!@9RkQcH(T#=>Ri~@<wkj(Wj(KuZB*!&<7rw@9RkRcH(T#=>Ri}@<wkj)Wj)dg(Ta2Xa9X#`-!a*CARhg@@=I}d9x;c~#X%so=<sj>2@@=aybb}XjWv0Q~EfEj3vLv;<d,#Y(56H}`978H}_dgaPaFa'a/!#a3Y0a_a;a|!1(a7-[yE3[xt;:pJNvZrrg3uJrvJwNZt=@3pIh=rt3rxPw:5pGOu!5rpJvG'!6Vys=<rz@c4Z&Dt(ax5rtJvZ!&~BpH@wsfNg-vaRlNci*U#=<wei<F}a5@Jq.!a*JQ!%@qZ23d(#Y&RjH5]jCk!u7w&u0udARjFd/prq=tyvpaEa(a:.!a1aZ(@@=I}:9wpd%=<sX55w_h}@@=I{t=ay<aU@@=I}T=ay<2@@=I})?C9:9au@9Cb]}DP~=x-fAZ(2Wl1=ay<aU@@=I}>5@d##Y+jTv|vV~EfFj]uNpn~FRfGdgaK!Z2&!a8a-Tb({E!acTbM*!a(DtY[yYd'%Y#sl[y*hHvh>Re5x2c{Z}.j4uCvcawRiMd+#X+_x&d!},<5RkX;2Hzw@x,gavfB-!{CcF&T#Roe;RodwWbBg5urRgaKvHC*_6Vz+<4opieuew&Rmq@d]&Y)X,T#X0Rh}<BqP=4qS9:ReMg/ujReNJw0!/<Jui%!bd{kawwnemRelAxUa?a3#*.&UX(Ya+a/RhvRnQ<o}9Wmtd-#Y&RgSRmw9;Rmxay=Rmyg-vaRmuxEhSrNu,v-voC!%(aR.a(a7+1Ro1>Ro5CE{A9b]{@;5x#eO{:g;urRi+KrNA!%(Ro3>Ro79;Ri_Ku@>{;&!x%gX|{KunA_+g5QRj/g3u5Rj#g>uERj%wio/xRhS&!,!#^1U}wba{8>>@=be}qC@:D5ba{7Ku+A&!}x?ba}t>>@=be}se(aA^^^Uat!b0#{pa+awUazbGa#aLb9bgaWac'a5TbS=Br!d1#`%scp_Jvl!#rT>Re0JvX&!VyN=H{Fcm#U&:pY=ReaJv2&!]h0=]nUJvG'!6Vy|=<r%JrM_=]h2@Wlud'#)U'Wf'b]{i=]h/Jvh!&~BpWg=v]RnMx+ny#'Nu;pVwjnu=]nwxJnx,T#`&Reqwjnt=]nvieu9vrRjLLuYwP(#+!th@wih5pX~Gr'g5v/Rh4KunA'!-CARnP@wwiN:Rm_9x'cvw>!|l=<saKvAA!0&3@q}>w^e1bp#&Re2Re3BDx7gH#T|f5H|eKuZ>!%(:qNAH{]Jv6!+3B2B9=b^{X<5<B92:E{ZLvhwA(a;a%!igQuyRmad+#Y}m@3Rh5d8#X'X*:AqUAHzmaxwbh<aXRnVcF}RT#Nw&cj#U(BWnug/vsRntdka)(a3+.Zb7aYYan1!bVa@Xa}[y^@b[{G=H{+hFu73Rj&Pv#5ReQcK%T#sig1v{Rj'Ku+D#'!t]~Grm~?rkKuMB!01d5#`'Vy.ta3Dtu~Hroc8#'{^45s85AwZbP&!#Rn!wghxWn#KvEA!)&2RlA2RlBx:h|#(T,=]j09Wobz>x]z/@awRoTd+#Y(az]hFhCrm4d,#Y+jTv|Q~EfMj]uNr|~FRfOdCa!Xa9_X#@<plJvf!%b`{(9;Rgwc;.!#2x7cw#T|UDb]|T5Ju={(!=@E{&Jv)&!Ab`{'awJvf!~*>>@=be{#KuY>!+&4Ezyi[ugv&RjIdea+T)#UXa&T-T&a!Rh9auRmW=]kLg5vuRn+g3u4Rn-Ow6ARn,hHus5xNk?#UX(U~)/g8v0RkD~AwkkF?Ri.OuNBwkkA?Ri/d|a2`a*^UYa.!aBTZaTa'Xa;!(!2!-a#b2[yC>6Vyq3[xr2Wi?g1rusVh%s?DtF~<5rbJs;%!DtBfswKtCj[uvuSsEu3RgVx3o:u+wN'*Zt;@3rd~Grh~?rfg8w)Lq)qE&-a%!>bI|`jWv0vV~EfCjTv|vV~Ef@j]uNpn~FRfBcK#T']gWNu7x,k7q4ai(0!hHv8<RhmkMu9vrsBuev/RhlCJvB!,g<v{wchh~@:Rhji[vrv{wchi~@:RhkdS&a5UY#Ta!RgPwwiI5BwciI~@:Rh`x'iJvj'!5]iJPu8Bwch]~@:Rhach)U#h3rp]gLh@t|Ax,hTq3ah!-(~@:Ro0Ou!5RhXj^v(pyw8unRhVd|)`,^UYas!a?/a2Z'a^Ta{Tb7Ta(a#!a,Wf&9sZ3DtAadamov=Bqt3[xig8vsRm~>waiL2b`{QJv*_Ouv2qgj<v]v2BqfdR'X*X#Y-@3qr~Gqv~?p6hHv-]glPup5Lq+q?_%*b_{qF{n9b^{rOu4ARhpKvCD!+&~Bqp:5Dbb}nwoiKl&unuTuBv]v+ueunaXRf0=Jvh!0nKufu8v1w&w7q%w&uHrz:Rgnj5w,uxDJq/(!hNw'5ReCk0s2u3w/w'5ReFd>Za&!*UaA=<wkgsRnSJv^!%Refifw3vyRgOKu_B'!,<]gkiiu:w&Rh<=C@a^<B57@2F{[<B5@aW:=3away9A5aW=<B=C@a^<B57@2F{Ie-#`(^^^bCara.b8aza6!/bZ,!adTbnTbOb+aFaS!aAT9@Wf~2Wli3Dtl2@d,#Y&RfnRfmJwJZtN~GqyJva&!VyMg<v~Rm%iXuJu3Rm9Jv[_=]ih9wlkDRkCd1#`(@Wg>2Wls3cH#T(@<Rj*=>Ri|b~'#23s9h<~El.d'#Y&Dtxi^rzvdRl#d*#U%(o|B2s`hJwSaxRmDKv4B&!1:Rmdd5#`'Vx}to~Hq{x'f1v3(!BA5ba|bJv_&!Wfug1v]ReIdO+U/Y#&G}-8wze=Rh{g1v]ReHg/uQRf/by#)ibQwERl/cH#T(@<Rj+=>Ri{cNu+vlax-!(#a0qa9<Rii2;;bU{H;x<i=&X#Rk`<4wwi=C9H~8xAI(Y#<azRi@45wXI<B9;5bb~7dL(X#Xa(+!aL6Vy{g5QqOau:5au2@ay547EzbxOcU(UX-T#Ta#:Cbb|A?wjh/b_|SOw6ARgtihr}u7Rhy<d1#T)X1@@=I|~=ay<2@@=aybb}Sj3vLv;<d,#Y(56H}A978H}@dGpvs@uAu`vcw9*!aFa+ai%(b!aXa8.a?a[ozWey=sU2@G}Nch&U#Rf_WexKu+D#'!t:~Gr`~?r^j]uNr|~FRg*j^psurwJt|RmcKv)@&!)7Rkv~Br[@wxfO:Rl3co#U'6Rezj_q#vIuavjRltwzeyh@vr5JqD0!>aY?C9:9au@9Cb]}9cl#U*5;5<H||jbuus1ucv&Rfvg1v~d/pppzqFr^a--a~!aMat1(hFv;Wiz@@=Izoj5uuv-7Rix~Cw`fk2WlVcZ#X,k)u3vWs@u2]ktg;wEx'fBq(_2Wg/jTv|vV~EfoJv]!15x'hzqG!(P~EfU~CRl_j6v(us5x4i-#T(2WmZ?C2F|d>Kq<aj1!*jTqIsBv=Wl`~Cw`fi2WlWj`v0u*~>RlR=c>Z,k#u3vWs@u2]kr<c1Z+jTqIsBv=Wla~Cw`fm2WlXdmb3!a{(arZa`bkTa%TbQTa-a9+c'!aM!/[yL=Bqug.w'RifhFvyDRj.g>vgwyk^9]k^Jv3_@WfbAARkhJw2_[x|JvB_wkoIRoKwkoJRoLd'(Y#<]gm=<9<H|yd'%_X#skDtb3awwqkgNulRkgdB#^',9:p'hJwSaxRmEBwVb8@4=H|qLu+w50&!)@3qs~?pU>Awwn;;Rn=c:Z'ARn<=<qwKvC@!/&~BqqJv6!&]eVb^z^xRge'/a%+^`#Sge}6<4Rn3=]n0Pw2>Rn8Jw0!&>Rn:>Rn6cY#a7+!a&=<wkaNw~h3z_c5Z{=wjh#=]nLKv^D!&)Vyz=bW|swYb<WetcG#T(2wxa@qVx@gD#Y&b^|V5JwG&!5bb|pg/w&RgD@x=kHs=uAvn!a%%/'+RmSRh694Ro`g-vaRmRhHv-]mlxCcS#`&ba~.5cD#Ta)P~=d,#Y(56H{>978H{Dd_#{2^Y%_+qbbb{6g3sERhsbU{?dfa.,`a(Xa<!aiX#(55RiG54RiHcI#T'WiU3RiVNvdwtfcRlKNvdd,#Y&RlHRlExQgf.1*^T'X#Sgf}6Wn4=]hfPrk>Rn7Jw0!&>Rn5>Rn9Lunw?&a2!,5<oq@@wqfdRlJj5Q~=d,#Y(~ARfcOuN]fdDKw;ay(}i!547E}j?cI#T(@5bV}iCbV}hdv(^^Tb?a40,b##Tbo!a*bR!a<b|a/!aKai!aU[yK=]o^g:v>ReGJwPZtK<7Rh+h<~El,Pv#5ReR@awwxjCg,ulRjDJv6&!]j!z?aQeeg>w=Sh<eeJw;!&axEzOg,Qosc!#*:wkeJ]eJ>x'h-u(!%Ro.w~h.zPdNZ(X,Ya![x{;9ReY;wkgxRiF:x?ap#Y&RmUg<s2Rkod]+UY0TZ'!a&A9sw<=bczLNvuw{gqzNhJwSaxRmCKuLay!#&s_Rf-55b^{uJvZa!!c%#(55Ri654wmiu5RiuawLu,vp!+}^%b_}Y9;wkgxba}o>A9:=b^}zKuh=a''!3awRk3c*'!#aHRk6c+Z&Rk5Rk4Jv)&!awRjSawd9*`#0?C2@EzMj8u<uJ5RmbjQrquJu3x,k>uq@_+=ayb^|W~ARkEOuN]k@7dhzV^X/X&a-#zRzSb`zXcJzTT#2WkVKvDBzW!%FzY9;5bbzWjQrquJu3Jw3%!b`zU=ayb^zQd:#X(T-a!6Vyywxh}=b]{Jg=u1RiAdGp~qHtzv!w(wA+a+a;<!aJaYai'anasb(=azRmV:Cbb{MLq2vb!%')RjuRjrRjtRjqx3jnqCw3!%')Rk(Rk+Rk&Rk)Lq2vb!%')Rj{RjxRjzRjwLq2vb!%')RjsRjpRjfRjex3jcqCw3!%')Rk'Rk*RjkRjl9<CbbzfOu4ARhxLq2vb!%')RjyRjvRjhRjgx=joq*uKvb!%')+-Rk.Rk%Rj~Rk-Rk#Rj}x=jdq*uKvb!%')+-Rk,Rk!Rj|RjmRjjRjidAq&qKs@uAv8Aa.'*-a@a&0!aM@a5[y73Dsy3Ds|3Dt):wxgI2sHJwJZt.~Gqxwsf0ikrzt}Rl0Jvy_[xj~HqzKv_A|D!&WfP8axRoVcf,U#k(v]v+ueunaXRf1Ju}'!g8u#Ri=jQw!sCunLprq>!,')~<5qeGzq9F{W=c##%s5au:5aU3CBE|;d4#X(D!a&6Vygx(b;#(=]ed?C2F{N<capoq2r[a&!aPa9,'Pw;5s:@@=I|,55w_h|@@=IzcP~=x'fCqB_2Wl2>aU@@=I|1OuNBc1Z+jTqIsBv=Wlc~Cw`fl2WlZ~AcTa%!Z+jTqIsBv=Wlb~Cw`fh2WlYk+uNqJsBv=WlSg,u3dca3#UXaMYa)TaB-=cM|7T#<bI}l5@B932:aV2G{BOuNBJq:|M!5Ezt=<B=C@a^<B57@2F{v>cB{/T#=ay<bI{3Jv6!a.6BKq0ah&+!5E}HP~Ef{978BaU@@=Iza<7d#.Y#978BaU@@=IzH~AJq0!(@@=IzG978BaU@@=IzFe,aU*Y&^^^bvJb,b:bFad!a,c2Ta>aL.bo6!a#CbTa'T#Re{2Wlh2@G{yg6t~Ro_NvdRfticuRQRllJv3&!x&c|zs@Jw3!%RflwpfkRlpKuL;%(!Re<@G|C2GzdhIvuBwgjAg-u0RjAKQB%!(GzZ@G|5NuuRl7d='T+Y#Vy[g<v~Rm!==G|>JvA!)@wma=]m1ifuaw&RmnLs@vT'!|/+[y,g:v>ReTJw1!#qX=x!eC{bLu+wT&)ZtZauq_~Graci&U#F|89:r_Lupvq!.)&2RlG8RfaC=x!eF{_h?rpWlmd&'!#X|&]k::xJey#`'T|+<E|&2@H|%dE#(^,g;u.RiEg6vjRiC9xCkA{O|zY#g=ucRmXKs0@!&*@G|m@awRknJuh!,3d(}gY}eJvj!%Rm):Jw3!%Rm+Rm-Ls0w(&!a(a#@b[|6cZ#X'7RkxWgAOu4ARn'dH'U#Y*Vz-Wm'CARm}d]*#a%^a*T'aK!a<9bV{PC=p*Jw4!&SgxcbB5r]idw(wBRmF7xFkt#&`(Rm/Rm8E|!JuY_9:Rl5=wrgr2:bbxd@xXfB(a*#T+!.X0X1Ta/a'T&RlDRfL>RlyARl9b[z[>RfZ:RlL:RfRwlg/ARl;9;RlxKv,A/!%7s69<74=BA5ba{-8Bde#`a<XaKYa1,a'P~=wxfB2bZ}}?C972@@=I}r8@55B9;5bb}G978B2@@=aybb}3j3vLv;<Jw3&!>Rfk=ayb^}4~Ad1#`*@@=aybb{w2@>==<bbz]dx+UY#^UaF!a9!bB'Ya1.!ajXa#%olRhD[y=3Dt#Ov5BrHKuMB%!(Rf^Wep~HrJwkiQjKr|~FRg)Ku+D#'!t5~GrF~?rDdV)UY,Z/_7RkuG{<~BrBg,rlsO:235B@bX}|d?a1!#`(6Vyn5@d##Y+jTv|vV~EfIj]uNpn~FRfH7Lq2vb1!a9-978BaU@@=Iz9978BbU}#~AJq0!(@@=Iz8978BaU@@=Iz7~AJQ|}!978BbU}!JvkaK!AdUa21-U#`a+(g/vsRn~Ou!5RPj:rmu9WhOjXuvvNr}:RhAj^v(pyw8unRn[kPr}p|u7vwv]RiSBd;pppzq@qHQa?(b.!a.a`@.|xa(hFv;Wiyj5uuv-7Riw~Cw`fg2WlU978BbU|wOuNBJqG!(P~EfD~CRlQcZ#X,k)u3vWs@u2]ksg;wEx'f@q1_2Wg.j]uNpn~FRfqJv]!15x'h{qG!(@@=IzK~CRl^j6v(us5x4i,#T(2WmY?C2F{1>Kq<aj1!*jTqIsBv=Wld~Cw`fj2Wl[j`v0u*~>RlT=c>Z,k#u3vWs@u2]kq<c1Z+jTqIsBv=Wle~Cw`fn2Wl]dn1#c(a(b^a2!b/bAT(bj!aDa7bu,a_a{c0!2T0g:v>ReD2@G{42@G{5~DpM~<5rc=Bx6i>{RT#RnI@zCx]y]z:2Jv[!zr5Awyk]9]k]dD(Y+X#6Vz.g=wKtgwhaCwgmTWj2Lu,w%_+/[y-B;b^xeg3u3Rj-2@bX{*KrJ<!+'@Wg(g?QRlC@Jv`!%b[zIwsfII}8JQ_@w|kW|=Jv(%!AqcOuNBJvEzh!bYzjLs@wP#(0!oy@>RkdJwMZtc3Dtd@BcG#T'9bWxg2@2Fznd*#Y+;2x'c}w<zizixNgwa#Z'U+!/!a'!a+w~g~z6wcn{Rn}wcnzRn|5Rh%=]nJg5vuRmvNvdRlvcprJu}w*az*a#!%.a.'Bot9qT]kj@Wg'ay2Gzv@Jv`!%b[zEwsfHI}1;ck#Ux`<Cbbx_Lu+w!a&0*!wko*wwo,So,}6Juqxf!E}PigQuyRm`d3(`#8>Rn%:A5B;bZ~%KvhCa!a2!x>k7#Uxb@b{#xaRk7Jw0!)>wwhlShl}6>wwhmShm}6CJvB!.x'hhvj{!!5Bwkhhbaz}x'hivjz~!5Bwkhibaz|xEhTrNu,v-vpD!a%&/)a3a.,%Ro2t[CE{)@3re9b]{%wjo09:rgc:Z&Ro6=<riifuaw&RmoKrNA!%(Ro4>Ro89;Ri`dSaL'UYzxZb)7Rka3xRhT&!,!#^1U}vbaz{>>@=be}yC@:D5bazzKu+A&!}{?ba}y>>@=be}wxBh[t`u~vJvr!%a!a()a,a0a4RoC=]o;Ju(!%RoGRhdwjh`=]oAg>w#Ro?g5vuRo=NvdRl|Ku]C.!&;RoEJvB!%RoORoMBx'h[v+_?w~h`}~5?w~hd~!xKh]oiptu-utv.vp!#%&a30a@a'a+(a/aOp(o~p!RoDJu(!%RoHRhewjha=]oBNvdRl}g>w#Ro@g5vuRo>c[#X']o<CauRoRAd-#Y':RkpauRoQKu]C.!&;RoFJvB!%RoNRoPBx'h]v+_?w~ha}t5?w~he}ue!/UbhYacXaW^Tc&a;b:a-c/#b&aja1(!cL+!bKbt!bmcRc9aIc?8[yW3Dtt94Rg`Jv}!&SiRMzBhEebShEMNuPRe>x7gL#TzuwjirRipc<Z&>on;>z=h-MSh.Mwqczx'a7vj&!>Re4@=ResJt__NuPRi*NuPRi)j]uNr|~FRfzKrJ>_+@Wfy@Wf]2WocKrJ<!+'@Wg%g/QRl@@Jv`!&awRl<wsfFIzgLu(w*!.*&ShBMwvhIRhI9;RhNx1hK'!#Sn]Mx1hK~0!#:2<H~7cNu+w7D*'1ZtW>Rn1~?rOc:Z&Rn2=<rQ<7wjh&=BSnLMc]#X(6Vz)w[b=a!U#9wzgMc3#&(RgMRitRis<x,gKt`ax!&+SioM=BSilMc3#&(RgKRinRimKurB,!&SiQMzBhDebShDM6BJQ!(P~Efx978B2@@=I}WLrJw!!,a*&@G}O@9wkibRid@@x'fKwC!&SlDMSfLMjUv~Q~EfKKv3@a+!(hFv-]mpx/hYZ(C5RiWz<o/MwkhY?So/M@x,gbvfB*&!SgEM:SoeeehFu3:Rgbda(,^TZa)X/7Sg[eb:2RgI~BrMC@wgkc:wwkcRerx3h(uUvK!&*,SnOM4Sh*MArRg;wHRh(x=h;rJvPwI!a4',a'0@Wg&=BSh/Mg>w=Rh=g3w*wwgGRgGcW(X#;Sg}M2Gzk@Jv`!&awRl=wsfGIz`dKZ*T'Y-:RhR7RhQg5u-p`j6v(us5d,#Y+~Awkia?RicOuNBwkibba}Ld6p~tyu_vbAa'a+!a/'a3aEa8a!>Sh,ebJv{!&Sh@ebSaReb9;SgwebNuPRi(NvdRl)NuPRi'hHu^<Rm^Jvv_@Wl(g;u1Si/ebKu'B&!*Sh?eb@Wl'z@aPeb95Si.ebcpputyvjB)!,&a+0a%ShAMWeK@G}C@WfJ9;RhMwvhH9w{ia}ix,hJvRA1(!zAn[MRhHx1hJ~*!#hFv(BSn[MBJQ!(@@=I~'978B2@@=I}2db.Ua<'X}+T#a0XaG2G}E;wkg|wuh!Rh!x,hZu,@)!&So0MVy)C5RiXACJvB!&5RiY5RiZg8w)cG}*T#2@bU}=KsA>(!a.3wkhZba~(x,h^u(A!&(SoCMRhb5Bz=h[eb?w~hb~6x,h_u(A!&(SoDMRhc5Bz=h]eb?w~hc~6e)aA1T#T,^^^c-bMb&blcPaP(a/!0!bA=b5c@a(!bfbrc#2afwmhARnjwchORnp2Wlf3DtsNvdRl-2@wpa<]m0bx(#:awRk2@Jw3!%RfhwpfgRlnKQB%!(G{V@G|'NuuRl6d='T+Y#VyUg<v~Rl~==G|<Jv+'!aYShC}6@B<5?ba~8@Jw3'!g2QRljhLrpWlOd+#Y'g.w'rIg>w*wgj@g-u0Rj@Lu+wT&)ZtUauq]~GrGci&U#F|39:rELrNvj!.%*RhCwunfw~nf~:9;Ri]>wtnhg;wHRnhx3hDs@v~!/+'@Wfr@9RkSNu&Rlo=@<5GzoKs0@_+@Wl+@awRkmJuh!-3d(}pY#qWJvj!%Rm(:Jw3!%Rm,Rm*de&!1U-U#`)Re;@G|.@9Ri82@wjfvRlq=@<5GzpLvOvr!).&2RlF8Rf`C=x!eE{.Jw3_g2QRlkhLrpWlPde(!#U{s,UXa*Ta'[y'g:v>ReS;x0PZ&RnlRnn~HrKJw1}f!=x!eB|2w]aP(#Xa&a*Ta.Ua2a7=]iOd'#Y&Ro&WnWg;u.RiDg6vjRiBNvdRlzhNvj]nYJuW_2Wm3x)kFze{9d])!a.!,Y01!#&aC!a3RndC=ox~BrC@2b^{pg,rlse7x'ksuq!%Rm.E{xidw(wBRmGx9o+)X#wwo-So-}69:Rl4@xSf@a#XZ'X)X,Ta(/ARl8b[xc>RfY:RlI:RfQwlg.ARl:9;Rlwdn'#^XafaQa1X1TaHTa)@b[{zcZ#X'7RkwWg@Ou4ARn&x)kG#{,g7u/RkGdH'U#Y*Vz'Wm&CARm|bx#(A]gUbUzJj9Q~=d,#Y(56H}l978H{U7d,0#U*2>ABb_xZ978BbU{e~AJQ{g!978BbU{hxMh?ad{oUYZ.x1h?{l!#:2<H{mx3n[t{vl!,&a%3Ro(z=iS}6ARnr=Bwsn^wvn`Rnbd`*T}B0!#^X'BG{c9b]{a>>@=be}F?JvS!&BG{d7BG}(Bde#`a1X,Ya@!a'P~=wxf@2bZ}I56B2@@=aybb}08@55B9;5bb}<j3vLv;<Jw3&!>Rfg=ayb^}&OuNBKuLA!)a!P~=x#fD{f2@>==<bbzl?C972@@=Ix^d6rSu,v7w*C(0a)a6#B+a%!sQ[y?3Dt%3[xn~<5rLOu!5p@Ku+D#'!t7~GrP~?rNKvlaya7'!h+v-5qMg=t|cd,U#5AAaa5Abb{S@52B5@a[@52B5Gx[iXueu;d<#`a(!/549C;ag>23ExY5@Dah89b^~689Jv)!~2b[~1Lv'w(%*!a#bX|aPrmawRe]keu7uhv-q6rxu,q`xTo]/a5aU!bNaDXbi!b-!ao!b<bwA!#5@B932:aV2G|:d-)Y#hJrL>RhG<7@C5<H|_=Cau:5aj5@B932:bJ|ng>vIbs)#?C2F|9jPv0w.vISh-MKvUaz(.!9ABbb|[5;5<H|Eg>unwfh;9:4E|YjQsBt|vjx'hYq3!(?C2F|J:2<BaY?C2F|GOu!5x,g|p{ah!-(?C2F|c9:4E|OjXuvvNr}:Rh&i[w*t|cd+U#jJvsu)vsSn~Mkfrmu9p}u7vwv]So!McW#Xa!ax5@A5aY:5;5<H|>kJv~vYrquJu3x4ib#T)2@SmZM?C2F|Bj:rmu9@xPhI(a*a#U#`a3-5Abb|L~@:RhK9:4E|0@52B5G|#C::aY?C2F|-:2<BaY?C2F|.5Jvk!a)javYrquJu3x4ia#T)2@SmYM?C2F|HAxPhH(!a#U#`a*-5Abb|4~@:RhJ9:4E|R@52B5G|F:2<BaY?C2F|Sc^#Xa2j=Qq5CJvB!-g<v{z;hhM?C2F|Zi[vrv{z;hiM?C2F|XKsA>!a)-g<v{z;h[eb?C2F|]i[vrv{z;h]eb?C2F|^iZu.vix,hZq3ah!.(?C2F|QOu!5ShXM:2<BaY?C2F|P", 13494, 2713, 49, 25, 61);
//#endregion
//#region node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/generated/decode-data-xml.js
/** Packed XML decode trie data. */
const xmlDecodeTree = /* #__PURE__ */ new Uint16Array([
	512,
	26465,
	29036,
	7,
	0,
	2,
	4,
	116,
	24638,
	116,
	24636,
	8693,
	29807,
	24610,
	621,
	1,
	0,
	0,
	3,
	112,
	24614,
	111,
	115,
	24615
]);
//#endregion
//#region node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/internal/bin-trie-flags.js
/**
* Bit flags & masks for the binary trie encoding used for entity decoding.
*
* The trie is a flat `Uint16Array`. Every node starts with one header word:
*
*   15..14 VALUE_LENGTH   Number of words the value occupies, +1.
*                         0 = no value; 1 = value inline in bits 12..0;
*                         2/3 = value in the 1/2 words after the header.
*   13     FLAG13         If VALUE_LENGTH > 0: semicolon required ("strict"
*                         entity; `;` is never stored as a branch).
*                         If VALUE_LENGTH == 0: this node is a compact run.
*   12..7  BRANCH_LENGTH  Number of branches (or run length for runs).
*   6..0   JUMP_TABLE     Jump-table offset / single-branch char / first
*                         run char (see below).
*
* Branch data follows the header and any value words. Its shape is selected
* by (JUMP_TABLE, BRANCH_LENGTH) in the header:
*
*   Single branch  JUMP_TABLE = the only child's char, BRANCH_LENGTH = 0.
*                  No branch words; the child node follows immediately.
*   Jump table     JUMP_TABLE = first covered char (> 0), BRANCH_LENGTH =
*                  table length. One word per covered char: 0 = no branch,
*                  otherwise the child's offset from the END of the table,
*                  +1 (so 0 stays the no-branch sentinel).
*   Dictionary     JUMP_TABLE = 0, BRANCH_LENGTH = number of branches.
*                  ceil(n/2) words of sorted keys packed two per word
*                  (low byte first), then n pointer words storing the
*                  child's offset from the END of the branch data.
*   Compact run    VALUE_LENGTH = 0, FLAG13 set. BRANCH_LENGTH = run
*                  length (3..63), JUMP_TABLE = first char; remaining run
*                  chars packed two per word after the header. The target
*                  node follows the packed words immediately.
*
* Pointers are end-relative (rather than relative to the pointer's own
* position) because that makes the common "child encoded right after the
* branch data" case a small constant, which compresses far better. Offsets
* to already-encoded (shared) nodes wrap via uint16 modulo arithmetic; the
* decoder masks navigation results with `& 0xff_ff` to match.
*/
var BinTrieFlags;
(function(BinTrieFlags) {
	BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
	BinTrieFlags[BinTrieFlags["FLAG13"] = 8192] = "FLAG13";
	BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 8064] = "BRANCH_LENGTH";
	BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
	/** Bits 12..0: the inline value of a VALUE_LENGTH = 1 header word. */
	BinTrieFlags[BinTrieFlags["VALUE_MASK"] = 8191] = "VALUE_MASK";
})(BinTrieFlags || (BinTrieFlags = {}));
//#endregion
//#region node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/decode.js
var CharCodes;
(function(CharCodes) {
	CharCodes[CharCodes["AMP"] = 38] = "AMP";
	CharCodes[CharCodes["NUM"] = 35] = "NUM";
	CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
	CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
	CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
	CharCodes[CharCodes["NINE"] = 57] = "NINE";
	CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
	CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
})(CharCodes || (CharCodes = {}));
/** Bit that needs to be set to convert an upper case ASCII character to lower case */
const TO_LOWER_BIT = 32;
/**
* Unsigned subtraction trick: (code - lo) >>> 0 wraps negatives to large
* values, so a single `<=` covers the entire [lo..hi] range check.
* @param code Code point to check.
*/
function isNumber(code) {
	return code - CharCodes.ZERO >>> 0 <= 9;
}
function isHexadecimalCharacter(code) {
	return (code | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 5;
}
function isAlpha(code) {
	return (code | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 25;
}
/**
* Checks if the given character is a valid end character for an entity in an attribute.
*
* Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
* See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
* @param code Code point to check.
*/
function isEntityInAttributeInvalidEnd(code) {
	return code === CharCodes.EQUALS || isAlpha(code) || isNumber(code);
}
var EntityDecoderState;
(function(EntityDecoderState) {
	EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
	EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
	EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
	EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
	EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
/**
* Decoding mode for named entities.
*/
var DecodingMode;
(function(DecodingMode) {
	/** Entities in text nodes that can end with any character. */
	DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
	/** Only allow entities terminated with a semicolon. */
	DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
	/** Entities in attributes have limitations on ending characters. */
	DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
/**
* Token decoder with support of writing partial entities.
*/
var EntityDecoder = class {
	decodeTree;
	emitCodePoint;
	errors;
	/** The current state of the decoder. */
	state = EntityDecoderState.EntityStart;
	/** Characters that were consumed while parsing an entity. */
	consumed = 1;
	/**
	* The result of the entity.
	*
	* For named entities: the trie index of the best legacy match so far
	* (0 = none). For numeric entities: the accumulated code point.
	*/
	result = 0;
	/** The current index in the decode tree. */
	treeIndex = 0;
	/**
	* Characters consumed since the last recorded legacy match, plus one.
	* Invariant at the top of the `stateNamedEntity` loop: `excess` equals
	* the number of unrecorded consumed characters + 1.
	*/
	excess = 1;
	/** The mode in which the decoder is operating. */
	decodeMode = DecodingMode.Strict;
	/** The number of characters that have been consumed in the current run. */
	runConsumed = 0;
	constructor(decodeTree, emitCodePoint, errors) {
		this.decodeTree = decodeTree;
		this.emitCodePoint = emitCodePoint;
		this.errors = errors;
	}
	/**
	* Resets the instance to make it reusable.
	* @param decodeMode Entity decoding mode to use.
	*/
	startEntity(decodeMode) {
		this.decodeMode = decodeMode;
		this.state = EntityDecoderState.EntityStart;
		this.result = 0;
		this.treeIndex = 0;
		this.excess = 1;
		this.consumed = 1;
		this.runConsumed = 0;
	}
	/**
	* Write an entity to the decoder. This can be called multiple times with partial entities.
	* If the entity is incomplete, the decoder will return -1.
	*
	* Mirrors the non-streaming `decodeWithTrie`, but with the ability to stop decoding if the
	* entity is incomplete, and resume when the next string is written.
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	write(input, offset) {
		switch (this.state) {
			case EntityDecoderState.EntityStart:
				if (input.charCodeAt(offset) === CharCodes.NUM) {
					this.state = EntityDecoderState.NumericStart;
					this.consumed += 1;
					return this.stateNumericStart(input, offset + 1);
				}
				this.state = EntityDecoderState.NamedEntity;
				return this.stateNamedEntity(input, offset);
			case EntityDecoderState.NumericStart: return this.stateNumericStart(input, offset);
			case EntityDecoderState.NumericDecimal: return this.stateNumericDecimal(input, offset);
			case EntityDecoderState.NumericHex: return this.stateNumericHex(input, offset);
			default: return this.stateNamedEntity(input, offset);
		}
	}
	/**
	* Switches between the numeric decimal and hexadecimal states.
	*
	* Equivalent to the `Numeric character reference state` in the HTML spec.
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericStart(input, offset) {
		if (offset >= input.length) return -1;
		if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
			this.state = EntityDecoderState.NumericHex;
			this.consumed += 1;
			return this.stateNumericHex(input, offset + 1);
		}
		this.state = EntityDecoderState.NumericDecimal;
		return this.stateNumericDecimal(input, offset);
	}
	/**
	* Parses a hexadecimal numeric entity.
	*
	* Equivalent to the `Hexademical character reference state` in the HTML
	* spec. Digit parsing matches the hex loop in `parseNumericEntity`.
	* The accumulated value is preserved for numeric validation callbacks.
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericHex(input, offset) {
		const inputLength = input.length;
		let { result } = this;
		let { consumed } = this;
		while (offset < inputLength) {
			const char = input.charCodeAt(offset);
			if (isNumber(char) || isHexadecimalCharacter(char)) {
				const digit = char <= CharCodes.NINE ? char - CharCodes.ZERO : (char | TO_LOWER_BIT) - CharCodes.LOWER_A + 10;
				result = result * 16 + digit;
				consumed += 1;
				offset += 1;
			} else {
				this.result = result;
				this.consumed = consumed;
				return this.emitNumericEntity(char, 3);
			}
		}
		this.result = result;
		this.consumed = consumed;
		return -1;
	}
	/**
	* Parses a decimal numeric entity.
	*
	* Equivalent to the `Decimal character reference state` in the HTML
	* spec. Digit parsing matches the decimal loop in `parseNumericEntity`.
	* The accumulated value is preserved for numeric validation callbacks.
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericDecimal(input, offset) {
		const inputLength = input.length;
		let { result } = this;
		let { consumed } = this;
		while (offset < inputLength) {
			const digit = input.charCodeAt(offset) - CharCodes.ZERO;
			if (digit >>> 0 > 9) {
				this.result = result;
				this.consumed = consumed;
				return this.emitNumericEntity(digit + CharCodes.ZERO, 2);
			}
			result = result * 10 + digit;
			consumed += 1;
			offset += 1;
		}
		this.result = result;
		this.consumed = consumed;
		return -1;
	}
	/**
	* Validate and emit a numeric entity.
	*
	* Implements the logic from the `Hexademical character reference start
	* state` and `Numeric character reference end state` in the HTML spec.
	* @param lastCp The last code point of the entity. Used to see if the
	*               entity was terminated with a semicolon.
	* @param expectedLength The minimum number of characters that should be
	*                       consumed. Used to validate that at least one digit
	*                       was consumed.
	* @returns The number of characters that were consumed.
	*/
	emitNumericEntity(lastCp, expectedLength) {
		if (this.consumed <= expectedLength) {
			this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
			return 0;
		}
		if (lastCp === CharCodes.SEMI) this.consumed += 1;
		else if (this.decodeMode === DecodingMode.Strict) return 0;
		this.emitCodePoint((this.decodeTree === xmlDecodeTree ? replaceCodePointXML : replaceCodePoint)(this.result), this.consumed);
		if (this.errors) {
			if (lastCp !== CharCodes.SEMI) this.errors.missingSemicolonAfterCharacterReference();
			this.errors.validateNumericCharacterReference(this.result);
		}
		return this.consumed;
	}
	/**
	* Flush locally-tracked walk state back to the fields, then emit the
	* recorded legacy match or reject (cold path — at most once per
	* entity). Called after failed navigation (leaf node, branch miss, or
	* compact-run mismatch). In attribute mode, reject if no legacy was
	* recorded at the current node, if we descended past it, or if the
	* pending input character is an invalid attribute terminator.
	* @param consumed Locally-tracked consumed count.
	* @param excess Locally-tracked excess count.
	* @param char Pending input character (may be the mismatching char).
	* @param valueLength Value length at the current trie node.
	*/
	flushAndEmitLegacyOrReject(consumed, excess, char, valueLength) {
		this.consumed = consumed;
		this.excess = excess;
		return this.result === 0 || this.decodeMode === DecodingMode.Attribute && (valueLength === 0 || excess > 1 || isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
	}
	/**
	* Parses a named entity.
	*
	* Equivalent to the `Named character reference state` in the HTML spec.
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNamedEntity(input, offset) {
		const { decodeTree } = this;
		const inputLength = input.length;
		const isStrict = this.decodeMode === DecodingMode.Strict;
		let { treeIndex } = this;
		let { excess } = this;
		let { consumed } = this;
		let current = decodeTree[treeIndex];
		while (offset < inputLength) {
			while ((current & (BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13)) === 0 && (current & BinTrieFlags.JUMP_TABLE) !== 0) {
				const char = input.charCodeAt(offset);
				const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
				const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
				if (branchCount === 0) {
					if (char !== jumpOffset) return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
					treeIndex += 1;
				} else {
					const slot = char - jumpOffset;
					if (slot >>> 0 >= branchCount) return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
					const stored = decodeTree[treeIndex + 1 + slot];
					if (stored === 0) return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
					treeIndex = treeIndex + branchCount + stored & 65535;
				}
				current = decodeTree[treeIndex];
				offset += 1;
				excess += 1;
				if (offset >= inputLength) break;
			}
			if (offset >= inputLength) break;
			if ((current & (BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13)) === BinTrieFlags.FLAG13) {
				const runLength = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
				let { runConsumed } = this;
				if (runConsumed === 0) {
					const char = input.charCodeAt(offset);
					if (char !== (current & BinTrieFlags.JUMP_TABLE)) return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
					offset += 1;
					excess += 1;
					runConsumed = 1;
				}
				while (runConsumed < runLength) {
					if (offset >= inputLength) {
						this.treeIndex = treeIndex;
						this.excess = excess;
						this.consumed = consumed;
						this.runConsumed = runConsumed;
						return -1;
					}
					const charIndexInPacked = runConsumed - 1;
					const expectedChar = decodeTree[treeIndex + 1 + (charIndexInPacked >> 1)] >> ((charIndexInPacked & 1) << 3) & 255;
					const char = input.charCodeAt(offset);
					if (char !== expectedChar) {
						this.runConsumed = 0;
						return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
					}
					offset += 1;
					excess += 1;
					runConsumed += 1;
				}
				this.runConsumed = 0;
				treeIndex += 1 + (runLength >> 1);
				current = decodeTree[treeIndex];
				continue;
			}
			const valueLength = current >>> 14;
			const char = input.charCodeAt(offset);
			if (valueLength !== 0) {
				if (!isStrict && (current & BinTrieFlags.FLAG13) === 0) {
					this.result = treeIndex;
					consumed += excess - 1;
					excess = 1;
				}
				if (char === CharCodes.SEMI) return this.emitNamedEntityData(treeIndex, valueLength, consumed + excess);
				if (valueLength === 1) return this.flushAndEmitLegacyOrReject(consumed, excess, char, valueLength);
			}
			const next = determineBranch(decodeTree, current, treeIndex + (valueLength || 1), char);
			if (next < 0) return this.flushAndEmitLegacyOrReject(consumed, excess, char, valueLength);
			treeIndex = next;
			current = decodeTree[treeIndex];
			offset += 1;
			excess += 1;
		}
		if (!isStrict && current >>> 14 !== 0 && (current & BinTrieFlags.FLAG13) === 0) {
			this.result = treeIndex;
			consumed += excess - 1;
			excess = 1;
		}
		this.treeIndex = treeIndex;
		this.excess = excess;
		this.consumed = consumed;
		return -1;
	}
	/**
	* Emit a named entity that was not terminated with a semicolon.
	* @returns The number of characters consumed.
	*/
	emitNotTerminatedNamedEntity() {
		const { result, decodeTree } = this;
		const valueLength = decodeTree[result] >>> 14;
		this.emitNamedEntityData(result, valueLength, this.consumed);
		this.errors?.missingSemicolonAfterCharacterReference();
		return this.consumed;
	}
	/**
	* Emit a named entity.
	* @param result The index of the entity in the decode tree.
	* @param valueLength Encoded value length (header plus any value words).
	* @param consumed The number of characters consumed.
	* @returns The number of characters consumed.
	*/
	emitNamedEntityData(result, valueLength, consumed) {
		const { decodeTree } = this;
		this.emitCodePoint(valueLength === 1 ? decodeTree[result] & BinTrieFlags.VALUE_MASK : decodeTree[result + 1], consumed);
		if (valueLength === 3) this.emitCodePoint(decodeTree[result + 2], consumed);
		return consumed;
	}
	/**
	* Signal to the parser that the end of the input was reached.
	*
	* Remaining data will be emitted and relevant errors will be produced.
	* @returns The number of characters consumed.
	*/
	end() {
		switch (this.state) {
			case EntityDecoderState.NamedEntity: return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
			case EntityDecoderState.NumericDecimal: return this.emitNumericEntity(0, 2);
			case EntityDecoderState.NumericHex: return this.emitNumericEntity(0, 3);
			case EntityDecoderState.NumericStart:
				this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
				return 0;
			default: return 0;
		}
	}
};
/**
* Determines the branch of the current node that is taken given the current
* character. This function is used to traverse the trie.
*
* See `BinTrieFlags` for the branch-data layouts handled here.
* @param decodeTree The trie.
* @param current The current node's header word.
* @param nodeIndex Index of the node's first branch-data word (the header
*   plus any value words have been skipped by the caller).
* @param char The current character.
* @returns The index of the next node, or -1 if no branch is taken.
*/
function determineBranch(decodeTree, current, nodeIndex, char) {
	const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
	const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
	if (jumpOffset) {
		if (branchCount === 0) return char === jumpOffset ? nodeIndex : -1;
		const slot = char - jumpOffset;
		if (slot >>> 0 >= branchCount) return -1;
		const stored = decodeTree[nodeIndex + slot];
		return stored === 0 ? -1 : nodeIndex + branchCount + stored - 1 & 65535;
	}
	if (branchCount === 0) return -1;
	const packedKeySlots = branchCount + 1 >> 1;
	const branchEnd = nodeIndex + packedKeySlots + branchCount;
	for (let index = 0; index < branchCount; index++) {
		const key = decodeTree[nodeIndex + (index >> 1)] >> ((index & 1) << 3) & 255;
		if (key === char) return branchEnd + decodeTree[nodeIndex + packedKeySlots + index] & 65535;
		if (key > char) return -1;
	}
	return -1;
}
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/common/html.js
/** All valid namespaces in HTML. */
var NS;
(function(NS) {
	NS["HTML"] = "http://www.w3.org/1999/xhtml";
	NS["MATHML"] = "http://www.w3.org/1998/Math/MathML";
	NS["SVG"] = "http://www.w3.org/2000/svg";
	NS["XLINK"] = "http://www.w3.org/1999/xlink";
	NS["XML"] = "http://www.w3.org/XML/1998/namespace";
	NS["XMLNS"] = "http://www.w3.org/2000/xmlns/";
})(NS || (NS = {}));
var ATTRS;
(function(ATTRS) {
	ATTRS["TYPE"] = "type";
	ATTRS["ACTION"] = "action";
	ATTRS["ENCODING"] = "encoding";
	ATTRS["PROMPT"] = "prompt";
	ATTRS["NAME"] = "name";
	ATTRS["COLOR"] = "color";
	ATTRS["FACE"] = "face";
	ATTRS["SIZE"] = "size";
})(ATTRS || (ATTRS = {}));
/**
* The mode of the document.
*
* @see {@link https://dom.spec.whatwg.org/#concept-document-limited-quirks}
*/
var DOCUMENT_MODE;
(function(DOCUMENT_MODE) {
	DOCUMENT_MODE["NO_QUIRKS"] = "no-quirks";
	DOCUMENT_MODE["QUIRKS"] = "quirks";
	DOCUMENT_MODE["LIMITED_QUIRKS"] = "limited-quirks";
})(DOCUMENT_MODE || (DOCUMENT_MODE = {}));
var TAG_NAMES;
(function(TAG_NAMES) {
	TAG_NAMES["A"] = "a";
	TAG_NAMES["ADDRESS"] = "address";
	TAG_NAMES["ANNOTATION_XML"] = "annotation-xml";
	TAG_NAMES["APPLET"] = "applet";
	TAG_NAMES["AREA"] = "area";
	TAG_NAMES["ARTICLE"] = "article";
	TAG_NAMES["ASIDE"] = "aside";
	TAG_NAMES["B"] = "b";
	TAG_NAMES["BASE"] = "base";
	TAG_NAMES["BASEFONT"] = "basefont";
	TAG_NAMES["BGSOUND"] = "bgsound";
	TAG_NAMES["BIG"] = "big";
	TAG_NAMES["BLOCKQUOTE"] = "blockquote";
	TAG_NAMES["BODY"] = "body";
	TAG_NAMES["BR"] = "br";
	TAG_NAMES["BUTTON"] = "button";
	TAG_NAMES["CAPTION"] = "caption";
	TAG_NAMES["CENTER"] = "center";
	TAG_NAMES["CODE"] = "code";
	TAG_NAMES["COL"] = "col";
	TAG_NAMES["COLGROUP"] = "colgroup";
	TAG_NAMES["DD"] = "dd";
	TAG_NAMES["DESC"] = "desc";
	TAG_NAMES["DETAILS"] = "details";
	TAG_NAMES["DIALOG"] = "dialog";
	TAG_NAMES["DIR"] = "dir";
	TAG_NAMES["DIV"] = "div";
	TAG_NAMES["DL"] = "dl";
	TAG_NAMES["DT"] = "dt";
	TAG_NAMES["EM"] = "em";
	TAG_NAMES["EMBED"] = "embed";
	TAG_NAMES["FIELDSET"] = "fieldset";
	TAG_NAMES["FIGCAPTION"] = "figcaption";
	TAG_NAMES["FIGURE"] = "figure";
	TAG_NAMES["FONT"] = "font";
	TAG_NAMES["FOOTER"] = "footer";
	TAG_NAMES["FOREIGN_OBJECT"] = "foreignObject";
	TAG_NAMES["FORM"] = "form";
	TAG_NAMES["FRAME"] = "frame";
	TAG_NAMES["FRAMESET"] = "frameset";
	TAG_NAMES["H1"] = "h1";
	TAG_NAMES["H2"] = "h2";
	TAG_NAMES["H3"] = "h3";
	TAG_NAMES["H4"] = "h4";
	TAG_NAMES["H5"] = "h5";
	TAG_NAMES["H6"] = "h6";
	TAG_NAMES["HEAD"] = "head";
	TAG_NAMES["HEADER"] = "header";
	TAG_NAMES["HGROUP"] = "hgroup";
	TAG_NAMES["HR"] = "hr";
	TAG_NAMES["HTML"] = "html";
	TAG_NAMES["I"] = "i";
	TAG_NAMES["IMG"] = "img";
	TAG_NAMES["IMAGE"] = "image";
	TAG_NAMES["INPUT"] = "input";
	TAG_NAMES["IFRAME"] = "iframe";
	TAG_NAMES["KEYGEN"] = "keygen";
	TAG_NAMES["LABEL"] = "label";
	TAG_NAMES["LI"] = "li";
	TAG_NAMES["LINK"] = "link";
	TAG_NAMES["LISTING"] = "listing";
	TAG_NAMES["MAIN"] = "main";
	TAG_NAMES["MALIGNMARK"] = "malignmark";
	TAG_NAMES["MARQUEE"] = "marquee";
	TAG_NAMES["MATH"] = "math";
	TAG_NAMES["MENU"] = "menu";
	TAG_NAMES["META"] = "meta";
	TAG_NAMES["MGLYPH"] = "mglyph";
	TAG_NAMES["MI"] = "mi";
	TAG_NAMES["MO"] = "mo";
	TAG_NAMES["MN"] = "mn";
	TAG_NAMES["MS"] = "ms";
	TAG_NAMES["MTEXT"] = "mtext";
	TAG_NAMES["NAV"] = "nav";
	TAG_NAMES["NOBR"] = "nobr";
	TAG_NAMES["NOFRAMES"] = "noframes";
	TAG_NAMES["NOEMBED"] = "noembed";
	TAG_NAMES["NOSCRIPT"] = "noscript";
	TAG_NAMES["OBJECT"] = "object";
	TAG_NAMES["OL"] = "ol";
	TAG_NAMES["OPTGROUP"] = "optgroup";
	TAG_NAMES["OPTION"] = "option";
	TAG_NAMES["P"] = "p";
	TAG_NAMES["PARAM"] = "param";
	TAG_NAMES["PLAINTEXT"] = "plaintext";
	TAG_NAMES["PRE"] = "pre";
	TAG_NAMES["RB"] = "rb";
	TAG_NAMES["RP"] = "rp";
	TAG_NAMES["RT"] = "rt";
	TAG_NAMES["RTC"] = "rtc";
	TAG_NAMES["RUBY"] = "ruby";
	TAG_NAMES["S"] = "s";
	TAG_NAMES["SCRIPT"] = "script";
	TAG_NAMES["SEARCH"] = "search";
	TAG_NAMES["SECTION"] = "section";
	TAG_NAMES["SELECT"] = "select";
	TAG_NAMES["SOURCE"] = "source";
	TAG_NAMES["SMALL"] = "small";
	TAG_NAMES["SPAN"] = "span";
	TAG_NAMES["STRIKE"] = "strike";
	TAG_NAMES["STRONG"] = "strong";
	TAG_NAMES["STYLE"] = "style";
	TAG_NAMES["SUB"] = "sub";
	TAG_NAMES["SUMMARY"] = "summary";
	TAG_NAMES["SUP"] = "sup";
	TAG_NAMES["TABLE"] = "table";
	TAG_NAMES["TBODY"] = "tbody";
	TAG_NAMES["TEMPLATE"] = "template";
	TAG_NAMES["TEXTAREA"] = "textarea";
	TAG_NAMES["TFOOT"] = "tfoot";
	TAG_NAMES["TD"] = "td";
	TAG_NAMES["TH"] = "th";
	TAG_NAMES["THEAD"] = "thead";
	TAG_NAMES["TITLE"] = "title";
	TAG_NAMES["TR"] = "tr";
	TAG_NAMES["TRACK"] = "track";
	TAG_NAMES["TT"] = "tt";
	TAG_NAMES["U"] = "u";
	TAG_NAMES["UL"] = "ul";
	TAG_NAMES["SVG"] = "svg";
	TAG_NAMES["VAR"] = "var";
	TAG_NAMES["WBR"] = "wbr";
	TAG_NAMES["XMP"] = "xmp";
})(TAG_NAMES || (TAG_NAMES = {}));
/**
* Tag IDs are numeric IDs for known tag names.
*
* We use tag IDs to improve the performance of tag name comparisons.
*/
var TAG_ID;
(function(TAG_ID) {
	TAG_ID[TAG_ID["UNKNOWN"] = 0] = "UNKNOWN";
	TAG_ID[TAG_ID["A"] = 1] = "A";
	TAG_ID[TAG_ID["ADDRESS"] = 2] = "ADDRESS";
	TAG_ID[TAG_ID["ANNOTATION_XML"] = 3] = "ANNOTATION_XML";
	TAG_ID[TAG_ID["APPLET"] = 4] = "APPLET";
	TAG_ID[TAG_ID["AREA"] = 5] = "AREA";
	TAG_ID[TAG_ID["ARTICLE"] = 6] = "ARTICLE";
	TAG_ID[TAG_ID["ASIDE"] = 7] = "ASIDE";
	TAG_ID[TAG_ID["B"] = 8] = "B";
	TAG_ID[TAG_ID["BASE"] = 9] = "BASE";
	TAG_ID[TAG_ID["BASEFONT"] = 10] = "BASEFONT";
	TAG_ID[TAG_ID["BGSOUND"] = 11] = "BGSOUND";
	TAG_ID[TAG_ID["BIG"] = 12] = "BIG";
	TAG_ID[TAG_ID["BLOCKQUOTE"] = 13] = "BLOCKQUOTE";
	TAG_ID[TAG_ID["BODY"] = 14] = "BODY";
	TAG_ID[TAG_ID["BR"] = 15] = "BR";
	TAG_ID[TAG_ID["BUTTON"] = 16] = "BUTTON";
	TAG_ID[TAG_ID["CAPTION"] = 17] = "CAPTION";
	TAG_ID[TAG_ID["CENTER"] = 18] = "CENTER";
	TAG_ID[TAG_ID["CODE"] = 19] = "CODE";
	TAG_ID[TAG_ID["COL"] = 20] = "COL";
	TAG_ID[TAG_ID["COLGROUP"] = 21] = "COLGROUP";
	TAG_ID[TAG_ID["DD"] = 22] = "DD";
	TAG_ID[TAG_ID["DESC"] = 23] = "DESC";
	TAG_ID[TAG_ID["DETAILS"] = 24] = "DETAILS";
	TAG_ID[TAG_ID["DIALOG"] = 25] = "DIALOG";
	TAG_ID[TAG_ID["DIR"] = 26] = "DIR";
	TAG_ID[TAG_ID["DIV"] = 27] = "DIV";
	TAG_ID[TAG_ID["DL"] = 28] = "DL";
	TAG_ID[TAG_ID["DT"] = 29] = "DT";
	TAG_ID[TAG_ID["EM"] = 30] = "EM";
	TAG_ID[TAG_ID["EMBED"] = 31] = "EMBED";
	TAG_ID[TAG_ID["FIELDSET"] = 32] = "FIELDSET";
	TAG_ID[TAG_ID["FIGCAPTION"] = 33] = "FIGCAPTION";
	TAG_ID[TAG_ID["FIGURE"] = 34] = "FIGURE";
	TAG_ID[TAG_ID["FONT"] = 35] = "FONT";
	TAG_ID[TAG_ID["FOOTER"] = 36] = "FOOTER";
	TAG_ID[TAG_ID["FOREIGN_OBJECT"] = 37] = "FOREIGN_OBJECT";
	TAG_ID[TAG_ID["FORM"] = 38] = "FORM";
	TAG_ID[TAG_ID["FRAME"] = 39] = "FRAME";
	TAG_ID[TAG_ID["FRAMESET"] = 40] = "FRAMESET";
	TAG_ID[TAG_ID["H1"] = 41] = "H1";
	TAG_ID[TAG_ID["H2"] = 42] = "H2";
	TAG_ID[TAG_ID["H3"] = 43] = "H3";
	TAG_ID[TAG_ID["H4"] = 44] = "H4";
	TAG_ID[TAG_ID["H5"] = 45] = "H5";
	TAG_ID[TAG_ID["H6"] = 46] = "H6";
	TAG_ID[TAG_ID["HEAD"] = 47] = "HEAD";
	TAG_ID[TAG_ID["HEADER"] = 48] = "HEADER";
	TAG_ID[TAG_ID["HGROUP"] = 49] = "HGROUP";
	TAG_ID[TAG_ID["HR"] = 50] = "HR";
	TAG_ID[TAG_ID["HTML"] = 51] = "HTML";
	TAG_ID[TAG_ID["I"] = 52] = "I";
	TAG_ID[TAG_ID["IMG"] = 53] = "IMG";
	TAG_ID[TAG_ID["IMAGE"] = 54] = "IMAGE";
	TAG_ID[TAG_ID["INPUT"] = 55] = "INPUT";
	TAG_ID[TAG_ID["IFRAME"] = 56] = "IFRAME";
	TAG_ID[TAG_ID["KEYGEN"] = 57] = "KEYGEN";
	TAG_ID[TAG_ID["LABEL"] = 58] = "LABEL";
	TAG_ID[TAG_ID["LI"] = 59] = "LI";
	TAG_ID[TAG_ID["LINK"] = 60] = "LINK";
	TAG_ID[TAG_ID["LISTING"] = 61] = "LISTING";
	TAG_ID[TAG_ID["MAIN"] = 62] = "MAIN";
	TAG_ID[TAG_ID["MALIGNMARK"] = 63] = "MALIGNMARK";
	TAG_ID[TAG_ID["MARQUEE"] = 64] = "MARQUEE";
	TAG_ID[TAG_ID["MATH"] = 65] = "MATH";
	TAG_ID[TAG_ID["MENU"] = 66] = "MENU";
	TAG_ID[TAG_ID["META"] = 67] = "META";
	TAG_ID[TAG_ID["MGLYPH"] = 68] = "MGLYPH";
	TAG_ID[TAG_ID["MI"] = 69] = "MI";
	TAG_ID[TAG_ID["MO"] = 70] = "MO";
	TAG_ID[TAG_ID["MN"] = 71] = "MN";
	TAG_ID[TAG_ID["MS"] = 72] = "MS";
	TAG_ID[TAG_ID["MTEXT"] = 73] = "MTEXT";
	TAG_ID[TAG_ID["NAV"] = 74] = "NAV";
	TAG_ID[TAG_ID["NOBR"] = 75] = "NOBR";
	TAG_ID[TAG_ID["NOFRAMES"] = 76] = "NOFRAMES";
	TAG_ID[TAG_ID["NOEMBED"] = 77] = "NOEMBED";
	TAG_ID[TAG_ID["NOSCRIPT"] = 78] = "NOSCRIPT";
	TAG_ID[TAG_ID["OBJECT"] = 79] = "OBJECT";
	TAG_ID[TAG_ID["OL"] = 80] = "OL";
	TAG_ID[TAG_ID["OPTGROUP"] = 81] = "OPTGROUP";
	TAG_ID[TAG_ID["OPTION"] = 82] = "OPTION";
	TAG_ID[TAG_ID["P"] = 83] = "P";
	TAG_ID[TAG_ID["PARAM"] = 84] = "PARAM";
	TAG_ID[TAG_ID["PLAINTEXT"] = 85] = "PLAINTEXT";
	TAG_ID[TAG_ID["PRE"] = 86] = "PRE";
	TAG_ID[TAG_ID["RB"] = 87] = "RB";
	TAG_ID[TAG_ID["RP"] = 88] = "RP";
	TAG_ID[TAG_ID["RT"] = 89] = "RT";
	TAG_ID[TAG_ID["RTC"] = 90] = "RTC";
	TAG_ID[TAG_ID["RUBY"] = 91] = "RUBY";
	TAG_ID[TAG_ID["S"] = 92] = "S";
	TAG_ID[TAG_ID["SCRIPT"] = 93] = "SCRIPT";
	TAG_ID[TAG_ID["SEARCH"] = 94] = "SEARCH";
	TAG_ID[TAG_ID["SECTION"] = 95] = "SECTION";
	TAG_ID[TAG_ID["SELECT"] = 96] = "SELECT";
	TAG_ID[TAG_ID["SOURCE"] = 97] = "SOURCE";
	TAG_ID[TAG_ID["SMALL"] = 98] = "SMALL";
	TAG_ID[TAG_ID["SPAN"] = 99] = "SPAN";
	TAG_ID[TAG_ID["STRIKE"] = 100] = "STRIKE";
	TAG_ID[TAG_ID["STRONG"] = 101] = "STRONG";
	TAG_ID[TAG_ID["STYLE"] = 102] = "STYLE";
	TAG_ID[TAG_ID["SUB"] = 103] = "SUB";
	TAG_ID[TAG_ID["SUMMARY"] = 104] = "SUMMARY";
	TAG_ID[TAG_ID["SUP"] = 105] = "SUP";
	TAG_ID[TAG_ID["TABLE"] = 106] = "TABLE";
	TAG_ID[TAG_ID["TBODY"] = 107] = "TBODY";
	TAG_ID[TAG_ID["TEMPLATE"] = 108] = "TEMPLATE";
	TAG_ID[TAG_ID["TEXTAREA"] = 109] = "TEXTAREA";
	TAG_ID[TAG_ID["TFOOT"] = 110] = "TFOOT";
	TAG_ID[TAG_ID["TD"] = 111] = "TD";
	TAG_ID[TAG_ID["TH"] = 112] = "TH";
	TAG_ID[TAG_ID["THEAD"] = 113] = "THEAD";
	TAG_ID[TAG_ID["TITLE"] = 114] = "TITLE";
	TAG_ID[TAG_ID["TR"] = 115] = "TR";
	TAG_ID[TAG_ID["TRACK"] = 116] = "TRACK";
	TAG_ID[TAG_ID["TT"] = 117] = "TT";
	TAG_ID[TAG_ID["U"] = 118] = "U";
	TAG_ID[TAG_ID["UL"] = 119] = "UL";
	TAG_ID[TAG_ID["SVG"] = 120] = "SVG";
	TAG_ID[TAG_ID["VAR"] = 121] = "VAR";
	TAG_ID[TAG_ID["WBR"] = 122] = "WBR";
	TAG_ID[TAG_ID["XMP"] = 123] = "XMP";
})(TAG_ID || (TAG_ID = {}));
const TAG_NAME_TO_ID = /* @__PURE__ */ new Map([
	[TAG_NAMES.A, TAG_ID.A],
	[TAG_NAMES.ADDRESS, TAG_ID.ADDRESS],
	[TAG_NAMES.ANNOTATION_XML, TAG_ID.ANNOTATION_XML],
	[TAG_NAMES.APPLET, TAG_ID.APPLET],
	[TAG_NAMES.AREA, TAG_ID.AREA],
	[TAG_NAMES.ARTICLE, TAG_ID.ARTICLE],
	[TAG_NAMES.ASIDE, TAG_ID.ASIDE],
	[TAG_NAMES.B, TAG_ID.B],
	[TAG_NAMES.BASE, TAG_ID.BASE],
	[TAG_NAMES.BASEFONT, TAG_ID.BASEFONT],
	[TAG_NAMES.BGSOUND, TAG_ID.BGSOUND],
	[TAG_NAMES.BIG, TAG_ID.BIG],
	[TAG_NAMES.BLOCKQUOTE, TAG_ID.BLOCKQUOTE],
	[TAG_NAMES.BODY, TAG_ID.BODY],
	[TAG_NAMES.BR, TAG_ID.BR],
	[TAG_NAMES.BUTTON, TAG_ID.BUTTON],
	[TAG_NAMES.CAPTION, TAG_ID.CAPTION],
	[TAG_NAMES.CENTER, TAG_ID.CENTER],
	[TAG_NAMES.CODE, TAG_ID.CODE],
	[TAG_NAMES.COL, TAG_ID.COL],
	[TAG_NAMES.COLGROUP, TAG_ID.COLGROUP],
	[TAG_NAMES.DD, TAG_ID.DD],
	[TAG_NAMES.DESC, TAG_ID.DESC],
	[TAG_NAMES.DETAILS, TAG_ID.DETAILS],
	[TAG_NAMES.DIALOG, TAG_ID.DIALOG],
	[TAG_NAMES.DIR, TAG_ID.DIR],
	[TAG_NAMES.DIV, TAG_ID.DIV],
	[TAG_NAMES.DL, TAG_ID.DL],
	[TAG_NAMES.DT, TAG_ID.DT],
	[TAG_NAMES.EM, TAG_ID.EM],
	[TAG_NAMES.EMBED, TAG_ID.EMBED],
	[TAG_NAMES.FIELDSET, TAG_ID.FIELDSET],
	[TAG_NAMES.FIGCAPTION, TAG_ID.FIGCAPTION],
	[TAG_NAMES.FIGURE, TAG_ID.FIGURE],
	[TAG_NAMES.FONT, TAG_ID.FONT],
	[TAG_NAMES.FOOTER, TAG_ID.FOOTER],
	[TAG_NAMES.FOREIGN_OBJECT, TAG_ID.FOREIGN_OBJECT],
	[TAG_NAMES.FORM, TAG_ID.FORM],
	[TAG_NAMES.FRAME, TAG_ID.FRAME],
	[TAG_NAMES.FRAMESET, TAG_ID.FRAMESET],
	[TAG_NAMES.H1, TAG_ID.H1],
	[TAG_NAMES.H2, TAG_ID.H2],
	[TAG_NAMES.H3, TAG_ID.H3],
	[TAG_NAMES.H4, TAG_ID.H4],
	[TAG_NAMES.H5, TAG_ID.H5],
	[TAG_NAMES.H6, TAG_ID.H6],
	[TAG_NAMES.HEAD, TAG_ID.HEAD],
	[TAG_NAMES.HEADER, TAG_ID.HEADER],
	[TAG_NAMES.HGROUP, TAG_ID.HGROUP],
	[TAG_NAMES.HR, TAG_ID.HR],
	[TAG_NAMES.HTML, TAG_ID.HTML],
	[TAG_NAMES.I, TAG_ID.I],
	[TAG_NAMES.IMG, TAG_ID.IMG],
	[TAG_NAMES.IMAGE, TAG_ID.IMAGE],
	[TAG_NAMES.INPUT, TAG_ID.INPUT],
	[TAG_NAMES.IFRAME, TAG_ID.IFRAME],
	[TAG_NAMES.KEYGEN, TAG_ID.KEYGEN],
	[TAG_NAMES.LABEL, TAG_ID.LABEL],
	[TAG_NAMES.LI, TAG_ID.LI],
	[TAG_NAMES.LINK, TAG_ID.LINK],
	[TAG_NAMES.LISTING, TAG_ID.LISTING],
	[TAG_NAMES.MAIN, TAG_ID.MAIN],
	[TAG_NAMES.MALIGNMARK, TAG_ID.MALIGNMARK],
	[TAG_NAMES.MARQUEE, TAG_ID.MARQUEE],
	[TAG_NAMES.MATH, TAG_ID.MATH],
	[TAG_NAMES.MENU, TAG_ID.MENU],
	[TAG_NAMES.META, TAG_ID.META],
	[TAG_NAMES.MGLYPH, TAG_ID.MGLYPH],
	[TAG_NAMES.MI, TAG_ID.MI],
	[TAG_NAMES.MO, TAG_ID.MO],
	[TAG_NAMES.MN, TAG_ID.MN],
	[TAG_NAMES.MS, TAG_ID.MS],
	[TAG_NAMES.MTEXT, TAG_ID.MTEXT],
	[TAG_NAMES.NAV, TAG_ID.NAV],
	[TAG_NAMES.NOBR, TAG_ID.NOBR],
	[TAG_NAMES.NOFRAMES, TAG_ID.NOFRAMES],
	[TAG_NAMES.NOEMBED, TAG_ID.NOEMBED],
	[TAG_NAMES.NOSCRIPT, TAG_ID.NOSCRIPT],
	[TAG_NAMES.OBJECT, TAG_ID.OBJECT],
	[TAG_NAMES.OL, TAG_ID.OL],
	[TAG_NAMES.OPTGROUP, TAG_ID.OPTGROUP],
	[TAG_NAMES.OPTION, TAG_ID.OPTION],
	[TAG_NAMES.P, TAG_ID.P],
	[TAG_NAMES.PARAM, TAG_ID.PARAM],
	[TAG_NAMES.PLAINTEXT, TAG_ID.PLAINTEXT],
	[TAG_NAMES.PRE, TAG_ID.PRE],
	[TAG_NAMES.RB, TAG_ID.RB],
	[TAG_NAMES.RP, TAG_ID.RP],
	[TAG_NAMES.RT, TAG_ID.RT],
	[TAG_NAMES.RTC, TAG_ID.RTC],
	[TAG_NAMES.RUBY, TAG_ID.RUBY],
	[TAG_NAMES.S, TAG_ID.S],
	[TAG_NAMES.SCRIPT, TAG_ID.SCRIPT],
	[TAG_NAMES.SEARCH, TAG_ID.SEARCH],
	[TAG_NAMES.SECTION, TAG_ID.SECTION],
	[TAG_NAMES.SELECT, TAG_ID.SELECT],
	[TAG_NAMES.SOURCE, TAG_ID.SOURCE],
	[TAG_NAMES.SMALL, TAG_ID.SMALL],
	[TAG_NAMES.SPAN, TAG_ID.SPAN],
	[TAG_NAMES.STRIKE, TAG_ID.STRIKE],
	[TAG_NAMES.STRONG, TAG_ID.STRONG],
	[TAG_NAMES.STYLE, TAG_ID.STYLE],
	[TAG_NAMES.SUB, TAG_ID.SUB],
	[TAG_NAMES.SUMMARY, TAG_ID.SUMMARY],
	[TAG_NAMES.SUP, TAG_ID.SUP],
	[TAG_NAMES.TABLE, TAG_ID.TABLE],
	[TAG_NAMES.TBODY, TAG_ID.TBODY],
	[TAG_NAMES.TEMPLATE, TAG_ID.TEMPLATE],
	[TAG_NAMES.TEXTAREA, TAG_ID.TEXTAREA],
	[TAG_NAMES.TFOOT, TAG_ID.TFOOT],
	[TAG_NAMES.TD, TAG_ID.TD],
	[TAG_NAMES.TH, TAG_ID.TH],
	[TAG_NAMES.THEAD, TAG_ID.THEAD],
	[TAG_NAMES.TITLE, TAG_ID.TITLE],
	[TAG_NAMES.TR, TAG_ID.TR],
	[TAG_NAMES.TRACK, TAG_ID.TRACK],
	[TAG_NAMES.TT, TAG_ID.TT],
	[TAG_NAMES.U, TAG_ID.U],
	[TAG_NAMES.UL, TAG_ID.UL],
	[TAG_NAMES.SVG, TAG_ID.SVG],
	[TAG_NAMES.VAR, TAG_ID.VAR],
	[TAG_NAMES.WBR, TAG_ID.WBR],
	[TAG_NAMES.XMP, TAG_ID.XMP]
]);
function getTagID(tagName) {
	var _a;
	return (_a = TAG_NAME_TO_ID.get(tagName)) !== null && _a !== void 0 ? _a : TAG_ID.UNKNOWN;
}
const $ = TAG_ID;
const SPECIAL_ELEMENTS = {
	[NS.HTML]: /* @__PURE__ */ new Set([
		$.ADDRESS,
		$.APPLET,
		$.AREA,
		$.ARTICLE,
		$.ASIDE,
		$.BASE,
		$.BASEFONT,
		$.BGSOUND,
		$.BLOCKQUOTE,
		$.BODY,
		$.BR,
		$.BUTTON,
		$.CAPTION,
		$.CENTER,
		$.COL,
		$.COLGROUP,
		$.DD,
		$.DETAILS,
		$.DIR,
		$.DIV,
		$.DL,
		$.DT,
		$.EMBED,
		$.FIELDSET,
		$.FIGCAPTION,
		$.FIGURE,
		$.FOOTER,
		$.FORM,
		$.FRAME,
		$.FRAMESET,
		$.H1,
		$.H2,
		$.H3,
		$.H4,
		$.H5,
		$.H6,
		$.HEAD,
		$.HEADER,
		$.HGROUP,
		$.HR,
		$.HTML,
		$.IFRAME,
		$.IMG,
		$.INPUT,
		$.LI,
		$.LINK,
		$.LISTING,
		$.MAIN,
		$.MARQUEE,
		$.MENU,
		$.META,
		$.NAV,
		$.NOEMBED,
		$.NOFRAMES,
		$.NOSCRIPT,
		$.OBJECT,
		$.OL,
		$.P,
		$.PARAM,
		$.PLAINTEXT,
		$.PRE,
		$.SCRIPT,
		$.SECTION,
		$.SELECT,
		$.SOURCE,
		$.STYLE,
		$.SUMMARY,
		$.TABLE,
		$.TBODY,
		$.TD,
		$.TEMPLATE,
		$.TEXTAREA,
		$.TFOOT,
		$.TH,
		$.THEAD,
		$.TITLE,
		$.TR,
		$.TRACK,
		$.UL,
		$.WBR,
		$.XMP
	]),
	[NS.MATHML]: /* @__PURE__ */ new Set([
		$.MI,
		$.MO,
		$.MN,
		$.MS,
		$.MTEXT,
		$.ANNOTATION_XML
	]),
	[NS.SVG]: /* @__PURE__ */ new Set([
		$.TITLE,
		$.FOREIGN_OBJECT,
		$.DESC
	]),
	[NS.XLINK]: /* @__PURE__ */ new Set(),
	[NS.XML]: /* @__PURE__ */ new Set(),
	[NS.XMLNS]: /* @__PURE__ */ new Set()
};
const NUMBERED_HEADERS = /* @__PURE__ */ new Set([
	$.H1,
	$.H2,
	$.H3,
	$.H4,
	$.H5,
	$.H6
]);
TAG_NAMES.STYLE, TAG_NAMES.SCRIPT, TAG_NAMES.XMP, TAG_NAMES.IFRAME, TAG_NAMES.NOEMBED, TAG_NAMES.NOFRAMES, TAG_NAMES.PLAINTEXT;
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/tokenizer/index.js
var State;
(function(State) {
	State[State["DATA"] = 0] = "DATA";
	State[State["RCDATA"] = 1] = "RCDATA";
	State[State["RAWTEXT"] = 2] = "RAWTEXT";
	State[State["SCRIPT_DATA"] = 3] = "SCRIPT_DATA";
	State[State["PLAINTEXT"] = 4] = "PLAINTEXT";
	State[State["TAG_OPEN"] = 5] = "TAG_OPEN";
	State[State["END_TAG_OPEN"] = 6] = "END_TAG_OPEN";
	State[State["TAG_NAME"] = 7] = "TAG_NAME";
	State[State["RCDATA_LESS_THAN_SIGN"] = 8] = "RCDATA_LESS_THAN_SIGN";
	State[State["RCDATA_END_TAG_OPEN"] = 9] = "RCDATA_END_TAG_OPEN";
	State[State["RCDATA_END_TAG_NAME"] = 10] = "RCDATA_END_TAG_NAME";
	State[State["RAWTEXT_LESS_THAN_SIGN"] = 11] = "RAWTEXT_LESS_THAN_SIGN";
	State[State["RAWTEXT_END_TAG_OPEN"] = 12] = "RAWTEXT_END_TAG_OPEN";
	State[State["RAWTEXT_END_TAG_NAME"] = 13] = "RAWTEXT_END_TAG_NAME";
	State[State["SCRIPT_DATA_LESS_THAN_SIGN"] = 14] = "SCRIPT_DATA_LESS_THAN_SIGN";
	State[State["SCRIPT_DATA_END_TAG_OPEN"] = 15] = "SCRIPT_DATA_END_TAG_OPEN";
	State[State["SCRIPT_DATA_END_TAG_NAME"] = 16] = "SCRIPT_DATA_END_TAG_NAME";
	State[State["SCRIPT_DATA_ESCAPE_START"] = 17] = "SCRIPT_DATA_ESCAPE_START";
	State[State["SCRIPT_DATA_ESCAPE_START_DASH"] = 18] = "SCRIPT_DATA_ESCAPE_START_DASH";
	State[State["SCRIPT_DATA_ESCAPED"] = 19] = "SCRIPT_DATA_ESCAPED";
	State[State["SCRIPT_DATA_ESCAPED_DASH"] = 20] = "SCRIPT_DATA_ESCAPED_DASH";
	State[State["SCRIPT_DATA_ESCAPED_DASH_DASH"] = 21] = "SCRIPT_DATA_ESCAPED_DASH_DASH";
	State[State["SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN"] = 22] = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN";
	State[State["SCRIPT_DATA_ESCAPED_END_TAG_OPEN"] = 23] = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN";
	State[State["SCRIPT_DATA_ESCAPED_END_TAG_NAME"] = 24] = "SCRIPT_DATA_ESCAPED_END_TAG_NAME";
	State[State["SCRIPT_DATA_DOUBLE_ESCAPE_START"] = 25] = "SCRIPT_DATA_DOUBLE_ESCAPE_START";
	State[State["SCRIPT_DATA_DOUBLE_ESCAPED"] = 26] = "SCRIPT_DATA_DOUBLE_ESCAPED";
	State[State["SCRIPT_DATA_DOUBLE_ESCAPED_DASH"] = 27] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH";
	State[State["SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH"] = 28] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH";
	State[State["SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN"] = 29] = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN";
	State[State["SCRIPT_DATA_DOUBLE_ESCAPE_END"] = 30] = "SCRIPT_DATA_DOUBLE_ESCAPE_END";
	State[State["BEFORE_ATTRIBUTE_NAME"] = 31] = "BEFORE_ATTRIBUTE_NAME";
	State[State["ATTRIBUTE_NAME"] = 32] = "ATTRIBUTE_NAME";
	State[State["AFTER_ATTRIBUTE_NAME"] = 33] = "AFTER_ATTRIBUTE_NAME";
	State[State["BEFORE_ATTRIBUTE_VALUE"] = 34] = "BEFORE_ATTRIBUTE_VALUE";
	State[State["ATTRIBUTE_VALUE_DOUBLE_QUOTED"] = 35] = "ATTRIBUTE_VALUE_DOUBLE_QUOTED";
	State[State["ATTRIBUTE_VALUE_SINGLE_QUOTED"] = 36] = "ATTRIBUTE_VALUE_SINGLE_QUOTED";
	State[State["ATTRIBUTE_VALUE_UNQUOTED"] = 37] = "ATTRIBUTE_VALUE_UNQUOTED";
	State[State["AFTER_ATTRIBUTE_VALUE_QUOTED"] = 38] = "AFTER_ATTRIBUTE_VALUE_QUOTED";
	State[State["SELF_CLOSING_START_TAG"] = 39] = "SELF_CLOSING_START_TAG";
	State[State["BOGUS_COMMENT"] = 40] = "BOGUS_COMMENT";
	State[State["MARKUP_DECLARATION_OPEN"] = 41] = "MARKUP_DECLARATION_OPEN";
	State[State["COMMENT_START"] = 42] = "COMMENT_START";
	State[State["COMMENT_START_DASH"] = 43] = "COMMENT_START_DASH";
	State[State["COMMENT"] = 44] = "COMMENT";
	State[State["COMMENT_LESS_THAN_SIGN"] = 45] = "COMMENT_LESS_THAN_SIGN";
	State[State["COMMENT_LESS_THAN_SIGN_BANG"] = 46] = "COMMENT_LESS_THAN_SIGN_BANG";
	State[State["COMMENT_LESS_THAN_SIGN_BANG_DASH"] = 47] = "COMMENT_LESS_THAN_SIGN_BANG_DASH";
	State[State["COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH"] = 48] = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH";
	State[State["COMMENT_END_DASH"] = 49] = "COMMENT_END_DASH";
	State[State["COMMENT_END"] = 50] = "COMMENT_END";
	State[State["COMMENT_END_BANG"] = 51] = "COMMENT_END_BANG";
	State[State["DOCTYPE"] = 52] = "DOCTYPE";
	State[State["BEFORE_DOCTYPE_NAME"] = 53] = "BEFORE_DOCTYPE_NAME";
	State[State["DOCTYPE_NAME"] = 54] = "DOCTYPE_NAME";
	State[State["AFTER_DOCTYPE_NAME"] = 55] = "AFTER_DOCTYPE_NAME";
	State[State["AFTER_DOCTYPE_PUBLIC_KEYWORD"] = 56] = "AFTER_DOCTYPE_PUBLIC_KEYWORD";
	State[State["BEFORE_DOCTYPE_PUBLIC_IDENTIFIER"] = 57] = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER";
	State[State["DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED"] = 58] = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED";
	State[State["DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED"] = 59] = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED";
	State[State["AFTER_DOCTYPE_PUBLIC_IDENTIFIER"] = 60] = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER";
	State[State["BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS"] = 61] = "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS";
	State[State["AFTER_DOCTYPE_SYSTEM_KEYWORD"] = 62] = "AFTER_DOCTYPE_SYSTEM_KEYWORD";
	State[State["BEFORE_DOCTYPE_SYSTEM_IDENTIFIER"] = 63] = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER";
	State[State["DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED"] = 64] = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED";
	State[State["DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED"] = 65] = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED";
	State[State["AFTER_DOCTYPE_SYSTEM_IDENTIFIER"] = 66] = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER";
	State[State["BOGUS_DOCTYPE"] = 67] = "BOGUS_DOCTYPE";
	State[State["CDATA_SECTION"] = 68] = "CDATA_SECTION";
	State[State["CDATA_SECTION_BRACKET"] = 69] = "CDATA_SECTION_BRACKET";
	State[State["CDATA_SECTION_END"] = 70] = "CDATA_SECTION_END";
	State[State["CHARACTER_REFERENCE"] = 71] = "CHARACTER_REFERENCE";
	State[State["AMBIGUOUS_AMPERSAND"] = 72] = "AMBIGUOUS_AMPERSAND";
})(State || (State = {}));
const TokenizerMode = {
	DATA: State.DATA,
	RCDATA: State.RCDATA,
	RAWTEXT: State.RAWTEXT,
	SCRIPT_DATA: State.SCRIPT_DATA,
	PLAINTEXT: State.PLAINTEXT,
	CDATA_SECTION: State.CDATA_SECTION
};
function isAsciiDigit(cp) {
	return cp >= CODE_POINTS.DIGIT_0 && cp <= CODE_POINTS.DIGIT_9;
}
function isAsciiUpper(cp) {
	return cp >= CODE_POINTS.LATIN_CAPITAL_A && cp <= CODE_POINTS.LATIN_CAPITAL_Z;
}
function isAsciiLower(cp) {
	return cp >= CODE_POINTS.LATIN_SMALL_A && cp <= CODE_POINTS.LATIN_SMALL_Z;
}
function isAsciiLetter(cp) {
	return isAsciiLower(cp) || isAsciiUpper(cp);
}
function isAsciiAlphaNumeric(cp) {
	return isAsciiLetter(cp) || isAsciiDigit(cp);
}
function toAsciiLower(cp) {
	return cp + 32;
}
function isWhitespace(cp) {
	return cp === CODE_POINTS.SPACE || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.TABULATION || cp === CODE_POINTS.FORM_FEED;
}
function isScriptDataDoubleEscapeSequenceEnd(cp) {
	return isWhitespace(cp) || cp === CODE_POINTS.SOLIDUS || cp === CODE_POINTS.GREATER_THAN_SIGN;
}
function getErrorForNumericCharacterReference(code) {
	if (code === CODE_POINTS.NULL) return ERR.nullCharacterReference;
	else if (code > 1114111) return ERR.characterReferenceOutsideUnicodeRange;
	else if (isSurrogate(code)) return ERR.surrogateCharacterReference;
	else if (isUndefinedCodePoint(code)) return ERR.noncharacterCharacterReference;
	else if (isControlCodePoint(code) || code === CODE_POINTS.CARRIAGE_RETURN) return ERR.controlCharacterReference;
	return null;
}
var Tokenizer = class {
	constructor(options, handler) {
		this.options = options;
		this.handler = handler;
		this.paused = false;
		/** Ensures that the parsing loop isn't run multiple times at once. */
		this.inLoop = false;
		/**
		* Indicates that the current adjusted node exists, is not an element in the HTML namespace,
		* and that it is not an integration point for either MathML or HTML.
		*
		* @see {@link https://html.spec.whatwg.org/multipage/parsing.html#tree-construction}
		*/
		this.inForeignNode = false;
		this.lastStartTagName = "";
		this.active = false;
		this.state = State.DATA;
		this.returnState = State.DATA;
		this.entityStartPos = 0;
		this.consumedAfterSnapshot = -1;
		this.currentCharacterToken = null;
		this.currentToken = null;
		this.currentAttr = {
			name: "",
			value: ""
		};
		this.preprocessor = new Preprocessor(handler);
		this.currentLocation = this.getCurrentLocation(-1);
		this.entityDecoder = new EntityDecoder(htmlDecodeTree, (cp, consumed) => {
			this.preprocessor.pos = this.entityStartPos + consumed - 1;
			this._flushCodePointConsumedAsCharacterReference(cp);
		}, handler.onParseError ? {
			missingSemicolonAfterCharacterReference: () => {
				this._err(ERR.missingSemicolonAfterCharacterReference, 1);
			},
			absenceOfDigitsInNumericCharacterReference: (consumed) => {
				this._err(ERR.absenceOfDigitsInNumericCharacterReference, this.entityStartPos - this.preprocessor.pos + consumed);
			},
			validateNumericCharacterReference: (code) => {
				const error = getErrorForNumericCharacterReference(code);
				if (error) this._err(error, 1);
			}
		} : void 0);
	}
	_err(code, cpOffset = 0) {
		var _a, _b;
		(_b = (_a = this.handler).onParseError) === null || _b === void 0 || _b.call(_a, this.preprocessor.getError(code, cpOffset));
	}
	getCurrentLocation(offset) {
		if (!this.options.sourceCodeLocationInfo) return null;
		return {
			startLine: this.preprocessor.line,
			startCol: this.preprocessor.col - offset,
			startOffset: this.preprocessor.offset - offset,
			endLine: -1,
			endCol: -1,
			endOffset: -1
		};
	}
	_runParsingLoop() {
		if (this.inLoop) return;
		this.inLoop = true;
		while (this.active && !this.paused) {
			this.consumedAfterSnapshot = 0;
			const cp = this._consume();
			if (!this._ensureHibernation()) this._callState(cp);
		}
		this.inLoop = false;
	}
	pause() {
		this.paused = true;
	}
	resume(writeCallback) {
		if (!this.paused) throw new Error("Parser was already resumed");
		this.paused = false;
		if (this.inLoop) return;
		this._runParsingLoop();
		if (!this.paused) writeCallback === null || writeCallback === void 0 || writeCallback();
	}
	write(chunk, isLastChunk, writeCallback) {
		this.active = true;
		this.preprocessor.write(chunk, isLastChunk);
		this._runParsingLoop();
		if (!this.paused) writeCallback === null || writeCallback === void 0 || writeCallback();
	}
	insertHtmlAtCurrentPos(chunk) {
		this.active = true;
		this.preprocessor.insertHtmlAtCurrentPos(chunk);
		this._runParsingLoop();
	}
	_ensureHibernation() {
		if (this.preprocessor.endOfChunkHit) {
			this.preprocessor.retreat(this.consumedAfterSnapshot);
			this.consumedAfterSnapshot = 0;
			this.active = false;
			return true;
		}
		return false;
	}
	_consume() {
		this.consumedAfterSnapshot++;
		return this.preprocessor.advance();
	}
	_advanceBy(count) {
		this.consumedAfterSnapshot += count;
		for (let i = 0; i < count; i++) this.preprocessor.advance();
	}
	_consumeSequenceIfMatch(pattern, caseSensitive) {
		if (this.preprocessor.startsWith(pattern, caseSensitive)) {
			this._advanceBy(pattern.length - 1);
			return true;
		}
		return false;
	}
	_createStartTagToken() {
		this.currentToken = {
			type: TokenType.START_TAG,
			tagName: "",
			tagID: TAG_ID.UNKNOWN,
			selfClosing: false,
			ackSelfClosing: false,
			attrs: [],
			location: this.getCurrentLocation(1)
		};
	}
	_createEndTagToken() {
		this.currentToken = {
			type: TokenType.END_TAG,
			tagName: "",
			tagID: TAG_ID.UNKNOWN,
			selfClosing: false,
			ackSelfClosing: false,
			attrs: [],
			location: this.getCurrentLocation(2)
		};
	}
	_createCommentToken(offset) {
		this.currentToken = {
			type: TokenType.COMMENT,
			data: "",
			location: this.getCurrentLocation(offset)
		};
	}
	_createDoctypeToken(initialName) {
		this.currentToken = {
			type: TokenType.DOCTYPE,
			name: initialName,
			forceQuirks: false,
			publicId: null,
			systemId: null,
			location: this.currentLocation
		};
	}
	_createCharacterToken(type, chars) {
		this.currentCharacterToken = {
			type,
			chars,
			location: this.currentLocation
		};
	}
	_createAttr(attrNameFirstCh) {
		this.currentAttr = {
			name: attrNameFirstCh,
			value: ""
		};
		this.currentLocation = this.getCurrentLocation(0);
	}
	_leaveAttrName() {
		var _a;
		var _b;
		const token = this.currentToken;
		if (getTokenAttr(token, this.currentAttr.name) === null) {
			token.attrs.push(this.currentAttr);
			if (token.location && this.currentLocation) {
				const attrLocations = (_a = (_b = token.location).attrs) !== null && _a !== void 0 ? _a : _b.attrs = Object.create(null);
				attrLocations[this.currentAttr.name] = this.currentLocation;
				this._leaveAttrValue();
			}
		} else this._err(ERR.duplicateAttribute);
	}
	_leaveAttrValue() {
		if (this.currentLocation) {
			this.currentLocation.endLine = this.preprocessor.line;
			this.currentLocation.endCol = this.preprocessor.col;
			this.currentLocation.endOffset = this.preprocessor.offset;
		}
	}
	prepareToken(ct) {
		this._emitCurrentCharacterToken(ct.location);
		this.currentToken = null;
		if (ct.location) {
			ct.location.endLine = this.preprocessor.line;
			ct.location.endCol = this.preprocessor.col + 1;
			ct.location.endOffset = this.preprocessor.offset + 1;
		}
		this.currentLocation = this.getCurrentLocation(-1);
	}
	emitCurrentTagToken() {
		const ct = this.currentToken;
		this.prepareToken(ct);
		ct.tagID = getTagID(ct.tagName);
		if (ct.type === TokenType.START_TAG) {
			this.lastStartTagName = ct.tagName;
			this.handler.onStartTag(ct);
		} else {
			if (ct.attrs.length > 0) this._err(ERR.endTagWithAttributes);
			if (ct.selfClosing) this._err(ERR.endTagWithTrailingSolidus);
			this.handler.onEndTag(ct);
		}
		this.preprocessor.dropParsedChunk();
	}
	emitCurrentComment(ct) {
		this.prepareToken(ct);
		this.handler.onComment(ct);
		this.preprocessor.dropParsedChunk();
	}
	emitCurrentDoctype(ct) {
		this.prepareToken(ct);
		this.handler.onDoctype(ct);
		this.preprocessor.dropParsedChunk();
	}
	_emitCurrentCharacterToken(nextLocation) {
		if (this.currentCharacterToken) {
			if (nextLocation && this.currentCharacterToken.location) {
				this.currentCharacterToken.location.endLine = nextLocation.startLine;
				this.currentCharacterToken.location.endCol = nextLocation.startCol;
				this.currentCharacterToken.location.endOffset = nextLocation.startOffset;
			}
			switch (this.currentCharacterToken.type) {
				case TokenType.CHARACTER:
					this.handler.onCharacter(this.currentCharacterToken);
					break;
				case TokenType.NULL_CHARACTER:
					this.handler.onNullCharacter(this.currentCharacterToken);
					break;
				case TokenType.WHITESPACE_CHARACTER: this.handler.onWhitespaceCharacter(this.currentCharacterToken);
			}
			this.currentCharacterToken = null;
		}
	}
	_emitEOFToken() {
		const location = this.getCurrentLocation(0);
		if (location) {
			location.endLine = location.startLine;
			location.endCol = location.startCol;
			location.endOffset = location.startOffset;
		}
		this._emitCurrentCharacterToken(location);
		this.handler.onEof({
			type: TokenType.EOF,
			location
		});
		this.active = false;
	}
	_appendCharToCurrentCharacterToken(type, ch) {
		if (this.currentCharacterToken) {
			if (this.currentCharacterToken.type === type) {
				this.currentCharacterToken.chars += ch;
				return;
			} else {
				this.currentLocation = this.getCurrentLocation(0);
				this._emitCurrentCharacterToken(this.currentLocation);
				this.preprocessor.dropParsedChunk();
			}
		}
		this._createCharacterToken(type, ch);
	}
	_emitCodePoint(cp) {
		const type = isWhitespace(cp) ? TokenType.WHITESPACE_CHARACTER : cp === CODE_POINTS.NULL ? TokenType.NULL_CHARACTER : TokenType.CHARACTER;
		this._appendCharToCurrentCharacterToken(type, cp < 65536 ? String.fromCharCode(cp) : String.fromCodePoint(cp));
	}
	_emitChars(ch) {
		this._appendCharToCurrentCharacterToken(TokenType.CHARACTER, ch);
	}
	_startCharacterReference() {
		this.returnState = this.state;
		this.state = State.CHARACTER_REFERENCE;
		this.entityStartPos = this.preprocessor.pos;
		this.entityDecoder.startEntity(this._isCharacterReferenceInAttribute() ? DecodingMode.Attribute : DecodingMode.Legacy);
	}
	_isCharacterReferenceInAttribute() {
		return this.returnState === State.ATTRIBUTE_VALUE_DOUBLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_SINGLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_UNQUOTED;
	}
	_flushCodePointConsumedAsCharacterReference(cp) {
		if (this._isCharacterReferenceInAttribute()) this.currentAttr.value += String.fromCodePoint(cp);
		else this._emitCodePoint(cp);
	}
	_callState(cp) {
		switch (this.state) {
			case State.DATA:
				this._stateData(cp);
				break;
			case State.RCDATA:
				this._stateRcdata(cp);
				break;
			case State.RAWTEXT:
				this._stateRawtext(cp);
				break;
			case State.SCRIPT_DATA:
				this._stateScriptData(cp);
				break;
			case State.PLAINTEXT:
				this._statePlaintext(cp);
				break;
			case State.TAG_OPEN:
				this._stateTagOpen(cp);
				break;
			case State.END_TAG_OPEN:
				this._stateEndTagOpen(cp);
				break;
			case State.TAG_NAME:
				this._stateTagName(cp);
				break;
			case State.RCDATA_LESS_THAN_SIGN:
				this._stateRcdataLessThanSign(cp);
				break;
			case State.RCDATA_END_TAG_OPEN:
				this._stateRcdataEndTagOpen(cp);
				break;
			case State.RCDATA_END_TAG_NAME:
				this._stateRcdataEndTagName(cp);
				break;
			case State.RAWTEXT_LESS_THAN_SIGN:
				this._stateRawtextLessThanSign(cp);
				break;
			case State.RAWTEXT_END_TAG_OPEN:
				this._stateRawtextEndTagOpen(cp);
				break;
			case State.RAWTEXT_END_TAG_NAME:
				this._stateRawtextEndTagName(cp);
				break;
			case State.SCRIPT_DATA_LESS_THAN_SIGN:
				this._stateScriptDataLessThanSign(cp);
				break;
			case State.SCRIPT_DATA_END_TAG_OPEN:
				this._stateScriptDataEndTagOpen(cp);
				break;
			case State.SCRIPT_DATA_END_TAG_NAME:
				this._stateScriptDataEndTagName(cp);
				break;
			case State.SCRIPT_DATA_ESCAPE_START:
				this._stateScriptDataEscapeStart(cp);
				break;
			case State.SCRIPT_DATA_ESCAPE_START_DASH:
				this._stateScriptDataEscapeStartDash(cp);
				break;
			case State.SCRIPT_DATA_ESCAPED:
				this._stateScriptDataEscaped(cp);
				break;
			case State.SCRIPT_DATA_ESCAPED_DASH:
				this._stateScriptDataEscapedDash(cp);
				break;
			case State.SCRIPT_DATA_ESCAPED_DASH_DASH:
				this._stateScriptDataEscapedDashDash(cp);
				break;
			case State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN:
				this._stateScriptDataEscapedLessThanSign(cp);
				break;
			case State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN:
				this._stateScriptDataEscapedEndTagOpen(cp);
				break;
			case State.SCRIPT_DATA_ESCAPED_END_TAG_NAME:
				this._stateScriptDataEscapedEndTagName(cp);
				break;
			case State.SCRIPT_DATA_DOUBLE_ESCAPE_START:
				this._stateScriptDataDoubleEscapeStart(cp);
				break;
			case State.SCRIPT_DATA_DOUBLE_ESCAPED:
				this._stateScriptDataDoubleEscaped(cp);
				break;
			case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH:
				this._stateScriptDataDoubleEscapedDash(cp);
				break;
			case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH:
				this._stateScriptDataDoubleEscapedDashDash(cp);
				break;
			case State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN:
				this._stateScriptDataDoubleEscapedLessThanSign(cp);
				break;
			case State.SCRIPT_DATA_DOUBLE_ESCAPE_END:
				this._stateScriptDataDoubleEscapeEnd(cp);
				break;
			case State.BEFORE_ATTRIBUTE_NAME:
				this._stateBeforeAttributeName(cp);
				break;
			case State.ATTRIBUTE_NAME:
				this._stateAttributeName(cp);
				break;
			case State.AFTER_ATTRIBUTE_NAME:
				this._stateAfterAttributeName(cp);
				break;
			case State.BEFORE_ATTRIBUTE_VALUE:
				this._stateBeforeAttributeValue(cp);
				break;
			case State.ATTRIBUTE_VALUE_DOUBLE_QUOTED:
				this._stateAttributeValueDoubleQuoted(cp);
				break;
			case State.ATTRIBUTE_VALUE_SINGLE_QUOTED:
				this._stateAttributeValueSingleQuoted(cp);
				break;
			case State.ATTRIBUTE_VALUE_UNQUOTED:
				this._stateAttributeValueUnquoted(cp);
				break;
			case State.AFTER_ATTRIBUTE_VALUE_QUOTED:
				this._stateAfterAttributeValueQuoted(cp);
				break;
			case State.SELF_CLOSING_START_TAG:
				this._stateSelfClosingStartTag(cp);
				break;
			case State.BOGUS_COMMENT:
				this._stateBogusComment(cp);
				break;
			case State.MARKUP_DECLARATION_OPEN:
				this._stateMarkupDeclarationOpen(cp);
				break;
			case State.COMMENT_START:
				this._stateCommentStart(cp);
				break;
			case State.COMMENT_START_DASH:
				this._stateCommentStartDash(cp);
				break;
			case State.COMMENT:
				this._stateComment(cp);
				break;
			case State.COMMENT_LESS_THAN_SIGN:
				this._stateCommentLessThanSign(cp);
				break;
			case State.COMMENT_LESS_THAN_SIGN_BANG:
				this._stateCommentLessThanSignBang(cp);
				break;
			case State.COMMENT_LESS_THAN_SIGN_BANG_DASH:
				this._stateCommentLessThanSignBangDash(cp);
				break;
			case State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH:
				this._stateCommentLessThanSignBangDashDash(cp);
				break;
			case State.COMMENT_END_DASH:
				this._stateCommentEndDash(cp);
				break;
			case State.COMMENT_END:
				this._stateCommentEnd(cp);
				break;
			case State.COMMENT_END_BANG:
				this._stateCommentEndBang(cp);
				break;
			case State.DOCTYPE:
				this._stateDoctype(cp);
				break;
			case State.BEFORE_DOCTYPE_NAME:
				this._stateBeforeDoctypeName(cp);
				break;
			case State.DOCTYPE_NAME:
				this._stateDoctypeName(cp);
				break;
			case State.AFTER_DOCTYPE_NAME:
				this._stateAfterDoctypeName(cp);
				break;
			case State.AFTER_DOCTYPE_PUBLIC_KEYWORD:
				this._stateAfterDoctypePublicKeyword(cp);
				break;
			case State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER:
				this._stateBeforeDoctypePublicIdentifier(cp);
				break;
			case State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED:
				this._stateDoctypePublicIdentifierDoubleQuoted(cp);
				break;
			case State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED:
				this._stateDoctypePublicIdentifierSingleQuoted(cp);
				break;
			case State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER:
				this._stateAfterDoctypePublicIdentifier(cp);
				break;
			case State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS:
				this._stateBetweenDoctypePublicAndSystemIdentifiers(cp);
				break;
			case State.AFTER_DOCTYPE_SYSTEM_KEYWORD:
				this._stateAfterDoctypeSystemKeyword(cp);
				break;
			case State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER:
				this._stateBeforeDoctypeSystemIdentifier(cp);
				break;
			case State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED:
				this._stateDoctypeSystemIdentifierDoubleQuoted(cp);
				break;
			case State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED:
				this._stateDoctypeSystemIdentifierSingleQuoted(cp);
				break;
			case State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER:
				this._stateAfterDoctypeSystemIdentifier(cp);
				break;
			case State.BOGUS_DOCTYPE:
				this._stateBogusDoctype(cp);
				break;
			case State.CDATA_SECTION:
				this._stateCdataSection(cp);
				break;
			case State.CDATA_SECTION_BRACKET:
				this._stateCdataSectionBracket(cp);
				break;
			case State.CDATA_SECTION_END:
				this._stateCdataSectionEnd(cp);
				break;
			case State.CHARACTER_REFERENCE:
				this._stateCharacterReference();
				break;
			case State.AMBIGUOUS_AMPERSAND:
				this._stateAmbiguousAmpersand(cp);
				break;
			default: throw new Error("Unknown state");
		}
	}
	_stateData(cp) {
		switch (cp) {
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.TAG_OPEN;
				break;
			case CODE_POINTS.AMPERSAND:
				this._startCharacterReference();
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._emitCodePoint(cp);
				break;
			case CODE_POINTS.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_stateRcdata(cp) {
		switch (cp) {
			case CODE_POINTS.AMPERSAND:
				this._startCharacterReference();
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.RCDATA_LESS_THAN_SIGN;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_stateRawtext(cp) {
		switch (cp) {
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.RAWTEXT_LESS_THAN_SIGN;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_stateScriptData(cp) {
		switch (cp) {
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.SCRIPT_DATA_LESS_THAN_SIGN;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_statePlaintext(cp) {
		switch (cp) {
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_stateTagOpen(cp) {
		if (isAsciiLetter(cp)) {
			this._createStartTagToken();
			this.state = State.TAG_NAME;
			this._stateTagName(cp);
		} else switch (cp) {
			case CODE_POINTS.EXCLAMATION_MARK:
				this.state = State.MARKUP_DECLARATION_OPEN;
				break;
			case CODE_POINTS.SOLIDUS:
				this.state = State.END_TAG_OPEN;
				break;
			case CODE_POINTS.QUESTION_MARK:
				this._err(ERR.unexpectedQuestionMarkInsteadOfTagName);
				this._createCommentToken(1);
				this.state = State.BOGUS_COMMENT;
				this._stateBogusComment(cp);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofBeforeTagName);
				this._emitChars("<");
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.invalidFirstCharacterOfTagName);
				this._emitChars("<");
				this.state = State.DATA;
				this._stateData(cp);
		}
	}
	_stateEndTagOpen(cp) {
		if (isAsciiLetter(cp)) {
			this._createEndTagToken();
			this.state = State.TAG_NAME;
			this._stateTagName(cp);
		} else switch (cp) {
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.missingEndTagName);
				this.state = State.DATA;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofBeforeTagName);
				this._emitChars("</");
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.invalidFirstCharacterOfTagName);
				this._createCommentToken(2);
				this.state = State.BOGUS_COMMENT;
				this._stateBogusComment(cp);
		}
	}
	_stateTagName(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this.state = State.BEFORE_ATTRIBUTE_NAME;
				break;
			case CODE_POINTS.SOLIDUS:
				this.state = State.SELF_CLOSING_START_TAG;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				this.emitCurrentTagToken();
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.tagName += "�";
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInTag);
				this._emitEOFToken();
				break;
			default: token.tagName += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
		}
	}
	_stateRcdataLessThanSign(cp) {
		if (cp === CODE_POINTS.SOLIDUS) this.state = State.RCDATA_END_TAG_OPEN;
		else {
			this._emitChars("<");
			this.state = State.RCDATA;
			this._stateRcdata(cp);
		}
	}
	_stateRcdataEndTagOpen(cp) {
		if (isAsciiLetter(cp)) {
			this.state = State.RCDATA_END_TAG_NAME;
			this._stateRcdataEndTagName(cp);
		} else {
			this._emitChars("</");
			this.state = State.RCDATA;
			this._stateRcdata(cp);
		}
	}
	handleSpecialEndTag(_cp) {
		if (!this.preprocessor.startsWith(this.lastStartTagName, false)) return !this._ensureHibernation();
		this._createEndTagToken();
		const token = this.currentToken;
		token.tagName = this.lastStartTagName;
		switch (this.preprocessor.peek(this.lastStartTagName.length)) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this._advanceBy(this.lastStartTagName.length);
				this.state = State.BEFORE_ATTRIBUTE_NAME;
				return false;
			case CODE_POINTS.SOLIDUS:
				this._advanceBy(this.lastStartTagName.length);
				this.state = State.SELF_CLOSING_START_TAG;
				return false;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._advanceBy(this.lastStartTagName.length);
				this.emitCurrentTagToken();
				this.state = State.DATA;
				return false;
			default: return !this._ensureHibernation();
		}
	}
	_stateRcdataEndTagName(cp) {
		if (this.handleSpecialEndTag(cp)) {
			this._emitChars("</");
			this.state = State.RCDATA;
			this._stateRcdata(cp);
		}
	}
	_stateRawtextLessThanSign(cp) {
		if (cp === CODE_POINTS.SOLIDUS) this.state = State.RAWTEXT_END_TAG_OPEN;
		else {
			this._emitChars("<");
			this.state = State.RAWTEXT;
			this._stateRawtext(cp);
		}
	}
	_stateRawtextEndTagOpen(cp) {
		if (isAsciiLetter(cp)) {
			this.state = State.RAWTEXT_END_TAG_NAME;
			this._stateRawtextEndTagName(cp);
		} else {
			this._emitChars("</");
			this.state = State.RAWTEXT;
			this._stateRawtext(cp);
		}
	}
	_stateRawtextEndTagName(cp) {
		if (this.handleSpecialEndTag(cp)) {
			this._emitChars("</");
			this.state = State.RAWTEXT;
			this._stateRawtext(cp);
		}
	}
	_stateScriptDataLessThanSign(cp) {
		switch (cp) {
			case CODE_POINTS.SOLIDUS:
				this.state = State.SCRIPT_DATA_END_TAG_OPEN;
				break;
			case CODE_POINTS.EXCLAMATION_MARK:
				this.state = State.SCRIPT_DATA_ESCAPE_START;
				this._emitChars("<!");
				break;
			default:
				this._emitChars("<");
				this.state = State.SCRIPT_DATA;
				this._stateScriptData(cp);
		}
	}
	_stateScriptDataEndTagOpen(cp) {
		if (isAsciiLetter(cp)) {
			this.state = State.SCRIPT_DATA_END_TAG_NAME;
			this._stateScriptDataEndTagName(cp);
		} else {
			this._emitChars("</");
			this.state = State.SCRIPT_DATA;
			this._stateScriptData(cp);
		}
	}
	_stateScriptDataEndTagName(cp) {
		if (this.handleSpecialEndTag(cp)) {
			this._emitChars("</");
			this.state = State.SCRIPT_DATA;
			this._stateScriptData(cp);
		}
	}
	_stateScriptDataEscapeStart(cp) {
		if (cp === CODE_POINTS.HYPHEN_MINUS) {
			this.state = State.SCRIPT_DATA_ESCAPE_START_DASH;
			this._emitChars("-");
		} else {
			this.state = State.SCRIPT_DATA;
			this._stateScriptData(cp);
		}
	}
	_stateScriptDataEscapeStartDash(cp) {
		if (cp === CODE_POINTS.HYPHEN_MINUS) {
			this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
			this._emitChars("-");
		} else {
			this.state = State.SCRIPT_DATA;
			this._stateScriptData(cp);
		}
	}
	_stateScriptDataEscaped(cp) {
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.SCRIPT_DATA_ESCAPED_DASH;
				this._emitChars("-");
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInScriptHtmlCommentLikeText);
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_stateScriptDataEscapedDash(cp) {
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
				this._emitChars("-");
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.state = State.SCRIPT_DATA_ESCAPED;
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInScriptHtmlCommentLikeText);
				this._emitEOFToken();
				break;
			default:
				this.state = State.SCRIPT_DATA_ESCAPED;
				this._emitCodePoint(cp);
		}
	}
	_stateScriptDataEscapedDashDash(cp) {
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this._emitChars("-");
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.SCRIPT_DATA;
				this._emitChars(">");
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.state = State.SCRIPT_DATA_ESCAPED;
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInScriptHtmlCommentLikeText);
				this._emitEOFToken();
				break;
			default:
				this.state = State.SCRIPT_DATA_ESCAPED;
				this._emitCodePoint(cp);
		}
	}
	_stateScriptDataEscapedLessThanSign(cp) {
		if (cp === CODE_POINTS.SOLIDUS) this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN;
		else if (isAsciiLetter(cp)) {
			this._emitChars("<");
			this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_START;
			this._stateScriptDataDoubleEscapeStart(cp);
		} else {
			this._emitChars("<");
			this.state = State.SCRIPT_DATA_ESCAPED;
			this._stateScriptDataEscaped(cp);
		}
	}
	_stateScriptDataEscapedEndTagOpen(cp) {
		if (isAsciiLetter(cp)) {
			this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_NAME;
			this._stateScriptDataEscapedEndTagName(cp);
		} else {
			this._emitChars("</");
			this.state = State.SCRIPT_DATA_ESCAPED;
			this._stateScriptDataEscaped(cp);
		}
	}
	_stateScriptDataEscapedEndTagName(cp) {
		if (this.handleSpecialEndTag(cp)) {
			this._emitChars("</");
			this.state = State.SCRIPT_DATA_ESCAPED;
			this._stateScriptDataEscaped(cp);
		}
	}
	_stateScriptDataDoubleEscapeStart(cp) {
		if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
			this._emitCodePoint(cp);
			for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) this._emitCodePoint(this._consume());
			this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
		} else if (!this._ensureHibernation()) {
			this.state = State.SCRIPT_DATA_ESCAPED;
			this._stateScriptDataEscaped(cp);
		}
	}
	_stateScriptDataDoubleEscaped(cp) {
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH;
				this._emitChars("-");
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
				this._emitChars("<");
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInScriptHtmlCommentLikeText);
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_stateScriptDataDoubleEscapedDash(cp) {
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH;
				this._emitChars("-");
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
				this._emitChars("<");
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInScriptHtmlCommentLikeText);
				this._emitEOFToken();
				break;
			default:
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
				this._emitCodePoint(cp);
		}
	}
	_stateScriptDataDoubleEscapedDashDash(cp) {
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this._emitChars("-");
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
				this._emitChars("<");
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.SCRIPT_DATA;
				this._emitChars(">");
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
				this._emitChars("�");
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInScriptHtmlCommentLikeText);
				this._emitEOFToken();
				break;
			default:
				this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
				this._emitCodePoint(cp);
		}
	}
	_stateScriptDataDoubleEscapedLessThanSign(cp) {
		if (cp === CODE_POINTS.SOLIDUS) {
			this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_END;
			this._emitChars("/");
		} else {
			this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
			this._stateScriptDataDoubleEscaped(cp);
		}
	}
	_stateScriptDataDoubleEscapeEnd(cp) {
		if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
			this._emitCodePoint(cp);
			for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) this._emitCodePoint(this._consume());
			this.state = State.SCRIPT_DATA_ESCAPED;
		} else if (!this._ensureHibernation()) {
			this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
			this._stateScriptDataDoubleEscaped(cp);
		}
	}
	_stateBeforeAttributeName(cp) {
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.SOLIDUS:
			case CODE_POINTS.GREATER_THAN_SIGN:
			case CODE_POINTS.EOF:
				this.state = State.AFTER_ATTRIBUTE_NAME;
				this._stateAfterAttributeName(cp);
				break;
			case CODE_POINTS.EQUALS_SIGN:
				this._err(ERR.unexpectedEqualsSignBeforeAttributeName);
				this._createAttr("=");
				this.state = State.ATTRIBUTE_NAME;
				break;
			default:
				this._createAttr("");
				this.state = State.ATTRIBUTE_NAME;
				this._stateAttributeName(cp);
		}
	}
	_stateAttributeName(cp) {
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
			case CODE_POINTS.SOLIDUS:
			case CODE_POINTS.GREATER_THAN_SIGN:
			case CODE_POINTS.EOF:
				this._leaveAttrName();
				this.state = State.AFTER_ATTRIBUTE_NAME;
				this._stateAfterAttributeName(cp);
				break;
			case CODE_POINTS.EQUALS_SIGN:
				this._leaveAttrName();
				this.state = State.BEFORE_ATTRIBUTE_VALUE;
				break;
			case CODE_POINTS.QUOTATION_MARK:
			case CODE_POINTS.APOSTROPHE:
			case CODE_POINTS.LESS_THAN_SIGN:
				this._err(ERR.unexpectedCharacterInAttributeName);
				this.currentAttr.name += String.fromCodePoint(cp);
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.currentAttr.name += "�";
				break;
			default: this.currentAttr.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
		}
	}
	_stateAfterAttributeName(cp) {
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.SOLIDUS:
				this.state = State.SELF_CLOSING_START_TAG;
				break;
			case CODE_POINTS.EQUALS_SIGN:
				this.state = State.BEFORE_ATTRIBUTE_VALUE;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				this.emitCurrentTagToken();
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInTag);
				this._emitEOFToken();
				break;
			default:
				this._createAttr("");
				this.state = State.ATTRIBUTE_NAME;
				this._stateAttributeName(cp);
		}
	}
	_stateBeforeAttributeValue(cp) {
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.QUOTATION_MARK:
				this.state = State.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
				break;
			case CODE_POINTS.APOSTROPHE:
				this.state = State.ATTRIBUTE_VALUE_SINGLE_QUOTED;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.missingAttributeValue);
				this.state = State.DATA;
				this.emitCurrentTagToken();
				break;
			default:
				this.state = State.ATTRIBUTE_VALUE_UNQUOTED;
				this._stateAttributeValueUnquoted(cp);
		}
	}
	_stateAttributeValueDoubleQuoted(cp) {
		switch (cp) {
			case CODE_POINTS.QUOTATION_MARK:
				this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
				break;
			case CODE_POINTS.AMPERSAND:
				this._startCharacterReference();
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.currentAttr.value += "�";
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInTag);
				this._emitEOFToken();
				break;
			default: this.currentAttr.value += String.fromCodePoint(cp);
		}
	}
	_stateAttributeValueSingleQuoted(cp) {
		switch (cp) {
			case CODE_POINTS.APOSTROPHE:
				this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
				break;
			case CODE_POINTS.AMPERSAND:
				this._startCharacterReference();
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.currentAttr.value += "�";
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInTag);
				this._emitEOFToken();
				break;
			default: this.currentAttr.value += String.fromCodePoint(cp);
		}
	}
	_stateAttributeValueUnquoted(cp) {
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this._leaveAttrValue();
				this.state = State.BEFORE_ATTRIBUTE_NAME;
				break;
			case CODE_POINTS.AMPERSAND:
				this._startCharacterReference();
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._leaveAttrValue();
				this.state = State.DATA;
				this.emitCurrentTagToken();
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this.currentAttr.value += "�";
				break;
			case CODE_POINTS.QUOTATION_MARK:
			case CODE_POINTS.APOSTROPHE:
			case CODE_POINTS.LESS_THAN_SIGN:
			case CODE_POINTS.EQUALS_SIGN:
			case CODE_POINTS.GRAVE_ACCENT:
				this._err(ERR.unexpectedCharacterInUnquotedAttributeValue);
				this.currentAttr.value += String.fromCodePoint(cp);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInTag);
				this._emitEOFToken();
				break;
			default: this.currentAttr.value += String.fromCodePoint(cp);
		}
	}
	_stateAfterAttributeValueQuoted(cp) {
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this._leaveAttrValue();
				this.state = State.BEFORE_ATTRIBUTE_NAME;
				break;
			case CODE_POINTS.SOLIDUS:
				this._leaveAttrValue();
				this.state = State.SELF_CLOSING_START_TAG;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._leaveAttrValue();
				this.state = State.DATA;
				this.emitCurrentTagToken();
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInTag);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.missingWhitespaceBetweenAttributes);
				this.state = State.BEFORE_ATTRIBUTE_NAME;
				this._stateBeforeAttributeName(cp);
		}
	}
	_stateSelfClosingStartTag(cp) {
		switch (cp) {
			case CODE_POINTS.GREATER_THAN_SIGN: {
				const token = this.currentToken;
				token.selfClosing = true;
				this.state = State.DATA;
				this.emitCurrentTagToken();
				break;
			}
			case CODE_POINTS.EOF:
				this._err(ERR.eofInTag);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.unexpectedSolidusInTag);
				this.state = State.BEFORE_ATTRIBUTE_NAME;
				this._stateBeforeAttributeName(cp);
		}
	}
	_stateBogusComment(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				this.emitCurrentComment(token);
				break;
			case CODE_POINTS.EOF:
				this.emitCurrentComment(token);
				this._emitEOFToken();
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.data += "�";
				break;
			default: token.data += String.fromCodePoint(cp);
		}
	}
	_stateMarkupDeclarationOpen(cp) {
		if (this._consumeSequenceIfMatch(SEQUENCES.DASH_DASH, true)) {
			this._createCommentToken(SEQUENCES.DASH_DASH.length + 1);
			this.state = State.COMMENT_START;
		} else if (this._consumeSequenceIfMatch(SEQUENCES.DOCTYPE, false)) {
			this.currentLocation = this.getCurrentLocation(SEQUENCES.DOCTYPE.length + 1);
			this.state = State.DOCTYPE;
		} else if (this._consumeSequenceIfMatch(SEQUENCES.CDATA_START, true)) {
			if (this.inForeignNode) this.state = State.CDATA_SECTION;
			else {
				this._err(ERR.cdataInHtmlContent);
				this._createCommentToken(SEQUENCES.CDATA_START.length + 1);
				this.currentToken.data = "[CDATA[";
				this.state = State.BOGUS_COMMENT;
			}
		} else if (!this._ensureHibernation()) {
			this._err(ERR.incorrectlyOpenedComment);
			this._createCommentToken(2);
			this.state = State.BOGUS_COMMENT;
			this._stateBogusComment(cp);
		}
	}
	_stateCommentStart(cp) {
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.COMMENT_START_DASH;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN: {
				this._err(ERR.abruptClosingOfEmptyComment);
				this.state = State.DATA;
				const token = this.currentToken;
				this.emitCurrentComment(token);
				break;
			}
			default:
				this.state = State.COMMENT;
				this._stateComment(cp);
		}
	}
	_stateCommentStartDash(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.COMMENT_END;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.abruptClosingOfEmptyComment);
				this.state = State.DATA;
				this.emitCurrentComment(token);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInComment);
				this.emitCurrentComment(token);
				this._emitEOFToken();
				break;
			default:
				token.data += "-";
				this.state = State.COMMENT;
				this._stateComment(cp);
		}
	}
	_stateComment(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.COMMENT_END_DASH;
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				token.data += "<";
				this.state = State.COMMENT_LESS_THAN_SIGN;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.data += "�";
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInComment);
				this.emitCurrentComment(token);
				this._emitEOFToken();
				break;
			default: token.data += String.fromCodePoint(cp);
		}
	}
	_stateCommentLessThanSign(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.EXCLAMATION_MARK:
				token.data += "!";
				this.state = State.COMMENT_LESS_THAN_SIGN_BANG;
				break;
			case CODE_POINTS.LESS_THAN_SIGN:
				token.data += "<";
				break;
			default:
				this.state = State.COMMENT;
				this._stateComment(cp);
		}
	}
	_stateCommentLessThanSignBang(cp) {
		if (cp === CODE_POINTS.HYPHEN_MINUS) this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH;
		else {
			this.state = State.COMMENT;
			this._stateComment(cp);
		}
	}
	_stateCommentLessThanSignBangDash(cp) {
		if (cp === CODE_POINTS.HYPHEN_MINUS) this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH;
		else {
			this.state = State.COMMENT_END_DASH;
			this._stateCommentEndDash(cp);
		}
	}
	_stateCommentLessThanSignBangDashDash(cp) {
		if (cp !== CODE_POINTS.GREATER_THAN_SIGN && cp !== CODE_POINTS.EOF) this._err(ERR.nestedComment);
		this.state = State.COMMENT_END;
		this._stateCommentEnd(cp);
	}
	_stateCommentEndDash(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				this.state = State.COMMENT_END;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInComment);
				this.emitCurrentComment(token);
				this._emitEOFToken();
				break;
			default:
				token.data += "-";
				this.state = State.COMMENT;
				this._stateComment(cp);
		}
	}
	_stateCommentEnd(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				this.emitCurrentComment(token);
				break;
			case CODE_POINTS.EXCLAMATION_MARK:
				this.state = State.COMMENT_END_BANG;
				break;
			case CODE_POINTS.HYPHEN_MINUS:
				token.data += "-";
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInComment);
				this.emitCurrentComment(token);
				this._emitEOFToken();
				break;
			default:
				token.data += "--";
				this.state = State.COMMENT;
				this._stateComment(cp);
		}
	}
	_stateCommentEndBang(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.HYPHEN_MINUS:
				token.data += "--!";
				this.state = State.COMMENT_END_DASH;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.incorrectlyClosedComment);
				this.state = State.DATA;
				this.emitCurrentComment(token);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInComment);
				this.emitCurrentComment(token);
				this._emitEOFToken();
				break;
			default:
				token.data += "--!";
				this.state = State.COMMENT;
				this._stateComment(cp);
		}
	}
	_stateDoctype(cp) {
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this.state = State.BEFORE_DOCTYPE_NAME;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.BEFORE_DOCTYPE_NAME;
				this._stateBeforeDoctypeName(cp);
				break;
			case CODE_POINTS.EOF: {
				this._err(ERR.eofInDoctype);
				this._createDoctypeToken(null);
				const token = this.currentToken;
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			}
			default:
				this._err(ERR.missingWhitespaceBeforeDoctypeName);
				this.state = State.BEFORE_DOCTYPE_NAME;
				this._stateBeforeDoctypeName(cp);
		}
	}
	_stateBeforeDoctypeName(cp) {
		if (isAsciiUpper(cp)) {
			this._createDoctypeToken(String.fromCharCode(toAsciiLower(cp)));
			this.state = State.DOCTYPE_NAME;
		} else switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				this._createDoctypeToken("�");
				this.state = State.DOCTYPE_NAME;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN: {
				this._err(ERR.missingDoctypeName);
				this._createDoctypeToken(null);
				const token = this.currentToken;
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			}
			case CODE_POINTS.EOF: {
				this._err(ERR.eofInDoctype);
				this._createDoctypeToken(null);
				const token = this.currentToken;
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			}
			default:
				this._createDoctypeToken(String.fromCodePoint(cp));
				this.state = State.DOCTYPE_NAME;
		}
	}
	_stateDoctypeName(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this.state = State.AFTER_DOCTYPE_NAME;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				this.emitCurrentDoctype(token);
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.name += "�";
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default: token.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
		}
	}
	_stateAfterDoctypeName(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				this.emitCurrentDoctype(token);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default: if (this._consumeSequenceIfMatch(SEQUENCES.PUBLIC, false)) this.state = State.AFTER_DOCTYPE_PUBLIC_KEYWORD;
			else if (this._consumeSequenceIfMatch(SEQUENCES.SYSTEM, false)) this.state = State.AFTER_DOCTYPE_SYSTEM_KEYWORD;
			else if (!this._ensureHibernation()) {
				this._err(ERR.invalidCharacterSequenceAfterDoctypeName);
				token.forceQuirks = true;
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
			}
		}
	}
	_stateAfterDoctypePublicKeyword(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this.state = State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER;
				break;
			case CODE_POINTS.QUOTATION_MARK:
				this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
				token.publicId = "";
				this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case CODE_POINTS.APOSTROPHE:
				this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
				token.publicId = "";
				this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.missingDoctypePublicIdentifier);
				token.forceQuirks = true;
				this.state = State.DATA;
				this.emitCurrentDoctype(token);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
				token.forceQuirks = true;
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
		}
	}
	_stateBeforeDoctypePublicIdentifier(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.QUOTATION_MARK:
				token.publicId = "";
				this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case CODE_POINTS.APOSTROPHE:
				token.publicId = "";
				this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.missingDoctypePublicIdentifier);
				token.forceQuirks = true;
				this.state = State.DATA;
				this.emitCurrentDoctype(token);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
				token.forceQuirks = true;
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
		}
	}
	_stateDoctypePublicIdentifierDoubleQuoted(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.QUOTATION_MARK:
				this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.publicId += "�";
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.abruptDoctypePublicIdentifier);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default: token.publicId += String.fromCodePoint(cp);
		}
	}
	_stateDoctypePublicIdentifierSingleQuoted(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.APOSTROPHE:
				this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.publicId += "�";
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.abruptDoctypePublicIdentifier);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default: token.publicId += String.fromCodePoint(cp);
		}
	}
	_stateAfterDoctypePublicIdentifier(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this.state = State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				this.emitCurrentDoctype(token);
				break;
			case CODE_POINTS.QUOTATION_MARK:
				this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case CODE_POINTS.APOSTROPHE:
				this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
		}
	}
	_stateBetweenDoctypePublicAndSystemIdentifiers(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			case CODE_POINTS.QUOTATION_MARK:
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case CODE_POINTS.APOSTROPHE:
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
		}
	}
	_stateAfterDoctypeSystemKeyword(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED:
				this.state = State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER;
				break;
			case CODE_POINTS.QUOTATION_MARK:
				this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case CODE_POINTS.APOSTROPHE:
				this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.missingDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.state = State.DATA;
				this.emitCurrentDoctype(token);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
		}
	}
	_stateBeforeDoctypeSystemIdentifier(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.QUOTATION_MARK:
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case CODE_POINTS.APOSTROPHE:
				token.systemId = "";
				this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.missingDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.state = State.DATA;
				this.emitCurrentDoctype(token);
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
		}
	}
	_stateDoctypeSystemIdentifierDoubleQuoted(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.QUOTATION_MARK:
				this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.systemId += "�";
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.abruptDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default: token.systemId += String.fromCodePoint(cp);
		}
	}
	_stateDoctypeSystemIdentifierSingleQuoted(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.APOSTROPHE:
				this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				token.systemId += "�";
				break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this._err(ERR.abruptDoctypeSystemIdentifier);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default: token.systemId += String.fromCodePoint(cp);
		}
	}
	_stateAfterDoctypeSystemIdentifier(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.SPACE:
			case CODE_POINTS.LINE_FEED:
			case CODE_POINTS.TABULATION:
			case CODE_POINTS.FORM_FEED: break;
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInDoctype);
				token.forceQuirks = true;
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
				break;
			default:
				this._err(ERR.unexpectedCharacterAfterDoctypeSystemIdentifier);
				this.state = State.BOGUS_DOCTYPE;
				this._stateBogusDoctype(cp);
		}
	}
	_stateBogusDoctype(cp) {
		const token = this.currentToken;
		switch (cp) {
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.emitCurrentDoctype(token);
				this.state = State.DATA;
				break;
			case CODE_POINTS.NULL:
				this._err(ERR.unexpectedNullCharacter);
				break;
			case CODE_POINTS.EOF:
				this.emitCurrentDoctype(token);
				this._emitEOFToken();
		}
	}
	_stateCdataSection(cp) {
		switch (cp) {
			case CODE_POINTS.RIGHT_SQUARE_BRACKET:
				this.state = State.CDATA_SECTION_BRACKET;
				break;
			case CODE_POINTS.EOF:
				this._err(ERR.eofInCdata);
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(cp);
		}
	}
	_stateCdataSectionBracket(cp) {
		if (cp === CODE_POINTS.RIGHT_SQUARE_BRACKET) this.state = State.CDATA_SECTION_END;
		else {
			this._emitChars("]");
			this.state = State.CDATA_SECTION;
			this._stateCdataSection(cp);
		}
	}
	_stateCdataSectionEnd(cp) {
		switch (cp) {
			case CODE_POINTS.GREATER_THAN_SIGN:
				this.state = State.DATA;
				break;
			case CODE_POINTS.RIGHT_SQUARE_BRACKET:
				this._emitChars("]");
				break;
			default:
				this._emitChars("]]");
				this.state = State.CDATA_SECTION;
				this._stateCdataSection(cp);
		}
	}
	_stateCharacterReference() {
		let length = this.entityDecoder.write(this.preprocessor.html, this.preprocessor.pos);
		if (length < 0) {
			if (this.preprocessor.lastChunkWritten) length = this.entityDecoder.end();
			else {
				this.active = false;
				this.preprocessor.pos = this.preprocessor.html.length - 1;
				this.consumedAfterSnapshot = 0;
				this.preprocessor.endOfChunkHit = true;
				return;
			}
		}
		if (length === 0) {
			this.preprocessor.pos = this.entityStartPos;
			this._flushCodePointConsumedAsCharacterReference(CODE_POINTS.AMPERSAND);
			this.state = !this._isCharacterReferenceInAttribute() && isAsciiAlphaNumeric(this.preprocessor.peek(1)) ? State.AMBIGUOUS_AMPERSAND : this.returnState;
		} else this.state = this.returnState;
	}
	_stateAmbiguousAmpersand(cp) {
		if (isAsciiAlphaNumeric(cp)) this._flushCodePointConsumedAsCharacterReference(cp);
		else {
			if (cp === CODE_POINTS.SEMICOLON) this._err(ERR.unknownNamedCharacterReference);
			this.state = this.returnState;
			this._callState(cp);
		}
	}
};
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/parser/open-element-stack.js
const IMPLICIT_END_TAG_REQUIRED = /* @__PURE__ */ new Set([
	TAG_ID.DD,
	TAG_ID.DT,
	TAG_ID.LI,
	TAG_ID.OPTGROUP,
	TAG_ID.OPTION,
	TAG_ID.P,
	TAG_ID.RB,
	TAG_ID.RP,
	TAG_ID.RT,
	TAG_ID.RTC
]);
const IMPLICIT_END_TAG_REQUIRED_THOROUGHLY = /* @__PURE__ */ new Set([
	...IMPLICIT_END_TAG_REQUIRED,
	TAG_ID.CAPTION,
	TAG_ID.COLGROUP,
	TAG_ID.TBODY,
	TAG_ID.TD,
	TAG_ID.TFOOT,
	TAG_ID.TH,
	TAG_ID.THEAD,
	TAG_ID.TR
]);
const SCOPING_ELEMENTS_HTML = /* @__PURE__ */ new Set([
	TAG_ID.APPLET,
	TAG_ID.CAPTION,
	TAG_ID.HTML,
	TAG_ID.MARQUEE,
	TAG_ID.OBJECT,
	TAG_ID.TABLE,
	TAG_ID.TD,
	TAG_ID.TEMPLATE,
	TAG_ID.TH
]);
const SCOPING_ELEMENTS_HTML_LIST = /* @__PURE__ */ new Set([
	...SCOPING_ELEMENTS_HTML,
	TAG_ID.OL,
	TAG_ID.UL
]);
const SCOPING_ELEMENTS_HTML_BUTTON = /* @__PURE__ */ new Set([...SCOPING_ELEMENTS_HTML, TAG_ID.BUTTON]);
const SCOPING_ELEMENTS_MATHML = /* @__PURE__ */ new Set([
	TAG_ID.ANNOTATION_XML,
	TAG_ID.MI,
	TAG_ID.MN,
	TAG_ID.MO,
	TAG_ID.MS,
	TAG_ID.MTEXT
]);
const SCOPING_ELEMENTS_SVG = /* @__PURE__ */ new Set([
	TAG_ID.DESC,
	TAG_ID.FOREIGN_OBJECT,
	TAG_ID.TITLE
]);
const TABLE_ROW_CONTEXT = /* @__PURE__ */ new Set([
	TAG_ID.TR,
	TAG_ID.TEMPLATE,
	TAG_ID.HTML
]);
const TABLE_BODY_CONTEXT = /* @__PURE__ */ new Set([
	TAG_ID.TBODY,
	TAG_ID.TFOOT,
	TAG_ID.THEAD,
	TAG_ID.TEMPLATE,
	TAG_ID.HTML
]);
const TABLE_CONTEXT = /* @__PURE__ */ new Set([
	TAG_ID.TABLE,
	TAG_ID.TEMPLATE,
	TAG_ID.HTML
]);
const TABLE_CELLS = /* @__PURE__ */ new Set([TAG_ID.TD, TAG_ID.TH]);
var OpenElementStack = class {
	get currentTmplContentOrNode() {
		return this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : this.current;
	}
	constructor(document, treeAdapter, handler) {
		this.treeAdapter = treeAdapter;
		this.handler = handler;
		this.items = [];
		this.tagIDs = [];
		this.stackTop = -1;
		this.tmplCount = 0;
		this.currentTagId = TAG_ID.UNKNOWN;
		this.current = document;
	}
	_indexOf(element) {
		return this.items.lastIndexOf(element, this.stackTop);
	}
	_isInTemplate() {
		return this.currentTagId === TAG_ID.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === NS.HTML;
	}
	_updateCurrentElement() {
		this.current = this.items[this.stackTop];
		this.currentTagId = this.tagIDs[this.stackTop];
	}
	push(element, tagID) {
		this.stackTop++;
		this.items[this.stackTop] = element;
		this.current = element;
		this.tagIDs[this.stackTop] = tagID;
		this.currentTagId = tagID;
		if (this._isInTemplate()) this.tmplCount++;
		this.handler.onItemPush(element, tagID, true);
	}
	pop() {
		const popped = this.current;
		if (this.tmplCount > 0 && this._isInTemplate()) this.tmplCount--;
		this.stackTop--;
		this._updateCurrentElement();
		this.handler.onItemPop(popped, true);
	}
	replace(oldElement, newElement) {
		const idx = this._indexOf(oldElement);
		this.items[idx] = newElement;
		if (idx === this.stackTop) this.current = newElement;
	}
	insertAfter(referenceElement, newElement, newElementID) {
		const insertionIdx = this._indexOf(referenceElement) + 1;
		this.items.splice(insertionIdx, 0, newElement);
		this.tagIDs.splice(insertionIdx, 0, newElementID);
		this.stackTop++;
		if (insertionIdx === this.stackTop) this._updateCurrentElement();
		if (this.current && this.currentTagId !== void 0) this.handler.onItemPush(this.current, this.currentTagId, insertionIdx === this.stackTop);
	}
	popUntilTagNamePopped(tagName) {
		let targetIdx = this.stackTop + 1;
		do
			targetIdx = this.tagIDs.lastIndexOf(tagName, targetIdx - 1);
		while (targetIdx > 0 && this.treeAdapter.getNamespaceURI(this.items[targetIdx]) !== NS.HTML);
		this.shortenToLength(Math.max(targetIdx, 0));
	}
	shortenToLength(idx) {
		while (this.stackTop >= idx) {
			const popped = this.current;
			if (this.tmplCount > 0 && this._isInTemplate()) this.tmplCount -= 1;
			this.stackTop--;
			this._updateCurrentElement();
			this.handler.onItemPop(popped, this.stackTop < idx);
		}
	}
	popUntilElementPopped(element) {
		const idx = this._indexOf(element);
		this.shortenToLength(Math.max(idx, 0));
	}
	popUntilPopped(tagNames, targetNS) {
		const idx = this._indexOfTagNames(tagNames, targetNS);
		this.shortenToLength(Math.max(idx, 0));
	}
	popUntilNumberedHeaderPopped() {
		this.popUntilPopped(NUMBERED_HEADERS, NS.HTML);
	}
	popUntilTableCellPopped() {
		this.popUntilPopped(TABLE_CELLS, NS.HTML);
	}
	popAllUpToHtmlElement() {
		this.tmplCount = 0;
		this.shortenToLength(1);
	}
	_indexOfTagNames(tagNames, namespace) {
		for (let i = this.stackTop; i >= 0; i--) if (tagNames.has(this.tagIDs[i]) && this.treeAdapter.getNamespaceURI(this.items[i]) === namespace) return i;
		return -1;
	}
	clearBackTo(tagNames, targetNS) {
		const idx = this._indexOfTagNames(tagNames, targetNS);
		this.shortenToLength(idx + 1);
	}
	clearBackToTableContext() {
		this.clearBackTo(TABLE_CONTEXT, NS.HTML);
	}
	clearBackToTableBodyContext() {
		this.clearBackTo(TABLE_BODY_CONTEXT, NS.HTML);
	}
	clearBackToTableRowContext() {
		this.clearBackTo(TABLE_ROW_CONTEXT, NS.HTML);
	}
	remove(element) {
		const idx = this._indexOf(element);
		if (idx >= 0) {
			if (idx === this.stackTop) this.pop();
			else {
				this.items.splice(idx, 1);
				this.tagIDs.splice(idx, 1);
				this.stackTop--;
				this._updateCurrentElement();
				this.handler.onItemPop(element, false);
			}
		}
	}
	tryPeekProperlyNestedBodyElement() {
		return this.stackTop >= 1 && this.tagIDs[1] === TAG_ID.BODY ? this.items[1] : null;
	}
	contains(element) {
		return this._indexOf(element) > -1;
	}
	getCommonAncestor(element) {
		const elementIdx = this._indexOf(element) - 1;
		return elementIdx >= 0 ? this.items[elementIdx] : null;
	}
	isRootHtmlElementCurrent() {
		return this.stackTop === 0 && this.tagIDs[0] === TAG_ID.HTML;
	}
	hasInDynamicScope(tagName, htmlScope) {
		for (let i = this.stackTop; i >= 0; i--) {
			const tn = this.tagIDs[i];
			switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
				case NS.HTML:
					if (tn === tagName) return true;
					if (htmlScope.has(tn)) return false;
					break;
				case NS.SVG:
					if (SCOPING_ELEMENTS_SVG.has(tn)) return false;
					break;
				case NS.MATHML: if (SCOPING_ELEMENTS_MATHML.has(tn)) return false;
			}
		}
		return true;
	}
	hasInScope(tagName) {
		return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML);
	}
	hasInListItemScope(tagName) {
		return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_LIST);
	}
	hasInButtonScope(tagName) {
		return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_BUTTON);
	}
	hasNumberedHeaderInScope() {
		for (let i = this.stackTop; i >= 0; i--) {
			const tn = this.tagIDs[i];
			switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
				case NS.HTML:
					if (NUMBERED_HEADERS.has(tn)) return true;
					if (SCOPING_ELEMENTS_HTML.has(tn)) return false;
					break;
				case NS.SVG:
					if (SCOPING_ELEMENTS_SVG.has(tn)) return false;
					break;
				case NS.MATHML: if (SCOPING_ELEMENTS_MATHML.has(tn)) return false;
			}
		}
		return true;
	}
	hasInTableScope(tagName) {
		for (let i = this.stackTop; i >= 0; i--) {
			if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) continue;
			switch (this.tagIDs[i]) {
				case tagName: return true;
				case TAG_ID.TABLE:
				case TAG_ID.HTML: return false;
			}
		}
		return true;
	}
	hasTableBodyContextInTableScope() {
		for (let i = this.stackTop; i >= 0; i--) {
			if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) continue;
			switch (this.tagIDs[i]) {
				case TAG_ID.TBODY:
				case TAG_ID.THEAD:
				case TAG_ID.TFOOT: return true;
				case TAG_ID.TABLE:
				case TAG_ID.HTML: return false;
			}
		}
		return true;
	}
	hasInSelectScope(tagName) {
		for (let i = this.stackTop; i >= 0; i--) {
			if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) continue;
			switch (this.tagIDs[i]) {
				case tagName: return true;
				case TAG_ID.OPTION:
				case TAG_ID.OPTGROUP: break;
				default: return false;
			}
		}
		return true;
	}
	generateImpliedEndTags() {
		while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED.has(this.currentTagId)) this.pop();
	}
	generateImpliedEndTagsThoroughly() {
		while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) this.pop();
	}
	generateImpliedEndTagsWithExclusion(exclusionId) {
		while (this.currentTagId !== void 0 && this.currentTagId !== exclusionId && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) this.pop();
	}
};
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/parser/formatting-element-list.js
const NOAH_ARK_CAPACITY = 3;
var EntryType;
(function(EntryType) {
	EntryType[EntryType["Marker"] = 0] = "Marker";
	EntryType[EntryType["Element"] = 1] = "Element";
})(EntryType || (EntryType = {}));
const MARKER = { type: EntryType.Marker };
var FormattingElementList = class {
	constructor(treeAdapter) {
		this.treeAdapter = treeAdapter;
		this.entries = [];
		this.bookmark = null;
	}
	_getNoahArkConditionCandidates(newElement, neAttrs) {
		const candidates = [];
		const neAttrsLength = neAttrs.length;
		const neTagName = this.treeAdapter.getTagName(newElement);
		const neNamespaceURI = this.treeAdapter.getNamespaceURI(newElement);
		for (let i = 0; i < this.entries.length; i++) {
			const entry = this.entries[i];
			if (entry.type === EntryType.Marker) break;
			const { element } = entry;
			if (this.treeAdapter.getTagName(element) === neTagName && this.treeAdapter.getNamespaceURI(element) === neNamespaceURI) {
				const elementAttrs = this.treeAdapter.getAttrList(element);
				if (elementAttrs.length === neAttrsLength) candidates.push({
					idx: i,
					attrs: elementAttrs
				});
			}
		}
		return candidates;
	}
	_ensureNoahArkCondition(newElement) {
		if (this.entries.length < NOAH_ARK_CAPACITY) return;
		const neAttrs = this.treeAdapter.getAttrList(newElement);
		const candidates = this._getNoahArkConditionCandidates(newElement, neAttrs);
		if (candidates.length < NOAH_ARK_CAPACITY) return;
		const neAttrsMap = new Map(neAttrs.map((neAttr) => [neAttr.name, neAttr.value]));
		let validCandidates = 0;
		for (let i = 0; i < candidates.length; i++) {
			const candidate = candidates[i];
			if (candidate.attrs.every((cAttr) => neAttrsMap.get(cAttr.name) === cAttr.value)) {
				validCandidates += 1;
				if (validCandidates >= NOAH_ARK_CAPACITY) this.entries.splice(candidate.idx, 1);
			}
		}
	}
	insertMarker() {
		this.entries.unshift(MARKER);
	}
	pushElement(element, token) {
		this._ensureNoahArkCondition(element);
		this.entries.unshift({
			type: EntryType.Element,
			element,
			token
		});
	}
	insertElementAfterBookmark(element, token) {
		const bookmarkIdx = this.entries.indexOf(this.bookmark);
		this.entries.splice(bookmarkIdx, 0, {
			type: EntryType.Element,
			element,
			token
		});
	}
	removeEntry(entry) {
		const entryIndex = this.entries.indexOf(entry);
		if (entryIndex !== -1) this.entries.splice(entryIndex, 1);
	}
	/**
	* Clears the list of formatting elements up to the last marker.
	*
	* @see https://html.spec.whatwg.org/multipage/parsing.html#clear-the-list-of-active-formatting-elements-up-to-the-last-marker
	*/
	clearToLastMarker() {
		const markerIdx = this.entries.indexOf(MARKER);
		if (markerIdx === -1) this.entries.length = 0;
		else this.entries.splice(0, markerIdx + 1);
	}
	getElementEntryInScopeWithTagName(tagName) {
		const entry = this.entries.find((entry) => entry.type === EntryType.Marker || this.treeAdapter.getTagName(entry.element) === tagName);
		return entry && entry.type === EntryType.Element ? entry : null;
	}
	getElementEntry(element) {
		return this.entries.find((entry) => entry.type === EntryType.Element && entry.element === element);
	}
};
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/tree-adapters/default.js
const defaultTreeAdapter = {
	createDocument() {
		return {
			nodeName: "#document",
			mode: DOCUMENT_MODE.NO_QUIRKS,
			childNodes: []
		};
	},
	createDocumentFragment() {
		return {
			nodeName: "#document-fragment",
			childNodes: []
		};
	},
	createElement(tagName, namespaceURI, attrs) {
		return {
			nodeName: tagName,
			tagName,
			attrs,
			namespaceURI,
			childNodes: [],
			parentNode: null
		};
	},
	createCommentNode(data) {
		return {
			nodeName: "#comment",
			data,
			parentNode: null
		};
	},
	createTextNode(value) {
		return {
			nodeName: "#text",
			value,
			parentNode: null
		};
	},
	appendChild(parentNode, newNode) {
		parentNode.childNodes.push(newNode);
		newNode.parentNode = parentNode;
	},
	insertBefore(parentNode, newNode, referenceNode) {
		const insertionIdx = parentNode.childNodes.indexOf(referenceNode);
		parentNode.childNodes.splice(insertionIdx, 0, newNode);
		newNode.parentNode = parentNode;
	},
	setTemplateContent(templateElement, contentElement) {
		templateElement.content = contentElement;
	},
	getTemplateContent(templateElement) {
		return templateElement.content;
	},
	setDocumentType(document, name, publicId, systemId) {
		const doctypeNode = document.childNodes.find((node) => node.nodeName === "#documentType");
		if (doctypeNode) {
			doctypeNode.name = name;
			doctypeNode.publicId = publicId;
			doctypeNode.systemId = systemId;
		} else {
			const node = {
				nodeName: "#documentType",
				name,
				publicId,
				systemId,
				parentNode: null
			};
			defaultTreeAdapter.appendChild(document, node);
		}
	},
	setDocumentMode(document, mode) {
		document.mode = mode;
	},
	getDocumentMode(document) {
		return document.mode;
	},
	detachNode(node) {
		if (node.parentNode) {
			const idx = node.parentNode.childNodes.indexOf(node);
			node.parentNode.childNodes.splice(idx, 1);
			node.parentNode = null;
		}
	},
	insertText(parentNode, text) {
		if (parentNode.childNodes.length > 0) {
			const prevNode = parentNode.childNodes[parentNode.childNodes.length - 1];
			if (defaultTreeAdapter.isTextNode(prevNode)) {
				prevNode.value += text;
				return;
			}
		}
		defaultTreeAdapter.appendChild(parentNode, defaultTreeAdapter.createTextNode(text));
	},
	insertTextBefore(parentNode, text, referenceNode) {
		const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
		if (prevNode && defaultTreeAdapter.isTextNode(prevNode)) prevNode.value += text;
		else defaultTreeAdapter.insertBefore(parentNode, defaultTreeAdapter.createTextNode(text), referenceNode);
	},
	adoptAttributes(recipient, attrs) {
		const recipientAttrsMap = new Set(recipient.attrs.map((attr) => attr.name));
		for (let j = 0; j < attrs.length; j++) if (!recipientAttrsMap.has(attrs[j].name)) recipient.attrs.push(attrs[j]);
	},
	getFirstChild(node) {
		return node.childNodes[0];
	},
	getChildNodes(node) {
		return node.childNodes;
	},
	getParentNode(node) {
		return node.parentNode;
	},
	getAttrList(element) {
		return element.attrs;
	},
	getTagName(element) {
		return element.tagName;
	},
	getNamespaceURI(element) {
		return element.namespaceURI;
	},
	getTextNodeContent(textNode) {
		return textNode.value;
	},
	getCommentNodeContent(commentNode) {
		return commentNode.data;
	},
	getDocumentTypeNodeName(doctypeNode) {
		return doctypeNode.name;
	},
	getDocumentTypeNodePublicId(doctypeNode) {
		return doctypeNode.publicId;
	},
	getDocumentTypeNodeSystemId(doctypeNode) {
		return doctypeNode.systemId;
	},
	isTextNode(node) {
		return node.nodeName === "#text";
	},
	isCommentNode(node) {
		return node.nodeName === "#comment";
	},
	isDocumentTypeNode(node) {
		return node.nodeName === "#documentType";
	},
	isElementNode(node) {
		return Object.prototype.hasOwnProperty.call(node, "tagName");
	},
	setNodeSourceCodeLocation(node, location) {
		node.sourceCodeLocation = location;
	},
	getNodeSourceCodeLocation(node) {
		return node.sourceCodeLocation;
	},
	updateNodeSourceCodeLocation(node, endLocation) {
		node.sourceCodeLocation = {
			...node.sourceCodeLocation,
			...endLocation
		};
	}
};
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/common/doctype.js
const VALID_DOCTYPE_NAME = "html";
const VALID_SYSTEM_ID = "about:legacy-compat";
const QUIRKS_MODE_SYSTEM_ID = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd";
const QUIRKS_MODE_PUBLIC_ID_PREFIXES = [
	"+//silmaril//dtd html pro v0r11 19970101//",
	"-//as//dtd html 3.0 aswedit + extensions//",
	"-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
	"-//ietf//dtd html 2.0 level 1//",
	"-//ietf//dtd html 2.0 level 2//",
	"-//ietf//dtd html 2.0 strict level 1//",
	"-//ietf//dtd html 2.0 strict level 2//",
	"-//ietf//dtd html 2.0 strict//",
	"-//ietf//dtd html 2.0//",
	"-//ietf//dtd html 2.1e//",
	"-//ietf//dtd html 3.0//",
	"-//ietf//dtd html 3.2 final//",
	"-//ietf//dtd html 3.2//",
	"-//ietf//dtd html 3//",
	"-//ietf//dtd html level 0//",
	"-//ietf//dtd html level 1//",
	"-//ietf//dtd html level 2//",
	"-//ietf//dtd html level 3//",
	"-//ietf//dtd html strict level 0//",
	"-//ietf//dtd html strict level 1//",
	"-//ietf//dtd html strict level 2//",
	"-//ietf//dtd html strict level 3//",
	"-//ietf//dtd html strict//",
	"-//ietf//dtd html//",
	"-//metrius//dtd metrius presentational//",
	"-//microsoft//dtd internet explorer 2.0 html strict//",
	"-//microsoft//dtd internet explorer 2.0 html//",
	"-//microsoft//dtd internet explorer 2.0 tables//",
	"-//microsoft//dtd internet explorer 3.0 html strict//",
	"-//microsoft//dtd internet explorer 3.0 html//",
	"-//microsoft//dtd internet explorer 3.0 tables//",
	"-//netscape comm. corp.//dtd html//",
	"-//netscape comm. corp.//dtd strict html//",
	"-//o'reilly and associates//dtd html 2.0//",
	"-//o'reilly and associates//dtd html extended 1.0//",
	"-//o'reilly and associates//dtd html extended relaxed 1.0//",
	"-//sq//dtd html 2.0 hotmetal + extensions//",
	"-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//",
	"-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//",
	"-//spyglass//dtd html 2.0 extended//",
	"-//sun microsystems corp.//dtd hotjava html//",
	"-//sun microsystems corp.//dtd hotjava strict html//",
	"-//w3c//dtd html 3 1995-03-24//",
	"-//w3c//dtd html 3.2 draft//",
	"-//w3c//dtd html 3.2 final//",
	"-//w3c//dtd html 3.2//",
	"-//w3c//dtd html 3.2s draft//",
	"-//w3c//dtd html 4.0 frameset//",
	"-//w3c//dtd html 4.0 transitional//",
	"-//w3c//dtd html experimental 19960712//",
	"-//w3c//dtd html experimental 970421//",
	"-//w3c//dtd w3 html//",
	"-//w3o//dtd w3 html 3.0//",
	"-//webtechs//dtd mozilla html 2.0//",
	"-//webtechs//dtd mozilla html//"
];
const QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
	...QUIRKS_MODE_PUBLIC_ID_PREFIXES,
	"-//w3c//dtd html 4.01 frameset//",
	"-//w3c//dtd html 4.01 transitional//"
];
const QUIRKS_MODE_PUBLIC_IDS = /* @__PURE__ */ new Set([
	"-//w3o//dtd w3 html strict 3.0//en//",
	"-/w3c/dtd html 4.0 transitional/en",
	"html"
]);
const LIMITED_QUIRKS_PUBLIC_ID_PREFIXES = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"];
const LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
	...LIMITED_QUIRKS_PUBLIC_ID_PREFIXES,
	"-//w3c//dtd html 4.01 frameset//",
	"-//w3c//dtd html 4.01 transitional//"
];
function hasPrefix(publicId, prefixes) {
	return prefixes.some((prefix) => publicId.startsWith(prefix));
}
function isConforming(token) {
	return token.name === VALID_DOCTYPE_NAME && token.publicId === null && (token.systemId === null || token.systemId === VALID_SYSTEM_ID);
}
function getDocumentMode(token) {
	if (token.name !== VALID_DOCTYPE_NAME) return DOCUMENT_MODE.QUIRKS;
	const { systemId } = token;
	if (systemId && systemId.toLowerCase() === QUIRKS_MODE_SYSTEM_ID) return DOCUMENT_MODE.QUIRKS;
	let { publicId } = token;
	if (publicId !== null) {
		publicId = publicId.toLowerCase();
		if (QUIRKS_MODE_PUBLIC_IDS.has(publicId)) return DOCUMENT_MODE.QUIRKS;
		let prefixes = systemId === null ? QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES : QUIRKS_MODE_PUBLIC_ID_PREFIXES;
		if (hasPrefix(publicId, prefixes)) return DOCUMENT_MODE.QUIRKS;
		prefixes = systemId === null ? LIMITED_QUIRKS_PUBLIC_ID_PREFIXES : LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES;
		if (hasPrefix(publicId, prefixes)) return DOCUMENT_MODE.LIMITED_QUIRKS;
	}
	return DOCUMENT_MODE.NO_QUIRKS;
}
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/common/foreign-content.js
const MIME_TYPES = {
	TEXT_HTML: "text/html",
	APPLICATION_XML: "application/xhtml+xml"
};
const DEFINITION_URL_ATTR = "definitionurl";
const ADJUSTED_DEFINITION_URL_ATTR = "definitionURL";
const SVG_ATTRS_ADJUSTMENT_MAP = new Map([
	"attributeName",
	"attributeType",
	"baseFrequency",
	"baseProfile",
	"calcMode",
	"clipPathUnits",
	"diffuseConstant",
	"edgeMode",
	"filterUnits",
	"glyphRef",
	"gradientTransform",
	"gradientUnits",
	"kernelMatrix",
	"kernelUnitLength",
	"keyPoints",
	"keySplines",
	"keyTimes",
	"lengthAdjust",
	"limitingConeAngle",
	"markerHeight",
	"markerUnits",
	"markerWidth",
	"maskContentUnits",
	"maskUnits",
	"numOctaves",
	"pathLength",
	"patternContentUnits",
	"patternTransform",
	"patternUnits",
	"pointsAtX",
	"pointsAtY",
	"pointsAtZ",
	"preserveAlpha",
	"preserveAspectRatio",
	"primitiveUnits",
	"refX",
	"refY",
	"repeatCount",
	"repeatDur",
	"requiredExtensions",
	"requiredFeatures",
	"specularConstant",
	"specularExponent",
	"spreadMethod",
	"startOffset",
	"stdDeviation",
	"stitchTiles",
	"surfaceScale",
	"systemLanguage",
	"tableValues",
	"targetX",
	"targetY",
	"textLength",
	"viewBox",
	"viewTarget",
	"xChannelSelector",
	"yChannelSelector",
	"zoomAndPan"
].map((attr) => [attr.toLowerCase(), attr]));
const XML_ATTRS_ADJUSTMENT_MAP = /* @__PURE__ */ new Map([
	["xlink:actuate", {
		prefix: "xlink",
		name: "actuate",
		namespace: NS.XLINK
	}],
	["xlink:arcrole", {
		prefix: "xlink",
		name: "arcrole",
		namespace: NS.XLINK
	}],
	["xlink:href", {
		prefix: "xlink",
		name: "href",
		namespace: NS.XLINK
	}],
	["xlink:role", {
		prefix: "xlink",
		name: "role",
		namespace: NS.XLINK
	}],
	["xlink:show", {
		prefix: "xlink",
		name: "show",
		namespace: NS.XLINK
	}],
	["xlink:title", {
		prefix: "xlink",
		name: "title",
		namespace: NS.XLINK
	}],
	["xlink:type", {
		prefix: "xlink",
		name: "type",
		namespace: NS.XLINK
	}],
	["xml:lang", {
		prefix: "xml",
		name: "lang",
		namespace: NS.XML
	}],
	["xml:space", {
		prefix: "xml",
		name: "space",
		namespace: NS.XML
	}],
	["xmlns", {
		prefix: "",
		name: "xmlns",
		namespace: NS.XMLNS
	}],
	["xmlns:xlink", {
		prefix: "xmlns",
		name: "xlink",
		namespace: NS.XMLNS
	}]
]);
const SVG_TAG_NAMES_ADJUSTMENT_MAP = new Map([
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"clipPath",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"foreignObject",
	"glyphRef",
	"linearGradient",
	"radialGradient",
	"textPath"
].map((tn) => [tn.toLowerCase(), tn]));
const EXITS_FOREIGN_CONTENT = /* @__PURE__ */ new Set([
	TAG_ID.B,
	TAG_ID.BIG,
	TAG_ID.BLOCKQUOTE,
	TAG_ID.BODY,
	TAG_ID.BR,
	TAG_ID.CENTER,
	TAG_ID.CODE,
	TAG_ID.DD,
	TAG_ID.DIV,
	TAG_ID.DL,
	TAG_ID.DT,
	TAG_ID.EM,
	TAG_ID.EMBED,
	TAG_ID.H1,
	TAG_ID.H2,
	TAG_ID.H3,
	TAG_ID.H4,
	TAG_ID.H5,
	TAG_ID.H6,
	TAG_ID.HEAD,
	TAG_ID.HR,
	TAG_ID.I,
	TAG_ID.IMG,
	TAG_ID.LI,
	TAG_ID.LISTING,
	TAG_ID.MENU,
	TAG_ID.META,
	TAG_ID.NOBR,
	TAG_ID.OL,
	TAG_ID.P,
	TAG_ID.PRE,
	TAG_ID.RUBY,
	TAG_ID.S,
	TAG_ID.SMALL,
	TAG_ID.SPAN,
	TAG_ID.STRONG,
	TAG_ID.STRIKE,
	TAG_ID.SUB,
	TAG_ID.SUP,
	TAG_ID.TABLE,
	TAG_ID.TT,
	TAG_ID.U,
	TAG_ID.UL,
	TAG_ID.VAR
]);
function causesExit(startTagToken) {
	const tn = startTagToken.tagID;
	return tn === TAG_ID.FONT && startTagToken.attrs.some(({ name }) => name === ATTRS.COLOR || name === ATTRS.SIZE || name === ATTRS.FACE) || EXITS_FOREIGN_CONTENT.has(tn);
}
function adjustTokenMathMLAttrs(token) {
	for (let i = 0; i < token.attrs.length; i++) if (token.attrs[i].name === DEFINITION_URL_ATTR) {
		token.attrs[i].name = ADJUSTED_DEFINITION_URL_ATTR;
		break;
	}
}
function adjustTokenSVGAttrs(token) {
	for (let i = 0; i < token.attrs.length; i++) {
		const adjustedAttrName = SVG_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
		if (adjustedAttrName != null) token.attrs[i].name = adjustedAttrName;
	}
}
function adjustTokenXMLAttrs(token) {
	for (let i = 0; i < token.attrs.length; i++) {
		const adjustedAttrEntry = XML_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
		if (adjustedAttrEntry) {
			token.attrs[i].prefix = adjustedAttrEntry.prefix;
			token.attrs[i].name = adjustedAttrEntry.name;
			token.attrs[i].namespace = adjustedAttrEntry.namespace;
		}
	}
}
function adjustTokenSVGTagName(token) {
	const adjustedTagName = SVG_TAG_NAMES_ADJUSTMENT_MAP.get(token.tagName);
	if (adjustedTagName != null) {
		token.tagName = adjustedTagName;
		token.tagID = getTagID(token.tagName);
	}
}
function isMathMLTextIntegrationPoint(tn, ns) {
	return ns === NS.MATHML && (tn === TAG_ID.MI || tn === TAG_ID.MO || tn === TAG_ID.MN || tn === TAG_ID.MS || tn === TAG_ID.MTEXT);
}
function isHtmlIntegrationPoint(tn, ns, attrs) {
	if (ns === NS.MATHML && tn === TAG_ID.ANNOTATION_XML) {
		for (let i = 0; i < attrs.length; i++) if (attrs[i].name === ATTRS.ENCODING) {
			const value = attrs[i].value.toLowerCase();
			return value === MIME_TYPES.TEXT_HTML || value === MIME_TYPES.APPLICATION_XML;
		}
	}
	return ns === NS.SVG && (tn === TAG_ID.FOREIGN_OBJECT || tn === TAG_ID.DESC || tn === TAG_ID.TITLE);
}
function isIntegrationPoint(tn, ns, attrs, foreignNS) {
	return (!foreignNS || foreignNS === NS.HTML) && isHtmlIntegrationPoint(tn, ns, attrs) || (!foreignNS || foreignNS === NS.MATHML) && isMathMLTextIntegrationPoint(tn, ns);
}
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/parser/index.js
const HIDDEN_INPUT_TYPE = "hidden";
const AA_OUTER_LOOP_ITER = 8;
const AA_INNER_LOOP_ITER = 3;
var InsertionMode;
(function(InsertionMode) {
	InsertionMode[InsertionMode["INITIAL"] = 0] = "INITIAL";
	InsertionMode[InsertionMode["BEFORE_HTML"] = 1] = "BEFORE_HTML";
	InsertionMode[InsertionMode["BEFORE_HEAD"] = 2] = "BEFORE_HEAD";
	InsertionMode[InsertionMode["IN_HEAD"] = 3] = "IN_HEAD";
	InsertionMode[InsertionMode["IN_HEAD_NO_SCRIPT"] = 4] = "IN_HEAD_NO_SCRIPT";
	InsertionMode[InsertionMode["AFTER_HEAD"] = 5] = "AFTER_HEAD";
	InsertionMode[InsertionMode["IN_BODY"] = 6] = "IN_BODY";
	InsertionMode[InsertionMode["TEXT"] = 7] = "TEXT";
	InsertionMode[InsertionMode["IN_TABLE"] = 8] = "IN_TABLE";
	InsertionMode[InsertionMode["IN_TABLE_TEXT"] = 9] = "IN_TABLE_TEXT";
	InsertionMode[InsertionMode["IN_CAPTION"] = 10] = "IN_CAPTION";
	InsertionMode[InsertionMode["IN_COLUMN_GROUP"] = 11] = "IN_COLUMN_GROUP";
	InsertionMode[InsertionMode["IN_TABLE_BODY"] = 12] = "IN_TABLE_BODY";
	InsertionMode[InsertionMode["IN_ROW"] = 13] = "IN_ROW";
	InsertionMode[InsertionMode["IN_CELL"] = 14] = "IN_CELL";
	InsertionMode[InsertionMode["IN_SELECT"] = 15] = "IN_SELECT";
	InsertionMode[InsertionMode["IN_SELECT_IN_TABLE"] = 16] = "IN_SELECT_IN_TABLE";
	InsertionMode[InsertionMode["IN_TEMPLATE"] = 17] = "IN_TEMPLATE";
	InsertionMode[InsertionMode["AFTER_BODY"] = 18] = "AFTER_BODY";
	InsertionMode[InsertionMode["IN_FRAMESET"] = 19] = "IN_FRAMESET";
	InsertionMode[InsertionMode["AFTER_FRAMESET"] = 20] = "AFTER_FRAMESET";
	InsertionMode[InsertionMode["AFTER_AFTER_BODY"] = 21] = "AFTER_AFTER_BODY";
	InsertionMode[InsertionMode["AFTER_AFTER_FRAMESET"] = 22] = "AFTER_AFTER_FRAMESET";
})(InsertionMode || (InsertionMode = {}));
const BASE_LOC = {
	startLine: -1,
	startCol: -1,
	startOffset: -1,
	endLine: -1,
	endCol: -1,
	endOffset: -1
};
const TABLE_STRUCTURE_TAGS = /* @__PURE__ */ new Set([
	TAG_ID.TABLE,
	TAG_ID.TBODY,
	TAG_ID.TFOOT,
	TAG_ID.THEAD,
	TAG_ID.TR
]);
const defaultParserOptions = {
	scriptingEnabled: true,
	sourceCodeLocationInfo: false,
	treeAdapter: defaultTreeAdapter,
	onParseError: null
};
var Parser = class {
	constructor(options, document, fragmentContext = null, scriptHandler = null) {
		this.fragmentContext = fragmentContext;
		this.scriptHandler = scriptHandler;
		this.currentToken = null;
		this.stopped = false;
		/** @internal */
		this.insertionMode = InsertionMode.INITIAL;
		/** @internal */
		this.originalInsertionMode = InsertionMode.INITIAL;
		/** @internal */
		this.headElement = null;
		/** @internal */
		this.formElement = null;
		/** Indicates that the current node is not an element in the HTML namespace */
		this.currentNotInHTML = false;
		/**
		* The template insertion mode stack is maintained from the left.
		* Ie. the topmost element will always have index 0.
		*
		* @internal
		*/
		this.tmplInsertionModeStack = [];
		/** @internal */
		this.pendingCharacterTokens = [];
		/** @internal */
		this.hasNonWhitespacePendingCharacterToken = false;
		/** @internal */
		this.framesetOk = true;
		/** @internal */
		this.skipNextNewLine = false;
		/** @internal */
		this.fosterParentingEnabled = false;
		this.options = {
			...defaultParserOptions,
			...options
		};
		this.treeAdapter = this.options.treeAdapter;
		this.onParseError = this.options.onParseError;
		if (this.onParseError) this.options.sourceCodeLocationInfo = true;
		this.document = document !== null && document !== void 0 ? document : this.treeAdapter.createDocument();
		this.tokenizer = new Tokenizer(this.options, this);
		this.activeFormattingElements = new FormattingElementList(this.treeAdapter);
		this.fragmentContextID = fragmentContext ? getTagID(this.treeAdapter.getTagName(fragmentContext)) : TAG_ID.UNKNOWN;
		this._setContextModes(fragmentContext !== null && fragmentContext !== void 0 ? fragmentContext : this.document, this.fragmentContextID);
		this.openElements = new OpenElementStack(this.document, this.treeAdapter, this);
	}
	static parse(html, options) {
		const parser = new this(options);
		parser.tokenizer.write(html, true);
		return parser.document;
	}
	static getFragmentParser(fragmentContext, options) {
		const opts = {
			...defaultParserOptions,
			...options
		};
		fragmentContext !== null && fragmentContext !== void 0 || (fragmentContext = opts.treeAdapter.createElement(TAG_NAMES.TEMPLATE, NS.HTML, []));
		const documentMock = opts.treeAdapter.createElement("documentmock", NS.HTML, []);
		const parser = new this(opts, documentMock, fragmentContext);
		if (parser.fragmentContextID === TAG_ID.TEMPLATE) parser.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
		parser._initTokenizerForFragmentParsing();
		parser._insertFakeRootElement();
		parser._resetInsertionMode();
		parser._findFormInFragmentContext();
		return parser;
	}
	getFragment() {
		const rootElement = this.treeAdapter.getFirstChild(this.document);
		const fragment = this.treeAdapter.createDocumentFragment();
		this._adoptNodes(rootElement, fragment);
		return fragment;
	}
	/** @internal */
	_err(token, code, beforeToken) {
		var _a;
		if (!this.onParseError) return;
		const loc = (_a = token.location) !== null && _a !== void 0 ? _a : BASE_LOC;
		const err = {
			code,
			startLine: loc.startLine,
			startCol: loc.startCol,
			startOffset: loc.startOffset,
			endLine: beforeToken ? loc.startLine : loc.endLine,
			endCol: beforeToken ? loc.startCol : loc.endCol,
			endOffset: beforeToken ? loc.startOffset : loc.endOffset
		};
		this.onParseError(err);
	}
	/** @internal */
	onItemPush(node, tid, isTop) {
		var _a, _b;
		(_b = (_a = this.treeAdapter).onItemPush) === null || _b === void 0 || _b.call(_a, node);
		if (isTop && this.openElements.stackTop > 0) this._setContextModes(node, tid);
	}
	/** @internal */
	onItemPop(node, isTop) {
		var _a, _b;
		if (this.options.sourceCodeLocationInfo) this._setEndLocation(node, this.currentToken);
		(_b = (_a = this.treeAdapter).onItemPop) === null || _b === void 0 || _b.call(_a, node, this.openElements.current);
		if (isTop) {
			let current;
			let currentTagId;
			if (this.openElements.stackTop === 0 && this.fragmentContext) {
				current = this.fragmentContext;
				currentTagId = this.fragmentContextID;
			} else ({current, currentTagId} = this.openElements);
			this._setContextModes(current, currentTagId);
		}
	}
	_setContextModes(current, tid) {
		const isHTML = current === this.document || current && this.treeAdapter.getNamespaceURI(current) === NS.HTML;
		this.currentNotInHTML = !isHTML;
		this.tokenizer.inForeignNode = !isHTML && current !== void 0 && tid !== void 0 && !this._isIntegrationPoint(tid, current);
	}
	/** @protected */
	_switchToTextParsing(currentToken, nextTokenizerState) {
		this._insertElement(currentToken, NS.HTML);
		this.tokenizer.state = nextTokenizerState;
		this.originalInsertionMode = this.insertionMode;
		this.insertionMode = InsertionMode.TEXT;
	}
	switchToPlaintextParsing() {
		this.insertionMode = InsertionMode.TEXT;
		this.originalInsertionMode = InsertionMode.IN_BODY;
		this.tokenizer.state = TokenizerMode.PLAINTEXT;
	}
	/** @protected */
	_getAdjustedCurrentElement() {
		return this.openElements.stackTop === 0 && this.fragmentContext ? this.fragmentContext : this.openElements.current;
	}
	/** @protected */
	_findFormInFragmentContext() {
		let node = this.fragmentContext;
		while (node) {
			if (this.treeAdapter.getTagName(node) === TAG_NAMES.FORM) {
				this.formElement = node;
				break;
			}
			node = this.treeAdapter.getParentNode(node);
		}
	}
	_initTokenizerForFragmentParsing() {
		if (!this.fragmentContext || this.treeAdapter.getNamespaceURI(this.fragmentContext) !== NS.HTML) return;
		switch (this.fragmentContextID) {
			case TAG_ID.TITLE:
			case TAG_ID.TEXTAREA:
				this.tokenizer.state = TokenizerMode.RCDATA;
				break;
			case TAG_ID.STYLE:
			case TAG_ID.XMP:
			case TAG_ID.IFRAME:
			case TAG_ID.NOEMBED:
			case TAG_ID.NOFRAMES:
			case TAG_ID.NOSCRIPT:
				this.tokenizer.state = TokenizerMode.RAWTEXT;
				break;
			case TAG_ID.SCRIPT:
				this.tokenizer.state = TokenizerMode.SCRIPT_DATA;
				break;
			case TAG_ID.PLAINTEXT: this.tokenizer.state = TokenizerMode.PLAINTEXT;
		}
	}
	/** @protected */
	_setDocumentType(token) {
		const name = token.name || "";
		const publicId = token.publicId || "";
		const systemId = token.systemId || "";
		this.treeAdapter.setDocumentType(this.document, name, publicId, systemId);
		if (token.location) {
			const docTypeNode = this.treeAdapter.getChildNodes(this.document).find((node) => this.treeAdapter.isDocumentTypeNode(node));
			if (docTypeNode) this.treeAdapter.setNodeSourceCodeLocation(docTypeNode, token.location);
		}
	}
	/** @protected */
	_attachElementToTree(element, location) {
		if (this.options.sourceCodeLocationInfo) {
			const loc = location && {
				...location,
				startTag: location
			};
			this.treeAdapter.setNodeSourceCodeLocation(element, loc);
		}
		if (this._shouldFosterParentOnInsertion()) this._fosterParentElement(element);
		else {
			const parent = this.openElements.currentTmplContentOrNode;
			this.treeAdapter.appendChild(parent !== null && parent !== void 0 ? parent : this.document, element);
		}
	}
	/**
	* For self-closing tags. Add an element to the tree, but skip adding it
	* to the stack.
	*/
	/** @protected */
	_appendElement(token, namespaceURI) {
		const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
		this._attachElementToTree(element, token.location);
	}
	/** @protected */
	_insertElement(token, namespaceURI) {
		const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
		this._attachElementToTree(element, token.location);
		this.openElements.push(element, token.tagID);
	}
	/** @protected */
	_insertFakeElement(tagName, tagID) {
		const element = this.treeAdapter.createElement(tagName, NS.HTML, []);
		this._attachElementToTree(element, null);
		this.openElements.push(element, tagID);
	}
	/** @protected */
	_insertTemplate(token) {
		const tmpl = this.treeAdapter.createElement(token.tagName, NS.HTML, token.attrs);
		const content = this.treeAdapter.createDocumentFragment();
		this.treeAdapter.setTemplateContent(tmpl, content);
		this._attachElementToTree(tmpl, token.location);
		this.openElements.push(tmpl, token.tagID);
		if (this.options.sourceCodeLocationInfo) this.treeAdapter.setNodeSourceCodeLocation(content, null);
	}
	/** @protected */
	_insertFakeRootElement() {
		const element = this.treeAdapter.createElement(TAG_NAMES.HTML, NS.HTML, []);
		if (this.options.sourceCodeLocationInfo) this.treeAdapter.setNodeSourceCodeLocation(element, null);
		this.treeAdapter.appendChild(this.openElements.current, element);
		this.openElements.push(element, TAG_ID.HTML);
	}
	/** @protected */
	_appendCommentNode(token, parent) {
		const commentNode = this.treeAdapter.createCommentNode(token.data);
		this.treeAdapter.appendChild(parent, commentNode);
		if (this.options.sourceCodeLocationInfo) this.treeAdapter.setNodeSourceCodeLocation(commentNode, token.location);
	}
	/** @protected */
	_insertCharacters(token) {
		let parent;
		let beforeElement;
		if (this._shouldFosterParentOnInsertion()) {
			({parent, beforeElement} = this._findFosterParentingLocation());
			if (beforeElement) this.treeAdapter.insertTextBefore(parent, token.chars, beforeElement);
			else this.treeAdapter.insertText(parent, token.chars);
		} else {
			parent = this.openElements.currentTmplContentOrNode;
			this.treeAdapter.insertText(parent, token.chars);
		}
		if (!token.location) return;
		const siblings = this.treeAdapter.getChildNodes(parent);
		const textNode = siblings[(beforeElement ? siblings.lastIndexOf(beforeElement) : siblings.length) - 1];
		if (this.treeAdapter.getNodeSourceCodeLocation(textNode)) {
			const { endLine, endCol, endOffset } = token.location;
			this.treeAdapter.updateNodeSourceCodeLocation(textNode, {
				endLine,
				endCol,
				endOffset
			});
		} else if (this.options.sourceCodeLocationInfo) this.treeAdapter.setNodeSourceCodeLocation(textNode, token.location);
	}
	/** @protected */
	_adoptNodes(donor, recipient) {
		for (let child = this.treeAdapter.getFirstChild(donor); child; child = this.treeAdapter.getFirstChild(donor)) {
			this.treeAdapter.detachNode(child);
			this.treeAdapter.appendChild(recipient, child);
		}
	}
	/** @protected */
	_setEndLocation(element, closingToken) {
		if (this.treeAdapter.getNodeSourceCodeLocation(element) && closingToken.location) {
			const ctLoc = closingToken.location;
			const tn = this.treeAdapter.getTagName(element);
			const endLoc = closingToken.type === TokenType.END_TAG && tn === closingToken.tagName ? {
				endTag: { ...ctLoc },
				endLine: ctLoc.endLine,
				endCol: ctLoc.endCol,
				endOffset: ctLoc.endOffset
			} : {
				endLine: ctLoc.startLine,
				endCol: ctLoc.startCol,
				endOffset: ctLoc.startOffset
			};
			this.treeAdapter.updateNodeSourceCodeLocation(element, endLoc);
		}
	}
	shouldProcessStartTagTokenInForeignContent(token) {
		if (!this.currentNotInHTML) return false;
		let current;
		let currentTagId;
		if (this.openElements.stackTop === 0 && this.fragmentContext) {
			current = this.fragmentContext;
			currentTagId = this.fragmentContextID;
		} else ({current, currentTagId} = this.openElements);
		if (token.tagID === TAG_ID.SVG && this.treeAdapter.getTagName(current) === TAG_NAMES.ANNOTATION_XML && this.treeAdapter.getNamespaceURI(current) === NS.MATHML) return false;
		return this.tokenizer.inForeignNode || (token.tagID === TAG_ID.MGLYPH || token.tagID === TAG_ID.MALIGNMARK) && currentTagId !== void 0 && !this._isIntegrationPoint(currentTagId, current, NS.HTML);
	}
	/** @protected */
	_processToken(token) {
		switch (token.type) {
			case TokenType.CHARACTER:
				this.onCharacter(token);
				break;
			case TokenType.NULL_CHARACTER:
				this.onNullCharacter(token);
				break;
			case TokenType.COMMENT:
				this.onComment(token);
				break;
			case TokenType.DOCTYPE:
				this.onDoctype(token);
				break;
			case TokenType.START_TAG:
				this._processStartTag(token);
				break;
			case TokenType.END_TAG:
				this.onEndTag(token);
				break;
			case TokenType.EOF:
				this.onEof(token);
				break;
			case TokenType.WHITESPACE_CHARACTER: this.onWhitespaceCharacter(token);
		}
	}
	/** @protected */
	_isIntegrationPoint(tid, element, foreignNS) {
		return isIntegrationPoint(tid, this.treeAdapter.getNamespaceURI(element), this.treeAdapter.getAttrList(element), foreignNS);
	}
	/** @protected */
	_reconstructActiveFormattingElements() {
		const listLength = this.activeFormattingElements.entries.length;
		if (listLength) {
			const endIndex = this.activeFormattingElements.entries.findIndex((entry) => entry.type === EntryType.Marker || this.openElements.contains(entry.element));
			const unopenIdx = endIndex === -1 ? listLength - 1 : endIndex - 1;
			for (let i = unopenIdx; i >= 0; i--) {
				const entry = this.activeFormattingElements.entries[i];
				this._insertElement(entry.token, this.treeAdapter.getNamespaceURI(entry.element));
				entry.element = this.openElements.current;
			}
		}
	}
	/** @protected */
	_closeTableCell() {
		this.openElements.generateImpliedEndTags();
		this.openElements.popUntilTableCellPopped();
		this.activeFormattingElements.clearToLastMarker();
		this.insertionMode = InsertionMode.IN_ROW;
	}
	/** @protected */
	_closePElement() {
		this.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.P);
		this.openElements.popUntilTagNamePopped(TAG_ID.P);
	}
	/** @protected */
	_resetInsertionMode() {
		for (let i = this.openElements.stackTop; i >= 0; i--) switch (i === 0 && this.fragmentContext ? this.fragmentContextID : this.openElements.tagIDs[i]) {
			case TAG_ID.TR:
				this.insertionMode = InsertionMode.IN_ROW;
				return;
			case TAG_ID.TBODY:
			case TAG_ID.THEAD:
			case TAG_ID.TFOOT:
				this.insertionMode = InsertionMode.IN_TABLE_BODY;
				return;
			case TAG_ID.CAPTION:
				this.insertionMode = InsertionMode.IN_CAPTION;
				return;
			case TAG_ID.COLGROUP:
				this.insertionMode = InsertionMode.IN_COLUMN_GROUP;
				return;
			case TAG_ID.TABLE:
				this.insertionMode = InsertionMode.IN_TABLE;
				return;
			case TAG_ID.BODY:
				this.insertionMode = InsertionMode.IN_BODY;
				return;
			case TAG_ID.FRAMESET:
				this.insertionMode = InsertionMode.IN_FRAMESET;
				return;
			case TAG_ID.SELECT:
				this._resetInsertionModeForSelect(i);
				return;
			case TAG_ID.TEMPLATE:
				this.insertionMode = this.tmplInsertionModeStack[0];
				return;
			case TAG_ID.HTML:
				this.insertionMode = this.headElement ? InsertionMode.AFTER_HEAD : InsertionMode.BEFORE_HEAD;
				return;
			case TAG_ID.TD:
			case TAG_ID.TH:
				if (i > 0) {
					this.insertionMode = InsertionMode.IN_CELL;
					return;
				}
				break;
			case TAG_ID.HEAD: if (i > 0) {
				this.insertionMode = InsertionMode.IN_HEAD;
				return;
			}
		}
		this.insertionMode = InsertionMode.IN_BODY;
	}
	/** @protected */
	_resetInsertionModeForSelect(selectIdx) {
		if (selectIdx > 0) for (let i = selectIdx - 1; i > 0; i--) {
			const tn = this.openElements.tagIDs[i];
			if (tn === TAG_ID.TEMPLATE) break;
			else if (tn === TAG_ID.TABLE) {
				this.insertionMode = InsertionMode.IN_SELECT_IN_TABLE;
				return;
			}
		}
		this.insertionMode = InsertionMode.IN_SELECT;
	}
	/** @protected */
	_isElementCausesFosterParenting(tn) {
		return TABLE_STRUCTURE_TAGS.has(tn);
	}
	/** @protected */
	_shouldFosterParentOnInsertion() {
		return this.fosterParentingEnabled && this.openElements.currentTagId !== void 0 && this._isElementCausesFosterParenting(this.openElements.currentTagId);
	}
	/** @protected */
	_findFosterParentingLocation() {
		for (let i = this.openElements.stackTop; i >= 0; i--) {
			const openElement = this.openElements.items[i];
			switch (this.openElements.tagIDs[i]) {
				case TAG_ID.TEMPLATE:
					if (this.treeAdapter.getNamespaceURI(openElement) === NS.HTML) return {
						parent: this.treeAdapter.getTemplateContent(openElement),
						beforeElement: null
					};
					break;
				case TAG_ID.TABLE: {
					const parent = this.treeAdapter.getParentNode(openElement);
					if (parent) return {
						parent,
						beforeElement: openElement
					};
					return {
						parent: this.openElements.items[i - 1],
						beforeElement: null
					};
				}
			}
		}
		return {
			parent: this.openElements.items[0],
			beforeElement: null
		};
	}
	/** @protected */
	_fosterParentElement(element) {
		const location = this._findFosterParentingLocation();
		if (location.beforeElement) this.treeAdapter.insertBefore(location.parent, element, location.beforeElement);
		else this.treeAdapter.appendChild(location.parent, element);
	}
	/** @protected */
	_isSpecialElement(element, id) {
		const ns = this.treeAdapter.getNamespaceURI(element);
		return SPECIAL_ELEMENTS[ns].has(id);
	}
	/** @internal */
	onCharacter(token) {
		this.skipNextNewLine = false;
		if (this.tokenizer.inForeignNode) {
			characterInForeignContent(this, token);
			return;
		}
		switch (this.insertionMode) {
			case InsertionMode.INITIAL:
				tokenInInitialMode(this, token);
				break;
			case InsertionMode.BEFORE_HTML:
				tokenBeforeHtml(this, token);
				break;
			case InsertionMode.BEFORE_HEAD:
				tokenBeforeHead(this, token);
				break;
			case InsertionMode.IN_HEAD:
				tokenInHead(this, token);
				break;
			case InsertionMode.IN_HEAD_NO_SCRIPT:
				tokenInHeadNoScript(this, token);
				break;
			case InsertionMode.AFTER_HEAD:
				tokenAfterHead(this, token);
				break;
			case InsertionMode.IN_BODY:
			case InsertionMode.IN_CAPTION:
			case InsertionMode.IN_CELL:
			case InsertionMode.IN_TEMPLATE:
				characterInBody(this, token);
				break;
			case InsertionMode.TEXT:
			case InsertionMode.IN_SELECT:
			case InsertionMode.IN_SELECT_IN_TABLE:
				this._insertCharacters(token);
				break;
			case InsertionMode.IN_TABLE:
			case InsertionMode.IN_TABLE_BODY:
			case InsertionMode.IN_ROW:
				characterInTable(this, token);
				break;
			case InsertionMode.IN_TABLE_TEXT:
				characterInTableText(this, token);
				break;
			case InsertionMode.IN_COLUMN_GROUP:
				tokenInColumnGroup(this, token);
				break;
			case InsertionMode.AFTER_BODY:
				tokenAfterBody(this, token);
				break;
			case InsertionMode.AFTER_AFTER_BODY: tokenAfterAfterBody(this, token);
		}
	}
	/** @internal */
	onNullCharacter(token) {
		this.skipNextNewLine = false;
		if (this.tokenizer.inForeignNode) {
			nullCharacterInForeignContent(this, token);
			return;
		}
		switch (this.insertionMode) {
			case InsertionMode.INITIAL:
				tokenInInitialMode(this, token);
				break;
			case InsertionMode.BEFORE_HTML:
				tokenBeforeHtml(this, token);
				break;
			case InsertionMode.BEFORE_HEAD:
				tokenBeforeHead(this, token);
				break;
			case InsertionMode.IN_HEAD:
				tokenInHead(this, token);
				break;
			case InsertionMode.IN_HEAD_NO_SCRIPT:
				tokenInHeadNoScript(this, token);
				break;
			case InsertionMode.AFTER_HEAD:
				tokenAfterHead(this, token);
				break;
			case InsertionMode.TEXT:
				this._insertCharacters(token);
				break;
			case InsertionMode.IN_TABLE:
			case InsertionMode.IN_TABLE_BODY:
			case InsertionMode.IN_ROW:
				characterInTable(this, token);
				break;
			case InsertionMode.IN_COLUMN_GROUP:
				tokenInColumnGroup(this, token);
				break;
			case InsertionMode.AFTER_BODY:
				tokenAfterBody(this, token);
				break;
			case InsertionMode.AFTER_AFTER_BODY: tokenAfterAfterBody(this, token);
		}
	}
	/** @internal */
	onComment(token) {
		this.skipNextNewLine = false;
		if (this.currentNotInHTML) {
			appendComment(this, token);
			return;
		}
		switch (this.insertionMode) {
			case InsertionMode.INITIAL:
			case InsertionMode.BEFORE_HTML:
			case InsertionMode.BEFORE_HEAD:
			case InsertionMode.IN_HEAD:
			case InsertionMode.IN_HEAD_NO_SCRIPT:
			case InsertionMode.AFTER_HEAD:
			case InsertionMode.IN_BODY:
			case InsertionMode.IN_TABLE:
			case InsertionMode.IN_CAPTION:
			case InsertionMode.IN_COLUMN_GROUP:
			case InsertionMode.IN_TABLE_BODY:
			case InsertionMode.IN_ROW:
			case InsertionMode.IN_CELL:
			case InsertionMode.IN_SELECT:
			case InsertionMode.IN_SELECT_IN_TABLE:
			case InsertionMode.IN_TEMPLATE:
			case InsertionMode.IN_FRAMESET:
			case InsertionMode.AFTER_FRAMESET:
				appendComment(this, token);
				break;
			case InsertionMode.IN_TABLE_TEXT:
				tokenInTableText(this, token);
				break;
			case InsertionMode.AFTER_BODY:
				appendCommentToRootHtmlElement(this, token);
				break;
			case InsertionMode.AFTER_AFTER_BODY:
			case InsertionMode.AFTER_AFTER_FRAMESET: appendCommentToDocument(this, token);
		}
	}
	/** @internal */
	onDoctype(token) {
		this.skipNextNewLine = false;
		switch (this.insertionMode) {
			case InsertionMode.INITIAL:
				doctypeInInitialMode(this, token);
				break;
			case InsertionMode.BEFORE_HEAD:
			case InsertionMode.IN_HEAD:
			case InsertionMode.IN_HEAD_NO_SCRIPT:
			case InsertionMode.AFTER_HEAD:
				this._err(token, ERR.misplacedDoctype);
				break;
			case InsertionMode.IN_TABLE_TEXT: tokenInTableText(this, token);
		}
	}
	/** @internal */
	onStartTag(token) {
		this.skipNextNewLine = false;
		this.currentToken = token;
		this._processStartTag(token);
		if (token.selfClosing && !token.ackSelfClosing) this._err(token, ERR.nonVoidHtmlElementStartTagWithTrailingSolidus);
	}
	/**
	* Processes a given start tag.
	*
	* `onStartTag` checks if a self-closing tag was recognized. When a token
	* is moved inbetween multiple insertion modes, this check for self-closing
	* could lead to false positives. To avoid this, `_processStartTag` is used
	* for nested calls.
	*
	* @param token The token to process.
	* @protected
	*/
	_processStartTag(token) {
		if (this.shouldProcessStartTagTokenInForeignContent(token)) startTagInForeignContent(this, token);
		else this._startTagOutsideForeignContent(token);
	}
	/** @protected */
	_startTagOutsideForeignContent(token) {
		switch (this.insertionMode) {
			case InsertionMode.INITIAL:
				tokenInInitialMode(this, token);
				break;
			case InsertionMode.BEFORE_HTML:
				startTagBeforeHtml(this, token);
				break;
			case InsertionMode.BEFORE_HEAD:
				startTagBeforeHead(this, token);
				break;
			case InsertionMode.IN_HEAD:
				startTagInHead(this, token);
				break;
			case InsertionMode.IN_HEAD_NO_SCRIPT:
				startTagInHeadNoScript(this, token);
				break;
			case InsertionMode.AFTER_HEAD:
				startTagAfterHead(this, token);
				break;
			case InsertionMode.IN_BODY:
				startTagInBody(this, token);
				break;
			case InsertionMode.IN_TABLE:
				startTagInTable(this, token);
				break;
			case InsertionMode.IN_TABLE_TEXT:
				tokenInTableText(this, token);
				break;
			case InsertionMode.IN_CAPTION:
				startTagInCaption(this, token);
				break;
			case InsertionMode.IN_COLUMN_GROUP:
				startTagInColumnGroup(this, token);
				break;
			case InsertionMode.IN_TABLE_BODY:
				startTagInTableBody(this, token);
				break;
			case InsertionMode.IN_ROW:
				startTagInRow(this, token);
				break;
			case InsertionMode.IN_CELL:
				startTagInCell(this, token);
				break;
			case InsertionMode.IN_SELECT:
				startTagInSelect(this, token);
				break;
			case InsertionMode.IN_SELECT_IN_TABLE:
				startTagInSelectInTable(this, token);
				break;
			case InsertionMode.IN_TEMPLATE:
				startTagInTemplate(this, token);
				break;
			case InsertionMode.AFTER_BODY:
				startTagAfterBody(this, token);
				break;
			case InsertionMode.IN_FRAMESET:
				startTagInFrameset(this, token);
				break;
			case InsertionMode.AFTER_FRAMESET:
				startTagAfterFrameset(this, token);
				break;
			case InsertionMode.AFTER_AFTER_BODY:
				startTagAfterAfterBody(this, token);
				break;
			case InsertionMode.AFTER_AFTER_FRAMESET: startTagAfterAfterFrameset(this, token);
		}
	}
	/** @internal */
	onEndTag(token) {
		this.skipNextNewLine = false;
		this.currentToken = token;
		if (this.currentNotInHTML) endTagInForeignContent(this, token);
		else this._endTagOutsideForeignContent(token);
	}
	/** @protected */
	_endTagOutsideForeignContent(token) {
		switch (this.insertionMode) {
			case InsertionMode.INITIAL:
				tokenInInitialMode(this, token);
				break;
			case InsertionMode.BEFORE_HTML:
				endTagBeforeHtml(this, token);
				break;
			case InsertionMode.BEFORE_HEAD:
				endTagBeforeHead(this, token);
				break;
			case InsertionMode.IN_HEAD:
				endTagInHead(this, token);
				break;
			case InsertionMode.IN_HEAD_NO_SCRIPT:
				endTagInHeadNoScript(this, token);
				break;
			case InsertionMode.AFTER_HEAD:
				endTagAfterHead(this, token);
				break;
			case InsertionMode.IN_BODY:
				endTagInBody(this, token);
				break;
			case InsertionMode.TEXT:
				endTagInText(this, token);
				break;
			case InsertionMode.IN_TABLE:
				endTagInTable(this, token);
				break;
			case InsertionMode.IN_TABLE_TEXT:
				tokenInTableText(this, token);
				break;
			case InsertionMode.IN_CAPTION:
				endTagInCaption(this, token);
				break;
			case InsertionMode.IN_COLUMN_GROUP:
				endTagInColumnGroup(this, token);
				break;
			case InsertionMode.IN_TABLE_BODY:
				endTagInTableBody(this, token);
				break;
			case InsertionMode.IN_ROW:
				endTagInRow(this, token);
				break;
			case InsertionMode.IN_CELL:
				endTagInCell(this, token);
				break;
			case InsertionMode.IN_SELECT:
				endTagInSelect(this, token);
				break;
			case InsertionMode.IN_SELECT_IN_TABLE:
				endTagInSelectInTable(this, token);
				break;
			case InsertionMode.IN_TEMPLATE:
				endTagInTemplate(this, token);
				break;
			case InsertionMode.AFTER_BODY:
				endTagAfterBody(this, token);
				break;
			case InsertionMode.IN_FRAMESET:
				endTagInFrameset(this, token);
				break;
			case InsertionMode.AFTER_FRAMESET:
				endTagAfterFrameset(this, token);
				break;
			case InsertionMode.AFTER_AFTER_BODY: tokenAfterAfterBody(this, token);
		}
	}
	/** @internal */
	onEof(token) {
		switch (this.insertionMode) {
			case InsertionMode.INITIAL:
				tokenInInitialMode(this, token);
				break;
			case InsertionMode.BEFORE_HTML:
				tokenBeforeHtml(this, token);
				break;
			case InsertionMode.BEFORE_HEAD:
				tokenBeforeHead(this, token);
				break;
			case InsertionMode.IN_HEAD:
				tokenInHead(this, token);
				break;
			case InsertionMode.IN_HEAD_NO_SCRIPT:
				tokenInHeadNoScript(this, token);
				break;
			case InsertionMode.AFTER_HEAD:
				tokenAfterHead(this, token);
				break;
			case InsertionMode.IN_BODY:
			case InsertionMode.IN_TABLE:
			case InsertionMode.IN_CAPTION:
			case InsertionMode.IN_COLUMN_GROUP:
			case InsertionMode.IN_TABLE_BODY:
			case InsertionMode.IN_ROW:
			case InsertionMode.IN_CELL:
			case InsertionMode.IN_SELECT:
			case InsertionMode.IN_SELECT_IN_TABLE:
				eofInBody(this, token);
				break;
			case InsertionMode.TEXT:
				eofInText(this, token);
				break;
			case InsertionMode.IN_TABLE_TEXT:
				tokenInTableText(this, token);
				break;
			case InsertionMode.IN_TEMPLATE:
				eofInTemplate(this, token);
				break;
			case InsertionMode.AFTER_BODY:
			case InsertionMode.IN_FRAMESET:
			case InsertionMode.AFTER_FRAMESET:
			case InsertionMode.AFTER_AFTER_BODY:
			case InsertionMode.AFTER_AFTER_FRAMESET: stopParsing(this, token);
		}
	}
	/** @internal */
	onWhitespaceCharacter(token) {
		if (this.skipNextNewLine) {
			this.skipNextNewLine = false;
			if (token.chars.charCodeAt(0) === CODE_POINTS.LINE_FEED) {
				if (token.chars.length === 1) return;
				token.chars = token.chars.substr(1);
			}
		}
		if (this.tokenizer.inForeignNode) {
			this._insertCharacters(token);
			return;
		}
		switch (this.insertionMode) {
			case InsertionMode.IN_HEAD:
			case InsertionMode.IN_HEAD_NO_SCRIPT:
			case InsertionMode.AFTER_HEAD:
			case InsertionMode.TEXT:
			case InsertionMode.IN_COLUMN_GROUP:
			case InsertionMode.IN_SELECT:
			case InsertionMode.IN_SELECT_IN_TABLE:
			case InsertionMode.IN_FRAMESET:
			case InsertionMode.AFTER_FRAMESET:
				this._insertCharacters(token);
				break;
			case InsertionMode.IN_BODY:
			case InsertionMode.IN_CAPTION:
			case InsertionMode.IN_CELL:
			case InsertionMode.IN_TEMPLATE:
			case InsertionMode.AFTER_BODY:
			case InsertionMode.AFTER_AFTER_BODY:
			case InsertionMode.AFTER_AFTER_FRAMESET:
				whitespaceCharacterInBody(this, token);
				break;
			case InsertionMode.IN_TABLE:
			case InsertionMode.IN_TABLE_BODY:
			case InsertionMode.IN_ROW:
				characterInTable(this, token);
				break;
			case InsertionMode.IN_TABLE_TEXT: whitespaceCharacterInTableText(this, token);
		}
	}
};
function aaObtainFormattingElementEntry(p, token) {
	let formattingElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(token.tagName);
	if (formattingElementEntry) {
		if (!p.openElements.contains(formattingElementEntry.element)) {
			p.activeFormattingElements.removeEntry(formattingElementEntry);
			formattingElementEntry = null;
		} else if (!p.openElements.hasInScope(token.tagID)) formattingElementEntry = null;
	} else genericEndTagInBody(p, token);
	return formattingElementEntry;
}
function aaObtainFurthestBlock(p, formattingElementEntry) {
	let furthestBlock = null;
	let idx = p.openElements.stackTop;
	for (; idx >= 0; idx--) {
		const element = p.openElements.items[idx];
		if (element === formattingElementEntry.element) break;
		if (p._isSpecialElement(element, p.openElements.tagIDs[idx])) furthestBlock = element;
	}
	if (!furthestBlock) {
		p.openElements.shortenToLength(Math.max(idx, 0));
		p.activeFormattingElements.removeEntry(formattingElementEntry);
	}
	return furthestBlock;
}
function aaInnerLoop(p, furthestBlock, formattingElement) {
	let lastElement = furthestBlock;
	let nextElement = p.openElements.getCommonAncestor(furthestBlock);
	for (let i = 0, element = nextElement; element !== formattingElement; i++, element = nextElement) {
		nextElement = p.openElements.getCommonAncestor(element);
		const elementEntry = p.activeFormattingElements.getElementEntry(element);
		const counterOverflow = elementEntry && i >= AA_INNER_LOOP_ITER;
		if (!elementEntry || counterOverflow) {
			if (counterOverflow) p.activeFormattingElements.removeEntry(elementEntry);
			p.openElements.remove(element);
		} else {
			element = aaRecreateElementFromEntry(p, elementEntry);
			if (lastElement === furthestBlock) p.activeFormattingElements.bookmark = elementEntry;
			p.treeAdapter.detachNode(lastElement);
			p.treeAdapter.appendChild(element, lastElement);
			lastElement = element;
		}
	}
	return lastElement;
}
function aaRecreateElementFromEntry(p, elementEntry) {
	const ns = p.treeAdapter.getNamespaceURI(elementEntry.element);
	const newElement = p.treeAdapter.createElement(elementEntry.token.tagName, ns, elementEntry.token.attrs);
	p.openElements.replace(elementEntry.element, newElement);
	elementEntry.element = newElement;
	return newElement;
}
function aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement) {
	const tid = getTagID(p.treeAdapter.getTagName(commonAncestor));
	if (p._isElementCausesFosterParenting(tid)) p._fosterParentElement(lastElement);
	else {
		const ns = p.treeAdapter.getNamespaceURI(commonAncestor);
		if (tid === TAG_ID.TEMPLATE && ns === NS.HTML) commonAncestor = p.treeAdapter.getTemplateContent(commonAncestor);
		p.treeAdapter.appendChild(commonAncestor, lastElement);
	}
}
function aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry) {
	const ns = p.treeAdapter.getNamespaceURI(formattingElementEntry.element);
	const { token } = formattingElementEntry;
	const newElement = p.treeAdapter.createElement(token.tagName, ns, token.attrs);
	p._adoptNodes(furthestBlock, newElement);
	p.treeAdapter.appendChild(furthestBlock, newElement);
	p.activeFormattingElements.insertElementAfterBookmark(newElement, token);
	p.activeFormattingElements.removeEntry(formattingElementEntry);
	p.openElements.remove(formattingElementEntry.element);
	p.openElements.insertAfter(furthestBlock, newElement, token.tagID);
}
function callAdoptionAgency(p, token) {
	for (let i = 0; i < AA_OUTER_LOOP_ITER; i++) {
		const formattingElementEntry = aaObtainFormattingElementEntry(p, token);
		if (!formattingElementEntry) break;
		const furthestBlock = aaObtainFurthestBlock(p, formattingElementEntry);
		if (!furthestBlock) break;
		p.activeFormattingElements.bookmark = formattingElementEntry;
		const lastElement = aaInnerLoop(p, furthestBlock, formattingElementEntry.element);
		const commonAncestor = p.openElements.getCommonAncestor(formattingElementEntry.element);
		p.treeAdapter.detachNode(lastElement);
		if (commonAncestor) aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement);
		aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry);
	}
}
function appendComment(p, token) {
	p._appendCommentNode(token, p.openElements.currentTmplContentOrNode);
}
function appendCommentToRootHtmlElement(p, token) {
	p._appendCommentNode(token, p.openElements.items[0]);
}
function appendCommentToDocument(p, token) {
	p._appendCommentNode(token, p.document);
}
function stopParsing(p, token) {
	p.stopped = true;
	if (token.location) {
		const target = p.fragmentContext ? 0 : 2;
		for (let i = p.openElements.stackTop; i >= target; i--) p._setEndLocation(p.openElements.items[i], token);
		if (!p.fragmentContext && p.openElements.stackTop >= 0) {
			const htmlElement = p.openElements.items[0];
			const htmlLocation = p.treeAdapter.getNodeSourceCodeLocation(htmlElement);
			if (htmlLocation && !htmlLocation.endTag) {
				p._setEndLocation(htmlElement, token);
				if (p.openElements.stackTop >= 1) {
					const bodyElement = p.openElements.items[1];
					const bodyLocation = p.treeAdapter.getNodeSourceCodeLocation(bodyElement);
					if (bodyLocation && !bodyLocation.endTag) p._setEndLocation(bodyElement, token);
				}
			}
		}
	}
}
function doctypeInInitialMode(p, token) {
	p._setDocumentType(token);
	const mode = token.forceQuirks ? DOCUMENT_MODE.QUIRKS : getDocumentMode(token);
	if (!isConforming(token)) p._err(token, ERR.nonConformingDoctype);
	p.treeAdapter.setDocumentMode(p.document, mode);
	p.insertionMode = InsertionMode.BEFORE_HTML;
}
function tokenInInitialMode(p, token) {
	p._err(token, ERR.missingDoctype, true);
	p.treeAdapter.setDocumentMode(p.document, DOCUMENT_MODE.QUIRKS);
	p.insertionMode = InsertionMode.BEFORE_HTML;
	p._processToken(token);
}
function startTagBeforeHtml(p, token) {
	if (token.tagID === TAG_ID.HTML) {
		p._insertElement(token, NS.HTML);
		p.insertionMode = InsertionMode.BEFORE_HEAD;
	} else tokenBeforeHtml(p, token);
}
function endTagBeforeHtml(p, token) {
	const tn = token.tagID;
	if (tn === TAG_ID.HTML || tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.BR) tokenBeforeHtml(p, token);
}
function tokenBeforeHtml(p, token) {
	p._insertFakeRootElement();
	p.insertionMode = InsertionMode.BEFORE_HEAD;
	p._processToken(token);
}
function startTagBeforeHead(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.HEAD:
			p._insertElement(token, NS.HTML);
			p.headElement = p.openElements.current;
			p.insertionMode = InsertionMode.IN_HEAD;
			break;
		default: tokenBeforeHead(p, token);
	}
}
function endTagBeforeHead(p, token) {
	const tn = token.tagID;
	if (tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.HTML || tn === TAG_ID.BR) tokenBeforeHead(p, token);
	else p._err(token, ERR.endTagWithoutMatchingOpenElement);
}
function tokenBeforeHead(p, token) {
	p._insertFakeElement(TAG_NAMES.HEAD, TAG_ID.HEAD);
	p.headElement = p.openElements.current;
	p.insertionMode = InsertionMode.IN_HEAD;
	p._processToken(token);
}
function startTagInHead(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.BASE:
		case TAG_ID.BASEFONT:
		case TAG_ID.BGSOUND:
		case TAG_ID.LINK:
		case TAG_ID.META:
			p._appendElement(token, NS.HTML);
			token.ackSelfClosing = true;
			break;
		case TAG_ID.TITLE:
			p._switchToTextParsing(token, TokenizerMode.RCDATA);
			break;
		case TAG_ID.NOSCRIPT:
			if (p.options.scriptingEnabled) p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
			else {
				p._insertElement(token, NS.HTML);
				p.insertionMode = InsertionMode.IN_HEAD_NO_SCRIPT;
			}
			break;
		case TAG_ID.NOFRAMES:
		case TAG_ID.STYLE:
			p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
			break;
		case TAG_ID.SCRIPT:
			p._switchToTextParsing(token, TokenizerMode.SCRIPT_DATA);
			break;
		case TAG_ID.TEMPLATE:
			p._insertTemplate(token);
			p.activeFormattingElements.insertMarker();
			p.framesetOk = false;
			p.insertionMode = InsertionMode.IN_TEMPLATE;
			p.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
			break;
		case TAG_ID.HEAD:
			p._err(token, ERR.misplacedStartTagForHeadElement);
			break;
		default: tokenInHead(p, token);
	}
}
function endTagInHead(p, token) {
	switch (token.tagID) {
		case TAG_ID.HEAD:
			p.openElements.pop();
			p.insertionMode = InsertionMode.AFTER_HEAD;
			break;
		case TAG_ID.BODY:
		case TAG_ID.BR:
		case TAG_ID.HTML:
			tokenInHead(p, token);
			break;
		case TAG_ID.TEMPLATE:
			templateEndTagInHead(p, token);
			break;
		default: p._err(token, ERR.endTagWithoutMatchingOpenElement);
	}
}
function templateEndTagInHead(p, token) {
	if (p.openElements.tmplCount > 0) {
		p.openElements.generateImpliedEndTagsThoroughly();
		if (p.openElements.currentTagId !== TAG_ID.TEMPLATE) p._err(token, ERR.closingOfElementWithOpenChildElements);
		p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
		p.activeFormattingElements.clearToLastMarker();
		p.tmplInsertionModeStack.shift();
		p._resetInsertionMode();
	} else p._err(token, ERR.endTagWithoutMatchingOpenElement);
}
function tokenInHead(p, token) {
	p.openElements.pop();
	p.insertionMode = InsertionMode.AFTER_HEAD;
	p._processToken(token);
}
function startTagInHeadNoScript(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.BASEFONT:
		case TAG_ID.BGSOUND:
		case TAG_ID.HEAD:
		case TAG_ID.LINK:
		case TAG_ID.META:
		case TAG_ID.NOFRAMES:
		case TAG_ID.STYLE:
			startTagInHead(p, token);
			break;
		case TAG_ID.NOSCRIPT:
			p._err(token, ERR.nestedNoscriptInHead);
			break;
		default: tokenInHeadNoScript(p, token);
	}
}
function endTagInHeadNoScript(p, token) {
	switch (token.tagID) {
		case TAG_ID.NOSCRIPT:
			p.openElements.pop();
			p.insertionMode = InsertionMode.IN_HEAD;
			break;
		case TAG_ID.BR:
			tokenInHeadNoScript(p, token);
			break;
		default: p._err(token, ERR.endTagWithoutMatchingOpenElement);
	}
}
function tokenInHeadNoScript(p, token) {
	const errCode = token.type === TokenType.EOF ? ERR.openElementsLeftAfterEof : ERR.disallowedContentInNoscriptInHead;
	p._err(token, errCode);
	p.openElements.pop();
	p.insertionMode = InsertionMode.IN_HEAD;
	p._processToken(token);
}
function startTagAfterHead(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.BODY:
			p._insertElement(token, NS.HTML);
			p.framesetOk = false;
			p.insertionMode = InsertionMode.IN_BODY;
			break;
		case TAG_ID.FRAMESET:
			p._insertElement(token, NS.HTML);
			p.insertionMode = InsertionMode.IN_FRAMESET;
			break;
		case TAG_ID.BASE:
		case TAG_ID.BASEFONT:
		case TAG_ID.BGSOUND:
		case TAG_ID.LINK:
		case TAG_ID.META:
		case TAG_ID.NOFRAMES:
		case TAG_ID.SCRIPT:
		case TAG_ID.STYLE:
		case TAG_ID.TEMPLATE:
		case TAG_ID.TITLE:
			p._err(token, ERR.abandonedHeadElementChild);
			p.openElements.push(p.headElement, TAG_ID.HEAD);
			startTagInHead(p, token);
			p.openElements.remove(p.headElement);
			break;
		case TAG_ID.HEAD:
			p._err(token, ERR.misplacedStartTagForHeadElement);
			break;
		default: tokenAfterHead(p, token);
	}
}
function endTagAfterHead(p, token) {
	switch (token.tagID) {
		case TAG_ID.BODY:
		case TAG_ID.HTML:
		case TAG_ID.BR:
			tokenAfterHead(p, token);
			break;
		case TAG_ID.TEMPLATE:
			templateEndTagInHead(p, token);
			break;
		default: p._err(token, ERR.endTagWithoutMatchingOpenElement);
	}
}
function tokenAfterHead(p, token) {
	p._insertFakeElement(TAG_NAMES.BODY, TAG_ID.BODY);
	p.insertionMode = InsertionMode.IN_BODY;
	modeInBody(p, token);
}
function modeInBody(p, token) {
	switch (token.type) {
		case TokenType.CHARACTER:
			characterInBody(p, token);
			break;
		case TokenType.WHITESPACE_CHARACTER:
			whitespaceCharacterInBody(p, token);
			break;
		case TokenType.COMMENT:
			appendComment(p, token);
			break;
		case TokenType.START_TAG:
			startTagInBody(p, token);
			break;
		case TokenType.END_TAG:
			endTagInBody(p, token);
			break;
		case TokenType.EOF: eofInBody(p, token);
	}
}
function whitespaceCharacterInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._insertCharacters(token);
}
function characterInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._insertCharacters(token);
	p.framesetOk = false;
}
function htmlStartTagInBody(p, token) {
	if (p.openElements.tmplCount === 0) p.treeAdapter.adoptAttributes(p.openElements.items[0], token.attrs);
}
function bodyStartTagInBody(p, token) {
	const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
	if (bodyElement && p.openElements.tmplCount === 0) {
		p.framesetOk = false;
		p.treeAdapter.adoptAttributes(bodyElement, token.attrs);
	}
}
function framesetStartTagInBody(p, token) {
	const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
	if (p.framesetOk && bodyElement) {
		p.treeAdapter.detachNode(bodyElement);
		p.openElements.popAllUpToHtmlElement();
		p._insertElement(token, NS.HTML);
		p.insertionMode = InsertionMode.IN_FRAMESET;
	}
}
function addressStartTagInBody(p, token) {
	if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	p._insertElement(token, NS.HTML);
}
function numberedHeaderStartTagInBody(p, token) {
	if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	if (p.openElements.currentTagId !== void 0 && NUMBERED_HEADERS.has(p.openElements.currentTagId)) p.openElements.pop();
	p._insertElement(token, NS.HTML);
}
function preStartTagInBody(p, token) {
	if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	p._insertElement(token, NS.HTML);
	p.skipNextNewLine = true;
	p.framesetOk = false;
}
function formStartTagInBody(p, token) {
	const inTemplate = p.openElements.tmplCount > 0;
	if (!p.formElement || inTemplate) {
		if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
		p._insertElement(token, NS.HTML);
		if (!inTemplate) p.formElement = p.openElements.current;
	}
}
function listItemStartTagInBody(p, token) {
	p.framesetOk = false;
	const tn = token.tagID;
	for (let i = p.openElements.stackTop; i >= 0; i--) {
		const elementId = p.openElements.tagIDs[i];
		if (tn === TAG_ID.LI && elementId === TAG_ID.LI || (tn === TAG_ID.DD || tn === TAG_ID.DT) && (elementId === TAG_ID.DD || elementId === TAG_ID.DT)) {
			p.openElements.generateImpliedEndTagsWithExclusion(elementId);
			p.openElements.popUntilTagNamePopped(elementId);
			break;
		}
		if (elementId !== TAG_ID.ADDRESS && elementId !== TAG_ID.DIV && elementId !== TAG_ID.P && p._isSpecialElement(p.openElements.items[i], elementId)) break;
	}
	if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	p._insertElement(token, NS.HTML);
}
function plaintextStartTagInBody(p, token) {
	if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	p._insertElement(token, NS.HTML);
	p.tokenizer.state = TokenizerMode.PLAINTEXT;
}
function buttonStartTagInBody(p, token) {
	if (p.openElements.hasInScope(TAG_ID.BUTTON)) {
		p.openElements.generateImpliedEndTags();
		p.openElements.popUntilTagNamePopped(TAG_ID.BUTTON);
	}
	p._reconstructActiveFormattingElements();
	p._insertElement(token, NS.HTML);
	p.framesetOk = false;
}
function aStartTagInBody(p, token) {
	const activeElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(TAG_NAMES.A);
	if (activeElementEntry) {
		callAdoptionAgency(p, token);
		p.openElements.remove(activeElementEntry.element);
		p.activeFormattingElements.removeEntry(activeElementEntry);
	}
	p._reconstructActiveFormattingElements();
	p._insertElement(token, NS.HTML);
	p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function bStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._insertElement(token, NS.HTML);
	p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function nobrStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	if (p.openElements.hasInScope(TAG_ID.NOBR)) {
		callAdoptionAgency(p, token);
		p._reconstructActiveFormattingElements();
	}
	p._insertElement(token, NS.HTML);
	p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function appletStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._insertElement(token, NS.HTML);
	p.activeFormattingElements.insertMarker();
	p.framesetOk = false;
}
function tableStartTagInBody(p, token) {
	if (p.treeAdapter.getDocumentMode(p.document) !== DOCUMENT_MODE.QUIRKS && p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	p._insertElement(token, NS.HTML);
	p.framesetOk = false;
	p.insertionMode = InsertionMode.IN_TABLE;
}
function areaStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._appendElement(token, NS.HTML);
	p.framesetOk = false;
	token.ackSelfClosing = true;
}
function isHiddenInput(token) {
	const inputType = getTokenAttr(token, ATTRS.TYPE);
	return inputType != null && inputType.toLowerCase() === HIDDEN_INPUT_TYPE;
}
function inputStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._appendElement(token, NS.HTML);
	if (!isHiddenInput(token)) p.framesetOk = false;
	token.ackSelfClosing = true;
}
function paramStartTagInBody(p, token) {
	p._appendElement(token, NS.HTML);
	token.ackSelfClosing = true;
}
function hrStartTagInBody(p, token) {
	if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	p._appendElement(token, NS.HTML);
	p.framesetOk = false;
	token.ackSelfClosing = true;
}
function imageStartTagInBody(p, token) {
	token.tagName = TAG_NAMES.IMG;
	token.tagID = TAG_ID.IMG;
	areaStartTagInBody(p, token);
}
function textareaStartTagInBody(p, token) {
	p._insertElement(token, NS.HTML);
	p.skipNextNewLine = true;
	p.tokenizer.state = TokenizerMode.RCDATA;
	p.originalInsertionMode = p.insertionMode;
	p.framesetOk = false;
	p.insertionMode = InsertionMode.TEXT;
}
function xmpStartTagInBody(p, token) {
	if (p.openElements.hasInButtonScope(TAG_ID.P)) p._closePElement();
	p._reconstructActiveFormattingElements();
	p.framesetOk = false;
	p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function iframeStartTagInBody(p, token) {
	p.framesetOk = false;
	p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function rawTextStartTagInBody(p, token) {
	p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function selectStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._insertElement(token, NS.HTML);
	p.framesetOk = false;
	p.insertionMode = p.insertionMode === InsertionMode.IN_TABLE || p.insertionMode === InsertionMode.IN_CAPTION || p.insertionMode === InsertionMode.IN_TABLE_BODY || p.insertionMode === InsertionMode.IN_ROW || p.insertionMode === InsertionMode.IN_CELL ? InsertionMode.IN_SELECT_IN_TABLE : InsertionMode.IN_SELECT;
}
function optgroupStartTagInBody(p, token) {
	if (p.openElements.currentTagId === TAG_ID.OPTION) p.openElements.pop();
	p._reconstructActiveFormattingElements();
	p._insertElement(token, NS.HTML);
}
function rbStartTagInBody(p, token) {
	if (p.openElements.hasInScope(TAG_ID.RUBY)) p.openElements.generateImpliedEndTags();
	p._insertElement(token, NS.HTML);
}
function rtStartTagInBody(p, token) {
	if (p.openElements.hasInScope(TAG_ID.RUBY)) p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.RTC);
	p._insertElement(token, NS.HTML);
}
function mathStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	adjustTokenMathMLAttrs(token);
	adjustTokenXMLAttrs(token);
	if (token.selfClosing) p._appendElement(token, NS.MATHML);
	else p._insertElement(token, NS.MATHML);
	token.ackSelfClosing = true;
}
function svgStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	adjustTokenSVGAttrs(token);
	adjustTokenXMLAttrs(token);
	if (token.selfClosing) p._appendElement(token, NS.SVG);
	else p._insertElement(token, NS.SVG);
	token.ackSelfClosing = true;
}
function genericStartTagInBody(p, token) {
	p._reconstructActiveFormattingElements();
	p._insertElement(token, NS.HTML);
}
function startTagInBody(p, token) {
	switch (token.tagID) {
		case TAG_ID.I:
		case TAG_ID.S:
		case TAG_ID.B:
		case TAG_ID.U:
		case TAG_ID.EM:
		case TAG_ID.TT:
		case TAG_ID.BIG:
		case TAG_ID.CODE:
		case TAG_ID.FONT:
		case TAG_ID.SMALL:
		case TAG_ID.STRIKE:
		case TAG_ID.STRONG:
			bStartTagInBody(p, token);
			break;
		case TAG_ID.A:
			aStartTagInBody(p, token);
			break;
		case TAG_ID.H1:
		case TAG_ID.H2:
		case TAG_ID.H3:
		case TAG_ID.H4:
		case TAG_ID.H5:
		case TAG_ID.H6:
			numberedHeaderStartTagInBody(p, token);
			break;
		case TAG_ID.P:
		case TAG_ID.DL:
		case TAG_ID.OL:
		case TAG_ID.UL:
		case TAG_ID.DIV:
		case TAG_ID.DIR:
		case TAG_ID.NAV:
		case TAG_ID.MAIN:
		case TAG_ID.MENU:
		case TAG_ID.ASIDE:
		case TAG_ID.CENTER:
		case TAG_ID.FIGURE:
		case TAG_ID.FOOTER:
		case TAG_ID.HEADER:
		case TAG_ID.HGROUP:
		case TAG_ID.DIALOG:
		case TAG_ID.DETAILS:
		case TAG_ID.ADDRESS:
		case TAG_ID.ARTICLE:
		case TAG_ID.SEARCH:
		case TAG_ID.SECTION:
		case TAG_ID.SUMMARY:
		case TAG_ID.FIELDSET:
		case TAG_ID.BLOCKQUOTE:
		case TAG_ID.FIGCAPTION:
			addressStartTagInBody(p, token);
			break;
		case TAG_ID.LI:
		case TAG_ID.DD:
		case TAG_ID.DT:
			listItemStartTagInBody(p, token);
			break;
		case TAG_ID.BR:
		case TAG_ID.IMG:
		case TAG_ID.WBR:
		case TAG_ID.AREA:
		case TAG_ID.EMBED:
		case TAG_ID.KEYGEN:
			areaStartTagInBody(p, token);
			break;
		case TAG_ID.HR:
			hrStartTagInBody(p, token);
			break;
		case TAG_ID.RB:
		case TAG_ID.RTC:
			rbStartTagInBody(p, token);
			break;
		case TAG_ID.RT:
		case TAG_ID.RP:
			rtStartTagInBody(p, token);
			break;
		case TAG_ID.PRE:
		case TAG_ID.LISTING:
			preStartTagInBody(p, token);
			break;
		case TAG_ID.XMP:
			xmpStartTagInBody(p, token);
			break;
		case TAG_ID.SVG:
			svgStartTagInBody(p, token);
			break;
		case TAG_ID.HTML:
			htmlStartTagInBody(p, token);
			break;
		case TAG_ID.BASE:
		case TAG_ID.LINK:
		case TAG_ID.META:
		case TAG_ID.STYLE:
		case TAG_ID.TITLE:
		case TAG_ID.SCRIPT:
		case TAG_ID.BGSOUND:
		case TAG_ID.BASEFONT:
		case TAG_ID.TEMPLATE:
			startTagInHead(p, token);
			break;
		case TAG_ID.BODY:
			bodyStartTagInBody(p, token);
			break;
		case TAG_ID.FORM:
			formStartTagInBody(p, token);
			break;
		case TAG_ID.NOBR:
			nobrStartTagInBody(p, token);
			break;
		case TAG_ID.MATH:
			mathStartTagInBody(p, token);
			break;
		case TAG_ID.TABLE:
			tableStartTagInBody(p, token);
			break;
		case TAG_ID.INPUT:
			inputStartTagInBody(p, token);
			break;
		case TAG_ID.PARAM:
		case TAG_ID.TRACK:
		case TAG_ID.SOURCE:
			paramStartTagInBody(p, token);
			break;
		case TAG_ID.IMAGE:
			imageStartTagInBody(p, token);
			break;
		case TAG_ID.BUTTON:
			buttonStartTagInBody(p, token);
			break;
		case TAG_ID.APPLET:
		case TAG_ID.OBJECT:
		case TAG_ID.MARQUEE:
			appletStartTagInBody(p, token);
			break;
		case TAG_ID.IFRAME:
			iframeStartTagInBody(p, token);
			break;
		case TAG_ID.SELECT:
			selectStartTagInBody(p, token);
			break;
		case TAG_ID.OPTION:
		case TAG_ID.OPTGROUP:
			optgroupStartTagInBody(p, token);
			break;
		case TAG_ID.NOEMBED:
		case TAG_ID.NOFRAMES:
			rawTextStartTagInBody(p, token);
			break;
		case TAG_ID.FRAMESET:
			framesetStartTagInBody(p, token);
			break;
		case TAG_ID.TEXTAREA:
			textareaStartTagInBody(p, token);
			break;
		case TAG_ID.NOSCRIPT:
			if (p.options.scriptingEnabled) rawTextStartTagInBody(p, token);
			else genericStartTagInBody(p, token);
			break;
		case TAG_ID.PLAINTEXT:
			plaintextStartTagInBody(p, token);
			break;
		case TAG_ID.COL:
		case TAG_ID.TH:
		case TAG_ID.TD:
		case TAG_ID.TR:
		case TAG_ID.HEAD:
		case TAG_ID.FRAME:
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
		case TAG_ID.CAPTION:
		case TAG_ID.COLGROUP: break;
		default: genericStartTagInBody(p, token);
	}
}
function bodyEndTagInBody(p, token) {
	if (p.openElements.hasInScope(TAG_ID.BODY)) {
		p.insertionMode = InsertionMode.AFTER_BODY;
		if (p.options.sourceCodeLocationInfo) {
			const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
			if (bodyElement) p._setEndLocation(bodyElement, token);
		}
	}
}
function htmlEndTagInBody(p, token) {
	if (p.openElements.hasInScope(TAG_ID.BODY)) {
		p.insertionMode = InsertionMode.AFTER_BODY;
		endTagAfterBody(p, token);
	}
}
function addressEndTagInBody(p, token) {
	const tn = token.tagID;
	if (p.openElements.hasInScope(tn)) {
		p.openElements.generateImpliedEndTags();
		p.openElements.popUntilTagNamePopped(tn);
	}
}
function formEndTagInBody(p) {
	const inTemplate = p.openElements.tmplCount > 0;
	const { formElement } = p;
	if (!inTemplate) p.formElement = null;
	if ((formElement || inTemplate) && p.openElements.hasInScope(TAG_ID.FORM)) {
		p.openElements.generateImpliedEndTags();
		if (inTemplate) p.openElements.popUntilTagNamePopped(TAG_ID.FORM);
		else if (formElement) p.openElements.remove(formElement);
	}
}
function pEndTagInBody(p) {
	if (!p.openElements.hasInButtonScope(TAG_ID.P)) p._insertFakeElement(TAG_NAMES.P, TAG_ID.P);
	p._closePElement();
}
function liEndTagInBody(p) {
	if (p.openElements.hasInListItemScope(TAG_ID.LI)) {
		p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.LI);
		p.openElements.popUntilTagNamePopped(TAG_ID.LI);
	}
}
function ddEndTagInBody(p, token) {
	const tn = token.tagID;
	if (p.openElements.hasInScope(tn)) {
		p.openElements.generateImpliedEndTagsWithExclusion(tn);
		p.openElements.popUntilTagNamePopped(tn);
	}
}
function numberedHeaderEndTagInBody(p) {
	if (p.openElements.hasNumberedHeaderInScope()) {
		p.openElements.generateImpliedEndTags();
		p.openElements.popUntilNumberedHeaderPopped();
	}
}
function appletEndTagInBody(p, token) {
	const tn = token.tagID;
	if (p.openElements.hasInScope(tn)) {
		p.openElements.generateImpliedEndTags();
		p.openElements.popUntilTagNamePopped(tn);
		p.activeFormattingElements.clearToLastMarker();
	}
}
function brEndTagInBody(p) {
	p._reconstructActiveFormattingElements();
	p._insertFakeElement(TAG_NAMES.BR, TAG_ID.BR);
	p.openElements.pop();
	p.framesetOk = false;
}
function genericEndTagInBody(p, token) {
	const tn = token.tagName;
	const tid = token.tagID;
	for (let i = p.openElements.stackTop; i > 0; i--) {
		const element = p.openElements.items[i];
		const elementId = p.openElements.tagIDs[i];
		if (tid === elementId && (tid !== TAG_ID.UNKNOWN || p.treeAdapter.getTagName(element) === tn)) {
			p.openElements.generateImpliedEndTagsWithExclusion(tid);
			if (p.openElements.stackTop >= i) p.openElements.shortenToLength(i);
			break;
		}
		if (p._isSpecialElement(element, elementId)) break;
	}
}
function endTagInBody(p, token) {
	switch (token.tagID) {
		case TAG_ID.A:
		case TAG_ID.B:
		case TAG_ID.I:
		case TAG_ID.S:
		case TAG_ID.U:
		case TAG_ID.EM:
		case TAG_ID.TT:
		case TAG_ID.BIG:
		case TAG_ID.CODE:
		case TAG_ID.FONT:
		case TAG_ID.NOBR:
		case TAG_ID.SMALL:
		case TAG_ID.STRIKE:
		case TAG_ID.STRONG:
			callAdoptionAgency(p, token);
			break;
		case TAG_ID.P:
			pEndTagInBody(p);
			break;
		case TAG_ID.DL:
		case TAG_ID.UL:
		case TAG_ID.OL:
		case TAG_ID.DIR:
		case TAG_ID.DIV:
		case TAG_ID.NAV:
		case TAG_ID.PRE:
		case TAG_ID.MAIN:
		case TAG_ID.MENU:
		case TAG_ID.ASIDE:
		case TAG_ID.BUTTON:
		case TAG_ID.CENTER:
		case TAG_ID.FIGURE:
		case TAG_ID.FOOTER:
		case TAG_ID.HEADER:
		case TAG_ID.HGROUP:
		case TAG_ID.DIALOG:
		case TAG_ID.ADDRESS:
		case TAG_ID.ARTICLE:
		case TAG_ID.DETAILS:
		case TAG_ID.SEARCH:
		case TAG_ID.SECTION:
		case TAG_ID.SUMMARY:
		case TAG_ID.LISTING:
		case TAG_ID.FIELDSET:
		case TAG_ID.BLOCKQUOTE:
		case TAG_ID.FIGCAPTION:
			addressEndTagInBody(p, token);
			break;
		case TAG_ID.LI:
			liEndTagInBody(p);
			break;
		case TAG_ID.DD:
		case TAG_ID.DT:
			ddEndTagInBody(p, token);
			break;
		case TAG_ID.H1:
		case TAG_ID.H2:
		case TAG_ID.H3:
		case TAG_ID.H4:
		case TAG_ID.H5:
		case TAG_ID.H6:
			numberedHeaderEndTagInBody(p);
			break;
		case TAG_ID.BR:
			brEndTagInBody(p);
			break;
		case TAG_ID.BODY:
			bodyEndTagInBody(p, token);
			break;
		case TAG_ID.HTML:
			htmlEndTagInBody(p, token);
			break;
		case TAG_ID.FORM:
			formEndTagInBody(p);
			break;
		case TAG_ID.APPLET:
		case TAG_ID.OBJECT:
		case TAG_ID.MARQUEE:
			appletEndTagInBody(p, token);
			break;
		case TAG_ID.TEMPLATE:
			templateEndTagInHead(p, token);
			break;
		default: genericEndTagInBody(p, token);
	}
}
function eofInBody(p, token) {
	if (p.tmplInsertionModeStack.length > 0) eofInTemplate(p, token);
	else stopParsing(p, token);
}
function endTagInText(p, token) {
	var _a;
	if (token.tagID === TAG_ID.SCRIPT) (_a = p.scriptHandler) === null || _a === void 0 || _a.call(p, p.openElements.current);
	p.openElements.pop();
	p.insertionMode = p.originalInsertionMode;
}
function eofInText(p, token) {
	p._err(token, ERR.eofInElementThatCanContainOnlyText);
	p.openElements.pop();
	p.insertionMode = p.originalInsertionMode;
	p.onEof(token);
}
function characterInTable(p, token) {
	if (p.openElements.currentTagId !== void 0 && TABLE_STRUCTURE_TAGS.has(p.openElements.currentTagId)) {
		p.pendingCharacterTokens.length = 0;
		p.hasNonWhitespacePendingCharacterToken = false;
		p.originalInsertionMode = p.insertionMode;
		p.insertionMode = InsertionMode.IN_TABLE_TEXT;
		switch (token.type) {
			case TokenType.CHARACTER:
				characterInTableText(p, token);
				break;
			case TokenType.WHITESPACE_CHARACTER: whitespaceCharacterInTableText(p, token);
		}
	} else tokenInTable(p, token);
}
function captionStartTagInTable(p, token) {
	p.openElements.clearBackToTableContext();
	p.activeFormattingElements.insertMarker();
	p._insertElement(token, NS.HTML);
	p.insertionMode = InsertionMode.IN_CAPTION;
}
function colgroupStartTagInTable(p, token) {
	p.openElements.clearBackToTableContext();
	p._insertElement(token, NS.HTML);
	p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
}
function colStartTagInTable(p, token) {
	p.openElements.clearBackToTableContext();
	p._insertFakeElement(TAG_NAMES.COLGROUP, TAG_ID.COLGROUP);
	p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
	startTagInColumnGroup(p, token);
}
function tbodyStartTagInTable(p, token) {
	p.openElements.clearBackToTableContext();
	p._insertElement(token, NS.HTML);
	p.insertionMode = InsertionMode.IN_TABLE_BODY;
}
function tdStartTagInTable(p, token) {
	p.openElements.clearBackToTableContext();
	p._insertFakeElement(TAG_NAMES.TBODY, TAG_ID.TBODY);
	p.insertionMode = InsertionMode.IN_TABLE_BODY;
	startTagInTableBody(p, token);
}
function tableStartTagInTable(p, token) {
	if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
		p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
		p._resetInsertionMode();
		p._processStartTag(token);
	}
}
function inputStartTagInTable(p, token) {
	if (isHiddenInput(token)) p._appendElement(token, NS.HTML);
	else tokenInTable(p, token);
	token.ackSelfClosing = true;
}
function formStartTagInTable(p, token) {
	if (!p.formElement && p.openElements.tmplCount === 0) {
		p._insertElement(token, NS.HTML);
		p.formElement = p.openElements.current;
		p.openElements.pop();
	}
}
function startTagInTable(p, token) {
	switch (token.tagID) {
		case TAG_ID.TD:
		case TAG_ID.TH:
		case TAG_ID.TR:
			tdStartTagInTable(p, token);
			break;
		case TAG_ID.STYLE:
		case TAG_ID.SCRIPT:
		case TAG_ID.TEMPLATE:
			startTagInHead(p, token);
			break;
		case TAG_ID.COL:
			colStartTagInTable(p, token);
			break;
		case TAG_ID.FORM:
			formStartTagInTable(p, token);
			break;
		case TAG_ID.TABLE:
			tableStartTagInTable(p, token);
			break;
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
			tbodyStartTagInTable(p, token);
			break;
		case TAG_ID.INPUT:
			inputStartTagInTable(p, token);
			break;
		case TAG_ID.CAPTION:
			captionStartTagInTable(p, token);
			break;
		case TAG_ID.COLGROUP:
			colgroupStartTagInTable(p, token);
			break;
		default: tokenInTable(p, token);
	}
}
function endTagInTable(p, token) {
	switch (token.tagID) {
		case TAG_ID.TABLE:
			if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
				p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
				p._resetInsertionMode();
			}
			break;
		case TAG_ID.TEMPLATE:
			templateEndTagInHead(p, token);
			break;
		case TAG_ID.BODY:
		case TAG_ID.CAPTION:
		case TAG_ID.COL:
		case TAG_ID.COLGROUP:
		case TAG_ID.HTML:
		case TAG_ID.TBODY:
		case TAG_ID.TD:
		case TAG_ID.TFOOT:
		case TAG_ID.TH:
		case TAG_ID.THEAD:
		case TAG_ID.TR: break;
		default: tokenInTable(p, token);
	}
}
function tokenInTable(p, token) {
	const savedFosterParentingState = p.fosterParentingEnabled;
	p.fosterParentingEnabled = true;
	modeInBody(p, token);
	p.fosterParentingEnabled = savedFosterParentingState;
}
function whitespaceCharacterInTableText(p, token) {
	p.pendingCharacterTokens.push(token);
}
function characterInTableText(p, token) {
	p.pendingCharacterTokens.push(token);
	p.hasNonWhitespacePendingCharacterToken = true;
}
function tokenInTableText(p, token) {
	let i = 0;
	if (p.hasNonWhitespacePendingCharacterToken) for (; i < p.pendingCharacterTokens.length; i++) tokenInTable(p, p.pendingCharacterTokens[i]);
	else for (; i < p.pendingCharacterTokens.length; i++) p._insertCharacters(p.pendingCharacterTokens[i]);
	p.insertionMode = p.originalInsertionMode;
	p._processToken(token);
}
const TABLE_VOID_ELEMENTS = /* @__PURE__ */ new Set([
	TAG_ID.CAPTION,
	TAG_ID.COL,
	TAG_ID.COLGROUP,
	TAG_ID.TBODY,
	TAG_ID.TD,
	TAG_ID.TFOOT,
	TAG_ID.TH,
	TAG_ID.THEAD,
	TAG_ID.TR
]);
function startTagInCaption(p, token) {
	const tn = token.tagID;
	if (TABLE_VOID_ELEMENTS.has(tn)) {
		if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
			p.openElements.generateImpliedEndTags();
			p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
			p.activeFormattingElements.clearToLastMarker();
			p.insertionMode = InsertionMode.IN_TABLE;
			startTagInTable(p, token);
		}
	} else startTagInBody(p, token);
}
function endTagInCaption(p, token) {
	const tn = token.tagID;
	switch (tn) {
		case TAG_ID.CAPTION:
		case TAG_ID.TABLE:
			if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
				p.openElements.generateImpliedEndTags();
				p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
				p.activeFormattingElements.clearToLastMarker();
				p.insertionMode = InsertionMode.IN_TABLE;
				if (tn === TAG_ID.TABLE) endTagInTable(p, token);
			}
			break;
		case TAG_ID.BODY:
		case TAG_ID.COL:
		case TAG_ID.COLGROUP:
		case TAG_ID.HTML:
		case TAG_ID.TBODY:
		case TAG_ID.TD:
		case TAG_ID.TFOOT:
		case TAG_ID.TH:
		case TAG_ID.THEAD:
		case TAG_ID.TR: break;
		default: endTagInBody(p, token);
	}
}
function startTagInColumnGroup(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.COL:
			p._appendElement(token, NS.HTML);
			token.ackSelfClosing = true;
			break;
		case TAG_ID.TEMPLATE:
			startTagInHead(p, token);
			break;
		default: tokenInColumnGroup(p, token);
	}
}
function endTagInColumnGroup(p, token) {
	switch (token.tagID) {
		case TAG_ID.COLGROUP:
			if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE;
			}
			break;
		case TAG_ID.TEMPLATE:
			templateEndTagInHead(p, token);
			break;
		case TAG_ID.COL: break;
		default: tokenInColumnGroup(p, token);
	}
}
function tokenInColumnGroup(p, token) {
	if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
		p.openElements.pop();
		p.insertionMode = InsertionMode.IN_TABLE;
		p._processToken(token);
	}
}
function startTagInTableBody(p, token) {
	switch (token.tagID) {
		case TAG_ID.TR:
			p.openElements.clearBackToTableBodyContext();
			p._insertElement(token, NS.HTML);
			p.insertionMode = InsertionMode.IN_ROW;
			break;
		case TAG_ID.TH:
		case TAG_ID.TD:
			p.openElements.clearBackToTableBodyContext();
			p._insertFakeElement(TAG_NAMES.TR, TAG_ID.TR);
			p.insertionMode = InsertionMode.IN_ROW;
			startTagInRow(p, token);
			break;
		case TAG_ID.CAPTION:
		case TAG_ID.COL:
		case TAG_ID.COLGROUP:
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
			if (p.openElements.hasTableBodyContextInTableScope()) {
				p.openElements.clearBackToTableBodyContext();
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE;
				startTagInTable(p, token);
			}
			break;
		default: startTagInTable(p, token);
	}
}
function endTagInTableBody(p, token) {
	const tn = token.tagID;
	switch (token.tagID) {
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
			if (p.openElements.hasInTableScope(tn)) {
				p.openElements.clearBackToTableBodyContext();
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE;
			}
			break;
		case TAG_ID.TABLE:
			if (p.openElements.hasTableBodyContextInTableScope()) {
				p.openElements.clearBackToTableBodyContext();
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE;
				endTagInTable(p, token);
			}
			break;
		case TAG_ID.BODY:
		case TAG_ID.CAPTION:
		case TAG_ID.COL:
		case TAG_ID.COLGROUP:
		case TAG_ID.HTML:
		case TAG_ID.TD:
		case TAG_ID.TH:
		case TAG_ID.TR: break;
		default: endTagInTable(p, token);
	}
}
function startTagInRow(p, token) {
	switch (token.tagID) {
		case TAG_ID.TH:
		case TAG_ID.TD:
			p.openElements.clearBackToTableRowContext();
			p._insertElement(token, NS.HTML);
			p.insertionMode = InsertionMode.IN_CELL;
			p.activeFormattingElements.insertMarker();
			break;
		case TAG_ID.CAPTION:
		case TAG_ID.COL:
		case TAG_ID.COLGROUP:
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
		case TAG_ID.TR:
			if (p.openElements.hasInTableScope(TAG_ID.TR)) {
				p.openElements.clearBackToTableRowContext();
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE_BODY;
				startTagInTableBody(p, token);
			}
			break;
		default: startTagInTable(p, token);
	}
}
function endTagInRow(p, token) {
	switch (token.tagID) {
		case TAG_ID.TR:
			if (p.openElements.hasInTableScope(TAG_ID.TR)) {
				p.openElements.clearBackToTableRowContext();
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE_BODY;
			}
			break;
		case TAG_ID.TABLE:
			if (p.openElements.hasInTableScope(TAG_ID.TR)) {
				p.openElements.clearBackToTableRowContext();
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE_BODY;
				endTagInTableBody(p, token);
			}
			break;
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
			if (p.openElements.hasInTableScope(token.tagID) || p.openElements.hasInTableScope(TAG_ID.TR)) {
				p.openElements.clearBackToTableRowContext();
				p.openElements.pop();
				p.insertionMode = InsertionMode.IN_TABLE_BODY;
				endTagInTableBody(p, token);
			}
			break;
		case TAG_ID.BODY:
		case TAG_ID.CAPTION:
		case TAG_ID.COL:
		case TAG_ID.COLGROUP:
		case TAG_ID.HTML:
		case TAG_ID.TD:
		case TAG_ID.TH: break;
		default: endTagInTable(p, token);
	}
}
function startTagInCell(p, token) {
	const tn = token.tagID;
	if (TABLE_VOID_ELEMENTS.has(tn)) {
		if (p.openElements.hasInTableScope(TAG_ID.TD) || p.openElements.hasInTableScope(TAG_ID.TH)) {
			p._closeTableCell();
			startTagInRow(p, token);
		}
	} else startTagInBody(p, token);
}
function endTagInCell(p, token) {
	const tn = token.tagID;
	switch (tn) {
		case TAG_ID.TD:
		case TAG_ID.TH:
			if (p.openElements.hasInTableScope(tn)) {
				p.openElements.generateImpliedEndTags();
				p.openElements.popUntilTagNamePopped(tn);
				p.activeFormattingElements.clearToLastMarker();
				p.insertionMode = InsertionMode.IN_ROW;
			}
			break;
		case TAG_ID.TABLE:
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
		case TAG_ID.TR:
			if (p.openElements.hasInTableScope(tn)) {
				p._closeTableCell();
				endTagInRow(p, token);
			}
			break;
		case TAG_ID.BODY:
		case TAG_ID.CAPTION:
		case TAG_ID.COL:
		case TAG_ID.COLGROUP:
		case TAG_ID.HTML: break;
		default: endTagInBody(p, token);
	}
}
function startTagInSelect(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.OPTION:
			if (p.openElements.currentTagId === TAG_ID.OPTION) p.openElements.pop();
			p._insertElement(token, NS.HTML);
			break;
		case TAG_ID.OPTGROUP:
			if (p.openElements.currentTagId === TAG_ID.OPTION) p.openElements.pop();
			if (p.openElements.currentTagId === TAG_ID.OPTGROUP) p.openElements.pop();
			p._insertElement(token, NS.HTML);
			break;
		case TAG_ID.HR:
			if (p.openElements.currentTagId === TAG_ID.OPTION) p.openElements.pop();
			if (p.openElements.currentTagId === TAG_ID.OPTGROUP) p.openElements.pop();
			p._appendElement(token, NS.HTML);
			token.ackSelfClosing = true;
			break;
		case TAG_ID.INPUT:
		case TAG_ID.KEYGEN:
		case TAG_ID.TEXTAREA:
		case TAG_ID.SELECT:
			if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
				p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
				p._resetInsertionMode();
				if (token.tagID !== TAG_ID.SELECT) p._processStartTag(token);
			}
			break;
		case TAG_ID.SCRIPT:
		case TAG_ID.TEMPLATE: startTagInHead(p, token);
	}
}
function endTagInSelect(p, token) {
	switch (token.tagID) {
		case TAG_ID.OPTGROUP:
			if (p.openElements.stackTop > 0 && p.openElements.currentTagId === TAG_ID.OPTION && p.openElements.tagIDs[p.openElements.stackTop - 1] === TAG_ID.OPTGROUP) p.openElements.pop();
			if (p.openElements.currentTagId === TAG_ID.OPTGROUP) p.openElements.pop();
			break;
		case TAG_ID.OPTION:
			if (p.openElements.currentTagId === TAG_ID.OPTION) p.openElements.pop();
			break;
		case TAG_ID.SELECT:
			if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
				p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
				p._resetInsertionMode();
			}
			break;
		case TAG_ID.TEMPLATE: templateEndTagInHead(p, token);
	}
}
function startTagInSelectInTable(p, token) {
	const tn = token.tagID;
	if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
		p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
		p._resetInsertionMode();
		p._processStartTag(token);
	} else startTagInSelect(p, token);
}
function endTagInSelectInTable(p, token) {
	const tn = token.tagID;
	if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
		if (p.openElements.hasInTableScope(tn)) {
			p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
			p._resetInsertionMode();
			p.onEndTag(token);
		}
	} else endTagInSelect(p, token);
}
function startTagInTemplate(p, token) {
	switch (token.tagID) {
		case TAG_ID.BASE:
		case TAG_ID.BASEFONT:
		case TAG_ID.BGSOUND:
		case TAG_ID.LINK:
		case TAG_ID.META:
		case TAG_ID.NOFRAMES:
		case TAG_ID.SCRIPT:
		case TAG_ID.STYLE:
		case TAG_ID.TEMPLATE:
		case TAG_ID.TITLE:
			startTagInHead(p, token);
			break;
		case TAG_ID.CAPTION:
		case TAG_ID.COLGROUP:
		case TAG_ID.TBODY:
		case TAG_ID.TFOOT:
		case TAG_ID.THEAD:
			p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE;
			p.insertionMode = InsertionMode.IN_TABLE;
			startTagInTable(p, token);
			break;
		case TAG_ID.COL:
			p.tmplInsertionModeStack[0] = InsertionMode.IN_COLUMN_GROUP;
			p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
			startTagInColumnGroup(p, token);
			break;
		case TAG_ID.TR:
			p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE_BODY;
			p.insertionMode = InsertionMode.IN_TABLE_BODY;
			startTagInTableBody(p, token);
			break;
		case TAG_ID.TD:
		case TAG_ID.TH:
			p.tmplInsertionModeStack[0] = InsertionMode.IN_ROW;
			p.insertionMode = InsertionMode.IN_ROW;
			startTagInRow(p, token);
			break;
		default:
			p.tmplInsertionModeStack[0] = InsertionMode.IN_BODY;
			p.insertionMode = InsertionMode.IN_BODY;
			startTagInBody(p, token);
	}
}
function endTagInTemplate(p, token) {
	if (token.tagID === TAG_ID.TEMPLATE) templateEndTagInHead(p, token);
}
function eofInTemplate(p, token) {
	if (p.openElements.tmplCount > 0) {
		p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
		p.activeFormattingElements.clearToLastMarker();
		p.tmplInsertionModeStack.shift();
		p._resetInsertionMode();
		p.onEof(token);
	} else stopParsing(p, token);
}
function startTagAfterBody(p, token) {
	if (token.tagID === TAG_ID.HTML) startTagInBody(p, token);
	else tokenAfterBody(p, token);
}
function endTagAfterBody(p, token) {
	var _a;
	if (token.tagID === TAG_ID.HTML) {
		if (!p.fragmentContext) p.insertionMode = InsertionMode.AFTER_AFTER_BODY;
		if (p.options.sourceCodeLocationInfo && p.openElements.tagIDs[0] === TAG_ID.HTML) {
			p._setEndLocation(p.openElements.items[0], token);
			const bodyElement = p.openElements.items[1];
			if (bodyElement && !((_a = p.treeAdapter.getNodeSourceCodeLocation(bodyElement)) === null || _a === void 0 ? void 0 : _a.endTag)) p._setEndLocation(bodyElement, token);
		}
	} else tokenAfterBody(p, token);
}
function tokenAfterBody(p, token) {
	p.insertionMode = InsertionMode.IN_BODY;
	modeInBody(p, token);
}
function startTagInFrameset(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.FRAMESET:
			p._insertElement(token, NS.HTML);
			break;
		case TAG_ID.FRAME:
			p._appendElement(token, NS.HTML);
			token.ackSelfClosing = true;
			break;
		case TAG_ID.NOFRAMES: startTagInHead(p, token);
	}
}
function endTagInFrameset(p, token) {
	if (token.tagID === TAG_ID.FRAMESET && !p.openElements.isRootHtmlElementCurrent()) {
		p.openElements.pop();
		if (!p.fragmentContext && p.openElements.currentTagId !== TAG_ID.FRAMESET) p.insertionMode = InsertionMode.AFTER_FRAMESET;
	}
}
function startTagAfterFrameset(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.NOFRAMES: startTagInHead(p, token);
	}
}
function endTagAfterFrameset(p, token) {
	if (token.tagID === TAG_ID.HTML) p.insertionMode = InsertionMode.AFTER_AFTER_FRAMESET;
}
function startTagAfterAfterBody(p, token) {
	if (token.tagID === TAG_ID.HTML) startTagInBody(p, token);
	else tokenAfterAfterBody(p, token);
}
function tokenAfterAfterBody(p, token) {
	p.insertionMode = InsertionMode.IN_BODY;
	modeInBody(p, token);
}
function startTagAfterAfterFrameset(p, token) {
	switch (token.tagID) {
		case TAG_ID.HTML:
			startTagInBody(p, token);
			break;
		case TAG_ID.NOFRAMES: startTagInHead(p, token);
	}
}
function nullCharacterInForeignContent(p, token) {
	token.chars = "�";
	p._insertCharacters(token);
}
function characterInForeignContent(p, token) {
	p._insertCharacters(token);
	p.framesetOk = false;
}
function popUntilHtmlOrIntegrationPoint(p) {
	while (p.treeAdapter.getNamespaceURI(p.openElements.current) !== NS.HTML && p.openElements.currentTagId !== void 0 && !p._isIntegrationPoint(p.openElements.currentTagId, p.openElements.current)) p.openElements.pop();
}
function startTagInForeignContent(p, token) {
	if (causesExit(token)) {
		popUntilHtmlOrIntegrationPoint(p);
		p._startTagOutsideForeignContent(token);
	} else {
		const current = p._getAdjustedCurrentElement();
		const currentNs = p.treeAdapter.getNamespaceURI(current);
		if (currentNs === NS.MATHML) adjustTokenMathMLAttrs(token);
		else if (currentNs === NS.SVG) {
			adjustTokenSVGTagName(token);
			adjustTokenSVGAttrs(token);
		}
		adjustTokenXMLAttrs(token);
		if (token.selfClosing) p._appendElement(token, currentNs);
		else p._insertElement(token, currentNs);
		token.ackSelfClosing = true;
	}
}
function endTagInForeignContent(p, token) {
	if (token.tagID === TAG_ID.P || token.tagID === TAG_ID.BR) {
		popUntilHtmlOrIntegrationPoint(p);
		p._endTagOutsideForeignContent(token);
		return;
	}
	for (let i = p.openElements.stackTop; i > 0; i--) {
		const element = p.openElements.items[i];
		if (p.treeAdapter.getNamespaceURI(element) === NS.HTML) {
			p._endTagOutsideForeignContent(token);
			break;
		}
		const tagName = p.treeAdapter.getTagName(element);
		if (tagName.toLowerCase() === token.tagName) {
			token.tagName = tagName;
			p.openElements.shortenToLength(i);
			break;
		}
	}
}
TAG_NAMES.AREA, TAG_NAMES.BASE, TAG_NAMES.BASEFONT, TAG_NAMES.BGSOUND, TAG_NAMES.BR, TAG_NAMES.COL, TAG_NAMES.EMBED, TAG_NAMES.FRAME, TAG_NAMES.HR, TAG_NAMES.IMG, TAG_NAMES.INPUT, TAG_NAMES.KEYGEN, TAG_NAMES.LINK, TAG_NAMES.META, TAG_NAMES.PARAM, TAG_NAMES.SOURCE, TAG_NAMES.TRACK, TAG_NAMES.WBR;
//#endregion
//#region node_modules/.pnpm/parse5@8.0.1/node_modules/parse5/dist/index.js
/**
* Parses an HTML string.
*
* @param html Input HTML string.
* @param options Parsing options.
* @returns Document
*
* @example
*
* ```js
* const parse5 = require('parse5');
*
* const document = parse5.parse('<!DOCTYPE html><html><head></head><body>Hi there!</body></html>');
*
* console.log(document.childNodes[1].tagName); //> 'html'
*```
*/
function parse$2(html, options) {
	return Parser.parse(html, options);
}
//#endregion
//#region node_modules/.pnpm/es-module-lexer@2.3.2/node_modules/es-module-lexer/dist/lexer.asm.js
let e;
let a;
let r;
let i = 2 << 19;
const s = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0] ? function(e, a) {
	const r = e.length;
	let i = 0;
	for (; i < r;) a[i] = e.charCodeAt(i++);
} : function(e, a) {
	const r = e.length;
	let i = 0;
	for (; i < r;) {
		const r = e.charCodeAt(i);
		a[i++] = (255 & r) << 8 | r >>> 8;
	}
};
const f = "xportportetaourceeferromsyncunctionlassvoyiedelecontininstantybreareturdebuggeawaithrwhileforifcatcfinallels";
let c;
let t;
let n;
function parse$1(k, l = "@") {
	c = k, t = l;
	const u = 2 * c.length + (2 << 18);
	if (u > i || !e) {
		for (; u > i;) i *= 2;
		a = new ArrayBuffer(i), s(f, new Uint16Array(a, 16, 108)), e = function(e, a, r) {
			"use asm";
			var i = new e.Int8Array(r), s = new e.Int16Array(r), f = new e.Int32Array(r), c = new e.Uint8Array(r);
			new e.Uint16Array(r);
			var n = 1040;
			function b() {
				var e = 0, a = 0, r = 0, c = 0, t = 0, b = 0, k = 0, o = 0, h = 0;
				h = n;
				n = n + 10240 | 0;
				i[808] = 1;
				i[807] = 0;
				s[401] = 0;
				s[402] = 0;
				f[70] = f[2];
				i[809] = 0;
				f[68] = 0;
				i[806] = 0;
				f[71] = h + 2048;
				f[72] = h;
				i[810] = 0;
				e = (f[3] | 0) + -2 | 0;
				f[73] = e;
				a = e + (f[66] << 1) | 0;
				f[74] = a;
				e: while (1) {
					r = e + 2 | 0;
					f[73] = r;
					if (e >>> 0 >= a >>> 0) {
						c = 19;
						break;
					}
					a: do
						switch (s[r >> 1] | 0) {
							case 9:
							case 10:
							case 11:
							case 12:
							case 13:
							case 32: break;
							case 101:
								if ((((s[402] | 0) == 0 ? R(r) | 0 : 0) ? (S(e + 4 | 0, 16, 10) | 0) == 0 : 0) ? (u(), (i[808] | 0) == 0) : 0) {
									c = 9;
									break e;
								} else c = 18;
								break;
							case 105:
								if (((s[e + 4 >> 1] | 0) == 109 ? R(r) | 0 : 0) ? (S(e + 6 | 0, 26, 8) | 0) == 0 : 0) {
									l();
									c = 18;
								} else c = 18;
								break;
							case 59:
								c = 18;
								break;
							case 47: switch (s[e + 4 >> 1] | 0) {
								case 47:
									F();
									break a;
								case 42:
									x(1);
									break a;
								default:
									c = 17;
									break e;
							}
							default:
								c = 17;
								break e;
						}
					while (0);
					if ((c | 0) == 18) {
						c = 0;
						f[70] = f[73];
					}
					e = f[73] | 0;
					a = f[74] | 0;
				}
				if ((c | 0) == 9) {
					e = f[73] | 0;
					f[70] = e;
					c = 20;
				} else if ((c | 0) == 17) {
					i[808] = 0;
					f[73] = e;
					c = 20;
				} else if ((c | 0) == 19) if (!(i[806] | 0)) {
					e = r;
					c = 20;
				} else e = 0;
				do
					if ((c | 0) == 20) {
						r = e;
						e: while (1) {
							e = r + 2 | 0;
							f[73] = e;
							if (r >>> 0 >= (f[74] | 0) >>> 0) {
								c = 108;
								break;
							}
							a = s[e >> 1] | 0;
							a: do
								switch (a << 16 >> 16) {
									case 9:
									case 10:
									case 11:
									case 12:
									case 13:
									case 32: break;
									case 101:
										if (((s[402] | 0) == 0 ? R(e) | 0 : 0) ? (S(r + 4 | 0, 16, 10) | 0) == 0 : 0) {
											u();
											c = 107;
										} else c = 104;
										break;
									case 105:
										if (((s[r + 4 >> 1] | 0) == 109 ? R(e) | 0 : 0) ? (S(r + 6 | 0, 26, 8) | 0) == 0 : 0) {
											l();
											c = 107;
										} else c = 104;
										break;
									case 99:
										if ((((s[r + 4 >> 1] | 0) == 108 ? R(e) | 0 : 0) ? (S(r + 6 | 0, 88, 6) | 0) == 0 : 0) ? L(s[r + 12 >> 1] | 0) | 0 : 0) {
											i[810] = 1;
											c = 104;
										} else c = 104;
										break;
									case 40:
										r = f[71] | 0;
										c = s[402] | 0;
										f[r + ((c & 65535) << 3) >> 2] = 1;
										a = f[70] | 0;
										s[402] = c + 1 << 16 >> 16;
										f[r + ((c & 65535) << 3) + 4 >> 2] = a;
										c = 107;
										break;
									case 91:
										r = f[71] | 0;
										c = s[402] | 0;
										f[r + ((c & 65535) << 3) >> 2] = 8;
										a = f[70] | 0;
										s[402] = c + 1 << 16 >> 16;
										f[r + ((c & 65535) << 3) + 4 >> 2] = a;
										c = 107;
										break;
									case 93:
										e = s[402] | 0;
										if (!(e << 16 >> 16)) {
											c = 40;
											break e;
										}
										s[402] = e + -1 << 16 >> 16;
										c = 107;
										break;
									case 44:
										e = s[401] | 0;
										if (((e << 16 >> 16 != 0 ? (t = s[402] | 0, t << 16 >> 16 != 0) : 0) ? (f[(f[71] | 0) + ((t & 65535) + -1 << 3) >> 2] | 0) == 5 : 0) ? (b = f[(f[72] | 0) + ((e & 65535) + -1 << 2) >> 2] | 0, (f[b + 4 >> 2] | 0) == 0) : 0) {
											f[b + 4 >> 2] = (f[70] | 0) + 2;
											f[73] = r + 4;
											v(1) | 0;
											c = f[73] | 0;
											f[b + 16 >> 2] = c;
											f[73] = c + -2;
											c = 107;
										} else c = 107;
										break;
									case 41:
										e = s[402] | 0;
										if (!(e << 16 >> 16)) {
											c = 48;
											break e;
										}
										s[402] = e + -1 << 16 >> 16;
										a = s[401] | 0;
										if (a << 16 >> 16 != 0 ? (f[(f[71] | 0) + ((e + -1 & 65535) << 3) >> 2] | 0) == 5 : 0) {
											e = f[(f[72] | 0) + ((a & 65535) + -1 << 2) >> 2] | 0;
											if (!(f[e + 4 >> 2] | 0)) f[e + 4 >> 2] = (f[70] | 0) + 2;
											f[e + 12 >> 2] = r + 4;
											s[401] = a + -1 << 16 >> 16;
											c = 107;
										} else c = 107;
										break;
									case 123:
										e = f[70] | 0;
										c = f[62] | 0;
										do
											if ((s[e >> 1] | 0) == 41 & (c | 0) != 0 ? (f[c + 12 >> 2] | 0) == (e + 2 | 0) : 0) {
												a = f[63] | 0;
												f[62] = a;
												if (!a) {
													f[58] = 0;
													break;
												} else {
													f[a + 36 >> 2] = 0;
													break;
												}
											}
										while (0);
										r = f[71] | 0;
										c = s[402] | 0;
										f[r + ((c & 65535) << 3) >> 2] = (i[810] | 0) == 0 ? 2 : 6;
										s[402] = c + 1 << 16 >> 16;
										f[r + ((c & 65535) << 3) + 4 >> 2] = e;
										i[810] = 0;
										c = 107;
										break;
									case 125:
										e = s[402] | 0;
										if (!(e << 16 >> 16)) {
											c = 61;
											break e;
										}
										c = f[71] | 0;
										s[402] = e + -1 << 16 >> 16;
										if ((f[c + ((e + -1 & 65535) << 3) >> 2] | 0) == 4) {
											d();
											c = 107;
										} else c = 107;
										break;
									case 34:
									case 39:
										C(a);
										c = 107;
										break;
									case 47: switch (s[r + 4 >> 1] | 0) {
										case 47:
											F();
											break a;
										case 42:
											x(1);
											break a;
										default:
											e = f[70] | 0;
											a = s[e >> 1] | 0;
											r: do
												if (!($(a) | 0)) if (a << 16 >> 16 == 41) {
													r = s[402] | 0;
													if (!(K(f[(f[71] | 0) + ((r & 65535) << 3) + 4 >> 2] | 0) | 0)) c = 76;
												} else c = 75;
												else switch (a << 16 >> 16) {
													case 46: if (((s[e + -2 >> 1] | 0) + -48 & 65535) < 10) {
														c = 75;
														break r;
													} else break r;
													case 43: if ((s[e + -2 >> 1] | 0) == 43) {
														c = 75;
														break r;
													} else break r;
													case 45: if ((s[e + -2 >> 1] | 0) == 45) {
														c = 75;
														break r;
													} else break r;
													default: break r;
												}
											while (0);
											if ((c | 0) == 75) {
												r = s[402] | 0;
												c = 76;
											}
											r: do
												if ((c | 0) == 76) {
													c = 0;
													if (r << 16 >> 16 != 0 ? (k = f[71] | 0, o = (r & 65535) + -1 | 0, a << 16 >> 16 == 102 ? (f[k + (o << 3) >> 2] | 0) == 1 : 0) : 0) {
														if (((s[e + -2 >> 1] | 0) == 111 ? g(e + -4 | 0) | 0 : 0) ? E(f[k + (o << 3) + 4 >> 2] | 0, 196, 3) | 0 : 0) break;
													} else c = 81;
													if ((c | 0) == 81 ? a << 16 >> 16 == 125 : 0) {
														c = f[71] | 0;
														r = r & 65535;
														if (U(f[c + (r << 3) + 4 >> 2] | 0) | 0) break;
														if ((f[c + (r << 3) >> 2] | 0) == 6) break;
													}
													if (!(w(e) | 0)) {
														switch (a << 16 >> 16) {
															case 0: break r;
															case 47: if (i[809] | 0) break r;
														}
														c = f[64] | 0;
														if ((c | 0 ? e >>> 0 >= (f[c >> 2] | 0) >>> 0 : 0) ? e >>> 0 <= (f[c + 4 >> 2] | 0) >>> 0 : 0) {
															I();
															i[809] = 0;
															c = 107;
															break a;
														}
														r = f[3] | 0;
														do {
															if (e >>> 0 <= r >>> 0) break;
															e = e + -2 | 0;
															f[70] = e;
															a = s[e >> 1] | 0;
														} while (!(D(a) | 0));
														if (M(a) | 0) {
															do {
																if (e >>> 0 <= r >>> 0) break;
																e = e + -2 | 0;
																f[70] = e;
															} while (M(s[e >> 1] | 0) | 0);
															if (q(e) | 0) {
																I();
																i[809] = 0;
																c = 107;
																break a;
															}
														}
														i[809] = 1;
														c = 107;
														break a;
													}
												}
											while (0);
											I();
											i[809] = 0;
											c = 107;
											break a;
									}
									case 96:
										r = f[71] | 0;
										c = s[402] | 0;
										f[r + ((c & 65535) << 3) + 4 >> 2] = f[70];
										s[402] = c + 1 << 16 >> 16;
										f[r + ((c & 65535) << 3) >> 2] = 3;
										d();
										c = 107;
										break;
									default: if ((a & 65535) > 127 & a << 16 >> 16 != 160 | (a << 16 >> 16 == 92 | (a << 16 >> 16 == 95 | (a << 16 >> 16 == 36 | ((a + -48 & 65535) < 10 | ((a | 32) + -97 & 65535) < 26))))) c = 104;
									else c = 107;
								}
							while (0);
							a: do
								if ((c | 0) == 104) while (1) {
									e = e + 2 | 0;
									c = s[e >> 1] | 0;
									if (!((c & 65535) > 127 & c << 16 >> 16 != 160 | (c << 16 >> 16 == 92 | (c << 16 >> 16 == 95 | (c << 16 >> 16 == 36 | ((c + -48 & 65535) < 10 | ((c | 32) + -97 & 65535) < 26)))))) {
										c = 107;
										break a;
									}
									f[73] = e;
								}
							while (0);
							if ((c | 0) == 107) {
								c = 0;
								f[70] = f[73];
							}
							r = f[73] | 0;
						}
						if ((c | 0) == 40) {
							ae();
							e = 0;
							break;
						} else if ((c | 0) == 48) {
							ae();
							e = 0;
							break;
						} else if ((c | 0) == 61) {
							ae();
							e = 0;
							break;
						} else if ((c | 0) == 108) {
							e = (i[806] | 0) == 0 ? (s[401] | s[402]) << 16 >> 16 == 0 : 0;
							break;
						}
					}
				while (0);
				n = h;
				return e | 0;
			}
			function k(e) {
				e = e | 0;
				var a = 0, r = 0, c = 0, t = 0, n = 0, b = 0, k = 0, o = 0, h = 0, A = 0, p = 0, y = 0, m = 0, O = 0, T = 0;
				y = s[402] | 0;
				a = f[73] | 0;
				f[70] = a;
				k = a;
				p = a;
				o = y;
				A = 0;
				e: while (1) {
					c = f[74] | 0;
					n = o << 16 >> 16 == y << 16 >> 16;
					t = A & e;
					b = a;
					while (1) {
						r = b + 2 | 0;
						if (b >>> 0 >= c >>> 0) {
							a = 0;
							h = 104;
							break e;
						}
						a = s[r >> 1] | 0;
						if (!(M(a) | 0)) {
							if (n) {
								switch (a << 16 >> 16) {
									case 125:
									case 93:
									case 41:
									case 59:
									case 44:
										h = 104;
										break e;
								}
								if (t ? be(a) | 0 : 0) {
									h = 104;
									break e;
								}
							}
							if (!(be(a) | 0)) break;
						}
						b = r;
					}
					f[73] = r;
					a: do
						switch (a << 16 >> 16) {
							case 101:
								if ((o << 16 >> 16 == 0 ? R(r) | 0 : 0) ? (S(b + 4 | 0, 16, 10) | 0) == 0 : 0) {
									u();
									h = 93;
								} else h = 90;
								break;
							case 105:
								if (((s[b + 4 >> 1] | 0) == 109 ? R(r) | 0 : 0) ? (S(b + 6 | 0, 26, 8) | 0) == 0 : 0) {
									l();
									h = 93;
								} else h = 90;
								break;
							case 99:
								if ((((s[b + 4 >> 1] | 0) == 108 ? R(r) | 0 : 0) ? (S(b + 6 | 0, 88, 6) | 0) == 0 : 0) ? L(s[b + 12 >> 1] | 0) | 0 : 0) {
									i[810] = 1;
									h = 90;
								} else h = 90;
								break;
							case 40:
								b = f[71] | 0;
								h = o & 65535;
								f[b + (h << 3) >> 2] = 1;
								s[402] = o + 1 << 16 >> 16;
								f[b + (h << 3) + 4 >> 2] = k;
								h = 93;
								break;
							case 91:
								b = f[71] | 0;
								h = o & 65535;
								f[b + (h << 3) >> 2] = 8;
								s[402] = o + 1 << 16 >> 16;
								f[b + (h << 3) + 4 >> 2] = k;
								h = 93;
								break;
							case 93: if (!(o << 16 >> 16)) {
								ae();
								break a;
							} else {
								s[402] = o + -1 << 16 >> 16;
								h = 93;
								break a;
							}
							case 44:
								r = s[401] | 0;
								if ((!(o << 16 >> 16 == 0 | r << 16 >> 16 == 0) ? (f[(f[71] | 0) + ((o & 65535) + -1 << 3) >> 2] | 0) == 5 : 0) ? (m = f[(f[72] | 0) + ((r & 65535) + -1 << 2) >> 2] | 0, (f[m + 4 >> 2] | 0) == 0) : 0) {
									f[m + 4 >> 2] = p + 2;
									f[73] = b + 4;
									v(1) | 0;
									h = f[73] | 0;
									f[m + 16 >> 2] = h;
									f[73] = h + -2;
									h = 93;
								} else h = 93;
								break;
							case 41:
								if (!(o << 16 >> 16)) {
									ae();
									break a;
								}
								h = o + -1 << 16 >> 16;
								s[402] = h;
								r = s[401] | 0;
								if (r << 16 >> 16 != 0 ? (f[(f[71] | 0) + ((h & 65535) << 3) >> 2] | 0) == 5 : 0) {
									c = f[(f[72] | 0) + ((r & 65535) + -1 << 2) >> 2] | 0;
									if (!(f[c + 4 >> 2] | 0)) f[c + 4 >> 2] = p + 2;
									f[c + 12 >> 2] = b + 4;
									s[401] = r + -1 << 16 >> 16;
									h = 93;
								} else h = 93;
								break;
							case 123:
								h = f[62] | 0;
								do
									if ((s[p >> 1] | 0) == 41 & (h | 0) != 0 ? (f[h + 12 >> 2] | 0) == (p + 2 | 0) : 0) {
										r = f[63] | 0;
										f[62] = r;
										if (!r) {
											f[58] = 0;
											break;
										} else {
											f[r + 36 >> 2] = 0;
											break;
										}
									}
								while (0);
								b = f[71] | 0;
								h = o & 65535;
								f[b + (h << 3) >> 2] = (i[810] | 0) == 0 ? 2 : 6;
								s[402] = o + 1 << 16 >> 16;
								f[b + (h << 3) + 4 >> 2] = k;
								i[810] = 0;
								h = 93;
								break;
							case 125:
								if (!(o << 16 >> 16)) {
									ae();
									break a;
								}
								k = f[71] | 0;
								h = o + -1 << 16 >> 16;
								s[402] = h;
								if ((f[k + ((h & 65535) << 3) >> 2] | 0) == 4) {
									d();
									h = 93;
								} else h = 93;
								break;
							case 34:
							case 39:
								C(a);
								h = 93;
								break;
							case 47: switch (s[b + 4 >> 1] | 0) {
								case 47:
									F();
									break a;
								case 42:
									x(1);
									break a;
								default:
									c = s[p >> 1] | 0;
									r: do
										if (!($(c) | 0)) {
											if (!(c << 16 >> 16 == 41 ? K(f[(f[71] | 0) + ((o & 65535) << 3) + 4 >> 2] | 0) | 0 : 0)) h = 62;
										} else switch (c << 16 >> 16) {
											case 46: if (((s[p + -2 >> 1] | 0) + -48 & 65535) < 10) {
												h = 62;
												break r;
											} else break r;
											case 43: if ((s[p + -2 >> 1] | 0) == 43) {
												h = 62;
												break r;
											} else break r;
											case 45: if ((s[p + -2 >> 1] | 0) == 45) {
												h = 62;
												break r;
											} else break r;
											default: break r;
										}
									while (0);
									r: do
										if ((h | 0) == 62) {
											h = 0;
											if (o << 16 >> 16 != 0 ? (O = f[71] | 0, T = (o & 65535) + -1 | 0, c << 16 >> 16 == 102 ? (f[O + (T << 3) >> 2] | 0) == 1 : 0) : 0) {
												if (((s[p + -2 >> 1] | 0) == 111 ? g(p + -4 | 0) | 0 : 0) ? E(f[O + (T << 3) + 4 >> 2] | 0, 196, 3) | 0 : 0) break;
											} else h = 67;
											if ((h | 0) == 67 ? c << 16 >> 16 == 125 : 0) {
												t = f[71] | 0;
												r = o & 65535;
												if (U(f[t + (r << 3) + 4 >> 2] | 0) | 0) break;
												if ((f[t + (r << 3) >> 2] | 0) == 6) break;
											}
											if (!(w(p) | 0)) {
												switch (c << 16 >> 16) {
													case 0: break r;
													case 47: if (i[809] | 0) break r;
												}
												h = f[64] | 0;
												if ((h | 0 ? p >>> 0 >= (f[h >> 2] | 0) >>> 0 : 0) ? p >>> 0 <= (f[h + 4 >> 2] | 0) >>> 0 : 0) {
													I();
													i[809] = 0;
													h = 93;
													break a;
												}
												t = f[3] | 0;
												r = p;
												do {
													if (r >>> 0 <= t >>> 0) break;
													r = r + -2 | 0;
													f[70] = r;
													c = s[r >> 1] | 0;
												} while (!(D(c) | 0));
												if (M(c) | 0) {
													do {
														if (r >>> 0 <= t >>> 0) break;
														r = r + -2 | 0;
														f[70] = r;
													} while (M(s[r >> 1] | 0) | 0);
													if (q(r) | 0) {
														I();
														i[809] = 0;
														h = 93;
														break a;
													}
												}
												i[809] = 1;
												h = 93;
												break a;
											}
										}
									while (0);
									I();
									i[809] = 0;
									h = 93;
									break a;
							}
							case 96:
								b = f[71] | 0;
								h = o & 65535;
								f[b + (h << 3) + 4 >> 2] = k;
								s[402] = o + 1 << 16 >> 16;
								f[b + (h << 3) >> 2] = 3;
								d();
								h = 93;
								break;
							default: if ((a & 65535) > 127 & a << 16 >> 16 != 160 | (a << 16 >> 16 == 92 | (a << 16 >> 16 == 95 | (a << 16 >> 16 == 36 | ((a + -48 & 65535) < 10 | ((a | 32) + -97 & 65535) < 26))))) h = 90;
							else h = 93;
						}
					while (0);
					a: do
						if ((h | 0) == 90) while (1) {
							r = r + 2 | 0;
							h = s[r >> 1] | 0;
							if (!((h & 65535) > 127 & h << 16 >> 16 != 160 | (h << 16 >> 16 == 92 | (h << 16 >> 16 == 95 | (h << 16 >> 16 == 36 | ((h + -48 & 65535) < 10 | ((h | 32) + -97 & 65535) < 26)))))) {
								h = 93;
								break a;
							}
							f[73] = r;
						}
					while (0);
					if ((h | 0) == 93) {
						h = 0;
						f[70] = f[73];
					}
					if (i[806] | 0) {
						a = 0;
						break;
					}
					r = f[70] | 0;
					a: do
						if ((r | 0) == (p | 0)) if (A & ((s[402] | 0) == y << 16 >> 16 & e)) {
							a = s[f[73] >> 1] | 0;
							if (be(a) | 0) break e;
							else a = 1;
						} else a = A;
						else {
							if (a << 16 >> 16 == 47) {
								a = (i[809] | 0) == 0;
								break;
							}
							if (G(a) | 0) a = 1;
							else {
								switch (a << 16 >> 16) {
									case 96:
									case 34:
									case 39:
									case 41:
									case 93:
									case 125:
										a = 1;
										break a;
								}
								a = 0;
							}
						}
					while (0);
					k = r;
					p = r;
					o = s[402] | 0;
					A = a;
					a = f[73] | 0;
				}
				if ((h | 0) == 104) f[73] = r;
				return a | 0;
			}
			function l() {
				var e = 0, a = 0, r = 0, c = 0, t = 0, n = 0;
				n = f[73] | 0;
				f[73] = n + 12;
				e = v(1) | 0;
				r = f[73] | 0;
				e: do
					if (e << 16 >> 16 != 46) {
						if (!(e << 16 >> 16 == 115 & r >>> 0 > (n + 12 | 0) >>> 0)) {
							if (!(e << 16 >> 16 == 100 & r >>> 0 > (n + 10 | 0) >>> 0)) {
								r = 0;
								t = 28;
								break;
							}
							if (S(r + 2 | 0, 50, 8) | 0) {
								a = r;
								e = 100;
								r = 0;
								t = 60;
								break;
							}
							if (!(L(s[r + 10 >> 1] | 0) | 0)) {
								a = r;
								e = 100;
								r = 0;
								t = 60;
								break;
							}
							f[73] = r + 10;
							e = v(1) | 0;
							if (e << 16 >> 16 == 42) {
								e = 42;
								c = 2;
								t = 62;
								break;
							}
							f[73] = r;
							r = 0;
							t = 28;
							break;
						}
						if ((S(r + 2 | 0, 40, 10) | 0) == 0 ? L(s[r + 12 >> 1] | 0) | 0 : 0) {
							f[73] = r + 12;
							e = v(1) | 0;
							a = f[73] | 0;
							if ((a | 0) != (r + 12 | 0)) {
								if (e << 16 >> 16 != 102) {
									r = 1;
									t = 28;
									break;
								}
								if (S(a + 2 | 0, 58, 6) | 0) {
									e = 102;
									r = 1;
									t = 60;
									break;
								}
								if (!(D(s[a + 8 >> 1] | 0) | 0)) {
									e = 102;
									r = 1;
									t = 60;
									break;
								}
							}
							f[73] = r;
							r = 0;
							t = 28;
						} else {
							a = r;
							e = 115;
							r = 0;
							t = 60;
						}
					} else {
						f[73] = r + 2;
						switch ((v(1) | 0) << 16 >> 16) {
							case 109:
								e = f[73] | 0;
								if (S(e + 2 | 0, 34, 6) | 0) break e;
								a = f[70] | 0;
								if (!(N(a) | 0) ? (s[a >> 1] | 0) == 46 : 0) break e;
								A(n, n, e + 8 | 0, 2);
								break e;
							case 115:
								e = f[73] | 0;
								if (S(e + 2 | 0, 40, 10) | 0) break e;
								a = f[70] | 0;
								if (!(N(a) | 0) ? (s[a >> 1] | 0) == 46 : 0) break e;
								f[73] = e + 12;
								e = v(1) | 0;
								r = 1;
								t = 28;
								break e;
							case 100:
								e = f[73] | 0;
								if (S(e + 2 | 0, 50, 8) | 0) break e;
								a = f[70] | 0;
								if (!(N(a) | 0) ? (s[a >> 1] | 0) == 46 : 0) break e;
								f[73] = e + 10;
								e = v(1) | 0;
								r = 2;
								t = 28;
								break e;
							default: break e;
						}
					}
				while (0);
				e: do
					if ((t | 0) == 28) {
						if (e << 16 >> 16 == 40) {
							a = f[71] | 0;
							c = s[402] | 0;
							f[a + ((c & 65535) << 3) >> 2] = 5;
							e = f[73] | 0;
							s[402] = c + 1 << 16 >> 16;
							f[a + ((c & 65535) << 3) + 4 >> 2] = e;
							if ((s[f[70] >> 1] | 0) == 46) break;
							f[73] = e + 2;
							a = v(1) | 0;
							A(n, f[73] | 0, 0, e);
							if (!r) e = f[62] | 0;
							else {
								e = f[62] | 0;
								f[e + 28 >> 2] = (r | 0) == 1 ? 5 : 7;
							}
							c = f[72] | 0;
							n = s[401] | 0;
							s[401] = n + 1 << 16 >> 16;
							f[c + ((n & 65535) << 2) >> 2] = e;
							switch (a << 16 >> 16) {
								case 39:
									C(39);
									break;
								case 34:
									C(34);
									break;
								case 96:
									if (!(y() | 0)) t = 37;
									break;
								default: t = 37;
							}
							if ((t | 0) == 37) {
								f[73] = (f[73] | 0) + -2;
								break;
							}
							e = (f[73] | 0) + 2 | 0;
							f[73] = e;
							switch ((v(1) | 0) << 16 >> 16) {
								case 44:
									f[73] = (f[73] | 0) + 2;
									v(1) | 0;
									c = f[62] | 0;
									f[c + 4 >> 2] = e;
									n = f[73] | 0;
									f[c + 16 >> 2] = n;
									i[c + 24 >> 0] = 1;
									f[73] = n + -2;
									break e;
								case 41:
									s[402] = (s[402] | 0) + -1 << 16 >> 16;
									n = f[62] | 0;
									f[n + 4 >> 2] = e;
									f[n + 12 >> 2] = (f[73] | 0) + 2;
									i[n + 24 >> 0] = 1;
									s[401] = (s[401] | 0) + -1 << 16 >> 16;
									break e;
								default:
									f[73] = (f[73] | 0) + -2;
									break e;
							}
						}
						if (!((r | 0) == 0 & e << 16 >> 16 == 123)) {
							switch (e << 16 >> 16) {
								case 42:
								case 39:
								case 34:
									c = r;
									t = 62;
									break e;
							}
							a = f[73] | 0;
							t = 60;
							break;
						}
						e = f[73] | 0;
						if (s[402] | 0) {
							f[73] = e + -2;
							break;
						}
						while (1) {
							if (e >>> 0 >= (f[74] | 0) >>> 0) break;
							e = v(1) | 0;
							if (!(re(e) | 0)) {
								if (e << 16 >> 16 == 125) {
									t = 50;
									break;
								}
							} else C(e);
							e = (f[73] | 0) + 2 | 0;
							f[73] = e;
						}
						if ((t | 0) == 50) f[73] = (f[73] | 0) + 2;
						c = (v(1) | 0) << 16 >> 16 == 102;
						e = f[73] | 0;
						if (c ? S(e + 2 | 0, 58, 6) | 0 : 0) {
							ae();
							break;
						}
						f[73] = e + 8;
						e = v(1) | 0;
						if (re(e) | 0) {
							o(n, e, 0);
							break;
						} else {
							ae();
							break;
						}
					}
				while (0);
				if ((t | 0) == 60) if ((a | 0) == (n + 12 | 0)) f[73] = n + 10;
				else {
					c = r;
					t = 62;
				}
				do
					if ((t | 0) == 62) {
						if (!((e << 16 >> 16 == 42 | (c | 0) != 2) & (s[402] | 0) == 0)) {
							f[73] = (f[73] | 0) + -2;
							break;
						}
						e = f[74] | 0;
						a = f[73] | 0;
						while (1) {
							if (a >>> 0 >= e >>> 0) {
								t = 69;
								break;
							}
							r = s[a >> 1] | 0;
							if (re(r) | 0) {
								t = 67;
								break;
							}
							t = a + 2 | 0;
							f[73] = t;
							a = t;
						}
						if ((t | 0) == 67) {
							o(n, r, c);
							break;
						} else if ((t | 0) == 69) {
							ae();
							break;
						}
					}
				while (0);
			}
			function u() {
				var e = 0, a = 0, r = 0, c = 0, t = 0, n = 0, b = 0, l = 0, u = 0, h = 0;
				l = f[73] | 0;
				u = f[64] | 0;
				f[73] = l + 12;
				a = v(1) | 0;
				e = f[73] | 0;
				if (!((e | 0) == (l + 12 | 0) ? !(O(a) | 0) : 0)) h = 3;
				e: do
					if ((h | 0) == 3) {
						f[65] = l;
						a: do
							switch (a << 16 >> 16) {
								case 123:
									f[73] = e + 2;
									e = v(1) | 0;
									a = f[73] | 0;
									while (1) {
										if (re(e) | 0) {
											C(e);
											e = (f[73] | 0) + 2 | 0;
											f[73] = e;
										} else {
											H(e) | 0;
											e = f[73] | 0;
										}
										v(1) | 0;
										e = p(a, e) | 0;
										if (e << 16 >> 16 == 44) {
											f[73] = (f[73] | 0) + 2;
											e = v(1) | 0;
										}
										if (e << 16 >> 16 == 125) {
											h = 15;
											break;
										}
										h = a;
										a = f[73] | 0;
										if ((a | 0) == (h | 0)) {
											h = 12;
											break;
										}
										if (a >>> 0 > (f[74] | 0) >>> 0) {
											h = 14;
											break;
										}
									}
									if ((h | 0) == 12) {
										ae();
										break e;
									} else if ((h | 0) == 14) {
										ae();
										break e;
									} else if ((h | 0) == 15) {
										i[807] = 1;
										f[73] = (f[73] | 0) + 2;
										break a;
									}
									break;
								case 42:
									f[73] = e + 2;
									v(1) | 0;
									h = f[73] | 0;
									p(h, h) | 0;
									break;
								default:
									i[808] = 0;
									switch (a << 16 >> 16) {
										case 100:
											f[73] = e + 14;
											switch ((v(1) | 0) << 16 >> 16) {
												case 97:
													a = f[73] | 0;
													if ((S(a + 2 | 0, 64, 8) | 0) == 0 ? M(s[a + 10 >> 1] | 0) | 0 : 0) {
														f[73] = a + 10;
														v(0) | 0;
														h = 22;
													}
													break;
												case 102:
													h = 22;
													break;
												case 99:
													a = f[73] | 0;
													if (((S(a + 2 | 0, 86, 8) | 0) == 0 ? (u = s[a + 10 >> 1] | 0, L(u) | 0 | u << 16 >> 16 == 123) : 0) ? (f[73] = a + 10, r = v(1) | 0, r << 16 >> 16 != 123) : 0) {
														b = r;
														h = 31;
													}
											}
											r: do
												if ((h | 0) == 22 ? (c = f[73] | 0, (S(c + 2 | 0, 72, 14) | 0) == 0) : 0) {
													a = s[c + 16 >> 1] | 0;
													if (!(L(a) | 0)) switch (a << 16 >> 16) {
														case 40:
														case 42: break;
														default: break r;
													}
													f[73] = c + 16;
													a = v(1) | 0;
													if (a << 16 >> 16 == 42) {
														f[73] = (f[73] | 0) + 2;
														a = v(1) | 0;
													}
													if (a << 16 >> 16 != 40) {
														b = a;
														h = 31;
													}
												}
											while (0);
											if ((h | 0) == 31 ? (t = f[73] | 0, H(b) | 0, n = f[73] | 0, n >>> 0 > t >>> 0) : 0) {
												T(e, e + 14 | 0, t, n);
												f[73] = (f[73] | 0) + -2;
												break e;
											}
											T(e, e + 14 | 0, 0, 0);
											f[73] = e + 12;
											break e;
										case 97:
											f[73] = e + 10;
											v(0) | 0;
											e = f[73] | 0;
											h = 35;
											break;
										case 102:
											h = 35;
											break;
										case 99:
											if ((S(e + 2 | 0, 86, 8) | 0) == 0 ? D(s[e + 10 >> 1] | 0) | 0 : 0) {
												f[73] = e + 10;
												h = v(1) | 0;
												u = f[73] | 0;
												H(h) | 0;
												h = f[73] | 0;
												T(u, h, u, h);
												f[73] = (f[73] | 0) + -2;
												break e;
											}
											f[73] = e + 4;
											e = e + 4 | 0;
											break;
										case 108:
										case 118: break;
										default: break e;
									}
									if ((h | 0) == 35) {
										f[73] = e + 16;
										e = v(1) | 0;
										if (e << 16 >> 16 == 42) {
											f[73] = (f[73] | 0) + 2;
											e = v(1) | 0;
										}
										u = f[73] | 0;
										H(e) | 0;
										h = f[73] | 0;
										T(u, h, u, h);
										f[73] = (f[73] | 0) + -2;
										break e;
									}
									f[73] = e + 6;
									i[808] = 0;
									while (1) {
										a = v(1) | 0;
										e = f[73] | 0;
										if (e >>> 0 > (f[74] | 0) >>> 0) break;
										a = P(a) | 0;
										if ((f[73] | 0) == (e | 0)) break;
										if (a << 16 >> 16 == 61) a = k(1) | 0;
										e = f[73] | 0;
										if (a << 16 >> 16 != 44) break;
										f[73] = e + 2;
									}
									f[73] = e + -2;
									break e;
							}
						while (0);
						h = (v(1) | 0) << 16 >> 16 == 102;
						e = f[73] | 0;
						if (h ? (S(e + 2 | 0, 58, 6) | 0) == 0 : 0) {
							f[73] = e + 8;
							o(l, v(1) | 0, 0);
							e = (u | 0) == 0 ? 236 : u + 20 | 0;
							while (1) {
								e = f[e >> 2] | 0;
								if (!e) break e;
								f[e + 12 >> 2] = 0;
								f[e + 8 >> 2] = 0;
								e = e + 20 | 0;
							}
						}
						f[73] = e + -2;
					}
				while (0);
			}
			function o(e, a, r) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				var i = 0, c = 0, t = 0, n = 0, b = 0;
				i = (f[73] | 0) + 2 | 0;
				switch (a << 16 >> 16) {
					case 39:
						C(39);
						c = 5;
						break;
					case 34:
						C(34);
						c = 5;
						break;
					default: ae();
				}
				do
					if ((c | 0) == 5) {
						A(e, i, f[73] | 0, 1);
						if ((r | 0) > 0) f[(f[62] | 0) + 28 >> 2] = (r | 0) == 1 ? 4 : 6;
						f[73] = (f[73] | 0) + 2;
						n = (v(0) | 0) << 16 >> 16 == 119;
						t = f[73] | 0;
						if (((n ? (s[t + 2 >> 1] | 0) == 105 : 0) ? (s[t + 4 >> 1] | 0) == 116 : 0) ? (s[t + 6 >> 1] | 0) == 104 : 0) {
							f[73] = t + 8;
							if ((v(1) | 0) << 16 >> 16 != 123) {
								f[73] = t;
								break;
							}
							n = f[73] | 0;
							i = n;
							c = 0;
							e: while (1) {
								f[73] = i + 2;
								i = v(1) | 0;
								do
									if (i << 16 >> 16 != 39) {
										a = f[73] | 0;
										if (i << 16 >> 16 == 34) {
											C(34);
											e = (f[73] | 0) + 2 | 0;
											f[73] = e;
											i = v(1) | 0;
											break;
										} else {
											i = H(i) | 0;
											e = f[73] | 0;
											break;
										}
									} else {
										a = f[73] | 0;
										C(39);
										e = (f[73] | 0) + 2 | 0;
										f[73] = e;
										i = v(1) | 0;
									}
								while (0);
								if (i << 16 >> 16 != 58) {
									c = 21;
									break;
								}
								f[73] = (f[73] | 0) + 2;
								switch ((v(1) | 0) << 16 >> 16) {
									case 39:
										i = f[73] | 0;
										C(39);
										break;
									case 34:
										i = f[73] | 0;
										C(34);
										break;
									default:
										c = 25;
										break e;
								}
								b = (f[73] | 0) + 2 | 0;
								r = f[67] | 0;
								f[67] = r + 20;
								f[r >> 2] = a;
								f[r + 4 >> 2] = e;
								f[r + 8 >> 2] = i;
								f[r + 12 >> 2] = b;
								f[r + 16 >> 2] = 0;
								f[((c | 0) == 0 ? (f[62] | 0) + 32 | 0 : c + 16 | 0) >> 2] = r;
								f[73] = (f[73] | 0) + 2;
								switch ((v(1) | 0) << 16 >> 16) {
									case 125:
										c = 29;
										break e;
									case 44: break;
									default:
										c = 27;
										break e;
								}
								i = (f[73] | 0) + 2 | 0;
								f[73] = i;
								c = r;
							}
							if ((c | 0) == 21) {
								f[73] = t;
								break;
							} else if ((c | 0) == 25) {
								f[73] = t;
								break;
							} else if ((c | 0) == 27) {
								f[73] = t;
								break;
							} else if ((c | 0) == 29) {
								b = f[62] | 0;
								f[b + 16 >> 2] = n;
								f[b + 12 >> 2] = (f[73] | 0) + 2;
								break;
							}
						}
						f[73] = t + -2;
					}
				while (0);
			}
			function h() {
				var e = 0, a = 0, r = 0, i = 0, c = 0, t = 0, n = 0;
				e = f[73] | 0;
				c = (s[e >> 1] | 0) == 123;
				f[73] = e + 2;
				e = v(1) | 0;
				t = c ? 125 : 93;
				e: while (1) {
					if ((t | 0) == (e & 65535 | 0)) break;
					i = f[73] | 0;
					if (i >>> 0 > (f[74] | 0) >>> 0) break;
					if ((e << 16 >> 16 == 46 ? (s[i + 2 >> 1] | 0) == 46 : 0) ? (s[i + 4 >> 1] | 0) == 46 : 0) {
						f[73] = i + 6;
						e = P(v(1) | 0) | 0;
					} else n = 9;
					a: do
						if ((n | 0) == 9) {
							n = 0;
							do
								if (c) {
									do
										if (e << 16 >> 16 == 91) {
											k(0) | 0;
											f[73] = (f[73] | 0) + 2;
											a = i;
										} else {
											if (re(e) | 0) {
												C(e);
												f[73] = (f[73] | 0) + 2;
												a = i;
												break;
											}
											if ((e + -48 & 65535) >= 10) {
												H(e) | 0;
												a = f[73] | 0;
												break;
											}
											e = i;
											r: while (1) {
												r = e + 2 | 0;
												a = s[r >> 1] | 0;
												i: do
													if ((a + -48 & 65535) >= 10) {
														switch (a << 16 >> 16) {
															case 67:
															case 68:
															case 70:
															case 97:
															case 65:
															case 99:
															case 100:
															case 102:
															case 46:
															case 66:
															case 69:
															case 79:
															case 88:
															case 95:
															case 98:
															case 101:
															case 110:
															case 111:
															case 120: break i;
															case 43:
															case 45: break;
															default: break r;
														}
														switch (s[e >> 1] | 0) {
															case 69:
															case 101: break;
															default: break r;
														}
													}
												while (0);
												e = r;
											}
											f[73] = r;
											a = i;
										}
									while (0);
									e = v(1) | 0;
									if (e << 16 >> 16 == 58) {
										f[73] = (f[73] | 0) + 2;
										e = P(v(1) | 0) | 0;
										break;
									}
									if (a >>> 0 > i >>> 0) T(i, a, i, a);
								} else if (e << 16 >> 16 == 44) {
									f[73] = i + 2;
									e = v(1) | 0;
									break a;
								} else {
									e = P(e) | 0;
									break;
								}
							while (0);
							if (e << 16 >> 16 == 61) e = k(0) | 0;
							if (e << 16 >> 16 != 44) break e;
							f[73] = (f[73] | 0) + 2;
							e = v(1) | 0;
						}
					while (0);
				}
			}
			function w(e) {
				e = e | 0;
				e: do
					switch (s[e >> 1] | 0) {
						case 100: switch (s[e + -2 >> 1] | 0) {
							case 105:
								e = E(e + -4 | 0, 94, 2) | 0;
								break e;
							case 108:
								e = E(e + -4 | 0, 98, 3) | 0;
								break e;
							default:
								e = 0;
								break e;
						}
						case 101: switch (s[e + -2 >> 1] | 0) {
							case 115: switch (s[e + -4 >> 1] | 0) {
								case 108:
									e = z(e + -6 | 0, 101) | 0;
									break e;
								case 97:
									e = z(e + -6 | 0, 99) | 0;
									break e;
								default:
									e = 0;
									break e;
							}
							case 116:
								e = E(e + -4 | 0, 104, 4) | 0;
								break e;
							case 117:
								e = E(e + -4 | 0, 112, 6) | 0;
								break e;
							default:
								e = 0;
								break e;
						}
						case 102:
							if ((s[e + -2 >> 1] | 0) == 111 ? (s[e + -4 >> 1] | 0) == 101 : 0) switch (s[e + -6 >> 1] | 0) {
								case 99:
									e = E(e + -8 | 0, 124, 6) | 0;
									break e;
								case 112:
									e = E(e + -8 | 0, 136, 2) | 0;
									break e;
								default:
									e = 0;
									break e;
							}
							else e = 0;
							break;
						case 107:
							e = E(e + -2 | 0, 140, 4) | 0;
							break;
						case 110:
							if (z(e + -2 | 0, 105) | 0) e = 1;
							else e = E(e + -2 | 0, 148, 5) | 0;
							break;
						case 111:
							e = z(e + -2 | 0, 100) | 0;
							break;
						case 114:
							e = E(e + -2 | 0, 158, 7) | 0;
							break;
						case 116:
							e = E(e + -2 | 0, 172, 4) | 0;
							break;
						case 119: switch (s[e + -2 >> 1] | 0) {
							case 101:
								e = z(e + -4 | 0, 110) | 0;
								break e;
							case 111:
								e = E(e + -4 | 0, 180, 3) | 0;
								break e;
							default:
								e = 0;
								break e;
						}
						default: e = 0;
					}
				while (0);
				return e | 0;
			}
			function d() {
				var e = 0, a = 0, r = 0;
				a = f[74] | 0;
				r = f[73] | 0;
				e: while (1) {
					e = r + 2 | 0;
					if (r >>> 0 >= a >>> 0) {
						a = 10;
						break;
					}
					switch (s[e >> 1] | 0) {
						case 96:
							a = 7;
							break e;
						case 36:
							if ((s[r + 4 >> 1] | 0) == 123) {
								a = 6;
								break e;
							}
							break;
						case 92: e = r + 4 | 0;
					}
					r = e;
				}
				if ((a | 0) == 6) {
					e = r + 4 | 0;
					f[73] = e;
					a = f[71] | 0;
					r = s[402] | 0;
					f[a + ((r & 65535) << 3) >> 2] = 4;
					s[402] = r + 1 << 16 >> 16;
					f[a + ((r & 65535) << 3) + 4 >> 2] = e;
				} else if ((a | 0) == 7) {
					f[73] = e;
					a = f[71] | 0;
					r = (s[402] | 0) + -1 << 16 >> 16;
					s[402] = r;
					if ((f[a + ((r & 65535) << 3) >> 2] | 0) != 3) ae();
				} else if ((a | 0) == 10) {
					f[73] = e;
					ae();
				}
			}
			function v(e) {
				e = e | 0;
				var a = 0, r = 0, i = 0;
				r = f[73] | 0;
				e: do {
					a = s[r >> 1] | 0;
					a: do
						if (a << 16 >> 16 != 47) if (e) if (L(a) | 0) break;
						else break e;
						else if (M(a) | 0) break;
						else break e;
						else switch (s[r + 2 >> 1] | 0) {
							case 47:
								F();
								break a;
							case 42:
								x(e);
								break a;
							default:
								a = 47;
								break e;
						}
					while (0);
					i = f[73] | 0;
					r = i + 2 | 0;
					f[73] = r;
				} while (i >>> 0 < (f[74] | 0) >>> 0);
				return a | 0;
			}
			function A(e, a, r, s) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				s = s | 0;
				var c = 0, t = 0;
				t = f[67] | 0;
				f[67] = t + 40;
				c = f[62] | 0;
				f[((c | 0) == 0 ? 232 : c + 36 | 0) >> 2] = t;
				f[63] = c;
				f[62] = t;
				f[t + 8 >> 2] = e;
				if (2 == (s | 0)) {
					e = 3;
					c = r;
				} else {
					e = 1 == (s | 0) ? 1 : 2;
					c = 1 == (s | 0) ? r + 2 | 0 : 0;
				}
				f[t + 12 >> 2] = c;
				f[t + 28 >> 2] = e;
				f[t >> 2] = a;
				f[t + 4 >> 2] = r;
				f[t + 16 >> 2] = 0;
				f[t + 20 >> 2] = s;
				i[t + 24 >> 0] = 1 == (s | 0) & 1;
				f[t + 32 >> 2] = 0;
				f[t + 36 >> 2] = 0;
				if (1 == (s | 0) | 2 == (s | 0)) i[807] = 1;
			}
			function C(e) {
				e = e | 0;
				var a = 0, r = 0, i = 0, c = 0;
				c = f[74] | 0;
				a = f[73] | 0;
				while (1) {
					i = a + 2 | 0;
					if (a >>> 0 >= c >>> 0) {
						a = 9;
						break;
					}
					r = s[i >> 1] | 0;
					if (r << 16 >> 16 == e << 16 >> 16) {
						a = 10;
						break;
					}
					if (r << 16 >> 16 == 92) {
						r = a + 4 | 0;
						if ((s[r >> 1] | 0) == 13) {
							a = a + 6 | 0;
							a = (s[a >> 1] | 0) == 10 ? a : r;
						} else a = r;
					} else if (be(r) | 0) {
						a = 9;
						break;
					} else a = i;
				}
				if ((a | 0) == 9) {
					f[73] = i;
					ae();
				} else if ((a | 0) == 10) f[73] = i;
			}
			function g(e) {
				e = e | 0;
				var a = 0, r = 0;
				a = s[e >> 1] | 0;
				if (L(a) | 0) r = 3;
				else switch (a << 16 >> 16) {
					case 41:
					case 125:
					case 93:
						r = 3;
						break;
					default: e = 0;
				}
				e: do
					if ((r | 0) == 3) {
						r = f[3] | 0;
						while (1) {
							if (e >>> 0 <= r >>> 0) break;
							e = e + -2 | 0;
							if (!(L(a) | 0)) break;
							a = s[e >> 1] | 0;
						}
						switch (a << 16 >> 16) {
							case 41:
							case 125:
							case 93:
								e = 1;
								break e;
						}
						e = (O(a) | 0) ^ 1;
					}
				while (0);
				return e | 0;
			}
			function p(e, a) {
				e = e | 0;
				a = a | 0;
				var r = 0, i = 0, c = 0, t = 0;
				r = f[73] | 0;
				i = s[r >> 1] | 0;
				c = (e | 0) == (a | 0) ? 0 : e;
				t = (e | 0) == (a | 0) ? 0 : a;
				if (i << 16 >> 16 == 97) {
					f[73] = r + 4;
					r = v(1) | 0;
					e = f[73] | 0;
					if (re(r) | 0) {
						C(r);
						a = (f[73] | 0) + 2 | 0;
						f[73] = a;
					} else {
						H(r) | 0;
						a = f[73] | 0;
					}
					i = v(1) | 0;
					r = f[73] | 0;
				}
				if ((r | 0) != (e | 0)) T(e, a, c, t);
				return i | 0;
			}
			function y() {
				var e = 0, a = 0, r = 0, i = 0;
				i = f[73] | 0;
				r = f[74] | 0;
				a = i;
				e: while (1) {
					e = a + 2 | 0;
					if (a >>> 0 >= r >>> 0) {
						a = 7;
						break;
					}
					switch (s[e >> 1] | 0) {
						case 96:
							a = 8;
							break e;
						case 92:
							e = a + 4 | 0;
							break;
						case 36: if ((s[a + 4 >> 1] | 0) == 123) {
							a = 7;
							break e;
						}
					}
					a = e;
				}
				if ((a | 0) == 7) {
					f[73] = i;
					e = 0;
				} else if ((a | 0) == 8) {
					f[73] = e;
					e = 1;
				}
				return e | 0;
			}
			function m() {
				var e = 0, a = 0, r = 0;
				r = f[74] | 0;
				a = f[73] | 0;
				e: while (1) {
					e = a + 2 | 0;
					if (a >>> 0 >= r >>> 0) {
						a = 6;
						break;
					}
					switch (s[e >> 1] | 0) {
						case 13:
						case 10:
							a = 6;
							break e;
						case 93:
							a = 7;
							break e;
						case 92: e = a + 4 | 0;
					}
					a = e;
				}
				if ((a | 0) == 6) {
					f[73] = e;
					ae();
					e = 0;
				} else if ((a | 0) == 7) {
					f[73] = e;
					e = 93;
				}
				return e | 0;
			}
			function I() {
				var e = 0, a = 0;
				e: while (1) {
					e = f[73] | 0;
					f[73] = e + 2;
					if (e >>> 0 >= (f[74] | 0) >>> 0) {
						a = 7;
						break;
					}
					switch (s[e + 2 >> 1] | 0) {
						case 13:
						case 10:
							a = 7;
							break e;
						case 47: break e;
						case 91:
							m() | 0;
							break;
						case 92: f[73] = e + 4;
					}
				}
				if ((a | 0) == 7) ae();
			}
			function U(e) {
				e = e | 0;
				switch (s[e >> 1] | 0) {
					case 62:
						e = (s[e + -2 >> 1] | 0) == 61;
						break;
					case 41:
					case 59:
						e = 1;
						break;
					case 104:
						e = E(e + -2 | 0, 206, 4) | 0;
						break;
					case 121:
						e = E(e + -2 | 0, 214, 6) | 0;
						break;
					case 101:
						e = E(e + -2 | 0, 226, 3) | 0;
						break;
					default: e = 0;
				}
				return e | 0;
			}
			function x(e) {
				e = e | 0;
				var a = 0, r = 0, i = 0, c = 0, t = 0;
				c = (f[73] | 0) + 2 | 0;
				f[73] = c;
				r = f[74] | 0;
				while (1) {
					a = c + 2 | 0;
					if (c >>> 0 >= r >>> 0) break;
					i = s[a >> 1] | 0;
					if (!e ? be(i) | 0 : 0) break;
					if (i << 16 >> 16 == 42 ? (s[c + 4 >> 1] | 0) == 47 : 0) {
						t = 8;
						break;
					}
					c = a;
				}
				if ((t | 0) == 8) {
					f[73] = a;
					a = c + 4 | 0;
				}
				f[73] = a;
			}
			function S(e, a, r) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				var s = 0, f = 0;
				e: do
					if (!r) e = 0;
					else {
						while (1) {
							s = i[e >> 0] | 0;
							f = i[a >> 0] | 0;
							if (s << 24 >> 24 != f << 24 >> 24) break;
							r = r + -1 | 0;
							if (!r) {
								e = 0;
								break e;
							} else {
								e = e + 1 | 0;
								a = a + 1 | 0;
							}
						}
						e = (s & 255) - (f & 255) | 0;
					}
				while (0);
				return e | 0;
			}
			function O(e) {
				e = e | 0;
				e: do
					switch (e << 16 >> 16) {
						case 38:
						case 37:
						case 33:
							e = 1;
							break;
						default: if ((e & -8) << 16 >> 16 == 40 | (e + -58 & 65535) < 6) e = 1;
						else {
							switch (e << 16 >> 16) {
								case 91:
								case 93:
								case 94:
									e = 1;
									break e;
							}
							e = (e + -123 & 65535) < 4;
						}
					}
				while (0);
				return e | 0;
			}
			function $(e) {
				e = e | 0;
				e: do
					switch (e << 16 >> 16) {
						case 38:
						case 37:
						case 33: break;
						default: if (!((e + -58 & 65535) < 6 | (e + -40 & 65535) < 7 & e << 16 >> 16 != 41)) {
							switch (e << 16 >> 16) {
								case 91:
								case 94: break e;
							}
							return e << 16 >> 16 != 125 & (e + -123 & 65535) < 4 | 0;
						}
					}
				while (0);
				return 1;
			}
			function T(e, a, r, s) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				s = s | 0;
				var c = 0, t = 0;
				c = f[67] | 0;
				f[67] = c + 24;
				t = f[64] | 0;
				f[((t | 0) == 0 ? 236 : t + 20 | 0) >> 2] = c;
				f[64] = c;
				f[c >> 2] = e;
				f[c + 4 >> 2] = a;
				f[c + 8 >> 2] = r;
				f[c + 12 >> 2] = s;
				f[c + 16 >> 2] = f[65];
				f[c + 20 >> 2] = 0;
				i[807] = 1;
			}
			function j(e) {
				e = e | 0;
				var a = 0;
				a = s[e >> 1] | 0;
				e: do
					if ((a + -9 & 65535) >= 5) {
						switch (a << 16 >> 16) {
							case 160:
							case 32:
								a = 1;
								break e;
						}
						if (O(a) | 0) return a << 16 >> 16 != 46 | (N(e) | 0) | 0;
						else a = 0;
					} else a = 1;
				while (0);
				return a | 0;
			}
			function B(e) {
				e = e | 0;
				var a = 0, r = 0;
				r = n;
				n = n + 16 | 0;
				f[r >> 2] = 0;
				f[66] = e;
				a = f[3] | 0;
				s[a + (e << 1) >> 1] = 0;
				f[r >> 2] = a + (e << 1) + 2;
				f[67] = a + (e << 1) + 2;
				f[58] = 0;
				f[62] = 0;
				f[60] = 0;
				f[59] = 0;
				f[64] = 0;
				f[61] = 0;
				n = r;
				return a | 0;
			}
			function E(e, a, r) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				var i = 0, s = 0;
				s = e + (0 - r << 1) + 2 | 0;
				i = f[3] | 0;
				if (s >>> 0 >= i >>> 0 ? (S(s, a, r << 1) | 0) == 0 : 0) if ((s | 0) == (i | 0)) i = 1;
				else i = j(e + (0 - r << 1) | 0) | 0;
				else i = 0;
				return i | 0;
			}
			function P(e) {
				e = e | 0;
				var a = 0;
				switch (e << 16 >> 16) {
					case 91:
					case 123:
						h();
						f[73] = (f[73] | 0) + 2;
						break;
					default:
						a = f[73] | 0;
						H(e) | 0;
						e = f[73] | 0;
						if (e >>> 0 > a >>> 0) T(a, e, a, e);
				}
				return v(1) | 0;
			}
			function q(e) {
				e = e | 0;
				switch (s[e >> 1] | 0) {
					case 107:
						e = E(e + -2 | 0, 140, 4) | 0;
						break;
					case 101:
						if ((s[e + -2 >> 1] | 0) == 117) e = E(e + -4 | 0, 112, 6) | 0;
						else e = 0;
						break;
					default: e = 0;
				}
				return e | 0;
			}
			function z(e, a) {
				e = e | 0;
				a = a | 0;
				var r = 0;
				r = f[3] | 0;
				if (r >>> 0 <= e >>> 0 ? (s[e >> 1] | 0) == a << 16 >> 16 : 0) if ((r | 0) == (e | 0)) r = 1;
				else r = D(s[e + -2 >> 1] | 0) | 0;
				else r = 0;
				return r | 0;
			}
			function D(e) {
				e = e | 0;
				e: do
					if ((e + -9 & 65535) < 5) e = 1;
					else {
						switch (e << 16 >> 16) {
							case 32:
							case 160:
								e = 1;
								break e;
						}
						e = e << 16 >> 16 != 46 & (O(e) | 0);
					}
				while (0);
				return e | 0;
			}
			function F() {
				var e = 0, a = 0, r = 0;
				e = f[74] | 0;
				r = f[73] | 0;
				e: while (1) {
					a = r + 2 | 0;
					if (r >>> 0 >= e >>> 0) break;
					switch (s[a >> 1] | 0) {
						case 13:
						case 10: break e;
						default: r = a;
					}
				}
				f[73] = a;
			}
			function G(e) {
				e = e | 0;
				e: do
					if (((e & -33) + -65 & 65535) < 26 | (e + -48 & 65535) < 10) e = 1;
					else {
						switch (e << 16 >> 16) {
							case 36:
							case 95:
								e = 1;
								break e;
						}
						e = (e & 65535) > 127;
					}
				while (0);
				return e | 0;
			}
			function H(e) {
				e = e | 0;
				while (1) {
					if (L(e) | 0) break;
					if (O(e) | 0) break;
					e = (f[73] | 0) + 2 | 0;
					f[73] = e;
					e = s[e >> 1] | 0;
					if (!(e << 16 >> 16)) {
						e = 0;
						break;
					}
				}
				return e | 0;
			}
			function J() {
				var e = 0;
				e = f[(f[60] | 0) + 20 >> 2] | 0;
				switch (e | 0) {
					case 1:
						e = -1;
						break;
					case 2:
						e = -2;
						break;
					default: e = e - (f[3] | 0) >> 1;
				}
				return e | 0;
			}
			function K(e) {
				e = e | 0;
				if (!(E(e, 186, 5) | 0) ? !(E(e, 196, 3) | 0) : 0) e = E(e, 202, 2) | 0;
				else e = 1;
				return e | 0;
			}
			function L(e) {
				e = e | 0;
				switch (e << 16 >> 16) {
					case 160:
					case 9:
					case 10:
					case 11:
					case 12:
					case 13:
					case 32:
						e = 1;
						break;
					default: e = 0;
				}
				return e | 0;
			}
			function M(e) {
				e = e | 0;
				switch (e << 16 >> 16) {
					case 160:
					case 32:
					case 12:
					case 11:
					case 9:
						e = 1;
						break;
					default: e = 0;
				}
				return e | 0;
			}
			function N(e) {
				e = e | 0;
				if ((s[e >> 1] | 0) == 46 ? (s[e + -2 >> 1] | 0) == 46 : 0) e = (s[e + -4 >> 1] | 0) == 46;
				else e = 0;
				return e | 0;
			}
			function Q() {
				var e = 0;
				e = f[69] | 0;
				e = f[((e | 0) == 0 ? (f[60] | 0) + 32 | 0 : e + 16 | 0) >> 2] | 0;
				f[69] = e;
				return (e | 0) != 0 | 0;
			}
			function R(e) {
				e = e | 0;
				if ((f[3] | 0) == (e | 0)) e = 1;
				else e = j(e + -2 | 0) | 0;
				return e | 0;
			}
			function V() {
				var e = 0;
				e = f[(f[61] | 0) + 12 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function W() {
				var e = 0;
				e = f[(f[60] | 0) + 12 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function X() {
				var e = 0;
				e = f[(f[61] | 0) + 8 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function Y() {
				var e = 0;
				e = f[(f[60] | 0) + 16 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function Z() {
				var e = 0;
				e = f[(f[60] | 0) + 4 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function _() {
				var e = 0;
				e = f[60] | 0;
				e = f[((e | 0) == 0 ? 232 : e + 36 | 0) >> 2] | 0;
				f[60] = e;
				return (e | 0) != 0 | 0;
			}
			function ee() {
				var e = 0;
				e = f[61] | 0;
				e = f[((e | 0) == 0 ? 236 : e + 20 | 0) >> 2] | 0;
				f[61] = e;
				return (e | 0) != 0 | 0;
			}
			function ae() {
				i[806] = 1;
				f[68] = (f[73] | 0) - (f[3] | 0) >> 1;
				f[73] = (f[74] | 0) + 2;
			}
			function re(e) {
				e = e | 0;
				return e << 16 >> 16 == 39 | e << 16 >> 16 == 34 | 0;
			}
			function ie() {
				return (f[(f[61] | 0) + 16 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function se() {
				return (f[(f[69] | 0) + 12 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function fe() {
				return (f[(f[69] | 0) + 8 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function ce() {
				return (f[(f[69] | 0) + 4 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function te() {
				return (f[(f[60] | 0) + 8 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function ne() {
				return (f[(f[61] | 0) + 4 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function be(e) {
				e = e | 0;
				return e << 16 >> 16 == 13 | e << 16 >> 16 == 10 | 0;
			}
			function ke() {
				return (f[f[69] >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function le() {
				return (f[f[60] >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function ue() {
				return (f[f[61] >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function oe() {
				return c[(f[60] | 0) + 24 >> 0] | 0;
			}
			function he(e) {
				e = e | 0;
				f[3] = e;
			}
			function we() {
				return f[(f[60] | 0) + 28 >> 2] | 0;
			}
			function de() {
				return (i[807] | 0) != 0 | 0;
			}
			function ve() {
				return (i[808] | 0) != 0 | 0;
			}
			function Ae() {
				f[69] = 0;
			}
			function Ce() {
				return f[68] | 0;
			}
			function ge(e, a) {
				e = e | 0;
				a = a | 0;
				n = e + a + 15 & -16;
				return a | 0;
			}
			return {
				su: ge,
				ai: Y,
				ake: ce,
				aks: ke,
				ave: se,
				avs: fe,
				e: Ce,
				ee: ne,
				ele: V,
				els: X,
				es: ue,
				ess: ie,
				f: ve,
				id: J,
				ie: Z,
				ip: oe,
				is: le,
				it: we,
				ms: de,
				p: b,
				ra: Q,
				re: ee,
				ri: _,
				rsa: Ae,
				sa: B,
				se: W,
				ses: he,
				ss: te
			};
		}("undefined" != typeof globalThis ? globalThis : self, {}, a), r = e.su(i - (2 << 17), 1040);
	}
	const h = c.length + 1;
	e.ses(r), e.sa(h - 1), s(c, new Uint16Array(a, r, h)), e.p() || (n = e.e(), o());
	const w = [], d = [];
	for (; e.ri();) {
		const a = e.is(), r = e.ie(), i = e.ai(), s = e.id(), f = e.ss(), t = e.se(), n = e.it();
		let k;
		e.ip() && (k = b(-1 === s ? a : a + 1, c.charCodeAt(-1 === s ? a - 1 : a)));
		let l = null;
		for (l = [], e.rsa(); e.ra();) {
			const a = e.aks(), r = e.ake(), i = e.avs(), s = e.ave();
			l.push([v(a, r), v(i, s)]);
		}
		l = l.length > 0 ? l : null, w.push({
			t: n,
			n: k,
			s: a,
			e: r,
			ss: f,
			se: t,
			d: s,
			a: i,
			at: l
		});
	}
	for (; e.re();) {
		const a = e.es(), r = e.ee(), i = e.els(), s = e.ele(), f = i < 0 ? void 0 : v(i, s), c = v(a, r);
		d.push({
			s: a,
			e: r,
			ls: i,
			le: s,
			ss: e.ess(),
			n: c,
			ln: f
		});
	}
	return [
		w,
		d,
		!!e.f(),
		!!e.ms()
	];
	function v(e, a) {
		const r = c.charCodeAt(e);
		return 34 === r || 39 === r ? b(e + 1, r) : c.slice(e, a);
	}
}
function b(e, a) {
	n = e;
	let r = "", i = n;
	for (;;) {
		n >= c.length && o();
		const e = c.charCodeAt(n);
		if (e === a) break;
		92 === e ? (r += c.slice(i, n), r += k(), i = n) : (8232 === e || 8233 === e || u(e) && 96 !== a && o(), ++n);
	}
	return r += c.slice(i, n++), r;
}
function k() {
	let e = c.charCodeAt(++n);
	switch (++n, e) {
		case 110: return "\n";
		case 114: return "\r";
		case 120: return String.fromCharCode(l(2));
		case 117: return function() {
			const e = c.charCodeAt(n);
			let a;
			123 === e ? (++n, a = l(c.indexOf("}", n) - n), ++n, a > 1114111 && o()) : a = l(4);
			return a <= 65535 ? String.fromCharCode(a) : (a -= 65536, String.fromCharCode(55296 + (a >> 10), 56320 + (1023 & a)));
		}();
		case 116: return "	";
		case 98: return "\b";
		case 118: return "\v";
		case 102: return "\f";
		case 13: 10 === c.charCodeAt(n) && ++n;
		case 10: return "";
		case 56:
		case 57: o();
		default:
			if (e >= 48 && e <= 55) {
				let a = c.substr(n - 1, 3).match(/^[0-7]+/)[0], r = parseInt(a, 8);
				return r > 255 && (a = a.slice(0, -1), r = parseInt(a, 8)), n += a.length - 1, e = c.charCodeAt(n), "0" === a && 56 !== e && 57 !== e || o(), String.fromCharCode(r);
			}
			return u(e) ? "" : String.fromCharCode(e);
	}
}
function l(e) {
	const a = n;
	let r = 0, i = 0;
	for (let a = 0; a < e; ++a, ++n) {
		let e, s = c.charCodeAt(n);
		if (95 !== s) {
			if (s >= 97) e = s - 97 + 10;
			else if (s >= 65) e = s - 65 + 10;
			else {
				if (!(s >= 48 && s <= 57)) break;
				e = s - 48;
			}
			if (e >= 16) break;
			i = s, r = 16 * r + e;
		} else 95 !== i && 0 !== a || o(), i = s;
	}
	return 95 !== i && n - a === e || o(), r;
}
function u(e) {
	return 13 === e || 10 === e;
}
function o() {
	throw Object.assign(Error(`Parse error ${t}:${c.slice(0, n).split("\n").length}:${n - c.lastIndexOf("\n", n - 1)}`), { idx: n });
}
//#endregion
//#region node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js
var require_picocolors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let p = process || {};
	let argv = p.argv || [];
	let env = p.env || {};
	let isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
	let formatter = (open, close, replace = open) => (input) => {
		let string = "" + input, index = string.indexOf(close, open.length);
		return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
	};
	let replaceClose = (string, close, replace, index) => {
		let result = "", cursor = 0;
		do {
			result += string.substring(cursor, index) + replace;
			cursor = index + close.length;
			index = string.indexOf(close, cursor);
		} while (~index);
		return result + string.substring(cursor);
	};
	let createColors = (enabled = isColorSupported) => {
		let f = enabled ? formatter : () => String;
		return {
			isColorSupported: enabled,
			reset: f("\x1B[0m", "\x1B[0m"),
			bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
			dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
			italic: f("\x1B[3m", "\x1B[23m"),
			underline: f("\x1B[4m", "\x1B[24m"),
			inverse: f("\x1B[7m", "\x1B[27m"),
			hidden: f("\x1B[8m", "\x1B[28m"),
			strikethrough: f("\x1B[9m", "\x1B[29m"),
			black: f("\x1B[30m", "\x1B[39m"),
			red: f("\x1B[31m", "\x1B[39m"),
			green: f("\x1B[32m", "\x1B[39m"),
			yellow: f("\x1B[33m", "\x1B[39m"),
			blue: f("\x1B[34m", "\x1B[39m"),
			magenta: f("\x1B[35m", "\x1B[39m"),
			cyan: f("\x1B[36m", "\x1B[39m"),
			white: f("\x1B[37m", "\x1B[39m"),
			gray: f("\x1B[90m", "\x1B[39m"),
			bgBlack: f("\x1B[40m", "\x1B[49m"),
			bgRed: f("\x1B[41m", "\x1B[49m"),
			bgGreen: f("\x1B[42m", "\x1B[49m"),
			bgYellow: f("\x1B[43m", "\x1B[49m"),
			bgBlue: f("\x1B[44m", "\x1B[49m"),
			bgMagenta: f("\x1B[45m", "\x1B[49m"),
			bgCyan: f("\x1B[46m", "\x1B[49m"),
			bgWhite: f("\x1B[47m", "\x1B[49m"),
			blackBright: f("\x1B[90m", "\x1B[39m"),
			redBright: f("\x1B[91m", "\x1B[39m"),
			greenBright: f("\x1B[92m", "\x1B[39m"),
			yellowBright: f("\x1B[93m", "\x1B[39m"),
			blueBright: f("\x1B[94m", "\x1B[39m"),
			magentaBright: f("\x1B[95m", "\x1B[39m"),
			cyanBright: f("\x1B[96m", "\x1B[39m"),
			whiteBright: f("\x1B[97m", "\x1B[39m"),
			bgBlackBright: f("\x1B[100m", "\x1B[49m"),
			bgRedBright: f("\x1B[101m", "\x1B[49m"),
			bgGreenBright: f("\x1B[102m", "\x1B[49m"),
			bgYellowBright: f("\x1B[103m", "\x1B[49m"),
			bgBlueBright: f("\x1B[104m", "\x1B[49m"),
			bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
			bgCyanBright: f("\x1B[106m", "\x1B[49m"),
			bgWhiteBright: f("\x1B[107m", "\x1B[49m")
		};
	};
	module.exports = createColors();
	module.exports.createColors = createColors;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/tokenize.js
var require_tokenize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SINGLE_QUOTE = "'".charCodeAt(0);
	const DOUBLE_QUOTE = "\"".charCodeAt(0);
	const BACKSLASH = "\\".charCodeAt(0);
	const SLASH = "/".charCodeAt(0);
	const NEWLINE = "\n".charCodeAt(0);
	const SPACE = " ".charCodeAt(0);
	const FEED = "\f".charCodeAt(0);
	const TAB = "	".charCodeAt(0);
	const CR = "\r".charCodeAt(0);
	const OPEN_SQUARE = "[".charCodeAt(0);
	const CLOSE_SQUARE = "]".charCodeAt(0);
	const OPEN_PARENTHESES = "(".charCodeAt(0);
	const CLOSE_PARENTHESES = ")".charCodeAt(0);
	const OPEN_CURLY = "{".charCodeAt(0);
	const CLOSE_CURLY = "}".charCodeAt(0);
	const SEMICOLON = ";".charCodeAt(0);
	const ASTERISK = "*".charCodeAt(0);
	const COLON = ":".charCodeAt(0);
	const AT = "@".charCodeAt(0);
	const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
	const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
	const RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
	const RE_HEX_ESCAPE = /[\da-f]/i;
	module.exports = function tokenizer(input, options = {}) {
		let css = input.css.valueOf();
		let ignore = options.ignoreErrors;
		let code, content, escape, next, quote;
		let currentToken, escaped, escapePos, n, prev;
		let length = css.length;
		let pos = 0;
		let buffer = [];
		let returned = [];
		let lastBadParen = -1;
		function position() {
			return pos;
		}
		function unclosed(what) {
			throw input.error("Unclosed " + what, pos);
		}
		function endOfFile() {
			return returned.length === 0 && pos >= length;
		}
		function nextToken(opts) {
			if (returned.length) return returned.pop();
			if (pos >= length) return;
			let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
			code = css.charCodeAt(pos);
			switch (code) {
				case NEWLINE:
				case SPACE:
				case TAB:
				case CR:
				case FEED:
					next = pos;
					do {
						next += 1;
						code = css.charCodeAt(next);
					} while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
					currentToken = ["space", css.slice(pos, next)];
					pos = next - 1;
					break;
				case OPEN_SQUARE:
				case CLOSE_SQUARE:
				case OPEN_CURLY:
				case CLOSE_CURLY:
				case COLON:
				case SEMICOLON:
				case CLOSE_PARENTHESES: {
					let controlChar = String.fromCharCode(code);
					currentToken = [
						controlChar,
						controlChar,
						pos
					];
					break;
				}
				case OPEN_PARENTHESES:
					prev = buffer.length ? buffer.pop()[1] : "";
					n = css.charCodeAt(pos + 1);
					if (prev === "url" && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE && n !== SPACE && n !== NEWLINE && n !== TAB && n !== FEED && n !== CR) {
						next = pos;
						do {
							escaped = false;
							next = css.indexOf(")", next + 1);
							if (next === -1) {
								if (ignore || ignoreUnclosed) {
									next = pos;
									break;
								} else unclosed("bracket");
							}
							escapePos = next;
							while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
								escapePos -= 1;
								escaped = !escaped;
							}
						} while (escaped);
						currentToken = [
							"brackets",
							css.slice(pos, next + 1),
							pos,
							next
						];
						pos = next;
					} else if (pos <= lastBadParen) currentToken = [
						"(",
						"(",
						pos
					];
					else {
						next = css.indexOf(")", pos + 1);
						content = css.slice(pos, next + 1);
						if (next === -1 || RE_BAD_BRACKET.test(content)) {
							lastBadParen = next === -1 ? length : next;
							currentToken = [
								"(",
								"(",
								pos
							];
						} else {
							currentToken = [
								"brackets",
								content,
								pos,
								next
							];
							pos = next;
						}
					}
					break;
				case SINGLE_QUOTE:
				case DOUBLE_QUOTE:
					quote = code === SINGLE_QUOTE ? "'" : "\"";
					next = pos;
					do {
						escaped = false;
						next = css.indexOf(quote, next + 1);
						if (next === -1) {
							if (ignore || ignoreUnclosed) {
								next = pos + 1;
								break;
							} else unclosed("string");
						}
						escapePos = next;
						while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
							escapePos -= 1;
							escaped = !escaped;
						}
					} while (escaped);
					currentToken = [
						"string",
						css.slice(pos, next + 1),
						pos,
						next
					];
					pos = next;
					break;
				case AT:
					RE_AT_END.lastIndex = pos + 1;
					RE_AT_END.test(css);
					if (RE_AT_END.lastIndex === 0) next = css.length - 1;
					else next = RE_AT_END.lastIndex - 2;
					currentToken = [
						"at-word",
						css.slice(pos, next + 1),
						pos,
						next
					];
					pos = next;
					break;
				case BACKSLASH:
					next = pos;
					escape = true;
					while (css.charCodeAt(next + 1) === BACKSLASH) {
						next += 1;
						escape = !escape;
					}
					code = css.charCodeAt(next + 1);
					if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
						next += 1;
						if (RE_HEX_ESCAPE.test(css.charAt(next))) {
							while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) next += 1;
							if (css.charCodeAt(next + 1) === SPACE) next += 1;
						}
					}
					currentToken = [
						"word",
						css.slice(pos, next + 1),
						pos,
						next
					];
					pos = next;
					break;
				default: if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
					next = css.indexOf("*/", pos + 2) + 1;
					if (next === 0) {
						if (ignore || ignoreUnclosed) next = css.length;
						else unclosed("comment");
					}
					currentToken = [
						"comment",
						css.slice(pos, next + 1),
						pos,
						next
					];
					pos = next;
				} else {
					RE_WORD_END.lastIndex = pos + 1;
					RE_WORD_END.test(css);
					if (RE_WORD_END.lastIndex === 0) next = css.length - 1;
					else next = RE_WORD_END.lastIndex - 2;
					currentToken = [
						"word",
						css.slice(pos, next + 1),
						pos,
						next
					];
					buffer.push(currentToken);
					pos = next;
				}
			}
			pos++;
			return currentToken;
		}
		function back(token) {
			returned.push(token);
		}
		return {
			back,
			endOfFile,
			nextToken,
			position
		};
	};
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/terminal-highlight.js
var require_terminal_highlight = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let pico = require_picocolors();
	let tokenizer = require_tokenize();
	let Input;
	function registerInput(dependant) {
		Input = dependant;
	}
	const HIGHLIGHT_THEME = {
		";": pico.yellow,
		":": pico.yellow,
		"(": pico.cyan,
		")": pico.cyan,
		"[": pico.yellow,
		"]": pico.yellow,
		"{": pico.yellow,
		"}": pico.yellow,
		"at-word": pico.cyan,
		"brackets": pico.cyan,
		"call": pico.cyan,
		"class": pico.yellow,
		"comment": pico.gray,
		"hash": pico.magenta,
		"string": pico.green
	};
	function getTokenType([type, value], processor) {
		if (type === "word") {
			if (value[0] === ".") return "class";
			if (value[0] === "#") return "hash";
		}
		if (!processor.endOfFile()) {
			let next = processor.nextToken();
			processor.back(next);
			if (next[0] === "brackets" || next[0] === "(") return "call";
		}
		return type;
	}
	function terminalHighlight(css) {
		let processor = tokenizer(new Input(css), { ignoreErrors: true });
		let result = "";
		while (!processor.endOfFile()) {
			let token = processor.nextToken();
			let color = HIGHLIGHT_THEME[getTokenType(token, processor)];
			if (color) result += token[1].split(/\r?\n/).map((i) => color(i)).join("\n");
			else result += token[1];
		}
		return result;
	}
	terminalHighlight.registerInput = registerInput;
	module.exports = terminalHighlight;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/css-syntax-error.js
var require_css_syntax_error = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let pico = require_picocolors();
	let terminalHighlight = require_terminal_highlight();
	var CssSyntaxError = class CssSyntaxError extends Error {
		constructor(message, line, column, source, file, plugin) {
			super(message);
			this.name = "CssSyntaxError";
			this.reason = message;
			if (file) this.file = file;
			if (source) this.source = source;
			if (plugin) this.plugin = plugin;
			if (typeof line !== "undefined" && typeof column !== "undefined") {
				if (typeof line === "number") {
					this.line = line;
					this.column = column;
				} else {
					this.line = line.line;
					this.column = line.column;
					this.endLine = column.line;
					this.endColumn = column.column;
				}
			}
			this.setMessage();
			if (Error.captureStackTrace) Error.captureStackTrace(this, CssSyntaxError);
		}
		setMessage() {
			this.message = this.plugin ? this.plugin + ": " : "";
			this.message += this.file ? this.file : "<css input>";
			if (typeof this.line !== "undefined") this.message += ":" + this.line + ":" + this.column;
			this.message += ": " + this.reason;
		}
		showSourceCode(color) {
			if (!this.source) return "";
			let css = this.source;
			if (color == null) color = pico.isColorSupported;
			let aside = (text) => text;
			let mark = (text) => text;
			let highlight = (text) => text;
			if (color) {
				let { bold, gray, red } = pico.createColors(true);
				mark = (text) => bold(red(text));
				aside = (text) => gray(text);
				if (terminalHighlight) highlight = (text) => terminalHighlight(text);
			}
			let lines = css.split(/\r?\n/);
			let start = Math.max(this.line - 3, 0);
			let end = Math.min(this.line + 2, lines.length);
			let maxWidth = String(end).length;
			return lines.slice(start, end).map((line, index) => {
				let number = start + 1 + index;
				let gutter = " " + (" " + number).slice(-maxWidth) + " | ";
				if (number === this.line) {
					if (line.length > 160) {
						let padding = 20;
						let subLineStart = Math.max(0, this.column - padding);
						let subLineEnd = Math.max(this.column + padding, this.endColumn + padding);
						let subLine = line.slice(subLineStart, subLineEnd);
						let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, Math.min(this.column - 1, 19)).replace(/[^\t]/g, " ");
						return mark(">") + aside(gutter) + highlight(subLine) + "\n " + spacing + mark("^");
					}
					let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, this.column - 1).replace(/[^\t]/g, " ");
					return mark(">") + aside(gutter) + highlight(line) + "\n " + spacing + mark("^");
				}
				return " " + aside(gutter) + highlight(line);
			}).join("\n");
		}
		toString() {
			let code = this.showSourceCode();
			if (code) code = "\n\n" + code + "\n";
			return this.name + ": " + this.message + code;
		}
	};
	module.exports = CssSyntaxError;
	CssSyntaxError.default = CssSyntaxError;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/stringifier.js
var require_stringifier = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const STYLE_TAG = /(<)(\/?style\b)/gi;
	const COMMENT_OPEN = /(<)(!--)/g;
	const AT_NAME_END = /[\t\n\f\r "#'()/;[\\\]{}]/;
	function escapeHTMLInCSS(str) {
		if (typeof str !== "string") return str;
		if (!str.includes("<")) return str;
		return str.replace(STYLE_TAG, "\\3c $2").replace(COMMENT_OPEN, "\\3c $2");
	}
	const DEFAULT_RAW = {
		after: "\n",
		beforeClose: "\n",
		beforeComment: "\n",
		beforeDecl: "\n",
		beforeOpen: " ",
		beforeRule: "\n",
		colon: ": ",
		commentLeft: " ",
		commentRight: " ",
		emptyBody: "",
		indent: "    ",
		semicolon: false
	};
	function capitalize(str) {
		return str[0].toUpperCase() + str.slice(1);
	}
	function atruleStart(str, node) {
		let name = "@" + node.name;
		let params = node.params ? str.rawValue(node, "params") : "";
		let afterName = node.raws.afterName;
		if (typeof afterName === "undefined") afterName = params ? " " : "";
		else if (afterName === "" && params && !AT_NAME_END.test(params[0])) afterName = " ";
		return name + afterName + params;
	}
	function isCustomProperty(node) {
		if (!node.prop.startsWith("--")) return false;
		let before = node.raws.before;
		return typeof before === "undefined" || !/\S$/.test(before);
	}
	function pushBody(str, stack, node) {
		let nodes = node.nodes;
		let last = nodes.length - 1;
		while (last > 0) {
			if (nodes[last].type !== "comment") break;
			last -= 1;
		}
		let semicolon = str.raw(node, "semicolon");
		let isDocument = node.type === "document";
		for (let i = nodes.length - 1; i >= 0; i--) {
			let child = nodes[i];
			let childSemicolon = last !== i || semicolon;
			if (!childSemicolon && i < nodes.length - 1 && (child.type === "atrule" && !child.nodes || child.type === "decl" && isCustomProperty(child))) childSemicolon = true;
			stack.push({
				document: isDocument,
				node: child,
				semicolon: childSemicolon
			});
		}
	}
	function pushBlock(str, stack, node, start) {
		let between = str.raw(node, "between", "beforeOpen");
		str.builder(escapeHTMLInCSS(start + between) + "{", node, "start");
		let hasNodes = node.nodes && node.nodes.length;
		let close = () => {
			let after = hasNodes ? str.raw(node, "after") : str.raw(node, "after", "emptyBody");
			if (after) str.builder(escapeHTMLInCSS(after));
			str.builder("}", node, "end");
			if (node.type === "rule" && node.raws.ownSemicolon) str.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, "end");
		};
		if (hasNodes) {
			stack.push(close);
			pushBody(str, stack, node);
		} else close();
	}
	var Stringifier = class Stringifier {
		constructor(builder) {
			this.builder = builder;
		}
		atrule(node, semicolon) {
			let start = atruleStart(this, node);
			if (node.nodes) this.block(node, start);
			else {
				let end = (node.raws.between || "") + (semicolon ? ";" : "");
				this.builder(escapeHTMLInCSS(start + end), node);
			}
		}
		beforeAfter(node, detect) {
			let value;
			if (node.type === "decl") value = this.raw(node, null, "beforeDecl");
			else if (node.type === "comment") value = this.raw(node, null, "beforeComment");
			else if (detect === "before") value = this.raw(node, null, "beforeRule");
			else value = this.raw(node, null, "beforeClose");
			let buf = node.parent;
			let depth = 0;
			while (buf && buf.type !== "root") {
				depth += 1;
				buf = buf.parent;
			}
			if (value.includes("\n")) {
				let indent = this.raw(node, null, "indent");
				if (indent.length) for (let step = 0; step < depth; step++) value += indent;
			}
			return value;
		}
		block(node, start) {
			let between = this.raw(node, "between", "beforeOpen");
			this.builder(escapeHTMLInCSS(start + between) + "{", node, "start");
			let after;
			if (node.nodes && node.nodes.length) {
				this.body(node);
				after = this.raw(node, "after");
			} else after = this.raw(node, "after", "emptyBody");
			if (after) this.builder(escapeHTMLInCSS(after));
			this.builder("}", node, "end");
		}
		body(node) {
			let proto = Stringifier.prototype;
			let expandable = [
				"atrule",
				"block",
				"body",
				"rule",
				"stringify"
			].every((method) => this[method] === proto[method]);
			let stack = [];
			pushBody(this, stack, node);
			while (stack.length > 0) {
				let entry = stack.pop();
				if (typeof entry === "function") {
					entry();
					continue;
				}
				let child = entry.node;
				let before = this.raw(child, "before");
				if (before) this.builder(entry.document ? before : escapeHTMLInCSS(before));
				if (expandable && child.type === "rule") pushBlock(this, stack, child, this.rawValue(child, "selector"));
				else if (expandable && child.type === "atrule" && child.nodes) pushBlock(this, stack, child, atruleStart(this, child));
				else this.stringify(child, entry.semicolon);
			}
		}
		comment(node) {
			let left = this.raw(node, "left", "commentLeft");
			let right = this.raw(node, "right", "commentRight");
			this.builder(escapeHTMLInCSS("/*" + left + node.text + right + "*/"), node);
		}
		decl(node, semicolon) {
			let raws = node.raws;
			let between = this.raw(node, "between", "colon");
			let string = node.prop + between + this.rawValue(node, "value");
			if (node.important) string += raws.important || " !important";
			if (semicolon) string += ";";
			this.builder(escapeHTMLInCSS(string), node);
		}
		document(node) {
			this.body(node);
		}
		raw(node, own, detect) {
			let value;
			if (!detect) detect = own;
			if (own) {
				value = node.raws[own];
				if (typeof value !== "undefined") return value;
			}
			let parent = node.parent;
			if (detect === "before") {
				if (!parent || parent.type === "root" && parent.first === node) return "";
				if (parent && parent.type === "document") return "";
			}
			if (!parent) return DEFAULT_RAW[detect];
			let root = node.root();
			let cache = root.rawCache || (root.rawCache = {});
			if (typeof cache[detect] !== "undefined") return cache[detect];
			if (detect === "before" || detect === "after") return this.beforeAfter(node, detect);
			else {
				let method = "raw" + capitalize(detect);
				if (this[method]) value = this[method](root, node);
				else root.walk((i) => {
					value = i.raws[own];
					if (typeof value !== "undefined") return false;
				});
			}
			if (typeof value === "undefined") value = DEFAULT_RAW[detect];
			cache[detect] = value;
			return value;
		}
		rawBeforeClose(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && i.nodes.length > 0) {
					if (typeof i.raws.after !== "undefined") {
						value = i.raws.after;
						if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
						return false;
					}
				}
			});
			if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawBeforeComment(root, node) {
			let value;
			root.walkComments((i) => {
				if (typeof i.raws.before !== "undefined") {
					value = i.raws.before;
					if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
					return false;
				}
			});
			if (typeof value === "undefined") value = this.raw(node, null, "beforeDecl");
			else if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawBeforeDecl(root, node) {
			let value;
			root.walkDecls((i) => {
				if (typeof i.raws.before !== "undefined") {
					value = i.raws.before;
					if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
					return false;
				}
			});
			if (typeof value === "undefined") value = this.raw(node, null, "beforeRule");
			else if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawBeforeOpen(root) {
			let value;
			root.walk((i) => {
				if (i.type !== "decl") {
					value = i.raws.between;
					if (typeof value !== "undefined") return false;
				}
			});
			return value;
		}
		rawBeforeRule(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && (i.parent !== root || root.first !== i)) {
					if (typeof i.raws.before !== "undefined") {
						value = i.raws.before;
						if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
						return false;
					}
				}
			});
			if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawColon(root) {
			let value;
			root.walkDecls((i) => {
				if (typeof i.raws.between !== "undefined") {
					value = i.raws.between.replace(/[^\s:]/g, "");
					return false;
				}
			});
			return value;
		}
		rawEmptyBody(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && i.nodes.length === 0) {
					value = i.raws.after;
					if (typeof value !== "undefined") return false;
				}
			});
			return value;
		}
		rawIndent(root) {
			if (root.raws.indent) return root.raws.indent;
			let value;
			root.walk((i) => {
				let p = i.parent;
				if (p && p !== root && p.parent && p.parent === root) {
					if (typeof i.raws.before !== "undefined") {
						let parts = i.raws.before.split("\n");
						value = parts[parts.length - 1];
						value = value.replace(/\S/g, "");
						return false;
					}
				}
			});
			return value;
		}
		rawSemicolon(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && i.nodes.length && i.last.type === "decl") {
					value = i.raws.semicolon;
					if (typeof value !== "undefined") return false;
				}
			});
			return value;
		}
		rawValue(node, prop) {
			let value = node[prop];
			let raw = node.raws[prop];
			if (raw && raw.value === value) return raw.raw;
			return value;
		}
		root(node) {
			if (node.source && node.source.input.hasBOM) this.builder("﻿", node, "start");
			this.body(node);
			if (node.raws.after) {
				let after = node.raws.after;
				let isDocument = node.parent && node.parent.type === "document";
				this.builder(isDocument ? after : escapeHTMLInCSS(after));
			}
		}
		rule(node) {
			this.block(node, this.rawValue(node, "selector"));
			if (node.raws.ownSemicolon) this.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, "end");
		}
		stringify(node, semicolon) {
			/* c8 ignore start */
			if (!this[node.type]) throw new Error("Unknown AST node type " + node.type + ". Maybe you need to change PostCSS stringifier.");
			/* c8 ignore stop */
			this[node.type](node, semicolon);
		}
	};
	module.exports = Stringifier;
	Stringifier.default = Stringifier;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/stringify.js
var require_stringify$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Stringifier = require_stringifier();
	function stringify(node, builder) {
		new Stringifier(builder).stringify(node);
	}
	module.exports = stringify;
	stringify.default = stringify;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/symbols.js
var require_symbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports.isClean = Symbol("isClean");
	module.exports.my = Symbol("my");
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let CssSyntaxError = require_css_syntax_error();
	let Stringifier = require_stringifier();
	let stringify = require_stringify$1();
	let { isClean, my } = require_symbols();
	function cloneNode(obj, parent) {
		let cloned = new obj.constructor();
		let stack = [[
			obj,
			cloned,
			parent
		]];
		while (stack.length > 0) {
			let [source, target, targetParent] = stack.pop();
			for (let i in source) {
				if (!Object.prototype.hasOwnProperty.call(source, i))
 /* c8 ignore next 2 */
				continue;
				if (i === "proxyCache") continue;
				let value = source[i];
				let type = typeof value;
				if (i === "parent" && type === "object") {
					if (targetParent) target[i] = targetParent;
				} else if (i === "source") target[i] = value;
				else if (Array.isArray(value)) {
					let children = [];
					target[i] = children;
					for (let j of value) {
						let childClone = new j.constructor();
						children.push(childClone);
						stack.push([
							j,
							childClone,
							target
						]);
					}
				} else {
					if (type === "object" && value !== null) {
						let valueClone = new value.constructor();
						stack.push([
							value,
							valueClone,
							void 0
						]);
						value = valueClone;
					}
					target[i] = value;
				}
			}
		}
		return cloned;
	}
	function sourceOffset(inputCSS, position) {
		if (position && typeof position.offset !== "undefined") return position.offset;
		let column = 1;
		let line = 1;
		let offset = 0;
		for (let i = 0; i < inputCSS.length; i++) {
			if (line === position.line && column === position.column) {
				offset = i;
				break;
			}
			if (inputCSS[i] === "\n") {
				column = 1;
				line += 1;
			} else column += 1;
		}
		return offset;
	}
	var Node = class Node {
		get proxyOf() {
			return this;
		}
		constructor(defaults = {}) {
			this.raws = {};
			this[isClean] = false;
			this[my] = true;
			for (let name of Object.keys(defaults)) {
				if (name === "__proto__") continue;
				if (name === "nodes") {
					this.nodes = [];
					for (let node of defaults[name]) if (typeof node.clone === "function" && node.parent) this.append(node.clone());
					else this.append(node);
				} else this[name] = defaults[name];
			}
		}
		addToError(error) {
			error.postcssNode = this;
			if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
				let s = this.source;
				error.stack = error.stack.replace(/\n\s{4}at /, `$&${s.input.from}:${s.start.line}:${s.start.column}$&`);
			}
			return error;
		}
		after(add) {
			this.parent.insertAfter(this, add);
			return this;
		}
		assign(overrides = {}) {
			for (let name in overrides) this[name] = overrides[name];
			return this;
		}
		before(add) {
			this.parent.insertBefore(this, add);
			return this;
		}
		cleanRaws(keepBetween) {
			delete this.raws.before;
			delete this.raws.after;
			if (!keepBetween) delete this.raws.between;
		}
		clone(overrides = {}) {
			let cloned = cloneNode(this);
			for (let name in overrides) cloned[name] = overrides[name];
			return cloned;
		}
		cloneAfter(overrides = {}) {
			let cloned = this.clone(overrides);
			this.parent.insertAfter(this, cloned);
			return cloned;
		}
		cloneBefore(overrides = {}) {
			let cloned = this.clone(overrides);
			this.parent.insertBefore(this, cloned);
			return cloned;
		}
		error(message, opts = {}) {
			if (this.source) {
				let { end, start } = this.rangeBy(opts);
				return this.source.input.error(message, {
					column: start.column,
					line: start.line
				}, {
					column: end.column,
					line: end.line
				}, opts);
			}
			return new CssSyntaxError(message);
		}
		getProxyProcessor() {
			return {
				get(node, prop) {
					if (prop === "proxyOf") return node;
					else if (prop === "root") return () => node.root().toProxy();
					else return node[prop];
				},
				set(node, prop, value) {
					if (node[prop] === value) return true;
					node[prop] = value;
					if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || 
					/* c8 ignore next */
					prop === "text") node.markDirty();
					return true;
				}
			};
		}
		/* c8 ignore next 3 */
		markClean() {
			this[isClean] = true;
		}
		markDirty() {
			if (this[isClean]) {
				this[isClean] = false;
				let next = this;
				while (next = next.parent) next[isClean] = false;
			}
		}
		next() {
			if (!this.parent) return void 0;
			let index = this.parent.index(this);
			return this.parent.nodes[index + 1];
		}
		positionBy(opts = {}) {
			let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
			let pos = {
				column: this.source.start.column,
				line: this.source.start.line,
				offset: sourceOffset(inputString, this.source.start)
			};
			if (opts.index) pos = this.positionInside(opts.index);
			else if (opts.word) {
				let index = inputString.slice(sourceOffset(inputString, this.source.start), sourceOffset(inputString, this.source.end)).indexOf(opts.word);
				if (index !== -1) pos = this.positionInside(index);
			}
			return pos;
		}
		positionInside(index) {
			let column = this.source.start.column;
			let line = this.source.start.line;
			let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
			let offset = sourceOffset(inputString, this.source.start);
			let end = offset + index;
			for (let i = offset; i < end; i++) if (inputString[i] === "\n") {
				column = 1;
				line += 1;
			} else column += 1;
			return {
				column,
				line,
				offset: end
			};
		}
		prev() {
			if (!this.parent) return void 0;
			let index = this.parent.index(this);
			return this.parent.nodes[index - 1];
		}
		rangeBy(opts = {}) {
			let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
			let start = {
				column: this.source.start.column,
				line: this.source.start.line,
				offset: sourceOffset(inputString, this.source.start)
			};
			let end = this.source.end ? {
				column: this.source.end.column + 1,
				line: this.source.end.line,
				offset: typeof this.source.end.offset === "number" ? this.source.end.offset : sourceOffset(inputString, this.source.end) + 1
			} : {
				column: start.column + 1,
				line: start.line,
				offset: start.offset + 1
			};
			if (opts.word) {
				let index = inputString.slice(sourceOffset(inputString, this.source.start), sourceOffset(inputString, this.source.end)).indexOf(opts.word);
				if (index !== -1) {
					start = this.positionInside(index);
					end = this.positionInside(index + opts.word.length);
				}
			} else {
				if (opts.start) start = {
					column: opts.start.column,
					line: opts.start.line,
					offset: sourceOffset(inputString, opts.start)
				};
				else if (typeof opts.index === "number") start = this.positionInside(opts.index);
				if (opts.end) end = {
					column: opts.end.column,
					line: opts.end.line,
					offset: sourceOffset(inputString, opts.end)
				};
				else if (typeof opts.endIndex === "number") end = this.positionInside(opts.endIndex);
				else if (typeof opts.index === "number") end = this.positionInside(opts.index + 1);
			}
			if (end.line < start.line || end.line === start.line && end.column <= start.column) end = {
				column: start.column + 1,
				line: start.line,
				offset: start.offset + 1
			};
			return {
				end,
				start
			};
		}
		raw(prop, defaultType) {
			return new Stringifier().raw(this, prop, defaultType);
		}
		remove() {
			if (this.parent) this.parent.removeChild(this);
			this.parent = void 0;
			return this;
		}
		replaceWith(...nodes) {
			if (this.parent) {
				let bookmark = this;
				let foundSelf = false;
				for (let node of nodes) if (node === this) foundSelf = true;
				else if (foundSelf) {
					this.parent.insertAfter(bookmark, node);
					bookmark = node;
				} else this.parent.insertBefore(bookmark, node);
				if (!foundSelf) this.remove();
			}
			return this;
		}
		root() {
			let result = this;
			while (result.parent && result.parent.type !== "document") result = result.parent;
			return result;
		}
		toJSON(_, inputs) {
			let emitInputs = inputs == null;
			inputs = inputs || /* @__PURE__ */ new Map();
			let holderOfRoot = [];
			let queue = [[
				this,
				holderOfRoot,
				0
			]];
			for (let step = 0; step < queue.length; step++) {
				let [node, holder, key] = queue[step];
				let fixed = {};
				holder[key] = fixed;
				for (let name in node) {
					if (!Object.prototype.hasOwnProperty.call(node, name))
 /* c8 ignore next 2 */
					continue;
					if (name === "parent" || name === "proxyCache") continue;
					let value = node[name];
					if (Array.isArray(value)) {
						let fixedArray = [];
						fixed[name] = fixedArray;
						for (let i = 0; i < value.length; i++) {
							let item = value[i];
							if (typeof item === "object" && item.toJSON) {
								if (item.toJSON === Node.prototype.toJSON) queue.push([
									item,
									fixedArray,
									i
								]);
								else fixedArray[i] = item.toJSON(null, inputs);
							} else fixedArray[i] = item;
						}
					} else if (typeof value === "object" && value.toJSON) {
						if (value.toJSON === Node.prototype.toJSON) queue.push([
							value,
							fixed,
							name
						]);
						else fixed[name] = value.toJSON(null, inputs);
					} else if (name === "source") {
						if (value == null) continue;
						let inputId = inputs.get(value.input);
						if (inputId == null) {
							inputId = inputs.size;
							inputs.set(value.input, inputId);
						}
						fixed[name] = {
							end: value.end,
							inputId,
							start: value.start
						};
					} else fixed[name] = value;
				}
			}
			let fixed = holderOfRoot[0];
			if (emitInputs) fixed.inputs = [...inputs.keys()].map((input) => input.toJSON());
			return fixed;
		}
		toProxy() {
			if (!this.proxyCache) this.proxyCache = new Proxy(this, this.getProxyProcessor());
			return this.proxyCache;
		}
		toString(stringifier = stringify) {
			if (stringifier.stringify) stringifier = stringifier.stringify;
			let result = "";
			stringifier(this, (i) => {
				result += i;
			});
			return result;
		}
		warn(result, text, opts = {}) {
			let data = { node: this };
			for (let i in opts) data[i] = opts[i];
			return result.warn(text, data);
		}
	};
	module.exports = Node;
	Node.default = Node;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/comment.js
var require_comment = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Node = require_node();
	var Comment = class extends Node {
		constructor(defaults) {
			super(defaults);
			this.type = "comment";
		}
	};
	module.exports = Comment;
	Comment.default = Comment;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/declaration.js
var require_declaration = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Node = require_node();
	var Declaration = class extends Node {
		get variable() {
			return this.prop.startsWith("--") || this.prop[0] === "$";
		}
		constructor(defaults) {
			if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") defaults = {
				...defaults,
				value: String(defaults.value)
			};
			super(defaults);
			this.type = "decl";
		}
	};
	module.exports = Declaration;
	Declaration.default = Declaration;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/container.js
var require_container = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Comment = require_comment();
	let Declaration = require_declaration();
	let Node = require_node();
	let { isClean, my } = require_symbols();
	let AtRule;
	let parse;
	let Root;
	let Rule;
	function cleanSource(nodes) {
		let stack = nodes.slice();
		while (stack.length > 0) {
			let node = stack.pop();
			delete node.source;
			if (node.nodes) {
				node.nodes = node.nodes.slice();
				for (let i of node.nodes) stack.push(i);
			}
		}
		return nodes.slice();
	}
	function markTreeDirty(node) {
		let stack = [node];
		while (stack.length > 0) {
			let next = stack.pop();
			next[isClean] = false;
			if (next.proxyOf.nodes) for (let i of next.proxyOf.nodes) stack.push(i);
		}
	}
	var Container = class Container extends Node {
		get first() {
			if (!this.proxyOf.nodes) return void 0;
			return this.proxyOf.nodes[0];
		}
		get last() {
			if (!this.proxyOf.nodes) return void 0;
			return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
		}
		append(...children) {
			for (let child of children) {
				let nodes = this.normalize(child, this.last);
				for (let node of nodes) this.proxyOf.nodes.push(node);
			}
			this.markDirty();
			return this;
		}
		cleanRaws(keepBetween) {
			let stack = [this];
			while (stack.length > 0) {
				let node = stack.pop();
				if (node !== this && node.cleanRaws !== Container.prototype.cleanRaws) {
					node.cleanRaws(keepBetween);
					continue;
				}
				Node.prototype.cleanRaws.call(node, keepBetween);
				if (node.nodes) for (let child of node.nodes) stack.push(child);
			}
		}
		each(callback) {
			if (!this.proxyOf.nodes) return void 0;
			let iterator = this.getIterator();
			let index, result;
			while (this.indexes[iterator] < this.proxyOf.nodes.length) {
				index = this.indexes[iterator];
				result = callback(this.proxyOf.nodes[index], index);
				if (result === false) break;
				this.indexes[iterator] += 1;
			}
			delete this.indexes[iterator];
			return result;
		}
		every(condition) {
			return this.nodes.every(condition);
		}
		getIterator() {
			if (!this.lastEach) this.lastEach = 0;
			if (!this.indexes) this.indexes = {};
			this.lastEach += 1;
			let iterator = this.lastEach;
			this.indexes[iterator] = 0;
			return iterator;
		}
		getProxyProcessor() {
			return {
				get(node, prop) {
					if (prop === "proxyOf") return node;
					else if (!node[prop]) return node[prop];
					else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) return (...args) => {
						return node[prop](...args.map((i) => {
							if (typeof i === "function") return (child, index) => i(child.toProxy(), index);
							else return i;
						}));
					};
					else if (prop === "every" || prop === "some") return (cb) => {
						return node[prop]((child, ...other) => cb(child.toProxy(), ...other));
					};
					else if (prop === "root") return () => node.root().toProxy();
					else if (prop === "nodes") return node.nodes.map((i) => i.toProxy());
					else if (prop === "first" || prop === "last") return node[prop].toProxy();
					else return node[prop];
				},
				set(node, prop, value) {
					if (node[prop] === value) return true;
					node[prop] = value;
					if (prop === "name" || prop === "params" || prop === "selector") node.markDirty();
					return true;
				}
			};
		}
		index(child) {
			if (typeof child === "number") return child;
			if (child.proxyOf) child = child.proxyOf;
			return this.proxyOf.nodes.indexOf(child);
		}
		insertAfter(exist, add) {
			let existIndex = this.index(exist);
			let nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
			existIndex = this.index(exist);
			for (let node of nodes) this.proxyOf.nodes.splice(existIndex + 1, 0, node);
			let index;
			for (let id in this.indexes) {
				index = this.indexes[id];
				if (existIndex < index) this.indexes[id] = index + nodes.length;
			}
			this.markDirty();
			return this;
		}
		insertBefore(exist, add) {
			let existIndex = this.index(exist);
			let type = existIndex === 0 ? "prepend" : false;
			let nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
			existIndex = this.index(exist);
			for (let node of nodes) this.proxyOf.nodes.splice(existIndex, 0, node);
			let index;
			for (let id in this.indexes) {
				index = this.indexes[id];
				if (existIndex <= index) this.indexes[id] = index + nodes.length;
			}
			this.markDirty();
			return this;
		}
		normalize(nodes, sample) {
			if (typeof nodes === "string") nodes = cleanSource(parse(nodes).nodes);
			else if (typeof nodes === "undefined") nodes = [];
			else if (Array.isArray(nodes)) {
				nodes = nodes.slice(0);
				for (let i of nodes) if (i.parent) i.parent.removeChild(i, "ignore");
			} else if (nodes.type === "root" && this.type !== "document") {
				nodes = nodes.nodes.slice(0);
				for (let i of nodes) if (i.parent) i.parent.removeChild(i, "ignore");
			} else if (nodes.type) nodes = [nodes];
			else if (nodes.prop) {
				if (typeof nodes.value === "undefined") throw new Error("Value field is missed in node creation");
				else if (typeof nodes.value !== "string") nodes.value = String(nodes.value);
				nodes = [new Declaration(nodes)];
			} else if (nodes.selector || nodes.selectors) nodes = [new Rule(nodes)];
			else if (nodes.name) nodes = [new AtRule(nodes)];
			else if (nodes.text) nodes = [new Comment(nodes)];
			else throw new Error("Unknown node type in node creation");
			return nodes.map((i) => {
				/* c8 ignore next */
				if (!i[my]) Container.rebuild(i);
				i = i.proxyOf;
				if (i.parent) i.parent.removeChild(i);
				if (i[isClean]) markTreeDirty(i);
				if (!i.raws) i.raws = {};
				if (typeof i.raws.before === "undefined") {
					if (sample && typeof sample.raws.before !== "undefined") i.raws.before = sample.raws.before.replace(/\S/g, "");
				}
				i.parent = this.proxyOf;
				return i;
			});
		}
		prepend(...children) {
			children = children.reverse();
			for (let child of children) {
				let nodes = this.normalize(child, this.first, "prepend").reverse();
				for (let node of nodes) this.proxyOf.nodes.unshift(node);
				for (let id in this.indexes) this.indexes[id] = this.indexes[id] + nodes.length;
			}
			this.markDirty();
			return this;
		}
		push(child) {
			child.parent = this;
			this.proxyOf.nodes.push(child);
			return this;
		}
		removeAll() {
			for (let node of this.proxyOf.nodes) node.parent = void 0;
			this.proxyOf.nodes = [];
			this.markDirty();
			return this;
		}
		removeChild(child) {
			child = this.index(child);
			this.proxyOf.nodes[child].parent = void 0;
			this.proxyOf.nodes.splice(child, 1);
			let index;
			for (let id in this.indexes) {
				index = this.indexes[id];
				if (index >= child) this.indexes[id] = index - 1;
			}
			this.markDirty();
			return this;
		}
		replaceValues(pattern, opts, callback) {
			if (!callback) {
				callback = opts;
				opts = {};
			}
			this.walkDecls((decl) => {
				if (opts.props && !opts.props.includes(decl.prop)) return;
				if (opts.fast && !decl.value.includes(opts.fast)) return;
				decl.value = decl.value.replace(pattern, callback);
			});
			this.markDirty();
			return this;
		}
		some(condition) {
			return this.nodes.some(condition);
		}
		walk(callback) {
			if (!this.proxyOf.nodes) return void 0;
			let stack = [{
				iterator: this.getIterator(),
				node: this.proxyOf
			}];
			while (stack.length > 0) {
				let { iterator, node } = stack[stack.length - 1];
				let index = node.indexes[iterator];
				if (index >= node.proxyOf.nodes.length) {
					delete node.indexes[iterator];
					stack.pop();
					let parent = stack[stack.length - 1];
					if (parent) parent.node.indexes[parent.iterator] += 1;
					continue;
				}
				let child = node.proxyOf.nodes[index];
				let result;
				try {
					result = callback(child, index);
				} catch (e) {
					throw child.addToError(e);
				}
				if (result === false) {
					for (let opened of stack) delete opened.node.indexes[opened.iterator];
					return false;
				}
				if (child.walk && child.proxyOf.nodes) stack.push({
					iterator: child.getIterator(),
					node: child
				});
				else node.indexes[iterator] += 1;
			}
		}
		walkAtRules(name, callback) {
			if (!callback) {
				callback = name;
				return this.walk((child, i) => {
					if (child.type === "atrule") return callback(child, i);
				});
			}
			if (name instanceof RegExp) return this.walk((child, i) => {
				if (child.type === "atrule" && name.test(child.name)) return callback(child, i);
			});
			return this.walk((child, i) => {
				if (child.type === "atrule" && child.name === name) return callback(child, i);
			});
		}
		walkComments(callback) {
			return this.walk((child, i) => {
				if (child.type === "comment") return callback(child, i);
			});
		}
		walkDecls(prop, callback) {
			if (!callback) {
				callback = prop;
				return this.walk((child, i) => {
					if (child.type === "decl") return callback(child, i);
				});
			}
			if (prop instanceof RegExp) return this.walk((child, i) => {
				if (child.type === "decl" && prop.test(child.prop)) return callback(child, i);
			});
			return this.walk((child, i) => {
				if (child.type === "decl" && child.prop === prop) return callback(child, i);
			});
		}
		walkRules(selector, callback) {
			if (!callback) {
				callback = selector;
				return this.walk((child, i) => {
					if (child.type === "rule") return callback(child, i);
				});
			}
			if (selector instanceof RegExp) return this.walk((child, i) => {
				if (child.type === "rule" && selector.test(child.selector)) return callback(child, i);
			});
			return this.walk((child, i) => {
				if (child.type === "rule" && child.selector === selector) return callback(child, i);
			});
		}
	};
	Container.registerParse = (dependant) => {
		parse = dependant;
	};
	Container.registerRule = (dependant) => {
		Rule = dependant;
	};
	Container.registerAtRule = (dependant) => {
		AtRule = dependant;
	};
	Container.registerRoot = (dependant) => {
		Root = dependant;
	};
	module.exports = Container;
	Container.default = Container;
	/* c8 ignore start */
	Container.rebuild = (node) => {
		let stack = [node];
		while (stack.length > 0) {
			let next = stack.pop();
			if (next.type === "atrule") Object.setPrototypeOf(next, AtRule.prototype);
			else if (next.type === "rule") Object.setPrototypeOf(next, Rule.prototype);
			else if (next.type === "decl") Object.setPrototypeOf(next, Declaration.prototype);
			else if (next.type === "comment") Object.setPrototypeOf(next, Comment.prototype);
			else if (next.type === "root") Object.setPrototypeOf(next, Root.prototype);
			next[my] = true;
			if (next.nodes) for (let child of next.nodes) stack.push(child);
		}
	};
}));
/* c8 ignore stop */
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/at-rule.js
var require_at_rule = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Container = require_container();
	var AtRule = class extends Container {
		constructor(defaults) {
			super(defaults);
			this.type = "atrule";
		}
		append(...children) {
			if (!this.proxyOf.nodes) this.nodes = [];
			return super.append(...children);
		}
		prepend(...children) {
			if (!this.proxyOf.nodes) this.nodes = [];
			return super.prepend(...children);
		}
	};
	module.exports = AtRule;
	AtRule.default = AtRule;
	Container.registerAtRule(AtRule);
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/document.js
var require_document = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Container = require_container();
	let LazyResult;
	let Processor;
	var Document = class extends Container {
		constructor(defaults) {
			super({
				type: "document",
				...defaults
			});
			if (!this.nodes) this.nodes = [];
		}
		toResult(opts = {}) {
			return new LazyResult(new Processor(), this, opts).stringify();
		}
	};
	Document.registerLazyResult = (dependant) => {
		LazyResult = dependant;
	};
	Document.registerProcessor = (dependant) => {
		Processor = dependant;
	};
	module.exports = Document;
	Document.default = Document;
}));
//#endregion
//#region node_modules/.pnpm/nanoid@3.3.19/node_modules/nanoid/non-secure/index.cjs
var require_non_secure = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
	let customAlphabet = (alphabet, defaultSize = 21) => {
		return (size = defaultSize) => {
			let id = "";
			let i = size | 0;
			while (i-- > 0) id += alphabet[Math.random() * alphabet.length | 0];
			return id;
		};
	};
	let nanoid = (size = 21) => {
		let id = "";
		let i = size | 0;
		while (i-- > 0) id += urlAlphabet[Math.random() * 64 | 0];
		return id;
	};
	module.exports = {
		nanoid,
		customAlphabet
	};
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/base64.js
var require_base64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
	/**
	* Encode an integer in the range of 0 to 63 to a single base 64 digit.
	*/
	exports.encode = function(number) {
		if (0 <= number && number < intToCharMap.length) return intToCharMap[number];
		throw new TypeError("Must be between 0 and 63: " + number);
	};
	/**
	* Decode a single base 64 character code digit to an integer. Returns -1 on
	* failure.
	*/
	exports.decode = function(charCode) {
		var bigA = 65;
		var bigZ = 90;
		var littleA = 97;
		var littleZ = 122;
		var zero = 48;
		var nine = 57;
		var plus = 43;
		var slash = 47;
		var littleOffset = 26;
		var numberOffset = 52;
		if (bigA <= charCode && charCode <= bigZ) return charCode - bigA;
		if (littleA <= charCode && charCode <= littleZ) return charCode - littleA + littleOffset;
		if (zero <= charCode && charCode <= nine) return charCode - zero + numberOffset;
		if (charCode == plus) return 62;
		if (charCode == slash) return 63;
		return -1;
	};
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/base64-vlq.js
var require_base64_vlq = /* @__PURE__ */ __commonJSMin(((exports) => {
	var base64 = require_base64();
	var VLQ_BASE_SHIFT = 5;
	var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
	var VLQ_BASE_MASK = VLQ_BASE - 1;
	var VLQ_CONTINUATION_BIT = VLQ_BASE;
	/**
	* Converts from a two-complement value to a value where the sign bit is
	* placed in the least significant bit.  For example, as decimals:
	*   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
	*   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
	*/
	function toVLQSigned(aValue) {
		return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
	}
	/**
	* Converts to a two-complement value from a value where the sign bit is
	* placed in the least significant bit.  For example, as decimals:
	*   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
	*   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
	*/
	function fromVLQSigned(aValue) {
		var isNegative = (aValue & 1) === 1;
		var shifted = aValue >> 1;
		return isNegative ? -shifted : shifted;
	}
	/**
	* Returns the base 64 VLQ encoded value.
	*/
	exports.encode = function base64VLQ_encode(aValue) {
		var encoded = "";
		var digit;
		var vlq = toVLQSigned(aValue);
		do {
			digit = vlq & VLQ_BASE_MASK;
			vlq >>>= VLQ_BASE_SHIFT;
			if (vlq > 0) digit |= VLQ_CONTINUATION_BIT;
			encoded += base64.encode(digit);
		} while (vlq > 0);
		return encoded;
	};
	/**
	* Decodes the next base 64 VLQ value from the given string and returns the
	* value and the rest of the string via the out parameter.
	*/
	exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
		var strLen = aStr.length;
		var result = 0;
		var shift = 0;
		var continuation, digit;
		do {
			if (aIndex >= strLen) throw new Error("Expected more digits in base 64 VLQ value.");
			digit = base64.decode(aStr.charCodeAt(aIndex++));
			if (digit === -1) throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
			continuation = !!(digit & VLQ_CONTINUATION_BIT);
			digit &= VLQ_BASE_MASK;
			result = result + (digit << shift);
			shift += VLQ_BASE_SHIFT;
		} while (continuation);
		aOutParam.value = fromVLQSigned(result);
		aOutParam.rest = aIndex;
	};
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* This is a helper function for getting values from parameter/options
	* objects.
	*
	* @param args The object we are extracting values from
	* @param name The name of the property we are getting.
	* @param defaultValue An optional value to return if the property is missing
	* from the object. If this is not specified and the property is missing, an
	* error will be thrown.
	*/
	function getArg(aArgs, aName, aDefaultValue) {
		if (aName in aArgs) return aArgs[aName];
		else if (arguments.length === 3) return aDefaultValue;
		else throw new Error("\"" + aName + "\" is a required argument.");
	}
	exports.getArg = getArg;
	var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
	var dataUrlRegexp = /^data:.+\,.+$/;
	function urlParse(aUrl) {
		var match = aUrl.match(urlRegexp);
		if (!match) return null;
		return {
			scheme: match[1],
			auth: match[2],
			host: match[3],
			port: match[4],
			path: match[5]
		};
	}
	exports.urlParse = urlParse;
	function urlGenerate(aParsedUrl) {
		var url = "";
		if (aParsedUrl.scheme) url += aParsedUrl.scheme + ":";
		url += "//";
		if (aParsedUrl.auth) url += aParsedUrl.auth + "@";
		if (aParsedUrl.host) url += aParsedUrl.host;
		if (aParsedUrl.port) url += ":" + aParsedUrl.port;
		if (aParsedUrl.path) url += aParsedUrl.path;
		return url;
	}
	exports.urlGenerate = urlGenerate;
	var MAX_CACHED_INPUTS = 32;
	/**
	* Takes some function `f(input) -> result` and returns a memoized version of
	* `f`.
	*
	* We keep at most `MAX_CACHED_INPUTS` memoized results of `f` alive. The
	* memoization is a dumb-simple, linear least-recently-used cache.
	*/
	function lruMemoize(f) {
		var cache = [];
		return function(input) {
			for (var i = 0; i < cache.length; i++) if (cache[i].input === input) {
				var temp = cache[0];
				cache[0] = cache[i];
				cache[i] = temp;
				return cache[0].result;
			}
			var result = f(input);
			cache.unshift({
				input,
				result
			});
			if (cache.length > MAX_CACHED_INPUTS) cache.pop();
			return result;
		};
	}
	/**
	* Normalizes a path, or the path portion of a URL:
	*
	* - Replaces consecutive slashes with one slash.
	* - Removes unnecessary '.' parts.
	* - Removes unnecessary '<dir>/..' parts.
	*
	* Based on code in the Node.js 'path' core module.
	*
	* @param aPath The path or url to normalize.
	*/
	var normalize = lruMemoize(function normalize(aPath) {
		var path = aPath;
		var url = urlParse(aPath);
		if (url) {
			if (!url.path) return aPath;
			path = url.path;
		}
		var isAbsolute = exports.isAbsolute(path);
		var parts = [];
		var start = 0;
		var i = 0;
		while (true) {
			start = i;
			i = path.indexOf("/", start);
			if (i === -1) {
				parts.push(path.slice(start));
				break;
			} else {
				parts.push(path.slice(start, i));
				while (i < path.length && path[i] === "/") i++;
			}
		}
		for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
			part = parts[i];
			if (part === ".") parts.splice(i, 1);
			else if (part === "..") up++;
			else if (up > 0) {
				if (part === "") {
					parts.splice(i + 1, up);
					up = 0;
				} else {
					parts.splice(i, 2);
					up--;
				}
			}
		}
		path = parts.join("/");
		if (path === "") path = isAbsolute ? "/" : ".";
		if (url) {
			url.path = path;
			return urlGenerate(url);
		}
		return path;
	});
	exports.normalize = normalize;
	/**
	* Joins two paths/URLs.
	*
	* @param aRoot The root path or URL.
	* @param aPath The path or URL to be joined with the root.
	*
	* - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
	*   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
	*   first.
	* - Otherwise aPath is a path. If aRoot is a URL, then its path portion
	*   is updated with the result and aRoot is returned. Otherwise the result
	*   is returned.
	*   - If aPath is absolute, the result is aPath.
	*   - Otherwise the two paths are joined with a slash.
	* - Joining for example 'http://' and 'www.example.com' is also supported.
	*/
	function join(aRoot, aPath) {
		if (aRoot === "") aRoot = ".";
		if (aPath === "") aPath = ".";
		var aPathUrl = urlParse(aPath);
		var aRootUrl = urlParse(aRoot);
		if (aRootUrl) aRoot = aRootUrl.path || "/";
		if (aPathUrl && !aPathUrl.scheme) {
			if (aRootUrl) aPathUrl.scheme = aRootUrl.scheme;
			return urlGenerate(aPathUrl);
		}
		if (aPathUrl || aPath.match(dataUrlRegexp)) return aPath;
		if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
			aRootUrl.host = aPath;
			return urlGenerate(aRootUrl);
		}
		var joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
		if (aRootUrl) {
			aRootUrl.path = joined;
			return urlGenerate(aRootUrl);
		}
		return joined;
	}
	exports.join = join;
	exports.isAbsolute = function(aPath) {
		return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
	};
	/**
	* Make a path relative to a URL or another path.
	*
	* @param aRoot The root path or URL.
	* @param aPath The path or URL to be made relative to aRoot.
	*/
	function relative(aRoot, aPath) {
		if (aRoot === "") aRoot = ".";
		aRoot = aRoot.replace(/\/$/, "");
		var level = 0;
		while (aPath.indexOf(aRoot + "/") !== 0) {
			var index = aRoot.lastIndexOf("/");
			if (index < 0) return aPath;
			aRoot = aRoot.slice(0, index);
			if (aRoot.match(/^([^\/]+:\/)?\/*$/)) return aPath;
			++level;
		}
		return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
	}
	exports.relative = relative;
	var supportsNullProto = function() {
		return !("__proto__" in Object.create(null));
	}();
	function identity(s) {
		return s;
	}
	/**
	* Because behavior goes wacky when you set `__proto__` on objects, we
	* have to prefix all the strings in our set with an arbitrary character.
	*
	* See https://github.com/mozilla/source-map/pull/31 and
	* https://github.com/mozilla/source-map/issues/30
	*
	* @param String aStr
	*/
	function toSetString(aStr) {
		if (isProtoString(aStr)) return "$" + aStr;
		return aStr;
	}
	exports.toSetString = supportsNullProto ? identity : toSetString;
	function fromSetString(aStr) {
		if (isProtoString(aStr)) return aStr.slice(1);
		return aStr;
	}
	exports.fromSetString = supportsNullProto ? identity : fromSetString;
	function isProtoString(s) {
		if (!s) return false;
		var length = s.length;
		if (length < 9) return false;
		if (s.charCodeAt(length - 1) !== 95 || s.charCodeAt(length - 2) !== 95 || s.charCodeAt(length - 3) !== 111 || s.charCodeAt(length - 4) !== 116 || s.charCodeAt(length - 5) !== 111 || s.charCodeAt(length - 6) !== 114 || s.charCodeAt(length - 7) !== 112 || s.charCodeAt(length - 8) !== 95 || s.charCodeAt(length - 9) !== 95) return false;
		for (var i = length - 10; i >= 0; i--) if (s.charCodeAt(i) !== 36) return false;
		return true;
	}
	/**
	* Comparator between two mappings where the original positions are compared.
	*
	* Optionally pass in `true` as `onlyCompareGenerated` to consider two
	* mappings with the same original source/line/column, but different generated
	* line and column the same. Useful when searching for a mapping with a
	* stubbed out mapping.
	*/
	function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
		var cmp = strcmp(mappingA.source, mappingB.source);
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalLine - mappingB.originalLine;
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalColumn - mappingB.originalColumn;
		if (cmp !== 0 || onlyCompareOriginal) return cmp;
		cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		if (cmp !== 0) return cmp;
		cmp = mappingA.generatedLine - mappingB.generatedLine;
		if (cmp !== 0) return cmp;
		return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByOriginalPositions = compareByOriginalPositions;
	function compareByOriginalPositionsNoSource(mappingA, mappingB, onlyCompareOriginal) {
		var cmp = mappingA.originalLine - mappingB.originalLine;
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalColumn - mappingB.originalColumn;
		if (cmp !== 0 || onlyCompareOriginal) return cmp;
		cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		if (cmp !== 0) return cmp;
		cmp = mappingA.generatedLine - mappingB.generatedLine;
		if (cmp !== 0) return cmp;
		return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByOriginalPositionsNoSource = compareByOriginalPositionsNoSource;
	/**
	* Comparator between two mappings with deflated source and name indices where
	* the generated positions are compared.
	*
	* Optionally pass in `true` as `onlyCompareGenerated` to consider two
	* mappings with the same generated line and column, but different
	* source/name/original line and column the same. Useful when searching for a
	* mapping with a stubbed out mapping.
	*/
	function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
		var cmp = mappingA.generatedLine - mappingB.generatedLine;
		if (cmp !== 0) return cmp;
		cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		if (cmp !== 0 || onlyCompareGenerated) return cmp;
		cmp = strcmp(mappingA.source, mappingB.source);
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalLine - mappingB.originalLine;
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalColumn - mappingB.originalColumn;
		if (cmp !== 0) return cmp;
		return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
	function compareByGeneratedPositionsDeflatedNoLine(mappingA, mappingB, onlyCompareGenerated) {
		var cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		if (cmp !== 0 || onlyCompareGenerated) return cmp;
		cmp = strcmp(mappingA.source, mappingB.source);
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalLine - mappingB.originalLine;
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalColumn - mappingB.originalColumn;
		if (cmp !== 0) return cmp;
		return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsDeflatedNoLine = compareByGeneratedPositionsDeflatedNoLine;
	function strcmp(aStr1, aStr2) {
		if (aStr1 === aStr2) return 0;
		if (aStr1 === null) return 1;
		if (aStr2 === null) return -1;
		if (aStr1 > aStr2) return 1;
		return -1;
	}
	/**
	* Comparator between two mappings with inflated source and name strings where
	* the generated positions are compared.
	*/
	function compareByGeneratedPositionsInflated(mappingA, mappingB) {
		var cmp = mappingA.generatedLine - mappingB.generatedLine;
		if (cmp !== 0) return cmp;
		cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		if (cmp !== 0) return cmp;
		cmp = strcmp(mappingA.source, mappingB.source);
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalLine - mappingB.originalLine;
		if (cmp !== 0) return cmp;
		cmp = mappingA.originalColumn - mappingB.originalColumn;
		if (cmp !== 0) return cmp;
		return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
	/**
	* Strip any JSON XSSI avoidance prefix from the string (as documented
	* in the source maps specification), and then parse the string as
	* JSON.
	*/
	function parseSourceMapInput(str) {
		return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
	}
	exports.parseSourceMapInput = parseSourceMapInput;
	/**
	* Compute the URL of a source given the the source root, the source's
	* URL, and the source map's URL.
	*/
	function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
		sourceURL = sourceURL || "";
		if (sourceRoot) {
			if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") sourceRoot += "/";
			sourceURL = sourceRoot + sourceURL;
		}
		if (sourceMapURL) {
			var parsed = urlParse(sourceMapURL);
			if (!parsed) throw new Error("sourceMapURL could not be parsed");
			if (parsed.path) {
				var index = parsed.path.lastIndexOf("/");
				if (index >= 0) parsed.path = parsed.path.substring(0, index + 1);
			}
			sourceURL = join(urlGenerate(parsed), sourceURL);
		}
		return normalize(sourceURL);
	}
	exports.computeSourceURL = computeSourceURL;
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/array-set.js
var require_array_set = /* @__PURE__ */ __commonJSMin(((exports) => {
	var util = require_util();
	var has = Object.prototype.hasOwnProperty;
	var hasNativeMap = typeof Map !== "undefined";
	/**
	* A data structure which is a combination of an array and a set. Adding a new
	* member is O(1), testing for membership is O(1), and finding the index of an
	* element is O(1). Removing elements from the set is not supported. Only
	* strings are supported for membership.
	*/
	function ArraySet() {
		this._array = [];
		this._set = hasNativeMap ? /* @__PURE__ */ new Map() : Object.create(null);
	}
	/**
	* Static method for creating ArraySet instances from an existing array.
	*/
	ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
		var set = new ArraySet();
		for (var i = 0, len = aArray.length; i < len; i++) set.add(aArray[i], aAllowDuplicates);
		return set;
	};
	/**
	* Return how many unique items are in this ArraySet. If duplicates have been
	* added, than those do not count towards the size.
	*
	* @returns Number
	*/
	ArraySet.prototype.size = function ArraySet_size() {
		return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
	};
	/**
	* Add the given string to this set.
	*
	* @param String aStr
	*/
	ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
		var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
		var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
		var idx = this._array.length;
		if (!isDuplicate || aAllowDuplicates) this._array.push(aStr);
		if (!isDuplicate) {
			if (hasNativeMap) this._set.set(aStr, idx);
			else this._set[sStr] = idx;
		}
	};
	/**
	* Is the given string a member of this set?
	*
	* @param String aStr
	*/
	ArraySet.prototype.has = function ArraySet_has(aStr) {
		if (hasNativeMap) return this._set.has(aStr);
		else {
			var sStr = util.toSetString(aStr);
			return has.call(this._set, sStr);
		}
	};
	/**
	* What is the index of the given string in the array?
	*
	* @param String aStr
	*/
	ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
		if (hasNativeMap) {
			var idx = this._set.get(aStr);
			if (idx >= 0) return idx;
		} else {
			var sStr = util.toSetString(aStr);
			if (has.call(this._set, sStr)) return this._set[sStr];
		}
		throw new Error("\"" + aStr + "\" is not in the set.");
	};
	/**
	* What is the element at the given index?
	*
	* @param Number aIdx
	*/
	ArraySet.prototype.at = function ArraySet_at(aIdx) {
		if (aIdx >= 0 && aIdx < this._array.length) return this._array[aIdx];
		throw new Error("No element indexed by " + aIdx);
	};
	/**
	* Returns the array representation of this set (which has the proper indices
	* indicated by indexOf). Note that this is a copy of the internal array used
	* for storing the members so that no one can mess with internal state.
	*/
	ArraySet.prototype.toArray = function ArraySet_toArray() {
		return this._array.slice();
	};
	exports.ArraySet = ArraySet;
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/mapping-list.js
var require_mapping_list = /* @__PURE__ */ __commonJSMin(((exports) => {
	var util = require_util();
	/**
	* Determine whether mappingB is after mappingA with respect to generated
	* position.
	*/
	function generatedPositionAfter(mappingA, mappingB) {
		var lineA = mappingA.generatedLine;
		var lineB = mappingB.generatedLine;
		var columnA = mappingA.generatedColumn;
		var columnB = mappingB.generatedColumn;
		return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
	}
	/**
	* A data structure to provide a sorted view of accumulated mappings in a
	* performance conscious manner. It trades a neglibable overhead in general
	* case for a large speedup in case of mappings being added in order.
	*/
	function MappingList() {
		this._array = [];
		this._sorted = true;
		this._last = {
			generatedLine: -1,
			generatedColumn: 0
		};
	}
	/**
	* Iterate through internal items. This method takes the same arguments that
	* `Array.prototype.forEach` takes.
	*
	* NOTE: The order of the mappings is NOT guaranteed.
	*/
	MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
		this._array.forEach(aCallback, aThisArg);
	};
	/**
	* Add the given source mapping.
	*
	* @param Object aMapping
	*/
	MappingList.prototype.add = function MappingList_add(aMapping) {
		if (generatedPositionAfter(this._last, aMapping)) {
			this._last = aMapping;
			this._array.push(aMapping);
		} else {
			this._sorted = false;
			this._array.push(aMapping);
		}
	};
	/**
	* Returns the flat, sorted array of mappings. The mappings are sorted by
	* generated position.
	*
	* WARNING: This method returns internal data without copying, for
	* performance. The return value must NOT be mutated, and should be treated as
	* an immutable borrow. If you want to take ownership, you must make your own
	* copy.
	*/
	MappingList.prototype.toArray = function MappingList_toArray() {
		if (!this._sorted) {
			this._array.sort(util.compareByGeneratedPositionsInflated);
			this._sorted = true;
		}
		return this._array;
	};
	exports.MappingList = MappingList;
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/source-map-generator.js
var require_source_map_generator = /* @__PURE__ */ __commonJSMin(((exports) => {
	var base64VLQ = require_base64_vlq();
	var util = require_util();
	var ArraySet = require_array_set().ArraySet;
	var MappingList = require_mapping_list().MappingList;
	/**
	* An instance of the SourceMapGenerator represents a source map which is
	* being built incrementally. You may pass an object with the following
	* properties:
	*
	*   - file: The filename of the generated source.
	*   - sourceRoot: A root for all relative URLs in this source map.
	*/
	function SourceMapGenerator(aArgs) {
		if (!aArgs) aArgs = {};
		this._file = util.getArg(aArgs, "file", null);
		this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
		this._skipValidation = util.getArg(aArgs, "skipValidation", false);
		this._ignoreInvalidMapping = util.getArg(aArgs, "ignoreInvalidMapping", false);
		this._sources = new ArraySet();
		this._names = new ArraySet();
		this._mappings = new MappingList();
		this._sourcesContents = null;
	}
	SourceMapGenerator.prototype._version = 3;
	/**
	* Creates a new SourceMapGenerator based on a SourceMapConsumer
	*
	* @param aSourceMapConsumer The SourceMap.
	*/
	SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer, generatorOps) {
		var sourceRoot = aSourceMapConsumer.sourceRoot;
		var generator = new SourceMapGenerator(Object.assign(generatorOps || {}, {
			file: aSourceMapConsumer.file,
			sourceRoot
		}));
		aSourceMapConsumer.eachMapping(function(mapping) {
			var newMapping = { generated: {
				line: mapping.generatedLine,
				column: mapping.generatedColumn
			} };
			if (mapping.source != null) {
				newMapping.source = mapping.source;
				if (sourceRoot != null) newMapping.source = util.relative(sourceRoot, newMapping.source);
				newMapping.original = {
					line: mapping.originalLine,
					column: mapping.originalColumn
				};
				if (mapping.name != null) newMapping.name = mapping.name;
			}
			generator.addMapping(newMapping);
		});
		aSourceMapConsumer.sources.forEach(function(sourceFile) {
			var sourceRelative = sourceFile;
			if (sourceRoot !== null) sourceRelative = util.relative(sourceRoot, sourceFile);
			if (!generator._sources.has(sourceRelative)) generator._sources.add(sourceRelative);
			var content = aSourceMapConsumer.sourceContentFor(sourceFile);
			if (content != null) generator.setSourceContent(sourceFile, content);
		});
		return generator;
	};
	/**
	* Add a single mapping from original source line and column to the generated
	* source's line and column for this source map being created. The mapping
	* object should have the following properties:
	*
	*   - generated: An object with the generated line and column positions.
	*   - original: An object with the original line and column positions.
	*   - source: The original source file (relative to the sourceRoot).
	*   - name: An optional original token name for this mapping.
	*/
	SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
		var generated = util.getArg(aArgs, "generated");
		var original = util.getArg(aArgs, "original", null);
		var source = util.getArg(aArgs, "source", null);
		var name = util.getArg(aArgs, "name", null);
		if (!this._skipValidation) {
			if (this._validateMapping(generated, original, source, name) === false) return;
		}
		if (source != null) {
			source = String(source);
			if (!this._sources.has(source)) this._sources.add(source);
		}
		if (name != null) {
			name = String(name);
			if (!this._names.has(name)) this._names.add(name);
		}
		this._mappings.add({
			generatedLine: generated.line,
			generatedColumn: generated.column,
			originalLine: original != null && original.line,
			originalColumn: original != null && original.column,
			source,
			name
		});
	};
	/**
	* Set the source content for a source file.
	*/
	SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
		var source = aSourceFile;
		if (this._sourceRoot != null) source = util.relative(this._sourceRoot, source);
		if (aSourceContent != null) {
			if (!this._sourcesContents) this._sourcesContents = Object.create(null);
			this._sourcesContents[util.toSetString(source)] = aSourceContent;
		} else if (this._sourcesContents) {
			delete this._sourcesContents[util.toSetString(source)];
			if (Object.keys(this._sourcesContents).length === 0) this._sourcesContents = null;
		}
	};
	/**
	* Applies the mappings of a sub-source-map for a specific source file to the
	* source map being generated. Each mapping to the supplied source file is
	* rewritten using the supplied source map. Note: The resolution for the
	* resulting mappings is the minimium of this map and the supplied map.
	*
	* @param aSourceMapConsumer The source map to be applied.
	* @param aSourceFile Optional. The filename of the source file.
	*        If omitted, SourceMapConsumer's file property will be used.
	* @param aSourceMapPath Optional. The dirname of the path to the source map
	*        to be applied. If relative, it is relative to the SourceMapConsumer.
	*        This parameter is needed when the two source maps aren't in the same
	*        directory, and the source map to be applied contains relative source
	*        paths. If so, those relative source paths need to be rewritten
	*        relative to the SourceMapGenerator.
	*/
	SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
		var sourceFile = aSourceFile;
		if (aSourceFile == null) {
			if (aSourceMapConsumer.file == null) throw new Error("SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's \"file\" property. Both were omitted.");
			sourceFile = aSourceMapConsumer.file;
		}
		var sourceRoot = this._sourceRoot;
		if (sourceRoot != null) sourceFile = util.relative(sourceRoot, sourceFile);
		var newSources = new ArraySet();
		var newNames = new ArraySet();
		this._mappings.unsortedForEach(function(mapping) {
			if (mapping.source === sourceFile && mapping.originalLine != null) {
				var original = aSourceMapConsumer.originalPositionFor({
					line: mapping.originalLine,
					column: mapping.originalColumn
				});
				if (original.source != null) {
					mapping.source = original.source;
					if (aSourceMapPath != null) mapping.source = util.join(aSourceMapPath, mapping.source);
					if (sourceRoot != null) mapping.source = util.relative(sourceRoot, mapping.source);
					mapping.originalLine = original.line;
					mapping.originalColumn = original.column;
					if (original.name != null) mapping.name = original.name;
				}
			}
			var source = mapping.source;
			if (source != null && !newSources.has(source)) newSources.add(source);
			var name = mapping.name;
			if (name != null && !newNames.has(name)) newNames.add(name);
		}, this);
		this._sources = newSources;
		this._names = newNames;
		aSourceMapConsumer.sources.forEach(function(sourceFile) {
			var content = aSourceMapConsumer.sourceContentFor(sourceFile);
			if (content != null) {
				if (aSourceMapPath != null) sourceFile = util.join(aSourceMapPath, sourceFile);
				if (sourceRoot != null) sourceFile = util.relative(sourceRoot, sourceFile);
				this.setSourceContent(sourceFile, content);
			}
		}, this);
	};
	/**
	* A mapping can have one of the three levels of data:
	*
	*   1. Just the generated position.
	*   2. The Generated position, original position, and original source.
	*   3. Generated and original position, original source, as well as a name
	*      token.
	*
	* To maintain consistency, we validate that any new mapping being added falls
	* in to one of these categories.
	*/
	SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
		if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
			var message = "original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.";
			if (this._ignoreInvalidMapping) {
				if (typeof console !== "undefined" && console.warn) console.warn(message);
				return false;
			} else throw new Error(message);
		}
		if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) return;
		else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) return;
		else {
			var message = "Invalid mapping: " + JSON.stringify({
				generated: aGenerated,
				source: aSource,
				original: aOriginal,
				name: aName
			});
			if (this._ignoreInvalidMapping) {
				if (typeof console !== "undefined" && console.warn) console.warn(message);
				return false;
			} else throw new Error(message);
		}
	};
	/**
	* Serialize the accumulated mappings in to the stream of base 64 VLQs
	* specified by the source map format.
	*/
	SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
		var previousGeneratedColumn = 0;
		var previousGeneratedLine = 1;
		var previousOriginalColumn = 0;
		var previousOriginalLine = 0;
		var previousName = 0;
		var previousSource = 0;
		var result = "";
		var next;
		var mapping;
		var nameIdx;
		var sourceIdx;
		var mappings = this._mappings.toArray();
		for (var i = 0, len = mappings.length; i < len; i++) {
			mapping = mappings[i];
			next = "";
			if (mapping.generatedLine !== previousGeneratedLine) {
				previousGeneratedColumn = 0;
				var lineDelta = mapping.generatedLine - previousGeneratedLine;
				next += lineDelta === 1 ? ";" : ";".repeat(lineDelta);
				previousGeneratedLine = mapping.generatedLine;
			} else if (i > 0) {
				if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) continue;
				next += ",";
			}
			next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
			previousGeneratedColumn = mapping.generatedColumn;
			if (mapping.source != null) {
				sourceIdx = this._sources.indexOf(mapping.source);
				next += base64VLQ.encode(sourceIdx - previousSource);
				previousSource = sourceIdx;
				next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
				previousOriginalLine = mapping.originalLine - 1;
				next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
				previousOriginalColumn = mapping.originalColumn;
				if (mapping.name != null) {
					nameIdx = this._names.indexOf(mapping.name);
					next += base64VLQ.encode(nameIdx - previousName);
					previousName = nameIdx;
				}
			}
			result += next;
		}
		return result;
	};
	SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
		return aSources.map(function(source) {
			if (!this._sourcesContents) return null;
			if (aSourceRoot != null) source = util.relative(aSourceRoot, source);
			var key = util.toSetString(source);
			return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
		}, this);
	};
	/**
	* Externalize the source map.
	*/
	SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
		var map = {
			version: this._version,
			sources: this._sources.toArray(),
			names: this._names.toArray(),
			mappings: this._serializeMappings()
		};
		if (this._file != null) map.file = this._file;
		if (this._sourceRoot != null) map.sourceRoot = this._sourceRoot;
		if (this._sourcesContents) map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
		return map;
	};
	/**
	* Render the source map being generated to a string.
	*/
	SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
		return JSON.stringify(this.toJSON());
	};
	exports.SourceMapGenerator = SourceMapGenerator;
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/binary-search.js
var require_binary_search = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.GREATEST_LOWER_BOUND = 1;
	exports.LEAST_UPPER_BOUND = 2;
	/**
	* Recursive implementation of binary search.
	*
	* @param aLow Indices here and lower do not contain the needle.
	* @param aHigh Indices here and higher do not contain the needle.
	* @param aNeedle The element being searched for.
	* @param aHaystack The non-empty array being searched.
	* @param aCompare Function which takes two elements and returns -1, 0, or 1.
	* @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	*     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	*     closest element that is smaller than or greater than the one we are
	*     searching for, respectively, if the exact element cannot be found.
	*/
	function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
		var mid = Math.floor((aHigh - aLow) / 2) + aLow;
		var cmp = aCompare(aNeedle, aHaystack[mid], true);
		if (cmp === 0) return mid;
		else if (cmp > 0) {
			if (aHigh - mid > 1) return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
			if (aBias == exports.LEAST_UPPER_BOUND) return aHigh < aHaystack.length ? aHigh : -1;
			else return mid;
		} else {
			if (mid - aLow > 1) return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
			if (aBias == exports.LEAST_UPPER_BOUND) return mid;
			else return aLow < 0 ? -1 : aLow;
		}
	}
	/**
	* This is an implementation of binary search which will always try and return
	* the index of the closest element if there is no exact hit. This is because
	* mappings between original and generated line/col pairs are single points,
	* and there is an implicit region between each of them, so a miss just means
	* that you aren't on the very start of a region.
	*
	* @param aNeedle The element you are looking for.
	* @param aHaystack The array that is being searched.
	* @param aCompare A function which takes the needle and an element in the
	*     array and returns -1, 0, or 1 depending on whether the needle is less
	*     than, equal to, or greater than the element, respectively.
	* @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	*     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	*     closest element that is smaller than or greater than the one we are
	*     searching for, respectively, if the exact element cannot be found.
	*     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
	*/
	exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
		if (aHaystack.length === 0) return -1;
		var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
		if (index < 0) return -1;
		while (index - 1 >= 0) {
			if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) break;
			--index;
		}
		return index;
	};
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/quick-sort.js
var require_quick_sort = /* @__PURE__ */ __commonJSMin(((exports) => {
	function SortTemplate(comparator) {
		/**
		* Swap the elements indexed by `x` and `y` in the array `ary`.
		*
		* @param {Array} ary
		*        The array.
		* @param {Number} x
		*        The index of the first item.
		* @param {Number} y
		*        The index of the second item.
		*/
		function swap(ary, x, y) {
			var temp = ary[x];
			ary[x] = ary[y];
			ary[y] = temp;
		}
		/**
		* Returns a random integer within the range `low .. high` inclusive.
		*
		* @param {Number} low
		*        The lower bound on the range.
		* @param {Number} high
		*        The upper bound on the range.
		*/
		function randomIntInRange(low, high) {
			return Math.round(low + Math.random() * (high - low));
		}
		/**
		* The Quick Sort algorithm.
		*
		* @param {Array} ary
		*        An array to sort.
		* @param {function} comparator
		*        Function to use to compare two items.
		* @param {Number} p
		*        Start index of the array
		* @param {Number} r
		*        End index of the array
		*/
		function doQuickSort(ary, comparator, p, r) {
			if (p < r) {
				var pivotIndex = randomIntInRange(p, r);
				var i = p - 1;
				swap(ary, pivotIndex, r);
				var pivot = ary[r];
				for (var j = p; j < r; j++) if (comparator(ary[j], pivot, false) <= 0) {
					i += 1;
					swap(ary, i, j);
				}
				swap(ary, i + 1, j);
				var q = i + 1;
				doQuickSort(ary, comparator, p, q - 1);
				doQuickSort(ary, comparator, q + 1, r);
			}
		}
		return doQuickSort;
	}
	function cloneSort(comparator) {
		let template = SortTemplate.toString();
		return new Function(`return ${template}`)()(comparator);
	}
	let isEvalAllowed = (function() {
		try {
			new Function("return 0")();
			return true;
		} catch {
			return false;
		}
	})();
	/**
	* Sort the given array in-place with the given comparator function.
	*
	* @param {Array} ary
	*        An array to sort.
	* @param {function} comparator
	*        Function to use to compare two items.
	*/
	let sortCache = /* @__PURE__ */ new WeakMap();
	exports.quickSort = function(ary, comparator, start = 0) {
		let doQuickSort = isEvalAllowed ? sortCache.get(comparator) : SortTemplate(comparator);
		if (doQuickSort === void 0) {
			doQuickSort = cloneSort(comparator);
			sortCache.set(comparator, doQuickSort);
		}
		doQuickSort(ary, comparator, start, ary.length - 1);
	};
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/source-map-consumer.js
var require_source_map_consumer = /* @__PURE__ */ __commonJSMin(((exports) => {
	var util = require_util();
	var binarySearch = require_binary_search();
	var ArraySet = require_array_set().ArraySet;
	var base64VLQ = require_base64_vlq();
	var quickSort = require_quick_sort().quickSort;
	var MAX_SECTION_OFFSET_LINE = 1e7;
	function SourceMapConsumer(aSourceMap, aSourceMapURL) {
		var sourceMap = aSourceMap;
		if (typeof aSourceMap === "string") sourceMap = util.parseSourceMapInput(aSourceMap);
		return sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL) : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
	}
	SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
		return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
	};
	/**
	* The version of the source mapping spec that we are consuming.
	*/
	SourceMapConsumer.prototype._version = 3;
	SourceMapConsumer.prototype.__generatedMappings = null;
	Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
		configurable: true,
		enumerable: true,
		get: function() {
			if (!this.__generatedMappings) this._parseMappings(this._mappings, this.sourceRoot);
			return this.__generatedMappings;
		}
	});
	SourceMapConsumer.prototype.__originalMappings = null;
	Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
		configurable: true,
		enumerable: true,
		get: function() {
			if (!this.__originalMappings) this._parseMappings(this._mappings, this.sourceRoot);
			return this.__originalMappings;
		}
	});
	SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
		var c = aStr.charAt(index);
		return c === ";" || c === ",";
	};
	/**
	* Parse the mappings in a string in to a data structure which we can easily
	* query (the ordered arrays in the `this.__generatedMappings` and
	* `this.__originalMappings` properties).
	*/
	SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
		throw new Error("Subclasses must implement _parseMappings");
	};
	SourceMapConsumer.GENERATED_ORDER = 1;
	SourceMapConsumer.ORIGINAL_ORDER = 2;
	SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
	SourceMapConsumer.LEAST_UPPER_BOUND = 2;
	/**
	* Iterate over each mapping between an original source/line/column and a
	* generated line/column in this source map.
	*
	* @param Function aCallback
	*        The function that is called with each mapping.
	* @param Object aContext
	*        Optional. If specified, this object will be the value of `this` every
	*        time that `aCallback` is called.
	* @param aOrder
	*        Either `SourceMapConsumer.GENERATED_ORDER` or
	*        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
	*        iterate over the mappings sorted by the generated file's line/column
	*        order or the original's source/line/column order, respectively. Defaults to
	*        `SourceMapConsumer.GENERATED_ORDER`.
	*/
	SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
		var context = aContext || null;
		var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
		var mappings;
		switch (order) {
			case SourceMapConsumer.GENERATED_ORDER:
				mappings = this._generatedMappings;
				break;
			case SourceMapConsumer.ORIGINAL_ORDER:
				mappings = this._originalMappings;
				break;
			default: throw new Error("Unknown order of iteration.");
		}
		var sourceRoot = this.sourceRoot;
		var boundCallback = aCallback.bind(context);
		var names = this._names;
		var sources = this._sources;
		var sourceMapURL = this._sourceMapURL;
		for (var i = 0, n = mappings.length; i < n; i++) {
			var mapping = mappings[i];
			var source = mapping.source === null ? null : sources.at(mapping.source);
			if (source !== null) source = util.computeSourceURL(sourceRoot, source, sourceMapURL);
			boundCallback({
				source,
				generatedLine: mapping.generatedLine,
				generatedColumn: mapping.generatedColumn,
				originalLine: mapping.originalLine,
				originalColumn: mapping.originalColumn,
				name: mapping.name === null ? null : names.at(mapping.name)
			});
		}
	};
	/**
	* Returns all generated line and column information for the original source,
	* line, and column provided. If no column is provided, returns all mappings
	* corresponding to a either the line we are searching for or the next
	* closest line that has any mappings. Otherwise, returns all mappings
	* corresponding to the given line and either the column we are searching for
	* or the next closest column that has any offsets.
	*
	* The only argument is an object with the following properties:
	*
	*   - source: The filename of the original source.
	*   - line: The line number in the original source.  The line number is 1-based.
	*   - column: Optional. the column number in the original source.
	*    The column number is 0-based.
	*
	* and an array of objects is returned, each with the following properties:
	*
	*   - line: The line number in the generated source, or null.  The
	*    line number is 1-based.
	*   - column: The column number in the generated source, or null.
	*    The column number is 0-based.
	*/
	SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
		var line = util.getArg(aArgs, "line");
		var needle = {
			source: util.getArg(aArgs, "source"),
			originalLine: line,
			originalColumn: util.getArg(aArgs, "column", 0)
		};
		needle.source = this._findSourceIndex(needle.source);
		if (needle.source < 0) return [];
		var mappings = [];
		var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
		if (index >= 0) {
			var mapping = this._originalMappings[index];
			if (aArgs.column === void 0) {
				var originalLine = mapping.originalLine;
				while (mapping && mapping.originalLine === originalLine) {
					mappings.push({
						line: util.getArg(mapping, "generatedLine", null),
						column: util.getArg(mapping, "generatedColumn", null),
						lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
					});
					mapping = this._originalMappings[++index];
				}
			} else {
				var originalColumn = mapping.originalColumn;
				while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
					mappings.push({
						line: util.getArg(mapping, "generatedLine", null),
						column: util.getArg(mapping, "generatedColumn", null),
						lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
					});
					mapping = this._originalMappings[++index];
				}
			}
		}
		return mappings;
	};
	exports.SourceMapConsumer = SourceMapConsumer;
	/**
	* A BasicSourceMapConsumer instance represents a parsed source map which we can
	* query for information about the original file positions by giving it a file
	* position in the generated source.
	*
	* The first parameter is the raw source map (either as a JSON string, or
	* already parsed to an object). According to the spec, source maps have the
	* following attributes:
	*
	*   - version: Which version of the source map spec this map is following.
	*   - sources: An array of URLs to the original source files.
	*   - names: An array of identifiers which can be referrenced by individual mappings.
	*   - sourceRoot: Optional. The URL root from which all sources are relative.
	*   - sourcesContent: Optional. An array of contents of the original source files.
	*   - mappings: A string of base64 VLQs which contain the actual mappings.
	*   - file: Optional. The generated file this source map is associated with.
	*
	* Here is an example source map, taken from the source map spec[0]:
	*
	*     {
	*       version : 3,
	*       file: "out.js",
	*       sourceRoot : "",
	*       sources: ["foo.js", "bar.js"],
	*       names: ["src", "maps", "are", "fun"],
	*       mappings: "AA,AB;;ABCDE;"
	*     }
	*
	* The second parameter, if given, is a string whose value is the URL
	* at which the source map was found.  This URL is used to compute the
	* sources array.
	*
	* [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
	*/
	function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
		var sourceMap = aSourceMap;
		if (typeof aSourceMap === "string") sourceMap = util.parseSourceMapInput(aSourceMap);
		var version = util.getArg(sourceMap, "version");
		var sources = util.getArg(sourceMap, "sources");
		var names = util.getArg(sourceMap, "names", []);
		var sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
		var sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
		var mappings = util.getArg(sourceMap, "mappings");
		var file = util.getArg(sourceMap, "file", null);
		if (version != this._version) throw new Error("Unsupported version: " + version);
		if (sourceRoot) sourceRoot = util.normalize(sourceRoot);
		sources = sources.map(String).map(util.normalize).map(function(source) {
			return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
		});
		this._names = ArraySet.fromArray(names.map(String), true);
		this._sources = ArraySet.fromArray(sources, true);
		this._absoluteSources = this._sources.toArray().map(function(s) {
			return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
		});
		this.sourceRoot = sourceRoot;
		this.sourcesContent = sourcesContent;
		this._mappings = mappings;
		this._sourceMapURL = aSourceMapURL;
		this.file = file;
	}
	BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
	/**
	* Utility function to find the index of a source.  Returns -1 if not
	* found.
	*/
	BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
		var relativeSource = aSource;
		if (this.sourceRoot != null) relativeSource = util.relative(this.sourceRoot, relativeSource);
		if (this._sources.has(relativeSource)) return this._sources.indexOf(relativeSource);
		var i = 0;
		for (; i < this._absoluteSources.length; ++i) if (this._absoluteSources[i] == aSource) return i;
		return -1;
	};
	/**
	* Create a BasicSourceMapConsumer from a SourceMapGenerator.
	*
	* @param SourceMapGenerator aSourceMap
	*        The source map that will be consumed.
	* @param String aSourceMapURL
	*        The URL at which the source map can be found (optional)
	* @returns BasicSourceMapConsumer
	*/
	BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
		var smc = Object.create(BasicSourceMapConsumer.prototype);
		var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
		var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
		smc.sourceRoot = aSourceMap._sourceRoot;
		smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
		smc.file = aSourceMap._file;
		smc._sourceMapURL = aSourceMapURL;
		smc._absoluteSources = smc._sources.toArray().map(function(s) {
			return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
		});
		var generatedMappings = aSourceMap._mappings.toArray().slice();
		var destGeneratedMappings = smc.__generatedMappings = [];
		var destOriginalMappings = smc.__originalMappings = [];
		for (var i = 0, length = generatedMappings.length; i < length; i++) {
			var srcMapping = generatedMappings[i];
			var destMapping = new Mapping();
			destMapping.generatedLine = srcMapping.generatedLine;
			destMapping.generatedColumn = srcMapping.generatedColumn;
			if (srcMapping.source) {
				destMapping.source = sources.indexOf(srcMapping.source);
				destMapping.originalLine = srcMapping.originalLine;
				destMapping.originalColumn = srcMapping.originalColumn;
				if (srcMapping.name) destMapping.name = names.indexOf(srcMapping.name);
				destOriginalMappings.push(destMapping);
			}
			destGeneratedMappings.push(destMapping);
		}
		quickSort(smc.__originalMappings, util.compareByOriginalPositions);
		return smc;
	};
	/**
	* The version of the source mapping spec that we are consuming.
	*/
	BasicSourceMapConsumer.prototype._version = 3;
	/**
	* The list of original sources.
	*/
	Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", { get: function() {
		return this._absoluteSources.slice();
	} });
	/**
	* Provide the JIT with a nice shape / hidden class.
	*/
	function Mapping() {
		this.generatedLine = 0;
		this.generatedColumn = 0;
		this.source = null;
		this.originalLine = null;
		this.originalColumn = null;
		this.name = null;
	}
	/**
	* Parse the mappings in a string in to a data structure which we can easily
	* query (the ordered arrays in the `this.__generatedMappings` and
	* `this.__originalMappings` properties).
	*/
	const compareGenerated = util.compareByGeneratedPositionsDeflatedNoLine;
	function sortGenerated(array, start) {
		let l = array.length;
		let n = array.length - start;
		if (n <= 1) return;
		else if (n == 2) {
			let a = array[start];
			let b = array[start + 1];
			if (compareGenerated(a, b) > 0) {
				array[start] = b;
				array[start + 1] = a;
			}
		} else if (n < 20) for (let i = start; i < l; i++) for (let j = i; j > start; j--) {
			let a = array[j - 1];
			let b = array[j];
			if (compareGenerated(a, b) <= 0) break;
			array[j - 1] = b;
			array[j] = a;
		}
		else quickSort(array, compareGenerated, start);
	}
	BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
		var generatedLine = 1;
		var previousGeneratedColumn = 0;
		var previousOriginalLine = 0;
		var previousOriginalColumn = 0;
		var previousSource = 0;
		var previousName = 0;
		var length = aStr.length;
		var index = 0;
		var temp = {};
		var originalMappings = [];
		var generatedMappings = [], mapping, segment, end, value;
		let subarrayStart = 0;
		while (index < length) if (aStr.charAt(index) === ";") {
			generatedLine++;
			index++;
			previousGeneratedColumn = 0;
			sortGenerated(generatedMappings, subarrayStart);
			subarrayStart = generatedMappings.length;
		} else if (aStr.charAt(index) === ",") index++;
		else {
			mapping = new Mapping();
			mapping.generatedLine = generatedLine;
			for (end = index; end < length; end++) if (this._charIsMappingSeparator(aStr, end)) break;
			aStr.slice(index, end);
			segment = [];
			while (index < end) {
				base64VLQ.decode(aStr, index, temp);
				value = temp.value;
				index = temp.rest;
				segment.push(value);
			}
			if (segment.length === 2) throw new Error("Found a source, but no line and column");
			if (segment.length === 3) throw new Error("Found a source and line, but no column");
			mapping.generatedColumn = previousGeneratedColumn + segment[0];
			previousGeneratedColumn = mapping.generatedColumn;
			if (segment.length > 1) {
				mapping.source = previousSource + segment[1];
				previousSource += segment[1];
				mapping.originalLine = previousOriginalLine + segment[2];
				previousOriginalLine = mapping.originalLine;
				mapping.originalLine += 1;
				mapping.originalColumn = previousOriginalColumn + segment[3];
				previousOriginalColumn = mapping.originalColumn;
				if (segment.length > 4) {
					mapping.name = previousName + segment[4];
					previousName += segment[4];
				}
			}
			generatedMappings.push(mapping);
			if (typeof mapping.originalLine === "number") {
				let currentSource = mapping.source;
				while (originalMappings.length <= currentSource) originalMappings.push(null);
				if (originalMappings[currentSource] === null) originalMappings[currentSource] = [];
				originalMappings[currentSource].push(mapping);
			}
		}
		sortGenerated(generatedMappings, subarrayStart);
		this.__generatedMappings = generatedMappings;
		for (var i = 0; i < originalMappings.length; i++) if (originalMappings[i] != null) quickSort(originalMappings[i], util.compareByOriginalPositionsNoSource);
		this.__originalMappings = [].concat(...originalMappings);
	};
	/**
	* Find the mapping that best matches the hypothetical "needle" mapping that
	* we are searching for in the given "haystack" of mappings.
	*/
	BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
		if (aNeedle[aLineName] <= 0) throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
		if (aNeedle[aColumnName] < 0) throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
		return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
	};
	/**
	* Compute the last column for each generated mapping. The last column is
	* inclusive.
	*/
	BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
		for (var index = 0; index < this._generatedMappings.length; ++index) {
			var mapping = this._generatedMappings[index];
			if (index + 1 < this._generatedMappings.length) {
				var nextMapping = this._generatedMappings[index + 1];
				if (mapping.generatedLine === nextMapping.generatedLine) {
					mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
					continue;
				}
			}
			mapping.lastGeneratedColumn = Infinity;
		}
	};
	/**
	* Returns the original source, line, and column information for the generated
	* source's line and column positions provided. The only argument is an object
	* with the following properties:
	*
	*   - line: The line number in the generated source.  The line number
	*     is 1-based.
	*   - column: The column number in the generated source.  The column
	*     number is 0-based.
	*   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	*     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	*     closest element that is smaller than or greater than the one we are
	*     searching for, respectively, if the exact element cannot be found.
	*     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	*
	* and an object is returned with the following properties:
	*
	*   - source: The original source file, or null.
	*   - line: The line number in the original source, or null.  The
	*     line number is 1-based.
	*   - column: The column number in the original source, or null.  The
	*     column number is 0-based.
	*   - name: The original identifier, or null.
	*/
	BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
		var needle = {
			generatedLine: util.getArg(aArgs, "line"),
			generatedColumn: util.getArg(aArgs, "column")
		};
		var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositionsDeflated, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
		if (index >= 0) {
			var mapping = this._generatedMappings[index];
			if (mapping.generatedLine === needle.generatedLine) {
				var source = util.getArg(mapping, "source", null);
				if (source !== null) {
					source = this._sources.at(source);
					source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
				}
				var name = util.getArg(mapping, "name", null);
				if (name !== null) name = this._names.at(name);
				return {
					source,
					line: util.getArg(mapping, "originalLine", null),
					column: util.getArg(mapping, "originalColumn", null),
					name
				};
			}
		}
		return {
			source: null,
			line: null,
			column: null,
			name: null
		};
	};
	/**
	* Return true if we have the source content for every source in the source
	* map, false otherwise.
	*/
	BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
		if (!this.sourcesContent) return false;
		return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
			return sc == null;
		});
	};
	/**
	* Returns the original source content. The only argument is the url of the
	* original source file. Returns null if no original source content is
	* available.
	*/
	BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
		if (!this.sourcesContent) return null;
		var index = this._findSourceIndex(aSource);
		if (index >= 0) return this.sourcesContent[index];
		var relativeSource = aSource;
		if (this.sourceRoot != null) relativeSource = util.relative(this.sourceRoot, relativeSource);
		var url;
		if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
			var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
			if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
			if ((!url.path || url.path == "/") && this._sources.has("/" + relativeSource)) return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
		}
		if (nullOnMissing) return null;
		else throw new Error("\"" + relativeSource + "\" is not in the SourceMap.");
	};
	/**
	* Returns the generated line and column information for the original source,
	* line, and column positions provided. The only argument is an object with
	* the following properties:
	*
	*   - source: The filename of the original source.
	*   - line: The line number in the original source.  The line number
	*     is 1-based.
	*   - column: The column number in the original source.  The column
	*     number is 0-based.
	*   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	*     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	*     closest element that is smaller than or greater than the one we are
	*     searching for, respectively, if the exact element cannot be found.
	*     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	*
	* and an object is returned with the following properties:
	*
	*   - line: The line number in the generated source, or null.  The
	*     line number is 1-based.
	*   - column: The column number in the generated source, or null.
	*     The column number is 0-based.
	*/
	BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
		var source = util.getArg(aArgs, "source");
		source = this._findSourceIndex(source);
		if (source < 0) return {
			line: null,
			column: null,
			lastColumn: null
		};
		var needle = {
			source,
			originalLine: util.getArg(aArgs, "line"),
			originalColumn: util.getArg(aArgs, "column")
		};
		var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
		if (index >= 0) {
			var mapping = this._originalMappings[index];
			if (mapping.source === needle.source) return {
				line: util.getArg(mapping, "generatedLine", null),
				column: util.getArg(mapping, "generatedColumn", null),
				lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
			};
		}
		return {
			line: null,
			column: null,
			lastColumn: null
		};
	};
	exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
	/**
	* An IndexedSourceMapConsumer instance represents a parsed source map which
	* we can query for information. It differs from BasicSourceMapConsumer in
	* that it takes "indexed" source maps (i.e. ones with a "sections" field) as
	* input.
	*
	* The first parameter is a raw source map (either as a JSON string, or already
	* parsed to an object). According to the spec for indexed source maps, they
	* have the following attributes:
	*
	*   - version: Which version of the source map spec this map is following.
	*   - file: Optional. The generated file this source map is associated with.
	*   - sections: A list of section definitions.
	*
	* Each value under the "sections" field has two fields:
	*   - offset: The offset into the original specified at which this section
	*       begins to apply, defined as an object with a "line" and "column"
	*       field.
	*   - map: A source map definition. This source map could also be indexed,
	*       but doesn't have to be.
	*
	* Instead of the "map" field, it's also possible to have a "url" field
	* specifying a URL to retrieve a source map from, but that's currently
	* unsupported.
	*
	* Here's an example source map, taken from the source map spec[0], but
	* modified to omit a section which uses the "url" field.
	*
	*  {
	*    version : 3,
	*    file: "app.js",
	*    sections: [{
	*      offset: {line:100, column:10},
	*      map: {
	*        version : 3,
	*        file: "section.js",
	*        sources: ["foo.js", "bar.js"],
	*        names: ["src", "maps", "are", "fun"],
	*        mappings: "AAAA,E;;ABCDE;"
	*      }
	*    }],
	*  }
	*
	* The second parameter, if given, is a string whose value is the URL
	* at which the source map was found.  This URL is used to compute the
	* sources array.
	*
	* [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
	*/
	function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
		var sourceMap = aSourceMap;
		if (typeof aSourceMap === "string") sourceMap = util.parseSourceMapInput(aSourceMap);
		var version = util.getArg(sourceMap, "version");
		var sections = util.getArg(sourceMap, "sections");
		if (version != this._version) throw new Error("Unsupported version: " + version);
		this._sources = new ArraySet();
		this._names = new ArraySet();
		var lastOffset = {
			line: -1,
			column: 0
		};
		var maxOffsetLine = 0;
		this._sections = sections.map(function(s) {
			if (s.url) throw new Error("Support for url field in sections not implemented.");
			var offset = util.getArg(s, "offset");
			var offsetLine = util.getArg(offset, "line");
			var offsetColumn = util.getArg(offset, "column");
			if (!isValidOffset(offsetLine) || !isValidOffset(offsetColumn)) throw new Error("Section offset line and column must be non-negative integers.");
			if (offsetLine > MAX_SECTION_OFFSET_LINE) throw new Error("Section offset line must not exceed " + MAX_SECTION_OFFSET_LINE + ".");
			if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) throw new Error("Section offsets must be ordered and non-overlapping.");
			lastOffset = offset;
			var consumer = new SourceMapConsumer(util.getArg(s, "map"), aSourceMapURL);
			var totalOffsetLine = offsetLine + (consumer._maxOffsetLine || 0);
			if (totalOffsetLine > MAX_SECTION_OFFSET_LINE) throw new Error("Section offset line must not exceed " + MAX_SECTION_OFFSET_LINE + ", including offsets of nested sections.");
			if (totalOffsetLine > maxOffsetLine) maxOffsetLine = totalOffsetLine;
			return {
				generatedOffset: {
					generatedLine: offsetLine + 1,
					generatedColumn: offsetColumn + 1
				},
				consumer
			};
		});
		this._maxOffsetLine = maxOffsetLine;
	}
	/**
	* Section offsets come from untrusted input and are used as line/column
	* numbers, so only accept non-negative safe integers (rejects NaN, Infinity,
	* strings, fractions, etc).
	*/
	function isValidOffset(aValue) {
		return typeof aValue === "number" && aValue >= 0 && aValue <= 9007199254740991 && Math.floor(aValue) === aValue;
	}
	IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
	/**
	* The version of the source mapping spec that we are consuming.
	*/
	IndexedSourceMapConsumer.prototype._version = 3;
	/**
	* The list of original sources.
	*/
	Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", { get: function() {
		var sources = [];
		for (var i = 0; i < this._sections.length; i++) {
			var sectionSources = this._sections[i].consumer.sources;
			for (var j = 0; j < sectionSources.length; j++) sources.push(sectionSources[j]);
		}
		return sources;
	} });
	/**
	* Returns the original source, line, and column information for the generated
	* source's line and column positions provided. The only argument is an object
	* with the following properties:
	*
	*   - line: The line number in the generated source.  The line number
	*     is 1-based.
	*   - column: The column number in the generated source.  The column
	*     number is 0-based.
	*
	* and an object is returned with the following properties:
	*
	*   - source: The original source file, or null.
	*   - line: The line number in the original source, or null.  The
	*     line number is 1-based.
	*   - column: The column number in the original source, or null.  The
	*     column number is 0-based.
	*   - name: The original identifier, or null.
	*/
	IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
		var needle = {
			generatedLine: util.getArg(aArgs, "line"),
			generatedColumn: util.getArg(aArgs, "column")
		};
		var sectionIndex = binarySearch.search(needle, this._sections, function(needle, section) {
			var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
			if (cmp) return cmp;
			return needle.generatedColumn - section.generatedOffset.generatedColumn;
		});
		var section = this._sections[sectionIndex];
		if (!section) return {
			source: null,
			line: null,
			column: null,
			name: null
		};
		return section.consumer.originalPositionFor({
			line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
			column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
			bias: aArgs.bias
		});
	};
	/**
	* Return true if we have the source content for every source in the source
	* map, false otherwise.
	*/
	IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
		return this._sections.every(function(s) {
			return s.consumer.hasContentsOfAllSources();
		});
	};
	/**
	* Returns the original source content. The only argument is the url of the
	* original source file. Returns null if no original source content is
	* available.
	*/
	IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
		for (var i = 0; i < this._sections.length; i++) {
			var content = this._sections[i].consumer.sourceContentFor(aSource, true);
			if (content || content === "") return content;
		}
		if (nullOnMissing) return null;
		else throw new Error("\"" + aSource + "\" is not in the SourceMap.");
	};
	/**
	* Returns the generated line and column information for the original source,
	* line, and column positions provided. The only argument is an object with
	* the following properties:
	*
	*   - source: The filename of the original source.
	*   - line: The line number in the original source.  The line number
	*     is 1-based.
	*   - column: The column number in the original source.  The column
	*     number is 0-based.
	*
	* and an object is returned with the following properties:
	*
	*   - line: The line number in the generated source, or null.  The
	*     line number is 1-based. 
	*   - column: The column number in the generated source, or null.
	*     The column number is 0-based.
	*/
	IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
		for (var i = 0; i < this._sections.length; i++) {
			var section = this._sections[i];
			if (section.consumer._findSourceIndex(util.getArg(aArgs, "source")) === -1) continue;
			var generatedPosition = section.consumer.generatedPositionFor(aArgs);
			if (generatedPosition) return {
				line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
				column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
			};
		}
		return {
			line: null,
			column: null
		};
	};
	/**
	* Parse the mappings in a string in to a data structure which we can easily
	* query (the ordered arrays in the `this.__generatedMappings` and
	* `this.__originalMappings` properties).
	*/
	IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
		this.__generatedMappings = [];
		this.__originalMappings = [];
		for (var i = 0; i < this._sections.length; i++) {
			var section = this._sections[i];
			var sectionMappings = section.consumer._generatedMappings;
			for (var j = 0; j < sectionMappings.length; j++) {
				var mapping = sectionMappings[j];
				var source = section.consumer._sources.at(mapping.source);
				if (source !== null) source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
				this._sources.add(source);
				source = this._sources.indexOf(source);
				var name = null;
				if (mapping.name) {
					name = section.consumer._names.at(mapping.name);
					this._names.add(name);
					name = this._names.indexOf(name);
				}
				var adjustedMapping = {
					source,
					generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
					generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
					originalLine: mapping.originalLine,
					originalColumn: mapping.originalColumn,
					name
				};
				this.__generatedMappings.push(adjustedMapping);
				if (typeof adjustedMapping.originalLine === "number") this.__originalMappings.push(adjustedMapping);
			}
		}
		quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
		quickSort(this.__originalMappings, util.compareByOriginalPositions);
	};
	exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/lib/source-node.js
var require_source_node = /* @__PURE__ */ __commonJSMin(((exports) => {
	var SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
	var util = require_util();
	var REGEX_NEWLINE = /(\r?\n)/;
	var NEWLINE_CODE = 10;
	var isSourceNode = "$$$isSourceNode$$$";
	/**
	* SourceNodes provide a way to abstract over interpolating/concatenating
	* snippets of generated JavaScript source code while maintaining the line and
	* column information associated with the original source code.
	*
	* @param aLine The original line number.
	* @param aColumn The original column number.
	* @param aSource The original source's filename.
	* @param aChunks Optional. An array of strings which are snippets of
	*        generated JS, or other SourceNodes.
	* @param aName The original identifier.
	*/
	function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
		this.children = [];
		this.sourceContents = {};
		this.line = aLine == null ? null : aLine;
		this.column = aColumn == null ? null : aColumn;
		this.source = aSource == null ? null : aSource;
		this.name = aName == null ? null : aName;
		this[isSourceNode] = true;
		if (aChunks != null) this.add(aChunks);
	}
	/**
	* Creates a SourceNode from generated code and a SourceMapConsumer.
	*
	* @param aGeneratedCode The generated code
	* @param aSourceMapConsumer The SourceMap for the generated code
	* @param aRelativePath Optional. The path that relative sources in the
	*        SourceMapConsumer should be relative to.
	*/
	SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
		var node = new SourceNode();
		var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
		var remainingLinesIndex = 0;
		var shiftNextLine = function() {
			return getNextLine() + (getNextLine() || "");
			function getNextLine() {
				return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : void 0;
			}
		};
		var lastGeneratedLine = 1, lastGeneratedColumn = 0;
		var lastMapping = null;
		aSourceMapConsumer.eachMapping(function(mapping) {
			if (lastMapping !== null) {
				if (lastGeneratedLine < mapping.generatedLine) {
					addMappingWithCode(lastMapping, shiftNextLine());
					lastGeneratedLine++;
					lastGeneratedColumn = 0;
				} else {
					var nextLine = remainingLines[remainingLinesIndex] || "";
					var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
					remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
					lastGeneratedColumn = mapping.generatedColumn;
					addMappingWithCode(lastMapping, code);
					lastMapping = mapping;
					return;
				}
			}
			while (lastGeneratedLine < mapping.generatedLine) {
				if (remainingLinesIndex >= remainingLines.length) {
					lastGeneratedLine = mapping.generatedLine;
					break;
				}
				node.add(shiftNextLine());
				lastGeneratedLine++;
			}
			if (lastGeneratedColumn < mapping.generatedColumn) {
				var nextLine = remainingLines[remainingLinesIndex] || "";
				node.add(nextLine.substr(0, mapping.generatedColumn));
				remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
				lastGeneratedColumn = mapping.generatedColumn;
			}
			lastMapping = mapping;
		}, this);
		if (remainingLinesIndex < remainingLines.length) {
			if (lastMapping) addMappingWithCode(lastMapping, shiftNextLine());
			node.add(remainingLines.splice(remainingLinesIndex).join(""));
		}
		aSourceMapConsumer.sources.forEach(function(sourceFile) {
			var content = aSourceMapConsumer.sourceContentFor(sourceFile);
			if (content != null) {
				if (aRelativePath != null) sourceFile = util.join(aRelativePath, sourceFile);
				node.setSourceContent(sourceFile, content);
			}
		});
		return node;
		function addMappingWithCode(mapping, code) {
			if (mapping === null || mapping.source === void 0) node.add(code);
			else {
				var source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
				node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
			}
		}
	};
	/**
	* Add a chunk of generated JS to this source node.
	*
	* @param aChunk A string snippet of generated JS code, another instance of
	*        SourceNode, or an array where each member is one of those things.
	*/
	SourceNode.prototype.add = function SourceNode_add(aChunk) {
		if (Array.isArray(aChunk)) aChunk.forEach(function(chunk) {
			this.add(chunk);
		}, this);
		else if (aChunk[isSourceNode] || typeof aChunk === "string") {
			if (aChunk) this.children.push(aChunk);
		} else throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
		return this;
	};
	/**
	* Add a chunk of generated JS to the beginning of this source node.
	*
	* @param aChunk A string snippet of generated JS code, another instance of
	*        SourceNode, or an array where each member is one of those things.
	*/
	SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
		if (Array.isArray(aChunk)) for (var i = aChunk.length - 1; i >= 0; i--) this.prepend(aChunk[i]);
		else if (aChunk[isSourceNode] || typeof aChunk === "string") this.children.unshift(aChunk);
		else throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
		return this;
	};
	/**
	* Walk over the tree of JS snippets in this node and its children. The
	* walking function is called once for each snippet of JS and is passed that
	* snippet and the its original associated source's line/column location.
	*
	* @param aFn The traversal function.
	*/
	SourceNode.prototype.walk = function SourceNode_walk(aFn) {
		var chunk;
		for (var i = 0, len = this.children.length; i < len; i++) {
			chunk = this.children[i];
			if (chunk[isSourceNode]) chunk.walk(aFn);
			else if (chunk !== "") aFn(chunk, {
				source: this.source,
				line: this.line,
				column: this.column,
				name: this.name
			});
		}
	};
	/**
	* Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
	* each of `this.children`.
	*
	* @param aSep The separator.
	*/
	SourceNode.prototype.join = function SourceNode_join(aSep) {
		var newChildren;
		var i;
		var len = this.children.length;
		if (len > 0) {
			newChildren = [];
			for (i = 0; i < len - 1; i++) {
				newChildren.push(this.children[i]);
				newChildren.push(aSep);
			}
			newChildren.push(this.children[i]);
			this.children = newChildren;
		}
		return this;
	};
	/**
	* Call String.prototype.replace on the very right-most source snippet. Useful
	* for trimming whitespace from the end of a source node, etc.
	*
	* @param aPattern The pattern to replace.
	* @param aReplacement The thing to replace the pattern with.
	*/
	SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
		var lastChild = this.children[this.children.length - 1];
		if (lastChild[isSourceNode]) lastChild.replaceRight(aPattern, aReplacement);
		else if (typeof lastChild === "string") this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
		else this.children.push("".replace(aPattern, aReplacement));
		return this;
	};
	/**
	* Set the source content for a source file. This will be added to the SourceMapGenerator
	* in the sourcesContent field.
	*
	* @param aSourceFile The filename of the source file
	* @param aSourceContent The content of the source file
	*/
	SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
		this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
	};
	/**
	* Walk over the tree of SourceNodes. The walking function is called for each
	* source file content and is passed the filename and source content.
	*
	* @param aFn The traversal function.
	*/
	SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
		for (var i = 0, len = this.children.length; i < len; i++) if (this.children[i][isSourceNode]) this.children[i].walkSourceContents(aFn);
		var sources = Object.keys(this.sourceContents);
		for (var i = 0, len = sources.length; i < len; i++) aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
	};
	/**
	* Return the string representation of this source node. Walks over the tree
	* and concatenates all the various snippets together to one string.
	*/
	SourceNode.prototype.toString = function SourceNode_toString() {
		var str = "";
		this.walk(function(chunk) {
			str += chunk;
		});
		return str;
	};
	/**
	* Returns the string representation of this source node along with a source
	* map.
	*/
	SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
		var generated = {
			code: "",
			line: 1,
			column: 0
		};
		var map = new SourceMapGenerator(aArgs);
		var sourceMappingActive = false;
		var lastOriginalSource = null;
		var lastOriginalLine = null;
		var lastOriginalColumn = null;
		var lastOriginalName = null;
		this.walk(function(chunk, original) {
			generated.code += chunk;
			if (original.source !== null && original.line !== null && original.column !== null) {
				if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) map.addMapping({
					source: original.source,
					original: {
						line: original.line,
						column: original.column
					},
					generated: {
						line: generated.line,
						column: generated.column
					},
					name: original.name
				});
				lastOriginalSource = original.source;
				lastOriginalLine = original.line;
				lastOriginalColumn = original.column;
				lastOriginalName = original.name;
				sourceMappingActive = true;
			} else if (sourceMappingActive) {
				map.addMapping({ generated: {
					line: generated.line,
					column: generated.column
				} });
				lastOriginalSource = null;
				sourceMappingActive = false;
			}
			for (var idx = 0, length = chunk.length; idx < length; idx++) if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
				generated.line++;
				generated.column = 0;
				if (idx + 1 === length) {
					lastOriginalSource = null;
					sourceMappingActive = false;
				} else if (sourceMappingActive) map.addMapping({
					source: original.source,
					original: {
						line: original.line,
						column: original.column
					},
					generated: {
						line: generated.line,
						column: generated.column
					},
					name: original.name
				});
			} else generated.column++;
		});
		this.walkSourceContents(function(sourceFile, sourceContent) {
			map.setSourceContent(sourceFile, sourceContent);
		});
		return {
			code: generated.code,
			map
		};
	};
	exports.SourceNode = SourceNode;
}));
//#endregion
//#region node_modules/.pnpm/source-map-js@1.2.2/node_modules/source-map-js/source-map.js
var require_source_map = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
	exports.SourceMapConsumer = require_source_map_consumer().SourceMapConsumer;
	exports.SourceNode = require_source_node().SourceNode;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/previous-map.js
var require_previous_map = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let { existsSync, readFileSync, realpathSync } = __require("fs");
	let { dirname: dirname$1, isAbsolute: isAbsolute$1, join, relative: relative$1, sep: sep$1 } = __require("path");
	let { SourceMapConsumer, SourceMapGenerator } = require_source_map();
	function realPath(path) {
		try {
			return realpathSync(path);
		} catch {
			return path;
		}
	}
	function fromBase64(str) {
		if (Buffer) return Buffer.from(str, "base64").toString();
		else
 /* c8 ignore next 2 */
		return window.atob(str);
	}
	var PreviousMap = class {
		constructor(css, opts) {
			if (opts.map === false) return;
			if (opts.unsafeMap) this.unsafeMap = true;
			this.loadAnnotation(css);
			this.inline = this.startWith(this.annotation, "data:");
			let prev = opts.map ? opts.map.prev : void 0;
			let text = this.loadMap(opts.from, prev);
			if (!this.mapFile && opts.from) this.mapFile = opts.from;
			if (this.mapFile) this.root = dirname$1(this.mapFile);
			if (text) this.text = text;
		}
		consumer() {
			if (!this.consumerCache) this.consumerCache = new SourceMapConsumer(this.json || this.text);
			return this.consumerCache;
		}
		decodeInline(text) {
			let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
			let baseUri = /^data:application\/json;base64,/;
			let uriMatch = text.match(/^data:application\/json;charset=utf-?8,/) || text.match(/^data:application\/json,/);
			if (uriMatch) return decodeURIComponent(text.substr(uriMatch[0].length));
			let baseUriMatch = text.match(baseCharsetUri) || text.match(baseUri);
			if (baseUriMatch) return fromBase64(text.substr(baseUriMatch[0].length));
			let encoding = text.slice(22);
			encoding = encoding.slice(0, encoding.indexOf(","));
			throw new Error("Unsupported source map encoding " + encoding);
		}
		getAnnotationURL(sourceMapString) {
			return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
		}
		isMap(map) {
			if (typeof map !== "object") return false;
			return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
		}
		loadAnnotation(css) {
			let comments = css.match(/\/\*\s*# sourceMappingURL=/g);
			if (!comments) return;
			let start = css.lastIndexOf(comments.pop());
			let end = css.indexOf("*/", start);
			if (start > -1 && end > -1) this.annotation = this.getAnnotationURL(css.substring(start, end));
		}
		loadFile(path, cssFile, trusted) {
			if (!trusted && !this.unsafeMap) {
				if (!/\.map$/i.test(path)) return void 0;
				if (!cssFile) return void 0;
				let rel = relative$1(realPath(dirname$1(cssFile)), realPath(path));
				if (rel === ".." || rel.startsWith(".." + sep$1) || isAbsolute$1(rel)) return;
			}
			this.root = dirname$1(path);
			if (existsSync(path)) {
				this.mapFile = path;
				return readFileSync(path, "utf-8").toString().trim();
			}
		}
		loadMap(file, prev) {
			if (prev === false) return false;
			if (prev) {
				if (typeof prev === "string") return prev;
				else if (typeof prev === "function") {
					let prevPath = prev(file);
					if (prevPath) {
						let map = this.loadFile(prevPath, file, true);
						if (!map) throw new Error("Unable to load previous source map: " + prevPath.toString());
						return map;
					}
				} else if (prev instanceof SourceMapConsumer) return SourceMapGenerator.fromSourceMap(prev).toString();
				else if (prev instanceof SourceMapGenerator) return prev.toString();
				else if (this.isMap(prev)) return JSON.stringify(prev);
				else throw new Error("Unsupported previous source map format: " + prev.toString());
			} else if (this.inline) return this.decodeInline(this.annotation);
			else if (this.annotation) {
				let map = this.annotation;
				if (file) map = join(dirname$1(file), map);
				let unknown = this.loadFile(map, file, false);
				if (unknown) try {
					/* c8 ignore next 4 */
					this.json = JSON.parse(unknown.replace(/^\)]}'[^\n]*\n/, ""));
				} catch {
					return;
				}
				return unknown;
			}
		}
		startWith(string, start) {
			if (!string) return false;
			return string.substr(0, start.length) === start;
		}
		withContent() {
			return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
		}
	};
	module.exports = PreviousMap;
	PreviousMap.default = PreviousMap;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/input.js
var require_input = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let { nanoid } = require_non_secure();
	let { isAbsolute, resolve: resolve$1 } = __require("path");
	let { SourceMapConsumer, SourceMapGenerator } = require_source_map();
	let { fileURLToPath: fileURLToPath$1, pathToFileURL: pathToFileURL$1 } = __require("url");
	let CssSyntaxError = require_css_syntax_error();
	let PreviousMap = require_previous_map();
	let terminalHighlight = require_terminal_highlight();
	let lineToIndexCache = Symbol("lineToIndexCache");
	let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
	let pathAvailable = Boolean(resolve$1 && isAbsolute);
	function getLineToIndex(input) {
		if (input[lineToIndexCache]) return input[lineToIndexCache];
		let lines = input.css.split("\n");
		let lineToIndex = new Array(lines.length);
		let prevIndex = 0;
		for (let i = 0, l = lines.length; i < l; i++) {
			lineToIndex[i] = prevIndex;
			prevIndex += lines[i].length + 1;
		}
		input[lineToIndexCache] = lineToIndex;
		return lineToIndex;
	}
	var Input = class {
		get from() {
			return this.file || this.id;
		}
		constructor(css, opts = {}) {
			if (css === null || typeof css === "undefined" || typeof css === "object" && !css.toString) throw new Error(`PostCSS received ${css} instead of CSS string`);
			this.css = css.toString();
			if (this.css[0] === "﻿" || this.css[0] === "￾") {
				this.hasBOM = true;
				this.css = this.css.slice(1);
			} else this.hasBOM = false;
			this.document = this.css;
			if (opts.document) this.document = opts.document.toString();
			if (opts.from) {
				if (!pathAvailable || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) this.file = opts.from;
				else this.file = resolve$1(opts.from);
			}
			if (pathAvailable && sourceMapAvailable) {
				let map = new PreviousMap(this.css, opts);
				if (map.text) {
					this.map = map;
					let file = map.consumer().file;
					if (!this.file && file) this.file = this.mapResolve(file);
				}
			}
			if (!this.file) this.id = "<input css " + nanoid(6) + ">";
			if (this.map) this.map.file = this.from;
		}
		error(message, line, column, opts = {}) {
			let endColumn, endLine, endOffset, offset, result;
			if (line && typeof line === "object") {
				let start = line;
				let end = column;
				if (typeof start.offset === "number") {
					offset = start.offset;
					let pos = this.fromOffset(offset);
					line = pos.line;
					column = pos.col;
				} else {
					line = start.line;
					column = start.column;
					offset = this.fromLineAndColumn(line, column);
				}
				if (typeof end.offset === "number") {
					endOffset = end.offset;
					let pos = this.fromOffset(endOffset);
					endLine = pos.line;
					endColumn = pos.col;
				} else {
					endLine = end.line;
					endColumn = end.column;
					endOffset = this.fromLineAndColumn(end.line, end.column);
				}
			} else if (!column) {
				offset = line;
				let pos = this.fromOffset(offset);
				line = pos.line;
				column = pos.col;
			} else offset = this.fromLineAndColumn(line, column);
			let origin = this.origin(line, column, endLine, endColumn);
			if (origin) result = new CssSyntaxError(message, origin.endLine === void 0 ? origin.line : {
				column: origin.column,
				line: origin.line
			}, origin.endLine === void 0 ? origin.column : {
				column: origin.endColumn,
				line: origin.endLine
			}, origin.source, origin.file, opts.plugin);
			else result = new CssSyntaxError(message, endLine === void 0 ? line : {
				column,
				line
			}, endLine === void 0 ? column : {
				column: endColumn,
				line: endLine
			}, this.css, this.file, opts.plugin);
			result.input = {
				column,
				endColumn,
				endLine,
				endOffset,
				line,
				offset,
				source: this.css
			};
			if (this.file) {
				if (pathToFileURL$1) result.input.url = pathToFileURL$1(this.file).toString();
				result.input.file = this.file;
			}
			return result;
		}
		fromLineAndColumn(line, column) {
			return getLineToIndex(this)[line - 1] + column - 1;
		}
		fromOffset(offset) {
			let lineToIndex = getLineToIndex(this);
			let lastLine = lineToIndex[lineToIndex.length - 1];
			let min = 0;
			if (offset >= lastLine) min = lineToIndex.length - 1;
			else {
				let max = lineToIndex.length - 2;
				let mid;
				while (min < max) {
					mid = min + (max - min >> 1);
					if (offset < lineToIndex[mid]) max = mid - 1;
					else if (offset >= lineToIndex[mid + 1]) min = mid + 1;
					else {
						min = mid;
						break;
					}
				}
			}
			return {
				col: offset - lineToIndex[min] + 1,
				line: min + 1
			};
		}
		mapResolve(file) {
			if (/^\w+:\/\//.test(file)) return file;
			return resolve$1(this.map.consumer().sourceRoot || this.map.root || ".", file);
		}
		origin(line, column, endLine, endColumn) {
			if (!this.map) return false;
			let consumer = this.map.consumer();
			let from = consumer.originalPositionFor({
				column: column - 1,
				line
			});
			if (!from.source) return false;
			let to;
			if (typeof endLine === "number") {
				let toPosition = consumer.originalPositionFor({
					column: endColumn - 1,
					line: endLine
				});
				if (toPosition.source) to = toPosition;
			}
			let fromUrl;
			if (isAbsolute(from.source)) fromUrl = pathToFileURL$1(from.source);
			else fromUrl = new URL(from.source, this.map.consumer().sourceRoot || pathToFileURL$1(this.map.mapFile));
			let result = {
				column: from.column + 1,
				endColumn: to && to.column + 1,
				endLine: to && to.line,
				line: from.line,
				url: fromUrl.toString()
			};
			if (fromUrl.protocol === "file:") {
				if (fileURLToPath$1) result.file = fileURLToPath$1(fromUrl);
				else
 /* c8 ignore next 2 */
				throw new Error(`file: protocol is not available in this PostCSS build`);
			}
			let source = consumer.sourceContentFor(from.source);
			if (source) result.source = source;
			return result;
		}
		toJSON() {
			let json = {};
			for (let name of [
				"hasBOM",
				"css",
				"file",
				"id"
			]) if (this[name] != null) json[name] = this[name];
			if (this.map) {
				json.map = { ...this.map };
				if (json.map.consumerCache) json.map.consumerCache = void 0;
			}
			return json;
		}
	};
	module.exports = Input;
	Input.default = Input;
	if (terminalHighlight && terminalHighlight.registerInput) terminalHighlight.registerInput(Input);
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/root.js
var require_root = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Container = require_container();
	let LazyResult;
	let Processor;
	var Root = class extends Container {
		constructor(defaults) {
			super(defaults);
			this.type = "root";
			if (!this.nodes) this.nodes = [];
		}
		normalize(child, sample, type) {
			let keepBefore = /* @__PURE__ */ new Set();
			for (let node of Array.isArray(child) ? child : [child]) if (node && typeof node === "object" && !node.parent && node.raws && typeof node.raws.before !== "undefined") keepBefore.add(node.raws);
			let nodes = super.normalize(child);
			if (sample) {
				if (type === "prepend") {
					if (this.nodes.length > 1) sample.raws.before = this.nodes[1].raws.before;
					else delete sample.raws.before;
				} else if (this.first !== sample) {
					for (let node of nodes) if (!keepBefore.has(node.raws)) node.raws.before = sample.raws.before;
				}
			}
			return nodes;
		}
		removeChild(child, ignore) {
			let index = this.index(child);
			if (!ignore && index === 0 && this.nodes.length > 1) this.nodes[1].raws.before = this.nodes[index].raws.before;
			return super.removeChild(child);
		}
		toResult(opts = {}) {
			return new LazyResult(new Processor(), this, opts).stringify();
		}
	};
	Root.registerLazyResult = (dependant) => {
		LazyResult = dependant;
	};
	Root.registerProcessor = (dependant) => {
		Processor = dependant;
	};
	module.exports = Root;
	Root.default = Root;
	Container.registerRoot(Root);
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/list.js
var require_list = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let list = {
		comma(string) {
			return list.split(string, [","], true);
		},
		space(string) {
			return list.split(string, [
				" ",
				"\n",
				"	"
			]);
		},
		split(string, separators, last) {
			if (typeof string !== "string") return [];
			let array = [];
			let current = "";
			let split = false;
			let func = 0;
			let inQuote = false;
			let prevQuote = "";
			let escape = false;
			for (let letter of string) {
				if (escape) escape = false;
				else if (letter === "\\") escape = true;
				else if (inQuote) {
					if (letter === prevQuote) inQuote = false;
				} else if (letter === "\"" || letter === "'") {
					inQuote = true;
					prevQuote = letter;
				} else if (letter === "(") func += 1;
				else if (letter === ")") {
					if (func > 0) func -= 1;
				} else if (func === 0) {
					if (separators.includes(letter)) split = true;
				}
				if (split) {
					let value = current.trim();
					if (last || value !== "") array.push(value);
					current = "";
					split = false;
				} else current += letter;
			}
			let value = current.trim();
			if (last || value !== "") array.push(value);
			return array;
		}
	};
	module.exports = list;
	list.default = list;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/rule.js
var require_rule = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Container = require_container();
	let list = require_list();
	var Rule = class extends Container {
		get selectors() {
			return list.comma(this.selector);
		}
		set selectors(values) {
			let match = this.selector ? this.selector.match(/,\s*/) : null;
			let sep = match ? match[0] : "," + this.raw("between", "beforeOpen");
			this.selector = values.join(sep);
		}
		constructor(defaults) {
			super(defaults);
			this.type = "rule";
			if (!this.nodes) this.nodes = [];
		}
	};
	module.exports = Rule;
	Rule.default = Rule;
	Container.registerRule(Rule);
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/fromJSON.js
var require_fromJSON = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let AtRule = require_at_rule();
	let Comment = require_comment();
	let Declaration = require_declaration();
	let Input = require_input();
	let PreviousMap = require_previous_map();
	let Root = require_root();
	let Rule = require_rule();
	function hydrateInputs(json, inputs) {
		if (!json.inputs) return inputs;
		return json.inputs.map((input) => {
			let inputHydrated = {
				...input,
				__proto__: Input.prototype
			};
			if (inputHydrated.map) inputHydrated.map = {
				...inputHydrated.map,
				__proto__: PreviousMap.prototype
			};
			return inputHydrated;
		});
	}
	function constructNode(json, inputs, children) {
		let defaults = { ...json };
		delete defaults.inputs;
		delete defaults.nodes;
		if (defaults.source) {
			let { inputId, ...source } = defaults.source;
			defaults.source = source;
			if (inputId != null) defaults.source.input = inputs[inputId];
		}
		let node;
		if (defaults.type === "root") node = new Root(defaults);
		else if (defaults.type === "decl") node = new Declaration(defaults);
		else if (defaults.type === "rule") node = new Rule(defaults);
		else if (defaults.type === "comment") node = new Comment(defaults);
		else if (defaults.type === "atrule") node = new AtRule(defaults);
		else throw new Error("Unknown node type: " + json.type);
		if (children) {
			node.nodes = children;
			for (let child of children) child.parent = node;
		}
		return node;
	}
	function fromJSON(json, inputs) {
		if (Array.isArray(json)) return json.map((n) => fromJSON(n));
		let result;
		let stack = [{
			childIndex: 0,
			children: [],
			inputs: hydrateInputs(json, inputs),
			json
		}];
		while (stack.length > 0) {
			let frame = stack[stack.length - 1];
			let jsonNodes = frame.json.nodes;
			if (jsonNodes && frame.childIndex < jsonNodes.length) {
				let childJson = jsonNodes[frame.childIndex];
				frame.childIndex += 1;
				stack.push({
					childIndex: 0,
					children: [],
					inputs: hydrateInputs(childJson, frame.inputs),
					json: childJson
				});
				continue;
			}
			stack.pop();
			let node = constructNode(frame.json, frame.inputs, jsonNodes ? frame.children : void 0);
			if (stack.length > 0) stack[stack.length - 1].children.push(node);
			else result = node;
		}
		return result;
	}
	module.exports = fromJSON;
	fromJSON.default = fromJSON;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/map-generator.js
var require_map_generator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let { dirname, relative, resolve, sep } = __require("path");
	let { SourceMapConsumer, SourceMapGenerator } = require_source_map();
	let { pathToFileURL } = __require("url");
	let Input = require_input();
	let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
	let pathAvailable = Boolean(dirname && resolve && relative && sep);
	var MapGenerator = class {
		constructor(stringify, root, opts, cssString) {
			this.stringify = stringify;
			this.mapOpts = opts.map || {};
			this.root = root;
			this.opts = opts;
			this.css = cssString;
			this.originalCSS = cssString;
			this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
			this.memoizedFileURLs = /* @__PURE__ */ new Map();
			this.memoizedPaths = /* @__PURE__ */ new Map();
			this.memoizedURLs = /* @__PURE__ */ new Map();
		}
		addAnnotation() {
			let content;
			if (this.isInline()) content = "data:application/json;base64," + this.toBase64(this.map.toString());
			else if (typeof this.mapOpts.annotation === "string") content = this.mapOpts.annotation;
			else if (typeof this.mapOpts.annotation === "function") content = this.mapOpts.annotation(this.opts.to, this.root);
			else content = this.outputFile() + ".map";
			let eol = "\n";
			if (this.css.includes("\r\n")) eol = "\r\n";
			this.css += eol + "/*# sourceMappingURL=" + content + " */";
		}
		applyPrevMaps() {
			for (let prev of this.previous()) {
				let from = this.toUrl(this.path(prev.file));
				let root = prev.root || dirname(prev.file);
				let map;
				if (this.mapOpts.sourcesContent === false) {
					map = new SourceMapConsumer(prev.text);
					if (map.sourcesContent) map.sourcesContent = null;
				} else map = prev.consumer();
				this.map.applySourceMap(map, from, this.toUrl(this.path(root)));
			}
		}
		clearAnnotation() {
			if (this.mapOpts.annotation === false) return;
			if (this.root) {
				let node;
				for (let i = this.root.nodes.length - 1; i >= 0; i--) {
					node = this.root.nodes[i];
					if (node.type !== "comment") continue;
					if (node.text.startsWith("# sourceMappingURL=")) this.root.removeChild(i);
				}
			} else if (this.css) {
				let annotation = "/*# sourceMappingURL=";
				let startIndex;
				while ((startIndex = this.css.lastIndexOf(annotation)) !== -1) {
					let endIndex = this.css.indexOf("*/", startIndex + 21);
					if (endIndex === -1) break;
					while (startIndex > 0 && this.css[startIndex - 1] === "\n") startIndex--;
					this.css = this.css.slice(0, startIndex) + this.css.slice(endIndex + 2);
				}
			}
		}
		generate() {
			this.clearAnnotation();
			if (pathAvailable && sourceMapAvailable && this.isMap()) return this.generateMap();
			else {
				let result = "";
				this.stringify(this.root, (i) => {
					result += i;
				});
				return [result];
			}
		}
		generateMap() {
			if (this.root) this.generateString();
			else if (this.previous().length === 1) {
				let prev = this.previous()[0].consumer();
				prev.file = this.outputFile();
				this.map = SourceMapGenerator.fromSourceMap(prev, { ignoreInvalidMapping: true });
			} else {
				this.map = new SourceMapGenerator({
					file: this.outputFile(),
					ignoreInvalidMapping: true
				});
				this.map.addMapping({
					generated: {
						column: 0,
						line: 1
					},
					original: {
						column: 0,
						line: 1
					},
					source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
				});
			}
			if (this.isSourcesContent()) this.setSourcesContent();
			if (this.root && this.previous().length > 0) this.applyPrevMaps();
			if (this.isAnnotation()) this.addAnnotation();
			if (this.isInline()) return [this.css];
			else return [this.css, this.map];
		}
		generateString() {
			this.css = "";
			this.map = new SourceMapGenerator({
				file: this.outputFile(),
				ignoreInvalidMapping: true
			});
			let line = 1;
			let column = 1;
			let noSource = "<no source>";
			let mapping = {
				generated: {
					column: 0,
					line: 0
				},
				original: {
					column: 0,
					line: 0
				},
				source: ""
			};
			let last, lines;
			this.stringify(this.root, (str, node, type) => {
				this.css += str;
				if (node && type !== "end") {
					mapping.generated.line = line;
					mapping.generated.column = column - 1;
					if (node.source && node.source.start) {
						mapping.source = this.sourcePath(node);
						mapping.original.line = node.source.start.line;
						mapping.original.column = node.source.start.column - 1;
						this.map.addMapping(mapping);
					} else {
						mapping.source = noSource;
						mapping.original.line = 1;
						mapping.original.column = 0;
						this.map.addMapping(mapping);
					}
				}
				lines = str.match(/\n/g);
				if (lines) {
					line += lines.length;
					last = str.lastIndexOf("\n");
					column = str.length - last;
				} else column += str.length;
				if (node && type !== "start") {
					let p = node.parent || { raws: {} };
					if (!(node.type === "decl" || node.type === "atrule" && !node.nodes) || node !== p.last || p.raws.semicolon) {
						if (node.source && node.source.end) {
							mapping.source = this.sourcePath(node);
							mapping.original.line = node.source.end.line;
							mapping.original.column = node.source.end.column - 1;
							mapping.generated.line = line;
							mapping.generated.column = column - 2;
							this.map.addMapping(mapping);
						} else {
							mapping.source = noSource;
							mapping.original.line = 1;
							mapping.original.column = 0;
							mapping.generated.line = line;
							mapping.generated.column = column - 1;
							this.map.addMapping(mapping);
						}
					}
				}
			});
		}
		isAnnotation() {
			if (this.isInline()) return true;
			if (typeof this.mapOpts.annotation !== "undefined") return this.mapOpts.annotation;
			if (this.previous().length) return this.previous().some((i) => i.annotation);
			return true;
		}
		isInline() {
			if (typeof this.mapOpts.inline !== "undefined") return this.mapOpts.inline;
			let annotation = this.mapOpts.annotation;
			if (typeof annotation !== "undefined" && annotation !== true) return false;
			if (this.previous().length) return this.previous().some((i) => i.inline);
			return true;
		}
		isMap() {
			if (typeof this.opts.map !== "undefined") return !!this.opts.map;
			return this.previous().length > 0;
		}
		isSourcesContent() {
			if (typeof this.mapOpts.sourcesContent !== "undefined") return this.mapOpts.sourcesContent;
			if (this.previous().length) return this.previous().some((i) => i.withContent());
			return true;
		}
		outputFile() {
			if (this.opts.to) return this.path(this.opts.to);
			else if (this.opts.from) return this.path(this.opts.from);
			else return "to.css";
		}
		path(file) {
			if (this.mapOpts.absolute) return file;
			if (file.charCodeAt(0) === 60) return file;
			if (/^\w+:\/\//.test(file)) return file;
			let cached = this.memoizedPaths.get(file);
			if (cached) return cached;
			let from = this.opts.to ? dirname(this.opts.to) : ".";
			if (typeof this.mapOpts.annotation === "string") from = dirname(resolve(from, this.mapOpts.annotation));
			let path = relative(from, file);
			this.memoizedPaths.set(file, path);
			return path;
		}
		previous() {
			if (!this.previousMaps) {
				this.previousMaps = [];
				if (this.root) this.root.walk((node) => {
					if (node.source && node.source.input.map) {
						let map = node.source.input.map;
						if (!this.previousMaps.includes(map)) this.previousMaps.push(map);
					}
				});
				else {
					let input = new Input(this.originalCSS, this.opts);
					if (input.map) this.previousMaps.push(input.map);
				}
			}
			return this.previousMaps;
		}
		setSourcesContent() {
			let already = {};
			if (this.root) this.root.walk((node) => {
				if (node.source) {
					let from = node.source.input.from;
					if (from && !already[from]) {
						already[from] = true;
						let fromUrl = this.usesFileUrls ? this.toFileUrl(from) : this.toUrl(this.path(from));
						this.map.setSourceContent(fromUrl, node.source.input.css);
					}
				}
			});
			else if (this.css) {
				let from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
				this.map.setSourceContent(from, this.css);
			}
		}
		sourcePath(node) {
			if (this.mapOpts.from) return this.toUrl(this.mapOpts.from);
			else if (this.usesFileUrls) return this.toFileUrl(node.source.input.from);
			else return this.toUrl(this.path(node.source.input.from));
		}
		toBase64(str) {
			if (Buffer) return Buffer.from(str).toString("base64");
			else return window.btoa(unescape(encodeURIComponent(str)));
		}
		toFileUrl(path) {
			let cached = this.memoizedFileURLs.get(path);
			if (cached) return cached;
			if (pathToFileURL) {
				let fileURL = pathToFileURL(path).toString();
				this.memoizedFileURLs.set(path, fileURL);
				return fileURL;
			} else throw new Error("`map.absolute` option is not available in this PostCSS build");
		}
		toUrl(path) {
			let cached = this.memoizedURLs.get(path);
			if (cached) return cached;
			if (sep === "\\") path = path.replace(/\\/g, "/");
			let url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
			this.memoizedURLs.set(path, url);
			return url;
		}
	};
	module.exports = MapGenerator;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/parser.js
var require_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let AtRule = require_at_rule();
	let Comment = require_comment();
	let Declaration = require_declaration();
	let Root = require_root();
	let Rule = require_rule();
	let tokenizer = require_tokenize();
	const SAFE_COMMENT_NEIGHBOR = {
		empty: true,
		space: true
	};
	function findLastWithPosition(tokens) {
		for (let i = tokens.length - 1; i >= 0; i--) {
			let token = tokens[i];
			let pos = token[3] || token[2];
			if (pos) return pos;
		}
	}
	function tokensToString(tokens, from, to) {
		let result = "";
		for (let i = from; i < to; i++) result += tokens[i][1];
		return result;
	}
	var Parser = class {
		constructor(input) {
			this.input = input;
			this.root = new Root();
			this.current = this.root;
			this.spaces = "";
			this.semicolon = false;
			this.createTokenizer();
			this.root.source = {
				input,
				start: {
					column: 1,
					line: 1,
					offset: 0
				}
			};
		}
		atrule(token) {
			let node = new AtRule();
			node.name = token[1].slice(1);
			if (node.name === "") this.unnamedAtrule(node, token);
			this.init(node, token[2]);
			let type;
			let prev;
			let shift;
			let last = false;
			let open = false;
			let params = [];
			let brackets = [];
			while (!this.tokenizer.endOfFile()) {
				token = this.tokenizer.nextToken();
				type = token[0];
				if (type === "(" || type === "[") brackets.push(type === "(" ? ")" : "]");
				else if (type === "{" && brackets.length > 0) brackets.push("}");
				else if (type === brackets[brackets.length - 1]) brackets.pop();
				if (brackets.length === 0) {
					if (type === ";") {
						node.source.end = this.getPosition(token[2]);
						node.source.end.offset++;
						this.semicolon = true;
						break;
					} else if (type === "{") {
						open = true;
						break;
					} else if (type === "}") {
						if (params.length > 0) {
							shift = params.length - 1;
							prev = params[shift];
							while (prev && prev[0] === "space") prev = params[--shift];
							if (prev) {
								node.source.end = this.getPosition(prev[3] || prev[2]);
								node.source.end.offset++;
							}
						}
						this.end(token);
						break;
					} else params.push(token);
				} else params.push(token);
				if (this.tokenizer.endOfFile()) {
					last = true;
					break;
				}
			}
			node.raws.between = this.spacesAndCommentsFromEnd(params);
			if (params.length) {
				node.raws.afterName = this.spacesAndCommentsFromStart(params);
				this.raw(node, "params", params);
				if (last) {
					token = params[params.length - 1];
					node.source.end = this.getPosition(token[3] || token[2]);
					node.source.end.offset++;
					this.spaces = node.raws.between;
					node.raws.between = "";
				}
			} else {
				node.raws.afterName = "";
				node.params = "";
			}
			if (open) {
				node.nodes = [];
				this.current = node;
			}
		}
		checkMissedSemicolon(tokens) {
			let colon = this.colon(tokens);
			if (colon === false) return;
			let founded = 0;
			let token;
			for (let j = colon - 1; j >= 0; j--) {
				token = tokens[j];
				if (token[0] !== "space") {
					founded += 1;
					if (founded === 2) break;
				}
			}
			throw this.input.error("Missed semicolon", token[0] === "word" ? token[3] + 1 : token[2]);
		}
		colon(tokens) {
			let brackets = 0;
			let prev, token, type;
			for (let [i, element] of tokens.entries()) {
				token = element;
				type = token[0];
				if (type === "(") brackets += 1;
				if (type === ")") brackets -= 1;
				if (brackets === 0 && type === ":") {
					if (!prev) this.doubleColon(token);
					else if (prev[0] === "word" && prev[1] === "progid") continue;
					else return i;
				}
				prev = token;
			}
			return false;
		}
		comment(token) {
			let node = new Comment();
			this.init(node, token[2]);
			node.source.end = this.getPosition(token[3] || token[2]);
			node.source.end.offset++;
			let text = token[1].slice(2, -2);
			if (!text.trim()) {
				node.text = "";
				node.raws.left = text;
				node.raws.right = "";
			} else {
				let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
				node.text = match[2];
				node.raws.left = match[1];
				node.raws.right = match[3];
			}
		}
		createTokenizer() {
			this.tokenizer = tokenizer(this.input);
		}
		decl(tokens, customProperty) {
			let node = new Declaration();
			this.init(node, tokens[0][2]);
			let last = tokens[tokens.length - 1];
			if (last[0] === ";") {
				this.semicolon = true;
				tokens.pop();
			}
			node.source.end = this.getPosition(last[3] || last[2] || findLastWithPosition(tokens));
			node.source.end.offset++;
			let start = 0;
			while (tokens[start][0] !== "word") {
				if (start === tokens.length - 1) this.unknownWord([tokens[start]]);
				start++;
			}
			node.raws.before += tokensToString(tokens, 0, start);
			node.source.start = this.getPosition(tokens[start][2]);
			let propStart = start;
			while (start < tokens.length) {
				let type = tokens[start][0];
				if (type === ":" || type === "space" || type === "comment") break;
				start++;
			}
			node.prop = tokensToString(tokens, propStart, start);
			let betweenStart = start;
			let token;
			while (start < tokens.length) {
				token = tokens[start];
				start++;
				if (token[0] === ":") break;
				if (token[0] === "word" && /\w/.test(token[1])) this.unknownWord([token]);
			}
			node.raws.between = tokensToString(tokens, betweenStart, start);
			if (node.prop[0] === "_" || node.prop[0] === "*") {
				node.raws.before += node.prop[0];
				node.prop = node.prop.slice(1);
			}
			let firstSpacesStart = start;
			while (start < tokens.length) {
				let next = tokens[start][0];
				if (next !== "space" && next !== "comment") break;
				start++;
			}
			let firstSpaces = tokens.slice(firstSpacesStart, start);
			tokens = tokens.slice(start);
			this.precheckMissedSemicolon(tokens);
			for (let i = tokens.length - 1; i >= 0; i--) {
				token = tokens[i];
				if (token[1].toLowerCase() === "!important") {
					node.important = true;
					let string = this.stringFrom(tokens, i);
					string = this.spacesFromEnd(tokens) + string;
					if (string !== " !important") node.raws.important = string;
					break;
				} else if (token[1].toLowerCase() === "important") {
					let cache = tokens.slice(0);
					let str = "";
					for (let j = i; j > 0; j--) {
						let type = cache[j][0];
						if (str.trim().startsWith("!") && type !== "space") break;
						str = cache.pop()[1] + str;
					}
					if (str.trim().startsWith("!")) {
						node.important = true;
						node.raws.important = str;
						tokens = cache;
					}
				}
				if (token[0] !== "space" && token[0] !== "comment") break;
			}
			if (tokens.some((i) => i[0] !== "space" && i[0] !== "comment")) {
				node.raws.between += firstSpaces.map((i) => i[1]).join("");
				firstSpaces = [];
			}
			this.raw(node, "value", firstSpaces.concat(tokens), customProperty);
			if (node.value.includes(":") && !customProperty) this.checkMissedSemicolon(tokens);
		}
		doubleColon(token) {
			throw this.input.error("Double colon", { offset: token[2] }, { offset: token[2] + token[1].length });
		}
		emptyRule(token) {
			let node = new Rule();
			this.init(node, token[2]);
			node.selector = "";
			node.raws.between = "";
			this.current = node;
		}
		end(token) {
			if (this.current.nodes && this.current.nodes.length) this.current.raws.semicolon = this.semicolon;
			this.semicolon = false;
			this.current.raws.after = (this.current.raws.after || "") + this.spaces;
			this.spaces = "";
			if (this.current.parent) {
				this.current.source.end = this.getPosition(token[2]);
				this.current.source.end.offset++;
				this.current = this.current.parent;
			} else this.unexpectedClose(token);
		}
		endFile() {
			if (this.current.parent) this.unclosedBlock();
			if (this.current.nodes && this.current.nodes.length) this.current.raws.semicolon = this.semicolon;
			this.current.raws.after = (this.current.raws.after || "") + this.spaces;
			this.root.source.end = this.getPosition(this.tokenizer.position());
		}
		freeSemicolon(token) {
			this.spaces += token[1];
			if (this.current.nodes) {
				let prev = this.current.nodes[this.current.nodes.length - 1];
				if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
					prev.raws.ownSemicolon = this.spaces;
					this.spaces = "";
					prev.source.end = this.getPosition(token[2]);
					prev.source.end.offset++;
				}
			}
		}
		getPosition(offset) {
			let pos = this.input.fromOffset(offset);
			return {
				column: pos.col,
				line: pos.line,
				offset
			};
		}
		init(node, offset) {
			this.current.push(node);
			node.source = {
				input: this.input,
				start: this.getPosition(offset)
			};
			node.raws.before = this.spaces;
			this.spaces = "";
			if (node.type !== "comment") this.semicolon = false;
		}
		other(start) {
			let end = false;
			let type = null;
			let colon = false;
			let bracket = null;
			let brackets = [];
			let customProperty = start[1].startsWith("--");
			let tokens = [];
			let token = start;
			while (token) {
				type = token[0];
				tokens.push(token);
				if (type === "(" || type === "[") {
					if (!bracket) bracket = token;
					brackets.push(type === "(" ? ")" : "]");
				} else if (customProperty && colon && type === "{") {
					if (!bracket) bracket = token;
					brackets.push("}");
				} else if (brackets.length === 0) {
					if (type === ";") {
						if (colon) {
							this.decl(tokens, customProperty);
							return;
						} else break;
					} else if (type === "{") {
						this.rule(tokens);
						return;
					} else if (type === "}") {
						this.tokenizer.back(tokens.pop());
						end = true;
						break;
					} else if (type === ":") colon = true;
				} else if (type === brackets[brackets.length - 1]) {
					brackets.pop();
					if (brackets.length === 0) bracket = null;
				}
				token = this.tokenizer.nextToken();
			}
			if (this.tokenizer.endOfFile()) end = true;
			if (brackets.length > 0) this.unclosedBracket(bracket);
			if (end && colon) {
				if (!customProperty) while (tokens.length) {
					token = tokens[tokens.length - 1][0];
					if (token !== "space" && token !== "comment") break;
					this.tokenizer.back(tokens.pop());
				}
				this.decl(tokens, customProperty);
			} else this.unknownWord(tokens);
		}
		parse() {
			let token;
			while (!this.tokenizer.endOfFile()) {
				token = this.tokenizer.nextToken();
				switch (token[0]) {
					case "space":
						this.spaces += token[1];
						break;
					case ";":
						this.freeSemicolon(token);
						break;
					case "}":
						this.end(token);
						break;
					case "comment":
						this.comment(token);
						break;
					case "at-word":
						this.atrule(token);
						break;
					case "{":
						this.emptyRule(token);
						break;
					default: this.other(token);
				}
			}
			this.endFile();
		}
		precheckMissedSemicolon() {}
		raw(node, prop, tokens, customProperty) {
			let token, type;
			let length = tokens.length;
			let value = "";
			let clean = true;
			let next, prev;
			for (let i = 0; i < length; i += 1) {
				token = tokens[i];
				type = token[0];
				if (type === "space" && i === length - 1 && !customProperty) clean = false;
				else if (type === "comment") {
					prev = tokens[i - 1] ? tokens[i - 1][0] : "empty";
					next = tokens[i + 1] ? tokens[i + 1][0] : "empty";
					if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
						if (value.slice(-1) === ",") clean = false;
						else value += token[1];
					} else clean = false;
				} else value += token[1];
			}
			if (!clean) {
				let raw = tokens.reduce((all, i) => all + i[1], "");
				node.raws[prop] = {
					raw,
					value
				};
			}
			node[prop] = value;
		}
		rule(tokens) {
			tokens.pop();
			let node = new Rule();
			this.init(node, tokens[0][2]);
			node.raws.between = this.spacesAndCommentsFromEnd(tokens);
			this.raw(node, "selector", tokens);
			this.current = node;
		}
		spacesAndCommentsFromEnd(tokens) {
			let lastTokenType;
			let spaces = "";
			while (tokens.length) {
				lastTokenType = tokens[tokens.length - 1][0];
				if (lastTokenType !== "space" && lastTokenType !== "comment") break;
				spaces = tokens.pop()[1] + spaces;
			}
			return spaces;
		}
		spacesAndCommentsFromStart(tokens) {
			let next;
			let spaces = "";
			while (tokens.length) {
				next = tokens[0][0];
				if (next !== "space" && next !== "comment") break;
				spaces += tokens.shift()[1];
			}
			return spaces;
		}
		spacesFromEnd(tokens) {
			let lastTokenType;
			let spaces = "";
			while (tokens.length) {
				lastTokenType = tokens[tokens.length - 1][0];
				if (lastTokenType !== "space") break;
				spaces = tokens.pop()[1] + spaces;
			}
			return spaces;
		}
		stringFrom(tokens, from) {
			let result = "";
			for (let i = from; i < tokens.length; i++) result += tokens[i][1];
			tokens.splice(from, tokens.length - from);
			return result;
		}
		unclosedBlock() {
			let pos = this.current.source.start;
			throw this.input.error("Unclosed block", pos.line, pos.column);
		}
		unclosedBracket(bracket) {
			throw this.input.error("Unclosed bracket", { offset: bracket[2] }, { offset: bracket[2] + 1 });
		}
		unexpectedClose(token) {
			throw this.input.error("Unexpected }", { offset: token[2] }, { offset: token[2] + 1 });
		}
		unknownWord(tokens) {
			throw this.input.error("Unknown word " + tokens[0][1], { offset: tokens[0][2] }, { offset: tokens[0][2] + tokens[0][1].length });
		}
		unnamedAtrule(node, token) {
			throw this.input.error("At-rule without name", { offset: token[2] }, { offset: token[2] + token[1].length });
		}
	};
	module.exports = Parser;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/parse.js
var require_parse$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Container = require_container();
	let Input = require_input();
	let Parser = require_parser();
	function parse(css, opts) {
		let input = new Input(css, opts);
		let parser = new Parser(input);
		try {
			parser.parse();
		} catch (e) {
			if (process.env.NODE_ENV !== "production") {
				if (e.name === "CssSyntaxError" && opts && opts.from) {
					if (/\.scss$/i.test(opts.from)) e.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
					else if (/\.sass/i.test(opts.from)) e.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
					else if (/\.less$/i.test(opts.from)) e.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
				}
			}
			throw e;
		}
		return parser.root;
	}
	module.exports = parse;
	parse.default = parse;
	Container.registerParse(parse);
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/warning.js
var require_warning = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Container = require_container();
	let { my } = require_symbols();
	var Warning = class {
		constructor(text, opts = {}) {
			this.type = "warning";
			this.text = text;
			if (opts.node && opts.node.source) {
				if (!opts.node[my]) Container.rebuild(opts.node);
				let range = opts.node.rangeBy(opts);
				this.line = range.start.line;
				this.column = range.start.column;
				this.endLine = range.end.line;
				this.endColumn = range.end.column;
			}
			for (let opt in opts) this[opt] = opts[opt];
		}
		toString() {
			if (this.node) return this.node.error(this.text, {
				index: this.index,
				plugin: this.plugin,
				word: this.word
			}).message;
			if (this.plugin) return this.plugin + ": " + this.text;
			return this.text;
		}
	};
	module.exports = Warning;
	Warning.default = Warning;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/result.js
var require_result = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Warning = require_warning();
	var Result = class {
		get content() {
			return this.css;
		}
		constructor(processor, root, opts) {
			this.processor = processor;
			this.messages = [];
			this.root = root;
			this.opts = opts;
			this.css = "";
			this.map = void 0;
		}
		toString() {
			return this.css;
		}
		warn(text, opts = {}) {
			if (!opts.plugin) {
				if (this.lastPlugin && this.lastPlugin.postcssPlugin) opts.plugin = this.lastPlugin.postcssPlugin;
			}
			let warning = new Warning(text, opts);
			this.messages.push(warning);
			return warning;
		}
		warnings() {
			return this.messages.filter((i) => i.type === "warning");
		}
	};
	module.exports = Result;
	Result.default = Result;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/warn-once.js
var require_warn_once = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let printed = {};
	module.exports = function warnOnce(message) {
		if (printed[message]) return;
		printed[message] = true;
		if (typeof console !== "undefined" && console.warn) console.warn(message);
	};
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/lazy-result.js
var require_lazy_result = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Container = require_container();
	let Document = require_document();
	let MapGenerator = require_map_generator();
	let parse = require_parse$1();
	let Result = require_result();
	let Root = require_root();
	let stringify = require_stringify$1();
	let { isClean, my } = require_symbols();
	let warnOnce = require_warn_once();
	const TYPE_TO_CLASS_NAME = {
		atrule: "AtRule",
		comment: "Comment",
		decl: "Declaration",
		document: "Document",
		root: "Root",
		rule: "Rule"
	};
	const PLUGIN_PROPS = {
		AtRule: true,
		AtRuleExit: true,
		Comment: true,
		CommentExit: true,
		Declaration: true,
		DeclarationExit: true,
		Document: true,
		DocumentExit: true,
		Once: true,
		OnceExit: true,
		postcssPlugin: true,
		prepare: true,
		Root: true,
		RootExit: true,
		Rule: true,
		RuleExit: true
	};
	const NOT_VISITORS = {
		Once: true,
		postcssPlugin: true,
		prepare: true
	};
	const CHILDREN = 0;
	function isPromise(obj) {
		return typeof obj === "object" && typeof obj.then === "function";
	}
	function getEvents(node) {
		let key = false;
		let type = TYPE_TO_CLASS_NAME[node.type];
		if (node.type === "decl") key = node.prop.toLowerCase();
		else if (node.type === "atrule") key = node.name.toLowerCase();
		if (key && node.append) return [
			type,
			type + "-" + key,
			CHILDREN,
			type + "Exit",
			type + "Exit-" + key
		];
		else if (key) return [
			type,
			type + "-" + key,
			type + "Exit",
			type + "Exit-" + key
		];
		else if (node.append) return [
			type,
			CHILDREN,
			type + "Exit"
		];
		else return [type, type + "Exit"];
	}
	function toStack(node) {
		let events;
		if (node.type === "document") events = [
			"Document",
			CHILDREN,
			"DocumentExit"
		];
		else if (node.type === "root") events = [
			"Root",
			CHILDREN,
			"RootExit"
		];
		else events = getEvents(node);
		return {
			eventIndex: 0,
			events,
			iterator: 0,
			node,
			visitorIndex: 0,
			visitors: []
		};
	}
	function cleanMarks(node) {
		let stack = [node];
		while (stack.length > 0) {
			let next = stack.pop();
			next[isClean] = false;
			if (next.nodes) for (let i of next.nodes) stack.push(i);
		}
		return node;
	}
	let postcss = {};
	var LazyResult = class LazyResult {
		get content() {
			return this.stringify().content;
		}
		get css() {
			return this.stringify().css;
		}
		get map() {
			return this.stringify().map;
		}
		get messages() {
			return this.sync().messages;
		}
		get opts() {
			return this.result.opts;
		}
		get processor() {
			return this.result.processor;
		}
		get root() {
			return this.sync().root;
		}
		get [Symbol.toStringTag]() {
			return "LazyResult";
		}
		constructor(processor, css, opts) {
			this.stringified = false;
			this.processed = false;
			let root;
			if (typeof css === "object" && css !== null && (css.type === "root" || css.type === "document")) root = cleanMarks(css);
			else if (css instanceof LazyResult || css instanceof Result) {
				root = cleanMarks(css.root);
				if (css.map) {
					if (typeof opts.map === "undefined") opts.map = {};
					if (!opts.map.inline) opts.map.inline = false;
					opts.map.prev = css.map;
				}
			} else {
				let parser = parse;
				if (opts.syntax) parser = opts.syntax.parse;
				if (opts.parser) parser = opts.parser;
				if (parser.parse) parser = parser.parse;
				try {
					root = parser(css, opts);
				} catch (error) {
					this.processed = true;
					this.error = error;
				}
				if (root && !root[my])
 /* c8 ignore next 2 */
				Container.rebuild(root);
			}
			this.result = new Result(processor, root, opts);
			this.helpers = {
				...postcss,
				postcss,
				result: this.result
			};
			this.plugins = this.processor.plugins.map((plugin) => {
				if (typeof plugin === "object" && plugin.prepare) return {
					...plugin,
					...plugin.prepare(this.result)
				};
				else return plugin;
			});
		}
		async() {
			if (this.error) return Promise.reject(this.error);
			if (this.processed) return Promise.resolve(this.result);
			if (!this.processing) this.processing = this.runAsync();
			return this.processing;
		}
		catch(onRejected) {
			return this.async().catch(onRejected);
		}
		finally(onFinally) {
			return this.async().then(onFinally, onFinally);
		}
		getAsyncError() {
			throw new Error("Use process(css).then(cb) to work with async plugins");
		}
		handleError(error, node) {
			let plugin = this.result.lastPlugin;
			try {
				if (node) node.addToError(error);
				this.error = error;
				if (error.name === "CssSyntaxError" && !error.plugin) {
					error.plugin = plugin.postcssPlugin;
					error.setMessage();
				} else if (plugin.postcssVersion) {
					if (process.env.NODE_ENV !== "production") {
						let pluginName = plugin.postcssPlugin;
						let pluginVer = plugin.postcssVersion;
						let runtimeVer = this.result.processor.version;
						let a = pluginVer.split(".");
						let b = runtimeVer.split(".");
						if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) console.error("Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below.");
					}
				}
			} catch (err) {
				/* c8 ignore next 3 */
				if (console && console.error) console.error(err);
			}
			return error;
		}
		prepareVisitors() {
			this.listeners = {};
			let add = (plugin, type, cb) => {
				if (!this.listeners[type]) this.listeners[type] = [];
				this.listeners[type].push([plugin, cb]);
			};
			for (let plugin of this.plugins) if (typeof plugin === "object") for (let event in plugin) {
				if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) throw new Error(`Unknown event ${event} in ${plugin.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`);
				if (!NOT_VISITORS[event]) {
					if (typeof plugin[event] === "object") for (let filter in plugin[event]) if (filter === "*") add(plugin, event, plugin[event][filter]);
					else add(plugin, event + "-" + filter.toLowerCase(), plugin[event][filter]);
					else if (typeof plugin[event] === "function") add(plugin, event, plugin[event]);
				}
			}
			this.hasListener = Object.keys(this.listeners).length > 0;
		}
		async runAsync() {
			this.plugin = 0;
			for (let i = 0; i < this.plugins.length; i++) {
				let plugin = this.plugins[i];
				let promise = this.runOnRoot(plugin);
				if (isPromise(promise)) try {
					await promise;
				} catch (error) {
					throw this.handleError(error);
				}
			}
			this.prepareVisitors();
			if (this.hasListener) {
				let root = this.result.root;
				while (!root[isClean]) {
					root[isClean] = true;
					let stack = [toStack(root)];
					while (stack.length > 0) {
						let promise = this.visitTick(stack);
						if (isPromise(promise)) try {
							await promise;
						} catch (e) {
							let node = stack[stack.length - 1].node;
							throw this.handleError(e, node);
						}
					}
				}
				if (this.listeners.OnceExit) for (let [plugin, visitor] of this.listeners.OnceExit) {
					this.result.lastPlugin = plugin;
					try {
						if (root.type === "document") {
							let roots = root.nodes.map((subRoot) => visitor(subRoot, this.helpers));
							await Promise.all(roots);
						} else await visitor(root, this.helpers);
					} catch (e) {
						throw this.handleError(e);
					}
				}
			}
			this.processed = true;
			return this.stringify();
		}
		runOnRoot(plugin) {
			this.result.lastPlugin = plugin;
			try {
				if (typeof plugin === "object" && plugin.Once) {
					if (this.result.root.type === "document") {
						let roots = this.result.root.nodes.map((root) => plugin.Once(root, this.helpers));
						if (isPromise(roots[0])) return Promise.all(roots);
						return roots;
					}
					return plugin.Once(this.result.root, this.helpers);
				} else if (typeof plugin === "function") return plugin(this.result.root, this.result);
			} catch (error) {
				throw this.handleError(error);
			}
		}
		stringify() {
			if (this.error) throw this.error;
			if (this.stringified) return this.result;
			this.stringified = true;
			this.sync();
			let opts = this.result.opts;
			let str = stringify;
			if (opts.syntax) str = opts.syntax.stringify;
			if (opts.stringifier) str = opts.stringifier;
			if (str.stringify) str = str.stringify;
			let rootSource = this.result.root.source;
			if (opts.map === void 0 && !(rootSource && rootSource.input && rootSource.input.map)) {
				let result = "";
				str(this.result.root, (i) => {
					result += i;
				});
				this.result.css = result;
				return this.result;
			}
			let data = new MapGenerator(str, this.result.root, this.result.opts).generate();
			this.result.css = data[0];
			this.result.map = data[1];
			return this.result;
		}
		sync() {
			if (this.error) throw this.error;
			if (this.processed) return this.result;
			this.processed = true;
			if (this.processing) throw this.getAsyncError();
			for (let plugin of this.plugins) if (isPromise(this.runOnRoot(plugin))) throw this.getAsyncError();
			this.prepareVisitors();
			if (this.hasListener) {
				let root = this.result.root;
				while (!root[isClean]) {
					root[isClean] = true;
					this.walkSync(root);
				}
				if (this.listeners.OnceExit) {
					if (root.type === "document") for (let subRoot of root.nodes) this.visitSync(this.listeners.OnceExit, subRoot);
					else this.visitSync(this.listeners.OnceExit, root);
				}
			}
			return this.result;
		}
		then(onFulfilled, onRejected) {
			if (process.env.NODE_ENV !== "production") {
				if (!("from" in this.opts)) warnOnce("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
			}
			return this.async().then(onFulfilled, onRejected);
		}
		toString() {
			return this.css;
		}
		visitSync(visitors, node) {
			for (let [plugin, visitor] of visitors) {
				this.result.lastPlugin = plugin;
				let promise;
				try {
					promise = visitor(node, this.helpers);
				} catch (e) {
					throw this.handleError(e, node.proxyOf);
				}
				if (node.type !== "root" && node.type !== "document" && !node.parent) return true;
				if (isPromise(promise)) throw this.getAsyncError();
			}
		}
		visitTick(stack) {
			let visit = stack[stack.length - 1];
			let { node, visitors } = visit;
			if (node.type !== "root" && node.type !== "document" && !node.parent) {
				stack.pop();
				return;
			}
			if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
				let [plugin, visitor] = visitors[visit.visitorIndex];
				visit.visitorIndex += 1;
				if (visit.visitorIndex === visitors.length) {
					visit.visitors = [];
					visit.visitorIndex = 0;
				}
				this.result.lastPlugin = plugin;
				try {
					return visitor(node.toProxy(), this.helpers);
				} catch (e) {
					throw this.handleError(e, node);
				}
			}
			if (visit.iterator !== 0) {
				let iterator = visit.iterator;
				if (visit.descending) {
					visit.descending = false;
					node.indexes[iterator] += 1;
				}
				let child;
				while (child = node.nodes[node.indexes[iterator]]) {
					if (!child[isClean]) {
						child[isClean] = true;
						visit.descending = true;
						stack.push(toStack(child));
						return;
					}
					node.indexes[iterator] += 1;
				}
				visit.iterator = 0;
				delete node.indexes[iterator];
			}
			let events = visit.events;
			while (visit.eventIndex < events.length) {
				let event = events[visit.eventIndex];
				visit.eventIndex += 1;
				if (event === CHILDREN) {
					if (node.nodes && node.nodes.length) {
						node[isClean] = true;
						visit.iterator = node.getIterator();
					}
					return;
				} else if (this.listeners[event]) {
					visit.visitors = this.listeners[event];
					return;
				}
			}
			stack.pop();
		}
		walkSync(node) {
			node[isClean] = true;
			let stack = [{
				eventIndex: 0,
				events: getEvents(node),
				iterator: 0,
				node
			}];
			while (stack.length > 0) {
				let visit = stack[stack.length - 1];
				let visitNode = visit.node;
				if (visit.iterator !== 0) {
					let iterator = visit.iterator;
					if (visit.descending) {
						visit.descending = false;
						visitNode.indexes[iterator] += 1;
					}
					let child;
					let descended = false;
					while (child = visitNode.nodes[visitNode.indexes[iterator]]) {
						if (!child[isClean]) {
							child[isClean] = true;
							visit.descending = true;
							stack.push({
								eventIndex: 0,
								events: getEvents(child),
								iterator: 0,
								node: child
							});
							descended = true;
							break;
						}
						visitNode.indexes[iterator] += 1;
					}
					if (descended) continue;
					visit.iterator = 0;
					delete visitNode.indexes[iterator];
				}
				if (visit.eventIndex < visit.events.length) {
					let event = visit.events[visit.eventIndex];
					visit.eventIndex += 1;
					if (event === CHILDREN) {
						if (visitNode.nodes && visitNode.nodes.length) visit.iterator = visitNode.getIterator();
					} else {
						let visitors = this.listeners[event];
						if (visitors) {
							if (this.visitSync(visitors, visitNode.toProxy())) stack.pop();
						}
					}
					continue;
				}
				stack.pop();
			}
		}
		warnings() {
			return this.sync().warnings();
		}
	};
	LazyResult.registerPostcss = (dependant) => {
		postcss = dependant;
	};
	module.exports = LazyResult;
	LazyResult.default = LazyResult;
	Root.registerLazyResult(LazyResult);
	Document.registerLazyResult(LazyResult);
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/no-work-result.js
var require_no_work_result = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let MapGenerator = require_map_generator();
	let parse = require_parse$1();
	let Result = require_result();
	let stringify = require_stringify$1();
	let warnOnce = require_warn_once();
	var NoWorkResult = class {
		get content() {
			return this.result.css;
		}
		get css() {
			return this.result.css;
		}
		get map() {
			return this.result.map;
		}
		get messages() {
			return [];
		}
		get opts() {
			return this.result.opts;
		}
		get processor() {
			return this.result.processor;
		}
		get root() {
			if (this._root) return this._root;
			let root;
			let parser = parse;
			try {
				root = parser(this._css, this._opts);
			} catch (error) {
				this.error = error;
			}
			if (this.error) throw this.error;
			else {
				this._root = root;
				return root;
			}
		}
		get [Symbol.toStringTag]() {
			return "NoWorkResult";
		}
		constructor(processor, css, opts) {
			css = css.toString();
			this.stringified = false;
			this._processor = processor;
			this._css = css;
			this._opts = opts;
			this._map = void 0;
			let str = stringify;
			this.result = new Result(this._processor, void 0, this._opts);
			this.result.css = css;
			let self = this;
			Object.defineProperty(this.result, "root", { get() {
				return self.root;
			} });
			let map = new MapGenerator(str, void 0, this._opts, css);
			if (map.isMap()) {
				let [generatedCSS, generatedMap] = map.generate();
				if (generatedCSS) this.result.css = generatedCSS;
				if (generatedMap) this.result.map = generatedMap;
			} else {
				map.clearAnnotation();
				this.result.css = map.css;
			}
		}
		async() {
			if (this.error) return Promise.reject(this.error);
			return Promise.resolve(this.result);
		}
		catch(onRejected) {
			return this.async().catch(onRejected);
		}
		finally(onFinally) {
			return this.async().then(onFinally, onFinally);
		}
		sync() {
			if (this.error) throw this.error;
			return this.result;
		}
		then(onFulfilled, onRejected) {
			if (process.env.NODE_ENV !== "production") {
				if (!("from" in this._opts)) warnOnce("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
			}
			return this.async().then(onFulfilled, onRejected);
		}
		toString() {
			return this._css;
		}
		warnings() {
			return [];
		}
	};
	module.exports = NoWorkResult;
	NoWorkResult.default = NoWorkResult;
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/processor.js
var require_processor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	let Document = require_document();
	let LazyResult = require_lazy_result();
	let NoWorkResult = require_no_work_result();
	let Root = require_root();
	var Processor = class {
		constructor(plugins = []) {
			this.version = "8.5.28";
			this.plugins = this.normalize(plugins);
		}
		normalize(plugins) {
			let normalized = [];
			for (let i of plugins) {
				if (i.postcss === true) i = i();
				else if (i.postcss) i = i.postcss;
				if (typeof i === "object" && Array.isArray(i.plugins)) normalized = normalized.concat(i.plugins);
				else if (typeof i === "object" && i.postcssPlugin) normalized.push(i);
				else if (typeof i === "function") normalized.push(i);
				else if (typeof i === "object" && (i.parse || i.stringify)) {
					if (process.env.NODE_ENV !== "production") throw new Error("PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation.");
				} else throw new Error(i + " is not a PostCSS plugin");
			}
			return normalized;
		}
		process(css, opts = {}) {
			if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) return new NoWorkResult(this, css, opts);
			else return new LazyResult(this, css, opts);
		}
		use(plugin) {
			this.plugins = this.plugins.concat(this.normalize([plugin]));
			return this;
		}
	};
	module.exports = Processor;
	Processor.default = Processor;
	Root.registerProcessor(Processor);
	Document.registerProcessor(Processor);
}));
//#endregion
//#region node_modules/.pnpm/postcss@8.5.28/node_modules/postcss/lib/postcss.mjs
var import_postcss = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	let AtRule = require_at_rule();
	let Comment = require_comment();
	let Container = require_container();
	let CssSyntaxError = require_css_syntax_error();
	let Declaration = require_declaration();
	let Document = require_document();
	let fromJSON = require_fromJSON();
	let Input = require_input();
	let LazyResult = require_lazy_result();
	let list = require_list();
	let Node = require_node();
	let parse = require_parse$1();
	let Processor = require_processor();
	let Result = require_result();
	let Root = require_root();
	let Rule = require_rule();
	let stringify = require_stringify$1();
	let Warning = require_warning();
	function postcss(...plugins) {
		if (plugins.length === 1 && Array.isArray(plugins[0])) plugins = plugins[0];
		return new Processor(plugins);
	}
	postcss.plugin = function plugin(name, initializer) {
		let warningPrinted = false;
		function creator(...args) {
			if (console && console.warn && !warningPrinted) {
				warningPrinted = true;
				console.warn(name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration");
				if (process.env.LANG && process.env.LANG.startsWith("zh"))
 /* c8 ignore next 7 */
				console.warn(name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226");
			}
			let transformer = initializer(...args);
			transformer.postcssPlugin = name;
			transformer.postcssVersion = new Processor().version;
			return transformer;
		}
		let cache;
		Object.defineProperty(creator, "postcss", { get() {
			if (!cache) cache = creator();
			return cache;
		} });
		creator.process = function(css, processOpts, pluginOpts) {
			return postcss([creator(pluginOpts)]).process(css, processOpts);
		};
		return creator;
	};
	postcss.stringify = stringify;
	postcss.parse = parse;
	postcss.fromJSON = fromJSON;
	postcss.list = list;
	postcss.comment = (defaults) => new Comment(defaults);
	postcss.atRule = (defaults) => new AtRule(defaults);
	postcss.decl = (defaults) => new Declaration(defaults);
	postcss.rule = (defaults) => new Rule(defaults);
	postcss.root = (defaults) => new Root(defaults);
	postcss.document = (defaults) => new Document(defaults);
	postcss.CssSyntaxError = CssSyntaxError;
	postcss.Declaration = Declaration;
	postcss.Container = Container;
	postcss.Processor = Processor;
	postcss.Document = Document;
	postcss.Comment = Comment;
	postcss.Warning = Warning;
	postcss.AtRule = AtRule;
	postcss.Result = Result;
	postcss.Input = Input;
	postcss.Rule = Rule;
	postcss.Root = Root;
	postcss.Node = Node;
	LazyResult.registerPostcss(postcss);
	module.exports = postcss;
	postcss.default = postcss;
})))(), 1);
var postcss_default = import_postcss.default;
import_postcss.default.stringify;
import_postcss.default.fromJSON;
import_postcss.default.plugin;
import_postcss.default.parse;
import_postcss.default.list;
import_postcss.default.document;
import_postcss.default.comment;
import_postcss.default.atRule;
import_postcss.default.rule;
import_postcss.default.decl;
import_postcss.default.root;
import_postcss.default.CssSyntaxError;
import_postcss.default.Declaration;
import_postcss.default.Container;
import_postcss.default.Processor;
import_postcss.default.Document;
import_postcss.default.Comment;
import_postcss.default.Warning;
import_postcss.default.AtRule;
import_postcss.default.Result;
import_postcss.default.Input;
import_postcss.default.Rule;
import_postcss.default.Root;
import_postcss.default.Node;
//#endregion
//#region node_modules/.pnpm/postcss-value-parser@4.2.0/node_modules/postcss-value-parser/lib/parse.js
var require_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var openParentheses = "(".charCodeAt(0);
	var closeParentheses = ")".charCodeAt(0);
	var singleQuote = "'".charCodeAt(0);
	var doubleQuote = "\"".charCodeAt(0);
	var backslash = "\\".charCodeAt(0);
	var slash = "/".charCodeAt(0);
	var comma = ",".charCodeAt(0);
	var colon = ":".charCodeAt(0);
	var star = "*".charCodeAt(0);
	var uLower = "u".charCodeAt(0);
	var uUpper = "U".charCodeAt(0);
	var plus = "+".charCodeAt(0);
	var isUnicodeRange = /^[a-f0-9?-]+$/i;
	module.exports = function(input) {
		var tokens = [];
		var value = input;
		var next, quote, prev, token, escape, escapePos, whitespacePos, parenthesesOpenPos;
		var pos = 0;
		var code = value.charCodeAt(pos);
		var max = value.length;
		var stack = [{ nodes: tokens }];
		var balanced = 0;
		var parent;
		var name = "";
		var before = "";
		var after = "";
		while (pos < max) if (code <= 32) {
			next = pos;
			do {
				next += 1;
				code = value.charCodeAt(next);
			} while (code <= 32);
			token = value.slice(pos, next);
			prev = tokens[tokens.length - 1];
			if (code === closeParentheses && balanced) after = token;
			else if (prev && prev.type === "div") {
				prev.after = token;
				prev.sourceEndIndex += token.length;
			} else if (code === comma || code === colon || code === slash && value.charCodeAt(next + 1) !== star && (!parent || parent && parent.type === "function" && parent.value !== "calc")) before = token;
			else tokens.push({
				type: "space",
				sourceIndex: pos,
				sourceEndIndex: next,
				value: token
			});
			pos = next;
		} else if (code === singleQuote || code === doubleQuote) {
			next = pos;
			quote = code === singleQuote ? "'" : "\"";
			token = {
				type: "string",
				sourceIndex: pos,
				quote
			};
			do {
				escape = false;
				next = value.indexOf(quote, next + 1);
				if (~next) {
					escapePos = next;
					while (value.charCodeAt(escapePos - 1) === backslash) {
						escapePos -= 1;
						escape = !escape;
					}
				} else {
					value += quote;
					next = value.length - 1;
					token.unclosed = true;
				}
			} while (escape);
			token.value = value.slice(pos + 1, next);
			token.sourceEndIndex = token.unclosed ? next : next + 1;
			tokens.push(token);
			pos = next + 1;
			code = value.charCodeAt(pos);
		} else if (code === slash && value.charCodeAt(pos + 1) === star) {
			next = value.indexOf("*/", pos);
			token = {
				type: "comment",
				sourceIndex: pos,
				sourceEndIndex: next + 2
			};
			if (next === -1) {
				token.unclosed = true;
				next = value.length;
				token.sourceEndIndex = next;
			}
			token.value = value.slice(pos + 2, next);
			tokens.push(token);
			pos = next + 2;
			code = value.charCodeAt(pos);
		} else if ((code === slash || code === star) && parent && parent.type === "function" && parent.value === "calc") {
			token = value[pos];
			tokens.push({
				type: "word",
				sourceIndex: pos - before.length,
				sourceEndIndex: pos + token.length,
				value: token
			});
			pos += 1;
			code = value.charCodeAt(pos);
		} else if (code === slash || code === comma || code === colon) {
			token = value[pos];
			tokens.push({
				type: "div",
				sourceIndex: pos - before.length,
				sourceEndIndex: pos + token.length,
				value: token,
				before,
				after: ""
			});
			before = "";
			pos += 1;
			code = value.charCodeAt(pos);
		} else if (openParentheses === code) {
			next = pos;
			do {
				next += 1;
				code = value.charCodeAt(next);
			} while (code <= 32);
			parenthesesOpenPos = pos;
			token = {
				type: "function",
				sourceIndex: pos - name.length,
				value: name,
				before: value.slice(parenthesesOpenPos + 1, next)
			};
			pos = next;
			if (name === "url" && code !== singleQuote && code !== doubleQuote) {
				next -= 1;
				do {
					escape = false;
					next = value.indexOf(")", next + 1);
					if (~next) {
						escapePos = next;
						while (value.charCodeAt(escapePos - 1) === backslash) {
							escapePos -= 1;
							escape = !escape;
						}
					} else {
						value += ")";
						next = value.length - 1;
						token.unclosed = true;
					}
				} while (escape);
				whitespacePos = next;
				do {
					whitespacePos -= 1;
					code = value.charCodeAt(whitespacePos);
				} while (code <= 32);
				if (parenthesesOpenPos < whitespacePos) {
					if (pos !== whitespacePos + 1) token.nodes = [{
						type: "word",
						sourceIndex: pos,
						sourceEndIndex: whitespacePos + 1,
						value: value.slice(pos, whitespacePos + 1)
					}];
					else token.nodes = [];
					if (token.unclosed && whitespacePos + 1 !== next) {
						token.after = "";
						token.nodes.push({
							type: "space",
							sourceIndex: whitespacePos + 1,
							sourceEndIndex: next,
							value: value.slice(whitespacePos + 1, next)
						});
					} else {
						token.after = value.slice(whitespacePos + 1, next);
						token.sourceEndIndex = next;
					}
				} else {
					token.after = "";
					token.nodes = [];
				}
				pos = next + 1;
				token.sourceEndIndex = token.unclosed ? next : pos;
				code = value.charCodeAt(pos);
				tokens.push(token);
			} else {
				balanced += 1;
				token.after = "";
				token.sourceEndIndex = pos + 1;
				tokens.push(token);
				stack.push(token);
				tokens = token.nodes = [];
				parent = token;
			}
			name = "";
		} else if (closeParentheses === code && balanced) {
			pos += 1;
			code = value.charCodeAt(pos);
			parent.after = after;
			parent.sourceEndIndex += after.length;
			after = "";
			balanced -= 1;
			stack[stack.length - 1].sourceEndIndex = pos;
			stack.pop();
			parent = stack[balanced];
			tokens = parent.nodes;
		} else {
			next = pos;
			do {
				if (code === backslash) next += 1;
				next += 1;
				code = value.charCodeAt(next);
			} while (next < max && !(code <= 32 || code === singleQuote || code === doubleQuote || code === comma || code === colon || code === slash || code === openParentheses || code === star && parent && parent.type === "function" && parent.value === "calc" || code === slash && parent.type === "function" && parent.value === "calc" || code === closeParentheses && balanced));
			token = value.slice(pos, next);
			if (openParentheses === code) name = token;
			else if ((uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) && plus === token.charCodeAt(1) && isUnicodeRange.test(token.slice(2))) tokens.push({
				type: "unicode-range",
				sourceIndex: pos,
				sourceEndIndex: next,
				value: token
			});
			else tokens.push({
				type: "word",
				sourceIndex: pos,
				sourceEndIndex: next,
				value: token
			});
			pos = next;
		}
		for (pos = stack.length - 1; pos; pos -= 1) {
			stack[pos].unclosed = true;
			stack[pos].sourceEndIndex = value.length;
		}
		return stack[0].nodes;
	};
}));
//#endregion
//#region node_modules/.pnpm/postcss-value-parser@4.2.0/node_modules/postcss-value-parser/lib/walk.js
var require_walk = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function walk(nodes, cb, bubble) {
		var i = 0, max = nodes.length, node, result;
		for (; i < max; i += 1) {
			node = nodes[i];
			if (!bubble) result = cb(node, i, nodes);
			if (result !== false && node.type === "function" && Array.isArray(node.nodes)) walk(node.nodes, cb, bubble);
			if (bubble) cb(node, i, nodes);
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/postcss-value-parser@4.2.0/node_modules/postcss-value-parser/lib/stringify.js
var require_stringify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function stringifyNode(node, custom) {
		var type = node.type;
		var value = node.value;
		var buf;
		var customResult;
		if (custom && (customResult = custom(node)) !== void 0) return customResult;
		else if (type === "word" || type === "space") return value;
		else if (type === "string") {
			buf = node.quote || "";
			return buf + value + (node.unclosed ? "" : buf);
		} else if (type === "comment") return "/*" + value + (node.unclosed ? "" : "*/");
		else if (type === "div") return (node.before || "") + value + (node.after || "");
		else if (Array.isArray(node.nodes)) {
			buf = stringify(node.nodes, custom);
			if (type !== "function") return buf;
			return value + "(" + (node.before || "") + buf + (node.after || "") + (node.unclosed ? "" : ")");
		}
		return value;
	}
	function stringify(nodes, custom) {
		var result, i;
		if (Array.isArray(nodes)) {
			result = "";
			for (i = nodes.length - 1; ~i; i -= 1) result = stringifyNode(nodes[i], custom) + result;
			return result;
		}
		return stringifyNode(nodes, custom);
	}
	module.exports = stringify;
}));
//#endregion
//#region node_modules/.pnpm/postcss-value-parser@4.2.0/node_modules/postcss-value-parser/lib/unit.js
var require_unit = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var minus = "-".charCodeAt(0);
	var plus = "+".charCodeAt(0);
	var dot = ".".charCodeAt(0);
	var exp = "e".charCodeAt(0);
	var EXP = "E".charCodeAt(0);
	function likeNumber(value) {
		var code = value.charCodeAt(0);
		var nextCode;
		if (code === plus || code === minus) {
			nextCode = value.charCodeAt(1);
			if (nextCode >= 48 && nextCode <= 57) return true;
			var nextNextCode = value.charCodeAt(2);
			if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) return true;
			return false;
		}
		if (code === dot) {
			nextCode = value.charCodeAt(1);
			if (nextCode >= 48 && nextCode <= 57) return true;
			return false;
		}
		if (code >= 48 && code <= 57) return true;
		return false;
	}
	module.exports = function(value) {
		var pos = 0;
		var length = value.length;
		var code;
		var nextCode;
		var nextNextCode;
		if (length === 0 || !likeNumber(value)) return false;
		code = value.charCodeAt(pos);
		if (code === plus || code === minus) pos++;
		while (pos < length) {
			code = value.charCodeAt(pos);
			if (code < 48 || code > 57) break;
			pos += 1;
		}
		code = value.charCodeAt(pos);
		nextCode = value.charCodeAt(pos + 1);
		if (code === dot && nextCode >= 48 && nextCode <= 57) {
			pos += 2;
			while (pos < length) {
				code = value.charCodeAt(pos);
				if (code < 48 || code > 57) break;
				pos += 1;
			}
		}
		code = value.charCodeAt(pos);
		nextCode = value.charCodeAt(pos + 1);
		nextNextCode = value.charCodeAt(pos + 2);
		if ((code === exp || code === EXP) && (nextCode >= 48 && nextCode <= 57 || (nextCode === plus || nextCode === minus) && nextNextCode >= 48 && nextNextCode <= 57)) {
			pos += nextCode === plus || nextCode === minus ? 3 : 2;
			while (pos < length) {
				code = value.charCodeAt(pos);
				if (code < 48 || code > 57) break;
				pos += 1;
			}
		}
		return {
			number: value.slice(0, pos),
			unit: value.slice(pos)
		};
	};
}));
//#endregion
//#region node_modules/.pnpm/@openmaic+generation@0.3.33/node_modules/@openmaic/generation/dist/interactive-library-mapper.js
var import_lib = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parse = require_parse();
	var walk = require_walk();
	var stringify = require_stringify();
	function ValueParser(value) {
		if (this instanceof ValueParser) {
			this.nodes = parse(value);
			return this;
		}
		return new ValueParser(value);
	}
	ValueParser.prototype.toString = function() {
		return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
	};
	ValueParser.prototype.walk = function(cb, bubble) {
		walk(this.nodes, cb, bubble);
		return this;
	};
	ValueParser.unit = require_unit();
	ValueParser.walk = walk;
	ValueParser.stringify = stringify;
	module.exports = ValueParser;
})))(), 1);
/**
* Whether a requested version is on the hosted release line: the same major
* (or the same 0.minor for pre-1.0 libraries with the `minor` policy).
* Unversioned/latest requests intentionally select our pin. Any concrete
* version on the line maps to the hosted one, higher or lower: generated
* pages often name a version that does not exist (e.g. `4.11.18` for
* `4.1.18`), and loading the hosted build beats a 404 that breaks the page.
*/
function compatible(requested, version, policy) {
	if (!requested || requested === "latest") return true;
	const match = /^(?:\^|~)?(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?$/.exec(requested);
	if (!match) return false;
	const hosted = version.split(".").map(Number);
	if (Number(match[1]) !== hosted[0]) return false;
	if (policy === "minor" && match[2] !== String(hosted[1])) return false;
	return true;
}
/**
* Rebase a self-hosted `<base>/<package>@<version>/<file>` path onto `baseUrl`,
* correcting the version of a hosted package to the hosted one when it is on
* the same release line. Other paths are rebased verbatim.
*/
function mapSelfHostedPath(rest, baseUrl) {
	const base = baseUrl.replace(/\/$/, "");
	const match = /^\/(@[^/]+\/[^/@]+|[^/@]+)@([^/]+)(\/.*)?$/.exec(rest);
	const library = match && INTERACTIVE_LIBRARIES.find((entry) => entry.package === match[1]);
	if (match && library && match[2] !== library.version && compatible(match[2], library.version, library.compatibility)) return `${base}/${library.package}@${library.version}${match[3] ?? ""}`;
	return base + rest;
}
function mapInteractiveLibraryUrl(input, baseUrl = interactiveAssetBaseUrl()) {
	const localBase = interactiveAssetBaseUrl().replace(/\/$/, "");
	if (input.startsWith(`/vendor/interactive/`)) return mapSelfHostedPath(input.slice(19), baseUrl);
	if (localBase.startsWith("/") && input.startsWith(`${localBase}/`)) return mapSelfHostedPath(input.slice(localBase.length), baseUrl);
	let url;
	try {
		url = new URL(input.startsWith("//") ? `https:${input}` : input);
	} catch {
		return;
	}
	if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port) return void 0;
	if (url.search || url.hash) return void 0;
	let name;
	let version;
	let file;
	if (url.hostname === "cdn.jsdelivr.net" || url.hostname === "unpkg.com") {
		const path = url.hostname === "cdn.jsdelivr.net" ? /^\/npm\/(.+)$/.exec(url.pathname)?.[1] : url.pathname.slice(1);
		if (!path) return void 0;
		if (path.includes("%")) return void 0;
		const match = /^(@[^/]+\/[^/@]+|[^/@]+)(?:@([^/]+))?(?:\/(.*))?$/.exec(path);
		if (!match) return void 0;
		name = match[1];
		version = match[2] ?? "";
		file = match[3] ?? "";
	} else if (url.hostname === "cdnjs.cloudflare.com") {
		const match = /^\/ajax\/libs\/([^/]+)\/([^/]+)\/(.+)$/.exec(url.pathname);
		if (!match) return void 0;
		const library = INTERACTIVE_LIBRARIES.find((entry) => entry.cdnjs === match[1]);
		if (!library) return void 0;
		name = library.package;
		version = match[2];
		file = match[3];
		if (name === "katex" && !file.startsWith("dist/")) file = `dist/${file}`;
		if (name === "three" && /^three(?:\.module)?(?:\.min)?\.js$/.test(file)) file = `build/${file}`;
	} else return void 0;
	const library = INTERACTIVE_LIBRARIES.find((entry) => entry.package === name);
	if (!library || !compatible(version, library.version, library.compatibility)) return void 0;
	if (!file) file = library.entry;
	file = library.aliases[file] ?? file;
	if (file.includes("..") || file.includes("%") || file.includes("\\")) return void 0;
	if (!library.files.some((entry) => file === entry || (entry === "build" || entry === "examples/jsm" || entry === "dist/fonts") && file.startsWith(`${entry}/`) && (file.endsWith(".js") || /\.(woff2?|ttf)$/.test(file) || file.endsWith("/")))) return void 0;
	return interactiveLibraryUrl(name, file, baseUrl);
}
function htmlNodes(html) {
	const nodes = [];
	const pending = [parse$2(html, { sourceCodeLocationInfo: true })];
	while (pending.length) {
		const node = pending.pop();
		nodes.push(node);
		if ("childNodes" in node) for (let index = node.childNodes.length - 1; index >= 0; index--) pending.push(node.childNodes[index]);
		if ("content" in node) pending.push(node.content);
	}
	return nodes;
}
function patchHtml(html, patches) {
	const chunks = [];
	let cursor = 0;
	for (const patch of patches.sort((a, b) => a.start - b.start)) {
		chunks.push(html.slice(cursor, patch.start), patch.text);
		cursor = patch.end;
	}
	chunks.push(html.slice(cursor));
	return chunks.join("");
}
/** Parser-based, source-preserving mapping. Unknown or invalid markup stays authored. */
function rewriteInteractiveLibraries(html, baseUrl = interactiveAssetBaseUrl()) {
	const unmatchedExternalHosts = Object.create(null);
	const patches = [];
	const map = (value) => {
		const mapped = mapInteractiveLibraryUrl(value, baseUrl);
		if (mapped) return mapped;
		try {
			const url = new URL(value.startsWith("//") ? `https:${value}` : value);
			const base = new URL(baseUrl, "https://openmaic.invalid");
			if (["https:", "http:"].includes(url.protocol) && !(url.origin === base.origin && url.pathname.startsWith(`${base.pathname.replace(/\/$/, "")}/`))) unmatchedExternalHosts[url.hostname] = (unmatchedExternalHosts[url.hostname] ?? 0) + 1;
		} catch {}
		return value;
	};
	for (const node of htmlNodes(html)) {
		if (!("tagName" in node)) continue;
		const attrName = node.tagName === "script" ? "src" : node.tagName === "link" ? "href" : void 0;
		const attr = node.attrs.find((entry) => entry.name === attrName);
		if (attr) {
			const mapped = map(attr.value);
			const location = node.sourceCodeLocation?.attrs?.[attr.name];
			if (mapped !== attr.value && location) {
				patches.push({
					start: location.startOffset,
					end: location.endOffset,
					text: `${attr.name}="${mapped.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`
				});
				for (const name of ["integrity", "crossorigin"]) {
					const range = node.sourceCodeLocation?.attrs?.[name];
					if (range) patches.push({
						start: range.startOffset,
						end: range.endOffset,
						text: name === "crossorigin" ? "crossorigin=\"anonymous\"" : ""
					});
				}
			}
		}
		const textNode = node.childNodes.find((child) => child.nodeName === "#text");
		const range = textNode?.sourceCodeLocation;
		if (!textNode || !range) continue;
		let rewritten = textNode.value;
		const type = node.attrs.find((entry) => entry.name === "type")?.value.trim().toLowerCase();
		if (node.tagName === "style") try {
			const css = postcss_default.parse(rewritten);
			css.walkAtRules(/^import$/i, (rule) => {
				const params = (0, import_lib.default)(rule.params);
				const first = params.nodes.find((entry) => entry.type !== "space" && entry.type !== "comment");
				const value = first?.type === "string" ? first : first?.type === "function" && first.value.toLowerCase() === "url" ? first.nodes.find((entry) => entry.type === "string" || entry.type === "word") : void 0;
				if (value && "value" in value) value.value = map(value.value);
				rule.params = params.toString();
			});
			rewritten = css.toString();
		} catch {}
		else if (node.tagName === "script" && type === "importmap") try {
			JSON.parse(rewritten);
			rewritten = rewritten.replace(/"(?:[^"\\]|\\.)*"(\s*:)?/g, (token, key) => {
				if (key) return token;
				const value = JSON.parse(token);
				const mapped = map(value);
				return mapped === value ? token : JSON.stringify(mapped).replace(/</g, "\\u003c");
			});
		} catch {}
		else if (node.tagName === "script" && type === "module") try {
			const [imports] = parse$1(rewritten);
			const edits = [];
			for (const entry of imports) {
				if (!entry.n || entry.d === -2) continue;
				const mapped = map(entry.n);
				if (mapped === entry.n) continue;
				const quoted = entry.d >= 0;
				edits.push({
					start: entry.s,
					end: entry.e,
					text: quoted ? JSON.stringify(mapped) : mapped
				});
			}
			rewritten = patchHtml(rewritten, edits);
		} catch {}
		if (rewritten !== textNode.value) patches.push({
			start: range.startOffset,
			end: range.endOffset,
			text: rewritten
		});
	}
	return {
		html: patchHtml(html, patches),
		unmatchedExternalHosts
	};
}
//#endregion
//#region node_modules/.pnpm/@openmaic+generation@0.3.33/node_modules/@openmaic/generation/dist/interactive-post-processor.js
/**
* Interactive HTML Post-Processor
*
* Ported from Python's PostProcessor class (learn-your-way/concept_to_html.py:287-385)
*
* Handles:
* - LaTeX delimiter conversion ($$...$$ -> \[...\], $...$ -> \(...\))
* - KaTeX CSS/JS injection with auto-render and MutationObserver
* - Script tag protection during LaTeX conversion
*/
/** Marks the KaTeX markup this module owns; a later pass replaces it instead of adding more. */
const KATEX_INJECTION_MARKER = "data-openmaic-katex";
/**
* Re-process stored HTML as well as newly generated pages. Platform-owned
* KaTeX markup (marked with {@link KATEX_INJECTION_MARKER}, including the
* #1966 CDN injection) is removed and injected again for the current asset
* base, so a page re-processed with the same base comes out byte-identical.
*/
function postProcessInteractiveHtml(html) {
	let processed = rewriteInteractiveLibraries(stripKatexInjection(html)).html;
	const patches = [];
	let hasMath = false;
	for (const node of htmlNodes(processed)) {
		if (node.nodeName !== "#text" || !("value" in node)) continue;
		let parent = node.parentNode;
		let excluded = false;
		while (parent) {
			if ("tagName" in parent && [
				"script",
				"style",
				"pre",
				"code",
				"textarea",
				"noscript",
				"title"
			].includes(parent.tagName)) excluded = true;
			parent = "parentNode" in parent ? parent.parentNode : null;
		}
		if (excluded) {
			if (node.parentNode && "tagName" in node.parentNode && node.parentNode.tagName === "script" && (scriptHasTex(node.value) || KATEX_CALL.test(node.value))) hasMath = true;
			continue;
		}
		const range = node.sourceCodeLocation;
		if (!range) continue;
		const source = processed.slice(range.startOffset, range.endOffset);
		if (/\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/.test(source)) hasMath = true;
		const converted = source.replace(/(?<!\\)\$\$([^$]+)\$\$/g, (_, tex) => {
			hasMath = true;
			return `\\[${tex}\\]`;
		}).replace(/(?<![\\\w$])\$(?![\s{])([^$\n]+?)(?<!\s)\$(?![\w${])/g, (_, tex) => {
			hasMath = true;
			return `\\(${tex}\\)`;
		});
		if (converted !== source) patches.push({
			start: range.startOffset,
			end: range.endOffset,
			text: converted
		});
	}
	processed = patchHtml(processed, patches);
	return hasMath ? injectKatex(processed) : processed;
}
/** Remove marked nodes together with the newline the injection puts before each, and after the last. */
function stripKatexInjection(html) {
	const ranges = htmlNodes(html).flatMap((node) => "attrs" in node && node.attrs.some((attr) => attr.name === KATEX_INJECTION_MARKER) && node.sourceCodeLocation ? [node.sourceCodeLocation] : []);
	if (!ranges.length) return html;
	const patches = ranges.map(({ startOffset, endOffset }) => ({
		start: html[startOffset - 1] === "\n" ? startOffset - 1 : startOffset,
		end: endOffset,
		text: ""
	}));
	const last = patches.reduce((a, b) => b.end > a.end ? b : a);
	if (html[last.end] === "\n") last.end += 1;
	return patchHtml(html, patches);
}
/** A page script that calls KaTeX needs the #1966 guards and the library. */
const KATEX_CALL = /\b(?:katex\s*\.\s*render(?:ToString)?|renderMathInElement)\s*\(/;
/** TeX delimiters and common commands after a single backslash. */
const TEX = /\\(?:[([]|begin\{|(?:frac|sqrt|sum|int|lim|cdot|times|div|pm|infty|alpha|beta|gamma|delta|theta|lambda|sigma|omega|Delta|vec|mathrm|mathbf)(?![A-Za-z]))/;
/** The same, JS-escaped (two backslashes) inside an ordinary string literal. */
const SCRIPT_TEX = new RegExp(`\\\\${TEX.source}`);
/** String.raw template literals keep TeX backslashes single. */
const RAW_TEMPLATE = /\bString\s*\.\s*raw\s*`((?:[^`\\]|\\[\s\S])*)`/g;
function scriptHasTex(source) {
	if (SCRIPT_TEX.test(source)) return true;
	for (const match of source.matchAll(RAW_TEMPLATE)) if (TEX.test(match[1])) return true;
	return false;
}
/**
* Inject KaTeX CSS, JS, auto-render, and a MutationObserver at the start of
* <head>, ahead of every script the page authored.
*
* - The libraries load synchronously before the page's own scripts, so
*   `katex` and `renderMathInElement` exist when those scripts and their
*   DOMContentLoaded handlers run. A page that loads its own KaTeX later
*   replaces these globals with the same library.
* - When the hosted asset fails to load, no-op stand-ins keep the page's own math
*   calls from throwing; the math then stays as written.
* - The render handler is registered before the page's handlers, so the
*   observer is already watching when the page fills its labels.
*/
function injectKatex(html) {
	return insertAtHeadStart(html, `
<link ${KATEX_INJECTION_MARKER}="2" rel="stylesheet" href="${interactiveLibraryUrl("katex", "dist/katex.min.css")}">
<script ${KATEX_INJECTION_MARKER}="2" src="${interactiveLibraryUrl("katex")}"><\/script>
<script ${KATEX_INJECTION_MARKER}="2" src="${interactiveLibraryUrl("katex", "dist/contrib/auto-render.min.js")}"><\/script>
<script ${KATEX_INJECTION_MARKER}="2">
(function () {
    if (!window.katex) {
        window.katex = {
            render: function (tex, element) {
                if (element) element.textContent = String(tex);
            },
            renderToString: function (tex) {
                return String(tex).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
        };
    }
    if (typeof window.renderMathInElement !== 'function') {
        window.renderMathInElement = function () {};
    }
})();
document.addEventListener("DOMContentLoaded", function() {
    const katexOptions = {
        delimiters: [
            {left: '\\\\[', right: '\\\\]', display: true},
            {left: '\\\\(', right: '\\\\)', display: false},
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ],
        throwOnError: false,
        strict: false,
        trust: true
    };

    function render() {
        try {
            renderMathInElement(document.body, katexOptions);
        } catch (e) {
            // A failed pass must not stop the observer from being installed.
        }
    }

    let renderTimeout;
    function safeRender() {
        if (renderTimeout) clearTimeout(renderTimeout);
        renderTimeout = setTimeout(render, 100);
    }

    render();

    const observer = new MutationObserver((mutations) => {
        let shouldRender = false;
        mutations.forEach((mutation) => {
            if (mutation.target &&
                mutation.target.className &&
                typeof mutation.target.className === 'string' &&
                mutation.target.className.includes('katex')) {
                return;
            }
            shouldRender = true;
        });

        if (shouldRender) {
            safeRender();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    setInterval(() => {
        const text = document.body.innerText;
        if (text.includes('\\\\(') || text.includes('$$')) {
            safeRender();
        }
    }, 2000);
});
<\/script>
`);
}
/**
* Insert markup at the start of the document's <head> without rewriting the
* authored bytes. A document without an explicit <head> gets one after its
* <html> start tag or doctype; anything else gets the markup prepended.
*
* Offsets come from parse5, so a `<head>` inside a script or comment is never
* mistaken for the element. The markup is spliced with string slicing, not
* `String.replace()`, because it contains `$` characters.
*/
function insertAtHeadStart(html, markup) {
	const document = parse$2(html, { sourceCodeLocationInfo: true });
	const htmlElement = document.childNodes.find((node) => isElement(node) && node.tagName === "html");
	const headElement = htmlElement?.childNodes.find((node) => isElement(node) && node.tagName === "head");
	const insertAt = (offset, text) => html.slice(0, offset) + text + html.slice(offset);
	const headStartEnd = headElement?.sourceCodeLocation?.startTag?.endOffset;
	if (headStartEnd !== void 0) return insertAt(headStartEnd, markup);
	const htmlStartEnd = htmlElement?.sourceCodeLocation?.startTag?.endOffset;
	if (htmlStartEnd !== void 0) return insertAt(htmlStartEnd, `<head>${markup}</head>`);
	const doctypeEnd = document.childNodes.find((node) => node.nodeName === "#documentType")?.sourceCodeLocation?.endOffset;
	if (doctypeEnd !== void 0) return insertAt(doctypeEnd, `<head>${markup}</head>`);
	return markup + html;
}
function isElement(node) {
	return !node.nodeName.startsWith("#");
}
//#endregion
//#region node_modules/.pnpm/@openmaic+dsh-openmaic@https+++codeload.github.com+THU-MAIC+dsh-openmaic+tar.gz+09c1693_e55244188a52a66a7ab63ee30ff9269f/node_modules/@openmaic/dsh-openmaic/lib/index.js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** Pull the openmaic_access value out of a Set-Cookie header. */
function extractAccessCookie(setCookie) {
	if (!setCookie) return void 0;
	return /(?:^|[;,\s])openmaic_access=([^;,\s]+)/.exec(setCookie)?.[1];
}
async function readJson(res, step) {
	const text = await res.text();
	if (!res.ok) throw new Error(`openmaic_generate: ${step} failed (${res.status}): ${text.slice(0, 300)}`);
	try {
		return JSON.parse(text);
	} catch {
		throw new Error(`openmaic_generate: ${step} returned non-JSON: ${text.slice(0, 200)}`);
	}
}
async function generateClassroom(options) {
	const doFetch = options.fetch ?? fetch;
	const baseUrl = options.baseUrl.replace(/\/+$/, "");
	let cookie = "";
	if (options.accessCode !== "") {
		const verifyRes = await doFetch(`${baseUrl}/api/access-code/verify`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ code: options.accessCode })
		});
		if (!verifyRes.ok) {
			const body = await verifyRes.text();
			throw new Error(`openmaic_generate: access-code verify failed (${verifyRes.status}): ${body.slice(0, 300)}`);
		}
		const value = extractAccessCookie(verifyRes.headers.get("set-cookie"));
		if (value !== void 0) cookie = `openmaic_access=${value}`;
	}
	const cookieHeader = cookie === "" ? {} : { cookie };
	const body = { requirement: options.requirement };
	if (options.language !== void 0) body.language = options.language;
	if (options.enableWebSearch !== void 0) body.enableWebSearch = options.enableWebSearch;
	if (options.enableImageGeneration !== void 0) body.enableImageGeneration = options.enableImageGeneration;
	if (options.enableVideoGeneration !== void 0) body.enableVideoGeneration = options.enableVideoGeneration;
	if (options.enableTTS !== void 0) body.enableTTS = options.enableTTS;
	if (options.agentMode !== void 0) body.agentMode = options.agentMode;
	const submit = await readJson(await doFetch(`${baseUrl}/api/generate-classroom`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...cookieHeader
		},
		body: JSON.stringify(body)
	}), "generate-classroom");
	const jobId = typeof submit.jobId === "string" ? submit.jobId : void 0;
	const pollUrl = typeof submit.pollUrl === "string" && submit.pollUrl !== "" ? submit.pollUrl : void 0;
	if (pollUrl === void 0) throw new Error("openmaic_generate: generate-classroom response is missing pollUrl");
	const deadline = Date.now() + options.maxWaitMs;
	for (;;) {
		const poll = await readJson(await doFetch(pollUrl, { headers: cookieHeader }), "poll");
		const status = typeof poll.status === "string" ? poll.status : "";
		if (status === "succeeded") {
			const classroomId = typeof poll.result?.classroomId === "string" ? poll.result.classroomId : "";
			if (classroomId === "") throw new Error("openmaic_generate: job succeeded but the result has no classroomId");
			return {
				status: "succeeded",
				classroomId,
				url: typeof poll.result?.url === "string" && poll.result.url !== "" ? poll.result.url : `${baseUrl}/classroom/${classroomId}`
			};
		}
		if (status === "failed") {
			const message = typeof poll.message === "string" && poll.message !== "" ? poll.message : "generation failed";
			return {
				status: "failed",
				jobId,
				error: `openmaic_generate: classroom generation failed${jobId === void 0 ? "" : ` (jobId: ${jobId})`}: ${message}`
			};
		}
		if (Date.now() >= deadline) return {
			status: "timeout",
			jobId,
			error: `openmaic_generate: classroom is still generating in the background${jobId === void 0 ? "" : ` (jobId: ${jobId})`}. Check back later.`
		};
		await sleep(options.pollIntervalMs);
	}
}
/**
* Pure shared contract for the `openmaic_render` tool: fragment validation and
* the `tool/result` meta descriptor. No I/O and no DOM, so the node half, the
* browser half, and vitest all load it unchanged.
*
* A fragment is the model-authored inline-HTML body of one teaching card:
* literal markup without a document skeleton. The card owns the skeleton (it
* wraps the fragment in a sandboxed iframe document with its own CSP), so a
* fragment that ships its own `<!doctype>`/`<html>`/`<head>`/`<body>` would
* nest documents and is rejected loudly instead of rendered broken.
*
* @module @openmaic/dsh-openmaic/fragment
*/
/** Wire name of the tool, the keyed toolview, and the streaming-preview match. */
const OPENMAIC_RENDER_TOOL_NAME = "openmaic_render";
/** Document-skeleton tags a fragment must not contain (case-insensitive). */
const SKELETON_TAG = /<!doctype\b|<\s*(?:html|head|body)\b/iu;
/** UTF-8 byte length of a string. */
function byteLength(text) {
	return new TextEncoder().encode(text).length;
}
/**
* Validate one fragment against the inline contract.
* @param fragment - the markup the model wrote.
* @param maxBytes - deployment size ceiling for one fragment.
* @returns the fragment's UTF-8 size in bytes.
* @throws Error naming the violated rule; the tool surfaces it as `isError`.
*/
function validateFragment(fragment, maxBytes) {
	if (fragment.trim().length === 0) throw new Error("invalid openmaic fragment: the fragment is empty");
	const sizeBytes = byteLength(fragment);
	if (sizeBytes > maxBytes) throw new Error(`invalid openmaic fragment: fragment is ${sizeBytes} bytes, over the ${maxBytes}-byte limit; shrink the inline data first`);
	const skeleton = SKELETON_TAG.exec(fragment);
	if (skeleton) throw new Error(`invalid openmaic fragment: fragment contains a document-skeleton tag (${JSON.stringify(skeleton[0])}); write only the inline body`);
	return sizeBytes;
}
/**
* Narrow an opaque `tool/result` meta into a well-formed {@link OpenmaicMeta}.
* @param meta - the persisted meta value.
* @returns the narrowed descriptor, or `undefined` on any mismatch.
*/
function openmaicMetaFrom(meta) {
	if (typeof meta !== "object" || meta === null) return void 0;
	const m = meta;
	if (m.kind !== "openmaic-render") return void 0;
	if (typeof m.fragment !== "string" || typeof m.title !== "string") return void 0;
	return {
		kind: "openmaic-render",
		fragment: m.fragment,
		title: m.title
	};
}
/**
* The model-facing `openmaic_render` tool: take one inline-HTML teaching
* fragment as a direct argument, validate it against the inline contract, and
* project it into the persisted `tool/result` meta so the browser half renders
* it as a sandboxed card and replay reproduces the same card byte for byte.
*
* Passing the markup as an argument (rather than a file path) keeps the node
* half free of any filesystem dependency; the model-facing result stays a
* one-line confirmation so the fragment (already in the model's own output)
* is not re-echoed into context.
*
* @module @openmaic/dsh-openmaic/tool
*/
/** Size ceiling for one fragment; teaching cards should stay well under it. */
const MAX_FRAGMENT_BYTES = 262144;
const DESCRIPTION$2 = "Show the user an interactive OpenMAIC teaching card (a concept card, quiz, step-by-step walkthrough, or slide) rendered inline in the conversation. Pass the markup in `fragment`: literal inline HTML only, no document skeleton. Load the `openmaic-render` skill for the authoring contract first.";
/**
* Build the `openmaic_render` tool definition.
* @returns the tool definition to register on `ctx.tools`.
*/
function openmaicRenderTool() {
	return defineTool({
		name: OPENMAIC_RENDER_TOOL_NAME,
		description: DESCRIPTION$2,
		parameters: {
			fragment: {
				type: "string",
				required: true,
				description: "The inline HTML fragment to render (markup, style, and script; no <!doctype>, <html>, <head>, or <body>)."
			},
			title: {
				type: "string",
				description: "Concise card title. Defaults to \"OpenMAIC 课堂\"."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					title: {
						type: "string",
						required: true
					},
					sizeBytes: {
						type: "integer",
						required: true
					},
					fragment: {
						type: "string",
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `Rendered "${value.title}" inline (${value.sizeBytes} bytes). The user sees the interactive card in the conversation.`
			}],
			presentationMeta: (_args, value) => ({
				kind: "openmaic-render",
				fragment: value.fragment,
				title: value.title
			})
		},
		isConcurrencySafe: () => true,
		async execute(args) {
			const sizeBytes = validateFragment(args.fragment, MAX_FRAGMENT_BYTES);
			return {
				title: args.title?.trim() || "OpenMAIC 课堂",
				sizeBytes,
				fragment: args.fragment
			};
		},
		presentCall: () => ({
			card: "generic",
			title: "OpenMAIC",
			kind: "other"
		}),
		presentResult(_args, result) {
			if (result.isError) return void 0;
			const meta = openmaicMetaFrom(result.meta);
			if (meta === void 0) return void 0;
			return {
				card: "generic",
				title: `OpenMAIC · ${meta.title}`
			};
		}
	});
}
/**
* Bundled skill provider for dsh-openmaic: the two authoring contracts the
* model loads before its first `openmaic_render` / `openmaic_widget` call.
* Mirrors the official `dsh-skill-badge` provider shape: bundled candidates
* whose bodies ship in this package's `assets/`.
*
* @module @openmaic/dsh-openmaic/skill
*/
const PROVIDER_NAME = "dsh-openmaic";
const RESOURCE_BASE = {
	kind: "directory",
	path: fileURLToPath(new URL("../assets/", import.meta.url))
};
const INVOCATION = {
	modelInvocable: true,
	userInvocable: true
};
const CANDIDATES = [
	{
		name: "openmaic-render",
		description: "Authoring contract for the openmaic_render tool, which renders interactive teaching cards inline in the conversation: concept cards, self-grading quizzes, step-by-step walkthroughs, and slides. Load before the first openmaic_render call in a session.",
		invocation: INVOCATION,
		provider: PROVIDER_NAME,
		source: "bundled",
		resourceBase: RESOURCE_BASE,
		rank: BUNDLED_SKILL_RANK,
		locator: new URL("../assets/openmaic-render.md", import.meta.url)
	},
	{
		name: "openmaic-widget",
		description: "Authoring contract for the openmaic_widget tool, which renders OpenMAIC interactive widgets inline: simulations, games, and code challenges. Load before the first openmaic_widget call in a session; it defines the widget structure, the embedded widget-config, and the postMessage listener.",
		invocation: INVOCATION,
		provider: PROVIDER_NAME,
		source: "bundled",
		resourceBase: RESOURCE_BASE,
		rank: BUNDLED_SKILL_RANK,
		locator: new URL("../assets/openmaic-widget.md", import.meta.url)
	},
	{
		name: "openmaic-slide",
		description: "Authoring contract for the openmaic_slide tool, which renders one OpenMAIC slide (PPTist-style Slide JSON) inline. Load before the first openmaic_slide call in a session; it defines the slide shape, element kinds, and geometry the tool validates.",
		invocation: INVOCATION,
		provider: PROVIDER_NAME,
		source: "bundled",
		resourceBase: RESOURCE_BASE,
		rank: BUNDLED_SKILL_RANK,
		locator: new URL("../assets/openmaic-slide.md", import.meta.url)
	},
	{
		name: "openmaic-teach",
		description: "Turn the current session into a Socratic OpenMAIC teaching session: teach by guided questioning and dynamically render slides, widgets, and concept cards as aids. Load it when the user wants to learn a topic.",
		invocation: INVOCATION,
		provider: PROVIDER_NAME,
		source: "bundled",
		resourceBase: RESOURCE_BASE,
		rank: BUNDLED_SKILL_RANK,
		locator: new URL("../assets/openmaic-teach.md", import.meta.url)
	}
];
/** The bundled provider registered on `ctx.skills`. */
const openmaicSkillProvider = {
	name: PROVIDER_NAME,
	list: () => Promise.resolve(CANDIDATES),
	async get(candidate) {
		const match = CANDIDATES.find((c) => c.name === candidate.name) ?? CANDIDATES[0];
		return {
			name: match.name,
			description: match.description,
			invocation: match.invocation,
			provider: match.provider,
			source: match.source,
			resourceBase: RESOURCE_BASE,
			content: await readFile(match.locator, "utf8")
		};
	}
};
/** Wire name of the tool and of the keyed toolview. */
const OPENMAIC_WIDGET_TOOL_NAME = "openmaic_widget";
/** The widget types v0.3 wires up first. */
const SUPPORTED_WIDGET_TYPES = [
	"simulation",
	"game",
	"code"
];
/**
* Narrow an opaque `tool/result` meta into a well-formed {@link WidgetMeta}.
* @param meta - the persisted meta value.
* @returns the narrowed descriptor, or `undefined` on any mismatch.
*/
function widgetMetaFrom(meta) {
	if (typeof meta !== "object" || meta === null) return void 0;
	const m = meta;
	if (m.kind !== "openmaic-widget") return void 0;
	if (typeof m.html !== "string" || typeof m.title !== "string") return void 0;
	if (m.widgetType !== "simulation" && m.widgetType !== "game" && m.widgetType !== "code") return void 0;
	return {
		kind: "openmaic-widget",
		html: m.html,
		title: m.title,
		widgetType: m.widgetType
	};
}
/**
* `openmaic_widget` tool: render a complete OpenMAIC widget document the model
* wrote (following the bundled `openmaic-widget` skill) as a sandboxed card.
* The model streams the HTML in its own output, so there is no tool-side LLM
* call and no timeout; the tool just post-processes (LaTeX to KaTeX) and
* projects the document into persisted meta for the browser half to render.
*
* @module @openmaic/dsh-openmaic/widget
*/
const DESCRIPTION$1 = "Render a complete OpenMAIC widget HTML document inline. Write the full document (with <!doctype>/<html>/<head>/<body>, an embedded widget-config JSON, and the postMessage listener) by following the openmaic-widget skill, then pass it in `html` with the `widgetType` and a short `title`.";
/**
* Build the `openmaic_widget` tool definition.
* @returns the tool definition to register on `ctx.tools`.
*/
function openmaicWidgetTool() {
	return defineTool({
		name: OPENMAIC_WIDGET_TOOL_NAME,
		description: DESCRIPTION$1,
		parameters: {
			html: {
				type: "string",
				required: true,
				description: "The complete widget HTML document (simulation, game, or code), written per the openmaic-widget skill contract."
			},
			widgetType: {
				type: "string",
				enum: [...SUPPORTED_WIDGET_TYPES],
				description: "Widget kind: simulation, game, or code. Defaults to simulation."
			},
			title: {
				type: "string",
				description: "Concise widget title. Defaults to \"OpenMAIC 课堂\"."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					html: {
						type: "string",
						required: true
					},
					title: {
						type: "string",
						required: true
					},
					widgetType: {
						type: "string",
						required: true,
						enum: [...SUPPORTED_WIDGET_TYPES]
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `Rendered the ${value.widgetType} widget "${value.title}" inline.`
			}],
			presentationMeta: (_args, value) => ({
				kind: "openmaic-widget",
				html: value.html,
				title: value.title,
				widgetType: value.widgetType
			})
		},
		isConcurrencySafe: () => true,
		async execute(args) {
			const html = typeof args.html === "string" ? args.html.trim() : "";
			if (html === "") throw new Error("openmaic_widget: html is required");
			const title = typeof args.title === "string" && args.title.trim() !== "" ? args.title.trim() : "OpenMAIC 课堂";
			const widgetType = args.widgetType ?? "simulation";
			return {
				html: postProcessInteractiveHtml(html),
				title,
				widgetType
			};
		},
		presentCall: () => ({
			card: "generic",
			title: "OpenMAIC widget",
			kind: "other"
		}),
		presentResult(_args, result) {
			if (result.isError) return void 0;
			const meta = widgetMetaFrom(result.meta);
			if (meta === void 0) return void 0;
			return {
				card: "generic",
				title: `OpenMAIC · ${meta.title}`
			};
		}
	});
}
/**
* Pure shared contract for the `openmaic_slide` tool: the wire name and the
* `tool/result` meta descriptor carrying one OpenMAIC slide (the
* `@openmaic/dsl` Slide object). No I/O and no host-package value import, so
* the node half, the browser half, and vitest all load it unchanged.
*
* @module @openmaic/dsh-openmaic/slide-meta
*/
/** Wire name of the tool and of the keyed toolview. */
const OPENMAIC_SLIDE_TOOL_NAME = "openmaic_slide";
/**
* Narrow an opaque `tool/result` meta into a well-formed {@link SlideMeta}.
* @param meta - the persisted meta value.
* @returns the narrowed descriptor, or `undefined` on any mismatch.
*/
function slideMetaFrom(meta) {
	if (typeof meta !== "object" || meta === null) return void 0;
	const m = meta;
	if (m.kind !== "openmaic-slide") return void 0;
	if (typeof m.title !== "string") return void 0;
	if (typeof m.slide !== "object" || m.slide === null || Array.isArray(m.slide)) return void 0;
	return {
		kind: "openmaic-slide",
		slide: m.slide,
		title: m.title
	};
}
/**
* `openmaic_slide` tool: render one OpenMAIC slide inline. The model writes
* the slide JSON per the bundled `openmaic-slide` skill (which follows the
* @openmaic/generation slide-content contract, outputting `{background,
* elements}`). The tool normalizes it into a full PPTist Slide — it owns the
* canvas size and ratio (1280 × 720, i.e. viewportRatio 9/16) so the model
* cannot get the geometry wrong — and the browser half renders it with
* `@openmaic/renderer`'s SlideCanvas.
*
* @module @openmaic/dsh-openmaic/slide
*/
const CANVAS_WIDTH = 1280;
/** 9/16: the PPTist/renderer convention is height = width * viewportRatio. */
const CANVAS_RATIO = .5625;
const DEFAULT_THEME = {
	backgroundColor: "#ffffff",
	themeColors: [
		"#5b9bd5",
		"#ed7d31",
		"#a5a5a5",
		"#ffc000",
		"#4472c4",
		"#70ad47"
	],
	fontColor: "#333333",
	fontName: "Arial"
};
const DESCRIPTION = "Render one OpenMAIC slide inline. Write the slide JSON as an object with an `elements` array (and optional `background`) per the openmaic-slide skill, then pass it in `slide` with a short `title`.";
/** Normalize a model-authored slide into a full PPTist Slide. */
function normalizeSlide(input) {
	const elements = Array.isArray(input.elements) ? input.elements : [];
	return {
		id: typeof input.id === "string" && input.id !== "" ? input.id : crypto.randomUUID(),
		viewportSize: typeof input.viewportSize === "number" ? input.viewportSize : CANVAS_WIDTH,
		viewportRatio: typeof input.viewportRatio === "number" ? input.viewportRatio : CANVAS_RATIO,
		theme: input.theme && typeof input.theme === "object" ? input.theme : DEFAULT_THEME,
		...input.background && typeof input.background === "object" ? { background: input.background } : {},
		elements
	};
}
/**
* Build the `openmaic_slide` tool definition.
* @returns the tool definition to register on `ctx.tools`.
*/
function openmaicSlideTool() {
	return defineTool({
		name: OPENMAIC_SLIDE_TOOL_NAME,
		description: DESCRIPTION,
		parameters: {
			slide: {
				type: "object",
				required: true,
				additionalProperties: true,
				description: "The slide JSON: an object with an `elements` array (and optional `background`), per the openmaic-slide skill."
			},
			title: {
				type: "string",
				description: "Concise slide title. Defaults to \"OpenMAIC 幻灯片\"."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					slide: {
						type: "object",
						required: true,
						additionalProperties: true
					},
					title: {
						type: "string",
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `Rendered the slide "${value.title}" inline.`
			}],
			presentationMeta: (_args, value) => ({
				kind: "openmaic-slide",
				slide: value.slide,
				title: value.title
			})
		},
		isConcurrencySafe: () => true,
		async execute(args) {
			const raw = args.slide;
			if (!Array.isArray(raw.elements) || raw.elements.length === 0) throw new Error("openmaic_slide: slide must have a non-empty `elements` array");
			const title = typeof args.title === "string" && args.title.trim() !== "" ? args.title.trim() : "OpenMAIC 幻灯片";
			return {
				slide: normalizeSlide(raw),
				title
			};
		},
		presentCall: () => ({
			card: "generic",
			title: "OpenMAIC slide",
			kind: "other"
		}),
		presentResult(_args, result) {
			if (result.isError) return void 0;
			const meta = slideMetaFrom(result.meta);
			if (meta === void 0) return void 0;
			return {
				card: "generic",
				title: `OpenMAIC · ${meta.title}`
			};
		}
	});
}
const name = "dsh-openmaic";
const inject = [
	"tools",
	"systemPrompt",
	"skills"
];
const DEFAULT_BASE_URL = "https://open.maic.chat";
const Config = z.object({
	baseUrl: z.string().default(DEFAULT_BASE_URL).description("OpenMAIC API base URL. Point it at http://localhost:3000 to develop against a local OpenMAIC instance."),
	accessCode: z.string().role("secret").default("").description("Invite code for open.maic.chat. Access codes are not enforced online yet, so leave it empty; fill it in once they are enabled."),
	pollIntervalMs: z.number().step(1).min(1e3).default(5e3).description("Polling interval in milliseconds. Classroom generation is slow, so 60000 is friendlier than the default."),
	maxWaitMs: z.number().step(1).min(1e3).default(6e5).description("How long to poll one job before giving up, in milliseconds (default 10 minutes).")
});
const GENERATE_PROMPT_TEXT = `## Generate OpenMAIC classroom (openmaic_generate)
Use openmaic_generate when the user asks you to create or prepare a lesson, course, or classroom (for example "帮我做一节 XX 课" or "make a lesson about X"). Put the teaching requirement in \`requirement\`. The tool submits an async job to open.maic.chat, waits for it, and returns a playable classroom URL. Only pass the optional flags (language, enableWebSearch, enableImageGeneration, enableVideoGeneration, enableTTS, agentMode) when the user actually asked for them. On success, show the returned Classroom URL to the user as a bare link they can open.`;
const RENDER_PROMPT_TEXT = `## Render OpenMAIC teaching card (openmaic_render)
Use openmaic_render when a visual helps more than text: explaining a concept, giving a quiz, walking through an algorithm or a multi-step process, or showing a slide. Write the card as an inline HTML fragment (markup + style + optional script, no <!doctype>/<html>/<head>/<body>) and pass it in \`fragment\` with a short \`title\`. Load the openmaic-render skill for the fragment contract before the first call.`;
const WIDGET_PROMPT_TEXT = `## Render OpenMAIC interactive widget (openmaic_widget)
Use openmaic_widget when the user wants an interactive teaching widget: a simulation, a quiz or puzzle game, or a runnable code challenge. Load the openmaic-widget skill, pick a \`widgetType\` (simulation, game, or code), write the complete HTML document per the template, then call openmaic_widget with it in \`html\`. The code streams as you write it; the tool renders the finished document inline. Prefer it over openmaic_render for anything that should be genuinely interactive.`;
const SLIDE_PROMPT_TEXT = `## Render OpenMAIC slide (openmaic_slide)
Use openmaic_slide when the user wants a structured slide (a single PPT-style page) rendered inline. Load the openmaic-slide skill, write the slide JSON (PPTist-style Slide: viewportSize, viewportRatio, and an elements array of text/image/shape/chart/code/latex/table elements), then call openmaic_slide with it in \`slide\` and a short \`title\`. The tool renders it with OpenMAIC's official renderer, so charts, formulas, and code all render.`;
const TEXT_OUTPUT = {
	schema: { type: "string" },
	render: (_args, value) => [{
		type: "text",
		text: String(value)
	}]
};
function apply(ctx, config) {
	const resolved = {
		baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
		accessCode: config.accessCode ?? "",
		pollIntervalMs: config.pollIntervalMs ?? 5e3,
		maxWaitMs: config.maxWaitMs ?? 6e5
	};
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "openmaic_generate",
		description: "Generate an OpenMAIC classroom (an interactive AI lesson) from a teaching requirement and return a playable classroom URL. Submit the requirement, wait for the async generation job, and hand back the link.",
		parameters: {
			requirement: {
				type: "string",
				required: true,
				description: "What the lesson should teach, in natural language, e.g. \"quantum physics for beginners\" or \"帮我做一节量子物理入门课\"."
			},
			language: {
				type: "string",
				enum: ["zh-CN", "en-US"],
				description: "Language of the generated classroom. zh-CN (Chinese) or en-US (English)."
			},
			enableWebSearch: {
				type: "boolean",
				description: "Let the generation pipeline search the web for up-to-date material."
			},
			enableImageGeneration: {
				type: "boolean",
				description: "Generate images for the lesson slides."
			},
			enableVideoGeneration: {
				type: "boolean",
				description: "Generate video for the lesson."
			},
			enableTTS: {
				type: "boolean",
				description: "Enable text-to-speech narration for the classroom agents."
			},
			agentMode: {
				type: "string",
				enum: ["default", "generate"],
				description: "Generation mode. default or generate."
			}
		},
		output: TEXT_OUTPUT,
		timeoutMs: resolved.maxWaitMs,
		isConcurrencySafe: () => true,
		execute: async (args) => {
			const input = args;
			const requirement = typeof input.requirement === "string" ? input.requirement : "";
			if (requirement === "") throw new Error("openmaic_generate: requirement is required");
			const outcome = await generateClassroom({
				baseUrl: resolved.baseUrl,
				accessCode: resolved.accessCode,
				pollIntervalMs: resolved.pollIntervalMs,
				maxWaitMs: resolved.maxWaitMs,
				requirement,
				language: typeof input.language === "string" ? input.language : void 0,
				enableWebSearch: typeof input.enableWebSearch === "boolean" ? input.enableWebSearch : void 0,
				enableImageGeneration: typeof input.enableImageGeneration === "boolean" ? input.enableImageGeneration : void 0,
				enableVideoGeneration: typeof input.enableVideoGeneration === "boolean" ? input.enableVideoGeneration : void 0,
				enableTTS: typeof input.enableTTS === "boolean" ? input.enableTTS : void 0,
				agentMode: typeof input.agentMode === "string" ? input.agentMode : void 0
			});
			if (outcome.status === "succeeded") return `Classroom ID: ${outcome.classroomId}\nClassroom URL:\n${outcome.url}`;
			throw new Error(outcome.error);
		}
	})), "dsh-openmaic.generate");
	ctx.effect(() => ctx.tools.register(openmaicRenderTool()), "dsh-openmaic.render");
	ctx.effect(() => ctx.tools.register(openmaicWidgetTool()), "dsh-openmaic.widget");
	ctx.effect(() => ctx.tools.register(openmaicSlideTool()), "dsh-openmaic.slide");
	ctx.effect(() => ctx.skills.registerProvider(() => openmaicSkillProvider), "dsh-openmaic.skill");
	ctx.effect(() => ctx.systemPrompt.section({
		name: "tool:dsh-openmaic",
		order: 117,
		text: GENERATE_PROMPT_TEXT
	}), "dsh-openmaic.generate-prompt");
	ctx.effect(() => ctx.systemPrompt.section({
		name: "tool:dsh-openmaic-render",
		order: 118,
		text: RENDER_PROMPT_TEXT
	}), "dsh-openmaic.render-prompt");
	ctx.effect(() => ctx.systemPrompt.section({
		name: "tool:dsh-openmaic-widget",
		order: 119,
		text: WIDGET_PROMPT_TEXT
	}), "dsh-openmaic.widget-prompt");
	ctx.effect(() => ctx.systemPrompt.section({
		name: "tool:dsh-openmaic-slide",
		order: 120,
		text: SLIDE_PROMPT_TEXT
	}), "dsh-openmaic.slide-prompt");
}
//#endregion
export { Config, apply, inject, name };
