(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  } else {
      root.workerTimer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  // Check if browser supports Web Worker
  const supportsWorkers = typeof Worker !== 'undefined';

  // Web Worker js content
  const workerScript = `
  self.onmessage = function(e) {
    const { type, delay } = e.data;
    switch (type) {
      case 'startInterval':
        self.timerId = setInterval(() => {
          postMessage('tick');
        }, delay);
        break;
      case 'startTimeout':
        self.timerId = setTimeout(() => {
          postMessage('tick');
        }, delay);
        break;
      case 'clear':
        if (self.timerId) {
          clearInterval(self.timerId);
          clearTimeout(self.timerId);
          postMessage('stopped');
        }
        break;
    }
  };
`;

  function createWorker(handler, type, delay) {
      if (!supportsWorkers) {
          console.error('Web Workers are not supported in this environment.');
          return {
              clear: () => console.warn('Fallback method does not support clear.')
          };
      }

      try {
          const blob = new Blob([workerScript], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(blob);
          const worker = new Worker(workerUrl);

          worker.onmessage = e => {
              if (e.data === 'tick') {
                  handler();
              }
          };

          worker.postMessage({ type, delay });

          return {
              clear: function () {
                  worker.postMessage({ type: 'clear' });
                  worker.terminate();
                  URL.revokeObjectURL(workerUrl);
              }
          };
      } catch (error) {
          console.error('Failed to create Web Worker:', error);
          return {
              clear: () => console.warn('Error method does not support clear.')
          };
      }
  }

  // 使用 Web Worker 的 setInterval
  function createWorkerInterval(callback, interval) {
      const workerControl = createWorker(callback, 'startInterval', interval);
      if (!supportsWorkers) {
          const id = setInterval(callback, interval);
          workerControl.clear = function () {
              clearInterval(id);
          };
      }
      return workerControl;
  }

  // 使用 Web Worker 的 setTimeout
  function createWorkerTimeout(callback, timeout) {
      const workerControl = createWorker(callback, 'startTimeout', timeout);
      if (!supportsWorkers) {
          const id = setTimeout(callback, timeout);
          workerControl.clear = function () {
              clearTimeout(id);
          };
      }
      return workerControl;
  }
  return {
      setInterval: createWorkerInterval,
      setTimeout: createWorkerTimeout
  };
});
