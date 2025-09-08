import express from "express";
import { exchangeCodeForTokens, fetchMalUser } from "./mal";
import { generateVerifier, generateChallenge } from "./pkce";
import { prisma } from "@util/db";
import consola from "consola";

export const app = express();
const { MAL_CLIENT_ID, MAL_CALLBACK_URL } = Bun.env;

app.get("/link-mal/:discordId", async (req, res) => {
	const discordId = req.params.discordId;
	if (!discordId) return res.status(400).send("Missing discordId");

	const verifier = generateVerifier();
	const challenge = generateChallenge(verifier);

	const session = await prisma.authSession.upsert({
		where: { discordId },
		update: { verifier },
		create: { discordId, verifier },
	});

	const url = new URL("https://myanimelist.net/v1/oauth2/authorize");
	url.searchParams.set("response_type", "code");
	url.searchParams.set("client_id", MAL_CLIENT_ID!);
	url.searchParams.set("code_challenge", challenge);
	url.searchParams.set("redirect_uri", MAL_CALLBACK_URL!);
	url.searchParams.set("state", session.discordId);

	res.redirect(url.toString());
});

app.get("/callback", async (req, res) => {
	const { code, state } = req.query;
	if (!code || !state) return res.status(400).send("Missing code/state");

	const session = await prisma.authSession.findUnique({
		where: { discordId: state as string },
	});
	if (!session) return res.status(400).send("Invalid or expired session");

	try {
		const tokens = await exchangeCodeForTokens(
			code as string,
			session.verifier,
		);
		const malUser = await fetchMalUser(tokens.access_token);

		await prisma.user.upsert({
			where: { id: session.discordId },
			update: {
				malId: malUser.id.toString(),
				malUsername: malUser.name,
				malAccessToken: tokens.access_token,
				malRefreshToken: tokens.refresh_token,
				malExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
			},
			create: {
				id: session.discordId,
				malId: malUser.id.toString(),
				malUsername: malUser.name,
				malAccessToken: tokens.access_token,
				malRefreshToken: tokens.refresh_token,
				malExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
			},
		});

		// cleanup auth session
		await prisma.authSession.delete({
			where: { discordId: session.discordId },
		});

		res.sendFile("success.html", { root: "./public" });
	} catch (err: any) {
		consola.error(err);
		res.status(500).send("OAuth2 flow failed");
	}
});
