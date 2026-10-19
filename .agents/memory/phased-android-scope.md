---
name: Phased Android scope
description: User-confirmed Android behavior and boundaries of the phased wallpaper work.
---

Preserve the simplified, user-facing Phase 4 notification Settings UI and its permission behavior during selection work.

**Why:** The user confirmed notification behavior works on Android, rejected technical permission rows as clutter, and explicitly excluded changes to notification Settings and permissions from Phase 5.

**How to apply:** Keep system permission checks behind the scenes; do not reintroduce technical status rows as part of feed or date-selection changes.

Phase 5 concerns foreground local-date selection consistency only, not native background updates, manual Set Wallpaper, or a developer testing panel.

**Why:** The user explicitly reserved these capabilities for separate phases.

**How to apply:** Refresh in-app data on date changes and resume without adding native wallpaper application, background scheduling, or new developer controls.

For Phase 6 developer testing, use actual feed records and the real selection/notification paths. Never retime the production feed or fabricate successful results to make date tests appear to pass.

**Why:** The user explicitly requires real tests, and the current feed can legitimately return the same final release for yesterday, today, and tomorrow after its schedule ends.

**How to apply:** Offer covered custom dates and Clear Override in developer builds only. Distinguish browser/unit evidence from Android lifecycle and native-delivery verification.
