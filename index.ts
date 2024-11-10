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

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (message) => {
    // || "String" like you did before would return "true" in every single instance,
    // this is case sensitive, if you wanna make it case insensitive
    // use `message.content.toLowerCase() == "lowercasestring"`
    console.log("ali");

    if (message.author.bot && message.author.id === "972039350407823400") {
        // console.log(message);
        // message.channel.send(`Ali mesami :D ${message.author}`);
    }
});

client.on("messageUpdate", (message) => {
    // || "String" like you did before would return "true" in every single instance,
    // this is case sensitive, if you wanna make it case insensitive
    // use `message.content.toLowerCase() == "lowercasestring"`
    console.log("ali");

    if (!message.author) {
        return;
    }

    if (message.author.bot && message.author.id === "972039350407823400") {
        for (const data of message.embeds) {
            console.log(data.title);
            console.log(data.url);
        }
    }
});

// Log in to Discord with your client's token
client.login(TOKEN);
