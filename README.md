# Lightweight utility for animating sprite-sheets
Intended for use in display ads and other very low file size applications where video can't be used. Play, pause, reverse and change playback speed dynamically. A key feature is frame blending for smoother playback of low framerate sequences. Works with simple spritesheets made up of image sequences (no JSON data).

## Compatibility
This library is compatible with all modern browsers and IE10+

## Prerequisites
Node 12+  
npm 6+

## Installation
```bash
npm install --save animated-sprite
```

## Usage
Script tag:
```html
<script src="https://unpkg.com/animated-sprite/animated-sprite.min.js"></script>
```
ES Module Import:
```javascript
import AnimatedSprite from 'animated-sprite/index.mjs';
```
CommonJS Module Import:
```javascript
const AnimatedSprite = require('animated-sprite');
```

### Implementation
After embedding/importing the script, create a new instance of AnimatedSprite passing the required arguments to the constructor. The shape of the spritesheet can be a single row, single column or rectangular (multiple rows/columns), but cannot not contain padding between frames. Each animation frame in the spritesheet must be the same size.
```typescript
class AnimatedSprite(target: Element, image: HTMLImageElement, width: number, height: number, frameCount: number, options?: Object {
  dontClear: boolean, canvasW: number, canvasH: number, offsetX: number, offsetY: number
})
```
```javascript
// Basic instantiation
const targ = document.querySelector('#my_targ');
const img = new Image();
let myAnimation;
img.onload = () => {
  myAnimation = new AnimatedSprite(targ, img, 300, 150, 25);
  myAnimation.play();
};
img.src = 'sprite-sequence.png';
```

### Constructor arguments

Required args:
1. target: Element (if target is not a HTMLCanvasElement, a canvas will be created inside the target element)
2. image: HTMLImageElement (must be loaded before passing)
3. width: number (the width of a single animation frame, not the entire sprite-sheet)
4. height: number (the height of a single animation frame)
5. frameCount: number (the number of total frames in the sprite-sheet)

Extra options object:
* dontClear: boolean (defaults to false, if set to true will draw the next frame without clearing the canvas)
* canvasW: number (defaults to *width* from the 3rd argument unless specified)
* canvasH: number (defaults to *height* from the 4th argument unless specified)
* offsetX: number (defaults to 0 unless specified and defines the distance from the left edge of the canvas)
* offsetY: number (defaults to 0 unless specified and defines the distance from the top edge of the canvas)

Use canvasW, canvasH, offsetX, offsetY for multiple animations on the same canvas (like particle systems etc).

### Methods

#### play()
```javascript
myAnimation.play();
```
#### pause()
```javascript
myAnimation.pause();
```

### Getters and Setters

#### every: number (positive integer)
The *every* property controls the playback rate of the animation. The default is 1 which means that the animation should advance with with every requestAnimationFrame (60 times per second). This is more direct and performant than basing the playback speed on an exact frames-per-second rate. When every is set to higher numbers, the equivalent FPS decreases. Divide 60 by *every* to get the resultant FPS. Example: every = 3 results in a 20fps playback rate (60/3 = 20fps).
```javascript
myAnimation.every = 2; // equivalent to 30fps
console.log('current fps:', 60 / myAnimation.every);
```
#### crossfade: boolean
If *every* is set to a value greater than 1, you may choose to smooth the animation by crossfading between the frames in your image sequence. This is more useful for *every* values of 3 or higher. Setting *crossfade* to true will draw the next frame in semi-transparent steps over the current frame for the crossfading effect allowing for less total frames and smaller file-sizes.
```javascript
myAnimation.every = 4; // 15fps
myAnimation.crossfade = true; // simulates 60fps
console.log('crossfade enabled:', myAnimation.crossfade);
```
#### transparency: boolean
When crossfading is enabled, setting this to true will cause the current frame to fade off as the next frame fades on. This option is best suited for sprite-sheets with a transparent background. If *transparency* is false (default), the next frame will fade on overtop of an always opaque current frame.
```javascript
myAnimation.transparency = true;
var transparencyEnabled = myAnimation.transparency; // returns true if transparent crossfading is enabled
```
#### backward: boolean
Defaults to false. If *reverse* is set to true, the playback direction will change to backwards. If set to false, playback direction will be forward. If playback has ended, playback will not begin automatically. If playback is in progress, the direction change will be immediately visible.
```javascript
myAnimation.backward = true;
myAnimation.play(); // will play backwards to the first frame
var backwardsPlay = myAnimation.backward; // returns true if playback direction has been reversed
```
#### playing: boolean
Getter only. If playback is in progress the return value will be true (regardless of playback direction).
```javascript
var isPlaying = myAnimation.playing;
```

### Events
All event listeners are forwarded onto and dispatched from the canvas element that was passed through the constructor. You can add event listeners to the instance of AnimatedSprite or directly onto the canvas. The events below are useful for creating playback controls.

#### playing
Dispatched when playback starts
```javascript
myAnimation.addEventListener('playing', function(){ /* ... */ });
```
#### paused
Dispatched when playback is paused and when playback ends
```javascript
myAnimation.addEventListener('paused', function(){ /* ... */ });
```
#### ended
Dispatched when playback ends on the final frame (in either direction)
```javascript
myAnimation.addEventListener('ended', function(){ /* ... */ });
```
#### forward
Dispatched when play direction is changed to forward
```javascript
myAnimation.addEventListener('forward', function(){ /* ... */ });
```
#### reverse
Dispatched when play direction is changed to reverse
```javascript
myAnimation.addEventListener('reverse', function(){ /* ... */ });
```
#### fpschange
Dispatched when the playback rate is changed via the *every* setter.
```javascript
myAnimation.addEventListener('fpschange', function(){ /* ... */ });
```
