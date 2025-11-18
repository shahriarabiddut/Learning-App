import React from "react";

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
  if (!content) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <>
      <div
        className={`rich-text-display prose prose-base sm:prose-lg dark:prose-invert ${maxWidthClasses[maxWidth]} ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Rich Text Display Styles */
        .rich-text-display {
          line-height: 1.8;
          font-size: 16px;
          color: inherit;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Headings */
        .rich-text-display h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
          line-height: 1.2;
          color: inherit;
          scroll-margin-top: 100px;
        }

        .rich-text-display h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.75em 0;
          line-height: 1.3;
          color: inherit;
          scroll-margin-top: 100px;
        }

        .rich-text-display h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.83em 0;
          line-height: 1.4;
          color: inherit;
          scroll-margin-top: 100px;
        }

        .rich-text-display h4 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 0.9em 0;
          line-height: 1.4;
          color: inherit;
        }

        /* Paragraphs */
        .rich-text-display p {
          margin: 0.75em 0;
          line-height: 1.8;
          color: inherit;
        }

        .rich-text-display p:first-child {
          margin-top: 0;
        }

        .rich-text-display p:last-child {
          margin-bottom: 0;
        }

        /* Text Formatting */
        .rich-text-display strong,
        .rich-text-display b {
          font-weight: 700;
          color: inherit;
        }

        .rich-text-display em,
        .rich-text-display i {
          font-style: italic;
        }

        .rich-text-display u {
          text-decoration: underline;
        }

        .rich-text-display s,
        .rich-text-display strike {
          text-decoration: line-through;
        }

        .rich-text-display mark {
          background-color: #fef08a;
          padding: 0.1em 0.3em;
          border-radius: 3px;
          color: inherit;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display mark {
            background-color: #fbbf24;
            color: #000;
          }
        }

        /* Handle background-color for highlights */
        .rich-text-display [style*="background-color"] {
          padding: 0.1em 0.3em;
          border-radius: 3px;
        }

        /* Links */
        .rich-text-display a {
          color: #3b82f6;
          text-decoration: underline;
          transition: color 0.2s ease;
          cursor: pointer;
          word-break: break-word;
        }

        .rich-text-display a:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .rich-text-display a:visited {
          color: #7c3aed;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display a {
            color: #60a5fa;
          }

          .rich-text-display a:hover {
            color: #93c5fd;
          }

          .rich-text-display a:visited {
            color: #a78bfa;
          }
        }

        /* Lists */
        .rich-text-display ul,
        .rich-text-display ol {
          margin: 0.75em 0;
          padding-left: 2em;
          list-style-position: outside;
        }

        .rich-text-display ul {
          list-style-type: disc;
        }

        .rich-text-display ul ul {
          list-style-type: circle;
          margin: 0.25em 0;
        }

        .rich-text-display ul ul ul {
          list-style-type: square;
        }

        .rich-text-display ol {
          list-style-type: decimal;
        }

        .rich-text-display ol ol {
          list-style-type: lower-alpha;
          margin: 0.25em 0;
        }

        .rich-text-display ol ol ol {
          list-style-type: lower-roman;
        }

        .rich-text-display li {
          margin: 0.5em 0;
          line-height: 1.6;
          display: list-item;
          list-style-position: outside;
        }

        .rich-text-display li > p {
          margin: 0.25em 0;
        }

        /* Blockquotes */
        .rich-text-display blockquote {
          margin: 1.5em 0;
          padding: 0.75em 1.25em;
          border-left: 4px solid #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          font-style: italic;
          color: inherit;
          border-radius: 0 4px 4px 0;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display blockquote {
            background: rgba(59, 130, 246, 0.1);
            border-left-color: #60a5fa;
          }
        }

        .rich-text-display blockquote p {
          margin: 0.5em 0;
        }

        .rich-text-display blockquote p:first-child {
          margin-top: 0;
        }

        .rich-text-display blockquote p:last-child {
          margin-bottom: 0;
        }

        /* Code */
        .rich-text-display code {
          background: rgba(59, 130, 246, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
          font-size: 0.9em;
          color: #be185d;
          word-break: break-word;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display code {
            background: rgba(59, 130, 246, 0.15);
            color: #f472b6;
          }
        }

        /* Pre-formatted Code Blocks */
        .rich-text-display pre {
          margin: 1.5em 0;
          padding: 1.25em;
          background: #1e293b;
          color: #e2e8f0;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
          font-size: 14px;
          line-height: 1.6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .rich-text-display pre code {
          background: transparent;
          padding: 0;
          color: inherit;
          font-size: inherit;
          border-radius: 0;
        }

        .rich-text-display pre::-webkit-scrollbar {
          height: 8px;
        }

        .rich-text-display pre::-webkit-scrollbar-track {
          background: #334155;
          border-radius: 4px;
        }

        .rich-text-display pre::-webkit-scrollbar-thumb {
          background: #64748b;
          border-radius: 4px;
        }

        .rich-text-display pre::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Images */
        .rich-text-display img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1.5em auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .rich-text-display img:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display img {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .rich-text-display img:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          }
        }

        /* Horizontal Rules */
        .rich-text-display hr {
          margin: 2em 0;
          border: none;
          border-top: 2px solid #e5e7eb;
          opacity: 0.6;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display hr {
            border-top-color: #374151;
          }
        }

        /* Tables */
        .rich-text-display table {
          width: 100%;
          margin: 1.5em 0;
          border-collapse: collapse;
          border-spacing: 0;
          overflow-x: auto;
          display: table;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .rich-text-display table thead {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display table thead {
            background: linear-gradient(to bottom, #374151, #1f2937);
          }
        }

        .rich-text-display table th,
        .rich-text-display table td {
          padding: 12px 16px;
          text-align: left;
          border: 1px solid #e5e7eb;
          vertical-align: top;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display table th,
          .rich-text-display table td {
            border-color: #4b5563;
          }
        }

        .rich-text-display table th {
          font-weight: 600;
          font-size: 0.95em;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .rich-text-display table tbody tr {
          transition: background-color 0.2s;
        }

        .rich-text-display table tbody tr:hover {
          background: #f9fafb;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display table tbody tr:hover {
            background: #1f2937;
          }
        }

        .rich-text-display table tbody tr:nth-child(even) {
          background: #fafafa;
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display table tbody tr:nth-child(even) {
            background: #111827;
          }
        }

        /* Column Layouts */
        .rich-text-display .column-layout {
          display: flex;
          gap: 20px;
          margin: 2em 0;
        }

        .rich-text-display .column-layout > div {
          flex: 1;
          min-width: 0;
          border: 1px solid #e5e7eb;
          padding: 16px;
          border-radius: 8px;
          background: #fafafa;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        @media (prefers-color-scheme: dark) {
          .rich-text-display .column-layout > div {
            border-color: #374151;
            background: #1f2937;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
        }

        @media (max-width: 768px) {
          .rich-text-display .column-layout {
            flex-direction: column;
          }
          
          .rich-text-display .column-layout > div {
            width: 100%;
          }
        }

        /* Superscript and Subscript */
        .rich-text-display sup {
          font-size: 0.75em;
          vertical-align: super;
          line-height: 0;
        }

        .rich-text-display sub {
          font-size: 0.75em;
          vertical-align: sub;
          line-height: 0;
        }

        /* Strikethrough */
        .rich-text-display s,
        .rich-text-display strike,
        .rich-text-display del {
          text-decoration: line-through;
          opacity: 0.7;
        }

        /* Text Alignment */
        .rich-text-display [style*="text-align: left"],
        .rich-text-display [style*="text-align:left"] {
          text-align: left;
        }

        .rich-text-display [style*="text-align: center"],
        .rich-text-display [style*="text-align:center"] {
          text-align: center;
        }

        .rich-text-display [style*="text-align: right"],
        .rich-text-display [style*="text-align:right"] {
          text-align: right;
        }

        .rich-text-display [style*="text-align: justify"],
        .rich-text-display [style*="text-align:justify"] {
          text-align: justify;
        }

        /* Font Sizes from Editor */
        .rich-text-display [size="1"],
        .rich-text-display font[size="1"] {
          font-size: 10px;
        }

        .rich-text-display [size="2"],
        .rich-text-display font[size="2"] {
          font-size: 13px;
        }

        .rich-text-display [size="3"],
        .rich-text-display font[size="3"] {
          font-size: 16px;
        }

        .rich-text-display [size="4"],
        .rich-text-display font[size="4"] {
          font-size: 18px;
        }

        .rich-text-display [size="5"],
        .rich-text-display font[size="5"] {
          font-size: 24px;
        }

        .rich-text-display [size="6"],
        .rich-text-display font[size="6"] {
          font-size: 32px;
        }

        .rich-text-display [size="7"],
        .rich-text-display font[size="7"] {
          font-size: 48px;
        }

        /* Color preservation */
        .rich-text-display [color],
        .rich-text-display font[color] {
          color: inherit;
        }

        .rich-text-display [style*="color:"],
        .rich-text-display [style*="color :"] {
          /* Colors from inline styles are preserved */
        }

        /* Nested Elements Spacing */
        .rich-text-display blockquote > *:first-child {
          margin-top: 0;
        }

        .rich-text-display blockquote > *:last-child {
          margin-bottom: 0;
        }

        .rich-text-display li > *:first-child {
          margin-top: 0;
        }

        .rich-text-display li > *:last-child {
          margin-bottom: 0;
        }

        /* Line Breaks */
        .rich-text-display br {
          display: block;
          content: "";
          margin: 0.25em 0;
        }

        /* Empty Paragraphs */
        .rich-text-display p:empty::before {
          content: "\\00a0";
          display: inline-block;
        }

        /* Selection Styling */
        .rich-text-display ::selection {
          background: rgba(59, 130, 246, 0.3);
        }

        /* Focus Styles for Accessibility */
        .rich-text-display a:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 2px;
        }

        /* Print Styles */
        @media print {
          .rich-text-display {
            color: #000;
            background: #fff;
          }

          .rich-text-display a {
            color: #000;
            text-decoration: underline;
          }

          .rich-text-display a[href]:after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            font-weight: normal;
          }

          .rich-text-display img {
            max-width: 100%;
            page-break-inside: avoid;
          }

          .rich-text-display pre {
            background: #f5f5f5;
            color: #000;
            border: 1px solid #ddd;
            page-break-inside: avoid;
          }

          .rich-text-display blockquote {
            border-left-color: #000;
            background: #f5f5f5;
            page-break-inside: avoid;
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 640px) {
          .rich-text-display {
            font-size: 15px;
          }

          .rich-text-display h1 {
            font-size: 1.75em;
          }

          .rich-text-display h2 {
            font-size: 1.4em;
          }

          .rich-text-display h3 {
            font-size: 1.2em;
          }

          .rich-text-display pre {
            font-size: 13px;
            padding: 1em;
          }

          .rich-text-display blockquote {
            padding: 0.5em 1em;
          }

          .rich-text-display ul,
          .rich-text-display ol {
            padding-left: 1.5em;
          }

          .rich-text-display img {
            margin: 1em auto;
          }

          .rich-text-display table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .rich-text-display table th,
          .rich-text-display table td {
            padding: 8px 12px;
            font-size: 0.9em;
          }
        }

        /* Accessibility Improvements */
        .rich-text-display {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .rich-text-display a {
            text-decoration: underline;
            font-weight: 600;
          }

          .rich-text-display blockquote {
            border-left-width: 6px;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .rich-text-display *,
          .rich-text-display *::before,
          .rich-text-display *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .rich-text-display img:hover {
            transform: none;
          }
        }
        `,
        }}
      />
    </>
  );
};

export default RichTextDisplay;
