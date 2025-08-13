# ApplyLog Frontend

This is a React + Tailwind CSS frontend for your ApplyLog FastAPI backend.

## Setup Instructions

1. Open a terminal in this folder.
2. Run the following commands:

```
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Replace the contents of `tailwind.config.js` with:
```
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

4. In `src/index.css`, replace everything with:
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. Start the dev server:
```
npm run dev
```

## Next Steps
- I will generate starter components and pages for your job application UI.
- Connect to your FastAPI backend using fetch/axios.
- Build a beautiful dashboard and CRUD pages.
