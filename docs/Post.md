# 📝 Posts API Documentation

## 📂 API Routes Overview

Below are all available API endpoints for managing blog posts, including creation, updates, publishing, comments, and bulk actions.

---

### 1. `/app/api/posts/route.ts`

**GET** - Fetch all posts with filtering options _(status, author, category, tags, featured, active)_  
**POST** - Create a new blog post

---

### 2. `/app/api/posts/[id]/route.ts`

**GET** - Retrieve a single post by ID  
**PATCH** - Update post _(includes ownership & demo data checks)_  
**DELETE** - Delete post _(includes ownership & demo data checks)_

---

### 3. `/app/api/posts/slug/[slug]/route.ts`

**GET** - Retrieve a post by slug _(public access, only published posts)_

---

### 4. `/app/api/posts/bulk/route.ts`

**DELETE** - Bulk delete posts  
**PATCH** - Bulk toggle properties _(isActive, isFeatured, allowComments)_

---

### 5. `/app/api/posts/bulk/status/route.ts`

**PATCH** - Bulk update post status _(draft, published, archived)_

---

### 6. `/app/api/posts/bulk/tags/route.ts`

**POST** - Bulk add tags to posts  
**DELETE** - Bulk remove tags from posts

---

### 7. `/app/api/posts/bulk/category/route.ts`

**PATCH** - Bulk assign category to posts

---

### 8. `/app/api/posts/[id]/publish/route.ts`

**POST** - Publish a post _(sets status, isActive, publishedAt)_

---

### 9. `/app/api/posts/[id]/views/route.ts`

**POST** - Increment post views _(public endpoint, no authentication required)_

---

### 10. `/app/api/posts/[id]/comments/route.ts`

**POST** - Add a comment to a post _(public endpoint, requires approval)_

---

### 11. `/app/api/posts/[id]/comments/[commentId]/route.ts`

**PATCH** - Update comment status _(approve/reject)_  
**DELETE** - Delete comment

---

🧩 **Note:** These routes are designed to be used with authentication and ownership verification for protected actions, except for view and public comment endpoints.
