export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }) {
    // Google 계정으로 유저 찾기 또는 생성
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email:    googleUser.email,
          name:     googleUser.name ?? googleUser.email.split('@')[0],
          avatarUrl: googleUser.picture ?? null,
          provider: 'google',
          role:     'USER'
        }
      })
    } else if (!user.avatarUrl && googleUser.picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data:  { avatarUrl: googleUser.picture }
      })
    }

    await setUserSession(event, {
      user: {
        id:       user.id,
        email:    user.email,
        name:     user.name,
        role:     user.role,
        avatarUrl: user.avatarUrl
      }
    })

    return sendRedirect(event, '/')
  },

  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=google')
  }
})
