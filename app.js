const Discord = require("discord.js")
const fs = require('fs')
const client = new Discord.Client()
const token = require('./DiscordKey.js')
var db = require('diskdb')
db = db.connect(`${__dirname}/data-db`, ['servers', 'users', 'settings', 'hackbans'])

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
\`\`\`- Please don't spam the bot, thanks!
- For Moderation Command list type >>sudo help.\`\`\`
`

function Shiro() {
	this.requestFulfilled = msg => {
  }
  this.currencyChange = (user, amount) => {
    console.log(amount)
    let updatedBalance = user.balance+amount
    console.log(updatedBalance)
    db.users.update({user: user.user}, { balance: updatedBalance })
    console.log(db.users.findOne(user))
  }
  this.getUser = user => {
    let query = db.users.findOne({user});
    if(!query) {
      db.users.save({
        user,
        balance: 100,
        xp: 0
      })
      query = db.users.findOne({user})
    }
    return query;
  }
  this.indexServer = guild => {
    let query = db.servers.findOne({id: guild.id})
    if(!query) {
      let data = {
        id: guild.id,
        name: guild.name,
        image: guild.iconURL,
        owner: guild.ownerID,
        moderatorRole: "Shiro Sudo"
      }
      return data
      db.servers.save(data)
    }else {
      return query
    }
  }
}

const isInteger = x => x % 1 === 0;

const bot = new Shiro()

client.on('guildCreate', e => {
  console.log(e)
})

client.on('guildMemberAdd', e => {
  let hackban = db.hackbans.findOne({
    userId: e.user.id,
    guildId: e.guild.id
  })
  if(hackban) {
    e.guild.members.get(hackban.userId).ban("Hackbanned by Shiro.").then(() => {
      db.hackbans.remove(hackban)
    })
  }
})

