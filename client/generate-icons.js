const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 192, 512];
const dir = path.join(__dirname, 'public/icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#C0392B');
  grad.addColorStop(1, '#8e1a0e');
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Emoji
  ctx.font = `${size * 0.55}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👗', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(dir, `icon-${size}.png`), buffer);
  console.log(`✅ icon-${size}.png created`);
});
