export function createSessionRepository() {
  const sessions = new Map();

  return {
    reset() { sessions.clear(); },
    save(session) {
      sessions.set(session.jti, { ...session });
    },

    findByJti(jti) {
      return sessions.get(jti) ?? null;
    },

    revoke(jti) {
      const session = sessions.get(jti);
      if (session) {
        session.revoked = true;
      }
    }
  };
}
