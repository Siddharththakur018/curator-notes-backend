const CREDIT_TOKEN_RATIO = 100;

const calculateCreditFromTokens = (totalTokens = 0) => {
    return Math.max(1,Math.ceil(totalTokens / CREDIT_TOKEN_RATIO))
}

const estimateTokens = (text = "") => {
    return Math.ceil(text.length / 4)
}



module.exports = {
    calculateCreditFromTokens,
    estimateTokens
}
