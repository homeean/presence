# homeean-presence

***wip***

## installation

### Raspbian/Debian/Ubuntu

```
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```
see [https://github.com/noble/bleno#prerequisites](https://github.com/noble/bleno#prerequisites)


### clone repo and install
```
git clone https://github.com/homeean/presence.git
cd presence
npm install
```

### create a config.json in ~/homeean-presence
```
// config.json
{
    "interval": 20,
    "port": 3000,
    "persons": [
        {
            "name": "firstname",
            "uuid": "E2C56DB5-DCHG-48D2-B060-D0A5B91096EB",
            "ip": "192.168.1.1"
        }
    ]
}
```

## run
```
DEBUG=homeean-presence node index
```
