const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'images');
const OUTPUT_DIR = path.join(INPUT_DIR, 'optimized');

const WIDTHS = [480, 960, 1600];
const QUALITY = {
  avif: 80,
  webp: 80,
  jpeg: 85
};

async function optimizeImages() {
  console.log('⚡ Starting image optimization pipeline...');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR);

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    const basename = path.basename(file, ext);

    // Handle SVG files by copying to optimized directory
    if (ext === '.svg') {
      const destPath = path.join(OUTPUT_DIR, file);
      fs.copyFileSync(filePath, destPath);
      console.log(`[SVG Copied] ${file}`);
      continue;
    }

    // Process raster image files
    if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
      console.log(`\n🖼️  Processing master source image: ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
      
      try {
        const image = sharp(filePath);
        const metadata = await image.metadata();
        const originalWidth = metadata.width || 1600;

        for (const targetWidth of WIDTHS) {
          // Do not upscale if original width is smaller than target width
          const width = Math.min(targetWidth, originalWidth);
          const resizedImage = image.clone().resize({ width, withoutEnlargement: true });

          // 1. AVIF
          const avifPath = path.join(OUTPUT_DIR, `${basename}-${targetWidth}.avif`);
          await resizedImage
            .clone()
            .toFormat('avif', { quality: QUALITY.avif })
            .toFile(avifPath);
          const avifSize = fs.statSync(avifPath).size;

          // 2. WebP
          const webpPath = path.join(OUTPUT_DIR, `${basename}-${targetWidth}.webp`);
          await resizedImage
            .clone()
            .toFormat('webp', { quality: QUALITY.webp })
            .toFile(webpPath);
          const webpSize = fs.statSync(webpPath).size;

          // 3. JPEG
          const jpgPath = path.join(OUTPUT_DIR, `${basename}-${targetWidth}.jpg`);
          await resizedImage
            .clone()
            .toFormat('jpeg', { quality: QUALITY.jpeg, mozjpeg: true })
            .toFile(jpgPath);
          const jpgSize = fs.statSync(jpgPath).size;

          console.log(`   └─ ${targetWidth}w -> AVIF: ${(avifSize/1024).toFixed(1)}KB | WebP: ${(webpSize/1024).toFixed(1)}KB | JPEG: ${(jpgSize/1024).toFixed(1)}KB`);
        }
      } catch (err) {
        console.error(`❌ Error processing ${file}:`, err);
      }
    }
  }

  console.log('\n✅ Image optimization pipeline finished successfully!');
}

optimizeImages().catch(err => {
  console.error('Fatal error in image optimization:', err);
  process.exit(1);
});
