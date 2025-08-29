const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
const controller = require("./backend/src/controllers/middlewareControllers")

//Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static("frontend/public"));
app.use("/css", express.static("frontend/css"));
app.use("/js", express.static("frontend/js"));
app.use("/images", express.static("frontend/assets/images"));
app.use("/fonts", express.static("frontend/assets/fonts"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

//Routes
app.use('/', require('./backend/src/routes/apiRoutes'));
app.use('/', require('./backend/src/routes/buySellRoutes'));
app.use('/', require('./backend/src/routes/middlewareRoutes'));
app.use('/', require('./backend/src/routes/portfolioRoutes'));
app.use('/', require('./backend/src/routes/userRoutes'));
app.use('/', require('./backend/src/routes/authRoutes'));


/*
    Cron job to update all share prices every minute
*/
const CRON_INTERVAL_MS = 60 * 1000;
setInterval(controller.updateAll, CRON_INTERVAL_MS);

/*
    Middleware to add request time to request object
*/
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/*
    Middleware to log request details
*/
app.use((req, res, next) => {
  console.log(
    `${req.requestTime} with method ${req.method} and path ${
      req.path
    } from ${req.get("User-Agent")}`
  );
  next();
});

/*
    Start the server
*/
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
