import * as d3 from "d3";

// parse the date / time
const parseTime = d3.timeParse("%H:%M:%S");

export default function ScheduleChart(elemid, options) {
	// insert element
	this.chartElement = document.getElementById(elemid);

	d3.csv("server/data/LEDProfile.csv", (error, data) => {
		if (error) throw error;
		this.data = data;
		
		// format the data
		let i = 0;
		this.data = this.data.map(d => ({
			index: i++,
			date: parseTime(d.date),
			red: +d.red,
			green: +d.green,
			blue: +d.blue,
			white: +d.white
		}));
		console.log(this.data);

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
	this.chartHeight = (this.height - (this.chartSpacing * 4)) / 5;

	// set the ranges
	this.x = d3.scaleTime().range([0, this.width]);
	this.y = d3.scaleLinear().range([this.chartHeight, 0]);

	// Scale the range of the data
	this.x.domain([parseTime('00:00:00'), parseTime('24:00:00')]);
	this.y.domain([0, 256]);

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	const svg = this.svg = d3.select("#scheduleChart").append("svg")
		.attr("width", this.width + this.margin.left + this.margin.right)
		.attr("height", this.height + this.margin.top + this.margin.bottom)

	const g = svg.append("g")
		.attr("transform",
		"translate(" + this.margin.left + "," + this.margin.top + ")");

	// create chart groups & agreas
	this.whiteChart = g.append("g")
	this.redChart = g.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) + ")");
	this.greenChart = g.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) * 2 + ")");
	this.blueChart = g.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) * 3 + ")");

	this.appendPlotArea(this.whiteChart);
	this.appendPlotArea(this.redChart);
	this.appendPlotArea(this.greenChart);
	this.appendPlotArea(this.blueChart);

	this.colorArea = g.append("g")
		.attr("transform",
		"translate(0," + (this.chartSpacing + this.chartHeight) * 4 + ")");

	// Add the X Axis
	svg.append("g")
		.attr("transform", "translate(0," + this.height + ")")
		.call(d3.axisBottom(this.x)
			.tickFormat(d3.timeFormat("%H:%M")));

	var gradients = svg.append("defs")
			.selectAll("gradients")
		.data(this.data)
		.enter().append("linearGradient")
    .attr("id", d => "gradient" + d.index)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")

	gradients.append("stop")
   .attr('class', 'start')
   .attr("offset", "0%")
   .attr("stop-color", d => `rgb(${d.red}, ${d.green}, ${d.blue})`)
   .attr("stop-opacity", 1);

	gradients.append("stop")
   .attr('class', 'end')
   .attr("offset", "100%")
   .attr("stop-color", d => {
		 if (d.index < (this.data.length - 1)) {
			const next = this.data[d.index + 1];
			`rgb(${next.red}, ${next.green}, ${next.blue})`
		 }
	 })
   .attr("stop-opacity", 1);

	this.colorArea.selectAll("color")
		.data(this.data)
		.enter().append("rect")
		.attr("x", d => this.x(d.date))
		.attr("width", d => {
			return d.index < (this.data.length - 1) ? this.x(this.data[d.index + 1].date) - this.x(d.date) : 0;
		})
		.attr("height",this.chartHeight)
		.attr("fill", d => "url(#gradient" + d.index + ")");
}

ScheduleChart.prototype.update = function() {

	// define the line
	this.whiteLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.white));

	this.redLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.red));

	this.greenLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.green));

	this.blueLine = d3.line()
		.x(d => this.x(d.date))
		.y(d => this.y(d.blue));

	// Add the line path.
	this.appendLineAndPoints(this.whiteChart, "white", this.whiteLine, "white-stroke")
	this.appendLineAndPoints(this.redChart, "red", this.redLine, "red-stroke")
	this.appendLineAndPoints(this.greenChart, "green", this.greenLine, "green-stroke")
	this.appendLineAndPoints(this.blueChart, "blue", this.blueLine, "blue-stroke")
}

ScheduleChart.prototype.updateData = function() {
	this.updateLineAndPoints(this.whiteChart, "white", this.whiteLine, "white-stroke")
	this.updateLineAndPoints(this.redChart, "red", this.redLine, "red-stroke")
	this.updateLineAndPoints(this.greenChart, "green", this.greenLine, "green-stroke")
	this.updateLineAndPoints(this.blueChart, "blue", this.blueLine, "blue-stroke")
}


ScheduleChart.prototype.appendPlotArea = function(chart) {
	chart.append("rect")
		.attr("width", this.width)
		.attr("height", this.chartHeight)
		.style("fill", "#EEEEEE");
}

ScheduleChart.prototype.appendLineAndPoints = function(chart, dataKey, line, lineStyle) {
	chart.append("path")
		.data([this.data])
		.attr("class", lineStyle)
		.attr("d", line);
	chart.selectAll("dot")
		.data(this.data)
		.enter().append("circle")
		.call(d3.drag()
        .on("start", this.dragstarted)
        .on("drag", this.dragged(this.x, this.y, dataKey))
        .on("end", this.dragended))
		.attr("class", d => d === this.selected ? "selected-point" : "point")
		.attr("r", 10)
		.attr("cx", d => this.x(d.date))
		.attr("cy", d => this.y(d[dataKey]))
}

ScheduleChart.prototype.updateLineAndPoints = function(chart, dataKey, line, lineStyle) {
	
	chart.select("." + lineStyle)
			.transition()
			.duration(50)
			.attr("d", line(this.data));
	chart.selectAll("circle")
			.data(this.data)
			.transition()
			.duration(50)
			.attr("cx", d => this.x(d.date))
			.attr("cy", d => this.y(d[dataKey]))

	// update the gradient
	this.data.forEach(d => {
		const stops = this.svg.select("#gradient" + d.index).selectAll("stop");

		stops.each((e, d) => {
			console.log(e, d);
		})
	})

}


ScheduleChart.prototype.dragstarted = function(d) {
  d3.select(this).raise().classed("active", true);
}

ScheduleChart.prototype.dragged = function(x, y, dataKey) {
	return (d) => {
		d.date = x.invert(d3.event.x);
		let data = y.invert(d3.event.y);

		if (data > 255) {
			data = 255;
		} else if (data < 0) {
			data = 0;
		}

		d[dataKey] = data;
		this.updateData();
	}
}

ScheduleChart.prototype.dragended = function(d) {
  d3.select(this).classed("active", false);
}