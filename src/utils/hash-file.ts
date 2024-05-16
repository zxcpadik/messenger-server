import fs from 'node:fs';
import crypto from 'crypto';

/**
 * Calculate MD5 hash from file
 * @param path Path to file
 * @returns MD5 hex string
 */
export async function MD5(path?: string): Promise<string | null> {
  return new Promise(r => {
    if (!path) return r(null);
    try {
      if (!fs.existsSync(path)) return r(null);

      let hash = crypto.createHash('md5');
      let stream = fs.createReadStream(path);

      let _fdata = (data: any) => { hash.update(data); }
      stream.on('data', _fdata);
      stream.once('end', () => {
        stream.off('data', _fdata)
        r(hash.digest('hex'))
      });

    } catch { return r(null); }
  })
}