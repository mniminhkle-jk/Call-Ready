# Call Ready: usability and accessibility audit

**Date:** 2026-10-18 · **Standard:** WCAG 2.1 AA · **Scope:** login, Main Hub, Accounts search, company page, person page (Call prep / Background / Notes / Activity tabs), practice call, Training, Dashboards, Guide.

Method: page-by-page review of the built app in demo mode (Playwright screenshots at 1360 px and 390 px), keyboard-only walk-through, contrast measured from the CSS tokens, copy review against one term per concept. A real screen-reader pass (VoiceOver/NVDA) and the rep test below are still to do.

## What changed in this round

| Area | Before | After | Why |
|---|---|---|---|
| Navigation | 6 tabs incl. "CRM" and "How it works" | 4 tabs: Main Hub, Accounts, Training, Dashboards | Reps don't manage sync. Help moved into the Guide. |
| Help | Static "How it works" page | Guide chat (bottom right) with suggestions for the page you're on; answers point to and click the right button | Help where the question comes up, not on a separate page. |
| CRM data | Separate CRM screen | Stage changes, opportunities, emails and calls from Salesforce/HubSpot appear in each account's and person's **Activity**, tagged by source | One place to see what happened, whatever system it came from. |
| Person contact info | Company switchboard shown as the person's phone | Phone and email say "Not on file" until they come from the CRM or a rep adds them | Avoids reps dialing the main line thinking it's direct. |
| Person page | One long scroll | Header with actions, a contact strip, then tabs: Call prep, Background, Notes, Activity | First screen shows only what's needed before a call. |
| Long content | Shown in full | First item shown; the rest behind "N more openers", "More about X", "Show N more" | Less text up front, details one click away. |
| Notes | A note with only P and N could be saved | Needs a purpose, at least 3 of 7 CQPPPIN results and a dated next step; checked in the form and on the server. Saved notes show all 7 buckets, with gaps marked "Not captured" | Matches the PRN (CQPPPIN) framework from class. |
| Search counts | Companies/People counts didn't follow filters (A. O. Smith showed "12 people", "3 companies") | Counts are computed from the filtered list; aria-live announces them | Counts must match what's on screen. |
| Sample labels | "(sample)" badges throughout | Removed from the UI; rows keep `is_sample` in the database | Data reads as it will once pulled from the CRM. |

## Accessibility findings

