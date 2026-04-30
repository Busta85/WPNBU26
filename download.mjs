import fs from 'fs';

async function downloadImage() {
  try {
    fs.mkdirSync('public/gallery', { recursive: true });
    console.log('Fetching image...');
    const response = await fetch('https://shrtlink.ai/3c4E');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync('public/gallery/fan-upload.jpg', buffer);
    console.log('Image successfully saved to public/gallery/fan-upload.jpg');
  } catch (err) {
    console.error('Error downloading image:', err);
  }
}

downloadImage();