// FIXED VERSION - Code syntax highlighting utility
// This version properly handles nested contexts (comments, strings)

export const highlightCode = (code: string, language: string): string => {
  const escapeHtml = (text: string) =>
    text.replace(/[&<>'"]/g, (char) => {
      const escapeMap: { [key: string]: string } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      };
      return escapeMap[char];
    });

  // Helper to check if position is inside a placeholder
  const isInsidePlaceholder = (text: string, position: number): boolean => {
    const before = text.substring(0, position);
    const openCount = (before.match(/__SPAN_START_/g) || []).length;
    const closeCount = (before.match(/__SPAN_END__/g) || []).length;
    return openCount > closeCount;
  };

  // Helper to safely replace without touching existing placeholders
  const safeReplace = (
    text: string,
    regex: RegExp,
    tokenClass: string
  ): string => {
    return text.replace(regex, (match, ...args) => {
      const offset = args[args.length - 2]; // offset is second to last arg
      if (isInsidePlaceholder(text, offset)) {
        return match; // Don't replace if inside existing placeholder
      }
      return `__SPAN_START_${tokenClass}__${match}__SPAN_END__`;
    });
  };

  let highlighted = escapeHtml(code);

  // Language-specific highlighting
  switch (language.toLowerCase()) {
    case "javascript":
    case "typescript":
    case "jsx":
    case "tsx":
      // 1. Comments first (highest priority - protect from other highlighting)
      highlighted = highlighted.replace(
        /\/\/.*/g,
        (match) => `__SPAN_START_token-comment__${match}__SPAN_END__`
      );
      highlighted = highlighted.replace(
        /\/\*[\s\S]*?\*\//g,
        (match) => `__SPAN_START_token-comment__${match}__SPAN_END__`
      );
      // 2. Strings
      highlighted = highlighted.replace(
        /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        (match, ...args) => {
          const offset = args[args.length - 2];
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `__SPAN_START_token-string__${match}__SPAN_END__`;
        }
      );
      // 3. Keywords
      highlighted = safeReplace(
        highlighted,
        /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|async|await|try|catch|new|this|super|extends|implements|interface|type|enum)\b/g,
        "token-keyword"
      );
      // 4. Numbers
      highlighted = safeReplace(highlighted, /\b\d+\.?\d*\b/g, "token-number");
      // 5. Functions
      highlighted = highlighted.replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        (match, funcName, offset) => {
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `__SPAN_START_token-function__${funcName}__SPAN_END__(`;
        }
      );
      break;

    case "python":
      // 1. Comments first
      highlighted = highlighted.replace(
        /#.*/g,
        (match) => `__SPAN_START_token-comment__${match}__SPAN_END__`
      );
      // 2. Strings
      highlighted = highlighted.replace(
        /(["'])(?:(?=(\\?))\2.)*?\1/g,
        (match, ...args) => {
          const offset = args[args.length - 2];
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `__SPAN_START_token-string__${match}__SPAN_END__`;
        }
      );
      // 3. Keywords
      highlighted = safeReplace(
        highlighted,
        /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|with|lambda|pass|break|continue|and|or|not|in|is|None|True|False|finally|raise|assert|global|nonlocal|del|yield)\b/g,
        "token-keyword"
      );
      // 4. Numbers
      highlighted = safeReplace(highlighted, /\b\d+\.?\d*\b/g, "token-number");
      // 5. Functions
      highlighted = highlighted.replace(
        /\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        (match, funcName, offset) => {
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `def __SPAN_START_token-function__${funcName}__SPAN_END__`;
        }
      );
      break;

    case "java":
    case "c":
    case "cpp":
    case "csharp":
      // 1. Comments first (CRITICAL for C/C++)
      highlighted = highlighted.replace(
        /\/\/.*/g,
        (match) => `__SPAN_START_token-comment__${match}__SPAN_END__`
      );
      highlighted = highlighted.replace(
        /\/\*[\s\S]*?\*\//g,
        (match) => `__SPAN_START_token-comment__${match}__SPAN_END__`
      );
      // 2. Strings
      highlighted = highlighted.replace(
        /(["'])(?:(?=(\\?))\2.)*?\1/g,
        (match, ...args) => {
          const offset = args[args.length - 2];
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `__SPAN_START_token-string__${match}__SPAN_END__`;
        }
      );
      // 3. Preprocessor directives (for C/C++)
      if (language === "c" || language === "cpp") {
        highlighted = safeReplace(
          highlighted,
          /^#\s*(include|define|ifdef|ifndef|endif|pragma|undef)\b/gm,
          "token-keyword"
        );
      }
      // 4. Keywords
      highlighted = safeReplace(
        highlighted,
        /\b(public|private|protected|class|void|int|float|double|char|long|short|byte|boolean|String|if|else|for|while|do|return|new|static|final|abstract|interface|extends|implements|try|catch|throw|throws|struct|typedef|enum|union|const|sizeof|signed|unsigned|auto|register|volatile|extern|break|continue|switch|case|default|goto|main|printf|scanf|include)\b/g,
        "token-keyword"
      );
      // 5. Numbers
      highlighted = safeReplace(highlighted, /\b\d+\.?\d*\b/g, "token-number");
      break;

    case "html":
    case "xml":
      highlighted = highlighted.replace(
        /&lt;\/?\w+(?:\s+[\w-]+(?:=(?:&quot;[^&]*&quot;|&#39;[^&]*&#39;))?)*\s*\/?&gt;/g,
        (match) => `__SPAN_START_token-tag__${match}__SPAN_END__`
      );
      highlighted = highlighted.replace(
        /\s([\w-]+)=/g,
        (match, attr, offset) => {
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return ` __SPAN_START_token-attr__${attr}__SPAN_END__=`;
        }
      );
      highlighted = highlighted.replace(
        /=(&quot;[^&]*&quot;|&#39;[^&]*&#39;)/g,
        (match, value, offset) => {
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `=__SPAN_START_token-string__${value}__SPAN_END__`;
        }
      );
      break;

    case "css":
    case "scss":
      // 1. Comments first
      highlighted = highlighted.replace(
        /\/\*[\s\S]*?\*\//g,
        (match) => `__SPAN_START_token-comment__${match}__SPAN_END__`
      );
      // 2. Selectors
      highlighted = highlighted.replace(
        /^([.#]?[a-zA-Z][a-zA-Z0-9-_]*)\s*\{/gm,
        (match, selector, offset) => {
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `__SPAN_START_token-selector__${selector}__SPAN_END__ {`;
        }
      );
      // 3. Properties
      highlighted = safeReplace(
        highlighted,
        /\b([a-z-]+)\s*:/g,
        "token-property"
      );
      // 4. Values
      highlighted = highlighted.replace(
        /:\s*([^;]+);/g,
        (match, value, offset) => {
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `: __SPAN_START_token-value__${value}__SPAN_END__;`;
        }
      );
      break;

    case "sql":
      // 1. Comments first
      highlighted = highlighted.replace(
        /--.*/g,
        (match) => `__SPAN_START_token-comment__${match}__SPAN_END__`
      );
      // 2. Strings
      highlighted = highlighted.replace(
        /(["'])(?:(?=(\\?))\2.)*?\1/g,
        (match, ...args) => {
          const offset = args[args.length - 2];
          if (isInsidePlaceholder(highlighted, offset)) return match;
          return `__SPAN_START_token-string__${match}__SPAN_END__`;
        }
      );
      // 3. Keywords
      highlighted = safeReplace(
        highlighted,
        /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|TABLE|DATABASE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|INDEX|ALTER|ADD|COLUMN)\b/gi,
        "token-keyword"
      );
      break;

    case "json":
      // JSON doesn't have comments, so simpler
      highlighted = highlighted.replace(
        /&quot;([^&]+)&quot;\s*:/g,
        (match, prop) =>
          `__SPAN_START_token-property__&quot;${prop}&quot;__SPAN_END__:`
      );
      highlighted = highlighted.replace(
        /:\s*&quot;([^&]*)&quot;/g,
        (match, value) =>
          `: __SPAN_START_token-string__&quot;${value}&quot;__SPAN_END__`
      );
      highlighted = highlighted.replace(
        /:\s*(\d+\.?\d*)/g,
        (match, num) => `: __SPAN_START_token-number__${num}__SPAN_END__`
      );
      highlighted = highlighted.replace(
        /\b(true|false|null)\b/g,
        (match) => `__SPAN_START_token-boolean__${match}__SPAN_END__`
      );
      break;
  }

  // Replace placeholders with actual HTML spans
  // CRITICAL: Use [a-z-]+ to match "token-keyword", "token-number", etc.
  highlighted = highlighted.replace(
    /__SPAN_START_([a-z-]+)__(.+?)__SPAN_END__/g,
    '<span class="$1">$2</span>'
  );

  return highlighted;
};

// Create code toolbar with copy and raw view buttons
export const createCodeToolbar = (
  pre: Element,
  language: string,
  rawCode: string,
  onCopySuccess: () => void,
  onCopyError: () => void
) => {
  const toolbar = document.createElement("div");
  toolbar.className = "code-toolbar";
  toolbar.contentEditable = "false";
  toolbar.style.userSelect = "none";
  toolbar.style.pointerEvents = "auto";

  const langLabel = document.createElement("span");
  langLabel.className = "code-language-label";
  langLabel.textContent = language.toUpperCase();
  langLabel.contentEditable = "false";

  const actions = document.createElement("div");
  actions.className = "code-actions";
  actions.contentEditable = "false";

  // Raw view toggle button
  const rawBtn = document.createElement("button");
  rawBtn.className = "code-action-btn code-raw-btn";
  rawBtn.type = "button";
  rawBtn.contentEditable = "false";
  rawBtn.style.pointerEvents = "auto";
  rawBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  rawBtn.title = "Toggle raw view";

  const handleRawClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const isRaw = pre.classList.toggle("show-raw");
    rawBtn.innerHTML = isRaw
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  };

  rawBtn.addEventListener("click", handleRawClick, true);
  rawBtn.addEventListener(
    "mousedown",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  // Copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "code-action-btn code-copy-btn";
  copyBtn.type = "button";
  copyBtn.contentEditable = "false";
  copyBtn.style.pointerEvents = "auto";
  copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
  copyBtn.title = "Copy code";

  const handleCopyClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    navigator.clipboard
      .writeText(rawCode)
      .then(() => {
        onCopySuccess();
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        }, 2000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        onCopyError();
      });
  };

  copyBtn.addEventListener("click", handleCopyClick, true);
  copyBtn.addEventListener(
    "mousedown",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  actions.appendChild(rawBtn);
  actions.appendChild(copyBtn);
  toolbar.appendChild(langLabel);
  toolbar.appendChild(actions);

  return toolbar;
};

// Create line numbers for code block
export const createLineNumbers = (text: string) => {
  const lines = text.trimEnd().split("\n");
  const lineNumbers = lines.map((_, i) => i + 1).join("\n");

  const wrapper = document.createElement("div");
  wrapper.className = "line-numbers-wrapper";
  wrapper.setAttribute("contenteditable", "false");

  const lineNumbersDiv = document.createElement("div");
  lineNumbersDiv.className = "line-numbers";
  lineNumbersDiv.textContent = lineNumbers;
  lineNumbersDiv.setAttribute("contenteditable", "false");

  wrapper.appendChild(lineNumbersDiv);
  return wrapper;
};
