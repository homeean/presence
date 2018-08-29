import logger from './lib/log'
import Person from './lib/person'
import Scanner from './lib/scanner'
import express from 'express'
import bodyParser from 'body-parser'
import request from 'request'
import fs from 'fs'
import os from 'os'
import EventEmitter from 'events'

class HomeeanPresence extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.server = express();
        this.server.use(bodyParser.json());
        this.persons = [];
        this.ipAddress = 'localhost';
        this.last_state = false;
    }

    run() {
        logger.info('homeean-presence');
        logger.info('2018 by stfnhmplr | homeean.de');
        logger.info(`running on node ${process.version}`)

        try {
            this.ipAddress = [].concat.apply([], Object.values(os.networkInterfaces()))
                .filter(details => details.family === 'IPv4' && !details.internal).pop().address
        }
        catch (e) {
            logger.warn("can't get ip-address, please check your network connection")
        }

        if (typeof(this.config) !== 'Object') {
            this._loadConfig()
        }

        this._createPersons();
        const uuids = this.config.persons.filter(p => p.uuid).map(p =>  p.uuid);
        const ips = this.config.persons.filter(p => p.ip).map(p =>  p.ip);
        this.scanner = new Scanner(this.config.interval, uuids, ips);

        this.scanner.on('discover', (type, value) => {
            const person = this._getPersonByDevice(type, value);
            if (person) {
                person.setState(true, type);
            }
        });

        this.server.listen(this.config.port)
    }

    _createPersons() {
        this.config.persons.forEach((p) => {
            let person = new Person(p);

            logger.info(`setting up webhook http://${this.ipAddress}:${this.config.port}/homeean-presence/${person.name.toLowerCase()}`)

            this.server.post('/homeean-presence/' + person.name.toLowerCase(), (req, res) => {
                if (typeof req.body.state === 'boolean') {
                    logger.info(`received state ${req.body.state} for ${person.name}`);
                    person.setState(req.body.state, req.body.duration || 30);
                } else {
                    logger.warn("Recieved webhook, but can't read state. Please use only values of type Boolean (true/false)")
                }

                res.send(`received state ${req.body.state} for ${person.name}`)
            })

            person.on('stateChanged', (person, state) => {
                logger.info(`${person.name} is ${state ? 'present' : 'absent'}.`)

                if (person.webhooks) {
                    logger.info(`${person.name} ${state ? 'is' : 'is not'} @home, triggering persons webhook for ${state ? 'presence' : 'absence'}`);
                    let webhook = person.webhooks[state ? 'present' : 'absent'];

                    if (!webhook) {
                        logger.warn(`please provide an "${state ? 'present' : 'absent'}" webhook url for ${person.name}`)
                        return;
                    }

                    request.get(webhook)
                        .on('response', res => { logger.info(`received status ${res.statusCode}`) })
                        .on('error', err => { logger.error(`Error triggering webhook: ${err}`) })
                }

                this._handleStateChange();
            });

            person.track(this.config.interval, this.config.threshold);
            this.persons.push(person);
        })
    }

    _getPersonByDevice(type, value) {
        for (let person of this.persons) {
            if (person[type] === value) return person;
        }

        logger.debug(`person not found: ${value} [${type}]`)
    }

    _handleStateChange() {
        const states = this.persons.map(p =>  p.getState());
        const state = states.some(s => s);

        // if overall state didn't changed
        if (state === this.last_state) return;
        this.last_state = state;

        this.emit('stateChanged', state);

        if ('webhooks' in this.config) {
            logger.info(`${state ? 'somebody' : 'nobody'} @home, triggering webhook for ${state ? 'presence' : 'absence'}`);
            let webhook = this.config.webhooks[state ? 'present' : 'absent'];

            if (!webhook) {
                logger.warn(`please specify an "${state ? 'present' : 'absent'}" webhook in your config file`)
                return;
            }

            request.get(webhook)
                .on('response', res => { logger.info(`received status ${res.statusCode}`) })
                .on('error', err => { logger.error(`Error triggering webhook: ${err}`) })
        }
    }

    /**
     *
     * @private
     */
    _loadConfig() {
        const path = os.homedir() + '/.homeean-presence/config.json';
        logger.info(`load config from ${path}`)

        try {
            const file = fs.readFileSync(path, 'utf8')
            this.config = JSON.parse(file);
        } catch (e) {
            logger.error('Could not find or parse config file')
            process.exit();
        }
    }
}


const homeeanPresence = new HomeeanPresence();
homeeanPresence.run();
