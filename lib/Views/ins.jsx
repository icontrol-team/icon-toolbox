import { h } from "hyperapp";
import {Route} from "@hyperapp/router";
import {Button, InputBox, Title} from "../Styles";

export default ({state, actions}) => {
    return (
        <Route path="/ins" render={() => () => (
            <div>
                <h4>ICON Name Service testing tools</h4>
                <div style="position: relative;">
                    <Title> INS : </Title>
                    <InputBox type="text" id="ins_address" style="" placeholder="INS or ICON address (hx)"
                      onkeypress={e => (e.keyCode === 13 ? actions.get_ins_address(): null)}
                    />
                    <Button
                        onclick={() => actions.get_ins_address()}
                    >Get INS address</Button>
                </div>
                <div id="ins_result_layer">
                    <div id="ins_result">

                    </div>

                </div>
            </div>
        )} />
    )

}
