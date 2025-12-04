import { getRichTextStyles } from "@/lib/design/richTextStyles";
import {
  highlightCode,
  createCodeToolbar,
  createLineNumbers,
} from "@/lib/utils/codeHighlighter";
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

  // Apply syntax highlighting to code blocks
  const applySyntaxHighlighting = () => {
    if (!displayRef.current) return;

    // Process ALL pre blocks (not just those without code-highlighted class)
    const preBlocks = displayRef.current.querySelectorAll("pre");

    preBlocks.forEach((pre) => {
      const code = pre.querySelector("code");
      if (!code) return;

      // Skip if toolbar already exists
      if (pre.querySelector(".code-toolbar")) return;

      // Get language and original text (NOT innerHTML, to avoid double-processing)
      const language = code.getAttribute("data-language") || "plaintext";
      const text = code.textContent || "";

      // Store original for copying
      pre.setAttribute("data-raw-code", text);

      // Mark as processed and NOT EDITABLE in display mode
      pre.classList.add("code-highlighted", "code-enhanced");
      pre.setAttribute("data-language", language);
      pre.contentEditable = "false";
      pre.style.userSelect = "text";
      pre.style.cursor = "default";

      // Add toolbar FIRST
      const toolbar = createCodeToolbar(
        pre,
        language,
        text,
        () => toast.success("Code copied!"),
        () => toast.error("Failed to copy")
      );
      pre.insertBefore(toolbar, pre.firstChild);

      // Create container for alignment
      const container = document.createElement("div");
      container.className = "code-container";
      container.contentEditable = "false";

      // Create line numbers wrapper
      const lineNumbersWrapper = createLineNumbers(text);

      // Create new code element with syntax highlighting
      const highlightedCode = document.createElement("code");
      highlightedCode.setAttribute("data-language", language);
      highlightedCode.contentEditable = "false";
      highlightedCode.style.userSelect = "text";
      highlightedCode.style.cursor = "default";

      // Apply syntax highlighting - innerHTML now contains proper HTML spans
      highlightedCode.innerHTML = highlightCode(text, language);

      // Build structure
      container.appendChild(lineNumbersWrapper);
      container.appendChild(highlightedCode);

      // Remove old code and add container
      if (code.parentNode === pre) {
        pre.removeChild(code);
      }
      pre.appendChild(container);
    });

    // Double-check: make all code elements non-editable
    displayRef.current.querySelectorAll("pre, code").forEach((el) => {
      (el as HTMLElement).contentEditable = "false";
    });
  };

  useEffect(() => {
    applySyntaxHighlighting();
  }, [content]);

  useEffect(() => {
    // Make entire display non-editable
    if (displayRef.current) {
      displayRef.current.setAttribute("contenteditable", "false");
      displayRef.current.style.userSelect = "text";
    }
  }, []);

  if (!content) return null;

  return (
    <>
      <div
        ref={displayRef}
        className={`rich-text-display ${maxWidthClasses[maxWidth]} ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
        contentEditable={false}
        suppressContentEditableWarning
      />
      <style dangerouslySetInnerHTML={{ __html: getRichTextStyles() }} />
    </>
  );
};

export default RichTextDisplay;
