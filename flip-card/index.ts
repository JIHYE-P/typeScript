import './style.css';
const sleep = (ms: number) : Promise<void> => new Promise(res => setTimeout(res, ms));

class Canvas {
  protected readonly canvas: HTMLCanvasElement;
  protected readonly ctx: CanvasRenderingContext2D;
  constructor(public w: number, public h: number){
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = w;
    this.canvas.height = h;
    this.drawing();
  }
  private drawing(){
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0,0, this.w, this.h)
  }
}
class MaskImage extends Canvas {
  constructor(public w: number, public h: number, public cw: number, public ch: number){
    super(w, h);
  }
  protected top(){
    this.ctx.clearRect(0, this.h-this.ch, this.cw, this.ch);
    this.ctx.clearRect(this.w-this.cw, this.h-this.ch, this.cw, this.ch);
  }
  protected bottom(){
    this.ctx.clearRect(0, 0, this.cw, this.ch);
    this.ctx.clearRect(this.w-this.cw, 0, this.cw, this.ch);
  }
  protected getImage(): Promise<HTMLImageElement>{
    return new Promise(res => {
      this.canvas.toBlob(blob => {
        const img = new Image();
        const src = URL.createObjectURL(blob);
        img.onload = () => res(img);
        img.src = src;
      });
    })
  }
  static createMask(w: number, h: number, cw: number, ch: number){
    return new MaskImage(w,h,cw,ch);
  }
  static top(w: number, h: number, cw: number, ch: number){
    const mask = this.createMask(w,h,cw,ch);
    mask.top();
    return mask.getImage();
  }
  static bottom(w: number, h: number, cw: number, ch: number){
    const mask = this.createMask(w,h,cw,ch);
    mask.bottom();
    return mask.getImage();
  }
}
type CSSStylePartial = Partial<Record<keyof CSSStyleDeclaration, unknown>>
type HTMLProperties<T> = Partial<{[K in keyof T]: K extends 'style' ? CSSStylePartial : T[K]}>

class ElementBuilder<K extends keyof HTMLElementTagNameMap> {
  protected readonly root: HTMLElementTagNameMap[K];
  constructor(public tagName: K, public properties?: HTMLProperties<HTMLElement>){
    this.root = Object.assign(document.createElement(tagName), properties)
  } 
  public setStyle(obj: object){
    Object.assign(this.root.style, obj);
  }
  public setClass(...className: string[]){
    this.root.classList.add(...className);
  }
  public removeClass(...className: string[]){
    this.root.classList.remove(...className);
  }
  public appendTo(obj: ElementBuilder<K> | Node) : this {
    if(obj instanceof Node) obj.appendChild(this.root);
    else if (obj instanceof ElementBuilder) obj.root.appendChild(this.root);
    return this;
  }
  public change(char : string){
    this.root.innerHTML = char;
  }
  protected forceReflow(){
    this.root.offsetHeight;
  }
}
class CharCard extends ElementBuilder<'div'> {
  constructor(char: string, {height}: {height: number}){
    super('div');
    this.setClass('char');
    this.change(String(char).slice(0, 1));
    this.setStyle({
      height: `${height}px`
    });
  }
}
class FlipAnimate extends ElementBuilder<'div'> {
  constructor(){
    super('div');
  }
  protected flipAction(className: string, timeout: number) : Promise<void> {
    return new Promise(res => {
      this.forceReflow();
      if(!this.root.classList.contains(className)) this.setClass(className);
      setTimeout(() => {
        this.removeClass(className);
        res();
      }, timeout);
    })
  }
}
class HalfCard extends ElementBuilder<'div'> {
  private readonly charCard: CharCard;
  private readonly maskTopImg: Promise<HTMLImageElement>
  private readonly maskBottomImg: Promise<HTMLImageElement>
  constructor(char: string, className: string, {width, height}: {width: number, height: number}, {maskCW, maskCH}: {maskCW: number, maskCH: number}){
    super('div');
    this.setClass('half', className);
    
    this.charCard = new CharCard(char, {height});
    this.charCard.appendTo(this);

    this.maskTopImg = MaskImage.top(width, height/2, maskCW, maskCH);
    this.maskBottomImg = MaskImage.bottom(width, height/2, maskCW, maskCH);
  }
  public setMaskTop(){
    this.maskTopImg.then((img: HTMLImageElement) => this.root.style.webkitMaskImage = `url(${img.src})`);
  }
  public setMaskBottom(){
    this.maskBottomImg.then((img: HTMLImageElement) => this.root.style.webkitMaskImage = `url(${img.src})`);
  }
  public change(char: string){
    this.charCard.change(char);
  }
}
class FlipCard extends FlipAnimate {
  private readonly frontTop: HalfCard;
  private readonly frontBottom: HalfCard;
  private readonly backTop: HalfCard;
  private readonly backBottom: HalfCard;
  private char: string;
  constructor(char: string, {width, height, fontSize} : {width: number, height: number, fontSize: number}, {maskCW, maskCH}: {maskCW: number, maskCH: number}){
    super();
    this.setStyle({
      width: `${width}px`,
      height: `${height}px`,
      fontSize: `${fontSize}px`
    });
    this.setClass('card');
    this.frontTop = new HalfCard(char, 'front-top', {width, height}, {maskCW, maskCH});
    this.frontBottom = new HalfCard(char, 'front-bottom', {width, height}, {maskCW, maskCH});
    this.backTop = new HalfCard(char, 'back-top', {width, height}, {maskCW, maskCH});
    this.backBottom = new HalfCard(char, 'back-bottom', {width, height}, {maskCW, maskCH});

    this.backBottom.setMaskBottom();
    this.frontBottom.setMaskBottom();
    this.backTop.setMaskTop();
    this.frontTop.setMaskTop();

    this.backTop.appendTo(this);
    this.backBottom.appendTo(this);
    this.frontTop.appendTo(this);
    this.frontBottom.appendTo(this);
    
    this.char = char;
  }
  private frontChange(char: string){
    this.frontTop.change(char);
    this.frontBottom.change(char);
  }
  private backChange(char: string){
    this.backTop.change(char);
    this.backBottom.change(char);
  }
  public async change(char: string){
    if(this.char === char) return;
    this.char = String(char).slice(0, 1);
    this.backChange(char);
    await this.flipAction('active', 500);
    this.frontChange(char);
  }
}
class FlipList extends Set {
  constructor(length: number, char: string, 
    {width, height, fontSize} : {width: number, height: number, fontSize: number}, 
    {maskCW, maskCH}: {maskCW: number, maskCH: number})
  {
    super(Array.from({length}, () => char).map((char: string) => new FlipCard(char, {width, height, fontSize}, {maskCW, maskCH})));
  }
  public change(str: string){
    [...this].forEach((el: FlipCard, i: number) => el.change(str[i] === undefined ? ' ' : str[i]));
  }
  public appendTo(parent: HTMLElement){
    this.forEach((el: FlipCard) => el.appendTo(parent));
  }
}
const flipList = new FlipList(2, '0', {
  width: 180,
  height: 220,
  fontSize: 130
}, {
  maskCW: 8,
  maskCH: 22
});
flipList.appendTo(document.body);
let i = Math.floor(Math.random() * 10);
setInterval(() => flipList.change(String(i++).padStart(2, '0')), 1000);
