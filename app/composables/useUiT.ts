/**
 * UI 텍스트 다국어 번역 composable
 * 데이터(대회명·주소 등)가 아닌 UI 레이블·버튼·빈 상태 메시지 등에 사용
 */
export function useUiT() {
  const { locale } = useLocale()

  const ui = computed(() => {
    const ja = locale.value === 'ja'
    const en = locale.value === 'en'

    return {
      // ── 공통 ──────────────────────────────────────────────
      loading:   ja ? '読み込み中...' : en ? 'Loading...'     : '로딩 중...',
      cancel:    ja ? 'キャンセル'    : en ? 'Cancel'          : '취소',
      delete:    ja ? '削除'          : en ? 'Delete'          : '삭제',
      deleting:  ja ? '削除中...'     : en ? 'Deleting...'     : '삭제 중...',
      saving:    ja ? '保存中...'     : en ? 'Saving...'       : '저장 중...',
      submit:    ja ? '投稿'          : en ? 'Submit'          : '등록',
      retry:     ja ? '再試行'        : en ? 'Retry'           : '다시 시도',
      anonymous: ja ? '匿名'          : en ? 'Anonymous'       : '익명',

      // 영업 상태 (useIsOpen 에서도 사용)
      open:        ja ? '営業中'    : en ? 'Open'         : '영업 중',
      closedToday: ja ? '本日定休'  : en ? 'Closed today' : '오늘 휴무',
      closed:      ja ? '営業終了'  : en ? 'Closed'       : '영업 종료',

      // 요일
      days:     ja ? ['日','月','火','水','木','金','土']
                   : en ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
                   :       ['일','월','화','수','목','금','토'],
      daysFull: ja ? ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日']
                   : en ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
                   :       ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],

      // ── 펍 상세 ───────────────────────────────────────────
      pubInfo:        ja ? '情報'              : en ? 'Info'                    : 'Info',
      pubAddress:     ja ? '住所'              : en ? 'Address'                 : 'Address',
      pubPhone:       ja ? '電話'              : en ? 'Phone'                   : 'Phone',
      pubMap:         ja ? 'Google マップで開く ↗' : en ? 'Open in Google Maps ↗' : 'Google 지도로 열기 ↗',
      pubAccess:      ja ? 'アクセス'           : en ? 'Access'                  : '가는 방법',
      pubWalk:        (min: number) => ja ? `徒歩 ${min}分` : en ? `${min} min walk` : `도보 ${min}분`,
      pubHours:       ja ? '営業時間'          : en ? 'Hours'                   : 'Hours',
      pubNoHours:     ja ? '営業時間情報なし'  : en ? 'No hours info'           : '영업시간 정보 없음',
      pubHolidayNote: ja ? '※ 日本の祝日や店舗の都合により、営業時間が変更される場合があります。'
                         : en ? '※ Hours may vary on Japanese public holidays or due to store circumstances.'
                         :       '※ 일본 공휴일 또는 가게 사정에 의해 영업시간이 변경될 수 있습니다.',
      pubGallery:     ja ? 'ギャラリー'        : en ? 'Gallery'                 : 'Gallery',
      pubMedia:       ja ? 'メディア'          : en ? 'Media'                   : 'Media',
      pubNotFound:    ja ? 'PokerRoom が見つかりません。'
                         : en ? 'PokerRoom not found.'
                         :       'PokerRoom을 찾을 수 없습니다.',

      // ── 리뷰 ──────────────────────────────────────────────
      reviews:           ja ? 'レビュー'              : en ? 'Reviews'              : '리뷰',
      writeReview:       ja ? 'レビューを書く'          : en ? 'Write a Review'       : '리뷰 작성',
      nickname:          ja ? 'ニックネーム'            : en ? 'Nickname'             : '닉네임',
      nicknamePh:        ja ? 'ニックネーム'            : en ? 'Nickname'             : '닉네임',
      password:          ja ? 'パスワード'              : en ? 'Password'             : '비밀번호',
      passwordPh:        ja ? '削除時に使用'            : en ? 'Required for deletion' : '삭제 시 필요',
      passwordModalPh:   ja ? 'パスワード'              : en ? 'Password'             : '비밀번호',
      rating:            ja ? '評価'                    : en ? 'Rating'               : '별점',
      ratingHint:        ja ? '1項目以上必須'             : en ? 'At least 1 required'  : '1항목 이상 필수',
      ratingAtmosphere:  ja ? '雰囲気'                   : en ? 'Atmosphere'           : '분위기',
      ratingDealer:      ja ? 'ディーラー'                : en ? 'Dealer'               : '딜러',
      ratingWait:        ja ? '待ち時間'                  : en ? 'Wait time'            : '대기시간',
      ratingValue:       ja ? 'コスパ'                   : en ? 'Value'                : '가성비',
      titleOpt:          ja ? 'タイトル（任意）'         : en ? 'Title (optional)'     : '제목 (선택)',
      titlePh:           ja ? '一言コメント'             : en ? 'One-line summary'     : '한 줄 요약',
      bodyOpt:           ja ? '内容（任意）'             : en ? 'Content (optional)'   : '내용 (선택)',
      bodyPh:            ja ? 'ポーカールームの体験を共有してください'
                            : en ? 'Share your experience'
                            :       '포커룸 경험을 공유해주세요',
      noReviews:         ja ? 'まだレビューがありません。最初のレビューを書いてみましょう！'
                            : en ? 'No reviews yet. Be the first to write one!'
                            :       '아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!',
      deleteReview:      ja ? 'レビューを削除'
                            : en ? 'Delete Review'
                            :       '리뷰 삭제',
      deleteAdminNote:   ja ? '管理者権限で削除します。'
                            : en ? 'Deleting with admin rights.'
                            :       '어드민 권한으로 삭제합니다.',
      deletePasswordNote:ja ? '投稿時に入力したパスワードを入力してください。'
                            : en ? 'Enter the password you used when posting.'
                            :       '작성 시 입력한 비밀번호를 입력해주세요.',

      // ── 펍 목록 ───────────────────────────────────────────
      all:         ja ? '全て'    : en ? 'All'       : '전체',
      openNow:     ja ? '営業中'  : en ? 'Open Now'  : '영업 중',
      allGames:    ja ? '全ゲーム': en ? 'All Games' : '전체 게임',
      gridView:    ja ? '⊞ カード': en ? '⊞ Cards'  : '⊞ 카드',
      mapView:     ja ? '⊙ マップ': en ? '⊙ Map'    : '⊙ 지도',
      mapLoading:  ja ? '地図を読み込み中...' : en ? 'Loading map...' : '지도 로딩 중...',
      noPubsFound: ja ? '条件に合う PokerRoom がありません。'
                      : en ? 'No PokerRooms match your filters.'
                      :       '조건에 맞는 포커룸이 없습니다.',
      roomsCount:  (n: number) => ja ? `全 ${n} 件` : en ? `${n} room${n !== 1 ? 's' : ''}` : `총 ${n}곳`,

      // ── 토너먼트 상세 ──────────────────────────────────────
      period:        ja ? '期間'       : en ? 'Period'         : '기간',
      location:      ja ? '場所'       : en ? 'Location'       : '장소',
      venue:         ja ? '会場'       : en ? 'Venue'          : '베뉴',
      timezone:      ja ? 'タイムゾーン': en ? 'Timezone'       : 'Timezone',
      eventSchedule: ja ? 'イベントスケジュール' : en ? 'Event Schedule' : '이벤트 일정',
      noEvents:      ja ? 'まだイベントが登録されていません。'
                        : en ? 'No events registered yet.'
                        :       '아직 등록된 이벤트가 없습니다.',
      date:          ja ? '日付'       : en ? 'Date'           : '날짜',
      eventCol:      ja ? 'イベント'   : en ? 'Event'          : '이벤트',
      game:          ja ? 'ゲーム'     : en ? 'Game'           : '게임',
      format:        ja ? 'フォーマット': en ? 'Format'         : '포맷',
      regTime:       ja ? '受付時間'   : en ? 'Reg. Time'      : '등록 시간',
      regClose:      ja ? '受付締切'   : en ? 'Reg. Close'     : '등록 마감',
      startingStack: ja ? 'スタック'   : en ? 'Stack'          : '스타팅 스택',
      levelDuration: ja ? 'レベル時間' : en ? 'Level'          : '레벨 시간',
      reEntry:       ja ? 'リエントリー': en ? 'Re-entry'       : '리엔트리',
      inPrize:       ja ? 'イン・ザ・マネー' : en ? 'In the Money'  : '상금권',
      nextDayPct:    ja ? '翌日進出'   : en ? 'Next Day %'     : '익일 진출',
      notes:         ja ? 'メモ'       : en ? 'Notes'          : '메모',
      tags:          ja ? 'タグ'       : en ? 'Tags'           : '태그',
      results:       ja ? '🏆 結果'    : en ? '🏆 Results'     : '🏆 결과',
      overallResults:ja ? '🏆 大会総合結果' : en ? '🏆 Overall Results' : '🏆 대회 종합 결과',
      place:         ja ? '順位'       : en ? 'Place'          : '순위',
      player:        ja ? 'プレイヤー' : en ? 'Player'         : '플레이어',
      country:       ja ? '国籍'       : en ? 'Country'        : '국적',
      prize:         ja ? '賞金'       : en ? 'Prize'          : '상금',
      eventsTotal:   (n: number) => ja ? `全 ${n} イベント` : en ? `${n} event${n !== 1 ? 's' : ''} total` : `총 ${n}개 이벤트`,
      tournamentNotFound: ja ? '大会が見つかりません。' : en ? 'Tournament not found.' : '대회를 찾을 수 없습니다.',
      noTournaments: ja ? 'まだ大会が登録されていません。' : en ? 'No tournaments yet.' : '아직 등록된 대회가 없습니다.',

      // ── 스케줄 ────────────────────────────────────────────
      allBrands:     ja ? '全ブランド'  : en ? 'All Brands'  : '전체 브랜드',
      allCities:     ja ? '全都市'      : en ? 'All Cities'  : '전체 도시',
      reset:         ja ? 'リセット'    : en ? 'Reset'       : '초기화',
      listView:      ja ? '☰ リスト'   : en ? '☰ List'      : '☰ 목록',
      calendarView:  ja ? '◫ カレンダー': en ? '◫ Calendar'  : '◫ 달력',
      prevMonth:     ja ? '‹ 前月'      : en ? '‹ Prev'      : '‹ 이전',
      nextMonth:     ja ? '次月 ›'      : en ? 'Next ›'      : '다음 ›',
      noEventsFound: ja ? '条件に合うイベントがありません。' : en ? 'No events match your filters.' : '조건에 맞는 이벤트가 없습니다.',
      noEventsMonth: ja ? '今月のイベントはありません。' : en ? 'No events this month.' : '이번 달에 해당하는 이벤트가 없습니다.',
      monthLabel:    (y: number, m: number) =>
        ja ? `${y}年${m + 1}月`
           : en ? new Date(y, m).toLocaleString('en-US', { month: 'long', year: 'numeric' })
           : `${y}년 ${m + 1}월`,
      eventsShowing: (shown: number, total: number) =>
        ja ? `${shown} 件表示中（全 ${total} 件）`
           : en ? `Showing ${shown} of ${total} events`
           : `${shown}개 이벤트 표시 중 (전체 ${total}개)`,
      moreEvents:    (n: number) => ja ? `+${n} 件` : en ? `+${n} more` : `+${n}개`,

      // ── 검색 ──────────────────────────────────────────────
      searchPh:      ja ? '大会名、ポーカールーム名、都市名...' : en ? 'Tournament, poker room, city...' : '대회명, 포커룸명, 도시명...',
      searching:     ja ? '検索中...'      : en ? 'Searching...' : '검색 중...',
      searchError:   ja ? '検索中にエラーが発生しました。'
                        : en ? 'An error occurred during search.'
                        :       '검색 중 오류가 발생했습니다.',
      searchRetryMsg:ja ? 'しばらく経ってから再度お試しください。'
                        : en ? 'Please try again later.'
                        :       '잠시 후 다시 시도해주세요.',
      noSearchResults: (q: string) =>
        ja ? `「${q}」の検索結果がありません。`
           : en ? `No results for "${q}".`
           : `「${q}」에 대한 검색 결과가 없습니다.`,
      searchPrompt:  ja ? '検索キーワードを入力してください。' : en ? 'Enter a keyword to search.' : '검색어를 입력하세요.',

      // ── 브랜드 ────────────────────────────────────────────
      brandNotFound: ja ? 'ブランドが見つかりません。' : en ? 'Brand not found.' : '브랜드를 찾을 수 없습니다.',
      brandsTotal:   (n: number) => ja ? `全 ${n} ブランド` : en ? `${n} brand${n !== 1 ? 's' : ''}` : `총 ${n}개 브랜드`,
      noBrands:      ja ? '登録されたブランドがありません。' : en ? 'No brands found.' : '등록된 브랜드가 없습니다.',

      // ── 공통 Back 링크 ────────────────────────────────────
      backToBrands:      ja ? '← ブランド一覧'    : en ? '← All brands'      : '← All brands',
      backToTournaments: ja ? '← 大会一覧'         : en ? '← All tournaments' : '← All tournaments',
      backToPubs:        ja ? '← PokerRoom 一覧'  : en ? '← All PokerRooms'  : '← All PokerRooms',

      // ── 즐겨찾기 ──────────────────────────────────────────
      favTitle:          ja ? 'お気に入り'          : en ? 'Favorites'           : '즐겨찾기',
      favDesc:           ja ? 'ブックマークした大会' : en ? 'Bookmarked tournaments' : '북마크한 대회 목록',
      favEmpty:          ja ? 'お気に入りがまだありません。'
                            : en ? 'No favorites yet.'
                            :       '아직 즐겨찾기한 대회가 없습니다.',
      browseTournaments: ja ? '大会を見る →'        : en ? 'Browse tournaments →' : '대회 둘러보기 →',

      // ── ICS 캘린더 ────────────────────────────────────────
      subscribeCalendar: ja ? '📅 カレンダー登録'   : en ? '📅 Subscribe Calendar' : '📅 캘린더 구독',

      // ── 환율 ──────────────────────────────────────────────
      exchangeRate:      ja ? '為替レート'           : en ? 'Exchange Rate'       : '환율',
      exchangeUpdated:   ja ? '更新'                 : en ? 'updated'             : '업데이트',

      // ── 가이드 ────────────────────────────────────────────
      guide:             ja ? '参加ガイド'            : en ? 'Guide'              : '참가 가이드',

      // ── 포커룸 비교 ───────────────────────────────────────
      addToCompare:      ja ? '比較に追加'            : en ? 'Add to compare'     : '비교에 추가',
      removeFromCompare: ja ? '比較から削除'           : en ? 'Remove from compare': '비교에서 제거',
      compareReset:      ja ? 'クリア'                : en ? 'Clear'              : '초기화',
      compareNow:        ja ? '比較する'              : en ? 'Compare'            : '비교하기',
      compareTitle:      ja ? 'PokerRoom 比較'        : en ? 'Compare PokerRooms' : '포커룸 비교',
      compareDesc:       ja ? '最大3件のPokerRoomを並べて比較できます。'
                            : en ? 'Compare up to 3 poker rooms side by side.'
                            :       '최대 3개 포커룸을 나란히 비교할 수 있습니다.',
      compareEmpty:      ja ? '比較するPokerRoomが選択されていません。'
                            : en ? 'No poker rooms selected for comparison.'
                            :       '비교할 포커룸이 선택되지 않았습니다.',
      viewDetail:        ja ? '詳細を見る'            : en ? 'View detail'        : '상세 보기',

      // ── 혼잡도 ────────────────────────────────────────────
      congestionTitle:   ja ? '混雑状況'              : en ? 'Congestion'          : '혼잡도',
      congestionNoData:  ja ? 'データなし（2時間以内の報告）'
                            : en ? 'No data (past 2 hrs)'
                            :       '데이터 없음 (최근 2시간)',
      congestionPrompt:  ja ? '現在の混雑度を教えてください：'
                            : en ? 'How busy is it right now?'
                            :       '지금 얼마나 혼잡한가요?',
      congestionQuiet:   ja ? '空いてる'              : en ? 'Quiet'               : '한산',
      congestionNormal:  ja ? '普通'                  : en ? 'Normal'              : '보통',
      congestionBusy:    ja ? '混んでる'              : en ? 'Busy'                : '혼잡',
      congestionSubmit:  ja ? '報告する'              : en ? 'Report'              : '신고',
      congestionThanks:  ja ? 'ご報告ありがとうございます！'
                            : en ? 'Thanks for your report!'
                            :       '신고해주셔서 감사합니다!',
      congestionReports: (n: number) => ja ? `${n}件の報告` : en ? `${n} report${n !== 1 ? 's' : ''}` : `${n}건 신고`,
      congestionJustNow: ja ? 'たった今'              : en ? 'just now'            : '방금',
      congestionMinsAgo: ja ? '分前'                  : en ? ' min ago'            : '분 전',
      congestionHrsAgo:  ja ? '時間前'                : en ? ' hr ago'             : '시간 전',

      // ── 리더보드 ──────────────────────────────────────────
      leaderboard:       ja ? 'リーダーボード'         : en ? 'Leaderboard'        : '리더보드',
      leaderboardDesc:   ja ? '大会結果 ランキング'    : en ? 'Tournament Results Ranking' : '대회 결과 랭킹',
      leaderboardEmpty:  ja ? '結果データがありません。'
                            : en ? 'No results data yet.'
                            :       '아직 결과 데이터가 없습니다.',
      allYears:          ja ? '全年度'                 : en ? 'All Years'           : '전체 연도',
      allTournaments:    ja ? '全大会'                 : en ? 'All Tournaments'     : '전체 대회',
      totalPrize:        ja ? '総賞金'                 : en ? 'Total Prize'         : '총 상금',
      cashes:            ja ? 'キャッシュ数'           : en ? 'Cashes'              : '입상 수',
    }
  })

  return { ui }
}
