const YahooFinance = require("yahoo-finance2").default;
const model = require("../models/models");
const axios = require("axios");
const jwt = require('jsonwebtoken');

async function getCurrentPrice(req, res) {
    const {tag} = req.params;
    const result = await YahooFinance.quote(tag);
    res.status(200).json({ask: result.ask, bid: result.bid, currency: result.currency});
}

async function searchFincancials(req, res) {
    const {query} = req.params;
    const result = await YahooFinance.search(query);
    const quotes = [];
    for(let i = 0; i< (result.quotes).length; i++) {
        if(!(result.quotes)[i].symbol){
            continue;
        }
        try {
            let quote = await YahooFinance.quote((result.quotes)[i].symbol);
            quotes.push(quote);
        } catch (err) {
            console.error("Unable to get quote: ", err);
        }
    }
    res.status(200).json(quotes);
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

async function convertCurrency(amount, current, target) {

    try {
        const response = await axios.get(`https://2024-03-06.currency-api.pages.dev/v1/currencies/${current}.json`);
        console.log('Valid Input Currency');
        const rate = response.data[current][target];
        const returnAmount = amount * rate;
        console.log('Converted amount:', returnAmount);
        return returnAmount;
    } catch (err) {
        console.log('Error:', err);
        return null;
    }
}
async function convertCurrencyTest(req, res) {
    let convertedAmount = await convertCurrency(200, "usd", "ape");
    console.log("Final amount:", convertedAmount);
    res.status(200).json({rate: convertedAmount});
}

async function sellStocks(req, res) {
    const tag = req.params.tag;
    const owner_uuid = req.user.uuid;
    let {stockAmount, priceAmount, currency, portfolio_uuid} = req.body;

    if((stockAmount && priceAmount) || (!stockAmount && !priceAmount)) {
        res.status(400).json({message: "Please input either stock amount or price amount"});
    }
    try {
        if(!await model.hasAPortfolio(owner_uuid)) {
            res.status(400).json({message: "No portfolio!"});
        }
    } catch (err) {
        res.status(500).json({error: err});
        console.log("Error getting portfolios");
    }
    const result = await YahooFinance.quote(tag);
    const searchResult = await YahooFinance.search(tag);

    if(!portfolio_uuid || portfolio_uuid == "") {
        try {
            let portfolios = await model.findStocksPortfolio(tag, owner_uuid);
            if(portfolios.length > 1) {
                res.status(400).json({message: "Stock is in multiple portfolios, please specify"})
            }
            portfolio_uuid = portfolios[0];
        } catch (err) {
            res.status(500).json({error: err});
            console.log("Error getting portfolios");
        }
    }

    try {
        if(!(await model.verifyStock(tag, owner_uuid, portfolio_uuid))) {
            res.status(400).json({message: "Unable to verify stock"})
        }
    } catch (err) {
         res.status(500).json({error: err});
        console.log("Error verifying stocks");
    }

    let stockPrice = result.bid;
    let buyCurrency = (result.currency).toLowerCase()
    if(buyCurrency != currency)
    {
       stockPrice = await convertCurrency(result.ask, buyCurrency, currency);
    }

    if(stockAmount) {
        try {
            stockAmount = await model.verifyStockAmount(tag, owner_uuid, portfolio_uuid, stockAmount);
        } catch (err) {
            res.status(500).json({error: err})
            console.log("Error verifying stock amount")
        }
        priceAmount = stockPrice * stockAmount;
    }
    else {
        try {
            priceAmount = await model.verifyStockPrice(tag, owner_uuid, portfolio_uuid, priceAmount);
        } catch (err) {
            res.status(500).json({error: err})
            console.log("Error verifying price amount")
        }
        stockAmount = priceAmount / stockPrice;
    }

    try {
        await model.sellStock(tag, owner_uuid, portfolio_uuid, stockAmount)
        try {
            await model.gainMoney(priceAmount, owner_uuid)
            const log = await model.logTransaction(true, priceAmount, stockAmount, stockPrice, currency, tag, portfolio_uuid, owner_uuid);
            res.status(200).json({message: `Sold ${stockAmount} shares for ${priceAmount} ${currency} of ${searchResult.quotes[0].shortname} at ${stockPrice} ${currency} per share`});
        } catch (err) {
            res.status(500).json({error: err});
            console.log("Unable to gain money", err);
        }
    }   
    catch (err) {
        res.status(500).json({error: err});
        console.log("Unable to sell stocks", err);
    }
}

async function buyStocks(req, res) {
    const tag = req.params.tag;
    const owner_uuid = req.user.uuid;
    var {stockAmount, priceAmount, currency, portfolio_uuid} = req.body;
    if((stockAmount && priceAmount) || (!stockAmount && !priceAmount)) {
        res.status(400).json({message: "Please input either stock amount or price amount"});
    }
    try {
        if(!(await model.hasAPortfolio(owner_uuid))) {
            res.status(400).json({message: "No portfolio!"});
        }
    } catch (err) {
        res.status(500).json({error: err});
        console.log("Error getting portfolios");
    }
    const result = await YahooFinance.quote(tag);
    const searchResult = await YahooFinance.search(tag);

    if(!portfolio_uuid || portfolio_uuid == "") {
        try {
            portfolio_uuid = await model.getDefaultPortfolio(owner_uuid)
        } catch (err) {
            res.status(500).json({error: err});
            console.log("Error getting portfolios");
        }
    }

    var stockPrice = result.ask;
    console.log(stockPrice);
    let buyCurrency = (result.currency).toLowerCase()
    if(buyCurrency != currency)
    {
       stockPrice = await convertCurrency(result.ask, buyCurrency, currency);
    }

    if(stockAmount) {
        priceAmount = stockPrice * stockAmount;
    }
    else {
        stockAmount = priceAmount / stockPrice;
    }

    if(priceAmount > await model.getUserMoney(owner_uuid)) {
        res.status(400).json({message: "Not enough money"});
    }

    try {
        await model.buyStock(tag, priceAmount, stockAmount, owner_uuid, portfolio_uuid)
        try {
            await model.spendMoney(priceAmount, owner_uuid)
            const log = await model.logTransaction(false, priceAmount, stockAmount, stockPrice, currency, tag, portfolio_uuid, owner_uuid);
            res.status(200).json({message: `Bought ${stockAmount} shares for ${priceAmount} ${currency} of ${searchResult.quotes[0].shortname} at ${stockPrice} ${currency} per share`});
        } catch (err) {
            res.status(500).json({error: err});
            console.log("Unable to spend money", err);
        }
    }   
    catch (err) {
        res.status(500).json({error: err});
        console.log("Unable to buy stocks", err);
    }
}

async function createUser(req, res) {
    const user = req.body;
    model.createUser(user)
        .then(nF => res.status(201).json(nF))
        .catch(err => {
             res.status(500).json({ error: err.message });
            console.error("Error creating new film:", err);
    });
}

async function loginUser(req, res) {
    const user = req.body;
    try {
    const uuid = await model.verifyLogin(user);
    if(!uuid)  return res.status(401).json({error: "Invalid Credentials"});

    const payload = {id: uuid, username: user.username};
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "24h"});
    res.status(200).json({message: "success", token: token});
    } catch (err)
        {
            res.status(500).json({ error: err.message });
            console.error("Error returning users:", err);
        }
}

