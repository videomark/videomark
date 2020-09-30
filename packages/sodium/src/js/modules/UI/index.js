import Config from "../Config";
import Status from "./Status";

/**
 *
 */
export default class UI {
  /**
   * @param {string} target CSS selector string
   * @param {string} style CSS
   */
  constructor(target, style) {
    this.target = target;
    this.style = style;

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

    Config.isMobileScreen() ? this.insert_element_mobile(target) : this.insert_element_desktop(target);
  }

  init_element(style) {
    const prevstyle = document.head.querySelector(`#${Config.get_ui_style_id()}`)
    if (prevstyle) document.head.removeChild(prevstyle);

    const e = name => (childlen = []) => {
      const element = document.createElement(name);
      childlen.forEach(c => element.append(c));
      return element;
    };

    const style_tag = e("style")([style]);
    style_tag.id = Config.get_ui_style_id();
    document.head.appendChild(style_tag);

    this.element = e("div")();
    this.element.id = Config.get_ui_id();
    this.element.attachShadow({ mode: "open" });
    this.status.attach(this.element.shadowRoot);
  }

  insert_element_desktop(target) {
    this.init_element(this.style);
    target.appendChild(this.element);
  }

  insert_element_mobile(target) {
    const getMinTop = target => {
      if (target.clientHeight > target.clientWidth) {
        return target.clientHeight * 2 / 3; // 画面下1/3の範囲でスライド可能。主にamazonをandroid縦向きで見るとき
      } else {
        const bound = target.getBoundingClientRect();
        return bound.top + bound.height;
      }
    };
    const minTop = getMinTop(target);

    this.init_element(`#${Config.get_ui_id()} {
  position: fixed;
  width: 100%;
  top: ${minTop}px;
  z-index: 1000001;
}`);

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
    };
    const mousemove = e => {
      e.preventDefault();
      let top = Math.max(getPageY(e) - Number.parseInt(this.element.getAttribute("inittop")), minTop);
      top = Math.min(window.innerHeight - this.element.clientHeight, top);
      this.element.style.top = top + "px";
    };
    const mouseup = e => {
      e.preventDefault();
      document.body.removeEventListener("mousemove", mousemove, false);
      document.body.removeEventListener("touchmove", mousemove, false);

      document.body.removeEventListener("mouseup", mouseup, false);
      document.body.removeEventListener("mouseleave", mouseup, false);
      document.body.removeEventListener("touchend", mouseup, false);
    };
    this.element.addEventListener("mousedown", mousedown, false);
    this.element.addEventListener("touchstart", mousedown, false);

    document.body.appendChild(this.element);
  }
}
