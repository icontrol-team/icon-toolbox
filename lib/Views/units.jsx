import { h } from "hyperapp";
import {Route} from "@hyperapp/router";
import {Button, InputBox, Title} from "../Styles";
import {content_remove_element, getIdValue, putIdValue, convert_hex_form, unixtime2date, base64encode, logging_msg} from "../icx-utils";

const route = (pathname, e=null) => {
    window.scrollTo(0, 0);
    history.pushState(null, "", pathname);
    content_remove_element("result");
};

export default ({state, actions}) =>{
    return (
        <Route path="/units" render={() => () => (
            <div>
                <h4>Unit Tools</h4>
                <Title> Number ⇔ Hex ⇔ Hex(10**18)</Title> <br />
                <InputBox autocomplete="off" type="text" id="int_value" placeholder="number ()" onkeyup={ e =>  {convert_hex_form(e); }} />⇔
                <InputBox autocomplete="off" type="text" id="hex_value" placeholder="hex (0x)" onkeyup={ e =>  {convert_hex_form(e);} } />⇔
                <InputBox autocomplete="off" type="text" id="hex_loop_value" placeholder="hex (0x)" onkeyup={ e =>  { convert_hex_form(e); } } />
                <br/><br/>
                <Title> Unixtime ⇔ Unixtime(ms) ⇔ Date</Title>
                <Button onclick={()=>actions.update_unixtime({val: Math.floor(new Date().getTime() / 1000)})}>  now </Button> <br/>
                <InputBox type="text" id="unixtime_value" style="width:90px" placeholder="Unixtime" onkeyup={
                    e => {
                        let changed_date = unixtime2date(e.target.value || '');
                        putIdValue('unixtime_ms_value', e.target.value * 1000);
                        putIdValue('unixtime2date_value', changed_date);
                        actions.update_unixtime({e:e, val:changed_date});
                    }
                }
                />⇔
                <InputBox type="text" id="unixtime_ms_value"  style="width:120px" placeholder="Unixtime(ms)" onkeyup={
                    e => {
                        let changed_date = unixtime2date(e.target.value || '', true);
                        putIdValue('unixtime_value', parseInt(e.target.value / 1000) );
                        putIdValue('unixtime2date_value', changed_date);
                    }
                }  onchange={
                    e =>{
                        actions.update_unixtime({e:e, val:e.target.value});
                    }
                }
                />⇔
                <InputBox type="text" id="unixtime2date_value" style="width:160px" placeholder="date(2020-08-06 10:11:10)" onkeyup={
                    e => {
                        let unix2date = date2unixtime(e.target.value || '');
                        putIdValue('unixtime_ms_value',unix2date * 1000);
                        putIdValue('unixtime_value',unix2date);
                        actions.update_unixtime({e:e, val: getIdValue('unixtime_value')});
                    }
                }/>
                <br /><br />

                <Title> Text ⇔ base64 </Title> <br/>
                <InputBox type="text" id="base64_decode" placeholder="text ()" onkeyup={
                    e => {
                        putIdValue('base64_encode', base64encode(e.target.value || ''));
                    }
                } onchange={
                    e => {
                        logging_msg("text -> base64", getIdValue("base64_decode") + " -> " + getIdValue("base64_encode"));
                        actions.gen_table( {data: {[getIdValue("base64_decode")]: getIdValue("base64_encode")},caption:"text->base64"});
                    }
                }
                />⇔
                <InputBox type="text" id="base64_encode"  placeholder="hex (0x)" onkeyup={
                    e => {
                        putIdValue('base64_decode', base64decode(e.target.value || ''));
                    }
                } onchange={
                    e => {
                        logging_msg("base64 -> text", getIdValue("base64_decode") + " -> " + getIdValue("base64_encode"));
                        actions.gen_table({ data: {[getIdValue("base64_encode")]: getIdValue("base64_decode")}, caption: "base64->text"});
                    }
                }
                />
                <br/><br/>
            </div>
        )} />
    )
}
