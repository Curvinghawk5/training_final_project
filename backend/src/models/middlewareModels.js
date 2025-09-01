const sql = require("../config/sql");
const axios = require("axios");
const YahooFinance = require("yahoo-finance2").default;
const userModels = require("./userModels");

//////////////////////////////////////////////////////////////
//These handle all model functions related to the middleware//
//////////////////////////////////////////////////////////////

///////////Use Functions///////////

/*
    Converts the input currency into the target currency
    @param {number} amount - The amount of money to convert
    @param {string} current - The currency of which the money is currently in
    @param {string} target - The currency of which the money would like to be in
    @return {number} - The amount of money in the target currency
*/
async function convertCurrency(amount, current, target) {
    try {
        const response = await axios.get(`https://2024-03-06.currency-api.pages.dev/v1/currencies/${current}.json`);
        const rate = response.data[current][target];
        const returnAmount = amount * rate;
        return returnAmount;
    } catch (err) {
        console.log('Error:', err);
        return;
    }
}

/*
    Completly cleans all of the databases
*/
async function cleanDb() {
    try {
        await (sql.Users).destroy({ where: {}, truncate: true });
    } catch (err) {
        console.error("Unable to clean Users table", err);
        return;
    }
    try {
        await (sql.Portfolio).destroy({ where: {}, truncate: true });
    } catch (err) {
        console.error("Unable to clean Portfolio table", err);
        return;
    }
    try {
        await (sql.Shares).destroy({ where: {}, truncate: true });
    } catch (err) {
        console.error("Unable to clean Shares table", err);
        return;
    }
    try {
        await (sql.TransactionLog).destroy({ where: {}, truncate: true });
    } catch (err) {
        console.error("Unable to clean TransactionLog table", err);
        return;
    }
    return;
}




///////////Update Functions///////////

/*
    Updates the values of a share based on latest information
    @param {number} share_id - The unique id number of the share in the Shares table
    @return {number} - The current total value of the share
*/
async function updateShareValue(share_id){
    let share;
    //Find the share
    try {
        share = await (sql.Shares).findOne({
            where: {id: share_id}
        });
    } catch(err) {
        console.error("Unable to get stock", err);
        return;
    }
    
    //Get up to date info
    let result;
    let userCurrency;
    try {
        result = await YahooFinance.quote(share.tag);
    } catch(err) {
        console.error("Error getting stock info from Yahoo: ", err);
        return;
    }

    try {
        userCurrency = await userModels.getUserPreferedCurrencyUUID(share.owner_uuid);
    } catch(err) {
        console.error("Error getting users prefered currency: ", err);
        return;
    }

    //Get currency and buy and sell prices
    let buyCurrency = (result.currency).toLowerCase()
    let ask = result.ask
    let bid = result.bid

    let closed = false;

    if(ask == 0 && bid == 0) {
        closed = true;
        ask = share.ask;
        bid = share.bid;
    }

    //Convert currency if needed
    if(buyCurrency != userCurrency)
    {
        try {
            ask = await convertCurrency(ask, buyCurrency, userCurrency);
        } catch(err) {
            console.error("Error converting ask currency: ", err);
            return;
        }
        try {
            bid = await convertCurrency(bid, buyCurrency, userCurrency);
        } catch(err) {
            console.error("Error converting bid currency: ", err);
            return;
        }
       share.total_invested = await convertCurrency(share.total_invested, buyCurrency, userCurrency);
    }

    //Update the share
    let currentShareValue = bid * share.amount_owned;
    try {
        let update = await (sql.Shares).update(
            { ask: ask, bid: bid, total_value: currentShareValue, total_invested: share.total_invested, currency: userCurrency, closed: closed },
            { where: { id: share_id } }
        );
        return currentShareValue;
    }
    catch(err) {
        console.error("Error updating share: ", err);
        return;
    }
}

