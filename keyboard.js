/* eslint-disable no-param-reassign */
import Key from './key.js';
import languages from './layouts/languages.js';
import * as storage from './storage.js';

export default class Keyboard {
  constructor(keysOrder) {
    this.main = null;
    this.output = null;
    this.keyboard = null;
    this.isCaps = false;
    this.keysOrder = keysOrder;
    this.keysPressed = new Set();
    this.langs = languages;
    this.keyBtns = [];
  }

  init(lang) {
    this.currentLang = lang;
    this.main = document.createElement('div');
    this.output = document.createElement('textarea');
    this.output.classList.add('keyboard-input');
    this.output.placeholder = 'Click here!';
    this.output.cols = '10';
    this.main.append(this.output);

    this.keyboard = document.createElement('div');
    this.keyboard.classList.add('keyboard');
    this.main.append(this.keyboard);
    this.keysOrder.forEach((el) => this.createKeys(this.langs[lang], el));
    document.body.append(this.main);
    storage.set('storageLang', lang);

    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    document.addEventListener('mousedown', this.preHandleEvent);
    document.addEventListener('mouseup', this.preHandleEvent);

    this.description = document.createElement('div');
    this.description.classList.add('description');
    this.description.innerHTML = 'Клавиатура создана на Win, смена языка клавишами ctrl + alt';
    this.main.append(this.description);
  }

  createKeys(lang, key) {
    const brs = ['Tab', 'CapsLock', 'ShiftLeft', 'ControlLeft'];
    if (brs.includes(key)) {
      const br = document.createElement('div');
      br.classList.add('br');
      this.keyboard.append(br);
    }
    const newKey = new Key(...lang.filter((el) => el.code === key));
    this.keyBtns.push(newKey);
    this.keyboard.append(newKey.keyDiv);
  }

  preHandleEvent = (e) => {
    e.stopPropagation();
    const keyDiv = e.target.closest('.key');
    if (!keyDiv) return;
    const { dataset: { code } } = keyDiv;
    const type = e.type === 'mousedown' ? 'keydown' : 'keyup';
    keyDiv.addEventListener('mouseleave', (err) => err.target.classList.remove('pressed'));
    this.handleEvent({ code, type });
  };

  handleEvent = (e) => {
    const { code, type, key } = e;
    const keyObj = this.keyBtns.find((btn) => btn.code === code);
    // если этой кнопки нет в вирт клавиатуре, то пусть работает по умолчанию
    if (!keyObj) return;
    this.output.focus();
    if (type === 'keydown') {
      if (e.preventDefault) e.preventDefault();
      this.keysPressed.add(key);
      keyObj.keyDiv.classList.add('pressed');
    }
    if (type === 'keyup') {
      this.keysPressed.delete(key);
      keyObj.keyDiv.classList.remove('pressed');
    }
    // меняю раскладку
    if (this.keysPressed.has('Alt') && this.keysPressed.has('Control')) {
      this.switchLang();
    }
    if (code === 'CapsLock' && type === 'keydown') {
      this.isCaps = !this.isCaps;
      this.keyBtns.forEach((btn) => {
        if (btn.shift === btn.small.toUpperCase()) {
          btn.letter.innerHTML = this.isCaps ? btn.shift : btn.small;
        }
      });
    }
    // делаем шифт
    if (this.keysPressed.has('Shift') && !e.repeat) {
      this.keyBtns.forEach((btn) => {
        if (btn.shift) {
          if (this.isCaps) {
            btn.letter.innerHTML = btn.shift === btn.small.toUpperCase() ? btn.small : btn.shift;
          } else btn.letter.innerHTML = btn.shift;
          btn.sub.innerHTML = '';
        }
      });
    }
    if (type === 'keyup' && key === 'Shift') {
      this.keyBtns.forEach((btn) => {
        if (btn.shift) {
          if (this.isCaps) {
            btn.letter.innerHTML = btn.shift === btn.small.toUpperCase() ? btn.shift : btn.small;
          } else btn.letter.innerHTML = btn.small;
          if (btn.shift !== btn.small.toUpperCase()) {
            btn.sub.innerHTML = btn.shift;
          }
        }
      });
    }
    if (type === 'keydown') this.printToOutput(code, keyObj);
  };

  printToOutput(code, keyObj) {
    let cursorPos = this.output.selectionStart;
    const left = this.output.value.slice(0, cursorPos);
    const right = this.output.value.slice(cursorPos);
    const fnBtnsHandler = {
      Tab: () => {
        this.output.value = `${left}  ${right}`;
        cursorPos += 2;
      },
      Space: () => {
        this.output.value = `${left} ${right}`;
        cursorPos += 1;
      },
      Enter: () => {
        this.output.value = `${left}\n${right}`;
        cursorPos += 1;
      },
      Backspace: () => {
        this.output.value = left.slice(0, -1) + right;
        cursorPos -= 1;
      },
      Delete: () => {
        this.output.value = left + right.slice(1);
      },
      ArrowLeft: () => {
        cursorPos = cursorPos === 0 ? 0 : cursorPos - 1;
      },
      ArrowRight: () => {
        cursorPos = cursorPos === this.output.value.length
          ? this.output.value.length : cursorPos + 1;
      },
      ArrowUp: () => {
        const w = Math.floor(this.output.getBoundingClientRect().width / 11.00624942779541);
        if (cursorPos <= w) cursorPos = 0;
        else cursorPos -= w;
      },
      ArrowDown: () => {
        const w = Math.floor(this.output.getBoundingClientRect().width / 11.00624942779541);
        if (cursorPos + w <= this.output.value.length) cursorPos += w;
        else cursorPos = this.output.value.length;
      },
    };

    if (keyObj.keyDiv.dataset.fn) {
      if (fnBtnsHandler[code]) fnBtnsHandler[code]();
    } else {
      this.output.value = left + keyObj.letter.textContent + right;
      cursorPos += 1;
    }
    this.output.setSelectionRange(cursorPos, cursorPos);
  }

  switchLang = () => {
    const langsArr = Object.keys(this.langs);
    let langIndx = langsArr.indexOf(this.currentLang);
    langIndx = langIndx + 1 >= langsArr.length ? 0 : langIndx + 1;
    this.currentLang = langsArr[langIndx];
    storage.set('storageLang', langsArr[langIndx]);

    this.keyBtns.forEach((btn) => {
      const keyObj = languages[this.currentLang].find((el) => el.code === btn.code);
      btn.small = keyObj.small;
      btn.shift = keyObj.shift;
      btn.letter.innerHTML = this.isCaps ? btn.small.toUpperCase() : btn.small;
      if (btn.shift !== btn.small.toUpperCase()) {
        btn.sub.innerHTML = btn.shift;
      } else btn.sub.innerHTML = '';
    });
  };
}
