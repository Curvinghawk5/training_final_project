const YahooFinance = require("yahoo-finance2").default;

async function getCurrentPrice(tag) {
    const result = await YahooFinance.quote(`${tag}`);
    console.log(result.regularMarketPrice, result.currency);
}

module.exports = {
    getCurrentPrice
}