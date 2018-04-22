window.onload = function() {
  const iframe = document.querySelector('iframe');
  iframe.title = "Google Maps";
}

if (navigator.serviceWorker) {

  const swController = function() {

    _updateReady = function(worker) {
      // show message
      console.log('service worker update ready...')
      worker.postMessage({ action: 'skipWaiting' });
    }

    _trackInstalling = function(worker) {
      const controller = this;
      worker.addEventListener('statechange', function() {
        if (worker.state == 'installed') {
          controller._updateReady(worker);
        }
      })
    }

    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      // registration successful
      console.log('Service worker registered');

      if (!navigator.serviceWorker.controller) return;

      if (reg.waiting) {
        // update is available...
        // TODO: popup with "new version available" message
        this._updateReady(reg.waiting);
        return;
      }

      if (reg.installing) {
        this._trackInstalling(reg.installing);
      }
    }, function (err) {
      // registration failed
      console.log('Service worker registration failed with message: ' + err);
    });
  }
  swController();

}