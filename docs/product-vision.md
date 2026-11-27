# Product vision

JobScout automates preliminary discovery and triage for a candidate who manually chooses positions to explore. The workflow is discovery → normalization → deduplication → conservative screening → human selection → versioned export to JobFlow. These product stages are planned. JobFlow owns detailed vacancy analysis, experience matching, suitability assessment, CV adaptation and document generation.

Prioritize German remote employers, Ukrainian employers hiring candidates based abroad, European employers accepting Germany-based candidates, and international employers with eligible remote roles. The initial professional direction includes JavaScript and TypeScript, Node.js, backend and full-stack development, NestJS as a vacancy technology, React, Next.js, applied AI and cloud application development. Candidate location, languages and proficiency, preferences, seniority and employment preferences are configurable. The project does not assume the owner's proficiency.

- `worth_exploring` identifies a promising vacancy. `maybe` preserves uncertainty. Reserve `skip` for clearly unsuitable vacancies supported by verifiable source quotes. Minimize false negatives and favor human review. Avoid percentage matches and hiring predictions.
- Vacancy prose language does not establish required candidate language. Separate required from preferred skills and preserve the wording of ambiguous proficiency. Missing requirements mean unknown.
- Separate employer location, eligible work locations and contractual or employment eligibility. “Remote” alone does not establish eligibility from Germany.
- Preserve explicit application instructions, verified links and the distinction between application and general inquiry emails. Missing names or contact details stay missing. An aggregator's partial result is not evidence of closure.
- Treat external content as untrusted data. Retain and display original content only where terms permit. Source approval covers collection, storage, display, AI processing, retention and redistribution.

The bootstrap verifies textual evidence and removes visibly unsupported extractions. The agent labels accepted responses `textual_only`, including model interpretations of quoted language status. A textual match does not prove that a quote supports a conclusion. The current schema has no quote field for remote eligibility, so the bootstrap reports it as unknown. Candidate profiles, semantic grounding, contact extraction and evaluations are M3 work.
