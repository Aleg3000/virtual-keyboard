function set(name, value) {
  window.localStorage.setItem(name, JSON.stringify(value));
}

function get(name, substr = null) {
  return JSON.parse(window.localStorage.getItem(name) || substr);
}

function del(name) {
  localStorage.removeItem(name);
}

export { set, get, del };
