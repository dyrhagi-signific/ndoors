# Ndoors — AI Agent Reference

A quick guide to which agent to use and when.
Always attach `ndoors-spec-v2.html` when starting a new conversation.

---

## 🏗️ CTO / Staff Engineer Agent
**File:** `cto-agent.md`

Use when you need:
- Architecture decisions ("should I structure this as X or Y?")
- Code review ("does this look right?")
- Debugging ("this isn't working, here's the error")
- Database questions (queries, RLS, performance)
- Setting up new features end-to-end
- Security or GDPR questions
- Anything backend: API routes, Supabase, auth, email

**How to start:**
> Paste the contents of `cto-agent.md` as your first message, then attach `ndoors-spec-v2.html`, then describe your task.

---

## 🎨 UI / Design Agent
**File:** `ui-agent.md`

Use when you need:
- Building a new page or component
- Making something look better
- Mobile-first layout decisions
- Design feedback ("does this feel right?")
- Animation and interaction details
- Choosing between design approaches

**How to start:**
> Paste the contents of `ui-agent.md` as your first message, then attach `ndoors-spec-v2.html`, then describe the screen you're building.

---

## 🔀 Git & Commits Agent
**File:** `git-agent.md`

Use when you need:
- Help writing a commit message
- Reviewing changes before pushing
- Setting up a PR description
- Understanding branch strategy
- Fixing a messy Git history

**How to start:**
> Paste the contents of `git-agent.md`, describe what you've built, and paste the relevant diff or file.

---

## 🧪 Testing & Code Review Agent
**File:** `testing-agent.md`

Use when you need:
- Writing tests for a feature you just built
- A code review checklist before merging
- Setting up the testing environment
- Understanding why a test is failing
- Reviewing a PR before merging to main

**How to start:**
> Paste the contents of `testing-agent.md`, then paste the code you want tested or reviewed.

---

## 💡 Tips for working with AI agents

**Always include context.** The more specific you are, the better the output.
Instead of: *"build me a form"*
Say: *"build the applicant referent submission form for the `/ref/[invite_token]` page — mobile first, fields: first name, last name, email, phone (optional), relationship (dropdown)"*

**Share errors in full.** Paste the complete error message, not a summary.

**One task at a time.** AI agents work best with a single clear goal per conversation.

**Paste relevant code.** If you're debugging, paste the file you're working on.

**End sessions with a handoff note.** Before closing a long conversation, ask:
*"Summarise what we built and what the next step is"* — then save that as a note.

---

## Suggested workflow for a typical feature

```
1. CTO agent     → plan + build the feature (API, database, logic)
2. UI agent      → build the screen / component
3. Testing agent → write tests, review the code
4. Git agent     → write commit messages, open PR
```
