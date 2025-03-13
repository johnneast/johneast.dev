import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export default function ChatBox() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <Input type="text" placeholder="Message" />
            <Button>Send</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}