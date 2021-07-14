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
