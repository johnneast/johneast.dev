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
  return (
    <>
      <div className="flex flex-row gap-4 p-4 min-h-screen">
        <div className="w-1/2">
          <Bio />
      </div>
      <div className="w-1/2">
          <ChatBox />
        </div>
      </div>
    </>
  );
}
