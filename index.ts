import {
  // REST, Routes,
  Client,
  Events,
  GatewayIntentBits,
} from "discord.js";
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

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (message) => {
  try {
    if (message.author.bot && message.author.id === "972039350407823400") {
      console.log("Message by ", message.author.displayName);
    }
  } catch (error) {
    console.error("Error in messageCreate event:", error);
  }
});

client.on("messageUpdate", async (_oldMessage, newMessage) => {
  try {
    if (!newMessage.author) {
      return;
    }

    const embed = newMessage.embeds[0];
    if (!embed?.title || !embed?.url) {
      return;
    }

    const embedsTitle = embed.title;
    const embedsUrl = embed.url;

    if (
      newMessage.author.bot &&
      newMessage.author.id === "972039350407823400" &&
      embedsTitle &&
      embedsUrl
    ) {
      // console.log(JSON.stringify(newMessage.embeds, null, 4));
      const { data } = await supabase
        .from("songs")
        .select("name, amount")
        .eq("name", embedsTitle)
        .eq("url", embedsUrl);

      if (data && data?.length > 0) {
        //if song found update its amount
        const { error } = await supabase
          .from("songs")
          // biome-ignore lint/style/noNonNullAssertion: if data.length > 0, data[0] always exists
          .update({ amount: data![0].amount + 1 })
          .eq("name", embedsTitle)
          .eq("url", embedsUrl);

        if (error) {
          console.log("error in update");
          console.log(error);
          return;
        }

        //settimeout to hopefully prevent duplicate listens
        setTimeout(() => {}, 1500);
        console.log(`Updated ${embedsTitle} to ${data[0].amount + 1} listens`);

        return;
      }

      const { error } = await supabase.from("songs").insert({
        name: embedsTitle,
        url: embedsUrl,
        amount: 1,
      });
      //settimeout to hopefully prevent duplicate listens
      setTimeout(() => {}, 1000);

      if (error) {
        console.log("error in initializing value");
        console.log(error);
        return;
      }
      console.log(`Initialized ${embedsTitle}`);
    }
  } catch (error) {
    console.error("Error in messageUpdate event:", error);
  }
});

client.on(Events.ShardError, async (error) => {
  try {
    console.error(
      "A websocket connection encountered an error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    await reconnect();
  } catch (innerError) {
    console.error("Error in error handler:", innerError);
    await reconnect();
  }
});

client.on(Events.Error, async (error) => {
  console.error("Client error:", error);
  await reconnect();
});

client.on(Events.Warn, (info) => {
  console.warn("Warning:", info);
});

client.login(TOKEN);

client.on("disconnect", () => {
  console.log("Bot disconnected!");
  reconnect();
});

const reconnect = async () => {
  try {
    console.log("Attempting to reconnect...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await client.login(TOKEN);
    console.log("Reconnected successfully!");
  } catch (error) {
    console.error("Failed to reconnect:", error);
    console.log("Trying again in 5 seconds...");
    await reconnect();
  }
};

client.on(Events.Debug, (info) => {
  console.log("Debug:", info);
});

client.on(Events.Error, async (error) => {
  console.error("Client error:", error);
  await reconnect();
});
