import crypto from "crypto";

export function generateVerifier() {
	return crypto.randomBytes(32).toString("hex");
}

export function generateChallenge(verifier: string) {
	return crypto.createHash("sha256").update(verifier).digest("base64url");
}
