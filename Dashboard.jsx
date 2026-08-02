export default function Dashboard() {
  return (
    <div>
      <h4 className="mb-3">Dashboard</h4>
      <div className="alert alert-info mb-0">
        Dashboard KPI cards and charts will be built once the Tenant, Billing, and Payment modules
        are in place (they pull data from those tables). For now, head to{' '}
        <a href="/properties">Properties</a> to try the first module.
      </div>
    </div>
  )
}
