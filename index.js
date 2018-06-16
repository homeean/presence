const express = require('express')
const bodyParser = require('body-parser');

const debug = require('debug')('homeean-presence');
const fs = require('fs')
const os = require('os')

const Person = require('./person')

class HomeeanPresence {

    constructor(config) {
        this.config = config;
        this.server = express();
        this.server.use(bodyParser.text());
    }

    run() {
        console.log('homeean-presence');
        console.log('2018 by stfnhmplr | himpler.com');

        debug('running on node %s', process.version)

        if (typeof(this.config) != 'Object') {
            this._loadConfig()
        }

        this._createPersons();

        this.server.listen(this.config.port)
    }

    _createPersons() {
        this.config.persons.forEach((p) => {
            let person = new Person(p);

            // setup webhook
            this.server.post('/homeean-presence/' + person.name.toLowerCase(), (req, res) => {
                debug('received state %s for %s', req.body, person.name);
                if (req.body === 'on') {
                    person.last_seen = Date.now();
                } else {
                    //TODO:
                }

                res.send('received state %s for %s', req.body, this.name)
            })

            person.on('stateChanged', (name, state) => {
                debug('%s is %s.', name, state ? 'present' : 'absent')
            });

            person.track(2000);
        })
    }

    _loadConfig() {
        const path = os.homedir() + '/.homeean-presence/config.json';
        debug('load config from %s', path)

        try {
            const file = fs.readFileSync(path, 'utf8')
            this.config = JSON.parse(file);
        } catch (e) {
            debug('Could not find config or parse config file')
            process.exit();
        }
    }
}

const homeeanPresence = new HomeeanPresence();
homeeanPresence.run();
