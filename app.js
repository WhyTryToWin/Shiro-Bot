const Discord = require("discord.js")
const fs = require('fs')
const client = new Discord.Client()
const token = require('./DiscordKey.js')
var db = require('diskdb')
db = db.connect(`${__dirname}/data-db`, ['servers', 'users', 'settings'])

client.on('ready', () => {
  console.log(`Shiro initialized as ${client.user.tag}!`)
})

const headpats = ["https://i.imgur.com/yRcbAsP.gif", "https://i.imgur.com/WyMHuyL.gif"]
const trigger = ">>"

client.on('message', msg => {
  if(msg.content.startsWith(trigger + "sudo")) {
    const command = msg.content.split(" ")
    command[1] = command[1].replace(trigger + "sudo ", "")
    console.log(command[1])
    switch(command[1]) {
      case "ban": {
        if(command[2] && command[3]) {
          msg.channel.send(`:no_entry:️ | User: ${command[2]} successfully banned for \`${command[3]}\``)
        }
      }
    }
  }
  else if(msg.content.startsWith(trigger)) {
    const command = msg.content.split(" ")
    command[0] = command[0].replace(trigger, "")
    switch (command[0]) {
      case "help": {
        msg.channel.send("Welcome to Shiro!")
        break;
      }
      case "headpat": {
        msg.channel.send(headpats[0], 'headpat.gif', 'HEAADPATTT')
        break;
      }
      case "shutuptowinimtryingsomething": {
        msg.channel.send("SHHHH TOWIN", {
          files: [
            headpats[0]
          ]
        })
        break;
      }
      case "bean": {
        if(command[1])
          if(command[1].includes("@") && command[1].includes(">"))
            msg.channel.send(command[1].split(" ")[0] + " has been officially beaned.", {
              files: [
                'images/bean.jpg'
              ]
            })
        break;
      }
      case "balance": {
        msg.reply("you currently have :gem: 0")
        break;
      }
      case "give": {
        msg.channel.send(`:bank: | Are you sure you wish to transfer: :gem: ${command[1]} to user ${command[2]}? `).then(msg => {
          msg.react("☑")
          msg.react("❌")
        })
      }
    }
  }
})

client.login(token)