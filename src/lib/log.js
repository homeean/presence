import { createLogger, format, transports } from 'winston'

export default createLogger({
    format: format.combine(
        format.timestamp(), format.simple()
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: 'homeean-presence.log'})
    ]
})

