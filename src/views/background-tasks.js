import { html, css } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../styles/shared-styles.js';

class BackgroundTasks extends PageViewElement {
  constructor() {
    super();

    this._taskList = [];
    this._totalTaskCount = 0;
    this._currentTaskNumber = 0;
    this._taskHandle = null;
    this._logFragment = null;
    this._statusRefreshScheduled = false;

    this._enqueueTask = this._enqueueTask.bind(this);
    this._runTaskQueue = this._runTaskQueue.bind(this);
    this._scheduleStatusRefresh = this._scheduleStatusRefresh.bind(this);
    this._updateDisplay = this._updateDisplay.bind(this);
    this._log = this._log.bind(this);
    this._logTaskHandler = this._logTaskHandler.bind(this);
    this._getRandomIntInclusive = this._getRandomIntInclusive.bind(this);
    this._decodeTechnoStuff = this._decodeTechnoStuff.bind(this);

    window.requestIdleCallback =
      window.requestIdleCallback ||
      function(handler) {
        const startTime = Date.now();

        return setTimeout(function() {
          handler({
            didTimeout: false,
            timeRemaining: function() {
              return Math.max(0, 50.0 - (Date.now() - startTime));
            }
          });
        }, 1);
      };

    window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function(id) {
        clearTimeout(id);
      };
  }

  static get styles() {
    return [
      SharedStyles,
      css`
        .logBox {
          margin-top: 16px;
          width: 400px;
          height: 500px;
          border-radius: 6px;
          border: 1px solid black;
          box-shadow: 4px 4px 2px black;
        }

        .logHeader {
          margin: 0;
          padding: 0 6px 4px;
          height: 22px;
          background-color: lightblue;
          border-bottom: 1px solid black;
          border-radius: 6px 6px 0 0;
        }

        #log {
          font: 12px 'Courier', monospace;
          padding: 6px;
          overflow: auto;
          overflow-y: scroll;
          width: 388px;
          height: 460px;
        }

        .container {
          width: 400px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid black;
          box-shadow: 4px 4px 2px black;
          display: block;
          overflow: auto;
        }

        .label {
          display: inline-block;
        }

        .counter {
          text-align: right;
          padding-top: 4px;
          float: right;
        }

        .button {
          padding-top: 2px;
          padding-bottom: 4px;
          width: 100px;
          display: inline-block;
          float: left;
          border: 1px solid black;
          cursor: pointer;
          text-align: center;
          margin-top: 0;
          color: white;
          background-color: darkgreen;
        }

        #progress {
          width: 100%;
          padding-top: 6px;
        }
      `
    ];
  }

  render() {
    return html`
      <section>
        <p>
          Demonstration of using
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API"
            >cooperatively scheduled background tasks</a
          >
          using the <code>requestIdleCallback()</code>
          method.
        </p>

        <div class="container">
          <div class="label">
            Decoding quantum filament tachyon emissions...
          </div>
          <progress id="progress" value="0"></progress>
          <button
            class="button"
            id="startButton"
            @click=${this._decodeTechnoStuff}
          >
            Start
          </button>
          <button @click=${this._bigForLoop}>Hi</button>
          <div class="label counter">
            Task <span id="currentTaskNumber">0</span> of
            <span id="totalTaskCount">0</span>
          </div>
        </div>

        <div class="logBox">
          <div class="logHeader">
            Log
          </div>
          <div id="log"></div>
        </div>
      </section>
    `;
  }

  _bigForLoop() {
    for (let i = 0; i < 1000000000; i++) {}
  }

  _enqueueTask(taskHandler, taskData) {
    this._taskList.push({
      // taskHandler is this._logTaskHandler
      handler: taskHandler,
      /*
        An object as so:
          {
            count: 104,
            text: "This text is from task number 90 of 100"
          }
      */
      data: taskData
    });
    // The length of _taskList
    this._totalTaskCount++;
    // It is only null when the component first renders
    if (!this._taskHandle) {
      // requestIdleCallback returns an id that is cancellable in cancelIdleCallback
      // The id is 1 on first click and then it by a randomish number... 
      // 1 -> 16 -> 31 -> 42 -> 60 -> 79, different on each run
      this._taskHandle = requestIdleCallback(this._runTaskQueue);
    }

    this._scheduleStatusRefresh();
  }

  _runTaskQueue(deadline) {
    while (
      (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
      this._taskList.length
    ) {
      const task = this._taskList.shift();
      this._currentTaskNumber++;

      task.handler(task.data);
      this._scheduleStatusRefresh();
    }

    if (this._taskList.length) {
      this._taskHandle = requestIdleCallback(this._runTaskQueue);
    } else {
      this._taskHandle = 0;
    }
  }

  _scheduleStatusRefresh() {
    // TODO: when is this true?
    if (!this._statusRefreshScheduled) {
      requestAnimationFrame(this._updateDisplay);
      this._statusRefreshScheduled = true;
    }
  }

  _updateDisplay() {
    // Cannot access elements outside of the shadow DOM
    const shadowRoot = this.shadowRoot;
    const logElem = shadowRoot.getElementById('log');
    const progressBarElem = shadowRoot.getElementById('progress');
    const currentTaskNumberElem = shadowRoot.getElementById(
      'currentTaskNumber'
    );
    const totalTaskCountElem = shadowRoot.getElementById('totalTaskCount');

    // All this really does is scroll to the end of all the content that is rendered.
    const scrolledToEnd =
      logElem.scrollHeight - logElem.clientHeight <= logElem.scrollTop + 1;
    // This is only true on the first render.
    if (this._totalTaskCount) {
      if (progressBarElem.max != this._totalTaskCount) {
        totalTaskCountElem.textContent = this._totalTaskCount;
        progressBarElem.max = this._totalTaskCount;
      }

      if (progressBarElem.value != this._currentTaskNumber) {
        currentTaskNumberElem.textContent = this._currentTaskNumber;
        progressBarElem.value = this._currentTaskNumber;
      }
    }

    if (this._logFragment) {
      logElem.appendChild(this._logFragment);
      this._logFragment = null;
    }

    if (scrolledToEnd) {
      logElem.scrollTop = logElem.scrollHeight - logElem.clientHeight;
    }
    this._statusRefreshScheduled = false;
  }

  _log(text) {
    if (!this._logFragment) {
      this._logFragment = document.createDocumentFragment();
    }

    const el = document.createElement('div');
    el.innerHTML = text;
    this._logFragment.appendChild(el);
  }

  //
  _logTaskHandler(data) {
    this._log('<strong>Running task #' + this._currentTaskNumber + '</strong>');

    for (let i = 0; i < data.count; i += 1) {
      this._log((i + 1).toString() + '. ' + data.text);
    }
  }

  // Does exactly what it says.
  _getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // This is the first function run when start is clicked.
  _decodeTechnoStuff() {
    // This is done to reset data if start is clicked twice..
    this._totalTaskCount = 0;
    this._currentTaskNumber = 0;
    // TODO: figure out exactly why this is called again
    this._updateDisplay();

    // Random # btw 100 and 200 which will specify the amount of tasks
    const n = this._getRandomIntInclusive(100, 200);
    for (let i = 0; i < n; i++) {
      // The data that will be run in the task.
      const taskData = {
        // How many elements will render during each task.
        count: this._getRandomIntInclusive(75, 150),
        // The text shown in the elements rendered.
        text: `This text is from task number ${(i + 1).toString()} of ${n}`
      };
      this._enqueueTask(this._logTaskHandler, taskData);
    }
  }
}

window.customElements.define('background-tasks', BackgroundTasks);
