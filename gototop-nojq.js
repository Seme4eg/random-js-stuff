// test how it works - https://codepen.io/Seme4eg/pen/MOBaPY

document.addEventListener('DOMContentLoaded', function () {
  var up = document.getElementsByClassName('up')[0];

  const check = () =>
    pageYOffset >= 500
      ? up.classList.add('visible')
      : up.classList.remove('visible');

  window.addEventListener('scroll', check);

  let body = document.documentElement;

  up.onclick = function () {
    animate({
      duration: 700,
      timing: goUpEaseOut,
      draw: progress => (body.scrollTop = body.scrollTop * (1 - progress / 7)),
    });
  };

  function circ(timeFraction) {
    if (timeFraction > 1) timeFraction = 1;
    return 1 - Math.sin(Math.acos(timeFraction));
  }

  function makeEaseOut(timing) {
    return function (timeFraction) {
      return 1 - timing(1 - timeFraction);
    };
  }

  var goUpEaseOut = makeEaseOut(circ);
});

function animate(options) {
  var start = performance.now();

  requestAnimationFrame(function animate(time) {
    // timeFraction from 0 to 1
    var timeFraction = (time - start) / options.duration;
    if (timeFraction > 1) timeFraction = 1;

    var progress = options.timing(timeFraction);

    options.draw(progress);

    if (timeFraction < 1) requestAnimationFrame(animate);
  });
}
