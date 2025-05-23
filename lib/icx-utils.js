import {IconWallet} from "icon-sdk-js";
import QrCodeWithLogo from "qrcode-with-logos";


import SlimSelect from 'slim-select'
import Dropzone from 'dropzone';
import {
    AUTO_FILL_SELECTED_KEY,
    AVAIL_SIGN_METHODS,
    DEFAULT_STEP_LIMIT,
    INS_ADMIN_METHODS,
    INS_SETTINGS,
    NOT_PAYABLE_METHODS,
    REWARD_SETTINGS,
    CHAIN_SCORE_ADDRESS,
    GOVERNANCE_ADDRESS,
    ADDRESS_MAPPINGS, APP_VERSION
} from "./config";

import {serialize} from "icon-sdk-js/lib/data/Util";

const axios = require('axios');
const bigInt = require("big-integer"); // BigInt dont support to safari 13+
const bigfloat = require("bigfloat.js").default;
Dropzone.autoDiscover = false;

const _ = require('lodash');

let hljs = require('highlight.js');
let initialize = {};

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
    return create_payload('')
}

function changed_methods(){
    editor_obj.set(icon_methods_template[getIdValue('methods')])
    icx_utils.gen_selectbox('methods');
}


function remove_element(element) {
    let element_dst = window.document.getElementById(element);
    console.log('[TRY] remove to '+ element);
    if (element_dst) {
        element_dst.remove();
        console.log('[OK] remove to '+ element);
    }
}


export function set_localMemory_old(options={}){
    let is_find = false;
    let memory = [];
    logging_msg("set_localMemory options->" ,options)

    if (localMemory.getItem(options.storage_key) === null) {
        localMemory.setItem(options.storage_key, "");
    }

    if (localMemory.getItem(options.storage_key).length > 0){
        memory = JSON.parse(localMemory.getItem(options.storage_key));
        Object.entries(memory).forEach(([index, value]) => {
            if (value[options.find_key_name] === options.find_key_value ) {
                if (typeof(options.set_value) === "object") {
                    value = options.set_value;
                    memory[index] = options.set_value;

                }else{
                    value[options.set_key] = options.set_value;
                }

                is_find = true;
                logging_msg("Modify localMemory (" + options.storage_key+ ")"   , value)
            }
        })
    }
    let is_write = false;

    if(is_find === false){
        let obj = {}
        if (options.append_raw) {
            obj["raw"] = options.set_value;
            obj = options.set_value;
            is_write = true;
        }
        obj[options.find_key_name] = options.find_key_value;
        logging_msg("New Store localMemory (" + options.storage_key+ ")"   , obj)
        memory.push(obj)
    }
    if (Object.keys(memory).length ) {
        localMemory.setItem(options.storage_key, JSON.stringify(memory));
    }

    return is_find;
}

// remove method for normal user
function removeProps(obj,keys){
    if(obj instanceof Array){
        obj.forEach(function(item){
            removeProps(item,keys)
        });
    }
    else if(typeof obj === 'object'){
        Object.getOwnPropertyNames(obj).forEach(function(key){
            if(keys.indexOf(key) !== -1)delete obj[key];
            else removeProps(obj[key],keys);
        });
    }
}

export function set_localMemory(options={}){
    let is_find = false;
    let memory = [];
    logging_msg("set_localMemory options->" ,options)

    if (localMemory.getItem(options.storage_key) === null) {
        localMemory.setItem(options.storage_key, "");
    }

    if (!options.find_key_name) {
        console.log("find_key_name not found")
    }
    if (localMemory.getItem(options.storage_key).length > 0){
        memory = JSON.parse(localMemory.getItem(options.storage_key));
        Object.entries(memory).forEach(([index, value]) => {
            if (value[options.find_key_name] === options.find_key_value ) {
                if (typeof(options.set_value) === "object") {
                    value = options.set_value;
                    memory[index] = options.set_value;

                }else{
                    value[options.set_key] = options.set_value;
                }
                is_find = true;
                logging_msg("Modify localMemory (" + options.storage_key+ ")"   , value)
            }
        })
    }
    let is_write = false;

    if(is_find === false){
        let obj = {}
        if (options.append_raw) {
            // obj["address"] = options.find_key_value;
            obj["raw"] = options.set_value;
            obj = options.set_value;
            is_write = true;
        }else{
            obj = options.set_value;
        }
        logging_msg("New Store localMemory (" + options.storage_key+ ")"   , obj)
        memory.push(obj)
    }
    if (Object.keys(memory).length ) {
        localMemory.setItem(options.storage_key, JSON.stringify(memory));
    }
    return is_find;
}


