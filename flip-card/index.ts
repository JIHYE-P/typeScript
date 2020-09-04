import './main.css';
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
  public appendTo(obj: ElementBuilder | Node) : this {
    if(obj instanceof Node) obj.appendChild(this.ROOT);
    else if (obj instanceof ElementBuilder) obj.ROOT.appendChild(this.ROOT);
    return this;
  }
  public change(char : string){
    this.ROOT.innerHTML = char;
  }
  protected forceReflow(){
    this.ROOT.offsetHeight;
  }
}
class CardFactroy extends ElementBuilder {
  static charCard({height}: {height: string}){
    const card = new CharCard({height});
    return card;
  }
  static halfCard(className: string, {height}: {height: string}){
    const half = new HalfCard(className, {height});
    return half;
  }
}
class CharCard extends ElementBuilder {
  constructor({height}: {height: string}){
    super('div');
    this.setStyle({
      height
    });
    this.setClass('char');
  } 
}
class HalfCard extends ElementBuilder {
  private readonly charCard: CharCard;
  constructor(className: string, {height}: {height: string}){
    super('div');
    this.setStyle({
      height
    });
    this.setClass('half', className);
    this.charCard = new CharCard({height})
    this.charCard.appendTo(this);
  }
}
class FlipCard extends ElementBuilder {
  private readonly frontTop: CardFactroy;
  private readonly frontBottom: CardFactroy;
  private readonly backTop: CardFactroy;
  private readonly backBottom: CardFactroy;
  constructor({width, height, fontSize} : {width: string, height: string, fontSize: string}){
    super('div');
    this.setStyle({
      width,
      height,
      fontSize
    });
    this.setClass('card');
    this.frontTop = CardFactroy.halfCard('front-top', {height})
    this.frontBottom = CardFactroy.halfCard('front-bottom', {height})
    this.backTop = CardFactroy.halfCard('back-top', {height})
    this.backBottom = CardFactroy.halfCard('back-bottom', {height})

    this.backTop.appendTo(this);
    this.backBottom.appendTo(this);
    this.frontTop.appendTo(this);
    this.frontBottom.appendTo(this);
  }
  frontChange(char: string){
    this.frontTop.change(char);
    this.frontBottom.change(char);
  }
}

class FlipList extends Set {
  constructor(length: number, {width, height, fontSize} : {width: string, height: string, fontSize: string}){
    super(Array.from({length}, (_, i) => i).map(() => new FlipCard({width, height, fontSize})));
  }
  public appendTo(parent: HTMLElement){
    this.forEach((el: FlipCard) => el.appendTo(parent));
  }
}
const flipList = new FlipList(4, {
  width: '200px',
  height: '200px',
  fontSize: '15px'
});
flipList.appendTo(document.body)