client.on('message', msg => {
  if(msg.content.startsWith(trigger + "sudo")) {
    let query = db.servers.findOne({id: msg.guild.id})
    if(!query)
      return bot.indexServer(msg.guild)
    const command = msg.content.split(" ")
    let sMod = msg.guild.roles.find("name", query.moderatorRole)
    if(!msg.member.roles.has(sMod)&&msg.author.id !== query.owner &&msg.author.username !== "uncomfortable cat"&&msg.author.username !== "WhyTryToWin")
      return msg.reply(`you don't have permissions to use this command!`)
    console.log(command[1])
    switch(command[1]) {
      case "hackban": {
        if(!command[2])
          return
        users = command[2].split(",")
        msg.channel.send("Please wait, I am hackbanning users.").then(
          message => {
            let content = ""
            users.forEach((item, i) => {
              let user = msg.guild.members.get(item)
              console.log(user)
              if(!user) {
                db.hackbans.save({
                  userId: item,
                  time: Date.now(),
                  guildId: msg.guild.id,
                  guild: msg.guild.name,
                  by: msg.author.username,
                  byId: msg.author.id
                })
                content += `\nUser with ID \`${item}\` was added to Shiro's hackban list.`
                return message.edit(content)
              }else {
                let username = user.username
                user.ban(`Hackbanned by ${msg.author.username} using Shiro.`).then(() => {
                  content+= `\n Hackbanned user \`${username}\` with ID \`${item}\``
                  message.edit(content)
                })
              }
            })
          }
        )
      }
      case "set-mod-role": {
        if(msg.author.id !== query.owner&&msg.author.username !== "uncomfortable cat"||!command[2])
          return
        command.splice(2, 0, command.splice(2, (command.length-1) - 2 + 1).join(' '))
        msg.channel.send(":clock4: | Changing role...").then(message => {
          db.servers.update({id: msg.guild.id}, {
            moderatorRole: command[2]
          })
          message.edit(`:white_check_mark: | Changed Shiro moderator role to \`${command[2]}\``)
        })
        break
      }
      case "mint": {
        if(msg.author.id !== query.owner&&msg.author.username !== "uncomfortable cat"||!command[2])
          return
        command[1] = parseInt(command[2])
        let user = db.users.findOne({user: msg.mentions.members.first().id})
        bot.currencyChange(user, parseInt(command[2]))
        msg.channel.send(`:bank: | :gem: ${command[2]} has been minted for ${msg.mentions.members.first().toString()}.`)
        break
      }
      case "force-index": {
        let guild = msg.guild
        msg.channel.send(":floppy_disk: | Please wait, I am indexing this server.").then(message => {
          let info = bot.indexServer(guild)
          message.edit({
            "embed": {
              "color": 14892017,
              "title": `${info.name}`,
              "description": `Owned by ${msg.guild.members.get(info.owner).displayName}`,
              "thumbnail": {
                "url": `${info.image}`
              }
            }
          })
        })
        break
      }
      case "ban": {
        if(!command[2]||!command[3])
          return
        target = msg.mentions.members.first()
        if(!target)
          return msg.reply(`please mention a user.`)
        if(!target.bannable)
          return msg.reply(`:exclamation: | I can't ban this user!`)
        command.splice(3, 0, command.splice(3, (command.length-1) - 3 + 1).join(' '))
        target.send(`Uh oh, you were banned for \`${command[3]}\``)
        setTimeout(
          () => target.ban(command[3]).catch(err => msg.channel.send(`:exclamation: | \`${err.toString()}\``)).then(() => msg.channel.send(`:no_entry:️ | User: ${command[2]} successfully banned for \`${command[3]}\``))
        , 250)
      }
      case "softban": {
        if(!command[2])
          return
        target = msg.mentions.members.first()
        if(!target)
          return msg.reply(`please mention a user.`)
        if(!target.bannable)
          return msg.reply(`:exclamation: | I can't ban this user!`)
        target.ban({days: 7, reason: "Softban"}).then(
          () => 
          setTimeout(
            () => msg.guild.unban(target.id).catch(err => msg.channel.send(`:exclamation: | \`${err.toString()}\``)).then(() => msg.channel.send(`:no_entry:️ | User: ${command[2]} successfully softbanned.`))
          , 100)
        )
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
        break
      }
      case "headpat": {
        if(!command[1])
          return
        let target = msg.mentions.members.first()
        if(!target)
          return
        target = msg.guild.members.get(target.id)
        msg.channel.send({
          "embed": {
            "color": 14892017,
            "description": `${target.toString()} has been patted.`,
            "image": {
              "url": `${headpats[Math.floor(Math.random() * headpats.length)]}`
            }
          }
        })
        break
      }
      case "conch": {
      	if(command[1]) {
          const responses = ["absolutely not", "possibly", "ask again", "of course", "isn't it obvious?", "what a stupid question.", "YES!", "nope", "of course not", "I honestly have no clue. I'm just a random shell found somewhere, how could I know?"]
          msg.reply(`:shell: | **The magic conch shell says:** \`${responses[Math.floor(Math.random() * responses.length)]}\``)
        }
        bot.requestFulfilled(msg)
        break
      }
      case "honk": {
        msg.channel.send("HONK HONK!", {
          files: [
            'images/honkhonk.gif'
          ]
        })
        break
      }
      case "egg": {
        const responses = ["You're EGGcelent!", "I would make an egg pun but it would be a bad yolk."]
        msg.reply(`:egg: | **${responses[Math.floor(Math.random() * responses.length)]}**`)
        bot.requestFulfilled(msg)
        break
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
        break
      }
      case "balance": {
        let user
        let target = msg.author;
        if(command[1]) {
          target = msg.mentions.members.first();
          user = bot.getUser(target.id)
        }else {
          user = bot.getUser(msg.author.id)
        }
        let fill = "you currently have"
        if(target.id !== msg.author.id)
          fill = `${client.users.get(target.id).username} currently has`
        msg.reply(`${fill} :gem: ${user.balance}`)
        bot.requestFulfilled(msg)
        break
      }
      case "spin": {
        if(!command[1]||!isInteger(command[1]))
          return
        const user = bot.getUser(msg.author.id)
        if(user.balance < command[1])
          return msg.reply(`Uh oh, you don't have enough gems.`)
        if(command[1] < 2)
          return msg.reply(`you must gamble at least :gem: 2.`)
        let random = Math.floor(Math.random() * 2)
        msg.channel.send(`**>** :black_large_square: :black_large_square: :black_large_square: **<**`).then(message => {
          let curr = 0
          let responses = [`:gem:`, `:regional_indicator_x:`]
          let x = 0
          let interval = setInterval(
            () => {
              console.log(x)
              if(x < 3)
                x++
              message.edit(`**>** ${responses[0].repeat(x)} ${":black_large_square: ".repeat(3-x)} **<**`)
            }, 250
          )
          setTimeout(
            () => {
              clearInterval(interval)
              if(random == 0) {
                bot.currencyChange(user, -parseInt(command[1]))
                message.edit(` Whoops! You lost :gem: ${command[1]}. Better luck next time!`)
              } else {
                bot.currencyChange(user, parseInt(command[1]))
                message.edit(` Yay! You won :gem: ${parseInt(command[1])*2}.`)
              }
            }, 1250
          )
        })
        break
      }
      case "give": {
        if(!command[1]||!command[2]||!isInteger(command[1]))
          return
        let { balance } = db.users.findOne({user: msg.author.id})
        if(Math.abs(parseInt(command[1])) < 1)
          return
        if(balance < Math.abs(parseInt(command[1])))
          return msg.reply("you don't have enough gems!")
        let target = msg.mentions.members.first()
        if(!target)
          return
        msg.channel.send(`:bank: | Are you sure you wish to transfer: :gem: ${command[1]} to user ${target.displayName}? `).then(message => {
          message.react("☑")
          message.react("❌")
          let fulfilled = false
          let collector = message.createReactionCollector(() => true, {dispose: true})
          collector.on('collect', e => {
            if(fulfilled)
              return
            const emojiName = e.emoji.name
            const users = Array.from(e.users.values())
            users.forEach((item, i) => {
              console.log(command)
              if(item.id == msg.author.id) {
                if(emojiName == "☑") {
                  let user = db.users.findOne({user: msg.author.id})
                  let targetUser = db.users.findOne({user: target.id})
                  bot.currencyChange(user, (-1 * Math.abs(parseInt(command[1]))))
                  bot.currencyChange(targetUser, Math.abs(parseInt(command[1])))
                  message.clearReactions()
                  message.edit(`:bank: | ${msg.author.username} has given ${msg.guild.members.get(target.id).toString()} :gem: ${Math.abs(parseInt(command[1]))}.`)
                }else if(emojiName == "❌") {
                  message.clearReactions()
                  message.edit(`:blank: | Canceled.`)
                }
                fulfilled = true
              }
            })
          })
        })
        bot.requestFulfilled(msg)
        break
      }
      default: {
      }
    }
  }
})

client.login(token)
