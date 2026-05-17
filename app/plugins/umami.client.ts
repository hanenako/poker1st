export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const src = config.public.umamiScriptUrl as string
  const id  = config.public.umamiWebsiteId as string
  if (!src || !id) return

  const script = document.createElement('script')
  script.defer = true
  script.src = src
  script.setAttribute('data-website-id', id)
  document.head.appendChild(script)
})
