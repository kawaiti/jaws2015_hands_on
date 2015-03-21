$(function() {
  var name = 'time';
  var work;
  var rest;

  function random(max) {
    return (Math.floor(Math.random() * max) + 1);
  }

  function gendata(num) {
    var result = []
    for (var i=1; i <= num; i++) {
      result.push({ name: i, work: random(100), rest: random(100) });
    }
    return result;
  }

  var width = 1000,
      height = 500,
      radius = 48;

  var color = d3.scale.ordinal()
    .range(["#98abc5", "#d0743c"]);

  var arc = d3.svg.arc()
    .outerRadius(radius - 1)
    .innerRadius(radius - 21);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d["value"]; });

  function searchRequest() {
    var query_param = {};
    var query = $('#search').find('[name]').each(function () {
      var $this = $(this);
      query_param[$this.attr('name')] = $this.val();
    });
    $.publish('test:sedue:search1', query_param);
    return false;
  }

  function set_from_and_to(from, to) {
    $('#search [name="' + name + '_from"]').val(from || '')
    $('#search [name="' + name + '_to"]').val(to || '');
  }

  $.subscribe('test:sedue:success1', function(ev, data) {
    console.log(data["drilldowns"]["stream_name"]);
    work = data["drilldowns"]["stream_name"];

    var query_param = {};
    var query = $('#search').find('[name]').each(function () {
      var $this = $(this);
      query_param[$this.attr('name')] = $this.val();
    });
    $.publish('test:sedue:search2', query_param);
    return false;
  });

  $.subscribe('test:sedue:success2', function (ev, data) {
    console.info(data["drilldowns"]["stream_name"]);
    rest = data["drilldowns"]["stream_name"];
    var all_data = [];

    $.each(work, function(key, value) {
      rest_value = rest[key] ? rest[key] + 1 : 1;
      all_data.push({ name: key, work: value + 1, rest: rest_value });
    });
    all_data = gendata(50);

    all_data.forEach(function(d) {
      d.ages = [{ name: "work", value: d["work"] }, { name: "rest", value: d["rest"] }];
    });
  
    var svg = d3.select("#timeseries_time").selectAll(".pie")
      .data(all_data);

    var donut = svg.enter().append("svg")
      .attr("class", "pie")
      .attr("width", radius * 2)
      .attr("height", radius * 2)
    .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

    donut.append("g")
      .attr("class", "slices");

    donut.append("g")
      .attr("class", "labels");

    donut.append("text")
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d["name"]; });

    donut.selectAll(".arc").data(function(d) { return pie(d.ages); })
      .enter().append("path")
      .attr("class", "arc")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); });

    svg.selectAll(".arc")
      .data(function(d) { return pie(d.ages); })
      .transition().duration(900)
      .attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    var now = +new Date / 1000 | 0;
    var span = 300;
    set_from_and_to(now - span, now);
    setTimeout(function() { searchRequest(); }, 1000);
  });

  $.subscribe('test:sedue:search1', function(ev, data) {
    var query = new pfi.SedueQuery({ alldocs: 'all' });
    query.addFilter('prediction', 'work');
    query.addAxis('stream_name');
    query.addFilter('time', "[" + data["time_from"] + " to " + data["time_to"] + ")");

    $.ajax({
      method: 'GET',
      url: '/search/query/',
      data: {
        q: query.toString(),
        format: "json",
      }
    }).done(function (data) {
      console.info(data);
      $.publish('test:sedue:success1', [data]);
    }).fail(function () {
    });
  });

  $.subscribe('test:sedue:search2', function(ev, data) {
    var query = new pfi.SedueQuery({ alldocs: 'all' });
    query.addFilter('prediction', 'rest');
    query.addAxis('stream_name');
    query.addFilter('time', "[" + data["time_from"] + " to " + data["time_to"] + ")");
    
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
  var span = 300;
  set_from_and_to(now - span, now);
  searchRequest();
});
