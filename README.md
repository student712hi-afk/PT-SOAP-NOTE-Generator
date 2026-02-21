# PT SOAP Note Generator

A lightweight browser app that helps transform a patient interview into a practical PT-focused clinical guide.

## What it generates

- Case summary from the interview text
- Suggested outcome assessments
- Physical exam ideas
- Red flags to screen
- SOAP note draft (Subjective, Objective, Assessment, Plan)

## How to run

Because this is a static app, you can run it with any simple static server.

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173> in your browser.

## Notes

- This tool is for documentation support and education.
- It does **not** replace clinical reasoning, diagnosis, or local policy requirements.
