# homeean-presence

homeean-presence provides a simple way to detect presence at your home. For each person an IP device in the same network and a BLE device can be monitored. In addition, the presence state of a person can be manually set for a certain time via webhook.

If the status changes, a webhook can be triggered.

## Installation

### Raspbian/Debian/Ubuntu

```
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```
see [https://github.com/noble/bleno#prerequisites](https://github.com/noble/bleno#prerequisites)

### the package is available via npm
```
sudo npm install -g homeean-presence --unsafe-perm
```

### create a config.json in ~/homeean-presence
You can add as many person as you wish.
```
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
homeean-presence
```

### debug mode
```
DEBUG=homeean-presence homeean-presence
```
