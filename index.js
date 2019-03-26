const botconfig =  require("./botconfig.json");
const tokenfile = require("./token.json")
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
const mongoose = require("mongoose");
bot.commands = new Discord.Collection();
let xp = require("./xp.json");
let purple = botconfig.purple;
mongoose.connect("mongodb://localhost:27017/IMPORTANT", {
  useNewUrlParser: true
});
const Money = require("./models/money.js")
fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });

});

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setActivity("With Skanheroo#5277");

});

bot.on("guildMemberAdd", async member => {
  console.log(`${member.id} joined the server.`);

  let welcomechannel = member.guild.channels.find(`name`, "welcome");
  welcomechannel.send(`LOOK OUT PEOPLE ${member} has joined our party!`);
});

bot.on("guildMemberRemove", async member => {
  console.log(`${member.id} left the server.`);

  let welcomechannel = member.guild.channels.find(`name`, "welcome");
  welcomechannel.send(`OHH! ${member} has left our party :sob:`);
});

bot.on("channelCreate", async channel => {

  console.log(`${channel.name} has been created.`);

  let sChannel = channel.guild.channels.find(`name`, "general");
  sChannel.send(`${channel} has been created`);

});

bot.on("channelDelete", async channel => {

  console.log(`${channel.name} has been deleted.`);

  let sChannel = channel.guild.channels.find(`name`, "general");
  sChannel.send(`${channel.name} has been deleted`);

});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
  if(!prefixes[message.guild.id]){
    prefixes[message.guild.id] = {
      prefixes: botconfig.prefix
    };
  }

  //if(!coins[message.author.id]){
    //coins[message.author.id] = {
  ///    coins: 0
  //  };
 // }



 /// let coinAmt = Math.floor(Math.random() * 15) + 1;
  //let baseAmt = Math.floor(Math.random() * 15) + 1;
 // console.log(`${coinAmt} ; ${baseAmt}`);

  //   coins[message.author.id] = {
  ///    coins: coins[message.author.id].coins + coinAmt
  //  };
  //fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
  //  if (err) console.log(err)
  //});
  //let coinEmbed = new Discord.RichEmbed()
  //.setAuthor(message.author.username)
 // .setColor("#0000FF")
  //.addField("💸", `${coinAmt} coins added!`);

 // message.channel.send(coinEmbed).then(msg => {msg.delete(5000)});
 // }

  let xpAdd = Math.floor(Math.random() * 7) + 8;
    console.log(xpAdd);

    if(!xp[message.author.id]){
      xp[message.author.id] = {
       xp: 0,
        level: 1
      };
    }

    let curxp = xp[message.author.id].xp;
    let curlvl = xp[message.author.id].level;
    let nxtLvl = xp[message.author.id].level * 300;
    xp[message.author.id].xp =  curxp + xpAdd;
    if(nxtLvl <= xp[message.author.id].xp){
      xp[message.author.id].level = curlvl + 1;
      let lvlup = new Discord.RichEmbed()
      .setTitle("Level Up!")
      .setColor(purple)
      .addField("New Level", curlvl + 1);

      message.channel.send(lvlup).then(msg => {msg.delete(5000)});
    }
    fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
      if(err) console.log(err)
    });

  let prefix = prefixes[message.guild.id].prefixes;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);


  if (message.content.startsWith(prefix)) {
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);
} else {
  let coinstoadd = Math.ceil(Math.random() * 50);
  console.log(coinstoadd + " coins");
  Money.findOne({
    userID: message.author.id,
    serverID: message.guild.id
  }, (err, money) => {
    if(err) console.log(err);
    if(!money){
      const newMoney = new Money({
        userID: message.author.id,
        serverID: message.guild.id,
        money: coinstoadd
      })

      newMoney.save().catch(err => console.log(err));    
    }else {
      money.money = money.money + coinstoadd;
      money.save().catch(err => console.log(err));
    }
  })
  }
  

 });

bot.login(tokenfile.token);
