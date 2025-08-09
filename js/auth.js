export async function login(auth, provider, allowedEmails, onSuccess) {
  const result = await signInWithPopup(auth, provider);
  const email = result.user.email;
  if (!allowedEmails[email]) {
    alert("❌ Accès refusé");
    return null;
  }
  onSuccess(result.user);
  return result.user;
}

export async function logout(auth, onSignOut) {
  await auth.signOut();
  onSignOut();
}

