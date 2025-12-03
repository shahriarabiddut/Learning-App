/**
 * Clean HTML content before saving to database
 * Removes toolbars, line numbers, and enhanced structure
 * Keeps only the clean code blocks that can be re-enhanced on load
 */
export const cleanHtmlForSave = (html: string): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Find all enhanced code blocks
  const preBlocks = tempDiv.querySelectorAll(
    "pre.code-highlighted, pre.code-enhanced"
  );

  preBlocks.forEach((pre) => {
    // Remove classes that were added by enhancement
    pre.classList.remove("code-highlighted", "code-enhanced", "show-raw");

    // Get the original code content
    const codeElement = pre.querySelector("code");
    if (!codeElement) return;

    // Get the actual code text (from data-raw-code or textContent)
    const rawCode =
      pre.getAttribute("data-raw-code") || codeElement.textContent || "";
    const language = pre.getAttribute("data-language") || "plaintext";

    // Remove toolbar
    const toolbar = pre.querySelector(".code-toolbar");
    if (toolbar) {
      toolbar.remove();
    }

    // Remove line numbers wrapper
    const lineNumbersWrapper = pre.querySelector(".line-numbers-wrapper");
    if (lineNumbersWrapper) {
      lineNumbersWrapper.remove();
    }

    // Remove code container
    const codeContainer = pre.querySelector(".code-container");
    if (codeContainer) {
      codeContainer.remove();
    }

    // Clear all attributes except data-language
    const attributes = Array.from(pre.attributes);
    attributes.forEach((attr) => {
      if (attr.name !== "data-language") {
        pre.removeAttribute(attr.name);
      }
    });

    // Create clean code element
    const cleanCode = document.createElement("code");
    cleanCode.setAttribute("data-language", language);
    cleanCode.textContent = rawCode;

    // Clear pre and add clean code
    pre.innerHTML = "";
    pre.appendChild(cleanCode);
  });

  return tempDiv.innerHTML;
};

/**
 * Clean HTML content for saving (server-side compatible)
 * Use this version in Node.js environment where document is not available
 */
export const cleanHtmlForSaveServer = (html: string): string => {
  // Use regex to clean the HTML (more robust for server-side)
  let cleaned = html;

  // Remove toolbars
  cleaned = cleaned.replace(/<div class="code-toolbar"[^>]*>.*?<\/div>/gs, "");

  // Remove line numbers wrappers
  cleaned = cleaned.replace(
    /<div class="line-numbers-wrapper"[^>]*>.*?<\/div>/gs,
    ""
  );

  // Remove code containers but keep the code inside
  cleaned = cleaned.replace(
    /<div class="code-container"[^>]*>(.*?)<\/div>/gs,
    "$1"
  );

  // Clean pre tags - remove enhanced classes and attributes, keep data-language
  cleaned = cleaned.replace(
    /<pre([^>]*?)class="([^"]*?)(code-highlighted|code-enhanced|show-raw)([^"]*?)"([^>]*?)>/g,
    (match, before, classStart, enhanced, classEnd, after) => {
      // Keep data-language if present
      const languageMatch = match.match(/data-language="([^"]+)"/);
      const language = languageMatch
        ? ` data-language="${languageMatch[1]}"`
        : "";

      // Remove all other classes and attributes
      return `<pre${language}>`;
    }
  );

  // Also handle pre tags without classes
  cleaned = cleaned.replace(
    /<pre\s+([^>]*?)data-raw-code="[^"]*"([^>]*?)>/g,
    (match, before, after) => {
      const languageMatch = match.match(/data-language="([^"]+)"/);
      const language = languageMatch
        ? ` data-language="${languageMatch[1]}"`
        : "";
      return `<pre${language}>`;
    }
  );

  // Remove any remaining enhanced attributes from pre tags
  cleaned = cleaned.replace(
    /<pre([^>]*?)(?:contenteditable|data-raw-code|style)="[^"]*"([^>]*?)>/g,
    (match) => {
      const languageMatch = match.match(/data-language="([^"]+)"/);
      const language = languageMatch
        ? ` data-language="${languageMatch[1]}"`
        : "";
      return `<pre${language}>`;
    }
  );

  return cleaned;
};
