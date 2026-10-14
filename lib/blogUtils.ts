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
 * Normalizes Markdown and HTML content before rendering via ReactMarkdown + rehypeRaw.
 *
 * Markdown (CommonMark) treats lines indented by 4 spaces or tabs following an empty line
 * as an indented code block (<pre><code>). In AI-generated HTML or formatted HTML files,
 * nested elements are indented by 2, 4, or more spaces.
 *
 * This function preserves intentional fenced code blocks (```...```) while stripping
 * leading indentation from lines starting with HTML tags or closing tags, ensuring they
 * are parsed as live HTML elements instead of raw text inside a code block.
 */
export function normalizeContent(content: string): string {
  if (!content) return "";

  // Split by fenced code blocks (```...```) to keep real code snippets intact
  const parts = content.split(/(```[\s\S]*?```)/g);

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
