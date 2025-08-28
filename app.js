const express = require('express');
const app = express();
const port = 3000;
const routes = require('./backend/src/routes/routes');
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");

app.use(express.json());

// Serve static files from frontend directory
app.use(express.static("frontend/public"));
app.use("/css", express.static("frontend/css"));
app.use("/js", express.static("frontend/js"));
app.use("/images", express.static("frontend/assets/images"));
app.use("/fonts", express.static("frontend/assets/fonts"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/api", routes);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use((req, res, next) => {
  console.log(
    `${req.requestTime} with method ${req.method} and path ${
      req.path
    } from ${req.get("User-Agent")}`
  );
  next();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
