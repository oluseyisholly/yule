import { randomBytes } from 'crypto';

export function generateInviteCode(length = 8): string {
  // base36 => 0-9 + a-z
  const buf = randomBytes(8);
  // convert to hex, parse as BigInt and then to base36 string
  const base36 = BigInt('0x' + buf.toString('hex')).toString(36);
  return base36.slice(0, length).toUpperCase(); // trim to desired length and uppercase
}
