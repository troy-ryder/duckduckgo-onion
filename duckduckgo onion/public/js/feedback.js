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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Model;

var constants = require('../../../data/constants');

function FeedbackForm(attrs) {
  var _this = this;

  attrs = attrs || {};
  attrs.isBrokenSite = attrs.isBrokenSite || false;
  attrs.url = attrs.url || '';
  attrs.message = attrs.message || '';
  attrs.canSubmit = false;
  attrs.submitted = false;
  attrs.browser = attrs.browser || '';
  attrs.browserVersion = attrs.browserVersion || '';
  Parent.call(this, attrs);
  this.updateCanSubmit(); // grab atb value from background process

  this.sendMessage('getSetting', {
    name: 'atb'
  }).then(function (atb) {
    _this.atb = atb;
  });
  this.sendMessage('getExtensionVersion').then(function (extensionVersion) {
    _this.extensionVersion = extensionVersion;
  });
  this.sendMessage('getSetting', {
    name: 'tds-etag'
  }).then(function (etag) {
    _this.tds = etag;
  });
}

FeedbackForm.prototype = window.$.extend({}, Parent.prototype, {
  modelName: 'feedbackForm',
  submit: function submit() {
    var _this2 = this;

    if (!this.canSubmit || this._submitting) {
      return;
    }

    this._submitting = true;
    window.$.ajax(constants.feedbackUrl, {
      method: 'POST',
      data: {
        reason: this.isBrokenSite ? 'broken_site' : 'general',
        url: this.url || '',
        comment: this.message || '',
        browser: this.browser || '',
        browser_version: this.browserVersion || '',
        v: this.extensionVersion || '',
        atb: this.atb || '',
        tds: this.tsd || ''
      },
      success: function success(data) {
        if (data && data.status === 'success') {
          _this2.set('submitted', true);
        } else {
          _this2.set('errored', true);
        }
      },
      error: function error() {
        _this2.set('errored', true);
      }
    });
  },
  toggleBrokenSite: function toggleBrokenSite(val) {
    this.set('isBrokenSite', val);
    this.updateCanSubmit();
    this.reset();
  },
  updateCanSubmit: function updateCanSubmit() {
    if (this.isBrokenSite) {
      this.set('canSubmit', !!(this.url && this.message));
    } else {
      this.set('canSubmit', !!this.message);
    }
  },
  reset: function reset() {
    this.set('url', '');
    this.set('message', '');
    this.set('canSubmit', false);
  }
});
module.exports = FeedbackForm;

},{"../../../data/constants":5}],8:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.Page;

var mixins = require('./mixins/index.es6');

var parseUserAgentString = require('../../shared-utils/parse-user-agent-string.es6.js');

var FeedbackFormView = require('../views/feedback-form.es6');

var FeedbackFormModel = require('../models/feedback-form.es6');

function Feedback(ops) {
  Parent.call(this, ops);
}

Feedback.prototype = window.$.extend({}, Parent.prototype, mixins.setBrowserClassOnBodyTag, mixins.parseQueryString, {
  pageName: 'feedback',
  ready: function ready() {
    Parent.prototype.ready.call(this);
    this.setBrowserClassOnBodyTag();
    var params = this.parseQueryString(window.location.search);
    var browserInfo = parseUserAgentString();
    this.form = new FeedbackFormView({
      appendTo: window.$('.js-feedback-form'),
      model: new FeedbackFormModel({
        isBrokenSite: params.broken,
        url: decodeURIComponent(params.url || ''),
        browser: browserInfo.browser,
        browserVersion: browserInfo.version
      })
    });
  }
}); // kickoff!

