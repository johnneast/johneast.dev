export default function ChatMessage({
  content,
  sender,
  timestamp,
}: {
  content: string;
  sender: string;
  timestamp: number;
}) {
  return (
    <>
      {sender === 'assistant' ? (
        <div className="flex justify-start" key={timestamp}>
          <div className="max-w-[70%] rounded-lg bg-muted p-3">
            <p className="text-sm">{content}</p>
            <span className="text-xs text-muted-foreground mt-1 block">
              {new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-end" key={timestamp}>
          <div className="max-w-[70%] rounded-lg bg-primary text-primary-foreground p-3">
            <p className="text-sm">{content}</p>
            <span className="text-xs mt-1 block opacity-80">
              {new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
