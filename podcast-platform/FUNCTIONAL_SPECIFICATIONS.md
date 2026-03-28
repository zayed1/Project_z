# Podcast Platform - Functional Specifications

**Version:** 2.0.0
**Last Updated:** March 2026

---

## 1. System Overview

The Podcast Platform is a full-stack Arabic-first podcast hosting and listening application. It supports RTL layouts, bilingual interfaces (Arabic primary, English secondary), and provides a comprehensive ecosystem for both podcast creators and listeners.

### 1.1 Architecture

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS     |
| Backend    | Node.js + Express.js                |
| Database   | Supabase (PostgreSQL + Storage)     |
| Real-time  | Socket.io (WebSocket)               |
| API        | REST + GraphQL                      |
| Hosting    | Vercel (frontend) + Railway (backend) |

### 1.2 Tech Stack Details

**Frontend Dependencies:**
- React 18.2 with React Router v6 (SPA navigation)
- Tailwind CSS 3.4 (utility-first styling with dark mode)
- Framer Motion (page transitions and animations)
- Chart.js + react-chartjs-2 (data visualization)
- Socket.io Client (real-time notifications)
- React Helmet Async (SEO meta tags)
- Axios (HTTP client)

**Backend Dependencies:**
- Express.js 4.18 (REST API framework)
- graphql-http + graphql 16 (GraphQL endpoint)
- @supabase/supabase-js (database ORM)
- bcryptjs + jsonwebtoken (authentication)
- Multer + Sharp (file upload + image processing)
- Helmet + express-rate-limit (security)
- Morgan (request logging)

---

## 2. Authentication & Authorization

### 2.1 User Authentication
- **Registration:** POST `/api/auth/register` - Email/username/password with bcrypt hashing
- **Login:** POST `/api/auth/login` - Returns JWT token
- **Rate Limited:** Auth endpoints have dedicated rate limiting to prevent brute force

### 2.2 Authorization Levels
| Role    | Access Level                                    |
|---------|------------------------------------------------|
| Guest   | Browse podcasts, view episodes, read comments   |
| User    | All guest + comment, like, follow, create playlists |
| Admin   | All user + CRUD podcasts/episodes, manage users, analytics |

### 2.3 Middleware Chain
- `authenticate` - Validates JWT, attaches user to request
- `requireAdmin` - Checks admin role after authentication
- `advancedRateLimit` - Per-endpoint rate limiting (auth, search, upload, smart)
- `security` - Helmet headers + general rate limiter
- `imageCompression` - Automatic image optimization on upload

---

## 3. Core Modules

### 3.1 Podcast Management

**Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/podcasts` | No | List all podcasts (with search, pagination) |
| GET | `/api/podcasts/:id` | No | Get podcast details |
| POST | `/api/podcasts` | Admin | Create new podcast |
| PUT | `/api/podcasts/:id` | Admin | Update podcast |
| DELETE | `/api/podcasts/:id` | Admin | Delete podcast |
| POST | `/api/upload/cover` | Admin | Upload cover image |
| GET | `/api/categories` | No | List all categories |
| POST | `/api/admin/categories` | Admin | Create category |
| PUT | `/api/admin/categories/:id` | Admin | Update category |
| DELETE | `/api/admin/categories/:id` | Admin | Delete category |

**Frontend Components:** `PodcastCard`, `PodcastCarousel`, `HeroCarousel`, `SuggestedPodcasts`, `TrendingPodcasts`

### 3.2 Episode Management

**Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/podcasts/:id/episodes` | No | List episodes for podcast |
| GET | `/api/podcasts/:id/episodes/search` | No | Search episodes |
| POST | `/api/podcasts/:id/episodes` | Admin | Create episode with audio upload |
| PUT | `/api/episodes/:id` | Admin | Update episode |
| DELETE | `/api/episodes/:id` | Admin | Delete episode |
| POST | `/api/episodes/:id/listen` | No | Record listen event |

