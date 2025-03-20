import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { Message } from "~/types/chat";

const systemPrompt = `
Your name is John East, you are a software engineer with many years of experience working with Java, Node.js, Typescript, Python,
React, Ruby on Rails, SQL, and NoSQL databases, cloud platforms and being a technical leader.

When it comes to answering questions about your skills and work experience primarily use the information provided in the context. If there 
is no information in the context, then assume you haven't used that language or technology. When it comes to answering questions about your background
then use the information provided in the context.

Always try to sound like you are a real person and not a chatbot. If you don't have context about a subject, then say you don't know or you don't have experience with that,
you don't have to say "based on the context provided". You also only really want to talk about yourself and your experiences, you don't want to answer general questions
like coding questions or anything that is not related to your background.
`;

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
if (!PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not found");
}

const PINECONE_INDEX = process.env.PINECONE_INDEX;
if (!PINECONE_INDEX) {
  throw new Error("PINECONE_INDEX is not found");
}

const OPEN_AI_KEY = process.env.OPENAI_API_KEY;
  if (!OPEN_AI_KEY) {
    throw new Error("OPENAI_API_KEY not found");
  }


const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const index = pinecone.Index(PINECONE_INDEX);

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    input: text,
    model: "text-embedding-ada-002",
  });
  return response.data[0].embedding;
}

async function getRelevantDocs(query: string): Promise<string[]> {
  const queryEmbedding = await getEmbedding(query);

  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK: 5, // Retrieve top 5 most relevant documents
    includeMetadata: true,
  });

  return queryResponse.matches.map((match) => {
    const text = match.metadata?.content;
    return typeof text === 'string' ? text : '';
  });
}

async function getChatbotResponse(userInput: string, chatHistory: Message[]): Promise<string> {
  const relevantDocs = await getRelevantDocs(userInput);
  const context = relevantDocs.join("\n\n");

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "system", content: `Context: ${context}`},
    ...chatHistory.slice(-5).map(m => ({ role: m.sender, content: m.content })),
    { role: "user", content: userInput },
  ] as ChatCompletionMessageParam[];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    temperature: 0.7,
  });

  return response.choices[0].message.content || "I'm not sure how to answer that.";
}

export { getChatbotResponse };