export function StringtoHex(str) {
    let result = '';
    for (let i=0; i<str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return "0x" + result;
}

function hexToString(hexx) {
    let hex = hexx.toString();//force conversion
    let str = '';
    for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}


export function arrayToObject(data, key) {
    let return_value = {};
    Object.entries(data).forEach(([index, value]) => {
            // console.log(value);
            console.log(value[key]);
            if (value[key]) {
                return_value[value[key]] = value;
            }
        }
    )
    return return_value;
}

export function get_localMemory(key_name, object_key=""){
    if (object_key) {
        return arrayToObject(JSON.parse(localMemory.getItem(key_name)), object_key)
    }else{
        return JSON.parse(localMemory.getItem(key_name))
    }
}


export function save_keystore() {
    for (const item of ["address", "raw", "key_alias"]) {
        if (getIdValue(item) === null || getIdValue(item) === "") {
            logging_msg("save_keystore()", item + " not found");
            return
        }
    }
    let wallet,is_find;
    let set_value = { is_find : false}
    try {
        wallet = IconWallet.loadKeystore(getIdValue("raw"), getIdValue("password")).getPrivateKey();

    } catch(e){
        logging_msg(e);
    }

    if (wallet) {
        logging_msg(wallet);
        set_value = {
            "key_alias": getIdValue("key_alias").trim(),
            "raw": JSON.parse(getIdValue("raw")),
            "address": getIdValue("address"),
            "pk": wallet
        }
        is_find = set_localMemory({
            find_key_name: "address",
            find_key_value: getIdValue("address"),
            set_key: getIdValue("key_alias").trim(),
            set_value: set_value,
            storage_key: "keystore"
        })
        set_value.is_find = is_find;
    }
    logging_msg("is_find = "+ is_find)
    return set_value
}


export function content_remove_element(element){
    let element_dst = window.document.getElementById(element);
    if (element_dst) {
        window.document.getElementById(element).innerHTML = ""
    }
}

export function get_dropzone(elementId, check=false) {
    Dropzone.autoDiscover = false;

    if ( !initialize[elementId]  ) {
        // console.log("elementId: " + elementId);
        new Dropzone("#"+elementId, {
            url: 'http://localhost:8000/upload',
            method: "post",
            autoProcessQueue: false,
            paramName: 'files',
            maxFilesize: 0.1, // MB
            uploadMultiple: true,
            // acceptedFiles: "application/json",
            dictDefaultMessage: "Drop keystore files here to localStorage <br> " +
                                "<small>(Do not upload to anywhere) </small>",
            accept: function(file, done) {
                // file.previewElement.innerHTML = "";
                content_remove_element("keystore_result");
                let reader = new FileReader();
                reader.addEventListener("loadend",
                function(event) {
                            let data = JSON.parse(event.target.result);
                            logging_msg("Append file - " +file.name, data);
                            if (data.address) {
                                generate_table("keystore_table",
                                    "keystore_result",
                                    { raw: data, address: data.address },
                                    {
                                        editable: true,
                                        default_data: { "password":"", "key_alias":"", "raw":"", "address":""},
                                        disable_keys: ["raw", "address"],
                                        reverse: true
                                    }
                                );
                            }
                                logging_msg("Correct JSON" );
                        }
                    );
                reader.readAsText(file);
            },
        });
        initialize[elementId] = true;
    }
}
export function gen_selectbox(elementId, options){
    if ( !initialize[elementId] ) {
        if (getId(elementId)) {
            new SlimSelect(
                Object.assign({}, {
                    select: '#' + elementId,
                    searchHighlight: true,
                }, options)
            )
            initialize[elementId] = true;
        }
    }
}

export function getId(elementId){
    return document.getElementById(elementId);
}

export function getClass(classname){
    return document.getElementsByClassName(classname);
}

export function getIdValue(elementId){
    if ( getId(elementId) ){
        return getId(elementId).value;
    }
    return null
}

export function putIdValue(elementId, new_value){
    getId(elementId).value = new_value;
}

const JSONEditor = require('jsoneditor')

// import { JSONEditor } from 'svelte-jsoneditor'


export function gen_jsoneditor(){
    const container = getId('jsoneditor');
    const options = {
        mode: 'code',
        modes: ['code', 'form', 'tree' ], // allowed modes
        // onChange: function (e){
        //   console.log("changed", e)
        // },
        // onChangeText: function (json) {
        //     console.log('onChangeText', json);
            // tx_sign();
        // },

        // onBlur: function(json) {
        //     console.log("onBlur")
        // },
        // onFocus: function(json){
        //     console.log("onFocus")
        // },
        // onDone: function (color) {
        //     console.log('onDone', color)
        // },
        onError: function (err) {
            alert(err.toString())
        },
        onModeChange: function (newMode, oldMode) {
            console.log('Mode switched from', oldMode, 'to', newMode)
        }
    }
    const editor = new JSONEditor(container, options)
    // const editor = new JSONEditor({target: container, props: options})

    const json =  {
        "id": 2848
    }
    editor.set(json)

    if (getClass('jsoneditor-poweredBy')) {
        getClass('jsoneditor-poweredBy').item(0).remove();
    }

    return editor;
}

export function extractError(error){
    if (error.response) {
        return {
            "status": `${error.response.status} ${error.response.statusText}`,
            "reason": error.response.data.error.message,
            "config": `${error.response.config.url}`
        }
    } else if (error.request) {
        return {
            "status": "No Response",
            "reason": `[${error.message}] The request was made but no response was received`,
            "url": error.config ? error.config.url : "Unknown URL" // 요청 URL 추가
        }
    } else {
        return {
            "status": "Request Error",
            "reason": error.message,
            "url": error.config ? error.config.url : "Unknown URL" // 요청 URL 추가
        }
    }
}

export function logging_msg(key, val=undefined){
    const elm = window.document.getElementById('logging');
    const div  = makeElement(document,"div", "logging", "log-raw");
    const date_span  = makeElement(document,"span", "logging-date", "log-raw",div);
    const key_span  = makeElement(document,"span", "data-key", "log-raw", div);
    let data_span ;
    let code_span ;

    let prettify;

    if (typeof key === "object") {
        key = JSON.stringify(key,undefined,4);
    }

    // console.log(`${key} ---   ${typeof key}, ${typeof val}, ${isJson(val)}`)
    if (key && val === undefined) {
        key_span.innerHTML = key;
    } else if (key && val && typeof val === "object") {
        val = JSON.stringify(val,undefined,4);
        data_span  = makeElement(document,"pre", "hljs", "log-raw", div);
        code_span  = makeElement(document,"code", "html", "log-raw", data_span);
        prettify = hljs.highlight("json", val).value;
        key_span.innerHTML = key;
        code_span.innerHTML = prettify;
    }else if(val && isJson(val)){
        data_span  = makeElement(document,"pre", "hljs", "log-raw", div);
        code_span  = makeElement(document,"code", "html", "log-raw", data_span);
        key_span.innerHTML = key;
        // console.log(val);
        // code_span.innerHTML = hljs.highlight("json", val).value;
        try {
            code_span.innerHTML = hljs.highlight("json", val).value;
        }catch (error){
            code_span.innerHTML = val;
        }

        // code_span.innerHTML = hljs.highlight("json", val).value;

    }else{
        key_span.innerHTML = key;
        if (val) {
            key_span.innerHTML += " : " + val;
        }
    }

    date_span.innerHTML = nowdate();

    if (elm) {
        elm.appendChild(div);
        setTimeout(e => {(elm.scrollTop = elm.scrollHeight)}, 50);
    }
}


export function pretty_number(number){
    if(number===0) return 0;
    let reg = /(^[+-]?\d+)(\d{3})/;
    let n = (number + '');
    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');
    return n;
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


export function getRandomHex(min=1,max=100) {
    return "0x" + getRandomInt(min,max).toString(16)
}

export function random_wallet(){
    let letters = "0123456789abcdef";
    let prefix = 'hx';
    let wallet = "";
    for (let i = 0; i < 40; i++)
        wallet += letters[(Math.floor(Math.random() * 16))];
    return prefix+wallet;
}

export function generate_qrcode(url) {
    let qr = new QrCodeWithLogo({
        canvas: document.getElementById("canvas"),
        content: url,
        width: 410,
        // download: true,
        image: document.getElementById("image"),
        logo: {
           src: "https://icontrol-team.github.io/icon-toolbox/img/icon.svg",
        }
    }).toCanvas().then(()=>{
        appendText_qrcode(document.getElementById("address").value+ " / " +
            document.getElementById("amount").value + " ICX",
        {x:0,y:20});
    });
    return url
}

export function appendText_qrcode(text, options={}){
    let canvas = document.getElementById("canvas")
    let ctx = canvas.getContext("2d");
    ctx.font = "13px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width/2, options.y);

}
export function reload_qrcode(){
    let address = document.getElementById("address").value;
    let amount = document.getElementById("amount").value;
    return generate_qrcode(get_parameter(amount, address));
}

export function get_parameter(amount, address) {
    amount = int_to_hex(amount);
    const inputText = '{"amount":"'+amount+'","address":"'+address+'"}';
    const base64_data = new Buffer(inputText,).toString("base64");
    const url = "iconex://pay?data=" + base64_data;
    return url
}

export function base64decode(base64text){
    return Buffer.from(base64text, 'base64').toString('utf8');
}

export function base64encode(text){
    return new Buffer(text).toString("base64");
}

export function numberWithCommas(x) {
    // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const numberFormatter = Intl.NumberFormat('en-US');
    return numberFormatter.format(x);

}

export function int_to_hex(amount, wei=true) {
    if (wei) {
        return "0x" + bigInt(amount * 10 ** 18).toString(16);
    }else{
        return "0x" + Number(amount).toString(16);
    }
}


export function float_to_hex(amount, wei=true) {
    console.log("float_to_hex");
    if (wei) {
        return "0x" + bigFloat(amount * 10 ** 18).toString(16);
    }else{
        // console.log(bigFloat(amount));
        return "0x" + bigFloat(amount).toString(16);
    }
}

export function hex_to_int(amount, commas=false, wei=true) {
    let ret;
    if(isHex(amount) === false) {
        console.log("is_string: ", amount);
        return amount;
    }
    if (wei) {
        ret = bigInteger(amount / 10 ** 18)
    }else{
        ret = bigInteger(amount)
    }
    return commas ? numberWithCommas(ret) : ret ;
}

export function hex_to_float(amount, commas=false, wei=true) {
    let ret;
    if (wei) {
        ret = bigFloat(amount / 10 ** 18)
    }else{
        ret = bigFloat(amount)
    }
    return commas ? numberWithCommas(ret) : ret ;
}

export function bigInteger(amount, commas=false){
    let ret = bigInt(parseInt(amount)).value;
    return commas ? numberWithCommas(ret) : ret;
}

export function bigFloat(val) {
    try{
        val = val.replace(/^0x/,'');
    }catch(error){

    }
    bigfloat.set_precision(-10);
    return bigfloat.string(bigfloat.BigFloat(val));
}

export function arrayContains(needle, array_stack) {
    return (array_stack.indexOf(needle) > -1);
}

export function isHex(string) {
    if (typeof string === "string") {
        try {
            string = string.replace(/^0x/, '');
        } catch (error) {
            console.log("isHex error:", error);
        }
        return /^[A-F0-9]+$/i.test(string)
    }
    return false
}


export function date2unixtime(date_string, ms=false){
    if (ms) {
        return (new Date(date_string).getTime()) * 1000;
    }
    return Math.floor(new Date(date_string).getTime() / 1000)
}

export function getTimeZone() {
    let offset = new Date().getTimezoneOffset(), o = Math.abs(offset);
    return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
}

export function unixtime2date(unix_timestamp, ms=false, change_utc=false){
    let date;
    let offset = new Date().getTimezoneOffset();

    if (change_utc) {
        unix_timestamp = parseInt(unix_timestamp) + (60*offset)
    }

    if (ms) {
        date = new Date(parseInt(unix_timestamp));
    }else if (parseInt(unix_timestamp).toString().length > 10 ) {
        date = new Date(parseInt(unix_timestamp)/1000);
    } else{
        date = new Date(parseInt(unix_timestamp) * 1000);
    }

    let month = '0' +(date.getMonth()+1);
    let day = '0' +(date.getDate());
    let year = date.getFullYear();

    let hours = "0" + date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    return  year + "-" + month.substr(-2) + "-"+ day.substr(-2) + " " +
            hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

export function makeElement(document, type, className, id, parent) {
    const el = document.createElement(type);
    // el.style.visibility = "visible";
    if (id){
        el.id = id;
    }
    if (className) {
        el.className = className;
    }
    if (parent) {
        parent.appendChild(el);
    }
    return el;
}

export function showLoading(visable) {
    let spinner_elem = window.document.getElementById("spinner");
    let is_made = false;
    if (spinner_elem === null || spinner_elem === undefined) {
        spinner_elem = makeElement(document, "div", "spinner-dual", "spinner")
        document.body.appendChild(spinner_elem);
        is_made = true;
    }
    if (visable===false) {
        spinner_elem.style.visibility="hidden";
    }else{
        if (is_made === false) {
            spinner_elem.style.visibility = "visible";
        }
    }
}

export function createPayload(data, id=2848) {

    return Object.assign({}, {
        id: id,
        jsonrpc: '2.0',
        // params: []
    }, data);

}

// export function createScorePayload(method, parent_method, score_address,  parameters){
//     let method_name = "";
//     let default_payload = {};
//     if (method === parent_method) {
//         method_name = "icx_call";
//         default_payload = Object.assign({
//             method: "icx_call",
//             dataType: "call",
//             data: {
//                 method: method,
//                 params: {}
//             }
//         });
//
//     }else{
//         method_name = "icx_sendTransaction";
//         default_payload = Object.assign({
//             method: "icx_sendTransaction",
//             dataType: "call",
//             data: {
//                 method: method,
//                 params: {}
//             }
//         });
//     }
//
//     let data = Object.assign( {}, {
//         method: method_name,
//         dataType: "call",
//         data: {
//             method: method_name
//         }
//
//     }, parameters);
//
//     return createPayload()
// }


// export function createScorePayload(method, parent_method, score_address,  parameters){
//     let method_name = "";
//     let default_params = {
//         dataType: "call"
//     };
//     let params = {}
//     if (method === parent_method) {
//         method_name = "icx_call";
//
//     }else{
//         method_name = "icx_sendTransaction";
//         default_params['data'] = {
//             method: method,
//             params: parameters // parameters 객체를 여기에 직접 할당
//         }
//     }
//
//     let data = {
//         method: method_name,
//         params: default_params
//     };
//     return createPayload(data)
// }

export function createScorePayload(method, parentMethod, scoreAddress, parameters) {
    // 기본 페이로드 구조 정의

    const payload = {
        method: method === parentMethod ? "icx_call" : "icx_sendTransaction",
        params: {
            to: scoreAddress,
            dataType: "call",
            value: parentMethod === "icx_sendTransaction" ? "0x0" : undefined,
            data: {
                method: method,
                params: parameters // 직접 할당된 parameters 객체
            }
        }
    };
    return createPayload(payload);
}

export function create_payload(method, params={} , score="",value="", id=2848, to_address="") {
    let data = {};

    switch (score){
        case "icx_call":
            data = {
                method: "icx_call",
                params: {
                    from: "hx0000000000000000000000000000000000000000",
                    to: CHAIN_SCORE_ADDRESS,
                    dataType: "call",
                    data: {
                        method: method,
                        params: params
                    }
                }
            }
            break;
        case "governance_call":
            data = {
                method: "icx_call",
                params: {
                    to: GOVERNANCE_ADDRESS,
                    dataType: "call",
                    data:{
                        method: method,
                        params: params
                    }
                }
            }
            break;
        case "governance_send":
            data = {
                method: "icx_sendTransaction",
                params: {
                    to: CHAIN_SCORE_ADDRESS,
                    dataType: "call",
                    data: params,
                    value: value
                },
            }
            break;
        default:
            data = {
                method: method,
                params: params
            }
            break;
    }
    if (to_address !== "") {
        data['params']['to'] = to_address
    }
    return  Object.assign({} , {
        id: id,
        jsonrpc:'2.0'
    }, data);

}


function getProvider(url){
    // const httpProvider = new HttpProvider(url+'/api/v3');
    return new HttpProvider(url+'/api/v3');
}


function regexInArray(string, expressions) {
    let len = expressions.length,
        i = 0;
    for (; i < len; i++) {
        if (string.match(expressions[i])) {
            return true;
        }
    }
    return false;
}

export function sleep(ms) {
    console.log("sleep : ", ms);
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function traverseAndFlatten(currentNode, target, flattenedKey) {
    for (let key in currentNode) {
        if (currentNode.hasOwnProperty(key)) {
            let newKey;
            if (flattenedKey === undefined) {
                newKey = key;
            } else {
                newKey = flattenedKey + '.' + key;
            }

            let value = currentNode[key];
            // FIXME: improvement logic

            if (typeof value === "object") {
                traverseAndFlatten(value, target, newKey);
            } else {
                try {
                    if (arrayContains(newKey, ["failure.OOB.balance", "failure.OOB.value", "failure.OOB.fee" ])) {
                        value = pretty_number(hex_to_float(value, false, true)) + "<span style='color:grey'> ( 10^18 loop, org: " + value + ")</span>";
                    } else if (arrayContains(newKey, ["result", "status_code", "api_endpoint", "failure.OOB.from" ])) {
                        // if (newKey === "result" && isHex(value) && value.match(/org/) === null) {
                        //     value = hex_to_int(value, true, false) + "<span style='color:grey'> (int org: " + value + ")</span>";
                        // }else{
                        //     target[newKey] = value;
                        // }
                        target[newKey] = value;

                    } else if (regexInArray(newKey, [/TxHash/, /network_name/, /switch_bh_versions/, /_hash/, /version/, /txHash/, /Unixtime/, /crypto/, /stateHash/, /message/])) {
                        target[newKey] = value;
                        // INT_VALUE & comma
                    } else if (arrayContains(newKey, ["blockHeight", "height", "nonce", "stepLimit", "version", "txIndex", "nextCalculation", "nextPRepTerm"])) {
                        value = hex_to_int(value, true, false) + "<span style='color:grey'> (int org: " + value + ")</span>";

                    } else if (regexInArray(newKey, [/step/i, /Height/, /variable/, /failure/])) {
                        value = hex_to_int(value, true, false) + "<span style='color:grey'> (int org: " + value + ")</span>";

                    } else if (arrayContains(newKey, ["data"])) {
                        value = hexToString(value) + "<span style='color:grey'> (org: " + value + ")</span>";
                        // } else if (arrayContains(newKey,["timestamp", "version", "status", "time_stamp"]) ) {
                    } else if (regexInArray(newKey, [/timestamp/, /time_stamp/, /_date/])) {
                        value = unixtime2date(value, false) + "<span style='color:grey'> (date org: " + value + ")</span>";
                    } else if (regexInArray(newKey, [/status/])) {
                        if (isHex(value)) {
                            value = hex_to_int(value, false, false) + "<span style='color:grey'> (org: " + value + ")</span>";
                        }else{
                            target[newKey] = value;
                        }

                        // } else if (newKey.includes("Hash") === false) {
                    } else if (arrayContains(newKey, ["Hash", "nid", "switch_bh_versions", "blockHash", "txHash"]) === false) {
                        if (isHex(value)) {
                            if (value.toString().length >= 17) {
                                value = pretty_number(hex_to_float(value, false, true)) + "<span style='color:grey'> ( 10^18 loop, org: " + value + ")</span>";
                            }else{
                                value = pretty_number(hex_to_int(value, false, false)) + "<span style='color:grey'> ( int org: " + value + ")</span>";
                            }

                        }

                    }
                } catch (e){
                    console.log(e);
                    target[newKey] = value;
                }
                target[newKey] = value;
            }
        }
    }
}

export function flatten(obj) {
    let flattenedObject = {};

    if (typeof obj !== "object") {
        if (obj === undefined){
            obj = "NULL"
        }
        obj = {
            "result" : obj
        }
    }
    traverseAndFlatten(obj, flattenedObject);
    return flattenedObject;
}

export async function call_api(method, score=false, params={}, is_logging=true) {
    let endpoint, payload;
    let status_code = 999;
    try {
        endpoint = get_last_setting()['api_endpoint'];
    }
    catch(e){
        endpoint = "https://zicon.net.solidwallet.io";
        console.log(e);
    }
    // changed_setting();

    // let payload;
    axios.interceptors.request.use(function (config) {
        showLoading(true);
        return config;
    }, function (error) {
        showLoading(false);
        return Promise.reject(error);
    });

    axios.interceptors.response.use(function (response) {
        return response;
    }, function (error, response) {
        showLoading(false);
        return Promise.reject(error);
    });

    let param_length = 0;
    try {
        param_length = Object.keys(params).length
    }catch (error){
    }

    if (param_length > 0) {
        payload = createPayload({method: method, params: params});
    }else if (score) {
        if (params.length > 0) {
            payload = createPayload(params);
        }else {
            payload = createPayload({
                method: "icx_call",
                params: {
                    from: "hx0000000000000000000000000000000000000000",
                    to: CHAIN_SCORE_ADDRESS,
                    dataType: "call",
                    data: {
                        "method": method
                    }
                }
            });
        }
    }else{
        payload = createPayload({method: method});
    }

    let endpoint_api = endpoint+"/api/v3";
    if (method === "debug_getTrace") {
        endpoint_api += "d"
    }
    debugLogger.log("endpoint_api=" , endpoint_api, ", payload = ", payload);
    let options = {
        url: endpoint_api,
        method: 'POST',
        credentials: true,
        headers: {
            // "Content-Type": "application/json",
            "Content-Type" : "application/x-www-form-urlencoded"
        },
        data: payload,
    };
    // if (is_logging) {
    //     logging_msg("call_api = ", options);
    // }

    let response, data;
    try {
        response = await axios(options);
        try {
            data = await response.data;
            status_code = response.status;
        }catch(error) {
            console.log("--------------------------------" + error);
            data = {"error": response};
        }

    } catch (error){
        logging_msg("Got error", error.response );
        logging_msg("Got error", error );
        let error_status, error_message;
        try{
            error_status = error.response.status
        }catch (e){
            error_status = undefined
        }

        try {
            error_message = error.response.data.error.message
        } catch (e){
            error_message = undefined
        }

        data = {
            "result": {
                "status_code": error_status || status_code,
                "message": error_message
            }
        }

    }
    let responseOK = response && response.status === 200;
    if (responseOK) {
        console.log("SUCCESS");
        showLoading(false);
    }else{
        console.log("FAIL");
        showLoading(false);
    }

    return data;
}

export function parse_result_readable(data_result, actions){
    let result = flatten(data_result);

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
            result['nextTermDate'] = unixtime2date(left_block_time)
            result['leftBlock']= hex_to_int(left_block, true, false)
            break;
        case "icx_getTotalSupply":
            result["totalSupply"] = hex_to_int(result.result, true, true)
            break;
        case "icx_getBalance":
            result["Balance"] = hex_to_float(result.result, true, true)
            break;

        default:
            break;
    }
    return result

}

export async function call_api_payload(payload, api_path="/api/v3", logging=true) {
    let endpoint;
    try {
        endpoint = get_last_setting()['api_endpoint'];
        if ( getIdValue("api_endpoint") !== endpoint){
            endpoint =  getIdValue("api_endpoint");
        }
    }
    catch(e){
        endpoint = "https://zicon.net.solidwallet.io";
        console.log(e);
    }

    try {
        if (payload.method.includes("node")) {
            api_path = "/api/node";
        } else if (payload.method === "debug_estimateStep" || payload.method === "debug_getAccount"|| payload.method === "debug_getTrace") {
            api_path = "/api/v3d";
        }
    } catch (e) {
        console.log(e);
    }

    let endpoint_api = endpoint+api_path;
    // let payload;

    axios.interceptors.request.use(function (config) {
        showLoading(true);
        return config;
    }, function (error) {
        showLoading(false);
        return Promise.reject(error);
    });

    axios.interceptors.response.use(function (response) {
        return response;
    }, function (error, response) {
        showLoading(false);
        return Promise.reject(error);
    });

    let options = {
        url: endpoint_api,
        method: 'POST',
        credentials: true,
        headers: {
                "Content-Type": "application/json",
                // "Content-Type" : "application/x-www-form-urlencoded"
            },
        data: payload,
    };

    if (logging) {
        // 메서드 정보 구성
        let methods = options.data && options.data.method ? options.data.method : "Unknown Method";
        const subMethod = options.data && options.data.params && options.data.params.data && options.data.params.data.method
            ? "." + options.data.params.data.method
            : "";
        methods += subMethod;

        if (get_localMemory('isDev')) {
            logging_msg("API Call Options: ", options);
        }

        // const requestDetails = `URL: ${options.url}, Method: ${options.method}, API Methods: ${methods}`;
        const requestDetails = {"URL": options.url, "Method": options.method, "API Methods": methods};
        logging_msg("API Call Details: ", requestDetails);
    }

    let response, data;
    try {
        response = await axios(options);
        try {
            data = await response.data;
        }catch(error) {
            data = {"error": response};
        }

    } catch (error){
        if (logging) {
            logging_msg("Got error", extractError(error));
            debugLogger.error("call_api_payload", error.response);
        }
        if (payload.method === "debug_estimateStep" || payload.method === "debug_getAccount"){
            if (error.response.data && error.response.data.error) {
                logging_msg("error", error.response.data.error.message);
            }
        }

        let error_status, error_message;
        if (error.response) {
            // logging_msg("Connect success ", error);

        }else if (error.request) {
            debugLogger.error("Connect error", error);
        }else{
            debugLogger.error('Error', error)
        }

        try {
            error_status = error.response.status
        } catch (e){
            error_status = 999
        }

        try {
            error_message = error.response.data.error.message
        } catch (e){
            error_message = error.message
        }

        data = {
            "result": {
                "status_code": error_status,
                "message": error_message
            }
        }

    }
    let responseOK = response && response.status === 200;
    if (responseOK) {
        // console.log("SUCCESS", JSON.parse(response.config.data));
        showLoading(false);
    }else{
        console.log("FAIL", options.data, data.result.message);
        showLoading(false);
    }

    return data;
}

export async function axios_get(url) {
    let options = {
        url: url,
        method: 'GET'
    };
    let response = ""
    try {
        response = await axios(options);
        return response.data;
    } catch (error){
        logging_msg("Got error", error);
    }
}

let localMemory_arr = {};

export const localMemory = window.localStorage || {
    setItem: (key, value) => Object.assign(localMemory_arr, { [key]: value }),
    getItem: key => localMemory_arr[key] || null,
};

export function allStorage() {
    let archive = [],
        keys = Object.keys(window.localStorage),
        i = 0, key;
    for (; key = keys[i]; i++) {
        archive.push( key + '=' + localStorage.getItem(key));
    }

    return archive;
}


export async function set_network(reset=false) {
    if (localMemory.getItem('network_info') === null || reset === true) {
        // localMemory.clear();
        localMemory.removeItem("network_info");
         await axios_get("https://networkinfo.solidwallet.io/conf/all.json").then(function (data) {
            localMemory.setItem("network_info",  JSON.stringify(data));
        }).catch(function(err){
            console.log(err);
         });
    }
    let return_data = {}
    let network_info = JSON.parse(localMemory.getItem('network_info'));
    for (let i in network_info) {
        let network_name = network_info[i]['network_name'];
         return_data[network_name] = network_info[i];
    }

    return return_data
}

export function get_network(){
    let return_data = {}
    let network_info = JSON.parse(window.localStorage.getItem('network_info'));
    for (let i in network_info) {
        let network_name = network_info[i]['network_name'];
        return_data[network_name] = network_info[i];
    }
    return return_data;
}


export function getStorageValue(storage_key="", find_key_name="", find_key_value= "" ) {
    // console.log("getStorageValue() storage_key:" + storage_key + ", find_key_name: "+ find_key_name+ ",find_key_value: "+ find_key_value );
    let return_data = {}
    let storage_info = JSON.parse(window.localStorage.getItem(storage_key));
    for (let i in storage_info) {
        let find_key = storage_info[i][find_key_name];
        if (find_key  ===  find_key_value) {
            return_data = storage_info[i];
        }else{
            if (find_key === undefined){
                find_key = find_key_name;
            }
            return_data[find_key] = storage_info[i];
        }
    }
    // console.log("return_data: ",return_data);
    return return_data;
}

export function get_last_setting() {
    let network_name = window.localStorage.getItem("last_network") ||"zicon";
    let return_data = get_network();
    return return_data[network_name];
}

export function nowdate(){
    let today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    let milliseconds = today.getMilliseconds();
    if (hours < 10) {
        hours = "0"+hours
    }
    if (minutes < 10) {
        minutes = "0"+minutes
    }
    if (seconds < 10) {
        seconds = "0"+seconds
    }
    if (milliseconds < 100) {
        milliseconds = "0"+milliseconds
    }
    return hours + ':' + minutes + ':' + seconds + '.' + milliseconds
}

export function nowUnixtimeHex(){
    return "0x" + Math.floor(new Date().getTime() * 1000).toString(16);
}
export function setDefaultParams(options, object){
    options = options || {};
    for (let prop in options)  {
        object[prop] = typeof object[prop] !== 'undefined' ? object[prop] : options[prop];
    }
    return object
}

function reverseObject(object) {
    let newObject = {};
    let keys = [];
    for (let key in object) {
        keys.push(key);
    }
    for (let i = keys.length - 1; i >= 0; i--) {
        let value = object[keys[i]];
        newObject[keys[i]]= value;
    }
    return newObject;
}


export function generate_table(element,output, data, options){
    options = options || {};
    let table = window.document.getElementById(element);
    let table_raw = "";
    let key_style = "";
    let disabled_string;
    try {
        table = makeElement(document, "table", "result_table", element)
        if (data  === undefined) {
            return
        }
        if (data.result === "NULL") {
            data = options.default_data;
        }else if (options.default_data){
            data = setDefaultParams(options.default_data, data);
        }
        if (options.reverse) {
            data = reverseObject(data);
        }
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            if (options.editable) {
                if( options.disable_keys && arrayContains(key, options.disable_keys) ){
                    disabled_string = "disabled";
                }else{
                    disabled_string = "";
                }
                let className = "input_default";
                let autocomplete = "on";
                if (key === "password") {
                    className = "password";
                    autocomplete = "off";
                }
                value = "<input type='text' class="+className+" class='gray_input' id='"+key+"' value='"+value+"' "+disabled_string+ " autocomplete=" + autocomplete + "/>";
                key_style = "width:30px";
            }
            table_raw += "<tr><td class='table_key' style='"+key_style+"'>" + key + "</td><td>" + value + "</td></tr>";
        })
        if (options.caption) {
            table.innerHTML = "<caption>" + options.caption + "</caption>";
        }
        table.innerHTML += table_raw;
        if (document.getElementById(output)) {
            document.getElementById(output).appendChild(table);
        }

        if (options.editable_event) {
            document.getElementById(output).addEventListener("change", options.editable_event)
        }
        // }
    }catch (e){
        console.log(e);
    }
}

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
}


