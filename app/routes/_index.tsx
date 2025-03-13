import ChatBox from "~/components/chat-box";
import Bio from "~/components/bio";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "John East" },
    { name: "description", content: "Hi, I'm John East" },
  ];
}

export default function Index() {
  return <Bio />;
}
