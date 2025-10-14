import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Edit3,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Enter text...",
  minHeight = "150px",
  className,
}: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState({
    url: "",
    text: "",
    isEdit: false,
  });
  const [selectedLink, setSelectedLink] = useState<HTMLAnchorElement | null>(
    null
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingContent = useRef(false);

  // Normalize HTML content for consistent formatting
  const normalizeContent = (html: string) => {
    if (!html) return "";

    // Create a temporary div to normalize the HTML
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Ensure proper line breaks and paragraph structure
    const normalized = temp.innerHTML
      .replace(/<div><br><\/div>/g, "<br>")
      .replace(/<div>/g, "<br>")
      .replace(/<\/div>/g, "")
      .replace(/^<br>/, "") // Remove leading br
      .replace(/<br><br>/g, "<br>"); // Reduce double breaks

    return normalized;
  };

  // Initialize and sync content
  useEffect(() => {
    if (editorRef.current && !isUpdatingContent.current) {
      const normalizedValue = normalizeContent(value);
      if (editorRef.current.innerHTML !== normalizedValue) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

        editorRef.current.innerHTML = normalizedValue;

        // Restore cursor position if possible
        if (range && editorRef.current.contains(range.startContainer)) {
          try {
            selection?.removeAllRanges();
            selection?.addRange(range);
          } catch (e) {
            // Cursor restoration failed, focus at end
            const newRange = document.createRange();
            newRange.selectNodeContents(editorRef.current);
            newRange.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        }
      }
    }
  }, [value]);

  // Count words in the content
  useEffect(() => {
    if (editorRef.current) {
      // Get only the text content, ignoring HTML tags
      const text = editorRef.current.textContent || "";
      const cleanText = text.trim();

      if (!cleanText) {
        setWordCount(0);
        return;
      }

      // Split by whitespace and filter out empty strings
      const words = cleanText
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .split(" ")
        .filter((word) => word.length > 0);

      setWordCount(words.length);
    }
  }, [value]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isUpdatingContent.current) {
      isUpdatingContent.current = true;

      let content = editorRef.current.innerHTML;

      // Clean up the content
      content = content
        .replace(/<div><br><\/div>/g, "<br>")
        .replace(/<div>/g, "<br>")
        .replace(/<\/div>/g, "")
        .replace(/^<br>/, "")
        .replace(/<br><br>/g, "<br>");

      onChange(content);

      setTimeout(() => {
        isUpdatingContent.current = false;
      }, 0);
    }
  }, [onChange]);

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    // Save current selection
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

    // Execute the command
    document.execCommand(command, false, value);

    // For some commands, ensure proper formatting
    if (command === "formatBlock") {
      // Add line break after block elements if needed
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const currentRange = sel.getRangeAt(0);
          const container = currentRange.commonAncestorContainer;
          const element =
            container.nodeType === Node.TEXT_NODE
              ? container.parentElement
              : (container as Element);

          if (element && ["H1", "H2", "H3", "P"].includes(element.tagName)) {
            // Move cursor to end of element and add space for next content
            currentRange.setStartAfter(element);
            currentRange.setEndAfter(element);
            sel.removeAllRanges();
            sel.addRange(currentRange);
          }
        }
        handleContentChange();
      }, 10);
    } else {
      setTimeout(handleContentChange, 10);
    }

    editorRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key for better line break management
    if (e.key === "Enter") {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        const element =
          container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : (container as Element);

        // If inside a heading, create a new paragraph
        if (element && ["H1", "H2", "H3"].includes(element.tagName)) {
          e.preventDefault();
          document.execCommand("formatBlock", false, "div");
          document.execCommand("insertHTML", false, "<br>");
          return;
        }
      }
    }

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    // Insert plain text and replace line breaks with HTML breaks
    const htmlText = text.replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, htmlText);
    setTimeout(handleContentChange, 10);
  };

  const insertLink = () => {
    const selection = window.getSelection();
    let selectedText = "";

    // Save the current selection range
    let savedRange = null;
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
      selectedText = selection.toString();
    }

    setLinkData({
      url: "",
      text: selectedText || "",
      isEdit: false,
    });
    setShowLinkModal(true);

    // Store the saved range for later use
    if (savedRange) {
      (window as any).savedLinkRange = savedRange;
    }
  };

  const editLink = (linkElement: HTMLAnchorElement) => {
    setSelectedLink(linkElement);
    setLinkData({
      url: linkElement.href,
      text: linkElement.textContent || "",
      isEdit: true,
    });
    setShowLinkModal(true);
  };

  const handleLinkSubmit = () => {
    if (!linkData.url.trim()) return;

    const url = linkData.url.startsWith("http")
      ? linkData.url
      : `https://${linkData.url}`;
    const text = linkData.text.trim() || url;

    if (linkData.isEdit && selectedLink) {
      // Edit existing link
      selectedLink.href = url;
      selectedLink.textContent = text;
      setTimeout(() => {
        handleContentChange();
        editorRef.current?.focus();
      }, 10);
    } else {
      // Create new link
      editorRef.current?.focus();

      // Try to restore the saved selection range
      let range = null;
      const selection = window.getSelection();

      if ((window as any).savedLinkRange) {
        try {
          range = (window as any).savedLinkRange;
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          // If we can't restore the range, get current selection
          range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        }
        // Clear the saved range
        delete (window as any).savedLinkRange;
      } else {
        range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      }

      if (range) {
        if (linkData.text && range.toString() !== linkData.text) {
          // User has custom text - use it
          const linkElement = document.createElement("a");
          linkElement.href = url;
          linkElement.textContent = text;

          range.deleteContents();
          range.insertNode(linkElement);

          // Move cursor after the link
          const spaceNode = document.createTextNode(" ");
          linkElement.parentNode?.insertBefore(
            spaceNode,
            linkElement.nextSibling
          );
          range.setStartAfter(spaceNode);
          range.setEndAfter(spaceNode);
          selection?.removeAllRanges();
          selection?.addRange(range);
        } else if (range.toString()) {
          // Text is selected - wrap it in a link
          const linkElement = document.createElement("a");
          linkElement.href = url;
          linkElement.textContent = range.toString();

          range.deleteContents();
          range.insertNode(linkElement);

          // Move cursor after the link
          range.setStartAfter(linkElement);
          range.setEndAfter(linkElement);
          selection?.removeAllRanges();
          selection?.addRange(range);
        } else {
          // No text selected - insert new link at cursor position
          const linkElement = document.createElement("a");
          linkElement.href = url;
          linkElement.textContent = text;

          range.insertNode(linkElement);

          // Add a space after the link and move cursor there
          const spaceNode = document.createTextNode(" ");
          linkElement.parentNode?.insertBefore(
            spaceNode,
            linkElement.nextSibling
          );
          range.setStartAfter(spaceNode);
          range.setEndAfter(spaceNode);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      } else {
        // Fallback - insert at the end
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand(
            "insertHTML",
            false,
            `<a href="${url}">${text}</a> `
          );
        }
      }

      setTimeout(() => {
        handleContentChange();
        editorRef.current?.focus();
      }, 10);
    }

    setShowLinkModal(false);
    setLinkData({ url: "", text: "", isEdit: false });
    setSelectedLink(null);
  };

  const removeLink = () => {
    if (selectedLink) {
      const parent = selectedLink.parentNode;
      const textContent = selectedLink.textContent || "";

      if (parent) {
        // Create a text node and replace the link
        const textNode = document.createTextNode(textContent);
        parent.replaceChild(textNode, selectedLink);

        // Normalize the parent to merge adjacent text nodes
        parent.normalize();
        handleContentChange();
      }
    }
    setShowLinkModal(false);
    setLinkData({ url: "", text: "", isEdit: false });
    setSelectedLink(null);

    // Refocus the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Handle double click on links for editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      e.preventDefault();
      editLink(target as HTMLAnchorElement);
    }
  };

  const formatButtons = [
    {
      command: "bold",
      icon: Bold,
      title: "Bold (Ctrl+B)",
    },
    {
      command: "italic",
      icon: Italic,
      title: "Italic (Ctrl+I)",
    },
    {
      command: "underline",
      icon: Underline,
      title: "Underline (Ctrl+U)",
    },
    {
      command: "insertUnorderedList",
      icon: List,
      title: "Bullet List",
    },
    {
      command: "insertOrderedList",
      icon: ListOrdered,
      title: "Numbered List",
    },
    {
      command: "justifyLeft",
      icon: AlignLeft,
      title: "Align Left",
    },
    {
      command: "justifyCenter",
      icon: AlignCenter,
      title: "Align Center",
    },
    {
      command: "justifyRight",
      icon: AlignRight,
      title: "Align Right",
    },
  ];

  return (
    <div
      className={`relative rich-text-editor border rounded-lg overflow-hidden z-10  ${
        className || ""
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
        {/* Format Style Dropdown */}
        <select
          className="px-2 py-1 text-sm border rounded mr-2 bg-background"
          onChange={(e) => execCommand("formatBlock", e.target.value)}
          defaultValue="div"
        >
          <option value="div">Normal Div</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>

        {formatButtons.map((button) => (
          <Button
            key={button.command}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand(button.command)}
            title={button.title}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Insert Link"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>

        {/* Font Size */}
        <select
          className="px-2 py-1 text-sm border rounded ml-2 bg-background"
          onChange={(e) => execCommand("fontSize", e.target.value)}
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="4">Medium</option>
          <option value="5">Large</option>
          <option value="6">Extra Large</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`p-4 outline-none bg-background text-foreground overflow-y-auto ${
          isFocused ? "ring-2 ring-blue-500 ring-opacity-20" : ""
        }`}
        style={{ minHeight }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDoubleClick={handleDoubleClick}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Footer with word count */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t text-sm text-gray-500">
        <span>Words: {wordCount}</span>
        <div className="flex gap-4 text-xs">
          <span>Ctrl+B: Bold</span>
          <span>Ctrl+I: Italic</span>
          <span>Ctrl+U: Underline</span>
          <span>Double-click links to edit</span>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="absolute inset-0 top-10 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                {linkData.isEdit ? "Edit Link" : "Insert Link"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkData({ url: "", text: "", isEdit: false });
                  setSelectedLink(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) =>
                    setLinkData({ ...linkData, url: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Text
                </label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) =>
                    setLinkData({ ...linkData, text: e.target.value })
                  }
                  placeholder="Link text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <div>
                {linkData.isEdit && (
                  <Button
                    variant="destructive"
                    onClick={removeLink}
                    className="mr-2"
                  >
                    Remove Link
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkData({ url: "", text: "", isEdit: false });
                    setSelectedLink(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLinkSubmit}
                  disabled={!linkData.url.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {linkData.isEdit ? "Update" : "Insert"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rich-text-editor [contenteditable] {
          line-height: 1.6;
        }
        .rich-text-editor [contenteditable] h1 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          display: block;
        }
        .rich-text-editor [contenteditable] h2 {
          font-size: 1.3em;
          font-weight: bold;
          margin: 0.4em 0;
          display: block;
        }
        .rich-text-editor [contenteditable] h3 {
          font-size: 1.1em;
          font-weight: bold;
          margin: 0.3em 0;
          display: block;
        }
        .rich-text-editor [contenteditable] p {
          margin: 0.5em 0;
          display: block;
        }
        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
          list-style-position: outside;
        }
        .rich-text-editor [contenteditable] ul {
          list-style-type: disc;
        }
        .rich-text-editor [contenteditable] ol {
          list-style-type: decimal;
        }
        .rich-text-editor [contenteditable] li {
          margin: 0.2em 0;
          display: list-item;
          list-style-position: outside;
        }
        .rich-text-editor [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .rich-text-display h1 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .rich-text-display h2 {
          font-size: 1.3em;
          font-weight: bold;
          margin: 0.4em 0;
        }
        .rich-text-display h3 {
          font-size: 1.1em;
          font-weight: bold;
          margin: 0.3em 0;
        }
        .rich-text-display p {
          margin: 0.5em 0;
        }
        .rich-text-display ul,
        .rich-text-display ol {
          margin: 0.5em 0;
          padding-left: 2em;
          list-style-position: outside;
        }
        .rich-text-display ul {
          list-style-type: disc;
        }
        .rich-text-display ol {
          list-style-type: decimal;
        }
        .rich-text-display li {
          margin: 0.2em 0;
          display: list-item;
          list-style-position: outside;
        }
        .rich-text-display a {
          color: #3b82f6;
          text-decoration: underline;
        }
        `,
        }}
      />
    </div>
  );
};
