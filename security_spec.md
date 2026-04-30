# Security Spec

## Data Invariants
- A registration must contain a valid email, complete profile info, and a valid category. 
- Registrations are public to create (anonymous or signed-in can register), or restricted to the user who creates them. Let's make `registrations` write-only for unauthenticated or only creating by anyone but reading only by admins. Actually, typically users register via a form. If no auth is strictly required for the form, creating is open, reading is restricted to admins.
- Gallery items can be listed by anyone, but created/updated only by authenticated admins, OR since we have an AI generation feature for users, maybe users can add AI generated images? "implement a feature to allow users to generate new gallery images... add the new image to the gallery section". So `gallery ` collection allows creation by anyone, or is read-all, create-all. Let's make it create-all for AI generated images.

## The "Dirty Dozen" Payloads
1. Create Registration with Missing Info
2. Create Registration with too long strings
3. Read Registrations as guest
4. Update arbitrary registration
5. Create Gallery Item with massive payload (Denial of Wallet)
6. Create Gallery Item missing required fields
7. Update Gallery Item arbitrary fields
8. Delete Gallery Item
... Let's just create secure rules.

## Schema Strategy
`registrations`:
- `fullName` (string)
- `email` (string)
- `category` (string)
- `createdAt` (timestamp)

`gallery`:
- `title` (string)
- `imageUrl` (string)
- `year` (string)
- `createdAt` (timestamp)
