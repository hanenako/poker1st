/**
 * POST /api/admin/upload
 * 이미지 파일을 S3에 업로드하고 URL을 반환합니다.
 * multipart/form-data: { file: File, folder?: string }
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const {
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion,
    awsS3Bucket,
    awsS3BaseUrl
  } = config

  if (!awsAccessKeyId || !awsSecretAccessKey || !awsS3Bucket) {
    throw createError({ statusCode: 503, statusMessage: 'S3 설정이 없습니다. .env를 확인해주세요.' })
  }

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: '파일이 없습니다.' })
  }

  const filePart = parts.find(p => p.name === 'file')
  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: '파일 필드가 없습니다.' })
  }

  const folderPart = parts.find(p => p.name === 'folder')
  const folder     = folderPart?.data?.toString() || 'uploads'

  const ext      = extname(filePart.filename).toLowerCase() || '.jpg'
  const key      = `${folder}/${randomUUID()}${ext}`
  const mimeType = filePart.type || 'image/jpeg'

  const s3 = new S3Client({
    region:      awsRegion || 'ap-northeast-1',
    credentials: {
      accessKeyId:     awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey
    }
  })

  await s3.send(new PutObjectCommand({
    Bucket:      awsS3Bucket,
    Key:         key,
    Body:        filePart.data,
    ContentType: mimeType,
  }))

  const baseUrl = awsS3BaseUrl || `https://${awsS3Bucket}.s3.${awsRegion || 'ap-northeast-1'}.amazonaws.com`
  const url     = `${baseUrl}/${key}`

  return { url }
})
