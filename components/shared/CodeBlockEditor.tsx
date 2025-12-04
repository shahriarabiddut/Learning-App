import { Button } from "@/components/ui/button";
import { detectLanguage, suggestLanguages } from "@/lib/utils/languageDetector";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code2,
  Sparkles,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface CodeBlockEditorProps {
  value: string;
  language: string;
  onSave: (code: string, language: string) => void;
  onCancel: () => void;
}

// Language-specific keywords for autocomplete
const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  javascript: [
    "const",
    "let",
    "var",
    "function",
    "class",
    "if",
    "else",
    "for",
    "while",
    "return",
    "import",
    "export",
    "from",
    "async",
    "await",
    "try",
    "catch",
    "new",
    "this",
    "super",
    "extends",
    "implements",
    "break",
    "continue",
  ],
  typescript: [
    "const",
    "let",
    "var",
    "function",
    "class",
    "if",
    "else",
    "for",
    "while",
    "return",
    "import",
    "export",
    "from",
    "async",
    "await",
    "try",
    "catch",
    "new",
    "this",
    "super",
    "extends",
    "implements",
    "interface",
    "type",
    "enum",
    "public",
    "private",
    "protected",
    "readonly",
  ],
  python: [
    "def",
    "class",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "return",
    "import",
    "from",
    "as",
    "try",
    "except",
    "with",
    "lambda",
    "pass",
    "break",
    "continue",
    "and",
    "or",
    "not",
    "in",
    "is",
    "None",
    "True",
    "False",
  ],
  java: [
    "public",
    "private",
    "protected",
    "class",
    "void",
    "int",
    "String",
    "boolean",
    "if",
    "else",
    "for",
    "while",
    "return",
    "new",
    "static",
    "final",
    "extends",
    "implements",
    "try",
    "catch",
    "throw",
  ],
  c: [
    "int",
    "float",
    "double",
    "char",
    "void",
    "if",
    "else",
    "for",
    "while",
    "return",
    "struct",
    "typedef",
    "include",
    "printf",
    "scanf",
  ],
  cpp: [
    "int",
    "float",
    "double",
    "char",
    "void",
    "if",
    "else",
    "for",
    "while",
    "return",
    "class",
    "public",
    "private",
    "protected",
    "namespace",
    "using",
    "cout",
    "cin",
    "template",
  ],
};

