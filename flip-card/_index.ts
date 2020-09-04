import './style.css';
/**
 * readonly:
 * 선언된 프로퍼티는 생성자(constructor) 내부에서만 값을 할당할 수 있다. 
 * 그 외의 경우(메소드 등) 새로운 값으로 할당 할 수 없고, 오직 읽기만 가능하다
 */
class ElementBuilder {
  protected readonly ROOT: HTMLElement;
  constructor(public tagName: string, public properties: object = {}){
    this.ROOT = Object.assign(document.createElement(tagName), properties)
  } 
  public setStyle(obj: object){
    Object.assign(this.ROOT.style, obj);
  }
  public setClass(...className: Array<string>){
    this.ROOT.classList.add(...className);
  }
  public removeClass(...className: Array<string>){
    this.ROOT.classList.remove(...className);
  }
  public appendTo(obj: ElementBuilder | Node){
    if(obj instanceof Node) obj.appendChild(this.ROOT);
    else if (obj instanceof ElementBuilder) obj.ROOT.appendChild(this.ROOT);
  }
  public appendChild(obj: ElementBuilder | Node){
    if(obj instanceof Node) this.ROOT.appendChild(obj);
    else if (obj instanceof ElementBuilder) this.ROOT.appendChild(obj.ROOT);
  }
  public change(char : string){
    this.ROOT.innerHTML = char;
  }
  protected maskImage(url: string){
    this.ROOT.style.webkitMaskImage = `url(${url})`;
  }
  protected forceReflow(){
    this.ROOT.offsetHeight;
  }
}

class Canvas {
  protected readonly canvas: HTMLCanvasElement;
  protected readonly ctx: CanvasRenderingContext2D;

  constructor(public w: number, public h: number){
    this.canvas =  document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;  
    this.canvas.width = w;
    this.canvas.height = h;
  }
  protected drawing(){
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }
}
class Mask extends Canvas {
  constructor(public w: number, public h: number, public cw: number, public ch: number){
    super(w, h);
  }
  private top(){
    this.drawing();
    this.ctx.clearRect(0, this.h - this.ch, this.cw, this.ch)
    this.ctx.clearRect(this.w - this.cw, this.h - this.ch, this.cw, this.ch)
  }
  private bottom(){
    this.drawing();
    this.ctx.clearRect(0, 0, this.cw, this.ch)
    this.ctx.clearRect(this.w - this.cw, 0, this.cw, this.ch)
  }
  private imageURL(): Promise<HTMLImageElement>{
    return new Promise(res => {
      this.canvas.toBlob(blob => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => res(img)
        img.src = url;
      });
    });
  }
  static create(w: number, h: number, cw: number, ch: number){
    return new this(w, h, cw, ch);
  }
  static top(w: number, h: number, cw: number, ch: number): Promise<HTMLImageElement>{
    const mask = this.create(w, h, cw, ch);
    mask.top();
    return mask.imageURL();
  }
  static bottom(w: number, h: number, cw: number, ch: number): Promise<HTMLImageElement>{
    const mask = this.create(w, h, cw, ch);
    mask.bottom();
    return mask.imageURL();
  }
}
class Animate extends ElementBuilder {
  constructor(tagName: string, properties: object){
    super(tagName, properties)
  }
  protected flip(className: string, timeout: number): Promise<void>{
    return new Promise(res => {
      this.forceReflow();
      if(!this.ROOT.classList.contains(className)) this.setClass(className);
      setTimeout(() => {
        this.removeClass(className);
        res();
      }, timeout);
    })
  }
}
class CharCard extends ElementBuilder {
  constructor(p: string = '0', {height} : {height: string}){
    super('div', {});
    this.change(String(p).slice(0, 1));
    this.setClass('char');
    this.setStyle({
      height
    });
  }
  public change(char: string) {
    super.change(char);
  }
  public toBottom(){
    this.setStyle({
      top: '-100%'
    });
  }
}
class HalfCard extends ElementBuilder {
  protected readonly charCard: CharCard;
  protected readonly maskBottom: Promise<HTMLImageElement>;

