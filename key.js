const fnKey = ['Backspace', 'Tab', 'CapsLock', 'Enter', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'Space', 'Delete', 'MetaLeft', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

const keySizes = {
  basic: '--basic-key-width',
  Backspace: 2.14,
  Tab: 1.09,
  CapsLock: 1.6,
  Enter: 2.62,
  Shift: 2.11,
  Space: 7.35,
  Ctrl: 1.05,
};

function create(elem, elemClass, textContent, code, isFnKey) {
  const el = document.createElement(elem);
  el.className = elemClass;
  if (Array.isArray(textContent)) {
    textContent.forEach((child) => el.appendChild(child));
  } else el.innerHTML = textContent;
  if (code) el.dataset.code = code;
  if (isFnKey) el.dataset.fn = isFnKey;
  return el;
}

export default class Key {
  constructor({ small, shift, code }) {
    this.code = code;
    this.small = small;
    this.shift = shift;
    this.isFnKey = fnKey.includes(code);
    if (shift !== small.toUpperCase()) {
      this.sub = create('div', 'sub', shift, code);
    } else this.sub = create('div', 'sub', '', code);
    this.letter = create('div', 'text', small);
    this.keyDiv = create('div', 'key', [this.sub, this.letter], code, this.isFnKey);
    this.keyDiv.style.width = `calc(var(${keySizes.basic}) * ${keySizes[small] || 1})`;
  }
}
