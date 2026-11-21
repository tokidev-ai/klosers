# Visual design status (P0-07)

The screens are designed in the [Klosers CRM designs](https://claude.ai/artifact/D1YhRfyAwmXHhp2Z2wnYwK) canvas. The canvas is the source of truth for layout and copy; this file records what is designed, what each Angular phase can build from, and what is still open. The brief is the "Features and screens for design" section of [`planning.md`](planning.md).

## Theme

The Tailwind tokens live in `apps/web/src/styles.css` (`@theme`) and match the "Tokens de diseño" board: colors, Roboto, 8px spacing, 4px radius (16px on chips) and the menu and drawer shadows. The placeholder `primary` (#1976d2) is the only value the brand colors replace; no screen hard-codes it.

## Screens in the canvas

All design text is in Spanish, with amounts in Bs or $us and times in Bolivia time (UTC−4).

| Phase | Screens |
| --- | --- |
| 1 | Sign in, Accept invite, Clients, Client detail, Client form, Sales board, Services, Service form, Users and teams, Client types, Settings, Profile |
| 2 | Booking page, Booking confirmation, My calendar, Team calendar, Availability |
| 3 | My dashboard, CSV import |
| 4 and later | Lead finder, Team dashboard, Notifications |

Changes made for P0-07:

- **Services** shows one team per service, with a team filter. The form picks a single team and explains that two teams selling the same thing get two services.
- **Users and teams** shows several teams per seller, with the primary team marked. A panel edits a seller's teams and the primary one.
- **Lead finder** adds the client type, Instagram handles, OpenAI as a source (each result links to its source) and a 0–100 fit score. The score is shown as a number, a label (Alta, Media, Baja) and a bar, never by color alone. Instagram stays disabled until Meta approves access.
- **Lead finder** and **Team dashboard** are now in Spanish and use the same two teams as the rest of the canvas.
- **New screens:** Accept invite, Client form, CSV import, Team calendar, Client types, Service form, Settings, Profile and Notifications.

## States

The "Estados" board defines the empty, loading, error, no-access and no-results states once, at desktop and phone width, and lists the empty, error and no-access text for each screen. The booking pages and the invite have their own states there: no free times, a time that was just taken, an expired or cancelled link and an expired invite. Build every list, board, calendar and dashboard from those pieces.

The new form screens also show their validation errors (client email, service price range, invite and profile passwords), and the client form shows the duplicate warning.

## Still open

- **Logo and brand colors.** The owner has not delivered them (P0-01), so the theme keeps the placeholder. This is the last open item of P0-07, and it also decides whether dark mode is designed.
- **Per-screen states.** The "Estados" board shows the shared patterns and the text for each screen, but the existing screens (Clients, Board, Calendar and so on) do not yet have their own empty, loading, error and no-access frames, and only the new Estados frames are drawn at phone width.
- **Manage booking** (reschedule or cancel from the emailed link) has no screen yet.
