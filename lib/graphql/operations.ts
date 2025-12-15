import { gql } from "@apollo/client"

// Auth Mutations
export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      accessToken
      user {
        id
        username
        email
        roles
      }
    }
  }
`

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      accessToken
      user {
        id
        username
        email
        roles
        profile {
          id
          userId
          displayName
          photos
          gender
        }
      }
    }
  }
`

// Profile Queries and Mutations
export const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      username
      email
      profile {
        id
        userId
        displayName
        birthDate
        gender
        bio
        photos
        location {
          lat
          lng
          city
        }
        lookingFor
        createdAt
        updatedAt
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      roles
      profile {
        id
        userId
        displayName
        birthDate
        gender
        bio
        photos
        location {
          lat
          lng
          city
        }
        lookingFor
        createdAt
        updatedAt
      }
    }
  }
`

export const SEARCH_PROFILES_QUERY = gql`
  query SearchProfiles($input: SearchProfilesInput!) {
    searchProfiles(input: $input) {
      profiles {
        id
        userId
        displayName
        birthDate
        gender
        bio
        photos
        location {
          lat
          lng
          city
        }
        lookingFor
      }
      total
      hasMore
    }
  }
`

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      displayName
      birthDate
      gender
      bio
      photos
      location {
        lat
        lng
        city
      }
      lookingFor
    }
  }
`

// Match Queries and Mutations
export const MATCHES_QUERY = gql`
  query Matches {
    matches {
      id
      status
      participants {
        id
        username
        profile {
          id
          userId
          displayName
          photos
          gender
        }
      }
      createdAt
      updatedAt
    }
  }
`

export const LIKE_PROFILE_MUTATION = gql`
  mutation LikeProfile($targetUserId: ID!) {
    likeProfile(targetUserId: $targetUserId) {
      id
      status
      participants {
        id
        username
      }
    }
  }
`

export const DISLIKE_PROFILE_MUTATION = gql`
  mutation DislikeProfile($targetUserId: ID!) {
    dislikeProfile(targetUserId: $targetUserId)
  }
`

export const MATCH_QUERY = gql`
  query Match($id: ID!) {
    match(id: $id) {
      id
      status
      participants {
        id
        username
        profile {
          id
          userId
          displayName
          photos
        }
      }
    }
  }
`

// Message Queries, Mutations, and Subscriptions
export const MESSAGES_QUERY = gql`
  query Messages($matchId: ID!, $after: ID) {
    messages(matchId: $matchId, after: $after) {
      messages {
        id
        matchId
        senderId
        text
        attachments {
          url
          type
        }
        readBy
        sentAt
        edited
        sender {
          id
          username
          profile {
            id
            userId
            displayName
            photos
          }
        }
      }
      hasMore
    }
  }
`

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($matchId: ID!, $text: String!, $attachments: [AttachmentInput!]) {
    sendMessage(matchId: $matchId, text: $text, attachments: $attachments) {
      id
      matchId
      senderId
      text
      attachments {
        url
        type
      }
      sentAt
      sender {
        id
        username
        profile {
          id
          userId
          displayName
          photos
        }
      }
    }
  }
`

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($matchId: ID!) {
    messageAdded(matchId: $matchId) {
      id
      matchId
      senderId
      text
      attachments {
        url
        type
      }
      sentAt
      sender {
        id
        username
        profile {
          id
          userId
          displayName
          photos
        }
      }
    }
  }
`

// Post Queries and Mutations
export const POSTS_QUERY = gql`
  query Posts($limit: Int, $offset: Int) {
    posts(limit: $limit, offset: $offset) {
      id
      authorId
      content
      images
      likesCount
      likedBy
      isLiked
      commentsCount
      visibility
      createdAt
      updatedAt
      author {
        id
        username
        profile {
          id
          userId
          displayName
          photos
        }
      }
    }
  }
`

export const POST_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      authorId
      content
      images
      likesCount
      likedBy
      isLiked
      commentsCount
      visibility
      createdAt
      updatedAt
      author {
        id
        username
        profile {
          id
          userId
          displayName
          photos
        }
      }
    }
  }
`

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      authorId
      content
      images
      likesCount
      commentsCount
      visibility
      createdAt
      updatedAt
      author {
        id
        username
        profile {
          id
          userId
          displayName
          photos
        }
      }
    }
  }
`

export const LIKE_POST_MUTATION = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likesCount
    }
  }
`
