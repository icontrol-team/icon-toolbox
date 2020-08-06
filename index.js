import regeneratorRuntime from "regenerator-runtime";
import { h, app, vdom } from "hyperapp";
import { Link, Route, location, Switch } from "@hyperapp/router";
const icx_utils = require("./lib/icx-utils");
import IconService, { IconAmount, IconWallet, IconConverter, HttpProvider, IconBuilder } from 'icon-sdk-js';
import styled from 'hyperapp-styled-components';
import {
    getId,
    getIdValue,
    putIdValue,
    create_payload,
    logging_msg,
    localMemory,
    set_localMemory,
    generate_table,
    content_remove_element,
    makeElement,
    getStorageValue, nowdate,
} from "./lib/icx-utils";
import {serialize} from "icon-sdk-js/lib/data/Util";

const route = (pathname, e=null) => {
    window.scrollTo(0, 0);
    history.pushState(null, "", pathname);
    content_remove_element("result");
};

const state = {
    // init: false,
    keystore_info: [],
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
    payload:{},
    errors: [],
};


class iconTemplateMethod {
    constructor() {
        try {

            this.key_address = getKeystore2().address

        }catch(e) {
            this.key_address = "null";
            console.log(e)
        }

        this.template =  {
            "IISS": {
                "getIISSInfo": create_payload("getIISSInfo", {}, "icx_call") ,
                "getStake": create_payload("getStake", {address: this.key_address}, "icx_call"),
                "getDelegation": create_payload("getDelegation", {address: this.key_address}, "icx_call"),
                "queryIScore": create_payload("queryIScore", {address: this.key_address}, "icx_call"),
                "claimIScore": create_payload("icx_sendTransaction", {method: "claimIScore"}, "governance_send"),
                "setGovernanceVariables": create_payload("icx_sendTransaction", {method: "setGovernanceVariables", params:{ireps:""}}, "governance_send"),

                "registerPRep": create_payload("icx_sendTransaction",
                    {
                        method: "registerPRep",
                        params: {
                            name: "ABC Node",
                            country: "KOR",
                            city: "Seoul",
                            email: "abc@example.com",
                            website: "https://abc.example.com/",
                            details: "https://abc.example.com/details/",
                            p2pEndpoint: "abc.example.com:7100"
                        }
                    },
                    "gov", "0x6c6b935b8bbd400000"
                ),
                "unregisterPRep": create_payload("icx_sendTransaction", {method: "unregisterPRep"}, "governance_send"),
                "setPRep": create_payload("icx_sendTransaction",
                    {
                        method: "setPRep",
                        params: {
                            name: "Banana Node",
                            email: "banana@email.com",
                            country: "KOR",
                            city: "Seoul",
                            website: "https://abc.example.com/",
                            details: "https://abc.example.com/details/",
                            p2pEndpoint: "new p2pEndpoint",
                        }
                    },
                    "gov"),

            },
            "Main API": {
                "icx_getTotalSupply": create_payload("icx_getTotalSupply"),
                "icx_getLastBlock": create_payload("icx_getLastBlock"),
                "icx_getBalance": create_payload("icx_getBalance", {address: this.key_address}),
                "icx_getTransactionResult": create_payload("icx_getTransactionResult", {txHash: ""}),
                "icx_getTransactionByHash": create_payload("icx_getTransactionByHash", {txHash: ""}),
                "icx_getBlockByHeight": create_payload("icx_getBlockByHeight", {height: ""}),
                "icx_getScoreApi": create_payload("icx_getScoreApi", {address: ""}),
                "icx_call": create_payload("icx_call", {from:"", to:"", dataType: "call", data:{}}),
                // "icx_sendTransaction": create_payload("icx_sendTransaction", {from:"", to:"",stepLimit:"", data:{}}),
                "icx_sendTransaction": create_payload("icx_sendTransaction", {from:"", to:"",stepLimit:"", value: ""}),
            },
            "DEBUG": {
                "getStepCosts": create_payload("getStepCosts", {}, "governance_call") ,
                "getMaxStepLimit": create_payload("getMaxStepLimit", {contextType: "invoke"}, "governance_call") ,
                "getStepPrice": create_payload("getStepPrice", {}, "governance_call") ,
                "debug_estimateStep": create_payload("debug_estimateStep",
                    {
                        from:"hxbe258ceb872e08851f1f59694dac2558708ece11",
                        to:"hx5bfdb090f43a808005ffc27c25b213145e80b7cd",
                        value: "0xde0b6b3a7640000",
                        timestamp: "0x563a6cf330136",
                        nid: "0x3",
                        nonce: "0x1",
                        version: "0x3"

                    }
                ),
            }
        };
    }
    get(method_name) {
        if (method_name) {
            for (let group in this.template) {
                for (let method in this.template[group]) {
                    if (method_name === method) {
                        return this.template[group][method]
                    }
                }
            }
        }else {
            return this.template;
        }
    }
    get_group(group_name) {
        return this.template[group_name];
    }
}



