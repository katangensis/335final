const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv")
dotenv.config({ path: path.resolve(__dirname, '.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const mdatabaseName = process.env.MONGO_DB_NAME;
const mcollection = process.env.MONGO_COLLECTION;
const apikey = process.env.API_KEY;
const portNumber = 5001

const databaseAndCollection = {db: mdatabaseName, collection: mcollection};
const uri = `mongodb+srv://${userName}:${password}@cluster0.fjutj1q.mongodb.net/?retryWrites=true&w=majority`;; //input uri
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const app = express(); /* app is a request handler function */
app.use(bodyParser.urlencoded({extended:false}));

app.set("views", path.resolve(__dirname, "templates"));

/* view/templating engine */
app.set("view engine", "ejs");

app.get('/', (req, res) => {
	res.render("index", {apikey})
})

app.post('/sendwatchlist', async(req, res) => {
    
    await client.connect()

    let data = req.body
    let newStock = {
        ticker: data.ticker
    }

    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newStock);
    console.log(`Application entry created with id ${result.insertedId}`);

    res.render("index", {apikey})
})


app.get('/watchlist', async (req, res) => {
  
    await client.connect();
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);
    
    const results = await cursor.toArray();
    //console.log(`Found: ${result.length} movies`);
    //console.log(result);

    await client.close();


    let stocksTable = `<table border="1"><tr><td>Stocks</td></tr>`

    //const cursor = get the stocks

    //have an array of all results
    

    results.forEach(elem => {
        let link = `<a href='https://www.tradingview.com/symbols/${elem.ticker}' target='_blank'>${elem.ticker} &#10140;</a>`
        stocksTable += `<tr><td>${link}</td></tr>`
    })

    stocksTable += "</table>"
    /*let variables = {
        stocksTable: table
    }*/

    res.render('watchlist', {stocksTable})
})


app.get('/clear', async (req, res) => {
  
    await client.connect();

    const cursor = await client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection).deleteMany({})

    await client.close();

    res.redirect("/watchlist")
})

app.listen(portNumber, () => {
	console.log(`App is listening at port ${portNumber}`)
})


