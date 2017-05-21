import * as d3 from "d3";

// parse the date / time
const parseTime = d3.timeParse("%H:%M:%S");

export default function ScheduleChart(elemid, options) {
	// insert element
	this.chartElement = document.getElementById(elemid);

	d3.csv("/data/LEDProfile.csv", (error, data) => {
		if (error) throw error;
		this.data = data;
		
		// format the data
		this.data.forEach(d => {
			d.date = parseTime(d.date);
			d.red = +d.red;
			d.green = +d.green;
			d.blue = +d.blue;
			d.white = +d.white;
		});

		this.create();
		this.update();
	});
}

ScheduleChart.prototype.create = function() {
	// get width of body
	this.bodyWidth = this.chartElement.offsetWidth;

	// set the dimensions and margins of the graph
	this.margin = { top: 20, right: 0, bottom: 30, left: 0 };
	this.width = this.bodyWidth - this.margin.left - this.margin.right;
	this.height = 500 - this.margin.top - this.margin.bottom;
	this.chartSpacing = 10;
	this.chartHeight = (this.height - (this.chartSpacing * 3)) / 4;

	// set the ranges
	this.x = d3.scaleTime().range([0, this.width]);
	this.y = d3.scaleLinear().range([this.chartHeight, 0]);

	// Scale the range of the data
	this.x.domain([parseTime('00:00:00'), parseTime('24:00:00')]);
	this.y.domain([0, 256]);

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	const svg = d3.select("#scheduleChart").append("svg")
		.attr("width", this.width + this.margin.left + this.margin.right)
		.attr("height", this.height + this.margin.top + this.margin.bottom)
		.append("g")
		.attr("transform",
		"translate(" + this.margin.left + "," + this.margin.top + ")");

	// create chart groups & agreas
	this.whiteChart = svg.append("g")
	this.redChart = svg.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) + ")");
	this.greenChart = svg.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) * 2 + ")");
	this.blueChart = svg.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) * 3 + ")");

	this.appendPlotArea(this.whiteChart);
	this.appendPlotArea(this.redChart);
	this.appendPlotArea(this.greenChart);
	this.appendPlotArea(this.blueChart);

	// Add the X Axis
	svg.append("g")
		.attr("transform", "translate(0," + this.height + ")")
		.call(d3.axisBottom(this.x)
			.tickFormat(d3.timeFormat("%H:%M")));
}

ScheduleChart.prototype.update = function() {

	// define the line
	const whiteLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.white));

	const redLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.red));

	const greenLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.green));

	const blueLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.blue));

	// Add the line path.
	this.whiteChart.append("path")
		.data([this.data])
		.attr("class", "white-stroke")
		.attr("d", whiteLine);
	this.whiteChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 6)
		.attr("cx", d => this.x(d.date))
		.attr("cy", d => this.y(d.white));

	this.redChart.append("path")
		.data([this.data])
		.attr("class", "red-stroke")
		.attr("d", redLine);
	this.redChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 6)
		.attr("cx", d => this.x(d.date))
		.attr("cy", d => this.y(d.red));

	this.greenChart.append("path")
		.data([this.data])
		.attr("class", "green-stroke")
		.attr("d", greenLine);
	this.greenChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 6)
		.attr("cx", d => this.x(d.date))
		.attr("cy", d => this.y(d.green));
	
	this.blueChart.append("path")
		.data([this.data])
		.attr("class", "blue-stroke")
		.attr("d", blueLine);
	this.blueChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", d => d === this.selected ? "selected-point" : "point")
		.attr("r", 6)
		.attr("cx", d => this.x(d.date))
		.attr("cy", d => this.y(d.blue))
	 .on("mousedown.drag",  this.datapoint_drag())
	 .on("touchstart.drag", this.datapoint_drag());
}


ScheduleChart.prototype.appendPlotArea = function(chart) {
	chart.append("rect")
		.attr("width", this.width)
		.attr("height", this.chartHeight)
		.style("fill", "#EEEEEE");

	chart
		.on("mousemove.drag", this.mousemove(chart))
		.on("touchmove.drag", this.mousemove(chart))
		.on("mouseup.drag",   this.mouseup(chart))
		.on("touchend.drag",  this.mouseup(chart));
}

ScheduleChart.prototype.datapoint_drag = function() {
	return (d) => {
		document.onselectstart = () => false;
		this.selected = this.dragged = d;
		this.update();
	}
}


ScheduleChart.prototype.mousemove = function(chart) {
  return () => {
		console.log(chart);
    var p = chart.mouse(chart[0][0]),
        t = chart.changedTouches;
    
    if (this.dragged) {
			console.log("draggin", p);
      //this.dragged.y = this.y.invert(Math.max(0, Math.min(this.height, p[1])));
      this.update();
    };
	}
}

ScheduleChart.prototype.mouseup = function() {
  return () => {
    if (this.dragged) { 
      this.dragged = null 
    }
  }
}