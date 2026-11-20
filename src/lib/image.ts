/**
 * Shrinks an uploaded photo/graphic so it fits in browser storage with the cart.
 * Browser-only: call from event handlers.
 */
export async function loadImageForPrint(file: File, max = 720): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Unreadable image"));
      el.src = url;
    });
    const w0 = img.naturalWidth || max;
    const h0 = img.naturalHeight || max;
    const scale = Math.min(1, max / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, w, h);
    const keepAlpha = /png|webp|gif|svg/.test(file.type);
    return canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
