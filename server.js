'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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

app.get('/', displayLoginForm);
app.post('/users', findUser);
app.get('/users/:id');
app.post('/createAccount', createAccount);
app.get('/createLogin', createLogin);
app.post('/dailyGratitude/:id', saveGratitude);
app.get('/all/:id', getAll);

function displayLoginForm(request, response){
  response.render('pages/home');
}

function createAccount(request, response){
  let username = request.body.username;
  let password = request.body.password;

  bcrypt.hash(password, saltRounds)
    .then(hash => {
      let sql = 'insert into users (username, password) values ($1, $2) returning id';
      let safeValues = [username, hash];
      client.query(sql, safeValues)
        .then((res) => {
          let id = res.rows[0].id;
          response.render(`index`, {id:id});
        })
      })
}

function createLogin(request, response){
  response.render('pages/createAccount');
}

function findUser(request, response){
  let user = request.body.username;
  let password = request.body.password;

  bcrypt.hash(password, saltRounds)
    .then(hash => {
      let sql='select * from users where username=$1 AND password=$2;'
      let safeValues = [user,hash];
    
      client.query(sql, safeValues)
        .then(results => {
          if(results.rows.length > 0){
            let id = results.rows[0].id;
            response.render('index', {id: id});
          } else {
            response.redirect('/createLogin');
          }
        })
    })
  
}

function getAll(request, response){
  let sql = 'SELECT * FROM daily where person = $1';
  let safeValues = [request.params.id];
  client.query(sql, safeValues)
    .then(results => {
      response.render('pages/allDays.ejs', { days: results.rows });
    })
}

function saveGratitude(request, response){
  const gratitudeObj = request.body;
  const userId = request.params.id;

  let gratitude  = gratitudeObj.relationship ? gratitudeObj.relationship 
  : gratitudeObj.opportunity ? gratitudeObj.opportunity 
  : gratitudeObj.yesterday ? gratitudeObj.yesterday 
  : gratitudeObj.simple

  saveToPostgresQL(gratitude, userId)
  .then(() => {
    response.redirect(`/all/${userId}`);
  })
}

function saveToPostgresQL(gratitude, userId){
  let sql = 'INSERT INTO daily (gratitude, person) VALUES ($1, $2);';
  let safeValues = [gratitude, userId];

  return client.query(sql, safeValues)
}

app.listen(PORT, () => {
  console.log(`listenting on ${PORT}`);
})