import { claims, generators, generatorsWithKeywords } from "./data.js";
import { splitText, pickRandom } from "./helperFunctions.js";

const unrolledGenerators = generators.flatMap(({ url, weight }) => Array(weight).fill(url));

const getUnrolledGeneratorsWithKeywords = (keyword) => {
  const out = [];

  generatorsWithKeywords.forEach((generator) => {
    out.push({ url: generator.url.replace("[keyword]", keyword), weight: 1 });
  });

  return out.flatMap(({ url, weight }) => Array(weight).fill(url));
}

const imageReader = new FileReader();
const logo = new Image();
logo.src = "public/logo.png";
let currentImage = new Image();
let currentText = "Test text";

const rerollImage = async (keyword) => {
  let imageData;

  if (typeof keyword !== "undefined" && keyword.length) {
    imageData = await fetch(pickRandom(getUnrolledGeneratorsWithKeywords(keyword)));
  } else {
    imageData = await fetch(pickRandom(unrolledGenerators));
  }

  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener("load", () => {
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

canvas.addEventListener("dragover", (e) => e.preventDefault());

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!e.dataTransfer || e.dataTransfer.files.length <= 0) {
    return;
  }

  setFile(e.dataTransfer.files[0]);
});

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

  const lines = splitText(currentText, 20).reverse();
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

  imageReader.addEventListener("load", (e) => {
    currentImage = new Image();
    currentImage.addEventListener("load", () => repaintImage());
    currentImage.src = e.target.result;
  });

  const linkSave = document.getElementById("save");
  linkSave.setAttribute("download", "PirStanKampan.png");
  setTimeout(() => {
    linkSave.setAttribute("href", canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  }, 500);
};

const buttonRandom = document.getElementById("randomizeText");
buttonRandom.addEventListener("click", async () => {
  document.getElementById("customText").value = "";
  rerollText();
  repaintImage();
});

const buttonRandomImg = document.getElementById("randomize-img");

buttonRandomImg.addEventListener("click",async () => {
  const imageKeywords = document.getElementById("imageKeywords").value;
  await rerollImage(imageKeywords);
  repaintImage();
});

const inputCustomImg = document.getElementById("customImage");
inputCustomImg.addEventListener("change", (e) => {
  e.preventDefault();
  if (e.target.files.length <= 0) {
    return;
  }
  setFile(e.target.files[0]);
});
const buttonCustomImg = document.getElementById("customImageBtn");
buttonCustomImg.addEventListener("click", () => {
  inputCustomImg.click();
});

const inputCustom = document.getElementById("customText");
const replaceWithCustomText = async (e) => {
  if (e.type === "input" || inputCustom.value) {
    currentText = inputCustom.value;
    repaintImage();
  }
};
inputCustom.addEventListener("click", replaceWithCustomText);
inputCustom.addEventListener("input", replaceWithCustomText);

initFont();

rerollText();
rerollImage()
  .then(() => repaintImage());
