import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
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
  ],
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const codeLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "scss", label: "SCSS" },
    { value: "sql", label: "SQL" },
    { value: "json", label: "JSON" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" },
    { value: "bash", label: "Bash" },
    { value: "powershell", label: "PowerShell" },
    { value: "plaintext", label: "Plain Text" },
  ];

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
          const lineHeight = 20; // Approximate line height
          const charWidth = 8; // Approximate character width

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

    // Set cursor position after suggestion
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

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold">Code Block Editor</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-10 w-10 p-0 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Programming Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              {codeLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold mb-2">
              Code (Tab for indent, Ctrl+Space for autocomplete)
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your code here..."
                className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-900 dark:bg-gray-950 text-gray-100 font-mono text-sm resize-none"
                rows={16}
                spellCheck={false}
                style={{
                  tabSize: 2,
                  lineHeight: "1.5",
                }}
              />

              {/* Autocomplete suggestions */}
              {suggestions.length > 0 && suggestionPosition && (
                <div
                  ref={suggestionsRef}
                  className="absolute bg-gray-800 dark:bg-gray-900 border-2 border-blue-500 rounded-lg shadow-xl z-10 min-w-[200px] max-h-[200px] overflow-y-auto"
                  style={{
                    top: `${suggestionPosition.top}px`,
                    left: `${suggestionPosition.left}px`,
                  }}
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-4 py-2 cursor-pointer font-mono text-sm ${
                        index === selectedSuggestionIndex
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => insertSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tips: Use ↑↓ to navigate, Enter/Tab to select, Esc to cancel
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!code.trim()}
            className="bg-blue-600"
          >
            <Check className="h-4 w-4 mr-2" />
            Save Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeBlockEditor;
