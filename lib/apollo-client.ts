import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, split } from "@apollo/client"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import { createClient } from "graphql-ws"

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null

  try {
    const authStorage = localStorage.getItem("auth-storage")
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || null
    }
  } catch {
    // Ignore parsing errors
  }
  return null
}

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  credentials: "include",
})

// WebSocket link for subscriptions
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || "ws://localhost:4000/graphql",
          connectionParams: () => {
            const token = getAuthToken()
            return {
              authorization: token ? `Bearer ${token}` : "",
            }
          },
        }),
      )
    : null

// Auth middleware
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = getAuthToken()

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  })

  return forward(operation)
})

// Split link based on operation type
const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return definition.kind === "OperationDefinition" && definition.operation === "subscription"
        },
        wsLink,
        ApolloLink.from([authMiddleware, httpLink]),
      )
    : ApolloLink.from([authMiddleware, httpLink])

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          messages: {
            keyArgs: ["matchId"],
            merge(existing = { messages: [], hasMore: false }, incoming) {
              return {
                ...incoming,
                messages: [...existing.messages, ...incoming.messages],
              }
            },
          },
          posts: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
      Profile: {
        keyFields: ["id"],
        merge(existing, incoming, { mergeObjects }) {
          // If incoming doesn't have id but has userId, use userId as fallback
          if (!incoming.id && incoming.userId) {
            incoming.id = incoming.userId
          }
          return mergeObjects(existing, incoming)
        },
      },
      User: {
        fields: {
          profile: {
            merge(existing, incoming, { mergeObjects }) {
              return mergeObjects(existing, incoming)
            },
          },
        },
      },
      Post: {
        keyFields: ["id"],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
    mutate: {
      fetchPolicy: "no-cache",
    },
  },
})
