import { getRichTextStyles } from "@/lib/design/richTextStyles";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

interface RichTextDisplayProps {
  content?: string;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const RichTextDisplay = ({
  content,
  className = "",
  maxWidth = "full",
}: RichTextDisplayProps) => {
  const displayRef = useRef<HTMLDivElement>(null);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  // Simple syntax highlighter
  const highlightCode = (code: string, language: string): string => {
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

    let highlighted = escapeHtml(code);

    // Language-specific highlighting
    switch (language.toLowerCase()) {
      case "javascript":
      case "typescript":
      case "jsx":
      case "tsx":
        highlighted = highlighted.replace(
          /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|async|await|try|catch|new|this|super|extends|implements|interface|type|enum)\b/g,
          '<span class="token-keyword">$1</span>'
        );
        highlighted = highlighted.replace(
          /(["'`])(?:(?=(\\?))\2.)*?\1/g,
          '<span class="token-string">$&</span>'
        );
        highlighted = highlighted.replace(
          /\/\/.*/g,
          '<span class="token-comment">$&</span>'
        );
        highlighted = highlighted.replace(
          /\/\*[\s\S]*?\*\//g,
          '<span class="token-comment">$&</span>'
        );
        highlighted = highlighted.replace(
          /\b\d+\.?\d*\b/g,
          '<span class="token-number">$&</span>'
        );
        highlighted = highlighted.replace(
          /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
          '<span class="token-function">$1</span>('
        );
        break;

      case "python":
        highlighted = highlighted.replace(
          /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|with|lambda|pass|break|continue|and|or|not|in|is|None|True|False|finally|raise|assert|global|nonlocal|del|yield)\b/g,
          '<span class="token-keyword">$1</span>'
        );
        highlighted = highlighted.replace(
          /(["'])(?:(?=(\\?))\2.)*?\1/g,
          '<span class="token-string">$&</span>'
        );
        highlighted = highlighted.replace(
          /#.*/g,
          '<span class="token-comment">$&</span>'
        );
        highlighted = highlighted.replace(
          /\b\d+\.?\d*\b/g,
          '<span class="token-number">$&</span>'
        );
        highlighted = highlighted.replace(
          /\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
          'def <span class="token-function">$1</span>'
        );
        break;

      case "java":
      case "c":
      case "cpp":
      case "csharp":
        highlighted = highlighted.replace(
          /\b(public|private|protected|class|void|int|String|boolean|if|else|for|while|return|new|static|final|abstract|interface|extends|implements|try|catch|throw|throws|float|double|char|long|short|byte)\b/g,
          '<span class="token-keyword">$1</span>'
        );
        highlighted = highlighted.replace(
          /(["'])(?:(?=(\\?))\2.)*?\1/g,
          '<span class="token-string">$&</span>'
        );
        highlighted = highlighted.replace(
          /\/\/.*/g,
          '<span class="token-comment">$&</span>'
        );
        highlighted = highlighted.replace(
          /\/\*[\s\S]*?\*\//g,
          '<span class="token-comment">$&</span>'
        );
        highlighted = highlighted.replace(
          /\b\d+\.?\d*\b/g,
          '<span class="token-number">$&</span>'
        );
        break;

      case "html":
      case "xml":
        highlighted = highlighted.replace(
          /&lt;\/?\w+(?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'))?)*\s*\/?&gt;/g,
          '<span class="token-tag">$&</span>'
        );
        highlighted = highlighted.replace(
          /\s([\w-]+)=/g,
          ' <span class="token-attr">$1</span>='
        );
        highlighted = highlighted.replace(
          /=(&quot;[^&]*&quot;|&#39;[^&]*&#39;)/g,
          '=<span class="token-string">$1</span>'
        );
        break;

      case "css":
      case "scss":
        highlighted = highlighted.replace(
          /^([.#]?[a-zA-Z][a-zA-Z0-9-_]*)\s*\{/gm,
          '<span class="token-selector">$1</span> {'
        );
        highlighted = highlighted.replace(
          /\b([a-z-]+)\s*:/g,
          '<span class="token-property">$1</span>:'
        );
        highlighted = highlighted.replace(
          /:\s*([^;]+);/g,
          ': <span class="token-value">$1</span>;'
        );
        highlighted = highlighted.replace(
          /\/\*[\s\S]*?\*\//g,
          '<span class="token-comment">$&</span>'
        );
        break;

      case "sql":
        highlighted = highlighted.replace(
          /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|TABLE|DATABASE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|INDEX|ALTER|ADD|COLUMN)\b/gi,
          '<span class="token-keyword">$&</span>'
        );
        highlighted = highlighted.replace(
          /(["'])(?:(?=(\\?))\2.)*?\1/g,
          '<span class="token-string">$&</span>'
        );
        highlighted = highlighted.replace(
          /--.*/g,
          '<span class="token-comment">$&</span>'
        );
        break;

      case "json":
        highlighted = highlighted.replace(
          /&quot;([^&]+)&quot;\s*:/g,
          '<span class="token-property">&quot;$1&quot;</span>:'
        );
        highlighted = highlighted.replace(
          /:\s*&quot;([^&]*)&quot;/g,
          ': <span class="token-string">&quot;$1&quot;</span>'
        );
        highlighted = highlighted.replace(
          /:\s*(\d+\.?\d*)/g,
          ': <span class="token-number">$1</span>'
        );
        highlighted = highlighted.replace(
          /\b(true|false|null)\b/g,
          '<span class="token-boolean">$1</span>'
        );
        break;
    }

    return highlighted;
  };

  // Apply syntax highlighting to code blocks
  const applySyntaxHighlighting = () => {
    if (!displayRef.current) return;

    const preBlocks = displayRef.current.querySelectorAll(
      "pre:not(.code-highlighted)"
    );

    preBlocks.forEach((pre) => {
      const code = pre.querySelector("code");
      if (code && !pre.classList.contains("code-highlighted")) {
        // Get language from data attribute
        const language = code.getAttribute("data-language") || "plaintext";

        // Get original text content
        const text = code.textContent || "";

        // Store original for copying
        pre.setAttribute("data-raw-code", text);

        // Mark as processed
        pre.classList.add("code-highlighted", "code-enhanced");
        pre.setAttribute("data-language", language);
        pre.setAttribute("contenteditable", "false");

        // Clear code element completely first
        code.textContent = "";
        code.innerHTML = "";

        // Apply syntax highlighting
        const highlighted = highlightCode(text, language);

        // Set innerHTML directly (let browser parse HTML)
        code.innerHTML = highlighted;
        code.setAttribute("contenteditable", "false");

        // Add toolbar if not exists
        if (!pre.querySelector(".code-toolbar")) {
          const toolbar = document.createElement("div");
          toolbar.className = "code-toolbar";
          toolbar.setAttribute("contenteditable", "false");

          const langLabel = document.createElement("span");
          langLabel.className = "code-language-label";
          langLabel.textContent = language.toUpperCase();

          const actions = document.createElement("div");
          actions.className = "code-actions";

          // Raw view toggle button
          const rawBtn = document.createElement("button");
          rawBtn.className = "code-action-btn code-raw-btn";
          rawBtn.setAttribute("type", "button");
          rawBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
          rawBtn.title = "Toggle raw view";
          rawBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isRaw = pre.classList.toggle("show-raw");
            rawBtn.innerHTML = isRaw
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
          };

          // Copy button
          const copyBtn = document.createElement("button");
          copyBtn.className = "code-action-btn code-copy-btn";
          copyBtn.setAttribute("type", "button");
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
          copyBtn.title = "Copy code";
          copyBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const rawCode = pre.getAttribute("data-raw-code") || text;
            navigator.clipboard
              .writeText(rawCode)
              .then(() => {
                toast.success("Code copied!");
                copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
                setTimeout(() => {
                  copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
                }, 2000);
              })
              .catch((err) => {
                console.error("Copy failed:", err);
                toast.error("Failed to copy");
              });
          };

          actions.appendChild(rawBtn);
          actions.appendChild(copyBtn);
          toolbar.appendChild(langLabel);
          toolbar.appendChild(actions);
          pre.insertBefore(toolbar, pre.firstChild);
        }
        // Create container for perfect alignment
        if (!pre.querySelector(".code-container")) {
          const container = document.createElement("div");
          container.className = "code-container";
          container.setAttribute("contenteditable", "false");

          // Create line numbers wrapper
          const wrapper = document.createElement("div");
          wrapper.className = "line-numbers-wrapper";
          wrapper.setAttribute("contenteditable", "false");

          const lines = text.trimEnd().split("\n");
          const lineNumbers = lines.map((_, i) => i + 1).join("\n");
          const lineNumbersDiv = document.createElement("div");
          lineNumbersDiv.className = "line-numbers";
          lineNumbersDiv.textContent = lineNumbers;
          lineNumbersDiv.setAttribute("contenteditable", "false");

          wrapper.appendChild(lineNumbersDiv);

          // Build proper structure
          const codeClone = code.cloneNode(true) as HTMLElement;
          container.appendChild(wrapper);
          container.appendChild(codeClone);

          // Remove old code and add container
          if (code.parentNode === pre) {
            pre.removeChild(code);
          }
          pre.appendChild(container);
        }
      }
    });
  };

  useEffect(() => {
    // Apply syntax highlighting when content changes
    applySyntaxHighlighting();
  }, [content]);

  if (!content) return null;

  return (
    <>
      <div
        ref={displayRef}
        className={`rich-text-display ${maxWidthClasses[maxWidth]} ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <style dangerouslySetInnerHTML={{ __html: getRichTextStyles() }} />
    </>
  );
};

export default RichTextDisplay;
