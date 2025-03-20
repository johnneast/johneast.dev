import { createCookieSessionStorage } from "react-router";
import type { Message } from "./types/chat";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export type SessionData = {
  chatHistory: string;
}

export type SessionFlashData = {
  error: string;
};

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      secure: process.env.NODE_ENV === "production",
      secrets: [sessionSecret],
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true
    },
  });
  