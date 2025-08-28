const express = require("express");
const app = express();
const sql = require("../config/sql");
const YahooFinance = require("yahoo-finance2").default;

 async function updateShareValue(share_id){
    let share;
    try {
        share = await (sql.Shares).findOne({
            where: {id: share_id}
        });
    } catch(err) {
        console.error("Unable to get stock", err);
    }
    const result = await YahooFinance.quote(share.tag);
    let currentShareValue = result.bid * share.amount_owned;
    try {
        let update = await (sql.Shares).update(
            { ask: result.ask, bid: result.bid, total_value: currentShareValue },
            { where: { id: share_id } }
        );
        return currentShareValue;
    }
    catch(err) {
        console.error("Error updating share: ", err);
    }
 }
 async function updatePortfolioValue(uuid) {
    try {
        let shares = await (sql.Shares).findAll({
            where: {portfolio_uuid: uuid}
        });

        var portValue = 0;

        for(let i = 0; i < shares.length; i++) {
            let shareValue = await updateShareValue(shares[i].id);
            portValue += shareValue;
        }

        try {
            return await (sql.Portfolio).update(
                { value: portValue.ask },
                { where: { uuid: uuid } }
            );
        } catch (err) {
            console.error("Error updating portfolio table: ", err);
        }
    } catch(err) {
        console.error("Error updating portfolio: ", err);
    }
 }
 async function updateOwnersPortfolios(uuid) {
    try {
        let portfolios = await (sql.Portfolio).findAll({
            where: {owner_uuid: uuid}
        });
        for(let i = 0; i < portfolios.length; i++) {
            return await updatePortfolioValue(portfolios[i].uuid);
        }
    } catch (err) {
        console.error("Error updating users portfolios: ", err);
    }
 }
 async function logTransaction(sell, amount, stockAmount, price_per, currency, tag, portfolio_uuid, owner_uuid) {
    let buy_or_sell;
    if(sell) buy_or_sell = "sell";
    else buy_or_sell = "buy";

    const newLog = {
        buy_sell: buy_or_sell,
        amount: amount,
        stock_traded: stockAmount,
        price_per: price_per,
        currency: currency,
        stock_tag: tag,
        portfolio_uuid: portfolio_uuid,
        owner_uuid: owner_uuid
    };
    return await (sql.TransactionLog).create(newLog);
 }