export function printGetBalance(address){
    call_api_payload(
        createPayload({"method": "icx_getBalance", "params":{"address":address}}), "/api/v3",false)
        .then(function (data) {
            let balance = data['result'];
            logging_msg(  "  " + address + " = " + hex_to_float(balance,true) +" ICX");
        })

}

export function getKeystore(e=undefined){
    if (getId("keystore_sel")) {
        let sel_val = getIdValue("keystore_sel").trim();
        let selected_key;
        try{
            if (sel_val) {
                selected_key = state.keystore_info[sel_val];

                if (selected_key ===  undefined) {
                    state.keystore_info = getStorageValue('keystore', 'key_alias');
                    selected_key = state.keystore_info[sel_val];
                }

                if (e !== undefined) {

                    // fill_address_param();
                    auto_fill_param();
                    printGetBalance(selected_key.address);

                    // call_api_payload(
                    //     createPayload({"method": "icx_getBalance", "params":{"address":selected_key.address}}), "/api/v3",false)
                    //     .then(function (data) {
                    //         let balance = data['result'];
                    //         logging_msg("getKeystore() Change keystore ", sel_val + " / " + selected_key.address + " / " +hex_to_float(balance) +" ICX");
                    // })

                }
            }
        } catch (e) {
            logging_msg(e);
        }
        if (selected_key === undefined) {
            logging_msg("[error] KeyStore "+selected_key+", KeyStore required");
        }
        return selected_key;
    }
}

