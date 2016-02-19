var router = require('client/dashboard/cores/router');

try {
  document.addEventListener('click', function(e) {
    e.preventDefault();
    if (e.target.getAttribute('data-type') === 'router') {
      router.pushState(e.target.href);
    }
  });
} catch (e) {
  console.log('mock document');
}
