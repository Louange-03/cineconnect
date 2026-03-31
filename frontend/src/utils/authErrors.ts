export function mapLoginError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? "")

  if (message.includes("Identifiants incorrects")) {
    return "Adresse e-mail ou mot de passe incorrect."
  }
  if (message.includes("Données invalides")) {
    return "Veuillez remplir tous les champs correctement."
  }
  if (message.includes("Erreur serveur")) {
    return "Erreur serveur, veuillez réessayer plus tard."
  }
  return message || "Erreur lors de la connexion."
}

export function mapRegisterError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? "")

  if (message.includes("déjà utilisé")) {
    return "Email ou nom d'utilisateur déjà utilisé."
  }
  if (message.includes("Données invalides")) {
    return "Veuillez remplir tous les champs correctement."
  }
  if (message.includes("Erreur serveur")) {
    return "Erreur serveur, veuillez réessayer plus tard."
  }
  return message || "Erreur lors de l'inscription."
}
