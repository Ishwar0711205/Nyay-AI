# Nyay AI React Frontend

## Run

```bash
npm install
npm run dev
```

Set the backend URL if needed:

```bash
VITE_API_URL=http://localhost:8000
```

The UI supports:

- Official Maharashtra legal corpus
- User PDF upload
- Official / User / Both retrieval modes
- Answer display
- Confidence display
- Source cards with `[S1]...[S5]`
- Page numbers and similarity
- Retrieval-grounded warning

The Gemini key is never sent to the browser.
