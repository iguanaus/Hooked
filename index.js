var handler = function(req, res) {
    fs.readFile('./page.html', function (err, data) {
        if(err) throw err;
        res.writeHead(200);
        res.end(data);
    });
};

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var csv = require('fast-csv');
var Moniker = require('moniker');
var port = 3250;
var myval = 0;
var commis = 1.0;
var spread = .01;

var inputFile='06_01.csv';
var myData = 0;

console.log("Parsing...");
var prices = [];
var i = 0;
var timeCount = random(0,10000);


//var fruits = ["Banana", "Orange", "Apple", "Mango"];
//fruits.push("Kiwi");


fs.createReadStream(inputFile).pipe(csv()).on("data", function(data){
        i += 1;
        if (i != 1) {
            myData = data;
            //console.log(data);
            prices.push(parseFloat(data[1]));
        }
    }).on("end", function(){
        console.log("done");
        console.log(prices);
    });

console.log(prices);

app.listen(port);

var myVar = setInterval(alertFunc, 100);

io.sockets.on('connection', function (socket) {
    var user = addUser();
    updateWidth();
    socket.emit("welcome", user);
    socket.on('disconnect', function () {
        removeUser(user);
    });

    socket.on("sell", function() {
        if (user.shares > 0) {
            user.money = user.shares * (currentPrice-spread) - commis;
            user.shares = 0;
            updateUsers();
        }
    });

    socket.on("buy", function() {
        if (user.money > 0) {
            user.shares = (user.money-commis)/(currentPrice+spread);
            user.money = 0;
            updateUsers();
        }
    });
    updatePrice();

});

var currentPrice = 100.0;
var initialWidth = 20;
var currentWidth = initialWidth;
var winWidth = 150;
var users = [];

var addUser = function() {
    var user = {
        name: Moniker.choose(),
        money: 20000,
        shares: 0
    };
    users.push(user);
    updateUsers();
    return user;
};
var removeUser = function(user) {
    for(var i=0; i<users.length; i++) {
        if(user.name === users[i].name) {
            users.splice(i, 1);
            updateUsers();
            return;
        }
    }
};
var updateUsers = function() {
    var str = '';
    for(var i=0; i<users.length; i++) {
        var user = users[i];
        str += user.name + ' </br><small>(' + user.money + ' dollars)</small></br> <small> '+ user.shares + ' shares</small>';
    }
    io.sockets.emit("users", { users: str });
};

var updatePrice = function() {
    
    io.sockets.emit("price", { price: currentPrice });
};

var updateWidth = function() {
    io.sockets.emit("update", { currentWidth: currentWidth });
};


function random (low, high) {
    return Math.random() * (high - low) + low;
}


function alertFunc() {
    //alert("Hello!");
    //currentPrice = currentPrice + 1;
    //
    timeCount = 1 + timeCount;
    if (timeCount*2 >= prices.length-1) {
        timeCount = 0;
    }
    currentPrice = prices[timeCount*2];
    
    console.log("Ind" + timeCount + "Current price: " +currentPrice);

    updatePrice();
}






