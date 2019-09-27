var _canvas;
var _ctx;

// For storing onTouch data of fingers (up to three fingers)
// id for a finger, last draw pos x, last draw pos y
var _touches = [
  { id: null, lastDrawX: null, lastDrawY: null },
  { id: null, lastDrawX: null, lastDrawY: null },
  { id: null, lastDrawX: null, lastDrawY: null }
];

// Initialize
window.addEventListener('load', function () {
  // Prepare for creating a canvas
  _canvas = document.getElementById('canvas');
  _canvas.width = document.documentElement.clientWidth - 2;
  _canvas.height = 400;
  _ctx = _canvas.getContext('2d');
  _ctx.fillStyle = 'rgba(0, 0, 0, 1)';  // Fill style with black
  // _ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';  // Fill style with white
  _ctx.strokeStyle = 'rgba(255, 0, 0, 1)';  // Set a stroke color with red
  clear();

  // onTouch
  _canvas.addEventListener('touchstart', function (e) {
    for (var i = 0; i < e.changedTouches.length; ++i) {
      // Register a finger info, then draw a point
      var touch = e.changedTouches[i];
      var touchIndex = storeTouch(touch);
      if (touchIndex !== false) {
        startDrawing(touchIndex);
        var coords = getCoordsByTouch(touch);
        draw(touchIndex, coords.x, coords.y);
      }
    }
  });

  // offTouch
  _canvas.addEventListener('touchend', function (e) {
    for (var i = 0; i < e.changedTouches.length; ++i) {
      // Remove info about the off touched finger
      var touch = e.changedTouches[i];
      removeTouch(touch.identifier);
    }
  });

  // onMove
  _canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();  // Prevent scrolling
    for (var i = 0; i < e.changedTouches.length; ++i) {
      // If the moved finder is already registered, then draw a line from old pos to new pos
      var touch = e.changedTouches[i];
      var touchIndex = findTouch(touch.identifier);
      if (touchIndex !== false) {
        var coords = getCoordsByTouch(touch);
        draw(touchIndex, coords.x, coords.y);
      }
    }
  });

  // Clear button
  document.getElementById('clear').addEventListener('click', clear);
});

/**
 * Clear the canvas.
 */
function clear() {
  _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
}

/**
 * Register a new finger info
 * @param {Touch} newTouch Touch object taken from changeTouches of TouchEvent
 */
function storeTouch(newTouch) {
  // If the finger with the same id, then return its id
  for (var touchIndex = 0; touchIndex < _touches.length; ++touchIndex) {
    if (_touches[touchIndex].id === newTouch.identifier) {
      return touchIndex;
    }
  }
  // If not registered, then register it and return the id
  // If the finger storage is full, then return false
  for (var touchIndex = 0; touchIndex < _touches.length; ++touchIndex) {
    if (_touches[touchIndex].id === null) {
      _touches[touchIndex].id = newTouch.identifier;
      return touchIndex;
    }
  }
  return false;
}

/**
 * Specify an identifier and look up for the registered finger info. If it exists, then return its id, else return false.
 * @param {integer} id identifier of the Touch object
 */
function findTouch(id) {
  for (var touchIndex = 0; touchIndex < _touches.length; ++touchIndex) {
    if (_touches[touchIndex].id === id) {
      return touchIndex;
    }
  }
  return false;
}

/**
 * Specify an identifier and remove the finger info from the registered storage.
 * @param {integer} id identifer of the Touch object
 */
function removeTouch(id) {
  var touchIndex = findTouch(id);
  if (touchIndex !== false) {
    _touches[touchIndex].id = null;
  }
}

/**
 * Return a calculated position from Touch object
 * @param {Touch} touch Touch taken from changedTouches of TouchEvent
 */
function getCoordsByTouch(touch) {
  var bounds = touch.target.getBoundingClientRect();
  return {
    x: touch.clientX - bounds.left,
    y: touch.clientY - bounds.top
  };
}

/**
 * Specify a finger id and prepare for start drawing.
 * @param {integer} touchIndex
 */
function startDrawing(touchIndex) {
  // Empty the last draw pos.
  _touches[touchIndex].lastDrawX = _touches[touchIndex].lastDrawY = null;
}

/**
 * Draw on to the canvas after specifying an finger id and coordinate.
 * @param {integer} touchIndex
 * @param {integer} x
 * @param {integer} y
 */
function draw(touchIndex, x, y) {
  // Get finger info
  var touch = _touches[touchIndex];

  // Draw a stroke either from the last draw pos, if exists, or specified coordinate
  _ctx.beginPath();
  if (touch.lastDrawX === null) {
    _ctx.moveTo(x - 1, y - 1);  // It shifts a bit cuz it cannot draw a stroke if the momentum is zero
  } else {
    _ctx.moveTo(touch.lastDrawX, touch.lastDrawY);
  }
  _ctx.lineTo(x, y);
  _ctx.closePath();
  _ctx.stroke();

  // Store the last draw coordinate
  touch.lastDrawX = x;
  touch.lastDrawY = y;
}
