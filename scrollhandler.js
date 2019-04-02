// how use:
// import ScrollHandler then
// const scrollHandler = new ScrollHandler(
//   nextSlide,
//   prevSlide
// );
// nextSlide = () => {
// do something
// }
// 
// prevSlide = () => {
//  do something
// }


import {Lethargy} from 'lethargy';
import {throttle, debounce} from 'throttle-debounce';

let lethargy = new Lethargy();

export default class ScrollHandler {
  touchStartY = 0;
  touchStartX = 0;
  touchEndY = 0;
  touchEndX = 0;

  mode = 'v';
  isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/);
  isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints));

  container = document.body;

  disabled = false;


  //mode: 'v' — vertical, 'h' — horizontal
  constructor(moveNextAction, movePrevAction, mode = 'h') {
    this['next'] = moveNextAction;
    this['prev'] = movePrevAction;
    this.mode = mode;

    this.move = throttle(200, this.move, true);
    this.handleTouchMove = debounce(100, this.handleTouchMove);

    this.createScrollListener();
    this.addTouchHandler();
  }

  move(direction) {
    this[direction]();
  }

  destroy() {
    this.destroyScrollListener();
    this.removeTouchHandler();
  }

  scrollHandler = e => {
    // this.preventDefault(e); // Unable to preventDefault inside passive event listener due to target being treated as passive.
    if (this.disabled)
      return;

    if (process.browser)
      e = e || window.event;

    let scrollInfo = lethargy.check(e);
    if (scrollInfo != false) {
      if (scrollInfo === -1)
        this.move('next');
      else
        this.move('prev');
    }
  };

  createScrollListener () {
    let elem = this.container;
    if (elem.addEventListener) {
      if ('onScroll' in document)
        return elem.addEventListener("wheel", this.scrollHandler);
      else if ('onmousewheel' in document)
        return elem.addEventListener("mousewheel", this.scrollHandler);
      else
        return elem.addEventListener("MozMousePixelScroll", this.scrollHandler);

    } else {
      return elem.attachEvent("onmousewheel", this.scrollHandler);
    }
  }

  destroyScrollListener () {
    let elem = this.container;
    if (elem.removeEventListener) {
      if ('onScroll' in document)
        return elem.removeEventListener("wheel", this.scrollHandler);
      else if ('onmousewheel' in document)
        return elem.removeEventListener("mousewheel", this.scrollHandler);
      else
        return elem.removeEventListener("MozMousePixelScroll", this.scrollHandler);

    } else {
      return elem.detachEvent("onmousewheel", this.scrollHandler);
    }
  }

  handleTouchMove(e) {
    let touchEvents = this.getEventsPage(e);
    this.touchEndY = touchEvents.y;
    this.touchEndX = touchEvents.x;

    let dX = Math.abs(this.touchStartX - this.touchEndX);
    let dY = Math.abs(this.touchStartY - this.touchEndY);

    if (this.mode == 'h') {
      let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (dX > dY && dX > (w / 100) * 5) {
        if (this.touchStartX > this.touchEndX)
          this.move('next');
        else
          this.move('prev');
      }
    } else {
      let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      if (dX < dY && dY > (h / 100) * 5) {
        if (this.touchStartY > this.touchEndY)
          this.move('next');
        else
          this.move('prev');
      }
    }
  }

  isReallyTouch(e) {
    return typeof e.pointerType === 'undefined' || e.pointerType !== 'mouse';
  }

  touchStartHandler = event => {
    if (this.disabled)
      return;

    let e = event || window.event || e || e.originalEvent;
    if (this.isReallyTouch(e)) {
      let touchEvents = this.getEventsPage(e);
      this.touchStartY = touchEvents.y;
      this.touchStartX = touchEvents.x;
    }
  };

  touchMoveHandler = event => {
    let e = event || window.event || e || e.originalEvent;
    this.preventDefault(e);
    if (this.isReallyTouch(e)) {
      this.preventDefault(e);
      return this.handleTouchMove(e);
    }
  };


  addTouchHandler() {
    if (this.isTouchDevice || this.isTouch) {
      let wrapper = this.container;
      if (document.addEventListener) {
        let MSPointer = this.getMSPointer();
        wrapper.removeEventListener('touchstart', this.touchStartHandler);
        wrapper.removeEventListener(MSPointer.down, this.touchStartHandler);
        wrapper.removeEventListener('touchmove', this.touchMoveHandler);
        wrapper.removeEventListener(MSPointer.move, this.touchMoveHandler);
        this.addListenerMulti(wrapper, `touchstart ${MSPointer.down}`, this.touchStartHandler);
        this.addListenerMulti(wrapper, `touchmove ${MSPointer.move}`, this.touchMoveHandler);
      }
    }
  }

  removeTouchHandler() {
    if (this.isTouchDevice || this.isTouch) {
      let wrapper = this.container;
      if (document.addEventListener) {
        let MSPointer = this.getMSPointer();
        wrapper.removeEventListener('touchstart', this.touchStartHandler);
        wrapper.removeEventListener(MSPointer.down, this.touchStartHandler);
        wrapper.removeEventListener('touchmove', this.touchMoveHandler);
        wrapper.removeEventListener(MSPointer.move, this.touchMoveHandler);
        this.removeListenerMulti(wrapper, `touchstart ${MSPointer.down}`, this.touchStartHandler);
        this.removeListenerMulti(wrapper, `touchmove ${MSPointer.move}`, this.touchMoveHandler);
      }
    }
  }

  getMSPointer() {
    let pointer = undefined;
    if (window.PointerEvent) {
      pointer = {
        down: 'pointerdown',
        move: 'pointermove'
      };
    } else {
      pointer = {
        down: 'MSPointerDown',
        move: 'MSPointerMove'
      };
    }
    return pointer;
  }

  addListenerMulti(el, s, fn) {
    let evts = s.split(' ');
    let i = 0;
    let iLen = evts.length;
    while (i < iLen) {
      if (document.addEventListener)
        el.addEventListener(evts[i], fn, false);
      else
        el.attachEvent(evts[i], fn, false);

      //IE 6/7/8
      i++;
    }
  }

  removeListenerMulti(el, s, fn) {
    let evts = s.split(' ');
    let i = 0;
    let iLen = evts.length;
    while (i < iLen) {
      if (document.addEventListener)
        el.removeEventListener(evts[i], fn, false);
      else
        el.deattachEvent(evts[i], fn, false);

      //IE 6/7/8
      i++;
    }
  }

  getEventsPage(e) {
    let events = [];
    events.y = typeof e.pageY !== 'undefined' && (e.pageY || e.pageX) ? e.pageY : e.touches[0].pageY;
    events.x = typeof e.pageX !== 'undefined' && (e.pageY || e.pageX) ? e.pageX : e.touches[0].pageX;
    if (this.isTouch && this.isReallyTouch(e) && !!e.touches) {
      events.y = e.touches[0].pageY;
      events.x = e.touches[0].pageX;
    }
    return events;
  }

  preventDefault(event) {
    if (event.preventDefault)
      return event.preventDefault();
    return event.returnValue = false;
  }

}