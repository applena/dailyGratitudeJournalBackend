'use strict';

const form = document.getElementById('form');

function clearData(e){
  e.preventDefault();
  form.reset();
}

form.addEventListener('submit', clearData);