// Simple syntax error detection
const detectSyntaxErrors = (code: string, language: string): string[] => {
  const errors: string[] = [];

  switch (language.toLowerCase()) {
    case "javascript":
    case "typescript":
    case "java":
    case "c":
    case "cpp":
    case "csharp":
      // Check for unmatched brackets
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(
          `Unmatched braces: ${openBraces} opening, ${closeBraces} closing`
        );
      }

      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push(
          `Unmatched parentheses: ${openParens} opening, ${closeParens} closing`
        );
      }

      const openBrackets = (code.match(/\[/g) || []).length;
      const closeBrackets = (code.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push(
          `Unmatched brackets: ${openBrackets} opening, ${closeBrackets} closing`
        );
      }

      // Check for unterminated strings
      const lines = code.split("\n");
      lines.forEach((line, index) => {
        // Remove comments first
        const withoutComments = line
          .replace(/\/\/.*/g, "")
          .replace(/\/\*.*?\*\//g, "");
        const doubleQuotes = (withoutComments.match(/"/g) || []).length;
        const singleQuotes = (withoutComments.match(/'/g) || []).length;

        if (doubleQuotes % 2 !== 0) {
          errors.push(`Line ${index + 1}: Unterminated double quote`);
        }
        if (singleQuotes % 2 !== 0 && language !== "c" && language !== "cpp") {
          errors.push(`Line ${index + 1}: Unterminated single quote`);
        }
      });
      break;

    case "python":
      // Check indentation consistency
      const pythonLines = code.split("\n").filter((line) => line.trim());
      const indents = pythonLines.map((line) => {
        const match = line.match(/^\s*/);
        return match ? match[0].length : 0;
      });

      const usesSpaces = code.includes("    "); // 4 spaces
      const usesTabs = code.includes("\t");

      if (usesSpaces && usesTabs) {
        errors.push("Mixed tabs and spaces - use consistent indentation");
      }

      // Check for missing colons
      pythonLines.forEach((line, index) => {
        if (
          /^\s*(if|elif|else|for|while|def|class|with|try|except|finally)\b/.test(
            line
          )
        ) {
          if (!line.trim().endsWith(":")) {
            errors.push(`Line ${index + 1}: Missing colon after statement`);
          }
        }
      });
      break;

    case "json":
      try {
        JSON.parse(code);
      } catch (e: any) {
        errors.push(`JSON Parse Error: ${e.message}`);
      }
      break;

    case "html":
    case "xml":
      // Check for unclosed tags
      const tagPattern = /<(\w+)[^>]*>/g;
      const closeTagPattern = /<\/(\w+)>/g;
      const openTags: string[] = [];
      const closeTags: string[] = [];

      let match;
      while ((match = tagPattern.exec(code)) !== null) {
        if (!match[0].endsWith("/>")) {
          openTags.push(match[1]);
        }
      }

      while ((match = closeTagPattern.exec(code)) !== null) {
        closeTags.push(match[1]);
      }

      const selfClosing = ["br", "hr", "img", "input", "meta", "link"];
      const filteredOpenTags = openTags.filter(
        (tag) => !selfClosing.includes(tag.toLowerCase())
      );

      if (filteredOpenTags.length !== closeTags.length) {
        errors.push(
          `Unmatched tags: ${filteredOpenTags.length} opening, ${closeTags.length} closing`
        );
      }
      break;
  }

  return errors;
};

const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  value,
  language,
  onSave,
  onCancel,
}) => {
  const [code, setCode] = useState(value);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [suggestedLanguages, setSuggestedLanguages] = useState<string[]>([]);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const codeLanguages = [
    { value: "javascript", label: "JavaScript", icon: "🟨" },
    { value: "typescript", label: "TypeScript", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "c", label: "C", icon: "©️" },
    { value: "cpp", label: "C++", icon: "➕" },
    { value: "csharp", label: "C#", icon: "#️⃣" },
    { value: "php", label: "PHP", icon: "🐘" },
    { value: "ruby", label: "Ruby", icon: "💎" },
    { value: "go", label: "Go", icon: "🔵" },
    { value: "rust", label: "Rust", icon: "🦀" },
    { value: "swift", label: "Swift", icon: "🕊️" },
    { value: "kotlin", label: "Kotlin", icon: "🟣" },
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "scss", label: "SCSS", icon: "💅" },
    { value: "sql", label: "SQL", icon: "🗄️" },
    { value: "json", label: "JSON", icon: "📋" },
    { value: "xml", label: "XML", icon: "📄" },
    { value: "yaml", label: "YAML", icon: "⚙️" },
    { value: "bash", label: "Bash", icon: "💻" },
    { value: "powershell", label: "PowerShell", icon: "⚡" },
    { value: "plaintext", label: "Plain Text", icon: "📝" },
  ];

  // Auto-detect language when code changes
  useEffect(() => {
    if (code.trim().length > 20) {
      const detected = detectLanguage(code);
      const suggested = suggestLanguages(code);

      setDetectedLanguage(detected);
      setSuggestedLanguages(suggested);

      // Auto-select if confidence is high
      if (detected !== "plaintext" && detected !== selectedLanguage) {
        setShowLanguageSuggestions(true);
      }
    }
  }, [code]);

  // Check syntax errors
  useEffect(() => {
    if (code.trim().length > 0) {
      const errors = detectSyntaxErrors(code, selectedLanguage);
      setSyntaxErrors(errors);
    } else {
      setSyntaxErrors([]);
    }
  }, [code, selectedLanguage]);

  // Update stats
  useEffect(() => {
    setLineCount(code.split("\n").length);
    setCharCount(code.length);
  }, [code]);

  // Get current word being typed
  const getCurrentWord = (text: string, cursorPos: number): string => {
    const beforeCursor = text.slice(0, cursorPos);
    const match = beforeCursor.match(/[a-zA-Z_]\w*$/);
    return match ? match[0] : "";
  };

  // Handle text change with autocomplete
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);

    const cursorPos = e.target.selectionStart;
    const currentWord = getCurrentWord(newCode, cursorPos);

    if (currentWord.length >= 2) {
      const keywords = LANGUAGE_KEYWORDS[selectedLanguage] || [];
      const matches = keywords.filter((keyword) =>
        keyword.toLowerCase().startsWith(currentWord.toLowerCase())
      );

      if (matches.length > 0) {
        // Calculate position for suggestions dropdown
        const textarea = textareaRef.current;
        if (textarea) {
          const lines = newCode.slice(0, cursorPos).split("\n");
          const currentLine = lines[lines.length - 1];
          const lineHeight = 20;
          const charWidth = 8;

          setSuggestionPosition({
            top: (lines.length - 1) * lineHeight + 30,
            left: currentLine.length * charWidth,
          });
        }

        setSuggestions(matches);
        setSelectedSuggestionIndex(0);
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length === 0) {
      // Tab for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const newCode = code.slice(0, start) + "  " + code.slice(end);
        setCode(newCode);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
      case "Tab":
        if (suggestions.length > 0) {
          e.preventDefault();
          insertSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSuggestions([]);
        break;
    }
  };

  // Insert selected suggestion
  const insertSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const currentWord = getCurrentWord(code, cursorPos);
    const beforeWord = code.slice(0, cursorPos - currentWord.length);
    const afterCursor = code.slice(cursorPos);

    const newCode = beforeWord + suggestion + afterCursor;
    setCode(newCode);
    setSuggestions([]);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = beforeWord.length + suggestion.length;
        textareaRef.current.selectionStart = newPos;
        textareaRef.current.selectionEnd = newPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSave = () => {
    onSave(code, selectedLanguage);
  };

  const applyLanguageSuggestion = (lang: string) => {
    setSelectedLanguage(lang);
    setShowLanguageSuggestions(false);
  };

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Code2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Code Block Editor
              </h3>
              <p className="text-sm text-gray-400">
                Professional code editing with live validation
              </p>
            </div>
          </div>
          {/* Language Selection with Auto-detect */}
          <div className="p-2 space-y-2 ">
            <div className="flex items-center gap-4">
              <div className="flex-1 ">
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Programming Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setShowLanguageSuggestions(false);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                >
                  {codeLanguages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-detect suggestion */}
              {showLanguageSuggestions &&
                detectedLanguage &&
                detectedLanguage !== selectedLanguage && (
                  <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-300 mb-2">
                          Auto-detected: {detectedLanguage}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              applyLanguageSuggestion(detectedLanguage)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            Use {detectedLanguage}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowLanguageSuggestions(false)}
                            className="text-gray-400 hover:text-white text-xs"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            {/* <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-10 w-10 p-0 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button> */}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Code
              <span className="text-xs text-gray-500 font-normal">
                (Tab for indent • Ctrl+Space for autocomplete)
              </span>
            </label>

            {/* Code stats */}
            <div className="flex gap-4 text-xs text-gray-400">
              <span>{lineCount} lines</span>
              <span>{charCount} chars</span>
            </div>
          </div>

          <div className="relative flex-1 flex flex-col">
            {/* Line numbers */}
            <div className="flex gap-0 flex-1 bg-gray-950 rounded-lg overflow-hidden border-2 border-gray-700 focus-within:border-blue-500">
              <div className="bg-gray-900 text-gray-500 text-right py-4 px-3 select-none font-mono text-sm border-r border-gray-700 min-w-[50px]">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your code here..."
                className="flex-1 px-4 py-4 bg-transparent text-gray-100 font-mono text-sm resize-none outline-none leading-6"
                spellCheck={false}
                style={{
                  tabSize: 2,
                }}
              />
            </div>

            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && suggestionPosition && (
              <div
                ref={suggestionsRef}
                className="absolute bg-gray-800 border-2 border-blue-500 rounded-lg shadow-2xl z-10 min-w-[200px] max-h-[200px] overflow-y-auto"
                style={{
                  top: `${suggestionPosition.top}px`,
                  left: `${suggestionPosition.left}px`,
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={`px-4 py-2 cursor-pointer font-mono text-sm flex items-center gap-2 ${
                      index === selectedSuggestionIndex
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    onClick={() => insertSuggestion(suggestion)}
                  >
                    <span className="text-xs opacity-60">keyword</span>
                    <span className="font-semibold">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Syntax errors */}
          {syntaxErrors.length > 0 && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-300 mb-2">
                    Syntax Errors Detected
                  </p>
                  <ul className="space-y-1">
                    {syntaxErrors.map((error, index) => (
                      <li
                        key={index}
                        className="text-sm text-red-200 font-mono"
                      >
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success indicator */}
          {syntaxErrors.length === 0 && code.trim().length > 0 && (
            <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <p className="text-sm text-green-300">
                  No syntax errors detected
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700 bg-gray-900/50">
          <div className="text-xs text-gray-400">
            💡 Tip: Use Tab for indentation, Ctrl+Space for autocomplete
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-black border-gray-600 text-gray-300 hover:bg-gray-900 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!code.trim() || syntaxErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlockEditor;
