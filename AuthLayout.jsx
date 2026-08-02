export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', background: '#f4f6f9' }}
    >
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: 400 }}>
        <div className="card-body p-4">
          <h4 className="text-primary mb-1">RPMS</h4>
          <h6 className="mb-1">{title}</h6>
          {subtitle && <p className="text-muted small mb-4">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}
