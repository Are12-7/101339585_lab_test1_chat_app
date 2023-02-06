const moment = require('moment');

function messageForm(username, text) {
    return {
        username,
        text,
        time: moment().format('h:m a')
    }
}

module.exports = messageForm;