import React, {Component} from "react";
import ReactDOM from "react-dom";
import DemoComponent from "./components/DemoComponent.jsx";

class RootComponent extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className="app">
                <DemoComponent/>
            </div>
        )
    }
}

ReactDOM.render(<RootComponent/>, document.getElementById("root"));