**Frontend Features:**
- `ExpandableEpisodeCard` - Expandable episode cards in lists
- `EpisodeProgressBar` - Linear playback progress
- `EpisodeProgressRing` - SVG circular progress indicator
- `EpisodeActions` - Dropdown menu (share, notes, clip, etc.)
- `ChapterMarkers` - Chapter navigation within episodes
- `EpisodeNotes` - User notes per episode
- `EpisodeSummary` - AI-generated or manual summaries
- `EpisodeQuiz` - Quiz attached to episodes
- `EpisodeCompare` - Compare analytics between episodes (admin)

### 3.3 Audio Player System

**Context:** `PlayerContext` - Global state for audio playback

**Components:**
| Component | Description |
|-----------|-------------|
| `GlobalPlayer` | Full-featured audio player (play/pause, seek, volume, speed) |
| `MiniPlayer` | Compact player bar at bottom of screen |
| `PlaybackSpeed` | Speed control (0.5x - 3x) |
| `SleepTimer` | Auto-stop after set duration |
| `AdvancedSleepTimer` | Extended timer with fade-out option |
| `PlayQueue` | Episode queue management |
| `AudioEqualizer` | Visual audio equalizer display |
| `AudioWaveform` | Waveform visualization |
| `NowPlayingIndicator` | Animated bars showing active playback |
| `DrivingMode` | Simplified large-button interface for driving |
| `FocusMode` | Distraction-free listening mode |

**Playback Sync:** POST/GET `/api/me/sync` - Cross-device playback position synchronization

### 3.4 Comments System

**Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/episodes/:id/comments` | No | Get episode comments |
| POST | `/api/episodes/:id/comments` | User | Add comment |
| DELETE | `/api/comments/:id` | Admin | Delete comment |
| GET | `/api/comments/:id/replies` | No | Get nested replies |
| POST | `/api/comments/:id/replies` | User | Add reply to comment |
| POST | `/api/timed-comments` | User | Add time-stamped comment |
| GET | `/api/episodes/:id/timed-comments` | No | Get timed comments |

**Frontend:** `CommentReplies`, `TimedComments`, `BulkComments` (admin)

### 3.5 Social Features

**Likes:**
- POST `/api/episodes/:id/like` - Toggle like
- GET `/api/episodes/:id/likes` - Get like count
- Component: `LikeDislike`

**Follows:**
- POST `/api/podcasts/:id/follow` - Follow/unfollow podcast
- GET `/api/me/follows` - Get user's followed podcasts
- Component: `FollowButton`

**Ratings:**
- POST `/api/episodes/:id/rate` - Rate episode (1-5 stars)
- GET `/api/episodes/:id/rating` - Get average rating
- Components: `StarRating`, `RatingsManager`

**Reactions:** `Reactions` component - 5 emoji reactions (heart, fire, laugh, clap, think) with optimistic updates

**Sharing:**
- `SocialShare` - Standard share buttons
- `MomentShare` - Share specific timestamp
- `TimestampShare` - Deep link to specific time
- `ShareCard` - Visual share card generator with style presets
- `GiftEpisode` - Gift an episode to another user
- `EmbedCode` - Embeddable player widget

### 3.6 User Profile & Preferences

**Endpoints:**
- GET `/api/profile/:username` - Public profile
- PUT `/api/me/profile` - Update own profile
- POST `/api/me/preferences` - Save preferences
- GET `/api/me/preferences` - Get preferences
- GET `/api/me/personalized-feed` - Personalized content feed

**Frontend Pages:** `ProfilePage` (with activity tab, badges, edit form)

**Components:** `BadgesDisplay`, `OnboardingWizard`, `CustomShortcuts`

---

## 4. Discovery & Recommendations

### 4.1 Discovery Engine

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover/suggested/:podcastId` | Similar podcasts |
| GET | `/api/discover/popular` | Popular episodes |
| GET | `/api/discover/trending` | Trending podcasts |
| GET | `/api/me/recommendations` | Personalized recommendations |

**Components:** `SmartRecommendations`, `PopularEpisodes`, `TrendingPodcasts`, `SimilarEpisodes`

