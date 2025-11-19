export const getRichTextStyles = () => `
  /* Rich Text Shared Styles */
  .rich-text-content {
    line-height: 1.8;
    font-size: 16px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Headings */
  .rich-text-content h1 {
    font-size: 2em;
    font-weight: 700;
    margin: 0.67em 0;
    line-height: 1.2;
    scroll-margin-top: 100px;
  }

  .rich-text-content h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 0.75em 0;
    line-height: 1.3;
    scroll-margin-top: 100px;
  }

  .rich-text-content h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 0.83em 0;
    line-height: 1.4;
    scroll-margin-top: 100px;
  }

  .rich-text-content h4 {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0.9em 0;
    line-height: 1.4;
  }

  /* Paragraphs */
  .rich-text-content p {
    margin: 0.75em 0;
    line-height: 1.8;
  }

  .rich-text-content p:first-child {
    margin-top: 0;
  }

  .rich-text-content p:last-child {
    margin-bottom: 0;
  }

  /* Text Formatting */
  .rich-text-content strong,
  .rich-text-content b {
    font-weight: 700;
  }

  .rich-text-content em,
  .rich-text-content i {
    font-style: italic;
  }

  .rich-text-content u {
    text-decoration: underline;
  }

  .rich-text-content s,
  .rich-text-content strike {
    text-decoration: line-through;
  }

  .rich-text-content mark {
    background-color: #fef08a;
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content mark {
      background-color: #fbbf24;
      color: #000;
    }
  }

  /* Font Sizes */
  .rich-text-content font[size="1"],
  .rich-text-content [size="1"] {
    font-size: 10px !important;
  }

  .rich-text-content font[size="2"],
  .rich-text-content [size="2"] {
    font-size: 13px !important;
  }

  .rich-text-content font[size="3"],
  .rich-text-content [size="3"] {
    font-size: 16px !important;
  }

  .rich-text-content font[size="4"],
  .rich-text-content [size="4"] {
    font-size: 18px !important;
  }

  .rich-text-content font[size="5"],
  .rich-text-content [size="5"] {
    font-size: 24px !important;
  }

  .rich-text-content font[size="6"],
  .rich-text-content [size="6"] {
    font-size: 32px !important;
  }

  .rich-text-content font[size="7"],
  .rich-text-content [size="7"] {
    font-size: 48px !important;
  }

  /* Background Colors / Highlights */
  .rich-text-content [style*="background-color"],
  .rich-text-content [style*="background"] {
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }

  /* Links */
  .rich-text-content a {
    color: #3b82f6;
    text-decoration: underline;
    transition: color 0.2s ease;
    cursor: pointer;
    word-break: break-word;
  }

  .rich-text-content a:hover {
    color: #2563eb;
  }

  .rich-text-content a:visited {
    color: #7c3aed;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content a {
      color: #60a5fa;
    }

    .rich-text-content a:hover {
      color: #93c5fd;
    }

    .rich-text-content a:visited {
      color: #a78bfa;
    }
  }

  /* Lists */
  .rich-text-content ul,
  .rich-text-content ol {
    margin: 0.75em 0;
    padding-left: 2em;
    list-style-position: outside;
  }

  .rich-text-content ul {
    list-style-type: disc;
  }

  .rich-text-content ul ul {
    list-style-type: circle;
    margin: 0.25em 0;
  }

  .rich-text-content ul ul ul {
    list-style-type: square;
  }

  .rich-text-content ol {
    list-style-type: decimal;
  }

  .rich-text-content ol ol {
    list-style-type: lower-alpha;
    margin: 0.25em 0;
  }

  .rich-text-content ol ol ol {
    list-style-type: lower-roman;
  }

  .rich-text-content li {
    margin: 0.5em 0;
    line-height: 1.6;
    display: list-item;
    list-style-position: outside;
  }

  .rich-text-content li > p {
    margin: 0.25em 0;
  }

  /* Blockquotes */
  .rich-text-content blockquote {
    margin: 1.5em 0;
    padding: 0.75em 1.25em;
    border-left: 4px solid #3b82f6;
    background: rgba(59, 130, 246, 0.05);
    font-style: italic;
    border-radius: 0 4px 4px 0;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content blockquote {
      background: rgba(59, 130, 246, 0.1);
      border-left-color: #60a5fa;
    }
  }

  .rich-text-content blockquote p {
    margin: 0.5em 0;
  }

  .rich-text-content blockquote p:first-child {
    margin-top: 0;
  }

  .rich-text-content blockquote p:last-child {
    margin-bottom: 0;
  }

  /* Code */
  .rich-text-content code {
    background: rgba(59, 130, 246, 0.1);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
    font-size: 0.9em;
    color: #be185d;
    word-break: break-word;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content code {
      background: rgba(59, 130, 246, 0.15);
      color: #f472b6;
    }
  }

  /* Pre-formatted Code Blocks */
  .rich-text-content pre {
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

  .rich-text-content pre code {
    background: transparent;
    padding: 0;
    color: inherit;
    font-size: inherit;
    border-radius: 0;
  }

  .rich-text-content pre::-webkit-scrollbar {
    height: 8px;
  }

  .rich-text-content pre::-webkit-scrollbar-track {
    background: #334155;
    border-radius: 4px;
  }

  .rich-text-content pre::-webkit-scrollbar-thumb {
    background: #64748b;
    border-radius: 4px;
  }

  .rich-text-content pre::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Images */
  .rich-text-content img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5em auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .rich-text-content img:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content img {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .rich-text-content img:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
  }

  /* Horizontal Rules */
  .rich-text-content hr {
    margin: 2em 0;
    border: none;
    border-top: 2px solid #e5e7eb;
    opacity: 0.6;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content hr {
      border-top-color: #374151;
    }
  }

  /* Tables */
  .rich-text-content table {
    width: 100%;
    margin: 1.5em 0;
    border-collapse: collapse;
    border-spacing: 0;
    overflow-x: auto;
    display: table;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .rich-text-content table thead {
    background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content table thead {
      background: linear-gradient(to bottom, #374151, #1f2937);
    }
  }

  .rich-text-content table th,
  .rich-text-content table td {
    padding: 12px 16px;
    text-align: left;
    border: 1px solid #e5e7eb;
    vertical-align: top;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content table th,
    .rich-text-content table td {
      border-color: #4b5563;
    }
  }

  .rich-text-content table th {
    font-weight: 600;
    font-size: 0.95em;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .rich-text-content table tbody tr {
    transition: background-color 0.2s;
  }

  .rich-text-content table tbody tr:hover {
    background: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content table tbody tr:hover {
      background: #1f2937;
    }
  }

  .rich-text-content table tbody tr:nth-child(even) {
    background: #fafafa;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content table tbody tr:nth-child(even) {
      background: #111827;
    }
  }

  /* Column Layouts */
  .rich-text-content > div[style*="display: flex"],
  .rich-text-content > div[style*="display:flex"] {
    display: flex !important;
    gap: 16px !important;
    margin: 1em 0 !important;
  }

  .rich-text-content > div[style*="display: flex"] > div,
  .rich-text-content > div[style*="display:flex"] > div {
    flex: 1 !important;
    min-width: 0 !important;
    border: 1px dashed #ddd !important;
    padding: 12px !important;
    border-radius: 4px !important;
  }

  @media (prefers-color-scheme: dark) {
    .rich-text-content > div[style*="display: flex"] > div,
    .rich-text-content > div[style*="display:flex"] > div {
      border-color: #374151 !important;
    }
  }

  @media (max-width: 768px) {
    .rich-text-content > div[style*="display: flex"],
    .rich-text-content > div[style*="display:flex"] {
      flex-direction: column !important;
    }
  }

  /* Superscript and Subscript */
  .rich-text-content sup {
    font-size: 0.75em;
    vertical-align: super;
    line-height: 0;
  }

  .rich-text-content sub {
    font-size: 0.75em;
    vertical-align: sub;
    line-height: 0;
  }

  /* Strikethrough */
  .rich-text-content s,
  .rich-text-content strike,
  .rich-text-content del {
    text-decoration: line-through;
    opacity: 0.7;
  }

  /* Text Alignment */
  .rich-text-content [style*="text-align: left"],
  .rich-text-content [style*="text-align:left"] {
    text-align: left !important;
  }

  .rich-text-content [style*="text-align: center"],
  .rich-text-content [style*="text-align:center"] {
    text-align: center !important;
  }

  .rich-text-content [style*="text-align: right"],
  .rich-text-content [style*="text-align:right"] {
    text-align: right !important;
  }

  .rich-text-content [style*="text-align: justify"],
  .rich-text-content [style*="text-align:justify"] {
    text-align: justify !important;
  }

  /* Nested Elements Spacing */
  .rich-text-content blockquote > *:first-child {
    margin-top: 0;
  }

  .rich-text-content blockquote > *:last-child {
    margin-bottom: 0;
  }

  .rich-text-content li > *:first-child {
    margin-top: 0;
  }

  .rich-text-content li > *:last-child {
    margin-bottom: 0;
  }

  /* Line Breaks */
  .rich-text-content br {
    display: block;
    content: "";
    margin: 0.25em 0;
  }

  /* Empty Paragraphs */
  .rich-text-content p:empty::before {
    content: "\\00a0";
    display: inline-block;
  }

  /* Selection Styling */
  .rich-text-content ::selection {
    background: rgba(59, 130, 246, 0.3);
  }

  /* Focus Styles for Accessibility */
  .rich-text-content a:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Print Styles */
  @media print {
    .rich-text-content {
      color: #000;
      background: #fff;
    }

    .rich-text-content a {
      color: #000;
      text-decoration: underline;
    }

    .rich-text-content a[href]:after {
      content: " (" attr(href) ")";
      font-size: 0.8em;
      font-weight: normal;
    }

    .rich-text-content img {
      max-width: 100%;
      page-break-inside: avoid;
    }

    .rich-text-content pre {
      background: #f5f5f5;
      color: #000;
      border: 1px solid #ddd;
      page-break-inside: avoid;
    }

    .rich-text-content blockquote {
      border-left-color: #000;
      background: #f5f5f5;
      page-break-inside: avoid;
    }
  }

  /* Mobile Responsiveness */
  @media (max-width: 640px) {
    .rich-text-content {
      font-size: 15px;
    }

    .rich-text-content h1 {
      font-size: 1.75em;
    }

    .rich-text-content h2 {
      font-size: 1.4em;
    }

    .rich-text-content h3 {
      font-size: 1.2em;
    }

    .rich-text-content pre {
      font-size: 13px;
      padding: 1em;
    }

    .rich-text-content blockquote {
      padding: 0.5em 1em;
    }

    .rich-text-content ul,
    .rich-text-content ol {
      padding-left: 1.5em;
    }

    .rich-text-content img {
      margin: 1em auto;
    }

    .rich-text-content table {
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .rich-text-content table th,
    .rich-text-content table td {
      padding: 8px 12px;
      font-size: 0.9em;
    }
  }

  /* Accessibility Improvements */
  .rich-text-content {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .rich-text-content a {
      text-decoration: underline;
      font-weight: 600;
    }

    .rich-text-content blockquote {
      border-left-width: 6px;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .rich-text-content *,
    .rich-text-content *::before,
    .rich-text-content *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .rich-text-content img:hover {
      transform: none;
    }
  }

  /* Editor Specific - Placeholder */
  .rich-text-content[contenteditable]:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
    font-style: italic;
  }

  /* Editor Specific - Cursor */
  .rich-text-content[contenteditable] img {
    cursor: pointer;
  }
`;