var editor_obj;

// console.log(icon_methods_template);

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
            putIdValue('address', icx_utils.random_wallet());
            putIdValue('amount', icx_utils.getRandomInt(1,10));
        }
        let qrcode_url = icx_utils.reload_qrcode();
        actions.logging("address: "+ document.getElementById("address").value + " / amount:"+ document.getElementById("amount").value);
        actions.logging(qrcode_url);
        const elm = document.getElementById('logging');
        setTimeout(e => {(elm.scrollTop = elm.scrollHeight)}, 50);
    },
    test: ({a, b})=>(state, actions)=>{
        console.log(a, b);
        console.log(actions);
    },
    gen_table: ({data, caption=null})  => (state, actions) =>{
        content_remove_element("result");
        generate_table("table","result", data, {caption: caption});
    },
    save_keystore: (data, caption=null) => (state, actions) =>{
        let value = icx_utils.save_keystore();

        if (value && value.is_find === false) {
            const option  = makeElement(document,"option", "", "");
            option.value = value.address;
            option.text = value.key_alias;
            const small_text = makeElement(document, "small","","",option);
            small_text.style = "font-style: italic";
            small_text.innerHTML = value.address;
            getId("keystore_sel").appendChild(option);
          }
    },
    sign: () => (state, actions) => {

        let json_rpc = editor_obj.get();
        delete json_rpc.params.signature;
        json_rpc.params.nid = json_rpc.params.nid || getNetwork().nid;
        json_rpc.params.from = getKeystore().address;
        json_rpc.params.to = json_rpc.params.to || "hx32b5704b766c535c34291c0d10ddd5bbd7b6b9fb";
        json_rpc.params.nonce = json_rpc.params.nonce || icx_utils.getRandomHex();
        json_rpc.params.stepLimit = json_rpc.params.stepLimit || "0xf4240";
        json_rpc.params.version = json_rpc.params.version || "0x3";
        json_rpc.params.timestamp = icx_utils.nowUnixtimeHex();
        json_rpc.params.value = json_rpc.params.value || "0x38d7ea4c68000";
        let wallet = IconWallet.loadPrivateKey(getKeystore().pk);

        if (json_rpc.params.dataType === "message") {
            json_rpc.params.data = icx_utils.StringtoHex(json_rpc.params.data);
        }
        // logging_msg(wallet);
        // let signature = wallet.sign(serialize(editor_obj.get()));
        let signature = wallet.sign(serialize(json_rpc.params));
        logging_msg("signature", signature);
        json_rpc.params.signature = signature;
        console.log(json_rpc);
        editor_obj.set(json_rpc);
        logging_msg("signing", json_rpc.params);
    },
    call_api_payload: () => (state, actions) => {
        try {
            let payload = editor_obj.get();
            // let iconTemplateMethod_data = new iconTemplateMethod();
            // console.log("iconTemplateMethod", iconTemplateMethod_data.get(getIdValue('methods')));
            icx_utils.call_api_payload(payload, true).then(function (data) {
                icx_utils.logging_msg(getIdValue("methods") + " = ", JSON.stringify(data, undefined, 4));
                    let result = icx_utils.flatten(data.result);
                    if (result.result) {
                        putIdValue("txhash",result.result );
                        actions.change({ inputA: String(result.result || '').trim() });
                    }

                    switch (getIdValue("methods")) {
                        case "getIISSInfo":
                            let left_block_time = state.timestamp + (data.result.nextPRepTerm - data.result.blockHeight) * 2;
                            let left_block = data.result.nextPRepTerm - data.result.blockHeight;

                            if (left_block.toString().match(/-/) ){
                                left_block_time = state.timestamp + (data.result.nextCalculation - data.result.blockHeight) * 2;
                                left_block = data.result.nextCalculation - data.result.blockHeight;
                            }
                            result['nextTermDate'] = icx_utils.unixtime2date(left_block_time)
                            result['leftBlock']= icx_utils.hex_to_int(left_block, true, false)
                            break;
                        case "icx_getTotalSupply":
                            result["totalSupply"] = icx_utils.hex_to_int(result.result, true, true)
                            break;
                        case "icx_getBalance":
                            result["Balance"] = icx_utils.hex_to_int(result.result, true, true)
                            break;

                        default:
                            break;
                    }
                actions.gen_table(
                    {
                        data: result,
                        caption: getIdValue("methods") + "<small style='color:gray'> " + nowdate() + "</small>"
                    }
                );
            });

        } catch (error) { actions.error(error); }
    },

    getIISSinfo: () => (state, actions) => {
        try {
            actions.logging('getIISSinfo');
            icx_utils.call_api("getIISSInfo", true).then(function(data) {
                icx_utils.logging_msg("getIISSinfo = ",JSON.stringify(data,undefined,4) );
                let left_block = state.timestamp + (data.result.nextPRepTerm - data.result.blockHeight)*2 ;
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
    // icx_getBalance: () => (state, actions) => {
    //     try {
    //         actions.logging('icx_getBalance');
    //         icx_utils.call_api("icx_getBalance", false, {address:(state.inputA || '').trim() }).then(function(data) {
    //             actions.logging(JSON.stringify(data));
    //             actions.gen_table(icx_utils.flatten(data.result));
    //         });
    //
    //     } catch (error) {
    //         actions.error(error);
    //     }
    // },
    // icx_getLastBlock: () => (state, actions) => {
    //     try {
    //         actions.logging('icx_getLastBlock');
    //         icx_utils.call_api("icx_getLastBlock", false).then(function(data) {
    //             actions.logging(JSON.stringify(data));
    //             actions.gen_table(icx_utils.flatten(data.result));
    //         });
    //
    //     } catch (error) {
    //         actions.error(error);
    //     }
    // },
    icx_getTransactionResult: () => (state, actions) => {
        try {
            icx_utils.call_api("icx_getTransactionResult", false, {txHash:(state.inputA || '').trim() }).then(function(data) {
                icx_utils.logging_msg('icx_getTransactionResult ->'+ state.inputA, data);
                actions.gen_table(
                    {
                        data: icx_utils.flatten(data.result),
                        caption: "Transcation Result" + "<small style='color:gray'> " + nowdate() + "</small>"
                    }
                )

            });

        } catch (error) { actions.error(error); }
    },
    // icx_getTransactionByHash: () => (state, actions) => {
    //     try {
    //         actions.logging('icx_getTransactionByHash');
    //         icx_utils.call_api("icx_getTransactionByHash", false, {txHash:(state.inputA || '').trim() }).then(function(data) {
    //             icx_utils.logging_msg('icx_getTransactionResult', data);
    //             actions.gen_table(icx_utils.flatten(data.result));
    //         });
    //
    //     } catch (error) { actions.error(error); }
    // },
    // icx_getBlockByHeight: () => (state, actions) => {
    //     try {
    //         actions.logging('icx_getBlockByHeight');
    //         icx_utils.call_api("icx_getBlockByHeight", false, {height:( icx_utils.int_to_hex(state.inputA || '', false).trim()) }).then(function(data) {
    //             icx_utils.logging_msg('icx_getBlockByHeight', data);
    //             actions.gen_table(icx_utils.flatten(data.result));
    //         });
    //
    //     } catch (error) { actions.error(error); }
    // },
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
    generateprivateKey: () => (state, actions) => {
        try {
            let private_key = getIdValue("private_key");
            let wallet = IconWallet.loadPrivateKey(private_key);
            icx_utils.logging_msg("IconWallet.create()" , "addrerss: " +wallet.getAddress()  + "\nPrivateKey: " + wallet.getPrivateKey());
            let password = getIdValue("key_password");
            let keystore = wallet.store(password);
            icx_utils.logging_msg("Generate KeyStore json: password - "+password, keystore);
            actions.gen_table(icx_utils.flatten(keystore));
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
            try {
                logging_msg(val, eval(val.toString()));
            }catch(e){
                logging_msg(val, `${eval(val)}`);
            }
        } catch (error) { actions.error(error); }
    },
    eval: () => (state, actions) => {
        try {
            // actions.logging(`eval("${state.inputB || ''}") => ${eval(state.inputB || '')}`);
            logging_msg(`eval("${state.inputB || ''}")`, `${eval(state.inputB || '')}`);

        } catch (error) { actions.error(error); }
    },
    error: val => (state, actions) => {
        logging_msg("catch error ", JSON.stringify(val) + JSON.stringify(actions));
        // remove_element("table");
        actions.logging(String(val.message));
    },
    update_unixtime: ({e=null, val=null}) => (state, actions) =>{
        logging_msg(val,e);
        let result = {};
        if (e===null) {
            putIdValue('unixtime_value', val);
            putIdValue('unixtime_ms_value', val * 1000);
            putIdValue('unixtime2date_value', icx_utils.unixtime2date(val));
        }

        result['UnixtimeStamp']  = getIdValue('unixtime_value');
        result['UnixtimeStamp(ms)']  = getIdValue('unixtime_ms_value');
        result['date UTC']  = icx_utils.unixtime2date(getIdValue("unixtime_value") || '',false,true);
        result['date '+icx_utils.getTimeZone()]  = icx_utils.unixtime2date(getIdValue("unixtime_value") || '',false,false);
        logging_msg(val, result)
        actions.gen_table({data: icx_utils.flatten(result)});
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
  max-height:99%;
  position: fixed;
  top: 240px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  margin-top: 10px;
  width: 100%;
  height: 70px;
  font-family: Arial
`;

const Button = styled.button` 
/*  margin-top: 10px;
  margin-right: 10px; */
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
  
  &:disabled {
      background: #dddddd;
    color: #aaaaaa;
  }
  &:hover:not([disabled]){
    background:linear-gradient(to bottom, #e9e9e9 5%, #f9f9f9 100%);
    background-color:#e9e9e9;
  }
  &:active:not([disabled]){
    position:relative;
    top:1px;
  }
  &:focus:not([disabled]){
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
  top: 110px;
  right: 0px;
  overflow: scroll;
  overflow-x: hidden;
  font-size: 13px;
  font-famliy: "Spoqa Han Sans";
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

const SettingPage = styled.fieldset`
  border: 1px solid #ccc;
  width: 45%;
  margin: 0px 10px;
  font-family: Aria;
  position: absolute;
  word-wrap: break-word;
  padding: 0px 10px 10px 10px;  
  top: 0px;
  right: 0px;
  overflow: scroll;
  overflow-x: hidden;
  font-size: 13px;
`;

const Setting = styled.fieldset`
  border: 1px solid #ccc;
  margin: 0px 10px;
  font-family: Aria;
  word-wrap: break-word;
  padding: 0px 10px 10px 10px;
  margin-top: 10px; 
  top: 0px;
  right: 0px;
  overflow: scroll;
  overflow-x: hidden;
  font-size: 13px;  
`;



const GroupField = styled.fieldset`
  border: 1px solid #ccc; 
  margin: 10px 10px;  
  word-wrap: break-word;
  padding: 15px 10px 10px 10px;  
  top: 0px;
  right: 0px;  
  font-size: 13px;  
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
`;

const InputBox =  styled.input`
    border: 1px solid #ccc;
    margin: 5px;
    padding: 5px;    
    width: 200px;
`


const Title = styled.span`
    /* border-bottom: 2px solid rgb(237, 237, 237); padding: 7px;*/
    /* margin-left: 10px; */
    color:#707070;
    font-size: 14px;
    font-weight: 500;
    margin-right: 5px;
`


const Navigation = styled.ul`
`

const page_in = function(state){
    console.log("page_in() : " + state.location.pathname);

    if (getId('jsoneditor')) {
       if (state.location.pathname === "/qrcode") {
           getId("jsoneditor_layer").style.display="none";
       }else{
           getId("jsoneditor_layer").style.display="block";
       }
    }
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
    <Column style="width:45%">
    {/*<h1>ICON-ToolBox</h1>*/}
    {/*<small style="margin-top: -15px"> powered by  <a href="http://icontrol.id" target="_blank">ICONTROL</a></small>*/}
        <Column id="cssmenu">
            <Navigation >
                {navi_element("/units", "Units", state.location.pathname)}
                {navi_element("/qrcode", "QRcode", state.location.pathname)}
                {navi_element("/api", "API", state.location.pathname)}
                {navi_element("/keys", "Keys", state.location.pathname)}
            </Navigation>
        </Column>

        <Setting id="setting" >
            <legend> Settings</legend>
            <Title> network: </Title>
            <select style="width:160px" class="tight" onchange={e => {
                changed_setting(e)
            }} id="network">{
                Object.keys(state.network_info).map((v, i) =>
                    state.last_network === v ? (<option value={v} selected>{v}</option>)
                        : (<option value={v}> {v}</option>)
                )
            }</select>
            <select style="width:140px" class="tight" onchange={e => {
                getKeystore(e)
            }} id="keystore_sel">{
                Object.keys(state.keystore_info).map((v, i) =>
                    (<option value={v}>{v} &nbsp;<small style="font-style: italic;"> {state.keystore_info[v].address}</small></option>)
                )
            }</select>
            <div id="setting" >
            </div>
            <div id="setting_result" style="overflow-x: scroll; height:90px"> </div>
        </Setting>
    </Column>
    <Wrapper>
        <Column style="display: flex; flex-direction: column; width: 100%;overflow:auto;">

        <div>
            <Route path="/" render={() => () => (
            <div>
                {route("/units")}
            </div>
            )} />

            <Route path="/qrcode" render={() => () => (
                <div>
                    <h4>Generate QRcode</h4>
                    <div style="position: relative;">
                        <Title> Address : </Title><InputBox type="text" id="address" style="width: 320px" placeholder="icon wallet address (hx)" /> <br/>
                        <Title> Amount : </Title><InputBox type="text" id="amount" style="" placeholder="integer or float (icx)" />
                        <Button onclick={() => actions.gen_qrcode()}>Generate</Button>
                        <Button onclick={() => actions.gen_qrcode(true)}>Random Generate</Button>
                    </div>
                    <br />
                    <canvas id="canvas" />
                    <img id="image"/>
                </div>
            )} />
            <Route path="/api" render={() => () => (
                <div>
                    <h4>API testing tool</h4>
                    {/*<div style="position: relative;">*/}
                    {/*    <TextArea oninput={e => actions.change({ inputA: String(e.target.value || '').trim() })} placeholder="input string or hex data"></TextArea>*/}
                    {/*    <div class="cal_size">{trimHexPrefix(state.inputA || '').length / 2} bytes</div>*/}
                    {/*</div>*/}
                    {/*<Button onclick={actions.getIISSinfo}>getIISSinfo</Button>*/}
                    {/*<Button onclick={actions.icx_getTotalSupply}>icx_getTotalSupply</Button>*/}
                    {/*<Button onclick={actions.icx_getLastBlock}>icx_getLastBlock</Button>*/}
                    {/*<Button onclick={actions.icx_getBalance}>icx_getBalance</Button>*/}
                    {/*<Button onclick={actions.icx_getTransactionResult}>icx_getTransactionResult</Button>*/}
                    {/*<Button onclick={actions.icx_getTransactionByHash}>icx_getTransactionByHash</Button>*/}
                    {/*<Button onclick={actions.icx_getBlockByHeight}>icx_getBlockByHeight</Button>*/}
                </div>
            )} />
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
                        let changed_date = icx_utils.unixtime2date(e.target.value || '');
                        putIdValue('unixtime_ms_value', e.target.value * 1000);
                        putIdValue('unixtime2date_value', changed_date);
                        actions.update_unixtime({e:e, val:changed_date});
                    }
                }
                />⇔
                <InputBox type="text" id="unixtime_ms_value"  style="width:120px" placeholder="Unixtime(ms)" onkeyup={
                    e => {
                        let changed_date = icx_utils.unixtime2date(e.target.value || '', true);
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
                        let unix2date = icx_utils.date2unixtime(e.target.value || '');
                        putIdValue('unixtime_ms_value',unix2date * 1000);
                        putIdValue('unixtime_value',unix2date);
                        actions.update_unixtime({e:e, val: getIdValue('unixtime_value')});
                    }
                }/>
                <br /><br />

                <Title> Text ⇔ base64 </Title> <br/>
                <InputBox type="text" id="base64_decode" placeholder="text ()" onkeyup={
                    e => {
                        putIdValue('base64_encode', icx_utils.base64encode(e.target.value || ''));
                    }
                } onchange={
                    e => {
                        icx_utils.logging_msg("text -> base64", getIdValue("base64_decode") + " -> " + getIdValue("base64_encode"));
                        actions.gen_table( {data: {[getIdValue("base64_decode")]: getIdValue("base64_encode")},caption:"text->base64"});
                    }
                }
                />⇔
                <InputBox type="text" id="base64_encode"  placeholder="hex (0x)" onkeyup={
                    e => {
                        putIdValue('base64_decode', icx_utils.base64decode(e.target.value || ''));
                    }
                } onchange={
                    e => {
                        icx_utils.logging_msg("base64 -> text", getIdValue("base64_decode") + " -> " + getIdValue("base64_encode"));
                        actions.gen_table({ data: {[getIdValue("base64_encode")]: getIdValue("base64_decode")}, caption: "base64->text"});
                    }
                }

                />
                <br/><br/>
            </div>
          )} />
          <Route path="/keys" render={() => () => (
            <div>
              <h4>Key Tools</h4>
            </div>
          )} />

            {/*<Route path="/simple_sender" render={() => () => (*/}
            {/*    <div>*/}
            {/*        <h4>Simple sender</h4>*/}
            {/*        <InputBox type="text" style="width:96%" id="simple_sender_address"  placeholder="To Address" onkeyup={*/}
            {/*            e => {*/}

            {/*            }*/}
            {/*        }*/}
            {/*        />*/}

            {/*        <InputBox type="text" style="width:96%" id="simple_sender_amount"  placeholder="Amount" onkeyup={*/}
            {/*            e => {*/}

            {/*            }*/}
            {/*        }*/}
            {/*        />*/}

            {/*        <Button style="" onclick={simple_sender}>send icx</Button>*/}
            {/*    </div>*/}
            {/*)} />*/}

        </div>

            <div style={state.location.pathname === "/keys" ? "display:block" : "display:none"}>
                <ul id="keystore_layer" className="collapse-list" >
                    <li>
                        <input className="collapse-open" type="checkbox" id="collapse-1"/>
                        <label className="collapse-btn" htmlFor="collapse-1">Management Keystore</label>

                        <div class="collapse-painel">
                            <br/>
                            <GroupField>
                                <legend>If you want to import a keystore file </legend>
                                <form action="" class="dropzone" method="post" encType="multipart/form-data" id="dragUpload">
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
                                    <input className="password" type="text" id="private_key" style="width:210px; " placeholder="Private Key"/>
                                    <Button style="" onclick={actions.import_privateKey}>Generate by PK</Button>
                                </div>

                                <legend>If you want to generate by password</legend>
                                <div class='flex-box'>
                                    <input class="password" type="text" id="key_password" style="width:210px; " placeholder="password"/>
                                    <Button style="" onclick={actions.generateKey}>Generate by password</Button>
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
            <div id="jsoneditor_layer" style="position: relative" class="jsoneditor_class">
                <div class="flex-box">
                    <div style="width:250px;">
                        <select onchange={e => { changed_setting() }} id="methods">{
                                // Object.keys(icon_methods_template).map((group, ii) =>(
                                Object.keys(new iconTemplateMethod().get()).map((group, ii) =>(
                                        <optgroup label={group}>{
                                            // Object.keys(icon_methods_template[group]).map((v, ii) =>
                                            Object.keys(new iconTemplateMethod().get_group(group)).map((v, ii) =>
                                                (<option value={v}>{v}</option>)
                                            )
                                        }</optgroup>
                                    )
                                )
                        }</select>
                    </div>
                        <Button style='height:30px;margin: 10px 0px 0px 0px ' onclick={() => actions.sign()} id="sign_btn">sign</Button>
                        <Button style='height:30px;margin: 10px 0px 0px 0px ' onclick={() => actions.call_api_payload()}>call_api</Button>
                    
                </div>
                <div id="jsoneditor" style="width: 100%; height:400px">
                </div>
            </div>
            <div id="result_layer">
                <div id="result">
                </div>
                <div style="position: relative;">
                    <InputBox style="font-size:9px;width:97%; margin:10px 0px 0px 0px" id="txhash" oninput={e => actions.change({ inputA: String(e.target.value || '').trim() })} placeholder="input TxHash"></InputBox>
                </div>
                <Button style='height:30px;margin: 10px 0px 0px 0px ' onclick={() => actions.icx_getTransactionResult()}>getTXResult</Button>

            </div>
        </div>

      </Column>
    </Wrapper>
    <SettingPage id="setting">
        <legend> Logging</legend>
        <h1>ICON-ToolBox</h1>
        <small style="margin-top: -15px"> powered by  <a href="http://icontrol.id" target="_blank">ICONTROL</a></small>
            {/*<legend> Settings </legend>*/}
            {/*<Title> network: </Title>*/}
            {/*<select style="width:160px" class="tight" onchange={e=>{ changed_setting(e) }}  id="network">{*/}
            {/*    Object.keys(state.network_info).map((v, i) =>*/}
            {/*        state.last_network === v ? (<option value={v} selected>{v}</option>)*/}
            {/*            : (<option value={v}> {v}</option>)*/}
            {/*    )*/}
            {/*}</select>*/}
            {/*<select style="width:140px" className="tight" onChange={e => { changed_setting(e) }} id="keystore_sel">{*/}
            {/*    Object.keys(state.keystore_info).map((v, i) =>*/}
            {/*        (<option value={v}>{v} &nbsp;<small style="font-style: italic;"> {state.keystore_info[v].address}</small></option>)*/}
            {/*    )*/}
            {/*}</select>*/}

            {/* <div id="setting" >*/}
            {/*</div>*/}

            {/*<div id="setting_result" style="overflow-x: scroll; height:140px"> </div>*/}

    </SettingPage>

    <Logging id="logging">{state.logging.concat(state.errors)
      .map((v, i) => (<div style="border: 1px solid #ededed; padding:8px" innerHTML={v}> </div>))}
    {/*<legend>Logging</legend>*/}
    </Logging>

    <Console placeholder="" onkeyup={e => {
      if (e.keyCode === 13) {
        e.preventDefault();
        actions.console(e.target.value);
      }
    }}> </Console>
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
// const main = app(
//     state,
//     actions,
//     Routes,
//     document.body,
// );
// const unsubscribe = location.subscribe(main.location);


icx_utils.set_network().then(function(data) {
    state.network_info  = data;
    state.keystore_info = icx_utils.getStorageValue("keystore", "key_alias");
    const main = app(
        state,
        actions,
        Routes,
        document.body,
    );
    console.log(main);
    const unsubscribe = location.subscribe(main.location);
});

function changed_setting(e=null){
    console.log("Changed settings");
    if (e) {
        window.localStorage.setItem("last_network", e.target.value);
    }
    content_remove_element("setting_result");
    generate_table("setting_table",
                    "setting_result",

                    icx_utils.flatten( icx_utils.get_last_setting() ),
                    {
                            editable: true,
                            default_data: {"network_name":getIdValue('network'), "api_endpoint":"", "nid":""},
                            editable_event: onchange_setting,
                            disable_keys: ["network_name"]
                        }
                    );

    if (getIdValue('network') === "mainnet") {
        document.getElementById("setting").style.backgroundColor = "#fff6f5"
    }else{
        document.getElementById("setting").style.backgroundColor = ""
    }

    if (getId('dragUpload')) {
        icx_utils.get_dropzone("dragUpload");
    }

    if (getId("jsoneditor")) {
        getId('jsoneditor').innerHTML = "";
        editor_obj = icx_utils.gen_jsoneditor();
        let template_method = new iconTemplateMethod().get(getIdValue("methods"));
        let template_method_value = "";
        if ( template_method.payload ) {
            template_method_value = template_method.payload;
        }else{
            template_method_value = template_method;
        }
        editor_obj.set(template_method_value);
        icx_utils.gen_selectbox("methods");
        icx_utils.gen_selectbox("network",{
            searchText: "No result - Add it",
            addable: function (value) {
                if (value === 'bad') {return false}
                return value // Optional - value alteration // ex: value.toLowerCase()
                return {
                    text: value,
                    value: value.toLowerCase()
                }
            }
        });

        if (getId("methods")) {
            let avail_sign_methods = ["icx_sendTransaction", "claimIScore", "registerPRep","unregisterPRep", "setPRep", "setGovernanceVariables"];
            getId("sign_btn").disabled = !icx_utils.arrayContains(getIdValue("methods"), avail_sign_methods);
        }
        icx_utils.gen_selectbox("keystore_sel");
    }
}

function moveScrollTo(parent_element, dest_element) {
    let container = getId(parent_element);
    let rowToScrollTo = getId(dest_element);
    container.scrollTop = rowToScrollTo.offsetTop;
}

function get_template(find_method) {
    for (let group in icon_methods_template) {
        for (let method in icon_methods_template[group]) {
            if (find_method === method) {
                return icon_methods_template[group][method]
            }
        }
    }
    return create_payload("")
}

function changed_methods(){
    editor_obj.set(icon_methods_template[getIdValue("methods")])
    icx_utils.gen_selectbox("methods");
}

function onchange_setting(e){
    // let find_key_name= "network_name";
    let find_key_value = getIdValue("network");
    let exclude_change_network = ["mainnet", "bicon", "testnet", "zicon"];
    if ( exclude_change_network.includes(find_key_value) ){
        console.log("PASS excluded elements : "+ find_key_value);
    }else{
        set_localMemory({
            find_key_value: find_key_value,
            set_key: e.target.id,
            set_value: {
                network_name: getIdValue("network_name") ,
                api_endpoint: getIdValue("api_endpoint"),
                nid: getIdValue("nid")
            },
            storage_key: "network_info"
        })
    }
}

function convert_hex_form(e){
    let hex_form_ids = ["int_value", "hex_value", "hex_loop_value"];
    hex_form_ids.splice(hex_form_ids.indexOf(e.target.id),1);
    let is_float = false;
    let int_val = "null";

    if (e.target.id !== "int_value") {
        int_val = icx_utils.hex_to_float(e.target.value || '', false, true);
        console.log("int_val: " + int_val);
    }

    if ( e.target.value.toString().match(/\./g) ){
        is_float = true;
    } else if ( int_val.toString().match(/\./g) ){
        is_float = true;
    }

    for (const i in hex_form_ids){
        switch (hex_form_ids[i]) {
            case "int_value":
                if (e.target.id === "hex_loop_value") {
                    putIdValue("int_value", icx_utils.hex_to_float(e.target.value || '', false, true));
                }else{
                    putIdValue("int_value", icx_utils.hex_to_int(e.target.value || '', false, false));
                }
                break;
            case "hex_value" :
                if (is_float) {
                    putIdValue("hex_value","Invalid integer");
                }else if (e.target.id === "hex_loop_value") {
                    putIdValue("hex_value", icx_utils.int_to_hex(e.target.value / 10 ** 18  || '', false, false));
                }else{
                    putIdValue("hex_value", icx_utils.int_to_hex(e.target.value || '', false, false));
                }
                break;
            case "hex_loop_value" :
                putIdValue("hex_loop_value", icx_utils.int_to_hex(e.target.value || ''));
                break;
            default:
                break;
        }
    }
}

function getKeystore(e=undefined){
    if (getId("keystore_sel")) {
        let sel_val = getIdValue("keystore_sel");
        let selected_key;
        try{
            if (sel_val) {
                selected_key = state.keystore_info[sel_val];
                if (e) {
                    logging_msg("getKeystore() Change keystore = " + sel_val + " / " + selected_key.address, e);
                }else{
                    logging_msg("getKeystore() Change keystore = " + sel_val + " / " + selected_key.address);
                }
            }
        } catch (e) {
            logging_msg(e);
        }
        return selected_key;
    }
}

function getKeystore2(e=undefined){
    if (getId("keystore_sel")) {
        let sel_val = getIdValue("keystore_sel");
        let selected_key;
        try{
            if (sel_val) {
                selected_key = state.keystore_info[sel_val];
                if (e) {
                    logging_msg("getKeystore2() Change keystore = " + sel_val + " / " + selected_key.address, e);
                }else{
                    logging_msg("getKeystore2() Change keystore = " + sel_val + " / " + selected_key.address);
                }
            }
        } catch (e) {
            logging_msg(e);
        }
        return selected_key;
    }
}




function getNetwork(){
    if (getId("network")) {
        let sel_val = getIdValue("network");
        return state.network_info[sel_val];
    }
}

function remove_element(element) {
    let element_dst = window.document.getElementById(element);
    console.log("[TRY] remove to "+ element);
    if (element_dst) {
        element_dst.remove();
        console.log("[OK] remove to "+ element);
    }
}

function waitForDomReady() {
    if (!document.getElementById("setting")) {
        window.requestAnimationFrame(waitForDomReady);
    }else {
        changed_setting();
        // logging_msg("keystore: "+ getKeystore().address);
        if (icx_utils.getClass('jsoneditor-poweredBy')) {
            icx_utils.getClass("jsoneditor-poweredBy").item(0).remove();
        }
    }
}

function simple_sender() {
    // let json_rpc = editor_obj.get();
    let json_rpc = new iconTemplateMethod().get("icx_sendTransaction");
    if (!getIdValue("simple_sender_address")) {
        logging_msg("[ERROR] To address not found")
        return
    }

    if (!getIdValue("simple_sender_amount")) {
        logging_msg("[ERROR] value not found")
        return
    }

    delete json_rpc.params.signature;
    json_rpc.params.nid = json_rpc.params.nid || getNetwork().nid;
    json_rpc.params.from = getKeystore().address;
    json_rpc.params.to =  getIdValue("simple_sender_address")|| "";
    json_rpc.params.nonce = json_rpc.params.nonce || icx_utils.getRandomHex();
    json_rpc.params.stepLimit = json_rpc.params.stepLimit || "0xf4240";
    json_rpc.params.version = json_rpc.params.version || "0x3";
    json_rpc.params.timestamp = icx_utils.nowUnixtimeHex();
    json_rpc.params.value = getIdValue("simple_sender_amount")  || "0x38d7ea4c68000";
    let wallet = IconWallet.loadPrivateKey(getKeystore().pk);

    if (json_rpc.params.dataType === "message") {
        json_rpc.params.data = icx_utils.StringtoHex(json_rpc.params.data);
    }
    // logging_msg(wallet);
    // let signature = wallet.sign(serialize(editor_obj.get()));
    let signature = wallet.sign(serialize(json_rpc.params));
    logging_msg("signature", signature);
    json_rpc.params.signature = signature;
    logging_msg("JSON", json_rpc);
}

waitForDomReady();
