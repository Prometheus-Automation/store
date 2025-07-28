// utils/csrf.ts
import crypto from 'crypto';

export class CSRFTokenManager {
  private static readonly SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
  private static readonly TOKEN_LENGTH = 32;
  private static readonly EXPIRY_TIME = 60 * 60 * 1000; // 1 hour

  /**
   * Generate a new CSRF token for a session
   */
  static generateToken(sessionId: string, timestamp: number = Date.now()): string {
    const data = `${sessionId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', this.SECRET);
    hmac.update(data);
    const token = hmac.digest('hex');
    
    // Include timestamp in token for expiry checking
    const tokenWithTimestamp = `${timestamp}:${token}`;
    return Buffer.from(tokenWithTimestamp).toString('base64url');
  }

  /**
   * Validate a CSRF token
   */
  static validateToken(token: string, sessionId: string): boolean {
    try {
      // Decode the token
      const decoded = Buffer.from(token, 'base64url').toString();
      const [timestampStr, receivedToken] = decoded.split(':');
      const timestamp = parseInt(timestampStr, 10);

      // Check if token has expired
      if (Date.now() - timestamp > this.EXPIRY_TIME) {
        console.warn('CSRF token expired');
        return false;
      }

      // Regenerate token with the same timestamp and compare
      const expectedData = `${sessionId}:${timestamp}`;
      const hmac = crypto.createHmac('sha256', this.SECRET);
      hmac.update(expectedData);
      const expectedToken = hmac.digest('hex');

      // Use timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(receivedToken),
        Buffer.from(expectedToken)
      );
    } catch (error) {
      console.error('CSRF validation error:', error);
      return false;
    }
  }

  /**
   * Get CSRF token from request headers
   */
  static getTokenFromRequest(request: Request): string | null {
    return request.headers.get('x-csrf-token') || 
           request.headers.get('csrf-token') || 
           null;
  }
}