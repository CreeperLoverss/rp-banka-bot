const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 💰 BANKA
let banka = { balance: 500000 };
if (fs.existsSync('banka.json')) {
  banka = JSON.parse(fs.readFileSync('banka.json'));
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

// 💬 MESSAGE HANDLER (JEDINÝ!)
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

  // 💰 STAV
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

  // 📄 OMLUVENKA
  if (msg.startsWith("!omluvenka")) {

    const odDo = args.slice(1).join(" ") || "dopln";

    const embed = new EmbedBuilder()
      .setTitle("📄 OMLUVENKA")
      .addFields(
        { name: "📅 Od - Do", value: odDo, inline: false },
        { name: "🎭 IC dôvod", value: "dopln", inline: false },
        { name: "💬 OOC dôvod", value: "dopln", inline: false }
      )
      .setColor("Orange")
      .setFooter({ text: getICName(message.author) });

    return message.channel.send({ embeds: [embed] });
  }

});

// 🔐 TOKEN z Railway (NEUKLADAT DO KÓDU!)
client.login(process.env.TOKEN);
