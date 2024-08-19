const net = require('net')

const PORT = 8889

const chats = []

const server = net.createServer((socket) => {
  console.log('클라이언트가 연결되었습니다.')

  socket.on('data', (data) => {
    const command = parseCommand(data.toString())

    if (!command) {
      socket.write('잘못된 명령입니다.')
      return
    }

    const { type, data: commandData } = command
    const fn = fns[type]

    if (!fn) {
      socket.write('알 수 없는 명령입니다.')
      return
    }

    fn(socket, commandData)
  })

  socket.on('end', () => {
    console.log('클라이언트 연결이 종료되었습니다.')
  })

  socket.on('error', (err) => {
    console.error('에러 발생:', err)
  })
})

// 서버를 특정 IP 주소와 포트에서 대기
server.listen(PORT, () => {
  const host = server.address().address
  console.log(`서버가 ${host}:${PORT}에서 대기 중입니다.`)
})

/*
  type Command = {
    type: 'init' | 'send' | 'exit',
    data: string
  }
*/
function parseCommand(data) {
  try {
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const fns = {
  init: (socket, data) => {
    const name = data
    for (const chat of chats) {
      chat.socket.write(`[${name}]채팅방에 입장하셨습니다.`)
    }

    const participants =
      chats.length > 0 ? chats.map((chat) => chat.name).join(', ') : '<없음>'
    socket.write(
      '채팅방에 입장하셨습니다.\n - 채팅방 참여자: ' +
        participants +
        '\n - 채팅방에서 나가려면 "exit"를 입력하세요.'
    )

    console.log(`[${name}] 채팅방에 입장하셨습니다.`)

    const randomId = '' + new Date().getTime() + Math.floor(Math.random() * 9)
    chats.push({ randomId, name, socket })
  },
  send: (socket, data) => {
    const { name, message } = data
    chats.forEach((chat) => {
      if (chat.name === name) return
      chat.socket.write(`${name}: ${message}`)
    })
    console.log(`[${name}] ${message}`)
    socket.write(`[${name}] ${message}`)
  },
  exit: (socket, data) => {
    const name = data
    const index = chats.findIndex((chat) => chat.name === name)
    if (index !== -1) {
      chats.splice(index, 1)
    }
    socket.end()
  },
}
