const express = require('express')
const app = express()
const port = 3000
const routes = require('./routes/routes');

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/', routes);

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use((req, res, next) => {
    //always log first and then catch error afterwards
    console.log(`${req.requestTime} with method ${req.method} and path ${req.path} from ${req.get('User-Agent')}`);
    next();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))