FROM node:8 as base

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
  build-essential python bluetooth bluez libbluetooth-dev libudev-dev libpcap-dev

COPY . .

RUN npm install && npm run build

RUN mkdir -p /usr/src/app/ /root/.homeean-presence/

# Copying config file to the exptected location
COPY config.json /root/.homeean-presence/

EXPOSE 3000
CMD [ "node", "dist/server.js" ]