  constructor(p: string, {height, maskTop, maskBottom} : {height: string, maskTop: Promise<HTMLImageElement>, maskBottom: Promise<HTMLImageElement>}){
    super('div', {});
    this.charCard = new CharCard(p, {height});
    this.charCard.appendTo(this);
    if(maskTop) maskTop.then((img: HTMLImageElement) => this.maskImage(img.src));
    this.maskBottom = maskBottom;
  }
  public toBottom(){
    this.setStyle({top : '50%'});
    this.charCard.toBottom();
    if(this.maskBottom) this.maskBottom.then((img: HTMLImageElement) => this.maskImage(img.src));
  }
  public change(char: string){
    this.charCard.change(char);
  }
}
class FlipCard extends Animate {
  private frontTop: HalfCard;
  private frontBottom: HalfCard;
  private backTop: HalfCard;
  private backBottom: HalfCard;
  constructor(public char: string, {width, height, fontSize, maskTop, maskBottom} : {
    width: string, height: string, fontSize: string, maskTop: Promise<HTMLImageElement>, maskBottom: Promise<HTMLImageElement>
  }){
    super('div', {});
    this.setClass('card');
    this.setStyle({
      width,
      height,
      fontSize
    });
    this.frontTop = new HalfCard(char, {height, maskTop, maskBottom});
    this.frontBottom = new HalfCard(char, {height, maskTop, maskBottom});
    this.backTop = new HalfCard(char, {height, maskTop, maskBottom});
    this.backBottom = new HalfCard(char, {height, maskTop, maskBottom});
  
    this.frontTop.setClass('flip', 'front-top');
    this.frontBottom.setClass('flip', 'front-bottom');
    this.backTop.setClass('flip', 'back-top');
    this.backBottom.setClass('flip', 'back-bottom');

    this.backBottom.toBottom();
    this.frontBottom.toBottom();
    this.backTop.appendTo(this)
    this.backBottom.appendTo(this)
    this.frontTop.appendTo(this)
    this.frontBottom.appendTo(this)
  }
  protected rendering(){
    console.log(this.frontTop, this.frontBottom, this.backTop, this.backBottom)
  }
  backChange(char: string) {
    this.backTop.change(char);
    this.backBottom.change(char);
  }
  frontChange(char: string) {
    this.frontTop.change(char);
    this.frontBottom.change(char);
  }
  public async change(char: string) {
    if (this.char === char) return;
    this.char = String(char).slice(0, 1);
    this.backChange(char);
    await this.flip('active', 500);
    this.frontChange(char);
  }
}
class FlipList extends Set {
  constructor(char: string, length: number, {width, height, fontSize, maskTop, maskBottom} : {
    width: string, height: string, fontSize: string, maskTop: Promise<HTMLImageElement>, maskBottom: Promise<HTMLImageElement>
  }){
    super(Array.from({length}, () => char).map(char => new FlipCard(char, {width, height, fontSize, maskTop, maskBottom})))
  }
  change(str: string){
    [...this].forEach((obj: FlipCard, i: number) => obj.change(str[i] === undefined ? ' ' : str[i]))
  }
  appendTo(el: HTMLElement){
    this.forEach((obj: FlipCard) => obj.appendTo(el));
  }
}

const fl = new FlipList('0', 3, {
  width: '210px',
  height: '260px',
  fontSize: '170px',
  maskTop: Mask.top(210, 130, 8, 25),
  maskBottom: Mask.bottom(210, 130, 8, 25)
});
fl.appendTo(document.body);

let i = Math.floor(Math.random() * 100);
setInterval(() => fl.change(String(i++).padStart(3, '0')), 1000);

// const halfCard = new HalfCard('0', { 
//   height: '100px',
//   maskTop: Mask.top(0,0,0,0),
//   maskBottom: Mask.bottom(0,0,0,0)
// })
// console.log(halfCard)

// Mask.top(210,130,8,25).then(img => document.body.appendChild(img));
// Mask.bottom(210,130,8,25).then(img => document.body.appendChild(img));

// 제네릭 타입   
// type List<T> = Array<T>
// const test : List<number> = [0,1,2,'d']

// type tuple2<T, K> = (a: T, b: K) => [T, K];
// const sum: tuple2<string, number> = (a, b) => [a, b];
// const textSum: [string, number] = sum('a', 3)
