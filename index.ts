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

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (message) => {
	// console.log("ali");

	if (message.author.bot && message.author.id === "972039350407823400") {
		console.log("Message by ", message.author.displayName);
	}
});

client.on("messageUpdate", async (_oldMessage, newMessage) => {
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
});

client.on(Events.ShardError, (error) => {
	console.error("A websocket connection encountered an error:", error);
});

client.login(TOKEN);