### Perceivable
| # | Issue | WCAG | Severity | Status |
|---|---|---|---|---|
| 1 | Warning text (#a86400) on cream was under 4.5:1 | 1.4.3 | Major | Fixed: #8a5200 (5.85:1) |
| 2 | Orange accent text on light backgrounds under 4.5:1 | 1.4.3 | Major | Fixed: `--accent-text` #9a5a12 (4.97:1) |
| 3 | Input borders too faint to find the field | 1.4.11 | Major | Fixed: `--field-line` #76838f (3.88:1) |
| 4 | Status shown by color only (chips, rubric) | 1.4.1 | Major | Fixed: every chip has a text label; rubric rows add screen-reader text for met / missed |
| 5 | Section counts not announced when filters change | 4.1.3 | Minor | Fixed: `aria-live="polite"` on counts |

### Operable
| # | Issue | WCAG | Severity | Status |
|---|---|---|---|---|
| 6 | No way to skip the top navigation | 2.4.1 | Major | Fixed: "Skip to content" link |
| 7 | Draft modals didn't close with Escape or return focus | 2.1.2 / 2.4.3 | Critical | Fixed: Escape closes, focus goes to the first field and back to the opening button |
| 8 | Person tabs not keyboard operable | 2.1.1 | Major | Fixed: `role=tablist/tab/tabpanel`, arrow keys, Home/End, roving tabindex |
| 9 | Small buttons (activity filters) under target size | 2.5.5 | Minor | Fixed: min height 32–44 px |
| 10 | Guide panel: Escape and focus handling | 2.1.2 | Major | Built in: Escape closes and returns focus to the Guide button |

### Understandable
| # | Issue | WCAG | Severity | Status |
|---|---|---|---|---|
| 11 | Note errors were generic | 3.3.1 / 3.3.3 | Major | Fixed: each message says what's missing and how to fix it ("Add at least 3 of the 7 Results (R). You have 2.") |
| 12 | Search box had only a placeholder | 3.3.2 | Major | Fixed: hidden label "Search" plus placeholder |
| 13 | Optional fields not marked | 3.3.2 | Minor | Fixed: "(optional)" on phone and email when adding a contact |

### Robust
| # | Issue | WCAG | Severity | Status |
|---|---|---|---|---|
| 14 | Hidden panels still displayed (CSS `display` overrode `hidden`) | 4.1.2 | Major | Fixed: `[hidden]{display:none!important}` |
| 15 | Toggle buttons didn't expose state | 4.1.2 | Minor | Fixed: `aria-pressed` on activity filters, `aria-expanded` on Guide |

### Contrast check (light theme unless noted)
| Element | Foreground | Background | Ratio | Needs | Pass |
|---|---|---|---|---|---|
| Body text | #15212e | #ffffff | 16.3:1 | 4.5 | ✅ |
| Secondary text | #5a6878 | #ffffff | 5.7:1 | 4.5 | ✅ |
| Secondary text on page | #5a6878 | #eef1f4 | 5.0:1 | 4.5 | ✅ |
| Links | #2f6fb3 | #ffffff | 5.2:1 | 4.5 | ✅ |
| Primary button | #eef3f8 | #16324f | 11.7:1 | 4.5 | ✅ |
| "Practice call" button | #1b1206 | #c4741a | ~4.6:1 | 4.5 | ✅ |
| Due-date chip | #8a5200 | #fff4dc | 5.9:1 | 4.5 | ✅ |
| "On track" chip | #1f7a4d | #e6f4ec | 4.7:1 | 4.5 | ✅ |
| Error text | #b3261e | #ffffff | 6.5:1 | 4.5 | ✅ |
| Field border | #76838f | #ffffff | 3.9:1 | 3.0 | ✅ |
| Dark: body text | #e6ebf0 | #18212b | 13.6:1 | 4.5 | ✅ |
| Dark: secondary | #9aa7b4 | #18212b | 6.6:1 | 4.5 | ✅ |

### Keyboard
| Element | Tab | Enter/Space | Escape | Arrows |
|---|---|---|---|---|
| Skip link | First stop | Jumps to main | — | — |
| Top tabs | In order | Navigate | — | — |
| Person tabs | One stop (selected tab) | Select | — | ←/→, Home/End |
| Draft email / LinkedIn modal | Traps inside | Buttons act | Closes, focus back | — |
| "More…" sections | Summary focusable | Expand/collapse | — | — |
| Guide | Last stop | Opens, focus to input | Closes, focus back | — |

### Still to check
- Real VoiceOver and NVDA pass on the person page tabs and the Guide log.
- 200% zoom on the Dashboards chart.
- Focus trap edge cases when the Guide is open on top of a modal.

## UX copy decisions

One term per concept, used everywhere:

| Concept | Use | Don't use |
|---|---|---|
| A company we're selling to | Account (nav), company (in sentences) | Prospect org, client |
| A person at that company | Contact | Lead, persona, stakeholder |
| Fresh public news | Company news / updates | Signals, Exa results |
| Logging a conversation | Log a call → Call notes | Add PRN, Meeting record |
| Voice practice | Practice call | Mock interview, roleplay |
| Missing data | Not on file | N/A, —, TBD |

Button labels start with a verb and name the result: "Draft email", "Log a call", "Check for news", "Add a fact you found", "Mark profile reviewed". Empty states say what goes there and how to fill it ("No calls logged yet. Your first note feeds the next steps and the one-page brief."). Error messages say what's missing and how to fix it.

## Usability test plan (reps)

**Goal:** can a new rep go from login to a confident first call without help?
**Who:** 5 freight brokerage reps or sales students (mix of 0–2 years), one at a time, 30 minutes, think-aloud, remote with screen share.
**Measures:** task success (unaided / with Guide / failed), time on task, wrong clicks, confidence 1–5 after each task, SUS at the end.

| # | Task (as read to the participant) | Success looks like |
|---|---|---|
| 1 | "You have 15 minutes before calls. Who should you call first, and why?" | Opens the top "Reach out today" contact and states the Sharpest Signal |
| 2 | "Find the transportation manager at A. O. Smith and see if we have his direct line." | Uses search or filter, opens Patrick Williams, reads "Not on file" correctly |
| 3 | "Write a first email to him. Change the reason line if you don't like it." | Opens Draft email, edits, uses "I sent it" |
| 4 | "Practice the call, then check what you missed." | Runs written or voice practice, reads the rubric |
| 5 | "You just talked to Brad Zwigart. Log the call." | Saves a note with purpose, ≥3 CQPPPIN results and a dated next step |

Probes after each task: "What did you expect to happen?", "What would you do next?", "Was anything on this page you didn't need?" Debrief: "Where would you look for what changed in Salesforce?" (tests the Activity feed) and "When did you use the Guide, and did it help?"

Synthesis: affinity map the notes by task and theme, then put each finding on an impact/effort grid; fix high-impact, low-effort items before the competition demo.
