import { location } from "@hyperapp/router";
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
    set_INS_config,
    getKeystore, iconTemplateMethod, arrayContains, get_ins_score_address

} from "../icx-utils";

const icx_utils = require("../icx-utils");
import IconService, { IconWallet } from 'icon-sdk-js';
import {serialize} from "icon-sdk-js/lib/data/Util";
import {INS_SETTINGS, APP_VERSION, NOT_PAYABLE_METHODS} from "../config";


function getNetworkInfo(state){
    if (getId("network")) {
        let sel_val = getIdValue("network");
        return state.network_info[sel_val];
    }
}

console.log(
    `%c ICON%cTROL %c ${APP_VERSION} %c`,
    'background:#11B6B8 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
    'background:#1182C0 ; padding: 1px; border-radius: 0;  color: #fff',
    'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
    'background:transparent'
)

const actions = {
    location: location.actions,
    load: () => (state, actions) => {},
    check_auto_reload: () => (state, actions) => {
        state.auto_reload = !state.auto_reload;
        // console.log("check button ::", state.auto_reload);
        // if (state.auto_reload) {
        //     getId('auto_reload_text').innerText = "auto_reload";
        // }else{
        //     getId('auto_reload_text').innerText = "auto_reload";
        // }
        //

    },
    save_state: ({a, b})=>(state, actions)=>{
        console.log(a, b);
        console.log("actions: ", actions);
        console.log("state: " , actions);

    },
    clear_logging: val => (state, actions) =>{
        const elm = window.document.getElementById('logging');
        elm.innerHTML = ""
    },
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
    gen_table: ({data, caption=null, element="result"})  => (state, actions) =>{
        content_remove_element(element);
        generate_table("table",element, data, {caption: caption});
    },
    save_keystore: (data, caption=null) => (state, actions) =>{
        let value = icx_utils.save_keystore();
        if (value.is_find === true) {
            logging_msg("Already key")
        }else if (value) {
            const option  = makeElement(document,"option", "", "");
            option.value = value.key_alias;
            option.text = value.key_alias;
            const small_text = makeElement(document, "small","","",option);
            small_text.style = "font-style: italic";
            small_text.innerHTML = " " + value.address;
            logging_msg("option", option);
            getId("keystore_sel").appendChild(option);
            state.keystore_info = getStorageValue('keystore', 'key_alias');

        }
    },
    sign: () => (state, actions) => {
        icx_utils.tx_sign();
        // let json_rpc = editor_obj.get();
        // // let selected_keystore_address =
        // delete json_rpc.params.signature;
        // json_rpc.params.nid = json_rpc.params.nid || getNetworkInfo(state).nid;
        // json_rpc.params.from = getKeystore().address;
        // json_rpc.params.to = json_rpc.params.to || "hx32b5704b766c535c34291c0d10ddd5bbd7b6b9fb";
        // json_rpc.params.nonce = json_rpc.params.nonce || icx_utils.getRandomHex();
        // json_rpc.params.stepLimit = json_rpc.params.stepLimit || "0xf4240";
        // json_rpc.params.version = json_rpc.params.version || "0x3";
        // json_rpc.params.timestamp = icx_utils.nowUnixtimeHex();
        // json_rpc.params.value = json_rpc.params.value || "0x38d7ea4c68000";
        //
        // let {selected_method, selected_group} = icx_utils.get_selected_method();
        //
        // if (selected_group === "INS") {
        //     json_rpc = set_INS_config(json_rpc);
        //     if (arrayContains(selected_method, NOT_PAYABLE_METHODS)){
        //         json_rpc.params.value = "0x0";
        //     }
        // }
        //
        // let wallet = IconWallet.loadPrivateKey(getKeystore().pk);
        //
        // if (json_rpc.params.dataType === "message") {
        //     json_rpc.params.data = icx_utils.StringtoHex(json_rpc.params.data);
        // }
        // let signature = wallet.sign(serialize(json_rpc.params));
        // logging_msg("signature", signature);
        // json_rpc.params.signature = signature;
        // editor_obj.set(json_rpc);
        // logging_msg("signing", json_rpc.params);
    },
    call_api_payload: () => (state, actions) => {
        try {
            let payload = editor_obj.get();

            // let template_obj = new iconTemplateMethod()
            let selected_method = getIdValue("methods");
            // let method_group = template_obj.get_info(selected_method).group;
            // if (method_group === "INS") {
            //     payload.to = INS_SETTINGS[getNetworkInfo(state).network_name].score_address;
            // }

            let api_path = "/api/v3";
            if (payload.method.includes("node")) {
                api_path =  "/api/node";
            }else if (payload.method === "debug_estimateStep" || payload.method === "debug_getAccount" ) {
                api_path =  "/api/debug/v3";
            }
            icx_utils.call_api_payload(payload, api_path).then(function (data) {
                icx_utils.logging_msg(selected_method + " = ", JSON.stringify(data, undefined, 4));
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
    sign_call_api_payload: () => (state, actions) => {
        try {
            icx_utils.tx_sign();
            let payload = editor_obj.get();
            let selected_method = getIdValue("methods");
            let api_path = "/api/v3";
            if (payload.method.includes("node")) {
                api_path =  "/api/node";
            }else if (payload.method === "debug_estimateStep" || payload.method === "debug_getAccount" ) {
                api_path =  "/api/debug/v3";
            }
            icx_utils.call_api_payload(payload, api_path).then(function (data) {
                icx_utils.logging_msg(selected_method + " = ", JSON.stringify(data, undefined, 4));
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
    icx_getTransactionResult: () => (state, actions) => {
        if (state.inputA === "" || state.inputA === undefined){
            logging_msg("TX not found");
            return
        }
        try {
            let count = 0;
            logging_msg("count :", count);

                icx_utils.call_api("icx_getTransactionResult", false, {txHash: (state.inputA || '').trim()}).then(function (data) {
                    icx_utils.logging_msg('icx_getTransactionResult ->' + state.inputA, data);

                    if (data.result && data.result.failure.message) {
                        try {
                            if (data.result.failure.message.indexOf("Out of balance") !== -1) {
                                data.result.failure.OOB = [];
                                let failure_msg = data.result.failure.message.split(":");
                                failure_msg[1].split(" ").forEach(function (msg) {
                                    let key_value = msg.split("=");
                                    if (key_value[1]) {
                                        data.result.failure.OOB[key_value[0]] = key_value[1];
                                    }
                                });

                            }
                        } catch (error) {
                            actions.error(error);
                        }



                    }
                    actions.gen_table(
                        {
                            data: icx_utils.flatten(data.result),
                            caption: "Transaction Result" + "<small style='color:gray'> " + nowdate() + "</small>"
                        }
                    )

                });


        } catch (error) { actions.error(error); }
    },
    icx_getTransactionByHash: () => (state, actions) => {
        if (state.inputA === "" || state.inputA === undefined){
            logging_msg("TX not found");
            return
        }
        try {
            icx_utils.call_api("icx_getTransactionByHash", false, {txHash:(state.inputA || '').trim() }).then(function(data) {
                icx_utils.logging_msg('icx_getTransactionByHash ->'+ state.inputA, data);
                actions.gen_table(
                    {
                        data: icx_utils.flatten(data.result),
                        caption: "Transaction Data" + "<small style='color:gray'> " + nowdate() + "</small>"
                    }
                )

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
    import_privateKey: () => (state, actions) => {
        try {
            let private_key = getIdValue("private_key");
            let wallet = IconWallet.loadPrivateKey(private_key);
            icx_utils.logging_msg("IconWallet.create()" , "addrerss: " +wallet.getAddress()  + "\nPrivateKey: " + wallet.getPrivateKey());
            let password = getIdValue("key_password");
            let keystore = wallet.store(password);
            icx_utils.logging_msg("Generate KeyStore json: password - "+password, keystore);
            actions.gen_table(icx_utils.flatten(keystore));
            content_remove_element("keystore_result");
            generate_table("keystore_table",
                "keystore_result",
                { raw: keystore, address: keystore.address },
                {
                    editable: true,
                    default_data: { "password":"", "key_alias":"", "raw":"", "address":""},
                    disable_keys: ["raw", "address"],
                    reverse: true
                }
            );
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

            content_remove_element("keystore_result");

            generate_table("keystore_table",
                "keystore_result",
                { raw: keystore, address: keystore.address },
                {
                    editable: true,
                    default_data: { "password":"", "key_alias":"", "raw":"", "address":""},
                    disable_keys: ["raw", "address"],
                    reverse: true
                }
            );
        } catch (error) { actions.error(error); }
    },
    get_ins_address:  () => (state, actions) => {
        let ins_address = getIdValue("ins_address").trim();
        let payload_data = state.template_obj.get_info("getNameStatus").payload;
        payload_data.params.to = get_ins_score_address();
        payload_data.params.data.params._ins_name = ins_address;
        let func_name = "get_ins_address";
        try {
            actions.logging(func_name);
            icx_utils.call_api_payload(payload_data).then(function(data) {
                logging_msg(func_name, JSON.stringify(data, undefined, 4));
                let result = icx_utils.flatten(data.result);
                actions.gen_table(
                    {
                        data: result,
                        caption: func_name + "&nbsp;<small style='color:white'> " + nowdate() + "</small>",
                        element: "ins_result"
                    }
                );
            });
        } catch (error) {
            actions.error(error);
        }


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
            logging_msg(`eval("${state.inputB || ''}")`, `${eval(state.inputB || '')}`);

        } catch (error) { actions.error(error); }
    },
    error: val => (state, actions) => {
        logging_msg("catch error ", JSON.stringify(val) + JSON.stringify(actions));
        // remove_element("table");
        actions.logging(String(val.message));
    },
    update_unixtime: ({e=null, val=null}) => (state, actions) =>{
        // logging_msg(val,e);
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


export { actions }
// module.exports = actions
