import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function searchYoutube(query: string) {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet` +
    `&type=video` +
    `&maxResults=5` +
    `&q=${encodeURIComponent(query)}` +
    `&key=${process.env.YOUTUBE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.items.map((item: any) => ({
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}


export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { message, conversationId, persona } = await req.json();
  // console.log("Received message:", message, "conversationId:", conversationId, "persona:", persona.name);
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env.local to enable chat replies." },
      { status: 500 }
    );
  }

  try {
    const db = await getDb();
    const conversations = db.collection("conversations");

    let convo;
    if (conversationId) {
      convo = await conversations.findOne({ _id: new ObjectId(conversationId), userId: session.userId });
    }

    const priorMessages = convo?.messages || [];

    const systemPrompt = persona
      ? `You are ${persona.name}, ${persona.prompt}. Stay in character and respond helpfully.
      Do not answer any personal, triggered, political, abusive, harmful questions. Question only tech related field and answer only in a friendly, helpful manner.`
      : "You are a helpful, friendly AI assistant.";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: persona.prompt },
          ...priorMessages.map((m: any) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI error:", errText);
      return NextResponse.json({ error: "The chat model could not be reached. Check your API key." }, { status: 502 });
    }

    const data = await openaiRes.json();
    const firstReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    const youtubeRegex = /<<<SEARCH_YOUTUBE:(.*?)>>>/;

    const match = firstReply.match(youtubeRegex);

   if(match == null){
     const newMessages = [
      ...priorMessages,
      { role: "user", content: message, createdAt: new Date() },
      { role: "assistant", content: firstReply, createdAt: new Date() },
    ];

    const title = convo?.title || message.slice(0, 40);

    if (convo) {
      await conversations.updateOne(
        { _id: convo._id },
        { $set: { messages: newMessages, updatedAt: new Date() } }
      );
      return NextResponse.json({ reply: firstReply,videos: [], conversationId: convo._id });
    } else {
      const result = await conversations.insertOne({
        userId: session.userId,
        title,
        messages: newMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({ reply : firstReply,videos: [], conversationId: result.insertedId });
    }
   }

   const topic = match[1].trim();

   const videos = await searchYoutube(`${topic} ${persona.name}`);

   const secondOpenaiRes = await fetch(
  "https://api.openai.com/v1/chat/completions",
  {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${process.env.OPENAI_API_KEY}`
    },
    body:JSON.stringify({
      model:process.env.OPENAI_MODEL || "gpt-4o-mini",

      messages:[
        {
          role:"system",
          content:persona.prompt
        },

        ...priorMessages.map((m:any)=>({
          role:m.role,
          content:m.content
        })),

        {
          role:"system",
          content:`
            These YouTube videos are available.

            ${videos.map((v:any)=>`
            Title: ${v.title}
            Channel: ${v.channel}
            Link: ${v.url}
            `).join("\n")}

            Recommend whichever are relevant.

            Don't say you searched YouTube.

            Talk naturally.
          `
        },

        {
          role:"user",
          content:message
        }
      ]
    })
  }
);

if (!secondOpenaiRes.ok) {
  const err = await secondOpenaiRes.text();
  console.error(err);

  return NextResponse.json(
    { error: "Second OpenAI call failed." },
    { status: 500 }
  );
}

const secondData =
await secondOpenaiRes.json();

const reply =
secondData.choices[0].message.content;

const newMessages = [
  ...priorMessages,
  {
    role:"user",
    content:message,
    createdAt:new Date()
  },
  {
    role:"assistant",
    content:reply,
    createdAt:new Date()
  }
];

const title = convo?.title || message.slice(0, 40);

    if (convo) {
      await conversations.updateOne(
        { _id: convo._id },
        { $set: { messages: newMessages, updatedAt: new Date() } }       
      );
      return NextResponse.json({ reply,videos, conversationId: convo._id });
    } else {
      const result = await conversations.insertOne({
        userId: session.userId,
        title,
        messages: newMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({ reply, videos, conversationId: result.insertedId });
    }

    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong while generating a reply." }, { status: 500 });
  }
}
