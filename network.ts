const net = require("net");
const readline = require("readline");

const PORT = 8889;
const HOST = "192.168.0.7"; // 서버가 실행 중인 IP 주소

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let name = "";

const client = net.createConnection({ host: HOST, port: PORT }, () => {
  console.log("[server] 서버에 연결되었습니다.");

  rl.question("[이름을 입력해주세요.]: ", (_name) => {
    client.write(JSON.stringify({ type: "init", data: _name }));
    promptMessage(_name);
  });
});

client.on("data", (data) => {
  console.log(data.toString());
});

client.on("end", () => {
  console.log("서버와의 연결이 종료되었습니다.");
  rl.close();
});

client.on("error", (err) => {
  console.error("에러 발생:", err);
  rl.close();
});

function promptMessage(name) {
  rl.question(`[${name}]`, (message) => {
    if (message.toLowerCase() === "exit") {
      client.write(JSON.stringify({ type: "exit", data: name }));
      client.end();
    } else {
      client.write(JSON.stringify({ type: "send", data: { name, message } }));
      promptMessage(name);
    }
  });
}
