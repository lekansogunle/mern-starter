const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
 });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
 console.log("MongoDB database connection established!");
});


app.get('/api/', (req, res) => {
  res.json({hello: 'world'})
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

app.listen(process.env.PORT || 4000, () => console.log('APP listening on 4000'));