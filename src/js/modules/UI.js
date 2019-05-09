import Config from "./Config";

function generate_qoe_content(qoe) {
  return qoe ? `QoE: ${qoe}` : "計測中...";
}

/**
 *
 */
export default class UI {
  /**
   *
   * @param {string} target CSS selector string
   */
  constructor(target) {
    this.target = target;

    // Inserted element
    this.element = null;
  }

  update_status(total, dropped, qoe) {
    console.log(
      `VIDEOMARK: latest qoe = ${qoe ||
        "no data"}, frame drop: ${dropped}/${total}`
    );
    if (!this.element) {
      this.insert_element();
    }
    this.element.textContent = generate_qoe_content(qoe);
  }

  remove_element() {
    if (this.element) {
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
    Object.entries(Config.get_ui_inline_style()).forEach(([key, value]) => {
      this.element.style[key] = value;
    });
    target.appendChild(this.element);
  }
}
