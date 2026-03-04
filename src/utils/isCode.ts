/**
 * Code detection utilities
 * Ported from EcoPaste-Sync Rust implementation
 */

export interface CodeDetectionResult {
	isCode: boolean;
	language?: string;
}

const containsMultiple = (
	text: string,
	keywords: string[],
	minMatches: number,
): boolean => {
	const lower = text.toLowerCase();
	let matches = 0;
	for (const kw of keywords) {
		if (lower.includes(kw.toLowerCase())) {
			matches++;
		}
	}
	return matches >= minMatches;
};

const isLogFormat = (text: string): boolean => {
	// Timestamp pattern
	if (/\[\d{4}-\d{2}-\d{2}.*?\d{2}:\d{2}:\d{2}/.test(text)) {
		return true;
	}
	// Log level pattern
	if (/\[(DEBUG|INFO|WARN|ERROR|FATAL|CRITICAL|TRACE|NOTICE)\]/.test(text)) {
		return true;
	}
	return false;
};

const isNaturalLanguage = (text: string): boolean => {
	if (isLogFormat(text)) return true;

	const commonWords = [
		"the",
		"and",
		"or",
		"but",
		"in",
		"on",
		"at",
		"to",
		"for",
		"of",
		"with",
		"by",
		"from",
		"this",
		"that",
		"which",
		"what",
		"when",
		"where",
		"who",
		"how",
		"is",
		"are",
		"was",
		"were",
		"have",
		"has",
		"had",
		"been",
		"being",
		"can",
		"could",
		"will",
		"would",
		"should",
		"may",
	];

	const words = text.split(/\s+/).filter((w) => w.length > 2);
	if (words.length === 0) return false;

	let commonCount = 0;
	for (const w of words) {
		if (commonWords.includes(w.toLowerCase())) {
			commonCount++;
		}
	}

	const ratio = commonCount / words.length;
	return ratio > 0.3;
};

const isSVG = (value: string) => {
	const cleanStr = value.trim();
	if (cleanStr.length < 6) return false;

	const svgRegex = /^(?:<\?xml[^>]*\?>\s*)?(?:<!doctype svg[^>]*>\s*)?(?:\s*)*<svg[^>]*>(?:[\s\S]*<\/svg>)?\s*$/i;
	const isBasicSkeleton = svgRegex.test(cleanStr) && (cleanStr.endsWith("</svg>") || cleanStr.endsWith("/>"));

	if (!isBasicSkeleton) return false;

	if (typeof DOMParser !== "undefined") {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(cleanStr, "image/svg+xml");
			const parserError = doc.getElementsByTagName("parsererror");
			if (parserError.length > 0) return false;
			return doc.documentElement.nodeName.toLowerCase() === "svg";
		} catch {
			return false;
		}
	}

	return true;
};

