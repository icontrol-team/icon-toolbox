
export const AVAIL_SIGN_METHODS= [
    "icx_sendTransaction",
    "icx_sendTransaction(SCORE)",
    "claimIScore",
    "registerPRep",
    "unregisterPRep",
    "setPRep",
    "setStake",
    "setGovernanceVariables",
    "acceptScore",
    "rejectScore",
    "addAuditor",
    "removeAuditor",
    "registerProposal",
    "registerINS",
    "setInsServiceAdmin",
    "setPrice",
    "setServiceAvailable",
    "setDelegation",
    "voteProposal",
    "updateINS",
    "withdraw"

]

export const APP_VERSION = "v0.20"

export const INS_SETTINGS = {
    "bicon": {
        "score_address" : "cx363d79ed75c553950809738ccb7955d4f417f114"
    }
}

export const NOT_PAYABLE_METHODS = [
    "setPrice",
    "setInsServiceAdmin",
    "setServiceAvailable",
    "setDelegation",
    "voteProposal",
    "updateINS"
]

export const INS_ADMIN_METHODS = [
    "node_getChannelInfos",
    "node_getBlockByHeight",
    "node_getCitizens",
    "setInsServiceAdmin",
    "getInsServiceAdmin",
    "setServiceAvailable",
    "getServiceAvailable",
    "reserveINS",
    "withdraw",

]

// export const FILL_ADDRESS_PARAM = [
//     "icx_getBalance",
//     "getStake",
//     "getDelegation",
//     "queryIScore",
// ]

export const AUTO_FILL_SELECTED_KEY = {
    "params.data.params.address": [
        "getStake",
    ],
    "params.address": [
        "icx_getBalance",
        "getDelegation",
        "queryIScore",
        "debug_getAccount"
    ],
    "params.from": [
        "icx_sendTransaction",
        "registerINS",
        "icx_sendTransaction(SCORE)",
        "setStake",
        "claimIScore",
        "registerProposal",
        "setPRep",
        "voteProposal",
        "setInsServiceAdmin",
        "setServiceAvailable",
    ]
}


