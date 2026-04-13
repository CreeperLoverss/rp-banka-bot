const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔐 TOKEN (PC verzia)
client.login(process.env.TOKEN);

// 💰 BANKA
let banka = { balance: 500000 };
if (fs.existsSync('banka.json')) {
  banka = JSON.parse(fs.readFileSync('banka.json'));
}

// 🧑 IC MENÁ
let names = {};
if (fs.existsSync('names.json')) {
  names = JSON.parse(fs.readFileSync('names.json'));
}

// 📊 STATS
let stats = {
  deposits: 0,
  withdrawals: 0,
  transactions: 0,
  day: new Date().getDate()
};

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

// 💵 FORMAT $
function money(num) {
  return `$${num.toLocaleString()}`;
}

// 🚀 READY
client.once('ready', () => {
  console.log(`✅ Prihlásený ako ${client.user.tag}`);
});

// 💥 ONLY ONE MESSAGE HANDLER (FIX DUPLICATE BUG)
client.on('messageCreate', (message) => {

  if (message.author.bot) return;

  const args = message.content.split(" ");

  console.log("📩:", message.content);

  // 🔄 RESET STATS
  if (stats.day !== new Date().getDate()) {
    stats = {
      deposits: 0,
      withdrawals: 0,
      transactions: 0,
      day: new Date().getDate()
    };
  }

  // 🧑 SET NAME
  if (args[0] === "!setname") {
    const name = args.slice(1).join(" ");
    if (!name) return message.reply("Použi !setname Meno Priezvisko");

    names[message.author.id] = name;
    saveNames();

    return message.reply(`🧑 IC meno: **${name}**`);
  }

  // 💰 STAV
  if (message.content === "!stav") {
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

    const match = message.content.match(/\(([^)]+)\)/);
    const description = match ? match[1] : "Bez popisu";

    banka.balance += amount;
    saveBank();

    stats.transactions++;
    if (amount > 0) stats.deposits += amount;
    else stats.withdrawals += Math.abs(amount);

    const embed = new EmbedBuilder()
      .setTitle("🏦 TRANSAKCIA")
      .addFields(
        { name: "Typ", value: amount > 0 ? "➕ Vklad" : "➖ Výplata", inline: true },
        { name: "Suma", value: money(amount), inline: true },
        { name: "Popis", value: description, inline: false },
        { name: "IC", value: getICName(message.author), inline: false },
        { name: "Nový stav", value: money(banka.balance), inline: false }
      )
      .setColor(amount > 0 ? "Green" : "Red");

    return message.channel.send({ embeds: [embed] });
  }

  // 📈 DENNÝ REPORT
  if (message.content === "!dennyreport") {

    const embed = new EmbedBuilder()
      .setTitle("📈 DENNÝ REPORT")
      .addFields(
        { name: "💰 Stav", value: money(banka.balance), inline: false },
        { name: "📊 Príjmy", value: money(stats.deposits), inline: true },
        { name: "📉 Výdavky", value: money(stats.withdrawals), inline: true },
        { name: "🧾 Transakcie", value: `${stats.transactions}`, inline: false }
      )
      .setColor("Blue");

    return message.channel.send({ embeds: [embed] });
  }

  // 📄 OMLUVENKA
if (message.content.startsWith("!omluvenka")) {

  const args = message.content.split(" ");

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

client.login(process.env.TOKEN);
