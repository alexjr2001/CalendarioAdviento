import crypto from 'node:crypto';

export function hashEditorToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createEditorToken() {
  return crypto.randomBytes(32).toString('hex');
}
