/** @type {import('tailwindcss').Config} */
export default {
  // Scoped to PlaygroundSection only -- this is the sole place in the
  // codebase using Tailwind utility classes (ported from the standalone
  // Playground project, see PlaygroundSection.jsx). Every other
  // component here is hand-written CSS; narrowing `content` to just
  // this one file keeps Tailwind's generated utility set (and this
  // config's blast radius) limited to where it's actually used, rather
  // than scanning -- and potentially reacting to className-like
  // strings in -- the rest of the app.
  content: ['./src/components/PlaygroundSection.jsx'],
  theme: {
    extend: {},
  },
  plugins: [],
};
