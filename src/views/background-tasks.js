import { html } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';

import markdown from '../markdown/background-tasks.js';

import backgroundTasksStyles from '../styles/background-tasks-styles';

function createFallbackRequestIdleCallback(handler) {
  const startTime = Date.now();

  return setTimeout(function() {
    handler({
      didTimeout: false,
      timeRemaining: function() {
        return Math.max(0, 50.0 - (Date.now() - startTime));
      }
    });
  }, 1);
}

class BackgroundTasks extends PageViewElement {
  constructor() {
    super();

    this.taskList = [];
    this.totalTaskCount = 0;
    this.currentTaskNumber = 0;
    this.taskHandle = null;
    this.logFragment = null;
    this.statusRefreshScheduled = false;

    this.enqueueTask = this.enqueueTask.bind(this);
    this.runTaskQueue = this.runTaskQueue.bind(this);
    this.scheduleStatusRefresh = this.scheduleStatusRefresh.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.log = this.log.bind(this);
    this.logTaskHandler = this.logTaskHandler.bind(this);
    this.getRandomIntInclusive = this.getRandomIntInclusive.bind(this);
    this.startBackgroundTasks = this.startBackgroundTasks.bind(this);

    // requestIdleCallback, when called, returns an id that is cancellable
    // in cancelIdleCallback. The id is 1 on first click and then it is a
    // random-ish number. 1 -> 16 -> 31 -> 42 -> 60 -> 79, different on each run
    // One thing to realise that if a task is running while another task goes
    // to interrupt it, the task will finish.
    window.requestIdleCallback =
      window.requestIdleCallback || createFallbackRequestIdleCallback();

    window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function(id) {
        clearTimeout(id);
      };
  }

  // Kind of like componentDidMount
  async connectedCallback() {
    // Except you also have to call this
    super.connectedCallback();
    // and this
    await this.updateComplete;
    // Now the DOM is loaded, so do stuff with it
    const shadowRoot = this.shadowRoot;
    const markdownDiv = shadowRoot.querySelector('.markdown');
    markdownDiv.innerHTML = window.marked(markdown);
  }

  static get styles() {
    return backgroundTasksStyles;
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
            @click=${this.startBackgroundTasks}
          >
            Start Background Tasks
          </button>
          <button
            class="button"
            type="button"
            @click=${this.takeOverTheEventLoop}
          >
            Click to take over event loop
          </button>
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
        <div class="markdown" />
      </section>
    `;
  }

  // Something computational expensive to test that
  // the tasks stop when this is run.
  takeOverTheEventLoop() {
    console.warn("I'm taking over the event loop.");
    for (let i = 0; i < 1000000000; i++) {}
  }

  /**
   * Basic premise:
   *  Create a bunch of tasks and subtasks for those tasks (100's of each)
   *  to be rendered to the DOM as mildly expensive computations. Each of these
   *  computations are a single task in the Background Tasks API. Each task only
   *  runs during idle time in the browser. The task finishes, then the next
   *  task is to be done, which does not run until the next idle time in the
   *  browser. This repeats until all tasks are finished.
   *
   */

  startBackgroundTasks() {
    console.info('Background Tasks have begun.');
    // Subtlety: Data is reset if start is clicked multiple times repeated clicks.
    this.totalTaskCount = 0;
    this.currentTaskNumber = 0;
    this.updateDisplay();

    // Create a bunch of tasks.
    const n = this.getRandomIntInclusive(200, 400);
    for (let i = 0; i < n; i++) {
      const taskData = {
        // The amount of elements that will be created in this task.
        count: this.getRandomIntInclusive(150, 300),
        // The text that will be rendered in the element.
        text: `This text is from task number ${(i + 1).toString()} of ${n}`
      };
      this.enqueueTask(this.logTaskHandler, taskData);
    }
  }

  // Adds to task queue.
  enqueueTask(taskHandler, taskData) {
    this.taskList.push({
      // taskHandler is this.logTaskHandler
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

    // Keep track of length of list
    this.totalTaskCount++;
    // It is only null when the component first renders.
    // It is to start a Background Task.
    if (!this.taskHandle) {
      this.taskHandle = requestIdleCallback(this.runTaskQueue);
    }

    this.scheduleStatusRefresh();
  }

  // requestIdleCallback's callback.
  runTaskQueue(deadline) {
    console.info(`This round of JS begins at ${this.currentTaskNumber}.`);
    while (deadline.timeRemaining() > 0 && this.taskList.length) {
      // deadline.timeRemaining() runs repeatedly, until it is equal
      // to 0. It slowly decreases... 12.465 -> 11.26 -> etc.
      const task = this.taskList.shift();
      this.currentTaskNumber++;

      // This creates the DOM elements but does not log them.
      task.handler(task.data);
      // This adds the created elements to the DOM with requestAnimationFrame.
      this.scheduleStatusRefresh();
    }
    console.info(`And ends at ${this.currentTaskNumber}.`);
    // Then run the next task.
    if (this.taskList.length) {
      this.taskHandle = requestIdleCallback(this.runTaskQueue);
    } else {
      this.taskHandle = 0;
    }
  }

  // Creation of DOM elements, to be added to the DOM later.
  logTaskHandler(data) {
    this.log('<strong>Running task #' + this.currentTaskNumber + '</strong>');

    for (let i = 0; i < data.count; i += 1) {
      this.log((i + 1).toString() + '. ' + data.text);
    }
  }

  log(text) {
    if (!this.logFragment) {
      this.logFragment = document.createDocumentFragment();
    }

    const el = document.createElement('div');
    el.innerHTML = text;
    this.logFragment.appendChild(el);
  }

  // requestAnimationFrame.
  scheduleStatusRefresh() {
    if (!this.statusRefreshScheduled) {
      requestAnimationFrame(this.updateDisplay);
      this.statusRefreshScheduled = true;
    }
  }

  // All DOM stuff happens in here.
  updateDisplay() {
    // Cannot access elements inside the shadow DOM from outside of it.
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
    // This is only false on the first render.
    if (this.totalTaskCount) {
      if (progressBarElem.max !== this.totalTaskCount) {
        totalTaskCountElem.textContent = this.totalTaskCount;
        progressBarElem.max = this.totalTaskCount;
      }

      if (progressBarElem.value !== this.currentTaskNumber) {
        currentTaskNumberElem.textContent = this.currentTaskNumber;
        progressBarElem.value = this.currentTaskNumber;
      }
    }
    if (this.logFragment) {
      logElem.appendChild(this.logFragment);
      this.logFragment = null;
    }

    if (scrolledToEnd) {
      logElem.scrollTop = logElem.scrollHeight - logElem.clientHeight;
    }
    this.statusRefreshScheduled = false;
  }

  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

window.customElements.define('background-tasks', BackgroundTasks);
