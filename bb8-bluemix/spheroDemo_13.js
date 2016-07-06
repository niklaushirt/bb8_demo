var mqtt = require('./mqtt-wrapper.js')();
var sphero = require("sphero"),
    bb8 = sphero("87efa24476af49719485cf3e0e64756f"); // change BLE address accordingly

console.log("**** Waiting for BB8 to connect *****");

bb8.connect(function () {

    console.log("**** Start debug info *****");
    console.log("Connected to BB-8");


    bb8.ping(function (err, data) {
        console.log("Output of ping command");
        console.log(err || data);
        console.log("End of ping data");
    });
    console.log("BB-8 is changing color to green to indicate that it is connected")
    bb8.color("green");
    console.log("**** End debug info *****");



    mqtt.connect(function (client, deviceId) {
        client.on('connect', function () {
            console.log('MQTT client connected to IBM IoT Cloud.');
            console.log('Connected Sphero ID: ' + deviceId);
            client.subscribe('iot-2/cmd/run/fmt/json', {
                qos: 0
            }, function (err, granted) {
                if (err) {
                    throw err;
                }
                console.log("subscribed to iot-2/cmd/run/fmt/json");
            });
        });

        client.on('message', function (topic, message, packet) {
            //console.log(topic);
            var msg = JSON.parse(message.toString());
            //console.log(msg);

            //--------------------------------------------------------
            // HANDLE COMMAND - RED
            //--------------------------------------------------------
            if (msg.d.action === '#red') {
                console.log('Change color to RED');
                bb8.color("red");
            }
            //--------------------------------------------------------
            // HANDLE COMMAND - BLUE
            //--------------------------------------------------------
            else if (msg.d.action === '#blue') {
                console.log('Change color to BLUE');
                bb8.color("blue");
            }




            //--------------------------------------------------------
            // HANDLE COMMAND - START
            //--------------------------------------------------------
            else if (msg.d.action === '#start') {
                console.log('Start Sphero');

                myDirection = msg.d.direction;
                if (myDirection < 0) {
                    myDirection = 360 + msg.d.direction;
                }
                console.log('Direction: ' + 3*myDirection);

                bb8.roll(200, 3 * myDirection);

                setTimeout(function () {
                    bb8.stop();
                    bb8.color("red");
                }, 2000); //Stop after 1.5 seconds

                if ((3 * myDirection > 90) && (3 * myDirection < 270)) {
                    bb8.color("blue");
                } else {
                    bb8.color("green");
                }

            }



            //--------------------------------------------------------
            // HANDLE COMMAND - REVERSE
            //--------------------------------------------------------
            else if (msg.d.action === '#reverse') {
                console.log('Reverse Sphero');

                myDirection = 3 * msg.d.direction;
                if (myDirection < 0) {
                    myDirection = 360 + msg.d.direction;
                }

                myDirection = 180 - myDirection;

                console.log('Direction: ' + 3*myDirection);

                bb8.roll(200, myDirection);

                setTimeout(function () {
                    bb8.stop();
                }, 2000); //Stop after 1.5 seconds

                bb8.color("blue");
            }



            //--------------------------------------------------------
            // HANDLE COMMAND - STOP
            //--------------------------------------------------------
            else if (msg.d.action === '#stop') {
                //console.log('Stop Sphero');

                bb8.stop();

                bb8.color("red");
            }



            //--------------------------------------------------------
            // HANDLE COMMAND - GOCRAZY
            //--------------------------------------------------------
            else if (msg.d.action === '#gocrazy') {
                console.log('GOCRAZY Sphero');

                bb8.stop();
                bb8.roll(200, 0);
                setTimeout(function(){

                },2000);
                bb8.roll(200, 90);
                setTimeout(function(){

                },2000);
                bb8.roll(200, 180);
                setTimeout(function(){

                },2000);
                bb8.roll(200, 270);
                setTimeout(function(){

                },2000);
                bb8.stop();



                setInterval(function () {
                    var newRed = Math.floor(Math.random() * 256);
                    var newBlue = Math.floor(Math.random() * 256);
                    var newGreen = Math.floor(Math.random() * 256);
                    //console.log("R: " + newRed + " G: " + newGreen + " B: " + newBlue);
                    bb8.color({
                        red: newRed,
                        green: newGreen,
                        blue: newBlue
                    });
                }, 100); //change   color every second
            }
        });
    });


});

bb8.on("collision", function (data) {
    console.log("collision detected");
    console.log("  data:", data);
    bb8.stop();
    orb.color("yellow");

    setTimeout(function () {
        orb.color("green");
    }, 1000);
});
