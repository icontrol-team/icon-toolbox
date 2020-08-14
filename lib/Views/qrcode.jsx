import { h } from "hyperapp";
import {Button, InputBox, Title} from "../Styles";
import {Route} from "@hyperapp/router";


export default ({state, actions}) => {
    return (
        <Route path="/qrcode" render={() => () => (
            <div>
                <h4>Generate QRcode</h4>
                <div style="position: relative;">
                    <Title> Address : </Title><InputBox type="text" id="address" style="width: 320px" placeholder="icon wallet address (hx)"/> <br/>
                    <Title> Amount : </Title><InputBox type="text" id="amount" style="" placeholder="integer or float (icx)"/>
                    <Button onclick={() => actions.gen_qrcode()}>Generate</Button>
                    <Button onclick={() => actions.gen_qrcode(true)}>Random Generate</Button>
                </div>
                <br/>
                <canvas id="canvas"/>
                <img id="image"/>
            </div>
        )}/>

    )
}
