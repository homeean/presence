# homeean-presence

***work-in-progress***

homeean-presence provides a simple way to detect presence at your home. For each person an IP device in the same network and a BLE device can be monitored. In addition, the presence state of a person can be manually set for a certain time via webhook.

If the status changes, a webhook can be triggered.

## Installation

### Raspbian/Debian/Ubuntu

```
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```
see [https://github.com/noble/bleno#prerequisites](https://github.com/noble/bleno#prerequisites)

### clone repo and install
```
git clone https://github.com/homeean/presence.git homeean-presence
cd homeean-presence
npm install
```

### create a config.json in ~/homeean-presence
```
// config.json
{
    "interval": 20,
    "threshold": 180,
    "port": 3000,
    "webhooks": {
            "absent": "https://url-for-absence",
            "present": "https://url-for-presence"
        },
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
DEBUG=homeean-presence homeean-presence
```
