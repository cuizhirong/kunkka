var router = require('client/dashboard/cores/router');

try {
  document.addEventListener('click', function(e) {
    if (e.target.getAttribute('data-type') === 'router') {
      e.preventDefault();
      router.pushState(e.target.href);
    }
  });
} catch (e) {
  console.log('mock document');
}
