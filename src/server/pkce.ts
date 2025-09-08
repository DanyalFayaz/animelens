import crypto from 'crypto';

export function generateVerifier() {
    return crypto.randomBytes(32).toString('hex');
}

export function generateChallenge(verifier: string) {
    return verifier;
}