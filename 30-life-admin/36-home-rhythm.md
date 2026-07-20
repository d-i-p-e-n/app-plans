# Home Rhythm — Plan

**One sentence:** The right home maintenance at the right time of year — one quiet monthly batch,
a plain reason for every task, and a maintenance history that follows the house.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** homeowners — especially first-time buyers who inherited systems they don't
  understand (a huge, anxious, searching cohort every year), and owners approaching resale who
  wish they had records.
- **Gap:** incumbents (HomeZada, Dwellin, Centriq-class) are bloated subscription platforms
  bolting on inventory, insurance upsells, and contractor marketplaces. The actual job is a
  knowledgeable friend saying "it's October — do these four things, here's why, takes two
  hours." Nobody ships that quietly.
- **Core loop:** 3-minute home profile → generated seasonal plan → one push per month ("October:
  4 tasks, ≈2 hrs") → check off with optional cost/notes → an accumulated maintenance history
  worth real money at resale.

Non-goals: contractor marketplace/quotes (never — the anti-feature), home inventory for
insurance, project management/renovation planning, smart-home integration, cost databases with
fake precision.

## 2. The task dataset (`packages/domain-home`) — the crown jewel

~60 curated tasks, committed as data with tests. Each task:

```ts
{
  key: 'furnace_filter',
  title: 'Replace furnace filter',
  appliesWhen: { systems: ['forced_air'], homeTypes: ['house','townhouse','condo'] },
  cadenceMonths: 3,           // or seasonWindow: 'early_fall'
  effort: 'diy_easy',         // diy_easy | diy | pro
  minutes: 10,
  why: 'A clogged filter makes heating cost more and wears out the blower motor.',
  neglect: 'Shortened furnace life; $150–600 blower repairs.',
  how: ['Note the size printed on the old filter', 'Arrow on the new filter points toward the furnace', 'Write the date on the frame'],
  source: 'docs/task-sources.md#furnace_filter'
}
```

Coverage: HVAC (filters, pre-season service, condensate line), water (water-heater flush +
anode note, softener, sump pump test + battery, main shutoff exercise, hose bibs before
freeze), exterior (gutters ×2, roof visual, caulk/seal walk, deck seal check, grading check),
safety (smoke/CO test monthly-lite + battery annual, extinguisher check, dryer vent — the fire
statistic in the `why`), seasonal (irrigation blowout by climate band, AC cover debate handled
honestly, fireplace/chimney), appliances (fridge coils, range hood filter, dishwasher filter,
washer hoses). Every `why`/`neglect` sentence sourced in `docs/task-sources.md` (InterNACHI/
insurer/manufacturer references — curated during implementation, no scraping).

**Profile → plan generator (pure, golden-tested):** inputs = home type, climate band (bundled
ZIP3 → {freeze depth: hard/light/none, humid/dry} map), systems checklist (12 yes/no toggles
with photos to help identify: "is your water heater a tank or tankless?"). Output = 12-month
plan with load balancing: hard season windows respected (irrigation blowout before first
freeze for the band), flexible tasks spread so no month exceeds ~4 tasks / ~3 hours; deferrals
reflow the future plan rather than stacking guilt.

## 3. Notifications (the strictest budget in the family)

- **One push per month, total.** First Saturday 09:00 default: "October at {nickname}: 4 tasks,
  about 2 hours. Gutters are the time-sensitive one." Snoozing a month is a first-class action,
  not a failure; skipped tasks reflow.
- Zero per-task nagging. No streaks. A task overdue for a year simply appears in the next
  relevant window with its `neglect` sentence doing the persuasion.
- Exception (opt-in, off): freeze-window tasks may send one extra targeted push when the season
  window is closing ("Last mild weekend to blow out irrigation, most likely").

## 4. Screens

- `/(onboarding)`: promise ("One notification a month. Every task explains itself.") → profile
  (home type, ZIP for climate band, systems checklist with identification photos) → the
  generated year at a glance.
- `/` **This Month:** the batch — task cards with minutes + effort badges; tap → the why /
  neglect / how sheet (this sheet is the product's voice: informative, never preachy);
  check-off with optional cost + note + photo.
- `/year`: 12-month plan grid; drag tasks between adjacent months (respecting hard windows —
  locked ones say why); regenerate after profile edits.
- `/history`: the log — by task, by year, total spent; **export "House Binder" PDF** (property
  nickname, systems, complete dated maintenance history with costs) — the resale/home-sale
  artifact and the app's long-term moat.
- `/settings`: family privacy page, profile editor, notification day/hour, export/import,
  task-source attributions.

## 5. Phases & acceptance criteria

1. **Dataset + generator:** 60 tasks encoded with sources; generator goldens across profile
   matrix (condo/no-yard drops exterior; no-freeze band drops winterization; every profile's
   busiest month ≤4 tasks); reflow-after-deferral tests.
2. **App:** onboarding <3 min; This Month + task sheets; year grid with drag + hard windows.
3. **History + binder:** check-off with cost/photo; House Binder PDF from 3-year fixture
   history (pagination, <20 MB).
4. **Notifications E2E:** monthly batch on device (killed), snooze/reflow, freeze-window
   opt-in path, reboot reconcile.
5. **Release:** EAS, listing (§6), "no data collected."

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Home Rhythm: Maintenance
- **iOS subtitle:** Seasonal home care, no nag
- **iOS keyword field:** home,house,checklist,seasonal,furnace,filter,gutter,reminder,schedule,homeowner,upkeep
- **Play title:** Home Rhythm: Home Maintenance
- **Play short description:** The right home maintenance at the right time. One quiet reminder a month.
- **Keyword targets:** primary "home maintenance schedule", "home maintenance checklist app"; long-tail "first time homeowner maintenance list".
- **Play long description — first two lines:** "Your house needs about two hours a month — the trick is knowing which two hours. Home Rhythm builds a seasonal plan for your actual home and climate, explains why every task matters, and sends exactly one reminder a month."
- **Screenshot story:** October batch ("4 tasks, ≈2 hrs") → a task sheet with why/neglect/how → year grid → House Binder PDF ("records that sell houses").
- **Launch channels:** r/homeowners, r/HomeImprovement, r/FirstTimeHomeBuyer (highest fit — pin content to buying season), home-inspector newsletters (inspectors love handing clients a maintenance plan; a genuine partnership channel), YouTube home-DIY creators.
- **Review prompt moment:** after completing a full month's batch (accomplishment). Excluded: months with deferred tasks.
- **Pro candidates & anchor:** multiple properties, House Binder PDF, custom tasks beyond 10; one-time $6.99.
- **Web/SEO queries:** "home maintenance schedule by month", "what maintenance does a house need", "furnace filter how often", "home maintenance app without subscription". The task dataset doubles as SEO content: publish the seasonal checklist as web pages (each links to the app).

## 7. Risks

- Dataset quality is the entire product — the `docs/task-sources.md` sourcing pass is a real
  research phase, not an afterthought; wrong cadences (e.g., water-heater flush claims) get
  called out by tradespeople in reviews.
- Guilt-spiral UX is how every competitor dies (red overdue lists → app deleted) — the
  reflow-not-stack rule and no-per-task-nagging budget are acceptance criteria, not vibes.
- Climate-band map oversimplification — keep bands coarse (freeze/no-freeze × humid/dry) and
  let hard windows be user-adjustable; never pretend ZIP-level precision.