### 4.2 Search

**Component:** `SmartSearchBar`
- Debounced live search (300ms)
- Search history (localStorage, max 8 entries)
- Type-ahead suggestions from API
- Filter by type (all, podcast, episode)
- `AdvancedSearch` - Extended search with multiple filters

**Component:** `VoiceSearch` - Voice-to-text search input

### 4.3 Mood-Based Discovery

**Endpoints:**
- GET `/api/moods` - List available moods
- GET `/api/moods/:mood/episodes` - Filter episodes by mood
- PUT `/api/admin/episodes/:id/moods` - Tag episode with moods

**Components:** `MoodFilter`, `MoodTracker` (personal mood tracking)

---

## 5. Content Organization

### 5.1 Playlists

**Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/playlists` | User | Create playlist |
| GET | `/api/me/playlists` | User | Get my playlists |
| GET | `/api/playlists/:id` | No | Get playlist details |
| POST | `/api/playlists/:id/items` | User | Add episode to playlist |
| DELETE | `/api/playlists/:id/items/:itemId` | User | Remove from playlist |
| DELETE | `/api/playlists/:id` | User | Delete playlist |

**Components:** `DragDropPlaylist` (drag-and-drop reordering), `PlaylistDuration`

### 5.2 Listen Later

**Page:** `ListenLaterPage`
- localStorage-based queue
- Sort by: date added, title, podcast name
- Multi-select mode with bulk delete
- Swipeable cards (swipe to remove)
- Integration with `ConfirmModal` for delete confirmation

### 5.3 Listening History

**Page:** `HistoryPage`
- Paginated history from localStorage
- Components: `ExportListenHistory`, `ListenStats`, `ListenTimeRecommender`

---

## 6. Creator Tools

### 6.1 Creator Dashboard

**Page:** `CreatorDashboard`
- Welcome banner with user greeting
- 4 stat cards (podcasts, episodes, plays, followers)
- Quick action shortcuts (upload, stats, comments, settings)
- Top performing episodes ranking
- Mini bar chart (weekly plays)
- Best publish times analysis
- Recent comments feed

**Endpoints:**
- GET `/api/me/creator-stats` - Creator statistics
- GET `/api/podcasts/:id/best-times` - Best publish time analysis

### 6.2 Content Management

**Components:**
| Component | Description |
|-----------|-------------|
| `DragDropUpload` | Drag-and-drop file upload for episodes |
| `ScheduledPosts` | Schedule episode releases |
| `VisualScheduler` | Calendar view for scheduling |
| `ClipCreator` | Create audio clips from episodes |
| `Transcript` + `TranscriptViewer` | Episode transcripts |
| `TTSPreview` | Text-to-speech preview |
| `MarkdownRenderer` | Render markdown descriptions |

### 6.3 Analytics

**Components:**
| Component | Description |
|-----------|-------------|
| `DashboardCharts` | Visual charts (Chart.js) |
| `GeoAnalytics` | Geographic listener distribution |
| `ListenHeatmap` | Playback position heatmap |
| `ListenerStats` | Detailed listener statistics |
| `EpisodeCompare` | Side-by-side episode comparison |

**Endpoints:**
- GET `/api/admin/episodes/:id/analytics` - Episode analytics
- GET `/api/admin/geo-stats` - Geographic statistics
- POST/GET `/api/episodes/:id/heatmap` - Listening heatmap data
- GET `/api/admin/detailed-stats` - Comprehensive statistics
- GET `/api/admin/live-stats` - Real-time listener count

---

## 7. Admin Panel

### 7.1 Admin Dashboard

**Page:** `Admin`
**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/ban` | Ban/unban user |
| PUT | `/api/admin/users/:id/role` | Change user role |
| GET | `/api/admin/backup` | Download data backup |
| POST | `/api/admin/import-rss` | Import podcast from RSS |
| GET | `/api/admin/audit-logs` | View audit trail |
| GET | `/api/admin/weekly-report` | Weekly performance report |
| GET | `/api/admin/system-health` | System health metrics |
| GET | `/api/admin/live-stats` | Real-time statistics |

