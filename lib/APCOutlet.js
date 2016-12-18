var apcPdu = require('apc-pdu-snmp');

let Accessory;
let Service;
let Characteristic;

class APCOutlet {
    constructor(log, config) {
        // global vars
        this.log = log;

        // configuration vars
        this.name = config["name"];
        this.host = config["host"];
        this.outlet = config["outlet"];

        this.pdu = new apcPdu({
            host: this.host,
            community: 'private' // Optional community
        });

        // register the service and provide the functions
        this.service = new Service.Switch(this.name);

        // characteristics
        this.service
            .getCharacteristic(Characteristic.On)
            .on('get', this.getState.bind(this))
            .on('set', this.setState.bind(this));
    }

    static setHomebridge(homebridge) {
        Accessory = homebridge.platformAccessory;
        Service = homebridge.hap.Service;
        Characteristic = homebridge.hap.Characteristic;
    }

    getState(callback) {
        this.pdu.getOutletPowerState(this.outlet, (err, state) => {
            if (err) {
                this.log(err);
                return;
            }

            this.log("Requested State: %s", state);
            callback(null, (state == 1) ? 1 : 0);
        });
    }

    setState(state, callback) {
        var apcState = (state == 1) ? 1 : 2;
        this.log("Set State: %s", state, apcState);

        this.pdu.setPowerState(this.outlet, apcState, (err) => {
            if (err && err.message == "State must be boolean or number") {
                //Expected error due to switch statement fallthru bug in apc-pdu-snmp. Will get called again.
                return;
            }

            if (err) {
                this.log(err);
                return;
            }

            this.log('Successfully turned outlet ' + this.outlet + ' ' + (state ? 'on' : 'off'));
        });

        callback(null);
    }

    getServices() {
        return [this.service];
    }
}

module.exports = APCOutlet;
