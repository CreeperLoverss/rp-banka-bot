const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 💰 BANKA (default)
let banka = { balance: 456636 };
if (fs.existsSync('banka.json')) {
  banka = JSON.parse(fs.readFileSync('banka.json'));
}

// 🔧 FIXY (default)
let fixy = { kusy: 155 };
if (fs.existsSync('fixy.json')) {
  fixy = JSON.parse(fs.readFileSync('fixy.json'));
}

// 🧑 MENÁ
let names = {};
if (fs.existsSync('names.json')) {
  names = JSON.parse(fs.readFileSync('names.json'));
}

// 💾 SAVE
function saveBank() {
  fs.writeFileSync('banka.json', JSON.stringify(banka, null, 2));
}

function saveFixy() {
  fs.writeFileSync('fixy.json', JSON.stringify(fixy, null, 2));
}

function saveNames() {
  fs.writeFileSync('names.json', JSON.stringify(names, null, 2));
}

// 🧑 IC NAME
function getICName(user) {
  return names[user.id] || user.username;
}

// 💵 FORMAT
function money(num) {
  return `$${num.toLocaleString()}`;
}

// 🚀 READY
client.once('ready', () => {
  console.log(`✅ Prihlásený ako ${client.user.tag}`);
});

// 💬 MESSAGE HANDLER
client.on('messageCreate', (message) => {

  if (message.author.bot) return;

  const msg = message.content.trim();
  const args = msg.split(" ");

  // 🧑 SETNAME
  if (args[0] === "!setname") {
    const name = args.slice(1).join(" ");
    if (!name) return message.reply("Použi !setname Meno Priezvisko");

    names[message.author.id] = name;
    saveNames();

    return message.reply(`🧑 IC meno: **${name}**`);
  }

  // 💰 STAV BANKY
  if (msg === "!stav") {
    const embed = new EmbedBuilder()
      .setTitle("💰 RP BANKA")
      .addFields(
        { name: "Balance", value: money(banka.balance), inline: false },
        { name: "IC meno", value: getICName(message.author), inline: false }
      )
      .setColor("Gold");

    return message.channel.send({ embeds: [embed] });
  }

  // 💸 BANKA
  if (args[0] === "!banka") {

    const amount = parseInt(args[1]);
    if (isNaN(amount)) {
      return message.reply("Použi !banka +10000 alebo -5000 (popis)");
    }

    const match = msg.match(/\(([^)]+)\)/);
    const description = match ? match[1] : "Bez popisu";

    banka.balance += amount;
    saveBank();

    const embed = new EmbedBuilder()
      .setTitle("🏦 TRANSAKCIA")
      .addFields(
        { name: "Suma", value: money(amount), inline: true },
        { name: "Popis", value: description, inline: false },
        { name: "IC", value: getICName(message.author), inline: false },
        { name: "Nový stav", value: money(banka.balance), inline: false }
      )
      .setColor(amount > 0 ? "Green" : "Red");

    return message.channel.send({ embeds: [embed] });
  }

  // 🔧 FIXY (SKLAD)
  if (args[0] === "!fixy") {

    const amount = parseInt(args[1]);

    if (isNaN(amount)) {
      return message.reply("Použi !fixy +20 (popis)");
    }

    const match = msg.match(/\(([^)]+)\)/);
    const description = match ? match[1] : "Bez popisu";

    fixy.kusy += amount;
    saveFixy();

    const typ = amount > 0 ? "📥 Naskladnené" : "📤 Vydané";

    const embed = new EmbedBuilder()
      .setTitle("🔧 FIXBOX SKLAD")
      .addFields(
        { name: "Typ", value: typ, inline: true },
        { name: "Počet", value: `${amount} ks`, inline: true },
        { name: "IC meno", value: getICName(message.author), inline: true },
        { name: "Popis", value: description, inline: false },
        { name: "Aktuálny stav", value: `${fixy.kusy} ks`, inline: false }
      )
      .setColor(amount > 0 ? "Green" : "Red");

    return message.channel.send({ embeds: [embed] });
  }

  // 🔧 STAV FIXOV
  if (msg === "!stavfixy") {

    const embed = new EmbedBuilder()
      .setTitle("🔧 STAV FIXBOX SKLADU")
      .setDescription(`📦 Aktuálny stav: **${fixy.kusy} ks**`)
      .setColor("Blue");

    return message.channel.send({ embeds: [embed] });
  }

});

// 🔐 TOKEN (Railway)
client.login(process.env.TOKEN);
