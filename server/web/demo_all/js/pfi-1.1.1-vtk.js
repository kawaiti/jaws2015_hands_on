/*! pfijs v1.1.1 (2014-07-18) */
this.pfi = (function (window, document, jQuery, $, parseInt) {
  'use strict';

  // Notify a failure of the processing and stop the program.
  function exit(msg) {
    alert(msg);
    throw new Error(msg);
  }

  // Other than IE8+, Chrome10+, Firefox3.6+, Safari5+ or Opera10+
  (document && document.querySelector) || exit('Not support browser.');
  // jQuery is not loaded.
  $ || exit('jQuery not found.');

(function () {
  // Object.keys emulate method
  var object_keys_proto_keys_ie = [
    'constructor',
    'propertyIsEnumerable',
    'isPrototypeOf',
    'hasOwnProperty',
    'toLocaleString',
    'toString',
    'valueOf'
  ];
  function object_keys(obj) {
    var keys = [], i = -1, j, k,
        loaded_keys = {}, proto_keys = object_keys_proto_keys_ie;

    if (obj.hasOwnProperty) {
      for (k in obj) {
        obj.hasOwnProperty(k) && (loaded_keys[k] = true, keys[++i] = k);
      }
      // for-in loop broken in IE
      // cf. https://github.com/documentcloud/underscore/issues/60
      for (j = proto_keys.length; j--; ) {
        loaded_keys[k = proto_keys[j]] !== true && obj.hasOwnProperty(k) && (keys[++i] = k);
      }
    } else {
      for (k in obj) {
        keys[++i] = k;
      }
    }

    return keys;
  }
  Object.keys || (Object.keys = object_keys);

  // Array.isArray emulate method
  function array_is_array(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }
  Array.isArray || (Array.isArray = array_is_array);

  // Date.now emulate method
  function date_now() {
    return +new Date();
  }
  Date.now || (Date.now = date_now);

  // Array.prototype.map emulate method
  function array_map(fn, that) {
    var i = 0, iz = this.length, rv = new Array(iz);
    for (; i < iz; ++i) {
      i in this && (rv[i] = fn.call(that, this[i], i, this));
    }
    return rv;
  }
  Array.prototype.map || (Array.prototype.map = array_map);

  // Array.prototype.forEach emulate method
  function array_for_each(fn, that) {
    var i = 0, iz = this.length;
    for (; i < iz; ++i) {
      i in this && fn.call(that, this[i], i, this);
    }
  }
  Array.prototype.forEach || (Array.prototype.forEach = array_for_each);

  // Array.prototype.some emulate method
  function array_some(fn, that) {
    var i = 0, iz = this.length;
    for (; i < iz; ++i) {
      if (i in this && fn.call(that, this[i], i, this)) {
        return true;
      }
    }
    return false;
  }
  Array.prototype.some || (Array.prototype.some = array_some);

  // Array.prototype.every emulate method
  function array_every(fn, that) {
    var i = 0, iz = this.length;
    for (; i < iz; ++i) {
      if (i in this && !fn.call(that, this[i], i, this)) {
        return false;
      }
    }
    return true;
  }
  Array.prototype.every || (Array.prototype.every = array_every);

  // Array.prototype.indexOf emulate method
  function array_index_of(mix, index) {
    var i = index || 0, iz = this.length;
    i = (i < 0) ? i + iz : i;
    for (; i < iz; ++i) {
      if (i in this && this[i] === mix) {
        return i;
      }
    }
    return -1;
  }
  Array.prototype.indexOf || (Array.prototype.indexOf = array_index_of);

  // Array.prototype.lastIndexOf emulate method
  function array_last_index_of(mix, index) {
    var i = index, iz = this.length;
    i = (i < 0) ? i + iz + 1 : iz;
    while (--i >= 0) {
      if (i in this && this[i] === mix) {
        return i;
      }
    }
    return -1;
  }
  Array.prototype.lastIndexOf || (Array.prototype.lastIndexOf = array_last_index_of);

  // Array.prototype.filter emulate method
  function array_filter(fn, that) {
    var rv = [], value, i = 0, iz = this.length;
    for (; i < iz; ++i) {
      if (i in this) {
        value = this[i];
        if (fn.call(that, value, i, this)) {
          rv.push(value);
        }
      }
    }
    return rv;
  }
  Array.prototype.filter || (Array.prototype.filter = array_filter);

  // String.prototype.trim emulate method
  function string_trim() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }
  String.prototype.trim || (String.prototype.trim = string_trim);

  // Function.prototype.bind emulate method
  function function_bind(context) {
    var rv,
        that = this,
        args = Array.prototype.slice.call(arguments, 1),
        Fn = function () {};
    rv = function () {
      return that.apply(this instanceof Fn ? this : context,
                        Array.prototype.concat.call(
                          args, Array.prototype.slice.call(arguments)
                        ));
    };
    Fn.prototype = that.prototype;
    rv.prototype = new Fn();
    return rv;
  }
  Function.prototype.bind || (Function.prototype.bind = function_bind);
}());

// Global namespace used by pfi.js.
function pfi() {}

// Simple logger
pfi.pp = function () {
  pfi.debug !== false && window.console && console.log && console.log.apply(console, arguments);
};

// Merge objects (original by $.extend)
// @example
//   dup = pfi.extend({}, { key: { a: 1 } }); // deep cloned
// @requires
//   $.isPlainObject, $.isArray
pfi.extend = function (src) {
  var dst, keys, args = arguments, i = 1, iz = args.length, j, jz, k, src_obj, dst_obj;

  if (src == null) {
    src = {};
  }

  for (; i < iz; ++i) {
    dst = args[i];
    if (dst && typeof dst === 'object') {
      for (keys = Object.keys(dst), j = 0, jz = keys.length; j < jz; ++j) {
        k = keys[j];
        src_obj = src[k],
        dst_obj = dst[k];

        if (src === dst_obj) {
          continue;
        }

        // deep cloning
        src[k] =
          dst_obj && $.isPlainObject(dst_obj) ?
            pfi.extend(src_obj && $.isPlainObject(src_obj) ? src_obj : {}, dst_obj) :
          dst_obj && $.isArray(dst_obj) ?
            pfi.extend([], dst_obj) : dst_obj;
      }
    }
  }

  return src;
};

// Generate UID
// @example
//   uid = pfi.uid(); // ex. pfixl2t5ha22ei73
pfi.uid = function () {
  return 'pfi' +
    ((Math.random() * 60466176) | 0).toString(36) + // 60466176 = 36 ^ 5 < 0x7FFFFFFF
    Date.now().toString(36);
};

(function ($, pfi) {
  /**
   * UI Class
   */
  function UI() {}

  pfi.extend(UI, {
    tmpl: window.Hogan ? function (text) {
      var tmpl = Hogan.compile(text);
      return function (data) {
        return tmpl.render(data);
      };
    } : function () {
      exit('Template engine not found.');
    },
    $tmpl: function (text) {
      var tmpl = this.tmpl(text);
      return function (data) {
        return $(tmpl(data));
      };
    },
    label: function (str) {
      return str
        .replace(/[\s_:]+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\b(?:id\b|.)/gi, function ($0) {
          return $0.toUpperCase();
        });
    },
    separate: function (str, mark, digits) {
      return ('' + str).replace(new RegExp('\\B(?=(?:\\d{' + (digits || 3) + '})+$)', 'g'), mark || ',');
    }
  });

  pfi.extend(UI.prototype, {
    on: function () {
      this.$ || (this.$ = $([ this ]));
      return this.$.on.apply(this.$, arguments);
    },
    off: function () {
      this.$ || (this.$ = $([ this ]));
      return this.$.off.apply(this.$, arguments);
    },
    fire: function () {
      this.$ || (this.$ = $([ this ]));
      return this.$.trigger.apply(this.$, arguments);
    }
  });

  pfi.UI = UI;

}(jQuery, pfi));

(function ($, pfi) {
  var bootstrap = pfi.bootstrap || (pfi.bootstrap = {});

  // bootstrap like jquery method generator
  bootstrap.define = function (name, Klass, defaults, callback) {
    if ($.type(defaults) === 'function') {
      callback = defaults;
      defaults = null;
    }
    if ($.type(callback) !== 'function') {
      callback = null;
    }

    $.fn[name] = function (option) {
      var args = arguments, rv = this;

      this.each(function () {
        var $this = $(this),
            data = $this.data(name),
            options = typeof option === 'object' && option;
        if (!data) {
          data = new Klass(this, options || {});
          $this.data(name, data);
        }

        if (typeof option === 'string') {
          var tmp = data[option].apply(data, Array.prototype.slice.call(args, 1));
          if (tmp !== void 0) {
            rv = tmp;
            return false;
          }
        } else if (options && data.setup) {
          data.setup(options);
        } else if (callback) {
          callback.apply(this, args);
        }
      });

      return rv;
    };
    $.fn[name].defaults = defaults || {};
    $.fn[name].Constructor = Klass;
  };

  // modal generator
  bootstrap.modal = function (options) {
    var $modal = $('<div class="modal hide fade">' +
                   '<div class="modal-header"><a href="javascript:void 0" class="close" data-dismiss="modal">&times;</a><h3></h3></div>' +
                   '<div class="modal-body"></div></div>');
    if (options) {
      if (typeof options !== 'object' || options.jquery) {
        options = { body: options };
      }
      'header' in options && $modal.find('.modal-header h3').append(options.header);
      'body'   in options && $modal.find('.modal-body').append(options.body);
      'footer' in options && $('<div>').addClass('modal-footer').append(options.footer).appendTo($modal);
    }
    return $modal;
  };

  // alert generator
  bootstrap.alert = function alert(options) {
    var $alert = $('<div class="alert fade in"><a href="javascript:void 0" class="close" data-dismiss="alert">&times;</a></div>');
    if (options) {
      if (typeof options !== 'object' || options.jquery) {
        options = { body: options };
      }
      'header' in options && $('<strong>').append(options.header).appendTo($alert);
      'body'   in options && $alert.append(options.body);
    }
    return $alert;
  };
}(jQuery, pfi));

(function (date) {
  /**
   * Format the date according to locale settings.
   *
   * @param {String} format
   * @param {Date} [date]
   * @returns {String}
   */
  // ref. http://svn.ruby-lang.org/repos/ruby/branches/ruby_1_9_3/strftime.c
  function strftime(format, date) {
    date || (date = Date.now());
    format = format.replace(strftime_replace_reg, strftime_replace_fun);

    function strftime_fun(all, flags, width, colons, type) {
      var value, m, tz,
          padding = strftime_default_padding[type] || 0;

      width = width ? parseInt(width, 10) : null;
      width === null && type in strftime_default_width && (width = strftime_default_width[type]);

      switch (type) {
      default:            value = type; break;
      case 'A': case 'a': value = strftime_tbl[type][date.getDay()]; break;
      case 'h': type = 'b';
        /* falls through */
      case 'B': case 'b': value = strftime_tbl[type][date.getMonth()]; break;
      case 'C':           value = date.getFullYear() / 100 | 0; break;
      case 'd': case 'e': value = date.getDate(); break;
      case 'g':           value = strftime_G(date) % 100; break;
      case 'G':           value = strftime_G(date); break;
      case 'H': case 'k': value = date.getHours(); break;
      case 'I': case 'l': value = date.getHours() % 12 || 12; break;
      case 'j':           value = strftime_j(date); break;
      case 'L': case 'N': value = date.getMilliseconds(); break;
      case 'M':           value = date.getMinutes(); break;
      case 'm':           value = date.getMonth() + 1; break;
      case 'P': case 'p': value = strftime_tbl[type][date.getHours() < 12 ? 0 : 1]; break;
      case 'S':           value = date.getSeconds(); break;
      case 's':           value = +date / 1000 | 0; break;
      case 'U':           value = (strftime_j(date) + 6 - date.getDay()) / 7 | 0; break;
      case 'u':           value = date.getDay() || 7; break;
      case 'V':           value = strftime_V(date); break;
      case 'W':           value = strftime_W(date); break;
      case 'w':           value = date.getDay(); break;
      case 'Y':           value = date.getFullYear(); break;
      case 'y':           value = date.getFullYear() % 100; break;
      case 'Z':
        m = /\(([^)]+)\)$/.exec(date.toString());
        value = m ? m[1] : '';
        break;
      case 'z':
        colons = colons.length;
        tz = date.getTimezoneOffset() * 60 | 0;
        value = tz > 0 ? '-' : '+';
        tz = Math.abs(tz);
        value += ('0' + (tz / 3600 | 0)).slice(-2);
        tz %= 3600;
        if (colons > 0) { value += ':'; }
        value += ('0' + (tz / 60 | 0)).slice(-2);
        if (colons > 1) { value += ':' + ('0' + (tz % 60)).slice(-2); }
        break;
      }

      value += '';

      ~flags.indexOf('^') && (value = value.toUpperCase()) ||
        ~flags.indexOf('#') && (value = value.toLowerCase());
      ~flags.indexOf('-') && (width = 0);

      if (width && value.length < width) {
        ~flags.indexOf('_') && (padding = ' ') ||
          ~flags.indexOf('0') && (padding = 0);
        value = (new Array(width - value.length + 1)).join(padding) + value;
      }

      return value;
    }

    return format.replace(strftime_reg, strftime_fun);
  }

  var strftime_replace_reg = /%[#0_^-]*\d*:*([cDFnRrTtvXx])/g,
      strftime_replace_tbl = {
        c: '%a %b %e %H:%M:%S %Y',
        D: '%m/%d/%y',
        F: '%Y-%m-%d',
        n: '\n',
        R: '%H:%M',
        r: '%I:%M:%S %p',
        T: '%H:%M:%S',
        t: '\t',
        v: '%e-%^b-%4Y',
        X: '%H:%M:%S',
        x: '%m/%d/%y'
      };
  function strftime_replace_fun(all, type) {
    return strftime_replace_tbl[type];
  }

  var strftime_reg = /%([#0_^-]*)(\d*)(:*)([a-z%])/ig,
      strftime_tbl = {
        A: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
        a: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
        B: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
        b: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
        P: [ 'AM', 'PM' ],
        p: [ 'am', 'pm' ]
      },
      strftime_default_width = {
        C: 2, d: 2, e: 2, g: 2, H: 2, I: 2,
        j: 3, k: 2, L: 3, l: 2, M: 2, m: 2,
        N: 9, S: 2, U: 2, W: 2, V: 2, y: 2
      },
      strftime_default_padding = {
        e: ' ', k: ' ', l: ' '
      };

  function strftime_G(date) {
    var Y = date.getFullYear(),
        V = strftime_V(date),
        W = strftime_W(date);
    if (W > V) {
      ++Y;
    } else if (W === 0 && V >= 52) {
      --Y;
    }
    return Y;
  }

  function strftime_j(date) {
    var ms = date - new Date(date.getFullYear(), 0, 1);
    return ((ms / 1000 / 60 / 60 / 24) | 0) + 1;
  }

  function strftime_V(date) {
    var week = strftime_W(date),
        day1_1 = (new Date(date.getFullYear(), 0, 1)).getDay();
    week += (day1_1 > 4 || day1_1 <= 1 ? 0 : 1);
    if (week === 53 && (new Date(date.getFullYear(), 11, 31)).getDay() < 4) {
      week = 1;
    } else if (week === 0) {
      week = strftime_V(new Date(date.getFullYear() - 1, 11, 31));
    }
    return week;
  }

  function strftime_W(date) {
    var doy = strftime_j(date),
        rday = 7 - (date.getDay() || 7);
    return (doy + rday) / 7 | 0;
  }

  date.strftime = strftime;

}(pfi.date || (pfi.date = {})));

(function (text) {
  /**
   * Returns a string produced according to the formatting string.
   *
   * @param {String} format
   * @param {...mixed}
   * @returns {String}
   */
  // ref. http://svn.ruby-lang.org/repos/ruby/branches/ruby_1_9_3/sprintf.c
  function sprintf(format) {
    var argv = arguments, argc = argv.length, next_index = 1;

    function get_arg(index, default_value) {
      index = index ? parseInt(index, 10) : next_index++;
      return index < argc ? argv[index] : default_value;
    }

    function sprintf_fun(all, position, flag_chars, use_width, width_index, width, use_precision, precision_index, precision, type) {
      if (type === '%') {
        return '%';
      }

      if (use_width) {
        width = parseInt(width || get_arg(width_index, 0), 10);
      }

      if (use_precision) {
        precision || (precision = use_precision === '.' ? 0 : get_arg(precision_index, 0));
        precision = parseInt(precision, 10);
      }

      var bit = sprintf_bit[type],
          arg = get_arg(position, ''),
          flag_minus = ~flag_chars.indexOf('-'),
          flag_zero = ~flag_chars.indexOf('0'),
          prefix = '', pad;

      width < 0 && (width = -width, flag_minus = true);

      if (!bit) { // c
        arg = typeof arg !== 'number' || arg < 0 ? ('' + arg).charAt(0) : String.fromCharCode(arg);

      } else if (bit & 8) { // String
        if (bit & 16) { // p
          arg = JSON.stringify(arg);
        }
        arg += '';
        use_precision && (arg = arg.slice(0, precision));

      } else {
        var flag_sharp = ~flag_chars.indexOf('#'),
            // flag_plus  = ~flag_chars.indexOf('+'),
            // flag_space = ~flag_chars.indexOf(' '),
            radix, sign;

        if (bit & 1) { // Integer
          arg = parseInt(arg, 10);
          arg < 0 && (arg = -arg, sign = '-');

          radix = bit & 16 ? 16 : bit & 32 ? 2 : bit & 64 ? 8 : void 0;
          if (radix && flag_sharp && arg) {
            prefix = bit & 16 ? '0x' : bit & 32 ? '0b' : '0';
            bit & 4 && (prefix = prefix.toUpperCase());
          }
          arg = arg.toString(radix);

          if (precision && arg.length < precision) {
            arg = (new Array(precision - arg.length + (prefix && (bit & 64) ? 0 : 1))).join('0') + arg;
          }
        } else { // Float
          arg = parseFloat(arg);
          arg < 0 && (arg = -arg, sign = '-');

          if (isFinite(arg)) {
            arg = bit === 2 && !precision ? '' + arg :
              arg[bit & 16 ? 'toPrecision' :
                  bit & 32 ? 'toExponential' :
                             'toFixed'](precision);
            flag_sharp ? (/^\d+\./.test(arg) || (arg = arg.replace(/^(\d+)/, '$1.'))) :
                         (bit & 16 && (arg = arg.replace(/\.0*$/, '')));

          } else {
            arg = arg.toString();
          }
        }

        sign || (sign =
                 ~flag_chars.indexOf('+') ? '+' :
                 ~flag_chars.indexOf(' ') ? ' ' : '');
        prefix = sign + prefix;

        arg = arg[bit & 4 ? 'toUpperCase' : 'toLowerCase']();
      }

      if (width && arg.length + prefix.length < width) {
        pad = width - prefix.length - arg.length + 1;
        pad = (new Array(pad)).join(flag_zero ? '0' : ' ');
        arg = flag_minus ? prefix + arg + pad :
              flag_zero  ? prefix + pad + arg :
                           pad + prefix + arg;
      } else {
        arg = prefix + arg;
      }

      return arg;
    }

    return format.replace(sprintf_reg, sprintf_fun);
  }

  // The syntax of format squence is follows.
  //   %[index$][flags][width][.precision]field
  //   index:     \d+ \$
  //   flags:     [ \x20 # 0 + - ]
  //   width:     \* \d+ \$ | \d+
  //   precision: \* \d+ \$ | \d+
  //   field:     [ b B d i o u x X e E f g G g A c p s % ]
  // /// %
  //   # index
  //   (?: (\d+) \$ )?
  //   # flags
  //   ( [ \x20 \# 0 + - ]* )
  //   # width
  //   (
  //     \* (?: (\d+) \$ )? | (\d+)
  //   )?
  //   # precision
  //   ( \. (?:
  //     \* (?: (\d+) \$ )? | (\d+)
  //   )? )?
  //   # field
  //   ( [ b B d i o u x X e E f g G g A c p s % ] )
  // ///
  var sprintf_reg = /%(?:(\d+)\$)?([ #0+-]*)(\*(?:(\d+)\$)?|(\d+))?(\.(?:\*(?:(\d+)\$)?|(\d+))?)?([bBdiouxXeEfgGgAcps%])/g,
      sprintf_bit = {
        // 1: Integer
        //   4: UpperCase
        //  16: Hexadecimal
        //  32: Binary
        //  64: Octal
        // 2: Float
        //   4: UpperCase
        //  16: g
        //  32: e
        //  64: a
        // 8: String
        //  16: p
        d: 1,
        i: 1,
        o: 1     | 64,
        x: 1     | 16,
        X: 1 | 4 | 16,
        b: 1     | 32,
        B: 1 | 4 | 32,
        u: 1,

        f: 2,
        g: 2     | 16,
        G: 2 | 4 | 16,
        e: 2     | 32,
        E: 2 | 4 | 32,
        a: 2     | 64,
        A: 2 | 4 | 64,

        p: 8 | 16,
        s: 8,
        c: 0
      };

  text.sprintf = sprintf;

}(pfi.text || (pfi.text = {})));

(function ($, pfi) {
  var charts = {};

  var Chart = function(element, option) {
    this.parent = $(element).closest('svg').size() === 0 ? d3.select(element).append('svg').node() : element;
    var options = this.options = pfi.extend({
      size: null,
      font: { size: 12, family: 'sans-serif' }
    }, option);
    this.resize(options.size);
    this.build();
    this.update();
  };

  Chart.prototype.resize = function(size) {
    this.options.size = size ? size : {
      width: parseInt(d3.select(this.parent).attr('width'), 10) || $(this.parent).parent().width(),
      height: parseInt(d3.select(this.parent).attr('height'), 10) || $(this.parent).parent().height()
    };
    d3.select(this.parent).attr(this.options.size);
  };

  Chart.prototype.build = function() {
    this.container = d3.select(this.parent).append('g')
      .style('font-family', this.options.font.family)
      .style('font-size', this.options.font.size + 'px');
    Chart.count = Chart.count ? Chart.count + 1 : 1;
    this.id = Chart.count;
  };

  var Chart2D = function(element, option) {
    Chart.call(this, element, pfi.extend({
      axis: {
        x: {
          position: 'bottom',
          scale: null,
          format: null,
          ticks: null,
          label: null,
          visible: true,
          selectable: false
        },
        y: {
          position: 'left',
          scale: null,
          format: null,
          ticks: null,
          label: null,
          visible: true,
          selectable: false
        }
      },
      legend: {
        visible: true,
        position: { x: 'right', y: 'top' },
        margin: { x: 10, y: 10 },
        padding: { x: 10, y: 10 },
        font: { size: 12, family: 'sans-serif' },
        mouseover: null,
        mouseout: null,
        click: null
      },
      groupColor: null,
      rangeselect: null,
      mouseover: null,
      mouseout: null,
      click: null
    }, option));
  };

  pfi.extend(Chart2D.prototype, Chart.prototype);

  Chart2D.prototype.build = function() {
    Chart.prototype.build.call(this);

    this.data = [];
    var clipId = 'pfi-chart-cilp-' + this.id;
    this.chartClip = this.container.append('defs').append('clipPath').attr('id', clipId)
      .append('rect').attr('x', 0).attr('y', 0);
    this.selector = {
      container: this.container.append('g').attr('class', 'pfi-chart-selector'),
      brush: d3.svg.brush()
    };
    this.chart = this.container.append('g').attr('clip-path', 'url(#' + clipId + ')');

    var self = this;
    this.axis = {};
    $.each(this.options.axis, function(direction, option) {
      if ((direction === 'x' && option.position === 'left') || (direction === 'x' && option.position === 'right') ||
          (direction === 'y' && option.position === 'top') || (direction === 'y' && option.position === 'bottom') ||
          $.inArray(option.position, ['top', 'right', 'bottom', 'left']) < 0) {
        throw new Error('Invalid position for ' + direction + ' axis: ' + option.position);
      }
      var axis = {};
      axis.position = option.position;
      axis.scale = option.scale === 'time' ? d3.time.scale() : d3.scale[option.scale]();
      axis.container = self.container.append('g').attr('class', 'pfi-chart-axis pfi-chart-' + direction);
      axis.line = self.container.append('line').attr('stroke', 'black').style('shape-rendering', 'crispEdges');
      axis.label = self.container.append('text').attr('class', 'pfi-chart-label pfi-chart-' + direction).text(option.label)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central');
      axis.labelOffset = 10;
      axis.visible = option.visible;
      axis.drawer = d3.svg.axis().scale(axis.scale).orient(option.position);
      option.format && axis.drawer.tickFormat(d3.format(option.format));
      option.ticks != null && axis.drawer.ticks(parseInt(option.ticks, 10));
      self.axis[direction] = axis;
      option.selectable && self.selector.brush[direction](axis.scale);
    });

    this.legend = self.container.append('g').attr('class', 'pfi-chart-legend').style('fill-opacity', 0).style('stroke-opacity', 0);
    this.legend.append('rect').style('stroke', 'black').style('fill', 'white').style('stroke-width', 1).style('shape-rendering', 'crispEdges');
    this.legend.append('g').attr('class', 'pfi-chart-names')
      .attr('transform', 'translate(' + this.options.legend.padding.x + ',' + this.options.legend.padding.y + ')');

    if (typeof this.options.groupColor === 'string') {
      this.groupColor = function() { return self.options.groupColor; };
    } else if (typeof this.options.groupColor === 'function') {
      this.groupColor = this.options.groupColor;
    } else {
      this.groupColor = d3.scale.category20();
    }

    this.innerSize = this.options.size;
  };

  Chart2D.prototype.stackData = function(data, aggregateKey, targetKey, baseKey, sumKey) {
    var bases = {};
    var sums = {};
    $.each(data, function(i, groupData) {
      $.each(groupData, function(j, datum) {
        var key = datum[aggregateKey];
        bases[key] || (bases[key] = { p0: 0, n0: 0 });
        if (datum[targetKey] >= 0) {
          datum[baseKey] = bases[key].p0;
          bases[key].p0 += datum[targetKey];
        } else {
          datum[baseKey] = bases[key].n0;
          bases[key].n0 += datum[targetKey];
        }
        sums[key] = datum[baseKey] + datum[targetKey];
      });
    });

    $.each(data, function(i, groupData) {
      $.each(groupData, function(j, datum) { datum[sumKey] = sums[datum[aggregateKey]]; });
    });
  };

  Chart2D.prototype.update = function(duration) {
    duration |= 0;
    var self = this;

    this.updateDomain();

    var margin = { top: 0, right: 0, bottom: 0, left: 0 };
    if (this.axis.x.visible) {
      this.axis.x.container.transition().duration(duration).call(this.axis.x.drawer);
      margin[this.axis.x.position] =
        this.axis.x.container.node().getBBox().height + this.axis.x.label.node().getBBox().height + this.axis.x.labelOffset;
    }
    if (this.axis.y.visible) {
      this.axis.y.container.transition().duration(duration).call(this.axis.y.drawer);
      margin[this.axis.y.position] =
        this.axis.y.container.node().getBBox().width + this.axis.y.label.node().getBBox().height + this.axis.x.labelOffset;
    }

    this.innerSize = {
      width: this.options.size.width - margin.left - margin.right,
      height: this.options.size.height - margin.top - margin.bottom
    };
    this.container.transition().duration(duration).attr('transform', 'translate(' + margin.left + ',' + margin.top +')');
    this.chartClip.transition().duration(duration).attr('width', this.innerSize.width).attr('height', this.innerSize.height);

    this.updateRange();

    if (this.axis.x.visible) {
      var x = this.axis.x.container.transition().duration(duration).call(this.axis.x.drawer);
      if (this.axis.x.position === 'bottom') {
        x.attr('transform', 'translate(0,' + self.innerSize.height + ')');
      }
      var xpos = this.axis.x.position === 'top' ?
            - this.axis.x.container.node().getBBox().height -  this.axis.x.label.node().getBBox().height / 2 - this.axis.x.labelOffset :
            self.options.size.height - this.axis.x.label.node().getBBox().height / 2;
      this.axis.x.label.transition().duration(duration).attr('transform', 'translate(' + (self.innerSize.width / 2) + ',' + xpos + ')');
      if (this.axis.y.scale.ticks && $.inArray(0, this.axis.y.scale.ticks(1)) >= 0) {
        this.axis.x.line.transition().duration(duration)
          .attr('y1', this.axis.y.scale(0)).attr('y2', this.axis.y.scale(0))
          .attr('x1', 0).attr('x2', this.innerSize.width);
      } else {
        this.axis.x.line.transition().duration(duration)
          .attr('y1', this.axis.x.position === 'top' ? 0 : this.innerSize.height)
          .attr('y2', this.axis.x.position === 'top' ? 0 : this.innerSize.height)
          .attr('x1', 0).attr('x2', this.innerSize.width);
      }
    }
    if (this.axis.y.visible) {
      var y = this.axis.y.container.transition().duration(duration).call(this.axis.y.drawer);
      if (this.axis.y.position === 'right') {
        y.attr('transform', 'translate(' + self.innerSize.width + ',0)');
      }
      var ypos = this.axis.y.position === 'left' ?
            - this.axis.y.container.node().getBBox().width -  this.axis.y.label.node().getBBox().height / 2 - this.axis.y.labelOffset :
            self.options.size.width - this.axis.y.label.node().getBBox().height / 2;
      this.axis.y.label.transition().duration(duration).attr('transform', 'rotate(-90) translate(' + (-self.innerSize.height / 2) + ',' + ypos + ')');
      if (this.axis.x.scale.ticks && $.inArray(0, this.axis.x.scale.ticks(1)) >= 0) {
        this.axis.y.line.transition().duration(duration)
          .attr('x1', this.axis.x.scale(0)).attr('x2', this.axis.x.scale(0))
          .attr('y1', 0).attr('y2', this.innerSize.height);
      } else {
        this.axis.y.line.transition().duration(duration)
          .attr('x1', this.axis.y.position === 'left' ? 0 : this.innerSize.width)
          .attr('x2', this.axis.y.position === 'left' ? 0 : this.innerSize.width)
          .attr('y1', 0).attr('y2', this.innerSize.height);
      }
    }

    this.container.selectAll('.pfi-chart-axis .tick line').style('stroke', 'black').style('shape-rendering', 'crispEdges');
    this.container.selectAll('.pfi-chart-axis .domain').style('fill', 'none').style('stroke', 'none');

    this.selector.container.select('.extent').style('fill-opacity', 0.25).style('fill', 'skyblue');
    if (this.selector.brush.x() || this.selector.brush.y()) {
      var selector = this.selector.container.call(this.selector.brush).selectAll('rect');
      if (!this.selector.brush.y()) {
        selector.attr('height', this.innerSize.height);
      }
      if (!this.selector.brush.x()) {
        selector.attr('width', this.innerSize.width);
      }
    }

    if (this.options.legend.visible && this.data.length && this.data[0].name) {
      var namesContainer = this.legend.select('g.pfi-chart-names');
      var names = namesContainer.selectAll('text').data(this.data, function(d){ return d.name; });
      names.attr('y', function(d,i) { return (i*1.2+0.8)+'em'; });
      names.enter().append('text')
        .attr('x','1.2em')
        .attr('y', function(d,i) { return (i*1.2+0.8)+'em'; })
        .text(function(d) { return d.name; });
      names.exit().remove();
      var circles = namesContainer.selectAll('circle').data(this.data, function(d) { return d.name; } );
      circles.attr('cy', function(d,i) { return (i*1.2+0.5)+'em'; });
      circles.enter().append('circle')
        .on('mouseover', function(d) {
          if (self.options.legend.mouseover || self.options.legend.click) {
            d3.select(this).style('stroke-opacity', 1);
          }
          if (self.options.legend.mouseover) {
            self.options.legend.mouseover(d.name);
          }
        }).on('mouseout', function(d) {
          d3.select(this).style('stroke-opacity', 0);
          if (self.options.legend.mouseout) {
            self.options.legend.mouseout(d.name);
          }
        }).on('click', function(d) {
          if (self.options.legend.click) {
            self.options.legend.click(d.name);
          }
        })
        .style('fill', function(d) { return d.color; })
        .style('stroke', function(d) { return d.color; })
        .style('stroke-width', 5)
        .style('stroke-opacity', 0)
        .attr('cx','0.4em').attr('cy', function(d,i) { return (i*1.2+0.5)+'em'; }).attr('r', '0.35em');
      circles.exit().remove();

      var legendSize = {
        width: namesContainer.node().getBBox().width + this.options.legend.padding.x * 2,
        height: namesContainer.node().getBBox().height + this.options.legend.padding.y * 2
      };
      var legendPosition = {
        x: this.options.legend.position.x !== 'left' ?
          this.innerSize.width - legendSize.width - this.options.legend.margin.x : this.options.legend.margin.x,
        y: this.options.legend.position.y !== 'bottom' ?
          this.options.legend.margin.y : this.innerSize.height - legendSize.height - this.options.legend.margin.y
      };

      this.legend.select('rect').attr('width', legendSize.width).attr('height', legendSize.height);
      this.legend.style('fill-opacity', 1).style('stroke-opacity', 1).transition().duration(duration)
        .attr('transform', 'translate(' + legendPosition.x + ',' + legendPosition.y + ')');
    } else {
      this.legend.style('fill-opacity', 0).style('stroke-opacity', 0);
    }
  };

  Chart2D.prototype.convertData = function(data, mapping, hasError) {
    var elems = 0;
    if (!$.isArray(data)) {
      throw new Error('The data must be a two-dimensional array');
    }
    if (data.length === 0) {
      return [[]];
    }
    $.each(data, function(i, row) {
      if (!$.isArray(row)) {
        throw new Error('The data must be a two-dimensional array');
      }
      elems || (elems = row.length);
      if (elems !== row.length) {
        throw new Error('Found inconsistent row size in the data');
      }
    });

    if (elems < 2) {
      throw new Error('The row size in the data must be more than 1');
    }
    mapping = pfi.extend({ x: 0, y: 1, g: elems === 2 ? undefined : 2 }, mapping);
    if (data[0][mapping.x] === undefined || data[0][mapping.y] === undefined ||
        (typeof mapping.g === 'number' && data[0][mapping.g] === undefined)) {
      throw new Error('Invalid mapping: x -> ' + mapping.x + ', y -> ' + mapping.y +
                      (typeof mapping.g === 'number' ? ', g -> ' + mapping.g : ''));
    }

    var messages = [];
    $.each(data, function(i, row) {
      if (typeof mapping.g === 'number' && typeof row[mapping.g] !== 'string') {
        messages.push('#' + i + ': invalid group');
      } else {
        var res = hasError({ x: row[mapping.x], y: row[mapping.y], g: row[mapping.g] });
        res && messages.push('#' + i + ': ' + res);
      }
    });
    if (messages.length) {
      throw new Error('Invalid data found... ' + messages.join(', '));
    }

    var groupIndice = {}, convertedData = [], self = this;
    $.each(data, function(i, row) {
      var group = row[mapping.g], groupData;
      if (groupIndice[group] === undefined) {
        groupIndice[group] = convertedData.length;
        groupData = [];
        groupData.name = group;
        groupData.color = self.groupColor(group);
        convertedData.push(groupData);
      } else {
        groupData = convertedData[groupIndice[group]];
      }
      groupData.push({ x: row[mapping.x], y: row[mapping.y] });
    });
    return convertedData;
  };

  Chart2D.prototype.sortData = function(groupData, sort) {
    var sortConditions = sort.split(':', 2);
    var sortKey = sortConditions[0];
    var sortDirection = sortConditions[1] === 'asc' ? 1 : -1;
    return groupData.sort(function(a, b) {
      return b[sortKey] > a[sortKey] ? -sortDirection : (b[sortKey] < a[sortKey] ? sortDirection : 0);
    });
  };

  Chart2D.prototype.sliceData = function(data, sort, unique, limit) {
    var found = {};
    var targets = this.sortData(d3.merge(data), sort).filter(function(datum) {
      return found[datum[unique]] ? false : (found[datum[unique]] = true);
    }).map(function(datum) { return datum[unique]; }).slice(0, limit);

    var self = this, targetSet = d3.set(targets);
    $.each(data, function(i, groupData) {
      self.sortData(groupData, sort);
      for (var j = 0; j < groupData.length; ++j) {
        if (!targetSet.has(groupData[j][unique])) {
          groupData.splice(j);
          break;
        }
      }
    });
    return targets;
  };

  Chart2D.prototype.setDrilldown = function(drilldown) {
    var data = [];
    $.each(drilldown, function(key, value) { data.push([key, value]); });
    this.setData(data);
  };

  var BarChart = function(element, option) {
    Chart2D.call(this, element, pfi.extend({
      axis: {
        x: { scale: 'linear' },
        y: {
          scale: 'ordinal',
          position: option.reverse ? 'right' : 'left',
          selectable: !!option.rangeselect
        }
      },
      limit: 10,
      sort: 'x:desc',
      strokeWidth: 1,
      padding: 0,
      barColor: null
    }, option));
  };

  pfi.extend(BarChart.prototype, Chart2D.prototype);

  BarChart.prototype.build = function() {
    Chart2D.prototype.build.call(this);

    if (typeof this.options.barColor === 'string') {
      this.barColor = function() { return self.options.barColor; };
    } else if (typeof this.options.barColor === 'function') {
      this.barColor = this.options.barColor;
    } else {
      this.barColor = null;
    }

    this.targetYs = [];

    var self = this;
    this.selector.brush.on('brushend', function() {
      var extent = self.selector.brush.extent();
      var bar = self.axis.y.scale.rangeBand();
      var targets = [];
      $.each(self.axis.y.scale.domain(), function(i, domain) {
        var from = self.axis.y.scale(domain);
        var to = from + bar;
        if (from <= extent[1] && extent[0] <= to) {
          targets.push(domain);
        }
      });
      if (self.options.rangeselect && targets.length) {
        self.options.rangeselect(targets);
      }
      self.selector.brush.clear();
      self.selector.container.call(self.selector.brush);
    });
  };

  BarChart.prototype.update = function(duration) {
    Chart2D.prototype.update.call(this, duration);

    var self = this;
    var barGroup = this.chart.selectAll('g.pfi-chart-bars').data(this.data, function(d){ return d.name; });
    barGroup.transition().duration(duration)
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1);
    barGroup.enter().append('g')
      .attr('class', 'pfi-chart-bars')
      .style('fill', function(d) { return d.color; })
      .style('stroke', 'white')
      .style('stroke-width', this.options.strokeWidth);
    barGroup.exit().transition().duration(duration)
      .style('fill-opacity', 1e-6)
      .style('stroke-opacity', 1e-6).remove();

    var names = [];
    $.each(this.data, function(i, d) { names.push(d.name); });

    var bars = barGroup.selectAll('rect').data(Object, function(d) { return d.y; });
    bars.enter().append('rect')
      .on('mouseover', function(d, i, g) {
        if (self.options.mouseover || self.options.click) {
          d3.select(this).style('fill-opacity', 0.8);
        }
        if (self.options.mouseover) {
          self.options.mouseover(names[g] === undefined ? { x: d.x, y: d.y } : { x: d.x, y: d.y, g: names[g] });
        }
      }).on('mouseout', function(d, i, g) {
        d3.select(this).style('fill-opacity', 'inherit');
        if (self.options.mouseout) {
          self.options.mouseout(names[g] === undefined ? { x: d.x, y: d.y } : { x: d.x, y: d.y, g: names[g] });
        }
      }).on('click', function(d, i, g) {
        if (self.options.click) {
          self.options.click(names[g] === undefined ? { x: d.x, y: d.y } : { x: d.x, y: d.y, g: names[g] });
        }
      })
      .attr('x', function(d) { return self.axis.x.scale(d.x0); })
      .attr('y', function(d) { return self.axis.y.scale(d.y); })
      .attr('fill', function(d) { return self.barColor ? self.barColor(d.y) : 'inherit'; })
      .attr('width', 0)
      .attr('height', self.axis.y.scale.rangeBand())
      .transition().duration(duration)
      .attr('x', function(d) { return Math.min(self.axis.x.scale(d.x0), self.axis.x.scale(d.x0 + d.x)); })
      .attr('width', function(d) { return Math.abs(self.axis.x.scale(d.x0 + d.x) - self.axis.x.scale(d.x0)); });
    bars.transition().duration(duration)
      .attr('x', function(d) { return Math.min(self.axis.x.scale(d.x0), self.axis.x.scale(d.x0 + d.x)); })
      .attr('y', function(d) { return self.axis.y.scale(d.y); })
      .style('fill-opacity', 'inherit')
      .style('stroke-opacity', 'inherit')
      .attr('width', function(d) { return Math.abs(self.axis.x.scale(d.x0 + d.x) - self.axis.x.scale(d.x0)); })
      .attr('height', self.axis.y.scale.rangeBand());
    bars.exit().transition().duration(duration)
      .attr('width', 0)
      .style('fill-opacity', 1e-6)
      .style('stroke-opacity', 1e-6)
      .remove();
  };

  BarChart.prototype.updateDomain = function() {
    this.axis.y.scale.domain(this.targetYs);
    this.axis.x.scale.domain(d3.extent(d3.merge(d3.merge(
      this.data.map(function(groupData) {
        return groupData.map(function(datum) { return [datum.x0, datum.x0 + datum.x]; });
      })
    )))).nice();
  };

  BarChart.prototype.updateRange = function() {
    this.axis.x.scale.range(this.axis.y.position === 'left' ? [0, this.innerSize.width] : [this.innerSize.width, 0]);
    this.axis.y.scale.rangeBands([0, this.innerSize.height], this.options.padding / 2);
  };

  BarChart.prototype.setData = function(data, mapping) {
    var found = {};
    this.data = this.convertData(data, mapping, function(datum) {
      found[datum.g] || (found[datum.g] = {});
      if (typeof datum.x !== 'number' || typeof datum.y !== 'string') {
        return '(x, y) is not (number, string)';
      } else if (found[datum.g][datum.y]) {
        return 'y is duplicated';
      }
      found[datum.g][datum.y] = true;
      return false;
    });
    this.stackData(this.data, 'y', 'x', 'x0', 'sum');
    var m = this.options.sort ? this.options.sort.match(/^x:(asc|desc)$/) : null;
    this.targetYs = this.sliceData(this.data, m ? 'sum:' + m[1] : this.options.sort, 'y', this.options.limit);
  };

  BarChart.prototype.setDrilldown = function(drilldown) {
    var data = [];
    $.each(drilldown, function(key, value) { data.push([value, key]); });
    this.setData(data);
  };

  charts.bar = BarChart;

  var ColumnChart = function(element, option) {
    Chart2D.call(this, element, pfi.extend({
      axis: {
        x: {
          scale: 'ordinal',
          selectable: !!option.rangeselect
        },
        y: { scale: 'linear' }
      },
      limit: 10,
      sort: 'y:desc',
      strokeWidth: 1,
      padding: 0,
      columnColor: null
    }, option));
  };

  pfi.extend(ColumnChart.prototype, Chart2D.prototype);

  ColumnChart.prototype.build = function() {
    Chart2D.prototype.build.call(this);

    if (typeof this.options.columnColor === 'string') {
      this.columnColor = function() { return self.options.columnColor; };
    } else if (typeof this.options.columnColor === 'function') {
      this.columnColor = this.options.columnColor;
    } else {
      this.columnColor = null;
    }

    this.targetXs = [];

    var self = this;
    this.selector.brush.on('brushend', function() {
      var extent = self.selector.brush.extent();
      var targets = [];
      $.each(self.axis.x.scale.domain(), function(i, domain) {
        var from = self.axis.x.scale(domain);
        var to = from + self.columnWidth;
        if (from <= extent[1] && extent[0] <= to) {
          targets.push(domain);
        }
      });
      if (self.options.rangeselect && targets.length) {
        self.options.rangeselect(targets);
      }
      self.selector.brush.clear();
      self.selector.container.call(self.selector.brush);
    });
  };

  ColumnChart.prototype.eventData = function(d, name) {
    return name === undefined ? { x: d.x, y: d.y } : { x: d.x, y: d.y, g: name };
  };

  ColumnChart.prototype.update = function(duration) {
    Chart2D.prototype.update.call(this, duration);

    var self = this;
    var columnGroup = this.chart.selectAll('g.pfi-chart-columns').data(this.data, function(d){ return d.name; });
    columnGroup.transition().duration(duration)
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1);
    columnGroup.enter().append('g')
      .attr('class', 'pfi-chart-columns')
      .style('fill', function(d) { return d.color; })
      .style('stroke', 'white')
      .style('stroke-width', this.options.strokeWidth);
    columnGroup.exit().transition().duration(duration)
      .style('fill-opacity', 1e-6)
      .style('stroke-opacity', 1e-6).remove();

    var names = [];
    $.each(this.data, function(i, d) { names.push(d.name); });

    var columns = columnGroup.selectAll('rect').data(Object, function(d) { return d.x; });
    columns.transition().duration(duration)
      .attr('x', function(d) { return self.axis.x.scale(d.x); })
      .attr('y', function(d) { return Math.min(self.axis.y.scale(d.y0), self.axis.y.scale(d.y0 + d.y)); })
      .style('fill-opacity', 'inherit')
      .style('stroke-opacity', 'inherit')
      .attr('width', this.columnWidth)
      .attr('height', function(d) { return Math.abs(self.axis.y.scale(d.y0) - self.axis.y.scale(d.y0 + d.y)); });
    columns.enter().append('rect')
      .on('mouseover', function(d, i, g) {
        if (self.options.mouseover || self.options.click) {
          d3.select(this).style('fill-opacity', 0.8);
        }
        if (self.options.mouseover) {
          self.options.mouseover(self.eventData(d, names[g?g:0]));
        }
      }).on('mouseout', function(d, i, g) {
        d3.select(this).style('fill-opacity', 'inherit');
        if (self.options.mouseout) {
          self.options.mouseout(self.eventData(d, names[g?g:0]));
        }
      }).on('click', function(d, i, g) {
        if (self.options.click) {
          self.options.click(self.eventData(d, names[g?g:0]));
        }
      })
      .attr('x', function(d) { return self.axis.x.scale(d.nx); })
      .attr('y', function() { return self.axis.y.scale(0); })
      .attr('width', this.columnWidth)
      .attr('height', 0)
      .attr('fill', function(d) { return self.columnColor ? self.columnColor(d.x) : 'inherit'; })
      .transition().duration(duration)
      .attr('x', function(d) { return self.axis.x.scale(d.x); })
      .attr('y', function(d) { return Math.min(self.axis.y.scale(d.y0), self.axis.y.scale(d.y0 + d.y)); })
      .attr('height', function(d) { return Math.abs(self.axis.y.scale(d.y0) - self.axis.y.scale(d.y0 + d.y)); });

    columns.exit().transition().duration(duration)
      .attr('x', function(d) { return self.axis.x.scale(d.x); })
      .style('fill-opacity', 1e-6)
      .style('stroke-opacity', 1e-6)
      .remove();
  };

  ColumnChart.prototype.updateDomain = function() {
    this.axis.x.scale.domain(this.targetXs);
    this.axis.y.scale.domain(d3.extent(d3.merge(d3.merge(
      this.data.map(function(groupData) {
        return groupData.map(function(datum) { return [datum.y0, datum.y0 + datum.y]; });
      })
    )))).nice();
  };

  ColumnChart.prototype.updateRange = function() {
    this.axis.x.scale.rangeBands([0, this.innerSize.width], this.options.padding / 2);
    this.axis.y.scale.range([this.innerSize.height, 0]);
    this.columnWidth = this.axis.x.scale.rangeBand();
  };

  ColumnChart.prototype.setData = function(data, mapping) {
    var found = {};
    this.data = this.convertData(data, mapping, function(datum) {
      found[datum.g] || (found[datum.g] = {});
      if (typeof datum.x !== 'string' || typeof datum.y !== 'number') {
        return '(x, y) is not (string, number)';
      } else if (found[datum.g][datum.x]) {
        return 'x is duplicated';
      }
      found[datum.g][datum.x] = true;
      return false;
    });
    this.stackData(this.data, 'x', 'y', 'y0', 'sum');
    $.each(this.data, function(i, groupData) {
      $.each(groupData, function(j, datum) { datum.nx = datum.x; });
    });

    var m = this.options.sort ? this.options.sort.match(/^y:(asc|desc)$/) : null;
    this.targetXs = this.sliceData(this.data, m ? 'sum:' + m[1] : this.options.sort, 'x', this.options.limit);
  };

  charts.column = ColumnChart;

  var LineChart = function(element, option) {
    Chart2D.call(this, element, pfi.extend({
      axis: {
        x: {
          scale: 'ordinal',
          selectable: !!option.rangeselect
        },
        y: { scale: 'linear' }
      },
      sort: 'y:desc',
      limit: 10,
      strokeWidth: 1,
      pointSize: 3,
      padding: 1
    }, option));
  };

  pfi.extend(LineChart.prototype, Chart2D.prototype);

  LineChart.prototype.build = function() {
    Chart2D.prototype.build.call(this);
    this.targetXs = [];
    var self = this;
    this.selector.brush.on('brushend', function() {
      var extent = self.selector.brush.extent();
      var targets = [];
      $.each(self.axis.x.scale.domain(), function(i, domain) {
        var x = self.axis.x.scale(domain);
        if (extent[0] <= x && x <= extent[1]) {
          targets.push(domain);
        }
      });
      if (self.options.rangeselect && targets.length) {
        self.options.rangeselect(targets);
      }
      self.selector.brush.clear();
      self.selector.container.call(self.selector.brush);
    });
  };

  LineChart.prototype.eventData = function(d, name) {
    return name === undefined ? { x: d.x, y: d.y } : { x: d.x, y: d.y, g: name };
  };

  LineChart.prototype.update = function(duration) {
    Chart2D.prototype.update.call(this, duration);

    var self = this;

    var lineGroup = this.chart.selectAll('g.pfi-chart-lines').data(this.data, function(d){ return d.name; });
    lineGroup.transition().duration(duration)
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1);
    lineGroup.enter().append('g')
      .attr('class', 'pfi-chart-lines')
      .style('stroke', function(d) { return d.color; })
      .style('fill', function(d) { return d.color; })
      .style('fill-opacity', 1e-6)
      .style('stroke-width', this.options.strokeWidth)
      .style('stroke-opacity', 1e-6)
      .transition().duration(duration)
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1);
    lineGroup.exit().transition().duration(duration)
      .style('fill-opacity', 1e-6).style('stroke-opacity', 1e-6).remove();

    var lines = lineGroup.selectAll('line').data(Object, function(d) { return d.x; });
    lines.transition().duration(duration)
      .style('stroke-opacity', 'inherit')
      .attr('x1', function(d) { return self.axis.x.scale(d.x); })
      .attr('x2', function(d) { return self.axis.x.scale(d.nx); })
      .attr('y1', function(d) { return self.axis.y.scale(d.y); })
      .attr('y2', function(d) { return self.axis.y.scale(d.ny); });
    lines.enter().append('line')
      .attr('x1', function(d) { return self.axis.x.scale(d.nx); })
      .attr('x2', function(d) { return 2 * self.axis.x.scale(d.nx) - self.axis.x.scale(d.x); })
      .attr('y1', function() { return self.axis.y.scale(0); })
      .attr('y2', function() { return self.axis.y.scale(0); })
      .style('stroke-opacity', 1e-6)
      .transition().duration(duration)
      .attr('x1', function(d) { return self.axis.x.scale(d.x); })
      .attr('x2', function(d) { return self.axis.x.scale(d.nx); })
      .attr('y1', function(d) { return self.axis.y.scale(d.y); })
      .attr('y2', function(d) { return self.axis.y.scale(d.ny); })
      .style('stroke-opacity', 'inherit');
    lines.exit().transition().duration(duration)
      .attr('x1', function(d) { return self.axis.x.scale(d.x); })
      .attr('x2', function(d) { return self.axis.x.scale(d.nx); })
      .style('stroke-opacity', 1e-6).remove();

    var names = [];
    $.each(this.data, function(i, d) { names.push(d.name); });

    var points = lineGroup.selectAll('circle').data(Object, function(d) { return d.x; });
    points.transition().duration(duration)
      .style('fill-opacity', 'inherit')
      .attr('cx', function(d) { return self.axis.x.scale(d.x); })
      .attr('cy', function(d) { return self.axis.y.scale(d.y); });
    points.enter().append('circle')
      .on('mouseover', function(d, i, g) {
        if (self.options.mouseover || self.options.click) {
          d3.select(this).style('stroke-opacity', 'inherit');
        }
        if (self.options.mouseover) {
          self.options.mouseover(self.eventData(d, names[g?g:0]));
        }
      }).on('mouseout', function(d, i, g) {
        d3.select(this).style('stroke-opacity', 0);
        if (self.options.mouseout) {
          self.options.mouseout(self.eventData(d, names[g?g:0]));
        }
      }).on('click', function(d, i, g) {
        if (self.options.click) {
          self.options.click(self.eventData(d, names[g?g:0]));
        }
      })
      .attr('r', this.options.pointSize / 2)
      .attr('cx', function(d) { return self.axis.x.scale(d.nx); })
      .attr('cy', function() { return self.axis.y.scale(0); })
      .style('fill-opacity', 1e-6)
      .style('stroke-width', 5)
      .style('stroke-opacity', 0)
      .transition().duration(duration)
      .attr('cx', function(d) { return self.axis.x.scale(d.x); })
      .attr('cy', function(d) { return self.axis.y.scale(d.y); })
      .style('fill-opacity', 'inherit');
    points.exit().transition().duration(duration)
      .attr('cx', function(d) { return self.axis.x.scale(d.x); })
      .style('fill-opacity', 1e-6).remove();
  };

  LineChart.prototype.updateDomain = function() {
    this.axis.x.scale.domain(this.targetXs);
    this.axis.y.scale.domain(d3.extent(d3.merge(
      this.data.map(function(groupData) { return groupData.map(function(datum) { return datum.y; }); })
    ))).nice();
  };

  LineChart.prototype.updateRange = function() {
    this.axis.x.scale.rangePoints([0, this.innerSize.width], this.options.padding);
    this.axis.y.scale.range([this.innerSize.height, 0]);
  };

  LineChart.prototype.setData = function(data, mapping) {
    var found = {};
    this.data = this.convertData(data, mapping, function(datum) {
      found[datum.g] || (found[datum.g] = {});
      if (typeof datum.x !== 'string' || typeof datum.y !== 'number') {
        return '(x, y) is not (string, number)';
      } else if (found[datum.g][datum.x]) {
        return 'x is duplicated';
      }
      found[datum.g][datum.x] = true;
      return false;
    });

    var maxs = {};
    $.each(this.data, function(i, groupData) {
      $.each(groupData, function(j, datum) {
        var key = datum.x;
        if (maxs[key] === undefined || datum.y > maxs[key]) {
          maxs[key] = datum.y;
        }
      });
    });
    $.each(this.data, function(i, groupData) {
      $.each(groupData, function(j, datum) { datum.max = maxs[datum.x]; });
    });

    var m = this.options.sort ? this.options.sort.match(/^y:(asc|desc)$/) : null;
    this.targetXs = this.sliceData(this.data, m ? 'max:' + m[1] : this.options.sort, 'x', this.options.limit);
    $.each(this.data, function(index, group) {
      for (var i = 0; i < group.length; ++i) {
        group[i].nx = (i === group.length - 1) ? group[i].x : group[i + 1].x;
        group[i].ny = (i === group.length - 1) ? group[i].y : group[i + 1].y;
      }
    });
  };

  charts.line = LineChart;

  var TimeSeriesColumnChart = function(element, option) {
    ColumnChart.call(this, element, pfi.extend({
      axis: {
        x: { scale: 'time' },
        y: { scale: 'linear' }
      }
    }, option));
  };

  pfi.extend(TimeSeriesColumnChart.prototype, ColumnChart.prototype);

  TimeSeriesColumnChart.prototype.build = function() {
    ColumnChart.prototype.build.call(this);
    var self = this;
    this.selector.brush.on('brushend', function() {
      var extent = self.selector.brush.extent();
      var targets = {};
      self.chart.selectAll('rect').each(function(d) {
        if (d.x <= extent[1]  && extent[0] <= d.nx) {
          targets[d.x] = '[' + parseInt(d.x/1000, 10) + ' to ' + parseInt(d.nx/1000, 10) + ')';
        }
      });
      var data = [];
      $.each(targets, function(key, value) { data.push(value); });
      if (self.options.rangeselect && data.length) {
        self.options.rangeselect(data);
      }
      self.selector.brush.clear();
      self.selector.container.call(self.selector.brush);
    });
  };

  TimeSeriesColumnChart.prototype.eventData = function(d, name) {
    var e = { x: '[' + parseInt(d.x/1000, 10) + ' to ' + parseInt(d.nx/1000, 10) + ')', y: d.y };
    if (name !== undefined) {
      e.g = name;
    }
    return e;
  };

  TimeSeriesColumnChart.prototype.updateDomain = function() {
    this.axis.x.scale.domain(d3.extent(d3.merge(d3.merge(
      this.data.map(function(groupData) {
        return groupData.map(function(datum) { return [datum.x, datum.nx]; });
      })
    ))));
    this.axis.y.scale.domain(d3.extent(d3.merge(d3.merge(
      this.data.map(function(groupData) {
        return groupData.map(function(datum) { return [datum.y0, datum.y0 + datum.y]; });
      })
    )))).nice();
  };

  TimeSeriesColumnChart.prototype.updateRange = function() {
    this.axis.x.scale.range([0, this.innerSize.width]);
    this.axis.y.scale.range([this.innerSize.height, 0]);
    if (this.data.length && this.data[0].length) {
      this.columnWidth = this.axis.x.scale(this.data[0][0].nx) - this.axis.x.scale(this.data[0][0].x);
    }
  };

  TimeSeriesColumnChart.prototype.setData = function(data, mapping) {
    var found = {};
    this.data = this.convertData(data, mapping, function(datum) {
      found[datum.g] || (found[datum.g] = {});
      if (typeof datum.x !== 'string' || !datum.x.match(/^\[\d+ to \d+\)$/) || typeof datum.y !== 'number') {
        return '(x, y) is not (range-format string, number)';
      } else if (found[datum.g][datum.x]) {
        return 'x is duplicated';
      }
      found[datum.g][datum.x] = true;
      return false;
    });
    this.stackData(this.data, 'x', 'y', 'y0', 'sum');
    $.each(this.data, function(i, groupData) {
      $.each(groupData, function(j, datum) {
        var m = datum.x.match(/^\[(\d+) to (\d+)\)$/);
        datum.x = new Date(parseInt(m[1], 10) * 1000);
        datum.nx = new Date(parseInt(m[2], 10) * 1000);
      });
    });
  };

  charts['time-series-column'] = TimeSeriesColumnChart;

  var TimeSeriesLineChart = function(element, option) {
    LineChart.call(this, element, pfi.extend({
      axis: {
        x: { scale: 'time' },
        y: { scale: 'linear' }
      }
    }, option));
  };

  pfi.extend(TimeSeriesLineChart.prototype, LineChart.prototype);

  TimeSeriesLineChart.prototype.build = function() {
    LineChart.prototype.build.call(this);
    var self = this;
    this.selector.brush.on('brushend', function() {
      var extent = self.selector.brush.extent();
      var targets = {};
      self.chart.selectAll('circle').each(function(d) {
        if (extent[0] <= d.x && d.x <= extent[1]) {
          targets[d.x] = parseInt(d.x/1000, 10);
        }
      });
      var data = [];
      $.each(targets, function(key, value) { data.push(value); });
      if (self.options.rangeselect && data.length) {
        self.options.rangeselect(data);
      }
      self.selector.brush.clear();
      self.selector.container.call(self.selector.brush);
    });
  };

  TimeSeriesLineChart.prototype.eventData = function(d, name) {
    var e = { x: parseInt(d.x/1000, 10), y: d.y };
    if (name !== undefined) {
      e.g = name;
    }
    return e;
  };

  TimeSeriesLineChart.prototype.updateDomain = function() {
    this.axis.x.scale.domain(d3.extent(d3.merge(
      this.data.map(function(groupData) { return groupData.map(function(datum) { return datum.x; }); })
    )));
    this.axis.y.scale.domain(d3.extent(d3.merge(
      this.data.map(function(groupData) { return groupData.map(function(datum) { return datum.y; }); })
    ))).nice();
  };

  TimeSeriesLineChart.prototype.updateRange = function() {
    this.axis.x.scale.range([0, this.innerSize.width]);
    this.axis.y.scale.range([this.innerSize.height, 0]);
  };

  TimeSeriesLineChart.prototype.setData = function(data, mapping) {
    var found = {};
    this.data = this.convertData(data, mapping, function(datum) {
      found[datum.g] || (found[datum.g] = {});
      if (typeof datum.x !== 'number' || typeof datum.y !== 'number') {
        return '(x, y) is not (unixtime, number)';
      } else if (found[datum.g][datum.x]) {
        return 'x is duplicated';
      }
      found[datum.g][datum.x] = true;
      return false;
    });
    $.each(this.data, function(i, groupData) {
      $.each(groupData, function(j, datum) { datum.x = new Date(parseInt(datum.x, 10) * 1000); });
    });

    var self = this;
    $.each(this.data, function(i, groupData) {
      self.sortData(groupData, 'x:asc');
      for (var j = 0; j < groupData.length; ++j) {
        groupData[j].nx = (j === groupData.length - 1) ? groupData[j].x : groupData[j + 1].x;
        groupData[j].ny = (j === groupData.length - 1) ? groupData[j].y : groupData[j + 1].y;
      }
    });
  };

  charts['time-series-line'] = TimeSeriesLineChart;

  /*
   * $(..).chart();
   */
  pfi.bootstrap.define('chart', function(element, option)  {
    var options = pfi.extend({}, $.fn.chart.defaults, option);
    if (!options.type) {
      throw new Error('Option "type" must be specified');
    }
    if (!charts[options.type]) {
      throw new Error('Invalid chart type: ' + options.type);
    }
    var constructor = charts[options.type];
    pfi.extend(this, constructor.prototype);
    constructor.call(this, element, options);
  }, {});
}($, pfi));

(function ($, pfi) {
  /*
   * $(..).counter();
   */
  function Counter(element, option) {
    var options = this.options = pfi.extend({}, $.fn.counter.defaults, option);
    this.container = d3.select(element).append('div')
      .style('font-family', options.font.family)
      .style('font-size', options.font.size + 'px')
      .style('font-weight', options.font.weight);
  }

  pfi.extend(Counter.prototype, {
    setCount: function (count, color) {
      var container = this.container.transition().duration(this.options.duration);
      container.tween('text', function() {
        var f = d3.interpolate(this.textContent.replace(/,/g, ''), count);
        return function (t) {
          var tmp = '' + Math.round(f(t));
          this.textContent = tmp.replace(/\B(?=(?:\d{3})+$)/g, ',');
        };
      });
      color && container.style('color', color);
    }
  });

  pfi.bootstrap.define('counter', Counter, {
    duration: 1000,
    font: {
      family: 'sans-serif',
      size: 36,
      weight: 'bold'
    }
  });
}($, pfi));

(function ($, pfi) {
  /*
   * $(..).timeline();
   */
  function Timeline(element, option) {
    var $element = this.$element = $(element),
        options = this.options = pfi.extend({}, $.fn.timeline.defaults, option);

    this.$root = $('<div>').css({
      overflow: 'scroll',
      height: $element.height()
    }).appendTo($element);

    this.$tmpl = pfi.UI.$tmpl(options.template);
    this.data = [];
  }

  pfi.extend(Timeline.prototype, {
    get: function() {
      var data = [];
      this.$root.find('.pfi-timeline-chunk:not(.pfi-timeline-fadeout) .pfi-timeline-item').each(function(i, e) { data.push($(e).data()); });
      return data;
    },
    add: function(data) {
      var $chunk = $('<div>').addClass('pfi-timeline-chunk').prependTo(this.$root);

      var self = this;
      $.each(data, function(i, datum) {
        self.$tmpl(datum).data(datum).addClass('pfi-timeline-item').appendTo($chunk);
      });

      $chunk.css({
        marginTop: (-$chunk.outerHeight(true)) + 'px'
      }).animate({
        marginTop: 0
      }, this.options.duration, function() {
        self.$root.find('.pfi-timeline-item').slice(self.options.limit).remove();
        self.$root.find('.pfi-timeline-chunk:not(:has(.pfi-timeline-item))').remove();
      });
    },

    clear: function (duration) {
      var d = (duration === undefined) ? this.options.duration : duration;
      this.$root.find('.pfi-timeline-chunk').addClass('pfi-timeline-fadeout').fadeOut(d, function() { $(this).remove(); });
      this.data = [];
    }
  });

  pfi.bootstrap.define('timeline', Timeline, {
    limit: 100,
    duration: 1000,
    template: '<div>example</div>'
  });
}($, pfi));

(function ($, pfi) {
  function Pillcase(element, option) {
    var $element = this.$element = $(element),
        options = this.options = pfi.extend({}, $.fn.pillcase.defaults, option);

    options.template = {};
    options.template.$container = pfi.UI.$tmpl('<div class="pfi-pillcase-container"><ul class="pfi-pillcase-pills"></ul><div class="pfi-pillcase-resizer"></div></div>');
    options.template.$suggestion = pfi.UI.$tmpl('<div class="pfi-pillcase-suggestion"><ul class="pfi-pillcase-suggest-items"/></div>');
    options.template.$lockedPills = pfi.UI.$tmpl('{{#values}}<li class="pfi-pillcase-pill pfi-pillcase-locked-pill" data-value="{{.}}"><span>{{.}}</span></li>{{/values}}');
    options.template.$editablePills = pfi.UI.$tmpl('{{#values}}<li class="pfi-pillcase-pill pfi-pillcase-editable-pill" data-value="{{.}}"><span>{{.}}</span><a tabindex="-1" href="#" class="pfi-pillcase-pill-remover">&times</a></li>{{/values}}');
    options.template.$inputField = pfi.UI.$tmpl('<li class="pfi-pillcase-field"><textarea class="pfi-pillcase-input" style="width:1px;height:1px"></textarea></li>');
    options.template.$suggestItems = pfi.UI.$tmpl('{{#values}}<li class="pfi-pillcase-suggest-item" data-value="{{.}}"><a tabindex="-1" href="#">{{.}}</a></li>{{/values}}');

    options.values || (options.values = $element.val());
    options.lockedValues || (options.lockedValues = []);
    options.lockedValues.length && options.allowedValues &&
      (options.allowedValues = options.allowedValues.filter(function (v) {
        return options.lockedValues.indexOf(v) === -1;
      }));
    $.isFunction(options.source) && (this.source = options.source);

    $element.val('');

    var $container = this.$container = options.template.$container(),
        values = this.formatter(options.values);
    this.options.template.$inputField().appendTo($container.find('.pfi-pillcase-pills'));

    this.setInputValues(values);
    this.setPillNodes(values);

    this.$resizer = $container.find('.pfi-pillcase-resizer');
    this.$suggestion = options.template.$suggestion();
    this.closeSuggestion();

    $element.attr('tabindex', -1).addClass('pfi-pillcase-offscreen');
    $container.insertBefore($element).append($element);
    this.$suggestion.insertAfter($container);

    this.fitContainer();
    Pillcase.once();
  }

  Pillcase.once = function () {
    if (this.onceCalled) {
      return;
    }
    this.onceCalled = true;
    $(document)
      .on('mousedown',   '.pfi-pillcase-container',      send_pillcase_container_event('stopEvent'))
      .on('mousedown',   '.pfi-pillcase-suggest-item a', send_pillcase_suggestion_event('stopEvent'))
      .on('keyup input', 'textarea.pfi-pillcase-input',  send_pillcase_container_event('keyupInput'))
      .on('keydown',     'textarea.pfi-pillcase-input',  send_pillcase_container_event('keydownInput'))
      .on('click',       'a.pfi-pillcase-pill-remover',  send_pillcase_container_event('clickPillRemover'))
      .on('click',       '.pfi-pillcase-editable-pill',  send_pillcase_container_event('clickPill'))
      .on('mouseenter',  '.pfi-pillcase-suggest-item a', send_pillcase_suggestion_event('mouseenterSuggestion'))
      .on('click',       '.pfi-pillcase-suggest-item a', send_pillcase_suggestion_event('clickSuggestion'))
      .on('focus',       'textarea.pfi-pillcase-input',  send_pillcase_container_event('focusInput'))
      .on('blur',        'textarea.pfi-pillcase-input',  send_pillcase_container_event('blurInput'))
      .on('click',       '.pfi-pillcase-container',      send_pillcase_container_event('focus'));
  };

  function send_pillcase_container_event(name) {
    return function (evt) {
      return call_pillcase_event(evt, name, $(evt.target).closest('.pfi-pillcase-container'));
    };
  }

  function send_pillcase_suggestion_event(name) {
    return function (evt) {
      return call_pillcase_event(evt, name, $(evt.target).closest('.pfi-pillcase-suggestion').prev('.pfi-pillcase-container'));
    };
  }

  function call_pillcase_event(evt, name, $node) {
    return $node
      .find('textarea.pfi-pillcase-offscreen')
      .data('pillcase')[name](evt);
  }

  pfi.extend(Pillcase.prototype, {
    // common
    trigger: function (name, args) {
      this.$element.trigger('pfi:pillcase:' + name, args);
    },

    values: function () {
      return this.cleaner(this.splitter(this.$element.val()));
    },

    splitter: function (value) {
      return value.replace(/\r\n?/g, '\n').split(this.options.delimiter);
    },

    cleaner: function (values) {
      return values.map($.trim).filter(function (v) { return v; });
    },

    formatter: function (value) {
      var values = this.cleaner($.isArray(value) ? value : this.splitter(value)), tmp_values;

      if (this.options.lockedValues.length) {
        tmp_values = this.options.lockedValues;
        values = values.filter(function (v) { return tmp_values.indexOf(v) === -1; });
      }

      if (!this.options.allowDuplication) {
        tmp_values = this.values();
        values = values.filter(function (v) { return tmp_values.indexOf(v) === -1; });
      }

      if (this.options.allowedValues) {
        tmp_values = this.options.allowedValues;
        values = values.filter(function (v) { return tmp_values.indexOf(v) !== -1; });
      }

      return values;
    },

    joiner: function (values) {
      return values.join(this.options.glue || this.options.delimiter);
    },

    setInputValues: function (values) {
      this.$element.val(this.joiner(values));
    },

    setPillNodes: function (values) {
      var $field = this.$container.find('.pfi-pillcase-field');
      this.$container.find('.pfi-pillcase-pill').remove();
      this.createPillNodes(this.options.lockedValues, true).insertBefore($field);
      this.createPillNodes(values).insertBefore($field);
    },

    changeValues: function (values) {
      if (this.joiner(values) !== this.joiner(this.values())) {
        this.setInputValues(values);
        this.trigger('change', [ values ]);
      }
    },

    updateValues: function () {
      var values = $.map(this.$container.find('.pfi-pillcase-editable-pill'), function (node) {
        return $(node).data('value');
      });
      this.changeValues(values);
    },

    setValues: function (values) {
      values = this.formatter(values);
      this.setPillNodes(values);
      this.changeValues(values);
    },

    fitContainer: function () {
      var width = this.$element.width(),
          $field = this.$container.find('.pfi-pillcase-field');
      this.$container.width(width);
      this.$resizer.css('max-width', (width - $field.outerWidth(true) + $field.width()) + 'px');
      this.$suggestion.css('width', width + 'px');
    },

    resizeInput: function () {
      var $input = this.$container.find('.pfi-pillcase-input');
      this.$resizer.text($input.val() + 'p'); // 'p' width is mix-width of input.
      $input.width(this.$resizer.width()).height(this.$resizer.height());
    },

    // pill
    createPillNodes: function (values, locked) {
      return values.length ? this.options.template[locked ? '$lockedPills' : '$editablePills']({ values: values }) : $([]);
    },

    createPills: function (value) {
      return this.createPillNodes(this.formatter(value));
    },

    removePillNode: function (node) {
      $(node).closest('.pfi-pillcase-pill').remove();
    },

    blurPill: function (node) {
      var $node = node ? $(node) : this.focusedPill();
      return $node.removeClass('pfi-pillcase-pill-focus');
    },

    focusedPill: function () {
      return this.$container.find('.pfi-pillcase-pill-focus');
    },

    focusPill: function (node) {
      return $(node).addClass('pfi-pillcase-pill-focus');
    },

    focusSiblingPill: function (target, node) {
      var $focus = $(node)[target]('li.pfi-pillcase-editable-pill');
      if ($focus.length || target === 'next') {
        this.blurPill(node);
      }
      this.focusPill($focus);
      return $focus;
    },

    removeFocusedPill: function () {
      var $focused_pill = this.focusedPill();

      if ($focused_pill.length) {
        this.focusSiblingPill('prev', $focused_pill);
      } else {
        $focused_pill = this.$container.find('.pfi-pillcase-field').prev('li.pfi-pillcase-editable-pill');
      }
      this.removePillNode($focused_pill);
      this.updateValues();
    },

    add: function (values) {
      var $new_pills = this.createPills(values);
      if ($new_pills.length) {
        $new_pills.insertBefore(this.$container.find('.pfi-pillcase-field'));
        this.updateValues();
      }
    },

    // suggest
    openSuggestion: function () {
      var pos = this.$container.position();
      this.$suggestion.css({
        top: pos.top + this.$container.outerHeight(true),
        left: pos.left
      }).show();
      this.shownSuggestion = true;
    },

    closeSuggestion: function () {
      this.$suggestion.hide();
      this.shownSuggestion = false;
      this.queryForSuggest = null;
    },

    open: function () {
      var shown = this.shownSuggestion;
      this.openSuggestion();
      shown || this.trigger('open');
    },

    close: function () {
      var shown = this.shownSuggestion;
      this.closeSuggestion();
      shown && this.trigger('close');
    },

    createSuggestion: function (items) {
      var $ul = this.$suggestion.find('.pfi-pillcase-suggest-items').empty();
      this.options.template.$suggestItems({ values: items }).appendTo($ul);
    },

    blurSuggestion: function (node) {
      var $node = node ? $(node) : this.focusedSuggestion();
      return $node.removeClass('pfi-pillcase-suggest-item-focus');
    },

    focusedSuggestion: function () {
      return this.$suggestion.find('.pfi-pillcase-suggest-item-focus');
    },

    focusSuggestion: function (node) {
      return $(node).closest('.pfi-pillcase-suggest-item').addClass('pfi-pillcase-suggest-item-focus');
    },

    focusSiblingSuggestion: function (target) {
      var $focused = this.focusedSuggestion(),
          $focus = $focused[target]('li.pfi-pillcase-suggest-item');

      if (!$focus.length && (!$focused.length || this.options.allowedValues)) {
        $focus = this.$suggestion.find('li.pfi-pillcase-suggest-item:' + (target === 'prev' ? 'last' : 'first') + '-child');
      }

      this.blurSuggestion();
      this.focusSuggestion($focus);
      return $focus;
    },

    source: function () {
      return this.options.source;
    },

    matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.queryForSuggest.toLowerCase());
    },

    sorter: function (items) {
      var beginswith = [], caseSensitive = [], caseInsensitive = [], item;

      while ((item = items.shift())) {
        if (!item.toLowerCase().indexOf(this.queryForSuggest.toLowerCase())) {
          beginswith.push(item);
        } else if (~item.indexOf(this.queryForSuggest)) {
          caseSensitive.push(item);
        } else {
          caseInsensitive.push(item);
        }
      }

      return beginswith.concat(caseSensitive, caseInsensitive);
    },

    lookup: function (query) {
      var that = this, dfd = $.Deferred();
      query || (query = '');

      this.queryForSuggest = query;
      this.valuesForSuggest = this.values();

      if (query.length < this.options.minLength) {
        this.closeSuggestion();
        setTimeout(function () { dfd.rejectWith(this); }, 0);
      } else {
        var process = function (items) {
          that.process(dfd, items);
        };
        var items = this.source(this.query, process);
        items && setTimeout(function () { process(items); }, 0);
      }

      return dfd;
    },

    process: function (dfd, items) {
      items = items.filter($.proxy(this.matcher, this));

      if (!this.options.allowDuplication) {
        items = items.filter($.proxy(function (item) {
          return this.valuesForSuggest.indexOf(item) === -1;
        }, this));
      }

      if (this.options.allowedValues) {
        items = items.filter($.proxy(function (item) {
          return this.options.allowedValues.indexOf(item) !== -1;
        }, this));
      }

      items = this.sorter(items);

      if (items.length) {
        this.createSuggestion(items.slice(0, this.options.items));
        this.open();
        dfd.resolveWith(this);
      } else {
        this.close();
        dfd.rejectWith(this);
      }
    },

    // event
    stopEvent: function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    },

    keyupInput: function (evt) {
      var $input = this.$container.find('.pfi-pillcase-input'),
          val = $input.val();

      this.resizeInput();

      switch (evt.keyCode) {
      case 8: // backspace
        if (!val) {
          return;
        }
        break;
      case 9: // tab
      case 13: // enter
      case 27: // escape
      case 37: // left
      case 38: // up
      case 39: // right
      case 40: // down
        return;
      }

      if (this.focusedPill().length) {
        this.close();
      } else if (this.queryForSuggest !== val) {
        this.lookup(val).done(function () {
          this.options.allowedValues && this.focusSiblingSuggestion('next');
        });
      }
    },

    keydownInput: function (evt) {
      var $input = this.$container.find('.pfi-pillcase-input'),
          val = $input.val();

      switch (evt.keyCode) {
      case 0: // emulate
      case 9: // tab
      case 13: // enter
        var $focused_suggestion = this.focusedSuggestion();
        if (this.shownSuggestion && $focused_suggestion.length) {
          val = $focused_suggestion.data('value');
        }
        if (val) {
          this.add(val);
        }
        if (evt.keyCode !== 0 && (val || evt.keyCode === 13)) {
          evt.preventDefault();
        }
        $input.val('');
        this.resizeInput();
        this.close();
        break;

      case 37: // left
      case 39: // right
        if (!val) {
          var $focused_pill = this.focusedPill();
          if (!$focused_pill.length) {
            $focused_pill = this.$container.find('.pfi-pillcase-field');
          }
          this.focusSiblingPill(evt.keyCode === 37 ? 'prev' : 'next', $focused_pill);
          this.keyupInput({ keyCode: 0 });
          return;
        }
        break;

      case 38: // up
      case 40: // down
        var dir = evt.keyCode === 38 ? 'prev' : 'next';
        if (this.shownSuggestion) {
          this.focusSiblingSuggestion(dir);
        } else {
          this.lookup(val).done(function () {
            this.focusSiblingSuggestion(dir);
          });
        }
        break;

      case 8: // backspace
        if (!val) {
          this.removeFocusedPill();
          this.close();
          return;
        }
        break;

      case 27: // escape
        this.close();
        break;
      }

      this.blurPill();
    },

    clickPillRemover: function (evt) {
      this.stopEvent(evt);
      this.removePillNode(evt.target);
      this.updateValues();
      this.isFocusInput() && this.focus();
    },

    clickPill: function (evt) {
      this.stopEvent(evt);
      this.blurPill();
      this.focusPill($(evt.target).closest('.pfi-pillcase-editable-pill'));
      this.$container.find('.pfi-pillcase-input').focus();
    },

    mouseenterSuggestion: function (evt) {
      this.blurSuggestion();
      this.focusSuggestion(evt.target);
    },

    clickSuggestion: function (evt) {
      this.stopEvent(evt);
      this.keydownInput({ keyCode: 0 });
    },

    blurInput: function () {
      var isFocused = this.isFocusInput();
      this.close();
      this.$container.removeClass('pfi-pillcase-focus');
      this.keydownInput({ keyCode: 0 });
      isFocused && this.trigger('blur');
    },

    focusInput: function () {
      var isFocused = this.isFocusInput();
      this.queryForSuggest = null;
      this.resizeInput();
      this.$container.addClass('pfi-pillcase-focus');
      this.keyupInput({ keyCode: 0 });
      isFocused || this.trigger('focus');
    },

    isFocusInput: function () {
      return this.$container.hasClass('pfi-pillcase-focus');
    },

    blur: function () {
      this.$container.find('.pfi-pillcase-input').blur();
    },

    focus: function () {
      this.blurPill();
      this.$container.find('.pfi-pillcase-input').focus();
    }
  });

  pfi.bootstrap.define('pillcase', Pillcase, {
    glue: null,
    delimiter: ' ',
    values: null,
    lockedValues: null,
    allowedValues: null,
    source: null,
    allowDuplication: false,
    minLength: 0,
    items: 8
  });
}($, pfi));

