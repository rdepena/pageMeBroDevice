var io = require('socket.io-client'),
    socket = io.connect('http://pagemebro.herokuapp.com/'),
    five = require("johnny-five"),
    lcd,
    board = new five.Board({
        //here we specify the bluetooth port.
        port: "/dev/tty.Arduino2-DevB"
    });

var printMessage = function (from, message) {
    lcd.clear();
    printDate();
    lcd.cursor(1,0).print(from);

    var lines = Math.ceil(message.length/20);
    var line = 0;
    var currentLine = 2;

    while (line !== lines) {
        var currentBounds = 20 * line;
        lcd.cursor(currentLine,0).print(message.slice(currentBounds, currentBounds + 20));
        line ++;
        if (currentLine == 2) {
            currentLine++;
        } else {
            currentLine--;
        }
     }
};

var printDate = function () {
    var time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    lcd.cursor(0,0).print(time);
};

var dateLoop = function () {
    printDate();
    setTimeout(dateLoop, 1000);
};

board.on("ready", function() {

  lcd = new five.LCD({
    pins: [7, 8, 9, 10, 11, 12]
  });

  lcd.on("ready", function() {
      lcd.clear();
      dateLoop();
  });


});
//subscribe to the socket and display the text.
socket.on('connect', function () {
    // socket connected
    socket.emit('deviceConnect', { device: 'pager' });

    //respond to the new message event.
    socket.on('message:new', function (data) {

        //make sure we mask the last digits if its from a cellphone.
        var from = data.From === 'web client' ? data.From : data.From.substring(0,9) + '5555';
        printMessage(from, data.Body);
    });
});
