// Language auto-detection utility

interface LanguagePattern {
  language: string;
  patterns: RegExp[];
  keywords: string[];
  weight: number;
}

const languagePatterns: LanguagePattern[] = [
  {
    language: "javascript",
    patterns: [
      /\b(const|let|var)\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
      /=>\s*{/,
      /console\.log/,
      /require\(['"]/,
      /import\s+.*\s+from/,
    ],
    keywords: ["const", "let", "var", "function", "=>", "console"],
    weight: 1,
  },
  {
    language: "typescript",
    patterns: [
      /:\s*(string|number|boolean|any|void)/,
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /<.*>\s*\(/,
    ],
    keywords: ["interface", "type", "enum", "implements"],
    weight: 1.2,
  },
  {
    language: "python",
    patterns: [
      /def\s+\w+\s*\(/,
      /class\s+\w+:/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /if\s+__name__\s*==\s*['"]/,
      /#.*\n/,
    ],
    keywords: ["def", "class", "import", "from", "elif", "pass"],
    weight: 1,
  },
  {
    language: "java",
    patterns: [
      /public\s+(class|interface|enum)/,
      /private\s+(static\s+)?(final\s+)?[A-Z]\w+/,
      /System\.out\.print/,
      /@Override/,
      /extends\s+\w+/,
      /implements\s+\w+/,
    ],
    keywords: [
      "public",
      "private",
      "protected",
      "class",
      "extends",
      "implements",
    ],
    weight: 1,
  },
  {
    language: "c",
    patterns: [
      /#include\s*<.*>/,
      /int\s+main\s*\(/,
      /printf\s*\(/,
      /scanf\s*\(/,
      /struct\s+\w+/,
      /typedef\s+/,
    ],
    keywords: ["#include", "printf", "scanf", "struct", "typedef"],
    weight: 1,
  },
  {
    language: "cpp",
    patterns: [
      /#include\s*<iostream>/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /namespace\s+/,
      /template\s*</,
      /class\s+\w+\s*{/,
    ],
    keywords: ["std::", "cout", "cin", "namespace", "template", "class"],
    weight: 1.1,
  },
  {
    language: "csharp",
    patterns: [
      /using\s+System/,
      /namespace\s+\w+/,
      /public\s+class/,
      /static\s+void\s+Main/,
      /Console\.Write/,
    ],
    keywords: ["using", "namespace", "public", "class", "static"],
    weight: 1,
  },
  {
    language: "php",
    patterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /echo\s+/,
      /function\s+\w+\s*\(/,
      /->/,
      /::/,
    ],
    keywords: ["<?php", "echo", "function", "$_GET", "$_POST"],
    weight: 1,
  },
  {
    language: "ruby",
    patterns: [
      /def\s+\w+/,
      /class\s+\w+/,
      /require\s+['"]/,
      /puts\s+/,
      /end\s*$/m,
      /@\w+/,
    ],
    keywords: ["def", "class", "require", "puts", "end"],
    weight: 1,
  },
  {
    language: "go",
    patterns: [
      /package\s+main/,
      /func\s+\w+\s*\(/,
      /import\s+\(/,
      /fmt\.Print/,
      /:=/,
      /go\s+func/,
    ],
    keywords: ["package", "func", "import", "fmt", ":=", "go"],
    weight: 1,
  },
  {
    language: "rust",
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+mut/,
      /impl\s+\w+/,
      /println!/,
      /::\w+/,
      /&str/,
    ],
    keywords: ["fn", "let", "mut", "impl", "println!", "pub"],
    weight: 1,
  },
  {
    language: "html",
    patterns: [
      /<!DOCTYPE\s+html>/i,
      /<html/i,
      /<head>/i,
      /<body>/i,
      /<div/i,
      /<\/\w+>/,
    ],
    keywords: ["<!DOCTYPE", "<html", "<head", "<body", "<div"],
    weight: 1,
  },
  {
    language: "css",
    patterns: [
      /[\w-]+\s*:\s*[^;]+;/,
      /\.\w+\s*{/,
      /#\w+\s*{/,
      /@media/,
      /@import/,
      /!important/,
    ],
    keywords: ["color:", "margin:", "padding:", "@media", "!important"],
    weight: 1,
  },
  {
    language: "sql",
    patterns: [
      /SELECT\s+.*\s+FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+\w+\s+SET/i,
      /DELETE\s+FROM/i,
      /CREATE\s+TABLE/i,
      /WHERE\s+/i,
    ],
    keywords: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE"],
    weight: 1,
  },
  {
    language: "json",
    patterns: [/^\s*{/, /^\s*\[/, /"[\w-]+"\s*:/, /:\s*(true|false|null)/],
    keywords: ["{", "}", "[", "]", ":", "true", "false", "null"],
    weight: 0.8,
  },
  {
    language: "xml",
    patterns: [/<\?xml/, /<\w+[^>]*>/, /<\/\w+>/, /xmlns:/],
    keywords: ["<?xml", "xmlns:", "</"],
    weight: 0.8,
  },
  {
    language: "yaml",
    patterns: [/^\w+:/m, /^\s+-\s+/m, /:\s*$/m, /---/],
    keywords: ["---", ":", "-"],
    weight: 0.7,
  },
  {
    language: "bash",
    patterns: [
      /^#!/,
      /\$\w+/,
      /\|\s*\w+/,
      /echo\s+/,
      /if\s*\[\s*.*\s*\]/,
      /for\s+\w+\s+in/,
    ],
    keywords: ["#!/bin/bash", "echo", "if", "then", "fi", "for"],
    weight: 1,
  },
];

export const detectLanguage = (code: string): string => {
  if (!code || code.trim().length < 10) {
    return "plaintext";
  }

  const scores: { [key: string]: number } = {};

  // Initialize scores
  languagePatterns.forEach((pattern) => {
    scores[pattern.language] = 0;
  });

  // Check patterns
  languagePatterns.forEach((pattern) => {
    let patternMatches = 0;

    pattern.patterns.forEach((regex) => {
      if (regex.test(code)) {
        patternMatches++;
      }
    });

    // Check keywords
    let keywordMatches = 0;
    pattern.keywords.forEach((keyword) => {
      if (code.includes(keyword)) {
        keywordMatches++;
      }
    });

    // Calculate score
    scores[pattern.language] =
      (patternMatches * 2 + keywordMatches) * pattern.weight;
  });

  // Find language with highest score
  let maxScore = 0;
  let detectedLanguage = "plaintext";

  Object.entries(scores).forEach(([lang, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = lang;
    }
  });

  // If score is too low, return plaintext
  if (maxScore < 2) {
    return "plaintext";
  }

  return detectedLanguage;
};

// Get language suggestions based on partial detection
export const suggestLanguages = (code: string): string[] => {
  if (!code || code.trim().length < 5) {
    return ["javascript", "python", "java", "c", "cpp"];
  }

  const scores: Array<{ language: string; score: number }> = [];

  languagePatterns.forEach((pattern) => {
    let score = 0;

    pattern.patterns.forEach((regex) => {
      if (regex.test(code)) {
        score += 2;
      }
    });

    pattern.keywords.forEach((keyword) => {
      if (code.includes(keyword)) {
        score += 1;
      }
    });

    if (score > 0) {
      scores.push({
        language: pattern.language,
        score: score * pattern.weight,
      });
    }
  });

  // Sort by score and return top 5
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.language);
};

// Validate if language is supported
export const isSupportedLanguage = (language: string): boolean => {
  const supportedLanguages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c",
    "cpp",
    "csharp",
    "php",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "html",
    "css",
    "scss",
    "sql",
    "json",
    "xml",
    "yaml",
    "bash",
    "powershell",
    "plaintext",
  ];
  return supportedLanguages.includes(language.toLowerCase());
};
