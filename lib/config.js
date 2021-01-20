
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
    "setPrice"
]

export const APP_VERSION = "v0.14"

export const INS_SETTINGS = {
    "bicon": {
        // "score_address" : "cxdd3154d0c41add59b5d8d96ce5f05b18d08347db"
        "score_address" : "cxe295b2cbf3de81886a46264dc5c55c254d0becd5"
    }
}

export const NOT_PAYABLE_METHODS = [
    "setPrice",
    "setInsServiceAdmin"
]
