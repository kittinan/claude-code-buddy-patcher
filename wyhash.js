// Wyhash — exact match for Zig's std.hash.Wyhash and Bun.hash()
// Ported from ziglang/zig lib/std/hash/wyhash.zig
// Argument order: wyhash(seed, input) — seed is BigInt, input is string or Uint8Array

const SECRET = [0xa0761d6478bd642fn, 0xe7037ed1a0b428dbn, 0x8ebc6af09c88c6e3n, 0x589965cc75374cc3n];
function u64(x) { return BigInt.asUintN(64, x); }
function mum(a_, b_) { const a = u64(a_), b = u64(b_), p = a * b; return [u64(p), u64(p >> 64n)]; }
function mix(a, b) { const [lo, hi] = mum(a, b); return u64(lo ^ hi); }
function read8(d, o) {
  return u64(BigInt(d[o])|(BigInt(d[o+1])<<8n)|(BigInt(d[o+2])<<16n)|(BigInt(d[o+3])<<24n)|
    (BigInt(d[o+4])<<32n)|(BigInt(d[o+5])<<40n)|(BigInt(d[o+6])<<48n)|(BigInt(d[o+7])<<56n));
}
function read4(d, o) {
  return u64(BigInt(d[o])|(BigInt(d[o+1])<<8n)|(BigInt(d[o+2])<<16n)|(BigInt(d[o+3])<<24n));
}

// Exact port of Zig's Wyhash.hash
function wyhash(seed, input) {
  const key = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const len = key.length;

  // init: state[0..2] = seed ^ mix(seed ^ secret[0], secret[1])
  let s0 = u64(seed ^ mix(u64(seed ^ SECRET[0]), SECRET[1]));
  let s1 = s0, s2 = s0;
  let a = 0n, b = 0n;

  if (len <= 16) {
    // smallKey
    if (len >= 4) {
      const q = (len >>> 3) << 2;
      a = u64((read4(key, 0) << 32n) | read4(key, q));
      b = u64((read4(key, len - 4) << 32n) | read4(key, len - 4 - q));
    } else if (len > 0) {
      a = u64((BigInt(key[0]) << 16n) | (BigInt(key[len >> 1]) << 8n) | BigInt(key[len - 1]));
      b = 0n;
    }
  } else {
    let i = 0;
    // round: process 48-byte blocks
    if (len >= 48) {
      while (i + 48 < len) {
        s0 = mix(u64(read8(key, i) ^ SECRET[1]), u64(read8(key, i + 8) ^ s0));
        s1 = mix(u64(read8(key, i + 16) ^ SECRET[2]), u64(read8(key, i + 24) ^ s1));
        s2 = mix(u64(read8(key, i + 32) ^ SECRET[3]), u64(read8(key, i + 40) ^ s2));
        i += 48;
      }
      // final0
      s0 = u64(s0 ^ s1 ^ s2);
    }
    // final1: process remaining 16-byte blocks
    const rem = len - i;
    let j = 0;
    while (j + 16 < rem) {
      s0 = mix(u64(read8(key, i + j) ^ SECRET[1]), u64(read8(key, i + j + 8) ^ s0));
      j += 16;
    }
    a = read8(key, len - 16);
    b = read8(key, len - 8);
  }

  // final2
  a = u64(a ^ SECRET[1]);
  b = u64(b ^ s0);
  const [lo, hi] = mum(a, b);
  a = lo; b = hi;
  return u64(mix(u64(a ^ SECRET[0] ^ BigInt(len)), u64(b ^ SECRET[1])));
}

if (typeof module !== 'undefined') module.exports = { wyhash };
