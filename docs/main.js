/* global AnimatedSprite */
var Demo = {
  init: function init() {
    function qs(query) {
      return document.querySelector(query);
    }

    var animation = qs('#animation');
    var btn_play_pause = qs('#btn_play_pause');
    var toggle_reverse = qs('#toggle_reverse');
    var toggle_crossfade = qs('#toggle_crossfade');
    var btn_copy = qs('#btn_copy');
    var toggle_alpha = qs('#toggle_alpha');
    var img_list = qs('#img_list');
    var fps = qs('#fps');
    var js_code = qs('#js_code');
    var img;
    var url = window.location.href;
    var as = {};

    function showPlay() {
      btn_play_pause.innerHTML = 'play';
    }

    function showPause() {
      btn_play_pause.innerHTML = 'pause';
    }

    function showForward() {
      toggle_reverse.checked = false;
    }

    function showReverse() {
      toggle_reverse.checked = true;
    }

    function onPlayPause() {
      as.instance.playing ? as.instance.pause() : as.instance.play();
    }

    function onEnded() {
      as.instance.backward ? as.instance.backward = false : as.instance.backward = true;
    }

    function onReverse() {
      as.instance.backward = toggle_reverse.checked;
    }

    function onFPSChange() {
      as.instance.every = parseInt(fps.value, 10);
    }

    function onCrossfade() {
      as.instance.crossfade = toggle_crossfade.checked;
    }

    function onTransparency() {
      as.instance.transparency = toggle_alpha.checked;
    }

    function loadImage(path) {
      img = new Image();

      img.onload = function () {
        makeAnimatedSprite(img, path);
      };

      img.src = path;
    }

    function addASListeners() {
      as.instance.addEventListener('paused', showPlay);
      as.instance.addEventListener('playing', showPause);
      as.instance.addEventListener('ended', onEnded);
      as.instance.addEventListener('forward', showForward);
      as.instance.addEventListener('backward', showReverse);
      btn_play_pause.addEventListener('click', onPlayPause);
      toggle_reverse.addEventListener('click', onReverse);
      toggle_crossfade.addEventListener('click', onCrossfade);
      toggle_alpha.addEventListener('click', onTransparency);
      fps.addEventListener('change', onFPSChange);
    }

    function removeASListeners() {
      // reset to defaults
      if (as.instance.playing) {
        onPlayPause();
      } // playing = false
      
      if (as.instance.backward) {
        onEnded();
      } // backward = false

      toggle_crossfade.checked = false;
      toggle_alpha.checked = false;


      showForward();
      as.instance.removeEventListener('paused', showPlay);
      as.instance.removeEventListener('playing', showPause);
      as.instance.removeEventListener('ended', onEnded);
      as.instance.removeEventListener('forward', showForward);
      as.instance.removeEventListener('backward', showReverse);
      btn_play_pause.removeEventListener('click', onPlayPause);
      toggle_reverse.removeEventListener('click', onReverse);
      toggle_crossfade.removeEventListener('click', onCrossfade);
      toggle_alpha.removeEventListener('click', onTransparency);
      fps.removeEventListener('change', onFPSChange);
    }

    function makeAnimatedSprite(img, path) {
      var frameW = parseInt(path.substring(path.lastIndexOf('w') + 1, path.lastIndexOf('h')), 10);
      var frameH = parseInt(path.substring(path.lastIndexOf('h') + 1, path.lastIndexOf('f')), 10);
      var frameCount = parseInt(path.substring(path.lastIndexOf('f') + 1, path.lastIndexOf('.')), 10);
      var noClear = path.indexOf('dontclear') > -1;

      if (as.instance) {
        // garbage collect
        removeASListeners();
        as.instance.destroy();
        as.instance = null;
        delete as.instance;
      }

      animation.style.width = frameW + 'px';
      animation.style.height = frameH + 'px';

      as.instance = new AnimatedSprite(animation, img, frameW, frameH, frameCount, {
        dontClear: noClear
      });

      onFPSChange();
      addASListeners();

      var opts = noClear ? ', {\n    dontClear: ' + noClear + '\n  }' : '';
      var codeSample = 'var animation = document.querySelector(\'#animation\');\nvar img = new Image();\nvar myAnimation;\nimg.onload = function () {\n  myAnimation = new AnimatedSprite(animation, img, ' + frameW + ', ' + frameH + ', ' + frameCount + opts + ');\n};\nimg.src = ' + path + ';';
      js_code.value = codeSample;
    }

    btn_copy.addEventListener('click', function () {
      js_code.select();
      document.execCommand('copy');
    });

    url = window.location.href;

    if (/#/.test(url)) {
      var file = url.split('#')[1];
      loadImage('images/' + file);
      img_list.value = file;
    }

    img_list.addEventListener('change', function () {
      window.location.href = '#' + this.value;
      loadImage('images/' + this.value);
    });
  }
};

window.onload = function () {
  Demo.init();
};