export interface EventStoryData {
  title: string;
  date: string;
  location?: string;
  image?: string;
  shareUrl: string;
}

/**
 * Generates a high-resolution 9:16 (1080x1920) Instagram Story Graphic for the event.
 */
export async function generateStoryCardBlob(event: EventStoryData): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(new Blob([], { type: "image/png" }));
      return;
    }

    // Helper: roundRect polyfill / fallback
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

    // 1. Background Base Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, "#040711");
    bgGrad.addColorStop(0.4, "#081026");
    bgGrad.addColorStop(0.7, "#050914");
    bgGrad.addColorStop(1, "#020308");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Ambient Glowing Orbs
    const glow1 = ctx.createRadialGradient(240, 360, 20, 240, 360, 480);
    glow1.addColorStop(0, "rgba(0, 102, 255, 0.45)");
    glow1.addColorStop(0.5, "rgba(0, 102, 255, 0.15)");
    glow1.addColorStop(1, "rgba(0, 102, 255, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow2 = ctx.createRadialGradient(840, 1420, 20, 840, 1420, 520);
    glow2.addColorStop(0, "rgba(236, 72, 153, 0.35)");
    glow2.addColorStop(0.5, "rgba(168, 85, 247, 0.12)");
    glow2.addColorStop(1, "rgba(236, 72, 153, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1920);

    // 3. Central Card Frame (Spotify / Glassmorphism Style)
    const cardX = 60;
    const cardY = 140;
    const cardW = 960;
    const cardH = 1640;

    ctx.save();
    drawRoundedRect(cardX, cardY, cardW, cardH, 44);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.stroke();
    ctx.restore();

    // 4. Header Badge: HYDERABAD BEATBOX COMMUNITY
    const badgeX = 140;
    const badgeY = 210;
    const badgeW = 800;
    const badgeH = 70;

    ctx.save();
    drawRoundedRect(badgeX, badgeY, badgeW, badgeH, 35);
    ctx.fillStyle = "rgba(0, 102, 255, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 102, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Red Live dot
    ctx.beginPath();
    ctx.arc(badgeX + 40, badgeY + 35, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#FF3366";
    ctx.fill();

    // Header Text
    ctx.font = "bold 26px Lexend, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#E0F2FE";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HYDERABAD BEATBOX COMMUNITY", 540, badgeY + 35);
    ctx.restore();

    // 5. Draw Poster Image or Fallback
    const renderCardDetails = (imgLoaded?: HTMLImageElement) => {
      const posterX = 120;
      const posterY = 320;
      const posterW = 840;
      const posterH = 800;

      ctx.save();
      drawRoundedRect(posterX, posterY, posterW, posterH, 32);
      ctx.clip();

      if (imgLoaded) {
        // Draw Image fit cover
        const imgAspect = imgLoaded.width / imgLoaded.height;
        const targetAspect = posterW / posterH;
        let sx = 0,
          sy = 0,
          sw = imgLoaded.width,
          sh = imgLoaded.height;

        if (imgAspect > targetAspect) {
          sw = imgLoaded.height * targetAspect;
          sx = (imgLoaded.width - sw) / 2;
        } else {
          sh = imgLoaded.width / targetAspect;
          sy = (imgLoaded.height - sh) / 2;
        }

        ctx.drawImage(imgLoaded, sx, sy, sw, sh, posterX, posterY, posterW, posterH);

        // Soft vignette overlay at bottom of poster
        const posterGrad = ctx.createLinearGradient(0, posterY + posterH - 250, 0, posterY + posterH);
        posterGrad.addColorStop(0, "rgba(0,0,0,0)");
        posterGrad.addColorStop(1, "rgba(0,0,0,0.7)");
        ctx.fillStyle = posterGrad;
        ctx.fillRect(posterX, posterY, posterW, posterH);
      } else {
        // Stylized placeholder
        const placeholderGrad = ctx.createLinearGradient(posterX, posterY, posterX + posterW, posterY + posterH);
        placeholderGrad.addColorStop(0, "#1E293B");
        placeholderGrad.addColorStop(1, "#0F172A");
        ctx.fillStyle = placeholderGrad;
        ctx.fillRect(posterX, posterY, posterW, posterH);

        ctx.font = "bold 80px sans-serif";
        ctx.fillStyle = "#0066FF";
        ctx.textAlign = "center";
        ctx.fillText("🎤 🔥", 540, posterY + posterH / 2);
      }
      ctx.restore();

      // Poster Border & Drop shadow stroke
      ctx.save();
      drawRoundedRect(posterX, posterY, posterW, posterH, 32);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 6. Event Title (Multi-line text handling)
      ctx.save();
      ctx.font = "900 52px Lexend, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const titleWords = event.title.split(" ");
      const maxLineWidth = 840;
      let line = "";
      let currentY = 1170;
      let lineCount = 0;

      for (let n = 0; n < titleWords.length; n++) {
        const testLine = line + titleWords[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && n > 0) {
          ctx.fillText(line.trim(), 120, currentY);
          line = titleWords[n] + " ";
          currentY += 66;
          lineCount++;
          if (lineCount >= 2 && n < titleWords.length - 1) {
            line = line + "...";
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 120, currentY);
      ctx.restore();

      // 7. Event Date & Venue Pills
      const infoStartY = currentY + 84;

      // Date Pill
      ctx.save();
      const dateText = `📅  ${event.date}`;
      ctx.font = "bold 32px Lexend, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const dateWidth = ctx.measureText(dateText).width + 50;

      drawRoundedRect(120, infoStartY, Math.min(dateWidth, 840), 62, 20);
      ctx.fillStyle = "rgba(0, 102, 255, 0.2)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 102, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#60A5FA";
      ctx.textBaseline = "middle";
      ctx.fillText(dateText, 145, infoStartY + 31);
      ctx.restore();

      // Location Pill (if present)
      if (event.location) {
        ctx.save();
        const locY = infoStartY + 76;
        const locText = `📍  ${event.location}`;
        ctx.font = "600 28px Lexend, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const locWidth = ctx.measureText(locText).width + 50;

        drawRoundedRect(120, locY, Math.min(locWidth, 840), 56, 18);
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#E2E8F0";
        ctx.textBaseline = "middle";
        ctx.fillText(locText, 145, locY + 28);
        ctx.restore();
      }

      // 8. Instagram Link Sticker Callout (Bottom Bar)
      const stickerY = 1530;
      ctx.save();
      drawRoundedRect(120, stickerY, 840, 100, 30);
      
      const stickerGrad = ctx.createLinearGradient(120, stickerY, 960, stickerY + 100);
      stickerGrad.addColorStop(0, "rgba(236, 72, 153, 0.25)");
      stickerGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.25)");
      stickerGrad.addColorStop(1, "rgba(0, 102, 255, 0.25)");
      ctx.fillStyle = stickerGrad;
      ctx.fill();
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 30px Lexend, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔗 TAP LINK STICKER OR VISIT HYDBBX.COM", 540, stickerY + 50);
      ctx.restore();

      // 9. Watermark footer
      ctx.save();
      ctx.font = "500 24px Lexend, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.textAlign = "center";
      ctx.fillText("Official Hyderabad Beatbox Community • @hyderabadbeatbox", 540, 1720);
      ctx.restore();

      // Convert to Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(new Blob([], { type: "image/png" }));
          }
        },
        "image/png",
        0.95
      );
    };

    // Load poster image with crossOrigin to prevent canvas taint
    if (event.image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => renderCardDetails(img);
      img.onerror = () => renderCardDetails(undefined);
      img.src = event.image;
    } else {
      renderCardDetails(undefined);
    }
  });
}
