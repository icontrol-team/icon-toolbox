import regeneratorRuntime from "regenerator-runtime";
import { h, app } from "hyperapp";
import { Route, location, Switch } from "@hyperapp/router";
const icx_utils = require("./lib/icx-utils");
import { IconWallet } from 'icon-sdk-js';
import {
    getId,
    getIdValue,
    logging_msg,
    content_remove_element,
    getStorageValue,
    iconTemplateMethod,
    getKeystore,
    changed_setting, tx_sign,
} from "./lib/icx-utils";
import {serialize} from "icon-sdk-js/lib/data/Util";
import { actions } from './lib/Actions'

// Styles
import './lib/Styles/app.css'
import "./lib/Styles/spinner.css"
import "./lib/Styles/jsoneditor.css"
import 'highlight.js/styles/github.css'
import './lib/Styles/slimselect.min.css'
import "./lib/Styles/dropzone.css"
import './lib/Styles/SpoqaHanSans-kr.css'
import {APP_VERSION} from "./lib/config";

import {
    Wrapper,
    Title,
    Column,
    Console,
    Logging,
    Navigation,
    Setting,
    SettingPage, Button
} from './lib/Styles';

import Units from './lib/Views/units'
import QRcode from './lib/Views/qrcode'
import Api from './lib/Views/api'
import INS from './lib/Views/ins'
import Keys from './lib/Views/keys'
import Footer from './lib/Views/footer'

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";



Sentry.init({
    dsn: 'https://79fc0f30841d4d20829a7456c2e7bf0b@o335249.ingest.sentry.io/5517666',
    integrations: [
        new Integrations.BrowserTracing(),
    ],

    tracesSampleRate: 0.1,
});

const route = (pathname, e=null) => {
    window.scrollTo(0, 0);
    console.log("route() ", pathname);
    history.pushState(null, "", pathname);
    content_remove_element("result");
};

const state = {
    // init: false,
    keystore_info: [],
    auto_reload: false,
    calculate_fee: false,
    location: location.state,
    error: null,
    last_network: window.localStorage.getItem("last_network") || "zicon" ,
    last_keystore: window.localStorage.getItem("last_keystore") || "" ,
    logging: [
        "<span>Welcome to ICON-ToolBox "+APP_VERSION +" - ICONTROL Team </span>",
    ],
    abi: {},
    timestamp: Math.round(new Date().getTime()/1000),
    timestring: (new Date()).toLocaleString(undefined, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    }),
    payload:{},
    selected_method: "",
    selected_group: "",
    errors: [],
    template_obj: new iconTemplateMethod(),
    score_apis_raws: {},
};

global.state = state;
global.editor_obj;

const stripHex = v => String(v).indexOf('0x') === 0 ? String(v).slice(2) : v;

// Not found page
const NotFound = () => (
  <div style={{ padding: '20%', 'padding-top': '100px' }}>
    <h1>404 error</h1>
    <h3>Page not found</h3>
  </div>
);

const page_in = function(state){
    if (getId('jsoneditor')) {
       if (state.location.pathname === "/qrcode") {
           getId('jsoneditor_layer').style.display='none';
       }else{
           getId('jsoneditor_layer').style.display='block';
       }
    }
}

const ChangeNavi = function(state, elements) {
    if (state === elements) {
        return 'active'
    }
    return 'deactive'
}


const navi_element = (pathname, menu_name, state_loc) => {
    let className = ChangeNavi(pathname, state_loc);
    return (
         <li onclick={e => route(pathname)} class={className}><a href='#'>{menu_name}</a></li>
    );
}