export function convert_hex_form(e){
    let hex_form_ids = ["int_value", "hex_value", "hex_loop_value"];
    hex_form_ids.splice(hex_form_ids.indexOf(e.target.id),1);
    let is_float = false;
    let int_val = "null";

    if (e.target.id !== "int_value") {
        int_val = hex_to_float(e.target.value || '', false, true);
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
                    putIdValue("int_value", hex_to_float(e.target.value || '', false, true));
                }else{
                    putIdValue("int_value", hex_to_int(e.target.value || '', false, false));
                }
                break;
            case "hex_value" :
                if (is_float) {
                    putIdValue("hex_value","Invalid integer");
                }else
                    if (e.target.id === "hex_loop_value") {
                    putIdValue("hex_value", int_to_hex(e.target.value / 10 ** 18  || '', false, false));
                }else{
                    putIdValue("hex_value", int_to_hex(e.target.value || '', false, false));
                }
                break;
            case "hex_loop_value" :
                putIdValue("hex_loop_value", int_to_hex(e.target.value || ''));
                break;
            default:
                break;
        }
    }
}


// export function fetchScoreApis() {
//     // icx_getScoreApi
//     const addresses = [CHAIN_SCORE_ADDRESS, GOVERNANCE_ADDRESS]; // 주소 배열 정의
//     // state.score_apis_raws = {};
//     console.log("**************************** fetchScoreApis()");
//     addresses.forEach(address => { // 배열의 각 주소에 대해 반복 실행
//         try {
//             call_api("icx_getScoreApi", false, {address}, false).then(
//                 function(data) {
//                     // logging_msg('icx_getScoreApi -> ' + address, data); // 로깅 메시지에 현재 주소 추가
//
//                     // // console.log(address)
//                     // console.log("status_code :" + data);
//                     // console.log("---------------------------");
//                     // console.table(data);
//
//                     if (data.result.status_code === undefined) {
//                         // console.table(data.result)
//                         state.score_apis_raws[address] = data.result;
//                         console.log(state.score_apis_raws[address]);
//                     }
//                 });
//         } catch (error) { console.error(error); }
//     });
// }

