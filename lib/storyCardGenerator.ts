export interface EventStoryData {
  title: string;
  date: string;
  location?: string;
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
 * Generates an ultra-premium, minimalist, professional 9:16 (1080x1920) Story Graphic.
 * Clean dark aesthetic matching the official HBX brand design.
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

  // 1. Minimalist Deep Obsidian Background
  ctx.fillStyle = "#070707";
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle ambient radial glow behind poster
  const glow = ctx.createRadialGradient(540, 800, 50, 540, 800, 650);
  glow.addColorStop(0, "rgba(0, 102, 255, 0.18)");
  glow.addColorStop(0.6, "rgba(0, 102, 255, 0.03)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Top Header Brand Pill: "HYDERABAD BEATBOX COMMUNITY"
  const topY = 180;
  ctx.save();
  ctx.font = "600 24px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("HYDERABAD BEATBOX COMMUNITY", 540, topY);

  // Subtle line divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(380, topY + 28);
  ctx.lineTo(700, topY + 28);
  ctx.stroke();
  ctx.restore();

  // 3. Central Poster Artwork Frame
  const posterX = 140;
  const posterY = 270;
  const posterW = 800;
  const posterH = 880;

  // Outer subtle glow & shadow
  ctx.save();
  drawRoundedRect(posterX, posterY, posterW, posterH, 28);
  ctx.shadowColor = "rgba(0, 102, 255, 0.25)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = "#111111";
  ctx.fill();
  ctx.restore();

  // Draw Poster Image
  ctx.save();
  drawRoundedRect(posterX, posterY, posterW, posterH, 28);
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

    // Subtle dark gradient at bottom of poster
    const posterGrad = ctx.createLinearGradient(0, posterY + posterH - 180, 0, posterY + posterH);
    posterGrad.addColorStop(0, "rgba(0,0,0,0)");
    posterGrad.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = posterGrad;
    ctx.fillRect(posterX, posterY, posterW, posterH);
  } else {
    const placeholderGrad = ctx.createLinearGradient(posterX, posterY, posterX, posterY + posterH);
    placeholderGrad.addColorStop(0, "#161616");
    placeholderGrad.addColorStop(1, "#0A0A0A");
    ctx.fillStyle = placeholderGrad;
    ctx.fillRect(posterX, posterY, posterW, posterH);

    ctx.font = "bold 72px 'Lexend', sans-serif";
    ctx.fillStyle = "#0066FF";
    ctx.textAlign = "center";
    ctx.fillText("HYD BEATBOX", 540, posterY + posterH / 2);
  }
  ctx.restore();

  // Minimal glass border for poster
  ctx.save();
  drawRoundedRect(posterX, posterY, posterW, posterH, 28);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 4. Clean Minimalist Event Title
  ctx.save();
  const maxTitleWidth = 840;
  let titleFontSize = 48;
  if (event.title.length > 40) titleFontSize = 38;
  else if (event.title.length > 25) titleFontSize = 44;

  ctx.font = `800 ${titleFontSize}px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const words = event.title.split(" ");
  let line = "";
  let currentY = 1210;
  let linesRendered = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTitleWidth && n > 0) {
      ctx.fillText(line.trim(), 540, currentY);
      line = words[n] + " ";
      currentY += titleFontSize + 14;
      linesRendered++;
      if (linesRendered >= 2 && n < words.length - 1) {
        line = line + "...";
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 540, currentY);
  ctx.restore();

  // 5. Minimalist Date & Venue Metadata Line
  const metaY = currentY + titleFontSize + 26;
  ctx.save();
  ctx.font = "500 26px 'Lexend', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#0066FF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const metaText = event.location
    ? `${event.date.toUpperCase()}  •  ${event.location.toUpperCase()}`
    : event.date.toUpperCase();
  ctx.fillText(metaText, 540, metaY);
  ctx.restore();

  // 6. Minimal Footer Brand Tag
  ctx.save();
  ctx.font = "400 20px 'Lexend', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "2px";
  ctx.fillText("hydbbx.com", 540, 1720);
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
