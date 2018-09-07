import Logger from 'logplease'
import os from 'os'

export default Logger.create('homeean-presence', {
    filename: os.homedir() + '/.homeean-presence/homeean-presence.log',
    appendFile: false,
});

