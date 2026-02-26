const sessions = new Map();

export const addSession = (id, data) => {
  sessions.set(id, data);
};

export const getSession = (id) => sessions.get(id);

export const removeSession = (id) => {
  sessions.delete(id);
};

export const getSessionCount = () => sessions.size;

export const getAllSessions = () => sessions;