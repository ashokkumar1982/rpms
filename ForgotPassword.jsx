import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { forgotPasswordSchema } from '../../utils/authValidation'
import AuthLayout from '../../components/layouts/AuthLayout'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async ({ email }) => {
    // Always show success, regardless of whether the email exists, to avoid leaking
    // which addresses are registered.
    await resetPassword(email)
    setSent(true)
  }

  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a reset link">
      {sent ? (
        <div className="alert alert-success">
          If an account exists for that email, a reset link has been sent.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register('email')}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <p className="text-center small text-muted mt-3 mb-0">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
