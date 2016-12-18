var APCOutlet = require('./lib/APCOutlet.js');

var Service, Characteristic;

module.exports = function(homebridge) {
    APCOutlet.setHomebridge(homebridge);

    homebridge.registerAccessory("homebridge-apc-pdu", "APCOutlet", APCOutlet);
}
