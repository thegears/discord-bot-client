const express = require("express");
const app = express();
const server = app.listen(5555);
const { Server } = require("socket.io");
const io = new Server(server);
const config = require('./config.json');
const { Client } = require('discord.js');
const client = new Client({
    intents: 32767
});
const cors = require("cors");
client.login(config.token);
client.on("ready", () => console.log("Bot is ready!"));

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname+"/dist"));

let activeChannel = "";

io.on("connection", (socket) => {
    socket.on("setActiveChannel", data => {
        activeChannel = data;
    });
});

client.on("messageCreate", (message) => {
    if (message.channel.id == activeChannel) {
        if(!message.content) return false;
        io.sockets.emit("newMessage", {
            content: message.content,
            tag: message.author.tag,
            avatar: message.member.user.displayAvatarURL()
        });
    };
});

app.get("/getGuilds", (req, res) => {
    let guilds = client.guilds.cache.map(r => r);

    res.status(200).send({
        guilds
    });
});

app.post("/getChannels", (req, res) => {
    channels = [];
    channels = client.guilds.cache.get(req.body.activeGuild)?.channels.cache.filter(a => a.type == "GUILD_TEXT").map(r => r);

    res.status(200).send({
        channels
    });
});

app.post("/getUsers", (req, res) => {
    let users = [];
    users = client.guilds.cache.get(req.body.activeGuild)?.members.cache.map(r => r);

    res.status(200).send({
        users
    });
});

app.post("/sendMessage", (req, res) => {
    client.channels.cache.get(activeChannel)?.send({
        content: `${req.body.message}`
    });
});