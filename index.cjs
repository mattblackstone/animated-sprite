function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var AnimatedSprite = /*#__PURE__*/function () {
  function AnimatedSprite(target, image, width, height, frameCount, options) {
    var RAD = Math.PI / 180;
    var RAD90 = RAD * 90;
    var self = this;
    var img = image;
    var w = width;
    var h = height;
    var frames = frameCount;
    var opts = options || {};
    var record = opts.dontClear;
    var cols = Math.floor(img.width / w) - 1;
    var targIsCanvas = target.tagName.toLowerCase() === 'canvas';
    var canvas = targIsCanvas ? target : createCanvas();
    var ctx = canvas.getContext('2d');
    var points = [];

    if (typeof window.Event !== 'function') {
      var _Event = function _Event(event, params) {
        params = params || {
          bubbles: false,
          cancelable: false
        };
        var evt = document.createEvent('Event');
        evt.initEvent(event, params.bubbles, params.cancelable);
        return evt;
      };

      _Event.prototype = window.Event.prototype;
      window.Event = _Event;
    }

    function createCanvas() {
      var ref = document.createElement('canvas');
      ref.width = opts.canvasW || w;
      ref.height = opts.canvasH || h;
      ref.style.position = 'absolute';
      target.appendChild(ref);
      return ref;
    }

    var frame = 0;
    var nextframe = -1;
    var col = 0;
    var row = 0;
    var tick = 1;
    var every = 1;
    var remainder = 0;
    var updating = false;
    var rafid;
    var timestamp = 0;
    var playing = false;
    var ended = false;
    var crossfade = false;
    var transparency = false;
    var reverse = false;
    var ox = opts.offsetX || 0;
    var oy = opts.offsetY || 0;
    this.canvas = canvas;
    var eventPlaying = new Event('playing');
    var eventPaused = new Event('paused');
    var eventEnded = new Event('ended');
    var eventForward = new Event('forward');
    var eventReverse = new Event('backward');
    var eventFPSChange = new Event('fpschange');
    var history = [];
    if (record) history.length = frames + 1;
    var i = 0;
    var j = 0;

    while (i < frames) {
      points.push({
        x: w * col,
        y: h * row
      });
      col < cols ? col++ : col = 0;
      j++;
      row = Math.floor(j / (cols + 1));
      i++;
    }

    col = row = 0;

    function startUpdate() {
      if (!updating) {
        updating = true;
        playing = true;
        update();
        canvas.dispatchEvent(eventPlaying);
      }
    }

    function stop() {
      cancelAnimationFrame(rafid);
      updating = false;
      playing = false;
      canvas.dispatchEvent(eventPaused);
    }

    var alpha;

    function update($timestamp) {
      if (timestamp !== $timestamp) {
        timestamp = $timestamp; // HACK: prevents doubling

        remainder = tick % every;

        if (remainder === 0) {
          advance();
          render(frame);
          alpha = 1;
        } else if (crossfade) {
          if (transparency) {
            var angle = remainder / every * RAD90;
            render(frame, Math.cos(angle), true);
            render(nextframe, Math.sin(angle));
          } else {
            if (remainder === 1) {
              alpha = 1 / every;
            } else {
              alpha = 1 / every * 2;
            }

            render(nextframe, alpha);
          }
        }

        tick++;

        if (playing === true) {
          rafid = requestAnimationFrame(update);
        }
      }
    }

    function render($frame, $alpha, $clear) {
      if (points[$frame]) {
        ctx.globalAlpha = $alpha || 1;
        if ($clear) ctx.clearRect(ox, oy, w, h);

        if (history[$frame]) {
          ctx.drawImage(history[$frame], 0, 0, w, h, ox, oy, w, h);
        } else {
          ctx.drawImage(img, points[$frame].x, points[$frame].y, w, h, ox, oy, w, h);
        }
      }
    }

    function advance() {
      if (record && !history[frame]) {
        history[frame] = new Image();
        history[frame].src = canvas.toDataURL();
      }

      if (frame > frames - 2 && !reverse) {
        stop();
        ended = true;
        canvas.dispatchEvent(eventEnded);

        if (self.onComplete) {
          self.onComplete();
        }
      } else if (frame < 1 && reverse) {
        stop();
        ended = true;
        canvas.dispatchEvent(eventEnded);
      } else {
        if (reverse) {
          frame--;
          nextframe = frame - 1;
        } else {
          frame++;
          nextframe = frame + 1;
        }

        if (!record || reverse) ctx.clearRect(ox, oy, w, h);
      }
    }

    this.getCrossfade = function () {
      return crossfade;
    };

    this.setCrossfade = function (bool) {
      crossfade = bool;
    };

    this.getTransparency = function () {
      return transparency;
    };

    this.setTransparency = function (bool) {
      if (bool && record) {
        window.console.error('transparency cannot be set to true in combination with dontClear');
      } else {
        if (!bool) {
          canvas.style.opacity = 1;
        }

        transparency = bool;
      }
    };

    this.initCrossfade = function () {
      crossfade = true;
    };

    this.getPlaying = function () {
      return playing;
    };

    this.getEvery = function () {
      return every;
    };

    this.setEvery = function (num) {
      var _int = Math.round(num);

      if (_int < 1) {
        _int = 1;
      }

      if (_int > 60) {
        _int = 60;
      }

      every = _int;
      canvas.dispatchEvent(eventFPSChange);
    };

    this.getReverse = function () {
      return reverse;
    };

    this.setReverse = function ($bool) {
      if (reverse !== $bool) {
        reverse = $bool;
        ended = false;

        if ($bool) {
          canvas.dispatchEvent(eventReverse);
        } else {
          canvas.dispatchEvent(eventForward);
        }
      }
    };

    this.onComplete = function () {};

    this.play = function ($frame) {
      if ($frame !== undefined) {
        if ($frame < 0) {
          $frame = 0;
        } else if ($frame > frames) {
          $frame = frames;
        }

        if (frame !== $frame) {
          frame = $frame;

          if (!playing) {
            ended = false;
            startUpdate();
          }
        }
      } else if (!playing && !ended) {
        startUpdate();
      }
    };

    this.pause = function () {
      if (playing) {
        stop();
      }
    };

    this.destroyCanvas = function () {
      var parent = canvas.parentNode;
      if (!targIsCanvas) parent.removeChild(canvas);
    };

    render(frame);
  }

  var _proto = AnimatedSprite.prototype;

  _proto.addEventListener = function addEventListener(type, func, capture) {
    this.canvas.addEventListener(type, func, capture || false);
  };

  _proto.removeEventListener = function removeEventListener(type, func, capture) {
    this.canvas.removeEventListener(type, func, capture || false);
  };

  _proto.destroy = function destroy() {
    this.destroyCanvas();
  };

  _createClass(AnimatedSprite, [{
    key: "every",
    get: function get() {
      return this.getEvery();
    },
    set: function set(num) {
      this.setEvery(num);
    }
  }, {
    key: "playing",
    get: function get() {
      return this.getPlaying();
    }
  }, {
    key: "transparency",
    get: function get() {
      return this.getTransparency();
    },
    set: function set(bool) {
      this.setTransparency(bool);
    }
  }, {
    key: "backward",
    get: function get() {
      return this.getReverse();
    },
    set: function set(bool) {
      this.setReverse(bool);
    }
  }, {
    key: "crossfade",
    get: function get() {
      return this.getCrossfade();
    },
    set: function set(bool) {
      this.setCrossfade(bool);
    }
  }]);

  return AnimatedSprite;
}();

module.exports = AnimatedSprite;
