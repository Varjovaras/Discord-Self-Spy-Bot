import { REST, Routes, Client, Events, GatewayIntentBits } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASEURL = Bun.env.SUPA_URL;
const SUPABASEKEY = Bun.env.SUPA_KEY;
const TOKEN = Bun.env.API_TOKEN;
const CLIENT_ID = Bun.env.CLIENT_ID;

if (!SUPABASEURL) throw Error("No supa url");
if (!TOKEN) throw Error("No discord token");
if (!CLIENT_ID) throw Error("No discord client_id");
if (!SUPABASEKEY) throw Error("No supabasekey");

const supabase = createClient(SUPABASEURL, SUPABASEKEY);
const client = new Client({
    intents: [GatewayIntentBits.Guilds, "GuildMessages", "MessageContent"],
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (message) => {
    console.log("ali");

    if (message.author.bot && message.author.id === "972039350407823400") {
        // console.log(message);
        // message.channel.send(`Ali mesami :D ${message.author}`);
    }
});

client.on("messageUpdate", (_oldMessage, newMessage) => {
    console.log("ali");

    if (!newMessage.author) {
        return;
    }

    if (
        newMessage.author.bot &&
        newMessage.author.id === "972039350407823400" &&
        newMessage.embeds[0].title &&
        newMessage.embeds[0].url
    ) {
        console.log(JSON.stringify(newMessage.embeds, null, 4));

        //there should only be  1 embed
        for (const data of newMessage.embeds) {
            console.log(data.title);
            console.log(data.url);
        }
    }
});

// Log in to Discord with your client's token
client.login(TOKEN);
