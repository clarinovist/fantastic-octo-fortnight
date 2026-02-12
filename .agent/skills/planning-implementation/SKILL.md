---
name: planning-implementation
description: Generates detailed implementation plans for complex coding tasks. Use when the user has requirements but needs a structured plan before coding.
---

# Planning Implementation

## When to use this skill
- When the user has a spec or requirements for a multi-step task.
- Before writing any code for a complex feature.
- When you need to break down a large task into bite-sized steps.

## Workflow
- [ ] Check for project-specific overrides in `.agent/PROJECT_GUIDELINES.md`.
- [ ] Understand the goal and architecture.
- [ ] Create a dedicated plan file in `docs/plans/`.
- [ ] Define the plan header with Goal, Architecture, and Tech Stack.
- [ ] Break down work into bite-sized tasks (2-5 mins each).
- [ ] Review the plan with the user.

## Instructions
**Assumptions**: Write plans implementation assuming the engineer has zero context. Document everything: files to touch, code to write, tests to run.

**Bite-Sized Task Granularity**:
Each step is one atomic action:
1. "Write the failing test"
2. "Run it to make sure it fails"
3. "Implement the minimal code"
4. "Run the tests and make sure they pass"
5. "Commit"

**Plan File Location**: `docs/plans/YYYY-MM-DD-<feature-name>.md`

**Plan Header Template**:
```markdown
# [Feature Name] Implementation Plan
**Goal:** [One sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [Key technologies/libraries]
```

**Task Structure Template**:
```markdown
### Task N: [Component Name] (e.g., Backend Handler / Frontend Component)
**Files:**
- Create: `backend/internal/handlers/v1/new_handler.go`
- Modify: `frontend/app/(customer)/profile/page.tsx`

**Step 1: Write the failing test / Define Interface**
Define the DTO or Service interface first.

**Step 2: Implement Logic / UI**
Follow the established patterns (Clean Architecture for Backend, shadcn/ui for Frontend).

**Step 3: Verification**
Run: `go test ./...` or `npm run dev` and manual check.

**Principals**:
- Exact file paths always.
- Complete code in plan.
- Exact commands with expected output.
- DRY, YAGNI, TDD.
