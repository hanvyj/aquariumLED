import * as d3 from "d3";

export default function () {
    // insert element
    const chartElement = document.getElementById('scheduleChart');

    // get width of body
    const bodyWidth = chartElement.offsetWidth;

    // set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = bodyWidth - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        chartSpacing = 10,
        chartHeight = (height - (chartSpacing * 3)) / 4;

    console.log(chartHeight, (height / 4), height);

    // parse the date / time
    const parseTime = d3.timeParse("%H:%M:%S");

    // set the ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([chartHeight, 0]);

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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("/data/LEDProfile.csv", (error, data) => {
        if (error) throw error;

        // format the data
        data.forEach(d => {
            d.date = parseTime(d.date);
            d.red = +d.red;
            d.green = +d.green;
            d.blue = +d.blue;
            d.white = +d.white;
        });

        // Scale the range of the data
        x.domain([parseTime('00:00:00'), parseTime('24:00:00')]);
        y.domain([0, d3.max(data, d => Math.max(d.red, d.green, d.blue))]);

        // total chart
        const whiteChart = svg.append("g");
        const redChart = svg.append("g")
            .attr("transform",
            "translate(0," + (chartSpacing + chartHeight) + ")");
        const greenChart = svg.append("g")
            .attr("transform",
            "translate(0," + (chartSpacing + chartHeight) * 2 + ")");
        const blueChart = svg.append("g")
            .attr("transform",
            "translate(0," + (chartSpacing + chartHeight) * 3 + ")");


        // Add the line path.
        whiteChart.append("path")
            .data([data])
            .attr("class", "white-stroke")
            .attr("d", whiteLine);

        redChart.append("path")
            .data([data])
            .attr("class", "red-stroke")
            .attr("d", redLine);

        greenChart.append("path")
            .data([data])
            .attr("class", "green-stroke")
            .attr("d", greenLine);

        blueChart.append("path")
            .data([data])
            .attr("class", "blue-stroke")
            .attr("d", blueLine);

        // Add the points
        svg.selectAll("dot")
            .data(data)
        .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.close); });

        // Add the Y Axis
        whiteChart.append("g")
            .call(d3.axisLeft(y));

        redChart.append("g")
            .call(d3.axisLeft(y));

        greenChart.append("g")
            .call(d3.axisLeft(y));

        blueChart.append("g")
            .call(d3.axisLeft(y));

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%H:%M")));


    });
}