async function getAllUsers(req, res) {
    try {
    const users = await model.getAllUsers();
            res.status(200).json(users);
    } catch (err)
        {
            res.status(500).json({ error: err.message });
            console.error("Error returning users:", err);
        }
}

async function getUsersPortfolio(req, res) {
    try {
    const portfolios = await model.getPortfolio(req.user);
            res.status(200).json(portfolios);
    } catch (err)
        {
            res.status(500).json({ error: err.message });
            console.error("Error returning users:", err);
        }
}

async function createPortfolio(req, res) {
    const {name, isDefault} = req.body;
    const owner_uuid = req.user.uuid;
    const prefered_currency = model.getUserPreferedCurrency(req.user)[0];
    try {
    const result = await model.createPortfolio(name, owner_uuid, prefered_currency, isDefault);
            res.status(201).json({message: "Portfolio Created"});
    } catch (err)
        {
            res.status(500).json({ error: err.message });
            console.error("Error creating portfolio:", err);
        }
}

async function modifyPortfolio(req, res) {
    const {name, isDefault, portfolio_uuid} = req.body;
    const owner_uuid = req.user.uuid
    try {
        const update = await model.updatePortfolio(name, isDefault, portfolio_uuid, owner_uuid);
        res.status(200).json({message: "Portfolio updated successfully"});
    }
    catch (err) {
        res.status(500).json({ error: err.message });
            console.error("Error updating portfolio:", err);
    }
}

