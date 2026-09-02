/**
 * Renders a word as individually-hoverable letters.
 * Used ONLY for the hero headline (DESIGNER / WHO / dynamic keyword).
 * Each <span> is an independent interactive element — hovering one
 * letter never affects its neighbours.
 */
export default function HoverWord({ text, className = '' }) {
  return (
    <span className={`hover-word ${className}`}>
      {text.split('').map((char, i) => (
        <span
          className="headline-letter"
          key={`${char}-${i}`}
          style={{ '--dir': i % 2 === 0 ? -1 : 1 }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
