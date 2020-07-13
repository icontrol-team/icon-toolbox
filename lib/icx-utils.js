const axios = require('axios');
import icon_logo from '../img/icon.svg';
import QrCodeWithLogo from "qrcode-with-logos";
const bigInt = require("big-integer"); // BigInt dont support to safari 13+
const bigfloat = require("bigfloat.js").default;
import "./spinner.css"
import 'highlight.js/styles/github.css'

let hljs = require('highlight.js');

export function bigFloat(val) {
    try{
        val = val.replace(/^0x/,'');
    }catch(error){

    }
    bigfloat.set_precision(-10);
    return bigfloat.string(bigfloat.BigFloat(val));
}

export function logging_msg(key, val){
    const elm = window.document.getElementById('logging');
    const div  = makeElement(document,"div", "logging", "log-raw");
    const date_span  = makeElement(document,"span", "logging-date", "log-raw",div);
    const key_span  = makeElement(document,"span", "data-key", "log-raw", div);
    const data_span  = makeElement(document,"pre", "hljs", "log-raw", div);
    const code_span  = makeElement(document,"code", "html", "log-raw", data_span);
    date_span.innerHTML = nowdate();
    let prettify;
    if (key && val) {
        if (typeof val === "object") {
            val = JSON.stringify(val,undefined,4);
        }
        prettify = hljs.highlight("json", val).value;
        key_span.innerHTML = key;
        code_span.innerHTML = prettify;
    }else{
        code_span.innerHTML = key;
    }

    elm.appendChild(div);
    setTimeout(e => {(elm.scrollTop = elm.scrollHeight)}, 50);
}


export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
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
           src: icon_logo,
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
    if (wei) {
        return "0x" + bigFloat(amount * 10 ** 18).toString(16);
    }else{
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


function arrayContains(needle, arrray_stack) {
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
    let date, offset;
    offset = new Date().getTimezoneOffset();

    if (change_utc) {
        unix_timestamp = parseInt(unix_timestamp) + (60*offset)
    }

    if (ms) {
        date = new Date(parseInt(unix_timestamp/1000));
    }else{
        date = new Date(unix_timestamp * 1000);
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

function createPayload(data, id=2848) {
    return Object.assign({}, {
        id: id,
        jsonrpc: '2.0',
        // params: []
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
            if (typeof value === "object") {
                traverseAndFlatten(value, target, newKey);
            } else {
                // INT_VALUE & comma
                if (arrayContains(newKey, ["blockHeight", "height"])) {
                    value = hex_to_int(value, true, false) + "<span style='color:grey'> (org: " + value + ")</span>";
                } else if (regexInArray(newKey,[/switch_bh_versions/, /_hash/, /version/, /txHash/, /Unixtime/, /crypto/] )) {
                    target[newKey] = value;
                // } else if (arrayContains(newKey,["timestamp", "version", "status", "time_stamp"]) ) {
                } else if (regexInArray(newKey,[/timestamp/, /time_stamp/]) ) {
                    value = unixtime2date(value, true) + "<span style='color:grey'> (org: "+ value +")</span>";
                } else if (regexInArray(newKey,[ /status/ ] ) ) {
                    value = hex_to_int(value, false, false) + "<span style='color:grey'> (org: "+ value +")</span>";
                    // } else if (newKey.includes("Hash") === false) {
                } else if (arrayContains(newKey,["Hash", "nid", "switch_bh_versions", "blockHash","txHash"]) === false) {
                    if (isHex(value)){
                        value = hex_to_float(value, false, true) + "<span style='color:grey'> (10^18 loop, org: "+ value +")</span>";
                    }
                }
                target[newKey] = value;
            }
        }
    }
}

export function flatten(obj) {
    let flattenedObject = {};

    if (typeof obj !== "object") {
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
        logging_msg("Got error", error.response);
        data = {
            "result": {
                    "status_code": error.response.status,
                    "message": error.response.data.error.message
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
    return return_data;
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
