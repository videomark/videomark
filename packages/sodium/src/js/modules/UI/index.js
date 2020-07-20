import Config from "../Config";
import Status from "./Status";

/**
 *
 */
export default class UI {
  /**
   * @param {string} target CSS selector string
   * @param {string} style CSS
   * @param {(fadein: boolean) => void} ovserve コントローラーを監視して表示/非表示を切り替える
   */
  constructor(target, style, ovserve) {
    this.target = target;
    this.style = style;
    this.ovserve = ovserve;

    // Inserted element
    this.element = null;
    this.status = new Status();
  }

  update_status(status) {
    if (!this.element) {
      this.insert_element();
    }
    this.status.update(status);
  }

  remove_element() {
    if (this.element) {
      this.status.detach();
      this.element.remove();
      this.element = null;
    }
  }

  insert_element() {
    const target =
      this.target == null /* デフォルト: videoタグの親 */
        ? (document.querySelector("video") || {}).parentNode
        : document.querySelector(this.target);
    if (target == null) {
      console.error(
        `VIDEOMARK: No element found matching query string "${this.target}"`
      );
      return;
    }

    const e = name => (childlen = []) => {
      const element = document.createElement(name);
      childlen.forEach(c => element.append(c));
      return element;
    };
    const bound = target.getBoundingClientRect();
    const minTop = bound.top + bound.height;
    const style = e("style")([Config.isMobile() ? `#${Config.get_ui_id()} {
  position: fixed;
  width: 100%;
  top: ${minTop}px;
  z-index: 1000001;
}` : this.style]);
    document.head.appendChild(style);

    this.element = e("div")();
    this.element.id = Config.get_ui_id();
    if (Config.isMobile()) {
      const getPageY = e => {
        return e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
      };
      const mousedown = e => {
        e.preventDefault();
        this.element.setAttribute("inittop", getPageY(e) - this.element.offsetTop);
        document.body.addEventListener("mousemove", mousemove, false);
        document.body.addEventListener("touchmove", mousemove, false);

        document.body.addEventListener("mouseup", mouseup, false);
        document.body.addEventListener("mouseleave", mouseup, false);
        document.body.addEventListener("touchend", mouseup, false);
        document.body.addEventListener("touchleave", mouseup, false);
      };
      const mousemove = e => {
        e.preventDefault();
        this.element.style.top = Math.max(getPageY(e) - Number.parseInt(this.element.getAttribute("inittop")), minTop) + "px";
      };
      const mouseup = e => {
        e.preventDefault();
        document.body.removeEventListener("mousemove", mousemove, false);
        document.body.removeEventListener("touchmove", mousemove, false);

        document.body.removeEventListener("mouseup", mouseup, false);
        document.body.removeEventListener("mouseleave", mouseup, false);
        document.body.removeEventListener("touchend", mouseup, false);
        document.body.removeEventListener("touchleave", mouseup, false);
      };
      this.element.addEventListener("mousedown", mousedown, false);
      this.element.addEventListener("touchstart", mousedown, false);
    }
    this.element.attachShadow({ mode: "open" });
    this.status.attach(this.element.shadowRoot);
    (Config.isMobile() ? document.querySelector("body") : target).appendChild(this.element);

    if (this.ovserve != null) {
      this.ovserve((fadein) /* 引数を.fadeinの有無として反映 */ => {
        if (fadein) this.element.classList.add("fadein");
        else this.element.classList.remove("fadein");
      });
    }
  }
}
