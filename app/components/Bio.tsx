import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function Bio() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Hi there, I'm John East</h1>
      <p>
        I'm a software engineer with a passion for building products that help
        people live better lives.
      </p>
    </div>
  )
}
