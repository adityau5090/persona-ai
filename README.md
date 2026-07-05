# 🧠 Persona Chat

A persona-based AI chat application built with **Next.js 14 (App Router)**, **Tailwind CSS**, **shadcn/ui-style components**, **MongoDB**, and the **OpenAI (ChatGPT) API**.

Chat with mentor-style AI personas, switch between light/dark mode, and pick up right where you left off with a smart, grouped conversation history panel.

## App link : https://persona-ai-ac83.onrender.com/login

## Home page
<img src="/public/app.png"  />

---

## ✨ Features

- 🔐 **Email/password authentication** — bcrypt-hashed passwords, JWT session cookies (httpOnly)
- 💬 **Persona-based chatbot** — pick a mentor persona and get responses in that persona's tone
- 🕑 **Smart history panel** — collapsible sidebar, conversations grouped into **Today / Yesterday / Last Week / Older**, laid out in a zigzag pattern
- 🌗 **Dark & light mode** — powered by `next-themes`, toggle in the navbar
- 🎨 **Orange-accented theme** — fully driven by CSS variables, easy to re-theme
- ✍️ **Animated username** — types in letter-by-letter in the navbar, holds, then deletes and loops
- 🧑‍🏫 **Persona tab** — persona cards displayed in a "pinned to a corkboard" zigzag layout
- 👤 **Profile tab** — shows the signed-in user's basic info
- 🗄️ **MongoDB-backed persistence** — users and conversations are stored per account

---

## 🧭 How It Works (App Flow)

```
┌─────────────┐      no session       ┌─────────────┐
│   /  (root) │ ────────────────────▶ │   /login    │
└─────────────┘                       └──────┬──────┘
      │ has session                          │ sign up / sign in
      ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│                    (main) route group                │
│   Navbar (animated name · tabs · theme toggle)        │
│                                                       │
│   /chat  ──────────  /persona  ──────────  /profile   │
└─────────────────────────────────────────────────────┘
```

1. **Landing (`/`)** checks for a valid session cookie. Logged-in users are redirected to `/chat`; everyone else goes to `/login`.
2. **Login / Signup (`/login`)** posts to `/api/auth/login` or `/api/auth/signup`. On success, the server signs a JWT containing `{ userId, email, name }` and sets it as an httpOnly cookie. `middleware.ts` uses this cookie to gate `/chat`, `/persona`, and `/profile`.
3. **Chat (`/chat`)**:
   - Shows hardcoded quick-start questions when a conversation is empty.
   - Every sent message hits `POST /api/chat`, which:
     1. Verifies the session.
     2. Loads any prior messages for the current `conversationId` from MongoDB.
     3. Builds a system prompt from the active persona (or a generic assistant prompt if none is selected).
     4. Calls the OpenAI Chat Completions API with the full message history.
     5. Saves the updated message array back to MongoDB and returns the reply.
   - The **History Panel** (`GET /api/history`) lists all of the user's past conversations, grouped client-side by recency, and lets you reopen any of them.
4. **Persona (`/persona`)** shows persona cards (name, description, icon) in a zig-zag "pinned note" layout. Selecting a persona attaches it to the next conversation's system prompt.
5. **Profile (`/profile`)** calls `GET /api/auth/me` to display the signed-in user's name and email.
6. **Logout** clears the session cookie via `POST /api/auth/logout` and redirects to `/login`.

### Data model (MongoDB)

| Collection      | Purpose                                                              |
|------------------|-----------------------------------------------------------------------|
| `users`          | `{ name, email, passwordHash, createdAt }`                           |
| `conversations`  | `{ userId, title, messages: [{ role, content, createdAt }], createdAt, updatedAt }` |

All conversation reads/writes are scoped to `userId`, so users only ever see their own history.

---

## 🗂️ Project Structure

