import { html } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';

// These are the shared styles needed by this element.
import SharedStyles from '../styles/shared-styles.js';

function isHidden(el) {
  console.log(el.offsetParent)
  return (el.offsetParent === null)
}

class BeaconApi extends PageViewElement {
  constructor() {
    super();

    this.analytics = { start: performance.now(), visibility: [] };

    this.reportEvent = this.reportEvent.bind(this);
  }

  static get styles() {
    return [SharedStyles];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    const currentSection = this.shadowRoot.querySelector('.beacon-api h1');
    document.addEventListener('visibilitychange', (event) => {
      console.log(isHidden(currentSection));
      if (isHidden(currentSection)) {
        this.analytics.stop = performance.now();
        navigator.sendBeacon(
          'http://localhost:8000/api/test',
          JSON.stringify(this.analytics)
        );
      }
    });
  }

  render() {
    return html`
      <section class="beacon-api">
        <h1>Send Beacon</h1>
        <a href="http://www.w3.org/" @click=${this.reportEvent}
          >Example with event as the object</a
        >
        <button @click=${() => this.reportEvent('some event')}>
          Example with a string as the argument
        </button>
      </section>
    `;
  }

  reportEvent(event) {
    console.log(event);
    if (event.preventDefault) event.preventDefault();
    else {
      event = { timeStamp: performance.now() };
    }
    this.analytics.visibility.push({
      state: document.visibilityState,
      ts: event.timeStamp
    });
  }
}

window.customElements.define('beacon-api', BeaconApi);
