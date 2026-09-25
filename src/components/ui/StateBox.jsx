/** Shared empty / error state panel */
export default function StateBox({ title, children, action, role }) {
  return (
    <div className="state-box" role={role}>
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}
