## Introduction
worker-timer.js is a JavaScript file that provides a solution for the issue of JavaScript timers (like **setInterval** and **setTimeout**) slowing down or pausing when a tab is inactive or minimized in a browser. This is achieved by using Web Workers, which run in separate threads and are not subject to the same throttling as the main thread.

## How it Works
The worker-timer.js creates a Web Worker that runs a timer in a separate thread. This allows the timer to run independently of the main thread and not be subject to the same throttling when the tab is inactive or minimized. The worker communicates with the main thread using the postMessage method and onmessage event handler to start, stop, and report the timer's progress.

## Usage

### Import
#### CommonJS Module
```javascript
const workerTimer = require('worker-timer');
```

#### ES6 Module
```javascript
import * as workerTimer from 'worker-timer';
```

#### Browser
```html
<script src="path/to/worker-timer.js"></script>
```

### Example
```javascript
let timeNow = Date.now();
const timer1 = workerTimer.setInterval(function () {
  console.log('now:', new Date());
  console.log('Interval:', Date.now() - timeNow);
  timeNow = Date.now();
}, 1000);

// stop
timer1.clear();
```

```javascript
const timer2 = workerTimer.setTimeout(() => {
  console.log('Hello from Worker setTimeout');
}, 10000);

// stop
timer2.clear();
```

## Precautions
Be aware of the Content Security Policy (CSP). It's an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. If you're having trouble creating a Worker due to CSP, you can add blob: as a source in your worker-src directive.For example, add or modify the CSP settings in the server's response headers:
```
Content-Security-Policy: worker-src 'self' blob:;
```
or in the HTML page's tags
```html
<meta http-equiv="Content-Security-Policy" content="worker-src 'self' blob:;"></meta>
```