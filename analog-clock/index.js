import { sleep } from '@/utils/index';
console.log(sleep);
class ElementBuilder {
    constructor(tagName) {
        this.tagName = tagName;
        this.root = document.createElement(tagName);
    }
    setStyle(style) {
        Object.assign(this.root.style, style);
    }
    setClass(...className) {
        this.root.classList.add(...className);
    }
    removeClass(...className) {
        this.root.classList.remove(...className);
    }
    change(char) {
        this.root.innerHTML = char;
    }
    appendTo(el) {
        if (el instanceof Node)
            el.appendChild(this.root);
        else if (el instanceof ElementBuilder)
            el.root.appendChild(this.root);
        return this;
    }
    appendChild(el) {
        if (el instanceof Node)
            this.root.appendChild(el);
        else if (el instanceof ElementBuilder)
            this.root.appendChild(el.root);
    }
}
class ClockNeedle extends ElementBuilder {
    constructor(className, { width, height, background }) {
        super('div');
        this.setClass(className);
        this.setStyle({
            width: width,
            height: height,
            background: background
        });
    }
    rotating(deg) {
        this.setStyle({
            transform: `translate(-50%, 0) rotate(${deg}deg)`,
        });
    }
}
class ClockFactory extends ElementBuilder {
    static frame(tagName, { width, fontSize }) {
        const el = new ClockFactory(tagName);
        el.setClass('frame');
        el.setStyle({
            width: `${width}px`,
            height: `${width}px`,
            fontSize: `${fontSize}px`,
            borderRadius: '50%'
        });
        return el;
    }
    static number(tagName, char) {
        const el = new ClockFactory(tagName);
        el.setClass('number');
        el.change(char);
        return el;
    }
    static gradation(tagName) {
        const el = new ClockFactory(tagName);
        el.setClass('gradation');
        return el;
    }
    static hours(tagName) {
        const el = new ClockFactory(tagName);
        el.setClass('hours');
        return el;
    }
    static minute(tagName) {
        const el = new ClockFactory(tagName);
        el.setClass('minute');
        return el;
    }
    static second(tagName) {
        const el = new ClockFactory(tagName);
        el.setClass('second');
        return el;
    }
    static needle(className, { width, height, background }) {
        const el = new ClockNeedle(className, { width, height, background });
        return el;
    }
}
class AnalogClock {
    constructor({ width, fontSize, line }) {
        this.frameRadius = 0;
        this.frameRadius = width / 2;
        this.frame = ClockFactory.frame('div', { width, fontSize });
        this.number = Array.from({ length: 12 }, (_, i) => i + 1).map((char, i) => {
            const deg = (360 / 12) * (i + 1);
            const x = (this.frameRadius - fontSize - line) * Math.cos(Math.PI * (deg - 90) / 180);
            const y = (this.frameRadius - fontSize - line) * Math.sin(Math.PI * (deg - 90) / 180);
            const number = ClockFactory.number('div', String(char));
            number.setStyle({
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
            });
            return number;
        });
        this.gradation = Array.from({ length: 60 }, (_, i) => i).map((v) => {
            const deg = (360 / 60) * v;
            const x = (this.frameRadius - line) * Math.cos(Math.PI * (deg - 90) / 180);
            const y = (this.frameRadius - line) * Math.sin(Math.PI * (deg - 90) / 180);
            const gradation = ClockFactory.gradation('div');
            gradation.setStyle({
                height: `${line}px`,
                width: v % 5 === 0 ? '3px' : '1px',
                background: v % 5 === 0 ? '#f4eed7' : '#4b9aaa',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${deg}deg)`
            });
            return gradation;
        });
        this.hours = ClockFactory.needle('hours', { width: '3px', height: `${this.frameRadius - 80}px`, background: '#f4eed7' }).appendTo(this.frame);
        this.minute = ClockFactory.needle('minute', { width: '3px', height: `${this.frameRadius - 45}px`, background: '#f4eed7' }).appendTo(this.frame);
        this.second = ClockFactory.needle('second', { width: '1px', height: `${this.frameRadius}px`, background: '#4b9aaa' }).appendTo(this.frame);
        this.number.forEach((el) => el.appendTo(this.frame));
        this.gradation.forEach((el) => el.appendTo(this.frame));
    }
    clockhandler() {
        const now = new Date();
        const h = now.getHours() * 30;
        const m = now.getMinutes() * 6;
        const s = now.getSeconds() * 6;
        const ms = now.getMilliseconds() * (6 / 1000);
        this.hours.rotating(h + (m / 360) * (360 / 12));
        this.minute.rotating(m + (s / 360) * (360 / 60));
        this.second.rotating(ms + s);
    }
    rendering(parent) {
        this.frame.appendTo(parent);
        setInterval(() => this.clockhandler(), 1000);
        this.clockhandler();
    }
}
const analogClock = new AnalogClock({
    width: 450,
    fontSize: 30,
    line: 10
});
analogClock.rendering(document.body);
