export default function FooterContent() {
  return (
    <p className="text-sm text-muted-foreground">
      Built with love by me using{" "}
      <a href="https://reactrouter.com/" className="text-primary">
        React Router
      </a>{" "}
      and{" "}
      <a href="https://ui.shadcn.com/" className="text-primary">
        shadcn
      </a>.
      Powered by{" "}
      <a href="https://www.pinecone.io/" className="text-primary">
        Pinecone
      </a>{" "}
      and{" "}
      <a href="https://openai.com/" className="text-primary">
        OpenAI
      </a>.
      Deployed on{" "}
      <a href="https://www.vercel.com/" className="text-primary">
        Vercel
      </a>.
    </p>
  );
}