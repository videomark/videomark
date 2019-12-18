import Config from "../Config";
import Status from "./Status";

/**
 *
 */
export default class UI {
  /**
   * @param {string} target CSS selector string
   */
  constructor(target) {
    this.target = target;

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
    const target = document.querySelector(this.target);
    if (target === null) {
      console.error(
        `VIDEOMARK: No element found matching query string "${this.target}"`
      );
      return;
    }

    const e = name => (childlen = []) => {
      const element = document.createElement(name);
      childlen.forEach(c => element.appendChild(c));
      return element;
    };
    const style = e("style")([document.createTextNode(Config.get_style())]);
    document.head.appendChild(style);

    this.element = e("div")();
    this.element.id = Config.get_ui_id();
    this.element.attachShadow({ mode: "open" });
    this.status.attach(this.element.shadowRoot);
    target.appendChild(this.element);

    // プレイヤーのコントローラーを監視して表示/非表示を切り替える
    const ovserve = Config.get_ui_observer();
    if (ovserve != null) {
      ovserve((fadein) /* 引数を.fadeinの有無として反映 */ => {
        if (fadein) this.element.classList.add("fadein");
        else this.element.classList.remove("fadein");
      });
    }
  }
}
