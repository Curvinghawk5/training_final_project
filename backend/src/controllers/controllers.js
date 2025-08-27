const YahooFinance = require("yahoo-finance2").default;

async function getCurrentPrice(req, res) {
    const {tag} = req.params;
    const result = await YahooFinance.quote(tag);
    res.status(200).json({ask: result.ask, bid: result.bid, currency: result.currency});
}

async function searchForCompany(req, res) {
    const search = req.params.query;
    const result = await YahooFinance.search(search);
    res.status(200).json(result.quotes);
}

async function searchNews(req, res) {
    const search = req.params.query;
    const result = await YahooFinance.search(search);
    res.status(200).json(result.news);
}

async function buyStocks(req, res) {
    
}

module.exports = {
    getCurrentPrice,
    searchForCompany,
    searchNews,
    buyStocks
}