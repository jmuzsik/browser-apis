# Analytics

This focuses on many different data points available in modern JS that are useful for analytical data.

### Beacon API

This specification defines an interface that web developers can use to schedule asynchronous and non-blocking delivery of data that minimizes resource contention with other time-critical operations, while ensuring that such requests are still processed and delivered to the correct destination.

#### One way requests and why they matter

Used to send application and measurement data once the user exits the application, to avoid doing so while the user is using the application. Basically, this API allows you to send data when the user is leaving a webpage, and never before so that there is no performance hit to your application.

- ie. Beacon requests are guaranteed to be initiated before page is unloaded and are allowed to run to completion without requiring blocking requests or other techniques that block processing of user interactive events.
- The primary reason is this: to collect as many data as possible analytics libraries tried to send the collected data at the last possible moment to the server. 

## Data to obtain

### Object

`this.analytics = { start: performance.now(), visibility: [] };`

- Just a simple object
    - `performance.now()` - returns a `DOMHighResTimeStamp` whose value that depends on the navigation start and scope. If the scope is a window, the value is the time the browser context was created and if the scope is a worker, the value is the time the worker was created.
    - `visibility` is used to note when the user changes to another tab or the document is no longer visible. It is also called when a new html page is switched to.

### Page Lifecycle

`document.addEventListener('visibilitychange', event => { ... }`

- This event is triggered as specified above for the `visibility` array.

### Performance

`document.addEventListener('visibilitychange', () => {if (document.visibilityState === 'hidden') {}})`

- This extra `if` statement is guaranteed to be called prior to the user leaving the page (exiting the document).

### Error Handling



## [This is based on this article](https://golb.hplar.ch/2018/09/beacon-api.html)