export  function fetchScoreApis() {
    const addresses = [CHAIN_SCORE_ADDRESS, GOVERNANCE_ADDRESS];
    state.score_apis_raws = {};
    const promises = addresses.map(address => {
        return call_api("icx_getScoreApi", false, {address}, false).then(data => {
            if (data.result.status_code === undefined) {
                state.score_apis_raws[address] = data.result;
            }
        }).catch(error => console.error(error));
    });

    return Promise.all(promises); // 모든 비동기 호출이 완료될 때까지 기다린다.
    // console.table(state.score_apis_raws); // 비동기 호출이 모두 완료된 후에 출력한다.
}

// export function convertScoreApiToTemplate(){
//     if (state.score_apis_raws) {
//         console.log("scoreApiToTemplate()")
//         console.log(state.score_apis_raws)
//         for (const score_address in state.score_apis_raws) {
//
//             let method_info = state.score_apis_raws[score_address];
//
//
//             Object.entries(method_info).forEach(([index, method_data]) => {
//                 // console.log(index, method_data);
//                 // console.log("address_alias => ", address_alias);
//                 generateScoreAPI(score_address, method_data)
//             });
//
//             // console.log(state.template_obj.template);
//
//
//             // for (const )
//             // if (state.score_apis_raws.hasOwnProperty(key)) {
//             //     console.log(key, object[key]);
//             // }
//         }
//     }
// }

export function convertScoreApiToTemplate() {
    if (!state.score_apis_raws) return; // Early return if no score_apis_raws
    console.log("Converting SCORE API to Template...");
    Object.entries(state.score_apis_raws).forEach(([scoreAddress, methods]) => {
        methods.forEach(methodData => {
            generateScoreAPITemplate(scoreAddress, methodData);
        });
    });
}

function updateSelectElementWithMethods() {
    console.log("updateSelectElementWithMethods()");
    const selectElement = document.getElementById('methods'); // <select> 요소 선택
    selectElement.innerHTML = ''; // 기존의 옵션들을 초기화

    const methodsData = state.template_obj.get(); // 메소드 데이터 가져오기

    Object.keys(methodsData).forEach(group => {
        const optgroup = document.createElement('optgroup'); // 새 optgroup 생성
        optgroup.label = group;

        Object.keys(state.template_obj.get_group(group)).forEach(method => {
            const option = document.createElement('option'); // 새 option 생성
            option.value = method;
            option.textContent = method;
            optgroup.appendChild(option); // optgroup에 option 추가
        });

        selectElement.appendChild(optgroup); // <select>에 optgroup 추가
    });
}

export function convertInputsToPayload(inputs) {
    return Object.values(inputs).reduce((payload, input) => {
        payload[input.name] = "";
        return payload;
    }, {});
}

export function generateScoreAPITemplate(scoreAddress, methodData) {
    // 주소에 해당하는 별칭을 가져온다. 없으면 직접 사용
    const addressAlias = ADDRESS_MAPPINGS[scoreAddress] || scoreAddress;

    // 메서드 타입이 'function'이 아니면 처리하지 않음
    if (methodData.type !== "function") return;

    // 메서드 이름 설정
    const methodName = methodData.name;

    // 메서드 타입에 따라 payload 생성 및 parent_method 설정
    const isReadonly = methodData.readonly;

    const payload = convertInputsToPayload(methodData.inputs);
    const parentMethod = isReadonly ? methodName : "icx_sendTransaction";

    // 템플릿 객체에 메서드가 이미 존재하지 않는 경우에만 새 템플릿 추가
    const templateKey = `${methodName} (auto)`;
    if (!state.template_obj.template[addressAlias] || !state.template_obj.template[addressAlias][methodName]) {
        state.template_obj.template[addressAlias] = state.template_obj.template[addressAlias] || {};
        state.template_obj.template[addressAlias][templateKey] = createScorePayload(methodName, parentMethod, scoreAddress, payload);
    }
}


export function changed_setting(e=null, fetchScoreApisFlag=true){
    // state.template_obj = new iconTemplateMethod();
    if (e) {
        window.localStorage.setItem("last_network", e.target.value);
    }
    if (fetchScoreApisFlag) {
        fetchScoreApis().then(() => {
            debugLogger.log(" All SCORE APIs were imported.", e);
            debugLogger.table(state.score_apis_raws);
            convertScoreApiToTemplate();
            updateSelectElementWithMethods();
        });
    }
    updateAndRetrieveSelectedMethodInfo();
    content_remove_element("setting_result");
    generate_table("setting_table",
        "setting_result",

        flatten( get_last_setting() ),
        {
            editable: true,
            default_data: {"network_name":getIdValue('network'), "api_endpoint":"", "nid":"", "ins_score": "", "reward_score":""},
            editable_event: onchange_setting,
            disable_keys: ["network_name"]
        }
    );

    if (getIdValue('network') === "mainnet") {
        document.getElementById("setting").style.backgroundColor = "#D6D9FD" //FFD3B5 C9CEFE FDF5D6 D6D9FD
    }else{
        document.getElementById("setting").style.backgroundColor = ""
    }

    if (getId('dragUpload')) {

        get_dropzone("dragUpload");
    }

    if (getId("jsoneditor")) {
        // getId('jsoneditor').innerHTML = "";
        content_remove_element('jsoneditor')
        editor_obj = gen_jsoneditor();

        let selected_method = getIdValue("methods");
        let template_payload = state.template_obj.get_info(selected_method);

        let payload_data = "";
        if (template_payload.payload) {
            payload_data = template_payload.payload;
        }else{
            payload_data = template_payload;
        }

        payload_data = set_INS_config(payload_data)

        // if (arrayContains(selected_method, FILL_ADDRESS_PARAM) && getKeystore()) {
        //     payload_data.params.address = getKeystore().address;
        // }

        // fill_address_param(payload_data);
        // auto_fill_param();

        state.payload = payload_data;

        editor_obj.set(payload_data);
        gen_selectbox("methods");
        gen_selectbox("network",{
            searchText: "No result - Add it",
            addable: function (value) {
                if (value === 'bad') {return false}
                return value // Optional - value alteration // ex: value.toLowerCase()
                // return {
                //     text: value,
                //     value: value.toLowerCase()
                // }
            }
        });

        if (getId("methods")) {
            getId("sign_btn").disabled = !isSignMethodAvailable();
        }

        gen_selectbox("keystore_sel");

        auto_fill_param();
    }
}

export async function get_fee(json_rpc, is_calculate){
    let step_limit = "";
    // if (assigned_step_limit && assigned_step_limit !== "0x0"){
    //     return assigned_step_limit;
    // }
    if (is_calculate && json_rpc && json_rpc.params && json_rpc.params.from) {
        delete json_rpc.params.stepLimit;
        delete json_rpc.params.signature;
        let promise = new Promise((resolve, reject) => {
            call_api_payload(new iconTemplateMethod().get('getStepCosts'), "/api/v3",false).then(function (data) {
                let default_estimate = bigInteger(data['result']['default'], false, false);
                let step_price = "";
                logging_msg("getStepCosts: ", default_estimate);
                call_api_payload(new iconTemplateMethod().get('getStepPrice'), "/api/v3", false).then(function (data) {
                    step_price = bigInteger(data.result, false, false);
                    logging_msg("getStepPrice: ", step_price);
                    json_rpc['method'] = "debug_estimateStep";
                    call_api_payload(json_rpc, "/api/v3", false).then(function (data) {
                        if (data.result.status_code === 400) {
                            // reject(data.result.message);
                            step_limit = DEFAULT_STEP_LIMIT;
                        }else{
                            let estimate_step = bigInteger(data.result, false, false);
                            // logging_msg("data: ", data);
                            // logging_msg("estimate_step: ", estimate_step);
                            // let step_limit_wei = step_price * estimate_step;
                            let step_limit_wei = estimate_step;
                            let step_limit_human = parseInt(step_limit_wei) / 10**18;
                            // let step_limit_hex = "sdsd";
                            let step_limit_hex = "0x" + bigInt(step_limit_wei).toString(16);
                            logging_msg(`Fee: ${step_limit_wei}, ${step_limit_hex}, ${step_limit_human}`);
                            step_limit = step_limit_hex;
                        }
                        resolve('success');
                    });

                });
            });
        })
        // promise.catch(logging_msg("Error on get_fee()"));
        await promise;
    }
    return step_limit
}


