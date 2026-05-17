// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['nuxt-auth-utils', 'nuxt-simple-sitemap'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://pokertripjp.com'
  },

  sitemap: {
    // 동적 URL은 API 라우트로 자동 크롤, 정적 라우트는 자동 감지
    sources: ['/api/__sitemap__/urls']
  },

  runtimeConfig: {
    // 서버 전용 (클라이언트에 노출 안 됨)
    awsAccessKeyId:     '',   // AWS_ACCESS_KEY_ID
    awsSecretAccessKey: '',   // AWS_SECRET_ACCESS_KEY
    awsRegion:          '',   // AWS_REGION
    awsS3Bucket:        '',   // AWS_S3_BUCKET
    awsS3BaseUrl:       '',   // AWS_S3_BASE_URL

    public: {
      umamiScriptUrl:    '',    // NUXT_PUBLIC_UMAMI_SCRIPT_URL
      umamiWebsiteId:    '',    // NUXT_PUBLIC_UMAMI_WEBSITE_ID
      umamiShareUrl:     '',    // NUXT_PUBLIC_UMAMI_SHARE_URL
      googleOAuthReady:  !!process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID  // Google 설정 여부
    }
  },

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      titleTemplate: '%s | PokerTripJP',
      htmlAttrs: { lang: 'ko' },
      script: [
        {
          // 다크모드 깜박임 방지 — 렌더 전에 동기적으로 실행
          innerHTML: `!function(){try{var s=localStorage.getItem('colorMode'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;(s==='dark'||null===s&&d)&&document.documentElement.classList.add('dark')}catch(e){}}()`,
          type: 'text/javascript'
        }
      ],
      meta: [
        { name: 'description', content: '일본 포커 대회 일정과 현지 포커룸 정보 — 한국 플레이어를 위한 통합 가이드' },
        { property: 'og:site_name', content: 'PokerTripJP' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/og-image.png' }
      ]
    }
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    plugins: [
      tailwindcss()
    ]
  }
})
