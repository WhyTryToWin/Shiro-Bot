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
const helpMessage = `
==================
**Core Command Prefix**: \`>>\`
==================
**Shiro's Command List**
-------------------------
**Core**: \`help\` \`support\` \`ping\` \`selfroles\`
**Currency/Social**: \`balance\` \`give\` \`rank\`
**Misc**: \`conch\` \`choose\` \`cat\` \`catfacts\` \`headpat\` \`bean\`
**Information**: \`avatar\` \`stats\` \`serverinfo\` \`userinfo\`
\`\`\`- When using the commands be sure to excluded the aesthetics.
- For Moderation Command list type >>sudo help.\`\`\`
`

function Shiro() {
	this.requestFulfilled = msg => {
	}
}

const bot = new Shiro()

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
	msg.author.send(helpMessage)
        msg.channel.send("I sent help your way in the form of a DM!")
        bot.requestFulfilled(msg)
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
        bot.requestFulfilled(msg)
        break;
      }
      case "conch": {
      	if(command[1]) {
          const responses = ["absolutely not", "possibly", "ask again", "of course", "isn't it obvious?", "what a stupid question.", "YES!", "nope", "of course not", "I honestly have no clue. I'm just a random shell found somewhere, how could I know?"]
          msg.reply(`:shell: | **The magic conch shell says:** \`${responses[Math.floor(Math.random() * responses.length)]}\``)
        }
        bot.requestFulfilled(msg)
      }
      case "bean": {
        if(command[1])
          if(command[1].includes("@") && command[1].includes(">"))
            msg.channel.send(command[1].split(" ")[0] + " has been officially beaned.", {
              files: [
                'images/bean.jpg'
              ]
            })
        bot.requestFulfilled(msg)
        break;
      }
      case "balance": {
        msg.reply("you currently have :gem: 0")
        bot.requestFulfilled(msg)
        break;
      }
      case "give": {
        msg.channel.send(`:bank: | Are you sure you wish to transfer: :gem: ${command[1]} to user ${command[2]}? `).then(msg => {
          msg.react("☑")
          msg.react("❌")
        })
        bot.requestFulfilled(msg)
      }
      default: {
      }
    }
  }
})

client.login(token)
