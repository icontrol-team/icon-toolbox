import regeneratorRuntime from "regenerator-runtime";
import { h, app, vdom } from "hyperapp";
import { Link, Route, location, Switch } from "@hyperapp/router";
import axios from 'axios';
const icx_utils = require("./lib/icx-utils");
import IconService, { IconAmount, IconWallet, IconConverter, HttpProvider, IconBuilder } from 'icon-sdk-js';
import styled from 'hyperapp-styled-components';
const styles =  require('./lib/app.css');


const route = (pathname, e=null) => {
    window.scrollTo(0, 0);
    history.pushState(null, "", pathname);
    content_remove_element("result");
};

const state = {
    location: location.state,
    error: null,
    last_network: window.localStorage.getItem("last_network") ||"zicon" ,
    logging: [
        "<span>Welcome to ICON-ToolBox - ICONTROL Team </span>",
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
    errors: [],
};

const stripHex = v => String(v).indexOf('0x') === 0 ? String(v).slice(2) : v;
const actions = {
    location: location.actions,
    load: () => (state, actions) => {},
    logging: val => (state, actions) => {
        val = "<span style='background:#f2f2f2;border: 1px solid #ededed;margin-right:3px;'>"+ icx_utils.nowdate() +"</span>"+
        "<span>"+val+"</span>";
        actions.change({ logging: state.logging.concat([val]) });
        const elm = document.getElementById('logging');
        setTimeout(e => {(elm.scrollTop = elm.scrollHeight)}, 50);
    },
    gen_qrcode: ( is_random=false ) => (state, actions) => {
        let val = "is_random -> " + is_random;
        if (is_random === true) {
            // document.getElementById("address").value = icx_utils.random_wallet();
            // document.getElementById("amount").value = icx_utils.getRandomInt(1,10);
            putIdValue('address', icx_utils.random_wallet());
            putIdValue('amount', icx_utils.getRandomInt(1,10));

        }
        let qrcode_url = icx_utils.reload_qrcode();
        actions.logging("address: "+ document.getElementById("address").value + " / amount:"+ document.getElementById("amount").value);
        actions.logging(qrcode_url);
        const elm = document.getElementById('logging');
        setTimeout(e => {(elm.scrollTop = elm.scrollHeight)}, 50);
    },
    gen_table: (data, caption=null) => (state, actions) =>{
        content_remove_element("result");
        console.log("caption="+caption);
        generate_table("table","result", data, caption);
    },
    getIISSinfo: () => (state, actions) => {
        try {
            actions.logging('getIISSinfo');
            icx_utils.call_api("getIISSInfo", true).then(function(data) {
                icx_utils.logging_msg("getIISSinfo = ",JSON.stringify(data,undefined,4) );
                // actions.update_time();
                let left_block = state.timestamp + (data.result.nextPRepTerm-data.result.blockHeight)*2 ;
                console.log(icx_utils.unixtime2date(left_block));

                actions.gen_table({
                    nextCalculation: icx_utils.hex_to_int(data.result.nextCalculation, true, false),
                    blockHeight: icx_utils.hex_to_int(data.result.blockHeight,true,false),
                    leftBlock: icx_utils.hex_to_int(data.result.nextPRepTerm - data.result.blockHeight, true, false),
                    nextTerm: icx_utils.unixtime2date(left_block)
                });
            });

        } catch (error) { actions.error(error); }
    },
    icx_getTotalSupply: () => (state, actions) => {
        try {
            actions.logging('icx_getTotalSupply');
            icx_utils.call_api("icx_getTotalSupply", false).then(function(data) {
                actions.logging(JSON.stringify(data));

                actions.gen_table({
                    TotalSupplyOrg: icx_utils.bigInteger(data.result, true),
                    TotalSupply: icx_utils.hex_to_int(data.result, true)
                });

            });

        } catch (error) {
            actions.error(error);
        }
    },
    icx_getBalance: () => (state, actions) => {
        try {
            actions.logging('icx_getBalance');
            icx_utils.call_api("icx_getBalance", false, {address:(state.inputA || '').trim() }).then(function(data) {
                actions.logging(JSON.stringify(data));
                actions.gen_table(icx_utils.flatten(data.result));
            });

        } catch (error) {
            actions.error(error);
        }
    },
    icx_getLastBlock: () => (state, actions) => {
        try {
            actions.logging('icx_getLastBlock');
            icx_utils.call_api("icx_getLastBlock", false).then(function(data) {
                actions.logging(JSON.stringify(data));
                actions.gen_table(icx_utils.flatten(data.result));
            });

        } catch (error) {
            actions.error(error);
        }
    },
    icx_getTransactionResult: () => (state, actions) => {
        try {
            icx_utils.call_api("icx_getTransactionResult", false, {txHash:(state.inputA || '').trim() }).then(function(data) {
                icx_utils.logging_msg('icx_getTransactionResult', data);
                actions.gen_table(icx_utils.flatten(data.result));
            });

        } catch (error) { actions.error(error); }
    },
    icx_getTransactionByHash: () => (state, actions) => {
        try {
            actions.logging('icx_getTransactionByHash');
            icx_utils.call_api("icx_getTransactionByHash", false, {txHash:(state.inputA || '').trim() }).then(function(data) {
                icx_utils.logging_msg('icx_getTransactionResult', data);
                actions.gen_table(icx_utils.flatten(data.result));
            });

        } catch (error) { actions.error(error); }
    },
    icx_getBlockByHeight: () => (state, actions) => {
        try {
            actions.logging('icx_getBlockByHeight');
            icx_utils.call_api("icx_getBlockByHeight", false, {height:( icx_utils.int_to_hex(state.inputA || '', false).trim()) }).then(function(data) {
                icx_utils.logging_msg('icx_getBlockByHeight', data);
                actions.gen_table(icx_utils.flatten(data.result));
            });

        } catch (error) { actions.error(error); }
    },
    toInt: () => (state, actions) => {
        try {
             actions.logging(`bigNumberify("${state.inputB || ''}").toString(10) => ${icx_utils.hex_to_float(state.inputB || '').toString(10)}`);
        } catch (error) { actions.error(error); }
      },
    toHex: () => (state, actions) => {
        try {
            actions.logging(`bigNumberify("${state.inputB || ''}").toString(10) => ${icx_utils.int_to_hex(state.inputB || '').toString(10)}`);
        } catch (error) { actions.error(error); }
    },
    generateKey: () => (state, actions) => {
        try {
            let wallet = IconWallet.create();
            icx_utils.logging_msg("IconWallet.create()" , "addrerss: " +wallet.getAddress()  + "\nPrivateKey: " + wallet.getPrivateKey());

            let password = getIdValue("key_password");
            let keystore = wallet.store(password);
            icx_utils.logging_msg("Generate KeyStore json: password - "+password, keystore);
            state.keystore = keystore;
            actions.gen_table(icx_utils.flatten(state.keystore));


        } catch (error) { actions.error(error); }
    },
    console: val => (state, actions) => {
        try {
            actions.logging(`${eval(val)}`);
        } catch (error) { actions.error(error); }
    },
    eval: () => (state, actions) => {
        try {
            actions.logging(`eval("${state.inputB || ''}") => ${eval(state.inputB || '')}`);
        } catch (error) { actions.error(error); }
    },
    error: val => (state, actions) => {
        console.log("catch error");
        // remove_element("table");
        actions.logging(String(val.message));
    },
    update_unixtime: val => (state, actions) =>{
        let result = {};
        result['UnixtimeStamp']  = getIdValue('unixtime_value');
        result['UnixtimeStamp(ms)']  = getIdValue('unixtime_ms_value');
        result['date UTC']  = icx_utils.unixtime2date(val || '',false,true);
        result['date '+icx_utils.getTimeZone()]  = icx_utils.unixtime2date(val || '',false,false);
        actions.gen_table(icx_utils.flatten(result));
    },
    update_time: () => (state, actions) => {
        actions.change({logging_time: Math.round(new Date().getTime() / 1000)});
    },
    change: obj => obj,
};

const trimHexPrefix = val => String(val).indexOf('0x') === 0 ? String(val).slice(2) : val;

// Not found page
const NotFound = () => (
  <div style={{ padding: '20%', 'padding-top': '100px' }}>
    <h1>404 error</h1>
    <h3>Page not found</h3>
  </div>
);

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;  
  width: 45%;  
  overflow: scroll;
  left: 0px;
  top: 0px;
  bottom: 0px;
  flex-wrap: wrap;
  height:100%;  
`;

const TextArea = styled.textarea`
  padding: 10px;
  margin-top: 10px;
  width: 100%;
  height: 70px;
  font-family: Arai
`;

const Button = styled.button` 
  margin-top: 10px;
  margin-right: 10px;
  box-shadow:inset 0px 1px 0px 0px #ffffff;
  background:linear-gradient(to bottom, #f9f9f9 5%, #e9e9e9 100%);
  background-color:#f9f9f9;
  border-radius:6px;
  border:1px solid #dcdcdc;
  display:inline-block;
  cursor:pointer;
  color:#666666;
  font-family:Arial;
  font-size:15px;
  font-weight:bold;
  padding:6px 8px;
  text-decoration:none;
  text-shadow:0px 1px 0px #ffffff;  
  &:hover{
    background:linear-gradient(to bottom, #e9e9e9 5%, #f9f9f9 100%);
    background-color:#e9e9e9;
  }
  &:active{
    position:relative;
    top:1px;
  }
  &:focus{
    outline:0;
    border:1px solid #8d8d8d;
  }
`;

const Logging = styled.div`
  border: 1px solid #ccc;
  width: 45%;
  margin: 10px;
  font-family: Aria;
  position: absolute;
  word-wrap: break-word;
  padding: 10px 10px 10px 10px;
  bottom: 50px;
  top: 170px;
  right: 0px;
  overflow: scroll;
  overflow-x: hidden;
  font-size: 13px;
`;

const Console = styled.input`
  position: absolute;
  display: block;
  line-height: 15px;
  padding-top: 0px;
  bottom: 0px;
  height: 40px;
  margin-bottom: 10px;
  right: 35px;
  padding-right: 20px;
  padding-left: 23px;
  border: 0px;
  letter-spacing: .5px;
  font-size: 15px;
  width: 40%;
  outline: none;
  background: url(https://png.pngtree.com/svg/20160727/0bf24b248b.svg);
  background-position: 0px 10px;
  background-repeat: no-repeat;
  background-size: 20px 20px;

  &:focus {
    color: none;
    outline: none;
  }
`;

const Column = styled.div`
  margin-left: 20px;
  padding-bottom: 100px;
`;

const Buttons = styled.div`
  margin-top: 40px;
  margin-bottom: 80px;
`;

const PageButton = styled.span`
  margin-right: 20px;
  margin-bottom: 40px;
  border-right: 1px solid #333;
  cursor: pointer;
  padding-right: 20px;
  text-decoration: none;
  margin-bottom: 20px;

  &:hover {
    color: blue;
  }
`;


const SettingPage = styled.div`
  border: 1px solid #ccc;
  width: 45%;
  margin: 10px;
  font-family: Aria;
  position: absolute;
  word-wrap: break-word;
  padding: 10px 10px 10px 10px;
  bottom: 50px;
  top: 0px;
  right: 0px;
  overflow: scroll;
  overflow-x: hidden;
  font-size: 13px;
`;


const Navigation = styled.ul`
`



const page_in = function (state){
    console.log("page_in() : " + state.location.pathname);
}


const ChangeNavi = function(state, elements) {
    if (state === elements) {
        return "active"
    }
    return "deactive"
}


const navi_element = (pathname, menu_name, state_loc) => {
    let className = ChangeNavi(pathname, state_loc);
    return (
         <li onclick={e => route(pathname)} class={className}><a href="#">{menu_name}</a></li>
    );
}


const Code = () => (state, actions, v = page_in(state)) => (
<div style="width: 100%;">
    <Wrapper>
        <Column style="display: flex; flex-direction: column; width: 100%;">
        <h1>ICON-ToolBox</h1>
        <small style="margin-top: -15px"> powered by  <a href="http://icontrol.id" target="_blank">ICONTROL</a></small>
        <div>
            <Column id="cssmenu">
                <Navigation >
                    {navi_element("/units", "Units", state.location.pathname)}
                    {navi_element("/qrcode", "QRcode", state.location.pathname)}
                    {navi_element("/api", "API", state.location.pathname)}
                    {navi_element("/keys", "Keys", state.location.pathname)}
                </Navigation>
            </Column>
            <Route path="/" render={() => () => (
            <div>
                {route("/units")}
            </div>
            )} />

            <Route path="/qrcode" render={() => () => (
                <div>
                    <h4>Generate QRcode</h4>
                    <div style="position: relative;">
                        <span> Address : </span><input type="text" id="address" style="padding: 10px;width: 320px" placeholder="icon wallet address (hx)" /> <br/><br/>
                        <span> Amount : </span><input type="text" id="amount" style="padding: 10px;margin-right:10px" placeholder="integer or float (icx)" />
                        <Button onclick={() => actions.gen_qrcode()}>Generate</Button>
                        <Button onclick={() => actions.gen_qrcode(true)}>Random Generate</Button>
                    </div>
                    <br />
                    <canvas id="canvas" ></canvas>
                    <img id="image"></img>
                </div>
            )} />
            <Route path="/api" render={() => () => (
                <div>
                    <h4>api tools</h4>
                    <div style="position: relative;">
                        <TextArea oninput={e => actions.change({ inputA: String(e.target.value || '').trim() })} placeholder="input string or hex data"></TextArea>
                        <div class="cal_size">{trimHexPrefix(state.inputA || '').length / 2} bytes</div>
                    </div>
                    <br />
                    <Button onclick={actions.getIISSinfo}>getIISSinfo</Button>
                    <Button onclick={actions.icx_getTotalSupply}>icx_getTotalSupply</Button>
                    <Button onclick={actions.icx_getLastBlock}>icx_getLastBlock</Button>
                    <Button onclick={actions.icx_getBalance}>icx_getBalance</Button>
                    <Button onclick={actions.icx_getTransactionResult}>icx_getTransactionResult</Button>
                    <Button onclick={actions.icx_getTransactionByHash}>icx_getTransactionByHash</Button>
                    <Button onclick={actions.icx_getBlockByHeight}>icx_getBlockByHeight</Button>
                </div>
            )} />
          <Route path="/units" render={() => () => (
            <div>
              <h4>Unit Tools</h4>
                <b> Number ⇔ Hex</b> <br />
                <input type="text" id="int_value" style="padding: 10px;width:210px" placeholder="number ()" onkeyup={
                    e =>  {
                        let changed_hex = icx_utils.int_to_hex(e.target.value || '');
                        // document.getElementById('hex_value').value = changed_hex;
                        putIdValue('hex_value', changed_hex);
                    }
                } onchange={
                    e => {
                        icx_utils.logging_msg("number -> hex", getIdValue("int_value") + " -> " + getIdValue("hex_value"));
                    }
                }
                />⇔
                <input type="text" id="hex_value" style="padding: 10px;width:210px" placeholder="hex (0x)" onkeyup={
                    e =>  {
                        let changed_float = icx_utils.hex_to_float(e.target.value || '');
                        // document.getElementById('int_value').value = changed_float;
                        putIdValue("int_value", changed_float);
                    }
                } />
                <br/><br/>
                <b> Unixtime ⇔ Unixtime(ms) ⇔ Hex</b> <br/>
                <input type="text" id="unixtime_value" style="padding: 10px 5px 10px 5px ;width:110px" placeholder="Unixtime" onkeyup={
                    e => {
                        let changed_date = icx_utils.unixtime2date(e.target.value || '');
                        putIdValue('unixtime_ms_value', e.target.value * 1000);
                        putIdValue('unixtime2date_value', changed_date);
                        actions.update_unixtime(e.target.value);
                    }
                }/>⇔
                <input type="text" id="unixtime_ms_value" style="padding: 10px 5px 10px 5px;width:140px" placeholder="Unixtime(ms)" onkeyup={
                    e => {
                        let changed_date = icx_utils.unixtime2date(e.target.value || '', true);
                        // document.getElementById('unixtime_value').value = parseInt(e.target.value/1000);
                        // document.getElementById('unixtime2date_value').value = changed_date;
                        putIdValue('unixtime_value',parseInt(e.target.value/1000) );
                        putIdValue('unixtime2date_value',changed_date);
                        actions.update_unixtime(getIdValue('unixtime_value'));
                    }
                }/>⇔
                <input type="text" id="unixtime2date_value" style="padding: 10px;width:160px" placeholder="date(2020-08-06 10:11:10)" onkeyup={
                    e => {
                        let unix2date = icx_utils.date2unixtime(e.target.value || '');
                        // document.getElementById('unixtime_ms_value').value = unix2date * 1000;
                        // document.getElementById('unixtime_value').value = unix2date ;
                        putIdValue('unixtime_ms_value',unix2date * 1000);
                        putIdValue('unixtime_value',unix2date);
                        actions.update_unixtime(getIdValue('unixtime_value'));
                    }
                }/>
                <br /><br />

                <b> text ⇔ base64 </b> <br/>
                <input type="text" id="base64_decode" style="padding: 10px;width:210px" placeholder="text ()" onkeyup={
                    e => {
                        putIdValue('base64_encode', icx_utils.base64encode(e.target.value || ''));
                    }
                } onchange={
                    e => {
                        icx_utils.logging_msg("text -> base64", getIdValue("base64_decode") + " -> " + getIdValue("base64_encode"));
                        actions.gen_table({[getIdValue("base64_decode")]: getIdValue("base64_encode")},"text->base64");
                    }
                }
                />⇔
                <input type="text" id="base64_encode" style="padding: 10px;width:210px" placeholder="hex (0x)" onkeyup={
                    e => {
                        putIdValue('base64_decode', icx_utils.base64decode(e.target.value || ''));
                    }
                } onchange={
                    e => {
                        icx_utils.logging_msg("base64 -> text", getIdValue("base64_decode") + " -> " + getIdValue("base64_encode"));
                        actions.gen_table({[getIdValue("base64_encode")]: getIdValue("base64_decode")}, "base64->text");
                    }
                }

                />
                <br/><br/>
            </div>
          )} />
          <Route path="/keys" render={() => () => (
            <div>
              <h4>Key Tools</h4>
                <input type="text" id="key_password" style="padding: 10px;width:210px" placeholder="password"/>
                <Button onclick={actions.generateKey}>Generate</Button>
              <br /><br /><br /><br />
            </div>
          )} />
        </div>
        <div id="result_layer">
            <div id="result">
            </div>
        </div>
      </Column>
    </Wrapper>
    <SettingPage id="setting">
        <select onchange={e=>{ changed_setting(e) }}  id="network">{
            Object.keys(state.network_info).map((v, i) =>
                state.last_network === v ? (<option value={v} selected>{v}</option>)
                    : (<option value={v} >{v}</option>)
            )

        }</select>
        <div id="setting" >
        </div>
        <div id="setting_result" style="padding-top:-10px;overflow-x: scroll; height:140px" ></div>
    </SettingPage>

    <Logging id="logging">{state.logging.concat(state.errors)
      .map((v, i) => (<div style="border: 1px solid #ededed; padding:8px" innerHTML={v}> </div>))}</Logging>

    <Console placeholder="" onkeyup={e => {
      if (e.keyCode === 13) {
        e.preventDefault();
        actions.console(e.target.value);
      }
    }}></Console>
</div>
);

const Routes = () => (
    <Switch>
        <Route path="/" render={Code} />
        <Route path="/units" render={Code} />
        <Route path="/qrcode" render={Code} />
        <Route path="/api" render={Code} />
        <Route path="/keys" render={Code} />
        <Route path="/img" render={ () => {}} />
        <Route render={NotFound} />
    </Switch>
);

// main app
icx_utils.set_network().then(function(data) {
    state.network_info = data;
    const main = app(
        state,
        actions,
        Routes,
        document.body,
    );
    const unsubscribe = location.subscribe(main.location);

});

function changed_setting(e=null){
    console.log("Changed settings");
    if (e) {
        window.localStorage.setItem("last_network", e.target.value);
    }
    generate_table("setting_table","setting_result", icx_utils.flatten(icx_utils.get_last_setting()));
}


function generate_table(element,output, data, caption=null){
    let table = window.document.getElementById(element);
    let is_made = false;
    let table_raw = "";
    try {
        table = icx_utils.makeElement(document, "table", "result_table", element)
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            table_raw += "<tr><td class='table_key'>" + key + "</td><td>" + value + "</td></tr>";
        })
        if (caption) {
            table.innerHTML = "<caption>" + caption + "</caption>";
        }
        table.innerHTML += table_raw;
        if (document.getElementById(output)) {
            document.getElementById(output).appendChild(table);
        }
        // }
    }catch (e){
        console.log(e);
    }
}

function getId(elementId){
    return document.getElementById(elementId);
}

function getIdValue(elementId){
    return getId(elementId).value;
}

function putIdValue(elementId, new_value){
    getId(elementId).value = new_value;
}

function remove_element(element) {
    let element_dst = window.document.getElementById(element);
    console.log("[TRY] remove to "+ element);
    if (element_dst) {
        element_dst.remove();
        console.log("[OK] remove to "+ element);
    }
}

function content_remove_element(element){
    let element_dst = window.document.getElementById(element);
    if (element_dst) {
        window.document.getElementById(element).innerHTML = ""
    }
}

function waitForDomReady() {
    if (!document.getElementById("setting")) {
        window.requestAnimationFrame(waitForDomReady);
    }else {
        changed_setting();
    }
};

waitForDomReady()
