import { html, render } from "lit-html";

const details = state =>
  html`
    <pre>${JSON.stringify(state, null, "  ")}</pre>
  `;

export default class Status {
  constructor() {
    this.detach();
  }

  attach(root) {
    this.root = root;
  }

  detach() {
    this.root = null;
    this.state = {
      open: false
    };
  }

  get template() {
    const { open, qoe } = this.state;
    return html`
      <style>
        .root {
          background: rgba(0, 161, 255, 0.5);
          padding: 5px 10px;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          line-height: 1;
        }
        :focus {
          outline: 0;
        }
      </style>
      <div class="root">
        <details
          @toggle=${e => {
            this.update({ open: e.currentTarget.open });
          }}
        >
          <summary>
            ${qoe ? `QoE: ${qoe}` : "計測中..."}
          </summary>
          ${open ? details(this.state) : ""}
        </details>
      </div>
    `;
  }

  update(state = {}) {
    if (this.root == null) return;
    Object.assign(this.state, state);
    render(this.template, this.root);
  }
}
