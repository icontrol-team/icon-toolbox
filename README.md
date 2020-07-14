## icon-toolbox

[![ICON badge](https://img.shields.io/badge/ICON-TROL-blue?logoColor=white&logo=icon&labelColor=31B8BB)](http://icontrol.id)


This tool is intended to help developers develop. <br>
All functions are implemented in javascript and can be executed without a server.
   

![exec_donate](img/icon-toolbox.gif)


### Supported functions
1. Generate to QR-CODE
2. Unit Converter 
    > Number <-> Hex <br>
    Unixtime <-> Hex <br>
    text <-> base64 <br>

3. Call ICON's API
    > `getIISSinfo` , `icx_getTotalSupply`, `icx_getLastBlock`, `icx_getBalance` <br>
    `icx_getTransactionResult`, `icx_getTransactionByHash` <br>
    `icx_getBlockByHeight` 

    > Post data is created using `axios` and then transmitted. Supported APIs will be added. <br>
    You can change the network settings through selectbox.
                                                                                                                                                                                           
4. Key generator


### How to build

```bash
$ npm install --save
$ npm run build
$ npm start

```


### Reference

https://www.icondev.io/docs/icon-json-rpc-v3
