import { h } from "hyperapp";
import {Button, PurpleButton, GroupField, InputBox} from "../Styles";

import {iconTemplateMethod, changed_setting} from '../icx-utils';

export default ({state, actions}) => {
    return (
    <div>
        <div style={state.location.pathname === "/keys" ? "display:block" : "display:none"}>
            <ul id="keystore_layer" className="collapse-list">
                <li>
                    <input className="collapse-open" type="checkbox" id="collapse-1"/>
                    <label className="collapse-btn" htmlFor="collapse-1">Management Keystore</label>

                    <div className="collapse-panel">
                        <br/>
                        <GroupField>
                           <legend>If you want to import a keystore file</legend>
                            <form action="" className="dropzone" method="post" encType="multipart/form-data" id="dragUpload">
                                <div className="fallback">
                                    <input type="file" name="key_files" multiple/>
                                </div>
                            </form>
                            <br/>
                            <div id="keystore_result" style="overflow-x: scroll; max-height:140px;padding-bottom:10px"> </div>
                            <div style="width:100%;">
                                <Button onclick={actions.save_keystore} style="margin-right:0;margin-left:auto;display:block">Save key</Button>
                            </div>

                            <legend>If you want to generate by private key</legend>
                            <div className='flex-box'>
                                <input className="password" type="text" id="private_key" style="width:210px; " placeholder="Private Key" autoComplete="off"/>
                                <Button style="" onclick={actions.import_privateKey}>Generate Key by PK</Button>
                            </div>

                            <legend>If you want to generate by password</legend>
                            <div className='flex-box'>
                                <input className="password" type="text" id="key_password" style="width:210px; " placeholder="password" autoComplete="off"/>
                                <Button style="" onclick={actions.generateKey}>Generate Key by password</Button>
                            </div>
                            <br/> <br/>
                        </GroupField>
                    </div>
                </li>
            </ul>
        </div>
        <div style={
            state.location.pathname === "/keys" ? "display:block" :
                state.location.pathname === "/api" ? "display:block" :
                    state.location.pathname === "/units" ? "display:block" : "display:none"
        }>
            <div id="jsoneditor_layer" style="position: relative" classname="jsoneditor_class">
                <div className="flex-box">
                    <div style="width:250px;">

                         <select onchange={e => {changed_setting()}} id="methods">
                             {Object.keys(state.template_obj.get()).map((group, ii) => (
                                    <optgroup label={group}>{
                                        Object.keys(state.template_obj.get_group(group)).map((v, ii) =>
                                            (<option value={v}>{v}</option>)
                                        )
                                    }</optgroup>
                                )
                            )
                        }</select>

                        {/*<select onchange={e => {*/}
                        {/*    changed_setting()*/}
                        {/*}} id="methods">*/}

                        {/*    {*/}
                        {/*    Object.keys(state.template_obj.get()).map((group, ii) => (*/}
                        {/*            <optgroup label={group}>{*/}
                        {/*                // Object.keys(icon_methods_template[group]).map((v, ii) =>*/}
                        {/*                Object.keys(state.template_obj.get_group(group)).map((v, ii) =>*/}
                        {/*                    (<option value={v}>{v}</option>)*/}
                        {/*                )*/}
                        {/*            }</optgroup>*/}
                        {/*        )*/}
                        {/*    )*/}

                        {/*}</select>*/}
                    </div>
                    <Button style='height:30px;margin: 10px 0px 0px 0px ' onclick={() => actions.sign()} id="sign_btn">sign</Button>
                    <Button style='height:30px;margin: 10px 0px 0px 0px ' onclick={() => actions.call_api_payload()}>call_api</Button>
                    <PurpleButton style='' onclick={() => actions.sign_call_api_payload()}>sign call_api</PurpleButton>
                </div>

                {/*<ul id="dynamic_convertor" className="collapse-list">*/}
                {/*    <li>*/}
                {/*        <input className="collapse-open" type="checkbox" id="collapse-2"/>*/}
                {/*        <label className="collapse-btn" htmlFor="collapse-2">convertor</label>*/}

                {/*        <div className="collapse-panel">*/}
                {/*            <br/>*/}
                {/*            <GroupField>*/}
                {/*                <legend>If you want to import a keystore file</legend>*/}
                {/*            </GroupField>*/}
                {/*        </div>*/}
                {/*    </li>*/}
                {/*</ul>*/}
                <br/>
                <div id="jsoneditor" style="width: 100%; height:400px">
                </div>
            </div>
            <div id="result_layer">
                <div id="result">
                </div>
                <div style="position: relative;">
                    <InputBox style="font-size:9px;width:97%; margin:10px 0px 0px 0px" id="txhash" oninput={
                        e => actions.change({inputA: String(e.target.value || '').trim()})
                    } placeholder="input TxHash"> </InputBox>
                </div>
                <Button style='height:30px;margin: 10px 0px 0px 0px ' onclick={() => actions.icx_getTransactionResult()}>getTXResult</Button>
                <Button style='height:30px;margin: 10px 0px 0px 0px ' onclick={() => actions.icx_getTransactionByHash()}>getTX</Button>

            </div>
        </div>
    </div>
    )
}
