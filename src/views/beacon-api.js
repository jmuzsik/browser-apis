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
        console.log('hola')
        this.analytics.stop = performance.now();
        // This is where you do sendBeacon
        // It can be tested on a live server
        // navigator.sendBeacon(
        //   '/some-url-to-a-backend',
        //   JSON.stringify(this.analytics)
        // );
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
        <button @click=${this.reportEvent}>
          Data is recorded when this is clicked
        </button>
      </section>
    `;
  }

  reportEvent(event) {
    this.analytics.visibility.push({
      state: document.visibilityState,
      ts: event.timeStamp
    });
  }
}

window.customElements.define('beacon-api', BeaconApi);
