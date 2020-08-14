import { h } from "hyperapp";
import {Route} from "@hyperapp/router";
// import {TextArea, Button} from "../Styles";

const trimHexPrefix = val => String(val).indexOf('0x') === 0 ? String(val).slice(2) : val;

export default ({state, actions}) => {
    return (
        <Route path="/api" render={() => () => (
            <div>
                <h4>API testing tools</h4>
                <div style="position: relative;">
                </div>
            </div>
        )} />
    )
}
