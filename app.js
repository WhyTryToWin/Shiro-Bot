const Discord = require("discord.js")
const fs = require('fs')
const client = new Discord.Client()
const token = require('./DiscordKey.js')

client.on('ready', () => {
  console.log(`Shiro initialized as ${client.user.tag}!`)
})

client.on('message', msg => {
  if (msg.content === 'Shiro, initialize this server!') {
    msg.channel.sendMessage('Okay, I will begin to index this server in my database!')
  }
})

client.login(token)