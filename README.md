# Fire App

Welcome to the Fire App! This is a full-stack implementation of the classic "to-do" task management app.  
It's written in ASP.NET Core (.NET 8), Entity Framework (InMemory), and React + Vite + React Query.  See the setup directions below if you'd like to try it out.

## Setup

**Prerequisites**
- Node 20+
- .NET 8 SDK

### Backend
  ```bash
cd backend/Todo.Api
dotnet restore
dotnet run
  ```
  - API base: http://localhost:5237/api
  - Database: The backend uses EF InMemory for simplicity. Data resets on restart.
  - No config changes / env vars are needed, defaults are supplied by appsettings files.

### Frontend
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  - App: http://localhost:5173
  - The API base URL is hardcoded to http://localhost:5237/api in src/services/api.ts.

## Basic Assumptions

This project is designed as a take-home demo, not a production-ready system. The goal is to show solid architectural thinking, practical tradeoffs, and clean code - not to cover every edge case or infrastructure concern, and not to show off what I can do with needless over-engineering. The following assumptions guide the implementation:

1. **Local setup should be easy**  
   - The app runs entirely on the developer’s machine, no Docker or Kubernetes manifests are included.
   - Environment configuration is minimal; defaults are baked into appsettings for simplicity.  
   - No external dependencies (e.g. databases, queues, cloud services) are required.

2. **No need to cover every infrastructure concern**  
   - A proper production app would have a CI pipeline with gated check-ins, a simple process for staged deployments (to dev/staging/production), health checks, structured logging, tracing, alerts, and audit logs.
   - Config secrets like token signing keys should really come from env variable injection or secret stores.
   - HTTPS enforcement, CORS hardening, and rate limiting are not tuned beyond what’s needed for local use. 
   - Authentication is self-contained; no identity provider, OAuth flow, or refresh token rotation is implemented. 

3. **Frontend should have a good UI/UX, but keep it simple**  
   - The frontend is intended to show responsive UI, local state management, and modern React Query data patterns.  A bespoke design isn't necessary to demonstrate that.
   - Security tradeoffs (e.g., storing tokens in `localStorage`) are fine for simplicity in a non-production setting.
   - It's ok for internationalization and accessibility scores to not be perfect.
   - As a demo app, this is going to run on laptops/desktops, so it's ok if the design isn't perfectly responsive for mobile.

4. **No over-engineering!**  
   - No repository or service layers are added unnecessarily - the code directly uses EF Core through the DbContext.  
   - Testing and error handling are present, but not exhaustive.

These assumptions keep the project approachable while still reflecting patterns and structures that could scale in a real application.


## Auth and Identity

Authentication uses JWT bearer tokens with a guest cookie fallback.

- Registration or login issues a JWT signed with a secret key; the token is stored in localStorage.
- Subsequent requests include the header `Authorization: Bearer <token>`.
- Unauthenticated users are identified by a persistent cookie (`todo.sid`), allowing them to create temporary data before registering.
- Logout clears both the token and cookie.

### Why it works this way

The goal was to create something realistic while keeping it simple to reason about.  
JWT avoids server-side session management and integrates cleanly with SPAs.  
The token includes only essential claims (user ID and email) to keep payloads small and reduce exposure risk.  
The guest cookie improves UX by letting anonymous users interact before registering.  
In a production environment, the JWT signing key would come from a secure environment variable or key vault (or JWT signing would happen in a third party IDaaS platform like Auth0), but for local development, the key is set in appsettings for convenience.

## Data Modeling and EF Design

The backend uses Entity Framework Core for data access.  
EF provides expressive modeling, migrations, and automatic change tracking, making it ideal for a small but complete demo project.  

All entities inherit from a common `BaseEntity`, giving them a consistent set of audit and ownership fields:
```csharp
public abstract class BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
```

### Benefits

- **Consistency**: All entities share a uniform set of metadata fields.
- **Auditing**: Creation, update, and soft-delete timestamps provide helpful information for debugging purposes and could be shown in the UI down the line.
- **Soft-deletion**: Allows for recoverable deletes and preserves audit/analytics history.
- **Per-user scoping**: The `OwnerUserId` ensures user data isolation.
- **Simplicity**: Logic is centralized in `SaveChangesAsync` and `OnModelCreating`, which apply global filters and timestamp logic, so the service layer doesn't have to manage them.

