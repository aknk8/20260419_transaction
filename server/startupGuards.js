export function assertProductionSecrets() {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET must be set in production');
      process.exit(1);
    }
    if (!process.env.DATABASE_URL) {
      console.error('FATAL: DATABASE_URL must be set in production');
      process.exit(1);
    }
  }
}
