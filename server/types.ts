declare module 'express-session' {
  interface SessionData {
    userId: string;
    userEmail: string;
    userType: 'admin' | 'propietario';
  }
}