const Code = () => (state, actions, v = page_in(state)) => (
    <div style='width: 100%;'>
        <div class="tool_panel">
        {/*<Column style="width: 48%">*/}
            <Column id='cssmenu'>
                <Navigation >
                    {navi_element('/units', 'Units', state.location.pathname)}
                    {navi_element('/qrcode', 'QRcode', state.location.pathname)}
                    {navi_element('/ins', 'INS', state.location.pathname)}
                    {navi_element('/api', 'API', state.location.pathname)}
                    {navi_element('/keys', 'Keys', state.location.pathname)}
                </Navigation>
            </Column>

            <div class="fieldset" id='setting' >
                <legend><span> Settings </span></legend>
                <Title> network: </Title>
                <div class="inline">
                    <select style="width:150px" class='tight' onchange={e => {
                        changed_setting(e);
                        state.last_network = e.target.value;
                    }} id='network'>{
                        Object.keys(state.network_info).map((v, i) =>
                            state.last_network === v ? (<option value={v} selected>{v}</option>)
                                : (<option value={v}> {v}</option>)
                        )
                    }</select>
                </div>
                <div class="inline">
                    <select style='width:240px' class='tight' onchange={e => {
                        getKeystore(e);
                        state.last_keystore = e.target.value;
                        window.localStorage.setItem('last_keystore', e.target.value);
                        // tx_sign();

                    }} id='keystore_sel'>{
                        Object.keys(state.keystore_info).map((v, i) =>
                            state.last_keystore === v
                                ?
                                (<option value={v} selected>{v} &nbsp;<small style='font-style: italic;'>
                                    {icx_utils.ellipsis_start_and_end(state.keystore_info[v].address)}</small>
                                </option>)  :
                                (<option value={v}>{v} &nbsp;<small style='font-style: italic;'>
                                    {icx_utils.ellipsis_start_and_end(state.keystore_info[v].address)}</small>
                                </option>)
                        )
                    }</select>
                </div>
                <div id='setting' >
                </div>
                <div id='setting_result' style='overflow-x: scroll; height:90px'> </div>
                {/*<div id='setting_result' style='overflow-x: scroll; min-height:90px;max-height:300px '> </div>*/}
            </div>

        </div>
        <div class="tool_control_panel">
        {/*<Wrapper>*/}
            <Column style='position:relative;flex-direction: column; width: 100%;overflow:auto;'>
            <div>
                <Route path='/' render={() => () => (
                <div>
                    {route('/units')}
                </div>
                )} />
                <Units state={state} actions={actions}/>
                <QRcode state={state} actions={actions}/>
                <INS state={state} actions={actions}/>
                <Api state={state} actions={actions}/>
                <Keys state={state} actions={actions}/>
            </div>
                <Footer state={state} actions={actions}/>
          </Column>
        </div>
        <div class="mobile_hide" >
            <SettingPage id='setting' >
                <legend> Logging</legend>
                <div style="margin-top: -15px" className="setting_page">
                <h1>ICON-ToolBox <small>{APP_VERSION}</small></h1>

                <small style=''> powered by  <a href='http://icontrol.id' target='_blank'>ICONTROL</a></small>
                    <input type="checkbox" checked={state.auto_reload} onclick={() => actions.check_auto_reload()}/>
                    <span id="auto_reload_text"> auto reload </span>
                    <Button style='margin-left:150px' onclick={() => actions.clear_logging()}>clear log</Button>
                </div>
            </SettingPage>
            <Logging id='logging'>{state.logging.concat(state.errors)
              .map((v, i) => (<div style='border: 1px solid #ededed; padding:8px' innerHTML={v}> </div>))}
            {/*<legend>Logging</legend>*/}
            </Logging>

            <Console placeholder='' onkeyup={e => {
              if (e.keyCode === 13) {
                e.preventDefault();
                actions.console(e.target.value);
              }
            }}> </Console>
        </div>
    </div>
);

const Routes = () => (
    <Switch>
        <Route path='/' render={Code} />
        <Route path='/ins' render={Code} />
        <Route path='/units' render={Code} />
        <Route path='/qrcode' render={Code} />
        <Route path='/api' render={Code} />
        <Route path='/keys' render={Code} />
        <Route path='/img' render={ () => {}} />
        <Route render={NotFound} />
    </Switch>
);

const devtools = process.env.NODE_ENV === 'development'
    ? require('hyperapp-redux-devtools')
    : null;

let main;

icx_utils.set_network().then(function(data) {
    state.network_info  = data;
    state.keystore_info = getStorageValue('keystore', 'key_alias');

    if (devtools) {
        console.log('Development mode')
        main = devtools(app)(
            state,
            actions,
            Routes,
            document.body
        );
    } else {
        main = app(
            state,
            actions,
            Routes,
            document.body
        );
    }
    const unsubscribe = location.subscribe(main.location);
    // console.log('location: ' , location)
});


function waitForDomReady() {
    if (!document.getElementById('setting')) {
        window.requestAnimationFrame(waitForDomReady);
    }else {
        console.log("**************************************************************");
        changed_setting();
        // if (icx_utils.getClass('jsoneditor-poweredBy')) {
        //     icx_utils.getClass('jsoneditor-poweredBy').item(0).remove();
        // }
    }
}

function simple_sender() {
    // let json_rpc = editor_obj.get();
    let json_rpc = new iconTemplateMethod().get('icx_sendTransaction');
    if (!getIdValue('simple_sender_address')) {
        logging_msg('[ERROR] To address not found')
        return
    }

    if (!getIdValue('simple_sender_amount')) {
        logging_msg('[ERROR] value not found')
        return
    }

    delete json_rpc.params.signature;
    json_rpc.params.nid = json_rpc.params.nid || getNetworkInfo().nid;
    json_rpc.params.from = getKeystore().address;
    json_rpc.params.to =  getIdValue('simple_sender_address')|| '';
    json_rpc.params.nonce = json_rpc.params.nonce || icx_utils.getRandomHex();
    json_rpc.params.stepLimit = json_rpc.params.stepLimit || '0xf4240';
    json_rpc.params.version = json_rpc.params.version || '0x3';
    json_rpc.params.timestamp = icx_utils.nowUnixtimeHex();
    json_rpc.params.value = getIdValue('simple_sender_amount')  || '0x38d7ea4c68000';
    let wallet = IconWallet.loadPrivateKey(getKeystore().pk);

    if (json_rpc.params.dataType === 'message') {
        json_rpc.params.data = icx_utils.StringtoHex(json_rpc.params.data);
    }
    // logging_msg(wallet);
    // let signature = wallet.sign(serialize(editor_obj.get()));
    let signature = wallet.sign(serialize(json_rpc.params));
    logging_msg('signature', signature);
    json_rpc.params.signature = signature;
    logging_msg('JSON', json_rpc);
}

waitForDomReady();
