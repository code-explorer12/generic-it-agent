# /retrospect Command

**Description:** Manually triggered command to analyze the current work session retrospectively. Extracts lessons learned (what worked, challenges, examples, recommendations) and appends them to AGENTS.md for continuous learning and process improvement.

**Trigger:** Activated when the user says "/retrospect" or "retrospect".

**Process:**
1. Review the conversation history from the current session.
2. Identify successes and challenges in software development processes, tools used, and outcomes.
3. Format lessons into sections: Worked Well, Challenges/Issues, Examples, Recommendations.
4. Append a new "Lessons Learned - [Date]" section to AGENTS.md.
5. Include specific examples from the session (e.g., code snippets, tool usage).

**Example Output:**
```
## Lessons Learned - 2025-12-30
### Worked Well
- Incremental planning...
### Challenges
- Cypress issues...
### Examples
- Checkbox filters worked.
### Recommendations
- Use data-cy attributes.
```

**Purpose:** Enable continuous learning by documenting insights after each work session, improving future performance.