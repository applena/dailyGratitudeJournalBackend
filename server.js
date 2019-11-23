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
app.post('/createAccount', createAccount);
app.get('/createLogin', createLogin);
app.post('/users', findUser);
app.post('/dailyGratitude/:id', saveGratitude);
app.get('/all/:id', getAll);
app.get('/new/:id', getDaily);

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
          response.render(`pages/daily`, {id:id});
        })
      })
}

function createLogin(request, response){
  response.render('pages/createAccount');
}

function findUser(request, response){
  let user = request.body.username;
  let password = request.body.password;

  let sql = 'select * from users where username=$1;';
  let safeValues = [user];

  client.query(sql, safeValues)
    .then(res => {
      if(res.rows.length){
        let hashword = res.rows[0].password;
        bcrypt.compare(password, hashword)
          .then(resolution => {
            if(resolution){
              let id = res.rows[0].id;
              response.render('pages/daily', {id: id});
            } else {
              response.redirect('/');
            }
          })
      }
    })
};

function getAll(request, response){
  let id = request.params.id;

  let sql = 'SELECT * FROM daily where person = $1;';
  let safeValues = [request.params.id];
  client.query(sql, safeValues)
    .then(results => {
      response.render('pages/allDays.ejs', { days: results.rows, id: id });
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

function getDaily(request, response){
  let id = request.params.id;
  response.render('pages/daily.ejs', {id: id});
}

app.listen(PORT, () => {
  console.log(`listenting on ${PORT}`);
})