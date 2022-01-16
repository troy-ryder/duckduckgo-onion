(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var trailingNewlineRegex = /\n[\s]+$/
var leadingNewlineRegex = /^\n[\s]+/
var trailingSpaceRegex = /[\s]+$/
var leadingSpaceRegex = /^[\s]+/
var multiSpaceRegex = /[\n\s]+/g

var TEXT_TAGS = [
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'amp', 'small', 'span',
  'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
]

var VERBATIM_TAGS = [
  'code', 'pre', 'textarea'
]

module.exports = function appendChild (el, childs) {
  if (!Array.isArray(childs)) return

  var nodeName = el.nodeName.toLowerCase()

  var hadText = false
  var value, leader

  for (var i = 0, len = childs.length; i < len; i++) {
    var node = childs[i]
    if (Array.isArray(node)) {
      appendChild(el, node)
      continue
    }

    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'function' ||
      node instanceof Date ||
      node instanceof RegExp) {
      node = node.toString()
    }

    var lastChild = el.childNodes[el.childNodes.length - 1]

    // Iterate over text nodes
    if (typeof node === 'string') {
      hadText = true

      // If we already had text, append to the existing text
      if (lastChild && lastChild.nodeName === '#text') {
        lastChild.nodeValue += node

      // We didn't have a text node yet, create one
      } else {
        node = document.createTextNode(node)
        el.appendChild(node)
        lastChild = node
      }

      // If this is the last of the child nodes, make sure we close it out
      // right
      if (i === len - 1) {
        hadText = false
        // Trim the child text nodes if the current node isn't a
        // node where whitespace matters.
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          // The very first node in the list should not have leading
          // whitespace. Sibling text nodes should have whitespace if there
          // was any.
          leader = i === 0 ? '' : ' '
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, leader)
            .replace(leadingSpaceRegex, ' ')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

    // Iterate over DOM nodes
    } else if (node && node.nodeType) {
      // If the last node was a text node, make sure it is properly closed out
      if (hadText) {
        hadText = false

        // Trim the child text nodes if the current node isn't a
        // text node or a code node
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')

          // Remove empty text nodes, append otherwise
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        // Trim the child nodes if the current node is not a node
        // where all whitespace must be preserved
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingSpaceRegex, ' ')
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

      // Store the last nodename
      var _nodeName = node.nodeName
      if (_nodeName) nodeName = _nodeName.toLowerCase()

      // Append the node to the DOM
      el.appendChild(node)
    }
  }
}

},{}],2:[function(require,module,exports){
var hyperx = require('hyperx')
var appendChild = require('./appendChild')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = [
  'autofocus', 'checked', 'defaultchecked', 'disabled', 'formnovalidate',
  'indeterminate', 'readonly', 'required', 'selected', 'willvalidate'
]

var COMMENT_TAG = '!--'

var SVG_TAGS = [
  'svg', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix',
  'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood',
  'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage',
  'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight',
  'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter',
  'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src',
  'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image',
  'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph',
  'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS.indexOf(key) !== -1) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  appendChild(el, children)
  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"./appendChild":1,"hyperx":4}],3:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],4:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        if (xstate === OPEN) {
          if (reg === '/') {
            p.push([ OPEN, '/', arg ])
            reg = ''
          } else {
            p.push([ OPEN, arg ])
          }
        } else if (xstate === COMMENT && opts.comments) {
          reg += String(arg)
        } else if (xstate !== COMMENT) {
          p.push([ VAR, xstate, arg ])
        }
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else parts[i][1]==="" || (cur[1][key] = concat(cur[1][key], parts[i][1]));
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else parts[i][2]==="" || (cur[1][key] = concat(cur[1][key], parts[i][2]));
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            if (parts[i][0] === CLOSE) {
              i--
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      if (opts.createFragment) return opts.createFragment(tree[2])
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN && reg.length) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && c === '/' && reg.length) {
          // no-op, self closing tag without a space <br/>
        } else if (state === OPEN && /\s/.test(c)) {
          if (reg.length) {
            res.push([OPEN, reg])
          }
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else if (x === null || x === undefined) return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":3}],5:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("webextension-polyfill", ["module"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.browser = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.8.0 - Tue Apr 20 2021 11:27:38 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      });

      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */


        return function onRequestFinished(req) {
          const wrappedReq = wrapObject(req, {}
          /* wrappers */
          , {
            getContent: {
              minArgs: 0,
              maxArgs: 0
            }
          });
          listener(wrappedReq);
        };
      }); // Keep track if the deprecation warning has been logged at least once.

      let loggedSendResponseDeprecationWarning = false;
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }

              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(new Error(extensionAPIs.runtime.lastError.message));
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        devtools: {
          network: {
            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
          }
        },
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    } // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});


},{}],6:[function(require,module,exports){
"use strict";

module.exports = {
  displayCategories: ['Analytics', 'Advertising', 'Social Network'],
  requestListenerTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'object', 'xmlhttprequest', 'websocket', 'other'],
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType
  feedbackUrl: 'https://duckduckgo.com/feedback.js?type=extension-feedback',
  tosdrMessages: {
    A: 'Good',
    B: 'Mixed',
    C: 'Poor',
    D: 'Poor',
    E: 'Poor',
    good: 'Good',
    bad: 'Poor',
    unknown: 'Unknown',
    mixed: 'Mixed'
  },
  httpsService: 'https://duckduckgo.com/smarter_encryption.js',
  duckDuckGoSerpHostname: 'duckduckgo.com',
  httpsMessages: {
    secure: 'Encrypted Connection',
    upgraded: 'Forced Encryption',
    none: 'Unencrypted Connection'
  },

  /**
   * Major tracking networks data:
   * percent of the top 1 million sites a tracking network has been seen on.
   * see: https://webtransparency.cs.princeton.edu/webcensus/
   */
  majorTrackingNetworks: {
    google: 84,
    facebook: 36,
    twitter: 16,
    amazon: 14,
    appnexus: 10,
    oracle: 10,
    mediamath: 9,
    oath: 9,
    maxcdn: 7,
    automattic: 7
  },

  /*
   * Mapping entity names to CSS class name for popup icons
   */
  entityIconMapping: {
    'Google LLC': 'google',
    'Facebook, Inc.': 'facebook',
    'Twitter, Inc.': 'twitter',
    'Amazon Technologies, Inc.': 'amazon',
    'AppNexus, Inc.': 'appnexus',
    'MediaMath, Inc.': 'mediamath',
    'StackPath, LLC': 'maxcdn',
    'Automattic, Inc.': 'automattic',
    'Adobe Inc.': 'adobe',
    'Quantcast Corporation': 'quantcast',
    'The Nielsen Company': 'nielsen'
  },
  httpsDBName: 'https',
  httpsLists: [{
    type: 'upgrade bloom filter',
    name: 'httpsUpgradeBloomFilter',
    url: 'https://staticcdn.duckduckgo.com/https/https-bloom.json'
  }, {
    type: "don't upgrade bloom filter",
    name: 'httpsDontUpgradeBloomFilters',
    url: 'https://staticcdn.duckduckgo.com/https/negative-https-bloom.json'
  }, {
    type: 'upgrade safelist',
    name: 'httpsUpgradeList',
    url: 'https://staticcdn.duckduckgo.com/https/negative-https-allowlist.json'
  }, {
    type: "don't upgrade safelist",
    name: 'httpsDontUpgradeList',
    url: 'https://staticcdn.duckduckgo.com/https/https-allowlist.json'
  }],
  tdsLists: [{
    name: 'surrogates',
    url: '/data/surrogates.txt',
    format: 'text',
    source: 'local'
  }, {
    name: 'tds',
    url: 'https://staticcdn.duckduckgo.com/trackerblocking/v2.1/tds.json',
    format: 'json',
    source: 'external',
    channels: {
      live: 'https://staticcdn.duckduckgo.com/trackerblocking/v2.1/tds.json',
      next: 'https://staticcdn.duckduckgo.com/trackerblocking/v2.1/tds-next.json',
      beta: 'https://staticcdn.duckduckgo.com/trackerblocking/beta/tds.json'
    }
  }, {
    name: 'ClickToLoadConfig',
    url: 'https://staticcdn.duckduckgo.com/useragents/social_ctp_configuration.json',
    format: 'json',
    source: 'external'
  }, {
    name: 'config',
    url: 'https://staticcdn.duckduckgo.com/trackerblocking/config/v1/extension-config.json',
    format: 'json',
    source: 'external'
  }],
  httpsErrorCodes: {
    'net::ERR_CONNECTION_REFUSED': 1,
    'net::ERR_ABORTED': 2,
    'net::ERR_SSL_PROTOCOL_ERROR': 3,
    'net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH': 4,
    'net::ERR_NAME_NOT_RESOLVED': 5,
    NS_ERROR_CONNECTION_REFUSED: 6,
    NS_ERROR_UNKNOWN_HOST: 7,
    'An additional policy constraint failed when validating this certificate.': 8,
    'Unable to communicate securely with peer: requested domain name does not match the server’s certificate.': 9,
    'Cannot communicate securely with peer: no common encryption algorithm(s).': 10,
    'SSL received a record that exceeded the maximum permissible length.': 11,
    'The certificate is not trusted because it is self-signed.': 12,
    downgrade_redirect_loop: 13
  },
  platform: {
    name: 'extension'
  }
};

},{}],7:[function(require,module,exports){
"use strict";

module.exports = {
  extensionIsEnabled: true,
  socialBlockingIsEnabled: false,
  trackerBlockingEnabled: true,
  httpsEverywhereEnabled: true,
  embeddedTweetsEnabled: false,
  GPC: true,
  meanings: true,
  advanced_options: true,
  last_search: '',
  lastsearch_enabled: true,
  safesearch: true,
  use_post: false,
  ducky: false,
  dev: false,
  zeroclick_google_right: false,
  version: null,
  atb: null,
  set_atb: null,
  'config-etag': null,
  'httpsUpgradeBloomFilter-etag': null,
  'httpsDontUpgradeBloomFilters-etag': null,
  'httpsUpgradeList-etag': null,
  'httpsDontUpgradeList-etag': null,
  hasSeenPostInstall: false,
  extiSent: false,
  failedUpgrades: 0,
  totalUpgrades: 0,
  'tds-etag': null,
  lastTdsUpdate: 0
};

},{}],8:[function(require,module,exports){
"use strict";

var browserWrapper = require('./wrapper.es6');

var RELEASE_EXTENSION_IDS = ['caoacbimdbbljakfhgikoodekdnlcgpk', // edge store
'bkdgflcldnnnapblkhphbgpggdiikppg', // chrome store
'jid1-ZAdIEUB7XOzOJw@jetpack' // firefox
];
var IS_BETA = RELEASE_EXTENSION_IDS.indexOf(browserWrapper.getExtensionId()) === -1;
module.exports = {
  IS_BETA: IS_BETA
};

},{"./wrapper.es6":11}],9:[function(require,module,exports){
"use strict";

var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _require = require('./settings.es6'),
    getSetting = _require.getSetting,
    updateSetting = _require.updateSetting;

var REFETCH_ALIAS_ALARM = 'refetchAlias'; // Keep track of the number of attempted fetches. Stop trying after 5.

var attempts = 1;

var fetchAlias = function fetchAlias() {
  // if another fetch was previously scheduled, clear that and execute now
  _webextensionPolyfill["default"].alarms.clear(REFETCH_ALIAS_ALARM);

  var userData = getSetting('userData');
  if (!(userData !== null && userData !== void 0 && userData.token)) return;
  return fetch('https://quack.duckduckgo.com/api/email/addresses', {
    method: 'post',
    headers: {
      Authorization: "Bearer ".concat(userData.token)
    }
  }).then(function (response) {
    if (response.ok) {
      return response.json().then(function (_ref) {
        var address = _ref.address;
        if (!/^[a-z0-9]+$/.test(address)) throw new Error('Invalid address');
        updateSetting('userData', Object.assign(userData, {
          nextAlias: "".concat(address)
        })); // Reset attempts

        attempts = 1;
        return {
          success: true
        };
      });
    } else {
      throw new Error('An error occurred while fetching the alias');
    }
  })["catch"](function (e) {
    // TODO: Do we want to logout if the error is a 401 unauthorized?
    console.log('Error fetching new alias', e); // Don't try fetching more than 5 times in a row

    if (attempts < 5) {
      _webextensionPolyfill["default"].alarms.create(REFETCH_ALIAS_ALARM, {
        delayInMinutes: 2
      });

      attempts++;
    } // Return the error so we can handle it


    return {
      error: e
    };
  });
};

var MENU_ITEM_ID = 'ddg-autofill-context-menu-item'; // Create the contextual menu hidden by default

_webextensionPolyfill["default"].contextMenus.create({
  id: MENU_ITEM_ID,
  title: 'Use Duck Address',
  contexts: ['editable'],
  visible: false
});

_webextensionPolyfill["default"].contextMenus.onClicked.addListener(function (info, tab) {
  var userData = getSetting('userData');

  if (userData.nextAlias) {
    _webextensionPolyfill["default"].tabs.sendMessage(tab.id, {
      type: 'contextualAutofill',
      alias: userData.nextAlias
    });
  }
});

var showContextMenuAction = function showContextMenuAction() {
  return _webextensionPolyfill["default"].contextMenus.update(MENU_ITEM_ID, {
    visible: true
  });
};

var hideContextMenuAction = function hideContextMenuAction() {
  return _webextensionPolyfill["default"].contextMenus.update(MENU_ITEM_ID, {
    visible: false
  });
};

var getAddresses = function getAddresses() {
  var userData = getSetting('userData');
  return {
    personalAddress: userData === null || userData === void 0 ? void 0 : userData.userName,
    privateAddress: userData === null || userData === void 0 ? void 0 : userData.nextAlias
  };
};
/**
 * Given a username, returns a valid email address with the duck domain
 * @param {string} address
 * @returns {string}
 */


var formatAddress = function formatAddress(address) {
  return address + '@duck.com';
};
/**
 * Checks formal username validity
 * @param {string} userName
 * @returns {boolean}
 */


var isValidUsername = function isValidUsername(userName) {
  return /^[a-z0-9_]+$/.test(userName);
};
/**
 * Checks formal token validity
 * @param {string} token
 * @returns {boolean}
 */


var isValidToken = function isValidToken(token) {
  return /^[a-z0-9]+$/.test(token);
};

module.exports = {
  REFETCH_ALIAS_ALARM: REFETCH_ALIAS_ALARM,
  fetchAlias: fetchAlias,
  showContextMenuAction: showContextMenuAction,
  hideContextMenuAction: hideContextMenuAction,
  getAddresses: getAddresses,
  formatAddress: formatAddress,
  isValidUsername: isValidUsername,
  isValidToken: isValidToken
};

},{"./settings.es6":10,"webextension-polyfill":5}],10:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var defaultSettings = require('../../data/defaultSettings');

var browserWrapper = require('./wrapper.es6');
/**
 * Settings whose defaults can by managed by the system administrator
 */


var MANAGED_SETTINGS = ['hasSeenPostInstall'];
/**
 * Public api
 * Usage:
 * You can use promise callbacks to check readyness before getting and updating
 * settings.ready().then(() => settings.updateSetting('settingName', settingValue))
 */

var settings = {};
var isReady = false;

var _ready = init().then(function () {
  isReady = true;
  console.log('Settings are loaded');
});

function init() {
  return _init.apply(this, arguments);
}

function _init() {
  _init = _asyncToGenerator(function* () {
    buildSettingsFromDefaults();
    yield buildSettingsFromManagedStorage();
    yield buildSettingsFromLocalStorage();
  });
  return _init.apply(this, arguments);
}

function ready() {
  return _ready;
} // Ensures we have cleared up old storage keys we have renamed


function checkForLegacyKeys() {
  var legacyKeys = {
    // Keys to migrate
    whitelisted: 'allowlisted',
    whitelistOptIn: 'allowlistOptIn',
    // Keys to remove
    cookieExcludeList: null,
    'surrogates-etag': null,
    'brokenSiteList-etag': null,
    'surrogateList-etag': null,
    'trackersWhitelist-etag': null,
    'trackersWhitelistTemporary-etag': null
  };
  var syncNeeded = false;

  for (var legacyKey in legacyKeys) {
    var key = legacyKeys[legacyKey];

    if (!(legacyKey in settings)) {
      continue;
    }

    syncNeeded = true;
    var legacyValue = settings[legacyKey];

    if (key && legacyValue) {
      settings[key] = legacyValue;
    }

    delete settings[legacyKey];
  }

  if (syncNeeded) {
    syncSettingTolocalStorage();
  }
}

function buildSettingsFromLocalStorage() {
  return _buildSettingsFromLocalStorage.apply(this, arguments);
}

function _buildSettingsFromLocalStorage() {
  _buildSettingsFromLocalStorage = _asyncToGenerator(function* () {
    var results = browserWrapper.getFromStorage(['settings']); // copy over saved settings from storage

    if (!results) return;
    settings = browserWrapper.mergeSavedSettings(settings, results);
    checkForLegacyKeys();
  });
  return _buildSettingsFromLocalStorage.apply(this, arguments);
}

function buildSettingsFromManagedStorage() {
  return _buildSettingsFromManagedStorage.apply(this, arguments);
}

function _buildSettingsFromManagedStorage() {
  _buildSettingsFromManagedStorage = _asyncToGenerator(function* () {
    var results = yield browserWrapper.getFromManagedStorage(MANAGED_SETTINGS);
    settings = browserWrapper.mergeSavedSettings(settings, results);
  });
  return _buildSettingsFromManagedStorage.apply(this, arguments);
}

function buildSettingsFromDefaults() {
  // initial settings are a copy of default settings
  settings = Object.assign({}, defaultSettings);
}

function syncSettingTolocalStorage() {
  browserWrapper.syncToStorage({
    settings: settings
  });
}

function getSetting(name) {
  if (!isReady) {
    console.warn("Settings: getSetting() Settings not loaded: ".concat(name));
    return;
  } // let all and null return all settings


  if (name === 'all') name = null;

  if (name) {
    return settings[name];
  } else {
    return settings;
  }
}

function updateSetting(name, value) {
  if (!isReady) {
    console.warn("Settings: updateSetting() Setting not loaded: ".concat(name));
    return;
  }

  settings[name] = value;
  syncSettingTolocalStorage();
}

function removeSetting(name) {
  if (!isReady) {
    console.warn("Settings: removeSetting() Setting not loaded: ".concat(name));
    return;
  }

  if (settings[name]) {
    delete settings[name];
    syncSettingTolocalStorage();
  }
}

function logSettings() {
  browserWrapper.getFromStorage(['settings']).then(function (s) {
    console.log(s.settings);
  });
}

module.exports = {
  getSetting: getSetting,
  updateSetting: updateSetting,
  removeSetting: removeSetting,
  logSettings: logSettings,
  ready: ready
};

},{"../../data/defaultSettings":7,"./wrapper.es6":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeTabURL = changeTabURL;
exports.getDDGTabUrls = getDDGTabUrls;
exports.getExtensionId = getExtensionId;
exports.getExtensionURL = getExtensionURL;
exports.getExtensionVersion = getExtensionVersion;
exports.getFromManagedStorage = getFromManagedStorage;
exports.getFromStorage = getFromStorage;
exports.mergeSavedSettings = mergeSavedSettings;
exports.normalizeTabData = normalizeTabData;
exports.notifyPopup = notifyPopup;
exports.setBadgeIcon = setBadgeIcon;
exports.setUninstallURL = setUninstallURL;
exports.syncToStorage = syncToStorage;

var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function getExtensionURL(path) {
  return _webextensionPolyfill["default"].runtime.getURL(path);
}

function getExtensionVersion() {
  var manifest = _webextensionPolyfill["default"].runtime.getManifest();

  return manifest.version;
}

function setBadgeIcon(badgeData) {
  _webextensionPolyfill["default"].browserAction.setIcon(badgeData);
}

function syncToStorage(data) {
  _webextensionPolyfill["default"].storage.local.set(data);
}

function getFromStorage(_x, _x2) {
  return _getFromStorage.apply(this, arguments);
}

function _getFromStorage() {
  _getFromStorage = _asyncToGenerator(function* (key, cb) {
    var result = yield _webextensionPolyfill["default"].storage.local.get(key);
    return result[key];
  });
  return _getFromStorage.apply(this, arguments);
}

function getFromManagedStorage(_x3, _x4) {
  return _getFromManagedStorage.apply(this, arguments);
}

function _getFromManagedStorage() {
  _getFromManagedStorage = _asyncToGenerator(function* (keys, cb) {
    try {
      return yield _webextensionPolyfill["default"].storage.managed.get(keys);
    } catch (e) {
      console.log('get managed failed', e);
    }

    return {};
  });
  return _getFromManagedStorage.apply(this, arguments);
}

function getExtensionId() {
  return _webextensionPolyfill["default"].runtime.id;
}

function notifyPopup(_x5) {
  return _notifyPopup.apply(this, arguments);
}

function _notifyPopup() {
  _notifyPopup = _asyncToGenerator(function* (message) {
    try {
      yield _webextensionPolyfill["default"].runtime.sendMessage(message);
    } catch (_unused) {// Ignore this as can throw an error message when the popup is not open.
    }
  });
  return _notifyPopup.apply(this, arguments);
}

function normalizeTabData(tabData) {
  return tabData;
}

function mergeSavedSettings(settings, results) {
  return Object.assign(settings, results);
}

function getDDGTabUrls() {
  return _getDDGTabUrls.apply(this, arguments);
}

function _getDDGTabUrls() {
  _getDDGTabUrls = _asyncToGenerator(function* () {
    var tabs = (yield _webextensionPolyfill["default"].tabs.query({
      url: 'https://*.duckduckgo.com/*'
    })) || [];
    tabs.forEach(function (tab) {
      _webextensionPolyfill["default"].tabs.insertCSS(tab.id, {
        file: '/public/css/noatb.css'
      });
    });
    return tabs.map(function (tab) {
      return tab.url;
    });
  });
  return _getDDGTabUrls.apply(this, arguments);
}

function setUninstallURL(url) {
  _webextensionPolyfill["default"].runtime.setUninstallURL(url);
}

function changeTabURL(tabId, url) {
  return _webextensionPolyfill["default"].tabs.update(tabId, {
    url: url
  });
}

},{"webextension-polyfill":5}],12:[function(require,module,exports){
"use strict";

module.exports = function (uaString) {
  if (!uaString) uaString = globalThis.navigator.userAgent;
  var browser;
  var version;

  try {
    var parsedUaParts = uaString.match(/(Firefox|Chrome|Edg)\/([0-9]+)/);

    if (uaString.match(/(Edge?)\/([0-9]+)/)) {
      // Above regex matches on Chrome first, so check if this is really Edge
      parsedUaParts = uaString.match(/(Edge?)\/([0-9]+)/);
    }

    browser = parsedUaParts[1];
    version = parsedUaParts[2]; // Brave doesn't include any information in the UserAgent

    if (window.navigator.brave) {
      browser = 'Brave';
    }
  } catch (e) {
    // unlikely, prevent extension from exploding if we don't recognize the UA
    browser = version = '';
  }

  var os = 'o';
  if (globalThis.navigator.userAgent.indexOf('Windows') !== -1) os = 'w';
  if (globalThis.navigator.userAgent.indexOf('Mac') !== -1) os = 'm';
  if (globalThis.navigator.userAgent.indexOf('Linux') !== -1) os = 'l';
  return {
    os: os,
    browser: browser,
    version: version
  };
};

},{}],13:[function(require,module,exports){
"use strict";

var _parseUserAgentString = _interopRequireDefault(require("../../shared-utils/parse-user-agent-string.es6"));

var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var browserInfo = (0, _parseUserAgentString["default"])();

var sendMessage = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (messageType, options) {
    return yield _webextensionPolyfill["default"].runtime.sendMessage({
      messageType: messageType,
      options: options
    });
  });

  return function sendMessage(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var backgroundMessage = function backgroundMessage(thisModel) {
  // listen for messages from background and
  // // notify subscribers
  window.chrome.runtime.onMessage.addListener(function (req, sender) {
    if (sender.id !== chrome.runtime.id) return;
    if (req.allowlistChanged) thisModel.send('allowlistChanged');
    if (req.updateTabData) thisModel.send('updateTabData');
    if (req.didResetTrackersData) thisModel.send('didResetTrackersData', req.didResetTrackersData);
    if (req.closePopup) window.close();
  });
};

var getBackgroundTabData = function getBackgroundTabData() {
  return new Promise(function (resolve, reject) {
    sendMessage('getCurrentTab').then(function (tab) {
      if (tab) {
        sendMessage('getTab', tab.id).then(function (backgroundTabObj) {
          resolve(backgroundTabObj);
        });
      }
    });
  });
};

var search = function search(url) {
  window.chrome.tabs.create({
    url: "https://duckduckgo.com/?q=".concat(url, "&bext=").concat(browserInfo.os, "cr")
  });
};

var getExtensionURL = function getExtensionURL(path) {
  return chrome.runtime.getURL(path);
};

var openExtensionPage = function openExtensionPage(path) {
  window.chrome.tabs.create({
    url: getExtensionURL(path)
  });
};

var openOptionsPage = function openOptionsPage(browser) {
  if (browser === 'moz') {
    openExtensionPage('/html/options.html');
    window.close();
  } else {
    window.chrome.runtime.openOptionsPage();
  }
};

var reloadTab = function reloadTab(id) {
  window.chrome.tabs.reload(id);
};

var closePopup = function closePopup() {
  var w = window.chrome.extension.getViews({
    type: 'popup'
  })[0];
  w.close();
};

module.exports = {
  sendMessage: sendMessage,
  reloadTab: reloadTab,
  closePopup: closePopup,
  backgroundMessage: backgroundMessage,
  getBackgroundTabData: getBackgroundTabData,
  search: search,
  openOptionsPage: openOptionsPage,
  openExtensionPage: openExtensionPage,
  getExtensionURL: getExtensionURL
};

},{"../../shared-utils/parse-user-agent-string.es6":12,"webextension-polyfill":5}],14:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

function Autocomplete(attrs) {
  Parent.call(this, attrs);
}

Autocomplete.prototype = window.$.extend({}, Parent.prototype, {
  modelName: 'autocomplete',
  fetchSuggestions: function fetchSuggestions(searchText) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      // TODO: ajax call here to ddg autocomplete service
      // for now we'll just mock up an async xhr query result:
      _this.suggestions = ["".concat(searchText, " world"), "".concat(searchText, " united"), "".concat(searchText, " famfam")];
      resolve();
    });
  }
});
module.exports = Autocomplete;

},{}],15:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

var browserUIWrapper = require('./../base/ui-wrapper.es6.js');
/**
 * Background messaging is done via two methods:
 *
 * 1. Passive messages from background -> backgroundMessage model -> subscribing model
 *
 *  The background sends these messages using chrome.runtime.sendMessage({'name': 'value'})
 *  The backgroundMessage model (here) receives the message and forwards the
 *  it to the global event store via model.send(msg)
 *  Other modules that are subscribed to state changes in backgroundMessage are notified
 *
 * 2. Two-way messaging using this.model.sendMessage() as a passthrough
 *
 *  Each model can use a sendMessage method to send and receive a response from the background.
 *  Ex: this.model.sendMessage('name', { ... }).then((response) => console.log(response))
 *  Listeners must be registered in the background to respond to messages with this 'name'.
 *
 *  The common sendMessage method is defined in base/model.es6.js
 */


function BackgroundMessage(attrs) {
  Parent.call(this, attrs);
  var thisModel = this;
  browserUIWrapper.backgroundMessage(thisModel);
}

BackgroundMessage.prototype = window.$.extend({}, Parent.prototype, {
  modelName: 'backgroundMessage'
});
module.exports = BackgroundMessage;

},{"./../base/ui-wrapper.es6.js":13}],16:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

function EmailAliasModel(attrs) {
  attrs = attrs || {};
  Parent.call(this, attrs);
}

EmailAliasModel.prototype = window.$.extend({}, Parent.prototype, {
  modelName: 'emailAlias',
  getUserData: function getUserData() {
    return this.sendMessage('getSetting', {
      name: 'userData'
    }).then(function (userData) {
      return userData;
    });
  },
  logout: function logout() {
    var _this = this;

    return this.sendMessage('logout').then(function () {
      return _this.set('userData', undefined);
    });
  }
});
module.exports = EmailAliasModel;

},{}],17:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

function HamburgerMenu(attrs) {
  attrs = attrs || {};
  attrs.tabUrl = '';
  Parent.call(this, attrs);
}

HamburgerMenu.prototype = window.$.extend({}, Parent.prototype, {
  modelName: 'hamburgerMenu'
});
module.exports = HamburgerMenu;

},{}],18:[function(require,module,exports){
"use strict";

module.exports = {
  // Fixes cases like "Amazon.com", which break the company icon
  normalizeCompanyName: function normalizeCompanyName(companyName) {
    companyName = companyName || '';
    var normalizedName = companyName.toLowerCase().replace(/\.[a-z]+$/, '');
    return normalizedName;
  }
};

},{}],19:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

var browserUIWrapper = require('./../base/ui-wrapper.es6.js');

function Search(attrs) {
  Parent.call(this, attrs);
}

Search.prototype = window.$.extend({}, Parent.prototype, {
  modelName: 'search',
  doSearch: function doSearch(s) {
    this.searchText = s;
    s = encodeURIComponent(s);
    console.log("doSearch() for ".concat(s));
    browserUIWrapper.search(s);
  }
});
module.exports = Search;

},{"./../base/ui-wrapper.es6.js":13}],20:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

var normalizeCompanyName = require('./mixins/normalize-company-name.es6');

function SiteCompanyList(attrs) {
  attrs = attrs || {};
  attrs.tab = null;
  attrs.companyListMap = [];
  Parent.call(this, attrs);
}

SiteCompanyList.prototype = window.$.extend({}, Parent.prototype, normalizeCompanyName, {
  modelName: 'siteCompanyList',
  fetchAsyncData: function fetchAsyncData() {
    var _this = this;

    return new Promise(function (resolve, reject) {
      _this.sendMessage('getCurrentTab').then(function (tab) {
        if (tab) {
          _this.sendMessage('getTab', tab.id).then(function (bkgTab) {
            _this.tab = bkgTab;
            _this.domain = _this.tab && _this.tab.site ? _this.tab.site.domain : '';

            _this._updateCompaniesList();

            resolve();
          });
        } else {
          console.debug('SiteDetails model: no tab');
          resolve();
        }
      });
    });
  },
  _updateCompaniesList: function _updateCompaniesList() {
    var _this2 = this;

    // list of all trackers on page (whether we blocked them or not)
    this.trackers = this.tab.trackers || {};
    var companyNames = Object.keys(this.trackers);
    var unknownSameDomainCompany = null; // set trackerlist metadata for list display by company:

    this.companyListMap = companyNames.map(function (companyName) {
      var company = _this2.trackers[companyName];
      var urlsList = company.urls ? Object.keys(company.urls) : []; // Unknown same domain trackers need to be individually fetched and put
      // in the unblocked list

      if (companyName === 'unknown' && _this2.hasUnblockedTrackers(company, urlsList)) {
        unknownSameDomainCompany = _this2.createUnblockedList(company, urlsList);
      } // calc max using pixels instead of % to make margins easier
      // max width: 300 - (horizontal padding in css) = 260


      return {
        name: companyName,
        displayName: company.displayName || companyName,
        normalizedName: _this2.normalizeCompanyName(companyName),
        count: _this2._setCount(company, companyName, urlsList),
        urls: company.urls,
        urlsList: urlsList
      };
    }, this).sort(function (a, b) {
      return b.count - a.count;
    });

    if (unknownSameDomainCompany) {
      this.companyListMap.push(unknownSameDomainCompany);
    }
  },
  // Make ad-hoc unblocked list
  // used to cherry pick unblocked trackers from unknown companies
  // the name is the site domain, count is -2 to show the list at the bottom
  createUnblockedList: function createUnblockedList(company, urlsList) {
    var unblockedTrackers = this.spliceUnblockedTrackers(company, urlsList);
    return {
      name: this.domain,
      iconName: '',
      // we won't have an icon for unknown first party trackers
      count: -2,
      urls: unblockedTrackers,
      urlsList: Object.keys(unblockedTrackers)
    };
  },
  // Return an array of unblocked trackers
  // and remove those entries from the specified company
  // only needed for unknown trackers, so far
  spliceUnblockedTrackers: function spliceUnblockedTrackers(company, urlsList) {
    if (!company || !company.urls || !urlsList) return null;
    return urlsList.filter(function (url) {
      return company.urls[url].isBlocked === false;
    }).reduce(function (unblockedTrackers, url) {
      unblockedTrackers[url] = company.urls[url]; // Update the company urls and urlsList

      delete company.urls[url];
      urlsList.splice(urlsList.indexOf(url), 1);
      return unblockedTrackers;
    }, {});
  },
  // Return true if company has unblocked trackers in the current tab
  hasUnblockedTrackers: function hasUnblockedTrackers(company, urlsList) {
    if (!company || !company.urls || !urlsList) return false;
    return urlsList.some(function (url) {
      return company.urls[url].isBlocked === false;
    });
  },
  // Determines sorting order of the company list
  _setCount: function _setCount(company, companyName, urlsList) {
    var count = company.count; // Unknown trackers, followed by unblocked first party,
    // should be at the bottom of the list

    if (companyName === 'unknown') {
      count = -1;
    } else if (this.hasUnblockedTrackers(company, urlsList)) {
      count = -2;
    }

    return count;
  }
});
module.exports = SiteCompanyList;

},{"./mixins/normalize-company-name.es6":18}],21:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

var constants = require('../../../data/constants');

var httpsMessages = constants.httpsMessages;

var browserUIWrapper = require('./../base/ui-wrapper.es6.js');

var submitBreakageForm = require('./submit-breakage-form.es6'); // for now we consider tracker networks found on more than 7% of sites
// as "major"


var MAJOR_TRACKER_THRESHOLD_PCT = 7;

function Site(attrs) {
  attrs = attrs || {};
  attrs.disabled = true; // disabled by default

  attrs.tab = null;
  attrs.domain = '-';
  attrs.protectionsEnabled = false;
  attrs.isBroken = false;
  attrs.displayBrokenUI = false;
  attrs.isAllowlisted = false;
  attrs.allowlistOptIn = false;
  attrs.isCalculatingSiteRating = true;
  attrs.siteRating = {};
  attrs.httpsState = 'none';
  attrs.httpsStatusText = '';
  attrs.trackersCount = 0; // unique trackers count

  attrs.majorTrackerNetworksCount = 0;
  attrs.totalTrackerNetworksCount = 0;
  attrs.trackerNetworks = [];
  attrs.tosdr = {};
  attrs.isaMajorTrackingNetwork = false;
  Parent.call(this, attrs);
  this.bindEvents([[this.store.subscribe, 'action:backgroundMessage', this.handleBackgroundMsg]]);
}

Site.prototype = window.$.extend({}, Parent.prototype, {
  modelName: 'site',
  getBackgroundTabData: function getBackgroundTabData() {
    var _this = this;

    return new Promise(function (resolve) {
      browserUIWrapper.getBackgroundTabData().then(function (tab) {
        if (tab) {
          _this.set('tab', tab);

          _this.domain = tab.site.domain;

          _this.fetchSiteRating();

          _this.set('tosdr', tab.site.tosdr);

          _this.set('isaMajorTrackingNetwork', tab.site.parentPrevalence >= MAJOR_TRACKER_THRESHOLD_PCT);

          _this.sendMessage('getSetting', {
            name: 'tds-etag'
          }).then(function (etag) {
            return _this.set('tds', etag);
          });
        } else {
          console.debug('Site model: no tab');
        }

        _this.setSiteProperties();

        _this.setHttpsMessage();

        _this.update();

        resolve();
      });
    });
  },
  fetchSiteRating: function fetchSiteRating() {
    var _this2 = this;

    // console.log('[model] fetchSiteRating()')
    if (this.tab) {
      this.sendMessage('getSiteGrade', this.tab.id).then(function (rating) {
        console.log('fetchSiteRating: ', rating);
        if (rating) _this2.update({
          siteRating: rating
        });
      });
    }
  },
  setSiteProperties: function setSiteProperties() {
    if (!this.tab) {
      this.domain = 'new tab'; // tab can be null for firefox new tabs

      this.set({
        isCalculatingSiteRating: false
      });
    } else {
      this.initAllowlisted(this.tab.site.allowlisted, this.tab.site.denylisted);
      this.allowlistOptIn = this.tab.site.allowlistOptIn;

      if (this.tab.site.specialDomainName) {
        this.domain = this.tab.site.specialDomainName; // eg "extensions", "options", "new tab"

        this.set({
          isCalculatingSiteRating: false
        });
      } else {
        this.set({
          disabled: false
        });
      }
    }

    if (this.domain && this.domain === '-') this.set('disabled', true);
  },
  setHttpsMessage: function setHttpsMessage() {
    if (!this.tab) return;

    if (this.tab.upgradedHttps) {
      this.httpsState = 'upgraded';
    } else if (/^https/.exec(this.tab.url)) {
      this.httpsState = 'secure';
    } else {
      this.httpsState = 'none';
    }

    this.httpsStatusText = httpsMessages[this.httpsState];
  },
  handleBackgroundMsg: function handleBackgroundMsg(message) {
    var _this3 = this;

    // console.log('[model] handleBackgroundMsg()')
    if (!this.tab) return;

    if (message.action && message.action === 'updateTabData') {
      this.sendMessage('getTab', this.tab.id).then(function (backgroundTabObj) {
        _this3.tab = backgroundTabObj;

        _this3.update();

        _this3.fetchSiteRating();
      });
    }
  },
  // calls `this.set()` to trigger view re-rendering
  update: function update(ops) {
    // console.log('[model] update()')
    if (this.tab) {
      // got siteRating back from background process
      if (ops && ops.siteRating && ops.siteRating.site && ops.siteRating.enhanced) {
        var before = ops.siteRating.site.grade;
        var after = ops.siteRating.enhanced.grade; // we don't currently show D- grades

        if (before === 'D-') before = 'D';
        if (after === 'D-') after = 'D';

        if (before !== this.siteRating.before || after !== this.siteRating.after) {
          var newSiteRating = {
            cssBefore: before.replace('+', '-plus').toLowerCase(),
            cssAfter: after.replace('+', '-plus').toLowerCase(),
            before: before,
            after: after
          };
          this.set({
            siteRating: newSiteRating,
            isCalculatingSiteRating: false
          });
        } else if (this.isCalculatingSiteRating) {
          // got site rating from background process
          this.set('isCalculatingSiteRating', false);
        }
      }

      var newTrackersCount = this.getUniqueTrackersCount();

      if (newTrackersCount !== this.trackersCount) {
        this.set('trackersCount', newTrackersCount);
      }

      var newTrackersBlockedCount = this.getUniqueTrackersBlockedCount();

      if (newTrackersBlockedCount !== this.trackersBlockedCount) {
        this.set('trackersBlockedCount', newTrackersBlockedCount);
      }

      var newTrackerNetworks = this.getTrackerNetworksOnPage();

      if (this.trackerNetworks.length === 0 || newTrackerNetworks.length !== this.trackerNetworks.length) {
        this.set('trackerNetworks', newTrackerNetworks);
      }

      var newUnknownTrackersCount = this.getUnknownTrackersCount();
      var newTotalTrackerNetworksCount = newUnknownTrackersCount + newTrackerNetworks.length;

      if (newTotalTrackerNetworksCount !== this.totalTrackerNetworksCount) {
        this.set('totalTrackerNetworksCount', newTotalTrackerNetworksCount);
      }

      var newMajorTrackerNetworksCount = this.getMajorTrackerNetworksCount();

      if (newMajorTrackerNetworksCount !== this.majorTrackerNetworksCount) {
        this.set('majorTrackerNetworksCount', newMajorTrackerNetworksCount);
      }
    }
  },
  getUniqueTrackersCount: function getUniqueTrackersCount() {
    var _this4 = this;

    // console.log('[model] getUniqueTrackersCount()')
    var count = Object.keys(this.tab.trackers).reduce(function (total, name) {
      return _this4.tab.trackers[name].count + total;
    }, 0);
    return count;
  },
  getUniqueTrackersBlockedCount: function getUniqueTrackersBlockedCount() {
    var _this5 = this;

    // console.log('[model] getUniqueTrackersBlockedCount()')
    var count = Object.keys(this.tab.trackersBlocked).reduce(function (total, name) {
      var companyBlocked = _this5.tab.trackersBlocked[name]; // Don't throw a TypeError if urls are not there

      var trackersBlocked = companyBlocked.urls ? Object.keys(companyBlocked.urls) : null; // Counting unique URLs instead of using the count
      // because the count refers to all requests rather than unique number of trackers

      var trackersBlockedCount = trackersBlocked ? trackersBlocked.length : 0;
      return trackersBlockedCount + total;
    }, 0);
    return count;
  },
  getUnknownTrackersCount: function getUnknownTrackersCount() {
    // console.log('[model] getUnknownTrackersCount()')
    var unknownTrackers = this.tab.trackers ? this.tab.trackers.unknown : {};
    var count = 0;

    if (unknownTrackers && unknownTrackers.urls) {
      var unknownTrackersUrls = Object.keys(unknownTrackers.urls);
      count = unknownTrackersUrls ? unknownTrackersUrls.length : 0;
    }

    return count;
  },
  getMajorTrackerNetworksCount: function getMajorTrackerNetworksCount() {
    // console.log('[model] getMajorTrackerNetworksCount()')
    // Show only blocked major trackers count, unless site is allowlisted
    var trackers = this.protectionsEnabled ? this.tab.trackersBlocked : this.tab.trackers;
    var count = Object.values(trackers).reduce(function (total, t) {
      var isMajor = t.prevalence > MAJOR_TRACKER_THRESHOLD_PCT;
      total += isMajor ? 1 : 0;
      return total;
    }, 0);
    return count;
  },
  getTrackerNetworksOnPage: function getTrackerNetworksOnPage() {
    // console.log('[model] getMajorTrackerNetworksOnPage()')
    // all tracker networks found on this page/tab
    var networks = Object.keys(this.tab.trackers).map(function (t) {
      return t.toLowerCase();
    }).filter(function (t) {
      return t !== 'unknown';
    });
    return networks;
  },
  initAllowlisted: function initAllowlisted(allowListValue, denyListValue) {
    this.isAllowlisted = allowListValue;
    this.isDenylisted = denyListValue;
    this.isBroken = this.tab.site.isBroken || !this.tab.site.enabledFeatures.includes('contentBlocking');
    this.displayBrokenUI = this.isBroken;

    if (denyListValue) {
      this.displayBrokenUI = false;
      this.protectionsEnabled = true;
    } else {
      this.protectionsEnabled = !(this.isAllowlisted || this.isBroken);
    }

    this.set('protectionsEnabled', this.protectionsEnabled);
  },
  setList: function setList(list, domain, value) {
    this.sendMessage('setList', {
      list: list,
      domain: domain,
      value: value
    });
  },
  toggleAllowlist: function toggleAllowlist() {
    if (this.tab && this.tab.site) {
      if (this.isBroken) {
        this.initAllowlisted(this.isAllowlisted, !this.isDenylisted);
        this.setList('denylisted', this.tab.site.domain, this.isDenylisted);
      } else {
        // Explicitly remove all denylisting if the site is broken. This covers the case when the site has been removed from the list.
        this.setList('denylisted', this.tab.site.domain, false);
        this.initAllowlisted(!this.isAllowlisted);

        if (this.isAllowlisted && this.allowlistOptIn) {
          this.set('allowlistOptIn', false);
          this.setList('allowlistOptIn', this.tab.site.domain, false);
        }

        this.setList('allowlisted', this.tab.site.domain, this.isAllowlisted);
      }
    }
  },
  submitBreakageForm: submitBreakageForm
});
module.exports = Site;

},{"../../../data/constants":6,"./../base/ui-wrapper.es6.js":13,"./submit-breakage-form.es6":22}],22:[function(require,module,exports){
"use strict";

module.exports = function (category) {
  if (!this.tab) return;
  var blockedTrackers = [];
  var surrogates = [];
  var upgradedHttps = this.tab.upgradedHttps; // remove params and fragments from url to avoid including sensitive data

  var siteUrl = this.tab.url.split('?')[0].split('#')[0];
  var trackerObjects = this.tab.trackersBlocked;
  var brokenSiteParams = [{
    category: category
  }, {
    siteUrl: encodeURIComponent(siteUrl)
  }, {
    upgradedHttps: upgradedHttps.toString()
  }, {
    tds: this.tds
  }];

  var _loop = function _loop(tracker) {
    var trackerDomains = trackerObjects[tracker].urls;
    Object.keys(trackerDomains).forEach(function (domain) {
      if (trackerDomains[domain].isBlocked) {
        blockedTrackers.push(domain);

        if (trackerDomains[domain].reason === 'matched rule - surrogate') {
          surrogates.push(domain);
        }
      }
    });
  };

  for (var tracker in trackerObjects) {
    _loop(tracker);
  }

  brokenSiteParams.push({
    blockedTrackers: blockedTrackers
  }, {
    surrogates: surrogates
  });
  this.submitBrokenSiteReport(brokenSiteParams); // remember that user opted into sharing site breakage data
  // for this domain, so that we can attach domain when they
  // remove site from allowlist

  this.set('allowlistOptIn', true);
  this.sendMessage('allowlistOptIn', {
    list: 'allowlistOptIn',
    domain: this.tab.site.domain,
    value: true
  });
};

},{}],23:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

var normalizeCompanyName = require('./mixins/normalize-company-name.es6');

function TopBlocked(attrs) {
  attrs = attrs || {}; // eslint-disable-next-line no-self-assign

  attrs.numCompanies = attrs.numCompanies;
  attrs.companyList = [];
  attrs.companyListMap = [];
  attrs.pctPagesWithTrackers = null;
  attrs.lastStatsResetDate = null;
  Parent.call(this, attrs);
}

TopBlocked.prototype = window.$.extend({}, Parent.prototype, normalizeCompanyName, {
  modelName: 'topBlocked',
  getTopBlocked: function getTopBlocked() {
    var _this = this;

    return new Promise(function (resolve, reject) {
      _this.sendMessage('getTopBlockedByPages', _this.numCompanies).then(function (data) {
        if (!data.totalPages || data.totalPages < 30) return resolve();
        if (!data.topBlocked || data.topBlocked.length < 1) return resolve();
        _this.companyList = data.topBlocked;
        _this.companyListMap = _this.companyList.map(function (company) {
          return {
            name: company.name,
            displayName: company.displayName,
            normalizedName: _this.normalizeCompanyName(company.name),
            percent: company.percent,
            // calc graph bars using pixels instead of % to
            // make margins easier
            // max width: 145px
            px: Math.floor(company.percent / 100 * 145)
          };
        });

        if (data.pctPagesWithTrackers) {
          _this.pctPagesWithTrackers = data.pctPagesWithTrackers;

          if (data.lastStatsResetDate) {
            _this.lastStatsResetDate = data.lastStatsResetDate;
          }
        }

        resolve();
      });
    });
  },
  reset: function reset(resetDate) {
    this.companyList = [];
    this.companyListMap = [];
    this.pctPagesWithTrackers = null;
    this.lastStatsResetDate = resetDate;
  }
});
module.exports = TopBlocked;

},{"./mixins/normalize-company-name.es6":18}],24:[function(require,module,exports){
"use strict";

module.exports = {
  setBrowserClassOnBodyTag: require('./set-browser-class.es6.js'),
  parseQueryString: require('./parse-query-string.es6.js')
};

},{"./parse-query-string.es6.js":25,"./set-browser-class.es6.js":26}],25:[function(require,module,exports){
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = {
  parseQueryString: function parseQueryString(qs) {
    if (typeof qs !== 'string') {
      throw new Error('tried to parse a non-string query string');
    }

    var parsed = {};

    if (qs[0] === '?') {
      qs = qs.substr(1);
    }

    var parts = qs.split('&');
    parts.forEach(function (part) {
      var _part$split = part.split('='),
          _part$split2 = _slicedToArray(_part$split, 2),
          key = _part$split2[0],
          val = _part$split2[1];

      if (key && val) {
        parsed[key] = val;
      }
    });
    return parsed;
  }
};

},{}],26:[function(require,module,exports){
"use strict";

module.exports = {
  setBrowserClassOnBodyTag: function setBrowserClassOnBodyTag() {
    window.chrome.runtime.sendMessage({
      messageType: 'getBrowser'
    }, function (browserName) {
      if (['edg', 'edge', 'brave'].includes(browserName)) {
        browserName = 'chrome';
      }

      var browserClass = 'is-browser--' + browserName;
      window.$('html').addClass(browserClass);
      window.$('body').addClass(browserClass);
    });
  }
};

},{}],27:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Page;

var mixins = require('./mixins/index.es6.js');

var HamburgerMenuView = require('./../views/hamburger-menu.es6.js');

var HamburgerMenuModel = require('./../models/hamburger-menu.es6.js');

var hamburgerMenuTemplate = require('./../templates/hamburger-menu.es6.js');

var TopBlockedView = require('./../views/top-blocked-truncated.es6.js');

var TopBlockedModel = require('./../models/top-blocked.es6.js');

var topBlockedTemplate = require('./../templates/top-blocked-truncated.es6.js');

var SiteView = require('./../views/site.es6.js');

var SiteModel = require('./../models/site.es6.js');

var siteTemplate = require('./../templates/site.es6.js');

var SearchView = require('./../views/search.es6.js');

var SearchModel = require('./../models/search.es6.js');

var searchTemplate = require('./../templates/search.es6.js');

var AutocompleteView = require('./../views/autocomplete.es6.js');

var AutocompleteModel = require('./../models/autocomplete.es6.js');

var autocompleteTemplate = require('./../templates/autocomplete.es6.js');

var BackgroundMessageModel = require('./../models/background-message.es6.js');

var EmailAliasView = require('../views/email-alias.es6.js');

var EmailAliasModel = require('../models/email-alias.es6.js');

var EmailAliasTemplate = require('../templates/email-alias.es6.js');

function Trackers(ops) {
  this.$parent = window.$('#popup-container');
  Parent.call(this, ops);
}

Trackers.prototype = window.$.extend({}, Parent.prototype, mixins.setBrowserClassOnBodyTag, {
  pageName: 'popup',
  ready: function ready() {
    Parent.prototype.ready.call(this);
    this.message = new BackgroundMessageModel();
    this.setBrowserClassOnBodyTag();
    this.views.search = new SearchView({
      pageView: this,
      model: new SearchModel({
        searchText: ''
      }),
      appendTo: window.$('#search-form-container'),
      template: searchTemplate
    });
    this.views.hamburgerMenu = new HamburgerMenuView({
      pageView: this,
      model: new HamburgerMenuModel(),
      appendTo: window.$('#hamburger-menu-container'),
      template: hamburgerMenuTemplate
    });
    this.views.site = new SiteView({
      pageView: this,
      model: new SiteModel(),
      appendTo: window.$('#site-info-container'),
      template: siteTemplate
    });
    this.views.topblocked = new TopBlockedView({
      pageView: this,
      model: new TopBlockedModel({
        numCompanies: 3
      }),
      appendTo: window.$('#top-blocked-container'),
      template: topBlockedTemplate
    });
    this.views.emailAlias = new EmailAliasView({
      pageView: this,
      model: new EmailAliasModel(),
      appendTo: window.$('#email-alias-container'),
      template: EmailAliasTemplate
    }); // TODO: hook up model query to actual ddg ac endpoint.
    // For now this is just here to demonstrate how to
    // listen to another component via model.set() +
    // store.subscribe()

    this.views.autocomplete = new AutocompleteView({
      pageView: this,
      model: new AutocompleteModel({
        suggestions: []
      }),
      // appendTo: this.views.search.$el,
      appendTo: null,
      template: autocompleteTemplate
    });
  }
}); // kickoff!

window.DDG = window.DDG || {};
window.DDG.page = new Trackers();

},{"../models/email-alias.es6.js":16,"../templates/email-alias.es6.js":30,"../views/email-alias.es6.js":55,"./../models/autocomplete.es6.js":14,"./../models/background-message.es6.js":15,"./../models/hamburger-menu.es6.js":17,"./../models/search.es6.js":19,"./../models/site.es6.js":21,"./../models/top-blocked.es6.js":23,"./../templates/autocomplete.es6.js":28,"./../templates/hamburger-menu.es6.js":32,"./../templates/search.es6.js":34,"./../templates/site.es6.js":47,"./../templates/top-blocked-truncated.es6.js":50,"./../views/autocomplete.es6.js":53,"./../views/hamburger-menu.es6.js":57,"./../views/search.es6.js":61,"./../views/site.es6.js":62,"./../views/top-blocked-truncated.es6.js":64,"./mixins/index.es6.js":24}],28:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function () {
  // TODO/REMOVE: remove marginTop style tag once this is actually hooked up
  // this is just to demo model store for now!
  //  -> this is gross, don't do this:
  var marginTop = this.model.suggestions && this.model.suggestions.length > 0 ? 'margin-top: 50px;' : '';
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<ul class=\"js-autocomplete\" style=\"", "\">\n        ", "\n    </ul>"])), marginTop, this.model.suggestions.map(function (suggestion) {
    return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n            <li><a href=\"javascript:void(0)\">", "</a></li>"])), suggestion);
  }));
};

},{"bel":2}],29:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var categories = [{
  category: 'Video or images didn\'t load',
  value: 'images'
}, {
  category: 'Content is missing',
  value: 'content'
}, {
  category: 'Links or buttons don\'t work',
  value: 'links'
}, {
  category: 'Can\'t sign in',
  value: 'login'
}, {
  category: 'Site asked me to disable the extension',
  value: 'paywall'
}];

function shuffle(arr) {
  var len = arr.length;
  var temp;
  var index;

  while (len > 0) {
    index = Math.floor(Math.random() * len);
    len--;
    temp = arr[len];
    arr[len] = arr[index];
    arr[index] = temp;
  }

  return arr;
}

module.exports = function () {
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div class=\"breakage-form js-breakage-form\">\n    <div class=\"breakage-form__content\">\n        <nav class=\"breakage-form__close-container\">\n            <a href=\"javascript:void(0)\" class=\"icon icon__close js-breakage-form-close\" role=\"button\" aria-label=\"Dismiss form\"></a>\n        </nav>\n        <div class=\"form__icon--wrapper\">\n            <div class=\"form__icon\"></div>\n        </div>\n        <div class=\"breakage-form__element js-breakage-form-element\">\n            <h2 class=\"breakage-form__title\">Something broken?</h2>\n            <div class=\"breakage-form__explanation\">Submitting an anonymous broken site report helps us debug these issues and improve the extension.</div>\n            <div class=\"form__select breakage-form__input--dropdown\">\n                <select class=\"js-breakage-form-dropdown\">\n                    <option value='unspecified' disabled selected>Select a category (optional)</option>\n                    ", "\n                    <option value='other'>Something else</option>\n                </select>\n            </div>\n            <btn class=\"form__submit js-breakage-form-submit\" role=\"button\">Send report</btn>\n            <div class=\"breakage-form__footer\">Reports sent to DuckDuckGo are 100% anonymous and only include your selection above, the URL, and a list of trackers we found on the site.</div>\n        </div>\n        <div class=\"breakage-form__message js-breakage-form-message is-transparent\">\n            <h2 class=\"breakage-form__success--title\">Thank you!</h2>\n            <div class=\"breakage-form__success--message\">Your report will help improve the extension and make the experience better for other people.</div>\n        </div>\n    </div>\n</div>"])), shuffle(categories).map(function (item) {
    return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<option value=", ">", "</option>"])), item.value, item.category);
  }));
};

},{"bel":2}],30:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function () {
  if (this.model.userData && this.model.userData.nextAlias) {
    return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n            <div class=\"js-email-alias email-alias-block padded\">\n                <span class=\"email-alias__icon\"></span>\n                <a href=\"#\" class=\"link-secondary bold\">\n                    <span class=\"text-line-after-icon\">\n                        Create new Duck Address\n                        <span class=\"js-alias-copied alias-copied-label\">Copied to clipboard</span>\n                    </span>\n                </a>\n            </div>"])));
  }

  return null;
};

},{"bel":2}],31:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var reasons = require('./shared/grade-scorecard-reasons.es6.js');

var grades = require('./shared/grade-scorecard-grades.es6.js');

var ratingHero = require('./shared/rating-hero.es6.js');

module.exports = function () {
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<section class=\"sliding-subview grade-scorecard sliding-subview--has-fixed-header\">\n    <div class=\"site-info site-info--full-height card\">\n        ", "\n        ", "\n        ", "\n    </div>\n</section>"])), ratingHero(this.model, {
    showClose: true
  }), reasons(this.model), grades(this.model));
};

},{"./shared/grade-scorecard-grades.es6.js":35,"./shared/grade-scorecard-reasons.es6.js":36,"./shared/rating-hero.es6.js":40,"bel":2}],32:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function () {
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<nav class=\"hamburger-menu js-hamburger-menu is-hidden\">\n    <div class=\"hamburger-menu__bg\"></div>\n    <div class=\"hamburger-menu__content card padded\">\n        <h2 class=\"menu-title border--bottom hamburger-menu__content__more-options\">\n            More options\n        </h2>\n        <nav class=\"pull-right hamburger-menu__close-container\">\n            <a href=\"javascript:void(0)\" class=\"icon icon__close js-hamburger-menu-close\" role=\"button\" aria-label=\"Close options\"></a>\n        </nav>\n        <ul class=\"hamburger-menu__links padded default-list\">\n            <li>\n                <a href=\"javascript:void(0)\" class=\"menu-title js-hamburger-menu-options-link\">\n                    Settings\n                    <span>Manage Unprotected Sites and other options.</span>\n                </a>\n            </li>\n            <li>\n                <a href=\"javascript:void(0)\" class=\"menu-title js-hamburger-menu-feedback-link\">\n                    Share feedback\n                    <span>Got issues or suggestions? Let us know!</span>\n                </a>\n            </li>\n            <li>\n                <a href=\"javascript:void(0)\" class=\"menu-title js-hamburger-menu-broken-site-link\">\n                    Report broken site\n                    <span>If a site's not working, please tell us.</span>\n                </a>\n            </li>\n            <li class=\"is-hidden\" id=\"debugger-panel\">\n                <a href=\"javascript:void(0)\" class=\"menu-title js-hamburger-menu-debugger-panel-link\">\n                    Protection debugger panel\n                    <span>Debug privacy protections on a page.</span>\n                </a>\n            </li>\n        </ul>\n    </div>\n</nav>"])));
};

},{"bel":2}],33:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var hero = require('./shared/hero.es6.js');

var statusList = require('./shared/status-list.es6.js');

var constants = require('../../../data/constants');

var link = require('./shared/link.es6.js');

function upperCaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = function () {
  var domain = this.model && this.model.domain;
  var tosdr = this.model && this.model.tosdr;
  var tosdrMsg = tosdr && tosdr.message || constants.tosdrMessages.unknown;
  var tosdrStatus = tosdrMsg.toLowerCase();
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<section class=\"sliding-subview sliding-subview--has-fixed-header\">\n    <div class=\"privacy-practices site-info site-info--full-height card\">\n        <div class=\"js-privacy-practices-hero\">\n            ", "\n        </div>\n        <div class=\"privacy-practices__explainer padded border--bottom--inner\n            text--center\">\n            Privacy practices indicate how much the personal information\n            that you share with a website is protected.\n        </div>\n        <div class=\"privacy-practices__details padded\n            js-privacy-practices-details\">\n            ", "\n        </div>\n        <div class=\"privacy-practices__attrib padded text--center border--top--inner\">\n            Privacy Practices from ", ".\n        </div>\n    </div>\n</section>"])), hero({
    status: tosdrStatus,
    title: domain,
    subtitle: "".concat(tosdrMsg, " Privacy Practices"),
    showClose: true
  }), tosdr && tosdr.reasons ? renderDetails(tosdr.reasons) : renderNoDetails(), link('https://tosdr.org/', {
    className: 'bold',
    target: '_blank',
    text: 'ToS;DR',
    attributes: {
      'aria-label': 'Terms of Service; Didn\'t Read'
    }
  }));
};

function renderDetails(reasons) {
  var good = reasons.good || [];
  var bad = reasons.bad || [];
  if (!good.length && !bad.length) return renderNoDetails(); // convert arrays to work for the statusList template,
  // which use objects

  good = good.map(function (item) {
    return {
      msg: upperCaseFirst(item),
      modifier: 'good'
    };
  });
  bad = bad.map(function (item) {
    return {
      msg: upperCaseFirst(item),
      modifier: 'bad'
    };
  }); // list good first, then bad

  return statusList(good.concat(bad));
}

function renderNoDetails() {
  return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<div class=\"text--center\">\n    <h1 class=\"privacy-practices__details__title\">\n        No privacy practices found\n    </h1>\n    <div class=\"privacy-practices__details__msg\">\n        The privacy practices of this website have not been reviewed.\n    </div>\n</div>"])));
}

},{"../../../data/constants":6,"./shared/hero.es6.js":38,"./shared/link.es6.js":39,"./shared/status-list.es6.js":42,"bel":2}],34:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var hamburgerButton = require('./shared/hamburger-button.es6.js');

module.exports = function () {
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    <form class=\"sliding-subview__header search-form js-search-form\" name=\"x\">\n        <input type=\"text\" autocomplete=\"off\" placeholder=\"Search DuckDuckGo\"\n            name=\"q\" class=\"search-form__input js-search-input\"\n            value=\"", "\" />\n        <input class=\"search-form__go js-search-go\" value=\"\" type=\"submit\" aria-label=\"Search\" />\n        ", "\n    </form>"])), this.model.searchText, hamburgerButton('js-search-hamburger-button'));
};

},{"./shared/hamburger-button.es6.js":37,"bel":2}],35:[function(require,module,exports){
"use strict";

var statusList = require('./status-list.es6.js');

module.exports = function (site) {
  var grades = getGrades(site.siteRating, site.isAllowlisted);
  if (!grades || !grades.length) return;
  return statusList(grades, 'status-list--right padded js-grade-scorecard-grades');
};

function getGrades(rating, isAllowlisted) {
  if (!rating || !rating.before || !rating.after) return; // transform site ratings into grades
  // that the template can display more easily

  var before = rating.cssBefore;
  var after = rating.cssAfter;
  var grades = [];
  grades.push({
    msg: 'Privacy Grade',
    modifier: before.toLowerCase()
  });

  if (before !== after && !isAllowlisted) {
    grades.push({
      msg: 'Enhanced Grade',
      modifier: after.toLowerCase(),
      highlight: true
    });
  }

  return grades;
}

},{"./status-list.es6.js":42}],36:[function(require,module,exports){
"use strict";

var statusList = require('./status-list.es6.js');

var constants = require('../../../../data/constants');

var trackerNetworksText = require('./tracker-networks-text.es6.js');

module.exports = function (site) {
  var reasons = getReasons(site);
  if (!reasons || !reasons.length) return;
  return statusList(reasons, 'status-list--right padded border--bottom--inner js-grade-scorecard-reasons');
};

function getReasons(site) {
  var reasons = []; // grab all the data from the site to create
  // a list of reasons behind the grade
  // encryption status

  var httpsState = site.httpsState;

  if (httpsState) {
    var _modifier = httpsState === 'none' ? 'bad' : 'good';

    reasons.push({
      modifier: _modifier,
      msg: site.httpsStatusText
    });
  } // tracking networks blocked or found,
  // only show a message if there's any


  var trackersCount = site.isAllowlisted ? site.trackersCount : site.trackersBlockedCount;
  var trackersBadOrGood = trackersCount !== 0 ? 'bad' : 'good';
  reasons.push({
    modifier: trackersBadOrGood,
    msg: "".concat(trackerNetworksText(site))
  }); // major tracking networks,
  // only show a message if there are any

  var majorTrackersBadOrGood = site.majorTrackerNetworksCount !== 0 ? 'bad' : 'good';
  reasons.push({
    modifier: majorTrackersBadOrGood,
    msg: "".concat(trackerNetworksText(site, true))
  }); // Is the site itself a major tracking network?
  // only show a message if it is

  if (site.isaMajorTrackingNetwork) {
    reasons.push({
      modifier: 'bad',
      msg: 'Site Is a Major Tracker Network'
    });
  } // privacy practices from tosdr


  var unknownPractices = constants.tosdrMessages.unknown;
  var privacyMessage = site.tosdr && site.tosdr.message || unknownPractices;
  var modifier = privacyMessage === unknownPractices ? 'poor' : privacyMessage.toLowerCase();
  reasons.push({
    modifier: modifier,
    msg: "".concat(privacyMessage, " Privacy Practices")
  });
  return reasons;
}

},{"../../../../data/constants":6,"./status-list.es6.js":42,"./tracker-networks-text.es6.js":46}],37:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function (klass) {
  klass = klass || '';
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<button type=\"button\" class=\"hamburger-button ", "\" aria-label=\"More options\">\n    <span></span>\n    <span></span>\n    <span></span>\n</button>"])), klass);
};

},{"bel":2}],38:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function (ops) {
  var slidingSubviewClass = ops.showClose ? 'js-sliding-subview-close' : '';
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div class=\"hero text--center ", "\">\n    <div class=\"hero__icon hero__icon--", "\">\n    </div>\n    <h1 class=\"hero__title\">\n        ", "\n    </h1>\n    <h2 class=\"hero__subtitle ", "\" aria-label=\"", "\">\n        ", "\n    </h2>\n    ", "\n</div>"])), slidingSubviewClass, ops.status, ops.title, ops.subtitle === '' ? 'is-hidden' : '', ops.subtitleLabel ? ops.subtitleLabel : ops.subtitle, ops.subtitle, renderOpenOrCloseButton(ops.showClose));
};

function renderOpenOrCloseButton(isCloseButton) {
  var openOrClose = isCloseButton ? 'close' : 'open';
  var arrowIconClass = isCloseButton ? 'icon__arrow--left' : '';
  return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<a href=\"javascript:void(0)\"\n        class=\"hero__", "\"\n        role=\"button\"\n        aria-label=\"", "\"\n        >\n    <span class=\"icon icon__arrow icon__arrow--large ", "\">\n    </span>\n</a>"])), openOrClose, isCloseButton ? 'Go back' : 'More details', arrowIconClass);
}

},{"bel":2}],39:[function(require,module,exports){
"use strict";

/* Generates a link tag
 * url: href url
 * options: any a tag attribute
 */
module.exports = function (url, options) {
  var a = document.createElement('a');
  a.href = url; // attributes for the <a> tag, e.g. "aria-label"

  if (options.attributes) {
    for (var attr in options.attributes) {
      a.setAttribute(attr, options.attributes[attr]);
    }

    delete options.attributes;
  }

  for (var key in options) {
    a[key] = options[key];
  }

  return a;
};

},{}],40:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2, _templateObject3;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var hero = require('./hero.es6.js');

module.exports = function (site, ops) {
  var status = siteRatingStatus(site.isCalculatingSiteRating, site.siteRating, site.isAllowlisted);
  var subtitle = siteRatingSubtitle(site.isCalculatingSiteRating, site.siteRating, site.isAllowlisted, site.isBroken);
  var label = subtitleLabel(site.isCalculatingSiteRating, site.siteRating, site.isAllowlisted);
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div class=\"rating-hero-container js-rating-hero\">\n     ", "\n</div>"])), hero({
    status: status,
    title: site.domain,
    subtitle: subtitle,
    subtitleLabel: label,
    showClose: ops.showClose,
    showOpen: ops.showOpen
  }));
};

function siteRatingStatus(isCalculating, rating, isAllowlisted) {
  var status;
  var isActive = '';

  if (isCalculating) {
    status = 'calculating';
  } else if (rating && rating.before) {
    isActive = isAllowlisted ? '' : '--active';

    if (isActive && rating.after) {
      status = rating.cssAfter;
    } else {
      status = rating.cssBefore;
    }
  } else {
    status = 'null';
  }

  return status + isActive;
}

function siteRatingSubtitle(isCalculating, rating, isAllowlisted, isBroken) {
  var isActive = true;

  if (isBroken) {
    return '';
  }

  if (isAllowlisted) isActive = false; // site grade/rating was upgraded by extension

  if (isActive && rating && rating.before && rating.after) {
    if (rating.before !== rating.after) {
      // wrap this in a single root span otherwise bel complains
      return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<span>Site enhanced from\n    <span class=\"rating-letter rating-letter--", "\">\n    </span>\n</span>"])), rating.cssBefore);
    }
  } // deal with other states


  var msg = 'Privacy Grade'; // site is allowlisted

  if (!isActive) {
    msg = 'Privacy Protection Disabled'; // "null" state (empty tab, browser's "about:" pages)
  } else if (!isCalculating && !rating.before && !rating.after) {
    msg = 'We only grade regular websites'; // rating is still calculating
  } else if (isCalculating) {
    msg = 'Calculating...';
  }

  return bel(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["", ""])), msg);
} // to avoid duplicating messages between the icon and the subtitle,
// we combine information for both here


function subtitleLabel(isCalculating, rating, isAllowlisted) {
  if (isCalculating) return;

  if (isAllowlisted && rating.before) {
    return "Privacy Protection Disabled, Privacy Grade ".concat(rating.before);
  }

  if (rating.before && rating.before === rating.after) {
    return "Privacy Grade ".concat(rating.before);
  }

  if (rating.before && rating.after) {
    return "Site enhanced from ".concat(rating.before);
  }
}

},{"./hero.es6.js":38,"bel":2}],41:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var hamburgerButton = require('./hamburger-button.es6.js');

module.exports = function (title) {
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<nav class=\"sliding-subview__header card\">\n    <a href=\"javascript:void(0)\" class=\"sliding-subview__header__back\n        sliding-subview__header__back--is-icon\n        js-sliding-subview-close\">\n        <span class=\"icon icon__arrow icon__arrow--left pull-left\">\n        </span>\n    </a>\n    <h2 class=\"sliding-subview__header__title\">\n        ", "\n    </h2>\n    ", "\n</nav>"])), title, hamburgerButton());
};

},{"./hamburger-button.es6.js":37,"bel":2}],42:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function (items, extraClasses) {
  extraClasses = extraClasses || '';
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<ul class=\"status-list ", "\">\n    ", "\n</ul>"])), extraClasses, items.map(renderItem));
};

function renderItem(item) {
  return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<li class=\"status-list__item status-list__item--", "\n    bold ", "\">\n    ", "\n</li>"])), item.modifier, item.highlight ? 'is-highlighted' : '', item.msg);
}

},{"bel":2}],43:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function (isActiveBoolean, klass, dataKey) {
  // make `klass` and `dataKey` optional:
  klass = klass || '';
  dataKey = dataKey || '';
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n<button class=\"toggle-button toggle-button--is-active-", " ", "\"\n    data-key=\"", "\"\n    type=\"button\"\n    aria-pressed=\"", "\"\n    >\n    <div class=\"toggle-button__bg\">\n    </div>\n    <div class=\"toggle-button__knob\"></div>\n</button>"])), isActiveBoolean, klass, dataKey, isActiveBoolean ? 'true' : 'false');
};

},{"bel":2}],44:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function () {
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div class=\"top-blocked__no-data\">\n    <div class=\"top-blocked__no-data__graph\">\n        <span class=\"top-blocked__no-data__graph__bar one\"></span>\n        <span class=\"top-blocked__no-data__graph__bar two\"></span>\n        <span class=\"top-blocked__no-data__graph__bar three\"></span>\n        <span class=\"top-blocked__no-data__graph__bar four\"></span>\n    </div>\n    <p class=\"top-blocked__no-data__lead text-center\">Tracker Networks Top Offenders</p>\n    <p>No data available yet</p>\n</div>"])));
};

},{"bel":2}],45:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function (siteRating, isAllowlisted, totalTrackerNetworksCount) {
  var iconNameModifier = 'blocked';

  if (isAllowlisted && siteRating.before === 'D' && totalTrackerNetworksCount !== 0) {
    iconNameModifier = 'warning';
  }

  var iconName = 'major-networks-' + iconNameModifier;
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["", ""])), iconName);
};

},{"bel":2}],46:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function (site, isMajorNetworksCount) {
  // Show all trackers found if site is allowlisted
  // but only show the blocked ones otherwise
  var trackersCount = site.isAllowlisted ? site.trackersCount : site.trackersBlockedCount || 0;
  var uniqueTrackersText = trackersCount === 1 ? ' Tracker ' : ' Trackers ';

  if (isMajorNetworksCount) {
    trackersCount = site.majorTrackerNetworksCount;
    uniqueTrackersText = trackersCount === 1 ? ' Major Tracker Network ' : ' Major Tracker Networks ';
  }

  var finalText = trackersCount + uniqueTrackersText + trackersBlockedOrFound(site, trackersCount);
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["", ""])), finalText);
};

function trackersBlockedOrFound(site, trackersCount) {
  var msg = '';

  if (site && (site.isAllowlisted || trackersCount === 0)) {
    msg = 'Found';
  } else {
    msg = 'Blocked';
  }

  return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["", ""])), msg);
}

},{"bel":2}],47:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2, _templateObject3;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var toggleButton = require('./shared/toggle-button.es6.js');

var ratingHero = require('./shared/rating-hero.es6.js');

var trackerNetworksIcon = require('./shared/tracker-network-icon.es6.js');

var trackerNetworksText = require('./shared/tracker-networks-text.es6.js');

var constants = require('../../../data/constants');

module.exports = function () {
  var tosdrMsg = this.model.tosdr && this.model.tosdr.message || constants.tosdrMessages.unknown;
  return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div class=\"site-info site-info--main\">\n    <ul class=\"default-list\">\n        <li class=\"border--bottom site-info__rating-li main-rating js-hero-open\">\n            ", "\n        </li>\n        <li class=\"text--center padded border--bottom warning_bg bold ", "\">\n            We temporarily disabled Privacy Protection as it appears to be breaking this site.\n        </li>\n        <li class=\"site-info__li--https-status padded border--bottom\">\n            <p class=\"site-info__https-status bold\">\n                <span class=\"site-info__https-status__icon\n                    is-", "\">\n                </span>\n                <span class=\"text-line-after-icon\">\n                    ", "\n                </span>\n            </p>\n        </li>\n        <li class=\"js-site-tracker-networks js-site-show-page-trackers site-info__li--trackers padded border--bottom\">\n            <a href=\"javascript:void(0)\" class=\"link-secondary bold\" role=\"button\">\n                ", "\n            </a>\n        </li>\n        <li class=\"js-site-privacy-practices site-info__li--privacy-practices padded border--bottom\">\n            <span class=\"site-info__privacy-practices__icon\n                is-", "\">\n            </span>\n            <a href=\"javascript:void(0)\" class=\"link-secondary bold\" role=\"button\">\n                <span class=\"text-line-after-icon\"> ", " Privacy Practices </span>\n                <span class=\"icon icon__arrow pull-right\"></span>\n            </a>\n        </li>\n        <li class=\"site-info__li--toggle js-site-protection-row padded ", "\">\n            <p class=\"is-transparent site-info__allowlist-status js-site-allowlist-status\">\n                <span class=\"text-line-after-icon privacy-on-off-message bold\">\n                    ", "\n                </span>\n            </p>\n            <p class=\"site-info__protection js-site-protection bold\">Site Privacy Protection</p>\n            <div class=\"site-info__toggle-container\">\n                ", "\n            </div>\n        </li>\n        <li class=\"js-site-manage-allowlist-li site-info__li--manage-allowlist padded ", "\">\n            ", "\n        </li>\n        <li class=\"js-site-confirm-breakage-li site-info__li--confirm-breakage border--bottom padded is-hidden\">\n           <div class=\"js-site-confirm-breakage-message site-info__confirm-thanks is-transparent\">\n                <span class=\"site-info__message\">\n                    Thanks for the feedback!\n                </span>\n            </div>\n            <div class=\"js-site-confirm-breakage site-info--confirm-breakage\">\n                <span class=\"site-info--is-site-broken bold\">\n                    Is this website broken?\n                </span>\n                <btn class=\"js-site-confirm-breakage-yes site-info__confirm-breakage-yes btn-pill\">\n                    Yes\n                </btn>\n                <btn class=\"js-site-confirm-breakage-no site-info__confirm-breakage-no btn-pill\">\n                    No\n                </btn>\n            </div>\n        </li>\n    </ul>\n</div>"])), ratingHero(this.model, {
    showOpen: !this.model.disabled
  }), this.model.displayBrokenUI ? '' : 'is-hidden', this.model.httpsState, this.model.httpsStatusText, renderTrackerNetworks(this.model), tosdrMsg.toLowerCase(), tosdrMsg, this.model.protectionsEnabled ? 'is-active' : '', setTransitionText(!this.model.isAllowlisted), toggleButton(this.model.protectionsEnabled, 'js-site-toggle pull-right'), this.model.displayBrokenUI ? 'is-hidden' : '', renderManageAllowlist(this.model));

  function setTransitionText(isSiteAllowlisted) {
    isSiteAllowlisted = isSiteAllowlisted || false;
    var text = 'Added to Unprotected Sites';

    if (isSiteAllowlisted) {
      text = 'Removed from Unprotected Sites';
    }

    return text;
  }

  function renderTrackerNetworks(model) {
    var isActive = model.protectionsEnabled ? 'is-active' : '';
    return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<a href=\"javascript:void(0)\" class=\"site-info__trackers link-secondary bold\">\n    <span class=\"site-info__trackers-status__icon\n        icon-", "\"></span>\n    <span class=\"", " text-line-after-icon\"> ", " </span>\n    <span class=\"icon icon__arrow pull-right\"></span>\n</a>"])), trackerNetworksIcon(model.siteRating, !model.protectionsEnabled, model.totalTrackerNetworksCount), isActive, trackerNetworksText(model, false));
  }

  function renderManageAllowlist(model) {
    return bel(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["<div>\n    <a href=\"javascript:void(0)\" class=\"js-site-manage-allowlist site-info__manage-allowlist link-secondary bold\">\n        Unprotected Sites\n    </a>\n    <div class=\"separator\"></div>\n    <a href=\"javascript:void(0)\" class=\"js-site-report-broken site-info__report-broken link-secondary bold\">\n        Report broken site\n    </a>\n</div>"])));
  }
};

},{"../../../data/constants":6,"./shared/rating-hero.es6.js":40,"./shared/toggle-button.es6.js":43,"./shared/tracker-network-icon.es6.js":45,"./shared/tracker-networks-text.es6.js":46,"bel":2}],48:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function (companyListMap) {
  return companyListMap.map(function (data) {
    return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<li class=\"top-blocked__li\">\n    <div title=\"", "\" class=\"top-blocked__li__company-name\">", "</div>\n    <div class=\"top-blocked__li__blocker-bar\">\n        <div class=\"top-blocked__li__blocker-bar__fg\n            js-top-blocked-graph-bar-fg\"\n            style=\"width: 0px\" data-width=\"", "\">\n        </div>\n    </div>\n    <div class=\"top-blocked__li__blocker-pct js-top-blocked-pct\">\n        ", "%\n    </div>\n</li>"])), data.name, data.displayName, data.percent, data.percent);
  });
};

},{"bel":2}],49:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var constants = require('../../../data/constants');

var entityIconMapping = constants.entityIconMapping;

module.exports = function (companyListMap) {
  return companyListMap.map(function (data) {
    return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<span class=\"top-blocked__pill-site__icon ", "\"></span>"])), getScssClass(data.name));
  });

  function getScssClass(companyName) {
    var iconClassName = entityIconMapping[companyName] || 'generic';
    return iconClassName;
  }
};

},{"../../../data/constants":6,"bel":2}],50:[function(require,module,exports){
"use strict";

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var listItems = require('./top-blocked-truncated-list-items.es6.js');

module.exports = function () {
  if (this.model.companyListMap && this.model.companyListMap.length > 0) {
    return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div class=\"top-blocked top-blocked--truncated\">\n    <div class=\"top-blocked__see-all js-top-blocked-see-all\">\n        <a href=\"javascript:void(0)\" class=\"link-secondary\">\n            <span class=\"icon icon__arrow pull-right\"></span>\n            Top Tracking Offenders\n            <span class=\"top-blocked__list top-blocked__list--truncated top-blocked__list--icons\">\n                ", "\n            </span>\n        </a>\n    </div>\n</div>"])), listItems(this.model.companyListMap));
  }
};

},{"./top-blocked-truncated-list-items.es6.js":49,"bel":2}],51:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var header = require('./shared/sliding-subview-header.es6.js');

var listItems = require('./top-blocked-list-items.es6.js');

var noData = require('./shared/top-blocked-no-data.es6.js');

module.exports = function () {
  if (!this.model) {
    return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div class=\"sliding-subview\n    sliding-subview--has-fixed-header top-blocked-header\">\n    ", "\n</div>"])), header('All Trackers'));
  } else {
    return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<div class=\"js-top-blocked-content\">\n    ", "\n    ", "\n    ", "\n</div>"])), renderPctPagesWithTrackers(this.model), renderList(this.model), renderResetButton(this.model));
  }
};

function renderPctPagesWithTrackers(model) {
  var msg = '';

  if (model.lastStatsResetDate) {
    var d = new Date(model.lastStatsResetDate).toLocaleDateString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    if (d) msg = " since ".concat(d);
  }

  if (model.pctPagesWithTrackers) {
    return bel(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["<p class=\"top-blocked__pct card\">\n    Trackers were found on <b>", "%</b>\n    of websites you've visited", ".\n</p>"])), model.pctPagesWithTrackers, msg);
  }
}

function renderList(model) {
  if (model.companyListMap.length > 0) {
    return bel(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["<ol aria-label=\"List of Trackers Found\" class=\"default-list top-blocked__list card border--bottom\">\n    ", "\n</ol>"])), listItems(model.companyListMap));
  } else {
    return bel(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["<ol class=\"default-list top-blocked__list\">\n    <li class=\"top-blocked__li top-blocked__li--no-data\">\n        ", "\n    </li>\n</ol>"])), noData());
  }
}

function renderResetButton(model) {
  if (model.companyListMap.length > 0) {
    return bel(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["<div class=\"top-blocked__reset-stats\">\n    <button class=\"top-blocked__reset-stats__button block\n        js-reset-trackers-data\">\n        Reset global stats\n    </button>\n    <p>These stats are only stored locally on your device,\n    and are not sent anywhere, ever.</p>\n</div>"])));
  }
}

},{"./shared/sliding-subview-header.es6.js":41,"./shared/top-blocked-no-data.es6.js":44,"./top-blocked-list-items.es6.js":48,"bel":2}],52:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

var hero = require('./shared/hero.es6.js');

var trackerNetworksIcon = require('./shared/tracker-network-icon.es6.js');

var trackerNetworksText = require('./shared/tracker-networks-text.es6.js');

var displayCategories = require('./../../../data/constants.js').displayCategories;

module.exports = function () {
  if (!this.model) {
    return bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<section class=\"sliding-subview\n    sliding-subview--has-fixed-header\">\n</section>"])));
  } else {
    return bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<div class=\"tracker-networks site-info site-info--full-height card\">\n    <div class=\"js-tracker-networks-hero\">\n        ", "\n    </div>\n    <div class=\"tracker-networks__explainer border--bottom--inner\n        text--center\">\n        Tracker networks aggregate your web history into a data profile about you.\n        Major tracker networks are more harmful because they can track and target you across more of the Internet.\n    </div>\n    <div class=\"tracker-networks__details padded\n        js-tracker-networks-details\">\n        <ol class=\"default-list site-info__trackers__company-list\" aria-label=\"List of tracker networks\">\n            ", "\n        </ol>\n    </div>\n</div>"])), renderHero(this.model.site), renderTrackerDetails(this.model, this.model.DOMAIN_MAPPINGS));
  }
};

function renderHero(site) {
  site = site || {};
  return bel(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["", ""])), hero({
    status: trackerNetworksIcon(site.siteRating, site.isAllowlisted, site.totalTrackerNetworksCount),
    title: site.domain,
    subtitle: "".concat(trackerNetworksText(site, false)),
    showClose: true
  }));
}

function renderTrackerDetails(model) {
  var companyListMap = model.companyListMap || {};

  if (companyListMap.length === 0) {
    return bel(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["<li class=\"is-empty\"></li>"])));
  }

  if (companyListMap && companyListMap.length > 0) {
    return companyListMap.map(function (c, i) {
      var borderClass = '';

      if (c.name && c.name === 'unknown') {
        c.name = '(Tracker network unknown)';
      } else if (c.name && model.hasUnblockedTrackers(c, c.urlsList)) {
        var additionalText = ' associated domains';
        var domain = model.site ? model.site.domain : c.displayName;
        c.displayName = model.site.isAllowlisted ? domain + additionalText : domain + additionalText + ' (not blocked)';
        borderClass = companyListMap.length > 1 ? 'border--top padded--top' : '';
      }

      return bel(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["<li class=\"", "\">\n    <div class=\"site-info__tracker__wrapper ", " float-right\">\n        <span class=\"site-info__tracker__icon ", "\">\n        </span>\n    </div>\n    <h1 title=\"", "\" class=\"site-info__domain block\">", "</h1>\n    <ol class=\"default-list site-info__trackers__company-list__url-list\" aria-label=\"Tracker domains for ", "\">\n        ", "\n    </ol>\n</li>"])), borderClass, c.normalizedName, c.normalizedName, c.name, c.displayName, c.name, c.urlsList.map(function (url) {
        // find first matchign category from our list of allowed display categories
        var category = '';

        if (c.urls[url] && c.urls[url].categories) {
          displayCategories.some(function (displayCat) {
            var match = c.urls[url].categories.find(function (cat) {
              return cat === displayCat;
            });

            if (match) {
              category = match;
              return true;
            }

            return false;
          });
        }

        return bel(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["<li>\n                <div class=\"url\">", "</div>\n                <div class=\"category\">", "</div>\n            </li>"])), url, category);
      }));
    });
  }
}

},{"./../../../data/constants.js":6,"./shared/hero.es6.js":38,"./shared/tracker-network-icon.es6.js":45,"./shared/tracker-networks-text.es6.js":46,"bel":2}],53:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;

function Autocomplete(ops) {
  this.model = ops.model;
  this.pageView = ops.pageView;
  this.template = ops.template;
  Parent.call(this, ops);
  this.bindEvents([[this.store.subscribe, 'change:search', this._handleSearchText]]);
}

Autocomplete.prototype = window.$.extend({}, Parent.prototype, {
  _handleSearchText: function _handleSearchText(notification) {
    var _this = this;

    if (notification.change && notification.change.attribute === 'searchText') {
      if (!notification.change.value) {
        this.model.suggestions = [];

        this._rerender();

        return;
      }

      this.model.fetchSuggestions(notification.change.value).then(function () {
        return _this._rerender();
      });
    }
  }
});
module.exports = Autocomplete;

},{}],54:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;

function BreakageForm(ops) {
  this.model = ops.model;
  this.template = ops.template;
  this.siteView = ops.siteView;
  this.clickSource = ops.clickSource;
  this.$root = window.$('.js-breakage-form');
  Parent.call(this, ops);

  this._setup();
}

BreakageForm.prototype = window.$.extend({}, Parent.prototype, {
  _setup: function _setup() {
    this._cacheElems('.js-breakage-form', ['close', 'submit', 'element', 'message', 'dropdown']);

    this.bindEvents([[this.$close, 'click', this._closeForm], [this.$submit, 'click', this._submitForm], [this.$dropdown, 'change', this._selectCategory]]);
  },
  _closeForm: function _closeForm(e) {
    if (e) e.preventDefault(); // reload page after closing form if user got to form from
    // toggling privacy protection. otherwise destroy view.

    if (this.clickSource === 'toggle') {
      this.siteView.closePopupAndReload(500);
      this.destroy();
    } else {
      this.destroy();
    }
  },
  _submitForm: function _submitForm() {
    if (this.$submit.hasClass('btn-disabled')) {
      return;
    }

    var category = this.$dropdown.val();
    this.model.submitBreakageForm(category);

    this._showThankYouMessage();
  },
  _showThankYouMessage: function _showThankYouMessage() {
    this.$element.addClass('is-transparent');
    this.$message.removeClass('is-transparent'); // reload page after form submission if user got to form from
    // toggling privacy protection, otherwise destroy view.

    if (this.clickSource === 'toggle') {
      this.siteView.closePopupAndReload(3500);
    }
  },
  _selectCategory: function _selectCategory() {}
});
module.exports = BreakageForm;

},{}],55:[function(require,module,exports){
"use strict";

var _require = require('../../background/email-utils.es6'),
    formatAddress = _require.formatAddress;

var Parent = window.DDG.base.View;

function EmailAliasView(ops) {
  var _this = this;

  this.model = ops.model;
  this.pageView = ops.pageView;
  this.template = ops.template;
  this.model.getUserData().then(function (userData) {
    _this.model.set('userData', userData);

    Parent.call(_this, ops);

    _this._setup();
  });
}

EmailAliasView.prototype = window.$.extend({}, Parent.prototype, {
  _copyAliasToClipboard: function _copyAliasToClipboard() {
    var _this2 = this;

    var alias = this.model.userData.nextAlias;
    navigator.clipboard.writeText(formatAddress(alias));
    this.$el.addClass('show-copied-label');
    this.$el.one('animationend', function () {
      _this2.$el.removeClass('show-copied-label');
    });
    this.model.sendMessage('refreshAlias').then(function (_ref) {
      var privateAddress = _ref.privateAddress;
      _this2.model.userData.nextAlias = privateAddress;
    });
  },
  _setup: function _setup() {
    this.bindEvents([[this.$el, 'click', this._copyAliasToClipboard]]);
  }
});
module.exports = EmailAliasView;

},{"../../background/email-utils.es6":9}],56:[function(require,module,exports){
"use strict";

var Parent = require('./sliding-subview.es6.js');

var ratingHeroTemplate = require('../templates/shared/rating-hero.es6.js');

var gradesTemplate = require('../templates/shared/grade-scorecard-grades.es6.js');

var reasonsTemplate = require('../templates/shared/grade-scorecard-reasons.es6.js');

function GradeScorecard(ops) {
  this.model = ops.model;
  this.template = ops.template;
  Parent.call(this, ops);

  this._setup();

  this.bindEvents([[this.store.subscribe, 'change:site', this._onSiteChange]]);
  this.setupClose();
}

GradeScorecard.prototype = window.$.extend({}, Parent.prototype, {
  _setup: function _setup() {
    this._cacheElems('.js-grade-scorecard', ['reasons', 'grades']);

    this.$hero = this.$('.js-rating-hero');
  },
  _rerenderHero: function _rerenderHero() {
    this.$hero.replaceWith(ratingHeroTemplate(this.model, {
      showClose: true
    }));
  },
  _rerenderGrades: function _rerenderGrades() {
    this.$grades.replaceWith(gradesTemplate(this.model));
  },
  _rerenderReasons: function _rerenderReasons() {
    this.$reasons.replaceWith(reasonsTemplate(this.model));
  },
  _onSiteChange: function _onSiteChange(e) {
    if (e.change.attribute === 'siteRating') {
      this._rerenderHero();

      this._rerenderGrades();
    } // all the other stuff we use in the reasons
    // (e.g. https, tosdr)
    // doesn't change dynamically


    if (e.change.attribute === 'trackerNetworks' || e.change.attribute === 'isaMajorTrackingNetwork') {
      this._rerenderReasons();
    } // recache any selectors that were rerendered


    this._setup();

    this.setupClose();
  }
});
module.exports = GradeScorecard;

},{"../templates/shared/grade-scorecard-grades.es6.js":35,"../templates/shared/grade-scorecard-reasons.es6.js":36,"../templates/shared/rating-hero.es6.js":40,"./sliding-subview.es6.js":63}],57:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;

var openOptionsPage = require('./mixins/open-options-page.es6.js');

var browserUIWrapper = require('./../base/ui-wrapper.es6.js');

var _require = require('../../background/channel.es6.js'),
    IS_BETA = _require.IS_BETA;

function HamburgerMenu(ops) {
  this.model = ops.model;
  this.template = ops.template;
  this.pageView = ops.pageView;
  Parent.call(this, ops);

  this._setup();
}

HamburgerMenu.prototype = window.$.extend({}, Parent.prototype, openOptionsPage, {
  _setup: function _setup() {
    this._cacheElems('.js-hamburger-menu', ['close', 'options-link', 'feedback-link', 'broken-site-link', 'debugger-panel-link']);

    this.bindEvents([[this.$close, 'click', this._closeMenu], [this.$optionslink, 'click', this.openOptionsPage], [this.$feedbacklink, 'click', this._handleFeedbackClick], [this.$brokensitelink, 'click', this._handleBrokenSiteClick], [this.model.store.subscribe, 'action:search', this._handleAction], [this.model.store.subscribe, 'change:site', this._handleSiteUpdate], [this.$debuggerpanellink, 'click', this._handleDebuggerClick]]);

    if (IS_BETA) {
      this.$('#debugger-panel').removeClass('is-hidden');
    }
  },
  _handleAction: function _handleAction(notification) {
    if (notification.action === 'burgerClick') this._openMenu();
  },
  _openMenu: function _openMenu(e) {
    this.$el.removeClass('is-hidden');
  },
  _closeMenu: function _closeMenu(e) {
    if (e) e.preventDefault();
    this.$el.addClass('is-hidden');
  },
  _handleFeedbackClick: function _handleFeedbackClick(e) {
    e.preventDefault();
    browserUIWrapper.openExtensionPage('/html/feedback.html');
  },
  _handleBrokenSiteClick: function _handleBrokenSiteClick(e) {
    e.preventDefault();
    this.$el.addClass('is-hidden');
    this.pageView.views.site.showBreakageForm('reportBrokenSite');
  },
  _handleSiteUpdate: function _handleSiteUpdate(notification) {
    if (notification && notification.change.attribute === 'tab') {
      this.model.tabUrl = notification.change.value.url;

      this._rerender();

      this._setup();
    }
  },
  _handleDebuggerClick: function _handleDebuggerClick(e) {
    e.preventDefault();
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      var tabId = tabs.length > 0 ? tabs[0].id : '';
      chrome.tabs.create({
        url: chrome.runtime.getURL("/html/devtools-panel.html?tabId=".concat(tabId))
      });
    });
  }
});
module.exports = HamburgerMenu;

},{"../../background/channel.es6.js":8,"./../base/ui-wrapper.es6.js":13,"./mixins/open-options-page.es6.js":59}],58:[function(require,module,exports){
"use strict";

module.exports = {
  animateGraphBars: function animateGraphBars() {
    var self = this;
    window.setTimeout(function () {
      if (!self.$graphbarfg) return;
      self.$graphbarfg.each(function (i, el) {
        var $el = window.$(el);
        var w = $el.data().width;
        $el.css('width', w + '%');
      });
    }, 250);
    window.setTimeout(function () {
      if (!self.$pct) return;
      self.$pct.each(function (i, el) {
        var $el = window.$(el);
        $el.css('color', '#333333');
      });
    }, 700);
  }
};

},{}],59:[function(require,module,exports){
"use strict";

var browserUIWrapper = require('./../../base/ui-wrapper.es6.js');

module.exports = {
  openOptionsPage: function openOptionsPage() {
    this.model.sendMessage('getBrowser').then(function (browser) {
      browserUIWrapper.openOptionsPage(browser);
    });
  }
};

},{"./../../base/ui-wrapper.es6.js":13}],60:[function(require,module,exports){
"use strict";

var ParentSlidingSubview = require('./sliding-subview.es6.js');

function PrivacyPractices(ops) {
  this.model = ops.model;
  this.template = ops.template;
  ParentSlidingSubview.call(this, ops);
  this.setupClose();
}

PrivacyPractices.prototype = window.$.extend({}, ParentSlidingSubview.prototype, {});
module.exports = PrivacyPractices;

},{"./sliding-subview.es6.js":63}],61:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;
var FOCUS_CLASS = 'go--focused';

function Search(ops) {
  var _this = this;

  this.model = ops.model;
  this.pageView = ops.pageView;
  this.template = ops.template;
  Parent.call(this, ops);

  this._cacheElems('.js-search', ['form', 'input', 'go', 'hamburger-button']);

  this.bindEvents([[this.$input, 'input', this._handleInput], [this.$input, 'blur', this._handleBlur], [this.$go, 'click', this._handleSubmit], [this.$form, 'submit', this._handleSubmit], [this.$hamburgerbutton, 'click', this._handleBurgerClick]]);
  window.setTimeout(function () {
    return _this.$input.focus();
  }, 200);
}

Search.prototype = window.$.extend({}, Parent.prototype, {
  // Hover effect on search button while typing
  _addHoverEffect: function _addHoverEffect() {
    if (!this.$go.hasClass(FOCUS_CLASS)) {
      this.$go.addClass(FOCUS_CLASS);
    }
  },
  _removeHoverEffect: function _removeHoverEffect() {
    if (this.$go.hasClass(FOCUS_CLASS)) {
      this.$go.removeClass(FOCUS_CLASS);
    }
  },
  _handleBlur: function _handleBlur(e) {
    this._removeHoverEffect();
  },
  _handleInput: function _handleInput(e) {
    var searchText = this.$input.val();
    this.model.set('searchText', searchText);

    if (searchText.length) {
      this._addHoverEffect();
    } else {
      this._removeHoverEffect();
    }
  },
  _handleSubmit: function _handleSubmit(e) {
    e.preventDefault();
    console.log("Search submit for ".concat(this.$input.val()));
    this.model.doSearch(this.$input.val());
    window.close();
  },
  _handleBurgerClick: function _handleBurgerClick(e) {
    e.preventDefault();
    this.model.send('burgerClick');
  }
});
module.exports = Search;

},{}],62:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;

var GradeScorecardView = require('./../views/grade-scorecard.es6.js');

var TrackerNetworksView = require('./../views/tracker-networks.es6.js');

var PrivacyPracticesView = require('./../views/privacy-practices.es6.js');

var BreakageFormView = require('./../views/breakage-form.es6.js');

var gradeScorecardTemplate = require('./../templates/grade-scorecard.es6.js');

var trackerNetworksTemplate = require('./../templates/tracker-networks.es6.js');

var privacyPracticesTemplate = require('./../templates/privacy-practices.es6.js');

var breakageFormTemplate = require('./../templates/breakage-form.es6.js');

var openOptionsPage = require('./mixins/open-options-page.es6.js');

var browserUIWrapper = require('./../base/ui-wrapper.es6.js');

function Site(ops) {
  var _this = this;

  this.model = ops.model;
  this.pageView = ops.pageView;
  this.template = ops.template; // cache 'body' selector

  this.$body = window.$('body'); // get data from background process, then re-render template with it

  this.model.getBackgroundTabData().then(function () {
    if (_this.model.tab && (_this.model.tab.status === 'complete' || _this.model.domain === 'new tab')) {
      // render template for the first time here
      Parent.call(_this, ops);

      _this._setup();
    } else {
      // the timeout helps buffer the re-render cycle during heavy
      // page loads with lots of trackers
      Parent.call(_this, ops);
      setTimeout(function () {
        return _this.rerender();
      }, 750);
    }
  });
}

Site.prototype = window.$.extend({}, Parent.prototype, openOptionsPage, {
  _onToggleClick: function _onToggleClick(e) {
    if (this.$body.hasClass('is-disabled')) return;
    this.model.toggleAllowlist();

    if (!this.model.isBroken) {
      var allowlisted = this.model.isAllowlisted;

      this._showAllowlistedStatusMessage(!allowlisted);

      if (allowlisted) {
        this._showBreakageConfirmation();
      }
    } else {
      this.closePopupAndReload(1500);
    }
  },
  // If we just allowlisted a site, show a message briefly before reloading
  // otherwise just reload the tab and close the popup
  _showAllowlistedStatusMessage: function _showAllowlistedStatusMessage(reload) {
    var _this2 = this;

    var isTransparentClass = 'is-transparent'; // Wait for the rerendering to be done
    // 10ms timeout is the minimum to render the transition smoothly

    setTimeout(function () {
      return _this2.$allowliststatus.removeClass(isTransparentClass);
    }, 10);
    setTimeout(function () {
      return _this2.$protection.addClass(isTransparentClass);
    }, 10);

    if (reload) {
      // Wait a bit more before closing the popup and reloading the tab
      this.closePopupAndReload(1500);
    }
  },
  // NOTE: after ._setup() is called this view listens for changes to
  // site model and re-renders every time model properties change
  _setup: function _setup() {
    // console.log('[site view] _setup()')
    this._cacheElems('.js-site', ['toggle', 'protection', 'allowlist-status', 'show-all-trackers', 'show-page-trackers', 'manage-allowlist', 'manage-allowlist-li', 'report-broken', 'privacy-practices', 'confirm-breakage-li', 'confirm-breakage', 'confirm-breakage-yes', 'confirm-breakage-no', 'confirm-breakage-message']);

    this.$gradescorecard = this.$('.js-hero-open');
    this.bindEvents([[this.$toggle, 'click', this._onToggleClick], [this.$showpagetrackers, 'click', this._showPageTrackers], [this.$privacypractices, 'click', this._showPrivacyPractices], [this.$confirmbreakageyes, 'click', this._onConfirmBrokenClick], [this.$confirmbreakageno, 'click', this._onConfirmNotBrokenClick], [this.$gradescorecard, 'click', this._showGradeScorecard], [this.$manageallowlist, 'click', this._onManageAllowlistClick], [this.$reportbroken, 'click', this._onReportBrokenSiteClick], [this.store.subscribe, 'change:site', this.rerender]]);
  },
  rerender: function rerender() {
    // Prevent rerenders when confirmation form is active,
    // otherwise form will disappear on rerender.
    if (this.$body.hasClass('confirmation-active')) return;

    if (this.model && this.model.disabled) {
      if (!this.$body.hasClass('is-disabled')) {
        console.log('$body.addClass() is-disabled');
        this.$body.addClass('is-disabled');

        this._rerender();

        this._setup();
      }
    } else {
      this.$body.removeClass('is-disabled');
      this.unbindEvents();

      this._rerender();

      this._setup();
    }
  },
  _onManageAllowlistClick: function _onManageAllowlistClick() {
    if (this.model && this.model.disabled) {
      return;
    }

    this.openOptionsPage();
  },
  _onReportBrokenSiteClick: function _onReportBrokenSiteClick(e) {
    e.preventDefault();

    if (this.model && this.model.disabled) {
      return;
    }

    this.showBreakageForm('reportBrokenSite');
  },
  _onConfirmBrokenClick: function _onConfirmBrokenClick() {
    var isHiddenClass = 'is-hidden';
    this.$manageallowlistli.removeClass(isHiddenClass);
    this.$confirmbreakageli.addClass(isHiddenClass);
    this.$body.removeClass('confirmation-active');
    this.showBreakageForm('toggle');
  },
  _onConfirmNotBrokenClick: function _onConfirmNotBrokenClick() {
    var isTransparentClass = 'is-transparent';
    this.$confirmbreakagemessage.removeClass(isTransparentClass);
    this.$confirmbreakage.addClass(isTransparentClass);
    this.$body.removeClass('confirmation-active');
    this.closePopupAndReload(1500);
  },
  _showBreakageConfirmation: function _showBreakageConfirmation() {
    this.$body.addClass('confirmation-active');
    this.$confirmbreakageli.removeClass('is-hidden');
    this.$manageallowlistli.addClass('is-hidden');
  },
  // pass clickSource to specify whether page should reload
  // after submitting breakage form.
  showBreakageForm: function showBreakageForm(clickSource) {
    this.views.breakageForm = new BreakageFormView({
      siteView: this,
      template: breakageFormTemplate,
      model: this.model,
      appendTo: this.$body,
      clickSource: clickSource
    });
  },
  _showPageTrackers: function _showPageTrackers(e) {
    if (this.$body.hasClass('is-disabled')) return;
    this.views.slidingSubview = new TrackerNetworksView({
      template: trackerNetworksTemplate
    });
  },
  _showPrivacyPractices: function _showPrivacyPractices(e) {
    if (this.model.disabled) return;
    this.views.privacyPractices = new PrivacyPracticesView({
      template: privacyPracticesTemplate,
      model: this.model
    });
  },
  _showGradeScorecard: function _showGradeScorecard(e) {
    if (this.model.disabled) return;
    this.views.gradeScorecard = new GradeScorecardView({
      template: gradeScorecardTemplate,
      model: this.model
    });
  },
  closePopupAndReload: function closePopupAndReload(delay) {
    var _this3 = this;

    delay = delay || 0;
    setTimeout(function () {
      browserUIWrapper.reloadTab(_this3.model.tab.id);
      browserUIWrapper.closePopup();
    }, delay);
  }
});
module.exports = Site;

},{"./../base/ui-wrapper.es6.js":13,"./../templates/breakage-form.es6.js":29,"./../templates/grade-scorecard.es6.js":31,"./../templates/privacy-practices.es6.js":33,"./../templates/tracker-networks.es6.js":52,"./../views/breakage-form.es6.js":54,"./../views/grade-scorecard.es6.js":56,"./../views/privacy-practices.es6.js":60,"./../views/tracker-networks.es6.js":66,"./mixins/open-options-page.es6.js":59}],63:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;

function SlidingSubview(ops) {
  ops.appendTo = window.$('.sliding-subview--root');
  Parent.call(this, ops);
  this.$root = window.$('.sliding-subview--root');
  this.$root.addClass('sliding-subview--open');
  this.setupClose();
}

SlidingSubview.prototype = window.$.extend({}, Parent.prototype, {
  setupClose: function setupClose() {
    this._cacheElems('.js-sliding-subview', ['close']);

    this.bindEvents([[this.$close, 'click', this._destroy]]);
  },
  _destroy: function _destroy() {
    var _this = this;

    this.$root.removeClass('sliding-subview--open');
    window.setTimeout(function () {
      _this.destroy();
    }, 400); // 400ms = 0.35s in .sliding-subview--root transition + 50ms padding
  }
});
module.exports = SlidingSubview;

},{}],64:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;

var TopBlockedFullView = require('./top-blocked.es6.js');

var topBlockedFullTemplate = require('./../templates/top-blocked.es6.js');

var TOP_BLOCKED_CLASS = 'has-top-blocked--truncated';

function TruncatedTopBlocked(ops) {
  var _this = this;

  this.model = ops.model;
  this.pageView = ops.pageView;
  this.template = ops.template;
  this.model.getTopBlocked().then(function () {
    Parent.call(_this, ops);

    _this._setup();
  });
  this.bindEvents([[this.model.store.subscribe, 'action:backgroundMessage', this.handleBackgroundMsg]]);
}

TruncatedTopBlocked.prototype = window.$.extend({}, Parent.prototype, {
  _seeAllClick: function _seeAllClick() {
    this.views.slidingSubview = new TopBlockedFullView({
      template: topBlockedFullTemplate,
      numItems: 10
    });
  },
  _setup: function _setup() {
    this._cacheElems('.js-top-blocked', ['graph-bar-fg', 'pct', 'see-all']);

    this.bindEvents([[this.$seeall, 'click', this._seeAllClick]]);

    if (window.$('.top-blocked--truncated').length) {
      window.$('html').addClass(TOP_BLOCKED_CLASS);
    }
  },
  rerenderList: function rerenderList() {
    this._rerender();

    this._setup();
  },
  handleBackgroundMsg: function handleBackgroundMsg(message) {
    var _this2 = this;

    if (!message || !message.action) return;

    if (message.action === 'didResetTrackersData') {
      this.model.reset();
      setTimeout(function () {
        return _this2.rerenderList();
      }, 750);
      this.rerenderList();
      window.$('html').removeClass(TOP_BLOCKED_CLASS);
    }
  }
});
module.exports = TruncatedTopBlocked;

},{"./../templates/top-blocked.es6.js":51,"./top-blocked.es6.js":65}],65:[function(require,module,exports){
"use strict";

var ParentSlidingSubview = require('./sliding-subview.es6.js');

var animateGraphBars = require('./mixins/animate-graph-bars.es6.js');

var TopBlockedModel = require('./../models/top-blocked.es6.js');

function TopBlocked(ops) {
  // model data is async
  this.model = null;
  this.numItems = ops.numItems;
  this.template = ops.template;
  ParentSlidingSubview.call(this, ops);
  this.setupClose();
  this.renderAsyncContent();
  this.bindEvents([[this.model.store.subscribe, 'action:backgroundMessage', this.handleBackgroundMsg]]);
}

TopBlocked.prototype = window.$.extend({}, ParentSlidingSubview.prototype, animateGraphBars, {
  setup: function setup() {
    this.$content = this.$el.find('.js-top-blocked-content'); // listener for reset stats click

    this.$reset = this.$el.find('.js-reset-trackers-data');
    this.bindEvents([[this.$reset, 'click', this.resetTrackersStats]]);
  },
  renderAsyncContent: function renderAsyncContent() {
    var _this = this;

    var random = Math.round(Math.random() * 100000);
    this.model = new TopBlockedModel({
      modelName: 'topBlocked' + random,
      numCompanies: this.numItems
    });
    this.model.getTopBlocked().then(function () {
      var content = _this.template();

      _this.$el.append(content);

      _this.setup(); // animate graph bars and pct


      _this.$graphbarfg = _this.$el.find('.js-top-blocked-graph-bar-fg');
      _this.$pct = _this.$el.find('.js-top-blocked-pct');

      _this.animateGraphBars();
    });
  },
  resetTrackersStats: function resetTrackersStats(e) {
    if (e) e.preventDefault();
    this.model.sendMessage('resetTrackersData');
  },
  handleBackgroundMsg: function handleBackgroundMsg(message) {
    if (!message || !message.action) return;

    if (message.action === 'didResetTrackersData') {
      this.model.reset(message.data);
      var content = this.template();
      this.$content.replaceWith(content);
    }
  }
});
module.exports = TopBlocked;

},{"./../models/top-blocked.es6.js":23,"./mixins/animate-graph-bars.es6.js":58,"./sliding-subview.es6.js":63}],66:[function(require,module,exports){
"use strict";

var ParentSlidingSubview = require('./sliding-subview.es6.js');

var heroTemplate = require('./../templates/shared/hero.es6.js');

var CompanyListModel = require('./../models/site-company-list.es6.js');

var SiteModel = require('./../models/site.es6.js');

var trackerNetworksIconTemplate = require('./../templates/shared/tracker-network-icon.es6.js');

var trackerNetworksTextTemplate = require('./../templates/shared/tracker-networks-text.es6.js');

function TrackerNetworks(ops) {
  var _this = this;

  // model data is async
  this.model = null;
  this.currentModelName = null;
  this.currentSiteModelName = null;
  this.template = ops.template;
  ParentSlidingSubview.call(this, ops);
  setTimeout(function () {
    return _this._rerender();
  }, 750);
  this.renderAsyncContent();
}

TrackerNetworks.prototype = window.$.extend({}, ParentSlidingSubview.prototype, {
  setup: function setup() {
    this._cacheElems('.js-tracker-networks', ['hero', 'details']); // site rating arrives async


    this.bindEvents([[this.store.subscribe, "change:".concat(this.currentSiteModelName), this._rerender]]);
  },
  renderAsyncContent: function renderAsyncContent() {
    var _this2 = this;

    var random = Math.round(Math.random() * 100000);
    this.currentModelName = 'siteCompanyList' + random;
    this.currentSiteModelName = 'site' + random;
    this.model = new CompanyListModel({
      modelName: this.currentModelName
    });
    this.model.fetchAsyncData().then(function () {
      _this2.model.site = new SiteModel({
        modelName: _this2.currentSiteModelName
      });

      _this2.model.site.getBackgroundTabData().then(function () {
        var content = _this2.template();

        _this2.$el.append(content);

        _this2.setup();

        _this2.setupClose();
      });
    });
  },
  _renderHeroTemplate: function _renderHeroTemplate() {
    if (this.model.site) {
      var trackerNetworksIconName = trackerNetworksIconTemplate(this.model.site.siteRating, this.model.site.isAllowlisted, this.model.site.totalTrackerNetworksCount);
      var trackerNetworksText = trackerNetworksTextTemplate(this.model.site, false);
      this.$hero.html(heroTemplate({
        status: trackerNetworksIconName,
        title: this.model.site.domain,
        subtitle: trackerNetworksText,
        showClose: true
      }));
    }
  },
  _rerender: function _rerender(e) {
    if (e && e.change) {
      if (e.change.attribute === 'isaMajorTrackingNetwork' || e.change.attribute === 'isAllowlisted' || e.change.attribute === 'totalTrackerNetworksCount' || e.change.attribute === 'siteRating') {
        this._renderHeroTemplate();

        this.unbindEvents();
        this.setup();
        this.setupClose();
      }
    }
  }
});
module.exports = TrackerNetworks;

},{"./../models/site-company-list.es6.js":20,"./../models/site.es6.js":21,"./../templates/shared/hero.es6.js":38,"./../templates/shared/tracker-network-icon.es6.js":45,"./../templates/shared/tracker-networks-text.es6.js":46,"./sliding-subview.es6.js":63}]},{},[27])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmVsL2FwcGVuZENoaWxkLmpzIiwibm9kZV9tb2R1bGVzL2JlbC9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyc2NyaXB0LWF0dHJpYnV0ZS10by1wcm9wZXJ0eS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcngvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsL2Rpc3QvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsInNoYXJlZC9kYXRhL2NvbnN0YW50cy5qcyIsInNoYXJlZC9kYXRhL2RlZmF1bHRTZXR0aW5ncy5qcyIsInNoYXJlZC9qcy9iYWNrZ3JvdW5kL2NoYW5uZWwuZXM2LmpzIiwic2hhcmVkL2pzL2JhY2tncm91bmQvZW1haWwtdXRpbHMuZXM2LmpzIiwic2hhcmVkL2pzL2JhY2tncm91bmQvc2V0dGluZ3MuZXM2LmpzIiwic2hhcmVkL2pzL2JhY2tncm91bmQvd3JhcHBlci5lczYuanMiLCJzaGFyZWQvanMvc2hhcmVkLXV0aWxzL3BhcnNlLXVzZXItYWdlbnQtc3RyaW5nLmVzNi5qcyIsInNoYXJlZC9qcy91aS9iYXNlL3VpLXdyYXBwZXIuZXM2LmpzIiwic2hhcmVkL2pzL3VpL21vZGVscy9hdXRvY29tcGxldGUuZXM2LmpzIiwic2hhcmVkL2pzL3VpL21vZGVscy9iYWNrZ3JvdW5kLW1lc3NhZ2UuZXM2LmpzIiwic2hhcmVkL2pzL3VpL21vZGVscy9lbWFpbC1hbGlhcy5lczYuanMiLCJzaGFyZWQvanMvdWkvbW9kZWxzL2hhbWJ1cmdlci1tZW51LmVzNi5qcyIsInNoYXJlZC9qcy91aS9tb2RlbHMvbWl4aW5zL25vcm1hbGl6ZS1jb21wYW55LW5hbWUuZXM2LmpzIiwic2hhcmVkL2pzL3VpL21vZGVscy9zZWFyY2guZXM2LmpzIiwic2hhcmVkL2pzL3VpL21vZGVscy9zaXRlLWNvbXBhbnktbGlzdC5lczYuanMiLCJzaGFyZWQvanMvdWkvbW9kZWxzL3NpdGUuZXM2LmpzIiwic2hhcmVkL2pzL3VpL21vZGVscy9zdWJtaXQtYnJlYWthZ2UtZm9ybS5lczYuanMiLCJzaGFyZWQvanMvdWkvbW9kZWxzL3RvcC1ibG9ja2VkLmVzNi5qcyIsInNoYXJlZC9qcy91aS9wYWdlcy9taXhpbnMvaW5kZXguZXM2LmpzIiwic2hhcmVkL2pzL3VpL3BhZ2VzL21peGlucy9wYXJzZS1xdWVyeS1zdHJpbmcuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3BhZ2VzL21peGlucy9zZXQtYnJvd3Nlci1jbGFzcy5lczYuanMiLCJzaGFyZWQvanMvdWkvcGFnZXMvcG9wdXAuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9hdXRvY29tcGxldGUuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9icmVha2FnZS1mb3JtLmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvZW1haWwtYWxpYXMuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9ncmFkZS1zY29yZWNhcmQuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9oYW1idXJnZXItbWVudS5lczYuanMiLCJzaGFyZWQvanMvdWkvdGVtcGxhdGVzL3ByaXZhY3ktcHJhY3RpY2VzLmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvc2VhcmNoLmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvc2hhcmVkL2dyYWRlLXNjb3JlY2FyZC1ncmFkZXMuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9zaGFyZWQvZ3JhZGUtc2NvcmVjYXJkLXJlYXNvbnMuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9zaGFyZWQvaGFtYnVyZ2VyLWJ1dHRvbi5lczYuanMiLCJzaGFyZWQvanMvdWkvdGVtcGxhdGVzL3NoYXJlZC9oZXJvLmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvc2hhcmVkL2xpbmsuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9zaGFyZWQvcmF0aW5nLWhlcm8uZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9zaGFyZWQvc2xpZGluZy1zdWJ2aWV3LWhlYWRlci5lczYuanMiLCJzaGFyZWQvanMvdWkvdGVtcGxhdGVzL3NoYXJlZC9zdGF0dXMtbGlzdC5lczYuanMiLCJzaGFyZWQvanMvdWkvdGVtcGxhdGVzL3NoYXJlZC90b2dnbGUtYnV0dG9uLmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvc2hhcmVkL3RvcC1ibG9ja2VkLW5vLWRhdGEuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9zaGFyZWQvdHJhY2tlci1uZXR3b3JrLWljb24uZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy9zaGFyZWQvdHJhY2tlci1uZXR3b3Jrcy10ZXh0LmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvc2l0ZS5lczYuanMiLCJzaGFyZWQvanMvdWkvdGVtcGxhdGVzL3RvcC1ibG9ja2VkLWxpc3QtaXRlbXMuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3RlbXBsYXRlcy90b3AtYmxvY2tlZC10cnVuY2F0ZWQtbGlzdC1pdGVtcy5lczYuanMiLCJzaGFyZWQvanMvdWkvdGVtcGxhdGVzL3RvcC1ibG9ja2VkLXRydW5jYXRlZC5lczYuanMiLCJzaGFyZWQvanMvdWkvdGVtcGxhdGVzL3RvcC1ibG9ja2VkLmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvdHJhY2tlci1uZXR3b3Jrcy5lczYuanMiLCJzaGFyZWQvanMvdWkvdmlld3MvYXV0b2NvbXBsZXRlLmVzNi5qcyIsInNoYXJlZC9qcy91aS92aWV3cy9icmVha2FnZS1mb3JtLmVzNi5qcyIsInNoYXJlZC9qcy91aS92aWV3cy9lbWFpbC1hbGlhcy5lczYuanMiLCJzaGFyZWQvanMvdWkvdmlld3MvZ3JhZGUtc2NvcmVjYXJkLmVzNi5qcyIsInNoYXJlZC9qcy91aS92aWV3cy9oYW1idXJnZXItbWVudS5lczYuanMiLCJzaGFyZWQvanMvdWkvdmlld3MvbWl4aW5zL2FuaW1hdGUtZ3JhcGgtYmFycy5lczYuanMiLCJzaGFyZWQvanMvdWkvdmlld3MvbWl4aW5zL29wZW4tb3B0aW9ucy1wYWdlLmVzNi5qcyIsInNoYXJlZC9qcy91aS92aWV3cy9wcml2YWN5LXByYWN0aWNlcy5lczYuanMiLCJzaGFyZWQvanMvdWkvdmlld3Mvc2VhcmNoLmVzNi5qcyIsInNoYXJlZC9qcy91aS92aWV3cy9zaXRlLmVzNi5qcyIsInNoYXJlZC9qcy91aS92aWV3cy9zbGlkaW5nLXN1YnZpZXcuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3ZpZXdzL3RvcC1ibG9ja2VkLXRydW5jYXRlZC5lczYuanMiLCJzaGFyZWQvanMvdWkvdmlld3MvdG9wLWJsb2NrZWQuZXM2LmpzIiwic2hhcmVkL2pzL3VpL3ZpZXdzL3RyYWNrZXItbmV0d29ya3MuZXM2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDLE1BQUYsQ0FBUyxTQUFULEtBQXVCLHlCQUF2QixJQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVCxLQUF1QixlQUR2QixJQUVBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVCxLQUF1QiwyQkFGdkIsSUFHQSxDQUFDLENBQUMsTUFBRixDQUFTLFNBQVQsS0FBdUIsWUFIM0IsRUFHeUM7QUFDckMsYUFBSyxtQkFBTDs7QUFDQSxhQUFLLFlBQUw7QUFDQSxhQUFLLEtBQUw7QUFDQSxhQUFLLFVBQUw7QUFDSDtBQUNKO0FBQ0o7QUFwRUwsQ0FGd0IsQ0FBNUI7QUEwRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsZUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgdHJhaWxpbmdOZXdsaW5lUmVnZXggPSAvXFxuW1xcc10rJC9cbnZhciBsZWFkaW5nTmV3bGluZVJlZ2V4ID0gL15cXG5bXFxzXSsvXG52YXIgdHJhaWxpbmdTcGFjZVJlZ2V4ID0gL1tcXHNdKyQvXG52YXIgbGVhZGluZ1NwYWNlUmVnZXggPSAvXltcXHNdKy9cbnZhciBtdWx0aVNwYWNlUmVnZXggPSAvW1xcblxcc10rL2dcblxudmFyIFRFWFRfVEFHUyA9IFtcbiAgJ2EnLCAnYWJicicsICdiJywgJ2JkaScsICdiZG8nLCAnYnInLCAnY2l0ZScsICdkYXRhJywgJ2RmbicsICdlbScsICdpJyxcbiAgJ2tiZCcsICdtYXJrJywgJ3EnLCAncnAnLCAncnQnLCAncnRjJywgJ3J1YnknLCAncycsICdhbXAnLCAnc21hbGwnLCAnc3BhbicsXG4gICdzdHJvbmcnLCAnc3ViJywgJ3N1cCcsICd0aW1lJywgJ3UnLCAndmFyJywgJ3dicidcbl1cblxudmFyIFZFUkJBVElNX1RBR1MgPSBbXG4gICdjb2RlJywgJ3ByZScsICd0ZXh0YXJlYSdcbl1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhcHBlbmRDaGlsZCAoZWwsIGNoaWxkcykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoY2hpbGRzKSkgcmV0dXJuXG5cbiAgdmFyIG5vZGVOYW1lID0gZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuXG4gIHZhciBoYWRUZXh0ID0gZmFsc2VcbiAgdmFyIHZhbHVlLCBsZWFkZXJcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2hpbGRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIG5vZGUgPSBjaGlsZHNbaV1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlKSkge1xuICAgICAgYXBwZW5kQ2hpbGQoZWwsIG5vZGUpXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ251bWJlcicgfHxcbiAgICAgIHR5cGVvZiBub2RlID09PSAnYm9vbGVhbicgfHxcbiAgICAgIHR5cGVvZiBub2RlID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICBub2RlIGluc3RhbmNlb2YgRGF0ZSB8fFxuICAgICAgbm9kZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgbm9kZSA9IG5vZGUudG9TdHJpbmcoKVxuICAgIH1cblxuICAgIHZhciBsYXN0Q2hpbGQgPSBlbC5jaGlsZE5vZGVzW2VsLmNoaWxkTm9kZXMubGVuZ3RoIC0gMV1cblxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0ZXh0IG5vZGVzXG4gICAgaWYgKHR5cGVvZiBub2RlID09PSAnc3RyaW5nJykge1xuICAgICAgaGFkVGV4dCA9IHRydWVcblxuICAgICAgLy8gSWYgd2UgYWxyZWFkeSBoYWQgdGV4dCwgYXBwZW5kIHRvIHRoZSBleGlzdGluZyB0ZXh0XG4gICAgICBpZiAobGFzdENoaWxkICYmIGxhc3RDaGlsZC5ub2RlTmFtZSA9PT0gJyN0ZXh0Jykge1xuICAgICAgICBsYXN0Q2hpbGQubm9kZVZhbHVlICs9IG5vZGVcblxuICAgICAgLy8gV2UgZGlkbid0IGhhdmUgYSB0ZXh0IG5vZGUgeWV0LCBjcmVhdGUgb25lXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICAgICAgbGFzdENoaWxkID0gbm9kZVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIHRoZSBsYXN0IG9mIHRoZSBjaGlsZCBub2RlcywgbWFrZSBzdXJlIHdlIGNsb3NlIGl0IG91dFxuICAgICAgLy8gcmlnaHRcbiAgICAgIGlmIChpID09PSBsZW4gLSAxKSB7XG4gICAgICAgIGhhZFRleHQgPSBmYWxzZVxuICAgICAgICAvLyBUcmltIHRoZSBjaGlsZCB0ZXh0IG5vZGVzIGlmIHRoZSBjdXJyZW50IG5vZGUgaXNuJ3QgYVxuICAgICAgICAvLyBub2RlIHdoZXJlIHdoaXRlc3BhY2UgbWF0dGVycy5cbiAgICAgICAgaWYgKFRFWFRfVEFHUy5pbmRleE9mKG5vZGVOYW1lKSA9PT0gLTEgJiZcbiAgICAgICAgICBWRVJCQVRJTV9UQUdTLmluZGV4T2Yobm9kZU5hbWUpID09PSAtMSkge1xuICAgICAgICAgIHZhbHVlID0gbGFzdENoaWxkLm5vZGVWYWx1ZVxuICAgICAgICAgICAgLnJlcGxhY2UobGVhZGluZ05ld2xpbmVSZWdleCwgJycpXG4gICAgICAgICAgICAucmVwbGFjZSh0cmFpbGluZ1NwYWNlUmVnZXgsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UodHJhaWxpbmdOZXdsaW5lUmVnZXgsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UobXVsdGlTcGFjZVJlZ2V4LCAnICcpXG4gICAgICAgICAgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgZWwucmVtb3ZlQ2hpbGQobGFzdENoaWxkKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0Q2hpbGQubm9kZVZhbHVlID0gdmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoVkVSQkFUSU1fVEFHUy5pbmRleE9mKG5vZGVOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAvLyBUaGUgdmVyeSBmaXJzdCBub2RlIGluIHRoZSBsaXN0IHNob3VsZCBub3QgaGF2ZSBsZWFkaW5nXG4gICAgICAgICAgLy8gd2hpdGVzcGFjZS4gU2libGluZyB0ZXh0IG5vZGVzIHNob3VsZCBoYXZlIHdoaXRlc3BhY2UgaWYgdGhlcmVcbiAgICAgICAgICAvLyB3YXMgYW55LlxuICAgICAgICAgIGxlYWRlciA9IGkgPT09IDAgPyAnJyA6ICcgJ1xuICAgICAgICAgIHZhbHVlID0gbGFzdENoaWxkLm5vZGVWYWx1ZVxuICAgICAgICAgICAgLnJlcGxhY2UobGVhZGluZ05ld2xpbmVSZWdleCwgbGVhZGVyKVxuICAgICAgICAgICAgLnJlcGxhY2UobGVhZGluZ1NwYWNlUmVnZXgsICcgJylcbiAgICAgICAgICAgIC5yZXBsYWNlKHRyYWlsaW5nU3BhY2VSZWdleCwgJycpXG4gICAgICAgICAgICAucmVwbGFjZSh0cmFpbGluZ05ld2xpbmVSZWdleCwgJycpXG4gICAgICAgICAgICAucmVwbGFjZShtdWx0aVNwYWNlUmVnZXgsICcgJylcbiAgICAgICAgICBsYXN0Q2hpbGQubm9kZVZhbHVlID0gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIERPTSBub2Rlc1xuICAgIH0gZWxzZSBpZiAobm9kZSAmJiBub2RlLm5vZGVUeXBlKSB7XG4gICAgICAvLyBJZiB0aGUgbGFzdCBub2RlIHdhcyBhIHRleHQgbm9kZSwgbWFrZSBzdXJlIGl0IGlzIHByb3Blcmx5IGNsb3NlZCBvdXRcbiAgICAgIGlmIChoYWRUZXh0KSB7XG4gICAgICAgIGhhZFRleHQgPSBmYWxzZVxuXG4gICAgICAgIC8vIFRyaW0gdGhlIGNoaWxkIHRleHQgbm9kZXMgaWYgdGhlIGN1cnJlbnQgbm9kZSBpc24ndCBhXG4gICAgICAgIC8vIHRleHQgbm9kZSBvciBhIGNvZGUgbm9kZVxuICAgICAgICBpZiAoVEVYVF9UQUdTLmluZGV4T2Yobm9kZU5hbWUpID09PSAtMSAmJlxuICAgICAgICAgIFZFUkJBVElNX1RBR1MuaW5kZXhPZihub2RlTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgdmFsdWUgPSBsYXN0Q2hpbGQubm9kZVZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShsZWFkaW5nTmV3bGluZVJlZ2V4LCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKHRyYWlsaW5nTmV3bGluZVJlZ2V4LCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKG11bHRpU3BhY2VSZWdleCwgJyAnKVxuXG4gICAgICAgICAgLy8gUmVtb3ZlIGVtcHR5IHRleHQgbm9kZXMsIGFwcGVuZCBvdGhlcndpc2VcbiAgICAgICAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICBlbC5yZW1vdmVDaGlsZChsYXN0Q2hpbGQpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3RDaGlsZC5ub2RlVmFsdWUgPSB2YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgLy8gVHJpbSB0aGUgY2hpbGQgbm9kZXMgaWYgdGhlIGN1cnJlbnQgbm9kZSBpcyBub3QgYSBub2RlXG4gICAgICAgIC8vIHdoZXJlIGFsbCB3aGl0ZXNwYWNlIG11c3QgYmUgcHJlc2VydmVkXG4gICAgICAgIH0gZWxzZSBpZiAoVkVSQkFUSU1fVEFHUy5pbmRleE9mKG5vZGVOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICB2YWx1ZSA9IGxhc3RDaGlsZC5ub2RlVmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKGxlYWRpbmdTcGFjZVJlZ2V4LCAnICcpXG4gICAgICAgICAgICAucmVwbGFjZShsZWFkaW5nTmV3bGluZVJlZ2V4LCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKHRyYWlsaW5nTmV3bGluZVJlZ2V4LCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKG11bHRpU3BhY2VSZWdleCwgJyAnKVxuICAgICAgICAgIGxhc3RDaGlsZC5ub2RlVmFsdWUgPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBsYXN0IG5vZGVuYW1lXG4gICAgICB2YXIgX25vZGVOYW1lID0gbm9kZS5ub2RlTmFtZVxuICAgICAgaWYgKF9ub2RlTmFtZSkgbm9kZU5hbWUgPSBfbm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuXG4gICAgICAvLyBBcHBlbmQgdGhlIG5vZGUgdG8gdGhlIERPTVxuICAgICAgZWwuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICB9XG4gIH1cbn1cbiIsInZhciBoeXBlcnggPSByZXF1aXJlKCdoeXBlcngnKVxudmFyIGFwcGVuZENoaWxkID0gcmVxdWlyZSgnLi9hcHBlbmRDaGlsZCcpXG5cbnZhciBTVkdOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZydcbnZhciBYTElOS05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnXG5cbnZhciBCT09MX1BST1BTID0gW1xuICAnYXV0b2ZvY3VzJywgJ2NoZWNrZWQnLCAnZGVmYXVsdGNoZWNrZWQnLCAnZGlzYWJsZWQnLCAnZm9ybW5vdmFsaWRhdGUnLFxuICAnaW5kZXRlcm1pbmF0ZScsICdyZWFkb25seScsICdyZXF1aXJlZCcsICdzZWxlY3RlZCcsICd3aWxsdmFsaWRhdGUnXG5dXG5cbnZhciBDT01NRU5UX1RBRyA9ICchLS0nXG5cbnZhciBTVkdfVEFHUyA9IFtcbiAgJ3N2ZycsICdhbHRHbHlwaCcsICdhbHRHbHlwaERlZicsICdhbHRHbHlwaEl0ZW0nLCAnYW5pbWF0ZScsICdhbmltYXRlQ29sb3InLFxuICAnYW5pbWF0ZU1vdGlvbicsICdhbmltYXRlVHJhbnNmb3JtJywgJ2NpcmNsZScsICdjbGlwUGF0aCcsICdjb2xvci1wcm9maWxlJyxcbiAgJ2N1cnNvcicsICdkZWZzJywgJ2Rlc2MnLCAnZWxsaXBzZScsICdmZUJsZW5kJywgJ2ZlQ29sb3JNYXRyaXgnLFxuICAnZmVDb21wb25lbnRUcmFuc2ZlcicsICdmZUNvbXBvc2l0ZScsICdmZUNvbnZvbHZlTWF0cml4JyxcbiAgJ2ZlRGlmZnVzZUxpZ2h0aW5nJywgJ2ZlRGlzcGxhY2VtZW50TWFwJywgJ2ZlRGlzdGFudExpZ2h0JywgJ2ZlRmxvb2QnLFxuICAnZmVGdW5jQScsICdmZUZ1bmNCJywgJ2ZlRnVuY0cnLCAnZmVGdW5jUicsICdmZUdhdXNzaWFuQmx1cicsICdmZUltYWdlJyxcbiAgJ2ZlTWVyZ2UnLCAnZmVNZXJnZU5vZGUnLCAnZmVNb3JwaG9sb2d5JywgJ2ZlT2Zmc2V0JywgJ2ZlUG9pbnRMaWdodCcsXG4gICdmZVNwZWN1bGFyTGlnaHRpbmcnLCAnZmVTcG90TGlnaHQnLCAnZmVUaWxlJywgJ2ZlVHVyYnVsZW5jZScsICdmaWx0ZXInLFxuICAnZm9udCcsICdmb250LWZhY2UnLCAnZm9udC1mYWNlLWZvcm1hdCcsICdmb250LWZhY2UtbmFtZScsICdmb250LWZhY2Utc3JjJyxcbiAgJ2ZvbnQtZmFjZS11cmknLCAnZm9yZWlnbk9iamVjdCcsICdnJywgJ2dseXBoJywgJ2dseXBoUmVmJywgJ2hrZXJuJywgJ2ltYWdlJyxcbiAgJ2xpbmUnLCAnbGluZWFyR3JhZGllbnQnLCAnbWFya2VyJywgJ21hc2snLCAnbWV0YWRhdGEnLCAnbWlzc2luZy1nbHlwaCcsXG4gICdtcGF0aCcsICdwYXRoJywgJ3BhdHRlcm4nLCAncG9seWdvbicsICdwb2x5bGluZScsICdyYWRpYWxHcmFkaWVudCcsICdyZWN0JyxcbiAgJ3NldCcsICdzdG9wJywgJ3N3aXRjaCcsICdzeW1ib2wnLCAndGV4dCcsICd0ZXh0UGF0aCcsICd0aXRsZScsICd0cmVmJyxcbiAgJ3RzcGFuJywgJ3VzZScsICd2aWV3JywgJ3ZrZXJuJ1xuXVxuXG5mdW5jdGlvbiBiZWxDcmVhdGVFbGVtZW50ICh0YWcsIHByb3BzLCBjaGlsZHJlbikge1xuICB2YXIgZWxcblxuICAvLyBJZiBhbiBzdmcgdGFnLCBpdCBuZWVkcyBhIG5hbWVzcGFjZVxuICBpZiAoU1ZHX1RBR1MuaW5kZXhPZih0YWcpICE9PSAtMSkge1xuICAgIHByb3BzLm5hbWVzcGFjZSA9IFNWR05TXG4gIH1cblxuICAvLyBJZiB3ZSBhcmUgdXNpbmcgYSBuYW1lc3BhY2VcbiAgdmFyIG5zID0gZmFsc2VcbiAgaWYgKHByb3BzLm5hbWVzcGFjZSkge1xuICAgIG5zID0gcHJvcHMubmFtZXNwYWNlXG4gICAgZGVsZXRlIHByb3BzLm5hbWVzcGFjZVxuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSBlbGVtZW50XG4gIGlmIChucykge1xuICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcpXG4gIH0gZWxzZSBpZiAodGFnID09PSBDT01NRU5UX1RBRykge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KHByb3BzLmNvbW1lbnQpXG4gIH0gZWxzZSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZylcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgcHJvcGVydGllc1xuICBmb3IgKHZhciBwIGluIHByb3BzKSB7XG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICB2YXIga2V5ID0gcC50b0xvd2VyQ2FzZSgpXG4gICAgICB2YXIgdmFsID0gcHJvcHNbcF1cbiAgICAgIC8vIE5vcm1hbGl6ZSBjbGFzc05hbWVcbiAgICAgIGlmIChrZXkgPT09ICdjbGFzc25hbWUnKSB7XG4gICAgICAgIGtleSA9ICdjbGFzcydcbiAgICAgICAgcCA9ICdjbGFzcydcbiAgICAgIH1cbiAgICAgIC8vIFRoZSBmb3IgYXR0cmlidXRlIGdldHMgdHJhbnNmb3JtZWQgdG8gaHRtbEZvciwgYnV0IHdlIGp1c3Qgc2V0IGFzIGZvclxuICAgICAgaWYgKHAgPT09ICdodG1sRm9yJykge1xuICAgICAgICBwID0gJ2ZvcidcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgaXMgYm9vbGVhbiwgc2V0IGl0c2VsZiB0byB0aGUga2V5XG4gICAgICBpZiAoQk9PTF9QUk9QUy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG4gICAgICAgIGlmICh2YWwgPT09ICd0cnVlJykgdmFsID0ga2V5XG4gICAgICAgIGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykgY29udGludWVcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgcHJlZmVycyBiZWluZyBzZXQgZGlyZWN0bHkgdnMgc2V0QXR0cmlidXRlXG4gICAgICBpZiAoa2V5LnNsaWNlKDAsIDIpID09PSAnb24nKSB7XG4gICAgICAgIGVsW3BdID0gdmFsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBpZiAocCA9PT0gJ3hsaW5rOmhyZWYnKSB7XG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhYTElOS05TLCBwLCB2YWwpXG4gICAgICAgICAgfSBlbHNlIGlmICgvXnhtbG5zKCR8OikvaS50ZXN0KHApKSB7XG4gICAgICAgICAgICAvLyBza2lwIHhtbG5zIGRlZmluaXRpb25zXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIHAsIHZhbClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwuc2V0QXR0cmlidXRlKHAsIHZhbClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFwcGVuZENoaWxkKGVsLCBjaGlsZHJlbilcbiAgcmV0dXJuIGVsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaHlwZXJ4KGJlbENyZWF0ZUVsZW1lbnQsIHtjb21tZW50czogdHJ1ZX0pXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbW9kdWxlLmV4cG9ydHNcbm1vZHVsZS5leHBvcnRzLmNyZWF0ZUVsZW1lbnQgPSBiZWxDcmVhdGVFbGVtZW50XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGF0dHJpYnV0ZVRvUHJvcGVydHlcblxudmFyIHRyYW5zZm9ybSA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdmb3InOiAnaHRtbEZvcicsXG4gICdodHRwLWVxdWl2JzogJ2h0dHBFcXVpdidcbn1cblxuZnVuY3Rpb24gYXR0cmlidXRlVG9Qcm9wZXJ0eSAoaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHRhZ05hbWUsIGF0dHJzLCBjaGlsZHJlbikge1xuICAgIGZvciAodmFyIGF0dHIgaW4gYXR0cnMpIHtcbiAgICAgIGlmIChhdHRyIGluIHRyYW5zZm9ybSkge1xuICAgICAgICBhdHRyc1t0cmFuc2Zvcm1bYXR0cl1dID0gYXR0cnNbYXR0cl1cbiAgICAgICAgZGVsZXRlIGF0dHJzW2F0dHJdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoKHRhZ05hbWUsIGF0dHJzLCBjaGlsZHJlbilcbiAgfVxufVxuIiwidmFyIGF0dHJUb1Byb3AgPSByZXF1aXJlKCdoeXBlcnNjcmlwdC1hdHRyaWJ1dGUtdG8tcHJvcGVydHknKVxuXG52YXIgVkFSID0gMCwgVEVYVCA9IDEsIE9QRU4gPSAyLCBDTE9TRSA9IDMsIEFUVFIgPSA0XG52YXIgQVRUUl9LRVkgPSA1LCBBVFRSX0tFWV9XID0gNlxudmFyIEFUVFJfVkFMVUVfVyA9IDcsIEFUVFJfVkFMVUUgPSA4XG52YXIgQVRUUl9WQUxVRV9TUSA9IDksIEFUVFJfVkFMVUVfRFEgPSAxMFxudmFyIEFUVFJfRVEgPSAxMSwgQVRUUl9CUkVBSyA9IDEyXG52YXIgQ09NTUVOVCA9IDEzXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGgsIG9wdHMpIHtcbiAgaWYgKCFvcHRzKSBvcHRzID0ge31cbiAgdmFyIGNvbmNhdCA9IG9wdHMuY29uY2F0IHx8IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIFN0cmluZyhhKSArIFN0cmluZyhiKVxuICB9XG4gIGlmIChvcHRzLmF0dHJUb1Byb3AgIT09IGZhbHNlKSB7XG4gICAgaCA9IGF0dHJUb1Byb3AoaClcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoc3RyaW5ncykge1xuICAgIHZhciBzdGF0ZSA9IFRFWFQsIHJlZyA9ICcnXG4gICAgdmFyIGFyZ2xlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB2YXIgcGFydHMgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaSA8IGFyZ2xlbiAtIDEpIHtcbiAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpKzFdXG4gICAgICAgIHZhciBwID0gcGFyc2Uoc3RyaW5nc1tpXSlcbiAgICAgICAgdmFyIHhzdGF0ZSA9IHN0YXRlXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFJfVkFMVUVfRFEpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSkgeHN0YXRlID0gQVRUUl9WQUxVRVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSX1ZBTFVFX1cpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUikgeHN0YXRlID0gQVRUUl9LRVlcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gT1BFTikge1xuICAgICAgICAgIGlmIChyZWcgPT09ICcvJykge1xuICAgICAgICAgICAgcC5wdXNoKFsgT1BFTiwgJy8nLCBhcmcgXSlcbiAgICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHAucHVzaChbIE9QRU4sIGFyZyBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh4c3RhdGUgPT09IENPTU1FTlQgJiYgb3B0cy5jb21tZW50cykge1xuICAgICAgICAgIHJlZyArPSBTdHJpbmcoYXJnKVxuICAgICAgICB9IGVsc2UgaWYgKHhzdGF0ZSAhPT0gQ09NTUVOVCkge1xuICAgICAgICAgIHAucHVzaChbIFZBUiwgeHN0YXRlLCBhcmcgXSlcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwKVxuICAgICAgfSBlbHNlIHBhcnRzLnB1c2guYXBwbHkocGFydHMsIHBhcnNlKHN0cmluZ3NbaV0pKVxuICAgIH1cblxuICAgIHZhciB0cmVlID0gW251bGwse30sW11dXG4gICAgdmFyIHN0YWNrID0gW1t0cmVlLC0xXV1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VyID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzBdXG4gICAgICB2YXIgcCA9IHBhcnRzW2ldLCBzID0gcFswXVxuICAgICAgaWYgKHMgPT09IE9QRU4gJiYgL15cXC8vLnRlc3QocFsxXSkpIHtcbiAgICAgICAgdmFyIGl4ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzFdXG4gICAgICAgIGlmIChzdGFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgICBzdGFja1tzdGFjay5sZW5ndGgtMV1bMF1bMl1baXhdID0gaChcbiAgICAgICAgICAgIGN1clswXSwgY3VyWzFdLCBjdXJbMl0ubGVuZ3RoID8gY3VyWzJdIDogdW5kZWZpbmVkXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IE9QRU4pIHtcbiAgICAgICAgdmFyIGMgPSBbcFsxXSx7fSxbXV1cbiAgICAgICAgY3VyWzJdLnB1c2goYylcbiAgICAgICAgc3RhY2sucHVzaChbYyxjdXJbMl0ubGVuZ3RoLTFdKVxuICAgICAgfSBlbHNlIGlmIChzID09PSBBVFRSX0tFWSB8fCAocyA9PT0gVkFSICYmIHBbMV0gPT09IEFUVFJfS0VZKSkge1xuICAgICAgICB2YXIga2V5ID0gJydcbiAgICAgICAgdmFyIGNvcHlLZXlcbiAgICAgICAgZm9yICg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwYXJ0c1tpXVswXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIGtleSA9IGNvbmNhdChrZXksIHBhcnRzW2ldWzFdKVxuICAgICAgICAgIH0gZWxzZSBpZiAocGFydHNbaV1bMF0gPT09IFZBUiAmJiBwYXJ0c1tpXVsxXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydHNbaV1bMl0gPT09ICdvYmplY3QnICYmICFrZXkpIHtcbiAgICAgICAgICAgICAgZm9yIChjb3B5S2V5IGluIHBhcnRzW2ldWzJdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzW2ldWzJdLmhhc093blByb3BlcnR5KGNvcHlLZXkpICYmICFjdXJbMV1bY29weUtleV0pIHtcbiAgICAgICAgICAgICAgICAgIGN1clsxXVtjb3B5S2V5XSA9IHBhcnRzW2ldWzJdW2NvcHlLZXldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBrZXkgPSBjb25jYXQoa2V5LCBwYXJ0c1tpXVsyXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfRVEpIGkrK1xuICAgICAgICB2YXIgaiA9IGlcbiAgICAgICAgZm9yICg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwYXJ0c1tpXVswXSA9PT0gQVRUUl9WQUxVRSB8fCBwYXJ0c1tpXVswXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIGlmICghY3VyWzFdW2tleV0pIGN1clsxXVtrZXldID0gc3RyZm4ocGFydHNbaV1bMV0pXG4gICAgICAgICAgICBlbHNlIHBhcnRzW2ldWzFdPT09XCJcIiB8fCAoY3VyWzFdW2tleV0gPSBjb25jYXQoY3VyWzFdW2tleV0sIHBhcnRzW2ldWzFdKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJ0c1tpXVswXSA9PT0gVkFSXG4gICAgICAgICAgJiYgKHBhcnRzW2ldWzFdID09PSBBVFRSX1ZBTFVFIHx8IHBhcnRzW2ldWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgICAgIGlmICghY3VyWzFdW2tleV0pIGN1clsxXVtrZXldID0gc3RyZm4ocGFydHNbaV1bMl0pXG4gICAgICAgICAgICBlbHNlIHBhcnRzW2ldWzJdPT09XCJcIiB8fCAoY3VyWzFdW2tleV0gPSBjb25jYXQoY3VyWzFdW2tleV0sIHBhcnRzW2ldWzJdKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoICYmICFjdXJbMV1ba2V5XSAmJiBpID09PSBqXG4gICAgICAgICAgICAmJiAocGFydHNbaV1bMF0gPT09IENMT1NFIHx8IHBhcnRzW2ldWzBdID09PSBBVFRSX0JSRUFLKSkge1xuICAgICAgICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9pbmZyYXN0cnVjdHVyZS5odG1sI2Jvb2xlYW4tYXR0cmlidXRlc1xuICAgICAgICAgICAgICAvLyBlbXB0eSBzdHJpbmcgaXMgZmFsc3ksIG5vdCB3ZWxsIGJlaGF2ZWQgdmFsdWUgaW4gYnJvd3NlclxuICAgICAgICAgICAgICBjdXJbMV1ba2V5XSA9IGtleS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IENMT1NFKSB7XG4gICAgICAgICAgICAgIGktLVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgY3VyWzFdW3BbMV1dID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChzID09PSBWQVIgJiYgcFsxXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgY3VyWzFdW3BbMl1dID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChzID09PSBDTE9TRSkge1xuICAgICAgICBpZiAoc2VsZkNsb3NpbmcoY3VyWzBdKSAmJiBzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgaXggPSBzdGFja1tzdGFjay5sZW5ndGgtMV1bMV1cbiAgICAgICAgICBzdGFjay5wb3AoKVxuICAgICAgICAgIHN0YWNrW3N0YWNrLmxlbmd0aC0xXVswXVsyXVtpeF0gPSBoKFxuICAgICAgICAgICAgY3VyWzBdLCBjdXJbMV0sIGN1clsyXS5sZW5ndGggPyBjdXJbMl0gOiB1bmRlZmluZWRcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVkFSICYmIHBbMV0gPT09IFRFWFQpIHtcbiAgICAgICAgaWYgKHBbMl0gPT09IHVuZGVmaW5lZCB8fCBwWzJdID09PSBudWxsKSBwWzJdID0gJydcbiAgICAgICAgZWxzZSBpZiAoIXBbMl0pIHBbMl0gPSBjb25jYXQoJycsIHBbMl0pXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBbMl1bMF0pKSB7XG4gICAgICAgICAgY3VyWzJdLnB1c2guYXBwbHkoY3VyWzJdLCBwWzJdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1clsyXS5wdXNoKHBbMl0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVEVYVCkge1xuICAgICAgICBjdXJbMl0ucHVzaChwWzFdKVxuICAgICAgfSBlbHNlIGlmIChzID09PSBBVFRSX0VRIHx8IHMgPT09IEFUVFJfQlJFQUspIHtcbiAgICAgICAgLy8gbm8tb3BcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5oYW5kbGVkOiAnICsgcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHJlZVsyXS5sZW5ndGggPiAxICYmIC9eXFxzKiQvLnRlc3QodHJlZVsyXVswXSkpIHtcbiAgICAgIHRyZWVbMl0uc2hpZnQoKVxuICAgIH1cblxuICAgIGlmICh0cmVlWzJdLmxlbmd0aCA+IDJcbiAgICB8fCAodHJlZVsyXS5sZW5ndGggPT09IDIgJiYgL1xcUy8udGVzdCh0cmVlWzJdWzFdKSkpIHtcbiAgICAgIGlmIChvcHRzLmNyZWF0ZUZyYWdtZW50KSByZXR1cm4gb3B0cy5jcmVhdGVGcmFnbWVudCh0cmVlWzJdKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnbXVsdGlwbGUgcm9vdCBlbGVtZW50cyBtdXN0IGJlIHdyYXBwZWQgaW4gYW4gZW5jbG9zaW5nIHRhZydcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHJlZVsyXVswXSkgJiYgdHlwZW9mIHRyZWVbMl1bMF1bMF0gPT09ICdzdHJpbmcnXG4gICAgJiYgQXJyYXkuaXNBcnJheSh0cmVlWzJdWzBdWzJdKSkge1xuICAgICAgdHJlZVsyXVswXSA9IGgodHJlZVsyXVswXVswXSwgdHJlZVsyXVswXVsxXSwgdHJlZVsyXVswXVsyXSlcbiAgICB9XG4gICAgcmV0dXJuIHRyZWVbMl1bMF1cblxuICAgIGZ1bmN0aW9uIHBhcnNlIChzdHIpIHtcbiAgICAgIHZhciByZXMgPSBbXVxuICAgICAgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cpIHN0YXRlID0gQVRUUlxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSBzdHIuY2hhckF0KGkpXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gVEVYVCAmJiBjID09PSAnPCcpIHtcbiAgICAgICAgICBpZiAocmVnLmxlbmd0aCkgcmVzLnB1c2goW1RFWFQsIHJlZ10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IE9QRU5cbiAgICAgICAgfSBlbHNlIGlmIChjID09PSAnPicgJiYgIXF1b3Qoc3RhdGUpICYmIHN0YXRlICE9PSBDT01NRU5UKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBPUEVOICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLHJlZ10pXG4gICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLnB1c2goW0NMT1NFXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gVEVYVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBDT01NRU5UICYmIC8tJC8udGVzdChyZWcpICYmIGMgPT09ICctJykge1xuICAgICAgICAgIGlmIChvcHRzLmNvbW1lbnRzKSB7XG4gICAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWcuc3Vic3RyKDAsIHJlZy5sZW5ndGggLSAxKV0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBURVhUXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4gJiYgL14hLS0kLy50ZXN0KHJlZykpIHtcbiAgICAgICAgICBpZiAob3B0cy5jb21tZW50cykge1xuICAgICAgICAgICAgcmVzLnB1c2goW09QRU4sIHJlZ10sW0FUVFJfS0VZLCdjb21tZW50J10sW0FUVFJfRVFdKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZWcgPSBjXG4gICAgICAgICAgc3RhdGUgPSBDT01NRU5UXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRFWFQgfHwgc3RhdGUgPT09IENPTU1FTlQpIHtcbiAgICAgICAgICByZWcgKz0gY1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBPUEVOICYmIGMgPT09ICcvJyAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gbm8tb3AsIHNlbGYgY2xvc2luZyB0YWcgd2l0aG91dCBhIHNwYWNlIDxici8+XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4gJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXMucHVzaChbT1BFTiwgcmVnXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTikge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFIgJiYgL1teXFxzXCInPS9dLy50ZXN0KGMpKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWVxuICAgICAgICAgIHJlZyA9IGNcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUiAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgaWYgKHJlZy5sZW5ndGgpIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0JSRUFLXSlcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkgJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWV9XXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZICYmIGMgPT09ICc9Jykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddLFtBVFRSX0VRXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRV9XXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfSBlbHNlIGlmICgoc3RhdGUgPT09IEFUVFJfS0VZX1cgfHwgc3RhdGUgPT09IEFUVFIpICYmIGMgPT09ICc9Jykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0VRXSlcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfV1xuICAgICAgICB9IGVsc2UgaWYgKChzdGF0ZSA9PT0gQVRUUl9LRVlfVyB8fCBzdGF0ZSA9PT0gQVRUUikgJiYgIS9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9CUkVBS10pXG4gICAgICAgICAgaWYgKC9bXFx3LV0vLnRlc3QoYykpIHtcbiAgICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgICAgICBzdGF0ZSA9IEFUVFJfS0VZXG4gICAgICAgICAgfSBlbHNlIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgYyA9PT0gJ1wiJykge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRV9EUVxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgYyA9PT0gXCInXCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfU1FcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSAmJiBjID09PSAnXCInKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSxbQVRUUl9CUkVBS10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSAmJiBjID09PSBcIidcIikge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10sW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfVyAmJiAhL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRVxuICAgICAgICAgIGktLVxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddLFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFIHx8IHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRXG4gICAgICAgIHx8IHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN0YXRlID09PSBURVhUICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW1RFWFQscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0cmZuICh4KSB7XG4gICAgaWYgKHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKSByZXR1cm4geFxuICAgIGVsc2UgaWYgKHR5cGVvZiB4ID09PSAnc3RyaW5nJykgcmV0dXJuIHhcbiAgICBlbHNlIGlmICh4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JykgcmV0dXJuIHhcbiAgICBlbHNlIGlmICh4ID09PSBudWxsIHx8IHggPT09IHVuZGVmaW5lZCkgcmV0dXJuIHhcbiAgICBlbHNlIHJldHVybiBjb25jYXQoJycsIHgpXG4gIH1cbn1cblxuZnVuY3Rpb24gcXVvdCAoc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRIHx8IHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRXG59XG5cbnZhciBjbG9zZVJFID0gUmVnRXhwKCdeKCcgKyBbXG4gICdhcmVhJywgJ2Jhc2UnLCAnYmFzZWZvbnQnLCAnYmdzb3VuZCcsICdicicsICdjb2wnLCAnY29tbWFuZCcsICdlbWJlZCcsXG4gICdmcmFtZScsICdocicsICdpbWcnLCAnaW5wdXQnLCAnaXNpbmRleCcsICdrZXlnZW4nLCAnbGluaycsICdtZXRhJywgJ3BhcmFtJyxcbiAgJ3NvdXJjZScsICd0cmFjaycsICd3YnInLCAnIS0tJyxcbiAgLy8gU1ZHIFRBR1NcbiAgJ2FuaW1hdGUnLCAnYW5pbWF0ZVRyYW5zZm9ybScsICdjaXJjbGUnLCAnY3Vyc29yJywgJ2Rlc2MnLCAnZWxsaXBzZScsXG4gICdmZUJsZW5kJywgJ2ZlQ29sb3JNYXRyaXgnLCAnZmVDb21wb3NpdGUnLFxuICAnZmVDb252b2x2ZU1hdHJpeCcsICdmZURpZmZ1c2VMaWdodGluZycsICdmZURpc3BsYWNlbWVudE1hcCcsXG4gICdmZURpc3RhbnRMaWdodCcsICdmZUZsb29kJywgJ2ZlRnVuY0EnLCAnZmVGdW5jQicsICdmZUZ1bmNHJywgJ2ZlRnVuY1InLFxuICAnZmVHYXVzc2lhbkJsdXInLCAnZmVJbWFnZScsICdmZU1lcmdlTm9kZScsICdmZU1vcnBob2xvZ3knLFxuICAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLFxuICAnZmVUdXJidWxlbmNlJywgJ2ZvbnQtZmFjZS1mb3JtYXQnLCAnZm9udC1mYWNlLW5hbWUnLCAnZm9udC1mYWNlLXVyaScsXG4gICdnbHlwaCcsICdnbHlwaFJlZicsICdoa2VybicsICdpbWFnZScsICdsaW5lJywgJ21pc3NpbmctZ2x5cGgnLCAnbXBhdGgnLFxuICAncGF0aCcsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JlY3QnLCAnc2V0JywgJ3N0b3AnLCAndHJlZicsICd1c2UnLCAndmlldycsXG4gICd2a2Vybidcbl0uam9pbignfCcpICsgJykoPzpbXFwuI11bYS16QS1aMC05XFx1MDA3Ri1cXHVGRkZGXzotXSspKiQnKVxuZnVuY3Rpb24gc2VsZkNsb3NpbmcgKHRhZykgeyByZXR1cm4gY2xvc2VSRS50ZXN0KHRhZykgfVxuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCIsIFtcIm1vZHVsZVwiXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBmYWN0b3J5KG1vZHVsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1vZCA9IHtcbiAgICAgIGV4cG9ydHM6IHt9XG4gICAgfTtcbiAgICBmYWN0b3J5KG1vZCk7XG4gICAgZ2xvYmFsLmJyb3dzZXIgPSBtb2QuZXhwb3J0cztcbiAgfVxufSkodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxUaGlzIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24gKG1vZHVsZSkge1xuICAvKiB3ZWJleHRlbnNpb24tcG9seWZpbGwgLSB2MC44LjAgLSBUdWUgQXByIDIwIDIwMjEgMTE6Mjc6MzggKi9cblxuICAvKiAtKi0gTW9kZTogaW5kZW50LXRhYnMtbW9kZTogbmlsOyBqcy1pbmRlbnQtbGV2ZWw6IDIgLSotICovXG5cbiAgLyogdmltOiBzZXQgc3RzPTIgc3c9MiBldCB0dz04MDogKi9cblxuICAvKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXG4gICAqIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXNcbiAgICogZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gKi9cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgaWYgKHR5cGVvZiBicm93c2VyID09PSBcInVuZGVmaW5lZFwiIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihicm93c2VyKSAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgIGNvbnN0IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSA9IFwiVGhlIG1lc3NhZ2UgcG9ydCBjbG9zZWQgYmVmb3JlIGEgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkLlwiO1xuICAgIGNvbnN0IFNFTkRfUkVTUE9OU0VfREVQUkVDQVRJT05fV0FSTklORyA9IFwiUmV0dXJuaW5nIGEgUHJvbWlzZSBpcyB0aGUgcHJlZmVycmVkIHdheSB0byBzZW5kIGEgcmVwbHkgZnJvbSBhbiBvbk1lc3NhZ2Uvb25NZXNzYWdlRXh0ZXJuYWwgbGlzdGVuZXIsIGFzIHRoZSBzZW5kUmVzcG9uc2Ugd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIHNwZWNzIChTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9Nb3ppbGxhL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9BUEkvcnVudGltZS9vbk1lc3NhZ2UpXCI7IC8vIFdyYXBwaW5nIHRoZSBidWxrIG9mIHRoaXMgcG9seWZpbGwgaW4gYSBvbmUtdGltZS11c2UgZnVuY3Rpb24gaXMgYSBtaW5vclxuICAgIC8vIG9wdGltaXphdGlvbiBmb3IgRmlyZWZveC4gU2luY2UgU3BpZGVybW9ua2V5IGRvZXMgbm90IGZ1bGx5IHBhcnNlIHRoZVxuICAgIC8vIGNvbnRlbnRzIG9mIGEgZnVuY3Rpb24gdW50aWwgdGhlIGZpcnN0IHRpbWUgaXQncyBjYWxsZWQsIGFuZCBzaW5jZSBpdCB3aWxsXG4gICAgLy8gbmV2ZXIgYWN0dWFsbHkgbmVlZCB0byBiZSBjYWxsZWQsIHRoaXMgYWxsb3dzIHRoZSBwb2x5ZmlsbCB0byBiZSBpbmNsdWRlZFxuICAgIC8vIGluIEZpcmVmb3ggbmVhcmx5IGZvciBmcmVlLlxuXG4gICAgY29uc3Qgd3JhcEFQSXMgPSBleHRlbnNpb25BUElzID0+IHtcbiAgICAgIC8vIE5PVEU6IGFwaU1ldGFkYXRhIGlzIGFzc29jaWF0ZWQgdG8gdGhlIGNvbnRlbnQgb2YgdGhlIGFwaS1tZXRhZGF0YS5qc29uIGZpbGVcbiAgICAgIC8vIGF0IGJ1aWxkIHRpbWUgYnkgcmVwbGFjaW5nIHRoZSBmb2xsb3dpbmcgXCJpbmNsdWRlXCIgd2l0aCB0aGUgY29udGVudCBvZiB0aGVcbiAgICAgIC8vIEpTT04gZmlsZS5cbiAgICAgIGNvbnN0IGFwaU1ldGFkYXRhID0ge1xuICAgICAgICBcImFsYXJtc1wiOiB7XG4gICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImNsZWFyQWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYm9va21hcmtzXCI6IHtcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldENoaWxkcmVuXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UmVjZW50XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0U3ViVHJlZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFRyZWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlVHJlZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImJyb3dzZXJBY3Rpb25cIjoge1xuICAgICAgICAgIFwiZGlzYWJsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImVuYWJsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEJhZGdlQmFja2dyb3VuZENvbG9yXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm9wZW5Qb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEJhZGdlQmFja2dyb3VuZENvbG9yXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0SWNvblwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFBvcHVwXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0VGl0bGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJicm93c2luZ0RhdGFcIjoge1xuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlQ2FjaGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVDb29raWVzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlRG93bmxvYWRzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlRm9ybURhdGFcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVIaXN0b3J5XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlTG9jYWxTdG9yYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlUGFzc3dvcmRzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlUGx1Z2luRGF0YVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiY29tbWFuZHNcIjoge1xuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiY29udGV4dE1lbnVzXCI6IHtcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImNvb2tpZXNcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsQ29va2llU3RvcmVzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZGV2dG9vbHNcIjoge1xuICAgICAgICAgIFwiaW5zcGVjdGVkV2luZG93XCI6IHtcbiAgICAgICAgICAgIFwiZXZhbFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMixcbiAgICAgICAgICAgICAgXCJzaW5nbGVDYWxsYmFja0FyZ1wiOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJwYW5lbHNcIjoge1xuICAgICAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMyxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDMsXG4gICAgICAgICAgICAgIFwic2luZ2xlQ2FsbGJhY2tBcmdcIjogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZWxlbWVudHNcIjoge1xuICAgICAgICAgICAgICBcImNyZWF0ZVNpZGViYXJQYW5lXCI6IHtcbiAgICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImRvd25sb2Fkc1wiOiB7XG4gICAgICAgICAgXCJjYW5jZWxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkb3dubG9hZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImVyYXNlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0RmlsZUljb25cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJvcGVuXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicGF1c2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVGaWxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVzdW1lXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2hvd1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImV4dGVuc2lvblwiOiB7XG4gICAgICAgICAgXCJpc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaXNBbGxvd2VkSW5jb2duaXRvQWNjZXNzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaGlzdG9yeVwiOiB7XG4gICAgICAgICAgXCJhZGRVcmxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkZWxldGVBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkZWxldGVSYW5nZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRlbGV0ZVVybFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFZpc2l0c1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImkxOG5cIjoge1xuICAgICAgICAgIFwiZGV0ZWN0TGFuZ3VhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBY2NlcHRMYW5ndWFnZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJpZGVudGl0eVwiOiB7XG4gICAgICAgICAgXCJsYXVuY2hXZWJBdXRoRmxvd1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImlkbGVcIjoge1xuICAgICAgICAgIFwicXVlcnlTdGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIm1hbmFnZW1lbnRcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0U2VsZlwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEVuYWJsZWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ1bmluc3RhbGxTZWxmXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwibm90aWZpY2F0aW9uc1wiOiB7XG4gICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFBlcm1pc3Npb25MZXZlbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInBhZ2VBY3Rpb25cIjoge1xuICAgICAgICAgIFwiZ2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImhpZGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRJY29uXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNob3dcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJwZXJtaXNzaW9uc1wiOiB7XG4gICAgICAgICAgXCJjb250YWluc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlcXVlc3RcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJydW50aW1lXCI6IHtcbiAgICAgICAgICBcImdldEJhY2tncm91bmRQYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UGxhdGZvcm1JbmZvXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwib3Blbk9wdGlvbnNQYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVxdWVzdFVwZGF0ZUNoZWNrXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VuZE1lc3NhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogM1xuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZW5kTmF0aXZlTWVzc2FnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFVuaW5zdGFsbFVSTFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInNlc3Npb25zXCI6IHtcbiAgICAgICAgICBcImdldERldmljZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRSZWNlbnRseUNsb3NlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlc3RvcmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJzdG9yYWdlXCI6IHtcbiAgICAgICAgICBcImxvY2FsXCI6IHtcbiAgICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibWFuYWdlZFwiOiB7XG4gICAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzeW5jXCI6IHtcbiAgICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwidGFic1wiOiB7XG4gICAgICAgICAgXCJjYXB0dXJlVmlzaWJsZVRhYlwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRldGVjdExhbmd1YWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGlzY2FyZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImR1cGxpY2F0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImV4ZWN1dGVTY3JpcHRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRDdXJyZW50XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Wm9vbVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFpvb21TZXR0aW5nc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdvQmFja1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdvRm9yd2FyZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImhpZ2hsaWdodFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImluc2VydENTU1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbG9hZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUNTU1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlbmRNZXNzYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDNcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0Wm9vbVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFpvb21TZXR0aW5nc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInRvcFNpdGVzXCI6IHtcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIndlYk5hdmlnYXRpb25cIjoge1xuICAgICAgICAgIFwiZ2V0QWxsRnJhbWVzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0RnJhbWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ3ZWJSZXF1ZXN0XCI6IHtcbiAgICAgICAgICBcImhhbmRsZXJCZWhhdmlvckNoYW5nZWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ3aW5kb3dzXCI6IHtcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEN1cnJlbnRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRMYXN0Rm9jdXNlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMoYXBpTWV0YWRhdGEpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcGktbWV0YWRhdGEuanNvbiBoYXMgbm90IGJlZW4gaW5jbHVkZWQgaW4gYnJvd3Nlci1wb2x5ZmlsbFwiKTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQSBXZWFrTWFwIHN1YmNsYXNzIHdoaWNoIGNyZWF0ZXMgYW5kIHN0b3JlcyBhIHZhbHVlIGZvciBhbnkga2V5IHdoaWNoIGRvZXNcbiAgICAgICAqIG5vdCBleGlzdCB3aGVuIGFjY2Vzc2VkLCBidXQgYmVoYXZlcyBleGFjdGx5IGFzIGFuIG9yZGluYXJ5IFdlYWtNYXBcbiAgICAgICAqIG90aGVyd2lzZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjcmVhdGVJdGVtXG4gICAgICAgKiAgICAgICAgQSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGNhbGxlZCBpbiBvcmRlciB0byBjcmVhdGUgdGhlIHZhbHVlIGZvciBhbnlcbiAgICAgICAqICAgICAgICBrZXkgd2hpY2ggZG9lcyBub3QgZXhpc3QsIHRoZSBmaXJzdCB0aW1lIGl0IGlzIGFjY2Vzc2VkLiBUaGVcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiByZWNlaXZlcywgYXMgaXRzIG9ubHkgYXJndW1lbnQsIHRoZSBrZXkgYmVpbmcgY3JlYXRlZC5cbiAgICAgICAqL1xuXG5cbiAgICAgIGNsYXNzIERlZmF1bHRXZWFrTWFwIGV4dGVuZHMgV2Vha01hcCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKGNyZWF0ZUl0ZW0sIGl0ZW1zID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgc3VwZXIoaXRlbXMpO1xuICAgICAgICAgIHRoaXMuY3JlYXRlSXRlbSA9IGNyZWF0ZUl0ZW07XG4gICAgICAgIH1cblxuICAgICAgICBnZXQoa2V5KSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLnNldChrZXksIHRoaXMuY3JlYXRlSXRlbShrZXkpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0KGtleSk7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBvYmplY3Qgd2l0aCBhIGB0aGVuYCBtZXRob2QsIGFuZCBjYW5cbiAgICAgICAqIHRoZXJlZm9yZSBiZSBhc3N1bWVkIHRvIGJlaGF2ZSBhcyBhIFByb21pc2UuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdC5cbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB0aGVuYWJsZS5cbiAgICAgICAqL1xuXG5cbiAgICAgIGNvbnN0IGlzVGhlbmFibGUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBmdW5jdGlvbiB3aGljaCwgd2hlbiBjYWxsZWQsIHdpbGwgcmVzb2x2ZSBvciByZWplY3RcbiAgICAgICAqIHRoZSBnaXZlbiBwcm9taXNlIGJhc2VkIG9uIGhvdyBpdCBpcyBjYWxsZWQ6XG4gICAgICAgKlxuICAgICAgICogLSBJZiwgd2hlbiBjYWxsZWQsIGBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JgIGNvbnRhaW5zIGEgbm9uLW51bGwgb2JqZWN0LFxuICAgICAgICogICB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCB3aXRoIHRoYXQgdmFsdWUuXG4gICAgICAgKiAtIElmIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBleGFjdGx5IG9uZSBhcmd1bWVudCwgdGhlIHByb21pc2UgaXNcbiAgICAgICAqICAgcmVzb2x2ZWQgdG8gdGhhdCB2YWx1ZS5cbiAgICAgICAqIC0gT3RoZXJ3aXNlLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB0byBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGVcbiAgICAgICAqICAgZnVuY3Rpb24ncyBhcmd1bWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHByb21pc2VcbiAgICAgICAqICAgICAgICBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgcmVzb2x1dGlvbiBhbmQgcmVqZWN0aW9uIGZ1bmN0aW9ucyBvZiBhXG4gICAgICAgKiAgICAgICAgcHJvbWlzZS5cbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVzb2x2ZVxuICAgICAgICogICAgICAgIFRoZSBwcm9taXNlJ3MgcmVzb2x1dGlvbiBmdW5jdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVqZWN0XG4gICAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZWplY3Rpb24gZnVuY3Rpb24uXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gbWV0YWRhdGFcbiAgICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgd3JhcHBlZCBtZXRob2Qgd2hpY2ggaGFzIGNyZWF0ZWQgdGhlIGNhbGxiYWNrLlxuICAgICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAgICogICAgICAgIFdoZXRoZXIgb3Igbm90IHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggb25seSB0aGUgZmlyc3RcbiAgICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24gaXMgaW52b2tlZCB3aXRoIG9ubHkgYSBzaW5nbGUgYXJndW1lbnQsIHRoYXQgd2lsbCBiZVxuICAgICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge2Z1bmN0aW9ufVxuICAgICAgICogICAgICAgIFRoZSBnZW5lcmF0ZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgKi9cblxuXG4gICAgICBjb25zdCBtYWtlQ2FsbGJhY2sgPSAocHJvbWlzZSwgbWV0YWRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuICguLi5jYWxsYmFja0FyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmcgfHwgY2FsbGJhY2tBcmdzLmxlbmd0aCA8PSAxICYmIG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJnc1swXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShjYWxsYmFja0FyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHBsdXJhbGl6ZUFyZ3VtZW50cyA9IG51bUFyZ3MgPT4gbnVtQXJncyA9PSAxID8gXCJhcmd1bWVudFwiIDogXCJhcmd1bWVudHNcIjtcbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhIHdyYXBwZXIgZnVuY3Rpb24gZm9yIGEgbWV0aG9kIHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG1ldGFkYXRhLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICAgKiAgICAgICAgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB3aGljaCBpcyBiZWluZyB3cmFwcGVkLlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICAgKiAgICAgICAgTWV0YWRhdGEgYWJvdXQgdGhlIG1ldGhvZCBiZWluZyB3cmFwcGVkLlxuICAgICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5taW5BcmdzXG4gICAgICAgKiAgICAgICAgVGhlIG1pbmltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyB3aGljaCBtdXN0IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggZmV3ZXIgdGhhbiB0aGlzIG51bWJlciBvZiBhcmd1bWVudHMsIHRoZVxuICAgICAgICogICAgICAgIHdyYXBwZXIgd2lsbCByYWlzZSBhbiBleGNlcHRpb24uXG4gICAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1heEFyZ3NcbiAgICAgICAqICAgICAgICBUaGUgbWF4aW11bSBudW1iZXIgb2YgYXJndW1lbnRzIHdoaWNoIG1heSBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIG1vcmUgdGhhbiB0aGlzIG51bWJlciBvZiBhcmd1bWVudHMsIHRoZVxuICAgICAgICogICAgICAgIHdyYXBwZXIgd2lsbCByYWlzZSBhbiBleGNlcHRpb24uXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb24ob2JqZWN0LCAuLi4qKX1cbiAgICAgICAqICAgICAgIFRoZSBnZW5lcmF0ZWQgd3JhcHBlciBmdW5jdGlvbi5cbiAgICAgICAqL1xuXG5cbiAgICAgIGNvbnN0IHdyYXBBc3luY0Z1bmN0aW9uID0gKG5hbWUsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBhc3luY0Z1bmN0aW9uV3JhcHBlcih0YXJnZXQsIC4uLmFyZ3MpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPCBtZXRhZGF0YS5taW5BcmdzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IG1ldGFkYXRhLm1heEFyZ3MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgQVBJIG1ldGhvZCBoYXMgY3VycmVudGx5IG5vIGNhbGxiYWNrIG9uIENocm9tZSwgYnV0IGl0IHJldHVybiBhIHByb21pc2Ugb24gRmlyZWZveCxcbiAgICAgICAgICAgICAgLy8gYW5kIHNvIHRoZSBwb2x5ZmlsbCB3aWxsIHRyeSB0byBjYWxsIGl0IHdpdGggYSBjYWxsYmFjayBmaXJzdCwgYW5kIGl0IHdpbGwgZmFsbGJhY2tcbiAgICAgICAgICAgICAgLy8gdG8gbm90IHBhc3NpbmcgdGhlIGNhbGxiYWNrIGlmIHRoZSBmaXJzdCBjYWxsIGZhaWxzLlxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzLCBtYWtlQ2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgICAgICAgIH0sIG1ldGFkYXRhKSk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGNiRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bmFtZX0gQVBJIG1ldGhvZCBkb2Vzbid0IHNlZW0gdG8gc3VwcG9ydCB0aGUgY2FsbGJhY2sgcGFyYW1ldGVyLCBgICsgXCJmYWxsaW5nIGJhY2sgdG8gY2FsbCBpdCB3aXRob3V0IGEgY2FsbGJhY2s6IFwiLCBjYkVycm9yKTtcbiAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncyk7IC8vIFVwZGF0ZSB0aGUgQVBJIG1ldGhvZCBtZXRhZGF0YSwgc28gdGhhdCB0aGUgbmV4dCBBUEkgY2FsbHMgd2lsbCBub3QgdHJ5IHRvXG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSB1bnN1cHBvcnRlZCBjYWxsYmFjayBhbnltb3JlLlxuXG4gICAgICAgICAgICAgICAgbWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBtZXRhZGF0YS5ub0NhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEubm9DYWxsYmFjaykge1xuICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncyk7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzLCBtYWtlQ2FsbGJhY2soe1xuICAgICAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICAgIH0sIG1ldGFkYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBXcmFwcyBhbiBleGlzdGluZyBtZXRob2Qgb2YgdGhlIHRhcmdldCBvYmplY3QsIHNvIHRoYXQgY2FsbHMgdG8gaXQgYXJlXG4gICAgICAgKiBpbnRlcmNlcHRlZCBieSB0aGUgZ2l2ZW4gd3JhcHBlciBmdW5jdGlvbi4gVGhlIHdyYXBwZXIgZnVuY3Rpb24gcmVjZWl2ZXMsXG4gICAgICAgKiBhcyBpdHMgZmlyc3QgYXJndW1lbnQsIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YCBvYmplY3QsIGZvbGxvd2VkIGJ5IGVhY2ggb2ZcbiAgICAgICAqIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBvcmlnaW5hbCBtZXRob2QuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAgICogICAgICAgIFRoZSBvcmlnaW5hbCB0YXJnZXQgb2JqZWN0IHRoYXQgdGhlIHdyYXBwZWQgbWV0aG9kIGJlbG9uZ3MgdG8uXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtZXRob2RcbiAgICAgICAqICAgICAgICBUaGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuIFRoaXMgaXMgdXNlZCBhcyB0aGUgdGFyZ2V0IG9mIHRoZSBQcm94eVxuICAgICAgICogICAgICAgIG9iamVjdCB3aGljaCBpcyBjcmVhdGVkIHRvIHdyYXAgdGhlIG1ldGhvZC5cbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHdyYXBwZXJcbiAgICAgICAqICAgICAgICBUaGUgd3JhcHBlciBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgaW4gcGxhY2Ugb2YgYSBkaXJlY3QgaW52b2NhdGlvblxuICAgICAgICogICAgICAgIG9mIHRoZSB3cmFwcGVkIG1ldGhvZC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7UHJveHk8ZnVuY3Rpb24+fVxuICAgICAgICogICAgICAgIEEgUHJveHkgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gbWV0aG9kLCB3aGljaCBpbnZva2VzIHRoZSBnaXZlbiB3cmFwcGVyXG4gICAgICAgKiAgICAgICAgbWV0aG9kIGluIGl0cyBwbGFjZS5cbiAgICAgICAqL1xuXG5cbiAgICAgIGNvbnN0IHdyYXBNZXRob2QgPSAodGFyZ2V0LCBtZXRob2QsIHdyYXBwZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eShtZXRob2QsIHtcbiAgICAgICAgICBhcHBseSh0YXJnZXRNZXRob2QsIHRoaXNPYmosIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVyLmNhbGwodGhpc09iaiwgdGFyZ2V0LCAuLi5hcmdzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBsZXQgaGFzT3duUHJvcGVydHkgPSBGdW5jdGlvbi5jYWxsLmJpbmQoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGFuIG9iamVjdCBpbiBhIFByb3h5IHdoaWNoIGludGVyY2VwdHMgYW5kIHdyYXBzIGNlcnRhaW4gbWV0aG9kc1xuICAgICAgICogYmFzZWQgb24gdGhlIGdpdmVuIGB3cmFwcGVyc2AgYW5kIGBtZXRhZGF0YWAgb2JqZWN0cy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICAgKiAgICAgICAgVGhlIHRhcmdldCBvYmplY3QgdG8gd3JhcC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gW3dyYXBwZXJzID0ge31dXG4gICAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyB3cmFwcGVyIGZ1bmN0aW9ucyBmb3Igc3BlY2lhbCBjYXNlcy4gQW55XG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24gcHJlc2VudCBpbiB0aGlzIG9iamVjdCB0cmVlIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGVcbiAgICAgICAqICAgICAgICBtZXRob2QgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlLiBUaGVzZVxuICAgICAgICogICAgICAgIHdyYXBwZXIgbWV0aG9kcyBhcmUgaW52b2tlZCBhcyBkZXNjcmliZWQgaW4ge0BzZWUgd3JhcE1ldGhvZH0uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IFttZXRhZGF0YSA9IHt9XVxuICAgICAgICogICAgICAgIEFuIG9iamVjdCB0cmVlIGNvbnRhaW5pbmcgbWV0YWRhdGEgdXNlZCB0byBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlXG4gICAgICAgKiAgICAgICAgUHJvbWlzZS1iYXNlZCB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYXN5bmNocm9ub3VzLiBBbnkgZnVuY3Rpb24gaW5cbiAgICAgICAqICAgICAgICB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUgd2hpY2ggaGFzIGEgY29ycmVzcG9uZGluZyBtZXRhZGF0YSBvYmplY3RcbiAgICAgICAqICAgICAgICBpbiB0aGUgc2FtZSBsb2NhdGlvbiBpbiB0aGUgYG1ldGFkYXRhYCB0cmVlIGlzIHJlcGxhY2VkIHdpdGggYW5cbiAgICAgICAqICAgICAgICBhdXRvbWF0aWNhbGx5LWdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLCBhcyBkZXNjcmliZWQgaW5cbiAgICAgICAqICAgICAgICB7QHNlZSB3cmFwQXN5bmNGdW5jdGlvbn1cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7UHJveHk8b2JqZWN0Pn1cbiAgICAgICAqL1xuXG4gICAgICBjb25zdCB3cmFwT2JqZWN0ID0gKHRhcmdldCwgd3JhcHBlcnMgPSB7fSwgbWV0YWRhdGEgPSB7fSkgPT4ge1xuICAgICAgICBsZXQgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBsZXQgaGFuZGxlcnMgPSB7XG4gICAgICAgICAgaGFzKHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQgfHwgcHJvcCBpbiBjYWNoZTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgZ2V0KHByb3h5VGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlW3Byb3BdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIShwcm9wIGluIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGFyZ2V0W3Byb3BdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBvYmplY3QuIENoZWNrIGlmIHdlIG5lZWQgdG8gZG9cbiAgICAgICAgICAgICAgLy8gYW55IHdyYXBwaW5nLlxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHdyYXBwZXJzW3Byb3BdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgc3BlY2lhbC1jYXNlIHdyYXBwZXIgZm9yIHRoaXMgbWV0aG9kLlxuICAgICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcnNbcHJvcF0pO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gYXN5bmMgbWV0aG9kIHRoYXQgd2UgaGF2ZSBtZXRhZGF0YSBmb3IuIENyZWF0ZSBhXG4gICAgICAgICAgICAgICAgLy8gUHJvbWlzZSB3cmFwcGVyIGZvciBpdC5cbiAgICAgICAgICAgICAgICBsZXQgd3JhcHBlciA9IHdyYXBBc3luY0Z1bmN0aW9uKHByb3AsIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBNZXRob2QodGFyZ2V0LCB0YXJnZXRbcHJvcF0sIHdyYXBwZXIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBtZXRob2QgdGhhdCB3ZSBkb24ndCBrbm93IG9yIGNhcmUgYWJvdXQuIFJldHVybiB0aGVcbiAgICAgICAgICAgICAgICAvLyBvcmlnaW5hbCBtZXRob2QsIGJvdW5kIHRvIHRoZSB1bmRlcmx5aW5nIG9iamVjdC5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgKGhhc093blByb3BlcnR5KHdyYXBwZXJzLCBwcm9wKSB8fCBoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpKSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgd2UgbmVlZCB0byBkbyBzb21lIHdyYXBwaW5nIGZvciB0aGUgY2hpbGRyZW5cbiAgICAgICAgICAgICAgLy8gb2YuIENyZWF0ZSBhIHN1Yi1vYmplY3Qgd3JhcHBlciBmb3IgaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgY2hpbGRcbiAgICAgICAgICAgICAgLy8gbWV0YWRhdGEuXG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIFwiKlwiKSkge1xuICAgICAgICAgICAgICAvLyBXcmFwIGFsbCBwcm9wZXJ0aWVzIGluICogbmFtZXNwYWNlLlxuICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtcIipcIl0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgd3JhcHBpbmcgZm9yIHRoaXMgcHJvcGVydHksXG4gICAgICAgICAgICAgIC8vIHNvIGp1c3QgZm9yd2FyZCBhbGwgYWNjZXNzIHRvIHRoZSB1bmRlcmx5aW5nIG9iamVjdC5cbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNhY2hlLCBwcm9wLCB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG5cbiAgICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzZXQocHJveHlUYXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJveHlUYXJnZXQsIHByb3AsIGRlc2MpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNhY2hlLCBwcm9wLCBkZXNjKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgZGVsZXRlUHJvcGVydHkocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGNhY2hlLCBwcm9wKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfTsgLy8gUGVyIGNvbnRyYWN0IG9mIHRoZSBQcm94eSBBUEksIHRoZSBcImdldFwiIHByb3h5IGhhbmRsZXIgbXVzdCByZXR1cm4gdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSB0YXJnZXQgaWYgdGhhdCB2YWx1ZSBpcyBkZWNsYXJlZCByZWFkLW9ubHkgYW5kXG4gICAgICAgIC8vIG5vbi1jb25maWd1cmFibGUuIEZvciB0aGlzIHJlYXNvbiwgd2UgY3JlYXRlIGFuIG9iamVjdCB3aXRoIHRoZVxuICAgICAgICAvLyBwcm90b3R5cGUgc2V0IHRvIGB0YXJnZXRgIGluc3RlYWQgb2YgdXNpbmcgYHRhcmdldGAgZGlyZWN0bHkuXG4gICAgICAgIC8vIE90aGVyd2lzZSB3ZSBjYW5ub3QgcmV0dXJuIGEgY3VzdG9tIG9iamVjdCBmb3IgQVBJcyB0aGF0XG4gICAgICAgIC8vIGFyZSBkZWNsYXJlZCByZWFkLW9ubHkgYW5kIG5vbi1jb25maWd1cmFibGUsIHN1Y2ggYXMgYGNocm9tZS5kZXZ0b29sc2AuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSBwcm94eSBoYW5kbGVycyB0aGVtc2VsdmVzIHdpbGwgc3RpbGwgdXNlIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YFxuICAgICAgICAvLyBpbnN0ZWFkIG9mIHRoZSBgcHJveHlUYXJnZXRgLCBzbyB0aGF0IHRoZSBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzIGFyZVxuICAgICAgICAvLyBkZXJlZmVyZW5jZWQgdmlhIHRoZSBvcmlnaW5hbCB0YXJnZXRzLlxuXG4gICAgICAgIGxldCBwcm94eVRhcmdldCA9IE9iamVjdC5jcmVhdGUodGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eShwcm94eVRhcmdldCwgaGFuZGxlcnMpO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhIHNldCBvZiB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYW4gZXZlbnQgb2JqZWN0LCB3aGljaCBoYW5kbGVzXG4gICAgICAgKiB3cmFwcGluZyBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCB0aG9zZSBtZXNzYWdlcyBhcmUgcGFzc2VkLlxuICAgICAgICpcbiAgICAgICAqIEEgc2luZ2xlIHdyYXBwZXIgaXMgY3JlYXRlZCBmb3IgZWFjaCBsaXN0ZW5lciBmdW5jdGlvbiwgYW5kIHN0b3JlZCBpbiBhXG4gICAgICAgKiBtYXAuIFN1YnNlcXVlbnQgY2FsbHMgdG8gYGFkZExpc3RlbmVyYCwgYGhhc0xpc3RlbmVyYCwgb3IgYHJlbW92ZUxpc3RlbmVyYFxuICAgICAgICogcmV0cmlldmUgdGhlIG9yaWdpbmFsIHdyYXBwZXIsIHNvIHRoYXQgIGF0dGVtcHRzIHRvIHJlbW92ZSBhXG4gICAgICAgKiBwcmV2aW91c2x5LWFkZGVkIGxpc3RlbmVyIHdvcmsgYXMgZXhwZWN0ZWQuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtEZWZhdWx0V2Vha01hcDxmdW5jdGlvbiwgZnVuY3Rpb24+fSB3cmFwcGVyTWFwXG4gICAgICAgKiAgICAgICAgQSBEZWZhdWx0V2Vha01hcCBvYmplY3Qgd2hpY2ggd2lsbCBjcmVhdGUgdGhlIGFwcHJvcHJpYXRlIHdyYXBwZXJcbiAgICAgICAqICAgICAgICBmb3IgYSBnaXZlbiBsaXN0ZW5lciBmdW5jdGlvbiB3aGVuIG9uZSBkb2VzIG5vdCBleGlzdCwgYW5kIHJldHJpZXZlXG4gICAgICAgKiAgICAgICAgYW4gZXhpc3Rpbmcgb25lIHdoZW4gaXQgZG9lcy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAgICovXG5cblxuICAgICAgY29uc3Qgd3JhcEV2ZW50ID0gd3JhcHBlck1hcCA9PiAoe1xuICAgICAgICBhZGRMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyLCAuLi5hcmdzKSB7XG4gICAgICAgICAgdGFyZ2V0LmFkZExpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSwgLi4uYXJncyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICAgIHJldHVybiB0YXJnZXQuaGFzTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IG9uUmVxdWVzdEZpbmlzaGVkV3JhcHBlcnMgPSBuZXcgRGVmYXVsdFdlYWtNYXAobGlzdGVuZXIgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdyYXBzIGFuIG9uUmVxdWVzdEZpbmlzaGVkIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgd2lsbCByZXR1cm4gYVxuICAgICAgICAgKiBgZ2V0Q29udGVudCgpYCBwcm9wZXJ0eSB3aGljaCByZXR1cm5zIGEgYFByb21pc2VgIHJhdGhlciB0aGFuIHVzaW5nIGFcbiAgICAgICAgICogY2FsbGJhY2sgQVBJLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gICAgICAgICAqICAgICAgICBUaGUgSEFSIGVudHJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG5ldHdvcmsgcmVxdWVzdC5cbiAgICAgICAgICovXG5cblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gb25SZXF1ZXN0RmluaXNoZWQocmVxKSB7XG4gICAgICAgICAgY29uc3Qgd3JhcHBlZFJlcSA9IHdyYXBPYmplY3QocmVxLCB7fVxuICAgICAgICAgIC8qIHdyYXBwZXJzICovXG4gICAgICAgICAgLCB7XG4gICAgICAgICAgICBnZXRDb250ZW50OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBsaXN0ZW5lcih3cmFwcGVkUmVxKTtcbiAgICAgICAgfTtcbiAgICAgIH0pOyAvLyBLZWVwIHRyYWNrIGlmIHRoZSBkZXByZWNhdGlvbiB3YXJuaW5nIGhhcyBiZWVuIGxvZ2dlZCBhdCBsZWFzdCBvbmNlLlxuXG4gICAgICBsZXQgbG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nID0gZmFsc2U7XG4gICAgICBjb25zdCBvbk1lc3NhZ2VXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogV3JhcHMgYSBtZXNzYWdlIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgbWF5IHNlbmQgcmVzcG9uc2VzIGJhc2VkIG9uXG4gICAgICAgICAqIGl0cyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIGJ5IHJldHVybmluZyBhIHNlbnRpbmVsIHZhbHVlIGFuZCBjYWxsaW5nIGFcbiAgICAgICAgICogY2FsbGJhY2suIElmIHRoZSBsaXN0ZW5lciBmdW5jdGlvbiByZXR1cm5zIGEgUHJvbWlzZSwgdGhlIHJlc3BvbnNlIGlzXG4gICAgICAgICAqIHNlbnQgd2hlbiB0aGUgcHJvbWlzZSBlaXRoZXIgcmVzb2x2ZXMgb3IgcmVqZWN0cy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBtZXNzYWdlXG4gICAgICAgICAqICAgICAgICBUaGUgbWVzc2FnZSBzZW50IGJ5IHRoZSBvdGhlciBlbmQgb2YgdGhlIGNoYW5uZWwuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZW5kZXJcbiAgICAgICAgICogICAgICAgIERldGFpbHMgYWJvdXQgdGhlIHNlbmRlciBvZiB0aGUgbWVzc2FnZS5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbigqKX0gc2VuZFJlc3BvbnNlXG4gICAgICAgICAqICAgICAgICBBIGNhbGxiYWNrIHdoaWNoLCB3aGVuIGNhbGxlZCB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCwgc2VuZHNcbiAgICAgICAgICogICAgICAgIHRoYXQgdmFsdWUgYXMgYSByZXNwb25zZS5cbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqICAgICAgICBUcnVlIGlmIHRoZSB3cmFwcGVkIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgd2hpY2ggd2lsbCBsYXRlclxuICAgICAgICAgKiAgICAgICAgeWllbGQgYSByZXNwb25zZS4gRmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAgICAgKi9cblxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBvbk1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBsZXQgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IGZhbHNlO1xuICAgICAgICAgIGxldCB3cmFwcGVkU2VuZFJlc3BvbnNlO1xuICAgICAgICAgIGxldCBzZW5kUmVzcG9uc2VQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB3cmFwcGVkU2VuZFJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGlmICghbG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFNFTkRfUkVTUE9OU0VfREVQUkVDQVRJT05fV0FSTklORywgbmV3IEVycm9yKCkuc3RhY2spO1xuICAgICAgICAgICAgICAgIGxvZ2dlZFNlbmRSZXNwb25zZURlcHJlY2F0aW9uV2FybmluZyA9IHRydWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBkaWRDYWxsU2VuZFJlc3BvbnNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxldCByZXN1bHQ7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbGlzdGVuZXIobWVzc2FnZSwgc2VuZGVyLCB3cmFwcGVkU2VuZFJlc3BvbnNlKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaXNSZXN1bHRUaGVuYWJsZSA9IHJlc3VsdCAhPT0gdHJ1ZSAmJiBpc1RoZW5hYmxlKHJlc3VsdCk7IC8vIElmIHRoZSBsaXN0ZW5lciBkaWRuJ3QgcmV0dXJuZWQgdHJ1ZSBvciBhIFByb21pc2UsIG9yIGNhbGxlZFxuICAgICAgICAgIC8vIHdyYXBwZWRTZW5kUmVzcG9uc2Ugc3luY2hyb25vdXNseSwgd2UgY2FuIGV4aXQgZWFybGllclxuICAgICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgd2lsbCBiZSBubyByZXNwb25zZSBzZW50IGZyb20gdGhpcyBsaXN0ZW5lci5cblxuICAgICAgICAgIGlmIChyZXN1bHQgIT09IHRydWUgJiYgIWlzUmVzdWx0VGhlbmFibGUgJiYgIWRpZENhbGxTZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9IC8vIEEgc21hbGwgaGVscGVyIHRvIHNlbmQgdGhlIG1lc3NhZ2UgaWYgdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgICAgICAvLyBhbmQgYW4gZXJyb3IgaWYgdGhlIHByb21pc2UgcmVqZWN0cyAoYSB3cmFwcGVkIHNlbmRNZXNzYWdlIGhhc1xuICAgICAgICAgIC8vIHRvIHRyYW5zbGF0ZSB0aGUgbWVzc2FnZSBpbnRvIGEgcmVzb2x2ZWQgcHJvbWlzZSBvciBhIHJlamVjdGVkXG4gICAgICAgICAgLy8gcHJvbWlzZSkuXG5cblxuICAgICAgICAgIGNvbnN0IHNlbmRQcm9taXNlZFJlc3VsdCA9IHByb21pc2UgPT4ge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKG1zZyA9PiB7XG4gICAgICAgICAgICAgIC8vIHNlbmQgdGhlIG1lc3NhZ2UgdmFsdWUuXG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZShtc2cpO1xuICAgICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAvLyBTZW5kIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXJyb3IgaWYgdGhlIHJlamVjdGVkIHZhbHVlXG4gICAgICAgICAgICAgIC8vIGlzIGFuIGluc3RhbmNlIG9mIGVycm9yLCBvciB0aGUgb2JqZWN0IGl0c2VsZiBvdGhlcndpc2UuXG4gICAgICAgICAgICAgIGxldCBtZXNzYWdlO1xuXG4gICAgICAgICAgICAgIGlmIChlcnJvciAmJiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciB8fCB0eXBlb2YgZXJyb3IubWVzc2FnZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkXCI7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIF9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgLy8gUHJpbnQgYW4gZXJyb3Igb24gdGhlIGNvbnNvbGUgaWYgdW5hYmxlIHRvIHNlbmQgdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNlbmQgb25NZXNzYWdlIHJlamVjdGVkIHJlcGx5XCIsIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9OyAvLyBJZiB0aGUgbGlzdGVuZXIgcmV0dXJuZWQgYSBQcm9taXNlLCBzZW5kIHRoZSByZXNvbHZlZCB2YWx1ZSBhcyBhXG4gICAgICAgICAgLy8gcmVzdWx0LCBvdGhlcndpc2Ugd2FpdCB0aGUgcHJvbWlzZSByZWxhdGVkIHRvIHRoZSB3cmFwcGVkU2VuZFJlc3BvbnNlXG4gICAgICAgICAgLy8gY2FsbGJhY2sgdG8gcmVzb2x2ZSBhbmQgc2VuZCBpdCBhcyBhIHJlc3BvbnNlLlxuXG5cbiAgICAgICAgICBpZiAoaXNSZXN1bHRUaGVuYWJsZSkge1xuICAgICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRQcm9taXNlZFJlc3VsdChzZW5kUmVzcG9uc2VQcm9taXNlKTtcbiAgICAgICAgICB9IC8vIExldCBDaHJvbWUga25vdyB0aGF0IHRoZSBsaXN0ZW5lciBpcyByZXBseWluZy5cblxuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2sgPSAoe1xuICAgICAgICByZWplY3QsXG4gICAgICAgIHJlc29sdmVcbiAgICAgIH0sIHJlcGx5KSA9PiB7XG4gICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgLy8gRGV0ZWN0IHdoZW4gbm9uZSBvZiB0aGUgbGlzdGVuZXJzIHJlcGxpZWQgdG8gdGhlIHNlbmRNZXNzYWdlIGNhbGwgYW5kIHJlc29sdmVcbiAgICAgICAgICAvLyB0aGUgcHJvbWlzZSB0byB1bmRlZmluZWQgYXMgaW4gRmlyZWZveC5cbiAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsL2lzc3Vlcy8xMzBcbiAgICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlID09PSBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UpIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmVwbHkgJiYgcmVwbHkuX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fKSB7XG4gICAgICAgICAgLy8gQ29udmVydCBiYWNrIHRoZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpbnRvXG4gICAgICAgICAgLy8gYW4gRXJyb3IgaW5zdGFuY2UuXG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXBseS5tZXNzYWdlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShyZXBseSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHdyYXBwZWRTZW5kTWVzc2FnZSA9IChuYW1lLCBtZXRhZGF0YSwgYXBpTmFtZXNwYWNlT2JqLCAuLi5hcmdzKSA9PiB7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgY29uc3Qgd3JhcHBlZENiID0gd3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2suYmluZChudWxsLCB7XG4gICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXJncy5wdXNoKHdyYXBwZWRDYik7XG4gICAgICAgICAgYXBpTmFtZXNwYWNlT2JqLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHN0YXRpY1dyYXBwZXJzID0ge1xuICAgICAgICBkZXZ0b29sczoge1xuICAgICAgICAgIG5ldHdvcms6IHtcbiAgICAgICAgICAgIG9uUmVxdWVzdEZpbmlzaGVkOiB3cmFwRXZlbnQob25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycylcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJ1bnRpbWU6IHtcbiAgICAgICAgICBvbk1lc3NhZ2U6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgICAgb25NZXNzYWdlRXh0ZXJuYWw6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgICAgc2VuZE1lc3NhZ2U6IHdyYXBwZWRTZW5kTWVzc2FnZS5iaW5kKG51bGwsIFwic2VuZE1lc3NhZ2VcIiwge1xuICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgIG1heEFyZ3M6IDNcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICB0YWJzOiB7XG4gICAgICAgICAgc2VuZE1lc3NhZ2U6IHdyYXBwZWRTZW5kTWVzc2FnZS5iaW5kKG51bGwsIFwic2VuZE1lc3NhZ2VcIiwge1xuICAgICAgICAgICAgbWluQXJnczogMixcbiAgICAgICAgICAgIG1heEFyZ3M6IDNcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3Qgc2V0dGluZ01ldGFkYXRhID0ge1xuICAgICAgICBjbGVhcjoge1xuICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgbWF4QXJnczogMVxuICAgICAgICB9LFxuICAgICAgICBnZXQ6IHtcbiAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgIG1heEFyZ3M6IDFcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiB7XG4gICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICBtYXhBcmdzOiAxXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBhcGlNZXRhZGF0YS5wcml2YWN5ID0ge1xuICAgICAgICBuZXR3b3JrOiB7XG4gICAgICAgICAgXCIqXCI6IHNldHRpbmdNZXRhZGF0YVxuICAgICAgICB9LFxuICAgICAgICBzZXJ2aWNlczoge1xuICAgICAgICAgIFwiKlwiOiBzZXR0aW5nTWV0YWRhdGFcbiAgICAgICAgfSxcbiAgICAgICAgd2Vic2l0ZXM6IHtcbiAgICAgICAgICBcIipcIjogc2V0dGluZ01ldGFkYXRhXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4gd3JhcE9iamVjdChleHRlbnNpb25BUElzLCBzdGF0aWNXcmFwcGVycywgYXBpTWV0YWRhdGEpO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIGNocm9tZSAhPSBcIm9iamVjdFwiIHx8ICFjaHJvbWUgfHwgIWNocm9tZS5ydW50aW1lIHx8ICFjaHJvbWUucnVudGltZS5pZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzY3JpcHQgc2hvdWxkIG9ubHkgYmUgbG9hZGVkIGluIGEgYnJvd3NlciBleHRlbnNpb24uXCIpO1xuICAgIH0gLy8gVGhlIGJ1aWxkIHByb2Nlc3MgYWRkcyBhIFVNRCB3cmFwcGVyIGFyb3VuZCB0aGlzIGZpbGUsIHdoaWNoIG1ha2VzIHRoZVxuICAgIC8vIGBtb2R1bGVgIHZhcmlhYmxlIGF2YWlsYWJsZS5cblxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3cmFwQVBJcyhjaHJvbWUpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gYnJvd3NlcjtcbiAgfVxufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1icm93c2VyLXBvbHlmaWxsLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZGlzcGxheUNhdGVnb3JpZXM6IFsnQW5hbHl0aWNzJywgJ0FkdmVydGlzaW5nJywgJ1NvY2lhbCBOZXR3b3JrJ10sXG4gICAgcmVxdWVzdExpc3RlbmVyVHlwZXM6IFsnbWFpbl9mcmFtZScsICdzdWJfZnJhbWUnLCAnc3R5bGVzaGVldCcsICdzY3JpcHQnLCAnaW1hZ2UnLCAnb2JqZWN0JywgJ3htbGh0dHByZXF1ZXN0JywgJ3dlYnNvY2tldCcsICdvdGhlciddLCAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL01vemlsbGEvQWRkLW9ucy9XZWJFeHRlbnNpb25zL0FQSS93ZWJSZXF1ZXN0L1Jlc291cmNlVHlwZVxuICAgIGZlZWRiYWNrVXJsOiAnaHR0cHM6Ly9kdWNrZHVja2dvLmNvbS9mZWVkYmFjay5qcz90eXBlPWV4dGVuc2lvbi1mZWVkYmFjaycsXG4gICAgdG9zZHJNZXNzYWdlczoge1xuICAgICAgICBBOiAnR29vZCcsXG4gICAgICAgIEI6ICdNaXhlZCcsXG4gICAgICAgIEM6ICdQb29yJyxcbiAgICAgICAgRDogJ1Bvb3InLFxuICAgICAgICBFOiAnUG9vcicsXG4gICAgICAgIGdvb2Q6ICdHb29kJyxcbiAgICAgICAgYmFkOiAnUG9vcicsXG4gICAgICAgIHVua25vd246ICdVbmtub3duJyxcbiAgICAgICAgbWl4ZWQ6ICdNaXhlZCdcbiAgICB9LFxuICAgIGh0dHBzU2VydmljZTogJ2h0dHBzOi8vZHVja2R1Y2tnby5jb20vc21hcnRlcl9lbmNyeXB0aW9uLmpzJyxcbiAgICBkdWNrRHVja0dvU2VycEhvc3RuYW1lOiAnZHVja2R1Y2tnby5jb20nLFxuICAgIGh0dHBzTWVzc2FnZXM6IHtcbiAgICAgICAgc2VjdXJlOiAnRW5jcnlwdGVkIENvbm5lY3Rpb24nLFxuICAgICAgICB1cGdyYWRlZDogJ0ZvcmNlZCBFbmNyeXB0aW9uJyxcbiAgICAgICAgbm9uZTogJ1VuZW5jcnlwdGVkIENvbm5lY3Rpb24nXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYWpvciB0cmFja2luZyBuZXR3b3JrcyBkYXRhOlxuICAgICAqIHBlcmNlbnQgb2YgdGhlIHRvcCAxIG1pbGxpb24gc2l0ZXMgYSB0cmFja2luZyBuZXR3b3JrIGhhcyBiZWVuIHNlZW4gb24uXG4gICAgICogc2VlOiBodHRwczovL3dlYnRyYW5zcGFyZW5jeS5jcy5wcmluY2V0b24uZWR1L3dlYmNlbnN1cy9cbiAgICAgKi9cbiAgICBtYWpvclRyYWNraW5nTmV0d29ya3M6IHtcbiAgICAgICAgZ29vZ2xlOiA4NCxcbiAgICAgICAgZmFjZWJvb2s6IDM2LFxuICAgICAgICB0d2l0dGVyOiAxNixcbiAgICAgICAgYW1hem9uOiAxNCxcbiAgICAgICAgYXBwbmV4dXM6IDEwLFxuICAgICAgICBvcmFjbGU6IDEwLFxuICAgICAgICBtZWRpYW1hdGg6IDksXG4gICAgICAgIG9hdGg6IDksXG4gICAgICAgIG1heGNkbjogNyxcbiAgICAgICAgYXV0b21hdHRpYzogN1xuICAgIH0sXG4gICAgLypcbiAgICAgKiBNYXBwaW5nIGVudGl0eSBuYW1lcyB0byBDU1MgY2xhc3MgbmFtZSBmb3IgcG9wdXAgaWNvbnNcbiAgICAgKi9cbiAgICBlbnRpdHlJY29uTWFwcGluZzoge1xuICAgICAgICAnR29vZ2xlIExMQyc6ICdnb29nbGUnLFxuICAgICAgICAnRmFjZWJvb2ssIEluYy4nOiAnZmFjZWJvb2snLFxuICAgICAgICAnVHdpdHRlciwgSW5jLic6ICd0d2l0dGVyJyxcbiAgICAgICAgJ0FtYXpvbiBUZWNobm9sb2dpZXMsIEluYy4nOiAnYW1hem9uJyxcbiAgICAgICAgJ0FwcE5leHVzLCBJbmMuJzogJ2FwcG5leHVzJyxcbiAgICAgICAgJ01lZGlhTWF0aCwgSW5jLic6ICdtZWRpYW1hdGgnLFxuICAgICAgICAnU3RhY2tQYXRoLCBMTEMnOiAnbWF4Y2RuJyxcbiAgICAgICAgJ0F1dG9tYXR0aWMsIEluYy4nOiAnYXV0b21hdHRpYycsXG4gICAgICAgICdBZG9iZSBJbmMuJzogJ2Fkb2JlJyxcbiAgICAgICAgJ1F1YW50Y2FzdCBDb3Jwb3JhdGlvbic6ICdxdWFudGNhc3QnLFxuICAgICAgICAnVGhlIE5pZWxzZW4gQ29tcGFueSc6ICduaWVsc2VuJ1xuICAgIH0sXG4gICAgaHR0cHNEQk5hbWU6ICdodHRwcycsXG4gICAgaHR0cHNMaXN0czogW1xuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAndXBncmFkZSBibG9vbSBmaWx0ZXInLFxuICAgICAgICAgICAgbmFtZTogJ2h0dHBzVXBncmFkZUJsb29tRmlsdGVyJyxcbiAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL2h0dHBzL2h0dHBzLWJsb29tLmpzb24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiZG9uJ3QgdXBncmFkZSBibG9vbSBmaWx0ZXJcIixcbiAgICAgICAgICAgIG5hbWU6ICdodHRwc0RvbnRVcGdyYWRlQmxvb21GaWx0ZXJzJyxcbiAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL2h0dHBzL25lZ2F0aXZlLWh0dHBzLWJsb29tLmpzb24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICd1cGdyYWRlIHNhZmVsaXN0JyxcbiAgICAgICAgICAgIG5hbWU6ICdodHRwc1VwZ3JhZGVMaXN0JyxcbiAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL2h0dHBzL25lZ2F0aXZlLWh0dHBzLWFsbG93bGlzdC5qc29uJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImRvbid0IHVwZ3JhZGUgc2FmZWxpc3RcIixcbiAgICAgICAgICAgIG5hbWU6ICdodHRwc0RvbnRVcGdyYWRlTGlzdCcsXG4gICAgICAgICAgICB1cmw6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS9odHRwcy9odHRwcy1hbGxvd2xpc3QuanNvbidcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdGRzTGlzdHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ3N1cnJvZ2F0ZXMnLFxuICAgICAgICAgICAgdXJsOiAnL2RhdGEvc3Vycm9nYXRlcy50eHQnLFxuICAgICAgICAgICAgZm9ybWF0OiAndGV4dCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdsb2NhbCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ3RkcycsXG4gICAgICAgICAgICB1cmw6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS90cmFja2VyYmxvY2tpbmcvdjIuMS90ZHMuanNvbicsXG4gICAgICAgICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ2V4dGVybmFsJyxcbiAgICAgICAgICAgIGNoYW5uZWxzOiB7XG4gICAgICAgICAgICAgICAgbGl2ZTogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL3RyYWNrZXJibG9ja2luZy92Mi4xL3Rkcy5qc29uJyxcbiAgICAgICAgICAgICAgICBuZXh0OiAnaHR0cHM6Ly9zdGF0aWNjZG4uZHVja2R1Y2tnby5jb20vdHJhY2tlcmJsb2NraW5nL3YyLjEvdGRzLW5leHQuanNvbicsXG4gICAgICAgICAgICAgICAgYmV0YTogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL3RyYWNrZXJibG9ja2luZy9iZXRhL3Rkcy5qc29uJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ2xpY2tUb0xvYWRDb25maWcnLFxuICAgICAgICAgICAgdXJsOiAnaHR0cHM6Ly9zdGF0aWNjZG4uZHVja2R1Y2tnby5jb20vdXNlcmFnZW50cy9zb2NpYWxfY3RwX2NvbmZpZ3VyYXRpb24uanNvbicsXG4gICAgICAgICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ2V4dGVybmFsJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnY29uZmlnJyxcbiAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL3RyYWNrZXJibG9ja2luZy9jb25maWcvdjEvZXh0ZW5zaW9uLWNvbmZpZy5qc29uJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgc291cmNlOiAnZXh0ZXJuYWwnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGh0dHBzRXJyb3JDb2Rlczoge1xuICAgICAgICAnbmV0OjpFUlJfQ09OTkVDVElPTl9SRUZVU0VEJzogMSxcbiAgICAgICAgJ25ldDo6RVJSX0FCT1JURUQnOiAyLFxuICAgICAgICAnbmV0OjpFUlJfU1NMX1BST1RPQ09MX0VSUk9SJzogMyxcbiAgICAgICAgJ25ldDo6RVJSX1NTTF9WRVJTSU9OX09SX0NJUEhFUl9NSVNNQVRDSCc6IDQsXG4gICAgICAgICduZXQ6OkVSUl9OQU1FX05PVF9SRVNPTFZFRCc6IDUsXG4gICAgICAgIE5TX0VSUk9SX0NPTk5FQ1RJT05fUkVGVVNFRDogNixcbiAgICAgICAgTlNfRVJST1JfVU5LTk9XTl9IT1NUOiA3LFxuICAgICAgICAnQW4gYWRkaXRpb25hbCBwb2xpY3kgY29uc3RyYWludCBmYWlsZWQgd2hlbiB2YWxpZGF0aW5nIHRoaXMgY2VydGlmaWNhdGUuJzogOCxcbiAgICAgICAgJ1VuYWJsZSB0byBjb21tdW5pY2F0ZSBzZWN1cmVseSB3aXRoIHBlZXI6IHJlcXVlc3RlZCBkb21haW4gbmFtZSBkb2VzIG5vdCBtYXRjaCB0aGUgc2VydmVy4oCZcyBjZXJ0aWZpY2F0ZS4nOiA5LFxuICAgICAgICAnQ2Fubm90IGNvbW11bmljYXRlIHNlY3VyZWx5IHdpdGggcGVlcjogbm8gY29tbW9uIGVuY3J5cHRpb24gYWxnb3JpdGhtKHMpLic6IDEwLFxuICAgICAgICAnU1NMIHJlY2VpdmVkIGEgcmVjb3JkIHRoYXQgZXhjZWVkZWQgdGhlIG1heGltdW0gcGVybWlzc2libGUgbGVuZ3RoLic6IDExLFxuICAgICAgICAnVGhlIGNlcnRpZmljYXRlIGlzIG5vdCB0cnVzdGVkIGJlY2F1c2UgaXQgaXMgc2VsZi1zaWduZWQuJzogMTIsXG4gICAgICAgIGRvd25ncmFkZV9yZWRpcmVjdF9sb29wOiAxM1xuICAgIH0sXG4gICAgcGxhdGZvcm06IHtcbiAgICAgICAgbmFtZTogJ2V4dGVuc2lvbidcbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBleHRlbnNpb25Jc0VuYWJsZWQ6IHRydWUsXG4gICAgc29jaWFsQmxvY2tpbmdJc0VuYWJsZWQ6IGZhbHNlLFxuICAgIHRyYWNrZXJCbG9ja2luZ0VuYWJsZWQ6IHRydWUsXG4gICAgaHR0cHNFdmVyeXdoZXJlRW5hYmxlZDogdHJ1ZSxcbiAgICBlbWJlZGRlZFR3ZWV0c0VuYWJsZWQ6IGZhbHNlLFxuICAgIEdQQzogdHJ1ZSxcbiAgICBtZWFuaW5nczogdHJ1ZSxcbiAgICBhZHZhbmNlZF9vcHRpb25zOiB0cnVlLFxuICAgIGxhc3Rfc2VhcmNoOiAnJyxcbiAgICBsYXN0c2VhcmNoX2VuYWJsZWQ6IHRydWUsXG4gICAgc2FmZXNlYXJjaDogdHJ1ZSxcbiAgICB1c2VfcG9zdDogZmFsc2UsXG4gICAgZHVja3k6IGZhbHNlLFxuICAgIGRldjogZmFsc2UsXG4gICAgemVyb2NsaWNrX2dvb2dsZV9yaWdodDogZmFsc2UsXG4gICAgdmVyc2lvbjogbnVsbCxcbiAgICBhdGI6IG51bGwsXG4gICAgc2V0X2F0YjogbnVsbCxcbiAgICAnY29uZmlnLWV0YWcnOiBudWxsLFxuICAgICdodHRwc1VwZ3JhZGVCbG9vbUZpbHRlci1ldGFnJzogbnVsbCxcbiAgICAnaHR0cHNEb250VXBncmFkZUJsb29tRmlsdGVycy1ldGFnJzogbnVsbCxcbiAgICAnaHR0cHNVcGdyYWRlTGlzdC1ldGFnJzogbnVsbCxcbiAgICAnaHR0cHNEb250VXBncmFkZUxpc3QtZXRhZyc6IG51bGwsXG4gICAgaGFzU2VlblBvc3RJbnN0YWxsOiBmYWxzZSxcbiAgICBleHRpU2VudDogZmFsc2UsXG4gICAgZmFpbGVkVXBncmFkZXM6IDAsXG4gICAgdG90YWxVcGdyYWRlczogMCxcbiAgICAndGRzLWV0YWcnOiBudWxsLFxuICAgIGxhc3RUZHNVcGRhdGU6IDBcbn1cbiIsImNvbnN0IGJyb3dzZXJXcmFwcGVyID0gcmVxdWlyZSgnLi93cmFwcGVyLmVzNicpXG5cbmNvbnN0IFJFTEVBU0VfRVhURU5TSU9OX0lEUyA9IFtcbiAgICAnY2FvYWNiaW1kYmJsamFrZmhnaWtvb2Rla2RubGNncGsnLCAvLyBlZGdlIHN0b3JlXG4gICAgJ2JrZGdmbGNsZG5ubmFwYmxraHBoYmdwZ2dkaWlrcHBnJywgLy8gY2hyb21lIHN0b3JlXG4gICAgJ2ppZDEtWkFkSUVVQjdYT3pPSndAamV0cGFjaycgLy8gZmlyZWZveFxuXVxuY29uc3QgSVNfQkVUQSA9IFJFTEVBU0VfRVhURU5TSU9OX0lEUy5pbmRleE9mKGJyb3dzZXJXcmFwcGVyLmdldEV4dGVuc2lvbklkKCkpID09PSAtMVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBJU19CRVRBXG59XG4iLCJpbXBvcnQgYnJvd3NlciBmcm9tICd3ZWJleHRlbnNpb24tcG9seWZpbGwnXG5jb25zdCB7IGdldFNldHRpbmcsIHVwZGF0ZVNldHRpbmcgfSA9IHJlcXVpcmUoJy4vc2V0dGluZ3MuZXM2JylcbmNvbnN0IFJFRkVUQ0hfQUxJQVNfQUxBUk0gPSAncmVmZXRjaEFsaWFzJ1xuXG4vLyBLZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgYXR0ZW1wdGVkIGZldGNoZXMuIFN0b3AgdHJ5aW5nIGFmdGVyIDUuXG5sZXQgYXR0ZW1wdHMgPSAxXG5cbmNvbnN0IGZldGNoQWxpYXMgPSAoKSA9PiB7XG4gICAgLy8gaWYgYW5vdGhlciBmZXRjaCB3YXMgcHJldmlvdXNseSBzY2hlZHVsZWQsIGNsZWFyIHRoYXQgYW5kIGV4ZWN1dGUgbm93XG4gICAgYnJvd3Nlci5hbGFybXMuY2xlYXIoUkVGRVRDSF9BTElBU19BTEFSTSlcblxuICAgIGNvbnN0IHVzZXJEYXRhID0gZ2V0U2V0dGluZygndXNlckRhdGEnKVxuXG4gICAgaWYgKCF1c2VyRGF0YT8udG9rZW4pIHJldHVyblxuXG4gICAgcmV0dXJuIGZldGNoKCdodHRwczovL3F1YWNrLmR1Y2tkdWNrZ28uY29tL2FwaS9lbWFpbC9hZGRyZXNzZXMnLCB7XG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICBoZWFkZXJzOiB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt1c2VyRGF0YS50b2tlbn1gIH1cbiAgICB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpLnRoZW4oKHsgYWRkcmVzcyB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghL15bYS16MC05XSskLy50ZXN0KGFkZHJlc3MpKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYWRkcmVzcycpXG5cbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlU2V0dGluZygndXNlckRhdGEnLCBPYmplY3QuYXNzaWduKHVzZXJEYXRhLCB7IG5leHRBbGlhczogYCR7YWRkcmVzc31gIH0pKVxuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBhdHRlbXB0c1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cyA9IDFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBmZXRjaGluZyB0aGUgYWxpYXMnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAvLyBUT0RPOiBEbyB3ZSB3YW50IHRvIGxvZ291dCBpZiB0aGUgZXJyb3IgaXMgYSA0MDEgdW5hdXRob3JpemVkP1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGZldGNoaW5nIG5ldyBhbGlhcycsIGUpXG4gICAgICAgICAgICAvLyBEb24ndCB0cnkgZmV0Y2hpbmcgbW9yZSB0aGFuIDUgdGltZXMgaW4gYSByb3dcbiAgICAgICAgICAgIGlmIChhdHRlbXB0cyA8IDUpIHtcbiAgICAgICAgICAgICAgICBicm93c2VyLmFsYXJtcy5jcmVhdGUoUkVGRVRDSF9BTElBU19BTEFSTSwgeyBkZWxheUluTWludXRlczogMiB9KVxuICAgICAgICAgICAgICAgIGF0dGVtcHRzKytcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJldHVybiB0aGUgZXJyb3Igc28gd2UgY2FuIGhhbmRsZSBpdFxuICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGUgfVxuICAgICAgICB9KVxufVxuXG5jb25zdCBNRU5VX0lURU1fSUQgPSAnZGRnLWF1dG9maWxsLWNvbnRleHQtbWVudS1pdGVtJ1xuLy8gQ3JlYXRlIHRoZSBjb250ZXh0dWFsIG1lbnUgaGlkZGVuIGJ5IGRlZmF1bHRcbmJyb3dzZXIuY29udGV4dE1lbnVzLmNyZWF0ZSh7XG4gICAgaWQ6IE1FTlVfSVRFTV9JRCxcbiAgICB0aXRsZTogJ1VzZSBEdWNrIEFkZHJlc3MnLFxuICAgIGNvbnRleHRzOiBbJ2VkaXRhYmxlJ10sXG4gICAgdmlzaWJsZTogZmFsc2Vcbn0pXG5icm93c2VyLmNvbnRleHRNZW51cy5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoKGluZm8sIHRhYikgPT4ge1xuICAgIGNvbnN0IHVzZXJEYXRhID0gZ2V0U2V0dGluZygndXNlckRhdGEnKVxuICAgIGlmICh1c2VyRGF0YS5uZXh0QWxpYXMpIHtcbiAgICAgICAgYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xuICAgICAgICAgICAgdHlwZTogJ2NvbnRleHR1YWxBdXRvZmlsbCcsXG4gICAgICAgICAgICBhbGlhczogdXNlckRhdGEubmV4dEFsaWFzXG4gICAgICAgIH0pXG4gICAgfVxufSlcblxuY29uc3Qgc2hvd0NvbnRleHRNZW51QWN0aW9uID0gKCkgPT4gYnJvd3Nlci5jb250ZXh0TWVudXMudXBkYXRlKE1FTlVfSVRFTV9JRCwgeyB2aXNpYmxlOiB0cnVlIH0pXG5cbmNvbnN0IGhpZGVDb250ZXh0TWVudUFjdGlvbiA9ICgpID0+IGJyb3dzZXIuY29udGV4dE1lbnVzLnVwZGF0ZShNRU5VX0lURU1fSUQsIHsgdmlzaWJsZTogZmFsc2UgfSlcblxuY29uc3QgZ2V0QWRkcmVzc2VzID0gKCkgPT4ge1xuICAgIGNvbnN0IHVzZXJEYXRhID0gZ2V0U2V0dGluZygndXNlckRhdGEnKVxuICAgIHJldHVybiB7XG4gICAgICAgIHBlcnNvbmFsQWRkcmVzczogdXNlckRhdGE/LnVzZXJOYW1lLFxuICAgICAgICBwcml2YXRlQWRkcmVzczogdXNlckRhdGE/Lm5leHRBbGlhc1xuICAgIH1cbn1cblxuLyoqXG4gKiBHaXZlbiBhIHVzZXJuYW1lLCByZXR1cm5zIGEgdmFsaWQgZW1haWwgYWRkcmVzcyB3aXRoIHRoZSBkdWNrIGRvbWFpblxuICogQHBhcmFtIHtzdHJpbmd9IGFkZHJlc3NcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGZvcm1hdEFkZHJlc3MgPSAoYWRkcmVzcykgPT4gYWRkcmVzcyArICdAZHVjay5jb20nXG5cbi8qKlxuICogQ2hlY2tzIGZvcm1hbCB1c2VybmFtZSB2YWxpZGl0eVxuICogQHBhcmFtIHtzdHJpbmd9IHVzZXJOYW1lXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNWYWxpZFVzZXJuYW1lID0gKHVzZXJOYW1lKSA9PiAvXlthLXowLTlfXSskLy50ZXN0KHVzZXJOYW1lKVxuXG4vKipcbiAqIENoZWNrcyBmb3JtYWwgdG9rZW4gdmFsaWRpdHlcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGlzVmFsaWRUb2tlbiA9ICh0b2tlbikgPT4gL15bYS16MC05XSskLy50ZXN0KHRva2VuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBSRUZFVENIX0FMSUFTX0FMQVJNLFxuICAgIGZldGNoQWxpYXMsXG4gICAgc2hvd0NvbnRleHRNZW51QWN0aW9uLFxuICAgIGhpZGVDb250ZXh0TWVudUFjdGlvbixcbiAgICBnZXRBZGRyZXNzZXMsXG4gICAgZm9ybWF0QWRkcmVzcyxcbiAgICBpc1ZhbGlkVXNlcm5hbWUsXG4gICAgaXNWYWxpZFRva2VuXG59XG4iLCJjb25zdCBkZWZhdWx0U2V0dGluZ3MgPSByZXF1aXJlKCcuLi8uLi9kYXRhL2RlZmF1bHRTZXR0aW5ncycpXG5jb25zdCBicm93c2VyV3JhcHBlciA9IHJlcXVpcmUoJy4vd3JhcHBlci5lczYnKVxuXG4vKipcbiAqIFNldHRpbmdzIHdob3NlIGRlZmF1bHRzIGNhbiBieSBtYW5hZ2VkIGJ5IHRoZSBzeXN0ZW0gYWRtaW5pc3RyYXRvclxuICovXG5jb25zdCBNQU5BR0VEX1NFVFRJTkdTID0gWydoYXNTZWVuUG9zdEluc3RhbGwnXVxuLyoqXG4gKiBQdWJsaWMgYXBpXG4gKiBVc2FnZTpcbiAqIFlvdSBjYW4gdXNlIHByb21pc2UgY2FsbGJhY2tzIHRvIGNoZWNrIHJlYWR5bmVzcyBiZWZvcmUgZ2V0dGluZyBhbmQgdXBkYXRpbmdcbiAqIHNldHRpbmdzLnJlYWR5KCkudGhlbigoKSA9PiBzZXR0aW5ncy51cGRhdGVTZXR0aW5nKCdzZXR0aW5nTmFtZScsIHNldHRpbmdWYWx1ZSkpXG4gKi9cbmxldCBzZXR0aW5ncyA9IHt9XG5sZXQgaXNSZWFkeSA9IGZhbHNlXG5jb25zdCBfcmVhZHkgPSBpbml0KCkudGhlbigoKSA9PiB7XG4gICAgaXNSZWFkeSA9IHRydWVcbiAgICBjb25zb2xlLmxvZygnU2V0dGluZ3MgYXJlIGxvYWRlZCcpXG59KVxuXG5hc3luYyBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBidWlsZFNldHRpbmdzRnJvbURlZmF1bHRzKClcbiAgICBhd2FpdCBidWlsZFNldHRpbmdzRnJvbU1hbmFnZWRTdG9yYWdlKClcbiAgICBhd2FpdCBidWlsZFNldHRpbmdzRnJvbUxvY2FsU3RvcmFnZSgpXG59XG5cbmZ1bmN0aW9uIHJlYWR5ICgpIHtcbiAgICByZXR1cm4gX3JlYWR5XG59XG5cbi8vIEVuc3VyZXMgd2UgaGF2ZSBjbGVhcmVkIHVwIG9sZCBzdG9yYWdlIGtleXMgd2UgaGF2ZSByZW5hbWVkXG5mdW5jdGlvbiBjaGVja0ZvckxlZ2FjeUtleXMgKCkge1xuICAgIGNvbnN0IGxlZ2FjeUtleXMgPSB7XG4gICAgICAgIC8vIEtleXMgdG8gbWlncmF0ZVxuICAgICAgICB3aGl0ZWxpc3RlZDogJ2FsbG93bGlzdGVkJyxcbiAgICAgICAgd2hpdGVsaXN0T3B0SW46ICdhbGxvd2xpc3RPcHRJbicsXG5cbiAgICAgICAgLy8gS2V5cyB0byByZW1vdmVcbiAgICAgICAgY29va2llRXhjbHVkZUxpc3Q6IG51bGwsXG4gICAgICAgICdzdXJyb2dhdGVzLWV0YWcnOiBudWxsLFxuICAgICAgICAnYnJva2VuU2l0ZUxpc3QtZXRhZyc6IG51bGwsXG4gICAgICAgICdzdXJyb2dhdGVMaXN0LWV0YWcnOiBudWxsLFxuICAgICAgICAndHJhY2tlcnNXaGl0ZWxpc3QtZXRhZyc6IG51bGwsXG4gICAgICAgICd0cmFja2Vyc1doaXRlbGlzdFRlbXBvcmFyeS1ldGFnJzogbnVsbFxuICAgIH1cbiAgICBsZXQgc3luY05lZWRlZCA9IGZhbHNlXG4gICAgZm9yIChjb25zdCBsZWdhY3lLZXkgaW4gbGVnYWN5S2V5cykge1xuICAgICAgICBjb25zdCBrZXkgPSBsZWdhY3lLZXlzW2xlZ2FjeUtleV1cbiAgICAgICAgaWYgKCEobGVnYWN5S2V5IGluIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBzeW5jTmVlZGVkID0gdHJ1ZVxuICAgICAgICBjb25zdCBsZWdhY3lWYWx1ZSA9IHNldHRpbmdzW2xlZ2FjeUtleV1cbiAgICAgICAgaWYgKGtleSAmJiBsZWdhY3lWYWx1ZSkge1xuICAgICAgICAgICAgc2V0dGluZ3Nba2V5XSA9IGxlZ2FjeVZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHNldHRpbmdzW2xlZ2FjeUtleV1cbiAgICB9XG4gICAgaWYgKHN5bmNOZWVkZWQpIHtcbiAgICAgICAgc3luY1NldHRpbmdUb2xvY2FsU3RvcmFnZSgpXG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBidWlsZFNldHRpbmdzRnJvbUxvY2FsU3RvcmFnZSAoKSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IGJyb3dzZXJXcmFwcGVyLmdldEZyb21TdG9yYWdlKFsnc2V0dGluZ3MnXSlcbiAgICAvLyBjb3B5IG92ZXIgc2F2ZWQgc2V0dGluZ3MgZnJvbSBzdG9yYWdlXG4gICAgaWYgKCFyZXN1bHRzKSByZXR1cm5cbiAgICBzZXR0aW5ncyA9IGJyb3dzZXJXcmFwcGVyLm1lcmdlU2F2ZWRTZXR0aW5ncyhzZXR0aW5ncywgcmVzdWx0cylcbiAgICBjaGVja0ZvckxlZ2FjeUtleXMoKVxufVxuXG5hc3luYyBmdW5jdGlvbiBidWlsZFNldHRpbmdzRnJvbU1hbmFnZWRTdG9yYWdlICgpIHtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgYnJvd3NlcldyYXBwZXIuZ2V0RnJvbU1hbmFnZWRTdG9yYWdlKE1BTkFHRURfU0VUVElOR1MpXG4gICAgc2V0dGluZ3MgPSBicm93c2VyV3JhcHBlci5tZXJnZVNhdmVkU2V0dGluZ3Moc2V0dGluZ3MsIHJlc3VsdHMpXG59XG5cbmZ1bmN0aW9uIGJ1aWxkU2V0dGluZ3NGcm9tRGVmYXVsdHMgKCkge1xuICAgIC8vIGluaXRpYWwgc2V0dGluZ3MgYXJlIGEgY29weSBvZiBkZWZhdWx0IHNldHRpbmdzXG4gICAgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0U2V0dGluZ3MpXG59XG5cbmZ1bmN0aW9uIHN5bmNTZXR0aW5nVG9sb2NhbFN0b3JhZ2UgKCkge1xuICAgIGJyb3dzZXJXcmFwcGVyLnN5bmNUb1N0b3JhZ2UoeyBzZXR0aW5nczogc2V0dGluZ3MgfSlcbn1cblxuZnVuY3Rpb24gZ2V0U2V0dGluZyAobmFtZSkge1xuICAgIGlmICghaXNSZWFkeSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFNldHRpbmdzOiBnZXRTZXR0aW5nKCkgU2V0dGluZ3Mgbm90IGxvYWRlZDogJHtuYW1lfWApXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGxldCBhbGwgYW5kIG51bGwgcmV0dXJuIGFsbCBzZXR0aW5nc1xuICAgIGlmIChuYW1lID09PSAnYWxsJykgbmFtZSA9IG51bGxcblxuICAgIGlmIChuYW1lKSB7XG4gICAgICAgIHJldHVybiBzZXR0aW5nc1tuYW1lXVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZXR0aW5nc1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlU2V0dGluZyAobmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoIWlzUmVhZHkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBTZXR0aW5nczogdXBkYXRlU2V0dGluZygpIFNldHRpbmcgbm90IGxvYWRlZDogJHtuYW1lfWApXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHNldHRpbmdzW25hbWVdID0gdmFsdWVcbiAgICBzeW5jU2V0dGluZ1RvbG9jYWxTdG9yYWdlKClcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU2V0dGluZyAobmFtZSkge1xuICAgIGlmICghaXNSZWFkeSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFNldHRpbmdzOiByZW1vdmVTZXR0aW5nKCkgU2V0dGluZyBub3QgbG9hZGVkOiAke25hbWV9YClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChzZXR0aW5nc1tuYW1lXSkge1xuICAgICAgICBkZWxldGUgc2V0dGluZ3NbbmFtZV1cbiAgICAgICAgc3luY1NldHRpbmdUb2xvY2FsU3RvcmFnZSgpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBsb2dTZXR0aW5ncyAoKSB7XG4gICAgYnJvd3NlcldyYXBwZXIuZ2V0RnJvbVN0b3JhZ2UoWydzZXR0aW5ncyddKS50aGVuKChzKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKHMuc2V0dGluZ3MpXG4gICAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0U2V0dGluZzogZ2V0U2V0dGluZyxcbiAgICB1cGRhdGVTZXR0aW5nOiB1cGRhdGVTZXR0aW5nLFxuICAgIHJlbW92ZVNldHRpbmc6IHJlbW92ZVNldHRpbmcsXG4gICAgbG9nU2V0dGluZ3M6IGxvZ1NldHRpbmdzLFxuICAgIHJlYWR5OiByZWFkeVxufVxuIiwiaW1wb3J0IGJyb3dzZXIgZnJvbSAnd2ViZXh0ZW5zaW9uLXBvbHlmaWxsJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXh0ZW5zaW9uVVJMIChwYXRoKSB7XG4gICAgcmV0dXJuIGJyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEV4dGVuc2lvblZlcnNpb24gKCkge1xuICAgIGNvbnN0IG1hbmlmZXN0ID0gYnJvd3Nlci5ydW50aW1lLmdldE1hbmlmZXN0KClcbiAgICByZXR1cm4gbWFuaWZlc3QudmVyc2lvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QmFkZ2VJY29uIChiYWRnZURhdGEpIHtcbiAgICBicm93c2VyLmJyb3dzZXJBY3Rpb24uc2V0SWNvbihiYWRnZURhdGEpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW5jVG9TdG9yYWdlIChkYXRhKSB7XG4gICAgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldChkYXRhKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RnJvbVN0b3JhZ2UgKGtleSwgY2IpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KGtleSlcbiAgICByZXR1cm4gcmVzdWx0W2tleV1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZyb21NYW5hZ2VkU3RvcmFnZSAoa2V5cywgY2IpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLm1hbmFnZWQuZ2V0KGtleXMpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZ2V0IG1hbmFnZWQgZmFpbGVkJywgZSlcbiAgICB9XG4gICAgcmV0dXJuIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRlbnNpb25JZCAoKSB7XG4gICAgcmV0dXJuIGJyb3dzZXIucnVudGltZS5pZFxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbm90aWZ5UG9wdXAgKG1lc3NhZ2UpIHtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UobWVzc2FnZSlcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gSWdub3JlIHRoaXMgYXMgY2FuIHRocm93IGFuIGVycm9yIG1lc3NhZ2Ugd2hlbiB0aGUgcG9wdXAgaXMgbm90IG9wZW4uXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVGFiRGF0YSAodGFiRGF0YSkge1xuICAgIHJldHVybiB0YWJEYXRhXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVNhdmVkU2V0dGluZ3MgKHNldHRpbmdzLCByZXN1bHRzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc2V0dGluZ3MsIHJlc3VsdHMpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREREdUYWJVcmxzICgpIHtcbiAgICBjb25zdCB0YWJzID0gYXdhaXQgYnJvd3Nlci50YWJzLnF1ZXJ5KHsgdXJsOiAnaHR0cHM6Ly8qLmR1Y2tkdWNrZ28uY29tLyonIH0pIHx8IFtdXG5cbiAgICB0YWJzLmZvckVhY2godGFiID0+IHtcbiAgICAgICAgYnJvd3Nlci50YWJzLmluc2VydENTUyh0YWIuaWQsIHtcbiAgICAgICAgICAgIGZpbGU6ICcvcHVibGljL2Nzcy9ub2F0Yi5jc3MnXG4gICAgICAgIH0pXG4gICAgfSlcblxuICAgIHJldHVybiB0YWJzLm1hcCh0YWIgPT4gdGFiLnVybClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFVuaW5zdGFsbFVSTCAodXJsKSB7XG4gICAgYnJvd3Nlci5ydW50aW1lLnNldFVuaW5zdGFsbFVSTCh1cmwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VUYWJVUkwgKHRhYklkLCB1cmwpIHtcbiAgICByZXR1cm4gYnJvd3Nlci50YWJzLnVwZGF0ZSh0YWJJZCwgeyB1cmwgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gKHVhU3RyaW5nKSA9PiB7XG4gICAgaWYgKCF1YVN0cmluZykgdWFTdHJpbmcgPSBnbG9iYWxUaGlzLm5hdmlnYXRvci51c2VyQWdlbnRcblxuICAgIGxldCBicm93c2VyXG4gICAgbGV0IHZlcnNpb25cblxuICAgIHRyeSB7XG4gICAgICAgIGxldCBwYXJzZWRVYVBhcnRzID0gdWFTdHJpbmcubWF0Y2goLyhGaXJlZm94fENocm9tZXxFZGcpXFwvKFswLTldKykvKVxuICAgICAgICBpZiAodWFTdHJpbmcubWF0Y2goLyhFZGdlPylcXC8oWzAtOV0rKS8pKSB7XG4gICAgICAgICAgICAvLyBBYm92ZSByZWdleCBtYXRjaGVzIG9uIENocm9tZSBmaXJzdCwgc28gY2hlY2sgaWYgdGhpcyBpcyByZWFsbHkgRWRnZVxuICAgICAgICAgICAgcGFyc2VkVWFQYXJ0cyA9IHVhU3RyaW5nLm1hdGNoKC8oRWRnZT8pXFwvKFswLTldKykvKVxuICAgICAgICB9XG4gICAgICAgIGJyb3dzZXIgPSBwYXJzZWRVYVBhcnRzWzFdXG4gICAgICAgIHZlcnNpb24gPSBwYXJzZWRVYVBhcnRzWzJdXG5cbiAgICAgICAgLy8gQnJhdmUgZG9lc24ndCBpbmNsdWRlIGFueSBpbmZvcm1hdGlvbiBpbiB0aGUgVXNlckFnZW50XG4gICAgICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLmJyYXZlKSB7XG4gICAgICAgICAgICBicm93c2VyID0gJ0JyYXZlJ1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyB1bmxpa2VseSwgcHJldmVudCBleHRlbnNpb24gZnJvbSBleHBsb2RpbmcgaWYgd2UgZG9uJ3QgcmVjb2duaXplIHRoZSBVQVxuICAgICAgICBicm93c2VyID0gdmVyc2lvbiA9ICcnXG4gICAgfVxuXG4gICAgbGV0IG9zID0gJ28nXG4gICAgaWYgKGdsb2JhbFRoaXMubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdXaW5kb3dzJykgIT09IC0xKSBvcyA9ICd3J1xuICAgIGlmIChnbG9iYWxUaGlzLm5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTWFjJykgIT09IC0xKSBvcyA9ICdtJ1xuICAgIGlmIChnbG9iYWxUaGlzLm5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTGludXgnKSAhPT0gLTEpIG9zID0gJ2wnXG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvcyxcbiAgICAgICAgYnJvd3NlcixcbiAgICAgICAgdmVyc2lvblxuICAgIH1cbn1cbiIsImltcG9ydCBwYXJzZVVzZXJBZ2VudFN0cmluZyBmcm9tICcuLi8uLi9zaGFyZWQtdXRpbHMvcGFyc2UtdXNlci1hZ2VudC1zdHJpbmcuZXM2J1xuaW1wb3J0IGJyb3dzZXIgZnJvbSAnd2ViZXh0ZW5zaW9uLXBvbHlmaWxsJ1xuY29uc3QgYnJvd3NlckluZm8gPSBwYXJzZVVzZXJBZ2VudFN0cmluZygpXG5cbmNvbnN0IHNlbmRNZXNzYWdlID0gYXN5bmMgKG1lc3NhZ2VUeXBlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGF3YWl0IGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7IG1lc3NhZ2VUeXBlLCBvcHRpb25zIH0pXG59XG5cbmNvbnN0IGJhY2tncm91bmRNZXNzYWdlID0gKHRoaXNNb2RlbCkgPT4ge1xuICAgIC8vIGxpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSBiYWNrZ3JvdW5kIGFuZFxuICAgIC8vIC8vIG5vdGlmeSBzdWJzY3JpYmVyc1xuICAgIHdpbmRvdy5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcSwgc2VuZGVyKSA9PiB7XG4gICAgICAgIGlmIChzZW5kZXIuaWQgIT09IGNocm9tZS5ydW50aW1lLmlkKSByZXR1cm5cbiAgICAgICAgaWYgKHJlcS5hbGxvd2xpc3RDaGFuZ2VkKSB0aGlzTW9kZWwuc2VuZCgnYWxsb3dsaXN0Q2hhbmdlZCcpXG4gICAgICAgIGlmIChyZXEudXBkYXRlVGFiRGF0YSkgdGhpc01vZGVsLnNlbmQoJ3VwZGF0ZVRhYkRhdGEnKVxuICAgICAgICBpZiAocmVxLmRpZFJlc2V0VHJhY2tlcnNEYXRhKSB0aGlzTW9kZWwuc2VuZCgnZGlkUmVzZXRUcmFja2Vyc0RhdGEnLCByZXEuZGlkUmVzZXRUcmFja2Vyc0RhdGEpXG4gICAgICAgIGlmIChyZXEuY2xvc2VQb3B1cCkgd2luZG93LmNsb3NlKClcbiAgICB9KVxufVxuXG5jb25zdCBnZXRCYWNrZ3JvdW5kVGFiRGF0YSA9ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBzZW5kTWVzc2FnZSgnZ2V0Q3VycmVudFRhYicpLnRoZW4oKHRhYikgPT4ge1xuICAgICAgICAgICAgaWYgKHRhYikge1xuICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlKCdnZXRUYWInLCB0YWIuaWQpLnRoZW4oKGJhY2tncm91bmRUYWJPYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShiYWNrZ3JvdW5kVGFiT2JqKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSlcbn1cblxuY29uc3Qgc2VhcmNoID0gKHVybCkgPT4ge1xuICAgIHdpbmRvdy5jaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IGBodHRwczovL2R1Y2tkdWNrZ28uY29tLz9xPSR7dXJsfSZiZXh0PSR7YnJvd3NlckluZm8ub3N9Y3JgIH0pXG59XG5cbmNvbnN0IGdldEV4dGVuc2lvblVSTCA9IChwYXRoKSA9PiB7XG4gICAgcmV0dXJuIGNocm9tZS5ydW50aW1lLmdldFVSTChwYXRoKVxufVxuXG5jb25zdCBvcGVuRXh0ZW5zaW9uUGFnZSA9IChwYXRoKSA9PiB7XG4gICAgd2luZG93LmNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogZ2V0RXh0ZW5zaW9uVVJMKHBhdGgpIH0pXG59XG5cbmNvbnN0IG9wZW5PcHRpb25zUGFnZSA9IChicm93c2VyKSA9PiB7XG4gICAgaWYgKGJyb3dzZXIgPT09ICdtb3onKSB7XG4gICAgICAgIG9wZW5FeHRlbnNpb25QYWdlKCcvaHRtbC9vcHRpb25zLmh0bWwnKVxuICAgICAgICB3aW5kb3cuY2xvc2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5jaHJvbWUucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKVxuICAgIH1cbn1cblxuY29uc3QgcmVsb2FkVGFiID0gKGlkKSA9PiB7XG4gICAgd2luZG93LmNocm9tZS50YWJzLnJlbG9hZChpZClcbn1cblxuY29uc3QgY2xvc2VQb3B1cCA9ICgpID0+IHtcbiAgICBjb25zdCB3ID0gd2luZG93LmNocm9tZS5leHRlbnNpb24uZ2V0Vmlld3MoeyB0eXBlOiAncG9wdXAnIH0pWzBdXG4gICAgdy5jbG9zZSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNlbmRNZXNzYWdlLFxuICAgIHJlbG9hZFRhYjogcmVsb2FkVGFiLFxuICAgIGNsb3NlUG9wdXA6IGNsb3NlUG9wdXAsXG4gICAgYmFja2dyb3VuZE1lc3NhZ2U6IGJhY2tncm91bmRNZXNzYWdlLFxuICAgIGdldEJhY2tncm91bmRUYWJEYXRhOiBnZXRCYWNrZ3JvdW5kVGFiRGF0YSxcbiAgICBzZWFyY2g6IHNlYXJjaCxcbiAgICBvcGVuT3B0aW9uc1BhZ2U6IG9wZW5PcHRpb25zUGFnZSxcbiAgICBvcGVuRXh0ZW5zaW9uUGFnZTogb3BlbkV4dGVuc2lvblBhZ2UsXG4gICAgZ2V0RXh0ZW5zaW9uVVJMOiBnZXRFeHRlbnNpb25VUkxcbn1cbiIsImNvbnN0IFBhcmVudCA9IHdpbmRvdy5EREcuYmFzZS5Nb2RlbFxuXG5mdW5jdGlvbiBBdXRvY29tcGxldGUgKGF0dHJzKSB7XG4gICAgUGFyZW50LmNhbGwodGhpcywgYXR0cnMpXG59XG5cbkF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICB7XG5cbiAgICAgICAgbW9kZWxOYW1lOiAnYXV0b2NvbXBsZXRlJyxcblxuICAgICAgICBmZXRjaFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBhamF4IGNhbGwgaGVyZSB0byBkZGcgYXV0b2NvbXBsZXRlIHNlcnZpY2VcbiAgICAgICAgICAgICAgICAvLyBmb3Igbm93IHdlJ2xsIGp1c3QgbW9jayB1cCBhbiBhc3luYyB4aHIgcXVlcnkgcmVzdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBbYCR7c2VhcmNoVGV4dH0gd29ybGRgLCBgJHtzZWFyY2hUZXh0fSB1bml0ZWRgLCBgJHtzZWFyY2hUZXh0fSBmYW1mYW1gXVxuICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvY29tcGxldGVcbiIsImNvbnN0IFBhcmVudCA9IHdpbmRvdy5EREcuYmFzZS5Nb2RlbFxuY29uc3QgYnJvd3NlclVJV3JhcHBlciA9IHJlcXVpcmUoJy4vLi4vYmFzZS91aS13cmFwcGVyLmVzNi5qcycpXG5cbi8qKlxuICogQmFja2dyb3VuZCBtZXNzYWdpbmcgaXMgZG9uZSB2aWEgdHdvIG1ldGhvZHM6XG4gKlxuICogMS4gUGFzc2l2ZSBtZXNzYWdlcyBmcm9tIGJhY2tncm91bmQgLT4gYmFja2dyb3VuZE1lc3NhZ2UgbW9kZWwgLT4gc3Vic2NyaWJpbmcgbW9kZWxcbiAqXG4gKiAgVGhlIGJhY2tncm91bmQgc2VuZHMgdGhlc2UgbWVzc2FnZXMgdXNpbmcgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyduYW1lJzogJ3ZhbHVlJ30pXG4gKiAgVGhlIGJhY2tncm91bmRNZXNzYWdlIG1vZGVsIChoZXJlKSByZWNlaXZlcyB0aGUgbWVzc2FnZSBhbmQgZm9yd2FyZHMgdGhlXG4gKiAgaXQgdG8gdGhlIGdsb2JhbCBldmVudCBzdG9yZSB2aWEgbW9kZWwuc2VuZChtc2cpXG4gKiAgT3RoZXIgbW9kdWxlcyB0aGF0IGFyZSBzdWJzY3JpYmVkIHRvIHN0YXRlIGNoYW5nZXMgaW4gYmFja2dyb3VuZE1lc3NhZ2UgYXJlIG5vdGlmaWVkXG4gKlxuICogMi4gVHdvLXdheSBtZXNzYWdpbmcgdXNpbmcgdGhpcy5tb2RlbC5zZW5kTWVzc2FnZSgpIGFzIGEgcGFzc3Rocm91Z2hcbiAqXG4gKiAgRWFjaCBtb2RlbCBjYW4gdXNlIGEgc2VuZE1lc3NhZ2UgbWV0aG9kIHRvIHNlbmQgYW5kIHJlY2VpdmUgYSByZXNwb25zZSBmcm9tIHRoZSBiYWNrZ3JvdW5kLlxuICogIEV4OiB0aGlzLm1vZGVsLnNlbmRNZXNzYWdlKCduYW1lJywgeyAuLi4gfSkudGhlbigocmVzcG9uc2UpID0+IGNvbnNvbGUubG9nKHJlc3BvbnNlKSlcbiAqICBMaXN0ZW5lcnMgbXVzdCBiZSByZWdpc3RlcmVkIGluIHRoZSBiYWNrZ3JvdW5kIHRvIHJlc3BvbmQgdG8gbWVzc2FnZXMgd2l0aCB0aGlzICduYW1lJy5cbiAqXG4gKiAgVGhlIGNvbW1vbiBzZW5kTWVzc2FnZSBtZXRob2QgaXMgZGVmaW5lZCBpbiBiYXNlL21vZGVsLmVzNi5qc1xuICovXG5mdW5jdGlvbiBCYWNrZ3JvdW5kTWVzc2FnZSAoYXR0cnMpIHtcbiAgICBQYXJlbnQuY2FsbCh0aGlzLCBhdHRycylcbiAgICBjb25zdCB0aGlzTW9kZWwgPSB0aGlzXG4gICAgYnJvd3NlclVJV3JhcHBlci5iYWNrZ3JvdW5kTWVzc2FnZSh0aGlzTW9kZWwpXG59XG5cbkJhY2tncm91bmRNZXNzYWdlLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIHtcbiAgICAgICAgbW9kZWxOYW1lOiAnYmFja2dyb3VuZE1lc3NhZ2UnXG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tncm91bmRNZXNzYWdlXG4iLCJjb25zdCBQYXJlbnQgPSB3aW5kb3cuRERHLmJhc2UuTW9kZWxcblxuZnVuY3Rpb24gRW1haWxBbGlhc01vZGVsIChhdHRycykge1xuICAgIGF0dHJzID0gYXR0cnMgfHwge31cbiAgICBQYXJlbnQuY2FsbCh0aGlzLCBhdHRycylcbn1cblxuRW1haWxBbGlhc01vZGVsLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIHtcbiAgICAgICAgbW9kZWxOYW1lOiAnZW1haWxBbGlhcycsXG5cbiAgICAgICAgZ2V0VXNlckRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbmRNZXNzYWdlKCdnZXRTZXR0aW5nJywgeyBuYW1lOiAndXNlckRhdGEnIH0pLnRoZW4odXNlckRhdGEgPT4gdXNlckRhdGEpXG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9nb3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZW5kTWVzc2FnZSgnbG9nb3V0JykudGhlbigoKSA9PiB0aGlzLnNldCgndXNlckRhdGEnLCB1bmRlZmluZWQpKVxuICAgICAgICB9XG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtYWlsQWxpYXNNb2RlbFxuIiwiY29uc3QgUGFyZW50ID0gd2luZG93LkRERy5iYXNlLk1vZGVsXG5cbmZ1bmN0aW9uIEhhbWJ1cmdlck1lbnUgKGF0dHJzKSB7XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fVxuICAgIGF0dHJzLnRhYlVybCA9ICcnXG4gICAgUGFyZW50LmNhbGwodGhpcywgYXR0cnMpXG59XG5cbkhhbWJ1cmdlck1lbnUucHJvdG90eXBlID0gd2luZG93LiQuZXh0ZW5kKHt9LFxuICAgIFBhcmVudC5wcm90b3R5cGUsXG4gICAge1xuICAgICAgICBtb2RlbE5hbWU6ICdoYW1idXJnZXJNZW51J1xuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBIYW1idXJnZXJNZW51XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBGaXhlcyBjYXNlcyBsaWtlIFwiQW1hem9uLmNvbVwiLCB3aGljaCBicmVhayB0aGUgY29tcGFueSBpY29uXG4gICAgbm9ybWFsaXplQ29tcGFueU5hbWUgKGNvbXBhbnlOYW1lKSB7XG4gICAgICAgIGNvbXBhbnlOYW1lID0gY29tcGFueU5hbWUgfHwgJydcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBjb21wYW55TmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xcLlthLXpdKyQvLCAnJylcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWROYW1lXG4gICAgfVxufVxuIiwiY29uc3QgUGFyZW50ID0gd2luZG93LkRERy5iYXNlLk1vZGVsXG5jb25zdCBicm93c2VyVUlXcmFwcGVyID0gcmVxdWlyZSgnLi8uLi9iYXNlL3VpLXdyYXBwZXIuZXM2LmpzJylcblxuZnVuY3Rpb24gU2VhcmNoIChhdHRycykge1xuICAgIFBhcmVudC5jYWxsKHRoaXMsIGF0dHJzKVxufVxuXG5TZWFyY2gucHJvdG90eXBlID0gd2luZG93LiQuZXh0ZW5kKHt9LFxuICAgIFBhcmVudC5wcm90b3R5cGUsXG4gICAge1xuXG4gICAgICAgIG1vZGVsTmFtZTogJ3NlYXJjaCcsXG5cbiAgICAgICAgZG9TZWFyY2g6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRleHQgPSBzXG4gICAgICAgICAgICBzID0gZW5jb2RlVVJJQ29tcG9uZW50KHMpXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBkb1NlYXJjaCgpIGZvciAke3N9YClcblxuICAgICAgICAgICAgYnJvd3NlclVJV3JhcHBlci5zZWFyY2gocylcbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hcbiIsImNvbnN0IFBhcmVudCA9IHdpbmRvdy5EREcuYmFzZS5Nb2RlbFxuY29uc3Qgbm9ybWFsaXplQ29tcGFueU5hbWUgPSByZXF1aXJlKCcuL21peGlucy9ub3JtYWxpemUtY29tcGFueS1uYW1lLmVzNicpXG5cbmZ1bmN0aW9uIFNpdGVDb21wYW55TGlzdCAoYXR0cnMpIHtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9XG4gICAgYXR0cnMudGFiID0gbnVsbFxuICAgIGF0dHJzLmNvbXBhbnlMaXN0TWFwID0gW11cbiAgICBQYXJlbnQuY2FsbCh0aGlzLCBhdHRycylcbn1cblxuU2l0ZUNvbXBhbnlMaXN0LnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIG5vcm1hbGl6ZUNvbXBhbnlOYW1lLFxuICAgIHtcblxuICAgICAgICBtb2RlbE5hbWU6ICdzaXRlQ29tcGFueUxpc3QnLFxuXG4gICAgICAgIGZldGNoQXN5bmNEYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoJ2dldEN1cnJlbnRUYWInKS50aGVuKCh0YWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSgnZ2V0VGFiJywgdGFiLmlkKS50aGVuKChia2dUYWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYiA9IGJrZ1RhYlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG9tYWluID0gdGhpcy50YWIgJiYgdGhpcy50YWIuc2l0ZSA/IHRoaXMudGFiLnNpdGUuZG9tYWluIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVDb21wYW5pZXNMaXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdTaXRlRGV0YWlscyBtb2RlbDogbm8gdGFiJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3VwZGF0ZUNvbXBhbmllc0xpc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGxpc3Qgb2YgYWxsIHRyYWNrZXJzIG9uIHBhZ2UgKHdoZXRoZXIgd2UgYmxvY2tlZCB0aGVtIG9yIG5vdClcbiAgICAgICAgICAgIHRoaXMudHJhY2tlcnMgPSB0aGlzLnRhYi50cmFja2VycyB8fCB7fVxuICAgICAgICAgICAgY29uc3QgY29tcGFueU5hbWVzID0gT2JqZWN0LmtleXModGhpcy50cmFja2VycylcbiAgICAgICAgICAgIGxldCB1bmtub3duU2FtZURvbWFpbkNvbXBhbnkgPSBudWxsXG5cbiAgICAgICAgICAgIC8vIHNldCB0cmFja2VybGlzdCBtZXRhZGF0YSBmb3IgbGlzdCBkaXNwbGF5IGJ5IGNvbXBhbnk6XG4gICAgICAgICAgICB0aGlzLmNvbXBhbnlMaXN0TWFwID0gY29tcGFueU5hbWVzXG4gICAgICAgICAgICAgICAgLm1hcCgoY29tcGFueU5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMudHJhY2tlcnNbY29tcGFueU5hbWVdXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybHNMaXN0ID0gY29tcGFueS51cmxzID8gT2JqZWN0LmtleXMoY29tcGFueS51cmxzKSA6IFtdXG4gICAgICAgICAgICAgICAgICAgIC8vIFVua25vd24gc2FtZSBkb21haW4gdHJhY2tlcnMgbmVlZCB0byBiZSBpbmRpdmlkdWFsbHkgZmV0Y2hlZCBhbmQgcHV0XG4gICAgICAgICAgICAgICAgICAgIC8vIGluIHRoZSB1bmJsb2NrZWQgbGlzdFxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGFueU5hbWUgPT09ICd1bmtub3duJyAmJiB0aGlzLmhhc1VuYmxvY2tlZFRyYWNrZXJzKGNvbXBhbnksIHVybHNMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5rbm93blNhbWVEb21haW5Db21wYW55ID0gdGhpcy5jcmVhdGVVbmJsb2NrZWRMaXN0KGNvbXBhbnksIHVybHNMaXN0KVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FsYyBtYXggdXNpbmcgcGl4ZWxzIGluc3RlYWQgb2YgJSB0byBtYWtlIG1hcmdpbnMgZWFzaWVyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1heCB3aWR0aDogMzAwIC0gKGhvcml6b250YWwgcGFkZGluZyBpbiBjc3MpID0gMjYwXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wYW55TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBjb21wYW55LmRpc3BsYXlOYW1lIHx8IGNvbXBhbnlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZE5hbWU6IHRoaXMubm9ybWFsaXplQ29tcGFueU5hbWUoY29tcGFueU5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHRoaXMuX3NldENvdW50KGNvbXBhbnksIGNvbXBhbnlOYW1lLCB1cmxzTGlzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmxzOiBjb21wYW55LnVybHMsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmxzTGlzdDogdXJsc0xpc3RcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGIuY291bnQgLSBhLmNvdW50XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaWYgKHVua25vd25TYW1lRG9tYWluQ29tcGFueSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcGFueUxpc3RNYXAucHVzaCh1bmtub3duU2FtZURvbWFpbkNvbXBhbnkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gTWFrZSBhZC1ob2MgdW5ibG9ja2VkIGxpc3RcbiAgICAgICAgLy8gdXNlZCB0byBjaGVycnkgcGljayB1bmJsb2NrZWQgdHJhY2tlcnMgZnJvbSB1bmtub3duIGNvbXBhbmllc1xuICAgICAgICAvLyB0aGUgbmFtZSBpcyB0aGUgc2l0ZSBkb21haW4sIGNvdW50IGlzIC0yIHRvIHNob3cgdGhlIGxpc3QgYXQgdGhlIGJvdHRvbVxuICAgICAgICBjcmVhdGVVbmJsb2NrZWRMaXN0OiBmdW5jdGlvbiAoY29tcGFueSwgdXJsc0xpc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHVuYmxvY2tlZFRyYWNrZXJzID0gdGhpcy5zcGxpY2VVbmJsb2NrZWRUcmFja2Vycyhjb21wYW55LCB1cmxzTGlzdClcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5kb21haW4sXG4gICAgICAgICAgICAgICAgaWNvbk5hbWU6ICcnLCAvLyB3ZSB3b24ndCBoYXZlIGFuIGljb24gZm9yIHVua25vd24gZmlyc3QgcGFydHkgdHJhY2tlcnNcbiAgICAgICAgICAgICAgICBjb3VudDogLTIsXG4gICAgICAgICAgICAgICAgdXJsczogdW5ibG9ja2VkVHJhY2tlcnMsXG4gICAgICAgICAgICAgICAgdXJsc0xpc3Q6IE9iamVjdC5rZXlzKHVuYmxvY2tlZFRyYWNrZXJzKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFJldHVybiBhbiBhcnJheSBvZiB1bmJsb2NrZWQgdHJhY2tlcnNcbiAgICAgICAgLy8gYW5kIHJlbW92ZSB0aG9zZSBlbnRyaWVzIGZyb20gdGhlIHNwZWNpZmllZCBjb21wYW55XG4gICAgICAgIC8vIG9ubHkgbmVlZGVkIGZvciB1bmtub3duIHRyYWNrZXJzLCBzbyBmYXJcbiAgICAgICAgc3BsaWNlVW5ibG9ja2VkVHJhY2tlcnM6IGZ1bmN0aW9uIChjb21wYW55LCB1cmxzTGlzdCkge1xuICAgICAgICAgICAgaWYgKCFjb21wYW55IHx8ICFjb21wYW55LnVybHMgfHwgIXVybHNMaXN0KSByZXR1cm4gbnVsbFxuXG4gICAgICAgICAgICByZXR1cm4gdXJsc0xpc3QuZmlsdGVyKCh1cmwpID0+IGNvbXBhbnkudXJsc1t1cmxdLmlzQmxvY2tlZCA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgLnJlZHVjZSgodW5ibG9ja2VkVHJhY2tlcnMsIHVybCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1bmJsb2NrZWRUcmFja2Vyc1t1cmxdID0gY29tcGFueS51cmxzW3VybF1cblxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGNvbXBhbnkgdXJscyBhbmQgdXJsc0xpc3RcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbXBhbnkudXJsc1t1cmxdXG4gICAgICAgICAgICAgICAgICAgIHVybHNMaXN0LnNwbGljZSh1cmxzTGlzdC5pbmRleE9mKHVybCksIDEpXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuYmxvY2tlZFRyYWNrZXJzXG4gICAgICAgICAgICAgICAgfSwge30pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gUmV0dXJuIHRydWUgaWYgY29tcGFueSBoYXMgdW5ibG9ja2VkIHRyYWNrZXJzIGluIHRoZSBjdXJyZW50IHRhYlxuICAgICAgICBoYXNVbmJsb2NrZWRUcmFja2VyczogZnVuY3Rpb24gKGNvbXBhbnksIHVybHNMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIWNvbXBhbnkgfHwgIWNvbXBhbnkudXJscyB8fCAhdXJsc0xpc3QpIHJldHVybiBmYWxzZVxuXG4gICAgICAgICAgICByZXR1cm4gdXJsc0xpc3Quc29tZSgodXJsKSA9PiBjb21wYW55LnVybHNbdXJsXS5pc0Jsb2NrZWQgPT09IGZhbHNlKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIERldGVybWluZXMgc29ydGluZyBvcmRlciBvZiB0aGUgY29tcGFueSBsaXN0XG4gICAgICAgIF9zZXRDb3VudDogZnVuY3Rpb24gKGNvbXBhbnksIGNvbXBhbnlOYW1lLCB1cmxzTGlzdCkge1xuICAgICAgICAgICAgbGV0IGNvdW50ID0gY29tcGFueS5jb3VudFxuICAgICAgICAgICAgLy8gVW5rbm93biB0cmFja2VycywgZm9sbG93ZWQgYnkgdW5ibG9ja2VkIGZpcnN0IHBhcnR5LFxuICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGF0IHRoZSBib3R0b20gb2YgdGhlIGxpc3RcbiAgICAgICAgICAgIGlmIChjb21wYW55TmFtZSA9PT0gJ3Vua25vd24nKSB7XG4gICAgICAgICAgICAgICAgY291bnQgPSAtMVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc1VuYmxvY2tlZFRyYWNrZXJzKGNvbXBhbnksIHVybHNMaXN0KSkge1xuICAgICAgICAgICAgICAgIGNvdW50ID0gLTJcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgIH1cbiAgICB9XG4pXG5cbm1vZHVsZS5leHBvcnRzID0gU2l0ZUNvbXBhbnlMaXN0XG4iLCJjb25zdCBQYXJlbnQgPSB3aW5kb3cuRERHLmJhc2UuTW9kZWxcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4uLy4uLy4uL2RhdGEvY29uc3RhbnRzJylcbmNvbnN0IGh0dHBzTWVzc2FnZXMgPSBjb25zdGFudHMuaHR0cHNNZXNzYWdlc1xuY29uc3QgYnJvd3NlclVJV3JhcHBlciA9IHJlcXVpcmUoJy4vLi4vYmFzZS91aS13cmFwcGVyLmVzNi5qcycpXG5jb25zdCBzdWJtaXRCcmVha2FnZUZvcm0gPSByZXF1aXJlKCcuL3N1Ym1pdC1icmVha2FnZS1mb3JtLmVzNicpXG5cbi8vIGZvciBub3cgd2UgY29uc2lkZXIgdHJhY2tlciBuZXR3b3JrcyBmb3VuZCBvbiBtb3JlIHRoYW4gNyUgb2Ygc2l0ZXNcbi8vIGFzIFwibWFqb3JcIlxuY29uc3QgTUFKT1JfVFJBQ0tFUl9USFJFU0hPTERfUENUID0gN1xuXG5mdW5jdGlvbiBTaXRlIChhdHRycykge1xuICAgIGF0dHJzID0gYXR0cnMgfHwge31cbiAgICBhdHRycy5kaXNhYmxlZCA9IHRydWUgLy8gZGlzYWJsZWQgYnkgZGVmYXVsdFxuICAgIGF0dHJzLnRhYiA9IG51bGxcbiAgICBhdHRycy5kb21haW4gPSAnLSdcbiAgICBhdHRycy5wcm90ZWN0aW9uc0VuYWJsZWQgPSBmYWxzZVxuICAgIGF0dHJzLmlzQnJva2VuID0gZmFsc2VcbiAgICBhdHRycy5kaXNwbGF5QnJva2VuVUkgPSBmYWxzZVxuXG4gICAgYXR0cnMuaXNBbGxvd2xpc3RlZCA9IGZhbHNlXG4gICAgYXR0cnMuYWxsb3dsaXN0T3B0SW4gPSBmYWxzZVxuICAgIGF0dHJzLmlzQ2FsY3VsYXRpbmdTaXRlUmF0aW5nID0gdHJ1ZVxuICAgIGF0dHJzLnNpdGVSYXRpbmcgPSB7fVxuICAgIGF0dHJzLmh0dHBzU3RhdGUgPSAnbm9uZSdcbiAgICBhdHRycy5odHRwc1N0YXR1c1RleHQgPSAnJ1xuICAgIGF0dHJzLnRyYWNrZXJzQ291bnQgPSAwIC8vIHVuaXF1ZSB0cmFja2VycyBjb3VudFxuICAgIGF0dHJzLm1ham9yVHJhY2tlck5ldHdvcmtzQ291bnQgPSAwXG4gICAgYXR0cnMudG90YWxUcmFja2VyTmV0d29ya3NDb3VudCA9IDBcbiAgICBhdHRycy50cmFja2VyTmV0d29ya3MgPSBbXVxuICAgIGF0dHJzLnRvc2RyID0ge31cbiAgICBhdHRycy5pc2FNYWpvclRyYWNraW5nTmV0d29yayA9IGZhbHNlXG4gICAgUGFyZW50LmNhbGwodGhpcywgYXR0cnMpXG5cbiAgICB0aGlzLmJpbmRFdmVudHMoW1xuICAgICAgICBbdGhpcy5zdG9yZS5zdWJzY3JpYmUsICdhY3Rpb246YmFja2dyb3VuZE1lc3NhZ2UnLCB0aGlzLmhhbmRsZUJhY2tncm91bmRNc2ddXG4gICAgXSlcbn1cblxuU2l0ZS5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICB7XG5cbiAgICAgICAgbW9kZWxOYW1lOiAnc2l0ZScsXG5cbiAgICAgICAgZ2V0QmFja2dyb3VuZFRhYkRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGJyb3dzZXJVSVdyYXBwZXIuZ2V0QmFja2dyb3VuZFRhYkRhdGEoKS50aGVuKCh0YWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3RhYicsIHRhYilcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG9tYWluID0gdGFiLnNpdGUuZG9tYWluXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZldGNoU2l0ZVJhdGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgndG9zZHInLCB0YWIuc2l0ZS50b3NkcilcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KCdpc2FNYWpvclRyYWNraW5nTmV0d29yaycsIHRhYi5zaXRlLnBhcmVudFByZXZhbGVuY2UgPj0gTUFKT1JfVFJBQ0tFUl9USFJFU0hPTERfUENUKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKCdnZXRTZXR0aW5nJywgeyBuYW1lOiAndGRzLWV0YWcnIH0pLnRoZW4oZXRhZyA9PiB0aGlzLnNldCgndGRzJywgZXRhZykpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdTaXRlIG1vZGVsOiBubyB0YWInKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTaXRlUHJvcGVydGllcygpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SHR0cHNNZXNzYWdlKClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBmZXRjaFNpdGVSYXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdbbW9kZWxdIGZldGNoU2l0ZVJhdGluZygpJylcbiAgICAgICAgICAgIGlmICh0aGlzLnRhYikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoJ2dldFNpdGVHcmFkZScsIHRoaXMudGFiLmlkKS50aGVuKChyYXRpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZldGNoU2l0ZVJhdGluZzogJywgcmF0aW5nKVxuICAgICAgICAgICAgICAgICAgICBpZiAocmF0aW5nKSB0aGlzLnVwZGF0ZSh7IHNpdGVSYXRpbmc6IHJhdGluZyB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U2l0ZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy50YWIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvbWFpbiA9ICduZXcgdGFiJyAvLyB0YWIgY2FuIGJlIG51bGwgZm9yIGZpcmVmb3ggbmV3IHRhYnNcbiAgICAgICAgICAgICAgICB0aGlzLnNldCh7IGlzQ2FsY3VsYXRpbmdTaXRlUmF0aW5nOiBmYWxzZSB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRBbGxvd2xpc3RlZCh0aGlzLnRhYi5zaXRlLmFsbG93bGlzdGVkLCB0aGlzLnRhYi5zaXRlLmRlbnlsaXN0ZWQpXG4gICAgICAgICAgICAgICAgdGhpcy5hbGxvd2xpc3RPcHRJbiA9IHRoaXMudGFiLnNpdGUuYWxsb3dsaXN0T3B0SW5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy50YWIuc2l0ZS5zcGVjaWFsRG9tYWluTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvbWFpbiA9IHRoaXMudGFiLnNpdGUuc3BlY2lhbERvbWFpbk5hbWUgLy8gZWcgXCJleHRlbnNpb25zXCIsIFwib3B0aW9uc1wiLCBcIm5ldyB0YWJcIlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCh7IGlzQ2FsY3VsYXRpbmdTaXRlUmF0aW5nOiBmYWxzZSB9KVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KHsgZGlzYWJsZWQ6IGZhbHNlIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5kb21haW4gJiYgdGhpcy5kb21haW4gPT09ICctJykgdGhpcy5zZXQoJ2Rpc2FibGVkJywgdHJ1ZSlcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIdHRwc01lc3NhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy50YWIpIHJldHVyblxuXG4gICAgICAgICAgICBpZiAodGhpcy50YWIudXBncmFkZWRIdHRwcykge1xuICAgICAgICAgICAgICAgIHRoaXMuaHR0cHNTdGF0ZSA9ICd1cGdyYWRlZCdcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoL15odHRwcy8uZXhlYyh0aGlzLnRhYi51cmwpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5odHRwc1N0YXRlID0gJ3NlY3VyZSdcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5odHRwc1N0YXRlID0gJ25vbmUnXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaHR0cHNTdGF0dXNUZXh0ID0gaHR0cHNNZXNzYWdlc1t0aGlzLmh0dHBzU3RhdGVdXG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlQmFja2dyb3VuZE1zZzogZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdbbW9kZWxdIGhhbmRsZUJhY2tncm91bmRNc2coKScpXG4gICAgICAgICAgICBpZiAoIXRoaXMudGFiKSByZXR1cm5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmFjdGlvbiAmJiBtZXNzYWdlLmFjdGlvbiA9PT0gJ3VwZGF0ZVRhYkRhdGEnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSgnZ2V0VGFiJywgdGhpcy50YWIuaWQpLnRoZW4oKGJhY2tncm91bmRUYWJPYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWIgPSBiYWNrZ3JvdW5kVGFiT2JqXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mZXRjaFNpdGVSYXRpbmcoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gY2FsbHMgYHRoaXMuc2V0KClgIHRvIHRyaWdnZXIgdmlldyByZS1yZW5kZXJpbmdcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAob3BzKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnW21vZGVsXSB1cGRhdGUoKScpXG4gICAgICAgICAgICBpZiAodGhpcy50YWIpIHtcbiAgICAgICAgICAgICAgICAvLyBnb3Qgc2l0ZVJhdGluZyBiYWNrIGZyb20gYmFja2dyb3VuZCBwcm9jZXNzXG4gICAgICAgICAgICAgICAgaWYgKG9wcyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgb3BzLnNpdGVSYXRpbmcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wcy5zaXRlUmF0aW5nLnNpdGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wcy5zaXRlUmF0aW5nLmVuaGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBiZWZvcmUgPSBvcHMuc2l0ZVJhdGluZy5zaXRlLmdyYWRlXG4gICAgICAgICAgICAgICAgICAgIGxldCBhZnRlciA9IG9wcy5zaXRlUmF0aW5nLmVuaGFuY2VkLmdyYWRlXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgY3VycmVudGx5IHNob3cgRC0gZ3JhZGVzXG4gICAgICAgICAgICAgICAgICAgIGlmIChiZWZvcmUgPT09ICdELScpIGJlZm9yZSA9ICdEJ1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWZ0ZXIgPT09ICdELScpIGFmdGVyID0gJ0QnXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJlZm9yZSAhPT0gdGhpcy5zaXRlUmF0aW5nLmJlZm9yZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXIgIT09IHRoaXMuc2l0ZVJhdGluZy5hZnRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3U2l0ZVJhdGluZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NCZWZvcmU6IGJlZm9yZS5yZXBsYWNlKCcrJywgJy1wbHVzJykudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NBZnRlcjogYWZ0ZXIucmVwbGFjZSgnKycsICctcGx1cycpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVmb3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXRlUmF0aW5nOiBuZXdTaXRlUmF0aW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ2FsY3VsYXRpbmdTaXRlUmF0aW5nOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzQ2FsY3VsYXRpbmdTaXRlUmF0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnb3Qgc2l0ZSByYXRpbmcgZnJvbSBiYWNrZ3JvdW5kIHByb2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KCdpc0NhbGN1bGF0aW5nU2l0ZVJhdGluZycsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VHJhY2tlcnNDb3VudCA9IHRoaXMuZ2V0VW5pcXVlVHJhY2tlcnNDb3VudCgpXG4gICAgICAgICAgICAgICAgaWYgKG5ld1RyYWNrZXJzQ291bnQgIT09IHRoaXMudHJhY2tlcnNDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgndHJhY2tlcnNDb3VudCcsIG5ld1RyYWNrZXJzQ291bnQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VHJhY2tlcnNCbG9ja2VkQ291bnQgPSB0aGlzLmdldFVuaXF1ZVRyYWNrZXJzQmxvY2tlZENvdW50KClcbiAgICAgICAgICAgICAgICBpZiAobmV3VHJhY2tlcnNCbG9ja2VkQ291bnQgIT09IHRoaXMudHJhY2tlcnNCbG9ja2VkQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3RyYWNrZXJzQmxvY2tlZENvdW50JywgbmV3VHJhY2tlcnNCbG9ja2VkQ291bnQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VHJhY2tlck5ldHdvcmtzID0gdGhpcy5nZXRUcmFja2VyTmV0d29ya3NPblBhZ2UoKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYWNrZXJOZXR3b3Jrcy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChuZXdUcmFja2VyTmV0d29ya3MubGVuZ3RoICE9PSB0aGlzLnRyYWNrZXJOZXR3b3Jrcy5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KCd0cmFja2VyTmV0d29ya3MnLCBuZXdUcmFja2VyTmV0d29ya3MpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VW5rbm93blRyYWNrZXJzQ291bnQgPSB0aGlzLmdldFVua25vd25UcmFja2Vyc0NvdW50KClcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdUb3RhbFRyYWNrZXJOZXR3b3Jrc0NvdW50ID0gbmV3VW5rbm93blRyYWNrZXJzQ291bnQgKyBuZXdUcmFja2VyTmV0d29ya3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgKG5ld1RvdGFsVHJhY2tlck5ldHdvcmtzQ291bnQgIT09IHRoaXMudG90YWxUcmFja2VyTmV0d29ya3NDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgndG90YWxUcmFja2VyTmV0d29ya3NDb3VudCcsIG5ld1RvdGFsVHJhY2tlck5ldHdvcmtzQ291bnQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3TWFqb3JUcmFja2VyTmV0d29ya3NDb3VudCA9IHRoaXMuZ2V0TWFqb3JUcmFja2VyTmV0d29ya3NDb3VudCgpXG4gICAgICAgICAgICAgICAgaWYgKG5ld01ham9yVHJhY2tlck5ldHdvcmtzQ291bnQgIT09IHRoaXMubWFqb3JUcmFja2VyTmV0d29ya3NDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgnbWFqb3JUcmFja2VyTmV0d29ya3NDb3VudCcsIG5ld01ham9yVHJhY2tlck5ldHdvcmtzQ291bnQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFVuaXF1ZVRyYWNrZXJzQ291bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdbbW9kZWxdIGdldFVuaXF1ZVRyYWNrZXJzQ291bnQoKScpXG4gICAgICAgICAgICBjb25zdCBjb3VudCA9IE9iamVjdC5rZXlzKHRoaXMudGFiLnRyYWNrZXJzKS5yZWR1Y2UoKHRvdGFsLCBuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFiLnRyYWNrZXJzW25hbWVdLmNvdW50ICsgdG90YWxcbiAgICAgICAgICAgIH0sIDApXG5cbiAgICAgICAgICAgIHJldHVybiBjb3VudFxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFVuaXF1ZVRyYWNrZXJzQmxvY2tlZENvdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnW21vZGVsXSBnZXRVbmlxdWVUcmFja2Vyc0Jsb2NrZWRDb3VudCgpJylcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gT2JqZWN0LmtleXModGhpcy50YWIudHJhY2tlcnNCbG9ja2VkKS5yZWR1Y2UoKHRvdGFsLCBuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueUJsb2NrZWQgPSB0aGlzLnRhYi50cmFja2Vyc0Jsb2NrZWRbbmFtZV1cblxuICAgICAgICAgICAgICAgIC8vIERvbid0IHRocm93IGEgVHlwZUVycm9yIGlmIHVybHMgYXJlIG5vdCB0aGVyZVxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYWNrZXJzQmxvY2tlZCA9IGNvbXBhbnlCbG9ja2VkLnVybHMgPyBPYmplY3Qua2V5cyhjb21wYW55QmxvY2tlZC51cmxzKSA6IG51bGxcblxuICAgICAgICAgICAgICAgIC8vIENvdW50aW5nIHVuaXF1ZSBVUkxzIGluc3RlYWQgb2YgdXNpbmcgdGhlIGNvdW50XG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGUgY291bnQgcmVmZXJzIHRvIGFsbCByZXF1ZXN0cyByYXRoZXIgdGhhbiB1bmlxdWUgbnVtYmVyIG9mIHRyYWNrZXJzXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhY2tlcnNCbG9ja2VkQ291bnQgPSB0cmFja2Vyc0Jsb2NrZWQgPyB0cmFja2Vyc0Jsb2NrZWQubGVuZ3RoIDogMFxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFja2Vyc0Jsb2NrZWRDb3VudCArIHRvdGFsXG4gICAgICAgICAgICB9LCAwKVxuXG4gICAgICAgICAgICByZXR1cm4gY291bnRcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRVbmtub3duVHJhY2tlcnNDb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1ttb2RlbF0gZ2V0VW5rbm93blRyYWNrZXJzQ291bnQoKScpXG4gICAgICAgICAgICBjb25zdCB1bmtub3duVHJhY2tlcnMgPSB0aGlzLnRhYi50cmFja2VycyA/IHRoaXMudGFiLnRyYWNrZXJzLnVua25vd24gOiB7fVxuXG4gICAgICAgICAgICBsZXQgY291bnQgPSAwXG4gICAgICAgICAgICBpZiAodW5rbm93blRyYWNrZXJzICYmIHVua25vd25UcmFja2Vycy51cmxzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdW5rbm93blRyYWNrZXJzVXJscyA9IE9iamVjdC5rZXlzKHVua25vd25UcmFja2Vycy51cmxzKVxuICAgICAgICAgICAgICAgIGNvdW50ID0gdW5rbm93blRyYWNrZXJzVXJscyA/IHVua25vd25UcmFja2Vyc1VybHMubGVuZ3RoIDogMFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY291bnRcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRNYWpvclRyYWNrZXJOZXR3b3Jrc0NvdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnW21vZGVsXSBnZXRNYWpvclRyYWNrZXJOZXR3b3Jrc0NvdW50KCknKVxuICAgICAgICAgICAgLy8gU2hvdyBvbmx5IGJsb2NrZWQgbWFqb3IgdHJhY2tlcnMgY291bnQsIHVubGVzcyBzaXRlIGlzIGFsbG93bGlzdGVkXG4gICAgICAgICAgICBjb25zdCB0cmFja2VycyA9IHRoaXMucHJvdGVjdGlvbnNFbmFibGVkID8gdGhpcy50YWIudHJhY2tlcnNCbG9ja2VkIDogdGhpcy50YWIudHJhY2tlcnNcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gT2JqZWN0LnZhbHVlcyh0cmFja2VycykucmVkdWNlKCh0b3RhbCwgdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzTWFqb3IgPSB0LnByZXZhbGVuY2UgPiBNQUpPUl9UUkFDS0VSX1RIUkVTSE9MRF9QQ1RcbiAgICAgICAgICAgICAgICB0b3RhbCArPSBpc01ham9yID8gMSA6IDBcbiAgICAgICAgICAgICAgICByZXR1cm4gdG90YWxcbiAgICAgICAgICAgIH0sIDApXG5cbiAgICAgICAgICAgIHJldHVybiBjb3VudFxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFRyYWNrZXJOZXR3b3Jrc09uUGFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1ttb2RlbF0gZ2V0TWFqb3JUcmFja2VyTmV0d29ya3NPblBhZ2UoKScpXG4gICAgICAgICAgICAvLyBhbGwgdHJhY2tlciBuZXR3b3JrcyBmb3VuZCBvbiB0aGlzIHBhZ2UvdGFiXG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrcyA9IE9iamVjdC5rZXlzKHRoaXMudGFiLnRyYWNrZXJzKVxuICAgICAgICAgICAgICAgIC5tYXAoKHQpID0+IHQudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKCh0KSA9PiB0ICE9PSAndW5rbm93bicpXG4gICAgICAgICAgICByZXR1cm4gbmV0d29ya3NcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0QWxsb3dsaXN0ZWQ6IGZ1bmN0aW9uIChhbGxvd0xpc3RWYWx1ZSwgZGVueUxpc3RWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pc0FsbG93bGlzdGVkID0gYWxsb3dMaXN0VmFsdWVcbiAgICAgICAgICAgIHRoaXMuaXNEZW55bGlzdGVkID0gZGVueUxpc3RWYWx1ZVxuXG4gICAgICAgICAgICB0aGlzLmlzQnJva2VuID0gdGhpcy50YWIuc2l0ZS5pc0Jyb2tlbiB8fCAhdGhpcy50YWIuc2l0ZS5lbmFibGVkRmVhdHVyZXMuaW5jbHVkZXMoJ2NvbnRlbnRCbG9ja2luZycpXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlCcm9rZW5VSSA9IHRoaXMuaXNCcm9rZW5cblxuICAgICAgICAgICAgaWYgKGRlbnlMaXN0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlCcm9rZW5VSSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5wcm90ZWN0aW9uc0VuYWJsZWQgPSB0cnVlXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvdGVjdGlvbnNFbmFibGVkID0gISh0aGlzLmlzQWxsb3dsaXN0ZWQgfHwgdGhpcy5pc0Jyb2tlbilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0KCdwcm90ZWN0aW9uc0VuYWJsZWQnLCB0aGlzLnByb3RlY3Rpb25zRW5hYmxlZClcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMaXN0IChsaXN0LCBkb21haW4sIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKCdzZXRMaXN0Jywge1xuICAgICAgICAgICAgICAgIGxpc3QsXG4gICAgICAgICAgICAgICAgZG9tYWluLFxuICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUFsbG93bGlzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGFiICYmIHRoaXMudGFiLnNpdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0Jyb2tlbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRBbGxvd2xpc3RlZCh0aGlzLmlzQWxsb3dsaXN0ZWQsICF0aGlzLmlzRGVueWxpc3RlZClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRMaXN0KCdkZW55bGlzdGVkJywgdGhpcy50YWIuc2l0ZS5kb21haW4sIHRoaXMuaXNEZW55bGlzdGVkKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEV4cGxpY2l0bHkgcmVtb3ZlIGFsbCBkZW55bGlzdGluZyBpZiB0aGUgc2l0ZSBpcyBicm9rZW4uIFRoaXMgY292ZXJzIHRoZSBjYXNlIHdoZW4gdGhlIHNpdGUgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBsaXN0LlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldExpc3QoJ2RlbnlsaXN0ZWQnLCB0aGlzLnRhYi5zaXRlLmRvbWFpbiwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFsbG93bGlzdGVkKCF0aGlzLmlzQWxsb3dsaXN0ZWQpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNBbGxvd2xpc3RlZCAmJiB0aGlzLmFsbG93bGlzdE9wdEluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgnYWxsb3dsaXN0T3B0SW4nLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TGlzdCgnYWxsb3dsaXN0T3B0SW4nLCB0aGlzLnRhYi5zaXRlLmRvbWFpbiwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldExpc3QoJ2FsbG93bGlzdGVkJywgdGhpcy50YWIuc2l0ZS5kb21haW4sIHRoaXMuaXNBbGxvd2xpc3RlZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VibWl0QnJlYWthZ2VGb3JtOiBzdWJtaXRCcmVha2FnZUZvcm1cbiAgICB9XG4pXG5cbm1vZHVsZS5leHBvcnRzID0gU2l0ZVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcbiAgICBpZiAoIXRoaXMudGFiKSByZXR1cm5cblxuICAgIGNvbnN0IGJsb2NrZWRUcmFja2VycyA9IFtdXG4gICAgY29uc3Qgc3Vycm9nYXRlcyA9IFtdXG4gICAgY29uc3QgdXBncmFkZWRIdHRwcyA9IHRoaXMudGFiLnVwZ3JhZGVkSHR0cHNcbiAgICAvLyByZW1vdmUgcGFyYW1zIGFuZCBmcmFnbWVudHMgZnJvbSB1cmwgdG8gYXZvaWQgaW5jbHVkaW5nIHNlbnNpdGl2ZSBkYXRhXG4gICAgY29uc3Qgc2l0ZVVybCA9IHRoaXMudGFiLnVybC5zcGxpdCgnPycpWzBdLnNwbGl0KCcjJylbMF1cbiAgICBjb25zdCB0cmFja2VyT2JqZWN0cyA9IHRoaXMudGFiLnRyYWNrZXJzQmxvY2tlZFxuICAgIGNvbnN0IGJyb2tlblNpdGVQYXJhbXMgPSBbXG4gICAgICAgIHsgY2F0ZWdvcnk6IGNhdGVnb3J5IH0sXG4gICAgICAgIHsgc2l0ZVVybDogZW5jb2RlVVJJQ29tcG9uZW50KHNpdGVVcmwpIH0sXG4gICAgICAgIHsgdXBncmFkZWRIdHRwczogdXBncmFkZWRIdHRwcy50b1N0cmluZygpIH0sXG4gICAgICAgIHsgdGRzOiB0aGlzLnRkcyB9XG4gICAgXVxuXG4gICAgZm9yIChjb25zdCB0cmFja2VyIGluIHRyYWNrZXJPYmplY3RzKSB7XG4gICAgICAgIGNvbnN0IHRyYWNrZXJEb21haW5zID0gdHJhY2tlck9iamVjdHNbdHJhY2tlcl0udXJsc1xuICAgICAgICBPYmplY3Qua2V5cyh0cmFja2VyRG9tYWlucykuZm9yRWFjaCgoZG9tYWluKSA9PiB7XG4gICAgICAgICAgICBpZiAodHJhY2tlckRvbWFpbnNbZG9tYWluXS5pc0Jsb2NrZWQpIHtcbiAgICAgICAgICAgICAgICBibG9ja2VkVHJhY2tlcnMucHVzaChkb21haW4pXG4gICAgICAgICAgICAgICAgaWYgKHRyYWNrZXJEb21haW5zW2RvbWFpbl0ucmVhc29uID09PSAnbWF0Y2hlZCBydWxlIC0gc3Vycm9nYXRlJykge1xuICAgICAgICAgICAgICAgICAgICBzdXJyb2dhdGVzLnB1c2goZG9tYWluKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgYnJva2VuU2l0ZVBhcmFtcy5wdXNoKHsgYmxvY2tlZFRyYWNrZXJzOiBibG9ja2VkVHJhY2tlcnMgfSwgeyBzdXJyb2dhdGVzOiBzdXJyb2dhdGVzIH0pXG4gICAgdGhpcy5zdWJtaXRCcm9rZW5TaXRlUmVwb3J0KGJyb2tlblNpdGVQYXJhbXMpXG5cbiAgICAvLyByZW1lbWJlciB0aGF0IHVzZXIgb3B0ZWQgaW50byBzaGFyaW5nIHNpdGUgYnJlYWthZ2UgZGF0YVxuICAgIC8vIGZvciB0aGlzIGRvbWFpbiwgc28gdGhhdCB3ZSBjYW4gYXR0YWNoIGRvbWFpbiB3aGVuIHRoZXlcbiAgICAvLyByZW1vdmUgc2l0ZSBmcm9tIGFsbG93bGlzdFxuICAgIHRoaXMuc2V0KCdhbGxvd2xpc3RPcHRJbicsIHRydWUpXG4gICAgdGhpcy5zZW5kTWVzc2FnZSgnYWxsb3dsaXN0T3B0SW4nLFxuICAgICAgICB7XG4gICAgICAgICAgICBsaXN0OiAnYWxsb3dsaXN0T3B0SW4nLFxuICAgICAgICAgICAgZG9tYWluOiB0aGlzLnRhYi5zaXRlLmRvbWFpbixcbiAgICAgICAgICAgIHZhbHVlOiB0cnVlXG4gICAgICAgIH1cbiAgICApXG59XG4iLCJjb25zdCBQYXJlbnQgPSB3aW5kb3cuRERHLmJhc2UuTW9kZWxcbmNvbnN0IG5vcm1hbGl6ZUNvbXBhbnlOYW1lID0gcmVxdWlyZSgnLi9taXhpbnMvbm9ybWFsaXplLWNvbXBhbnktbmFtZS5lczYnKVxuXG5mdW5jdGlvbiBUb3BCbG9ja2VkIChhdHRycykge1xuICAgIGF0dHJzID0gYXR0cnMgfHwge31cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1hc3NpZ25cbiAgICBhdHRycy5udW1Db21wYW5pZXMgPSBhdHRycy5udW1Db21wYW5pZXNcbiAgICBhdHRycy5jb21wYW55TGlzdCA9IFtdXG4gICAgYXR0cnMuY29tcGFueUxpc3RNYXAgPSBbXVxuICAgIGF0dHJzLnBjdFBhZ2VzV2l0aFRyYWNrZXJzID0gbnVsbFxuICAgIGF0dHJzLmxhc3RTdGF0c1Jlc2V0RGF0ZSA9IG51bGxcbiAgICBQYXJlbnQuY2FsbCh0aGlzLCBhdHRycylcbn1cblxuVG9wQmxvY2tlZC5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICBub3JtYWxpemVDb21wYW55TmFtZSxcbiAgICB7XG5cbiAgICAgICAgbW9kZWxOYW1lOiAndG9wQmxvY2tlZCcsXG5cbiAgICAgICAgZ2V0VG9wQmxvY2tlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKCdnZXRUb3BCbG9ja2VkQnlQYWdlcycsIHRoaXMubnVtQ29tcGFuaWVzKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhLnRvdGFsUGFnZXMgfHwgZGF0YS50b3RhbFBhZ2VzIDwgMzApIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGF0YS50b3BCbG9ja2VkIHx8IGRhdGEudG9wQmxvY2tlZC5sZW5ndGggPCAxKSByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBhbnlMaXN0ID0gZGF0YS50b3BCbG9ja2VkXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBhbnlMaXN0TWFwID0gdGhpcy5jb21wYW55TGlzdC5tYXAoKGNvbXBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wYW55Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBjb21wYW55LmRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkTmFtZTogdGhpcy5ub3JtYWxpemVDb21wYW55TmFtZShjb21wYW55Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50OiBjb21wYW55LnBlcmNlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGMgZ3JhcGggYmFycyB1c2luZyBwaXhlbHMgaW5zdGVhZCBvZiAlIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgbWFyZ2lucyBlYXNpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWF4IHdpZHRoOiAxNDVweFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweDogTWF0aC5mbG9vcihjb21wYW55LnBlcmNlbnQgLyAxMDAgKiAxNDUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnBjdFBhZ2VzV2l0aFRyYWNrZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wY3RQYWdlc1dpdGhUcmFja2VycyA9IGRhdGEucGN0UGFnZXNXaXRoVHJhY2tlcnNcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmxhc3RTdGF0c1Jlc2V0RGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RTdGF0c1Jlc2V0RGF0ZSA9IGRhdGEubGFzdFN0YXRzUmVzZXREYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbiAocmVzZXREYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBhbnlMaXN0ID0gW11cbiAgICAgICAgICAgIHRoaXMuY29tcGFueUxpc3RNYXAgPSBbXVxuICAgICAgICAgICAgdGhpcy5wY3RQYWdlc1dpdGhUcmFja2VycyA9IG51bGxcbiAgICAgICAgICAgIHRoaXMubGFzdFN0YXRzUmVzZXREYXRlID0gcmVzZXREYXRlXG4gICAgICAgIH1cbiAgICB9XG4pXG5cbm1vZHVsZS5leHBvcnRzID0gVG9wQmxvY2tlZFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0QnJvd3NlckNsYXNzT25Cb2R5VGFnOiByZXF1aXJlKCcuL3NldC1icm93c2VyLWNsYXNzLmVzNi5qcycpLFxuICAgIHBhcnNlUXVlcnlTdHJpbmc6IHJlcXVpcmUoJy4vcGFyc2UtcXVlcnktc3RyaW5nLmVzNi5qcycpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwYXJzZVF1ZXJ5U3RyaW5nOiAocXMpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndHJpZWQgdG8gcGFyc2UgYSBub24tc3RyaW5nIHF1ZXJ5IHN0cmluZycpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJzZWQgPSB7fVxuXG4gICAgICAgIGlmIChxc1swXSA9PT0gJz8nKSB7XG4gICAgICAgICAgICBxcyA9IHFzLnN1YnN0cigxKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHMgPSBxcy5zcGxpdCgnJicpXG5cbiAgICAgICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2tleSwgdmFsXSA9IHBhcnQuc3BsaXQoJz0nKVxuXG4gICAgICAgICAgICBpZiAoa2V5ICYmIHZhbCkge1xuICAgICAgICAgICAgICAgIHBhcnNlZFtrZXldID0gdmFsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIHBhcnNlZFxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldEJyb3dzZXJDbGFzc09uQm9keVRhZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cuY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBtZXNzYWdlVHlwZTogJ2dldEJyb3dzZXInIH0sIChicm93c2VyTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKFsnZWRnJywgJ2VkZ2UnLCAnYnJhdmUnXS5pbmNsdWRlcyhicm93c2VyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBicm93c2VyTmFtZSA9ICdjaHJvbWUnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBicm93c2VyQ2xhc3MgPSAnaXMtYnJvd3Nlci0tJyArIGJyb3dzZXJOYW1lXG4gICAgICAgICAgICB3aW5kb3cuJCgnaHRtbCcpLmFkZENsYXNzKGJyb3dzZXJDbGFzcylcbiAgICAgICAgICAgIHdpbmRvdy4kKCdib2R5JykuYWRkQ2xhc3MoYnJvd3NlckNsYXNzKVxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsImNvbnN0IFBhcmVudCA9IHdpbmRvdy5EREcuYmFzZS5QYWdlXG5jb25zdCBtaXhpbnMgPSByZXF1aXJlKCcuL21peGlucy9pbmRleC5lczYuanMnKVxuY29uc3QgSGFtYnVyZ2VyTWVudVZpZXcgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2hhbWJ1cmdlci1tZW51LmVzNi5qcycpXG5jb25zdCBIYW1idXJnZXJNZW51TW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9oYW1idXJnZXItbWVudS5lczYuanMnKVxuY29uc3QgaGFtYnVyZ2VyTWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi90ZW1wbGF0ZXMvaGFtYnVyZ2VyLW1lbnUuZXM2LmpzJylcbmNvbnN0IFRvcEJsb2NrZWRWaWV3ID0gcmVxdWlyZSgnLi8uLi92aWV3cy90b3AtYmxvY2tlZC10cnVuY2F0ZWQuZXM2LmpzJylcbmNvbnN0IFRvcEJsb2NrZWRNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL3RvcC1ibG9ja2VkLmVzNi5qcycpXG5jb25zdCB0b3BCbG9ja2VkVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL3RlbXBsYXRlcy90b3AtYmxvY2tlZC10cnVuY2F0ZWQuZXM2LmpzJylcbmNvbnN0IFNpdGVWaWV3ID0gcmVxdWlyZSgnLi8uLi92aWV3cy9zaXRlLmVzNi5qcycpXG5jb25zdCBTaXRlTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9zaXRlLmVzNi5qcycpXG5jb25zdCBzaXRlVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL3RlbXBsYXRlcy9zaXRlLmVzNi5qcycpXG5jb25zdCBTZWFyY2hWaWV3ID0gcmVxdWlyZSgnLi8uLi92aWV3cy9zZWFyY2guZXM2LmpzJylcbmNvbnN0IFNlYXJjaE1vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvc2VhcmNoLmVzNi5qcycpXG5jb25zdCBzZWFyY2hUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vLi4vdGVtcGxhdGVzL3NlYXJjaC5lczYuanMnKVxuY29uc3QgQXV0b2NvbXBsZXRlVmlldyA9IHJlcXVpcmUoJy4vLi4vdmlld3MvYXV0b2NvbXBsZXRlLmVzNi5qcycpXG5jb25zdCBBdXRvY29tcGxldGVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2F1dG9jb21wbGV0ZS5lczYuanMnKVxuY29uc3QgYXV0b2NvbXBsZXRlVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL3RlbXBsYXRlcy9hdXRvY29tcGxldGUuZXM2LmpzJylcbmNvbnN0IEJhY2tncm91bmRNZXNzYWdlTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9iYWNrZ3JvdW5kLW1lc3NhZ2UuZXM2LmpzJylcbmNvbnN0IEVtYWlsQWxpYXNWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvZW1haWwtYWxpYXMuZXM2LmpzJylcbmNvbnN0IEVtYWlsQWxpYXNNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9lbWFpbC1hbGlhcy5lczYuanMnKVxuY29uc3QgRW1haWxBbGlhc1RlbXBsYXRlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL2VtYWlsLWFsaWFzLmVzNi5qcycpXG5cbmZ1bmN0aW9uIFRyYWNrZXJzIChvcHMpIHtcbiAgICB0aGlzLiRwYXJlbnQgPSB3aW5kb3cuJCgnI3BvcHVwLWNvbnRhaW5lcicpXG4gICAgUGFyZW50LmNhbGwodGhpcywgb3BzKVxufVxuXG5UcmFja2Vycy5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICBtaXhpbnMuc2V0QnJvd3NlckNsYXNzT25Cb2R5VGFnLFxuICAgIHtcblxuICAgICAgICBwYWdlTmFtZTogJ3BvcHVwJyxcblxuICAgICAgICByZWFkeTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgUGFyZW50LnByb3RvdHlwZS5yZWFkeS5jYWxsKHRoaXMpXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgPSBuZXcgQmFja2dyb3VuZE1lc3NhZ2VNb2RlbCgpXG4gICAgICAgICAgICB0aGlzLnNldEJyb3dzZXJDbGFzc09uQm9keVRhZygpXG5cbiAgICAgICAgICAgIHRoaXMudmlld3Muc2VhcmNoID0gbmV3IFNlYXJjaFZpZXcoe1xuICAgICAgICAgICAgICAgIHBhZ2VWaWV3OiB0aGlzLFxuICAgICAgICAgICAgICAgIG1vZGVsOiBuZXcgU2VhcmNoTW9kZWwoeyBzZWFyY2hUZXh0OiAnJyB9KSxcbiAgICAgICAgICAgICAgICBhcHBlbmRUbzogd2luZG93LiQoJyNzZWFyY2gtZm9ybS1jb250YWluZXInKSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogc2VhcmNoVGVtcGxhdGVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRoaXMudmlld3MuaGFtYnVyZ2VyTWVudSA9IG5ldyBIYW1idXJnZXJNZW51Vmlldyh7XG4gICAgICAgICAgICAgICAgcGFnZVZpZXc6IHRoaXMsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG5ldyBIYW1idXJnZXJNZW51TW9kZWwoKSxcbiAgICAgICAgICAgICAgICBhcHBlbmRUbzogd2luZG93LiQoJyNoYW1idXJnZXItbWVudS1jb250YWluZXInKSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogaGFtYnVyZ2VyTWVudVRlbXBsYXRlXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB0aGlzLnZpZXdzLnNpdGUgPSBuZXcgU2l0ZVZpZXcoe1xuICAgICAgICAgICAgICAgIHBhZ2VWaWV3OiB0aGlzLFxuICAgICAgICAgICAgICAgIG1vZGVsOiBuZXcgU2l0ZU1vZGVsKCksXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IHdpbmRvdy4kKCcjc2l0ZS1pbmZvLWNvbnRhaW5lcicpLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBzaXRlVGVtcGxhdGVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRoaXMudmlld3MudG9wYmxvY2tlZCA9IG5ldyBUb3BCbG9ja2VkVmlldyh7XG4gICAgICAgICAgICAgICAgcGFnZVZpZXc6IHRoaXMsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG5ldyBUb3BCbG9ja2VkTW9kZWwoeyBudW1Db21wYW5pZXM6IDMgfSksXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IHdpbmRvdy4kKCcjdG9wLWJsb2NrZWQtY29udGFpbmVyJyksXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRvcEJsb2NrZWRUZW1wbGF0ZVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgdGhpcy52aWV3cy5lbWFpbEFsaWFzID0gbmV3IEVtYWlsQWxpYXNWaWV3KHtcbiAgICAgICAgICAgICAgICBwYWdlVmlldzogdGhpcyxcbiAgICAgICAgICAgICAgICBtb2RlbDogbmV3IEVtYWlsQWxpYXNNb2RlbCgpLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiB3aW5kb3cuJCgnI2VtYWlsLWFsaWFzLWNvbnRhaW5lcicpLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBFbWFpbEFsaWFzVGVtcGxhdGVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIC8vIFRPRE86IGhvb2sgdXAgbW9kZWwgcXVlcnkgdG8gYWN0dWFsIGRkZyBhYyBlbmRwb2ludC5cbiAgICAgICAgICAgIC8vIEZvciBub3cgdGhpcyBpcyBqdXN0IGhlcmUgdG8gZGVtb25zdHJhdGUgaG93IHRvXG4gICAgICAgICAgICAvLyBsaXN0ZW4gdG8gYW5vdGhlciBjb21wb25lbnQgdmlhIG1vZGVsLnNldCgpICtcbiAgICAgICAgICAgIC8vIHN0b3JlLnN1YnNjcmliZSgpXG4gICAgICAgICAgICB0aGlzLnZpZXdzLmF1dG9jb21wbGV0ZSA9IG5ldyBBdXRvY29tcGxldGVWaWV3KHtcbiAgICAgICAgICAgICAgICBwYWdlVmlldzogdGhpcyxcbiAgICAgICAgICAgICAgICBtb2RlbDogbmV3IEF1dG9jb21wbGV0ZU1vZGVsKHsgc3VnZ2VzdGlvbnM6IFtdIH0pLFxuICAgICAgICAgICAgICAgIC8vIGFwcGVuZFRvOiB0aGlzLnZpZXdzLnNlYXJjaC4kZWwsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IG51bGwsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IGF1dG9jb21wbGV0ZVRlbXBsYXRlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuKVxuXG4vLyBraWNrb2ZmIVxud2luZG93LkRERyA9IHdpbmRvdy5EREcgfHwge31cbndpbmRvdy5EREcucGFnZSA9IG5ldyBUcmFja2VycygpXG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPL1JFTU9WRTogcmVtb3ZlIG1hcmdpblRvcCBzdHlsZSB0YWcgb25jZSB0aGlzIGlzIGFjdHVhbGx5IGhvb2tlZCB1cFxuICAgIC8vIHRoaXMgaXMganVzdCB0byBkZW1vIG1vZGVsIHN0b3JlIGZvciBub3chXG4gICAgLy8gIC0+IHRoaXMgaXMgZ3Jvc3MsIGRvbid0IGRvIHRoaXM6XG4gICAgY29uc3QgbWFyZ2luVG9wID0gdGhpcy5tb2RlbC5zdWdnZXN0aW9ucyAmJiB0aGlzLm1vZGVsLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IDAgPyAnbWFyZ2luLXRvcDogNTBweDsnIDogJydcblxuICAgIHJldHVybiBiZWxgPHVsIGNsYXNzPVwianMtYXV0b2NvbXBsZXRlXCIgc3R5bGU9XCIke21hcmdpblRvcH1cIj5cbiAgICAgICAgJHt0aGlzLm1vZGVsLnN1Z2dlc3Rpb25zLm1hcCgoc3VnZ2VzdGlvbikgPT4gYmVsYFxuICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIj4ke3N1Z2dlc3Rpb259PC9hPjwvbGk+YFxuICAgICl9XG4gICAgPC91bD5gXG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuY29uc3QgY2F0ZWdvcmllcyA9IFtcbiAgICB7IGNhdGVnb3J5OiAnVmlkZW8gb3IgaW1hZ2VzIGRpZG5cXCd0IGxvYWQnLCB2YWx1ZTogJ2ltYWdlcycgfSxcbiAgICB7IGNhdGVnb3J5OiAnQ29udGVudCBpcyBtaXNzaW5nJywgdmFsdWU6ICdjb250ZW50JyB9LFxuICAgIHsgY2F0ZWdvcnk6ICdMaW5rcyBvciBidXR0b25zIGRvblxcJ3Qgd29yaycsIHZhbHVlOiAnbGlua3MnIH0sXG4gICAgeyBjYXRlZ29yeTogJ0NhblxcJ3Qgc2lnbiBpbicsIHZhbHVlOiAnbG9naW4nIH0sXG4gICAgeyBjYXRlZ29yeTogJ1NpdGUgYXNrZWQgbWUgdG8gZGlzYWJsZSB0aGUgZXh0ZW5zaW9uJywgdmFsdWU6ICdwYXl3YWxsJyB9XG5dXG5cbmZ1bmN0aW9uIHNodWZmbGUgKGFycikge1xuICAgIGxldCBsZW4gPSBhcnIubGVuZ3RoXG4gICAgbGV0IHRlbXBcbiAgICBsZXQgaW5kZXhcbiAgICB3aGlsZSAobGVuID4gMCkge1xuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbilcbiAgICAgICAgbGVuLS1cbiAgICAgICAgdGVtcCA9IGFycltsZW5dXG4gICAgICAgIGFycltsZW5dID0gYXJyW2luZGV4XVxuICAgICAgICBhcnJbaW5kZXhdID0gdGVtcFxuICAgIH1cbiAgICByZXR1cm4gYXJyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBiZWxgPGRpdiBjbGFzcz1cImJyZWFrYWdlLWZvcm0ganMtYnJlYWthZ2UtZm9ybVwiPlxuICAgIDxkaXYgY2xhc3M9XCJicmVha2FnZS1mb3JtX19jb250ZW50XCI+XG4gICAgICAgIDxuYXYgY2xhc3M9XCJicmVha2FnZS1mb3JtX19jbG9zZS1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImljb24gaWNvbl9fY2xvc2UganMtYnJlYWthZ2UtZm9ybS1jbG9zZVwiIHJvbGU9XCJidXR0b25cIiBhcmlhLWxhYmVsPVwiRGlzbWlzcyBmb3JtXCI+PC9hPlxuICAgICAgICA8L25hdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm1fX2ljb24tLXdyYXBwZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtX19pY29uXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYnJlYWthZ2UtZm9ybV9fZWxlbWVudCBqcy1icmVha2FnZS1mb3JtLWVsZW1lbnRcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzcz1cImJyZWFrYWdlLWZvcm1fX3RpdGxlXCI+U29tZXRoaW5nIGJyb2tlbj88L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJyZWFrYWdlLWZvcm1fX2V4cGxhbmF0aW9uXCI+U3VibWl0dGluZyBhbiBhbm9ueW1vdXMgYnJva2VuIHNpdGUgcmVwb3J0IGhlbHBzIHVzIGRlYnVnIHRoZXNlIGlzc3VlcyBhbmQgaW1wcm92ZSB0aGUgZXh0ZW5zaW9uLjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm1fX3NlbGVjdCBicmVha2FnZS1mb3JtX19pbnB1dC0tZHJvcGRvd25cIj5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwianMtYnJlYWthZ2UtZm9ybS1kcm9wZG93blwiPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSd1bnNwZWNpZmllZCcgZGlzYWJsZWQgc2VsZWN0ZWQ+U2VsZWN0IGEgY2F0ZWdvcnkgKG9wdGlvbmFsKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAke3NodWZmbGUoY2F0ZWdvcmllcykubWFwKGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBiZWxgPG9wdGlvbiB2YWx1ZT0ke2l0ZW0udmFsdWV9PiR7aXRlbS5jYXRlZ29yeX08L29wdGlvbj5gIH0pfVxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdvdGhlcic+U29tZXRoaW5nIGVsc2U8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGJ0biBjbGFzcz1cImZvcm1fX3N1Ym1pdCBqcy1icmVha2FnZS1mb3JtLXN1Ym1pdFwiIHJvbGU9XCJidXR0b25cIj5TZW5kIHJlcG9ydDwvYnRuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJyZWFrYWdlLWZvcm1fX2Zvb3RlclwiPlJlcG9ydHMgc2VudCB0byBEdWNrRHVja0dvIGFyZSAxMDAlIGFub255bW91cyBhbmQgb25seSBpbmNsdWRlIHlvdXIgc2VsZWN0aW9uIGFib3ZlLCB0aGUgVVJMLCBhbmQgYSBsaXN0IG9mIHRyYWNrZXJzIHdlIGZvdW5kIG9uIHRoZSBzaXRlLjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImJyZWFrYWdlLWZvcm1fX21lc3NhZ2UganMtYnJlYWthZ2UtZm9ybS1tZXNzYWdlIGlzLXRyYW5zcGFyZW50XCI+XG4gICAgICAgICAgICA8aDIgY2xhc3M9XCJicmVha2FnZS1mb3JtX19zdWNjZXNzLS10aXRsZVwiPlRoYW5rIHlvdSE8L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJyZWFrYWdlLWZvcm1fX3N1Y2Nlc3MtLW1lc3NhZ2VcIj5Zb3VyIHJlcG9ydCB3aWxsIGhlbHAgaW1wcm92ZSB0aGUgZXh0ZW5zaW9uIGFuZCBtYWtlIHRoZSBleHBlcmllbmNlIGJldHRlciBmb3Igb3RoZXIgcGVvcGxlLjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmBcbn1cbiIsImNvbnN0IGJlbCA9IHJlcXVpcmUoJ2JlbCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLm1vZGVsLnVzZXJEYXRhICYmIHRoaXMubW9kZWwudXNlckRhdGEubmV4dEFsaWFzKSB7XG4gICAgICAgIHJldHVybiBiZWxgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianMtZW1haWwtYWxpYXMgZW1haWwtYWxpYXMtYmxvY2sgcGFkZGVkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJlbWFpbC1hbGlhc19faWNvblwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwibGluay1zZWNvbmRhcnkgYm9sZFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtbGluZS1hZnRlci1pY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBDcmVhdGUgbmV3IER1Y2sgQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJqcy1hbGlhcy1jb3BpZWQgYWxpYXMtY29waWVkLWxhYmVsXCI+Q29waWVkIHRvIGNsaXBib2FyZDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvZGl2PmBcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcbmNvbnN0IHJlYXNvbnMgPSByZXF1aXJlKCcuL3NoYXJlZC9ncmFkZS1zY29yZWNhcmQtcmVhc29ucy5lczYuanMnKVxuY29uc3QgZ3JhZGVzID0gcmVxdWlyZSgnLi9zaGFyZWQvZ3JhZGUtc2NvcmVjYXJkLWdyYWRlcy5lczYuanMnKVxuY29uc3QgcmF0aW5nSGVybyA9IHJlcXVpcmUoJy4vc2hhcmVkL3JhdGluZy1oZXJvLmVzNi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBiZWxgPHNlY3Rpb24gY2xhc3M9XCJzbGlkaW5nLXN1YnZpZXcgZ3JhZGUtc2NvcmVjYXJkIHNsaWRpbmctc3Vidmlldy0taGFzLWZpeGVkLWhlYWRlclwiPlxuICAgIDxkaXYgY2xhc3M9XCJzaXRlLWluZm8gc2l0ZS1pbmZvLS1mdWxsLWhlaWdodCBjYXJkXCI+XG4gICAgICAgICR7cmF0aW5nSGVybyh0aGlzLm1vZGVsLCB7IHNob3dDbG9zZTogdHJ1ZSB9KX1cbiAgICAgICAgJHtyZWFzb25zKHRoaXMubW9kZWwpfVxuICAgICAgICAke2dyYWRlcyh0aGlzLm1vZGVsKX1cbiAgICA8L2Rpdj5cbjwvc2VjdGlvbj5gXG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYmVsYDxuYXYgY2xhc3M9XCJoYW1idXJnZXItbWVudSBqcy1oYW1idXJnZXItbWVudSBpcy1oaWRkZW5cIj5cbiAgICA8ZGl2IGNsYXNzPVwiaGFtYnVyZ2VyLW1lbnVfX2JnXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImhhbWJ1cmdlci1tZW51X19jb250ZW50IGNhcmQgcGFkZGVkXCI+XG4gICAgICAgIDxoMiBjbGFzcz1cIm1lbnUtdGl0bGUgYm9yZGVyLS1ib3R0b20gaGFtYnVyZ2VyLW1lbnVfX2NvbnRlbnRfX21vcmUtb3B0aW9uc1wiPlxuICAgICAgICAgICAgTW9yZSBvcHRpb25zXG4gICAgICAgIDwvaDI+XG4gICAgICAgIDxuYXYgY2xhc3M9XCJwdWxsLXJpZ2h0IGhhbWJ1cmdlci1tZW51X19jbG9zZS1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImljb24gaWNvbl9fY2xvc2UganMtaGFtYnVyZ2VyLW1lbnUtY2xvc2VcIiByb2xlPVwiYnV0dG9uXCIgYXJpYS1sYWJlbD1cIkNsb3NlIG9wdGlvbnNcIj48L2E+XG4gICAgICAgIDwvbmF2PlxuICAgICAgICA8dWwgY2xhc3M9XCJoYW1idXJnZXItbWVudV9fbGlua3MgcGFkZGVkIGRlZmF1bHQtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cIm1lbnUtdGl0bGUganMtaGFtYnVyZ2VyLW1lbnUtb3B0aW9ucy1saW5rXCI+XG4gICAgICAgICAgICAgICAgICAgIFNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPk1hbmFnZSBVbnByb3RlY3RlZCBTaXRlcyBhbmQgb3RoZXIgb3B0aW9ucy48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJtZW51LXRpdGxlIGpzLWhhbWJ1cmdlci1tZW51LWZlZWRiYWNrLWxpbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgU2hhcmUgZmVlZGJhY2tcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+R290IGlzc3VlcyBvciBzdWdnZXN0aW9ucz8gTGV0IHVzIGtub3chPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwibWVudS10aXRsZSBqcy1oYW1idXJnZXItbWVudS1icm9rZW4tc2l0ZS1saW5rXCI+XG4gICAgICAgICAgICAgICAgICAgIFJlcG9ydCBicm9rZW4gc2l0ZVxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5JZiBhIHNpdGUncyBub3Qgd29ya2luZywgcGxlYXNlIHRlbGwgdXMuPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJpcy1oaWRkZW5cIiBpZD1cImRlYnVnZ2VyLXBhbmVsXCI+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwibWVudS10aXRsZSBqcy1oYW1idXJnZXItbWVudS1kZWJ1Z2dlci1wYW5lbC1saW5rXCI+XG4gICAgICAgICAgICAgICAgICAgIFByb3RlY3Rpb24gZGVidWdnZXIgcGFuZWxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+RGVidWcgcHJpdmFjeSBwcm90ZWN0aW9ucyBvbiBhIHBhZ2UuPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgPC9kaXY+XG48L25hdj5gXG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuY29uc3QgaGVybyA9IHJlcXVpcmUoJy4vc2hhcmVkL2hlcm8uZXM2LmpzJylcbmNvbnN0IHN0YXR1c0xpc3QgPSByZXF1aXJlKCcuL3NoYXJlZC9zdGF0dXMtbGlzdC5lczYuanMnKVxuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vLi4vLi4vZGF0YS9jb25zdGFudHMnKVxuY29uc3QgbGluayA9IHJlcXVpcmUoJy4vc2hhcmVkL2xpbmsuZXM2LmpzJylcblxuZnVuY3Rpb24gdXBwZXJDYXNlRmlyc3QgKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZG9tYWluID0gdGhpcy5tb2RlbCAmJiB0aGlzLm1vZGVsLmRvbWFpblxuICAgIGNvbnN0IHRvc2RyID0gdGhpcy5tb2RlbCAmJiB0aGlzLm1vZGVsLnRvc2RyXG5cbiAgICBjb25zdCB0b3Nkck1zZyA9ICh0b3NkciAmJiB0b3Nkci5tZXNzYWdlKSB8fFxuICAgIGNvbnN0YW50cy50b3Nkck1lc3NhZ2VzLnVua25vd25cbiAgICBjb25zdCB0b3NkclN0YXR1cyA9IHRvc2RyTXNnLnRvTG93ZXJDYXNlKClcblxuICAgIHJldHVybiBiZWxgPHNlY3Rpb24gY2xhc3M9XCJzbGlkaW5nLXN1YnZpZXcgc2xpZGluZy1zdWJ2aWV3LS1oYXMtZml4ZWQtaGVhZGVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInByaXZhY3ktcHJhY3RpY2VzIHNpdGUtaW5mbyBzaXRlLWluZm8tLWZ1bGwtaGVpZ2h0IGNhcmRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImpzLXByaXZhY3ktcHJhY3RpY2VzLWhlcm9cIj5cbiAgICAgICAgICAgICR7aGVybyh7XG4gICAgICAgIHN0YXR1czogdG9zZHJTdGF0dXMsXG4gICAgICAgIHRpdGxlOiBkb21haW4sXG4gICAgICAgIHN1YnRpdGxlOiBgJHt0b3Nkck1zZ30gUHJpdmFjeSBQcmFjdGljZXNgLFxuICAgICAgICBzaG93Q2xvc2U6IHRydWVcbiAgICB9KX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJwcml2YWN5LXByYWN0aWNlc19fZXhwbGFpbmVyIHBhZGRlZCBib3JkZXItLWJvdHRvbS0taW5uZXJcbiAgICAgICAgICAgIHRleHQtLWNlbnRlclwiPlxuICAgICAgICAgICAgUHJpdmFjeSBwcmFjdGljZXMgaW5kaWNhdGUgaG93IG11Y2ggdGhlIHBlcnNvbmFsIGluZm9ybWF0aW9uXG4gICAgICAgICAgICB0aGF0IHlvdSBzaGFyZSB3aXRoIGEgd2Vic2l0ZSBpcyBwcm90ZWN0ZWQuXG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicHJpdmFjeS1wcmFjdGljZXNfX2RldGFpbHMgcGFkZGVkXG4gICAgICAgICAgICBqcy1wcml2YWN5LXByYWN0aWNlcy1kZXRhaWxzXCI+XG4gICAgICAgICAgICAke3Rvc2RyICYmIHRvc2RyLnJlYXNvbnMgPyByZW5kZXJEZXRhaWxzKHRvc2RyLnJlYXNvbnMpIDogcmVuZGVyTm9EZXRhaWxzKCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicHJpdmFjeS1wcmFjdGljZXNfX2F0dHJpYiBwYWRkZWQgdGV4dC0tY2VudGVyIGJvcmRlci0tdG9wLS1pbm5lclwiPlxuICAgICAgICAgICAgUHJpdmFjeSBQcmFjdGljZXMgZnJvbSAke2xpbmsoJ2h0dHBzOi8vdG9zZHIub3JnLycsIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnYm9sZCcsXG4gICAgICAgIHRhcmdldDogJ19ibGFuaycsXG4gICAgICAgIHRleHQ6ICdUb1M7RFInLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICdUZXJtcyBvZiBTZXJ2aWNlOyBEaWRuXFwndCBSZWFkJ1xuICAgICAgICB9XG4gICAgfSl9LlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbjwvc2VjdGlvbj5gXG59XG5cbmZ1bmN0aW9uIHJlbmRlckRldGFpbHMgKHJlYXNvbnMpIHtcbiAgICBsZXQgZ29vZCA9IHJlYXNvbnMuZ29vZCB8fCBbXVxuICAgIGxldCBiYWQgPSByZWFzb25zLmJhZCB8fCBbXVxuXG4gICAgaWYgKCFnb29kLmxlbmd0aCAmJiAhYmFkLmxlbmd0aCkgcmV0dXJuIHJlbmRlck5vRGV0YWlscygpXG5cbiAgICAvLyBjb252ZXJ0IGFycmF5cyB0byB3b3JrIGZvciB0aGUgc3RhdHVzTGlzdCB0ZW1wbGF0ZSxcbiAgICAvLyB3aGljaCB1c2Ugb2JqZWN0c1xuXG4gICAgZ29vZCA9IGdvb2QubWFwKGl0ZW0gPT4gKHtcbiAgICAgICAgbXNnOiB1cHBlckNhc2VGaXJzdChpdGVtKSxcbiAgICAgICAgbW9kaWZpZXI6ICdnb29kJ1xuICAgIH0pKVxuXG4gICAgYmFkID0gYmFkLm1hcChpdGVtID0+ICh7XG4gICAgICAgIG1zZzogdXBwZXJDYXNlRmlyc3QoaXRlbSksXG4gICAgICAgIG1vZGlmaWVyOiAnYmFkJ1xuICAgIH0pKVxuXG4gICAgLy8gbGlzdCBnb29kIGZpcnN0LCB0aGVuIGJhZFxuICAgIHJldHVybiBzdGF0dXNMaXN0KGdvb2QuY29uY2F0KGJhZCkpXG59XG5cbmZ1bmN0aW9uIHJlbmRlck5vRGV0YWlscyAoKSB7XG4gICAgcmV0dXJuIGJlbGA8ZGl2IGNsYXNzPVwidGV4dC0tY2VudGVyXCI+XG4gICAgPGgxIGNsYXNzPVwicHJpdmFjeS1wcmFjdGljZXNfX2RldGFpbHNfX3RpdGxlXCI+XG4gICAgICAgIE5vIHByaXZhY3kgcHJhY3RpY2VzIGZvdW5kXG4gICAgPC9oMT5cbiAgICA8ZGl2IGNsYXNzPVwicHJpdmFjeS1wcmFjdGljZXNfX2RldGFpbHNfX21zZ1wiPlxuICAgICAgICBUaGUgcHJpdmFjeSBwcmFjdGljZXMgb2YgdGhpcyB3ZWJzaXRlIGhhdmUgbm90IGJlZW4gcmV2aWV3ZWQuXG4gICAgPC9kaXY+XG48L2Rpdj5gXG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuY29uc3QgaGFtYnVyZ2VyQnV0dG9uID0gcmVxdWlyZSgnLi9zaGFyZWQvaGFtYnVyZ2VyLWJ1dHRvbi5lczYuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYmVsYFxuICAgIDxmb3JtIGNsYXNzPVwic2xpZGluZy1zdWJ2aWV3X19oZWFkZXIgc2VhcmNoLWZvcm0ganMtc2VhcmNoLWZvcm1cIiBuYW1lPVwieFwiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBwbGFjZWhvbGRlcj1cIlNlYXJjaCBEdWNrRHVja0dvXCJcbiAgICAgICAgICAgIG5hbWU9XCJxXCIgY2xhc3M9XCJzZWFyY2gtZm9ybV9faW5wdXQganMtc2VhcmNoLWlucHV0XCJcbiAgICAgICAgICAgIHZhbHVlPVwiJHt0aGlzLm1vZGVsLnNlYXJjaFRleHR9XCIgLz5cbiAgICAgICAgPGlucHV0IGNsYXNzPVwic2VhcmNoLWZvcm1fX2dvIGpzLXNlYXJjaC1nb1wiIHZhbHVlPVwiXCIgdHlwZT1cInN1Ym1pdFwiIGFyaWEtbGFiZWw9XCJTZWFyY2hcIiAvPlxuICAgICAgICAke2hhbWJ1cmdlckJ1dHRvbignanMtc2VhcmNoLWhhbWJ1cmdlci1idXR0b24nKX1cbiAgICA8L2Zvcm0+YFxufVxuIiwiY29uc3Qgc3RhdHVzTGlzdCA9IHJlcXVpcmUoJy4vc3RhdHVzLWxpc3QuZXM2LmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2l0ZSkge1xuICAgIGNvbnN0IGdyYWRlcyA9IGdldEdyYWRlcyhzaXRlLnNpdGVSYXRpbmcsIHNpdGUuaXNBbGxvd2xpc3RlZClcblxuICAgIGlmICghZ3JhZGVzIHx8ICFncmFkZXMubGVuZ3RoKSByZXR1cm5cblxuICAgIHJldHVybiBzdGF0dXNMaXN0KGdyYWRlcywgJ3N0YXR1cy1saXN0LS1yaWdodCBwYWRkZWQganMtZ3JhZGUtc2NvcmVjYXJkLWdyYWRlcycpXG59XG5cbmZ1bmN0aW9uIGdldEdyYWRlcyAocmF0aW5nLCBpc0FsbG93bGlzdGVkKSB7XG4gICAgaWYgKCFyYXRpbmcgfHwgIXJhdGluZy5iZWZvcmUgfHwgIXJhdGluZy5hZnRlcikgcmV0dXJuXG5cbiAgICAvLyB0cmFuc2Zvcm0gc2l0ZSByYXRpbmdzIGludG8gZ3JhZGVzXG4gICAgLy8gdGhhdCB0aGUgdGVtcGxhdGUgY2FuIGRpc3BsYXkgbW9yZSBlYXNpbHlcbiAgICBjb25zdCBiZWZvcmUgPSByYXRpbmcuY3NzQmVmb3JlXG4gICAgY29uc3QgYWZ0ZXIgPSByYXRpbmcuY3NzQWZ0ZXJcblxuICAgIGNvbnN0IGdyYWRlcyA9IFtdXG5cbiAgICBncmFkZXMucHVzaCh7XG4gICAgICAgIG1zZzogJ1ByaXZhY3kgR3JhZGUnLFxuICAgICAgICBtb2RpZmllcjogYmVmb3JlLnRvTG93ZXJDYXNlKClcbiAgICB9KVxuXG4gICAgaWYgKGJlZm9yZSAhPT0gYWZ0ZXIgJiYgIWlzQWxsb3dsaXN0ZWQpIHtcbiAgICAgICAgZ3JhZGVzLnB1c2goe1xuICAgICAgICAgICAgbXNnOiAnRW5oYW5jZWQgR3JhZGUnLFxuICAgICAgICAgICAgbW9kaWZpZXI6IGFmdGVyLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICBoaWdobGlnaHQ6IHRydWVcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gZ3JhZGVzXG59XG4iLCJjb25zdCBzdGF0dXNMaXN0ID0gcmVxdWlyZSgnLi9zdGF0dXMtbGlzdC5lczYuanMnKVxuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZGF0YS9jb25zdGFudHMnKVxuY29uc3QgdHJhY2tlck5ldHdvcmtzVGV4dCA9IHJlcXVpcmUoJy4vdHJhY2tlci1uZXR3b3Jrcy10ZXh0LmVzNi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNpdGUpIHtcbiAgICBjb25zdCByZWFzb25zID0gZ2V0UmVhc29ucyhzaXRlKVxuXG4gICAgaWYgKCFyZWFzb25zIHx8ICFyZWFzb25zLmxlbmd0aCkgcmV0dXJuXG5cbiAgICByZXR1cm4gc3RhdHVzTGlzdChyZWFzb25zLCAnc3RhdHVzLWxpc3QtLXJpZ2h0IHBhZGRlZCBib3JkZXItLWJvdHRvbS0taW5uZXIganMtZ3JhZGUtc2NvcmVjYXJkLXJlYXNvbnMnKVxufVxuXG5mdW5jdGlvbiBnZXRSZWFzb25zIChzaXRlKSB7XG4gICAgY29uc3QgcmVhc29ucyA9IFtdXG5cbiAgICAvLyBncmFiIGFsbCB0aGUgZGF0YSBmcm9tIHRoZSBzaXRlIHRvIGNyZWF0ZVxuICAgIC8vIGEgbGlzdCBvZiByZWFzb25zIGJlaGluZCB0aGUgZ3JhZGVcblxuICAgIC8vIGVuY3J5cHRpb24gc3RhdHVzXG4gICAgY29uc3QgaHR0cHNTdGF0ZSA9IHNpdGUuaHR0cHNTdGF0ZVxuICAgIGlmIChodHRwc1N0YXRlKSB7XG4gICAgICAgIGNvbnN0IG1vZGlmaWVyID0gaHR0cHNTdGF0ZSA9PT0gJ25vbmUnID8gJ2JhZCcgOiAnZ29vZCdcblxuICAgICAgICByZWFzb25zLnB1c2goe1xuICAgICAgICAgICAgbW9kaWZpZXIsXG4gICAgICAgICAgICBtc2c6IHNpdGUuaHR0cHNTdGF0dXNUZXh0XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gdHJhY2tpbmcgbmV0d29ya3MgYmxvY2tlZCBvciBmb3VuZCxcbiAgICAvLyBvbmx5IHNob3cgYSBtZXNzYWdlIGlmIHRoZXJlJ3MgYW55XG4gICAgY29uc3QgdHJhY2tlcnNDb3VudCA9IHNpdGUuaXNBbGxvd2xpc3RlZCA/IHNpdGUudHJhY2tlcnNDb3VudCA6IHNpdGUudHJhY2tlcnNCbG9ja2VkQ291bnRcbiAgICBjb25zdCB0cmFja2Vyc0JhZE9yR29vZCA9ICh0cmFja2Vyc0NvdW50ICE9PSAwKSA/ICdiYWQnIDogJ2dvb2QnXG4gICAgcmVhc29ucy5wdXNoKHtcbiAgICAgICAgbW9kaWZpZXI6IHRyYWNrZXJzQmFkT3JHb29kLFxuICAgICAgICBtc2c6IGAke3RyYWNrZXJOZXR3b3Jrc1RleHQoc2l0ZSl9YFxuICAgIH0pXG5cbiAgICAvLyBtYWpvciB0cmFja2luZyBuZXR3b3JrcyxcbiAgICAvLyBvbmx5IHNob3cgYSBtZXNzYWdlIGlmIHRoZXJlIGFyZSBhbnlcbiAgICBjb25zdCBtYWpvclRyYWNrZXJzQmFkT3JHb29kID0gKHNpdGUubWFqb3JUcmFja2VyTmV0d29ya3NDb3VudCAhPT0gMCkgPyAnYmFkJyA6ICdnb29kJ1xuICAgIHJlYXNvbnMucHVzaCh7XG4gICAgICAgIG1vZGlmaWVyOiBtYWpvclRyYWNrZXJzQmFkT3JHb29kLFxuICAgICAgICBtc2c6IGAke3RyYWNrZXJOZXR3b3Jrc1RleHQoc2l0ZSwgdHJ1ZSl9YFxuICAgIH0pXG5cbiAgICAvLyBJcyB0aGUgc2l0ZSBpdHNlbGYgYSBtYWpvciB0cmFja2luZyBuZXR3b3JrP1xuICAgIC8vIG9ubHkgc2hvdyBhIG1lc3NhZ2UgaWYgaXQgaXNcbiAgICBpZiAoc2l0ZS5pc2FNYWpvclRyYWNraW5nTmV0d29yaykge1xuICAgICAgICByZWFzb25zLnB1c2goe1xuICAgICAgICAgICAgbW9kaWZpZXI6ICdiYWQnLFxuICAgICAgICAgICAgbXNnOiAnU2l0ZSBJcyBhIE1ham9yIFRyYWNrZXIgTmV0d29yaydcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBwcml2YWN5IHByYWN0aWNlcyBmcm9tIHRvc2RyXG4gICAgY29uc3QgdW5rbm93blByYWN0aWNlcyA9IGNvbnN0YW50cy50b3Nkck1lc3NhZ2VzLnVua25vd25cbiAgICBjb25zdCBwcml2YWN5TWVzc2FnZSA9IChzaXRlLnRvc2RyICYmIHNpdGUudG9zZHIubWVzc2FnZSkgfHwgdW5rbm93blByYWN0aWNlc1xuICAgIGNvbnN0IG1vZGlmaWVyID0gKHByaXZhY3lNZXNzYWdlID09PSB1bmtub3duUHJhY3RpY2VzKSA/ICdwb29yJyA6IHByaXZhY3lNZXNzYWdlLnRvTG93ZXJDYXNlKClcbiAgICByZWFzb25zLnB1c2goe1xuICAgICAgICBtb2RpZmllcjogbW9kaWZpZXIsXG4gICAgICAgIG1zZzogYCR7cHJpdmFjeU1lc3NhZ2V9IFByaXZhY3kgUHJhY3RpY2VzYFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVhc29uc1xufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2xhc3MpIHtcbiAgICBrbGFzcyA9IGtsYXNzIHx8ICcnXG4gICAgcmV0dXJuIGJlbGA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImhhbWJ1cmdlci1idXR0b24gJHtrbGFzc31cIiBhcmlhLWxhYmVsPVwiTW9yZSBvcHRpb25zXCI+XG4gICAgPHNwYW4+PC9zcGFuPlxuICAgIDxzcGFuPjwvc3Bhbj5cbiAgICA8c3Bhbj48L3NwYW4+XG48L2J1dHRvbj5gXG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHMpIHtcbiAgICBjb25zdCBzbGlkaW5nU3Vidmlld0NsYXNzID0gb3BzLnNob3dDbG9zZSA/ICdqcy1zbGlkaW5nLXN1YnZpZXctY2xvc2UnIDogJydcbiAgICByZXR1cm4gYmVsYDxkaXYgY2xhc3M9XCJoZXJvIHRleHQtLWNlbnRlciAke3NsaWRpbmdTdWJ2aWV3Q2xhc3N9XCI+XG4gICAgPGRpdiBjbGFzcz1cImhlcm9fX2ljb24gaGVyb19faWNvbi0tJHtvcHMuc3RhdHVzfVwiPlxuICAgIDwvZGl2PlxuICAgIDxoMSBjbGFzcz1cImhlcm9fX3RpdGxlXCI+XG4gICAgICAgICR7b3BzLnRpdGxlfVxuICAgIDwvaDE+XG4gICAgPGgyIGNsYXNzPVwiaGVyb19fc3VidGl0bGUgJHtvcHMuc3VidGl0bGUgPT09ICcnID8gJ2lzLWhpZGRlbicgOiAnJ31cIiBhcmlhLWxhYmVsPVwiJHtvcHMuc3VidGl0bGVMYWJlbCA/IG9wcy5zdWJ0aXRsZUxhYmVsIDogb3BzLnN1YnRpdGxlfVwiPlxuICAgICAgICAke29wcy5zdWJ0aXRsZX1cbiAgICA8L2gyPlxuICAgICR7cmVuZGVyT3Blbk9yQ2xvc2VCdXR0b24ob3BzLnNob3dDbG9zZSl9XG48L2Rpdj5gXG59XG5cbmZ1bmN0aW9uIHJlbmRlck9wZW5PckNsb3NlQnV0dG9uIChpc0Nsb3NlQnV0dG9uKSB7XG4gICAgY29uc3Qgb3Blbk9yQ2xvc2UgPSBpc0Nsb3NlQnV0dG9uID8gJ2Nsb3NlJyA6ICdvcGVuJ1xuICAgIGNvbnN0IGFycm93SWNvbkNsYXNzID0gaXNDbG9zZUJ1dHRvbiA/ICdpY29uX19hcnJvdy0tbGVmdCcgOiAnJ1xuICAgIHJldHVybiBiZWxgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiXG4gICAgICAgIGNsYXNzPVwiaGVyb19fJHtvcGVuT3JDbG9zZX1cIlxuICAgICAgICByb2xlPVwiYnV0dG9uXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIiR7aXNDbG9zZUJ1dHRvbiA/ICdHbyBiYWNrJyA6ICdNb3JlIGRldGFpbHMnfVwiXG4gICAgICAgID5cbiAgICA8c3BhbiBjbGFzcz1cImljb24gaWNvbl9fYXJyb3cgaWNvbl9fYXJyb3ctLWxhcmdlICR7YXJyb3dJY29uQ2xhc3N9XCI+XG4gICAgPC9zcGFuPlxuPC9hPmBcbn1cbiIsIi8qIEdlbmVyYXRlcyBhIGxpbmsgdGFnXG4gKiB1cmw6IGhyZWYgdXJsXG4gKiBvcHRpb25zOiBhbnkgYSB0YWcgYXR0cmlidXRlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICBhLmhyZWYgPSB1cmxcblxuICAgIC8vIGF0dHJpYnV0ZXMgZm9yIHRoZSA8YT4gdGFnLCBlLmcuIFwiYXJpYS1sYWJlbFwiXG4gICAgaWYgKG9wdGlvbnMuYXR0cmlidXRlcykge1xuICAgICAgICBmb3IgKGNvbnN0IGF0dHIgaW4gb3B0aW9ucy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBhLnNldEF0dHJpYnV0ZShhdHRyLCBvcHRpb25zLmF0dHJpYnV0ZXNbYXR0cl0pXG4gICAgICAgIH1cblxuICAgICAgICBkZWxldGUgb3B0aW9ucy5hdHRyaWJ1dGVzXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICBhW2tleV0gPSBvcHRpb25zW2tleV1cbiAgICB9XG5cbiAgICByZXR1cm4gYVxufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcbmNvbnN0IGhlcm8gPSByZXF1aXJlKCcuL2hlcm8uZXM2LmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2l0ZSwgb3BzKSB7XG4gICAgY29uc3Qgc3RhdHVzID0gc2l0ZVJhdGluZ1N0YXR1cyhcbiAgICAgICAgc2l0ZS5pc0NhbGN1bGF0aW5nU2l0ZVJhdGluZyxcbiAgICAgICAgc2l0ZS5zaXRlUmF0aW5nLFxuICAgICAgICBzaXRlLmlzQWxsb3dsaXN0ZWRcbiAgICApXG4gICAgY29uc3Qgc3VidGl0bGUgPSBzaXRlUmF0aW5nU3VidGl0bGUoXG4gICAgICAgIHNpdGUuaXNDYWxjdWxhdGluZ1NpdGVSYXRpbmcsXG4gICAgICAgIHNpdGUuc2l0ZVJhdGluZyxcbiAgICAgICAgc2l0ZS5pc0FsbG93bGlzdGVkLFxuICAgICAgICBzaXRlLmlzQnJva2VuXG4gICAgKVxuICAgIGNvbnN0IGxhYmVsID0gc3VidGl0bGVMYWJlbChcbiAgICAgICAgc2l0ZS5pc0NhbGN1bGF0aW5nU2l0ZVJhdGluZyxcbiAgICAgICAgc2l0ZS5zaXRlUmF0aW5nLFxuICAgICAgICBzaXRlLmlzQWxsb3dsaXN0ZWRcbiAgICApXG5cbiAgICByZXR1cm4gYmVsYDxkaXYgY2xhc3M9XCJyYXRpbmctaGVyby1jb250YWluZXIganMtcmF0aW5nLWhlcm9cIj5cbiAgICAgJHtoZXJvKHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgIHRpdGxlOiBzaXRlLmRvbWFpbixcbiAgICAgICAgc3VidGl0bGU6IHN1YnRpdGxlLFxuICAgICAgICBzdWJ0aXRsZUxhYmVsOiBsYWJlbCxcbiAgICAgICAgc2hvd0Nsb3NlOiBvcHMuc2hvd0Nsb3NlLFxuICAgICAgICBzaG93T3Blbjogb3BzLnNob3dPcGVuXG4gICAgfSl9XG48L2Rpdj5gXG59XG5cbmZ1bmN0aW9uIHNpdGVSYXRpbmdTdGF0dXMgKGlzQ2FsY3VsYXRpbmcsIHJhdGluZywgaXNBbGxvd2xpc3RlZCkge1xuICAgIGxldCBzdGF0dXNcbiAgICBsZXQgaXNBY3RpdmUgPSAnJ1xuXG4gICAgaWYgKGlzQ2FsY3VsYXRpbmcpIHtcbiAgICAgICAgc3RhdHVzID0gJ2NhbGN1bGF0aW5nJ1xuICAgIH0gZWxzZSBpZiAocmF0aW5nICYmIHJhdGluZy5iZWZvcmUpIHtcbiAgICAgICAgaXNBY3RpdmUgPSBpc0FsbG93bGlzdGVkID8gJycgOiAnLS1hY3RpdmUnXG5cbiAgICAgICAgaWYgKGlzQWN0aXZlICYmIHJhdGluZy5hZnRlcikge1xuICAgICAgICAgICAgc3RhdHVzID0gcmF0aW5nLmNzc0FmdGVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXMgPSByYXRpbmcuY3NzQmVmb3JlXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0dXMgPSAnbnVsbCdcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdHVzICsgaXNBY3RpdmVcbn1cblxuZnVuY3Rpb24gc2l0ZVJhdGluZ1N1YnRpdGxlIChpc0NhbGN1bGF0aW5nLCByYXRpbmcsIGlzQWxsb3dsaXN0ZWQsIGlzQnJva2VuKSB7XG4gICAgbGV0IGlzQWN0aXZlID0gdHJ1ZVxuICAgIGlmIChpc0Jyb2tlbikge1xuICAgICAgICByZXR1cm4gJydcbiAgICB9XG4gICAgaWYgKGlzQWxsb3dsaXN0ZWQpIGlzQWN0aXZlID0gZmFsc2VcbiAgICAvLyBzaXRlIGdyYWRlL3JhdGluZyB3YXMgdXBncmFkZWQgYnkgZXh0ZW5zaW9uXG4gICAgaWYgKGlzQWN0aXZlICYmIHJhdGluZyAmJiByYXRpbmcuYmVmb3JlICYmIHJhdGluZy5hZnRlcikge1xuICAgICAgICBpZiAocmF0aW5nLmJlZm9yZSAhPT0gcmF0aW5nLmFmdGVyKSB7XG4gICAgICAgICAgICAvLyB3cmFwIHRoaXMgaW4gYSBzaW5nbGUgcm9vdCBzcGFuIG90aGVyd2lzZSBiZWwgY29tcGxhaW5zXG4gICAgICAgICAgICByZXR1cm4gYmVsYDxzcGFuPlNpdGUgZW5oYW5jZWQgZnJvbVxuICAgIDxzcGFuIGNsYXNzPVwicmF0aW5nLWxldHRlciByYXRpbmctbGV0dGVyLS0ke3JhdGluZy5jc3NCZWZvcmV9XCI+XG4gICAgPC9zcGFuPlxuPC9zcGFuPmBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRlYWwgd2l0aCBvdGhlciBzdGF0ZXNcbiAgICBsZXQgbXNnID0gJ1ByaXZhY3kgR3JhZGUnXG4gICAgLy8gc2l0ZSBpcyBhbGxvd2xpc3RlZFxuICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgbXNnID0gJ1ByaXZhY3kgUHJvdGVjdGlvbiBEaXNhYmxlZCdcbiAgICAgICAgLy8gXCJudWxsXCIgc3RhdGUgKGVtcHR5IHRhYiwgYnJvd3NlcidzIFwiYWJvdXQ6XCIgcGFnZXMpXG4gICAgfSBlbHNlIGlmICghaXNDYWxjdWxhdGluZyAmJiAhcmF0aW5nLmJlZm9yZSAmJiAhcmF0aW5nLmFmdGVyKSB7XG4gICAgICAgIG1zZyA9ICdXZSBvbmx5IGdyYWRlIHJlZ3VsYXIgd2Vic2l0ZXMnXG4gICAgICAgIC8vIHJhdGluZyBpcyBzdGlsbCBjYWxjdWxhdGluZ1xuICAgIH0gZWxzZSBpZiAoaXNDYWxjdWxhdGluZykge1xuICAgICAgICBtc2cgPSAnQ2FsY3VsYXRpbmcuLi4nXG4gICAgfVxuXG4gICAgcmV0dXJuIGJlbGAke21zZ31gXG59XG5cbi8vIHRvIGF2b2lkIGR1cGxpY2F0aW5nIG1lc3NhZ2VzIGJldHdlZW4gdGhlIGljb24gYW5kIHRoZSBzdWJ0aXRsZSxcbi8vIHdlIGNvbWJpbmUgaW5mb3JtYXRpb24gZm9yIGJvdGggaGVyZVxuZnVuY3Rpb24gc3VidGl0bGVMYWJlbCAoaXNDYWxjdWxhdGluZywgcmF0aW5nLCBpc0FsbG93bGlzdGVkKSB7XG4gICAgaWYgKGlzQ2FsY3VsYXRpbmcpIHJldHVyblxuXG4gICAgaWYgKGlzQWxsb3dsaXN0ZWQgJiYgcmF0aW5nLmJlZm9yZSkge1xuICAgICAgICByZXR1cm4gYFByaXZhY3kgUHJvdGVjdGlvbiBEaXNhYmxlZCwgUHJpdmFjeSBHcmFkZSAke3JhdGluZy5iZWZvcmV9YFxuICAgIH1cblxuICAgIGlmIChyYXRpbmcuYmVmb3JlICYmIHJhdGluZy5iZWZvcmUgPT09IHJhdGluZy5hZnRlcikge1xuICAgICAgICByZXR1cm4gYFByaXZhY3kgR3JhZGUgJHtyYXRpbmcuYmVmb3JlfWBcbiAgICB9XG5cbiAgICBpZiAocmF0aW5nLmJlZm9yZSAmJiByYXRpbmcuYWZ0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGBTaXRlIGVuaGFuY2VkIGZyb20gJHtyYXRpbmcuYmVmb3JlfWBcbiAgICB9XG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuY29uc3QgaGFtYnVyZ2VyQnV0dG9uID0gcmVxdWlyZSgnLi9oYW1idXJnZXItYnV0dG9uLmVzNi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRpdGxlKSB7XG4gICAgcmV0dXJuIGJlbGA8bmF2IGNsYXNzPVwic2xpZGluZy1zdWJ2aWV3X19oZWFkZXIgY2FyZFwiPlxuICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cInNsaWRpbmctc3Vidmlld19faGVhZGVyX19iYWNrXG4gICAgICAgIHNsaWRpbmctc3Vidmlld19faGVhZGVyX19iYWNrLS1pcy1pY29uXG4gICAgICAgIGpzLXNsaWRpbmctc3Vidmlldy1jbG9zZVwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImljb24gaWNvbl9fYXJyb3cgaWNvbl9fYXJyb3ctLWxlZnQgcHVsbC1sZWZ0XCI+XG4gICAgICAgIDwvc3Bhbj5cbiAgICA8L2E+XG4gICAgPGgyIGNsYXNzPVwic2xpZGluZy1zdWJ2aWV3X19oZWFkZXJfX3RpdGxlXCI+XG4gICAgICAgICR7dGl0bGV9XG4gICAgPC9oMj5cbiAgICAke2hhbWJ1cmdlckJ1dHRvbigpfVxuPC9uYXY+YFxufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbXMsIGV4dHJhQ2xhc3Nlcykge1xuICAgIGV4dHJhQ2xhc3NlcyA9IGV4dHJhQ2xhc3NlcyB8fCAnJ1xuXG4gICAgcmV0dXJuIGJlbGA8dWwgY2xhc3M9XCJzdGF0dXMtbGlzdCAke2V4dHJhQ2xhc3Nlc31cIj5cbiAgICAke2l0ZW1zLm1hcChyZW5kZXJJdGVtKX1cbjwvdWw+YFxufVxuXG5mdW5jdGlvbiByZW5kZXJJdGVtIChpdGVtKSB7XG4gICAgcmV0dXJuIGJlbGA8bGkgY2xhc3M9XCJzdGF0dXMtbGlzdF9faXRlbSBzdGF0dXMtbGlzdF9faXRlbS0tJHtpdGVtLm1vZGlmaWVyfVxuICAgIGJvbGQgJHtpdGVtLmhpZ2hsaWdodCA/ICdpcy1oaWdobGlnaHRlZCcgOiAnJ31cIj5cbiAgICAke2l0ZW0ubXNnfVxuPC9saT5gXG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpc0FjdGl2ZUJvb2xlYW4sIGtsYXNzLCBkYXRhS2V5KSB7XG4gICAgLy8gbWFrZSBga2xhc3NgIGFuZCBgZGF0YUtleWAgb3B0aW9uYWw6XG4gICAga2xhc3MgPSBrbGFzcyB8fCAnJ1xuICAgIGRhdGFLZXkgPSBkYXRhS2V5IHx8ICcnXG5cbiAgICByZXR1cm4gYmVsYFxuPGJ1dHRvbiBjbGFzcz1cInRvZ2dsZS1idXR0b24gdG9nZ2xlLWJ1dHRvbi0taXMtYWN0aXZlLSR7aXNBY3RpdmVCb29sZWFufSAke2tsYXNzfVwiXG4gICAgZGF0YS1rZXk9XCIke2RhdGFLZXl9XCJcbiAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICBhcmlhLXByZXNzZWQ9XCIke2lzQWN0aXZlQm9vbGVhbiA/ICd0cnVlJyA6ICdmYWxzZSd9XCJcbiAgICA+XG4gICAgPGRpdiBjbGFzcz1cInRvZ2dsZS1idXR0b25fX2JnXCI+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInRvZ2dsZS1idXR0b25fX2tub2JcIj48L2Rpdj5cbjwvYnV0dG9uPmBcbn1cbiIsImNvbnN0IGJlbCA9IHJlcXVpcmUoJ2JlbCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBiZWxgPGRpdiBjbGFzcz1cInRvcC1ibG9ja2VkX19uby1kYXRhXCI+XG4gICAgPGRpdiBjbGFzcz1cInRvcC1ibG9ja2VkX19uby1kYXRhX19ncmFwaFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInRvcC1ibG9ja2VkX19uby1kYXRhX19ncmFwaF9fYmFyIG9uZVwiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ0b3AtYmxvY2tlZF9fbm8tZGF0YV9fZ3JhcGhfX2JhciB0d29cIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwidG9wLWJsb2NrZWRfX25vLWRhdGFfX2dyYXBoX19iYXIgdGhyZWVcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwidG9wLWJsb2NrZWRfX25vLWRhdGFfX2dyYXBoX19iYXIgZm91clwiPjwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICA8cCBjbGFzcz1cInRvcC1ibG9ja2VkX19uby1kYXRhX19sZWFkIHRleHQtY2VudGVyXCI+VHJhY2tlciBOZXR3b3JrcyBUb3AgT2ZmZW5kZXJzPC9wPlxuICAgIDxwPk5vIGRhdGEgYXZhaWxhYmxlIHlldDwvcD5cbjwvZGl2PmBcbn1cbiIsImNvbnN0IGJlbCA9IHJlcXVpcmUoJ2JlbCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNpdGVSYXRpbmcsIGlzQWxsb3dsaXN0ZWQsIHRvdGFsVHJhY2tlck5ldHdvcmtzQ291bnQpIHtcbiAgICBsZXQgaWNvbk5hbWVNb2RpZmllciA9ICdibG9ja2VkJ1xuXG4gICAgaWYgKGlzQWxsb3dsaXN0ZWQgJiYgKHNpdGVSYXRpbmcuYmVmb3JlID09PSAnRCcpICYmICh0b3RhbFRyYWNrZXJOZXR3b3Jrc0NvdW50ICE9PSAwKSkge1xuICAgICAgICBpY29uTmFtZU1vZGlmaWVyID0gJ3dhcm5pbmcnXG4gICAgfVxuXG4gICAgY29uc3QgaWNvbk5hbWUgPSAnbWFqb3ItbmV0d29ya3MtJyArIGljb25OYW1lTW9kaWZpZXJcblxuICAgIHJldHVybiBiZWxgJHtpY29uTmFtZX1gXG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzaXRlLCBpc01ham9yTmV0d29ya3NDb3VudCkge1xuICAgIC8vIFNob3cgYWxsIHRyYWNrZXJzIGZvdW5kIGlmIHNpdGUgaXMgYWxsb3dsaXN0ZWRcbiAgICAvLyBidXQgb25seSBzaG93IHRoZSBibG9ja2VkIG9uZXMgb3RoZXJ3aXNlXG4gICAgbGV0IHRyYWNrZXJzQ291bnQgPSBzaXRlLmlzQWxsb3dsaXN0ZWQgPyBzaXRlLnRyYWNrZXJzQ291bnQgOiBzaXRlLnRyYWNrZXJzQmxvY2tlZENvdW50IHx8IDBcbiAgICBsZXQgdW5pcXVlVHJhY2tlcnNUZXh0ID0gdHJhY2tlcnNDb3VudCA9PT0gMSA/ICcgVHJhY2tlciAnIDogJyBUcmFja2VycyAnXG5cbiAgICBpZiAoaXNNYWpvck5ldHdvcmtzQ291bnQpIHtcbiAgICAgICAgdHJhY2tlcnNDb3VudCA9IHNpdGUubWFqb3JUcmFja2VyTmV0d29ya3NDb3VudFxuICAgICAgICB1bmlxdWVUcmFja2Vyc1RleHQgPSB0cmFja2Vyc0NvdW50ID09PSAxID8gJyBNYWpvciBUcmFja2VyIE5ldHdvcmsgJyA6ICcgTWFqb3IgVHJhY2tlciBOZXR3b3JrcyAnXG4gICAgfVxuICAgIGNvbnN0IGZpbmFsVGV4dCA9IHRyYWNrZXJzQ291bnQgKyB1bmlxdWVUcmFja2Vyc1RleHQgKyB0cmFja2Vyc0Jsb2NrZWRPckZvdW5kKHNpdGUsIHRyYWNrZXJzQ291bnQpXG5cbiAgICByZXR1cm4gYmVsYCR7ZmluYWxUZXh0fWBcbn1cblxuZnVuY3Rpb24gdHJhY2tlcnNCbG9ja2VkT3JGb3VuZCAoc2l0ZSwgdHJhY2tlcnNDb3VudCkge1xuICAgIGxldCBtc2cgPSAnJ1xuICAgIGlmIChzaXRlICYmIChzaXRlLmlzQWxsb3dsaXN0ZWQgfHwgdHJhY2tlcnNDb3VudCA9PT0gMCkpIHtcbiAgICAgICAgbXNnID0gJ0ZvdW5kJ1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1zZyA9ICdCbG9ja2VkJ1xuICAgIH1cblxuICAgIHJldHVybiBiZWxgJHttc2d9YFxufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcbmNvbnN0IHRvZ2dsZUJ1dHRvbiA9IHJlcXVpcmUoJy4vc2hhcmVkL3RvZ2dsZS1idXR0b24uZXM2LmpzJylcbmNvbnN0IHJhdGluZ0hlcm8gPSByZXF1aXJlKCcuL3NoYXJlZC9yYXRpbmctaGVyby5lczYuanMnKVxuY29uc3QgdHJhY2tlck5ldHdvcmtzSWNvbiA9IHJlcXVpcmUoJy4vc2hhcmVkL3RyYWNrZXItbmV0d29yay1pY29uLmVzNi5qcycpXG5jb25zdCB0cmFja2VyTmV0d29ya3NUZXh0ID0gcmVxdWlyZSgnLi9zaGFyZWQvdHJhY2tlci1uZXR3b3Jrcy10ZXh0LmVzNi5qcycpXG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi8uLi9kYXRhL2NvbnN0YW50cycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHRvc2RyTXNnID0gKHRoaXMubW9kZWwudG9zZHIgJiYgdGhpcy5tb2RlbC50b3Nkci5tZXNzYWdlKSB8fFxuICAgICAgICBjb25zdGFudHMudG9zZHJNZXNzYWdlcy51bmtub3duXG5cbiAgICByZXR1cm4gYmVsYDxkaXYgY2xhc3M9XCJzaXRlLWluZm8gc2l0ZS1pbmZvLS1tYWluXCI+XG4gICAgPHVsIGNsYXNzPVwiZGVmYXVsdC1saXN0XCI+XG4gICAgICAgIDxsaSBjbGFzcz1cImJvcmRlci0tYm90dG9tIHNpdGUtaW5mb19fcmF0aW5nLWxpIG1haW4tcmF0aW5nIGpzLWhlcm8tb3BlblwiPlxuICAgICAgICAgICAgJHtyYXRpbmdIZXJvKHRoaXMubW9kZWwsIHtcbiAgICAgICAgc2hvd09wZW46ICF0aGlzLm1vZGVsLmRpc2FibGVkXG4gICAgfSl9XG4gICAgICAgIDwvbGk+XG4gICAgICAgIDxsaSBjbGFzcz1cInRleHQtLWNlbnRlciBwYWRkZWQgYm9yZGVyLS1ib3R0b20gd2FybmluZ19iZyBib2xkICR7dGhpcy5tb2RlbC5kaXNwbGF5QnJva2VuVUkgPyAnJyA6ICdpcy1oaWRkZW4nfVwiPlxuICAgICAgICAgICAgV2UgdGVtcG9yYXJpbHkgZGlzYWJsZWQgUHJpdmFjeSBQcm90ZWN0aW9uIGFzIGl0IGFwcGVhcnMgdG8gYmUgYnJlYWtpbmcgdGhpcyBzaXRlLlxuICAgICAgICA8L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJzaXRlLWluZm9fX2xpLS1odHRwcy1zdGF0dXMgcGFkZGVkIGJvcmRlci0tYm90dG9tXCI+XG4gICAgICAgICAgICA8cCBjbGFzcz1cInNpdGUtaW5mb19faHR0cHMtc3RhdHVzIGJvbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNpdGUtaW5mb19faHR0cHMtc3RhdHVzX19pY29uXG4gICAgICAgICAgICAgICAgICAgIGlzLSR7dGhpcy5tb2RlbC5odHRwc1N0YXRlfVwiPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtbGluZS1hZnRlci1pY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5tb2RlbC5odHRwc1N0YXR1c1RleHR9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9wPlxuICAgICAgICA8L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJqcy1zaXRlLXRyYWNrZXItbmV0d29ya3MganMtc2l0ZS1zaG93LXBhZ2UtdHJhY2tlcnMgc2l0ZS1pbmZvX19saS0tdHJhY2tlcnMgcGFkZGVkIGJvcmRlci0tYm90dG9tXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJsaW5rLXNlY29uZGFyeSBib2xkXCIgcm9sZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICR7cmVuZGVyVHJhY2tlck5ldHdvcmtzKHRoaXMubW9kZWwpfVxuICAgICAgICAgICAgPC9hPlxuICAgICAgICA8L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJqcy1zaXRlLXByaXZhY3ktcHJhY3RpY2VzIHNpdGUtaW5mb19fbGktLXByaXZhY3ktcHJhY3RpY2VzIHBhZGRlZCBib3JkZXItLWJvdHRvbVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzaXRlLWluZm9fX3ByaXZhY3ktcHJhY3RpY2VzX19pY29uXG4gICAgICAgICAgICAgICAgaXMtJHt0b3Nkck1zZy50b0xvd2VyQ2FzZSgpfVwiPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwibGluay1zZWNvbmRhcnkgYm9sZFwiIHJvbGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtbGluZS1hZnRlci1pY29uXCI+ICR7dG9zZHJNc2d9IFByaXZhY3kgUHJhY3RpY2VzIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb24gaWNvbl9fYXJyb3cgcHVsbC1yaWdodFwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9saT5cbiAgICAgICAgPGxpIGNsYXNzPVwic2l0ZS1pbmZvX19saS0tdG9nZ2xlIGpzLXNpdGUtcHJvdGVjdGlvbi1yb3cgcGFkZGVkICR7dGhpcy5tb2RlbC5wcm90ZWN0aW9uc0VuYWJsZWQgPyAnaXMtYWN0aXZlJyA6ICcnfVwiPlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJpcy10cmFuc3BhcmVudCBzaXRlLWluZm9fX2FsbG93bGlzdC1zdGF0dXMganMtc2l0ZS1hbGxvd2xpc3Qtc3RhdHVzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LWxpbmUtYWZ0ZXItaWNvbiBwcml2YWN5LW9uLW9mZi1tZXNzYWdlIGJvbGRcIj5cbiAgICAgICAgICAgICAgICAgICAgJHtzZXRUcmFuc2l0aW9uVGV4dCghdGhpcy5tb2RlbC5pc0FsbG93bGlzdGVkKX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8cCBjbGFzcz1cInNpdGUtaW5mb19fcHJvdGVjdGlvbiBqcy1zaXRlLXByb3RlY3Rpb24gYm9sZFwiPlNpdGUgUHJpdmFjeSBQcm90ZWN0aW9uPC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNpdGUtaW5mb19fdG9nZ2xlLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICR7dG9nZ2xlQnV0dG9uKHRoaXMubW9kZWwucHJvdGVjdGlvbnNFbmFibGVkLCAnanMtc2l0ZS10b2dnbGUgcHVsbC1yaWdodCcpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+XG4gICAgICAgIDxsaSBjbGFzcz1cImpzLXNpdGUtbWFuYWdlLWFsbG93bGlzdC1saSBzaXRlLWluZm9fX2xpLS1tYW5hZ2UtYWxsb3dsaXN0IHBhZGRlZCAke3RoaXMubW9kZWwuZGlzcGxheUJyb2tlblVJID8gJ2lzLWhpZGRlbicgOiAnJ31cIj5cbiAgICAgICAgICAgICR7cmVuZGVyTWFuYWdlQWxsb3dsaXN0KHRoaXMubW9kZWwpfVxuICAgICAgICA8L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJqcy1zaXRlLWNvbmZpcm0tYnJlYWthZ2UtbGkgc2l0ZS1pbmZvX19saS0tY29uZmlybS1icmVha2FnZSBib3JkZXItLWJvdHRvbSBwYWRkZWQgaXMtaGlkZGVuXCI+XG4gICAgICAgICAgIDxkaXYgY2xhc3M9XCJqcy1zaXRlLWNvbmZpcm0tYnJlYWthZ2UtbWVzc2FnZSBzaXRlLWluZm9fX2NvbmZpcm0tdGhhbmtzIGlzLXRyYW5zcGFyZW50XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzaXRlLWluZm9fX21lc3NhZ2VcIj5cbiAgICAgICAgICAgICAgICAgICAgVGhhbmtzIGZvciB0aGUgZmVlZGJhY2shXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianMtc2l0ZS1jb25maXJtLWJyZWFrYWdlIHNpdGUtaW5mby0tY29uZmlybS1icmVha2FnZVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic2l0ZS1pbmZvLS1pcy1zaXRlLWJyb2tlbiBib2xkXCI+XG4gICAgICAgICAgICAgICAgICAgIElzIHRoaXMgd2Vic2l0ZSBicm9rZW4/XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxidG4gY2xhc3M9XCJqcy1zaXRlLWNvbmZpcm0tYnJlYWthZ2UteWVzIHNpdGUtaW5mb19fY29uZmlybS1icmVha2FnZS15ZXMgYnRuLXBpbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgWWVzXG4gICAgICAgICAgICAgICAgPC9idG4+XG4gICAgICAgICAgICAgICAgPGJ0biBjbGFzcz1cImpzLXNpdGUtY29uZmlybS1icmVha2FnZS1ubyBzaXRlLWluZm9fX2NvbmZpcm0tYnJlYWthZ2Utbm8gYnRuLXBpbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgTm9cbiAgICAgICAgICAgICAgICA8L2J0bj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2xpPlxuICAgIDwvdWw+XG48L2Rpdj5gXG5cbiAgICBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uVGV4dCAoaXNTaXRlQWxsb3dsaXN0ZWQpIHtcbiAgICAgICAgaXNTaXRlQWxsb3dsaXN0ZWQgPSBpc1NpdGVBbGxvd2xpc3RlZCB8fCBmYWxzZVxuICAgICAgICBsZXQgdGV4dCA9ICdBZGRlZCB0byBVbnByb3RlY3RlZCBTaXRlcydcblxuICAgICAgICBpZiAoaXNTaXRlQWxsb3dsaXN0ZWQpIHtcbiAgICAgICAgICAgIHRleHQgPSAnUmVtb3ZlZCBmcm9tIFVucHJvdGVjdGVkIFNpdGVzJ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRleHRcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJUcmFja2VyTmV0d29ya3MgKG1vZGVsKSB7XG4gICAgICAgIGNvbnN0IGlzQWN0aXZlID0gbW9kZWwucHJvdGVjdGlvbnNFbmFibGVkID8gJ2lzLWFjdGl2ZScgOiAnJ1xuXG4gICAgICAgIHJldHVybiBiZWxgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwic2l0ZS1pbmZvX190cmFja2VycyBsaW5rLXNlY29uZGFyeSBib2xkXCI+XG4gICAgPHNwYW4gY2xhc3M9XCJzaXRlLWluZm9fX3RyYWNrZXJzLXN0YXR1c19faWNvblxuICAgICAgICBpY29uLSR7dHJhY2tlck5ldHdvcmtzSWNvbihtb2RlbC5zaXRlUmF0aW5nLCAhbW9kZWwucHJvdGVjdGlvbnNFbmFibGVkLCBtb2RlbC50b3RhbFRyYWNrZXJOZXR3b3Jrc0NvdW50KX1cIj48L3NwYW4+XG4gICAgPHNwYW4gY2xhc3M9XCIke2lzQWN0aXZlfSB0ZXh0LWxpbmUtYWZ0ZXItaWNvblwiPiAke3RyYWNrZXJOZXR3b3Jrc1RleHQobW9kZWwsIGZhbHNlKX0gPC9zcGFuPlxuICAgIDxzcGFuIGNsYXNzPVwiaWNvbiBpY29uX19hcnJvdyBwdWxsLXJpZ2h0XCI+PC9zcGFuPlxuPC9hPmBcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJNYW5hZ2VBbGxvd2xpc3QgKG1vZGVsKSB7XG4gICAgICAgIHJldHVybiBiZWxgPGRpdj5cbiAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJqcy1zaXRlLW1hbmFnZS1hbGxvd2xpc3Qgc2l0ZS1pbmZvX19tYW5hZ2UtYWxsb3dsaXN0IGxpbmstc2Vjb25kYXJ5IGJvbGRcIj5cbiAgICAgICAgVW5wcm90ZWN0ZWQgU2l0ZXNcbiAgICA8L2E+XG4gICAgPGRpdiBjbGFzcz1cInNlcGFyYXRvclwiPjwvZGl2PlxuICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImpzLXNpdGUtcmVwb3J0LWJyb2tlbiBzaXRlLWluZm9fX3JlcG9ydC1icm9rZW4gbGluay1zZWNvbmRhcnkgYm9sZFwiPlxuICAgICAgICBSZXBvcnQgYnJva2VuIHNpdGVcbiAgICA8L2E+XG48L2Rpdj5gXG4gICAgfVxufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29tcGFueUxpc3RNYXApIHtcbiAgICByZXR1cm4gY29tcGFueUxpc3RNYXAubWFwKChkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBiZWxgPGxpIGNsYXNzPVwidG9wLWJsb2NrZWRfX2xpXCI+XG4gICAgPGRpdiB0aXRsZT1cIiR7ZGF0YS5uYW1lfVwiIGNsYXNzPVwidG9wLWJsb2NrZWRfX2xpX19jb21wYW55LW5hbWVcIj4ke2RhdGEuZGlzcGxheU5hbWV9PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInRvcC1ibG9ja2VkX19saV9fYmxvY2tlci1iYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRvcC1ibG9ja2VkX19saV9fYmxvY2tlci1iYXJfX2ZnXG4gICAgICAgICAgICBqcy10b3AtYmxvY2tlZC1ncmFwaC1iYXItZmdcIlxuICAgICAgICAgICAgc3R5bGU9XCJ3aWR0aDogMHB4XCIgZGF0YS13aWR0aD1cIiR7ZGF0YS5wZXJjZW50fVwiPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidG9wLWJsb2NrZWRfX2xpX19ibG9ja2VyLXBjdCBqcy10b3AtYmxvY2tlZC1wY3RcIj5cbiAgICAgICAgJHtkYXRhLnBlcmNlbnR9JVxuICAgIDwvZGl2PlxuPC9saT5gXG4gICAgfSlcbn1cbiIsImNvbnN0IGJlbCA9IHJlcXVpcmUoJ2JlbCcpXG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi8uLi9kYXRhL2NvbnN0YW50cycpXG5jb25zdCBlbnRpdHlJY29uTWFwcGluZyA9IGNvbnN0YW50cy5lbnRpdHlJY29uTWFwcGluZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb21wYW55TGlzdE1hcCkge1xuICAgIHJldHVybiBjb21wYW55TGlzdE1hcC5tYXAoKGRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIGJlbGA8c3BhbiBjbGFzcz1cInRvcC1ibG9ja2VkX19waWxsLXNpdGVfX2ljb24gJHtnZXRTY3NzQ2xhc3MoZGF0YS5uYW1lKX1cIj48L3NwYW4+YFxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiBnZXRTY3NzQ2xhc3MgKGNvbXBhbnlOYW1lKSB7XG4gICAgICAgIGNvbnN0IGljb25DbGFzc05hbWUgPSBlbnRpdHlJY29uTWFwcGluZ1tjb21wYW55TmFtZV0gfHwgJ2dlbmVyaWMnXG4gICAgICAgIHJldHVybiBpY29uQ2xhc3NOYW1lXG4gICAgfVxufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcbmNvbnN0IGxpc3RJdGVtcyA9IHJlcXVpcmUoJy4vdG9wLWJsb2NrZWQtdHJ1bmNhdGVkLWxpc3QtaXRlbXMuZXM2LmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubW9kZWwuY29tcGFueUxpc3RNYXAgJiYgdGhpcy5tb2RlbC5jb21wYW55TGlzdE1hcC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBiZWxgPGRpdiBjbGFzcz1cInRvcC1ibG9ja2VkIHRvcC1ibG9ja2VkLS10cnVuY2F0ZWRcIj5cbiAgICA8ZGl2IGNsYXNzPVwidG9wLWJsb2NrZWRfX3NlZS1hbGwganMtdG9wLWJsb2NrZWQtc2VlLWFsbFwiPlxuICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJsaW5rLXNlY29uZGFyeVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uIGljb25fX2Fycm93IHB1bGwtcmlnaHRcIj48L3NwYW4+XG4gICAgICAgICAgICBUb3AgVHJhY2tpbmcgT2ZmZW5kZXJzXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRvcC1ibG9ja2VkX19saXN0IHRvcC1ibG9ja2VkX19saXN0LS10cnVuY2F0ZWQgdG9wLWJsb2NrZWRfX2xpc3QtLWljb25zXCI+XG4gICAgICAgICAgICAgICAgJHtsaXN0SXRlbXModGhpcy5tb2RlbC5jb21wYW55TGlzdE1hcCl9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvYT5cbiAgICA8L2Rpdj5cbjwvZGl2PmBcbiAgICB9XG59XG4iLCJjb25zdCBiZWwgPSByZXF1aXJlKCdiZWwnKVxuY29uc3QgaGVhZGVyID0gcmVxdWlyZSgnLi9zaGFyZWQvc2xpZGluZy1zdWJ2aWV3LWhlYWRlci5lczYuanMnKVxuY29uc3QgbGlzdEl0ZW1zID0gcmVxdWlyZSgnLi90b3AtYmxvY2tlZC1saXN0LWl0ZW1zLmVzNi5qcycpXG5jb25zdCBub0RhdGEgPSByZXF1aXJlKCcuL3NoYXJlZC90b3AtYmxvY2tlZC1uby1kYXRhLmVzNi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5tb2RlbCkge1xuICAgICAgICByZXR1cm4gYmVsYDxkaXYgY2xhc3M9XCJzbGlkaW5nLXN1YnZpZXdcbiAgICBzbGlkaW5nLXN1YnZpZXctLWhhcy1maXhlZC1oZWFkZXIgdG9wLWJsb2NrZWQtaGVhZGVyXCI+XG4gICAgJHtoZWFkZXIoJ0FsbCBUcmFja2VycycpfVxuPC9kaXY+YFxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiZWxgPGRpdiBjbGFzcz1cImpzLXRvcC1ibG9ja2VkLWNvbnRlbnRcIj5cbiAgICAke3JlbmRlclBjdFBhZ2VzV2l0aFRyYWNrZXJzKHRoaXMubW9kZWwpfVxuICAgICR7cmVuZGVyTGlzdCh0aGlzLm1vZGVsKX1cbiAgICAke3JlbmRlclJlc2V0QnV0dG9uKHRoaXMubW9kZWwpfVxuPC9kaXY+YFxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyUGN0UGFnZXNXaXRoVHJhY2tlcnMgKG1vZGVsKSB7XG4gICAgbGV0IG1zZyA9ICcnXG4gICAgaWYgKG1vZGVsLmxhc3RTdGF0c1Jlc2V0RGF0ZSkge1xuICAgICAgICBjb25zdCBkID0gKG5ldyBEYXRlKG1vZGVsLmxhc3RTdGF0c1Jlc2V0RGF0ZSkpLnRvTG9jYWxlRGF0ZVN0cmluZygnZGVmYXVsdCcsIHsgbW9udGg6ICdsb25nJywgZGF5OiAnbnVtZXJpYycsIHllYXI6ICdudW1lcmljJyB9KVxuICAgICAgICBpZiAoZCkgbXNnID0gYCBzaW5jZSAke2R9YFxuICAgIH1cbiAgICBpZiAobW9kZWwucGN0UGFnZXNXaXRoVHJhY2tlcnMpIHtcbiAgICAgICAgcmV0dXJuIGJlbGA8cCBjbGFzcz1cInRvcC1ibG9ja2VkX19wY3QgY2FyZFwiPlxuICAgIFRyYWNrZXJzIHdlcmUgZm91bmQgb24gPGI+JHttb2RlbC5wY3RQYWdlc1dpdGhUcmFja2Vyc30lPC9iPlxuICAgIG9mIHdlYnNpdGVzIHlvdSd2ZSB2aXNpdGVkJHttc2d9LlxuPC9wPmBcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpc3QgKG1vZGVsKSB7XG4gICAgaWYgKG1vZGVsLmNvbXBhbnlMaXN0TWFwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGJlbGA8b2wgYXJpYS1sYWJlbD1cIkxpc3Qgb2YgVHJhY2tlcnMgRm91bmRcIiBjbGFzcz1cImRlZmF1bHQtbGlzdCB0b3AtYmxvY2tlZF9fbGlzdCBjYXJkIGJvcmRlci0tYm90dG9tXCI+XG4gICAgJHtsaXN0SXRlbXMobW9kZWwuY29tcGFueUxpc3RNYXApfVxuPC9vbD5gXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJlbGA8b2wgY2xhc3M9XCJkZWZhdWx0LWxpc3QgdG9wLWJsb2NrZWRfX2xpc3RcIj5cbiAgICA8bGkgY2xhc3M9XCJ0b3AtYmxvY2tlZF9fbGkgdG9wLWJsb2NrZWRfX2xpLS1uby1kYXRhXCI+XG4gICAgICAgICR7bm9EYXRhKCl9XG4gICAgPC9saT5cbjwvb2w+YFxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyUmVzZXRCdXR0b24gKG1vZGVsKSB7XG4gICAgaWYgKG1vZGVsLmNvbXBhbnlMaXN0TWFwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGJlbGA8ZGl2IGNsYXNzPVwidG9wLWJsb2NrZWRfX3Jlc2V0LXN0YXRzXCI+XG4gICAgPGJ1dHRvbiBjbGFzcz1cInRvcC1ibG9ja2VkX19yZXNldC1zdGF0c19fYnV0dG9uIGJsb2NrXG4gICAgICAgIGpzLXJlc2V0LXRyYWNrZXJzLWRhdGFcIj5cbiAgICAgICAgUmVzZXQgZ2xvYmFsIHN0YXRzXG4gICAgPC9idXR0b24+XG4gICAgPHA+VGhlc2Ugc3RhdHMgYXJlIG9ubHkgc3RvcmVkIGxvY2FsbHkgb24geW91ciBkZXZpY2UsXG4gICAgYW5kIGFyZSBub3Qgc2VudCBhbnl3aGVyZSwgZXZlci48L3A+XG48L2Rpdj5gXG4gICAgfVxufVxuIiwiY29uc3QgYmVsID0gcmVxdWlyZSgnYmVsJylcbmNvbnN0IGhlcm8gPSByZXF1aXJlKCcuL3NoYXJlZC9oZXJvLmVzNi5qcycpXG5jb25zdCB0cmFja2VyTmV0d29ya3NJY29uID0gcmVxdWlyZSgnLi9zaGFyZWQvdHJhY2tlci1uZXR3b3JrLWljb24uZXM2LmpzJylcbmNvbnN0IHRyYWNrZXJOZXR3b3Jrc1RleHQgPSByZXF1aXJlKCcuL3NoYXJlZC90cmFja2VyLW5ldHdvcmtzLXRleHQuZXM2LmpzJylcbmNvbnN0IGRpc3BsYXlDYXRlZ29yaWVzID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9kYXRhL2NvbnN0YW50cy5qcycpLmRpc3BsYXlDYXRlZ29yaWVzXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5tb2RlbCkge1xuICAgICAgICByZXR1cm4gYmVsYDxzZWN0aW9uIGNsYXNzPVwic2xpZGluZy1zdWJ2aWV3XG4gICAgc2xpZGluZy1zdWJ2aWV3LS1oYXMtZml4ZWQtaGVhZGVyXCI+XG48L3NlY3Rpb24+YFxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiZWxgPGRpdiBjbGFzcz1cInRyYWNrZXItbmV0d29ya3Mgc2l0ZS1pbmZvIHNpdGUtaW5mby0tZnVsbC1oZWlnaHQgY2FyZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJqcy10cmFja2VyLW5ldHdvcmtzLWhlcm9cIj5cbiAgICAgICAgJHtyZW5kZXJIZXJvKHRoaXMubW9kZWwuc2l0ZSl9XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInRyYWNrZXItbmV0d29ya3NfX2V4cGxhaW5lciBib3JkZXItLWJvdHRvbS0taW5uZXJcbiAgICAgICAgdGV4dC0tY2VudGVyXCI+XG4gICAgICAgIFRyYWNrZXIgbmV0d29ya3MgYWdncmVnYXRlIHlvdXIgd2ViIGhpc3RvcnkgaW50byBhIGRhdGEgcHJvZmlsZSBhYm91dCB5b3UuXG4gICAgICAgIE1ham9yIHRyYWNrZXIgbmV0d29ya3MgYXJlIG1vcmUgaGFybWZ1bCBiZWNhdXNlIHRoZXkgY2FuIHRyYWNrIGFuZCB0YXJnZXQgeW91IGFjcm9zcyBtb3JlIG9mIHRoZSBJbnRlcm5ldC5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidHJhY2tlci1uZXR3b3Jrc19fZGV0YWlscyBwYWRkZWRcbiAgICAgICAganMtdHJhY2tlci1uZXR3b3Jrcy1kZXRhaWxzXCI+XG4gICAgICAgIDxvbCBjbGFzcz1cImRlZmF1bHQtbGlzdCBzaXRlLWluZm9fX3RyYWNrZXJzX19jb21wYW55LWxpc3RcIiBhcmlhLWxhYmVsPVwiTGlzdCBvZiB0cmFja2VyIG5ldHdvcmtzXCI+XG4gICAgICAgICAgICAke3JlbmRlclRyYWNrZXJEZXRhaWxzKFxuICAgICAgICB0aGlzLm1vZGVsLFxuICAgICAgICB0aGlzLm1vZGVsLkRPTUFJTl9NQVBQSU5HU1xuICAgICl9XG4gICAgICAgIDwvb2w+XG4gICAgPC9kaXY+XG48L2Rpdj5gXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJIZXJvIChzaXRlKSB7XG4gICAgc2l0ZSA9IHNpdGUgfHwge31cblxuICAgIHJldHVybiBiZWxgJHtoZXJvKHtcbiAgICAgICAgc3RhdHVzOiB0cmFja2VyTmV0d29ya3NJY29uKHNpdGUuc2l0ZVJhdGluZywgc2l0ZS5pc0FsbG93bGlzdGVkLCBzaXRlLnRvdGFsVHJhY2tlck5ldHdvcmtzQ291bnQpLFxuICAgICAgICB0aXRsZTogc2l0ZS5kb21haW4sXG4gICAgICAgIHN1YnRpdGxlOiBgJHt0cmFja2VyTmV0d29ya3NUZXh0KHNpdGUsIGZhbHNlKX1gLFxuICAgICAgICBzaG93Q2xvc2U6IHRydWVcbiAgICB9KX1gXG59XG5cbmZ1bmN0aW9uIHJlbmRlclRyYWNrZXJEZXRhaWxzIChtb2RlbCkge1xuICAgIGNvbnN0IGNvbXBhbnlMaXN0TWFwID0gbW9kZWwuY29tcGFueUxpc3RNYXAgfHwge31cbiAgICBpZiAoY29tcGFueUxpc3RNYXAubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBiZWxgPGxpIGNsYXNzPVwiaXMtZW1wdHlcIj48L2xpPmBcbiAgICB9XG4gICAgaWYgKGNvbXBhbnlMaXN0TWFwICYmIGNvbXBhbnlMaXN0TWFwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNvbXBhbnlMaXN0TWFwLm1hcCgoYywgaSkgPT4ge1xuICAgICAgICAgICAgbGV0IGJvcmRlckNsYXNzID0gJydcbiAgICAgICAgICAgIGlmIChjLm5hbWUgJiYgYy5uYW1lID09PSAndW5rbm93bicpIHtcbiAgICAgICAgICAgICAgICBjLm5hbWUgPSAnKFRyYWNrZXIgbmV0d29yayB1bmtub3duKSdcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYy5uYW1lICYmIG1vZGVsLmhhc1VuYmxvY2tlZFRyYWNrZXJzKGMsIGMudXJsc0xpc3QpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkaXRpb25hbFRleHQgPSAnIGFzc29jaWF0ZWQgZG9tYWlucydcbiAgICAgICAgICAgICAgICBjb25zdCBkb21haW4gPSBtb2RlbC5zaXRlID8gbW9kZWwuc2l0ZS5kb21haW4gOiBjLmRpc3BsYXlOYW1lXG4gICAgICAgICAgICAgICAgYy5kaXNwbGF5TmFtZSA9IG1vZGVsLnNpdGUuaXNBbGxvd2xpc3RlZCA/IGRvbWFpbiArIGFkZGl0aW9uYWxUZXh0IDogZG9tYWluICsgYWRkaXRpb25hbFRleHQgKyAnIChub3QgYmxvY2tlZCknXG4gICAgICAgICAgICAgICAgYm9yZGVyQ2xhc3MgPSBjb21wYW55TGlzdE1hcC5sZW5ndGggPiAxID8gJ2JvcmRlci0tdG9wIHBhZGRlZC0tdG9wJyA6ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVsYDxsaSBjbGFzcz1cIiR7Ym9yZGVyQ2xhc3N9XCI+XG4gICAgPGRpdiBjbGFzcz1cInNpdGUtaW5mb19fdHJhY2tlcl9fd3JhcHBlciAke2Mubm9ybWFsaXplZE5hbWV9IGZsb2F0LXJpZ2h0XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwic2l0ZS1pbmZvX190cmFja2VyX19pY29uICR7Yy5ub3JtYWxpemVkTmFtZX1cIj5cbiAgICAgICAgPC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIDxoMSB0aXRsZT1cIiR7Yy5uYW1lfVwiIGNsYXNzPVwic2l0ZS1pbmZvX19kb21haW4gYmxvY2tcIj4ke2MuZGlzcGxheU5hbWV9PC9oMT5cbiAgICA8b2wgY2xhc3M9XCJkZWZhdWx0LWxpc3Qgc2l0ZS1pbmZvX190cmFja2Vyc19fY29tcGFueS1saXN0X191cmwtbGlzdFwiIGFyaWEtbGFiZWw9XCJUcmFja2VyIGRvbWFpbnMgZm9yICR7Yy5uYW1lfVwiPlxuICAgICAgICAke2MudXJsc0xpc3QubWFwKCh1cmwpID0+IHtcbiAgICAgICAgLy8gZmluZCBmaXJzdCBtYXRjaGlnbiBjYXRlZ29yeSBmcm9tIG91ciBsaXN0IG9mIGFsbG93ZWQgZGlzcGxheSBjYXRlZ29yaWVzXG4gICAgICAgIGxldCBjYXRlZ29yeSA9ICcnXG4gICAgICAgIGlmIChjLnVybHNbdXJsXSAmJiBjLnVybHNbdXJsXS5jYXRlZ29yaWVzKSB7XG4gICAgICAgICAgICBkaXNwbGF5Q2F0ZWdvcmllcy5zb21lKGRpc3BsYXlDYXQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gYy51cmxzW3VybF0uY2F0ZWdvcmllcy5maW5kKGNhdCA9PiBjYXQgPT09IGRpc3BsYXlDYXQpXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiZWxgPGxpPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1cmxcIj4ke3VybH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2F0ZWdvcnlcIj4ke2NhdGVnb3J5fTwvZGl2PlxuICAgICAgICAgICAgPC9saT5gXG4gICAgfSl9XG4gICAgPC9vbD5cbjwvbGk+YFxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsImNvbnN0IFBhcmVudCA9IHdpbmRvdy5EREcuYmFzZS5WaWV3XG5cbmZ1bmN0aW9uIEF1dG9jb21wbGV0ZSAob3BzKSB7XG4gICAgdGhpcy5tb2RlbCA9IG9wcy5tb2RlbFxuICAgIHRoaXMucGFnZVZpZXcgPSBvcHMucGFnZVZpZXdcbiAgICB0aGlzLnRlbXBsYXRlID0gb3BzLnRlbXBsYXRlXG4gICAgUGFyZW50LmNhbGwodGhpcywgb3BzKVxuXG4gICAgdGhpcy5iaW5kRXZlbnRzKFtcbiAgICAgICAgW3RoaXMuc3RvcmUuc3Vic2NyaWJlLCAnY2hhbmdlOnNlYXJjaCcsIHRoaXMuX2hhbmRsZVNlYXJjaFRleHRdXG4gICAgXSlcbn1cblxuQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIHtcblxuICAgICAgICBfaGFuZGxlU2VhcmNoVGV4dDogZnVuY3Rpb24gKG5vdGlmaWNhdGlvbikge1xuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi5jaGFuZ2UgJiYgbm90aWZpY2F0aW9uLmNoYW5nZS5hdHRyaWJ1dGUgPT09ICdzZWFyY2hUZXh0Jykge1xuICAgICAgICAgICAgICAgIGlmICghbm90aWZpY2F0aW9uLmNoYW5nZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnN1Z2dlc3Rpb25zID0gW11cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVyZW5kZXIoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmZldGNoU3VnZ2VzdGlvbnMobm90aWZpY2F0aW9uLmNoYW5nZS52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5fcmVyZW5kZXIoKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvY29tcGxldGVcbiIsImNvbnN0IFBhcmVudCA9IHdpbmRvdy5EREcuYmFzZS5WaWV3XG5cbmZ1bmN0aW9uIEJyZWFrYWdlRm9ybSAob3BzKSB7XG4gICAgdGhpcy5tb2RlbCA9IG9wcy5tb2RlbFxuICAgIHRoaXMudGVtcGxhdGUgPSBvcHMudGVtcGxhdGVcbiAgICB0aGlzLnNpdGVWaWV3ID0gb3BzLnNpdGVWaWV3XG4gICAgdGhpcy5jbGlja1NvdXJjZSA9IG9wcy5jbGlja1NvdXJjZVxuICAgIHRoaXMuJHJvb3QgPSB3aW5kb3cuJCgnLmpzLWJyZWFrYWdlLWZvcm0nKVxuICAgIFBhcmVudC5jYWxsKHRoaXMsIG9wcylcblxuICAgIHRoaXMuX3NldHVwKClcbn1cblxuQnJlYWthZ2VGb3JtLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIHtcbiAgICAgICAgX3NldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUVsZW1zKCcuanMtYnJlYWthZ2UtZm9ybScsIFtcbiAgICAgICAgICAgICAgICAnY2xvc2UnLFxuICAgICAgICAgICAgICAgICdzdWJtaXQnLFxuICAgICAgICAgICAgICAgICdlbGVtZW50JyxcbiAgICAgICAgICAgICAgICAnbWVzc2FnZScsXG4gICAgICAgICAgICAgICAgJ2Ryb3Bkb3duJ1xuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50cyhbXG4gICAgICAgICAgICAgICAgW3RoaXMuJGNsb3NlLCAnY2xpY2snLCB0aGlzLl9jbG9zZUZvcm1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLiRzdWJtaXQsICdjbGljaycsIHRoaXMuX3N1Ym1pdEZvcm1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLiRkcm9wZG93biwgJ2NoYW5nZScsIHRoaXMuX3NlbGVjdENhdGVnb3J5XVxuICAgICAgICAgICAgXSlcbiAgICAgICAgfSxcblxuICAgICAgICBfY2xvc2VGb3JtOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgLy8gcmVsb2FkIHBhZ2UgYWZ0ZXIgY2xvc2luZyBmb3JtIGlmIHVzZXIgZ290IHRvIGZvcm0gZnJvbVxuICAgICAgICAgICAgLy8gdG9nZ2xpbmcgcHJpdmFjeSBwcm90ZWN0aW9uLiBvdGhlcndpc2UgZGVzdHJveSB2aWV3LlxuICAgICAgICAgICAgaWYgKHRoaXMuY2xpY2tTb3VyY2UgPT09ICd0b2dnbGUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaXRlVmlldy5jbG9zZVBvcHVwQW5kUmVsb2FkKDUwMClcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zdWJtaXRGb3JtOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kc3VibWl0Lmhhc0NsYXNzKCdidG4tZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IHRoaXMuJGRyb3Bkb3duLnZhbCgpXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnN1Ym1pdEJyZWFrYWdlRm9ybShjYXRlZ29yeSlcbiAgICAgICAgICAgIHRoaXMuX3Nob3dUaGFua1lvdU1lc3NhZ2UoKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zaG93VGhhbmtZb3VNZXNzYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy10cmFuc3BhcmVudCcpXG4gICAgICAgICAgICB0aGlzLiRtZXNzYWdlLnJlbW92ZUNsYXNzKCdpcy10cmFuc3BhcmVudCcpXG4gICAgICAgICAgICAvLyByZWxvYWQgcGFnZSBhZnRlciBmb3JtIHN1Ym1pc3Npb24gaWYgdXNlciBnb3QgdG8gZm9ybSBmcm9tXG4gICAgICAgICAgICAvLyB0b2dnbGluZyBwcml2YWN5IHByb3RlY3Rpb24sIG90aGVyd2lzZSBkZXN0cm95IHZpZXcuXG4gICAgICAgICAgICBpZiAodGhpcy5jbGlja1NvdXJjZSA9PT0gJ3RvZ2dsZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNpdGVWaWV3LmNsb3NlUG9wdXBBbmRSZWxvYWQoMzUwMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfc2VsZWN0Q2F0ZWdvcnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBCcmVha2FnZUZvcm1cbiIsImNvbnN0IHsgZm9ybWF0QWRkcmVzcyB9ID0gcmVxdWlyZSgnLi4vLi4vYmFja2dyb3VuZC9lbWFpbC11dGlscy5lczYnKVxuXG5jb25zdCBQYXJlbnQgPSB3aW5kb3cuRERHLmJhc2UuVmlld1xuXG5mdW5jdGlvbiBFbWFpbEFsaWFzVmlldyAob3BzKSB7XG4gICAgdGhpcy5tb2RlbCA9IG9wcy5tb2RlbFxuICAgIHRoaXMucGFnZVZpZXcgPSBvcHMucGFnZVZpZXdcbiAgICB0aGlzLnRlbXBsYXRlID0gb3BzLnRlbXBsYXRlXG5cbiAgICB0aGlzLm1vZGVsLmdldFVzZXJEYXRhKCkudGhlbih1c2VyRGF0YSA9PiB7XG4gICAgICAgIHRoaXMubW9kZWwuc2V0KCd1c2VyRGF0YScsIHVzZXJEYXRhKVxuICAgICAgICBQYXJlbnQuY2FsbCh0aGlzLCBvcHMpXG4gICAgICAgIHRoaXMuX3NldHVwKClcbiAgICB9KVxufVxuXG5FbWFpbEFsaWFzVmlldy5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICB7XG4gICAgICAgIF9jb3B5QWxpYXNUb0NsaXBib2FyZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgYWxpYXMgPSB0aGlzLm1vZGVsLnVzZXJEYXRhLm5leHRBbGlhc1xuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoZm9ybWF0QWRkcmVzcyhhbGlhcykpXG4gICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnc2hvdy1jb3BpZWQtbGFiZWwnKVxuICAgICAgICAgICAgdGhpcy4kZWwub25lKCdhbmltYXRpb25lbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ3Nob3ctY29waWVkLWxhYmVsJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2VuZE1lc3NhZ2UoJ3JlZnJlc2hBbGlhcycpLnRoZW4oKHsgcHJpdmF0ZUFkZHJlc3MgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwudXNlckRhdGEubmV4dEFsaWFzID0gcHJpdmF0ZUFkZHJlc3NcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudHMoW1xuICAgICAgICAgICAgICAgIFt0aGlzLiRlbCwgJ2NsaWNrJywgdGhpcy5fY29weUFsaWFzVG9DbGlwYm9hcmRdXG4gICAgICAgICAgICBdKVxuICAgICAgICB9XG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtYWlsQWxpYXNWaWV3XG4iLCJjb25zdCBQYXJlbnQgPSByZXF1aXJlKCcuL3NsaWRpbmctc3Vidmlldy5lczYuanMnKVxuY29uc3QgcmF0aW5nSGVyb1RlbXBsYXRlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3NoYXJlZC9yYXRpbmctaGVyby5lczYuanMnKVxuY29uc3QgZ3JhZGVzVGVtcGxhdGUgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvc2hhcmVkL2dyYWRlLXNjb3JlY2FyZC1ncmFkZXMuZXM2LmpzJylcbmNvbnN0IHJlYXNvbnNUZW1wbGF0ZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9zaGFyZWQvZ3JhZGUtc2NvcmVjYXJkLXJlYXNvbnMuZXM2LmpzJylcblxuZnVuY3Rpb24gR3JhZGVTY29yZWNhcmQgKG9wcykge1xuICAgIHRoaXMubW9kZWwgPSBvcHMubW9kZWxcbiAgICB0aGlzLnRlbXBsYXRlID0gb3BzLnRlbXBsYXRlXG5cbiAgICBQYXJlbnQuY2FsbCh0aGlzLCBvcHMpXG5cbiAgICB0aGlzLl9zZXR1cCgpXG5cbiAgICB0aGlzLmJpbmRFdmVudHMoW1tcbiAgICAgICAgdGhpcy5zdG9yZS5zdWJzY3JpYmUsXG4gICAgICAgICdjaGFuZ2U6c2l0ZScsXG4gICAgICAgIHRoaXMuX29uU2l0ZUNoYW5nZVxuICAgIF1dKVxuXG4gICAgdGhpcy5zZXR1cENsb3NlKClcbn1cblxuR3JhZGVTY29yZWNhcmQucHJvdG90eXBlID0gd2luZG93LiQuZXh0ZW5kKHt9LFxuICAgIFBhcmVudC5wcm90b3R5cGUsXG4gICAge1xuICAgICAgICBfc2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlRWxlbXMoJy5qcy1ncmFkZS1zY29yZWNhcmQnLCBbXG4gICAgICAgICAgICAgICAgJ3JlYXNvbnMnLFxuICAgICAgICAgICAgICAgICdncmFkZXMnXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICAgdGhpcy4kaGVybyA9IHRoaXMuJCgnLmpzLXJhdGluZy1oZXJvJylcbiAgICAgICAgfSxcblxuICAgICAgICBfcmVyZW5kZXJIZXJvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRoZXJvLnJlcGxhY2VXaXRoKHJhdGluZ0hlcm9UZW1wbGF0ZShcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgICAgIHsgc2hvd0Nsb3NlOiB0cnVlIH1cbiAgICAgICAgICAgICkpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlcmVuZGVyR3JhZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRncmFkZXMucmVwbGFjZVdpdGgoZ3JhZGVzVGVtcGxhdGUodGhpcy5tb2RlbCkpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlcmVuZGVyUmVhc29uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kcmVhc29ucy5yZXBsYWNlV2l0aChyZWFzb25zVGVtcGxhdGUodGhpcy5tb2RlbCkpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uU2l0ZUNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmIChlLmNoYW5nZS5hdHRyaWJ1dGUgPT09ICdzaXRlUmF0aW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcmVuZGVySGVybygpXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVyZW5kZXJHcmFkZXMoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhbGwgdGhlIG90aGVyIHN0dWZmIHdlIHVzZSBpbiB0aGUgcmVhc29uc1xuICAgICAgICAgICAgLy8gKGUuZy4gaHR0cHMsIHRvc2RyKVxuICAgICAgICAgICAgLy8gZG9lc24ndCBjaGFuZ2UgZHluYW1pY2FsbHlcbiAgICAgICAgICAgIGlmIChlLmNoYW5nZS5hdHRyaWJ1dGUgPT09ICd0cmFja2VyTmV0d29ya3MnIHx8XG4gICAgICAgICAgICAgICAgICAgIGUuY2hhbmdlLmF0dHJpYnV0ZSA9PT0gJ2lzYU1ham9yVHJhY2tpbmdOZXR3b3JrJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcmVuZGVyUmVhc29ucygpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHJlY2FjaGUgYW55IHNlbGVjdG9ycyB0aGF0IHdlcmUgcmVyZW5kZXJlZFxuICAgICAgICAgICAgdGhpcy5fc2V0dXAoKVxuICAgICAgICAgICAgdGhpcy5zZXR1cENsb3NlKClcbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBHcmFkZVNjb3JlY2FyZFxuIiwiY29uc3QgUGFyZW50ID0gd2luZG93LkRERy5iYXNlLlZpZXdcbmNvbnN0IG9wZW5PcHRpb25zUGFnZSA9IHJlcXVpcmUoJy4vbWl4aW5zL29wZW4tb3B0aW9ucy1wYWdlLmVzNi5qcycpXG5jb25zdCBicm93c2VyVUlXcmFwcGVyID0gcmVxdWlyZSgnLi8uLi9iYXNlL3VpLXdyYXBwZXIuZXM2LmpzJylcbmNvbnN0IHsgSVNfQkVUQSB9ID0gcmVxdWlyZSgnLi4vLi4vYmFja2dyb3VuZC9jaGFubmVsLmVzNi5qcycpXG5cbmZ1bmN0aW9uIEhhbWJ1cmdlck1lbnUgKG9wcykge1xuICAgIHRoaXMubW9kZWwgPSBvcHMubW9kZWxcbiAgICB0aGlzLnRlbXBsYXRlID0gb3BzLnRlbXBsYXRlXG4gICAgdGhpcy5wYWdlVmlldyA9IG9wcy5wYWdlVmlld1xuICAgIFBhcmVudC5jYWxsKHRoaXMsIG9wcylcblxuICAgIHRoaXMuX3NldHVwKClcbn1cblxuSGFtYnVyZ2VyTWVudS5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICBvcGVuT3B0aW9uc1BhZ2UsXG4gICAge1xuXG4gICAgICAgIF9zZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVFbGVtcygnLmpzLWhhbWJ1cmdlci1tZW51JywgW1xuICAgICAgICAgICAgICAgICdjbG9zZScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMtbGluaycsXG4gICAgICAgICAgICAgICAgJ2ZlZWRiYWNrLWxpbmsnLFxuICAgICAgICAgICAgICAgICdicm9rZW4tc2l0ZS1saW5rJyxcbiAgICAgICAgICAgICAgICAnZGVidWdnZXItcGFuZWwtbGluaydcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudHMoW1xuICAgICAgICAgICAgICAgIFt0aGlzLiRjbG9zZSwgJ2NsaWNrJywgdGhpcy5fY2xvc2VNZW51XSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kb3B0aW9uc2xpbmssICdjbGljaycsIHRoaXMub3Blbk9wdGlvbnNQYWdlXSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kZmVlZGJhY2tsaW5rLCAnY2xpY2snLCB0aGlzLl9oYW5kbGVGZWVkYmFja0NsaWNrXSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kYnJva2Vuc2l0ZWxpbmssICdjbGljaycsIHRoaXMuX2hhbmRsZUJyb2tlblNpdGVDbGlja10sXG4gICAgICAgICAgICAgICAgW3RoaXMubW9kZWwuc3RvcmUuc3Vic2NyaWJlLCAnYWN0aW9uOnNlYXJjaCcsIHRoaXMuX2hhbmRsZUFjdGlvbl0sXG4gICAgICAgICAgICAgICAgW3RoaXMubW9kZWwuc3RvcmUuc3Vic2NyaWJlLCAnY2hhbmdlOnNpdGUnLCB0aGlzLl9oYW5kbGVTaXRlVXBkYXRlXSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kZGVidWdnZXJwYW5lbGxpbmssICdjbGljaycsIHRoaXMuX2hhbmRsZURlYnVnZ2VyQ2xpY2tdXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICAgaWYgKElTX0JFVEEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiQoJyNkZWJ1Z2dlci1wYW5lbCcpLnJlbW92ZUNsYXNzKCdpcy1oaWRkZW4nKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVBY3Rpb246IGZ1bmN0aW9uIChub3RpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24uYWN0aW9uID09PSAnYnVyZ2VyQ2xpY2snKSB0aGlzLl9vcGVuTWVudSgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29wZW5NZW51OiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2lzLWhpZGRlbicpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2Nsb3NlTWVudTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdpcy1oaWRkZW4nKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVGZWVkYmFja0NsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgICAgICAgIGJyb3dzZXJVSVdyYXBwZXIub3BlbkV4dGVuc2lvblBhZ2UoJy9odG1sL2ZlZWRiYWNrLmh0bWwnKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVCcm9rZW5TaXRlQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdpcy1oaWRkZW4nKVxuICAgICAgICAgICAgdGhpcy5wYWdlVmlldy52aWV3cy5zaXRlLnNob3dCcmVha2FnZUZvcm0oJ3JlcG9ydEJyb2tlblNpdGUnKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVTaXRlVXBkYXRlOiBmdW5jdGlvbiAobm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uICYmIG5vdGlmaWNhdGlvbi5jaGFuZ2UuYXR0cmlidXRlID09PSAndGFiJykge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwudGFiVXJsID0gbm90aWZpY2F0aW9uLmNoYW5nZS52YWx1ZS51cmxcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXJlbmRlcigpXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0dXAoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVEZWJ1Z2dlckNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCAodGFicykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhYklkID0gdGFicy5sZW5ndGggPiAwID8gdGFic1swXS5pZCA6ICcnXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYC9odG1sL2RldnRvb2xzLXBhbmVsLmh0bWw/dGFiSWQ9JHt0YWJJZH1gKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhbWJ1cmdlck1lbnVcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFuaW1hdGVHcmFwaEJhcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcblxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYuJGdyYXBoYmFyZmcpIHJldHVyblxuICAgICAgICAgICAgc2VsZi4kZ3JhcGhiYXJmZy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0ICRlbCA9IHdpbmRvdy4kKGVsKVxuICAgICAgICAgICAgICAgIGNvbnN0IHcgPSAkZWwuZGF0YSgpLndpZHRoXG4gICAgICAgICAgICAgICAgJGVsLmNzcygnd2lkdGgnLCB3ICsgJyUnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSwgMjUwKVxuXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi4kcGN0KSByZXR1cm5cbiAgICAgICAgICAgIHNlbGYuJHBjdC5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0ICRlbCA9IHdpbmRvdy4kKGVsKVxuICAgICAgICAgICAgICAgICRlbC5jc3MoJ2NvbG9yJywgJyMzMzMzMzMnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSwgNzAwKVxuICAgIH1cbn1cbiIsImNvbnN0IGJyb3dzZXJVSVdyYXBwZXIgPSByZXF1aXJlKCcuLy4uLy4uL2Jhc2UvdWktd3JhcHBlci5lczYuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBvcGVuT3B0aW9uc1BhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5tb2RlbC5zZW5kTWVzc2FnZSgnZ2V0QnJvd3NlcicpLnRoZW4oYnJvd3NlciA9PiB7XG4gICAgICAgICAgICBicm93c2VyVUlXcmFwcGVyLm9wZW5PcHRpb25zUGFnZShicm93c2VyKVxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsImNvbnN0IFBhcmVudFNsaWRpbmdTdWJ2aWV3ID0gcmVxdWlyZSgnLi9zbGlkaW5nLXN1YnZpZXcuZXM2LmpzJylcblxuZnVuY3Rpb24gUHJpdmFjeVByYWN0aWNlcyAob3BzKSB7XG4gICAgdGhpcy5tb2RlbCA9IG9wcy5tb2RlbFxuICAgIHRoaXMudGVtcGxhdGUgPSBvcHMudGVtcGxhdGVcblxuICAgIFBhcmVudFNsaWRpbmdTdWJ2aWV3LmNhbGwodGhpcywgb3BzKVxuXG4gICAgdGhpcy5zZXR1cENsb3NlKClcbn1cblxuUHJpdmFjeVByYWN0aWNlcy5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50U2xpZGluZ1N1YnZpZXcucHJvdG90eXBlLFxuICAgIHtcbiAgICB9XG4pXG5cbm1vZHVsZS5leHBvcnRzID0gUHJpdmFjeVByYWN0aWNlc1xuIiwiY29uc3QgUGFyZW50ID0gd2luZG93LkRERy5iYXNlLlZpZXdcbmNvbnN0IEZPQ1VTX0NMQVNTID0gJ2dvLS1mb2N1c2VkJ1xuXG5mdW5jdGlvbiBTZWFyY2ggKG9wcykge1xuICAgIHRoaXMubW9kZWwgPSBvcHMubW9kZWxcbiAgICB0aGlzLnBhZ2VWaWV3ID0gb3BzLnBhZ2VWaWV3XG4gICAgdGhpcy50ZW1wbGF0ZSA9IG9wcy50ZW1wbGF0ZVxuICAgIFBhcmVudC5jYWxsKHRoaXMsIG9wcylcblxuICAgIHRoaXMuX2NhY2hlRWxlbXMoJy5qcy1zZWFyY2gnLCBbXG4gICAgICAgICdmb3JtJyxcbiAgICAgICAgJ2lucHV0JyxcbiAgICAgICAgJ2dvJyxcbiAgICAgICAgJ2hhbWJ1cmdlci1idXR0b24nXG4gICAgXSlcblxuICAgIHRoaXMuYmluZEV2ZW50cyhbXG4gICAgICAgIFt0aGlzLiRpbnB1dCwgJ2lucHV0JywgdGhpcy5faGFuZGxlSW5wdXRdLFxuICAgICAgICBbdGhpcy4kaW5wdXQsICdibHVyJywgdGhpcy5faGFuZGxlQmx1cl0sXG4gICAgICAgIFt0aGlzLiRnbywgJ2NsaWNrJywgdGhpcy5faGFuZGxlU3VibWl0XSxcbiAgICAgICAgW3RoaXMuJGZvcm0sICdzdWJtaXQnLCB0aGlzLl9oYW5kbGVTdWJtaXRdLFxuICAgICAgICBbdGhpcy4kaGFtYnVyZ2VyYnV0dG9uLCAnY2xpY2snLCB0aGlzLl9oYW5kbGVCdXJnZXJDbGlja11cbiAgICBdKVxuXG4gICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy4kaW5wdXQuZm9jdXMoKSwgMjAwKVxufVxuXG5TZWFyY2gucHJvdG90eXBlID0gd2luZG93LiQuZXh0ZW5kKHt9LFxuICAgIFBhcmVudC5wcm90b3R5cGUsXG4gICAge1xuXG4gICAgICAgIC8vIEhvdmVyIGVmZmVjdCBvbiBzZWFyY2ggYnV0dG9uIHdoaWxlIHR5cGluZ1xuICAgICAgICBfYWRkSG92ZXJFZmZlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy4kZ28uaGFzQ2xhc3MoRk9DVVNfQ0xBU1MpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZ28uYWRkQ2xhc3MoRk9DVVNfQ0xBU1MpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbW92ZUhvdmVyRWZmZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZ28uaGFzQ2xhc3MoRk9DVVNfQ0xBU1MpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZ28ucmVtb3ZlQ2xhc3MoRk9DVVNfQ0xBU1MpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2hhbmRsZUJsdXI6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVIb3ZlckVmZmVjdCgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2hhbmRsZUlucHV0OiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoVGV4dCA9IHRoaXMuJGlucHV0LnZhbCgpXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNldCgnc2VhcmNoVGV4dCcsIHNlYXJjaFRleHQpXG5cbiAgICAgICAgICAgIGlmIChzZWFyY2hUZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEhvdmVyRWZmZWN0KClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlSG92ZXJFZmZlY3QoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTZWFyY2ggc3VibWl0IGZvciAke3RoaXMuJGlucHV0LnZhbCgpfWApXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmRvU2VhcmNoKHRoaXMuJGlucHV0LnZhbCgpKVxuICAgICAgICAgICAgd2luZG93LmNsb3NlKClcbiAgICAgICAgfSxcblxuICAgICAgICBfaGFuZGxlQnVyZ2VyQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2VuZCgnYnVyZ2VyQ2xpY2snKVxuICAgICAgICB9XG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaFxuIiwiY29uc3QgUGFyZW50ID0gd2luZG93LkRERy5iYXNlLlZpZXdcbmNvbnN0IEdyYWRlU2NvcmVjYXJkVmlldyA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZ3JhZGUtc2NvcmVjYXJkLmVzNi5qcycpXG5jb25zdCBUcmFja2VyTmV0d29ya3NWaWV3ID0gcmVxdWlyZSgnLi8uLi92aWV3cy90cmFja2VyLW5ldHdvcmtzLmVzNi5qcycpXG5jb25zdCBQcml2YWN5UHJhY3RpY2VzVmlldyA9IHJlcXVpcmUoJy4vLi4vdmlld3MvcHJpdmFjeS1wcmFjdGljZXMuZXM2LmpzJylcbmNvbnN0IEJyZWFrYWdlRm9ybVZpZXcgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2JyZWFrYWdlLWZvcm0uZXM2LmpzJylcbmNvbnN0IGdyYWRlU2NvcmVjYXJkVGVtcGxhdGUgPSByZXF1aXJlKCcuLy4uL3RlbXBsYXRlcy9ncmFkZS1zY29yZWNhcmQuZXM2LmpzJylcbmNvbnN0IHRyYWNrZXJOZXR3b3Jrc1RlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi90ZW1wbGF0ZXMvdHJhY2tlci1uZXR3b3Jrcy5lczYuanMnKVxuY29uc3QgcHJpdmFjeVByYWN0aWNlc1RlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi90ZW1wbGF0ZXMvcHJpdmFjeS1wcmFjdGljZXMuZXM2LmpzJylcbmNvbnN0IGJyZWFrYWdlRm9ybVRlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi90ZW1wbGF0ZXMvYnJlYWthZ2UtZm9ybS5lczYuanMnKVxuY29uc3Qgb3Blbk9wdGlvbnNQYWdlID0gcmVxdWlyZSgnLi9taXhpbnMvb3Blbi1vcHRpb25zLXBhZ2UuZXM2LmpzJylcbmNvbnN0IGJyb3dzZXJVSVdyYXBwZXIgPSByZXF1aXJlKCcuLy4uL2Jhc2UvdWktd3JhcHBlci5lczYuanMnKVxuXG5mdW5jdGlvbiBTaXRlIChvcHMpIHtcbiAgICB0aGlzLm1vZGVsID0gb3BzLm1vZGVsXG4gICAgdGhpcy5wYWdlVmlldyA9IG9wcy5wYWdlVmlld1xuICAgIHRoaXMudGVtcGxhdGUgPSBvcHMudGVtcGxhdGVcblxuICAgIC8vIGNhY2hlICdib2R5JyBzZWxlY3RvclxuICAgIHRoaXMuJGJvZHkgPSB3aW5kb3cuJCgnYm9keScpXG5cbiAgICAvLyBnZXQgZGF0YSBmcm9tIGJhY2tncm91bmQgcHJvY2VzcywgdGhlbiByZS1yZW5kZXIgdGVtcGxhdGUgd2l0aCBpdFxuICAgIHRoaXMubW9kZWwuZ2V0QmFja2dyb3VuZFRhYkRhdGEoKS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubW9kZWwudGFiICYmXG4gICAgICAgICAgICAgICAgKHRoaXMubW9kZWwudGFiLnN0YXR1cyA9PT0gJ2NvbXBsZXRlJyB8fCB0aGlzLm1vZGVsLmRvbWFpbiA9PT0gJ25ldyB0YWInKSkge1xuICAgICAgICAgICAgLy8gcmVuZGVyIHRlbXBsYXRlIGZvciB0aGUgZmlyc3QgdGltZSBoZXJlXG4gICAgICAgICAgICBQYXJlbnQuY2FsbCh0aGlzLCBvcHMpXG4gICAgICAgICAgICB0aGlzLl9zZXR1cCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgdGltZW91dCBoZWxwcyBidWZmZXIgdGhlIHJlLXJlbmRlciBjeWNsZSBkdXJpbmcgaGVhdnlcbiAgICAgICAgICAgIC8vIHBhZ2UgbG9hZHMgd2l0aCBsb3RzIG9mIHRyYWNrZXJzXG4gICAgICAgICAgICBQYXJlbnQuY2FsbCh0aGlzLCBvcHMpXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVyZW5kZXIoKSwgNzUwKVxuICAgICAgICB9XG4gICAgfSlcbn1cblxuU2l0ZS5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICBvcGVuT3B0aW9uc1BhZ2UsXG4gICAge1xuICAgICAgICBfb25Ub2dnbGVDbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLiRib2R5Lmhhc0NsYXNzKCdpcy1kaXNhYmxlZCcpKSByZXR1cm5cblxuICAgICAgICAgICAgdGhpcy5tb2RlbC50b2dnbGVBbGxvd2xpc3QoKVxuICAgICAgICAgICAgaWYgKCF0aGlzLm1vZGVsLmlzQnJva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWxsb3dsaXN0ZWQgPSB0aGlzLm1vZGVsLmlzQWxsb3dsaXN0ZWRcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93QWxsb3dsaXN0ZWRTdGF0dXNNZXNzYWdlKCFhbGxvd2xpc3RlZClcblxuICAgICAgICAgICAgICAgIGlmIChhbGxvd2xpc3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaG93QnJlYWthZ2VDb25maXJtYXRpb24oKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZVBvcHVwQW5kUmVsb2FkKDE1MDApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gSWYgd2UganVzdCBhbGxvd2xpc3RlZCBhIHNpdGUsIHNob3cgYSBtZXNzYWdlIGJyaWVmbHkgYmVmb3JlIHJlbG9hZGluZ1xuICAgICAgICAvLyBvdGhlcndpc2UganVzdCByZWxvYWQgdGhlIHRhYiBhbmQgY2xvc2UgdGhlIHBvcHVwXG4gICAgICAgIF9zaG93QWxsb3dsaXN0ZWRTdGF0dXNNZXNzYWdlOiBmdW5jdGlvbiAocmVsb2FkKSB7XG4gICAgICAgICAgICBjb25zdCBpc1RyYW5zcGFyZW50Q2xhc3MgPSAnaXMtdHJhbnNwYXJlbnQnXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVyZW5kZXJpbmcgdG8gYmUgZG9uZVxuICAgICAgICAgICAgLy8gMTBtcyB0aW1lb3V0IGlzIHRoZSBtaW5pbXVtIHRvIHJlbmRlciB0aGUgdHJhbnNpdGlvbiBzbW9vdGhseVxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLiRhbGxvd2xpc3RzdGF0dXMucmVtb3ZlQ2xhc3MoaXNUcmFuc3BhcmVudENsYXNzKSwgMTApXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuJHByb3RlY3Rpb24uYWRkQ2xhc3MoaXNUcmFuc3BhcmVudENsYXNzKSwgMTApXG5cbiAgICAgICAgICAgIGlmIChyZWxvYWQpIHtcbiAgICAgICAgICAgICAgICAvLyBXYWl0IGEgYml0IG1vcmUgYmVmb3JlIGNsb3NpbmcgdGhlIHBvcHVwIGFuZCByZWxvYWRpbmcgdGhlIHRhYlxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VQb3B1cEFuZFJlbG9hZCgxNTAwKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIE5PVEU6IGFmdGVyIC5fc2V0dXAoKSBpcyBjYWxsZWQgdGhpcyB2aWV3IGxpc3RlbnMgZm9yIGNoYW5nZXMgdG9cbiAgICAgICAgLy8gc2l0ZSBtb2RlbCBhbmQgcmUtcmVuZGVycyBldmVyeSB0aW1lIG1vZGVsIHByb3BlcnRpZXMgY2hhbmdlXG4gICAgICAgIF9zZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1tzaXRlIHZpZXddIF9zZXR1cCgpJylcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlRWxlbXMoJy5qcy1zaXRlJywgW1xuICAgICAgICAgICAgICAgICd0b2dnbGUnLFxuICAgICAgICAgICAgICAgICdwcm90ZWN0aW9uJyxcbiAgICAgICAgICAgICAgICAnYWxsb3dsaXN0LXN0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3Nob3ctYWxsLXRyYWNrZXJzJyxcbiAgICAgICAgICAgICAgICAnc2hvdy1wYWdlLXRyYWNrZXJzJyxcbiAgICAgICAgICAgICAgICAnbWFuYWdlLWFsbG93bGlzdCcsXG4gICAgICAgICAgICAgICAgJ21hbmFnZS1hbGxvd2xpc3QtbGknLFxuICAgICAgICAgICAgICAgICdyZXBvcnQtYnJva2VuJyxcbiAgICAgICAgICAgICAgICAncHJpdmFjeS1wcmFjdGljZXMnLFxuICAgICAgICAgICAgICAgICdjb25maXJtLWJyZWFrYWdlLWxpJyxcbiAgICAgICAgICAgICAgICAnY29uZmlybS1icmVha2FnZScsXG4gICAgICAgICAgICAgICAgJ2NvbmZpcm0tYnJlYWthZ2UteWVzJyxcbiAgICAgICAgICAgICAgICAnY29uZmlybS1icmVha2FnZS1ubycsXG4gICAgICAgICAgICAgICAgJ2NvbmZpcm0tYnJlYWthZ2UtbWVzc2FnZSdcbiAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgIHRoaXMuJGdyYWRlc2NvcmVjYXJkID0gdGhpcy4kKCcuanMtaGVyby1vcGVuJylcblxuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnRzKFtcbiAgICAgICAgICAgICAgICBbdGhpcy4kdG9nZ2xlLCAnY2xpY2snLCB0aGlzLl9vblRvZ2dsZUNsaWNrXSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kc2hvd3BhZ2V0cmFja2VycywgJ2NsaWNrJywgdGhpcy5fc2hvd1BhZ2VUcmFja2Vyc10sXG4gICAgICAgICAgICAgICAgW3RoaXMuJHByaXZhY3lwcmFjdGljZXMsICdjbGljaycsIHRoaXMuX3Nob3dQcml2YWN5UHJhY3RpY2VzXSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kY29uZmlybWJyZWFrYWdleWVzLCAnY2xpY2snLCB0aGlzLl9vbkNvbmZpcm1Ccm9rZW5DbGlja10sXG4gICAgICAgICAgICAgICAgW3RoaXMuJGNvbmZpcm1icmVha2FnZW5vLCAnY2xpY2snLCB0aGlzLl9vbkNvbmZpcm1Ob3RCcm9rZW5DbGlja10sXG4gICAgICAgICAgICAgICAgW3RoaXMuJGdyYWRlc2NvcmVjYXJkLCAnY2xpY2snLCB0aGlzLl9zaG93R3JhZGVTY29yZWNhcmRdLFxuICAgICAgICAgICAgICAgIFt0aGlzLiRtYW5hZ2VhbGxvd2xpc3QsICdjbGljaycsIHRoaXMuX29uTWFuYWdlQWxsb3dsaXN0Q2xpY2tdLFxuICAgICAgICAgICAgICAgIFt0aGlzLiRyZXBvcnRicm9rZW4sICdjbGljaycsIHRoaXMuX29uUmVwb3J0QnJva2VuU2l0ZUNsaWNrXSxcbiAgICAgICAgICAgICAgICBbdGhpcy5zdG9yZS5zdWJzY3JpYmUsICdjaGFuZ2U6c2l0ZScsIHRoaXMucmVyZW5kZXJdXG4gICAgICAgICAgICBdKVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IHJlcmVuZGVycyB3aGVuIGNvbmZpcm1hdGlvbiBmb3JtIGlzIGFjdGl2ZSxcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBmb3JtIHdpbGwgZGlzYXBwZWFyIG9uIHJlcmVuZGVyLlxuICAgICAgICAgICAgaWYgKHRoaXMuJGJvZHkuaGFzQ2xhc3MoJ2NvbmZpcm1hdGlvbi1hY3RpdmUnKSkgcmV0dXJuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsICYmIHRoaXMubW9kZWwuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuJGJvZHkuaGFzQ2xhc3MoJ2lzLWRpc2FibGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyRib2R5LmFkZENsYXNzKCkgaXMtZGlzYWJsZWQnKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRib2R5LmFkZENsYXNzKCdpcy1kaXNhYmxlZCcpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlcmVuZGVyKClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0dXAoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kYm9keS5yZW1vdmVDbGFzcygnaXMtZGlzYWJsZWQnKVxuICAgICAgICAgICAgICAgIHRoaXMudW5iaW5kRXZlbnRzKClcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXJlbmRlcigpXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0dXAoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1hbmFnZUFsbG93bGlzdENsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbCAmJiB0aGlzLm1vZGVsLmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3Blbk9wdGlvbnNQYWdlKClcbiAgICAgICAgfSxcblxuICAgICAgICBfb25SZXBvcnRCcm9rZW5TaXRlQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwgJiYgdGhpcy5tb2RlbC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNob3dCcmVha2FnZUZvcm0oJ3JlcG9ydEJyb2tlblNpdGUnKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNvbmZpcm1Ccm9rZW5DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgaXNIaWRkZW5DbGFzcyA9ICdpcy1oaWRkZW4nXG4gICAgICAgICAgICB0aGlzLiRtYW5hZ2VhbGxvd2xpc3RsaS5yZW1vdmVDbGFzcyhpc0hpZGRlbkNsYXNzKVxuICAgICAgICAgICAgdGhpcy4kY29uZmlybWJyZWFrYWdlbGkuYWRkQ2xhc3MoaXNIaWRkZW5DbGFzcylcbiAgICAgICAgICAgIHRoaXMuJGJvZHkucmVtb3ZlQ2xhc3MoJ2NvbmZpcm1hdGlvbi1hY3RpdmUnKVxuICAgICAgICAgICAgdGhpcy5zaG93QnJlYWthZ2VGb3JtKCd0b2dnbGUnKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNvbmZpcm1Ob3RCcm9rZW5DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgaXNUcmFuc3BhcmVudENsYXNzID0gJ2lzLXRyYW5zcGFyZW50J1xuICAgICAgICAgICAgdGhpcy4kY29uZmlybWJyZWFrYWdlbWVzc2FnZS5yZW1vdmVDbGFzcyhpc1RyYW5zcGFyZW50Q2xhc3MpXG4gICAgICAgICAgICB0aGlzLiRjb25maXJtYnJlYWthZ2UuYWRkQ2xhc3MoaXNUcmFuc3BhcmVudENsYXNzKVxuICAgICAgICAgICAgdGhpcy4kYm9keS5yZW1vdmVDbGFzcygnY29uZmlybWF0aW9uLWFjdGl2ZScpXG4gICAgICAgICAgICB0aGlzLmNsb3NlUG9wdXBBbmRSZWxvYWQoMTUwMClcbiAgICAgICAgfSxcblxuICAgICAgICBfc2hvd0JyZWFrYWdlQ29uZmlybWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRib2R5LmFkZENsYXNzKCdjb25maXJtYXRpb24tYWN0aXZlJylcbiAgICAgICAgICAgIHRoaXMuJGNvbmZpcm1icmVha2FnZWxpLnJlbW92ZUNsYXNzKCdpcy1oaWRkZW4nKVxuICAgICAgICAgICAgdGhpcy4kbWFuYWdlYWxsb3dsaXN0bGkuYWRkQ2xhc3MoJ2lzLWhpZGRlbicpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gcGFzcyBjbGlja1NvdXJjZSB0byBzcGVjaWZ5IHdoZXRoZXIgcGFnZSBzaG91bGQgcmVsb2FkXG4gICAgICAgIC8vIGFmdGVyIHN1Ym1pdHRpbmcgYnJlYWthZ2UgZm9ybS5cbiAgICAgICAgc2hvd0JyZWFrYWdlRm9ybTogZnVuY3Rpb24gKGNsaWNrU291cmNlKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdzLmJyZWFrYWdlRm9ybSA9IG5ldyBCcmVha2FnZUZvcm1WaWV3KHtcbiAgICAgICAgICAgICAgICBzaXRlVmlldzogdGhpcyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogYnJlYWthZ2VGb3JtVGVtcGxhdGUsXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IHRoaXMuJGJvZHksXG4gICAgICAgICAgICAgICAgY2xpY2tTb3VyY2U6IGNsaWNrU291cmNlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zaG93UGFnZVRyYWNrZXJzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGJvZHkuaGFzQ2xhc3MoJ2lzLWRpc2FibGVkJykpIHJldHVyblxuICAgICAgICAgICAgdGhpcy52aWV3cy5zbGlkaW5nU3VidmlldyA9IG5ldyBUcmFja2VyTmV0d29ya3NWaWV3KHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdHJhY2tlck5ldHdvcmtzVGVtcGxhdGVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3Nob3dQcml2YWN5UHJhY3RpY2VzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICAgICAgICB0aGlzLnZpZXdzLnByaXZhY3lQcmFjdGljZXMgPSBuZXcgUHJpdmFjeVByYWN0aWNlc1ZpZXcoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBwcml2YWN5UHJhY3RpY2VzVGVtcGxhdGUsXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3Nob3dHcmFkZVNjb3JlY2FyZDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmRpc2FibGVkKSByZXR1cm5cblxuICAgICAgICAgICAgdGhpcy52aWV3cy5ncmFkZVNjb3JlY2FyZCA9IG5ldyBHcmFkZVNjb3JlY2FyZFZpZXcoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBncmFkZVNjb3JlY2FyZFRlbXBsYXRlLFxuICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlUG9wdXBBbmRSZWxvYWQ6IGZ1bmN0aW9uIChkZWxheSkge1xuICAgICAgICAgICAgZGVsYXkgPSBkZWxheSB8fCAwXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBicm93c2VyVUlXcmFwcGVyLnJlbG9hZFRhYih0aGlzLm1vZGVsLnRhYi5pZClcbiAgICAgICAgICAgICAgICBicm93c2VyVUlXcmFwcGVyLmNsb3NlUG9wdXAoKVxuICAgICAgICAgICAgfSwgZGVsYXkpXG4gICAgICAgIH1cbiAgICB9XG4pXG5cbm1vZHVsZS5leHBvcnRzID0gU2l0ZVxuIiwiY29uc3QgUGFyZW50ID0gd2luZG93LkRERy5iYXNlLlZpZXdcblxuZnVuY3Rpb24gU2xpZGluZ1N1YnZpZXcgKG9wcykge1xuICAgIG9wcy5hcHBlbmRUbyA9IHdpbmRvdy4kKCcuc2xpZGluZy1zdWJ2aWV3LS1yb290JylcbiAgICBQYXJlbnQuY2FsbCh0aGlzLCBvcHMpXG5cbiAgICB0aGlzLiRyb290ID0gd2luZG93LiQoJy5zbGlkaW5nLXN1YnZpZXctLXJvb3QnKVxuICAgIHRoaXMuJHJvb3QuYWRkQ2xhc3MoJ3NsaWRpbmctc3Vidmlldy0tb3BlbicpXG5cbiAgICB0aGlzLnNldHVwQ2xvc2UoKVxufVxuXG5TbGlkaW5nU3Vidmlldy5wcm90b3R5cGUgPSB3aW5kb3cuJC5leHRlbmQoe30sXG4gICAgUGFyZW50LnByb3RvdHlwZSxcbiAgICB7XG5cbiAgICAgICAgc2V0dXBDbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVFbGVtcygnLmpzLXNsaWRpbmctc3VidmlldycsIFsnY2xvc2UnXSlcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50cyhbXG4gICAgICAgICAgICAgICAgW3RoaXMuJGNsb3NlLCAnY2xpY2snLCB0aGlzLl9kZXN0cm95XVxuICAgICAgICAgICAgXSlcbiAgICAgICAgfSxcblxuICAgICAgICBfZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kcm9vdC5yZW1vdmVDbGFzcygnc2xpZGluZy1zdWJ2aWV3LS1vcGVuJylcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKVxuICAgICAgICAgICAgfSwgNDAwKSAvLyA0MDBtcyA9IDAuMzVzIGluIC5zbGlkaW5nLXN1YnZpZXctLXJvb3QgdHJhbnNpdGlvbiArIDUwbXMgcGFkZGluZ1xuICAgICAgICB9XG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNsaWRpbmdTdWJ2aWV3XG4iLCJjb25zdCBQYXJlbnQgPSB3aW5kb3cuRERHLmJhc2UuVmlld1xuY29uc3QgVG9wQmxvY2tlZEZ1bGxWaWV3ID0gcmVxdWlyZSgnLi90b3AtYmxvY2tlZC5lczYuanMnKVxuY29uc3QgdG9wQmxvY2tlZEZ1bGxUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vLi4vdGVtcGxhdGVzL3RvcC1ibG9ja2VkLmVzNi5qcycpXG5jb25zdCBUT1BfQkxPQ0tFRF9DTEFTUyA9ICdoYXMtdG9wLWJsb2NrZWQtLXRydW5jYXRlZCdcblxuZnVuY3Rpb24gVHJ1bmNhdGVkVG9wQmxvY2tlZCAob3BzKSB7XG4gICAgdGhpcy5tb2RlbCA9IG9wcy5tb2RlbFxuICAgIHRoaXMucGFnZVZpZXcgPSBvcHMucGFnZVZpZXdcbiAgICB0aGlzLnRlbXBsYXRlID0gb3BzLnRlbXBsYXRlXG5cbiAgICB0aGlzLm1vZGVsLmdldFRvcEJsb2NrZWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgUGFyZW50LmNhbGwodGhpcywgb3BzKVxuICAgICAgICB0aGlzLl9zZXR1cCgpXG4gICAgfSlcblxuICAgIHRoaXMuYmluZEV2ZW50cyhbXG4gICAgICAgIFt0aGlzLm1vZGVsLnN0b3JlLnN1YnNjcmliZSwgJ2FjdGlvbjpiYWNrZ3JvdW5kTWVzc2FnZScsIHRoaXMuaGFuZGxlQmFja2dyb3VuZE1zZ11cbiAgICBdKVxufVxuXG5UcnVuY2F0ZWRUb3BCbG9ja2VkLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIHtcblxuICAgICAgICBfc2VlQWxsQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudmlld3Muc2xpZGluZ1N1YnZpZXcgPSBuZXcgVG9wQmxvY2tlZEZ1bGxWaWV3KHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdG9wQmxvY2tlZEZ1bGxUZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICBudW1JdGVtczogMTBcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUVsZW1zKCcuanMtdG9wLWJsb2NrZWQnLCBbJ2dyYXBoLWJhci1mZycsICdwY3QnLCAnc2VlLWFsbCddKVxuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnRzKFtcbiAgICAgICAgICAgICAgICBbdGhpcy4kc2VlYWxsLCAnY2xpY2snLCB0aGlzLl9zZWVBbGxDbGlja11cbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBpZiAod2luZG93LiQoJy50b3AtYmxvY2tlZC0tdHJ1bmNhdGVkJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LiQoJ2h0bWwnKS5hZGRDbGFzcyhUT1BfQkxPQ0tFRF9DTEFTUylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZXJlbmRlckxpc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcmVuZGVyKClcbiAgICAgICAgICAgIHRoaXMuX3NldHVwKClcbiAgICAgICAgfSxcblxuICAgICAgICBoYW5kbGVCYWNrZ3JvdW5kTXNnOiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgaWYgKCFtZXNzYWdlIHx8ICFtZXNzYWdlLmFjdGlvbikgcmV0dXJuXG5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gJ2RpZFJlc2V0VHJhY2tlcnNEYXRhJykge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucmVzZXQoKVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZXJlbmRlckxpc3QoKSwgNzUwKVxuICAgICAgICAgICAgICAgIHRoaXMucmVyZW5kZXJMaXN0KClcbiAgICAgICAgICAgICAgICB3aW5kb3cuJCgnaHRtbCcpLnJlbW92ZUNsYXNzKFRPUF9CTE9DS0VEX0NMQVNTKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRydW5jYXRlZFRvcEJsb2NrZWRcbiIsImNvbnN0IFBhcmVudFNsaWRpbmdTdWJ2aWV3ID0gcmVxdWlyZSgnLi9zbGlkaW5nLXN1YnZpZXcuZXM2LmpzJylcbmNvbnN0IGFuaW1hdGVHcmFwaEJhcnMgPSByZXF1aXJlKCcuL21peGlucy9hbmltYXRlLWdyYXBoLWJhcnMuZXM2LmpzJylcbmNvbnN0IFRvcEJsb2NrZWRNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL3RvcC1ibG9ja2VkLmVzNi5qcycpXG5cbmZ1bmN0aW9uIFRvcEJsb2NrZWQgKG9wcykge1xuICAgIC8vIG1vZGVsIGRhdGEgaXMgYXN5bmNcbiAgICB0aGlzLm1vZGVsID0gbnVsbFxuICAgIHRoaXMubnVtSXRlbXMgPSBvcHMubnVtSXRlbXNcbiAgICB0aGlzLnRlbXBsYXRlID0gb3BzLnRlbXBsYXRlXG4gICAgUGFyZW50U2xpZGluZ1N1YnZpZXcuY2FsbCh0aGlzLCBvcHMpXG5cbiAgICB0aGlzLnNldHVwQ2xvc2UoKVxuICAgIHRoaXMucmVuZGVyQXN5bmNDb250ZW50KClcblxuICAgIHRoaXMuYmluZEV2ZW50cyhbXG4gICAgICAgIFt0aGlzLm1vZGVsLnN0b3JlLnN1YnNjcmliZSwgJ2FjdGlvbjpiYWNrZ3JvdW5kTWVzc2FnZScsIHRoaXMuaGFuZGxlQmFja2dyb3VuZE1zZ11cbiAgICBdKVxufVxuXG5Ub3BCbG9ja2VkLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnRTbGlkaW5nU3Vidmlldy5wcm90b3R5cGUsXG4gICAgYW5pbWF0ZUdyYXBoQmFycyxcbiAgICB7XG5cbiAgICAgICAgc2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnQgPSB0aGlzLiRlbC5maW5kKCcuanMtdG9wLWJsb2NrZWQtY29udGVudCcpXG4gICAgICAgICAgICAvLyBsaXN0ZW5lciBmb3IgcmVzZXQgc3RhdHMgY2xpY2tcbiAgICAgICAgICAgIHRoaXMuJHJlc2V0ID0gdGhpcy4kZWwuZmluZCgnLmpzLXJlc2V0LXRyYWNrZXJzLWRhdGEnKVxuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnRzKFtcbiAgICAgICAgICAgICAgICBbdGhpcy4kcmVzZXQsICdjbGljaycsIHRoaXMucmVzZXRUcmFja2Vyc1N0YXRzXVxuICAgICAgICAgICAgXSlcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJBc3luY0NvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmRvbSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMClcbiAgICAgICAgICAgIHRoaXMubW9kZWwgPSBuZXcgVG9wQmxvY2tlZE1vZGVsKHtcbiAgICAgICAgICAgICAgICBtb2RlbE5hbWU6ICd0b3BCbG9ja2VkJyArIHJhbmRvbSxcbiAgICAgICAgICAgICAgICBudW1Db21wYW5pZXM6IHRoaXMubnVtSXRlbXNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmdldFRvcEJsb2NrZWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy50ZW1wbGF0ZSgpXG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cCgpXG5cbiAgICAgICAgICAgICAgICAvLyBhbmltYXRlIGdyYXBoIGJhcnMgYW5kIHBjdFxuICAgICAgICAgICAgICAgIHRoaXMuJGdyYXBoYmFyZmcgPSB0aGlzLiRlbC5maW5kKCcuanMtdG9wLWJsb2NrZWQtZ3JhcGgtYmFyLWZnJylcbiAgICAgICAgICAgICAgICB0aGlzLiRwY3QgPSB0aGlzLiRlbC5maW5kKCcuanMtdG9wLWJsb2NrZWQtcGN0JylcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVHcmFwaEJhcnMoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZXNldFRyYWNrZXJzU3RhdHM6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNlbmRNZXNzYWdlKCdyZXNldFRyYWNrZXJzRGF0YScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlQmFja2dyb3VuZE1zZzogZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlmICghbWVzc2FnZSB8fCAhbWVzc2FnZS5hY3Rpb24pIHJldHVyblxuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5hY3Rpb24gPT09ICdkaWRSZXNldFRyYWNrZXJzRGF0YScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnJlc2V0KG1lc3NhZ2UuZGF0YSlcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy50ZW1wbGF0ZSgpXG4gICAgICAgICAgICAgICAgdGhpcy4kY29udGVudC5yZXBsYWNlV2l0aChjb250ZW50KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRvcEJsb2NrZWRcbiIsImNvbnN0IFBhcmVudFNsaWRpbmdTdWJ2aWV3ID0gcmVxdWlyZSgnLi9zbGlkaW5nLXN1YnZpZXcuZXM2LmpzJylcbmNvbnN0IGhlcm9UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vLi4vdGVtcGxhdGVzL3NoYXJlZC9oZXJvLmVzNi5qcycpXG5jb25zdCBDb21wYW55TGlzdE1vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvc2l0ZS1jb21wYW55LWxpc3QuZXM2LmpzJylcbmNvbnN0IFNpdGVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL3NpdGUuZXM2LmpzJylcbmNvbnN0IHRyYWNrZXJOZXR3b3Jrc0ljb25UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vLi4vdGVtcGxhdGVzL3NoYXJlZC90cmFja2VyLW5ldHdvcmstaWNvbi5lczYuanMnKVxuY29uc3QgdHJhY2tlck5ldHdvcmtzVGV4dFRlbXBsYXRlID0gcmVxdWlyZSgnLi8uLi90ZW1wbGF0ZXMvc2hhcmVkL3RyYWNrZXItbmV0d29ya3MtdGV4dC5lczYuanMnKVxuXG5mdW5jdGlvbiBUcmFja2VyTmV0d29ya3MgKG9wcykge1xuICAgIC8vIG1vZGVsIGRhdGEgaXMgYXN5bmNcbiAgICB0aGlzLm1vZGVsID0gbnVsbFxuICAgIHRoaXMuY3VycmVudE1vZGVsTmFtZSA9IG51bGxcbiAgICB0aGlzLmN1cnJlbnRTaXRlTW9kZWxOYW1lID0gbnVsbFxuICAgIHRoaXMudGVtcGxhdGUgPSBvcHMudGVtcGxhdGVcbiAgICBQYXJlbnRTbGlkaW5nU3Vidmlldy5jYWxsKHRoaXMsIG9wcylcblxuICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fcmVyZW5kZXIoKSwgNzUwKVxuICAgIHRoaXMucmVuZGVyQXN5bmNDb250ZW50KClcbn1cblxuVHJhY2tlck5ldHdvcmtzLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnRTbGlkaW5nU3Vidmlldy5wcm90b3R5cGUsXG4gICAge1xuXG4gICAgICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUVsZW1zKCcuanMtdHJhY2tlci1uZXR3b3JrcycsIFtcbiAgICAgICAgICAgICAgICAnaGVybycsXG4gICAgICAgICAgICAgICAgJ2RldGFpbHMnXG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAvLyBzaXRlIHJhdGluZyBhcnJpdmVzIGFzeW5jXG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudHMoW1tcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JlLnN1YnNjcmliZSxcbiAgICAgICAgICAgICAgICBgY2hhbmdlOiR7dGhpcy5jdXJyZW50U2l0ZU1vZGVsTmFtZX1gLFxuICAgICAgICAgICAgICAgIHRoaXMuX3JlcmVuZGVyXG4gICAgICAgICAgICBdXSlcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJBc3luY0NvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmRvbSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMClcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1vZGVsTmFtZSA9ICdzaXRlQ29tcGFueUxpc3QnICsgcmFuZG9tXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaXRlTW9kZWxOYW1lID0gJ3NpdGUnICsgcmFuZG9tXG5cbiAgICAgICAgICAgIHRoaXMubW9kZWwgPSBuZXcgQ29tcGFueUxpc3RNb2RlbCh7XG4gICAgICAgICAgICAgICAgbW9kZWxOYW1lOiB0aGlzLmN1cnJlbnRNb2RlbE5hbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmZldGNoQXN5bmNEYXRhKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zaXRlID0gbmV3IFNpdGVNb2RlbCh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsTmFtZTogdGhpcy5jdXJyZW50U2l0ZU1vZGVsTmFtZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zaXRlLmdldEJhY2tncm91bmRUYWJEYXRhKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnRlbXBsYXRlKClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dXAoKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHVwQ2xvc2UoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXJIZXJvVGVtcGxhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLnNpdGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFja2VyTmV0d29ya3NJY29uTmFtZSA9IHRyYWNrZXJOZXR3b3Jrc0ljb25UZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zaXRlLnNpdGVSYXRpbmcsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2l0ZS5pc0FsbG93bGlzdGVkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNpdGUudG90YWxUcmFja2VyTmV0d29ya3NDb3VudFxuICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYWNrZXJOZXR3b3Jrc1RleHQgPSB0cmFja2VyTmV0d29ya3NUZXh0VGVtcGxhdGUodGhpcy5tb2RlbC5zaXRlLCBmYWxzZSlcblxuICAgICAgICAgICAgICAgIHRoaXMuJGhlcm8uaHRtbChoZXJvVGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHRyYWNrZXJOZXR3b3Jrc0ljb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5tb2RlbC5zaXRlLmRvbWFpbixcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU6IHRyYWNrZXJOZXR3b3Jrc1RleHQsXG4gICAgICAgICAgICAgICAgICAgIHNob3dDbG9zZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9yZXJlbmRlcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmIChlICYmIGUuY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUuY2hhbmdlLmF0dHJpYnV0ZSA9PT0gJ2lzYU1ham9yVHJhY2tpbmdOZXR3b3JrJyB8fFxuICAgICAgICAgICAgICAgICAgICBlLmNoYW5nZS5hdHRyaWJ1dGUgPT09ICdpc0FsbG93bGlzdGVkJyB8fFxuICAgICAgICAgICAgICAgICAgICBlLmNoYW5nZS5hdHRyaWJ1dGUgPT09ICd0b3RhbFRyYWNrZXJOZXR3b3Jrc0NvdW50JyB8fFxuICAgICAgICAgICAgICAgICAgICBlLmNoYW5nZS5hdHRyaWJ1dGUgPT09ICdzaXRlUmF0aW5nJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW5kZXJIZXJvVGVtcGxhdGUoKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVuYmluZEV2ZW50cygpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dXAoKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHVwQ2xvc2UoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFja2VyTmV0d29ya3NcbiJdfQ==
