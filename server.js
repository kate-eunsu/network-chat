"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var PORT = 8889;
var chats = [];
var server = net.createServer(function (socket) {
    console.log("클라이언트가 연결되었습니다.");
    socket.on("data", function (data) {
        var command = parseCommand(data.toString());
        if (!command) {
            socket.write("잘못된 명령입니다.");
            return;
        }
        var type = command.type, commandData = command.data;
        var fn = fns[type];
        if (!fn) {
            socket.write("알 수 없는 명령입니다.");
            return;
        }
        fn(socket, commandData);
    });
    socket.on("end", function () {
        console.log("클라이언트 연결이 종료되었습니다.");
    });
    socket.on("error", function (err) {
        console.error("에러 발생:", err);
    });
});
server.listen(PORT, function () {
    var address = server.address();
    console.log("address", address);
    // if (typeof address === "string") {
    //   console.log(`서버가 ${address}에서 대기 중입니다.`);
    // } else if (address && typeof address === "object") {
    //   console.log(`서버가 ${address.address}:${address.port}에서 대기 중입니다.`);
    // }
});
function parseCommand(data) {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return null;
    }
}
var fns = {
    init: function (socket, data) {
        var name = data;
        socket.write("채팅방에 입장하셨습니다.\n - 채팅방 참여자: " +
            name +
            '\n - 채팅방에서 나가려면 "exit"를 입력하세요.');
        console.log("[".concat(name, "] \uCC44\uD305\uBC29\uC5D0 \uC785\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4."));
        var randomId = "" + new Date().getTime() + Math.floor(Math.random() * 9);
        chats.push({ randomId: randomId, name: name, socket: socket });
    },
    send: function (socket, data) {
        var name = data.name, message = data.message;
        chats.forEach(function (chat) {
            if (chat.name === name)
                return;
            chat.socket.write("".concat(name, ": ").concat(message));
        });
        console.log("[".concat(name, "] ").concat(message));
        socket.write("[".concat(name, "] ").concat(message));
    },
    exit: function (socket, data) {
        var name = data;
        var index = chats.findIndex(function (chat) { return chat.name === name; });
        if (index !== -1) {
            chats.splice(index, 1);
        }
        socket.end();
    },
};
