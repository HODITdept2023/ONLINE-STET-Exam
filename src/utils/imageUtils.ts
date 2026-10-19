/**
 * Utility functions for client-side passport photo processing, crop, and compression
 */

/**
 * Resizes and center-crops an uploaded image file into standard 35x45 mm passport photo aspect ratio (~350x450px)
 * and returns a lightweight compressed JPEG Data URL.
 */
export function processPassportPhoto(file: File, targetWidth = 350, targetHeight = 450): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, or WEBP).'));
      return;
    }

    // Guard against excessively large raw uploads (> 15MB)
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('Image size is too large. Please select a photo under 15MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Draw neutral background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Center-crop (cover) fit with passport portrait framing
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const x = (targetWidth - img.width * scale) / 2;
          const y = (targetHeight - img.height * scale) / 2;

          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          // Compress to lightweight high-quality JPEG (~30KB-50KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } catch (err) {
          // Fallback to raw data url if canvas has issues
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}