### No Repository Layer

A repository abstraction is intentionally omitted. For small applications, Entity Framework already provides the benefits of a repository and unit-of-work pattern. Adding another layer would introduce unnecessary complexity to a small project like this.

### DTOs Instead of Entities

Controllers do not return EF entities directly.  
Instead, they return DTOs (data transfer objects) to:
- Prevent over-posting and accidental data exposure.
- Decouple API responses from database structure.
- Allow internal schema changes without breaking the API.

This pattern keeps the frontend isolated from persistence details and is a common best practice in production systems.


## Testing

All of the API endpoints have integration tests, which are found in backend/Todo.Api.Tests.  
The test files follow a strict pattern:
 - Folder structure mirrors the API namespace
 - Each controller gets its own test class
 - Each endpoint gets its own file, which is a partial class of the controller to which that endpoint belongs
 - Each test file hits the happy path at a minimum, and ideally hits some of the unhappy paths too (e.g. NotFound, BadRequest).

Here is a sample of how that looks:
```
Todo.Api.Tests/
└── Controllers/
    └── Lists/
        ├── ListsControllerTests.cs              # Base test class (shared setup, helpers)
        ├── ListsControllerTests.GetLists.cs     # Tests for GET /api/lists
        ├── ListsControllerTests.CreateList.cs   # Tests for POST /api/lists
        └── ListsControllerTests.DeleteList.cs   # Tests for DELETE /api/lists/{id}
```

## Frontend Overview

The frontend is built with **React**, **TypeScript**, **Vite**, and **React Query**.  
It demonstrates modern React development practices, including declarative data fetching, optimistic UI updates, and centralized query caching. It’s intentionally lightweight - designed to demonstrate structure and patterns more than visual polish.

### Architecture and Design Choices

- **Vite** provides fast local development with minimal configuration and excellent TypeScript support. It would also be easy to produce a production-ready build with minimal size and good caching.
- **React Query** handles data synchronization with the backend. It manages caching, invalidation, and background refetches automatically.
- **Tailwind CSS** is used for styling to keep components self-contained and expressive without maintaining separate CSS files.
- **React hooks** drive the application logic, ensuring functional and composable code instead of class-based components.
- Toast notifications are implemented in the root `App` component to display transient success and error messages following user actions.

### Data Flow

- API calls are defined in `src/services/api.ts`.  
  The `fetchWithCreds` helper ensures cookies and authentication headers are consistently sent.
- Each React Query hook (e.g., `useQuery`, `useMutation`) calls the appropriate API function and triggers toast messages on success or failure.
- Local component state (via `useState`) is reserved for UI-level concerns such as input fields, edit modes, or toggle states.

### UI Features

- Lists and tasks are rendered dynamically from the backend using cached queries.
- Reordering tasks uses `@hello-pangea/dnd`, which updates task order both in the UI and server-side. I felt it was better to pull in a library, rather than reinvent the wheel for a solved problem.  Reordering is only allowed for incomplete tasks, as I assume users don't care about the priority of an already completed task.
- The dark/light theme toggle uses Tailwind’s `dark:` variant for consistent color modes.
- Toasts appear in the bottom-left corner and automatically dismiss after a short duration.
- The TaskList and TaskItemRow are separate components, which helps keep component size down to a manageable size and makes TaskItemRow reusable.

### Tradeoffs

- The frontend intentionally avoids Redux or Context to keep the app lightweight and focused on React Query’s strengths.
- Error handling is centralized through `onError` callbacks, but could be further refined with boundary components or custom hooks for larger projects.
- React Query’s retry behavior is disabled by default to make failures visible immediately during testing.

Overall, I think this setup balances simplicity with real-world patterns that would scale well if the app were extended with routing, additional pages, or user collaboration features.


### Future features
- Sharing lists (multi-tenant access control, invitations).
- Task progress and activity log.
- Due dates, reminders, snooze.
- Rich tasks: descriptions, attachments, comments.
- Bulk operations and advanced filters/search.
