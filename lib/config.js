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


]

export const APP_VERSION = "v0.24"

export const INS_SETTINGS = {
    "bicon": {
        "score_address" : "cxd152d423789040a04a0e651285e4de90d0c9778a"
    }
}

export const REWARD_SETTINGS = {
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
    "reserveINS",
    "updateINS",
    "modifyINS",
    "setRewardScoreAddr",
    "setInsScoreAddr",
    "setRewardCondition",
    "openCard",
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
        "setRewardScoreAddr"
    ]
}


