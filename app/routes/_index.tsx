import MyBio from "~/components/my-bio";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "John East" },
    { name: "description", content: "Hi, I'm John East" },
  ];
}

export default function Index() {
  return <MyBio />;
}
