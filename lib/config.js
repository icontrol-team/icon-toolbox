
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

]

export const APP_VERSION = "v0.18"

export const INS_SETTINGS = {
    "bicon": {
        // "score_address" : "cxdd3154d0c41add59b5d8d96ce5f05b18d08347db"
        "score_address" : "cx7c03613dcf71dc1d10ac3f854338e89f4061a7b3"
    }
}

export const NOT_PAYABLE_METHODS = [
    "setPrice",
    "setInsServiceAdmin",
    "setServiceAvailable",
    "setDelegation",
    "voteProposal",
]

export const INS_ADMIN_METHODS = [
    "setInsServiceAdmin",
    "getInsServiceAdmin",
    "setServiceAvailable",
    "getServiceAvailable",
    "reserveINS"
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


