import React, {Component} from "react";
import ReactDOM from "react-dom";
import "./DemoComponent.scss";

import {action, observable} from "mobx";
import {observer} from "mobx-react";

import LineGraph from './LineGraph.jsx';

// Using MobX for observable scoped attrs
@observer
export default class DemoComponent extends Component {
    connection = undefined;
    connectionUrl = "ws://127.0.0.1:8080"; // mock WS endpoint
    @observable data = [];

    constructor(props, context) {
        super(props, context);
        this.handleStartClick = this.handleStartClick.bind(this);
    }

    handleStartClick(e) {
        e.preventDefault();
        if(!this.connection) {
            this.connection = new WebSocket(this.connectionUrl);
            this.connection.onmessage = action((message) => {
                // WS message data is stringified JSON representations of data evt hashes, so just parse them and push
                // to the observable array
                this.data.push(JSON.parse(message.data));
            }).bind(this);
        }
    }


    render() {
        const data = this.data.slice();
        const datum = this.data.slice().pop();
        return (
            <div className="demo">
                <h2>Demo Graph</h2>
                <p>Hover over points on the graph for tooltips.</p>
                <div className="lineGraph">
                    <LineGraph data={data} datum={datum}/>
                </div>
                <input type="submit" className="start" value="Start" onClick={this.handleStartClick}></input>
            </div>
        )
    }
}