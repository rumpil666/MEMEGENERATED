import '../assets/styles/index.css';
const popup = document.querySelector('.popup');
const input = document.querySelector('.input');
const download = document.querySelector('.download');

const inputRGB = document.querySelectorAll('.input__rgb');
const inputGreen = document.querySelector('.green');
const inputRed = document.querySelector('.red');
const inputBlue = document.querySelector('.blue');

const popupInput = document.querySelector('.popup__input');
const popupForm = document.querySelector('.popup__form');
const canvas = document.querySelector('.canvas');
canvas.width = 1200;
canvas.height = 600;
const context = canvas.getContext('2d');
const rect = canvas.getBoundingClientRect();
const texts = [];
let fontSize = 50;
let backgrounImg;
let startX;
let startY;
let selectedText = -1;

function escapeClose(e) {
  if (e.key === 'Escape') {
    selectedText = -1;
    popup.classList.remove('popup--open');
  }
}

function openPopup() {
  popup.classList.add('popup--open');
  document.addEventListener('keydown', escapeClose);
  popupInput.focus();
}

function closePopup() {
  selectedText = -1;
  popup.classList.remove('popup--open');
  document.removeEventListener('keydown', escapeClose);
}

function handleInputChange(e) {
  const URL = window.webkitURL || window.URL;
  const url = URL.createObjectURL(e.target.files[0]);
  const img = new Image();
  img.src = url;
  backgrounImg = img;
  img.onload = function () {
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
}

function createText() {
  context.drawImage(backgrounImg, 0, 0, canvas.width, canvas.height);
  context.fillStyle = `rgb(${inputRed.value}, ${inputGreen.value}, ${inputBlue.value})`;
  context.font = `${fontSize}px "Segoe UI"`;

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    context.fillText(text.text, text.x, text.y)
  }

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    text.width = context.measureText(text.text).width;
    text.height = fontSize;
  }
}

function textHittest(x, y, textIndex) {
  const text = texts[textIndex];

  return (x >= text.x &&
    x <= text.x + text.width &&
    y >= text.y - text.height &&
    y <= text.y);
}

function handleMouseDown(e) {
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;

  for (let i = 0; i < texts.length; i++) {
    if (textHittest(startX, startY, i)) {
      selectedText = i;
    }
  }
}

function handleMouseDblclick(e) {
  if (!backgrounImg) return;
  const dblclickX = e.clientX - rect.left;
  const dblclickY = e.clientY - rect.top;

  if (texts.length === 0 || selectedText < 0) {
    popupInput.value = '';
    openPopup()
  }

  for (let i = 0; i < texts.length; i++) {
    if (textHittest(dblclickX, dblclickY, i)) {
      selectedText = i;
      popupInput.value = texts[i].text;
      openPopup()
    }
  }
}

function handleMouseMove(e) {
  if (selectedText < 0) return;

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const dx = mouseX - startX;
  const dy = mouseY - startY;
  startX = mouseX;
  startY = mouseY;

  const text = texts[selectedText];
  text.x += dx;
  text.y += dy;
  createText();
}

function handleMouseUp() {
  if (document.querySelector('.popup--open')) return;
  selectedText = -1;
}

function handleMouseOut() {
  if (document.querySelector('.popup--open')) return;
  selectedText = -1;
}

function handleFormSubmit(e) {
  e.preventDefault();
  if (selectedText < 0) {
    texts.push({
      text: popupInput.value,
      x: rect.width / 2 - context.measureText(popupInput.value).width,
      y: rect.height / 2
    })
    closePopup()
    createText();
  } else {
    const text = texts[selectedText];
    text.text = popupInput.value;
    closePopup()
    createText();
  }
}

function updateFontSise(e) {
  if (e.key === "ArrowUp") {
    fontSize += 1;
    createText();
  }
  if (e.key === "ArrowDown") {
    fontSize -= 1;
    createText();
  }
}

function updateFontColor(e) {
  if (e.target.value > 255) {
    e.target.value = 255;
    createText();
  }
  if (e.target.value < 0) {
    e.target.value = '';
    createText();
  }
  if (e.target.value.match(/[^0-9]/)) {
    e.target.value = '';
    createText();
  }
  createText()
}

function handleDownload() {
  const link = document.createElement('a');
  link.download = 'download.png';
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseOut);
canvas.addEventListener('dblclick', handleMouseDblclick);

input.addEventListener('change', handleInputChange);
document.addEventListener('keydown', updateFontSise);
popupForm.addEventListener('submit', handleFormSubmit)

inputRGB.forEach((input) => input.addEventListener('input', updateFontColor))
download.addEventListener('click', handleDownload);
