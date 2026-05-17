export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return

  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (user.value?.role !== 'ADMIN') {
    return navigateTo('/')
  }
})
