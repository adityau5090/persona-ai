# Persona Chat

A persona-based AI chat app built with Next.js (App Router), Tailwind CSS, shadcn-style components, MongoDB, and the OpenAI (ChatGPT) API.

## Features

- **Email/password auth** with hashed passwords (bcrypt) and JWT session cookies
- **Chat interface** with hardcoded quick-start questions, streaming-style message bubbles, and per-user conversation history stored in MongoDB
- **History side panel** with a collapse/expand toggle, grouped into **Today / Yesterday / Last Week / Older**, shown in a zigzag (alternating left/right) layout
- **Dark & light mode** via `next-themes`
- **Orange primary theme**, fully driven by CSS variables (easy to re-theme)
- **Animated name** in the top-left of the navbar: types out the signed-in user's name letter by letter, pauses 5 seconds, deletes it letter by letter, and loops
- **Persona tab**: a set of persona cards laid out in a zigzag, "pinned to a wall" visual style
- **Profile tab**: shows the signed-in user's basic info
- Built with **shadcn/ui**-style primitives (Button, Card, Input, Label, Tabs, Avatar) on top of Radix UI

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and fill in your own values:

   ```bash
   cp .env.example .env.local
   ```

   You'll need:
   - `MONGODB_URI` — your MongoDB connection string (e.g. from MongoDB Atlas)
   - `MONGODB_DB` — database name (defaults to `persona_chat`)
   - `JWT_SECRET` — any long random string, used to sign session cookies
   - `OPENAI_API_KEY` — your OpenAI API key (add this yourself; the chat route calls `https://api.openai.com/v1/chat/completions`)
   - `OPENAI_MODEL` — optional, defaults to `gpt-4o-mini`

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`. Sign up for a new account, then you'll land on `/chat`.

## Project structure

```
app/
  login/              Login & sign up page
  (main)/
    layout.tsx        Shared navbar + auth guard for chat/persona/profile
    chat/             Main chatbot UI + history panel
    persona/          Persona picker (zigzag pinned cards)
    profile/          User profile page
  api/
    auth/             signup, login, logout, me
    chat/             Calls the OpenAI API, saves conversation to MongoDB
    history/          Lists / fetches a user's conversation history
components/
  ui/                 shadcn-style primitives (button, card, input, label, tabs, avatar)
  navbar.tsx          Top nav with tabs + animated name + theme toggle
  history-panel.tsx   Collapsible, grouped, zigzag conversation history
  animated-name.tsx   Typing/deleting name animation
  theme-provider.tsx / theme-toggle.tsx
lib/
  mongodb.ts          MongoDB client singleton
  auth.ts             JWT session helpers
  utils.ts            cn() class merge helper
middleware.ts         Route protection for /chat, /persona, /profile, /login
```

## Notes

- Passwords are hashed with bcrypt before being stored — never stored in plain text.
- Sessions are stored in an httpOnly cookie containing a signed JWT.
- Swap the model in `.env.local` (`OPENAI_MODEL`) to use a different ChatGPT model.
- The color theme lives entirely in `app/globals.css` as HSL CSS variables, so you can retheme the whole app by editing `--primary` and friends.

## Ideas to extend

- Let users create/edit their own custom personas (name, description, avatar) and store them in MongoDB.
- Stream chat responses token-by-token using the OpenAI streaming API.
- Add a "delete conversation" action in the history panel.
- Add avatar image upload on the profile page.
