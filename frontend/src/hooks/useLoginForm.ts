import { useMemo, useState } from "react"
import { login } from "../lib/auth"
import { mapLoginError } from "../utils/authErrors"

type UseLoginFormOptions = {
  onSuccess?: () => void
}

export function useLoginForm(options: UseLoginFormOptions = {}) {
  const { onSuccess } = options
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0 && !loading,
    [email, password, loading],
  )

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      onSuccess?.()
    } catch (err) {
      setError(mapLoginError(err))
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPwd,
    toggleShowPwd: () => setShowPwd((v) => !v),
    error,
    loading,
    canSubmit,
    submit,
  }
}
