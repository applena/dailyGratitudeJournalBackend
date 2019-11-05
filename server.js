'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
require('ejs');

const app = express();
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
const PORT = process.env.PORT || 3002;
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL)
client.connect();

app.get('/', displayGratitudeForm);
app.post('/dailyGratitude', saveGratitude);
app.get('/all', getAll);

function getAll(request, response){
  let sql = 'SELECT * FROM daily';
  client.query(sql)
    .then(results => {
      response.render('pages/allDays.ejs', { days: results.rows });
    })
}

function displayGratitudeForm(request, response){
  response.render('index.ejs');
}

function saveGratitude(request, response){
  const gratitudeObj = request.body;

  let gratitude  = gratitudeObj.relationship ? gratitudeObj.relationship 
  : gratitudeObj.opportunity ? gratitudeObj.opportunity 
  : gratitudeObj.yesterday ? gratitudeObj.yesterday 
  : gratitudeObj.simple

  saveToPostgresQL(gratitude)
  .then(() => {
    response.redirect('/all');
  })
}

function saveToPostgresQL(gratitude){
  let sql = 'INSERT INTO daily (gratitude) VALUES ($1);';
  let safeValues = [gratitude];

  return client.query(sql, safeValues)
}

app.listen(PORT, () => {
  console.log(`listenting on ${PORT}`);
})