
/**
 * Advanced client-side background removal helper.
 * Uses adaptive thresholding and alpha-feathering for a more "person-like" cut.
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No context');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Adaptive Color Keying
      // We sample the top corners which usually contain the background
      const samples = [
        {r: data[0], g: data[1], b: data[2]},
        {r: data[(canvas.width-1)*4], g: data[(canvas.width-1)*4+1], b: data[(canvas.width-1)*4+2]}
      ];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        
        // Remove high-brightness backgrounds (white)
        if (r > 235 && g > 235 && b > 235) {
          data[i+3] = 0;
          continue;
        }

        // Check against corner samples
        for (const sample of samples) {
          const dist = Math.sqrt(
            Math.pow(r - sample.r, 2) + 
            Math.pow(g - sample.g, 2) + 
            Math.pow(b - sample.b, 2)
          );
          
          if (dist < 45) {
            // Soften the edge based on distance
            data[i+3] = Math.max(0, (dist / 45) * 100 - 50);
            break;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}
