// Imports
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const client = require("./bot");

const app = express();
app.use(express.json());

/* LOGIN ROUTE */
app.get("/auth/discord", (req, res) => {
    const redirect = encodeURIComponent(process.env.REDIRECT_URI);
    const url =
        `https://discord.com/oauth2/authorize` +
        `?client_id=${process.env.CLIENT_ID}` +
        `&response_type=code` +
        `&scope=identify%20guilds` +
        `&redirect_uri=${redirect}`;
    res.redirect(url);
});

/* CALLBACK */
app.get("/auth/discord/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("No code");

    try {
        const tokenRes = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.REDIRECT_URI
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenRes.data.access_token;

        // USER INFO
        const userRes = await axios.get(
            "https://discord.com/api/users/@me",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const discordId = userRes.data.id;

        // ADD ROLE
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(discordId);
        await member.roles.add(process.env.ROLE_ID);

        res.redirect("https://lilzeng1.github.io/Levant/?linked=true");

    } catch (err) {
        console.error(err.response?.data || err);
        res.send("Auth failed");
    }
});

app.listen(3000, () => {
    console.log("Backend running on port 3000");
});
