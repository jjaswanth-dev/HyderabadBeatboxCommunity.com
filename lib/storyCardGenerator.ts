export interface EventStoryData {
  title: string;
  date: string;
  location?: string;
  description?: string;
  image?: string;
  shareUrl: string;
}

/**
 * Helper to fetch and load an image safely with crossOrigin and timeout
 */
function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let done = false;
    img.onload = () => {
      if (!done) {
        done = true;
        resolve(img);
      }
    };
    img.onerror = () => {
      if (!done) {
        done = true;
        resolve(null);
      }
    };
    img.src = src;
    setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, 4000);
  });
}

/**
 * Helper to wrap text into lines respecting max pixel width
 */
function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates an ultra-premium, responsive 9:16 (1080x1920) Story Graphic.
 * Spotify-style top link pill, clean 1:1 artwork, wrapped title, date, venue, description, and ticket action.
 */
export async function generateStoryCardBlob(event: EventStoryData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new Blob([], { type: "image/png" });
  }

  const posterImg = event.image ? await loadImageSafe(event.image) : null;

  // Helper: rounded rectangle
  const drawRoundedRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 1. Sleek Midnight Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, "#05070f");
  bgGrad.addColorStop(0.35, "#0a0f1d");
  bgGrad.addColorStop(0.7, "#060914");
  bgGrad.addColorStop(1, "#020308");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle Ambient Glows
  const glow1 = ctx.createRadialGradient(540, 650, 40, 540, 650, 600);
  glow1.addColorStop(0, "rgba(0, 102, 255, 0.22)");
  glow1.addColorStop(0.6, "rgba(0, 102, 255, 0.04)");
  glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. SPOTIFY-STYLE TOP LINK PILL (Y = 120)
  const pillW = 760;
  const pillH = 72;
  const pillX = (1080 - pillW) / 2;
  const pillY = 130;

  ctx.save();
  drawRoundedRect(pillX, pillY, pillW, pillH, 36);
  ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Link Icon / Dot
  ctx.beginPath();
  ctx.arc(pillX + 42, pillY + 36, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#0066FF";
  ctx.shadowColor = "#0066FF";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Domain text
  ctx.font = "bold 24px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#E0F2FE";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🔗 www.hyderabadbeatboxcommunity.in", 540, pillY + 36);
  ctx.restore();

  // 3. Central Poster Artwork (1:1 Spotify Album Art Style)
  const maxContentW = 800;
  const posterW = 760;
  const posterH = 760;
  const posterX = (1080 - posterW) / 2;
  const posterY = 240;

  // Drop shadow
  ctx.save();
  drawRoundedRect(posterX, posterY, posterW, posterH, 32);
  ctx.shadowColor = "rgba(0, 102, 255, 0.35)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = "#111111";
  ctx.fill();
  ctx.restore();

  // Poster image clip
  ctx.save();
  drawRoundedRect(posterX, posterY, posterW, posterH, 32);
  ctx.clip();

  if (posterImg) {
    const imgAspect = posterImg.width / posterImg.height;
    const targetAspect = posterW / posterH;
    let sx = 0,
      sy = 0,
      sw = posterImg.width,
      sh = posterImg.height;

    if (imgAspect > targetAspect) {
      sw = posterImg.height * targetAspect;
      sx = (posterImg.width - sw) / 2;
    } else {
      sh = posterImg.width / targetAspect;
      sy = (posterImg.height - sh) / 2;
    }

    ctx.drawImage(posterImg, sx, sy, sw, sh, posterX, posterY, posterW, posterH);

    // Bottom soft shade
    const posterGrad = ctx.createLinearGradient(0, posterY + posterH - 180, 0, posterY + posterH);
    posterGrad.addColorStop(0, "rgba(0,0,0,0)");
    posterGrad.addColorStop(1, "rgba(0,0,0,0.65)");
    ctx.fillStyle = posterGrad;
    ctx.fillRect(posterX, posterY, posterW, posterH);
  } else {
    const placeholderGrad = ctx.createLinearGradient(posterX, posterY, posterX, posterY + posterH);
    placeholderGrad.addColorStop(0, "#161c2e");
    placeholderGrad.addColorStop(1, "#0a0e1a");
    ctx.fillStyle = placeholderGrad;
    ctx.fillRect(posterX, posterY, posterW, posterH);

    ctx.font = "bold 64px 'Lexend', sans-serif";
    ctx.fillStyle = "#0066FF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HYD BEATBOX", 540, posterY + posterH / 2);
  }
  ctx.restore();

  // Border stroke
  ctx.save();
  drawRoundedRect(posterX, posterY, posterW, posterH, 32);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 4. DYNAMIC EVENT TITLE (Auto-scaled and multi-line wrapped)
  let currentY = 1045;
  ctx.save();
  let titleFontSize = 42;
  if (event.title.length > 50) titleFontSize = 34;
  else if (event.title.length > 35) titleFontSize = 38;

  ctx.font = `800 ${titleFontSize}px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const titleLines = getWrappedLines(ctx, event.title, maxContentW);
  const maxTitleLines = Math.min(titleLines.length, 2);

  for (let i = 0; i < maxTitleLines; i++) {
    let lineText = titleLines[i];
    if (i === maxTitleLines - 1 && titleLines.length > maxTitleLines) {
      lineText += "...";
    }
    ctx.fillText(lineText, 540, currentY);
    currentY += titleFontSize + 12;
  }
  ctx.restore();

  currentY += 8;

  // 5. DATE & VENUE BADGE (Wrapped and formatted cleanly)
  ctx.save();
  ctx.font = "bold 24px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#60A5FA";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Date Line
  const dateLine = `📅  ${event.date}`;
  const wrappedDateLines = getWrappedLines(ctx, dateLine, maxContentW);
  for (const line of wrappedDateLines.slice(0, 1)) {
    ctx.fillText(line, 540, currentY);
    currentY += 34;
  }

  // Location Line (if available)
  if (event.location) {
    ctx.font = "600 22px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    const locLine = `📍  ${event.location}`;
    const wrappedLocLines = getWrappedLines(ctx, locLine, maxContentW);
    for (const line of wrappedLocLines.slice(0, 2)) {
      ctx.fillText(line, 540, currentY);
      currentY += 30;
    }
  }
  ctx.restore();

  currentY += 10;

  // 6. EVENT DESCRIPTION SNIPPET (Wrapped gracefully)
  if (event.description) {
    ctx.save();
    ctx.font = "400 20px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const descLines = getWrappedLines(ctx, event.description, maxContentW - 40);
    const maxDescLines = Math.min(descLines.length, 3);

    for (let i = 0; i < maxDescLines; i++) {
      let lineText = descLines[i];
      if (i === maxDescLines - 1 && descLines.length > maxDescLines) {
        lineText += "...";
      }
      ctx.fillText(lineText, 540, currentY);
      currentY += 28;
    }
    ctx.restore();
  }

  // 7. BOTTOM ACTION BANNER (Spotify / Ticket Style Pill)
  const botY = 1680;
  const botW = 760;
  const botH = 86;
  const botX = (1080 - botW) / 2;

  ctx.save();
  drawRoundedRect(botX, botY, botW, botH, 43);
  
  const botGrad = ctx.createLinearGradient(botX, botY, botX + botW, botY + botH);
  botGrad.addColorStop(0, "#0066FF");
  botGrad.addColorStop(1, "#0052CC");
  ctx.fillStyle = botGrad;
  ctx.shadowColor = "rgba(0, 102, 255, 0.4)";
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = "bold 24px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎟️ GET TICKETS & PASSES ON HYDBBX", 540, botY + 43);
  ctx.restore();

  // 8. Minimalist Watermark
  ctx.save();
  ctx.font = "500 18px 'Lexend', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "2px";
  ctx.fillText("www.hyderabadbeatboxcommunity.in", 540, 1820);
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob || new Blob([], { type: "image/png" }));
      },
      "image/png",
      0.95
    );
  });
}
