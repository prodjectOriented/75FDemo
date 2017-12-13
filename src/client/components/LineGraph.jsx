import React, {Component} from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import * as ReactFauxDOM from "react-faux-dom";
import moment from 'moment';

export default class LineGraph extends Component {
    data = undefined;
    datum = undefined;
    svgElement = undefined;
    tooltip = undefined;

    constructor(props, context) {
        super(props, context);

        this.datum = props.datum;
        this.data = props.data;
        this.svgElement = ReactFauxDOM.createElement("svg");
        this.svgElement.setAttribute("width", 800);
        this.svgElement.setAttribute("height", 600);
    }

    createGraph(datum, data, dataFieldToDisplay = "temperature") {
        console.log("CreateLG", datum);
        const svg = d3.select(this.svgElement);
        let svgGroup = !svg.select(".group").empty() ? svg.select(".group") : svg.append("g").attr("class", "group");
        const width = +svg.attr("width");
        const height = +svg.attr("height");

        const xScale = d3.scaleLinear()
            .domain([0, 10])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([74, 76])
            .range([height, 0])
            .nice();

        let line = d3.line()
            .x(d => xScale(d.id))
            .y(d => yScale(d[dataFieldToDisplay]));

        const existingGraph = svg.select(".graph");

        if (!existingGraph.empty()) {
            existingGraph
                .data([data])
                .attr("d", line);
        } else {
            svgGroup.append("path")
                .data([data])
                .attr("class", "graph")
                .attr("d", line)
                .style("stroke", "rgb(82,174,254)")
                .attr("stroke-width", 2)
                .style("fill", "transparent");
        }

        svgGroup.append("circle")
            .datum(datum)
            .attr("class", "point")
            .attr("cx", (d) => (xScale(d.id)))
            .attr("cy", (d) => (yScale(d[dataFieldToDisplay])))
            .attr("r", 6)
            .on("mouseover", (d) => {
                const content = `<strong>Temperature:</strong> ${d.temperature}<br/><strong>Humidity:</strong> ${d.humidity}<br/><strong>Timestamp:</strong> ${moment(d.timestamp).format("MM/DD/YY h:mm a")}`;

                let left = d3.event ? d3.event.pageX : 0;
                let top = d3.event ? d3.event.pageY : 28;
                this.tooltip.transition()
                    .duration(350)
                    .style("opacity", 1.0);
                this.tooltip.html(content)
                    .style("left", `${left}px`)
                    .style("top", `${top + 20}px`);
            });
    };

    initTooltip() {
        if (d3.select(".tooltip").empty()) {
            this.tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        } else {
            this.tooltip = d3.select(".tooltip");
        }
    }


    componentDidUpdate() {
        this.initTooltip();
        this.createGraph(this.props.datum, this.props.data);
    }

    render() {
        return this.svgElement.toReact();
    }
}