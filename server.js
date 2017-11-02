var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    defaultCountry = ['灰风',"法国","英国","莫斯科","奥地利","卡斯蒂尔","奥斯曼","帖木儿","波兰","威尼斯","勃艮第","米兰","马穆鲁克","瑞典","丹麦","大明"];
    defaultPassword = {};
    defaultCountry.forEach((x)=>{defaultPassword[x]=parseInt(Math.random()*10000)});
    defaultPassword["灰风"]="1qaz!QAZ";
    users = [];
//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 8000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket
io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(data) {
        nickname=data.nickname;
        password=data.password;
        console.log(nickname+"::::"+password);
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        }
        else if(defaultCountry.indexOf(nickname) > -1&&password != defaultPassword[nickname]){
            socket.emit('needpassword');
        }
        else {
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
            if(nickname == "灰风")
            {
                console.log(defaultPassword);
                io.sockets.emit('showpassword', defaultPassword);
            }
        };
    });
    //user leaves
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});
