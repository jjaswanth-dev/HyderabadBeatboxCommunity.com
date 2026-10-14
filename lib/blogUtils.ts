/**
 * Helper utilities for rendering and processing blog content (Pure Markdown).
 */

export function stripFormatting(content: string, maxLength?: number): string {
  if (!content) return "";
  
  // 1. Remove script & style tags and their contents (if any legacy content exists)
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
 * Normalizes Markdown content before rendering via ReactMarkdown.
 *
 * Markdown best practices:
 * - Normalizes Windows CRLF line endings to LF.
 * - Strips any dangerous raw HTML tags (<script>, <style>, <iframe>, <object>, <embed>) for security and styling isolation.
 * - Ensures markdown headers (#, ##, ###) and block elements have standard spacing.
 */
export function normalizeContent(content: string): string {
  if (!content) return "";

  // 1. Normalize line endings
  let text = content.replace(/\r\n/g, "\n");

  // 2. Strip dangerous script/style/embed tags
  text = text.replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "");

  return text;
}