(function ($, pfi) {
  /*
   * $(..).tagbox();
   */
  function TagBox(element, option) {
    this.$container = $(element);
    var options = this.options = pfi.extend({}, $.fn.tagbox.defaults, option);
    this.$listTmpl = pfi.UI.$tmpl(options.listTemplate);
    this.$popoverTmpl = pfi.UI.$tmpl(options.popover.template);
    var tags = this.tags_ = [];
    $.each(options.tags, function (i, tag) {
      if ($.inArray(tag, options.allowedTags) >= 0) {
        tags.push(tag);
      }
    });
    this.listMode();
  }

  pfi.extend(TagBox.prototype, {
    tags: function () {
      return this.tags_;
    },

    isChanged: function (newTags) {
      var a = newTags.slice().sort();
      var b = this.tags_.slice().sort();
      return !(a.length === b.length && a.every(function (v, i) { return b[i] === v; }));
    },

    pillcaseMode: function () {
      var that = this;
      $('<textarea>').width(this.$container.width()).appendTo(this.$container.empty()).pillcase({
        values: that.tags_,
        allowedValues: this.options.allowedTags,
        source: this.options.allowedTags,
        minLength: 1
      }).on('pfi:pillcase:blur', function () {
        var newTags = $(this).pillcase('values');
        if (that.isChanged(newTags)) {
          that.$container.trigger('pfi:tagbox:change', [newTags]);
        }
        that.tags_ = newTags;
        that.listMode();
      }).pillcase('focus');
    },

    listMode: function () {
      var that = this;
      var $list = this.$listTmpl({ tags: this.tags_ }).appendTo(this.$container.empty());
      $list.find('li.pfi-tagbox-edit').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        that.pillcaseMode();
      });

      $list.find('li.pfi-tagbox-tag').each(function () {
        var $tag = $(this);
        var tag = $tag.text();
        var traces = that.options.traces[tag] || [];
        $tag.popover({
          html: true,
          trigger: 'hover',
          placement: that.options.popover.placement,
          title: that.options.popover.title,
          content: that.$popoverTmpl({
            traces: traces,
            hasTrace: !!traces.length,
            formattedScore: function () {
              return pfi.text.sprintf(that.options.popover.scoreFormat, this.score);
            }
          })
        });
      });
    }
  });

  pfi.bootstrap.define('tagbox', TagBox, {
    tags: [],
    allowedTags: [],
    traces: {},
    listTemplate: [
      '<ul class="pfi-tagbox">',
      '{{#tags}}<li class="pfi-tagbox-tag">{{.}}</li>{{/tags}}',
      '<li class="pfi-tagbox-edit"><a href="#">edit</a></li>',
      '</ul>'
    ].join(''),
    popover: {
      placement: 'top',
      title: 'Top Features',
      scoreFormat: '%.3f',
      template: [
        '{{#hasTrace}}',
        '<table class="table table-condensed">',
        '<thead>',
        '<tr><th>Feature</th><th>Field</th><th>Score</th></tr>',
        '</thead>',
        '<tbody>',
        '{{#traces}}',
        '<tr><td>{{feature}}</td><td>{{field}}</td><td>{{formattedScore}}</td></tr>',
        '{{/traces}}',
        '</tbody>',
        '</table>',
        '{{/hasTrace}}',
        '{{^hasTrace}}',
        '<p class="muted">No feature trace found</p>',
        '{{/hasTrace}}'
      ].join('')
    }
  });
}($, pfi));

  return pfi;
}(this, this.document, this.jQuery, this.jQuery, this.parseInt));
