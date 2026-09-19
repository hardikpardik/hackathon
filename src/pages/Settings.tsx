export function Settings() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Settings</h1>
          <p className="lede">Manage notification and incident preferences.</p>
        </div>
      </div>
      <section className="panel settings">
        <h2>Notifications</h2>
        <label>
          <input type="checkbox" defaultChecked /> Notify me when a P1 incident opens
        </label>
        <label>
          <input type="checkbox" defaultChecked /> Send acknowledgement reminders
        </label>
        <h2>Profile</h2>
        <p>
          <strong>Alex Morgan</strong>
          <br />
          <span className="muted">Platform Engineering</span>
        </p>
      </section>
    </>
  )
}