function getCurrentTimestamp() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function getCallLocation() {
    const stack = new Error().stack;
    const stackLines = stack.split("\n");
    const callerLine = stackLines[3]; // 0: Error, 1: getCallLocation, 2: log/table/error, 3: 호출한 위치
    if (!callerLine) return 'Unknown location';
    const match = callerLine.match(/\((.*?):(\d+):(\d+)\)$/);
    if (match) {
        return `${match[1]}: Line ${match[2]}`;
    }
    return callerLine; // 정확한 매칭이 없는 경우 전체 라인 반환
}

export function debugLogging(...messages) {
    if (!get_localMemory("isDev")) return;
    const timestamp = getCurrentTimestamp();
    console.log(
        `%c[${timestamp}]DEBUG]%c`,
        'background:#11B6B8 ; padding: 1px; border-radius: 3px 3px 3px 3px;  color: #fff',
        'background:transparent', ...messages
    )
    // console.log(
    //     `%c[${timestamp}]%c`,
    //     'color: gray',
    //     ...messages
    // );
}

const debugLogger = {
    log : function(...messages) {
        if (!get_localMemory("isDev")) return;
        const timestamp = getCurrentTimestamp();
        console.log(
            `%c[${timestamp}]DEBUG]%c`,
            'background:#11B6B8 ; padding: 1px; border-radius: 3px 3px 3px 3px;  color: #fff',
            'background:transparent', ...messages
        )
    },
    table : function(data) {
        if (!get_localMemory("isDev")) return;
        const timestamp = getCurrentTimestamp();
        console.log(
            `%c[${timestamp}]TABLE]%c`,
            'background:#11B6B8 ; padding: 1px; border-radius: 3px 3px 3px 3px;  color: #fff',
            'background:transparent', data
        )
        console.table(data);
    },

    error : function(...messages) {
        if (!get_localMemory("isDev")) return;
        const timestamp = getCurrentTimestamp();

        console.log(
            `%c[${timestamp}]ERROR]%c`,
            'background:red ; padding: 1px; border-radius: 3px 3px 3px 3px;  color: #fff',
            'background:transparent', ...messages
        )
    },

}


export function isSignMethodAvailable(payloadData) {
    const effectivePayload = payloadData || state.payload;

    if (!effectivePayload || !effectivePayload.method) {
        return false;
    }
    return effectivePayload.method === "icx_sendTransaction" ||
        arrayContains(effectivePayload.method, AVAIL_SIGN_METHODS);
}

export async function tx_sign(is_calculate=true){
    // if (arrayContains(getIdValue("methods"), AVAIL_SIGN_METHODS)) {

    if (isSignMethodAvailable()) {
        let json_rpc = editor_obj.get();
        delete json_rpc.params.signature;
        json_rpc.params.nid = json_rpc.params.nid || getNetworkInfo(state).nid;
        json_rpc.params.from = getKeystore().address;
        json_rpc.params.to = json_rpc.params.to || "hx32b5704b766c535c34291c0d10ddd5bbd7b6b9fb";
        json_rpc.params.nonce = json_rpc.params.nonce || getRandomHex();
        // json_rpc.params.stepLimit = json_rpc.params.stepLimit || "0x4a817c800";
        json_rpc.params.version = json_rpc.params.version || "0x3";
        json_rpc.params.timestamp = nowUnixtimeHex();
        json_rpc.params.value = json_rpc.params.value || "0x38d7ea4c68000";
        let {selected_method, selected_group} = updateAndRetrieveSelectedMethodInfo();

        if (selected_group === "INS" || selected_group === "REWARD" || selected_group === "IISS") {
            json_rpc = set_INS_config(json_rpc);
            if (arrayContains(selected_method, NOT_PAYABLE_METHODS)) {
                // logging_msg(selected_method + "is not payable")
                logging_msg(`"${selected_method}" is not payable`)
                json_rpc.params.value = "0x0";
            }
        }
        // update revision params
        if (json_rpc.params &&
            json_rpc.params.data &&
            json_rpc.params.data.method === "registerProposal" &&
            json_rpc.params.data.params &&
            json_rpc.params.data.params.value &&
            json_rpc.params.data.params.value.code &&
            json_rpc.params.data.params.value.name
        ) {
            let revision_value = json_rpc.params.data.params.value;
            let revision_value_hex = StringtoHex(JSON.stringify(revision_value));
            logging_msg("Updates revision value", revision_value);
            logging_msg("Updates revision hex value", revision_value_hex);
            json_rpc.params.data.params.value = revision_value_hex;
        }
        // else if (selected_group === "REWARD"){
        //     json_rpc = set_REWARD_config(json_rpc);
        //     if (arrayContains(selected_method, NOT_PAYABLE_METHODS)) {
        //         json_rpc.params.value = "0x0";
        //     }
        // }
        await get_fee(json_rpc, is_calculate)
            .then( function(step_limit){
                if (step_limit){
                    json_rpc.params.stepLimit = step_limit;
                }else{
                    json_rpc.params.stepLimit =  json_rpc.params.stepLimit || DEFAULT_STEP_LIMIT

                }
                json_rpc.method = "icx_sendTransaction";
                let wallet = IconWallet.loadPrivateKey(getKeystore().pk);

                if (json_rpc.params.dataType === "message") {
                    json_rpc.params.data = StringtoHex(json_rpc.params.data);
                }
                let signature = wallet.sign(serialize(json_rpc.params));
                logging_msg("signature", signature);
                json_rpc.params.signature = signature;
                editor_obj.update(json_rpc);
                logging_msg("signing", json_rpc.params);
            })
            .catch( (err) =>{
                logging_msg("error on get_fee()", err);
            })
            // .finally(() => {
            //     console.log("=== get_fee() final")
            // })
        // });
    }
}

export function run_call_api(actions){
    let payload = editor_obj.get();
    let selected_method = getIdValue("methods");
    call_api_payload(payload, "/api/v3").then(function (data) {
        logging_msg(selected_method + " = ", JSON.stringify(data, undefined, 4));

        let result = parse_result_readable(data.result, actions);
        actions.gen_table(
            {
                data: result,
                caption: getIdValue("methods") + "<small style='color:hsl(0deg 0% 93%)'>" + nowdate() + "</small>"
            }
        );
        printGetBalance(payload.params.from);
    });
}

export function fill_address_param(payload_data=null ){
    let payload;
    if (payload_data !== null && typeof(payload_data)==="object" && Object.keys(payload_data).length > 0) {
        payload = payload_data;
    }else{
        payload = editor_obj.get();
    }

    if (arrayContains(state.selected_method, FILL_ADDRESS_PARAM) && getKeystore()) {
        payload.params.address = getKeystore().address;
        if (editor_obj) {
            editor_obj.set(payload);
        }
    }
}

// export function auto_fill_param_(){
//     console.log("run auto_fill_param")
//     try {
//         if (typeof(editor_obj) === "object") {
//             for ( let dest_key in AUTO_FILL_SELECTED_KEY) {
//                 for (let idx in AUTO_FILL_SELECTED_KEY[dest_key]) {
//                     let method_name = AUTO_FILL_SELECTED_KEY[dest_key][idx];
//                     if (method_name === getIdValue("methods")) {
//                         let prev_payload = editor_obj.get();
//                         editor_obj.set(_.set(prev_payload, dest_key, getKeystore().address));
//                         console.log("===== match:", prev_payload);
//                     }
//                 }
//             }
//         }
//     }catch(e) {
//         console.log(e)
//     }
// }

export function auto_fill_param() {
    try {
        if (editor_obj && typeof(editor_obj) === "object") {
            Object.entries(AUTO_FILL_SELECTED_KEY).forEach(([destKey, methodNames]) => {
                if (methodNames.includes(getIdValue("methods"))) {
                    let prevPayload = editor_obj.get();
                    // Lodash _.set 대신에 JavaScript를 사용하여 객체를 수정
                    const keys = destKey.split('.'); // "a.b.c" -> ["a", "b", "c"]
                    let current = prevPayload;
                    for (let i = 0; i < keys.length - 1; i++) {
                        current = current[keys[i]] = current[keys[i]] || {};
                    }
                    current[keys[keys.length - 1]] = getKeystore().address;
                    editor_obj.set(prevPayload);
                    // console.log("===== match:", prevPayload);
                }
            });
        }
    } catch (e) {
        console.error(e); // 에러 로깅을 console.log에서 console.error로 변경
    }
}


export function get_ins_score_address(){
    // logging_msg(getNetworkInfo());
    let selected_network = ""
    try{
        selected_network = getNetworkInfo().network_name;
    }catch(e){
        // logging_msg("get_ins_score_address", e)
        selected_network = getIdValue("network_name");
    }
    let ins_setting_info = INS_SETTINGS[selected_network];

    if (getIdValue('ins_score') !== null && getIdValue('ins_score').trim() !=="") {
        return getIdValue('ins_score').trim()
    } else if (ins_setting_info) {
        return ins_setting_info.score_address.trim();
    }else{
        return "";
    }

}

