if(!Heatmap) {
  var Heatmap = {};
  Heatmap.Data = {};
  Heatmap.Graph = {}
}

Heatmap.Data.Timeslice = function(data){
  this.data = data;
};

Heatmap.Data.Timeslice.prototype = {
  bucketCounts : function(low, high, numBuckets) {
    var range = high - low;
    var bucketSize = range / numBuckets;   
    var buckets = [];
    var bucketCounts = [];
    var tempBucket = low;

    for(var x = 0; x < numBuckets; x++){
      buckets[x] = tempBucket;
      bucketCounts[x] = 0;
      tempBucket += bucketSize;
    }

    $.each(this.data, function(index, value) {
      for(var x = 0; x < numBuckets; x++){
        if(buckets[x] > value){
          bucketCounts[x] += 1;
          break;
        }
      }
    });

    return bucketCounts;
  }
};

Heatmap.Graph.Timeslice = function(context, colorInterpolation, timeslice) {
  this.context = context;
  this.timeslice = timeslice;
  this.colorInterpolation = colorInterpolation;
}

Heatmap.Graph.Timeslice.prototype = {
    draw : function(low, high, numBuckets, width, height, spacing) {
    var x = 0;
    var y = 0;
    var buckets = this.timeslice.bucketCounts(low, high, numBuckets);
    for(var i = numBuckets - 1; i >= 0; i--){
      this.context.fillStyle = this.colorInterpolation.rgb(buckets[i]);
      this.context.fillRect(x, y, width, height);
      y += height + spacing;
    }
  },
}

Heatmap.ColorInterpolation = function(options) {
  var defaults = {
    low: 0,
    high: 5,
    startColor: "rgb(53,96,240)",
    endColor: "rgb(0,0,0)"
  }
  options = $.extend(defaults, options);
  
  this.low = options.low;
  this.high = options.high;
  this.startRGB =  $.fn.getRGB(options.startColor);
  this.endRGB = $.fn.getRGB(options.endColor);
  this.rangeRGB = [];

  this.rangeRGB[0] = this.endRGB[0] - this.startRGB[0];
  this.rangeRGB[1] = this.endRGB[1] - this.startRGB[1];
  this.rangeRGB[2] = this.endRGB[2] - this.startRGB[2];
}


Heatmap.ColorInterpolation.prototype = {
  color : function(value) {
    if(value > this.high){
      return this.endRGB;
    }else if(value < this.low){
      return this.startRGB;
    }else{
      var range = (this.high - this.low);
      var percent = (value-this.low)/range;
      var r = percent * this.rangeRGB[0] + this.startRGB[0];
      var g = percent * this.rangeRGB[1] + this.startRGB[1];
      var b = percent * this.rangeRGB[2] + this.startRGB[2];
      return [Math.ceil(r), Math.ceil(g), Math.ceil(b)];
    }
  },
  rgb : function (value) {
    var c = this.color(value);
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }
}

Heatmap.Graph.CircularList = function(maxSize, builder) {
  this.maxSize = maxSize;
  this.items = Array(this.maxSize);
  this.head = 1;
  this.length = 0;
  this.builder = builder;
  for(var x = 0; x < this.maxSize; x++) {
    this.items[x] = null;
  }
}

Heatmap.Graph.CircularList.prototype = {
  get : function(index) {
    var realIndex = (this.head + index) % this.maxSize;
    return this.items[realIndex];
  },
  push : function (item) {
    this.head = ((this.head - 1) % this.maxSize + this.maxSize) % this.maxSize;
    this.items[this.head] = this.builder(this.items[this.head], item);
    if(this.length < this.maxSize) {
      this.length += 1;
    }
  }
}


Heatmap.Controller = function(dom_id, options) {
  var defaults = {
    rows : 30,
    low : 0 ,
    high : 1,
    dataWidth: 20,
    dataHeight: 20,
    spacing: 1,
    numBuckets: 10
  }
  options = $.extend(defaults, options);

  this.canvas = $("#" + dom_id)[0];
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.dataWidth = options.dataWidth;
  this.dataHeight = options.dataHeight;
  this.low = options.low;
  this.high = options.high;
  this.numBuckets = options.numBuckets;
  this.spacing = options.spacing;
  this.context = this.canvas.getContext('2d');
  this.rows = options.rows;
  this.colorInterpolation = new Heatmap.ColorInterpolation();
  this.timelineData = [];
  this.graph = new Heatmap.Graph.CircularList(this.rows, (function(context, colorInterpolation, buildOrSetTimeslice) {return function(timesliceGraph, timeslice) {
    return buildOrSetTimeslice(context, colorInterpolation, timesliceGraph, timeslice);
  };})(this.context, this.colorInterpolation, this.buildOrSetTimeslice));
}

Heatmap.Controller.prototype = {
  tick : function(data) {
        console.log(data);
     this.addTimeline(new Heatmap.Data.Timeslice(data['result']));
      console.log(this);
  },
  addTimeline : function(timeslice) {
    this.timelineData.push(timeslice)
    this.graph.push(timeslice);
  },
  draw : function() {
    for(var x = 0; x < this.graph.length; x++){
      this.context.save();
      this.context.translate(this.width - ((x + 1) * this.dataWidth + (x * this.spacing)), 0);
      this.graph.get(x).draw(this.low, this.high, this.numBuckets, this.dataWidth, this.dataHeight, this.spacing);
      this.context.restore();
    }
  },
  buildOrSetTimeslice : function(context, colorInterpolation, timesliceGraph, timeslice) {
    if(timesliceGraph == null) {
      timesliceGraph = new Heatmap.Graph.Timeslice(context, colorInterpolation, timeslice);
    }else{
      timesliceGraph.timeslice = timeslice;
    }
    return timesliceGraph;
  }
}
