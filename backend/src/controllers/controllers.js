const YahooFinance = require("yahoo-finance2").default;
const model = require("../models/models");
const axios = require("axios");
const jwt = require('jsonwebtoken');

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

async function buyStocks(req, res) {
    const {tag} = req.params;
    const {stockAmount, priceAmount, currency} = req.body;
    if((stockAmount && priceAmount) || (!stockAmount && !priceAmount)) {
        res.status(400).json({message: "Please input either stock amount or price amount"});
    }
    const result = await YahooFinance.quote(tag);
    const searchResult = await YahooFinance.search(tag);

    let stockPrice = result.ask;
    let buyCurrency = (result.currency).toLowerCase()
    if(buyCurrency != currency)
    {
       stockPrice = await convertCurrency(result.ask, buyCurrency, currency);
    }

    if(stockAmount) {
        let amount = stockPrice * stockAmount;
        res.status(200).json({message: `Bought ${stockAmount} shares for ${amount} ${currency} of ${searchResult.quotes[0].shortname} at ${stockPrice} ${currency} per share`});
    }
    else {
        let noOfStocks = priceAmount / stockPrice;
        res.status(200).json({message: `Bought ${noOfStocks} shares for ${priceAmount} ${currency} of ${searchResult.quotes[0].shortname} at ${stockPrice} ${currency} per share`});
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
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});
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
    getUsersPortfolio
}