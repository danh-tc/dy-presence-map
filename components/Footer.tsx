export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="rethink-footer">
      <span className="rethink-footer__brand">
        <span className="rethink-footer__dot" aria-hidden="true" />
        Daen’s Footprints
      </span>
      <span className="rethink-footer__sep" aria-hidden="true">·</span>
      <span className="rethink-footer__copy">
        Ghi lại những nơi đã qua &mdash; {year}
      </span>
    </footer>
  );
}