const quickLanguageDetection = (text: string): string | undefined => {
	const lower = text.toLowerCase();

	// JavaScript (Moved to the top because it's the most common and to prevent minified JS bitwise operators from triggering C++ first)
	if (
		containsMultiple(
			text,
			[
				"function ",
				"const ",
				"let ",
				"var ",
				"console.log",
				"=>",
				"import ",
				"export ",
				"webpackJsonp",
				"__webpack_require__",
				"prototype.",
				"Object.assign",
				"Object.create",
				"Object.keys",
			],
			2,
		) &&
		!lower.includes("class main")
	) {
		return "javascript";
	}

	// C++
	if (
		containsMultiple(
			text,
			[
				"int main",
				"cout",
				"cin",
				"std::",
				"using namespace std",
				"#include",
				"nullptr",
				"template<",
			],
			2,
		) ||
		containsMultiple(
			text,
			["const_cast", "dynamic_cast", "reinterpret_cast", "static_cast"],
			2,
		) ||
		(containsMultiple(text, ["#include", "using namespace", "std::"], 2) &&
			containsMultiple(text, ["int", "main"], 2))
	) {
		// Prevent minified JS from being detected as C++ if it has var/function
		if (containsMultiple(text, ["function", "var", "const", "let"], 2)) {
			return "javascript";
		}
		return "cpp";
	}

	// C
	if (
		containsMultiple(
			text,
			["#include", "printf", "scanf", "malloc", "free"],
			3,
		) &&
		!lower.includes("cout")
	) {
		return "c";
	}

	// Java
	if (
		containsMultiple(
			text,
			["public class", "public static void main", "System.out.println"],
			2,
		) &&
		!lower.includes("console.writeline")
	) {
		return "java";
	}

	// Python
	if (
		containsMultiple(text, ["def ", "import ", "print(", ":"], 2) &&
		!lower.includes("function")
	) {
		return "python";
	}

	// TypeScript
	if (
		containsMultiple(
			text,
			["interface ", "type ", "as ", ": string", ": number", ": boolean"],
			2,
		)
	) {
		return "typescript";
	}

	// Rust
	if (
		containsMultiple(
			text,
			[
				"fn ",
				"let mut",
				"println!",
				"use std::",
				"-> ",
				"match ",
				"impl ",
				"pub fn",
			],
			2,
		)
	) {
		return "rust";
	}

	// Go
	if (
		containsMultiple(
			text,
			["func main", "package main", 'import "', "fmt.", "go "],
			2,
		)
	) {
		return "go";
	}

	// C#
	if (
		containsMultiple(
			text,
			["using System", "public class", "Console.WriteLine", "namespace "],
			2,
		)
	) {
		return "csharp";
	}

	return undefined;
};

const isValidSql = (text: string): boolean => {
	const lower = text.toLowerCase();
	const sqlKeywords = [
		"select",
		"from",
		"where",
		"insert",
		"update",
		"delete",
		"create",
		"drop",
		"table",
		"index",
		"join",
		"inner",
		"left",
		"right",
		"group",
		"order",
		"by",
		"union",
		"distinct",
		"primary",
		"key",
		"foreign",
		"references",
		"not",
		"null",
		"default",
	];

	let found = 0;
	for (const kw of sqlKeywords) {
		if (lower.includes(` ${kw} `)) {
			found++;
		}
	}

	if (found < 3) return false;

	return /(select\s+.+\s+from|insert\s+into\s+.+\s+values|update\s+.+\s+set|delete\s+from\s+.+\s+where|create\s+table\s+|drop\s+table\s+)/.test(
		lower,
	);
};

export const detectCode = (
	content: string,
	minLength = 10,
): CodeDetectionResult => {
	const trimmed = content.trim();

	if (trimmed.length < minLength) {
		return { isCode: false };
	}

	if (isNaturalLanguage(trimmed)) {
		return { isCode: false };
	}

	// JSON
	if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
		try {
			JSON.parse(trimmed);
			return { isCode: true, language: "json" };
		} catch {
			// Not JSON
		}
	}

	// SVG
	if (isSVG(trimmed)) {
		return { isCode: true, language: "svg" };
	}

	// HTML
	if (trimmed.startsWith("<")) {
		if (
			/^<\s*(!doctype|html|head|body|div|script|style|link|meta|span|p|h[1-6])[\s>]/i.test(
				trimmed,
			)
		) {
			return { isCode: true, language: "html" };
		}
	}

	// CSS
	if (
		trimmed.startsWith(".") ||
		trimmed.startsWith("#") ||
		trimmed.startsWith("@")
	) {
		if (/^(\.[a-zA-Z].*\{|#[a-zA-Z].*\{|@media\s)/.test(trimmed)) {
			return { isCode: true, language: "css" };
		}
	}

	// SQL
	if (isValidSql(trimmed)) {
		return { isCode: true, language: "sql" };
	}

	// Quick Lang Detection
	const lang = quickLanguageDetection(trimmed);
	if (lang) {
		return { isCode: true, language: lang };
	}

	return { isCode: false };
};
