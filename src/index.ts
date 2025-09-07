import { loadAll, watchFiles } from "./util/loader";
import DiscordClient from "./classes/client";

export const client = new DiscordClient();
const dev = Bun.env.NODE_ENV === "development";

await loadAll(client);

if (dev) watchFiles(client);

client.login(Bun.env.DISCORD_CLIENT_TOKEN);