```
persona-chat/
├── app/
│   ├── page.tsx                  # Root: redirects based on session
│   ├── layout.tsx                # Root layout + ThemeProvider
│   ├── globals.css               # Orange theme variables, animations
│   ├── login/
│   │   └── page.tsx              # Login / signup UI
│   ├── (main)/
│   │   ├── layout.tsx            # Shared navbar + auth guard
│   │   ├── chat/page.tsx         # Chatbot UI + quick questions
│   │   ├── persona/page.tsx      # Persona picker (zigzag pinned cards)
│   │   └── profile/page.tsx      # User profile
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── chat/route.ts         # Calls OpenAI API, saves to MongoDB
│       └── history/route.ts      # Lists / fetches conversation history
├── components/
│   ├── ui/                       # shadcn-style primitives
│   ├── navbar.tsx
│   ├── history-panel.tsx
│   ├── animated-name.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── mongodb.ts                # MongoDB client singleton
│   ├── auth.ts                   # JWT session helpers
│   └── utils.ts                  # cn() class-merge helper
├── middleware.ts                 # Route protection
├── .env.example
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Getting Started (Clone & Run Locally)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/persona-chat.git
cd persona-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB=persona_chat

# Auth
JWT_SECRET=replace_with_a_long_random_string

# OpenAI (ChatGPT API)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

| Variable         | Where to get it                                                                 |
|------------------|------------------------------------------------------------------------------------|
| `MONGODB_URI`    | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Connect → Drivers          |
| `MONGODB_DB`     | Any name you like (defaults to `persona_chat`)                                    |
| `JWT_SECRET`     | Any long random string, e.g. `openssl rand -base64 32`                            |
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) → Create new secret key   |
| `OPENAI_MODEL`   | Optional — defaults to `gpt-4o-mini`                                               |

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on `/login`. Sign up, and you'll be taken to `/chat`.

### 5. Build for production

```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Framework      | Next.js 14 (App Router)                       |
| Language       | TypeScript                                    |
| Styling        | Tailwind CSS + shadcn/ui-style components     |
| Theming        | next-themes (dark/light mode)                 |
| Icons          | lucide-react                                  |
| Database       | MongoDB (via official `mongodb` driver)       |
| Auth           | bcryptjs (hashing) + jsonwebtoken (sessions)  |
| AI             | OpenAI Chat Completions API                   |

---

## 🔒 Security Notes

- Passwords are **never stored in plain text** — hashed with bcrypt (10 salt rounds) before saving.
- Sessions use **httpOnly, sameSite=lax cookies** containing a signed JWT — not accessible from client-side JS.
- All conversation and profile data is **scoped by `userId`** on every database query.
- `middleware.ts` blocks unauthenticated access to `/chat`, `/persona`, and `/profile` at the edge, before the page even renders.

---


## Persona Characteristics

### Hitesh Chaudhary

* Energetic and conversational
* Hinglish communication style
* Project-first learning approach
* Uses practical, real-world analogies
* Focus on Web Development, JavaScript, React, Node.js, and DSA

### Piyush Garg

* Calm and structured teaching style
* Step-by-step explanations
* Backend-first mindset
* Focus on Full Stack Development, Backend Systems, DevOps, and System Design

---

# Prompt Engineering

The application continues to use the same prompt template:

```text
You are {persona.name}, {persona.description}.
Stay in character and respond helpfully.
```

The differentiation comes from the persona description rather than modifying the underlying prompt structure.

### Design Principles

* Focus on teaching style instead of identity.
* Keep responses within each mentor's technical expertise.
* Differentiate personalities through tone and explanation style.
* Avoid fabricated personal facts, opinions, or quotations.
* Maintain character consistently throughout the conversation.

---

# Context Management

Conversation handling remains unchanged from the original implementation.

## Conversation Flow

1. User selects a persona.
2. Messages are stored in MongoDB.
3. Previous conversation history is retrieved.
4. The selected persona prompt is prepended.
5. The latest user message is appended.
6. The complete conversation is sent to the OpenAI API.

Each conversation is permanently associated with its selected persona.

If users want to compare responses from different mentors, they simply start separate conversations.

## Storage

Each conversation stores:

* `userId`
* `title`
* `messages`
* `createdAt`
* `updatedAt`

Messages are stored as:

```ts
{
  role,
  content,
  createdAt
}
```

Conversation history is grouped by:

* Today
* Yesterday
* Last Week
* Older

---

## Known Limitation

Currently, the entire conversation history is sent with every request.

While this preserves context, extremely long conversations may eventually approach the model's context window.

Future improvements could include:

* Context trimming
* Conversation summarization
* Retrieval-based memory

---

# Example Conversations

## Hitesh Chaudhary Style

**User**

> I'm stuck between learning React and building projects with Vanilla JavaScript.

**Assistant**

> Haanji, pehle JavaScript ke fundamentals strong karo. DOM, events, fetch API — ye sab comfortably aana chahiye. Uske baad React seekho. Ek hi project pehle Vanilla JS mein banao, phir React mein rebuild karo. Tab samajh aayega React kis problem ko solve karta hai.

---

## Piyush Garg Style

**User**

> REST or GraphQL for a new backend?

**Assistant**

> Let's approach it step by step. REST is generally the simpler and more maintainable default. GraphQL becomes valuable when clients require flexible queries across multiple related resources. Unless you already have that requirement, I'd recommend starting with REST and introducing GraphQL only when it solves a real problem.
