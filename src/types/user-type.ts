interface SessionType {
  user: User;
  expires: Date;
}

interface User {
  name: string;
  email: string;
  image: string;
  id: string;
}

export type { SessionType };