export function get_reward_score_address(){
    // logging_msg(getNetworkInfo());
    let selected_network = ""
    try{
        selected_network = getNetworkInfo().network_name;
    }catch(e){
        // logging_msg("get_ins_score_address", e)
        selected_network = getIdValue("network_name");
    }
    let ins_setting_info = REWARD_SETTINGS[selected_network];

    if (getIdValue('reward_score') !== null && getIdValue('reward_score').trim() !=="") {
        return getIdValue('reward_score').trim()
    } else if (ins_setting_info) {
        return ins_setting_info.score_address.trim();
    }else{
        return "";
    }

}


// export function updateAndRetrieveSelectedMethodInfo2(){
//     let ret = {"group":"", "method":""};
//     let selected_method = getIdValue("methods");
//     let template_method = state.template_obj.get_info(selected_method);
//     let selected_group = template_method.group;
//     if (selected_group) {
//         ret = {
//             selected_group: selected_group,
//             selected_method: selected_method
//         }
//         state.selected_method = selected_method;
//         state.selected_group  = selected_group;
//     }
//
//     return ret
// }


export function updateAndRetrieveSelectedMethodInfo() {
    const selectedMethodId = getIdValue("methods");
    const methodInfo = state.template_obj.get_info(selectedMethodId);

    if (methodInfo && methodInfo.group) {
        state.selected_method = selectedMethodId;
        state.selected_group = methodInfo.group;
        return {
            selected_group: methodInfo.group,
            selected_method: selectedMethodId
        };
    }
    return { selected_group: "", selected_method: "" };
}

export function set_INS_config(payload_to_change={}){
    let {selected_method, selected_group} = updateAndRetrieveSelectedMethodInfo();
    let ins_score_address = get_ins_score_address();
    let reward_score_address = get_reward_score_address();

    // logging_msg("INS SCORE:: "+ ins_score_address);
    let this_keystore = getKeystore();

    if (selected_group === "INS") {
        if (selected_method && ins_score_address) {
            if (ins_score_address) {
                payload_to_change.params.to = ins_score_address;
            }
            switch (selected_method) {
                case "registerINS":
                    // payload_to_change.params.value = "0x0";
                    if (this_keystore) {
                        if (payload_to_change.params.value === "") {
                            payload_to_change.params.value = "0x1bc16d674ec80000";
                        }
                        payload_to_change.params.data.params._address = this_keystore.address;
                    }
                    break;
            }
        }

    }else if (selected_group === "REWARD"){
        // console.log("SELECTED REWARD:" , reward_score_address)
        if (selected_method && reward_score_address) {
            if (reward_score_address) {
                payload_to_change.params.to = reward_score_address;
            }
            switch (selected_method) {
                // case "openCard":
                //     // payload_to_change.params.value = "0x0";
                //     if (this_keystore) {
                //         payload_to_change.params.from = thiset_INS_configs_keystore.address;
                //     }
                //     break;
            }
        }
    }
    return payload_to_change;
}

// export function set_INS_config(payload_to_change={}){
//     let {selected_method, selected_group} = updateAndRetrieveSelectedMethodInfo();
//     let ins_score_address = get_ins_score_address();
//     let reward_score_address = get_reward_score_address();
//     console.log(reward_score_address)
//     // logging_msg("INS SCORE:: "+ ins_score_address);
//     let this_keystore = getKeystore();
//     if (ins_score_address) {
//         if (selected_method && selected_group === "INS") {
//             payload_to_change.params.to = ins_score_address;
//             switch (selected_method) {
//                 case "registerINS":
//                     // payload_to_change.params.value = "0x0";
//                     if (this_keystore) {
//                         payload_to_change.params.data.params._address = this_keystore.address;
//                     }
//                     break;
//                 // case "setPrice":
//                 //     payload_to_change.params.value = "0x0";
//                 //     break;
//                 // case "setInsServiceAdmin":
//                 //     payload_to_change.params.value = "0x0";
//                 //     // payload_to_change.params.data.params._ins_service_admin = ""
//                 //     break;
//             }
//         }else if (selected_method && selected_group === "REWARD") {
//         }
//     }
//     // state.payload = payload_to_change;
//     return payload_to_change;
// }
//

export function set_REWARD_config(payload_to_change={}){
    let {selected_method, selected_group} = updateAndRetrieveSelectedMethodInfo();
    let ins_score_address = get_reward_score_address();
    // logging_msg("INS SCORE:: "+ ins_score_address);
    let this_keystore = getKeystore();
    if (ins_score_address) {
        if (selected_method && selected_group === "INS") {
            payload_to_change.params.to = ins_score_address;
            switch (selected_method) {
                case "registerINS":
                    // payload_to_change.params.value = "0x0";
                    if (this_keystore) {
                        payload_to_change.params.data.params._address = this_keystore.address;
                    }
                    break;
                // case "setPrice":
                //     payload_to_change.params.value = "0x0";
                //     break;
                // case "setInsServiceAdmin":
                //     payload_to_change.params.value = "0x0";
                //     // payload_to_change.params.data.params._ins_service_admin = ""
                //     break;
            }
        }
    }
    // state.payload = payload_to_change;
    return payload_to_change;
}



export function ellipsis_start_and_end(str) {
    if (str.length > 35) {
        return str.substr(0, 20) + '...' + str.substr(str.length-10, str.length);
    }
    return str;
}

export function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


function onchange_setting(e){
    let find_key_value = getIdValue("network");
    let exclude_change_network = ["mainnet", "testnet", "zicon"];
    if ( exclude_change_network.includes(find_key_value) ){
        console.log("PASS excluded elements : "+ find_key_value);
    }else{
        let options = {
            find_key_name: "network_name",
            find_key_value: find_key_value,
            set_key: e.target.id,
            set_value: {
                network_name: getIdValue("network_name") ,
                api_endpoint: getIdValue("api_endpoint"),
                nid: getIdValue("nid"),
                ins_score: getIdValue("ins_score"),
                reward_score: getIdValue("reward_score")
            },
            storage_key: "network_info"
        }
        set_localMemory(options);
        state.network_info[options.find_key_value] = options.set_value;
    }
}

export function getNetworkInfo(){
    if (getId("network")) {
        let sel_val = getIdValue("network");
        return state.network_info[sel_val];
    }
}

