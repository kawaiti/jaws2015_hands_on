$(function() {
  var name = 'time';
  var work = { name: "work", value: 1 };
  var work_count = 0;
  var rest = { name: "rest", value: 1 };
  var rest_count = 0;

  function random(max) {
    return (Math.floor(Math.random() * max));
  }

  var width = 960,
      height = 500,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
    .range(["#98abc5", "#d0743c"]);

  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 110);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d["value"]; });

  var svg = d3.select("#timeseries_time").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.append("g")
    .attr("class", "slices");

  svg.append("g")
    .attr("class", "labels");

  function searchRequest() {
    var query_param = {};
    var query = $('#search').find('[name]').each(function () {
      var $this = $(this);
      query_param[$this.attr('name')] = $this.val();
    });
    query_param["prediction"] = "work";
    $.publish('test:sedue:search', query_param);
    return false;
  }

  function set_from_and_to(from, to) {
    $('#search [name="' + name + '_from"]').val(from || '')
    $('#search [name="' + name + '_to"]').val(to || '');
  }

  $.subscribe('test:sedue:success1', function(ev, data) {
    console.log(data["drilldowns"]["time"]);
    var key = Object.keys(data["drilldowns"]["time"])[0];
    work["value"] = data["drilldowns"]["time"][key];
    if (work["value"] == 0) { work["value"] = 1; }
    work_count = data["hit_num"];

    var query_param = {};
    var query = $('#search').find('[name]').each(function () {
      var $this = $(this);
      query_param[$this.attr('name')] = $this.val();
    });
    query_param["prediction"] = "rest";
    $.publish('test:sedue:search2', query_param);
    return false;
  });

  $.subscribe('test:sedue:success2', function (ev, data) {
    console.info(data["drilldowns"]["time"]);
    var key = Object.keys(data["drilldowns"]["time"])[0];
    rest["value"] = data["drilldowns"]["time"][key];
    if (rest["value"] == 0) {rest["value"] = 1;}
    rest_count = data["hit_num"];

    var slice = svg.select(".slices").selectAll("path.slice")
      .data(pie([work, rest]), function(d) { return d.data["name"]; });

    slice.enter()
      .insert("path")
      .style("fill", function(d) { return color(d.data["name"]); })
      .attr("class", "slice");

    slice.transition().duration(900)
      .attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
	  return arc(interpolate(t));
	};
      });

    slice.exit().remove();

    var text = svg.select(".labels").selectAll("text")
      .data(pie([work, rest]), function (d) { return d.data["name"]; });

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function(d) { return d.data["name"]; });

    text.transition().duration(900)
      .attrTween("transform", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
            var pos = arc.centroid(interpolate(t));
            return "translate("+ pos +")";
        };
      });

    text.exit().remove();

    var now = +new Date / 1000 | 0;
    var span = 10;
    set_from_and_to(now - span, now);
    setTimeout(function() { searchRequest(); }, 1000);
  });

  $.subscribe('test:sedue:search', function(ev, data) {
    var query = new pfi.SedueQuery({ alldocs: 'all' });
    var max_limit = 0;
    query.addFilter('prediction', 'work');
    query.addTimeseries(name, data[name + "_from"], data[name + "_to"], 1);

    $.ajax({
      method: 'GET',
      url: '/search/query/',
      data: {
        q: query.toString(),
        format: "json",
      }
    }).done(function (data) {
      $.publish('test:sedue:success1', [data]);
    }).fail(function () {
    });
  });

  $.subscribe('test:sedue:search2', function(ev, data) {
    var query = new pfi.SedueQuery({ alldocs: 'all' });
    query.addFilter('prediction', 'rest');
    query.addTimeseries(name, data[name + "_from"], data[name + "_to"], 1);
    
    $.ajax({
      method: 'GET',
      url: '/search/query/',
      data: {
        q: query.toString(),
        format: 'json'
      }
    }).done(function (data) {
      console.info(data);
      $.publish('test:sedue:success2', [data]);
    }).fail(function () {
      alert("fail");
    });
  });

  var now = +new Date / 1000 | 0;
  var span = 10;
  set_from_and_to(now - span, now);
  searchRequest();

});
