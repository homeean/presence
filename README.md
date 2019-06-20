# homeean-presence

homeean-presence provides a simple way to detect presence at your home. For each person an IP device in the same network and a BLE device can be monitored. In addition, the presence state of a person can be manually set for a certain time via webhook.

If the status changes, a webhook can be triggered.

## Installation

### Raspbian/Debian/Ubuntu

```
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev libpcap-dev
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```
see [https://github.com/noble/bleno#prerequisites](https://github.com/noble/bleno#prerequisites)

### The package is available via npm
```
sudo npm install -g homeean-presence --unsafe-perm
```

### create a config.json in ~/.homeean-presence
You can add as many person as you wish.
```
{
    "interval": 20,
    "threshold": 300,
    "port": 3000,
    "webhooks": {
        "absent": "https://webhook-for-absence",
        "present": "https://webhook-for-presence"
    },
    "persons": [
        {
            "name": "Your Name",
            "ip": "192.168.1.1",
            "ble": "AA:BB:CC:DD:EE:FF",
	        "webhooks": {
	            "absent": "https://webhook-for-absence",
	            "present": "https://webhook-for-presence"
            }
        },
        ...
    ]
}

```

## Run
```
homeean-presence
```

### Debug
Set the enviroment variable *LOG_LEVEL* to *DEBUG*
```
LOG_LEVEL=DEBUG homeean-presence
```

## Changelog

### 1.2.4 (2019-04-24)
* improved logging

### 1.2.3 (2019-03-15)
* fixed an issue with state update from webhook

### 1.2.2 (2019-03-14)
* fixed timelock issue
* improved logging
