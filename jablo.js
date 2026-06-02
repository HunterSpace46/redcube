export const abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const xmlns = "http://www.w3.org/2000/svg";

export function lerp(a, b, t, min = 0, max = 1) { return a + (b - a) * (t - min) / (max - min); }

export function random(min, max) { return Math.random() * (max - min + 1) + min; }
export function randInt(min, max) { return Math.floor(random(min, max)); }

export function newLine (point1, point2, color, thickness) {
  const p1 = point1.getBoundingClientRect();
  const p2 = point2.getBoundingClientRect();
  
  const svg = document.createElementNS(xmlns, "svg");
  const svgX = Math.min(p1.x, p2.x);
  const svgY = Math.min(p1.y, p2.y);
  svg.setAttribute("width", `${Math.max(p1.x + p2.width - svgX, p2.x + p1.width - svgX)}px`);
  svg.setAttribute("height", `${Math.max(p1.y + p2.height - svgY, p2.y + p1.height - svgY)}px`);
  
  svg.style.pointerEvents = "none";
  svg.style.position = "absolute";
  svg.style.left = `${svgX}px`;
  svg.style.top = `${svgY}px`;
  
  const line = document.createElementNS(xmlns, "line");
  line.setAttribute("x1", p1.x + p1.width / 2 - svgX);
  line.setAttribute("y1", p1.y + p1.height / 2 - svgY);
  line.setAttribute("x2", p2.x + p2.width / 2 - svgX);
  line.setAttribute("y2", p2.y + p2.height / 2 - svgY);
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", thickness);

  svg.appendChild(line);
  document.body.appendChild(svg);
  
  return {
    svg: svg,
    line: line,
    p1: p1,
    p2: p2,
    color: color,
    thickness: thickness,
    update: function (point1, point2, color, thickness) {
      const p1 = point1.getBoundingClientRect();
      const p2 = point2.getBoundingClientRect();
      
      const line = this.svg.querySelectorAll("line")[0];
      line.setAttribute("x1", p1.x + p1.width / 2);
      line.setAttribute("y1", p1.y + p1.height / 2);
      line.setAttribute("x2", p2.x + p2.width / 2);
      line.setAttribute("y2", p2.y + p2.height / 2);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", thickness);
    }
  }
}

export function get(selector, parent = document) {
  switch (selector[0]) {
    case "*":
      return parent.querySelectorAll();
    case "#":
      return parent.querySelectorAll(selector)[0];
    case ".":
      return parent.querySelectorAll(selector);
    default:
      return parent.querySelectorAll(selector);
  }
}

export function add(tag, selectors = [], parent = document.body) {
  const child = document.createElement(tag);
  if (Array.isArray(selectors)) {
    selectors.forEach(function(selector) {
      if (selector[0] == ".") child.classList.add(selector.slice(1));
      else if (selector[0] == "#") child.id = selector.slice(1);
    });
  } else {
    if (selectors[0] == ".") child.classList.add(selectors.slice(1));
    else if (selectors[0] == "#") child.id = selectors.slice(1);
  }
  parent.appendChild(child);
  return child;
}

export function shuffle(array) {
  let result = [...array];

  for (let i = array.length - 1; i > 0; i--) {
    let randomIndex = randInt(0, i);
    [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
  }
  
  return result;
}

export async function alter(element, property, value, ms = null, timeFunc = "linear") {
  const TRANSITION = element.style.transition;

  if (ms != null) element.style.transition = `all ${ms}ms ${timeFunc}`;

  if (property.startsWith("--")) element.style.setProperty(property, value);
  else element.style[property] = value;

  if (ms != null) {
    setTimeout(function() {
      element.style.transition = TRANSITION;
    }, ms);
  }
  
  return element;
}

class ElementClass {
  static get SELECTOR () { return null; }

  constructor (element, info = {}) {
    if (element.classList.contains(this.constructor.SELECTOR.slice(1))) this.element = element;
    else this.element = add("div", [this.constructor.SELECTOR], element);
    this.info = info;
  }

  get style () { return this.element.style; }

  getContents = (selector) => this.element.querySelectorAll(selector);
}

export class Btn extends ElementClass {
  static get SELECTOR () { return ".btn"; }

  constructor (element, info = {}, onClick = function () {}) {
    super(element, info);
    this.onClick = onClick.bind(this);
    this.element.addEventListener("click", this.onClick);
  }
}

export class Meter extends ElementClass {
  static get SELECTOR () { return ".meter"; }

  constructor (element, info = {}, segments = null) {
    super(element, info);
    this.segments = segments ?? this.getContents(".m-seg");
    this.segments = Array.from(this.segments).map((e, i) => new MSeg(e, i, this));
  }
}

class MSeg extends ElementClass {
  static get SELECTOR () { return ".m-seg"; }

  constructor (element, index, meter) {
    super(element);
    this.index = index;
    this.meter = meter;
  }
}