export class iconTemplateMethod {
    constructor() {
        try {
            if (getKeystore()) {
                this.key_address = getKeystore().address
            }

        }catch(e) {
            this.key_address = "null";
            console.log("iconTemplateMethod error",e)
        }

        this.template =  {
            "Main API": {
                "icx_getTotalSupply": create_payload("icx_getTotalSupply"),
                "icx_getLastBlock": create_payload("icx_getLastBlock"),
                "icx_getNetworkInfo": create_payload("icx_getNetworkInfo"),
                "icx_getBalance": create_payload("icx_getBalance", {address: this.key_address}),
                "icx_getTransactionResult": create_payload("icx_getTransactionResult", {txHash: ""}),
                "icx_getTransactionByHash": create_payload("icx_getTransactionByHash", {txHash: ""}),
                "icx_getBlockByHeight": create_payload("icx_getBlockByHeight", {height: ""}),
                "icx_getBlockByHash": create_payload("icx_getBlockByHeight", {hash: ""}),
                "icx_getScoreApi": create_payload("icx_getScoreApi", {address: ""}),
                "icx_call": create_payload("icx_call", {from:"", to:"", dataType: "call", data:{}}),
                // "icx_sendTransaction": create_payload("icx_sendTransaction", {from:"", to:"",stepLimit:"", data:{}}),
                "icx_sendTransaction": create_payload("icx_sendTransaction", {from:"", to:"",stepLimit:"", value: ""}),
                "icx_sendTransaction(SCORE)": create_payload("icx_sendTransaction",
                    {from:"", to:"",stepLimit:"", value: "",  dataType: "call", data: {method:"", params:{}}}),
            },
            "IISS": {
                "setStake": create_payload("icx_sendTransaction",
                    {
                        method: "setStake",
                        params: {
                            value: ""
                        }
                    },
                    "governance_send", "0x0"
                ),
                "getStake": create_payload("getStake", {address: this.key_address}, "icx_call"),
                "setDelegation": create_payload("icx_sendTransaction",
                    {
                        method: "setDelegation",
                        params: {
                            delegations:[
                                {
                                    address : "",
                                    value : ""
                                }
                            ]
                        }
                    },
                    "governance_send", "0x0"
                ),
                "getDelegation": create_payload("getDelegation", {address: this.key_address}, "icx_call"),

                "setBond": create_payload("icx_sendTransaction", {
                        method: "setBond",
                        params: {
                            bonds : [{address: "", value: ""}]
                        }
                    },
                    "governance_send", "0x0"
                ),

                "setBonderList": create_payload("icx_sendTransaction", {
                    method: "setBonderList",
                    params: {
                        bonderList : []
                        }
                    },
                    "governance_send", "0x0"
                ),

                "getBond": create_payload("getBond", {address: this.key_address}, "icx_call"),
                "getBonderList": create_payload("getBonderList", {address: this.key_address}, "icx_call"),

                "claimIScore": create_payload("icx_sendTransaction", {method: "claimIScore"}, "governance_send"),
                "queryIScore": create_payload("queryIScore", {address: this.key_address}, "icx_call"),
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
                    "governance_send", "0x6c6b935b8bbd400000"
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
                    "governance_send", "0x0"),
                "setGovernanceVariables": create_payload("icx_sendTransaction", {method: "setGovernanceVariables", params:{ireps:""}}, "governance_send"),
                "getPRep": create_payload("getPRep", {address:""}, "icx_call") ,
                "getPReps": create_payload("getPReps", {}, "icx_call") ,
                "getIISSInfo": create_payload("getIISSInfo", {}, "icx_call") ,
                "getPRepTerm": create_payload("getPRepTerm", {}, "icx_call") ,
                "getPRepStats": create_payload("getPRepStats", {}, "icx_call") ,
                "getInactivePReps": create_payload("getInactivePReps", {}, "icx_call") ,
                "getNetworkInfo": create_payload("getNetworkInfo", {}, "icx_call") ,
            },
            "Governance": {
                "getScoreStatus": create_payload("getScoreStatus", {address: "cx9ab3078e72c8d9017194d17b34b1a47b661945ca"}, "governance_call"),
                "getStepPrice": create_payload("getStepPrice", {}, "governance_call"),
                "getStepCosts": create_payload("getStepCosts", {}, "governance_call"),
                "getMaxStepLimit": create_payload("getMaxStepLimit", {contextType: "invoke"}, "governance_call"),
                "isInScoreBlackList": create_payload("isInScoreBlackList", {address: ""}, "governance_call"),
                "getVersion": create_payload("getVersion", {}, "governance_call"),
                "isInImportWhiteList": create_payload("isInImportWhiteList", {importStmt:""}, "governance_call"),
                "getServiceConfig": create_payload("getServiceConfig", {}, "governance_call"),
                "getRevision": create_payload("getRevision", {}, "governance_call"),
                "getProposal": create_payload("getProposal", {"id": ""}, "governance_call"),
                "getProposals": create_payload("getProposals", {}, "governance_call"),
                "acceptScore": create_payload("acceptScore", {txHash:""}, "governance_call"),
                "rejectScore": create_payload("rejectScore", {txHash:"", reason:""}, "governance_call"),
                "addAuditor": create_payload("addAuditor", {address:""}, "governance_call"),
                "removeAuditor": create_payload("removeAuditor", {address:""}, "governance_call"),

                // "registerProposal": create_payload("registerProposal", {title:"", description:"", type:""}, "governance_call"),

                "registerProposal": create_payload("icx_sendTransaction",
                    {
                        method: "registerProposal",
                        params: {
                            title: "Revision update",
                            description: "Revision update",
                            type: "0x1",
                            value: {
                                code: "0x11",
                                name: "Revision17"
                            }
                        }
                    },
                    "governance_send", "0x0", 1234, GOVERNANCE_ADDRESS
                ),

                // "cancelProposal": create_payload("cancelProposal", {id:""}, "governance_call"),

                "cancelProposal": create_payload("icx_sendTransaction",
                    {
                        method: "cancelProposal",
                        params: {
                            id: "",
                        }
                    },
                    "governance_send", "0x0", 1234, GOVERNANCE_ADDRESS
                ),
                "voteProposal": create_payload("icx_sendTransaction",
                    {
                        method: "voteProposal",
                        params: {
                            id: "",
                            vote: "0x1",
                        }
                    },
                    "governance_send", "0x0", 1234, GOVERNANCE_ADDRESS
                ),

                "applyProposal": create_payload("icx_sendTransaction",
                    {
                        method: "applyProposal",
                        params: {
                            id: "",
                        }
                    },
                    "governance_send", "0x0", 1234, GOVERNANCE_ADDRESS
                ),

                // "voteProposal": create_payload("voteProposal", {id:"", vote:""}, "governance_call"),

            },
            "DEBUG": {
                "getStepCosts": create_payload("getStepCosts", {}, "governance_call") ,
                "getMaxStepLimit": create_payload("getMaxStepLimit", {contextType: "invoke"}, "governance_call") ,
                "getStepPrice": create_payload("getStepPrice", {}, "governance_call") ,
                "debug_getAccount": create_payload("debug_getAccount", {"address":"", "filter":"0x7"}) ,
                "debug_getTrace": create_payload("debug_getTrace", {"txHash":""}) ,
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
            },
            "NODE" :{
                "node_getChannelInfos": create_payload("node_getChannelInfos", {channel: "icon_dex",height: "1"}),
                "node_getBlockByHeight": create_payload("node_getBlockByHeight"),
                "node_getCitizens": create_payload("node_getCitizens"),
            },

            "INS": {
                "registerINS": create_payload(
                    "icx_sendTransaction",
                    {
                        from:"",
                        to:"",
                        stepLimit:"",
                        value: "",
                        dataType: "call",
                        data: {
                            method:"registerINS",
                            params:{
                                "_ins_name": "",
                                "_address": "",
                                "_period": "1"
                            }
                        }
                    }
                ),
                "reserveINS": create_payload(
                    "icx_sendTransaction",
                    {
                        from:"",
                        to:"",
                        stepLimit:"",
                        value: "",
                        dataType: "call",
                        data: {
                            method:"reserveINS",
                            params:{
                                "_ins_name": "",
                                "_owner": "",
                                "_period": "0"
                            }
                        }
                    }
                ),
                "modifyINS": create_payload(
                    "icx_sendTransaction",
                    {
                        from:"",
                        to:"",
                        stepLimit:"",
                        value: "",
                        dataType: "call",
                        data: {
                            method:"modifyINS",
                            params:{
                                "_ins_name": "",
                                "_owner": "",
                                "_unit": "monthly",
                                "_period": 1,
                                "_force": "0x1",
                                "_reserved": "0x1"
                            }
                        }
                    }
                ),
                "updateINS": create_payload(
                    "icx_sendTransaction",
                    {
                        from:"",
                        to:"",
                        stepLimit:"",
                        value: "",
                        dataType: "call",
                        data: {
                            method:"updateINS",
                            params:{
                                "_ins_name": "",
                                "_address": "",
                                "_new_owner": "",
                            }
                        }
                    }
                ),
                "getAddress": create_payload("getAddress", {_ins_name: ""}, "icx_call"),
                "getNamesByAddress": create_payload("getNamesByAddress", {_address: ""}, "icx_call"),
                "getNamesByOwner": create_payload("getNamesByOwner", {_address: ""}, "icx_call"),
                "withdraw": create_payload("icx_sendTransaction", {
                    dataType: "call",
                    data: {
                        method: "withdraw",
                        params: {
                            _amount: ""
                        }
                    }
                }),
                "setPrice": create_payload("icx_sendTransaction", {
                    dataType: "call",
                    data: {
                        method: "setPrice",
                        params: {
                            "_monthly": "2",
                            "_reward_monthly": "1",
                            "_free_months_per_year": "2"
                        }
                    }
                }),
                "getPrice": create_payload("getPrice", {}, "icx_call"),
                "getNameStatus": create_payload("getNameStatus", {_ins_name: ""}, "icx_call"),
                "setInsServiceAdmin": create_payload(
                    "icx_sendTransaction",
                    {
                        from:"",
                        to:"",
                        stepLimit:"",
                        value: "",
                        dataType: "call",
                        data: {
                            method:"setInsServiceAdmin",
                            params:{
                                "_ins_service_admin": ""
                            }
                        }
                    }
                ),
                "getInsServiceAdmin": create_payload("getInsServiceAdmin", {}, "icx_call"),
                "setServiceAvailable": create_payload(
                    "icx_sendTransaction",
                    {
                        from:"",
                        to:"",
                        stepLimit:"",
                        value: "",
                        dataType: "call",
                        data: {
                            method:"setServiceAvailable",
                            params:{
                                "_available": ""
                            }
                        }
                    }
                ),
                "getServiceAvailable": create_payload("getServiceAvailable", {}, "icx_call"),
                "getTotalInsNames": create_payload("getTotalInsNames", {}, "icx_call"),
                "setRewardScoreAddr": create_payload("icx_sendTransaction", {
                    dataType: "call",
                    data: {
                        method: "setRewardScoreAddr",
                        params: {
                            "_reward_score_addr": "",
                        }
                    }
                }),
                "getRewardScoreAddr": create_payload("getRewardScoreAddr", {}, "icx_call"),
            },
            "REWARD": {
                "openCard": create_payload("icx_sendTransaction", {
                    dataType: "call",
                    data: {
                        method: "openCard"
                    }
                }),
                "setInsScoreAddr": create_payload("icx_sendTransaction", {
                    dataType: "call",
                    data: {
                        method: "setInsScoreAddr",
                        params: {
                            "_ins_score_addr": "",
                        }
                    }
                }),
                "getInsScoreAddr": create_payload("getInsScoreAddr", {}, "icx_call"),
                "setRewardCondition": create_payload("icx_sendTransaction", {
                    dataType: "call",
                    data: {
                        method: "setRewardCondition",
                        params: {
                            "_reward_condition": "0x2",
                        }
                    }
                }),
                "getRewardCondition": create_payload("getRewardCondition", {}, "icx_call"),
                "getCardCount": create_payload("getCardCount", { "_user":""}, "icx_call"),
                "getCurrentReward": create_payload("getCurrentReward", {}, "icx_call"),
                // "getCurrentRound": create_payload("getCurrentRound", {}, "icx_call"),
                "getWinners": create_payload("getWinners", {"_round": "0"}, "icx_call"),
            }
        };

        let isDev = get_localMemory("isDev");
        if (isDev === false || isDev === "false" || isDev === "FALSE") {
            removeProps(this.template, INS_ADMIN_METHODS);
        }


        this.return_result = {
            payload: undefined,
            group: undefined,
            method: undefined
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
    get_info(method_name) {
        if (method_name) {
            for (let group in this.template) {
                for (let method in this.template[group]) {
                    if (method_name === method) {
                        return {
                            payload: this.template[group][method],
                            group: group,
                            method: method
                        }
                    }
                }
            }
            return this.return_result;
        }else {
            return this.template;
        }
    }
    get_group(group_name) {
        return this.template[group_name];
    }
}
