const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z9rhw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("weddingService");
        const servicesCollection = database.collection("services");
        const myOrderCollection = database.collection("order");
        const usersCollection = database.collection("users");

        //Post Api
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);
            const result = await servicesCollection.insertOne(service);
            res.json(result)
        });
        //GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
        //Get orderProdect
        app.get('/orderProdect/:id', async (req, res) => {
            const result = await servicesCollection.find({ _id: ObjectId(req.params.id) }).toArray();
            res.send(result[0])
        })

        //post myOrder
        app.post('/myOrder', async (req, res) => {
            const result = await myOrderCollection.insertOne(req.body);
            res.send(result);
        })
        //get myOrders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await myOrderCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        });
        //deleteOrder
        app.delete('/deleteOrder/:id', async (req, res) => {
            const result = await myOrderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        });
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send('Running Wedding server')
});
app.listen(port, () => {
    console.log('Running Wedding server on port', port);
})
