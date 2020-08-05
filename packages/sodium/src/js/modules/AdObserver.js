// @ts-check
/** 広告の表示状態が変わったタイミングで発報されるイベント */
export class AdEvent extends Event {
  constructor({ showing, playPos }) {
    super("ad");
    /** @type {boolean} 広告表示中か否か (広告表示中: true、通常再生中: それ以外) */
    this.showing = showing;
    /** @type {number} 再生位置 */
    this.playPos = playPos;
    /** @type {number} UNIXエポック (ミリ秒) */
    this.dateTime = Date.now();
  }
}

export class AdObserver extends EventTarget {
  /**
   * @param {(
   *  | import("./GeneralTypeHandler").default
   *  | import("./YouTubeTypeHandler").default
   * )} handler
   * @param {Node} target
   * @param {string[]} attributeFilter
   */
  constructor(handler, target, attributeFilter = ["class"]) {
    super();
    this.listeners = new Set();
    /** @type {boolean} 広告表示中か否か (広告表示中: true、通常再生中: それ以外) */
    this.showing = false;
    const observer = new MutationObserver(() => {
      const showing = handler.is_cm();
      if (this.showing === showing) return;
      this.showing = showing;
      const event = new AdEvent({
        showing,
        playPos: handler.get_current_time(),
      });
      this.dispatchEvent(event);
    });
    observer.observe(target, { attributeFilter });
  }

  on(listener) {
    this.addEventListener("ad", listener);
  }

  off(listener) {
    this.removeEventListener("ad", listener);
  }

  removeAllListeners() {
    this.listeners.forEach(this.off, this);
  }

  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
    this.listeners.add(listener);
  }

  removeEventListener(type, listener, options) {
    super.removeEventListener(type, listener, options);
    this.listeners.delete(listener);
  }
}