async function clearDefaultPortfolio(owner_uuid) {
    return await (sql.Portfolio).update(
        { isDefault: false },
        { where: { owner_uuid: owner_uuid } }
    );
}
async function createUser(user) {
    try {
        let userCheck = await (sql.Users).findAll({
            attributes: ['uuid'],
            where: {username: user.username}
        });
        if(userCheck.length == 0) {
            return await (sql.Users).create(user);
        }
        else{
            console.error("User of that username already exists");
        }
    } catch(err) {
        console.error("Error regisetering user");
    }
}
async function getAllUsers() {
    return await (sql.Users).findAll();
}
async function verifyLogin(user) {
    return await (sql.Users).findAll({
        attributes: ['uuid'],
        where: {username: user.username, password: user.password}
    });
}
async function getPortfolio(user) {
    return await (sql.Portfolio).findAll({
        where: {owner_uuid: user.uuid}
    });
}
async function getPortfolioUUID(uuid) {
    return await (sql.Portfolio).findAll({
        where: {owner_uuid: uuid}
    });
}
async function getUserPreferedCurrency(user) {
    return await (sql.Users).findAll({
        attributes: ['prefered_currency'],
        where: {uuid : user.uuid}
    });
}
async function getUserPreferedCurrencyUUID(uuid) {
    let user = await (sql.Users).findOne({
        attributes: ['prefered_currency'],
        where: {uuid : uuid}
    });
    return user.prefered_currency;
}
async function createPortfolio(name, owner_uuid, prefered_currency, isDefault) {
    try {
        const portfolios = await getPortfolioUUID(owner_uuid);
        if(isDefault && portfolios.length > 0)
        {
            await (sql.Portfolio).update(
                { isDefault: false },
                { where: { owner_uuid: owner_uuid } }
            );
        }
        else if(portfolios.length == 0 && !isDefault){
            isDefault = true;
        }
        const newPortfolio = {
            owner_uuid: owner_uuid,
            name: name,
            prefered_currency: prefered_currency,
            is_default: isDefault
        };
        return await (sql.Portfolio).create(newPortfolio);
    } catch(err) {
        {
            console.error("Error finding user:", err);
        }
    }
}
async function updatePortfolio(name, isDefault, portfolio_uuid, owner_uuid) {
    try {
        if(name) {
            await (sql.Portfolio).update(
                { name: name },
                { where: [{ uuid: portfolio_uuid }, {owner_uuid: owner_uuid}] }
            );
        }
        if(isDefault) {
            const clear = await clearDefaultPortfolio(owner_uuid);
            await (sql.Portfolio).update(
                { is_default: isDefault },
                { where: [{ uuid: portfolio_uuid }, {owner_uuid: owner_uuid}] }
            );
        }
        return 1;
    }
    catch (err) {
        console.error("Error updating portfolio:", err);
    }
}  
async function checkIfPortfolioEmpty(portfolio_uuid, owner_uuid) {
    try {
        const share = await (sql.Shares).findAll({
            where: {owner_uuid: owner_uuid, portfolio_uuid: portfolio_uuid}
        });
        if(share.length == 0){
            return true;
        }
        return false;
    } catch (err) {
        console.error("Error getting shares:", err);
    }
}
async function deletePortfolio(portfolio_uuid, owner_uuid) {
    return await (sql.Portfolio).destroy({
        where: {owner_uuid: owner_uuid, uuid: portfolio_uuid}
    });
}
async function getPortfolioValue(portfolio_uuid, owner_uuid) {
    try {
        const share = await (sql.Shares).findAll({
            where: {owner_uuid: owner_uuid, portfolio_uuid: portfolio_uuid}
        });
        let totalValue = 0;
        for(let i = 0; i < share.length; i++) {
            totalValue += share[i].total_value;
        };
        await (sql.Portfolio).update(
            { value: totalValue },
            { where: [{ uuid: portfolio_uuid }, {owner_uuid: owner_uuid}] }
        );
        return totalValue;
    } catch (err) {
        console.error("Error getting value:", err);
    }
}
async function getPortfolioReturn(portfolio_uuid, owner_uuid) {
    try {
        const value = await getPortfolioValue(portfolio_uuid, owner_uuid);
        const portfolio = await (sql.Portfolio).findOne({
            attributes: ['inputValue'],
            where: {uuid: portfolio_uuid, owner_uuid: owner_uuid}
        });
        return value - portfolio.inputValue;
    } catch (err) {
        console.error("Error getting value:", err);
    }
}
async function getPortfolioReturnPercentage(portfolio_uuid, owner_uuid) {
    try {
        const value = await getPortfolioValue(portfolio_uuid, owner_uuid);
        const portfolio = await (sql.Portfolio).findOne({
            attributes: ['inputValue'],
            where: {uuid: portfolio_uuid, owner_uuid: owner_uuid}
        });
        return 1 + ((value - portfolio.inputValue)/portfolio.inputValue);
    } catch (err) {
        console.error("Error getting value:", err);
    }
}
async function getUserMoney(uuid) {
    try {
        let user = await (sql.Users).findOne({
            attributes: ['money'],
            where: {uuid: uuid}
        });
        return user.money;
    }
    catch (err) {
        console.error("Error getting user money:", err);
    }
}
async function buyStock(tag, cost, amount, owner_uuid, portfolio_uuid) {
    try {
        let stock = await (sql.Shares).findOne({
            where: {tag: tag, owner_uuid: owner_uuid, portfolio_uuid: portfolio_uuid}
        });
        if(stock) {
            var newInvestment = stock.total_invested + cost;
            var newAmount = stock.amount_owned + amount;
            try {
                let update = await (sql.Shares).update(
                    { total_invested: newInvestment, amount_owned:newAmount },
                    { where: {id: stock.id} }
                );
                try{
                    return await updatePortfolioValue(stock.portfolio_uuid);
                } catch (err) {
                    console.error("Error updating portfolio: ", err);
                }
            } catch (err) {
                console.error("Error updating shares tables: ", err);
            }
        }
    } catch(err) {
        console.error("Error buying more stocks: ", err);
    }
    try {
        const result = await YahooFinance.quote(tag);
        const searchResult = await YahooFinance.search(tag);
        const currentValue = parseFloat(result.bid) * amount;
        const share = {
            tag: tag,
            portfolio_uuid: portfolio_uuid,
            owner_uuid: owner_uuid,
            name: searchResult.quotes[0].shortname,
            current_ask: result.ask,
            current_bid: result.bid,
            amount_owned: amount,
            total_invested: cost,
            total_value: currentValue,
            currency: await getUserPreferedCurrencyUUID(owner_uuid)
        }
        return await (sql.Shares).create(share);
    } catch (err) {
        console.error("Error buying share:", err);
    }
}
async function spendMoney(amount, uuid) {
    try {
        let user = await (sql.Users).findOne({
            attributes: ['money'],
            where: {uuid: uuid}
        });

        let money = user.money;

        money -= amount;

        return await (sql.Users).update(
            { money: money },
            { where: {uuid: uuid} }
        );
    } catch (err) {
        console.error("Error spending money:", err);
    }
}
async function gainMoney(amount, uuid) {
    try {
        let user = await (sql.Users).findOne({
            attributes: ['money'],
            where: {uuid: uuid}
        });

        let money = user.money;

        money += amount;

        return await (sql.Users).update(
            { money: money },
            { where: {uuid: uuid} }
        );
    } catch (err) {
        console.error("Error spending money:", err);
    }
}
async function hasAPortfolio(uuid) {
    try {
        const portfolio = await (sql.Portfolio).findAll({
            where: {owner_uuid: uuid}
        });
        if(portfolio.length == 0){
            return flase;
        }
        return true;
    } catch (err) {
        console.error("Error getting portfolios:", err);
    }
}
async function getDefaultPortfolio(uuid) {
    try {
        return await (sql.Portfolio).findOne({
            attributes: ['uuid'],
            where: {owner_uuid: uuid, is_default: true}
        });
    } catch (err) {
        console.error("Error getting default portfolios:", err);
    }
}
async function findStocksPortfolio(tag, uuid) {
    try {
        return await (sql.Shares).findAll({
            attributes: ['portfolio_uuid'],
            where: {owner_uuid: uuid, tag: tag}
        });
    } catch (err) {
        console.error("Error getting portfolios:", err);
    }
 }
 async function verifyStock(tag, uuid, portfolio_uuid) {
    try {
        let stock = await (sql.Shares).findAll({
            attributes: ['portfolio_uuid'],
            where: {owner_uuid: uuid, tag: tag, portfolio_uuid: portfolio_uuid}
        });
        if(stock) return true;
        else return false;
    } catch (err) {
        console.error("Error getting portfolios:", err);
    }
 }
 async function verifyStockPrice(tag, uuid, portfolio_uuid, amount) {
    try {
        let stockAmount = await (sql.Shares).findAll({
            attributes: ['total_value'],
            where: {owner_uuid: uuid, tag: tag, portfolio_uuid: portfolio_uuid}
        });
        if( amount > stockAmount) {
            console.log("Amount trying to sell is greater than amount owned, Adjusting...");
            return stockAmount;
        }
        else {
            return amount;
        }
    } catch (err) {
        console.error("Error verifying price: ", err);
    }
 }
  async function verifyStockAmount(tag, uuid, portfolio_uuid, amount) {
    try {
        let stockAmount = await (sql.Shares).findAll({
            attributes: ['amount_owned'],
            where: {owner_uuid: uuid, tag: tag, portfolio_uuid: portfolio_uuid}
        });
        if( amount > stockAmount) {
            console.log("Amount trying to sell is greater than amount owned, Adjusting...");
            return stockAmount;
        }
        else {
            return amount;
        }
    } catch (err) {
        console.error("Error verifying amount: ", err);
    }
 }
 async function sellStock(tag, uuid, portfolio_uuid, stockAmount) {
    try {
        let stock = await (sql.Shares).findOne({
            attributes: ['amount_owned'],
            where: {owner_uuid: uuid, tag: tag, portfolio_uuid: portfolio_uuid}
        });
        if(stock.amount_owned == stockAmount) {
            return await (sql.Shares).destroy({
                where: {owner_uuid: uuid, tag: tag, portfolio_uuid: portfolio_uuid}
            });
        }
        else {
            let percentSold = 1 - (stockAmount/stock.amount_owned);
            let newStock = await (sql.Shares).findOne({
                attributes: ['total_invested'],
                where: {owner_uuid: uuid, tag: tag, portfolio_uuid: portfolio_uuid}
            });
            let newValueIn = newStock.total_invested * percentSold;
            let amountLeft = stock.amount_owned - stockAmount;
            return await (sql.Shares).update(
                { amount_owned: amountLeft, total_invested:  newValueIn},
                { where: {owner_uuid: uuid, tag: tag, portfolio_uuid: portfolio_uuid }}
            );
        }
    } catch (err) {
        console.error("Error verifying amount: ", err);
    }
 }
 async function getBalance(uuid) {
    try {
        return await (sql.Users).findAll({
            attributes: ['money'],
            where: {uuid: uuid}
        });
    } catch (err) {
        console.error("Error getting balance: ", err)
    }
 }
 async function getAllShares(owner_uuid, portfolio_uuid) {
    if(portfolio_uuid != "") {
        try {
            return await (sql.Shares).findAll({
                where: {owner_uuid: owner_uuid, portfolio_uuid: portfolio_uuid}
            });
        } catch (err) {
            console.error("Error getting portfolio shares: ", err);
        }
    }
    else {
        try {
            return await (sql.Shares).findAll({
                where: {owner_uuid: owner_uuid}
            });
        } catch (err) {
            console.error("Error getting all users shares: ", err);
        }
    }
 }
 async function getLogs(owner_uuid) {
    try {
        return await (sql.TransactionLog).findAll({
           where: {owner_uuid: owner_uuid}
        });
    } catch (err) {
        console.error("Error getting portfolio shares: ", err);
    }
 }
module.exports = {
    createUser,
    getAllUsers,
    verifyLogin,
    getPortfolio,
    getUserPreferedCurrency,
    createPortfolio,
    getPortfolioUUID,
    updatePortfolio,
    checkIfPortfolioEmpty,
    deletePortfolio,
    getPortfolioValue,
    getPortfolioReturn,
    getPortfolioReturnPercentage,
    getUserMoney,
    buyStock,
    spendMoney,
    hasAPortfolio,
    getDefaultPortfolio,
    findStocksPortfolio,
    verifyStock,
    verifyStockPrice,
    verifyStockAmount,
    sellStock,
    gainMoney,
    getBalance,
    updateOwnersPortfolios,
    getAllShares,
    getLogs,
    logTransaction
}