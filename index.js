const express = require('express')
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()
const port = 5000;

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.70s8n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();
    const database = client.db("helmetrix");
    const productCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

    //get all products to display
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray()
      res.send(products)
    })

    // add products to db
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product)
      res.json(result)
      console.log(result)
    })

    //get single product by name
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    })

    // get all orders to db
    app.get('/orders', async (req, res) => {
      const result = await ordersCollection.find({}).toArray()
      res.json(result)
    })

    // add orders to db
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order)
      res.json(result)
    })

    //get single order 
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await ordersCollection.findOne(query);
      res.json(product);
    })

    //Update Order API
    app.put('/order/:id', async (req, res) => {
    const id = req.params.id;
    const updatedOrder = req.body;
    // console.log('hitting put', id,)
    const filter = { _id: ObjectId(id)};
    const options = { upsert: true }
    const updateOrder = {
        $set: {
          name: updatedOrder.name,
          email: updatedOrder.email,
          mobile: updatedOrder.mobile,
          address: updatedOrder.address,
          productName: updatedOrder.productName,
          price: updatedOrder.price,
          size: updatedOrder.size,
          color: updatedOrder.color,
          Status: updatedOrder.Status
        }
    }
    const result = await ordersCollection.updateOne(filter, updateOrder, options);
    res.json(result);
    })

    // use POST to get data by keys
    app.post('/orders/bykeys', async (req, res) => {
      const keys = req.body;
      const query = { email: { $in: keys } }
      const orders = await ordersCollection.find(query).toArray();
      res.json(orders)
    })

    //Delete Order API
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    })

    // post review to db
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review)
      res.json(result)
    })

    //get all reviews to display
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray()
      res.send(reviews)
    })


    // add users to db
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user)
      res.json(result)
    })

    // make admin from users to db
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = {email: user.email}
      const updateDoc = {$set : {role: 'admin'}}
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.json(result)
    })

    //check if admin
    app.get('/users/:email', async (req, res)=>{
      const email = req.params.email;
      const query = { email: email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })


  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from helmetrix')
})

app.listen(port, () => {
  console.log('listening to port', port);
})