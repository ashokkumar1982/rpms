import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import { propertyService } from '../../services/propertyService'
import ConfirmDialog from '../../components/ConfirmDialog'
import LoadingSkeleton from '../../components/LoadingSkeleton'

const PAGE_SIZE = 10

export default function PropertyList() {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const { data, error, count: total } = await propertyService.list({
      page,
      pageSize: PAGE_SIZE,
      search,
      status,
      propertyType,
    })
    if (error) {
      toast.error('Failed to load properties: ' + error.message)
    } else {
      setRows(data || [])
      setCount(total || 0)
    }
    setLoading(false)
  }, [page, search, status, propertyType])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1)
  }, [search, status, propertyType])

  const handleDelete = async () => {
    if (!pendingDelete) return
    const { error } = await propertyService.remove(pendingDelete.property_id)
    if (error) {
      toast.error('Could not delete property: ' + error.message)
    } else {
      toast.success(`"${pendingDelete.property_name}" deleted`)
      setPendingDelete(null)
      fetchRows()
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Properties</h4>
        <Link to="/properties/new" className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> Add Property
        </Link>
      </div>

      <div className="card mb-3">
        <div className="card-body row g-2">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                className="form-control"
                placeholder="Search by name, number, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Individual House">Individual House</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Number</th>
                <th>City</th>
                <th>Type</th>
                <th>Rent</th>
                <th>Status</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingSkeleton rows={5} cols={7} />
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No properties found.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.property_id}>
                    <td>{p.property_name}</td>
                    <td>{p.property_number}</td>
                    <td>{p.city || '-'}</td>
                    <td>{p.property_type}</td>
                    <td>₹{Number(p.rent).toLocaleString('en-IN')}</td>
                    <td>
                      <span
                        className={`badge ${p.status === 'Occupied' ? 'bg-success' : 'bg-secondary'}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/properties/${p.property_id}/edit`}
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => setPendingDelete(p)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <span className="text-muted small">
            {count} total {count === 1 ? 'property' : 'properties'}
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Prev
                </button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  {page} / {totalPages}
                </span>
              </li>
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <ConfirmDialog
        show={!!pendingDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${pendingDelete?.property_name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
