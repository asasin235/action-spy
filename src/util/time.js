// Chrome/Chromium/Arc: microseconds since 1601-01-01 UTC
const CHROME_EPOCH_OFFSET_US = 11644473600000000n;
// Safari: float seconds since 2001-01-01 UTC
const SAFARI_EPOCH_OFFSET_S = 978307200;

export function chromeToUnix(us) {
  const n = typeof us === 'bigint' ? us : BigInt(Math.trunc(Number(us) || 0));
  return Math.floor(Number(n - CHROME_EPOCH_OFFSET_US) / 1_000_000);
}

export function unixToChrome(unixSec) {
  return BigInt(Math.trunc(Number(unixSec))) * 1_000_000n + CHROME_EPOCH_OFFSET_US;
}

export function safariToUnix(s) {
  return Math.floor(Number(s) + SAFARI_EPOCH_OFFSET_S);
}

export function unixToSafari(unixSec) {
  return Math.floor(Number(unixSec) - SAFARI_EPOCH_OFFSET_S);
}

export function toUnix(value, epoch) {
  if (epoch === 'chrome') return chromeToUnix(value);
  if (epoch === 'safari') return safariToUnix(value);
  return Math.floor(Number(value));
}

export function fromUnix(unixSec, epoch) {
  if (epoch === 'chrome') return unixToChrome(unixSec);
  if (epoch === 'safari') return unixToSafari(unixSec);
  return Math.floor(Number(unixSec));
}
