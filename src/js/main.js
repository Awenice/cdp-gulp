var $ = window.$ = window.jQuery = require('jquery');
require('bootstrap');
var matchEmail = require('match-email');

$(document).ready(function () {
    $('#hello-world-btn').click(function () {
        /* eslint-disable no-console */
        console.log(matchEmail('Vadym_Makhonin@epam.com'));
        /* eslint-enable no-console */
    });
});