# Luminary — React Social Media App

A spectacular, production-grade React 18 frontend for the SocialMedia API. Features a dark luxury editorial aesthetic with warm amber accents, fluid animations, and full API integration.

---

## ✨ Design Aesthetic

**Theme:** Dark luxury editorial  
**Palette:** Deep black backgrounds (#0a0a0a) + warm amber accent (#e8a830) + soft white text  
**Typography:** Playfair Display (headings/display) + DM Sans (body)  
**Motion:** Page transitions, staggered list animations, heart burst on like, spring button effects, skeleton loaders, glassmorphism modals

---

## 🗂️ Project Structure

```
src/
├── api/
│   └── api.js              # Axios client with JWT interceptors + auto token refresh
│
├── context/
│   └── AuthContext.js      # Global auth state: login, register, logout, token management
│
├── components/
│   ├── common/index.js     # Icons, Avatar, Spinner, Skeleton, Modal, formatTime
│   ├── layout/index.js     # Sidebar, AppLayout, Topbar with search
│   └── posts/index.js      # PostCard, CreatePostBox, CommentSection, EditPostModal
│
├── pages/
│   ├── AuthPages.js        # LoginPage, RegisterPage (with animated visual panel)
│   ├── FeedPage.js         # Home feed with Following/Explore toggle + aside widgets
│   └── Pages.js            # ProfilePage, ExplorePage, SettingsPage
│
├── App.js                  # Router, protected/public routes, Toaster config
├── index.css               # Full design system: CSS variables, animations, components
└── index.js                # React entry point
```

---

## 🔗 Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/login` | Login | ❌ Public |
| `/register` | Register | ❌ Public |
| `/` | Feed (Following/Explore) | ❌ (Post requires auth) |
| `/explore` | Search Users & Posts | ❌ |
| `/profile/:username` | User Profile | ❌ (Edit requires auth) |
| `/settings` | Account Settings | ✅ |

---

## ⚙️ Features

- **JWT Auth** — Login/Register with token stored in localStorage
- **Auto Token Refresh** — Axios interceptor silently refreshes expired tokens
- **Feed** — Toggle between "Following" feed and "Explore" feed
- **Posts** — Create, edit, delete, like/unlike with optimistic UI
- **Comments** — Nested comments with real-time add
- **Profiles** — View any user, follow/unfollow, edit own profile
- **Search** — Search users and posts in Explore page
- **Animations** — Page entrance, stagger, heart burst, skeleton loading
- **Responsive** — Mobile sidebar with overlay, fluid layouts

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- SocialMedia API running (see API project README)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure API URL (edit .env)
REACT_APP_API_URL=https://localhost:7001/api

# 3. Start dev server
npm start
```

App opens at `http://localhost:3000`

**CORS Note:** Make sure your .NET API has CORS enabled for `http://localhost:3000`.  
The `Program.cs` already has `AllowAll` CORS policy configured.

---

## 💡 Resume Talking Points

- "Built a React 18 SPA consuming a REST API with Axios, JWT authentication, and automatic token refresh interceptors"
- "Implemented optimistic UI updates for likes/follows with rollback on failure"
- "Designed a custom CSS design system with CSS variables, fluid animations, and a luxury dark aesthetic"
- "Created reusable component library: Avatar, Modal, Skeleton loader, EmptyState, Icon set"
- "Used React Context API for global auth state management with localStorage persistence"
- "Built protected and public route system with React Router v6"
