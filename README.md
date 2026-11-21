# Pixel Perfect Replay

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/24509ac9-d4d6-4136-8ecd-07d2c1290102).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Agent Skills

المشروع يحتوي على **133 مهارة**. المهارة هي ملف تعليمات متخصص يقود المساعد أثناء تنفيذ نوع معين من المهام، وليس مكتبة أو dependency نضيفه بالكود.

### أين توجد المهارات؟

| الموقع | دوره | هل تعدّله؟ |
| --- | --- | --- |
| `.agents/skills/<skill>/SKILL.md` | المصدر الأساسي الذي يستخدمه VS Code Agent حاليًا. | نعم، هذه النسخة المقترحة لتخصيص المهارات. |
| `.claude/skills/<skill>/SKILL.md` | روابط توافق لـ Claude. معظمها يشير إلى النسخة الموجودة داخل `.agents/skills`. | لا، عدّل الهدف داخل `.agents/skills`. |
| `agent/skills/<skill>/SKILL.md` | نسخة إضافية للـ Agent Skills CLI أو الأدوات الأخرى. | أحيانًا؛ لا تعدل النسختين مستقلتين. |
| `skills-lock.json` | يسجل مصدر كل مهارة، إصدار commit، ومسار التثبيت. | لا تعدله يدويًا عادةً. |

> **الخلاصة:** التزم بـ `.agents/skills` عند إنشاء مهارة أو تعديل تعليماتها. يوجد حالياً في كل مجلد 133 اسم مهارة، وأسماء معظم المهارات داخل `.claude/skills` هي رموز تشير إلى `.agents/skills` وليس نسخًا مستقلة.

### تركيب المهارة

كل مهارة تحتوي أساسًا على:

```text
.agents/skills/skill-name/
├── SKILL.md          # الاسم، الوصف، قواعد الاستخدام، والأمثلة
├── references/       # ملفات مرجعية اختيارية
└── scripts/          # أدوات أو سكربتات اختيارية
```

يعتمد اكتشاف المهارة على قسم YAML في بداية `SKILL.md`:

```yaml
---
name: accessibility
description: Build and audit WCAG 2.2 AA compliant interfaces...
---
```

### المهارات المتاحة

#### تطوير الواجهات وتصميمها

| المهارة | استخدامها |
| --- | --- |
| `accessibility` | WCAG، لوحة المفاتيح، ARIA، التركيز والتباين. |
| `asset-manager` | تنظيم الصور والخطوط وأصول المشروع. |
| `brand-designer` | الهوية اللونية والشعار والعلامة التجارية. |
| `css-animation-patterns` | التحريك والانتقالات وMotion بـ CSS. |
| `design-system` | Tokens والمكوّنات والتوكنز والثيمات. |
| `figma-developer` | استخراج تصميمات Figma وتحويلها إلى React/CSS. |
| `frontend-builder` | إنشاء واجهات React وNext.js وبنية المكوّنات. |
| `icon-design` | اختيار واستخدام Lucide أو Heroicons أو Phosphor. |
| `motion` | Gestures وscroll وspring وmicro-interactions. |
| `react-error-handling` | Error Boundaries وحالات الاسترجاع. |
| `react-patterns` | Hooks والمكونات وReact Server Components. |
| `react-performance` | Memoization وbundle splitting وإزالة re-renders. |
| `responsive-images` | srcset وlazy loading وformats حديثة. |
| `shadcn-ui` | مكوّنات Radix/shadcn وTailwind وReact. |
| `storybook-stories` | Storybook وCSF3 وinteraction tests. |
| `tailwind` | Tailwind CSS v4 والثيمات والـ variants. |
| `threejs` | مشاهد 3D وWebGPU وReact Three Fiber. |
| `tiptap` | محررات Rich Text وملحقات ProseMirror. |
| `ui-ux-polish` | تحسين بصري وتجارب الاستخدام وتفاصيل الاستجابة. |
| `usability-tester` | اختبار المهام وإيجاد الاحتكاكات في UX. |
| `ux-designer` | الرحلات والتدفقات والأرشفة والمشكلات التصاميمية. |
| `hydration-guardian` | تشخيص ومطابقة SSR وhydration بـ React. |
| `react-email` | قوالب رسائل React responsive. |

#### React وTanStack

| المهارة | استخدامها |
| --- | --- |
| `tanstack-router` | مسارات TanStack والـ loaders والـ search params والحماية. |
| `tanstack-start` | Full-stack React وSSR وserver functions. |
| `tanstack-query` | Server state والتخزين والـ mutations والـ hydration. |
| `tanstack-form` | الحقول المعقدة والتحقق والـ arrays والـ submission. |
| `tanstack-table` | الجداول والفرز والفلترة والتقسيم والصفوف الافتراضية. |
| `tanstack-store` | State مشترك وderived state وsubscriptions. |
| `tanstack-db` | قاعدة تفاعلية على العميل ومutations متفائلة. |
| `tanstack-devtools` | Debug لـ Query وRouter وForm. |
| `tanstack-hotkeys` | اختصارات لوحة المفاتيح وPlatform-aware shortcuts. |
| `tanstack-pacer` | Throttle وdebounce وrate limiting وqueuing. |
| `tanstack-virtual` | Virtualization للقوائم والجداول والـ grids. |
| `tanstack-cli` | إعدادات TanStack وبناء المكتبات والإضافات. |
| `zustand` | Zustand stores والـ persist والـ selectors والـ SSR. |

