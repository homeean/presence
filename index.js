const express = require('express')
const server = express();
const Person = require('./person');
const debug = require('debug')('homeean-presence');
var bodyParser = require('body-parser');
const config = require('./config.js')

server.use(bodyParser.text());

config.persons.forEach((p) => {
    let person = new Person(p);

    // setup webhook
    server.post('/homeean-presence/' + person.name.toLowerCase(), (req, res) => {
        debug('received state %s for %s', req.body, person.name);
        if (req.body === 'on') {
            person.last_seen = Date.now();
        } else {
            //TODO
        }

        res.send('received state %s for %s', req.body, this.name)
    })

    person.on('stateChanged', (name, state) => {
        debug('%s is %s.', name, state ? 'present' : 'absent')
    });

    person.track(2000);
})

server.listen(config.port)
