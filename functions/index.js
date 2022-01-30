const functions = require('firebase-functions');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.get('*', (req, res) => {
  res.send("Hello from the API");
});

app.post('*', (req, res) => {
    bodyParser.json(req);

    res.send(req.body.challenge);
});

exports.api = functions.https.onRequest(app);