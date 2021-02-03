const TEXT_AREA_OBJ = ["textarea", "input"];
const TEXT_AREA_OBJ_EXCEPT = [];
const NEED_STYLE_ELEMENTS = [
  "font",
  "color",
  "overflow",
  "overflowX",
  "overflowY",
  "textAlign",
  "whiteSpace",
  "overflowWrap",
  "letterSpacing",
];
const MAX_MEMORY = 1000000;
const letters = "abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя";
const lang = [
  { setLang: "en-En", letters: "abcdefghijklmnopqrstuvwxyz" },
  { setLang: "ru-Ru", letters: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя" },
];

let dictionary = [];
let breaker = 0;
let memory = 0;

const loadBase = document.createElement("input");
loadBase.id = "base-of-words_by-Nikola-Ver";
loadBase.type = "file";
document.body.appendChild(loadBase);

const speechHint = document.createElement("div");
speechHint.id = "off-speech-hint_by-Nikola-Ver";
document.body.appendChild(speechHint);

function currentMemory(words) {
  let start = 0;
  memory = 0;
  while (start < words.length) {
    if (MAX_MEMORY > memory) {
      memory += words[start].word.length * 4;
      start++;
    } else {
      return false;
    }
  }
  return true;
}

loadBase.addEventListener("change", function () {
  let fr = new FileReader();
  fr.onload = function () {
    let fileContent = this.result;
    let temp = fileContent.split(/\n/);
    temp.forEach((e) => {
      if (e[e.length - 1] === "\n") e = e.substring(0, e.length - 1);
      dictionary.push({ word: e, callQuantity: 0 });
    });

    dictionary = dictionary.sort((current, next) => {
      if (current.word > next.word) return 1;
      if (current.word < next.word) return -1;
      return 0;
    });

    if (currentMemory(dictionary))
      localStorage.setItem("dictionary", JSON.stringify(dictionary));
    else flagNeedSave = false;
  };
  fr.readAsText(this.files[0]);
});

let prevObj = null;
let fontSize = "14px";
let quantityWordsToHint = 5;
let flagAutoResizeTextArea = true;
let flagHint = false;
let currentWordHint = 0;
let currentQuantityOfLetters = 0;
let flagContenteditable = false;
let entryObj = null;
let flagAutoFontSize = false;
let flagNeedToSearch = true;
let arryaOfWordsToHint = null;
let startPosHint = 0;
let endPosHint = 0;
let wordsToHintPos = 0;
let addNewWordInHintField = 0;
let currentLetter = "";
let recognizerFlag = true;
let currentRecognizer = null;
let countOfMistakes = 0;
let flagNeedSave = true;

function controlCommands(text, entryFieldText) {
  switch (text) {
    case " удалить всё":
    case " delete all":
      entryFieldText.innerHTML = "";
      if (flagContenteditable) {
        entryObj.innerHTML = "";
      } else {
        entryObj.value = "";
      }
      return true;

    case " переключить на английский":
      currentLetter = lang[0].letters[0];
      currentRecognizer.stop();
      currentRecognizer = null;
      recognizeSpeech(entryFieldText);
      return true;
    case " switch to russian":
      currentLetter = lang[1].letters[0];
      currentRecognizer.stop();
      currentRecognizer = null;
      recognizeSpeech(entryFieldText);
      return true;

    case " открыть переводчик":
    case " open translator":
      window.open("https://translate.google.com/", "", "");
      return true;

    default:
      return false;
  }
}

function recognizeSpeech(entryFieldText) {
  let recognizer = new webkitSpeechRecognition();
  let len = lang.length;
  recognizer.continuous = true;
  recognizer.interimResults = true;

  for (let i = 0; i < len; i++) {
    recognizer.lang = lang[i].setLang;
    if (lang[i].letters.includes(currentLetter)) i = len;
  }

  recognizer.onresult = function (event) {
    const result = event.results[event.resultIndex];
    if (result.isFinal) {
      speechHint.textContent = "";
      speechHint.id = "off-speech-hint_by-Nikola-Ver";
      let text = result[0].transcript.toLowerCase();
      if (text[0] !== " ") text = " " + text;
      if (!controlCommands(text, entryFieldText)) {
        if (
          text != " stop recognizing" &&
          text != " перестать распознавать" &&
          !recognizerFlag
        ) {
          try {
            const sel = window.getSelection();
            const range = sel.getRangeAt(0);
            range.insertNode(document.createTextNode(text));
            range.setStart(entryFieldText, range.endOffset);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            if (flagContenteditable) {
              entryObj.innerHTML = entryFieldText.innerHTML;
            } else {
              entryObj.value = entryFieldText.innerHTML
                .replace(/\<br\>/gi, "\n")
                .replace(/\&nbsp\;/gi, " ");
            }
          } catch {}
        } else {
          recognizer.stop();
          recognizerFlag = true;
        }
      }
    } else {
      speechHint.id = "on-speech-hint_by-Nikola-Ver";
      speechHint.textContent = result[0].transcript.toLowerCase();
    }
  };

  currentRecognizer = recognizer;
  recognizer.start();
}

function getSelectionCoords(flag) {
  let win = window;
  let doc = win.document;

  let x = 0;
  let y = 0;

  let range, rect;
  let sel = win.getSelection();
  range = sel.getRangeAt(0).cloneRange();

  let currentWord = "";
  if (flag) {
    let endPos = range.startOffset;
    let text = range.commonAncestorContainer.textContent;
    let startPos = endPos - 1;
    while (
      startPos >= 0 &&
      text[startPos] != " " &&
      text[startPos] != "&nbsp;" &&
      text[startPos] != "<br>" &&
      text[startPos] != "\n" &&
      text.charCodeAt(startPos) !== 160
    ) {
      startPos--;
    }
    if (startPos + 1 !== endPos) currentWord = text.slice(startPos + 1, endPos);
  }

  let span = doc.createElement("span");
  span.appendChild(doc.createTextNode("\u200b"));
  range.insertNode(span);
  [rect] = span.getClientRects();
  x = rect.left;
  y = rect.top;
  let spanParent = span.parentNode;
  spanParent.removeChild(span);
  spanParent.normalize();

  return [{ x: x, y: y }, currentWord];
}

function searchWords(currentWord) {
  let left = 0,
    right = dictionary.length - 1,
    step;
  while (left <= right) {
    step = (left + right) >>> 1;
    if (dictionary[step].word.indexOf(currentWord) === 0) return step;
    else if (currentWord < dictionary[step].word) right = step - 1;
    else left = step + 1;
  }

  return null;
}

function searchWordsToAddOrDel(currentWord) {
  let left = 0,
    right = dictionary.length - 1,
    step;
  while (left <= right) {
    step = (left + right) >>> 1;
    if (dictionary[step].word === currentWord) return step;
    else if (currentWord < dictionary[step].word) right = step - 1;
    else left = step + 1;
  }

  return null;
}

function insertWord(newWord) {
  function sortedIndex(array, value) {
    let low = 0,
      high = array.length;

    while (low < high) {
      let mid = (low + high) >>> 1;
      if (array[mid].word < value) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  if (searchWordsToAddOrDel(newWord) === null) {
    memory += newWord.length * 4;

    dictionary.splice(sortedIndex(dictionary, newWord), 0, {
      word: newWord,
      callQuantity: 1,
    });

    if (MAX_MEMORY < memory) flagNeedSave = false;
  }
}

function hintFieldFunc(obj, rect, flagSearch, styleObj) {
  let [coordinates, currentWord] = getSelectionCoords(flagSearch);

  if (flagSearch) {
    currentQuantityOfLetters = currentWord.length;
    if (currentQuantityOfLetters) {
      if (flagNeedToSearch) {
        foundWordPos = searchWords(currentWord);

        if (foundWordPos !== null) {
          let wordsToHint = document.getElementsByClassName("word-to-hint");
          (startPosHint = foundWordPos), (endPosHint = foundWordPos + 1);

          while (
            startPosHint >= 0 &&
            dictionary[startPosHint].word.indexOf(currentWord) === 0
          )
            startPosHint--;
          startPosHint++;
          while (
            endPosHint < dictionary.length &&
            dictionary[endPosHint].word.indexOf(currentWord) === 0
          )
            endPosHint++;
          arryaOfWordsToHint = dictionary
            .slice(startPosHint, endPosHint)
            .sort(
              ({ callQuantity: current }, { callQuantity: next }) =>
                next - current
            );
          for (let i = 0; i < quantityWordsToHint; i++) {
            if (i + currentWordHint < endPosHint - startPosHint)
              wordsToHint[i].textContent =
                arryaOfWordsToHint[i + currentWordHint].word;
            else wordsToHint[i].textContent = "";
            if (i === wordsToHintPos) wordsToHint[i].id = "active-hint";
            else wordsToHint[i].id = "";
          }

          obj.style.display = "";
          flagHint = true;
        } else {
          obj.style.display = "none";
          flagHint = false;
        }
      } else {
        let wordsToHint = document.getElementsByClassName("word-to-hint");
        if (addNewWordInHintField > 0) {
          for (let i = 0; i < quantityWordsToHint - 1; i++)
            wordsToHint[i].textContent = wordsToHint[i + 1].textContent;
          wordsToHint[quantityWordsToHint - 1].textContent =
            arryaOfWordsToHint[currentWordHint].word;
        }

        if (addNewWordInHintField < 0) {
          for (let i = quantityWordsToHint - 1; i > 0; i--)
            wordsToHint[i].textContent = wordsToHint[i - 1].textContent;
          wordsToHint[0].textContent = arryaOfWordsToHint[currentWordHint].word;
        }

        for (let i = 0; i < quantityWordsToHint; i++) {
          if (i === wordsToHintPos) wordsToHint[i].id = "active-hint";
          else wordsToHint[i].id = "";
        }
      }
    } else {
      obj.style.display = "none";
      flagHint = false;
    }
  }

  let style = getComputedStyle(styleObj);
  let heightObj = getComputedStyle(obj).height;
  obj.style.left =
    "calc(" +
    String(coordinates.x - rect.left) +
    "px" +
    " - " +
    style.paddingLeft +
    " - " +
    style.borderLeftWidth +
    ")";
  if (
    coordinates.y +
      parseFloat(fontSize) -
      parseFloat(style.paddingTop) -
      parseFloat(style.borderTopWidth) +
      parseFloat(heightObj) <
    parseFloat(document.documentElement.clientHeight) +
      parseFloat(window.scrollY)
  )
    obj.style.top =
      "calc(" +
      String(coordinates.y - rect.top) +
      "px" +
      " + " +
      fontSize +
      " - " +
      style.paddingTop +
      " - " +
      style.borderTopWidth +
      ")";
  else
    obj.style.top =
      "calc(" +
      String(coordinates.y - rect.top - parseFloat(heightObj)) +
      "px" +
      " - " +
      style.paddingTop +
      " - " +
      style.borderTopWidth +
      ")";
}

function changeFocucPos(
  focusObject,
  start,
  end,
  range,
  sel,
  childStart = 0,
  childEnd = 0
) {
  try {
    while (
      focusObject.childNodes[childStart] !== undefined &&
      start > (focusObject.childNodes[childStart].length || 1)
    ) {
      start -= focusObject.childNodes[childStart].length
        ? focusObject.childNodes[childStart].length
        : 1;
      childStart++;
    }

    while (
      focusObject.childNodes[childEnd] !== undefined &&
      end > (focusObject.childNodes[childEnd].length || 1)
    ) {
      end -= focusObject.childNodes[childEnd].length
        ? focusObject.childNodes[childEnd].length
        : 1;
      childEnd++;
    }

    range.setStart(focusObject.childNodes[childStart], start);
    range.setEnd(focusObject.childNodes[childEnd], end);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch {}
}

function focusOff(obj, flagNeedFocus) {
  entryObj && (entryObj.style.webkitTextFillColor = "");
  if (obj) {
    let entryFieldText = document.getElementById("text-field_by-Nikola-Ver");
    if (entryFieldText && flagNeedFocus)
      if (flagContenteditable) {
        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        entryObj.focus();

        let start = range.startOffset;
        let end = range.endOffset;
        let childStart = 0;
        let childEnd = 0;

        entryFieldText.childNodes.forEach((element, index) => {
          if (element === range.startContainer) childStart = index;
          if (element === range.endContainer) childEnd = index;
        });

        sel = window.getSelection();
        range = sel.getRangeAt(0);

        changeFocucPos(entryObj, start, end, range, sel, childStart, childEnd);
      } else {
        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        entryObj.focus();

        let start = range.startOffset;
        let end = range.endOffset;
        let foundStart = false;
        let foundEnd = false;

        entryFieldText.childNodes.forEach((element) => {
          if (element === range.startContainer) foundStart = true;
          if (!foundStart) start += element.length ? element.length : 1;

          if (element === range.endContainer) foundEnd = true;
          if (!foundEnd) end += element.length ? element.length : 1;
        });

        entryObj.selectionStart = start;
        entryObj.selectionEnd = end;
      }

    recognizerFlag = true;
    if (currentRecognizer) {
      currentRecognizer.stop();
      currentRecognizer = null;
    }
    obj.remove();
  }
}

function resizeTextArea(entryField, entryFieldText, obj) {
  let rect = obj.getBoundingClientRect();
  let style = getComputedStyle(obj);

  NEED_STYLE_ELEMENTS.forEach((e) => {
    entryFieldText.style[e] = style[e];
  });

  if (obj.tagName.toLowerCase() === "input") {
    if (style.overflow === "visible") entryFieldText.style.overflow = "hidden";
    if (style.whiteSpace === "normal")
      entryFieldText.style.whiteSpace = "nowrap";
    entryFieldText.style.alignItems = "center";
    entryFieldText.style.display = "flex";
  }

  obj.scrollTo(entryFieldText.scrollLeft, entryFieldText.scrollTop);
  entryField.style.width =
    "calc(" +
    rect.width +
    "px" +
    " - " +
    style.paddingLeft +
    " - " +
    style.paddingRight +
    " - " +
    style.borderLeftWidth +
    " - " +
    style.borderRightWidth +
    ")";
  entryField.style.height =
    "calc(" +
    rect.height +
    "px" +
    " - " +
    style.paddingTop +
    " - " +
    style.paddingBottom +
    " - " +
    style.borderTopWidth +
    " - " +
    style.borderBottomWidth +
    ")";
  entryField.style.top =
    "calc(" +
    rect.top +
    "px" +
    " + " +
    style.paddingTop +
    " + " +
    style.borderTopWidth +
    ")";
  entryField.style.left =
    "calc(" +
    rect.left +
    "px" +
    " + " +
    style.paddingLeft +
    " + " +
    style.borderLeftWidth +
    ")";

  fontSize = style.fontSize;
  if (flagAutoFontSize) {
    document.documentElement.style.setProperty("--font-size", fontSize);
    document.documentElement.style.setProperty("--font-size-active", fontSize);
  }
}

function focusOn(obj) {
  let entryField = null;
  let flagCancel = false;
  flagContenteditable = obj.getAttribute("contenteditable") || 
                        /write/.exec(getComputedStyle(obj).webkitUserModify);

  if (
    (flagContenteditable ||
      TEXT_AREA_OBJ.includes(obj.tagName.toLowerCase())) &&
    (!TEXT_AREA_OBJ_EXCEPT.includes(obj.className.toLowerCase()) ||
      !TEXT_AREA_OBJ_EXCEPT.includes(obj.id.toLowerCase()))
  ) {
    entryObj = obj;
    entryField = document.createElement("div");
    entryField.id = "entry-field_by-Nikola-Ver";

    let entryFieldText = document.createElement("div");
    entryFieldText.setAttribute("contenteditable", "true");
    // entryFieldText.setAttribute("spellcheck", "false");
    entryFieldText.id = "text-field_by-Nikola-Ver";

    if (flagContenteditable) entryFieldText.innerHTML = obj.innerHTML;
    else entryFieldText.innerHTML = obj.value.replace(/\n/gi, "<br>");

    let entryFieldContain = document.createElement("div");
    entryFieldContain.id = "contain_by-Nikola-Ver";

    let rect = obj.getBoundingClientRect();
    entryFieldText.onscroll = (e) => {
      obj.scrollTo(entryFieldText.scrollLeft, entryFieldText.scrollTop);
    };
    resizeTextArea(entryField, entryFieldText, obj);

    let hintField = document.createElement("div");
    hintField.id = "hint-field_by-Nikola-Ver";
    hintField.style.display = "none";

    for (let i = 0; i < quantityWordsToHint; i++) {
      let wordToHint = document.createElement("div");
      wordToHint.className = "word-to-hint";
      hintField.appendChild(wordToHint);
    }

    entryFieldText.addEventListener("keypress", (e) => {
      const letter = String.fromCharCode(e.keyCode || e.charCode).toLowerCase();
      if (letters.includes(letter)) currentLetter = letter;
      if (currentRecognizer && !recognizerFlag) {
        speechHint.id = "off-speech-hint_by-Nikola-Ver";
        speechHint.textContent = "";
        currentRecognizer.stop();
        currentRecognizer = null;
        recognizeSpeech(entryFieldText);
      }
      obj.dispatchEvent(new KeyboardEvent("keypress", e));
    });

    entryFieldText.addEventListener("keydown", (e) => {
      if (e.shiftKey && e.ctrlKey && e.altKey) {
        let newWord = document.getSelection().toString();
        if (newWord.length > 0) insertWord(newWord);
      }

      if (e.keyCode === 118)
        if (recognizerFlag) {
          recognizerFlag = false;
          recognizeSpeech(entryFieldText);
        } else {
          recognizerFlag = true;
          if (currentRecognizer) {
            currentRecognizer.stop();
            currentRecognizer = null;
          }
        }

      if (
        (!e.shiftKey && e.keyCode === 13) ||
        e.keyCode === 27 ||
        e.keyCode === 9
      ) {
        if (flagHint) {
          hintField.style.display = "none";
          if (e.keyCode === 13 || e.keyCode === 9) {
            let word = arryaOfWordsToHint[currentWordHint].word;
            arryaOfWordsToHint[currentWordHint].callQuantity++;
            let sel = window.getSelection();
            let range = sel.getRangeAt(0);
            range.insertNode(
              document.createTextNode(
                word.slice(currentQuantityOfLetters, word.length)
              )
            );
            range.setStart(entryFieldText, range.endOffset);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
          flagHint = false;
          flagCancel = true;
          e.preventDefault();
          return;
        } else focusOff(entryField, false);
      }

      if (e.keyCode === 46)
        if (flagHint && currentWordHint < arryaOfWordsToHint.length) {
          let word = arryaOfWordsToHint[currentWordHint].word;
          dictionary.splice(searchWordsToAddOrDel(word), 1);
          arryaOfWordsToHint.splice(currentWordHint, 1);
          let wordsToHint = document.getElementsByClassName("word-to-hint");
          let lenArrayWords = arryaOfWordsToHint.length;
          let len = wordsToHint.length;
          for (let i = wordsToHintPos; i < len; i++) {
            if (i + currentWordHint - wordsToHintPos < lenArrayWords)
              wordsToHint[i].textContent =
                arryaOfWordsToHint[i + currentWordHint - wordsToHintPos].word;
            else wordsToHint[i].textContent = "";
          }
          e.preventDefault();
          return;
        } else if (arryaOfWordsToHint.length === 0) {
          flagCancel = true;
          flagHint = false;
          let temp = document.getElementById("hint-field_by-Nikola-Ver");
          temp.style.display = "none";
        }

      flagNeedToSearch = true;
      if (flagHint && (e.keyCode === 38 || e.keyCode === 40)) {
        addNewWordInHintField = 0;
        if (e.keyCode === 38) {
          if (currentWordHint > 0) {
            currentWordHint--;
            if (wordsToHintPos > 0) wordsToHintPos--;
            else addNewWordInHintField = -1;
          }
        } else {
          if (
            arryaOfWordsToHint &&
            currentWordHint < arryaOfWordsToHint.length - 1
          ) {
            currentWordHint++;
            if (wordsToHintPos + 1 < quantityWordsToHint) wordsToHintPos++;
            else addNewWordInHintField = 1;
          }
        }
        flagNeedToSearch = false;
        e.preventDefault();
        return;
      } else {
        wordsToHintPos = 0;
        currentWordHint = 0;
      }

      obj.dispatchEvent(new KeyboardEvent("keydown", e));
      hintFieldFunc(hintField, rect, false, obj);
    });

    entryFieldText.addEventListener("keyup", (e) => {
      if (flagContenteditable) {
        obj.innerHTML = entryFieldText.innerHTML;
      } else {
        obj.value = entryFieldText.innerHTML
          .replace(/\<br\>/gi, "\n")
          .replace(/\&nbsp\;/gi, " ");
      }

      rect = obj.getBoundingClientRect();

      if (
        !flagHint &&
        [
          9,
          16,
          17,
          18,
          20,
          32,
          33,
          34,
          35,
          36,
          37,
          38,
          39,
          40,
          45,
          91,
          93,
          112,
          113,
          114,
          115,
          116,
          117,
          118,
          119,
          120,
          121,
          122,
          123,
        ].includes(e.keyCode)
      ) {
        flagCancel = true;
        if (e.ctrlKey && e.keyCode === 32) {
          flagCancel = false;
        }
      }

      hintFieldFunc(hintField, rect, !flagCancel, obj);
      flagCancel = false;
      obj.dispatchEvent(new KeyboardEvent("keyup", e));
      resizeTextArea(entryField, entryFieldText, obj);
    });

    hintField.className = "object-Nikola-Ver";
    entryFieldText.className = "object-Nikola-Ver";
    entryField.className = "object-Nikola-Ver";

    entryFieldContain.appendChild(entryFieldText);
    entryFieldContain.appendChild(hintField);
    entryField.appendChild(entryFieldContain);
    document.body.appendChild(entryField);
    let sel = window.getSelection();
    let range = sel.getRangeAt(0);
    entryFieldText.focus();

    entryFieldText.onfocusout = (e) => {
      if (!flagHint) focusOff(prevObj);
    };

    if (flagContenteditable) {
      let start = range.startOffset;
      let end = range.endOffset;
      let childStart = 0;
      let childEnd = 0;

      obj.childNodes.forEach((element, index) => {
        if (element === range.startContainer) childStart = index;
        if (element === range.endContainer) childEnd = index;
      });

      sel = window.getSelection();
      range = sel.getRangeAt(0);

      changeFocucPos(
        entryFieldText,
        start,
        end,
        range,
        sel,
        childStart,
        childEnd
      );
    } else {
      sel = window.getSelection();
      if (sel.baseNode) {
        range = sel.getRangeAt(0);

        changeFocucPos(
          entryFieldText,
          obj.selectionStart,
          obj.selectionEnd,
          range,
          sel
        );
      }
    }
    obj.style.webkitTextFillColor = "transparent";

    window.onresize = () => {
      resizeTextArea(entryField, entryFieldText, obj);
    };

    window.onscroll = () => {
      resizeTextArea(entryField, entryFieldText, obj);
    };
  }

  return entryField;
}

document.onclick = (e) => {
  breaker === 1 && changeFocus(e.target);
};

document.onkeydown = (e) => {
  if (e.keyCode === 113) {
    breaker++;
    if (breaker === 3) {
      if (prevObj) {
        focusOff(prevObj, true);
      }
      breaker = 0;
    }
  }

  if (breaker === 1) {
    if (
      !document.getElementById("entry-field_by-Nikola-Ver") ||
      countOfMistakes > 1
    ) {
      countOfMistakes = 0;
      changeFocus(document.activeElement);
    } else if ("text-field_by-Nikola-Ver" === e.target.id) {
      countOfMistakes = 0;
    } else {
      countOfMistakes++;
    }
  }
};

function changeFocus(currentObject) {
  if (currentObject.className !== "object-Nikola-Ver") {
    if (currentObject.className === "word-to-hint") {
      let word = currentObject.textContent;
      let sel = window.getSelection();
      let range = sel.getRangeAt(0);
      arryaOfWordsToHint.forEach((e) => {
        if (word === e.word) e.callQuantity++;
      });
      range.insertNode(
        document.createTextNode(
          word.slice(currentQuantityOfLetters, word.length)
        )
      );
      let entryFieldText = document.getElementById("text-field_by-Nikola-Ver");
      range.setStart(entryFieldText, range.endOffset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);

      if (flagContenteditable) {
        entryObj.innerHTML = entryFieldText.innerHTML;
      } else {
        entryObj.value = entryFieldText.innerHTML
          .replace(/\<br\>/gi, "\n")
          .replace(/\&nbsp\;/gi, " ");
      }

      flagHint = false;
      let temp = document.getElementById("hint-field_by-Nikola-Ver");
      temp.style.display = "none";
    } else {
      focusOff(prevObj, false);
      prevObj = focusOn(currentObject);
    }
  } else {
    flagHint = false;
    let temp = document.getElementById("hint-field_by-Nikola-Ver");
    temp.style.display = "none";
  }
}

function changeHintFieldOrAddNewWords(key, value) {
  if (value && value !== "null")
    if (key === "quantityHints") {
      localStorage.setItem(key, value);
      quantityWordsToHint = value;
      let hintField = document.getElementById("hint-field_by-Nikola-Ver");
      if (hintField) {
        let temp = document.getElementsByClassName("word-to-hint");
        let len = temp.length;
        for (let i = 0; i < len; i++) temp[0].remove();

        if (wordsToHintPos > quantityWordsToHint)
          wordsToHintPos = quantityWordsToHint - 1;

        for (let i = 0; i < quantityWordsToHint; i++) {
          let wordToHint = document.createElement("div");
          wordToHint.className = "word-to-hint";
          if (i === wordsToHintPos) wordToHint.id = "active-hint";
          hintField.appendChild(wordToHint);
        }
      }
    } else if (key === "addNewBase") {
      loadBase.click();
    } else if (key === "switch") {
      if (breaker === 0) breaker = 1;
      else {
        if (prevObj) {
          focusOff(prevObj, true);
        }
        breaker = 0;
      }
    } else if (key.indexOf("dictionary") === 0) {
      dictionary = JSON.parse(value);
      dictionary = dictionary.sort((current, next) => {
        if (current.word > next.word) return 1;
        if (current.word < next.word) return -1;
        return 0;
      });
    } else {
      document.documentElement.style.setProperty(key, value);
      localStorage.setItem(key, value);
    }
}

chrome.extension.onMessage.addListener((obj) => {
  for (let key in obj) changeHintFieldOrAddNewWords(key, obj[key]);
});

(function () {
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

  arrayOfCssValues.forEach((e) => {
    changeHintFieldOrAddNewWords(e, localStorage.getItem(e));
  });

  let key = "dictionary";
  changeHintFieldOrAddNewWords(key, localStorage.getItem(key));
})();

window.onbeforeunload = (e) => {
  if (flagNeedSave)
    localStorage.setItem("dictionary", JSON.stringify(dictionary));
  else {
    let newWords = dictionary.filter((e) => e.callQuantity > 0);
    if (currentMemory(newWords))
      localStorage.setItem("dictionary", JSON.stringify(newWords));
  }
};
