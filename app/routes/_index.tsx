import ChatBox from "~/components/ChatBox";
import Bio from "~/components/Bio";
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
