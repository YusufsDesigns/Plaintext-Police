export const PRIVATE_KEY_PATTERNS = [
    // PRIVATE_KEY=0x + 64 hex chars
    /PRIVATE[_-]?KEY\s*=\s*0x[0-9a-fA-F]{64}/i,

    // Without 0x prefix
    /PRIVATE[_-]?KEY\s*=\s*[0-9a-fA-F]{64}/i,

    // In code: const privateKey = "0x..."
    /(?:privateKey|private_key|privKey)\s*[:=]\s*["'`]0x[0-9a-fA-F]{64}["'`]/i,

    // Forge/Cast CLI: --private-key 0x...
    /--private-key\s+0x[0-9a-fA-F]{64}/i,

    // Mnemonic seed phrase (12-24 words)
    /(?:MNEMONIC|SEED_PHRASE|SEED)\s*=\s*(?:[a-z]+ ){11,23}[a-z]+/i,
];

export function detectPrivateKey(text: string): boolean {
    return PRIVATE_KEY_PATTERNS.some(pattern => pattern.test(text));
}