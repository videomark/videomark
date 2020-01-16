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
    const style = e("style")([this.style]);
    document.head.appendChild(style);

    this.element = e("div")();
    this.element.id = Config.get_ui_id();
    this.element.attachShadow({ mode: "open" });
    this.status.attach(this.element.shadowRoot);
    target.appendChild(this.element);

    if (this.ovserve != null) {
      this.ovserve((fadein) /* 引数を.fadeinの有無として反映 */ => {
        if (fadein) this.element.classList.add("fadein");
        else this.element.classList.remove("fadein");
      });
    }
  }
}
