import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { propertyService } from '../../services/propertyService'
import { propertySchema } from '../../utils/propertyValidation'
import { useAuth } from '../../context/AuthContext'

const defaultValues = {
  property_name: '',
  property_number: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  owner_name: '',
  owner_mobile: '',
  property_type: 'Apartment',
  rent: 0,
  maintenance: 0,
  eb_rate: 0,
  deposit: 0,
  status: 'Vacant',
  description: '',
}

export default function PropertyForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(isEdit)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues,
  })

  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      const { data, error } = await propertyService.getById(id)
      if (error) {
        toast.error('Could not load property: ' + error.message)
        navigate('/properties')
        return
      }
      reset(data)
      setLoading(false)
    })()
  }, [id, isEdit, navigate, reset])

  const onSubmit = async (values) => {
    if (isEdit) {
      const { error } = await propertyService.update(id, values)
      if (error) {
        // Duplicate property_number is caught by the unique(owner_id, property_number) constraint
        toast.error('Update failed: ' + error.message)
        return
      }
      toast.success('Property updated')
    } else {
      const { error } = await propertyService.create(values, user?.id)
      if (error) {
        toast.error('Could not save property: ' + error.message)
        return
      }
      toast.success('Property added')
    }
    navigate('/properties')
  }

  if (loading) {
    return <div className="text-muted">Loading...</div>
  }

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="mb-4">{isEdit ? 'Edit Property' : 'Add Property'}</h4>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Property Name *</label>
              <input
                className={`form-control ${errors.property_name ? 'is-invalid' : ''}`}
                {...register('property_name')}
              />
              {errors.property_name && (
                <div className="invalid-feedback">{errors.property_name.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Property Number *</label>
              <input
                className={`form-control ${errors.property_number ? 'is-invalid' : ''}`}
                {...register('property_number')}
              />
              {errors.property_number && (
                <div className="invalid-feedback">{errors.property_number.message}</div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label">Address</label>
              <input className="form-control" {...register('address')} />
            </div>

            <div className="col-md-4">
              <label className="form-label">City</label>
              <input className="form-control" {...register('city')} />
            </div>
            <div className="col-md-4">
              <label className="form-label">State</label>
              <input className="form-control" {...register('state')} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Pincode</label>
              <input
                className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                {...register('pincode')}
              />
              {errors.pincode && <div className="invalid-feedback">{errors.pincode.message}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Owner Name</label>
              <input className="form-control" {...register('owner_name')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Owner Mobile</label>
              <input
                className={`form-control ${errors.owner_mobile ? 'is-invalid' : ''}`}
                {...register('owner_mobile')}
              />
              {errors.owner_mobile && (
                <div className="invalid-feedback">{errors.owner_mobile.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Property Type *</label>
              <select className="form-select" {...register('property_type')}>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Individual House">Individual House</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select className="form-select" {...register('status')}>
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Monthly Rent (₹) *</label>
              <input
                type="number"
                step="0.01"
                className={`form-control ${errors.rent ? 'is-invalid' : ''}`}
                {...register('rent')}
              />
              {errors.rent && <div className="invalid-feedback">{errors.rent.message}</div>}
            </div>
            <div className="col-md-3">
              <label className="form-label">Maintenance (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                {...register('maintenance')}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Electricity Rate (₹/unit)</label>
              <input type="number" step="0.01" className="form-control" {...register('eb_rate')} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Deposit (₹)</label>
              <input type="number" step="0.01" className="form-control" {...register('deposit')} />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} {...register('description')} />
            </div>
          </div>

          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Property'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/properties')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
