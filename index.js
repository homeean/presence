const express = require('express')
const bodyParser = require('body-parser');
const https = require('https');
const debug = require('debug')('homeean-presence');
const fs = require('fs')
const os = require('os')
const EventEmitter = require('events')
const ifaces = require('os').networkInterfaces();

const Person = require('./person')

class HomeeanPresence extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.server = express();
        this.server.use(bodyParser.json());
        this.persons = [];
    }

    run() {
        console.log('homeean-presence');
        console.log('2018 by stfnhmplr | homeean.de');

        debug('running on node %s', process.version)

        if (typeof(this.config) !== 'Object') {
            this._loadConfig()
        }

        this._createPersons();
        this.server.listen(this.config.port)
    }

    _createPersons() {
        this.config.persons.forEach((p) => {
            let person = new Person(p);

            // setup webhook
            const ipAddress = () => [].concat.apply([], Object.values(ifaces))
                .filter(details => details.family === 'IPv4' && !details.internal)
                .pop().address
            debug('setting up webhook http://%s:%s/homeean-presence/%s', ipAddress(), this.config.port, person.name.toLowerCase())
            this.server.post('/homeean-presence/' + person.name.toLowerCase(), (req, res) => {
                if (typeof req.body.state === 'boolean') {
                    debug('received state %s for %s', req.body.state, person.name);
                    person.setStateFor(req.body.state, req.body.duration || 30);
                } else {
                    debug("Recieved webhook, but can't read state. Please use only values of type Boolean (true/false)")
                }

                res.send(`received state ${req.body.state} for ${person.name}`)
            })

            person.on('stateChanged', (name, state) => {
                debug('%s is %s.', name, state ? 'present' : 'absent')
                this._handleStateChange();
            });

            person.track(this.config.interval, this.config.threshold);
            this.persons.push(person);
        })
    }

    _handleStateChange() {
        const states = this.persons.map(p =>  p.getState());
        const state = states.some(s => s);
        this.emit('stateChanged', state);

        if ('webhooks' in this.config) {
            debug('%s @home, triggering webhook for %s', state ? 'somebody' : 'nobody', state ? 'presence' : 'absence');
            https.get(state ? this.config.webhooks.present : this.config.webhooks.absent, (res) => {
                debug('received status %s', res.statusCode)
            }).on('error', (err) => {
                debug('Error triggering webhook: %s', err);
            })
        }
    }

    _loadConfig() {
        const path = os.homedir() + '/.homeean-presence/config.json';
        debug('load config from %s', path)

        try {
            const file = fs.readFileSync(path, 'utf8')
            this.config = JSON.parse(file);
        } catch (e) {
            debug('Could not find or parse config file')
            process.exit();
        }
    }
}


const homeeanPresence = new HomeeanPresence();
homeeanPresence.run();
