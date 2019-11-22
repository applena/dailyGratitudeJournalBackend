'use strict';

const form = document.getElementById('form');

function addDaily(e){
  e.preventDefault();

  // let daily = e.target.relationship ? e.target.relationship :
  //             e.target.opportunity? e.target.opportunity :
  //             e.target.yesterday? e.target.yesterday :
  //             e.target.simple

  // let stringifiedGratitudeArray = localStorage.getItem('gratitudes');
  // let graditudes = JSON.parse(stringifiedGratitudeArray);

  // graditudes.push(daily);
  // let stringifiedGraditudes = JSON.stringify(graditudes);

  // localStorage.stringify('graditudes', stringifiedGraditudes);

  form.reset();
}

form.addEventListener('submit', addDaily);