# homeean-presence

homeean-presence provides a simple way to detect presence at your home. For each person an IP device in the same network and a BLE device can be monitored. In addition, the presence state of a person can be manually set for a certain time via webhook.

If the status changes, a webhook can be triggered.

## Installation

### Raspbian/Debian/Ubuntu

```
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev hping3
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
    "device": "eth0",
    "webhooks": {
        "absent": "https://webhook-for-absence",
        "present": "https://webhook-for-presence"
    },
    "persons": [
        {
            "name": "Your Name",
            "uuid": "E2C786CD5-DFFB-48D3-B060-D0F5555596E0",
            "ip": "192.168.1.1",
            "mac": "AA:BB:CC:DD:EE:FF",
	        "webhooks": {
	            "absent": "https://webhook-for-absence",
	            "present": "https://webhook-for-presence"
            }
        }
    ]
}

```
- **device:** your network device (run ifconfig to find) 
## run
```
homeean-presence
```
