import { useMemo, useState } from "react"
import { register } from "../lib/auth"
import { mapRegisterError } from "../utils/authErrors"

type UseRegisterFormOptions = {
  onSuccess?: () => void
}

export function useRegisterForm(options: UseRegisterFormOptions = {}) {
  const { onSuccess } = options
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword && password.length >= 6
  const canSubmit = useMemo(
    () => email.trim().length > 0 && username.trim().length >= 3 && passwordsMatch && !loading,
    [email, username, passwordsMatch, loading],
  )

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      await register({ email, username, password })
      onSuccess?.()
    } catch (err) {
      setError(mapRegisterError(err))
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPwd,
    toggleShowPwd: () => setShowPwd((v) => !v),
    showConfirmPwd,
    toggleShowConfirmPwd: () => setShowConfirmPwd((v) => !v),
    passwordsMatch,
    canSubmit,
    loading,
    error,
    submit,
  }
}