#### Backend والبيانات

| المهارة | استخدامها |
| --- | --- |
| `api-testing` | اختبار REST APIs بـ Vitest/MSW/supertest. |
| `application-security` | OWASP وauth والـ threat modeling وsecure coding. |
| `database-security` | RLS وSupabase/Postgres والـ audit logging. |
| `db-enforcer` | تصميم قاعدة بيانات وصحـة migrations وconstraints. |
| `drizzle-orm` | Schemas وrelations وqueries وdrizzle-kit. |
| `electricsql` | مزامنة Postgres على الـ shape والـ partial replication. |
| `better-auth` | Social login و2FA وorganizations وsessions. |
| `hono` | APIs وmiddleware على Cloudflare وBun وNode. |
| `trpc` | routers وprocedures وmiddleware وsubscriptions. |
| `openapi` | مواصفات REST وschemas وdocumentation. |
| `pglite` | Postgres embedded داخل المتصفح أو Node. |
| `pino-logging` | سجلات JSON وcorrelation وredaction وtransports. |
| `postgres-tuning` | Indexes وEXPLAIN وautovacuum والاتصال والـ partitioning. |
| `rag-implementer` | Chunking وembeddings وvector search وRAG. |
| `knowledge-base-manager` | تصميم وحوكمة قواعد المعرفة. |
| `knowledge-graph-builder` | Ontologies وentity extraction وknowledge graphs. |
| `realtime-sync` | WebTransport وpub/sub وCRDT والتدفقات الحية. |
| `turso` | libSQL وTurso وembedded replicas وper-tenant DB. |
| `valkey` | Cache وsessions وpub/sub وdistributed locks. |
| `arktype-validation` | Schemas وtype-safe validation بـ ArkType. |
| `zod-validation` | Schemas وcoercion وtransforms وtype inference بـ Zod. |
| `local-first` | Architecture وsync وstorage وconflict resolution. |

#### الاختبارات والجودة والأمان

| المهارة | استخدامها |
| --- | --- |
| `vitest-testing` | Unit/component/integration tests بـ Vitest. |
| `e2e-testing` | بنية اختبارات Playwright وPOM وCI. |
| `playwright` | Browser automation وscreenshots وscraping. |
| `test-driven-development` | Red-green-refactor واختبار قبل الكود. |
| `quality-auditor` | مراجعة جودة وتدقيق أبعاد الكود الـ12. |
| `secure-ai` | تأمين LLM وMCP وprompt injection وتسريب البيانات. |
| `destructive-command-guard` | منع الأوامر الخطرة في Git وCLI. |
| `application-security` | مراجعة أمان التطبيق والثغرات والتكوينات. |
| `database-security` | مراجعة صلاحيات وحماية قاعدة البيانات. |

#### DevOps والنشر

| المهارة | استخدامها |
| --- | --- |
| `ci-cd-architecture` | CI/CD وOIDC وartifacts وDocker. |
| `github-actions` | Workflows وmatrix وcache وsecrets وreleases. |
| `deployment-strategy` | Blue-green وcanary وrolling وrollback. |
| `docker` | Dockerfiles وCompose وhealth checks والأمان. |
| `cloudflare` | Workers وKV وD1 وR2 وPages. |
| `coolify` | نشر التطبيقات وقواعد البيانات عبر Coolify. |
| `vercel-deployment` | Vercel وrewrites وdomains وedge functions. |
| `amazon-web-services` | AWS وLambda وS3 وDynamoDB وIAM وCDK. |
| `opentofu` | Terraform/OpenTofu وstate وmodules وPulumi. |
| `tauri` | تطبيق سطح مكتب أو هاتف بـ Tauri وRust. |
| `service-worker` | Cache وoffline وbackground sync وpush. |
| `chrome-devtools` | تشغيل وتسلق وفحص صفحات Chrome. |
| `github-cli` | PR وissues وActions وreleases بـ `gh`. |
| `git-workflow` | Branching وcommits وPR وstacked changes. |
| `repo-updater` | مزامنة عدة repos ومراجعة التغييرات. |

#### التوثيق والمحتوى والتشغيل

