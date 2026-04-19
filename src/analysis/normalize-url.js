import crypto from 'node:crypto';

const ID_SEGMENT = /\/(\d+|[0-9a-f]{8,})(\/|$)/gi;

export function normalizeUrl(raw) {
  try {
    const u = new URL(raw);
    const hostname = u.hostname;
    const port = u.port ? `:${u.port}` : '';
    const pathPattern = (u.pathname || '/').replace(ID_SEGMENT, '/:id$2');
    const subject = hostname + port;
    const detail = pathPattern;
    const fullHash = crypto.createHash('sha1').update(raw).digest('hex').slice(0, 16);
    return { subject, detail, fullHash };
  } catch {
    const fullHash = crypto.createHash('sha1').update(String(raw)).digest('hex').slice(0, 16);
    return { subject: null, detail: String(raw).slice(0, 200), fullHash };
  }
}
