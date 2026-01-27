# AI Work Log

### [2026-01-16] í™˜ê²½ ë³€ìˆ˜ ì„¤ì • ì˜¤ë¥˜ ìˆ˜ì •

- **ìž‘ì—… ë‚´ìš©:** `.env.local` íŒŒì¼ ë‚´ í™˜ê²½ ë³€ìˆ˜ ëª…ì¹­ ë¶ˆì¼ì¹˜(`NAVER_MAP_CLIENT_SECRET`) ìˆ˜ì •. ë³´ì•ˆì„ ìœ„í•´ Secret Keyì˜ `NEXT_PUBLIC_` ì ‘ë‘ì‚¬ ì œê±°.
- **ë³€ê²½ íŒŒì¼:** `.env.local`
- **ë‹¤ìŒ ê³„íš:** ì„œë²„ ìž¬ì‹œìž‘ í›„ ë„¤ì´ë²„ ì§€ë„ API ì •ìƒ ë™ìž‘ í™•ì¸
- **ë¹„ê³ :** `npm run dev` ìž¬ì‹œìž‘ í•„ìš”

### [2026-01-16] ìž‘ì—… ê¸°ë¡ ì´ˆê¸°í™”

- **ìž‘ì—… ë‚´ìš©:** ìž‘ì—… ë¡œê·¸ íŒŒì¼ì´ ì—†ì–´ ìƒˆë¡œ ìƒì„±í•¨.
- **ë³€ê²½ íŒŒì¼:** AI_WORK_LOG.md
- **ë‹¤ìŒ ê³„íš:** í™˜ê²½ ë³€ìˆ˜ ì˜¤ë¥˜ ìˆ˜ì • ë° ë„¤ì´ë²„ ì§€ë„ API ì—°ë™ í™•ì¸
- **ë¹„ê³ :** .env.local ì„¤ì • ì˜¤ë¥˜ ë””ë²„ê¹… ì¤‘

### [2026-01-19] ì§€ì—­ ì½”ë“œ ì‹¬í™” ê²€ìƒ‰ êµ¬í˜„ (ì‹œêµ°êµ¬ ëŒ€ì‘)
- **ìž‘ì—… ë‚´ìš©:** area-codes.tsì— findRegionCodes í•¨ìˆ˜ ì¶”ê°€(ì§€ì—­ëª…/ì‹œêµ°êµ¬ëª… ìž¬ê·€ ê²€ìƒ‰), actions.ts ì¿¼ë¦¬ ë¡œì§ ê³ ë„í™”(ì‹œêµ°êµ¬ ì½”ë“œ ìžë™ ë§¤í•‘), ì˜¤íƒ€ ìˆ˜ì •(ì¶•ë¶• -> ì¶©ë¶)
- **ë³€ê²½ íŒŒì¼:** src/lib/area-codes.ts, src/lib/actions.ts
- **ë‹¤ìŒ ê³„íš:** í†µí•© í…ŒìŠ¤íŠ¸ ë° ì¿¼ë¦¬ ì •í™•ë„ í™•ì¸

### [2026-01-27] ¸ÞÀÎ ÆäÀÌÁö Çì´õ ¹× È÷¾î·Î ¼½¼Ç µðÀÚÀÎ °³Æí
- **ÀÛ¾÷ ³»¿ë:** µðÀÚÀÎ ½Ã½ºÅÛ(»ö»ó, ÆùÆ®, ·¹ÀÌ¾Æ¿ô) Àû¿ë, Tailwind ¼³Á¤ ¾÷µ¥ÀÌÆ®, Header ¹× HeroSection ÄÄÆ÷³ÍÆ® Àü¸é ¼öÁ¤(2ÄÃ·³ ·¹ÀÌ¾Æ¿ô, ÀÎÅÍ·¢Æ¼ºê ¿ä¼Ò Ãß°¡).
- **º¯°æ ÆÄÀÏ:** 	ailwind.config.ts, src/app/layout.tsx, src/components/layout/Header.tsx, src/components/home/HeroSection.tsx, docs/design_system.md (+1 deleted)
- **´ÙÀ½ °èÈ¹:** ¸ÞÀÎ ÆäÀÌÁö ¹ÝÀÀÇü È®ÀÎ ¹× Ãß°¡ ¾Ö´Ï¸ÞÀÌ¼Ç °íµµÈ­
- **ºñ°í:** HeroSection.module.scss Á¦°ÅÇÔ.

### [2026-01-27] ¸ÞÀÎ ÆäÀÌÁö Çì´õ ¹× È÷¾î·Î ¼½¼Ç SCSS ¸®ÆÑÅä¸µ
- **ÀÛ¾÷ ³»¿ë:** Tailwind CSS ±â¹ÝÀÇ ½ºÅ¸ÀÏÀ» SCSS Module·Î Àü¸é ±³Ã¼. _variables.scss¿¡ µðÀÚÀÎ ÅäÅ« Á¤ÀÇ ¹× ÄÄÆ÷³ÍÆ®º° ½ºÅ¸ÀÏ ºÐ¸®.
- **º¯°æ ÆÄÀÏ:** src/styles/_variables.scss, src/components/layout/Header.module.scss (New), src/components/home/HeroSection.module.scss (New), src/components/layout/Header.tsx, src/components/home/HeroSection.tsx`n- **ºñ°í:** Sass Áßº¹ °æ°í(darken)´Â ±âÁ¸ ÆÄÀÏ(style.scss)¿¡ Á¸Àç, ÀÌ¹ø ¸®ÆÑÅä¸µ¿¡´Â color.adjust µîÀ» »ç¿ëÇÏ¿© ÃÖ½Å ¹®¹ý ÁØ¼ö.

### [2026-01-27] µðÀÚÀÎ ½Ã½ºÅÛ °¡ÀÌµå ºÐ¼® ¹× Àû¿ë
- **ÀÛ¾÷ ³»¿ë:** ¿ÜºÎ Design System Guide¸¦ ºÐ¼®ÇÏ¿© docs/design_system.md ¹®¼­È­. _variables.scss¿¡ ±×¶óµð¾ðÆ® ¹× ±×¸²ÀÚ º¯¼ö ¾÷µ¥ÀÌÆ®, HeroSection ÄÄÆ÷³ÍÆ®(ÀÔ·ÂÃ¢, Ä«µå)¸¦ µðÀÚÀÎ ½ºÆå(56px height, pill shape)¿¡ ¸ÂÃç Á¤¹Ð ¼öÁ¤.
- **º¯°æ ÆÄÀÏ:** docs/design_system.md (New), src/styles/_variables.scss, src/components/home/HeroSection.module.scss`n- **ºñ°í:** Tailwind -> SCSS ¸®ÆÑÅä¸µ ÈÄ µðÀÚÀÎ µðÅ×ÀÏ ¾÷±×·¹ÀÌµå ¿Ï·á.
