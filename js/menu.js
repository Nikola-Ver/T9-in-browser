const colorPanel = document.getElementById("color-panel_by-Nikola-Ver");
const TRANSPARENT = "transparent";
let currentColor = null;
const arrayOfCssValues = [
  "--main-color-1",
  "--main-color-2",
  "--selection-background-color",
  "--selection-font-color",
  "--hint-background-active-color",
  "--hint-background-color",
  "--hint-font-active-color",
  "--hint-font-color",
  "--font-size",
  "--font-size-active",
  "--shadow-hint",
  "quantityHints",
  "--selection-shadow",
];
let valuesToForward = {
  "--main-color-1": null,
  "--main-color-2": null,
  "--selection-background-color": null,
  "--selection-font-color": null,
  "--hint-background-active-color": null,
  "--hint-background-color": null,
  "--hint-font-active-color": null,
  "--hint-font-color": null,
  "--font-size": null,
  "--font-size-active": null,
  "--shadow-hint": null,
  quantityHints: null,
  "--selection-shadow": null,
};

arrayOfCssValues.forEach((e) => {
  if (localStorage.getItem(e)) {
    document.documentElement.style.setProperty(e, localStorage.getItem(e));
    valuesToForward[e] = localStorage.getItem(e);
  }
});

colorPanel.addEventListener("change", (e) => {
  document.documentElement.style.setProperty(currentColor, colorPanel.value);
  localStorage.setItem(currentColor, colorPanel.value);
  valuesToForward[currentColor] = colorPanel.value;
  forwardValues();
});

function changeColor(color) {
  currentColor = color;
  colorPanel.click();
}

function changeBackground(name, value) {
  document.documentElement.style.setProperty(name, value);
  localStorage.setItem(name, value);
  valuesToForward[name] = value;
  forwardValues();
}

const mainColor1 = document.getElementById("main-color-1_by-Nikola-Ver");
const mainColor2 = document.getElementById("main-color-2_by-Nikola-Ver");
const selectionBackground = document.getElementById(
  "selection-background_by-Nikola-Ver"
);
const selectionFont = document.getElementById("selection-font_by-Nikola-Ver");
const activeBackgroundInput = document.getElementById(
  "active-background-input_by-Nikola-Ver"
);
const backgroundInput = document.getElementById(
  "background-input_by-Nikola-Ver"
);
const activeFontColor = document.getElementById(
  "active-font-color-input_by-Nikola-Ver"
);
const fontColor = document.getElementById("font-color-input_by-Nikola-Ver");
const fontSize = document.getElementById("font-size-input_by-Nikola-Ver");
const activeFontSize = document.getElementById(
  "active-font-size-input_by-Nikola-Ver"
);
const quantityHintsInput = document.getElementById(
  "quantity-hints-input_by-Nikola-Ver"
);
const shadowHint = document.getElementById("shadow-hint-input_by-Nikola-Ver");
const addNewBase = document.getElementById("add-new-base_by-Nikola-Ver");
const switcher = document.getElementById("switch_by-Nikola-Ver");
const info = document.getElementById("info_by-Nikola-Ver");
const root = document.getElementById("root_by-Nikola-Ver");
const promptField = document.getElementById("prompt-field_by-Nikola-Ver");
const selectionShadowInput = document.getElementById(
  "selection-shadow-input_by-Nikola-Ver"
);

promptField.onclick = (e) => {
  root.className = "";
  promptField.className = "not-active-prompt-field_by-Nikola-Ver";
};
info.onclick = (e) => {
  root.className = "hidden-overflow_by-Nikola-Ver";
  promptField.className = "";
};
switcher.onclick = (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { switch: "switch" });
  });
};
addNewBase.onclick = (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { addNewBase: "addNewBase" });
  });
};
mainColor1.onclick = (e) => {
  changeColor(arrayOfCssValues[0]);
};
mainColor2.onclick = (e) => {
  changeColor(arrayOfCssValues[1]);
};
selectionBackground.onclick = (e) => {
  currentColor = arrayOfCssValues[2];
  document.documentElement.style.setProperty(currentColor, TRANSPARENT);
  localStorage.setItem(currentColor, TRANSPARENT);
  valuesToForward[currentColor] = TRANSPARENT;
  forwardValues();
};
selectionBackground.ondblclick = (e) => {
  changeColor(arrayOfCssValues[2]);
};
selectionFont.onclick = (e) => {
  changeColor(arrayOfCssValues[3]);
};
activeBackgroundInput.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[4], activeBackgroundInput.value);
};
backgroundInput.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[5], backgroundInput.value);
};
activeFontColor.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[6], activeFontColor.value);
};
fontColor.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[7], fontColor.value);
};
fontSize.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[8], fontSize.value);
};
activeFontSize.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[9], activeFontSize.value);
};
shadowHint.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[10], shadowHint.value);
};
quantityHintsInput.onkeyup = (e) => {
  valuesToForward.quantityHints = quantityHintsInput.value;
  localStorage.setItem("quantityHints", quantityHintsInput.value);
  forwardValues();
};
selectionShadowInput.onkeyup = (e) => {
  changeBackground(arrayOfCssValues[12], selectionShadowInput.value);
};

function forwardValues() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, valuesToForward);
  });
}

forwardValues();