window.DDG = window.DDG || {};
window.DDG.page = new Feedback();

},{"../../shared-utils/parse-user-agent-string.es6.js":6,"../models/feedback-form.es6":7,"../views/feedback-form.es6":13,"./mixins/index.es6":9}],9:[function(require,module,exports){
"use strict";

module.exports = {
  setBrowserClassOnBodyTag: require('./set-browser-class.es6.js'),
  parseQueryString: require('./parse-query-string.es6.js')
};

},{"./parse-query-string.es6.js":10,"./set-browser-class.es6.js":11}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
"use strict";

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');

module.exports = function () {
  var fields;

  if (this.model.submitted || this.model.errored) {
    return showThankYou(this.model.isBrokenSite);
  }

  if (this.model.isBrokenSite) {
    fields = bel(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div>\n            <label class='frm__label'>Which website is broken?</label>\n            <input class='js-feedback-url frm__input' type='text' placeholder='Copy and paste your URL' value='", "'/>\n            <label class='frm__label'>Describe the issue you encountered:</label>\n            <textarea class='frm__text js-feedback-message' required placeholder='Which website content or functionality is broken? Please be as specific as possible.'></textarea>\n        </div>"])), this.model.url);
  } else {
    fields = bel(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<div>\n            <label class='frm__label'>What do you love? What isn't working? How could the extension be improved?</label>\n            <textarea class='frm__text js-feedback-message' placeholder='Which features or functionality does your feedback refer to? Please be as specific as possible.'></textarea>\n        </div>"])));
  }

  return bel(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["<form class='frm'>\n        <p>Submitting anonymous feedback helps us improve DuckDuckGo Privacy Essentials.</p>\n        <label class='frm__label'>\n            <input type='checkbox' class='js-feedback-broken-site frm__label__chk'\n                ", "/>\n            I want to report a broken site\n        </label>\n        ", "\n        <input class='btn js-feedback-submit ", "'\n            type='submit' value='Submit' ", "/>\n    </form>"])), this.model.isBrokenSite ? 'checked' : '', fields, this.model.canSubmit ? '' : 'is-disabled', this.model.canSubmit ? '' : 'disabled');
};

function showThankYou(isBrokenSite) {
  if (isBrokenSite) {
    return bel(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["<div>\n            <p>Thank you for your feedback!</p>\n            <p>Your broken site reports help our development team fix these breakages.</p>\n        </div>"])));
  } else {
    return bel(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["<p>Thank you for your feedback!</p>"])));
  }
}

},{"bel":2}],13:[function(require,module,exports){
"use strict";

var Parent = window.DDG.base.View;

var feedbackFormTemplate = require('../templates/feedback-form.es6');

function FeedbackForm(ops) {
  this.model = ops.model;
  this.template = feedbackFormTemplate;
  Parent.call(this, ops);

  this._setup();
}

FeedbackForm.prototype = window.$.extend({}, Parent.prototype, {
  _setup: function _setup() {
    this._cacheElems('.js-feedback', ['url', 'message', 'broken-site', 'submit']);

    this.bindEvents([[this.store.subscribe, 'change:feedbackForm', this._onModelChange], [this.$url, 'input', this._onUrlChange], [this.$message, 'input', this._onMessageChange], [this.$brokensite, 'change', this._onBrokenSiteChange], [this.$submit, 'click', this._onSubmitClick]]);
  },
  _onModelChange: function _onModelChange(e) {
    if (e.change.attribute === 'isBrokenSite' || e.change.attribute === 'submitted' || e.change.attribute === 'errored') {
      this.unbindEvents();

      this._rerender();

      this._setup();
    } else if (e.change.attribute === 'canSubmit') {
      this.$submit.toggleClass('is-disabled', !this.model.canSubmit);
      this.$submit.attr('disabled', !this.model.canSubmit);
    }
  },
  _onBrokenSiteChange: function _onBrokenSiteChange(e) {
    this.model.toggleBrokenSite(e.target.checked);
  },
  _onUrlChange: function _onUrlChange() {
    this.model.set('url', this.$url.val());
    this.model.updateCanSubmit();
  },
  _onMessageChange: function _onMessageChange() {
    this.model.set('message', this.$message.val());
    this.model.updateCanSubmit();
  },
  _onSubmitClick: function _onSubmitClick(e) {
    e.preventDefault();

    if (!this.model.canSubmit) {
      return;
    }

    this.model.submit();
    this.$submit.addClass('is-disabled');
    this.$submit.val('Sending...');
  }
});
module.exports = FeedbackForm;

},{"../templates/feedback-form.es6":12}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmVsL2FwcGVuZENoaWxkLmpzIiwibm9kZV9tb2R1bGVzL2JlbC9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyc2NyaXB0LWF0dHJpYnV0ZS10by1wcm9wZXJ0eS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcngvaW5kZXguanMiLCJzaGFyZWQvZGF0YS9jb25zdGFudHMuanMiLCJzaGFyZWQvanMvc2hhcmVkLXV0aWxzL3BhcnNlLXVzZXItYWdlbnQtc3RyaW5nLmVzNi5qcyIsInNoYXJlZC9qcy91aS9tb2RlbHMvZmVlZGJhY2stZm9ybS5lczYuanMiLCJzaGFyZWQvanMvdWkvcGFnZXMvZmVlZGJhY2suZXM2LmpzIiwic2hhcmVkL2pzL3VpL3BhZ2VzL21peGlucy9pbmRleC5lczYuanMiLCJzaGFyZWQvanMvdWkvcGFnZXMvbWl4aW5zL3BhcnNlLXF1ZXJ5LXN0cmluZy5lczYuanMiLCJzaGFyZWQvanMvdWkvcGFnZXMvbWl4aW5zL3NldC1icm93c2VyLWNsYXNzLmVzNi5qcyIsInNoYXJlZC9qcy91aS90ZW1wbGF0ZXMvZmVlZGJhY2stZm9ybS5lczYuanMiLCJzaGFyZWQvanMvdWkvdmlld3MvZmVlZGJhY2stZm9ybS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LEtBQXVCLFdBQTNCLEVBQXdDO0FBQzNDLFdBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsYUFBekIsRUFBd0MsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxTQUFwRDtBQUNBLFdBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsVUFBbEIsRUFBOEIsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxTQUExQztBQUNIO0FBQ0osR0E3Qkw7QUErQkksRUFBQSxtQkFBbUIsRUFBRSw2QkFBVSxDQUFWLEVBQWE7QUFDOUIsU0FBSyxLQUFMLENBQVcsZ0JBQVgsQ0FBNEIsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxPQUFyQztBQUNILEdBakNMO0FBbUNJLEVBQUEsWUFBWSxFQUFFLHdCQUFZO0FBQ3RCLFNBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxLQUFmLEVBQXNCLEtBQUssSUFBTCxDQUFVLEdBQVYsRUFBdEI7QUFDQSxTQUFLLEtBQUwsQ0FBVyxlQUFYO0FBQ0gsR0F0Q0w7QUF3Q0ksRUFBQSxnQkFBZ0IsRUFBRSw0QkFBWTtBQUMxQixTQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBZixFQUEwQixLQUFLLFFBQUwsQ0FBYyxHQUFkLEVBQTFCO0FBQ0EsU0FBSyxLQUFMLENBQVcsZUFBWDtBQUNILEdBM0NMO0FBNkNJLEVBQUEsY0FBYyxFQUFFLHdCQUFVLENBQVYsRUFBYTtBQUN6QixJQUFBLENBQUMsQ0FBQyxjQUFGOztBQUVBLFFBQUksQ0FBQyxLQUFLLEtBQUwsQ0FBVyxTQUFoQixFQUEyQjtBQUFFO0FBQVE7O0FBRXJDLFNBQUssS0FBTCxDQUFXLE1BQVg7QUFFQSxTQUFLLE9BQUwsQ0FBYSxRQUFiLENBQXNCLGFBQXRCO0FBQ0EsU0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixZQUFqQjtBQUNIO0FBdERMLENBRnFCLENBQXpCO0FBNERBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFlBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIHRyYWlsaW5nTmV3bGluZVJlZ2V4ID0gL1xcbltcXHNdKyQvXG52YXIgbGVhZGluZ05ld2xpbmVSZWdleCA9IC9eXFxuW1xcc10rL1xudmFyIHRyYWlsaW5nU3BhY2VSZWdleCA9IC9bXFxzXSskL1xudmFyIGxlYWRpbmdTcGFjZVJlZ2V4ID0gL15bXFxzXSsvXG52YXIgbXVsdGlTcGFjZVJlZ2V4ID0gL1tcXG5cXHNdKy9nXG5cbnZhciBURVhUX1RBR1MgPSBbXG4gICdhJywgJ2FiYnInLCAnYicsICdiZGknLCAnYmRvJywgJ2JyJywgJ2NpdGUnLCAnZGF0YScsICdkZm4nLCAnZW0nLCAnaScsXG4gICdrYmQnLCAnbWFyaycsICdxJywgJ3JwJywgJ3J0JywgJ3J0YycsICdydWJ5JywgJ3MnLCAnYW1wJywgJ3NtYWxsJywgJ3NwYW4nLFxuICAnc3Ryb25nJywgJ3N1YicsICdzdXAnLCAndGltZScsICd1JywgJ3ZhcicsICd3YnInXG5dXG5cbnZhciBWRVJCQVRJTV9UQUdTID0gW1xuICAnY29kZScsICdwcmUnLCAndGV4dGFyZWEnXG5dXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXBwZW5kQ2hpbGQgKGVsLCBjaGlsZHMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNoaWxkcykpIHJldHVyblxuXG4gIHZhciBub2RlTmFtZSA9IGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKClcblxuICB2YXIgaGFkVGV4dCA9IGZhbHNlXG4gIHZhciB2YWx1ZSwgbGVhZGVyXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNoaWxkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBub2RlID0gY2hpbGRzW2ldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICAgIGFwcGVuZENoaWxkKGVsLCBub2RlKVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdudW1iZXInIHx8XG4gICAgICB0eXBlb2Ygbm9kZSA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICB0eXBlb2Ygbm9kZSA9PT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgbm9kZSBpbnN0YW5jZW9mIERhdGUgfHxcbiAgICAgIG5vZGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgIG5vZGUgPSBub2RlLnRvU3RyaW5nKClcbiAgICB9XG5cbiAgICB2YXIgbGFzdENoaWxkID0gZWwuY2hpbGROb2Rlc1tlbC5jaGlsZE5vZGVzLmxlbmd0aCAtIDFdXG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGV4dCBub2Rlc1xuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGhhZFRleHQgPSB0cnVlXG5cbiAgICAgIC8vIElmIHdlIGFscmVhZHkgaGFkIHRleHQsIGFwcGVuZCB0byB0aGUgZXhpc3RpbmcgdGV4dFxuICAgICAgaWYgKGxhc3RDaGlsZCAmJiBsYXN0Q2hpbGQubm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcbiAgICAgICAgbGFzdENoaWxkLm5vZGVWYWx1ZSArPSBub2RlXG5cbiAgICAgIC8vIFdlIGRpZG4ndCBoYXZlIGEgdGV4dCBub2RlIHlldCwgY3JlYXRlIG9uZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG4gICAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgICAgIGxhc3RDaGlsZCA9IG5vZGVcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgbGFzdCBvZiB0aGUgY2hpbGQgbm9kZXMsIG1ha2Ugc3VyZSB3ZSBjbG9zZSBpdCBvdXRcbiAgICAgIC8vIHJpZ2h0XG4gICAgICBpZiAoaSA9PT0gbGVuIC0gMSkge1xuICAgICAgICBoYWRUZXh0ID0gZmFsc2VcbiAgICAgICAgLy8gVHJpbSB0aGUgY2hpbGQgdGV4dCBub2RlcyBpZiB0aGUgY3VycmVudCBub2RlIGlzbid0IGFcbiAgICAgICAgLy8gbm9kZSB3aGVyZSB3aGl0ZXNwYWNlIG1hdHRlcnMuXG4gICAgICAgIGlmIChURVhUX1RBR1MuaW5kZXhPZihub2RlTmFtZSkgPT09IC0xICYmXG4gICAgICAgICAgVkVSQkFUSU1fVEFHUy5pbmRleE9mKG5vZGVOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICB2YWx1ZSA9IGxhc3RDaGlsZC5ub2RlVmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKGxlYWRpbmdOZXdsaW5lUmVnZXgsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UodHJhaWxpbmdTcGFjZVJlZ2V4LCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKHRyYWlsaW5nTmV3bGluZVJlZ2V4LCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKG11bHRpU3BhY2VSZWdleCwgJyAnKVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIGVsLnJlbW92ZUNoaWxkKGxhc3RDaGlsZClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFzdENoaWxkLm5vZGVWYWx1ZSA9IHZhbHVlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFZFUkJBVElNX1RBR1MuaW5kZXhPZihub2RlTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgLy8gVGhlIHZlcnkgZmlyc3Qgbm9kZSBpbiB0aGUgbGlzdCBzaG91bGQgbm90IGhhdmUgbGVhZGluZ1xuICAgICAgICAgIC8vIHdoaXRlc3BhY2UuIFNpYmxpbmcgdGV4dCBub2RlcyBzaG91bGQgaGF2ZSB3aGl0ZXNwYWNlIGlmIHRoZXJlXG4gICAgICAgICAgLy8gd2FzIGFueS5cbiAgICAgICAgICBsZWFkZXIgPSBpID09PSAwID8gJycgOiAnICdcbiAgICAgICAgICB2YWx1ZSA9IGxhc3RDaGlsZC5ub2RlVmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKGxlYWRpbmdOZXdsaW5lUmVnZXgsIGxlYWRlcilcbiAgICAgICAgICAgIC5yZXBsYWNlKGxlYWRpbmdTcGFjZVJlZ2V4LCAnICcpXG4gICAgICAgICAgICAucmVwbGFjZSh0cmFpbGluZ1NwYWNlUmVnZXgsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UodHJhaWxpbmdOZXdsaW5lUmVnZXgsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UobXVsdGlTcGFjZVJlZ2V4LCAnICcpXG4gICAgICAgICAgbGFzdENoaWxkLm5vZGVWYWx1ZSA9IHZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIC8vIEl0ZXJhdGUgb3ZlciBET00gbm9kZXNcbiAgICB9IGVsc2UgaWYgKG5vZGUgJiYgbm9kZS5ub2RlVHlwZSkge1xuICAgICAgLy8gSWYgdGhlIGxhc3Qgbm9kZSB3YXMgYSB0ZXh0IG5vZGUsIG1ha2Ugc3VyZSBpdCBpcyBwcm9wZXJseSBjbG9zZWQgb3V0XG4gICAgICBpZiAoaGFkVGV4dCkge1xuICAgICAgICBoYWRUZXh0ID0gZmFsc2VcblxuICAgICAgICAvLyBUcmltIHRoZSBjaGlsZCB0ZXh0IG5vZGVzIGlmIHRoZSBjdXJyZW50IG5vZGUgaXNuJ3QgYVxuICAgICAgICAvLyB0ZXh0IG5vZGUgb3IgYSBjb2RlIG5vZGVcbiAgICAgICAgaWYgKFRFWFRfVEFHUy5pbmRleE9mKG5vZGVOYW1lKSA9PT0gLTEgJiZcbiAgICAgICAgICBWRVJCQVRJTV9UQUdTLmluZGV4T2Yobm9kZU5hbWUpID09PSAtMSkge1xuICAgICAgICAgIHZhbHVlID0gbGFzdENoaWxkLm5vZGVWYWx1ZVxuICAgICAgICAgICAgLnJlcGxhY2UobGVhZGluZ05ld2xpbmVSZWdleCwgJycpXG4gICAgICAgICAgICAucmVwbGFjZSh0cmFpbGluZ05ld2xpbmVSZWdleCwgJycpXG4gICAgICAgICAgICAucmVwbGFjZShtdWx0aVNwYWNlUmVnZXgsICcgJylcblxuICAgICAgICAgIC8vIFJlbW92ZSBlbXB0eSB0ZXh0IG5vZGVzLCBhcHBlbmQgb3RoZXJ3aXNlXG4gICAgICAgICAgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgZWwucmVtb3ZlQ2hpbGQobGFzdENoaWxkKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0Q2hpbGQubm9kZVZhbHVlID0gdmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgIC8vIFRyaW0gdGhlIGNoaWxkIG5vZGVzIGlmIHRoZSBjdXJyZW50IG5vZGUgaXMgbm90IGEgbm9kZVxuICAgICAgICAvLyB3aGVyZSBhbGwgd2hpdGVzcGFjZSBtdXN0IGJlIHByZXNlcnZlZFxuICAgICAgICB9IGVsc2UgaWYgKFZFUkJBVElNX1RBR1MuaW5kZXhPZihub2RlTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgdmFsdWUgPSBsYXN0Q2hpbGQubm9kZVZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShsZWFkaW5nU3BhY2VSZWdleCwgJyAnKVxuICAgICAgICAgICAgLnJlcGxhY2UobGVhZGluZ05ld2xpbmVSZWdleCwgJycpXG4gICAgICAgICAgICAucmVwbGFjZSh0cmFpbGluZ05ld2xpbmVSZWdleCwgJycpXG4gICAgICAgICAgICAucmVwbGFjZShtdWx0aVNwYWNlUmVnZXgsICcgJylcbiAgICAgICAgICBsYXN0Q2hpbGQubm9kZVZhbHVlID0gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTdG9yZSB0aGUgbGFzdCBub2RlbmFtZVxuICAgICAgdmFyIF9ub2RlTmFtZSA9IG5vZGUubm9kZU5hbWVcbiAgICAgIGlmIChfbm9kZU5hbWUpIG5vZGVOYW1lID0gX25vZGVOYW1lLnRvTG93ZXJDYXNlKClcblxuICAgICAgLy8gQXBwZW5kIHRoZSBub2RlIHRvIHRoZSBET01cbiAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgfVxuICB9XG59XG4iLCJ2YXIgaHlwZXJ4ID0gcmVxdWlyZSgnaHlwZXJ4JylcbnZhciBhcHBlbmRDaGlsZCA9IHJlcXVpcmUoJy4vYXBwZW5kQ2hpbGQnKVxuXG52YXIgU1ZHTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnXG52YXIgWExJTktOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJ1xuXG52YXIgQk9PTF9QUk9QUyA9IFtcbiAgJ2F1dG9mb2N1cycsICdjaGVja2VkJywgJ2RlZmF1bHRjaGVja2VkJywgJ2Rpc2FibGVkJywgJ2Zvcm1ub3ZhbGlkYXRlJyxcbiAgJ2luZGV0ZXJtaW5hdGUnLCAncmVhZG9ubHknLCAncmVxdWlyZWQnLCAnc2VsZWN0ZWQnLCAnd2lsbHZhbGlkYXRlJ1xuXVxuXG52YXIgQ09NTUVOVF9UQUcgPSAnIS0tJ1xuXG52YXIgU1ZHX1RBR1MgPSBbXG4gICdzdmcnLCAnYWx0R2x5cGgnLCAnYWx0R2x5cGhEZWYnLCAnYWx0R2x5cGhJdGVtJywgJ2FuaW1hdGUnLCAnYW5pbWF0ZUNvbG9yJyxcbiAgJ2FuaW1hdGVNb3Rpb24nLCAnYW5pbWF0ZVRyYW5zZm9ybScsICdjaXJjbGUnLCAnY2xpcFBhdGgnLCAnY29sb3ItcHJvZmlsZScsXG4gICdjdXJzb3InLCAnZGVmcycsICdkZXNjJywgJ2VsbGlwc2UnLCAnZmVCbGVuZCcsICdmZUNvbG9yTWF0cml4JyxcbiAgJ2ZlQ29tcG9uZW50VHJhbnNmZXInLCAnZmVDb21wb3NpdGUnLCAnZmVDb252b2x2ZU1hdHJpeCcsXG4gICdmZURpZmZ1c2VMaWdodGluZycsICdmZURpc3BsYWNlbWVudE1hcCcsICdmZURpc3RhbnRMaWdodCcsICdmZUZsb29kJyxcbiAgJ2ZlRnVuY0EnLCAnZmVGdW5jQicsICdmZUZ1bmNHJywgJ2ZlRnVuY1InLCAnZmVHYXVzc2lhbkJsdXInLCAnZmVJbWFnZScsXG4gICdmZU1lcmdlJywgJ2ZlTWVyZ2VOb2RlJywgJ2ZlTW9ycGhvbG9neScsICdmZU9mZnNldCcsICdmZVBvaW50TGlnaHQnLFxuICAnZmVTcGVjdWxhckxpZ2h0aW5nJywgJ2ZlU3BvdExpZ2h0JywgJ2ZlVGlsZScsICdmZVR1cmJ1bGVuY2UnLCAnZmlsdGVyJyxcbiAgJ2ZvbnQnLCAnZm9udC1mYWNlJywgJ2ZvbnQtZmFjZS1mb3JtYXQnLCAnZm9udC1mYWNlLW5hbWUnLCAnZm9udC1mYWNlLXNyYycsXG4gICdmb250LWZhY2UtdXJpJywgJ2ZvcmVpZ25PYmplY3QnLCAnZycsICdnbHlwaCcsICdnbHlwaFJlZicsICdoa2VybicsICdpbWFnZScsXG4gICdsaW5lJywgJ2xpbmVhckdyYWRpZW50JywgJ21hcmtlcicsICdtYXNrJywgJ21ldGFkYXRhJywgJ21pc3NpbmctZ2x5cGgnLFxuICAnbXBhdGgnLCAncGF0aCcsICdwYXR0ZXJuJywgJ3BvbHlnb24nLCAncG9seWxpbmUnLCAncmFkaWFsR3JhZGllbnQnLCAncmVjdCcsXG4gICdzZXQnLCAnc3RvcCcsICdzd2l0Y2gnLCAnc3ltYm9sJywgJ3RleHQnLCAndGV4dFBhdGgnLCAndGl0bGUnLCAndHJlZicsXG4gICd0c3BhbicsICd1c2UnLCAndmlldycsICd2a2Vybidcbl1cblxuZnVuY3Rpb24gYmVsQ3JlYXRlRWxlbWVudCAodGFnLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgdmFyIGVsXG5cbiAgLy8gSWYgYW4gc3ZnIHRhZywgaXQgbmVlZHMgYSBuYW1lc3BhY2VcbiAgaWYgKFNWR19UQUdTLmluZGV4T2YodGFnKSAhPT0gLTEpIHtcbiAgICBwcm9wcy5uYW1lc3BhY2UgPSBTVkdOU1xuICB9XG5cbiAgLy8gSWYgd2UgYXJlIHVzaW5nIGEgbmFtZXNwYWNlXG4gIHZhciBucyA9IGZhbHNlXG4gIGlmIChwcm9wcy5uYW1lc3BhY2UpIHtcbiAgICBucyA9IHByb3BzLm5hbWVzcGFjZVxuICAgIGRlbGV0ZSBwcm9wcy5uYW1lc3BhY2VcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgZWxlbWVudFxuICBpZiAobnMpIHtcbiAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdGFnKVxuICB9IGVsc2UgaWYgKHRhZyA9PT0gQ09NTUVOVF9UQUcpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChwcm9wcy5jb21tZW50KVxuICB9IGVsc2Uge1xuICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpXG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIHByb3BlcnRpZXNcbiAgZm9yICh2YXIgcCBpbiBwcm9wcykge1xuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgdmFyIGtleSA9IHAudG9Mb3dlckNhc2UoKVxuICAgICAgdmFyIHZhbCA9IHByb3BzW3BdXG4gICAgICAvLyBOb3JtYWxpemUgY2xhc3NOYW1lXG4gICAgICBpZiAoa2V5ID09PSAnY2xhc3NuYW1lJykge1xuICAgICAgICBrZXkgPSAnY2xhc3MnXG4gICAgICAgIHAgPSAnY2xhc3MnXG4gICAgICB9XG4gICAgICAvLyBUaGUgZm9yIGF0dHJpYnV0ZSBnZXRzIHRyYW5zZm9ybWVkIHRvIGh0bWxGb3IsIGJ1dCB3ZSBqdXN0IHNldCBhcyBmb3JcbiAgICAgIGlmIChwID09PSAnaHRtbEZvcicpIHtcbiAgICAgICAgcCA9ICdmb3InXG4gICAgICB9XG4gICAgICAvLyBJZiBhIHByb3BlcnR5IGlzIGJvb2xlYW4sIHNldCBpdHNlbGYgdG8gdGhlIGtleVxuICAgICAgaWYgKEJPT0xfUFJPUFMuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuICAgICAgICBpZiAodmFsID09PSAndHJ1ZScpIHZhbCA9IGtleVxuICAgICAgICBlbHNlIGlmICh2YWwgPT09ICdmYWxzZScpIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICAvLyBJZiBhIHByb3BlcnR5IHByZWZlcnMgYmVpbmcgc2V0IGRpcmVjdGx5IHZzIHNldEF0dHJpYnV0ZVxuICAgICAgaWYgKGtleS5zbGljZSgwLCAyKSA9PT0gJ29uJykge1xuICAgICAgICBlbFtwXSA9IHZhbFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgaWYgKHAgPT09ICd4bGluazpocmVmJykge1xuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMoWExJTktOUywgcCwgdmFsKVxuICAgICAgICAgIH0gZWxzZSBpZiAoL154bWxucygkfDopL2kudGVzdChwKSkge1xuICAgICAgICAgICAgLy8gc2tpcCB4bWxucyBkZWZpbml0aW9uc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhudWxsLCBwLCB2YWwpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShwLCB2YWwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhcHBlbmRDaGlsZChlbCwgY2hpbGRyZW4pXG4gIHJldHVybiBlbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGh5cGVyeChiZWxDcmVhdGVFbGVtZW50LCB7Y29tbWVudHM6IHRydWV9KVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVFbGVtZW50ID0gYmVsQ3JlYXRlRWxlbWVudFxuIiwibW9kdWxlLmV4cG9ydHMgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5XG5cbnZhciB0cmFuc2Zvcm0gPSB7XG4gICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAnZm9yJzogJ2h0bWxGb3InLFxuICAnaHR0cC1lcXVpdic6ICdodHRwRXF1aXYnXG59XG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZVRvUHJvcGVydHkgKGgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YWdOYW1lLCBhdHRycywgY2hpbGRyZW4pIHtcbiAgICBmb3IgKHZhciBhdHRyIGluIGF0dHJzKSB7XG4gICAgICBpZiAoYXR0ciBpbiB0cmFuc2Zvcm0pIHtcbiAgICAgICAgYXR0cnNbdHJhbnNmb3JtW2F0dHJdXSA9IGF0dHJzW2F0dHJdXG4gICAgICAgIGRlbGV0ZSBhdHRyc1thdHRyXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaCh0YWdOYW1lLCBhdHRycywgY2hpbGRyZW4pXG4gIH1cbn1cbiIsInZhciBhdHRyVG9Qcm9wID0gcmVxdWlyZSgnaHlwZXJzY3JpcHQtYXR0cmlidXRlLXRvLXByb3BlcnR5JylcblxudmFyIFZBUiA9IDAsIFRFWFQgPSAxLCBPUEVOID0gMiwgQ0xPU0UgPSAzLCBBVFRSID0gNFxudmFyIEFUVFJfS0VZID0gNSwgQVRUUl9LRVlfVyA9IDZcbnZhciBBVFRSX1ZBTFVFX1cgPSA3LCBBVFRSX1ZBTFVFID0gOFxudmFyIEFUVFJfVkFMVUVfU1EgPSA5LCBBVFRSX1ZBTFVFX0RRID0gMTBcbnZhciBBVFRSX0VRID0gMTEsIEFUVFJfQlJFQUsgPSAxMlxudmFyIENPTU1FTlQgPSAxM1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG4gIHZhciBjb25jYXQgPSBvcHRzLmNvbmNhdCB8fCBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBTdHJpbmcoYSkgKyBTdHJpbmcoYilcbiAgfVxuICBpZiAob3B0cy5hdHRyVG9Qcm9wICE9PSBmYWxzZSkge1xuICAgIGggPSBhdHRyVG9Qcm9wKGgpXG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKHN0cmluZ3MpIHtcbiAgICB2YXIgc3RhdGUgPSBURVhULCByZWcgPSAnJ1xuICAgIHZhciBhcmdsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgdmFyIHBhcnRzID0gW11cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgPCBhcmdsZW4gLSAxKSB7XG4gICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaSsxXVxuICAgICAgICB2YXIgcCA9IHBhcnNlKHN0cmluZ3NbaV0pXG4gICAgICAgIHZhciB4c3RhdGUgPSBzdGF0ZVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFJfVkFMVUVfU1EpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFIpIHhzdGF0ZSA9IEFUVFJfS0VZXG4gICAgICAgIGlmICh4c3RhdGUgPT09IE9QRU4pIHtcbiAgICAgICAgICBpZiAocmVnID09PSAnLycpIHtcbiAgICAgICAgICAgIHAucHVzaChbIE9QRU4sICcvJywgYXJnIF0pXG4gICAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwLnB1c2goWyBPUEVOLCBhcmcgXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoeHN0YXRlID09PSBDT01NRU5UICYmIG9wdHMuY29tbWVudHMpIHtcbiAgICAgICAgICByZWcgKz0gU3RyaW5nKGFyZylcbiAgICAgICAgfSBlbHNlIGlmICh4c3RhdGUgIT09IENPTU1FTlQpIHtcbiAgICAgICAgICBwLnB1c2goWyBWQVIsIHhzdGF0ZSwgYXJnIF0pXG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaC5hcHBseShwYXJ0cywgcClcbiAgICAgIH0gZWxzZSBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwYXJzZShzdHJpbmdzW2ldKSlcbiAgICB9XG5cbiAgICB2YXIgdHJlZSA9IFtudWxsLHt9LFtdXVxuICAgIHZhciBzdGFjayA9IFtbdHJlZSwtMV1dXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1ciA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVswXVxuICAgICAgdmFyIHAgPSBwYXJ0c1tpXSwgcyA9IHBbMF1cbiAgICAgIGlmIChzID09PSBPUEVOICYmIC9eXFwvLy50ZXN0KHBbMV0pKSB7XG4gICAgICAgIHZhciBpeCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVsxXVxuICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoLTFdWzBdWzJdW2l4XSA9IGgoXG4gICAgICAgICAgICBjdXJbMF0sIGN1clsxXSwgY3VyWzJdLmxlbmd0aCA/IGN1clsyXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzID09PSBPUEVOKSB7XG4gICAgICAgIHZhciBjID0gW3BbMV0se30sW11dXG4gICAgICAgIGN1clsyXS5wdXNoKGMpXG4gICAgICAgIHN0YWNrLnB1c2goW2MsY3VyWzJdLmxlbmd0aC0xXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9LRVkgfHwgKHMgPT09IFZBUiAmJiBwWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgdmFyIGtleSA9ICcnXG4gICAgICAgIHZhciBjb3B5S2V5XG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBrZXkgPSBjb25jYXQoa2V5LCBwYXJ0c1tpXVsxXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzW2ldWzBdID09PSBWQVIgJiYgcGFydHNbaV1bMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnRzW2ldWzJdID09PSAnb2JqZWN0JyAmJiAha2V5KSB7XG4gICAgICAgICAgICAgIGZvciAoY29weUtleSBpbiBwYXJ0c1tpXVsyXSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0c1tpXVsyXS5oYXNPd25Qcm9wZXJ0eShjb3B5S2V5KSAmJiAhY3VyWzFdW2NvcHlLZXldKSB7XG4gICAgICAgICAgICAgICAgICBjdXJbMV1bY29weUtleV0gPSBwYXJ0c1tpXVsyXVtjb3B5S2V5XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAga2V5ID0gY29uY2F0KGtleSwgcGFydHNbaV1bMl0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRzW2ldWzBdID09PSBBVFRSX0VRKSBpKytcbiAgICAgICAgdmFyIGogPSBpXG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfVkFMVUUgfHwgcGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAoIWN1clsxXVtrZXldKSBjdXJbMV1ba2V5XSA9IHN0cmZuKHBhcnRzW2ldWzFdKVxuICAgICAgICAgICAgZWxzZSBwYXJ0c1tpXVsxXT09PVwiXCIgfHwgKGN1clsxXVtrZXldID0gY29uY2F0KGN1clsxXVtrZXldLCBwYXJ0c1tpXVsxXSkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGFydHNbaV1bMF0gPT09IFZBUlxuICAgICAgICAgICYmIChwYXJ0c1tpXVsxXSA9PT0gQVRUUl9WQUxVRSB8fCBwYXJ0c1tpXVsxXSA9PT0gQVRUUl9LRVkpKSB7XG4gICAgICAgICAgICBpZiAoIWN1clsxXVtrZXldKSBjdXJbMV1ba2V5XSA9IHN0cmZuKHBhcnRzW2ldWzJdKVxuICAgICAgICAgICAgZWxzZSBwYXJ0c1tpXVsyXT09PVwiXCIgfHwgKGN1clsxXVtrZXldID0gY29uY2F0KGN1clsxXVtrZXldLCBwYXJ0c1tpXVsyXSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCAmJiAhY3VyWzFdW2tleV0gJiYgaSA9PT0galxuICAgICAgICAgICAgJiYgKHBhcnRzW2ldWzBdID09PSBDTE9TRSB8fCBwYXJ0c1tpXVswXSA9PT0gQVRUUl9CUkVBSykpIHtcbiAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNib29sZWFuLWF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgLy8gZW1wdHkgc3RyaW5nIGlzIGZhbHN5LCBub3Qgd2VsbCBiZWhhdmVkIHZhbHVlIGluIGJyb3dzZXJcbiAgICAgICAgICAgICAgY3VyWzFdW2tleV0gPSBrZXkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnRzW2ldWzBdID09PSBDTE9TRSkge1xuICAgICAgICAgICAgICBpLS1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzFdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVkFSICYmIHBbMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzJdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQ0xPU0UpIHtcbiAgICAgICAgaWYgKHNlbGZDbG9zaW5nKGN1clswXSkgJiYgc3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGl4ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzFdXG4gICAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgICBzdGFja1tzdGFjay5sZW5ndGgtMV1bMF1bMl1baXhdID0gaChcbiAgICAgICAgICAgIGN1clswXSwgY3VyWzFdLCBjdXJbMl0ubGVuZ3RoID8gY3VyWzJdIDogdW5kZWZpbmVkXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFZBUiAmJiBwWzFdID09PSBURVhUKSB7XG4gICAgICAgIGlmIChwWzJdID09PSB1bmRlZmluZWQgfHwgcFsyXSA9PT0gbnVsbCkgcFsyXSA9ICcnXG4gICAgICAgIGVsc2UgaWYgKCFwWzJdKSBwWzJdID0gY29uY2F0KCcnLCBwWzJdKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwWzJdWzBdKSkge1xuICAgICAgICAgIGN1clsyXS5wdXNoLmFwcGx5KGN1clsyXSwgcFsyXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJbMl0ucHVzaChwWzJdKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFRFWFQpIHtcbiAgICAgICAgY3VyWzJdLnB1c2gocFsxXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9FUSB8fCBzID09PSBBVFRSX0JSRUFLKSB7XG4gICAgICAgIC8vIG5vLW9wXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaGFuZGxlZDogJyArIHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRyZWVbMl0ubGVuZ3RoID4gMSAmJiAvXlxccyokLy50ZXN0KHRyZWVbMl1bMF0pKSB7XG4gICAgICB0cmVlWzJdLnNoaWZ0KClcbiAgICB9XG5cbiAgICBpZiAodHJlZVsyXS5sZW5ndGggPiAyXG4gICAgfHwgKHRyZWVbMl0ubGVuZ3RoID09PSAyICYmIC9cXFMvLnRlc3QodHJlZVsyXVsxXSkpKSB7XG4gICAgICBpZiAob3B0cy5jcmVhdGVGcmFnbWVudCkgcmV0dXJuIG9wdHMuY3JlYXRlRnJhZ21lbnQodHJlZVsyXSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ211bHRpcGxlIHJvb3QgZWxlbWVudHMgbXVzdCBiZSB3cmFwcGVkIGluIGFuIGVuY2xvc2luZyB0YWcnXG4gICAgICApXG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHRyZWVbMl1bMF0pICYmIHR5cGVvZiB0cmVlWzJdWzBdWzBdID09PSAnc3RyaW5nJ1xuICAgICYmIEFycmF5LmlzQXJyYXkodHJlZVsyXVswXVsyXSkpIHtcbiAgICAgIHRyZWVbMl1bMF0gPSBoKHRyZWVbMl1bMF1bMF0sIHRyZWVbMl1bMF1bMV0sIHRyZWVbMl1bMF1bMl0pXG4gICAgfVxuICAgIHJldHVybiB0cmVlWzJdWzBdXG5cbiAgICBmdW5jdGlvbiBwYXJzZSAoc3RyKSB7XG4gICAgICB2YXIgcmVzID0gW11cbiAgICAgIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XKSBzdGF0ZSA9IEFUVFJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJBdChpKVxuICAgICAgICBpZiAoc3RhdGUgPT09IFRFWFQgJiYgYyA9PT0gJzwnKSB7XG4gICAgICAgICAgaWYgKHJlZy5sZW5ndGgpIHJlcy5wdXNoKFtURVhULCByZWddKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBPUEVOXG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJz4nICYmICFxdW90KHN0YXRlKSAmJiBzdGF0ZSAhPT0gQ09NTUVOVCkge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gT1BFTiAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXMucHVzaChbT1BFTixyZWddKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy5wdXNoKFtDTE9TRV0pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IFRFWFRcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQ09NTUVOVCAmJiAvLSQvLnRlc3QocmVnKSAmJiBjID09PSAnLScpIHtcbiAgICAgICAgICBpZiAob3B0cy5jb21tZW50cykge1xuICAgICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnLnN1YnN0cigwLCByZWcubGVuZ3RoIC0gMSldKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gVEVYVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBPUEVOICYmIC9eIS0tJC8udGVzdChyZWcpKSB7XG4gICAgICAgICAgaWYgKG9wdHMuY29tbWVudHMpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLCByZWddLFtBVFRSX0tFWSwnY29tbWVudCddLFtBVFRSX0VRXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnID0gY1xuICAgICAgICAgIHN0YXRlID0gQ09NTUVOVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBURVhUIHx8IHN0YXRlID09PSBDT01NRU5UKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTiAmJiBjID09PSAnLycgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICAgIC8vIG5vLW9wLCBzZWxmIGNsb3NpbmcgdGFnIHdpdGhvdXQgYSBzcGFjZSA8YnIvPlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBPUEVOICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICBpZiAocmVnLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzLnB1c2goW09QRU4sIHJlZ10pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4pIHtcbiAgICAgICAgICByZWcgKz0gY1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSICYmIC9bXlxcc1wiJz0vXS8udGVzdChjKSkge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlcbiAgICAgICAgICByZWcgPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFIgJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9CUkVBS10pXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSxbQVRUUl9FUV0pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoKHN0YXRlID09PSBBVFRSX0tFWV9XIHx8IHN0YXRlID09PSBBVFRSKSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9FUV0pXG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1dcbiAgICAgICAgfSBlbHNlIGlmICgoc3RhdGUgPT09IEFUVFJfS0VZX1cgfHwgc3RhdGUgPT09IEFUVFIpICYmICEvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIGlmICgvW1xcdy1dLy50ZXN0KGMpKSB7XG4gICAgICAgICAgICByZWcgKz0gY1xuICAgICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWVxuICAgICAgICAgIH0gZWxzZSBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09ICdcIicpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfRFFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1NRXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgYyA9PT0gJ1wiJykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10sW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfU1EgJiYgYyA9PT0gXCInXCIpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddLFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgIS9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgICBpLS1cbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSxbQVRUUl9CUkVBS10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUVxuICAgICAgICB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZSA9PT0gVEVYVCAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtURVhULHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdHJmbiAoeCkge1xuICAgIGlmICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHhcbiAgICBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHJldHVybiB4XG4gICAgZWxzZSBpZiAoeCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcpIHJldHVybiB4XG4gICAgZWxzZSBpZiAoeCA9PT0gbnVsbCB8fCB4ID09PSB1bmRlZmluZWQpIHJldHVybiB4XG4gICAgZWxzZSByZXR1cm4gY29uY2F0KCcnLCB4KVxuICB9XG59XG5cbmZ1bmN0aW9uIHF1b3QgKHN0YXRlKSB7XG4gIHJldHVybiBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUVxufVxuXG52YXIgY2xvc2VSRSA9IFJlZ0V4cCgnXignICsgW1xuICAnYXJlYScsICdiYXNlJywgJ2Jhc2Vmb250JywgJ2Jnc291bmQnLCAnYnInLCAnY29sJywgJ2NvbW1hbmQnLCAnZW1iZWQnLFxuICAnZnJhbWUnLCAnaHInLCAnaW1nJywgJ2lucHV0JywgJ2lzaW5kZXgnLCAna2V5Z2VuJywgJ2xpbmsnLCAnbWV0YScsICdwYXJhbScsXG4gICdzb3VyY2UnLCAndHJhY2snLCAnd2JyJywgJyEtLScsXG4gIC8vIFNWRyBUQUdTXG4gICdhbmltYXRlJywgJ2FuaW1hdGVUcmFuc2Zvcm0nLCAnY2lyY2xlJywgJ2N1cnNvcicsICdkZXNjJywgJ2VsbGlwc2UnLFxuICAnZmVCbGVuZCcsICdmZUNvbG9yTWF0cml4JywgJ2ZlQ29tcG9zaXRlJyxcbiAgJ2ZlQ29udm9sdmVNYXRyaXgnLCAnZmVEaWZmdXNlTGlnaHRpbmcnLCAnZmVEaXNwbGFjZW1lbnRNYXAnLFxuICAnZmVEaXN0YW50TGlnaHQnLCAnZmVGbG9vZCcsICdmZUZ1bmNBJywgJ2ZlRnVuY0InLCAnZmVGdW5jRycsICdmZUZ1bmNSJyxcbiAgJ2ZlR2F1c3NpYW5CbHVyJywgJ2ZlSW1hZ2UnLCAnZmVNZXJnZU5vZGUnLCAnZmVNb3JwaG9sb2d5JyxcbiAgJ2ZlT2Zmc2V0JywgJ2ZlUG9pbnRMaWdodCcsICdmZVNwZWN1bGFyTGlnaHRpbmcnLCAnZmVTcG90TGlnaHQnLCAnZmVUaWxlJyxcbiAgJ2ZlVHVyYnVsZW5jZScsICdmb250LWZhY2UtZm9ybWF0JywgJ2ZvbnQtZmFjZS1uYW1lJywgJ2ZvbnQtZmFjZS11cmknLFxuICAnZ2x5cGgnLCAnZ2x5cGhSZWYnLCAnaGtlcm4nLCAnaW1hZ2UnLCAnbGluZScsICdtaXNzaW5nLWdseXBoJywgJ21wYXRoJyxcbiAgJ3BhdGgnLCAncG9seWdvbicsICdwb2x5bGluZScsICdyZWN0JywgJ3NldCcsICdzdG9wJywgJ3RyZWYnLCAndXNlJywgJ3ZpZXcnLFxuICAndmtlcm4nXG5dLmpvaW4oJ3wnKSArICcpKD86W1xcLiNdW2EtekEtWjAtOVxcdTAwN0YtXFx1RkZGRl86LV0rKSokJylcbmZ1bmN0aW9uIHNlbGZDbG9zaW5nICh0YWcpIHsgcmV0dXJuIGNsb3NlUkUudGVzdCh0YWcpIH1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRpc3BsYXlDYXRlZ29yaWVzOiBbJ0FuYWx5dGljcycsICdBZHZlcnRpc2luZycsICdTb2NpYWwgTmV0d29yayddLFxuICAgIHJlcXVlc3RMaXN0ZW5lclR5cGVzOiBbJ21haW5fZnJhbWUnLCAnc3ViX2ZyYW1lJywgJ3N0eWxlc2hlZXQnLCAnc2NyaXB0JywgJ2ltYWdlJywgJ29iamVjdCcsICd4bWxodHRwcmVxdWVzdCcsICd3ZWJzb2NrZXQnLCAnb3RoZXInXSwgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Nb3ppbGxhL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9BUEkvd2ViUmVxdWVzdC9SZXNvdXJjZVR5cGVcbiAgICBmZWVkYmFja1VybDogJ2h0dHBzOi8vZHVja2R1Y2tnby5jb20vZmVlZGJhY2suanM/dHlwZT1leHRlbnNpb24tZmVlZGJhY2snLFxuICAgIHRvc2RyTWVzc2FnZXM6IHtcbiAgICAgICAgQTogJ0dvb2QnLFxuICAgICAgICBCOiAnTWl4ZWQnLFxuICAgICAgICBDOiAnUG9vcicsXG4gICAgICAgIEQ6ICdQb29yJyxcbiAgICAgICAgRTogJ1Bvb3InLFxuICAgICAgICBnb29kOiAnR29vZCcsXG4gICAgICAgIGJhZDogJ1Bvb3InLFxuICAgICAgICB1bmtub3duOiAnVW5rbm93bicsXG4gICAgICAgIG1peGVkOiAnTWl4ZWQnXG4gICAgfSxcbiAgICBodHRwc1NlcnZpY2U6ICdodHRwczovL2R1Y2tkdWNrZ28uY29tL3NtYXJ0ZXJfZW5jcnlwdGlvbi5qcycsXG4gICAgZHVja0R1Y2tHb1NlcnBIb3N0bmFtZTogJ2R1Y2tkdWNrZ28uY29tJyxcbiAgICBodHRwc01lc3NhZ2VzOiB7XG4gICAgICAgIHNlY3VyZTogJ0VuY3J5cHRlZCBDb25uZWN0aW9uJyxcbiAgICAgICAgdXBncmFkZWQ6ICdGb3JjZWQgRW5jcnlwdGlvbicsXG4gICAgICAgIG5vbmU6ICdVbmVuY3J5cHRlZCBDb25uZWN0aW9uJ1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFqb3IgdHJhY2tpbmcgbmV0d29ya3MgZGF0YTpcbiAgICAgKiBwZXJjZW50IG9mIHRoZSB0b3AgMSBtaWxsaW9uIHNpdGVzIGEgdHJhY2tpbmcgbmV0d29yayBoYXMgYmVlbiBzZWVuIG9uLlxuICAgICAqIHNlZTogaHR0cHM6Ly93ZWJ0cmFuc3BhcmVuY3kuY3MucHJpbmNldG9uLmVkdS93ZWJjZW5zdXMvXG4gICAgICovXG4gICAgbWFqb3JUcmFja2luZ05ldHdvcmtzOiB7XG4gICAgICAgIGdvb2dsZTogODQsXG4gICAgICAgIGZhY2Vib29rOiAzNixcbiAgICAgICAgdHdpdHRlcjogMTYsXG4gICAgICAgIGFtYXpvbjogMTQsXG4gICAgICAgIGFwcG5leHVzOiAxMCxcbiAgICAgICAgb3JhY2xlOiAxMCxcbiAgICAgICAgbWVkaWFtYXRoOiA5LFxuICAgICAgICBvYXRoOiA5LFxuICAgICAgICBtYXhjZG46IDcsXG4gICAgICAgIGF1dG9tYXR0aWM6IDdcbiAgICB9LFxuICAgIC8qXG4gICAgICogTWFwcGluZyBlbnRpdHkgbmFtZXMgdG8gQ1NTIGNsYXNzIG5hbWUgZm9yIHBvcHVwIGljb25zXG4gICAgICovXG4gICAgZW50aXR5SWNvbk1hcHBpbmc6IHtcbiAgICAgICAgJ0dvb2dsZSBMTEMnOiAnZ29vZ2xlJyxcbiAgICAgICAgJ0ZhY2Vib29rLCBJbmMuJzogJ2ZhY2Vib29rJyxcbiAgICAgICAgJ1R3aXR0ZXIsIEluYy4nOiAndHdpdHRlcicsXG4gICAgICAgICdBbWF6b24gVGVjaG5vbG9naWVzLCBJbmMuJzogJ2FtYXpvbicsXG4gICAgICAgICdBcHBOZXh1cywgSW5jLic6ICdhcHBuZXh1cycsXG4gICAgICAgICdNZWRpYU1hdGgsIEluYy4nOiAnbWVkaWFtYXRoJyxcbiAgICAgICAgJ1N0YWNrUGF0aCwgTExDJzogJ21heGNkbicsXG4gICAgICAgICdBdXRvbWF0dGljLCBJbmMuJzogJ2F1dG9tYXR0aWMnLFxuICAgICAgICAnQWRvYmUgSW5jLic6ICdhZG9iZScsXG4gICAgICAgICdRdWFudGNhc3QgQ29ycG9yYXRpb24nOiAncXVhbnRjYXN0JyxcbiAgICAgICAgJ1RoZSBOaWVsc2VuIENvbXBhbnknOiAnbmllbHNlbidcbiAgICB9LFxuICAgIGh0dHBzREJOYW1lOiAnaHR0cHMnLFxuICAgIGh0dHBzTGlzdHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ3VwZ3JhZGUgYmxvb20gZmlsdGVyJyxcbiAgICAgICAgICAgIG5hbWU6ICdodHRwc1VwZ3JhZGVCbG9vbUZpbHRlcicsXG4gICAgICAgICAgICB1cmw6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS9odHRwcy9odHRwcy1ibG9vbS5qc29uJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImRvbid0IHVwZ3JhZGUgYmxvb20gZmlsdGVyXCIsXG4gICAgICAgICAgICBuYW1lOiAnaHR0cHNEb250VXBncmFkZUJsb29tRmlsdGVycycsXG4gICAgICAgICAgICB1cmw6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS9odHRwcy9uZWdhdGl2ZS1odHRwcy1ibG9vbS5qc29uJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAndXBncmFkZSBzYWZlbGlzdCcsXG4gICAgICAgICAgICBuYW1lOiAnaHR0cHNVcGdyYWRlTGlzdCcsXG4gICAgICAgICAgICB1cmw6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS9odHRwcy9uZWdhdGl2ZS1odHRwcy1hbGxvd2xpc3QuanNvbidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJkb24ndCB1cGdyYWRlIHNhZmVsaXN0XCIsXG4gICAgICAgICAgICBuYW1lOiAnaHR0cHNEb250VXBncmFkZUxpc3QnLFxuICAgICAgICAgICAgdXJsOiAnaHR0cHM6Ly9zdGF0aWNjZG4uZHVja2R1Y2tnby5jb20vaHR0cHMvaHR0cHMtYWxsb3dsaXN0Lmpzb24nXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHRkc0xpc3RzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdzdXJyb2dhdGVzJyxcbiAgICAgICAgICAgIHVybDogJy9kYXRhL3N1cnJvZ2F0ZXMudHh0JyxcbiAgICAgICAgICAgIGZvcm1hdDogJ3RleHQnLFxuICAgICAgICAgICAgc291cmNlOiAnbG9jYWwnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICd0ZHMnLFxuICAgICAgICAgICAgdXJsOiAnaHR0cHM6Ly9zdGF0aWNjZG4uZHVja2R1Y2tnby5jb20vdHJhY2tlcmJsb2NraW5nL3YyLjEvdGRzLmpzb24nLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdleHRlcm5hbCcsXG4gICAgICAgICAgICBjaGFubmVsczoge1xuICAgICAgICAgICAgICAgIGxpdmU6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS90cmFja2VyYmxvY2tpbmcvdjIuMS90ZHMuanNvbicsXG4gICAgICAgICAgICAgICAgbmV4dDogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL3RyYWNrZXJibG9ja2luZy92Mi4xL3Rkcy1uZXh0Lmpzb24nLFxuICAgICAgICAgICAgICAgIGJldGE6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS90cmFja2VyYmxvY2tpbmcvYmV0YS90ZHMuanNvbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NsaWNrVG9Mb2FkQ29uZmlnJyxcbiAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vc3RhdGljY2RuLmR1Y2tkdWNrZ28uY29tL3VzZXJhZ2VudHMvc29jaWFsX2N0cF9jb25maWd1cmF0aW9uLmpzb24nLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdleHRlcm5hbCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2NvbmZpZycsXG4gICAgICAgICAgICB1cmw6ICdodHRwczovL3N0YXRpY2Nkbi5kdWNrZHVja2dvLmNvbS90cmFja2VyYmxvY2tpbmcvY29uZmlnL3YxL2V4dGVuc2lvbi1jb25maWcuanNvbicsXG4gICAgICAgICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ2V4dGVybmFsJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBodHRwc0Vycm9yQ29kZXM6IHtcbiAgICAgICAgJ25ldDo6RVJSX0NPTk5FQ1RJT05fUkVGVVNFRCc6IDEsXG4gICAgICAgICduZXQ6OkVSUl9BQk9SVEVEJzogMixcbiAgICAgICAgJ25ldDo6RVJSX1NTTF9QUk9UT0NPTF9FUlJPUic6IDMsXG4gICAgICAgICduZXQ6OkVSUl9TU0xfVkVSU0lPTl9PUl9DSVBIRVJfTUlTTUFUQ0gnOiA0LFxuICAgICAgICAnbmV0OjpFUlJfTkFNRV9OT1RfUkVTT0xWRUQnOiA1LFxuICAgICAgICBOU19FUlJPUl9DT05ORUNUSU9OX1JFRlVTRUQ6IDYsXG4gICAgICAgIE5TX0VSUk9SX1VOS05PV05fSE9TVDogNyxcbiAgICAgICAgJ0FuIGFkZGl0aW9uYWwgcG9saWN5IGNvbnN0cmFpbnQgZmFpbGVkIHdoZW4gdmFsaWRhdGluZyB0aGlzIGNlcnRpZmljYXRlLic6IDgsXG4gICAgICAgICdVbmFibGUgdG8gY29tbXVuaWNhdGUgc2VjdXJlbHkgd2l0aCBwZWVyOiByZXF1ZXN0ZWQgZG9tYWluIG5hbWUgZG9lcyBub3QgbWF0Y2ggdGhlIHNlcnZlcuKAmXMgY2VydGlmaWNhdGUuJzogOSxcbiAgICAgICAgJ0Nhbm5vdCBjb21tdW5pY2F0ZSBzZWN1cmVseSB3aXRoIHBlZXI6IG5vIGNvbW1vbiBlbmNyeXB0aW9uIGFsZ29yaXRobShzKS4nOiAxMCxcbiAgICAgICAgJ1NTTCByZWNlaXZlZCBhIHJlY29yZCB0aGF0IGV4Y2VlZGVkIHRoZSBtYXhpbXVtIHBlcm1pc3NpYmxlIGxlbmd0aC4nOiAxMSxcbiAgICAgICAgJ1RoZSBjZXJ0aWZpY2F0ZSBpcyBub3QgdHJ1c3RlZCBiZWNhdXNlIGl0IGlzIHNlbGYtc2lnbmVkLic6IDEyLFxuICAgICAgICBkb3duZ3JhZGVfcmVkaXJlY3RfbG9vcDogMTNcbiAgICB9LFxuICAgIHBsYXRmb3JtOiB7XG4gICAgICAgIG5hbWU6ICdleHRlbnNpb24nXG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSAodWFTdHJpbmcpID0+IHtcbiAgICBpZiAoIXVhU3RyaW5nKSB1YVN0cmluZyA9IGdsb2JhbFRoaXMubmF2aWdhdG9yLnVzZXJBZ2VudFxuXG4gICAgbGV0IGJyb3dzZXJcbiAgICBsZXQgdmVyc2lvblxuXG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHBhcnNlZFVhUGFydHMgPSB1YVN0cmluZy5tYXRjaCgvKEZpcmVmb3h8Q2hyb21lfEVkZylcXC8oWzAtOV0rKS8pXG4gICAgICAgIGlmICh1YVN0cmluZy5tYXRjaCgvKEVkZ2U/KVxcLyhbMC05XSspLykpIHtcbiAgICAgICAgICAgIC8vIEFib3ZlIHJlZ2V4IG1hdGNoZXMgb24gQ2hyb21lIGZpcnN0LCBzbyBjaGVjayBpZiB0aGlzIGlzIHJlYWxseSBFZGdlXG4gICAgICAgICAgICBwYXJzZWRVYVBhcnRzID0gdWFTdHJpbmcubWF0Y2goLyhFZGdlPylcXC8oWzAtOV0rKS8pXG4gICAgICAgIH1cbiAgICAgICAgYnJvd3NlciA9IHBhcnNlZFVhUGFydHNbMV1cbiAgICAgICAgdmVyc2lvbiA9IHBhcnNlZFVhUGFydHNbMl1cblxuICAgICAgICAvLyBCcmF2ZSBkb2Vzbid0IGluY2x1ZGUgYW55IGluZm9ybWF0aW9uIGluIHRoZSBVc2VyQWdlbnRcbiAgICAgICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IuYnJhdmUpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnQnJhdmUnXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHVubGlrZWx5LCBwcmV2ZW50IGV4dGVuc2lvbiBmcm9tIGV4cGxvZGluZyBpZiB3ZSBkb24ndCByZWNvZ25pemUgdGhlIFVBXG4gICAgICAgIGJyb3dzZXIgPSB2ZXJzaW9uID0gJydcbiAgICB9XG5cbiAgICBsZXQgb3MgPSAnbydcbiAgICBpZiAoZ2xvYmFsVGhpcy5uYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ1dpbmRvd3MnKSAhPT0gLTEpIG9zID0gJ3cnXG4gICAgaWYgKGdsb2JhbFRoaXMubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNYWMnKSAhPT0gLTEpIG9zID0gJ20nXG4gICAgaWYgKGdsb2JhbFRoaXMubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdMaW51eCcpICE9PSAtMSkgb3MgPSAnbCdcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9zLFxuICAgICAgICBicm93c2VyLFxuICAgICAgICB2ZXJzaW9uXG4gICAgfVxufVxuIiwiY29uc3QgUGFyZW50ID0gd2luZG93LkRERy5iYXNlLk1vZGVsXG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi8uLi9kYXRhL2NvbnN0YW50cycpXG5cbmZ1bmN0aW9uIEZlZWRiYWNrRm9ybSAoYXR0cnMpIHtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9XG4gICAgYXR0cnMuaXNCcm9rZW5TaXRlID0gYXR0cnMuaXNCcm9rZW5TaXRlIHx8IGZhbHNlXG4gICAgYXR0cnMudXJsID0gYXR0cnMudXJsIHx8ICcnXG4gICAgYXR0cnMubWVzc2FnZSA9IGF0dHJzLm1lc3NhZ2UgfHwgJydcbiAgICBhdHRycy5jYW5TdWJtaXQgPSBmYWxzZVxuICAgIGF0dHJzLnN1Ym1pdHRlZCA9IGZhbHNlXG5cbiAgICBhdHRycy5icm93c2VyID0gYXR0cnMuYnJvd3NlciB8fCAnJ1xuICAgIGF0dHJzLmJyb3dzZXJWZXJzaW9uID0gYXR0cnMuYnJvd3NlclZlcnNpb24gfHwgJydcblxuICAgIFBhcmVudC5jYWxsKHRoaXMsIGF0dHJzKVxuXG4gICAgdGhpcy51cGRhdGVDYW5TdWJtaXQoKVxuXG4gICAgLy8gZ3JhYiBhdGIgdmFsdWUgZnJvbSBiYWNrZ3JvdW5kIHByb2Nlc3NcbiAgICB0aGlzLnNlbmRNZXNzYWdlKCdnZXRTZXR0aW5nJywgeyBuYW1lOiAnYXRiJyB9KVxuICAgICAgICAudGhlbigoYXRiKSA9PiB7IHRoaXMuYXRiID0gYXRiIH0pXG4gICAgdGhpcy5zZW5kTWVzc2FnZSgnZ2V0RXh0ZW5zaW9uVmVyc2lvbicpXG4gICAgICAgIC50aGVuKChleHRlbnNpb25WZXJzaW9uKSA9PiB7IHRoaXMuZXh0ZW5zaW9uVmVyc2lvbiA9IGV4dGVuc2lvblZlcnNpb24gfSlcbiAgICB0aGlzLnNlbmRNZXNzYWdlKCdnZXRTZXR0aW5nJywgeyBuYW1lOiAndGRzLWV0YWcnIH0pXG4gICAgICAgIC50aGVuKChldGFnKSA9PiB7IHRoaXMudGRzID0gZXRhZyB9KVxufVxuXG5GZWVkYmFja0Zvcm0ucHJvdG90eXBlID0gd2luZG93LiQuZXh0ZW5kKHt9LFxuICAgIFBhcmVudC5wcm90b3R5cGUsXG4gICAge1xuICAgICAgICBtb2RlbE5hbWU6ICdmZWVkYmFja0Zvcm0nLFxuXG4gICAgICAgIHN1Ym1pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNhblN1Ym1pdCB8fCB0aGlzLl9zdWJtaXR0aW5nKSB7IHJldHVybiB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N1Ym1pdHRpbmcgPSB0cnVlXG5cbiAgICAgICAgICAgIHdpbmRvdy4kLmFqYXgoY29uc3RhbnRzLmZlZWRiYWNrVXJsLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICByZWFzb246IHRoaXMuaXNCcm9rZW5TaXRlID8gJ2Jyb2tlbl9zaXRlJyA6ICdnZW5lcmFsJyxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB0aGlzLnVybCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogdGhpcy5tZXNzYWdlIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICBicm93c2VyOiB0aGlzLmJyb3dzZXIgfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGJyb3dzZXJfdmVyc2lvbjogdGhpcy5icm93c2VyVmVyc2lvbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgdjogdGhpcy5leHRlbnNpb25WZXJzaW9uIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICBhdGI6IHRoaXMuYXRiIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICB0ZHM6IHRoaXMudHNkIHx8ICcnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgnc3VibWl0dGVkJywgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KCdlcnJvcmVkJywgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoJ2Vycm9yZWQnLCB0cnVlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlQnJva2VuU2l0ZTogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2lzQnJva2VuU2l0ZScsIHZhbClcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FuU3VibWl0KClcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUNhblN1Ym1pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNCcm9rZW5TaXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoJ2NhblN1Ym1pdCcsICEhKHRoaXMudXJsICYmIHRoaXMubWVzc2FnZSkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0KCdjYW5TdWJtaXQnLCAhIXRoaXMubWVzc2FnZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ3VybCcsICcnKVxuICAgICAgICAgICAgdGhpcy5zZXQoJ21lc3NhZ2UnLCAnJylcbiAgICAgICAgICAgIHRoaXMuc2V0KCdjYW5TdWJtaXQnLCBmYWxzZSlcbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBGZWVkYmFja0Zvcm1cbiIsImNvbnN0IFBhcmVudCA9IHdpbmRvdy5EREcuYmFzZS5QYWdlXG5jb25zdCBtaXhpbnMgPSByZXF1aXJlKCcuL21peGlucy9pbmRleC5lczYnKVxuY29uc3QgcGFyc2VVc2VyQWdlbnRTdHJpbmcgPSByZXF1aXJlKCcuLi8uLi9zaGFyZWQtdXRpbHMvcGFyc2UtdXNlci1hZ2VudC1zdHJpbmcuZXM2LmpzJylcbmNvbnN0IEZlZWRiYWNrRm9ybVZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9mZWVkYmFjay1mb3JtLmVzNicpXG5jb25zdCBGZWVkYmFja0Zvcm1Nb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9mZWVkYmFjay1mb3JtLmVzNicpXG5cbmZ1bmN0aW9uIEZlZWRiYWNrIChvcHMpIHtcbiAgICBQYXJlbnQuY2FsbCh0aGlzLCBvcHMpXG59XG5cbkZlZWRiYWNrLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIG1peGlucy5zZXRCcm93c2VyQ2xhc3NPbkJvZHlUYWcsXG4gICAgbWl4aW5zLnBhcnNlUXVlcnlTdHJpbmcsXG4gICAge1xuXG4gICAgICAgIHBhZ2VOYW1lOiAnZmVlZGJhY2snLFxuXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBQYXJlbnQucHJvdG90eXBlLnJlYWR5LmNhbGwodGhpcylcbiAgICAgICAgICAgIHRoaXMuc2V0QnJvd3NlckNsYXNzT25Cb2R5VGFnKClcblxuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5wYXJzZVF1ZXJ5U3RyaW5nKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXG4gICAgICAgICAgICBjb25zdCBicm93c2VySW5mbyA9IHBhcnNlVXNlckFnZW50U3RyaW5nKClcblxuICAgICAgICAgICAgdGhpcy5mb3JtID0gbmV3IEZlZWRiYWNrRm9ybVZpZXcoe1xuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiB3aW5kb3cuJCgnLmpzLWZlZWRiYWNrLWZvcm0nKSxcbiAgICAgICAgICAgICAgICBtb2RlbDogbmV3IEZlZWRiYWNrRm9ybU1vZGVsKHtcbiAgICAgICAgICAgICAgICAgICAgaXNCcm9rZW5TaXRlOiBwYXJhbXMuYnJva2VuLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbXMudXJsIHx8ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgYnJvd3NlcjogYnJvd3NlckluZm8uYnJvd3NlcixcbiAgICAgICAgICAgICAgICAgICAgYnJvd3NlclZlcnNpb246IGJyb3dzZXJJbmZvLnZlcnNpb25cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbilcblxuLy8ga2lja29mZiFcbndpbmRvdy5EREcgPSB3aW5kb3cuRERHIHx8IHt9XG53aW5kb3cuRERHLnBhZ2UgPSBuZXcgRmVlZGJhY2soKVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0QnJvd3NlckNsYXNzT25Cb2R5VGFnOiByZXF1aXJlKCcuL3NldC1icm93c2VyLWNsYXNzLmVzNi5qcycpLFxuICAgIHBhcnNlUXVlcnlTdHJpbmc6IHJlcXVpcmUoJy4vcGFyc2UtcXVlcnktc3RyaW5nLmVzNi5qcycpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwYXJzZVF1ZXJ5U3RyaW5nOiAocXMpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndHJpZWQgdG8gcGFyc2UgYSBub24tc3RyaW5nIHF1ZXJ5IHN0cmluZycpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJzZWQgPSB7fVxuXG4gICAgICAgIGlmIChxc1swXSA9PT0gJz8nKSB7XG4gICAgICAgICAgICBxcyA9IHFzLnN1YnN0cigxKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHMgPSBxcy5zcGxpdCgnJicpXG5cbiAgICAgICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2tleSwgdmFsXSA9IHBhcnQuc3BsaXQoJz0nKVxuXG4gICAgICAgICAgICBpZiAoa2V5ICYmIHZhbCkge1xuICAgICAgICAgICAgICAgIHBhcnNlZFtrZXldID0gdmFsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIHBhcnNlZFxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldEJyb3dzZXJDbGFzc09uQm9keVRhZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cuY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBtZXNzYWdlVHlwZTogJ2dldEJyb3dzZXInIH0sIChicm93c2VyTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKFsnZWRnJywgJ2VkZ2UnLCAnYnJhdmUnXS5pbmNsdWRlcyhicm93c2VyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBicm93c2VyTmFtZSA9ICdjaHJvbWUnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBicm93c2VyQ2xhc3MgPSAnaXMtYnJvd3Nlci0tJyArIGJyb3dzZXJOYW1lXG4gICAgICAgICAgICB3aW5kb3cuJCgnaHRtbCcpLmFkZENsYXNzKGJyb3dzZXJDbGFzcylcbiAgICAgICAgICAgIHdpbmRvdy4kKCdib2R5JykuYWRkQ2xhc3MoYnJvd3NlckNsYXNzKVxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsImNvbnN0IGJlbCA9IHJlcXVpcmUoJ2JlbCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBmaWVsZHNcblxuICAgIGlmICh0aGlzLm1vZGVsLnN1Ym1pdHRlZCB8fCB0aGlzLm1vZGVsLmVycm9yZWQpIHtcbiAgICAgICAgcmV0dXJuIHNob3dUaGFua1lvdSh0aGlzLm1vZGVsLmlzQnJva2VuU2l0ZSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tb2RlbC5pc0Jyb2tlblNpdGUpIHtcbiAgICAgICAgZmllbGRzID0gYmVsYDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9J2ZybV9fbGFiZWwnPldoaWNoIHdlYnNpdGUgaXMgYnJva2VuPzwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgY2xhc3M9J2pzLWZlZWRiYWNrLXVybCBmcm1fX2lucHV0JyB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0nQ29weSBhbmQgcGFzdGUgeW91ciBVUkwnIHZhbHVlPScke3RoaXMubW9kZWwudXJsfScvPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSdmcm1fX2xhYmVsJz5EZXNjcmliZSB0aGUgaXNzdWUgeW91IGVuY291bnRlcmVkOjwvbGFiZWw+XG4gICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9J2ZybV9fdGV4dCBqcy1mZWVkYmFjay1tZXNzYWdlJyByZXF1aXJlZCBwbGFjZWhvbGRlcj0nV2hpY2ggd2Vic2l0ZSBjb250ZW50IG9yIGZ1bmN0aW9uYWxpdHkgaXMgYnJva2VuPyBQbGVhc2UgYmUgYXMgc3BlY2lmaWMgYXMgcG9zc2libGUuJz48L3RleHRhcmVhPlxuICAgICAgICA8L2Rpdj5gXG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmllbGRzID0gYmVsYDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9J2ZybV9fbGFiZWwnPldoYXQgZG8geW91IGxvdmU/IFdoYXQgaXNuJ3Qgd29ya2luZz8gSG93IGNvdWxkIHRoZSBleHRlbnNpb24gYmUgaW1wcm92ZWQ/PC9sYWJlbD5cbiAgICAgICAgICAgIDx0ZXh0YXJlYSBjbGFzcz0nZnJtX190ZXh0IGpzLWZlZWRiYWNrLW1lc3NhZ2UnIHBsYWNlaG9sZGVyPSdXaGljaCBmZWF0dXJlcyBvciBmdW5jdGlvbmFsaXR5IGRvZXMgeW91ciBmZWVkYmFjayByZWZlciB0bz8gUGxlYXNlIGJlIGFzIHNwZWNpZmljIGFzIHBvc3NpYmxlLic+PC90ZXh0YXJlYT5cbiAgICAgICAgPC9kaXY+YFxuICAgIH1cblxuICAgIHJldHVybiBiZWxgPGZvcm0gY2xhc3M9J2ZybSc+XG4gICAgICAgIDxwPlN1Ym1pdHRpbmcgYW5vbnltb3VzIGZlZWRiYWNrIGhlbHBzIHVzIGltcHJvdmUgRHVja0R1Y2tHbyBQcml2YWN5IEVzc2VudGlhbHMuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3M9J2ZybV9fbGFiZWwnPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J2NoZWNrYm94JyBjbGFzcz0nanMtZmVlZGJhY2stYnJva2VuLXNpdGUgZnJtX19sYWJlbF9fY2hrJ1xuICAgICAgICAgICAgICAgICR7dGhpcy5tb2RlbC5pc0Jyb2tlblNpdGUgPyAnY2hlY2tlZCcgOiAnJ30vPlxuICAgICAgICAgICAgSSB3YW50IHRvIHJlcG9ydCBhIGJyb2tlbiBzaXRlXG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgICR7ZmllbGRzfVxuICAgICAgICA8aW5wdXQgY2xhc3M9J2J0biBqcy1mZWVkYmFjay1zdWJtaXQgJHt0aGlzLm1vZGVsLmNhblN1Ym1pdCA/ICcnIDogJ2lzLWRpc2FibGVkJ30nXG4gICAgICAgICAgICB0eXBlPSdzdWJtaXQnIHZhbHVlPSdTdWJtaXQnICR7dGhpcy5tb2RlbC5jYW5TdWJtaXQgPyAnJyA6ICdkaXNhYmxlZCd9Lz5cbiAgICA8L2Zvcm0+YFxufVxuXG5mdW5jdGlvbiBzaG93VGhhbmtZb3UgKGlzQnJva2VuU2l0ZSkge1xuICAgIGlmIChpc0Jyb2tlblNpdGUpIHtcbiAgICAgICAgcmV0dXJuIGJlbGA8ZGl2PlxuICAgICAgICAgICAgPHA+VGhhbmsgeW91IGZvciB5b3VyIGZlZWRiYWNrITwvcD5cbiAgICAgICAgICAgIDxwPllvdXIgYnJva2VuIHNpdGUgcmVwb3J0cyBoZWxwIG91ciBkZXZlbG9wbWVudCB0ZWFtIGZpeCB0aGVzZSBicmVha2FnZXMuPC9wPlxuICAgICAgICA8L2Rpdj5gXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJlbGA8cD5UaGFuayB5b3UgZm9yIHlvdXIgZmVlZGJhY2shPC9wPmBcbiAgICB9XG59XG4iLCJjb25zdCBQYXJlbnQgPSB3aW5kb3cuRERHLmJhc2UuVmlld1xuY29uc3QgZmVlZGJhY2tGb3JtVGVtcGxhdGUgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvZmVlZGJhY2stZm9ybS5lczYnKVxuXG5mdW5jdGlvbiBGZWVkYmFja0Zvcm0gKG9wcykge1xuICAgIHRoaXMubW9kZWwgPSBvcHMubW9kZWxcbiAgICB0aGlzLnRlbXBsYXRlID0gZmVlZGJhY2tGb3JtVGVtcGxhdGVcblxuICAgIFBhcmVudC5jYWxsKHRoaXMsIG9wcylcblxuICAgIHRoaXMuX3NldHVwKClcbn1cblxuRmVlZGJhY2tGb3JtLnByb3RvdHlwZSA9IHdpbmRvdy4kLmV4dGVuZCh7fSxcbiAgICBQYXJlbnQucHJvdG90eXBlLFxuICAgIHtcbiAgICAgICAgX3NldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUVsZW1zKCcuanMtZmVlZGJhY2snLCBbXG4gICAgICAgICAgICAgICAgJ3VybCcsXG4gICAgICAgICAgICAgICAgJ21lc3NhZ2UnLFxuICAgICAgICAgICAgICAgICdicm9rZW4tc2l0ZScsXG4gICAgICAgICAgICAgICAgJ3N1Ym1pdCdcbiAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50cyhbXG4gICAgICAgICAgICAgICAgW3RoaXMuc3RvcmUuc3Vic2NyaWJlLCAnY2hhbmdlOmZlZWRiYWNrRm9ybScsIHRoaXMuX29uTW9kZWxDaGFuZ2VdLFxuICAgICAgICAgICAgICAgIFt0aGlzLiR1cmwsICdpbnB1dCcsIHRoaXMuX29uVXJsQ2hhbmdlXSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kbWVzc2FnZSwgJ2lucHV0JywgdGhpcy5fb25NZXNzYWdlQ2hhbmdlXSxcbiAgICAgICAgICAgICAgICBbdGhpcy4kYnJva2Vuc2l0ZSwgJ2NoYW5nZScsIHRoaXMuX29uQnJva2VuU2l0ZUNoYW5nZV0sXG4gICAgICAgICAgICAgICAgW3RoaXMuJHN1Ym1pdCwgJ2NsaWNrJywgdGhpcy5fb25TdWJtaXRDbGlja11cbiAgICAgICAgICAgIF0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW9kZWxDaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5jaGFuZ2UuYXR0cmlidXRlID09PSAnaXNCcm9rZW5TaXRlJyB8fFxuICAgICAgICAgICAgICAgICAgICBlLmNoYW5nZS5hdHRyaWJ1dGUgPT09ICdzdWJtaXR0ZWQnIHx8XG4gICAgICAgICAgICAgICAgICAgIGUuY2hhbmdlLmF0dHJpYnV0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRFdmVudHMoKVxuICAgICAgICAgICAgICAgIHRoaXMuX3JlcmVuZGVyKClcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR1cCgpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUuY2hhbmdlLmF0dHJpYnV0ZSA9PT0gJ2NhblN1Ym1pdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzdWJtaXQudG9nZ2xlQ2xhc3MoJ2lzLWRpc2FibGVkJywgIXRoaXMubW9kZWwuY2FuU3VibWl0KVxuICAgICAgICAgICAgICAgIHRoaXMuJHN1Ym1pdC5hdHRyKCdkaXNhYmxlZCcsICF0aGlzLm1vZGVsLmNhblN1Ym1pdClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25Ccm9rZW5TaXRlQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy5tb2RlbC50b2dnbGVCcm9rZW5TaXRlKGUudGFyZ2V0LmNoZWNrZWQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uVXJsQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNldCgndXJsJywgdGhpcy4kdXJsLnZhbCgpKVxuICAgICAgICAgICAgdGhpcy5tb2RlbC51cGRhdGVDYW5TdWJtaXQoKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1lc3NhZ2VDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KCdtZXNzYWdlJywgdGhpcy4kbWVzc2FnZS52YWwoKSlcbiAgICAgICAgICAgIHRoaXMubW9kZWwudXBkYXRlQ2FuU3VibWl0KClcbiAgICAgICAgfSxcblxuICAgICAgICBfb25TdWJtaXRDbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMubW9kZWwuY2FuU3VibWl0KSB7IHJldHVybiB9XG5cbiAgICAgICAgICAgIHRoaXMubW9kZWwuc3VibWl0KClcblxuICAgICAgICAgICAgdGhpcy4kc3VibWl0LmFkZENsYXNzKCdpcy1kaXNhYmxlZCcpXG4gICAgICAgICAgICB0aGlzLiRzdWJtaXQudmFsKCdTZW5kaW5nLi4uJylcbiAgICAgICAgfVxuICAgIH1cbilcblxubW9kdWxlLmV4cG9ydHMgPSBGZWVkYmFja0Zvcm1cbiJdfQ==
