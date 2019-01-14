import Logger from 'logplease'
import os from 'os'

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')

export default Logger.create('homeean-presence', {
    filename: os.homedir() + '/.homeean-presence/homeean-presence.log',
    appendFile: false,
    useLocalTime: true
});
