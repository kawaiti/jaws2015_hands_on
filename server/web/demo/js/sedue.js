(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(jQuery));

(function (pfi) {

  function SedueQuery(defaults) {
    this.defaults = defaults || {};
    this.queries = [];
    this.filters = [];
    this.axises = [];
    this.options = {};
  }

  function generateEscape(char_reg, range_reg, range_char) {
    return function (value) {
      value += '';
      var escaped = value.replace(char_reg, '\\$1'),
          range_escaped = range_char + value.replace(range_reg, '\\$1') + range_char;
      return escaped.length < range_escaped.length ? escaped : range_escaped;
    };
  }

  SedueQuery.queryEscape = generateEscape(/([&|\-\\()?:])/g, /[?|\\]/g, '|');
  SedueQuery.filterEscape = generateEscape(/([,:\[\]()"?\\])/g, /["?\\]/g, '"');

  pfi.extend(SedueQuery.prototype, {
    addQuery: function (field, value) {
      this.queries.push(SedueQuery.queryEscape(field) + ':' + SedueQuery.queryEscape(value));
    },
    addFilter: function (field, operator, value) {
      if (arguments.length < 3) {
        value = operator;
        operator = '=';
      }
      if ($.isArray(value)) {
        this.filters.push(SedueQuery.filterEscape(field) + operator + value.map(SedueQuery.filterEscape).join(","));
      } else {
        this.filters.push(SedueQuery.filterEscape(field) + operator + SedueQuery.filterEscape(value));
      }
    },
    addOption: function (key, value) {
      this.options[key] = value;
    },
    addAxis: function (field, range) {
      this.axises.push(field + (range ? ':' + range : ''));
    },
    addTimeseries: function (field, from, to, step) {
      var exists_to = !!to;
      to || (to =+ new Date / 1000 | 0);

      var interval = Math.max(5, (to - from) / step | 0);
      var finish = Math[exists_to ? 'floor' : 'ceil'](to / interval) *interval;
      var start = finish - (to - from);

      var ranges = [];
      for (var i = finish - interval; i >= start; i -= interval) {
        ranges.push('[' + i + ' to ' + (i + interval) + ')');
      }
      this.axises.push(field + ':' + ranges.join(','));
    },
    toQueryString: function (alldocs) {
      return this.queries.length ? '(' + this.queries.join(')&(') + ')' : alldocs ? '(' + alldocs + ':)' : null;
    },
    toOperationString: function () {
      var operations = [];
      Array.prototype.push.apply(operations, this.filters);
      for (var k in this.options) {
        operations.push(k + '=' + this.options[k]);
      }
      this.axises.forEach(function (axis) {
        operations.push('drilldown=' + axis);
      });
      return operations.join('?');
    },
    toString: function () {
      var query = this.toQueryString(this.defaults.alldocs),
          operation = this.toOperationString();
      return operation ? query + '?' + operation : query;
    }
  });
  pfi.SedueQuery = SedueQuery;

}(pfi));
