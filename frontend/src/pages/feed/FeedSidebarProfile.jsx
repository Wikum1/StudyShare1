export default function FeedSidebarProfile({ user }) {
  const name = (user?.name || "Student").trim();
  const email = (user?.email || "").trim();

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  return (
    <div className="feedSidebarProfile">
      <div className="feedSidebarAvatar" aria-hidden="true">
        {initials}
      </div>
      <div className="feedSidebarProfileText">
        <div className="feedSidebarUsername">{name}</div>
        <div className="feedSidebarEmail">{email || "—"}</div>
      </div>
    </div>
  );
}
