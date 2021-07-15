export const splitText = (text, maxLineLength) => {
  const result = [];
  while (text.length > maxLineLength) {
    let pos = text.substring(0, maxLineLength).lastIndexOf(" ");
    pos = pos <= 0 ? maxLineLength : pos;
    result.push(text.substring(0, pos));
    let i = text.indexOf(" ", pos) + 1;
    if (i < pos || i > pos + maxLineLength) i = pos;
    text = text.substring(i);
  }
  result.push(text);
  return result;
};

export const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const luminanceOf = (r, g, b) => (0.2126 * r) + (0.7152 * g) + (0.0722 * b);

export const getAverageLuminance = (rgbData, pixelSkip) => {
  pixelSkip = pixelSkip ?? 6;
  let luminanceSum = 0;
  let luminanceDivisor = 0;
  for (let i = 0; i < rgbData.length; i += 3 * pixelSkip) {
    // +3 for R+G+B; *pixelSkip because we don't need that many samples => less accurate, but faster!
    
    let r = rgbData[i    ] / 255;
    let g = rgbData[i + 1] / 255;
    let b = rgbData[i + 2] / 255;

    const luminance = luminanceOf(r, g, b);
    if (!isNaN(luminance)) {
      luminanceSum += luminance;
      luminanceDivisor++;
    }
  }

  return luminanceSum / luminanceDivisor;
};
