export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId  = (session.user as { id: number }).id

  return prisma.pubReview.findMany({
    where: { userId },
    include: {
      pub: { select: { id: true, slug: true, name: true, city: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
})
