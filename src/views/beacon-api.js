import { html } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';

// These are the shared styles needed by this element.
import SharedStyles from '../styles/shared-styles.js';

class BeaconApi extends PageViewElement {
  constructor() {
    super();

    this.analytics = { start: performance.now(), visibility: [] };
    console.log(performance.now());

    this.reportEvent = this.reportEvent.bind(this);
  }

  static get styles() {
    return [SharedStyles];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    // Literally every time the content of the page leaves the screen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.analytics.stop = performance.now();
        // this is where you do sendBeacon
      }
    });
    window.onerror = function(msg, url, line, col, error) {
      const formData = new FormData();
      formData.append('url', url);
      formData.append('line', line);
      formData.append('col', col);
      formData.append('error', error);
      navigator.sendBeacon('../clientError', formData);
    };
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
    // if (event.preventDefault) event.preventDefault();
    // else {
    //   event = { timeStamp: performance.now() };
    // }
    console.log(event.timeStamp.thign);
    this.analytics.visibility.push({
      state: document.visibilityState,
      ts: event.timeStamp
    });
  }
}

window.customElements.define('beacon-api', BeaconApi);
