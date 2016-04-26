window.$ = window.jQuery = require('jquery');
require('bootstrap');
var matchEmail = require('match-email');

$(document).ready(function () {
    $("#hello-world-btn").click(function () {
        console.log(matchEmail('Vadym_Makhonin@epam.com'));
    });
});