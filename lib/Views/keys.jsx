import { h } from "hyperapp";
import {Route} from "@hyperapp/router";
export default ({state, actions}) => {
    return (
        <Route path="/keys" render={() => () => (
            <div>
                <h4>Key Tools</h4>
            </div>
        )} />
    )
}
