import {IconWallet} from "icon-sdk-js";
const axios = require('axios');
import QrCodeWithLogo from "qrcode-with-logos";
const bigInt = require("big-integer"); // BigInt dont support to safari 13+
const bigfloat = require("bigfloat.js").default;
import SlimSelect from 'slim-select'
import Dropzone from 'dropzone';

import {AVAIL_SIGN_METHODS} from "./config";

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

    // console.log(memory);
    // normalize
    if(is_find === false){
        let obj = {}
        if (options.append_raw) {
            // obj["address"] = options.find_key_value;
            obj["raw"] = options.set_value;
            obj = options.set_value;
            // console.log(get_localMemory("keystore", "address"));
            is_write = true;
        }
        // else{
        //     obj[options.set_key] = options.set_value;
        // }
        // obj = options.set_value;
        obj[options.find_key_name] = options.find_key_value;
        // logging_msg("New Store localMemory (" + options.storage_key+ ")"   , options)
        logging_msg("New Store localMemory (" + options.storage_key+ ")"   , obj)
        memory.push(obj)
    }
    if (Object.keys(memory).length ) {
        localMemory.setItem(options.storage_key, JSON.stringify(memory));
    }

    return is_find;
}

export function set_localMemory(options={}){
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
            "key_alias": getIdValue("key_alias"),
            "raw": JSON.parse(getIdValue("raw")),
            "address": getIdValue("address"),
            "pk": wallet
        }
        is_find = set_localMemory({
            find_key_name: "address",
            find_key_value: getIdValue("address"),
            set_key: getIdValue("key_alias"),
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
    if ( !initialize[elementId]  ) {
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
                                logging_msg("Correct JSON" );
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
                    select: '#' + elementId
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
export function gen_jsoneditor(){
    const container = getId('jsoneditor');
    const options = {
        mode: 'code',
        modes: ['code', 'form', 'tree' ], // allowed modes
        onError: function (err) {
            alert(err.toString())
        },
        onModeChange: function (newMode, oldMode) {
            console.log('Mode switched from', oldMode, 'to', newMode)
        }
    }
    const editor = new JSONEditor(container, options)
    const json =  {
        // "id": 2848,
        // "jsonrpc": "2.0",
        // "method": "icx_call",
        // "params": {
        //     "from": "hx0000000000000000000000000000000000000000",
        //     "to": "cx0000000000000000000000000000000000000000",
        //     "dataType": "call",
        //     "data": {
        //         "method": "getIISSInfo"
        //     }
        // }
    }
    editor.set(json)
    // editor.expandAll()
    // // set json
    // document.getElementById('setJSON').onclick = function () {
    //     const json = {
    //         array: [1, 2, 3],
    //         boolean: true,
    //         null: null,
    //         number: 123,
    //         object: { a: 'b', c: 'd' },
    //         string: 'Hello World'
    //     }
    //     editor.set(json)
    // }
    //
    // // get json
    // document.getElementById('getJSON').onclick = function () {
    //     const json = editor.get()
    //     window.alert(JSON.stringify(json, null, 2))
    // }
    return editor;
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

    if (typeof val === "object") {
        val = JSON.stringify(val,undefined,4);
    }

    if (key && val === undefined) {
        key_span.innerHTML = key;
    } else if (key && val) {
        data_span  = makeElement(document,"pre", "hljs", "log-raw", div);
        code_span  = makeElement(document,"code", "html", "log-raw", data_span);
        prettify = hljs.highlight("json", val).value;
        key_span.innerHTML = key;
        code_span.innerHTML = prettify;
    }else{
        data_span  = makeElement(document,"pre", "hljs", "log-raw", div);
        code_span  = makeElement(document,"code", "html", "log-raw", data_span);
        code_span.innerHTML = key;
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
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

export function arrayContains(needle, arrray_stack) {
    return (arrray_stack.indexOf(needle) > -1);
}

export function isHex(string) {
    try{
        string = string.replace(/^0x/,'');
    }catch(error){

    }
    return /^[A-F0-9]+$/i.test(string)
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


export function create_payload(method, params={} , score="",value="", id=2848) {
    let data = {};
    switch (score){
        case "icx_call":
            data = {
                method: "icx_call",
                params: {
                    from: "hx0000000000000000000000000000000000000000",
                    to: "cx0000000000000000000000000000000000000000",
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
                    to: "cx0000000000000000000000000000000000000001",
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
                    to: "cx0000000000000000000000000000000000000000",
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
                    if (arrayContains(newKey, ["result", "status_code", "api_endpoint" ])) {
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
                    } else if (regexInArray(newKey, [/timestamp/, /time_stamp/])) {
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

export async function call_api(method, score=false, params={}) {
    let endpoint, payload;
    try {
        endpoint = get_last_setting()['api_endpoint'];
    }
    catch(e){
        endpoint = "https://zicon.net.solidwallet.io";
        console.log(e);
    }
    let endpoint_api = endpoint+"/api/v3";

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
                    to: "cx0000000000000000000000000000000000000000",
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
    logging_msg("call_api = ", options);

    let response, data;
    try {
        response = await axios(options);
        try {
            data = await response.data;
        }catch(error) {
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
                "status_code": error_status,
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


export async function call_api_payload(payload) {
    let endpoint;
    try {
        endpoint = get_last_setting()['api_endpoint'];
    }
    catch(e){
        endpoint = "https://zicon.net.solidwallet.io";
        console.log(e);
    }
    let endpoint_api = endpoint+"/api/v3";

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
                // "Content-Type": "application/json",
                "Content-Type" : "application/x-www-form-urlencoded"
            },
        data: payload,
    };
    logging_msg("call_api = ", options);

    let response, data;
    try {
        response = await axios(options);
        try {
            data = await response.data;
        }catch(error) {
            data = {"error": response};
        }

    } catch (error){
        logging_msg("Got error", error.response);
        let error_status, error_message;
        if (error.response) {
            // logging_msg("Connect success ", error);

        }else if (error.request) {
            logging_msg("Connect error", error);
        }else{
            logging_msg('Error', error)
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
        console.log("SUCCESS");
        showLoading(false);
    }else{
        console.log("FAIL");
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
        localMemory.clear();
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
                    logging_msg("getKeystore() Change keystore = " + sel_val + " / " + selected_key.address, e);
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
                }else if (e.target.id === "hex_loop_value") {
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

export function changed_setting(e=null){
    console.log("Changed settings");
    if (e) {
        window.localStorage.setItem("last_network", e.target.value);
    }
    content_remove_element("setting_result");
    generate_table("setting_table",
        "setting_result",

        flatten( get_last_setting() ),
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
        get_dropzone("dragUpload");
    }

    if (getId("jsoneditor")) {
        getId('jsoneditor').innerHTML = "";
        editor_obj = gen_jsoneditor();
        let template_method = new iconTemplateMethod().get(getIdValue("methods"));
        let template_method_value = "";
        if ( template_method.payload ) {
            template_method_value = template_method.payload;
        }else{
            template_method_value = template_method;
        }
        editor_obj.set(template_method_value);
        gen_selectbox("methods");
        gen_selectbox("network",{
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
            getId("sign_btn").disabled = !arrayContains(getIdValue("methods"), AVAIL_SIGN_METHODS);
        }
        gen_selectbox("keystore_sel");
    }
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
            console.log(e)
        }

        this.template =  {
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
                        params: [
                            {
                                address : "",
                                value : ""
                            }
                        ]
                    },
                    "governance_send", "0x0"
                ),
                "getDelegation": create_payload("getDelegation", {address: this.key_address}, "icx_call"),
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
                "getInactivePReps": create_payload("getInactivePReps", {}, "icx_call") ,
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
                "getProposal": create_payload("getProposal", {}, "governance_call"),
                "getProposals": create_payload("getProposals", {}, "governance_call"),
                "acceptScore": create_payload("acceptScore", {txHash:""}, "governance_call"),
                "rejectScore": create_payload("rejectScore", {txHash:"", reason:""}, "governance_call"),
                "addAuditor": create_payload("addAuditor", {address:""}, "governance_call"),
                "removeAuditor": create_payload("removeAuditor", {address:""}, "governance_call"),
                "registerProposal": create_payload("registerProposal", {title:"", description:"", type:""}, "governance_call"),
                "cancelProposal": create_payload("cancelProposal", {id:""}, "governance_call"),
                "voteProposal": create_payload("voteProposal", {id:"", vote:""}, "governance_call"),

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