| المهارة | استخدامها |
| --- | --- |
| `technical-docs` | README وAPI docs وADRs وrunbooks. |
| `mermaid-diagrams` | Sequence وERD وflowchart وgitgraph بـ Mermaid. |
| `de-slopify` | إزالة الأسلوب الاصطناعي من الكود والـ docs. |
| `content-humanizer` | تحسين نبرة النصوص والإيقاع والوضوح. |
| `tldr-expert` | تلخيص PR والتغييرات والاجتماعات والملاحظات. |
| `codebase-packager` | ضغط سياق المشروع للبحث وفهم التبعيات. |
| `agent-session-search` | البحث في تاريخ جلسات Coding Agents. |
| `seo-optimizer` | Schema وE-E-A-T والـ snippets والـ topical authority. |
| `localization-engineer` | i18n وRTL وICU والتواريخ والـ currencies. |
| `pdf-tools` | استخراج وتعديل وملء وإنشاء PDFs. |
| `data-visualizer` | Dashboards وcharts وvisual storytelling. |
| `resend` | إرسال رسائل عبر Resend وReact Email. |
| `stripe-integration` | Checkout وSubscriptions وwebhooks وbilling. |
| `scrum-conductor` | Standups وsprint ceremonies والـ backlog. |
| `trekker` | تتبع Tasks وdependencies وhistory بـ Trekker. |
| `beads` | تتبع Beads والمهام والحواجز. |
| `beads-viewer` | تحليل dependency graph وPageRank والـ blockers. |
| `beads-workflow` | تحويل Plans إلى beads قابلة للتنفيذ. |

#### الأدوات والإطارات الأخرى

| المهارة | استخدامها |
| --- | --- |
| `agent-patterns` | تصميم multi-agent وتوزيع المهام وفشل التنسيق. |
| `agent-standards` | قواعد السلوك والإدارة وإدارة السياق للوكلاء. |
| `expert-instruction` | كتابة system prompts وinstructions وguardrails. |
| `prompt-engineering` | CoT وReAct وfew-shot وagent workflows. |
| `orchestration` | تنظيم المهارات والمراحل والتغييرات المتعددة. |
| `plan-first-development` | خطط Markdown وphases والتخطيط متعدد الجلسات. |
| `tracer-bullets` | بناء feature كاملة كـ vertical end-to-end slice. |
| `find-skills` | اكتشاف مهارة جديدة وتثبيتها من ecosystem. |
| `skill-management` | إدارة وقواعد المهارات المثبتة. |
| `mcp-expert` | بناء MCP servers وأدوات وتكوين transport وOAuth. |
| `bun-runtime` | Bun server وSQLite وbuild وtest وpackage manager. |
| `pnpm-workspace` | Monorepos وworkspaces وfilters وcatalogs. |
| `turborepo` | Pipelines وcache وCI وpackage boundaries. |
| `vite` | Vite config وplugins وSSR وbuild optimization. |
| `tsdown` | Bundling وdts ومكتبات TypeScript للنشر. |
| `package-publishing` | npm exports وdual ESM/CJS وprovenance. |
| `changesets` | Semver وchangelogs وmonorepo releases. |
| `mise` | Tool versions وenvironment وtasks بـ mise. |
| `ghostty` | إعداد Ghostty وthemes وkeybindings. |
| `shell-integration` | Bash/Zsh/Fish وcompletion وsignals وwidgets. |
| `cli-power-tools` | ripgrep وjq وsed وfd وhttpie. |
| `ssh-remote` | SSH وkeys وtunnels وfile transfer. |
| `python-uv` | Python وuv وFastAPI وPydantic وpytest. |
| `rust` | Rust وTokio وSerde وCargo وAxum وCLI. |
| `astro` | Astro وcontent collections وislands وSSR. |
| `svelte` | Svelte 5 وSvelteKit وrunes وform actions. |
| `typescript-patterns` | Generics وnarrowing وutility types وstrict mode. |
| `react-native` | React Native وExpo وnavigation وEAS. |
| `remotion` | فيديوهات React وtransitions وaudio وrendering. |

### كيف يختار المساعد المهارة؟

لا يحتاج كل طلب إلى اسم المهارة. المساعد يقرأ وصف المهارة ويشغّل المهارات المناسبة تلقائيًا من `.agents/skills`.

يمكنك أيضًا طلب مهارة صراحةً:

```text
استخدم accessibility وfrontend-builder وshadcn-ui لتحسين صفحة تسجيل الدخول:
راجع لوحة المفاتيح، ARIA، أسماء الحقول، رسائل الخطأ، التباين، وترتيب التركيز.
نفّذ التحسينات، ثم شغّل الاختبارات المناسبة.
```

أو في مثال على هذا المشروع:

```text
استخدم tanstack-router وtanstack-query لتنفيذ صفحة ملف المستخدم:
أضف route باسم profile.$username.tsx، وحمّل بيانات المستخدم من loader أو Query,
وتعامل مع حالة التحميل والخطأ والـ 404 بدون react-router-dom.
```

التركيز يفضل أن يكون على المهارة الأصلية في `.agents/skills`؛ لا تنسخ المهارات يدويًا بين المجلدات ما لم يكن الغرض دعم أداة أخرى صراحةً.

### إنشاء مهارة جديدة

1. أنشئ `.agents/skills/<skill-name>/SKILL.md`.
2. ابدأ بـ frontmatter يحتوي `name` و`description`.
3. اكتب متى تُستخدم المهارة ومتى لا تُستخدم.
4. أضف خطوات واضحة وأمثلة وأخطأً شائعة واختبارات إن لزم.
5. إن كانت مهارة مثبتة من source خارجي، حدّثها عبر مدير المهارات بدل تعديل `skills-lock.json` يدويًا.
