# Design Decisions and Visualization Rationale

## Visualization Choices

### Missions Over Time (Area Chart)

I went with an area chart here because the dataset spans 65 years and the primary question is "how has launch activity changed over time?" An area chart makes that trend immediately legible, where the filled region gives a sense of cumulative volume that a bare line chart wouldn't. The gradient fill draws the eye to periods of high activity (the late 1970s Soviet peak, the recent commercial boom) without needing annotations to call them out. I kept the x-axis interval sparse so the labels don't crowd each other.

### Mission Status Breakdown (Donut Chart)

Part-to-whole relationships with a small number of categories (four statuses) are pretty much the textbook case for a donut chart. The center void displays the total mission count, which means users get both the proportions and the absolute number in one glance. I considered a stacked bar, but with only four categories and no time dimension it would've been overcomplicating things. The color assignments are intentional: cyan for success (the dominant outcome, visually calm), red for failure, amber for partial failure, and slate gray for prelaunch failure (only four missions, so it's deliberately muted).

### Top Companies by Mission Count (Horizontal Bar Chart)

This one is a ranked categorical comparison, so horizontal bars with the company name on the left and the count on the right felt like the cleanest approach. Horizontal orientation means company names are fully readable without rotation or truncation, which matters when you're comparing entities like "RVSN USSR" and "General Dynamics." I limited it to the top five to keep the visual focused and paired it with decreasing opacity to reinforce the ranking hierarchy. A vertical bar chart would've worked technically, but rotated labels at the bottom are harder to scan quickly.

### Launches by Decade (Stacked Bar Chart)

The stacked bar groups missions into decades and breaks each decade down by the top five launching countries plus an "Other" bucket. This visualization answers two questions simultaneously: "how has launch volume changed across decades?" and "which countries dominated each era?" You can immediately see Russia's dominance in the 1960s and 1970s, China's emergence in the 2010s, and the US maintaining a consistent presence throughout. I chose decade buckets instead of individual years because country-level composition at yearly granularity would've been too noisy to read. The color palette was carefully sequenced so adjacent countries in the stack are visually distinct (cyan, indigo, purple, amber, teal, slate).

### Success Rate by Company (Horizontal Bar Cards)

This shows success rate percentages for the top ten companies as individual cards with progress bar fills. I went with this over a grouped bar chart because the metric itself (a percentage from 0 to 100) maps naturally to a fill bar, and showing each company in its own row lets you compare rates without stacking visual elements. The company name, percentage, and mission count are all visible without hovering, which means you can scan the full leaderboard in a couple seconds.

## Cross-Filtering Architecture

Every filter (company, mission status, date range, text search) propagates to every visualization, summary card, and table row simultaneously. I split the data fetching into two independent streams: charts and summary statistics only refetch when filters change, while the table has its own fetch cycle for pagination and sorting. This means paginating through the table doesn't cause the entire dashboard to flash and reload, which is the kind of thing that's subtle but immediately noticeable when it's wrong.

## Data Resilience

The documentation states dates are in YYYY-MM-DD format, but the actual CSV uses M/D/YYYY. Rather than hardcoding one format, I built a multi-format date parser that tries US ordering first (matching the dataset convention), then ISO, European, and long-form formats. All eight required functions accept the documented input types but also handle None, empty strings, wrong types, and garbage input without crashing. Every function is wrapped in a try/except that returns a safe default (0, 0.0, or an empty collection). The test suite is data-independent, meaning the tests validate behavior and structural properties rather than hardcoded counts, so they'll pass against any version of the CSV with the same column structure.

## Theme and Interface

The dashboard supports both dark and light modes with consistent color mapping across every component. Status colors (cyan for success, red for failure, amber for partial failure, slate for prelaunch failure) are identical in the donut chart, the fleet status cards, and the table badges. The top-right health indicator is a live ping to the backend's `/api/health` endpoint, polling every 30 seconds and switching between "Nominal" (green pulse) and "Offline" (red pulse) based on the actual response.
