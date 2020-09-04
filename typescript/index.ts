function greeter(person: string){
  return `Hello, ${person}`
}
const user = 'Jane User';

// 인터페이스 inerfaces
interface Person {
  firstName: string;
  lastName: string;
}
function greeter1(person: Person){
  return `Hello, ${person.firstName} ${person.lastName}`;
}
const user1 = {firstName: 'Park', lastName: 'jihye'}

// 클래스 classes
/**
 * 접근 제어자
 * public: default, 어디에서나 접근가능
 * protected: 상속받은 하위클래스에서만 접근가능
 * private: 선언한 클래스 내에서만 접근가능
 */
class Student {
  fullName: string
  constructor(public firstName: string, public middleInitial: string, public lastName: string){
    this.fullName = `${firstName} ${middleInitial} ${lastName}`;
  }
}
interface Person {
  firstName: string;
  middleInitial: string;
  lastName: string;
}
function greeter2(person: Person){
  return `Hello~~ ${person.firstName} ${person.lastName} ${person.middleInitial}`;
}
const user2 = new Student('park', 'W.', 'jihye');
document.body.textContent = greeter2(user2);

// const list : number[] = [1,2,3] , const list : Array<number> = [1,2,3]

/**
 * 열거 (Enum)
 */

// enum Color {Red, Green, Blue, Pink}
//enum Color {Red = 1, Green, Blue, Pink}
enum Color {Red = 1, Green = 7, Blue = 4, Pink = 6}
const c: Color = Color.Green;
const colorName: string = Color[7]
console.log(c, colorName);

function warnUser(): void {
  console.log('void: 어떤 타입도 존재할 수 없음, 함수에서 반환 값이 없을 때 한번 타입을 표현하기 위해 사용');
}

/**
 * never : 절대 발생할 수 없는 타입, 함수에서 항상 오류를 발생시키거나, 절대 반환하지 않는 타입
 */
function error(message: string): never {
  throw new Error(message);
}

/**
 * Object: number, string, boolean, bigint, symbol, null, undefind가 아닌 나머지 타입을 뜻함
 */

// declare: 컴파일러에게 해당 변수가 어딘가에 선언되어 있다고 알려주는 행위
declare function create(o: object | null) : void;
// console.log(create({props: 0}));
// console.log(create(null));
// console.log(create('string')); // error
// console.log(create(100)); // error
// console.log(create(false)); // error

/**
 * 타입 단언 Type assertions
 */
// 1. angle-bracket
const someValue: any = 'This is a string';
const strLength: number = (<string>someValue).length;
console.log(strLength);
// 2. as
const someValue1: any = 'This is a string';
const strLength1: number = (someValue as string).length;
console.log(strLength);

/**
 * Interface 인터페이스
 */
function printLabel(labeledObj: {label: string}){
  console.log(labeledObj.label);
}
const obj = {size: 10, label: 'Size 10 Object'};
printLabel(obj);


interface PrintLabel {
  size: number;
  label: string;
}
function printLableInterface(labeledObj: PrintLabel){
  console.log('interface', labeledObj.label)
}
const interfaceObj = {size: 10, label: 'Size 10 Object'}
printLableInterface(interfaceObj);

/**
 * 선택적 프로퍼티 Optional Properties
 */
interface SquareConfig {
  color?: string;
  width?: number;
}
function createSquare(config: SquareConfig) : {color: string, area: number} {
  let newSquare = {color: 'black', area: 100}
  if(config.color) newSquare.color = config.color
  if(config.width) newSquare.area = config.width
  return newSquare;
}
// const mySquare = createSquare({color: 'white', width: 200});
const mySquare = createSquare({color: 'white'});
console.log(mySquare);

interface SquareConfigExcess {
  color?: string;
  width?: number;
  [propName: string]: any;
}

/**
 * 함수 타입 (Function Types)
 * 리턴값 타입이 인터페이스에 정의된 타입과 일치하지 않으면 에러 발생
 */