### 7.2 Content Moderation

- Bulk comment management (filter + batch delete)
- Report management (review, resolve, dismiss)
- Rating management (filter + delete inappropriate ratings)

### 7.3 A/B Testing

**Endpoints:**
- POST `/api/admin/ab-tests` - Create A/B test
- GET `/api/admin/ab-tests` - List tests
- GET `/api/episodes/:id/variant` - Get test variant for user
- POST `/api/ab-tests/:id/click` - Record conversion

### 7.4 Communication Tools

- `sendBroadcast` - Push notifications to all users
- `MessageTemplates` - Reusable notification templates
- `WebhookManager` - External webhook integrations
- Site-wide settings management

---

## 8. Real-time Features

### 8.1 WebSocket (Socket.io)

- User joins room on authentication (`user:{userId}`)
- Server pushes notifications in real-time
- Used by: broadcast system, live monitor, listen rooms

### 8.2 Listen Rooms

**Endpoints:**
- POST `/api/listen-rooms` - Create listening room
- GET `/api/listen-rooms` - List active rooms
- GET `/api/listen-rooms/:id` - Join room

**Component:** `ListenRoom` - Synchronized group listening experience

### 8.3 Live Monitor (Admin)

**Component:** `LiveMonitor` - Real-time active listener tracking

---

## 9. Frontend Architecture

### 9.1 State Management

| Context | Purpose |
|---------|---------|
| `AuthContext` | User authentication state, login/logout |
| `PlayerContext` | Audio playback state, queue, controls |
| `ThemeContext` | Dark/light mode, color themes |
| `ToastContext` | Toast notification queue |

### 9.2 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useKeyboardShortcuts` | Global keyboard shortcut handling |
| `useScrollRestore` | Restore scroll position on navigation |
| `useAutoSave` | Auto-save form data to localStorage |
| `useDebounce` | Debounce values for search/input |
| `useInfiniteScroll` | Infinite scroll pagination |
| `useCache` | Client-side data caching |

### 9.3 Routing & Navigation

**Code Splitting:** All pages use `React.lazy()` + `Suspense`

| Route | Page Component |
|-------|---------------|
| `/` | `Home` |
| `/podcast/:id` | `PodcastDetail` |
| `/about` | `About` |
| `/listen-later` | `ListenLaterPage` |
| `/follows` | `FollowsPage` |
| `/history` | `HistoryPage` |
| `/profile/:username` | `ProfilePage` |
| `/playlists` | `PlaylistsPage` |
| `/creator` | `CreatorDashboard` |
| `/admin` | `Admin` |
| `/notifications` | `NotificationsPage` |
| `/settings` | `SettingsPage` |
| `*` | `NotFound` (404) |

### 9.4 Navigation Components

- `Breadcrumbs` - Dynamic breadcrumb trail
- `ScrollToTop` - Scroll-to-top floating button
- `ProgressBar` - YouTube-style page load indicator
- `PageTransition` - Context-aware animated transitions (Framer Motion)
- `FloatingActionButton` - Mobile quick-access FAB (search, playlists, listen later)

### 9.5 UX Enhancement Components

| Component | Description |
|-----------|-------------|
| `SplashScreen` | Animated app splash with loading bar |
| `GuideTooltips` | 4-step onboarding tooltip guide |
| `WelcomeBanner` | First-visit welcome banner |
| `OfflineBanner` | Offline/online connection status |
| `NotificationBell` | Header notification dropdown |
| `ConfirmModal` | Reusable confirmation dialog |
| `LoadingButton` | Button with loading spinner state |
| `EmptyState` | Reusable empty content placeholder |
| `EnhancedSkeleton` | Skeleton loading placeholders |
| `SmartTooltip` | Context-aware tooltips |
| `ErrorBoundary` | React error boundary with fallback UI |
| `Pagination` | Page navigation controls |
| `ViewToggle` | Grid/list view switcher |
| `SeasonalTheme` | Seasonal decorative elements |
| `SwipeableCard` | Touch swipe gesture handler |
| `ConfettiEffect` | Celebration animation |
| `QRCode` | QR code generator |
| `LazyImage` | Lazy-loaded images with placeholder |
| `OptimizedImage` | Server-optimized image loading |
| `VirtualList` | Virtualized list for performance |