/*
    Updates the value of a portfolio based on the values of its shares
    @param {string} uuid - The unique uuid of the portfolio in the Portfolio table
    @return {object} - The response from the sql update command
*/
async function updatePortfolioValue(uuid) {
    try {
        //Get all shares in the portfolio
        let shares = await (sql.Shares).findAll({
            where: {portfolio_uuid: uuid}
        });

        var portValue = 0;
        var portInvested = 0;

        //Update each share and add to the portfolio value
        for(let i = 0; i < shares.length; i++) {
            let shareValue;
            try {
                shareValue = await updateShareValue(shares[i].id);
            } catch (err) {
                console.error("Error updating share value: ", err);
                return;
            }
            portValue += shareValue;
            portInvested += shares[i].total_invested;
        }

        try {
            //Update the portfolio
            return await (sql.Portfolio).update(
                { value: portValue, inputValue: portInvested },
                { where: { uuid: uuid } }
            );
        } catch (err) {
            console.error("Error updating portfolio table: ", err);
            return;
        }
    } catch(err) {
        console.error("Error updating portfolio: ", err);
        return;
    }
}

/*
    Updates all portfolios owned by a user
    @param {string} uuid - The unique uuid of the user in the Users table
    @return {object} - The response from the sql update command
*/
async function updateOwnersPortfolios(uuid) {
    try {
        //Get all portfolios owned by the user
        let portfolios = await (sql.Portfolio).findAll({
            where: {owner_uuid: uuid}
        });
        //Update each portfolio
        for(let i = 0; i < portfolios.length; i++) {
            let update;
            try {
                update = await updatePortfolioValue(portfolios[i].uuid);
            } catch (err) {
                console.error("Error updating portfolio value: ", err);
                return;
            }
        }
        return;
    } catch (err) {
        console.error("Error updating users portfolios: ", err);
        return;
    }
}

/*
    Updates all stocks in the database
    @return {boolean} - True if successful, false if error
*/  
async function updateAllStocks() {
    try {
        //Get all users
        let users = await (sql.Users).findAll({});
        //Update each users portfolios
        for(let i = 0; i < users.length; i++) {
            let update;
            try {
                update = await updateOwnersPortfolios(users[i].uuid);
            } catch (err) {
                console.error("Error updating portfolio value: ", err);
                return;
            }
        }
    } catch(err) {
        console.error("Error updating stocks: ", err);
        return;
    }
    return true;
}

/*
    Updates the preferred currency of a user and all their shares and portfolios
    @param {string} preferedCurrency - The new preferred currency of the user
    @param {string} uuid - The unique uuid of the user in the Users table
    @return {object} - The response from updating all of the users portfolios
*/
async function updatePreferredCurrency(preferedCurrency, uuid) {
    try {
        //Verify that the currency is valid
        const response = await axios.get(`https://2024-03-06.currency-api.pages.dev/v1/currencies/${current}.json`);
        try {
           const rate = response.data[current][target];
        } catch(err) {
           console.error("Invalid currency: ", err);
           return;
        }
    } catch(err) {
        console.error("Error getting new currency: ", err);
        return;
    }
    try {
        //Update all shares to the new currency
        let updateShare = await (sql.Shares).update(
            { currency: preferedCurrency},
            { where: {owner_uuid: uuid,}}
        );
    } catch(err) {
        console.error("Error updating shares preferred currency: ", err);
        return;
    }
    try {
        //Update all portfolios to the new currency
        let updatePortfolio = await (sql.Portfolio).update(
            { currency: preferedCurrency},
            { where: {owner_uuid: uuid,}}
        );

    } catch(err) {
        console.error("Error updating portfolio preferred currency: ", err);
        return;
    }
    try {
        //Update the user to the new currency
        let updateUser = await (sql.Users).update(
            { preferedCurrency: preferedCurrency},
            { where: {uuid: uuid,}}
        );
    } catch(err) {
        console.error("Error updating users preferred currency: ", err);
        return;
    }
    //Update all of the users portfolios to reflect the new currency
    return updateOwnersPortfolios(uuid);
}

module.exports = {
    //Use Functions//
    convertCurrency,
    cleanDb,

    //Update Functions//
    updateShareValue,
    updatePortfolioValue,
    updateOwnersPortfolios,
    updateAllStocks,
    updatePreferredCurrency
}