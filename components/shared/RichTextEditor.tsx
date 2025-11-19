import { Button } from "@/components/ui/button";
import { getRichTextStyles } from "@/lib/design/richTextStyles";
import { uploadImageInIMGBB } from "@/lib/helper/serverHelperFunc";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Columns,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Plus,
  Redo,
  Strikethrough,
  Table,
  Type,
  Underline,
  Undo,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface RichTextEditorProProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  enableImageUpload?: boolean;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "500px",
  className = "",
  enableImageUpload = true,
}: RichTextEditorProProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageWidth, setImageWidth] = useState("100");
  const [imageHeight, setImageHeight] = useState("");
  const [imageInputType, setImageInputType] = useState<"url" | "upload">("url");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);
  const [tableHeaderColor, setTableHeaderColor] = useState("#f3f4f6");
  const [columnCount, setColumnCount] = useState(2);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // New states for tracking current format
  const [currentFormat, setCurrentFormat] = useState("p");
  const [currentFontSize, setCurrentFontSize] = useState("3");
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const editorRef = useRef<HTMLDivElement>(null);
  const linkModalRef = useRef<HTMLDivElement>(null);
  const imageModalRef = useRef<HTMLDivElement>(null);
  const tableModalRef = useRef<HTMLDivElement>(null);
  const columnModalRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value)
      editorRef.current.innerHTML = value;
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      const clone = editorRef.current.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("img, table").forEach((el) => el.remove());
      const text = (clone.textContent || "").trim();
      setCharCount(text.length);
      setWordCount(text ? text.split(/\s+/).filter((w) => w).length : 0);
    }
  }, [value]);

  // Update current format and font size based on selection
  const updateFormatState = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let node: Node | null = range.startContainer;

    // If text node, get parent element
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    if (!node || !(node instanceof HTMLElement)) return;

    // Check if we're inside the editor
    if (!editorRef.current?.contains(node)) return;

    // Get block-level element (h1, h2, h3, p, blockquote, pre)
    let blockElement = node as HTMLElement;
    while (blockElement && blockElement !== editorRef.current) {
      const tagName = blockElement.tagName.toLowerCase();
      if (["h1", "h2", "h3", "p", "blockquote", "pre"].includes(tagName)) {
        setCurrentFormat(tagName);
        break;
      }
      blockElement = blockElement.parentElement as HTMLElement;
    }

    // Get font size
    let fontSizeElement = node as HTMLElement;
    while (fontSizeElement && fontSizeElement !== editorRef.current) {
      const size = fontSizeElement.getAttribute("size");
      if (size) {
        setCurrentFontSize(size);
        break;
      }
      // Check inline style
      const style = window.getComputedStyle(fontSizeElement);
      const fontSize = style.fontSize;
      if (fontSize) {
        // Map pixel sizes to font size values
        const sizeMap: { [key: string]: string } = {
          "10px": "1",
          "13px": "2",
          "16px": "3",
          "18px": "4",
          "24px": "5",
          "32px": "6",
          "48px": "7",
        };
        const mappedSize = sizeMap[fontSize];
        if (mappedSize) {
          setCurrentFontSize(mappedSize);
          break;
        }
      }
      fontSizeElement = fontSizeElement.parentElement as HTMLElement;
    }

    // Check active formats (bold, italic, underline, etc.)
    const formats = new Set<string>();

    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikeThrough"))
      formats.add("strikeThrough");
    if (document.queryCommandState("insertUnorderedList"))
      formats.add("insertUnorderedList");
    if (document.queryCommandState("insertOrderedList"))
      formats.add("insertOrderedList");
    if (document.queryCommandState("justifyLeft")) formats.add("justifyLeft");
    if (document.queryCommandState("justifyCenter"))
      formats.add("justifyCenter");
    if (document.queryCommandState("justifyRight")) formats.add("justifyRight");
    if (document.queryCommandState("justifyFull")) formats.add("justifyFull");

    setActiveFormats(formats);
  }, []);

  // Update format state on selection change
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateFormatState();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateFormatState]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateFormatState();
    }
  }, [onChange, updateFormatState]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0)
      savedSelectionRef.current = sel.getRangeAt(0);
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
    }
  };

  const execCommand = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setTimeout(() => {
      handleContentChange();
      updateFormatState();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
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
        case "z":
          e.preventDefault();
          execCommand(e.shiftKey ? "redo" : "undo");
          break;
        case "y":
          e.preventDefault();
          execCommand("redo");
          break;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    if (html) {
      let clean = html
        .replace(/<\/?o:p>/gi, "")
        .replace(/<\/?w:[^>]*>/gi, "")
        .replace(/class="?Mso[^"]*"?/gi, "")
        .replace(/style="[^"]*mso-[^"]*"/gi, "")
        .replace(/<span[^>]*>\s*<\/span>/gi, "");
      const div = document.createElement("div");
      div.innerHTML = clean;
      const allowed = [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "a",
        "table",
        "tr",
        "td",
        "th",
        "thead",
        "tbody",
      ];
      div.querySelectorAll("*").forEach((el) => {
        if (!allowed.includes(el.tagName.toLowerCase())) {
          const p = el.parentNode;
          while (el.firstChild) p?.insertBefore(el.firstChild, el);
          p?.removeChild(el);
        }
      });
      document.execCommand("insertHTML", false, div.innerHTML);
    } else {
      document.execCommand("insertHTML", false, text.replace(/\n/g, "<br>"));
    }
    setTimeout(() => {
      handleContentChange();
      updateFormatState();
    }, 10);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        showLinkModal &&
        linkModalRef.current &&
        !linkModalRef.current.contains(t)
      )
        closeLinkModal();
      if (
        showImageModal &&
        imageModalRef.current &&
        !imageModalRef.current.contains(t)
      )
        closeImageModal();
      if (
        showTableModal &&
        tableModalRef.current &&
        !tableModalRef.current.contains(t)
      )
        closeTableModal();
      if (
        showColumnModal &&
        columnModalRef.current &&
        !columnModalRef.current.contains(t)
      )
        closeColumnModal();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLinkModal, showImageModal, showTableModal, showColumnModal]);

  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const txt = sel?.toString() || "";
    const rng = sel?.getRangeAt(0);
    const con = rng?.commonAncestorContainer;
    let link: HTMLAnchorElement | null = null;
    if (con)
      link =
        con.nodeType === Node.ELEMENT_NODE
          ? (con as HTMLElement).closest("a")
          : con.parentElement?.closest("a") || null;
    if (link) {
      setLinkUrl(link.href);
      setLinkText(link.textContent || "");
      setSelectedElement(link);
    } else {
      setLinkUrl("");
      setLinkText(txt);
      setSelectedElement(null);
    }
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    const txt = linkText.trim() || url;
    if (selectedElement && selectedElement.tagName === "A") {
      selectedElement.href = url;
      selectedElement.textContent = txt;
    } else {
      restoreSelection();
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>&nbsp;`
      );
    }
    handleContentChange();
    closeLinkModal();
  };

  const removeLink = () => {
    if (selectedElement && selectedElement.tagName === "A") {
      selectedElement.parentNode?.replaceChild(
        document.createTextNode(selectedElement.textContent || ""),
        selectedElement
      );
      handleContentChange();
    }
    closeLinkModal();
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    setSelectedElement(null);
    editorRef.current?.focus();
  };

  const openImageModal = () => {
    saveSelection();
    setImageUrl("");
    setImageAlt("");
    setImageWidth("100");
    setImageHeight("");
    setImageInputType("url");
    setUploadedImagePreview(null);
    setShowImageModal(true);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const prev = URL.createObjectURL(file);
    setUploadedImagePreview(prev);
    setIsUploadingImage(true);
    try {
      const url = await uploadImageInIMGBB(file);
      setImageUrl(url);
      toast.success("Uploaded!");
    } catch {
      toast.error("Failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const insertImage = () => {
    if (!imageUrl.trim()) return;
    const w = imageWidth ? `${imageWidth}%` : "100%";
    const h = imageHeight ? `${imageHeight}px` : "auto";
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${imageUrl.trim()}" alt="${
        imageAlt.trim() || "Image"
      }" style="max-width: ${w}; height: ${h}; border-radius: 8px; margin: 10px 0; display: block;" /><br/>`
    );
    handleContentChange();
    closeImageModal();
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setImageWidth("100");
    setImageHeight("");
    setImageInputType("url");
    setUploadedImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (uploadedImagePreview) URL.revokeObjectURL(uploadedImagePreview);
    editorRef.current?.focus();
  };

  const openTableModal = () => {
    saveSelection();
    setTableRows(3);
    setTableCols(3);
    setTableHasHeader(true);
    setTableHeaderColor("#f3f4f6");
    setShowTableModal(true);
  };

  const insertTable = () => {
    restoreSelection();
    editorRef.current?.focus();
    let html =
      '<table style="width: 100%; border-collapse: collapse; margin: 1em 0; background: transparent;">';
    if (tableHasHeader) {
      html += "<thead><tr>";
      for (let i = 0; i < tableCols; i++)
        html += `<th style="border: 1px solid #ddd; padding: 12px; background: ${tableHeaderColor}; font-weight: 600;">Header ${
          i + 1
        }</th>`;
      html += "</tr></thead>";
    }
    html += "<tbody>";
    for (let i = 0; i < (tableHasHeader ? tableRows - 1 : tableRows); i++) {
      html += "<tr>";
      for (let j = 0; j < tableCols; j++)
        html +=
          '<td style="border: 1px solid #ddd; padding: 12px; background: transparent;">Cell</td>';
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";
    document.execCommand("insertHTML", false, html);
    handleContentChange();
    closeTableModal();
  };

  const closeTableModal = () => {
    setShowTableModal(false);
    editorRef.current?.focus();
  };

  const openColumnModal = () => {
    saveSelection();
    setColumnCount(2);
    setShowColumnModal(true);
  };

  const insertColumns = () => {
    restoreSelection();
    editorRef.current?.focus();
    let html =
      '<div style="display: flex; gap: 16px; margin: 1em 0; background: transparent;">';
    for (let i = 0; i < columnCount; i++)
      html += `<div style="flex: 1; min-width: 0; border: 1px dashed #ddd; padding: 12px; border-radius: 4px; background: transparent;" contenteditable="true">Column ${
        i + 1
      }<br>Add content...</div>`;
    html += "</div><p><br></p>";
    document.execCommand("insertHTML", false, html);
    handleContentChange();
    closeColumnModal();
  };

  const closeColumnModal = () => {
    setShowColumnModal(false);
    editorRef.current?.focus();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "A") {
      e.preventDefault();
      setSelectedElement(t);
      setLinkUrl((t as HTMLAnchorElement).href);
      setLinkText(t.textContent || "");
      setShowLinkModal(true);
    } else if (t.tagName === "IMG") {
      e.preventDefault();
      setImageUrl((t as HTMLImageElement).src);
      setImageAlt((t as HTMLImageElement).alt);
      const s = t.getAttribute("style") || "";
      const m = s.match(/max-width:\s*(\d+)%/);
      if (m) setImageWidth(m[1]);
      setShowImageModal(true);
    }
  };

  const colors = [
    "#000000",
    "#e60000",
    "#ff9900",
    "#ffff00",
    "#008a00",
    "#0066cc",
    "#9933ff",
    "#ffffff",
    "#facccc",
    "#ffebcc",
    "#ffffcc",
    "#cce8cc",
    "#cce0f5",
    "#ebd6ff",
    "#bbbbbb",
    "#f06666",
    "#ffc266",
    "#ffff66",
    "#66b966",
    "#66a3e0",
    "#c285ff",
    "#888888",
    "#a10000",
    "#b26b00",
  ];
  const highlights = [
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#ff00ff",
    "#ff0000",
    "#0000ff",
    "#ffcc00",
    "#ff6600",
    "#00cc00",
    "#0099cc",
    "#6600cc",
    "#cc0099",
  ];
  const tableColors = [
    { n: "Light Gray", v: "#f3f4f6" },
    { n: "Blue", v: "#dbeafe" },
    { n: "Green", v: "#d1fae5" },
    { n: "Yellow", v: "#fef3c7" },
    { n: "Red", v: "#fee2e2" },
    { n: "Purple", v: "#e9d5ff" },
    { n: "None", v: "transparent" },
  ];
  const btns = [
    { c: "bold", i: Bold, t: "Bold" },
    { c: "italic", i: Italic, t: "Italic" },
    { c: "underline", i: Underline, t: "Underline" },
    { c: "strikeThrough", i: Strikethrough, t: "Strike" },
    { d: true },
    { c: "insertUnorderedList", i: List, t: "Bullets" },
    { c: "insertOrderedList", i: ListOrdered, t: "Numbers" },
    { d: true },
    { c: "justifyLeft", i: AlignLeft, t: "Left" },
    { c: "justifyCenter", i: AlignCenter, t: "Center" },
    { c: "justifyRight", i: AlignRight, t: "Right" },
    { c: "justifyFull", i: AlignJustify, t: "Justify" },
  ];

  return (
    <div className={`rich-text-editor-pro ${className}`}>
      <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-1 p-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850">
          <select
            className="px-3 py-2 text-sm font-medium border-2 rounded-lg mr-2 bg-white dark:bg-gray-800"
            onChange={(e) => execCommand("formatBlock", `<${e.target.value}>`)}
            value={currentFormat}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="blockquote">Quote</option>
            <option value="pre">Code</option>
          </select>
          <select
            className="px-3 py-2 text-sm font-medium border-2 rounded-lg mr-2 bg-white dark:bg-gray-800"
            onChange={(e) => execCommand("fontSize", e.target.value)}
            value={currentFontSize}
          >
            <option value="1">10px</option>
            <option value="2">13px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
            <option value="7">48px</option>
          </select>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          {btns.map((b, i) =>
            b.d ? (
              <div
                key={i}
                className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1"
              />
            ) : (
              <Button
                key={b.c}
                type="button"
                variant={activeFormats.has(b.c!) ? "default" : "ghost"}
                size="sm"
                onClick={() => execCommand(b.c!)}
                title={b.t}
                className="h-9 w-9 p-0"
              >
                <b.i className="h-4 w-4" />
              </Button>
            )
          )}
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              className="h-9 w-9 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border-2 rounded-lg shadow-xl z-50">
                <div className="grid grid-cols-6 gap-2 w-48">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-6 h-6 rounded border-2"
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        execCommand("foreColor", c);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              className="h-9 w-9 p-0"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border-2 rounded-lg shadow-xl z-50">
                <div className="grid grid-cols-6 gap-2 w-48">
                  {highlights.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-6 h-6 rounded border-2"
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        execCommand("hiliteColor", c);
                        setShowHighlightPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openLinkModal}
            className="h-9 w-9 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openImageModal}
            className="h-9 w-9 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openTableModal}
            className="h-9 w-9 p-0"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openColumnModal}
            className="h-9 w-9 p-0"
          >
            <Columns className="h-4 w-4" />
          </Button>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("undo")}
            className="h-9 w-9 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("redo")}
            className="h-9 w-9 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          className={`rich-text-content p-8 outline-none overflow-y-auto text-gray-900 dark:text-gray-100 ${
            isFocused ? "ring-2 ring-blue-500 ring-opacity-30" : ""
          }`}
          style={{ minHeight }}
          onFocus={() => {
            setIsFocused(true);
            updateFormatState();
          }}
          onBlur={() => setIsFocused(false)}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onKeyUp={updateFormatState}
          onClick={updateFormatState}
          onPaste={handlePaste}
          onDoubleClick={handleDoubleClick}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />
        <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border-t-2">
          <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            <span>
              Words: <span className="text-blue-600">{wordCount}</span>
            </span>
            <span>
              Chars: <span className="text-blue-600">{charCount}</span>
            </span>
          </div>
        </div>
        <>
          {showLinkModal && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-[100] p-4">
              <div
                ref={linkModalRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Link className="h-6 w-6" />
                    {selectedElement ? "Edit Link" : "Insert Link"}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={closeLinkModal}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && insertLink()}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Text
                    </label>
                    <input
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && insertLink()}
                      placeholder="Link text"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-8 gap-3">
                  {selectedElement && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={removeLink}
                    >
                      Remove
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeLinkModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={insertLink}
                    disabled={!linkUrl.trim()}
                    className="bg-blue-600"
                  >
                    {selectedElement ? "Update" : "Insert"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {showImageModal && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-[100] p-4">
              <div
                ref={imageModalRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <ImageIcon className="h-6 w-6" />
                    Insert Image
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={closeImageModal}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {enableImageUpload && (
                  <div className="flex gap-2 mb-6">
                    <Button
                      type="button"
                      variant={imageInputType === "url" ? "default" : "outline"}
                      onClick={() => setImageInputType("url")}
                      className="flex-1"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={
                        imageInputType === "upload" ? "default" : "outline"
                      }
                      onClick={() => setImageInputType("upload")}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                )}
                <div className="space-y-5">
                  {imageInputType === "url" ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Upload
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        disabled={isUploadingImage}
                        className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
                      />
                      {isUploadingImage && (
                        <p className="text-sm text-blue-600 mt-2">
                          Uploading...
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Description"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Width (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={imageWidth}
                          onChange={(e) => setImageWidth(e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm font-semibold min-w-[45px]">
                          {imageWidth}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(e.target.value)}
                        placeholder="Auto"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                  {(imageUrl || uploadedImagePreview) && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Preview:</p>
                      <div className="border-2 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <img
                          src={uploadedImagePreview || imageUrl}
                          alt="Preview"
                          style={{
                            maxWidth: `${imageWidth}%`,
                            height: imageHeight ? `${imageHeight}px` : "auto",
                          }}
                          className="mx-auto rounded-lg"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-8 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeImageModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={insertImage}
                    disabled={!imageUrl.trim() || isUploadingImage}
                    className="bg-blue-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Insert
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showTableModal && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-[100] p-4">
              <div
                ref={tableModalRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Table className="h-6 w-6" />
                    Insert Table
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={closeTableModal}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Rows
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setTableRows(Math.max(1, tableRows - 1))}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-bold min-w-[40px] text-center">
                        {tableRows}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTableRows(Math.min(20, tableRows + 1))
                        }
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Columns
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setTableCols(Math.max(1, tableCols - 1))}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-bold min-w-[40px] text-center">
                        {tableCols}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTableCols(Math.min(10, tableCols + 1))
                        }
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <input
                      type="checkbox"
                      id="hdr"
                      checked={tableHasHeader}
                      onChange={(e) => setTableHasHeader(e.target.checked)}
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor="hdr"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Header row
                    </label>
                  </div>
                  {tableHasHeader && (
                    <div>
                      <label className="block text-sm font-semibold mb-3">
                        Header Color
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {tableColors.map((c) => (
                          <button
                            key={c.v}
                            type="button"
                            onClick={() => setTableHeaderColor(c.v)}
                            className={`p-3 rounded-lg border-2 text-xs font-medium ${
                              tableHeaderColor === c.v
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-300"
                            }`}
                            style={{
                              backgroundColor:
                                c.v === "transparent" ? "#fff" : c.v,
                            }}
                          >
                            {c.n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-2 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs font-semibold mb-2">Preview:</p>
                    <div className="overflow-auto">
                      <table className="w-full text-xs border-collapse">
                        {tableHasHeader && (
                          <thead>
                            <tr>
                              {Array.from({ length: tableCols }).map((_, i) => (
                                <th
                                  key={i}
                                  className="border p-2"
                                  style={{ backgroundColor: tableHeaderColor }}
                                >
                                  H{i + 1}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {Array.from({
                            length: tableHasHeader ? tableRows - 1 : tableRows,
                          }).map((_, i) => (
                            <tr key={i}>
                              {Array.from({ length: tableCols }).map((_, j) => (
                                <td key={j} className="border p-2">
                                  Cell
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeTableModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={insertTable}
                    className="bg-blue-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Insert
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showColumnModal && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-[100] p-4">
              <div
                ref={columnModalRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Columns className="h-6 w-6" />
                    Insert Columns
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={closeColumnModal}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-4">
                      Columns
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setColumnCount(Math.max(1, columnCount - 1))
                        }
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-bold min-w-[40px] text-center">
                        {columnCount}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setColumnCount(Math.min(4, columnCount + 1))
                        }
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="border-2 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs font-semibold mb-3">Preview:</p>
                    <div className="flex gap-2">
                      {Array.from({ length: columnCount }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-2 border-dashed rounded p-3 bg-white dark:bg-gray-800"
                        >
                          <p className="text-xs text-center">Col {i + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeColumnModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={insertColumns}
                    className="bg-blue-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Insert
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      </div>

      <style dangerouslySetInnerHTML={{ __html: getRichTextStyles() }} />
    </div>
  );
};

export default RichTextEditor;