interface SearchFunc {
  (source: string, subString: string) : boolean // return boolean
}
const searchFunc: SearchFunc = function(src: string, sub: string){
  const result = src.search(sub);
  return result > -1;
}
console.log('Function Types: ', searchFunc('This is Function Types', 'Types'));

/**
 * 인텍서블 타입 (Indexable Types)
 */
interface StringArray {
  [index: number]: string;
}
const myArray : StringArray = ['Bob', 'Fred'];
console.log('Indexable Types: ', myArray[0]);

/**
 * 클래스 타입 (Class Types) 
 * 특정 계약(contract)을 충족시키도록 명시적으로 강제하는 C#과 Java와 같은 언어에서 인터페이스를 사용하는 가장 일반적인 방법
 */

/**
  * 함수 타입 (Function Types)
  * 함수의 타입은 매개변수의 타입과 반환 타입
  */
// 1. 함수 타입 작성하기 (Writing the function type)
function add(x: number, y: number) : number {
  return x+y;
}
const myAdd: (x: number, y: number) => number = function(x, y) : number {return x+y}
console.log(myAdd(5,10))

// 2. 기본 매개변수 (Default Parameter)
function defaultParams(first: string, last: string) {
  return `${first} ${last}`;
}
console.log('Default Parameter:', defaultParams('park', 'jihye'));
// console.log('Default Parameter:', defaultParams('jihye')); error

// 2-1. 선택적 매개변수 (Optional Parameter)
function optionalParams(first: string, last?: string){
  if(last) return `Optional: ${first} ${last}`;
  else return `${first}`;
}
console.log('Optional Parameter:', optionalParams('park', 'jihye'));
console.log('Optional Parameter:', optionalParams('jihye'));

// 2-2 기본 초기화 매개변수 (초기화 매개변수가 필수 매개변수보다 앞에 오게 된다면 사용자가 명시적으로 undefined 를 전달해 주어야 기본-초기화 매개변수를 볼 수 있다)
function initialParams(first: string, last = 'jihye'){
  return `${first} ${last}`;
}
console.log('Initial Parameter:', initialParams('park'));

// 2-3 나머지 매개변수 (Rest Parameter)
function restParams(first: string, ...restOfName: Array<string>){
  return `${first} ${restOfName.join(' ')}`
}
console.log('Rest Parameter: ', restParams("Joseph", "Samuel", "Lucas", "MacKinzie"));
const restParamsFunc: (name: string, ...rest: Array<string>) => string = restParams;
console.log(restParamsFunc("Joseph", "Samuel", "Lucas", "MacKinzie"));

/**
 * Generic type 제네릭 타입
 * T는 제네릭을 선언 할 떄 관용적으로 사용되는 식별자로 타입 파라미터 (type parameter)라 한다. 
 */

// 1. class
class Queue<T> {
  protected data: Array<T> = [];
  push(item: T){
    this.data.push(item);
  }
  pop() {
    return this.data.shift();
  }
}

const numberQueue = new Queue<number>();
numberQueue.push(0);

const stringQueue = new Queue<string>();
stringQueue.push('hello');

const objectQueue = new Queue<{name: string, age: number}>();
objectQueue.push({name: 'Queue', age: 20});

// 2. 함수 인수의 타입에 의해 타입 매개변수 결정
function reverse<T>(item: T[]) : T[] {
  return item.reverse();
}
const number = [1,2,3,4,5]
console.log('reverse number:', reverse(number));

const object = [{name: 'Lee'}, {name: 'Kim'}]
console.log('reverse object:', reverse(object));

type List<T> = Array<T>
const numberList : List<number> = [0,1,2,3]

function anyList<T>(item: Array<T>) : Array<T> {
  return item;
}
console.log(anyList<number>([0,1,2]))
console.log(anyList<string>(['0','1','2']))
console.log(anyList<boolean>([true, true, false]))
console.log(anyList<object>([{number: 1, string: 'Hello'}]));

// const tuple: Array<T, K> = (a: T, b: K) => [a, b] // error
type tuple2<T, K> = (a: T, b: K) => [T, K];
const sum: tuple2<string, number> = (a, b) => [a, b];
const textSum: [string, number] = sum('a', 3)

