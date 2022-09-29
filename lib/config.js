export const AVAIL_SIGN_METHODS = [
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
    "withdraw",
    "reserveINS",
    "modifyINS",
    "setRewardScoreAddr",
    "setInsScoreAddr",
    "setRewardCondition",
    "openCard",
    "setBonderList",
    "setBond",
    "cancelProposal",


]

export const DEFAULT_STEP_LIMIT = "0x509356ff81800"
export const APP_VERSION = "v0.33"

export const INS_SETTINGS = {
    "mainnet": {
       "score_address": "cxccdec2d5a8072bf24478d58d86caf457b6b91ff7"
    },
    "bicon": {
        "score_address" : "cxd152d423789040a04a0e651285e4de90d0c9778a"
    }
}

export const REWARD_SETTINGS = {
    "mainnet": {
        "score_address": "cxf348c998ccefbc04b8d51a7c903ee6433ab6cfab"
    },
    "bicon": {
        "score_address" : "cxb18f2329bbf1e17b2ffb5fc28febe8fd3419ee0d"
    }
}

export const NOT_PAYABLE_METHODS = [
    "setPrice",
    "setInsServiceAdmin",
    "setServiceAvailable",
    "setDelegation",
    "voteProposal",
    "cancelProposal",
    "reserveINS",
    "updateINS",
    "modifyINS",
    "setRewardScoreAddr",
    "setInsScoreAddr",
    "setRewardCondition",
    "openCard",
    "setBonderList",
    "setBond",
    "withdraw",

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
    "modifyINS",
    "withdraw",
    "setRewardScoreAddr",
    "setInsScoreAddr",
    "getPRepTerm",
    "getPRepStats"

]

// export const FILL_ADDRESS_PARAM = [
//     "icx_getBalance",
//     "getStake",
//     "getDelegation",
//     "queryIScore",
// ]

export const AUTO_FILL_SELECTED_KEY = {
    "params.data.params._address": [
        "getNamesByOwner",
        "getNamesByAddress",
    ],
    "params.data.params._user": [
        "getCardCount"
    ],
    "params.data.params.address": [
        "getStake",
        "getDelegation",
        "getBonderList",
        "getBond"
    ],
    "params.address": [
        "icx_getBalance",
        // "getDelegation",
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
        "setRewardScoreAddr"
    ]
}


