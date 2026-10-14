/**
 * Helper utilities for rendering and processing blog content (Markdown & HTML).
 */

export function stripFormatting(content: string, maxLength?: number): string {
  if (!content) return "";
  
  // 1. Remove script & style tags and their contents
  let text = content.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  
  // 2. Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  
  // 3. Remove Markdown image and link tags: ![alt](url) -> "" and [text](url) -> text
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");
  
  // 4. Remove Markdown syntax symbols (#, *, `, >, _, -, ~, |, etc.)
  text = text.replace(/[#*`>_\-~|]+/g, " ");
  
  // 5. Decode basic HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 6. Collapse consecutive whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength).trim() + "...";
  }

  return text;
}

/**
 * Scopes CSS rules inside a <style> block so they only apply within an enclosing container class
 * (e.g. .blog-render-container). This prevents styles uploaded in HTML files (like :root, html, body,
 * *, h1, etc.) from breaking the global website layout, navbar, inputs, and preview screens.
 */
export function scopeCss(css: string, containerClass: string = ".blog-render-container"): string {
  if (!css) return "";

  // Helper to prefix a selector list (e.g. "h1, p, .custom-box")
  const prefixSelectors = (selectors: string): string => {
    return selectors
      .split(",")
      .map((sel) => {
        let trimmed = sel.trim();
        if (!trimmed) return "";

        // Global/document root elements mapped to the container
        if (
          trimmed === ":root" ||
          trimmed === "html" ||
          trimmed === "body"
        ) {
          return containerClass;
        }

        if (trimmed.startsWith(":root") || trimmed.startsWith("html") || trimmed.startsWith("body")) {
          trimmed = trimmed.replace(/^(:root|html|body)\s*/, "");
          if (!trimmed) return containerClass;
        }

        // Universal selector "*" -> target all elements inside container
        if (trimmed === "*") {
          return `${containerClass} *`;
        }

        // Standard selector -> nest within container
        return `${containerClass} ${trimmed}`;
      })
      .filter(Boolean)
      .join(", ");
  };

  // 1. Strip CSS comments (/* ... */) so they don't break selector matching
  let cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Process CSS block by block (handles @media, @keyframes, and normal rules)
  let result = "";
  let i = 0;

  while (i < cleanCss.length) {
    const nextOpen = cleanCss.indexOf("{", i);
    if (nextOpen === -1) {
      result += cleanCss.slice(i);
      break;
    }

    const selectorPart = cleanCss.slice(i, nextOpen).trim();

    // Check for @keyframes or other @-rules that contain sub-blocks
    if (selectorPart.startsWith("@keyframes") || selectorPart.startsWith("@-webkit-keyframes") || selectorPart.startsWith("@font-face")) {
      // Find matching outer closing brace
      let depth = 1;
      let j = nextOpen + 1;
      while (j < cleanCss.length && depth > 0) {
        if (cleanCss[j] === "{") depth++;
        else if (cleanCss[j] === "}") depth--;
        j++;
      }
      result += cleanCss.slice(i, j);
      i = j;
      continue;
    }

    if (selectorPart.startsWith("@media") || selectorPart.startsWith("@supports")) {
      // Find matching closing brace of @media
      let depth = 1;
      let j = nextOpen + 1;
      while (j < cleanCss.length && depth > 0) {
        if (cleanCss[j] === "{") depth++;
        else if (cleanCss[j] === "}") depth--;
        j++;
      }
      const mediaHeader = selectorPart;
      const innerCss = cleanCss.slice(nextOpen + 1, j - 1);
      result += `${mediaHeader} {\n${scopeCss(innerCss, containerClass)}\n}\n`;
      i = j;
      continue;
    }

    // Normal CSS rule
    const nextClose = cleanCss.indexOf("}", nextOpen);
    if (nextClose === -1) {
      result += cleanCss.slice(i);
      break;
    }

    const declarations = cleanCss.slice(nextOpen + 1, nextClose);
    const scopedSelector = prefixSelectors(selectorPart);
    if (scopedSelector) {
      result += `${scopedSelector} {${declarations}}\n`;
    }

    i = nextClose + 1;
  }

  return result;
}

/**
 * Normalizes Markdown and HTML content before rendering via ReactMarkdown + rehypeRaw.
 *
 * 1. Markdown (CommonMark) treats lines indented by 4 spaces or tabs following an empty line
 *    as an indented code block (<pre><code>). In AI-generated HTML or formatted HTML files,
 *    nested elements are indented by 2, 4, or more spaces. This strips unwanted leading indentation
 *    outside code blocks so elements are rendered as live HTML.
 *
 * 2. Scopes any <style> tags within the content so their CSS rules (e.g. :root, *, html, body, font sizes)
 *    do NOT leak into the global document and corrupt the site styling when in Live Preview or Reading mode.
 */
export function normalizeContent(content: string, containerClass: string = ".blog-render-container"): string {
  if (!content) return "";

  // 1. First, scope any <style>...</style> blocks that are NOT inside markdown code fences
  let processed = content.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (_match, openTag, cssContent, closeTag) => {
    const scoped = scopeCss(cssContent, containerClass);
    return `${openTag}\n${scoped}\n${closeTag}`;
  });

  // 2. Split by fenced code blocks (```...```) to keep real code snippets intact
  const parts = processed.split(/(```[\s\S]*?```)/g);

  return parts
    .map((part, index) => {
      // Inside a fenced code block: keep as-is
      if (index % 2 === 1) return part;

      // Outside fenced code blocks:
      // Strip leading whitespace from any line starting with an HTML tag (<div, </div, <p, <!--, etc.)
      return part
        .replace(/^[ \t]+(?=<)/gm, "")
        .replace(/(<\/[a-zA-Z0-9_-]+>|\/>)\s*\n[ \t]{4,}(?=[A-Za-z0-9])/g, "$1\n");
    })
    .join("");
}

