# Security

## Reporting

If you find a vulnerability, open a private security advisory on GitHub rather
than a public issue. Give me a way to reproduce it and I will get back to you.

## What being open source means here

Reading this code does not help anyone break into it, and closing it would not
help either. An Android app can be decompiled in minutes, so every check that
lives in the app is a suggestion, not a defence. The real boundary is the API,
and that is where every rule is enforced.

## Where the secrets are

None of them are in this repository. The database credentials, the JWT secret
and the OAuth client secrets live in `api/.env` on the server, which is
gitignored. `api/.env.example` lists the names with empty values so you know
what to fill in.

The app never talks to the database. It only knows an HTTPS URL, so there is
nothing worth extracting from the bundle.

## What the API does

- Passwords are hashed with argon2id at 19 MiB of memory, never stored or
  logged in the clear.
- Login runs a dummy hash when the account does not exist, so an attacker
  cannot tell existing emails apart by response time.
- Access tokens last 15 minutes. Refresh tokens are stored as a SHA-256 digest,
  rotate on every use and can be revoked, so a stolen database gives no usable
  session.
- Every query is parameterised through mysql2 named placeholders, and
  `multipleStatements` is off.
- Every route validates its body against a JSON schema with
  `additionalProperties: false`, so unknown fields are rejected instead of
  reaching the database.
- Every notes query is scoped by `user_id`, so knowing another note id gets you
  a 404 and nothing else.
- Auth endpoints allow 10 requests per 5 minutes per IP, the rest 120 per
  minute.
- Errors return a generic message. Stack traces and driver errors stay in the
  server log.
- Logs redact the authorization header, passwords, refresh tokens and OAuth
  codes.
- The database connection requires TLS 1.2 or higher, since the database is
  reachable from the internet.

## OAuth

The Google and Discord client secrets never reach the app. The app gets an
authorization code and sends it to the API, which exchanges it server side with
PKCE and issues its own token. That way a decompiled app yields a client id,
which is public by design, and nothing else.

## What is still missing

- No email verification, so an account can be created with an address you do
  not own.
- No account lockout after repeated failed logins, only the IP rate limit.
- No audit log of sessions.
