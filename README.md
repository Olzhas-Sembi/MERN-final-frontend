# Dating App Frontend

Next.js frontend with Apollo Client for the dating application.

## Tech Stack

- Next.js 16 (App Router)
- Apollo Client
- TypeScript
- TailwindCSS
- Zustand (state management)
- React Hook Form + Zod
- UploadThing (image uploads)

## Getting Started

### Development

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

### Docker

\`\`\`bash
# Build and run
docker build -t dating-app-client .
docker run -p 3000:3000 --env-file .env dating-app-client
\`\`\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run lint\` - Run linter

## Environment Variables

See \`.env.example\` for required variables:
- \`NEXT_PUBLIC_GRAPHQL_URL\` - Backend GraphQL endpoint
- \`NEXT_PUBLIC_GRAPHQL_WS_URL\` - Backend WebSocket endpoint
- \`NEXT_PUBLIC_UPLOADTHING_APP_ID\` - UploadThing app ID

## Features

- Authentication (signup/login)
- Profile creation and editing
- Swipe-based matching
- Real-time chat with WebSocket
- Social feed with posts
- Image uploads via UploadThing

## Project Structure

\`\`\`
client/
├── app/                 # Next.js App Router
│   ├── api/            # API routes (UploadThing)
│   ├── discover/       # Swipe page
│   ├── matches/        # Matches list
│   ├── chat/           # Chat interface
│   ├── feed/           # Social feed
│   └── profile/        # Profile management
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── auth/          # Auth forms
│   ├── providers/     # Context providers
│   └── upload/        # Image upload
└── lib/               # Utilities
    ├── apollo-client.ts  # Apollo setup
    ├── graphql/          # Operations
    ├── store.ts          # Zustand stores
    └── uploadthing.ts    # UploadThing config
\`\`\`