async function deletePortfolio(req, res) {
    const portfolio_uuid = req.params.portfolio_uuid;
    const owner_uuid = req.user.uuid;
    try {
        if(await model.checkIfPortfolioEmpty(portfolio_uuid, owner_uuid)) {
            await model.deletePortfolio(portfolio_uuid, owner_uuid);
            res.status(200).json({message: "Portfolio deleted successfully"});
        }
        else {res.status(400).json({message: "Portfolio is not empty"})};
    } catch (err) {
        res.status(500).json({ error: err.message });
            console.error("Error deleteing portfolio:", err);
    }
}
async function getPortfolioValue(req, res) {
    const portfolio_uuid = req.params.portfolio_uuid;
    const owner_uuid = req.user.uuid;
    try {
        let value = await model.getPortfolioValue(portfolio_uuid, owner_uuid);
        res.status(200).json({message: value});
    } catch (err) {
        res.status(500).json({ error: err.message });
            console.error("Error getting portfolio value:", err);
    }
}
async function getPortfolioReturn(req, res) {
    const portfolio_uuid = req.params.portfolio_uuid;
    const owner_uuid = req.user.uuid;
    try {
        let value = await model.getPortfolioReturn(portfolio_uuid, owner_uuid);
        res.status(200).json({message: value});
    } catch (err) {
        res.status(500).json({ error: err.message });
            console.error("Error getting portfolio value:", err);
    }
}
async function getPortfolioReturnPercentage(req, res) {
    const portfolio_uuid = req.params.portfolio_uuid;
    const owner_uuid = req.user.uuid;
    try {
        let value = await model.getPortfolioReturnPercentage(portfolio_uuid, owner_uuid);
        res.status(200).json({message: value});
    } catch (err) {
        res.status(500).json({ error: err.message });
            console.error("Error getting portfolio value:", err);
    }
}
async function depositMoney(req, res) {
    const amount = parseFloat(req.body.amount);
    const owner_uuid = req.user.uuid;
    try {
        const result = await model.gainMoney(amount, owner_uuid);
        res.status(200).json({message: "Money Deposited"});
    }
    catch (err) {
        res.status(500).json({message: "Unable to deposit money"});
    }
}
async function withdrawtMoney(req, res) {
    const amount = req.body.amount;
    const owner_uuid = req.user.uuid;
    try {
        const result = await model.spendMoney(amount, owner_uuid);
        res.status(200).json({message: "Money Withdrawn"});
    }
    catch (err) {
        res.status(500).json({message: "Unable to withdraw money"});
    }
}
async function getBalacne(req, res) {
    const owner_uuid = req.user.uuid;
    try {
        const balance = await model.getBalance(owner_uuid);
        res.status(200).json(balance);
    }
    catch (err) {
            res.status(500).json({message: "Unable to get balance"})
    }
}
async function getShares(req, res) {
    const owner_uuid = req.user.uuid;
    const portfolio_uuid = req.params.portfolio_uuid;
    try {
        const update = await model.updateOwnersPortfolios(owner_uuid);
        const result = await model.getAllShares(owner_uuid, portfolio_uuid)
        res.status(200).json(result);
    }
    catch (err) {
            res.status(500).json({message: "Unable to get shares"})
    }
}
async function getLogs(req, res) {
    return await getLogs(req.user.uuid);
}

module.exports = {
    getCurrentPrice,
    searchForCompany,
    searchNews,
    buyStocks,
    convertCurrency,
    convertCurrencyTest,
    createUser,
    getAllUsers,
    loginUser,
    getUsersPortfolio,
    createPortfolio,
    modifyPortfolio,
    deletePortfolio,
    getPortfolioValue,
    getPortfolioReturn,
    getPortfolioReturnPercentage,
    searchFincancials,
    depositMoney,
    withdrawtMoney,
    getBalacne,
    getShares,
    sellStocks,
    getLogs
}