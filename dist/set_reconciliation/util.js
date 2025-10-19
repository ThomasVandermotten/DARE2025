export function objectToBigInt(object) {
    const str = JSON.stringify(object, Object.keys(object).sort());
    const bytes = new TextEncoder().encode(str); // Uint8Array
    let bigInt = 0n;
    for (let b of bytes) {
        bigInt = (bigInt << 8n) + BigInt(b);
    }
    return bigInt;
}
export function bigIntToObject(bigInt) {
    const bytes = [];
    while (bigInt > 0) {
        bytes.unshift(Number(bigInt & 0xffn));
        bigInt >>= 8n;
    }
    const str = new TextDecoder().decode(new Uint8Array(bytes));
    return JSON.parse(str);
}
