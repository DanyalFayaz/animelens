import type { MalUser, TokenResponse } from "@interfaces/mal-api";
import { apis } from "@util/constants";
import { prisma } from "@util/db";
import consola from "consola";

const { MAL_CLIENT_ID, MAL_CLIENT_SECRET, MAL_CALLBACK_URL, SERVER_DOMAIN } =
	Bun.env;

export async function exchangeCodeForTokens(code: string, verifier: string) {
	const res = await fetch(`${apis.myanimelistOAuth}/token`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: MAL_CLIENT_ID!,
			client_secret: MAL_CLIENT_SECRET!,
			code,
			grant_type: "authorization_code",
			redirect_uri: SERVER_DOMAIN + MAL_CALLBACK_URL!,
			code_verifier: verifier,
		}),
	});

	const data = (await res.json()) as TokenResponse;
	if (!res.ok)
		consola.error(res.statusText || "Failed to exchange code for tokens");

	return data;
}

export async function refreshTokens(refreshToken: string) {
	const res = await fetch(`${apis.myanimelistOAuth}/token`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: MAL_CLIENT_ID!,
			client_secret: MAL_CLIENT_SECRET!,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
	});

	const data = (await res.json()) as TokenResponse;
	if (!res.ok) consola.error(res.statusText || "Failed to refresh tokens");

	return data;
}

export async function fetchMalUser(accessToken: string) {
	const res = await fetch(`${apis.myanimelist}/users/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	const data = (await res.json()) as MalUser;
	if (!res.ok) consola.error(res.statusText || "Failed to fetch MAL user");

	return data;
}

export async function getValidMalToken(discordId: string) {
	const user = await prisma.user.findUnique({ where: { id: discordId } });
	if (!user || !user.malAccessToken) return null;

	if (user.malExpiresAt && user.malExpiresAt < new Date()) {
		const tokens = await refreshTokens(user.malRefreshToken!);

		await prisma.user.update({
			where: { id: discordId },
			data: {
				malAccessToken: tokens.access_token,
				malRefreshToken: tokens.refresh_token,
				malExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
			},
		});

		return tokens.access_token;
	}

	return user.malAccessToken;
}
