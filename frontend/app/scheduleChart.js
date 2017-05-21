import * as d3 from "d3";

export default function ScheduleChart(elemid, options) {
	// insert element
	this.chartElement = document.getElementById(elemid);
	
	d3.csv("/data/LEDProfile.csv", (error, data) => {
		if (error) throw error;
		this.data = data;
		this.update();
	});
}

ScheduleChart.prototype.update = function() {
	// get width of body
	this.bodyWidth = this.chartElement.offsetWidth;

	// set the dimensions and margins of the graph
	this.margin = { top: 20, right: 0, bottom: 30, left: 0 };
	this.width = this.bodyWidth - this.margin.left - this.margin.right;
	this.height = 500 - this.margin.top - this.margin.bottom;
	this.chartSpacing = 10;
	this.chartHeight = (this.height - (this.chartSpacing * 3)) / 4;

	// parse the date / time
	const parseTime = d3.timeParse("%H:%M:%S");

	// set the ranges
	const x = d3.scaleTime().range([0, this.width]);
	const y = d3.scaleLinear().range([this.chartHeight, 0]);

	// define the line
	const whiteLine = d3.line()
		.x(d => x(d.date))
		.y(d => y(d.white));

	const redLine = d3.line()
		.x(d => x(d.date))
		.y(d => y(d.red));

	const greenLine = d3.line()
		.x(d => x(d.date))
		.y(d => y(d.green));

	const blueLine = d3.line()
		.x(d => x(d.date))
		.y(d => y(d.blue));

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	const svg = d3.select("#scheduleChart").append("svg")
		.attr("width", this.width + this.margin.left + this.margin.right)
		.attr("height", this.height + this.margin.top + this.margin.bottom)
		.append("g")
		.attr("transform",
		"translate(" + this.margin.left + "," + this.margin.top + ")");

	// format the data
	this.data.forEach(d => {
		d.date = parseTime(d.date);
		d.red = +d.red;
		d.green = +d.green;
		d.blue = +d.blue;
		d.white = +d.white;
	});

	// Scale the range of the data
	x.domain([parseTime('00:00:00'), parseTime('24:00:00')]);
	y.domain([0, d3.max(this.data, d => Math.max(d.red, d.green, d.blue))]);

	// total chart
	const whiteChart = svg.append("g")
	const redChart = svg.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) + ")");
	const greenChart = svg.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) * 2 + ")");
	const blueChart = svg.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) * 3 + ")");

	this.appendPlotArea(whiteChart);
	this.appendPlotArea(redChart);
	this.appendPlotArea(greenChart);
	this.appendPlotArea(blueChart);

	// Add the line path.
	whiteChart.append("path")
		.data([this.data])
		.attr("class", "white-stroke")
		.attr("d", whiteLine);
	whiteChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 6)
		.attr("cx", d => x(d.date))
		.attr("cy", d => y(d.white));

	redChart.append("path")
		.data([this.data])
		.attr("class", "red-stroke")
		.attr("d", redLine);
	redChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 6)
		.attr("cx", d => x(d.date))
		.attr("cy", d => y(d.red));

	greenChart.append("path")
		.data([this.data])
		.attr("class", "green-stroke")
		.attr("d", greenLine);
	greenChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 6)
		.attr("cx", d => x(d.date))
		.attr("cy", d => y(d.green));

	blueChart.append("path")
		.data([this.data])
		.attr("class", "blue-stroke")
		.attr("d", blueLine);
	blueChart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 6)
		.attr("cx", d => x(d.date))
		.attr("cy", d => y(d.blue))
	// .on("mousedown.drag",  this.datapoint_drag())
	// .on("touchstart.drag", this.datapoint_drag());

	// Add the X Axis
	svg.append("g")
		.attr("transform", "translate(0," + this.height + ")")
		.call(d3.axisBottom(x)
			.tickFormat(d3.timeFormat("%H:%M")));
}


ScheduleChart.prototype.appendPlotArea = function(chart) {
	chart.append("rect")
		.attr("width", this.width)
		.attr("height", this.chartHeight)
		.style("fill", "#EEEEEE");
}

ScheduleChart.prototype.datapoint_drag = function() {
	return (d) => {
		registerKeyboardHandler(this.keydown());
		document.onselectstart = () => false;
		this.selected = self.dragged = d;
		this.update();
	}
}