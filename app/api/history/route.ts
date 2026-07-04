import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    const db = await getDb();
    const conversations = db.collection("conversations");

    if (id) {
      const convo = await conversations.findOne({ _id: new ObjectId(id), userId: session.userId });
      if (!convo) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      return NextResponse.json({ conversation: convo });
    }

    const list = await conversations
      .find({ userId: session.userId })
      .sort({ updatedAt: -1 })
      .project({ title: 1, updatedAt: 1 })
      .toArray();

    return NextResponse.json({
      history: list.map((c) => ({ id: c._id.toString(), title: c.title, date: c.updatedAt })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load history." }, { status: 500 });
  }
}
