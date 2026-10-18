const sharp = require('sharp');
const path = require('path');

const iconSrc = path.join(process.cwd(), 'public', 'icon.png');

function createSquircleSvg(size, rx, bgColor, strokeColor) {
  return Buffer.from(
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="2" y="2" width="' + (size - 4) + '" height="' + (size - 4) + '" rx="' + rx + '" ry="' + rx + '" fill="' + bgColor + '" stroke="' + strokeColor + '" stroke-width="4"/>' +
    '</svg>'
  );
}

async function run() {
  // 1. Dark squircle (512x512)
  const bgDark512 = createSquircleSvg(512, 115, '#000000', '#262626');
  const innerLogo512 = await sharp(iconSrc)
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp(bgDark512)
    .composite([{ input: innerLogo512, gravity: 'center' }])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512-dark.png'));

  // 2. Light squircle (512x512)
  const bgLight512 = createSquircleSvg(512, 115, '#ffffff', '#e5e7eb');
  await sharp(bgLight512)
    .composite([{ input: innerLogo512, gravity: 'center' }])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512-light.png'));

  // Default icon-512.png is dark squircle
  await sharp(path.join(process.cwd(), 'public', 'icon-512-dark.png'))
    .toFile(path.join(process.cwd(), 'public', 'icon-512.png'));

  // 3. 192x192 squircle
  const bgDark192 = createSquircleSvg(192, 42, '#000000', '#262626');
  const innerLogo192 = await sharp(iconSrc)
    .resize(136, 136, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp(bgDark192)
    .composite([{ input: innerLogo192, gravity: 'center' }])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-192.png'));

  // 4. Android maskable icon (full-bleed dark background with safe-zone centered icon)
  const androidSafeLogo = await sharp(iconSrc)
    .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: androidSafeLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512-maskable.png'));

  // 5. Apple Touch Icon for iPhone / iPad (180x180)
  const appleTouchBg = createSquircleSvg(180, 40, '#000000', '#262626');
  const appleLogo = await sharp(iconSrc)
    .resize(130, 130, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp(appleTouchBg)
    .composite([{ input: appleLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon.png'));

  // 6. Light Apple Touch Icon
  const appleTouchLightBg = createSquircleSvg(180, 40, '#ffffff', '#e5e7eb');
  await sharp(appleTouchLightBg)
    .composite([{ input: appleLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon-light.png'));

  console.log('Successfully generated all curved PWA icons!');
}

run().catch(console.error);
