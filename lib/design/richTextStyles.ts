export const getRichTextStyles = () => `
.rich-text-content,
.rich-text-display {
    line-height: 1.8;
    font-size: 16px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    overflow-x: hidden
}

.rich-text-content>*,
.rich-text-display>* {
    max-width: 100%
}

.rich-text-content h1,
.rich-text-display h1 {
    font-size: 2em;
    font-weight: 700;
    margin: .67em 0;
    line-height: 1.2;
    scroll-margin-top: 100px
}

.rich-text-content h2,
.rich-text-display h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin: .75em 0;
    line-height: 1.3;
    scroll-margin-top: 100px
}

.rich-text-content h3,
.rich-text-display h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: .83em 0;
    line-height: 1.4;
    scroll-margin-top: 100px
}

.rich-text-content h4,
.rich-text-display h4 {
    font-size: 1.1em;
    font-weight: 600;
    margin: .9em 0;
    line-height: 1.4
}

.rich-text-content p,
.rich-text-display p {
    margin: .75em 0;
    line-height: 1.8
}

.rich-text-content p:first-child,
.rich-text-display p:first-child {
    margin-top: 0
}

.rich-text-content p:last-child,
.rich-text-display p:last-child {
    margin-bottom: 0
}

.rich-text-content strong,
.rich-text-content b,
.rich-text-display strong,
.rich-text-display b {
    font-weight: 700
}

.rich-text-content em,
.rich-text-content i,
.rich-text-display em,
.rich-text-display i {
    font-style: italic
}

.rich-text-content u,
.rich-text-display u {
    text-decoration: underline
}

.rich-text-content s,
.rich-text-content strike,
.rich-text-display s,
.rich-text-display strike {
    text-decoration: line-through
}

.rich-text-content mark,
.rich-text-display mark {
    background-color: #fef08a;
    padding: .1em .3em;
    border-radius: 3px
}

@media (prefers-color-scheme:dark) {
    .rich-text-content mark,
    .rich-text-display mark {
        background-color: #fbbf24;
        color: #000
    }
}

.rich-text-content font[size="1"],
.rich-text-content [size="1"],
.rich-text-display font[size="1"],
.rich-text-display [size="1"] {
    font-size: 10px !important
}

.rich-text-content font[size="2"],
.rich-text-content [size="2"],
.rich-text-display font[size="2"],
.rich-text-display [size="2"] {
    font-size: 13px !important
}

.rich-text-content font[size="3"],
.rich-text-content [size="3"],
.rich-text-display font[size="3"],
.rich-text-display [size="3"] {
    font-size: 16px !important
}

.rich-text-content font[size="4"],
.rich-text-content [size="4"],
.rich-text-display font[size="4"],
.rich-text-display [size="4"] {
    font-size: 18px !important
}

.rich-text-content font[size="5"],
.rich-text-content [size="5"],
.rich-text-display font[size="5"],
.rich-text-display [size="5"] {
    font-size: 24px !important
}

.rich-text-content font[size="6"],
.rich-text-content [size="6"],
.rich-text-display font[size="6"],
.rich-text-display [size="6"] {
    font-size: 32px !important
}

.rich-text-content font[size="7"],
.rich-text-content [size="7"],
.rich-text-display font[size="7"],
.rich-text-display [size="7"] {
    font-size: 48px !important
}

.rich-text-content [style*="background-color"],
.rich-text-content [style*="background"],
.rich-text-display [style*="background-color"],
.rich-text-display [style*="background"] {
    padding: .1em .3em;
    border-radius: 3px
}

.rich-text-content a,
.rich-text-display a {
    color: #3b82f6;
    text-decoration: underline;
    transition: color .2s ease;
    cursor: pointer;
    word-break: break-word
}

.rich-text-content a:hover,
.rich-text-display a:hover {
    color: #2563eb
}

.rich-text-content a:visited,
.rich-text-display a:visited {
    color: #7c3aed
}

@media (prefers-color-scheme:dark) {
    .rich-text-content a,
    .rich-text-display a {
        color: #60a5fa
    }
    .rich-text-content a:hover,
    .rich-text-display a:hover {
        color: #93c5fd
    }
    .rich-text-content a:visited,
    .rich-text-display a:visited {
        color: #a78bfa
    }
}

.rich-text-content ul,
.rich-text-content ol,
.rich-text-display ul,
.rich-text-display ol {
    margin: .75em 0;
    padding-left: 2em;
    list-style-position: outside
}

.rich-text-content ul,
.rich-text-display ul {
    list-style-type: disc
}

.rich-text-content ul ul,
.rich-text-display ul ul {
    list-style-type: circle;
    margin: .25em 0
}

.rich-text-content ul ul ul,
.rich-text-display ul ul ul {
    list-style-type: square
}

.rich-text-content ol,
.rich-text-display ol {
    list-style-type: decimal
}

.rich-text-content ol ol,
.rich-text-display ol ol {
    list-style-type: lower-alpha;
    margin: .25em 0
}

.rich-text-content ol ol ol,
.rich-text-display ol ol ol {
    list-style-type: lower-roman
}

.rich-text-content li,
.rich-text-display li {
    margin: .5em 0;
    line-height: 1.6;
    display: list-item;
    list-style-position: outside
}

.rich-text-content li>p,
.rich-text-display li>p {
    margin: .25em 0
}

.rich-text-content blockquote,
.rich-text-display blockquote {
    margin: 1.5em 0;
    padding: .75em 1.25em;
    border-left: 4px solid #3b82f6;
    background: rgba(59, 130, 246, .05);
    font-style: italic;
    border-radius: 0 4px 4px 0
}

@media (prefers-color-scheme:dark) {
    .rich-text-content blockquote,
    .rich-text-display blockquote {
        background: rgba(59, 130, 246, .1);
        border-left-color: #60a5fa
    }
}

.rich-text-content blockquote p,
.rich-text-display blockquote p {
    margin: .5em 0
}

.rich-text-content blockquote p:first-child,
.rich-text-display blockquote p:first-child {
    margin-top: 0
}

.rich-text-content blockquote p:last-child,
.rich-text-display blockquote p:last-child {
    margin-bottom: 0
}

.rich-text-content code,
.rich-text-display code {
    background: rgba(59, 130, 246, .1);
    padding: .2em .4em;
    border-radius: 4px;
    font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
    font-size: .9em;
    color: #be185d;
    word-break: break-word
}

@media (prefers-color-scheme:dark) {
    .rich-text-content code,
    .rich-text-display code {
        background: rgba(59, 130, 246, .15);
        color: #f472b6
    }
}

.rich-text-content pre,
.rich-text-display pre {
    position: relative;
    margin: 1.5em 0;
    padding: 0;
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    font-family: 'Courier New', 'Consolas', 'Monaco', 'Menlo', monospace;
    font-size: 14px;
    line-height: 1.7;
    box-shadow: 0 10px 30px rgba(0, 0, 0, .5);
    border: 1px solid #1e293b;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box
}

.rich-text-content pre.code-enhanced,
.rich-text-display pre.code-enhanced {
    display: flex;
    flex-direction: column;
    align-items: stretch
}

.rich-text-content .code-toolbar,
.rich-text-display .code-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .875em 1.25em;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    border-bottom: 2px solid #334155;
    flex-shrink: 0;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 20
}

.rich-text-content .code-language-label,
.rich-text-display .code-language-label {
    font-size: .75em;
    font-weight: 700;
    color: #60a5fa;
    text-transform: uppercase;
    letter-spacing: .1em;
    padding: .375em .75em;
    background: rgba(96, 165, 250, .1);
    border-radius: 4px;
    border: 1px solid rgba(96, 165, 250, .2)
}

.rich-text-content .code-actions,
.rich-text-display .code-actions {
    display: flex;
    gap: .625em
}

.rich-text-content .code-action-btn,
.rich-text-display .code-action-btn {
    padding: .5em .625em;
    background: rgba(30, 41, 59, .8);
    border: 1.5px solid #475569;
    border-radius: 6px;
    color: #cbd5e1;
    cursor: pointer;
    transition: all .2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px)
}

.rich-text-content .code-action-btn:hover,
.rich-text-display .code-action-btn:hover {
    background: #334155;
    border-color: #64748b;
    color: #f1f5f9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, .3)
}

.rich-text-content .code-action-btn:active,
.rich-text-display .code-action-btn:active {
    transform: translateY(0)
}

.rich-text-content .code-container,
.rich-text-display .code-container {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box
}

.rich-text-content .line-numbers-wrapper,
.rich-text-display .line-numbers-wrapper {
    flex: 0 0 3.75em;
    display: flex;
    flex-direction: column;
    background: #0a0f1a;
    border-right: 2px solid #1e293b;
    overflow: hidden;
    user-select: none;
    pointer-events: none
}

.rich-text-content .line-numbers,
.rich-text-display .line-numbers {
    flex: 1;
    padding: 1.5em .875em;
    color: #64748b;
    text-align: right;
    font-size: 14px !important;
    line-height: 1.7 !important;
    font-weight: 500;
    white-space: pre;
    font-family: 'Courier New', 'Consolas', 'Monaco', 'Menlo', monospace !important
}

.rich-text-content .code-container>code,.rich-text-display .code-container>code{
  flex:1;
  min-width:0;
  display:block;
  padding:1.5em 1.75em;
  background:transparent;
  color:inherit;
  overflow-x:auto;
  white-space:pre;
  line-height:1.7!important;
  font-size:14px!important;
  box-sizing:border-box;
  font-family:'Courier New','Consolas','Monaco','Menlo',monospace!important;
  max-width:100%
}
  .rich-text-content pre.show-raw .line-numbers-wrapper,
.rich-text-display pre.show-raw .line-numbers-wrapper{
  display:none!important
}
.rich-text-content pre:not(.code-enhanced),
.rich-text-display pre:not(.code-enhanced) {
    padding: 1.5em;
    overflow-x: auto;
    display: block
}

.rich-text-content pre:not(.code-enhanced) code,
.rich-text-display pre:not(.code-enhanced) code {
    background: transparent;
    padding: 0;
    color: inherit;
    font-size: inherit;
    border-radius: 0;
    display: block;
    white-space: pre;
    overflow-x: auto
}

.rich-text-content pre code,
.rich-text-display pre code {
    background: transparent;
    padding: 0;
    color: inherit;
    font-size: inherit;
    border-radius: 0
}

.rich-text-content pre.show-raw .code-container,
.rich-text-display pre.show-raw .code-container {
    font-family: 'Courier New', 'Consolas', 'Monaco', monospace
}

.rich-text-content pre.show-raw code,
.rich-text-display pre.show-raw code {
    white-space: pre;
    color: #e2e8f0 !important
}
.rich-text-content pre.show-raw .line-numbers-wrapper,
.rich-text-display pre.show-raw .line-numbers-wrapper {
  display: none !important;
}
.rich-text-content pre.show-raw code *,
.rich-text-display pre.show-raw code * {
    color: #e2e8f0 !important;
    font-style: normal !important;
    font-weight: normal !important;
    background: transparent !important
}

.rich-text-content code .token-keyword,
.rich-text-display code .token-keyword,
.rich-text-content .token-keyword,
.rich-text-display .token-keyword {
    color: #d4a5ff !important;
    font-weight: 600
}

.rich-text-content code .token-string,
.rich-text-display code .token-string,
.rich-text-content .token-string,
.rich-text-display .token-string {
    color: #b3f097 !important;
    font-weight: 500
}

.rich-text-content code .token-comment,
.rich-text-display code .token-comment,
.rich-text-content .token-comment,
.rich-text-display .token-comment {
    color: #8896a8 !important;
    font-style: italic
}

.rich-text-content code .token-number,
.rich-text-display code .token-number,
.rich-text-content .token-number,
.rich-text-display .token-number {
    color: #ffb366 !important;
    font-weight: 600
}

.rich-text-content code .token-function,
.rich-text-display code .token-function,
.rich-text-content .token-function,
.rich-text-display .token-function {
    color: #82aaff !important;
    font-weight: 600
}

.rich-text-content code .token-operator,
.rich-text-display code .token-operator,
.rich-text-content .token-operator,
.rich-text-display .token-operator {
    color: #89ddff !important
}

.rich-text-content code .token-tag,
.rich-text-display code .token-tag,
.rich-text-content .token-tag,
.rich-text-display .token-tag {
    color: #ff8a94 !important;
    font-weight: 500
}

.rich-text-content code .token-attr,
.rich-text-display code .token-attr,
.rich-text-content .token-attr,
.rich-text-display .token-attr {
    color: #d4a5ff !important
}

.rich-text-content code .token-property,
.rich-text-display code .token-property,
.rich-text-content .token-property,
.rich-text-display .token-property {
    color: #8dd8d0 !important;
    font-weight: 500
}

.rich-text-content code .token-value,
.rich-text-display code .token-value,
.rich-text-content .token-value,
.rich-text-display .token-value {
    color: #b3f097 !important
}

.rich-text-content code .token-selector,
.rich-text-display code .token-selector,
.rich-text-content .token-selector,
.rich-text-display .token-selector {
    color: #ffd478 !important;
    font-weight: 600
}

.rich-text-content code .token-boolean,
.rich-text-display code .token-boolean,
.rich-text-content .token-boolean,
.rich-text-display .token-boolean {
    color: #ff6b85 !important;
    font-weight: 600
}

.rich-text-content pre::-webkit-scrollbar,
.rich-text-display pre::-webkit-scrollbar,
.rich-text-content code::-webkit-scrollbar,
.rich-text-display code::-webkit-scrollbar {
    width: 8px;
    height: 8px
}

.rich-text-content pre::-webkit-scrollbar-track,
.rich-text-display pre::-webkit-scrollbar-track,
.rich-text-content code::-webkit-scrollbar-track,
.rich-text-display code::-webkit-scrollbar-track {
    background: #334155;
    border-radius: 4px
}

.rich-text-content pre::-webkit-scrollbar-thumb,
.rich-text-display pre::-webkit-scrollbar-thumb,
.rich-text-content code::-webkit-scrollbar-thumb,
.rich-text-display code::-webkit-scrollbar-thumb {
    background: #64748b;
    border-radius: 4px
}

.rich-text-content pre::-webkit-scrollbar-thumb:hover,
.rich-text-display pre::-webkit-scrollbar-thumb:hover,
.rich-text-content code::-webkit-scrollbar-thumb:hover,
.rich-text-display code::-webkit-scrollbar-thumb:hover {
    background: #94a3b8
}

.rich-text-content img,
.rich-text-display img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5em auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .1);
    transition: transform .2s ease, box-shadow .2s ease
}

.rich-text-content img:hover,
.rich-text-display img:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, .15)
}

@media (prefers-color-scheme:dark) {
    .rich-text-content img,
    .rich-text-display img {
        box-shadow: 0 4px 12px rgba(0, 0, 0, .3)
    }
    .rich-text-content img:hover,
    .rich-text-display img:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, .4)
    }
}

.rich-text-content hr,
.rich-text-display hr {
    margin: 2em 0;
    border: none;
    border-top: 2px solid #e5e7eb;
    opacity: .6
}

@media (prefers-color-scheme:dark) {
    .rich-text-content hr,
    .rich-text-display hr {
        border-top-color: #374151
    }
}

.rich-text-content table,
.rich-text-display table {
    width: 100%;
    margin: 1.5em 0;
    border-collapse: collapse;
    border-spacing: 0;
    overflow-x: auto;
    display: table;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .1);
    border-radius: 8px
}

.rich-text-content table thead,
.rich-text-display table thead {
    background: linear-gradient(to bottom, #f9fafb, #f3f4f6)
}

@media (prefers-color-scheme:dark) {
    .rich-text-content table thead,
    .rich-text-display table thead {
        background: linear-gradient(to bottom, #374151, #1f2937)
    }
}

.rich-text-content table th,
.rich-text-content table td,
.rich-text-display table th,
.rich-text-display table td {
    padding: 12px 16px;
    text-align: left;
    border: 1px solid #e5e7eb;
    vertical-align: top
}

@media (prefers-color-scheme:dark) {
    .rich-text-content table th,
    .rich-text-content table td,
    .rich-text-display table th,
    .rich-text-display table td {
        border-color: #4b5563
    }
}

.rich-text-content table th,
.rich-text-display table th {
    font-weight: 600;
    font-size: .95em;
    text-transform: uppercase;
    letter-spacing: .025em
}

.rich-text-content table tbody tr,
.rich-text-display table tbody tr {
    transition: background-color .2s
}

.rich-text-content table tbody tr:hover,
.rich-text-display table tbody tr:hover {
    background: #f9fafb
}

@media (prefers-color-scheme:dark) {
    .rich-text-content table tbody tr:hover,
    .rich-text-display table tbody tr:hover {
        background: #1f2937
    }
}

.rich-text-content table tbody tr:nth-child(even),
.rich-text-display table tbody tr:nth-child(even) {
    background: #fafafa
}

@media (prefers-color-scheme:dark) {
    .rich-text-content table tbody tr:nth-child(even),
    .rich-text-display table tbody tr:nth-child(even) {
        background: #111827
    }
}

.rich-text-content>div[style*="display: flex"],
.rich-text-content>div[style*="display:flex"],
.rich-text-display>div[style*="display: flex"],
.rich-text-display>div[style*="display:flex"] {
    display: flex !important;
    gap: 16px !important;
    margin: 1em 0 !important
}

.rich-text-content>div[style*="display: flex"]>div,
.rich-text-content>div[style*="display:flex"]>div,
.rich-text-display>div[style*="display: flex"]>div,
.rich-text-display>div[style*="display:flex"]>div {
    flex: 1 !important;
    min-width: 0 !important;
    border: 1px dashed #ddd !important;
    padding: 12px !important;
    border-radius: 4px !important
}

@media (prefers-color-scheme:dark) {
    .rich-text-content>div[style*="display: flex"]>div,
    .rich-text-content>div[style*="display:flex"]>div,
    .rich-text-display>div[style*="display: flex"]>div,
    .rich-text-display>div[style*="display:flex"]>div {
        border-color: #374151 !important
    }
}

@media (max-width:768px) {
    .rich-text-content>div[style*="display: flex"],
    .rich-text-content>div[style*="display:flex"],
    .rich-text-display>div[style*="display: flex"],
    .rich-text-display>div[style*="display:flex"] {
        flex-direction: column !important
    }
}

.rich-text-content sup,
.rich-text-display sup {
    font-size: .75em;
    vertical-align: super;
    line-height: 0
}

.rich-text-content sub,
.rich-text-display sub {
    font-size: .75em;
    vertical-align: sub;
    line-height: 0
}

.rich-text-content s,
.rich-text-content strike,
.rich-text-content del,
.rich-text-display s,
.rich-text-display strike,
.rich-text-display del {
    text-decoration: line-through;
    opacity: .7
}

.rich-text-content [style*="text-align: left"],
.rich-text-content [style*="text-align:left"],
.rich-text-display [style*="text-align: left"],
.rich-text-display [style*="text-align:left"] {
    text-align: left !important
}

.rich-text-content [style*="text-align: center"],
.rich-text-content [style*="text-align:center"],
.rich-text-display [style*="text-align: center"],
.rich-text-display [style*="text-align:center"] {
    text-align: center !important
}

.rich-text-content [style*="text-align: right"],
.rich-text-content [style*="text-align:right"],
.rich-text-display [style*="text-align: right"],
.rich-text-display [style*="text-align:right"] {
    text-align: right !important
}

.rich-text-content [style*="text-align: justify"],
.rich-text-content [style*="text-align:justify"],
.rich-text-display [style*="text-align: justify"],
.rich-text-display [style*="text-align:justify"] {
    text-align: justify !important
}

.rich-text-content blockquote>*:first-child,
.rich-text-display blockquote>*:first-child {
    margin-top: 0
}

.rich-text-content blockquote>*:last-child,
.rich-text-display blockquote>*:last-child {
    margin-bottom: 0
}

.rich-text-content li>*:first-child,
.rich-text-display li>*:first-child {
    margin-top: 0
}

.rich-text-content li>*:last-child,
.rich-text-display li>*:last-child {
    margin-bottom: 0
}

.rich-text-content br,
.rich-text-display br {
    display: block;
    content: "";
    margin: .25em 0
}

.rich-text-content p:empty::before,
.rich-text-display p:empty::before {
    content: "\\00a0";
    display: inline-block
}

.rich-text-content ::selection,
.rich-text-display ::selection {
    background: rgba(59, 130, 246, .3)
}

.rich-text-content a:focus,
.rich-text-display a:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 2px
}

@media print {
    .rich-text-content,
    .rich-text-display {
        color: #000;
        background: #fff
    }
    .rich-text-content a,
    .rich-text-display a {
        color: #000;
        text-decoration: underline
    }
    .rich-text-content a[href]:after,
    .rich-text-display a[href]:after {
        content: " (" attr(href) ")";
        font-size: .8em;
        font-weight: normal
    }
    .rich-text-content img,
    .rich-text-display img {
        max-width: 100%;
        page-break-inside: avoid
    }
    .rich-text-content pre,
    .rich-text-display pre {
        background: #f5f5f5 !important;
        color: #000 !important;
        border: 1px solid #ddd;
        page-break-inside: avoid
    }
    .rich-text-content pre code,
    .rich-text-display pre code {
        color: #000 !important
    }
    .rich-text-content pre *,
    .rich-text-display pre * {
        color: #000 !important;
        background: transparent !important
    }
    .rich-text-content blockquote,
    .rich-text-display blockquote {
        border-left-color: #000;
        background: #f5f5f5;
        page-break-inside: avoid
    }
    .rich-text-content .code-action-btn,
    .rich-text-display .code-action-btn,
    .rich-text-content .code-raw-btn,
    .rich-text-display .code-raw-btn,
    .rich-text-content .code-copy-btn,
    .rich-text-display .code-copy-btn {
        display: none !important
    }
    .rich-text-content .code-toolbar,
    .rich-text-display .code-toolbar {
        background: #e5e7eb !important;
        border-bottom: 1px solid #000
    }
    .rich-text-content .line-numbers-wrapper,
    .rich-text-display .line-numbers-wrapper {
        background: #f5f5f5 !important;
        border-right: 1px solid #000
    }
    .rich-text-content .line-numbers,
    .rich-text-display .line-numbers {
        color: #666 !important
    }
    .rich-text-content .code-container>code,
    .rich-text-display .code-container>code {
        overflow: visible;
        max-height: none
    }
}

@media (max-width:640px) {
    .rich-text-content,
    .rich-text-display {
        font-size: 15px
    }
    .rich-text-content h1,
    .rich-text-display h1 {
        font-size: 1.75em
    }
    .rich-text-content h2,
    .rich-text-display h2 {
        font-size: 1.4em
    }
    .rich-text-content h3,
    .rich-text-display h3 {
        font-size: 1.2em
    }
    .rich-text-content pre,
    .rich-text-display pre {
        font-size: 13px;
        margin: 1em -1em;
        border-radius: 0
    }
    .rich-text-content .line-numbers-wrapper,
    .rich-text-display .line-numbers-wrapper {
        width: 2.5em
    }
    .rich-text-content .line-numbers,
    .rich-text-display .line-numbers {
        padding: 1.25em .5em;
        font-size: 12px
    }
    .rich-text-content .code-container>code,
    .rich-text-display .code-container>code {
        padding: 1.25em 1em;
        font-size: 13px
    }
    .rich-text-content .code-toolbar,
    .rich-text-display .code-toolbar {
        padding: .625em .875em
    }
    .rich-text-content .code-language-label,
    .rich-text-display .code-language-label {
        font-size: .65em;
        padding: .25em .5em
    }
    .rich-text-content .code-action-btn,
    .rich-text-display .code-action-btn {
        padding: .375em .5em
    }
    .rich-text-content blockquote,
    .rich-text-display blockquote {
        padding: .5em 1em
    }
    .rich-text-content ul,
    .rich-text-content ol,
    .rich-text-display ul,
    .rich-text-display ol {
        padding-left: 1.5em
    }
    .rich-text-content img,
    .rich-text-display img {
        margin: 1em auto
    }
    .rich-text-content table,
    .rich-text-display table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch
    }
    .rich-text-content table th,
    .rich-text-content table td,
    .rich-text-display table th,
    .rich-text-display table td {
        padding: 8px 12px;
        font-size: .9em
    }
}

.rich-text-content,
.rich-text-display {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility
}

@media (prefers-contrast:high) {
    .rich-text-content a,
    .rich-text-display a {
        text-decoration: underline;
        font-weight: 600
    }
    .rich-text-content blockquote,
    .rich-text-display blockquote {
        border-left-width: 6px
    }
}

@media (prefers-reduced-motion:reduce) {
    .rich-text-content *,
    .rich-text-content *::before,
    .rich-text-content *::after,
    .rich-text-display *,
    .rich-text-display *::before,
    .rich-text-display *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important
    }
    .rich-text-content img:hover,
    .rich-text-display img:hover {
        transform: none
    }
}

.rich-text-content[contenteditable]:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
    font-style: italic
}

.rich-text-content[contenteditable] img {
    cursor: pointer
}`;
