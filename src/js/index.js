import { claims, generators } from "./data.js";

const logo = new Image();
logo.src = "public/logo.png";

let currentImage = new Image();
let currentText = "Test text";

const splitText = (text, maxLineLength) => {
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

const rerollImage = async () => {
  const imageData = await fetch(pickRandom(unrolledGenerators));

  return new Promise((resolve) => {
    let image = new Image();

    image.addEventListener("load", ev => { 
      currentImage = image;
      resolve();
    });

    image.crossOrigin = "anonymous";
    image.src = imageData.url;
  });
};

const rerollText = () => {
  currentText = pickRandom(claims);
};

const imageReader = new FileReader();
imageReader.onload = ev => {
  currentImage = new Image();
  currentImage.addEventListener("load", lev => repaintImage());
  currentImage.src = ev.target.result;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const canvas = document.getElementById("picture");
const ctx = canvas.getContext("2d");
const font = new FontFace("Bebas Neue", "url(public/BebasNeue-Bold.ttf)");

const initFont = async () => {
  await font.load();
  document.fonts.add(font);
};

const setFile = (file) => {
  if (!file.type.startsWith("image/")) {
    return;
  }

  imageReader.readAsDataURL(file);
}; 

canvas.addEventListener('dragover', ev => {
  if (!ev.dataTransfer) {
    return;
  }

  for (const item of ev.dataTransfer.items) {
    if (item.type.startsWith("image/")) {
      console.log("IMAGE!");
      ev.preventDefault();
      return;
    }
  }
});

canvas.addEventListener('drop', ev => {
  ev.preventDefault();
  if (!ev.dataTransfer || ev.dataTransfer.files.length <= 0) {
    return;
  }

  setFile(ev.dataTransfer.files[0]);
});

const unrolledGenerators = generators.flatMap(({ url, weight }) => Array(weight).fill(url));

const repaintImage = async () => {
  // clear to black (for transparent images)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // scale image to always fill the canvas
  const scaleX = canvas.width / currentImage.width;
  const scaleY = canvas.height / currentImage.height;
  const scale = Math.max(scaleX, scaleY);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(currentImage, 0, 0);

  ctx.setTransform(); // reset so that everything else is normal size
  ctx.drawImage(logo, 525, 20);

  const unsplitText = currentText;
  const lines = splitText(unsplitText, 20).reverse();
  const fontSize = lines.length < 5 ? 60 : 40;
  ctx.font = `${fontSize}px 'Bebas Neue'`;
  lines.forEach((line, index) => {
    const x = 30;
    const y = 685;
    const padding = 15;
    const lineHeight = padding + fontSize;
    ctx.fillStyle = "#f9dc4d";
    ctx.fillRect(x, y - (index * lineHeight), ctx.measureText(line).width + 2 * padding, lineHeight);
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.fillText(line, x + padding, y + padding - (index * lineHeight));
  });

  const linkSave = document.getElementById("save");
  linkSave.setAttribute("download", "PirStanKampan.png");
  setTimeout(() => {
    linkSave.setAttribute("href", canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  }, 500);
};

const buttonRandom = document.getElementById("randomize");
buttonRandom.onclick = async () => {
  rerollText();
  repaintImage();
}

const buttonRandomImg = document.getElementById("randomize-img");
buttonRandomImg.onclick = async () => {
  await rerollImage();
  repaintImage();
}

const inputCustom = document.getElementById("customText");
const buttonCustom = document.getElementById("submitCustomText");
buttonCustom.onclick = async () => {
  if (inputCustom.value) {
    currentText = inputCustom.value;
    repaintImage();
  }
};

const inputCustomImg = document.getElementById("customImage");
inputCustomImg.addEventListener("change", ev => {
  ev.preventDefault();
  if (ev.target.files.length <= 0) {
    return;
  }
  setFile(ev.target.files[0]);
});
const buttonCustomImg = document.getElementById("customImageBtn");
buttonCustomImg.addEventListener("click", () => {
  inputCustomImg.click();
});

initFont();

rerollText();
rerollImage()
  .then(() => repaintImage());