---

## 10. Data & Storage

### 10.1 Database (Supabase/PostgreSQL)

The platform uses Supabase as a managed PostgreSQL database with the following data domains:
- Users (authentication, profiles, roles)
- Podcasts (metadata, categories, covers)
- Episodes (audio, metadata, chapters)
- Comments (threaded, timed)
- Likes, Follows, Ratings
- Playlists (with items)
- Notifications
- Reports, Audit logs
- A/B tests, Webhooks
- Moods, Preferences
- Clips, Notes, Polls

### 10.2 File Storage

- Supabase Storage for audio files and cover images
- Multer for file upload handling
- Sharp for server-side image compression/optimization

### 10.3 Client-Side Storage (localStorage)

| Key | Data |
|-----|------|
| `listen_history` | Episode playback history |
| `listen_later` | Listen later queue |
| `search_history` | Recent search terms |
| `platform_settings` | User playback/notification/appearance settings |
| `guide_tooltips_*` | Onboarding tooltip progress |
| `welcome_banner_*` | Welcome banner dismissed state |
| `splash_shown` | Splash screen shown flag |

### 10.4 IndexedDB

- `indexedDB.js` utility for larger offline data storage
- Used by `OfflineDownload` component for downloaded episodes

---

## 11. SEO & Distribution

### 11.1 RSS Feed

- GET `/rss/:podcastId` - Standard RSS 2.0 feed with iTunes extensions
- Compatible with Apple Podcasts, Spotify, and other directories

### 11.2 Sitemap

- GET `/sitemap.xml` - Auto-generated XML sitemap for search engines

### 11.3 Embed

- GET `/embed/:episodeId` - Embeddable player HTML page
- GET `/api/embed/:episodeId` - Embed data API

### 11.4 Meta Tags

- React Helmet Async for dynamic page titles and meta descriptions

---

## 12. Security

### 12.1 Server Security

- **Helmet.js** - Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting** - General (100 req/15min), Auth (5 req/15min), Search (30 req/min), Upload (10 req/hour)
- **CORS** - Restricted to frontend origin
- **JWT** - Token-based authentication with expiration
- **bcrypt** - Password hashing with salt rounds
- **Input Validation** - Server-side validation on all endpoints

### 12.2 Frontend Security

- `ErrorBoundary` - Graceful error handling, no stack traces to users
- Sanitized user input rendering
- Protected route access via AuthContext

---

## 13. Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| Code Splitting | React.lazy + Suspense for all pages |
| Image Optimization | Sharp server-side + LazyImage client-side |
| Virtual Lists | VirtualList for long content lists |
| Prefetching | `/api/podcasts/:id/prefetch` endpoint |
| Caching | `useCache` hook + client-side cache utility |
| Debouncing | `useDebounce` for search inputs |
| Skeleton Loading | EnhancedSkeleton + page-level loading states |
| Optimistic Updates | OptimisticAction for instant UI feedback |

---

## 14. API Summary

**Total API Endpoints:** 90+
**GraphQL:** Available at `/graphql` for flexible queries
**WebSocket:** Socket.io for real-time notifications

### Endpoint Categories

| Category | Count | Auth Required |
|----------|-------|--------------|
| Podcasts & Episodes | ~15 | Mixed |
| Comments & Social | ~15 | Mixed |
| User & Profile | ~10 | Mostly Yes |
| Playlists & Organization | ~8 | Yes |
| Discovery & Search | ~6 | No |
| Creator Tools | ~5 | Yes |
| Admin Management | ~25 | Admin |
| Analytics & Stats | ~10 | Admin |
| System & Infrastructure | ~5 | Mixed |
