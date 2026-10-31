# Prompt for continuing the project (Antigravity)

Copy everything below into the tool.

---

You are continuing **Track Twin**, a student project for the SolveX 3.0 hackathon (Problem 1: road accidents and emergency response, Algiers). The jury scores simplicity, feasibility and innovation, and will read the code. Explain simply, in Arabic, to the project owner. All staff screens are in French.

## Rules

- Only original code or properly licensed open source, credited in the README. Do not copy code, design or text from commercial products. Do not reuse third-party logos, names or claims.
- Do not invent statistics, partners or customers. Every number comes from the simulation or a cited source.
- Do not name SYTRAC or any partner publicly without written consent.
- Say clearly that the lights are simulated. No real traffic light is controlled.
- No cross symbols anywhere: use the crescent.
- Never commit `.env`, and never print login codes.
- Run the tests before saying something works. Report what you did not verify.

## Where everything is

### 1. Platform and website: `C:\Users\abdou arabi\Documents\GreenCorridor`
Node 24, built-in `node:sqlite`, `node:http`, Server-Sent Events, Leaflet, OpenStreetMap, Tabler (MIT). No build step.

Run:
```bash
npm install
npm run vendor
npm start
```
Open `http://localhost:8080`. Test with `node --test test/rules.test.js`, and with the server running, `npm run smoke`.

| Path | Purpose |
|---|---|
| `server/rules.js` | Severity, 8% route rule, merge, lights ahead, all settings |
| `server/app.js` | Platform behaviour and what each role sees |
| `server/adapters.js` | SMS Gateway, OSRM routes, simulated light controller |
| `server/db.js` | SQLite schema and seed |
| `server/index.js` | Routes, sessions, permissions, live updates |
| `seed/` | Units, hospitals and lights from OpenStreetMap, to be reviewed |
| `public/js/common.js` | Shared helpers, labels, logo, base map |
| `public/js/dispatch.js`, `public/dispatch.html` | Operator dashboard |
| `public/css/app.css` | Palette and layout, on top of Tabler |
| `docs/signal-controller.md` | Conditions for connecting a real controller |
| `.env` | Login codes and settings, created on first run, private |

| Page | Content | Language |
|---|---|---|
| `/` | Landing page: problem, five steps, three screens, simulation results, limits | French |
| `/login` | Login for the three roles | French |
| `/dispatch` | Operator: priority list, map, journal, incident detail, units | French |
| `/unit` | Crew, phone first: mission steps, big next-step button, map | French |
| `/er` | Hospital: counters, incoming cards, acknowledge, team ready | French |
| `/metrics` | Duration of each stage | French |
| `/l/:token` | Witness one-time link: sends location and photo | Arabic |
| `/app` | Optional citizen reporting app (PWA) | Arabic |
| `/twin` | Simulation results page | French |

### 2. Digital twin: `C:\Users\abdou arabi\Documents\SytracTwin`
SUMO 1.28.0 with a Node TraCI client. Three arms: today, platform, platform + light priority.
- `src/run_scenario.js`, `traci.js`, `demand.js`, `experiment.js`, `featured.js`, `build_data.js`, `geo.js`, `demo.js`, `config.js`
- `demo.bat`: live SUMO demo. Double-click it, or call it by full path.
- `algiers_ambulance_twin.html`: results page
- `handoff/`: `lights.geojson`, `units_hospitals.json`, `calibration_routes.csv`, `intersection_count.csv`, `twin.html`, `PLATFORM_PROMPT.md`

Results, 24 sites, 9000 veh/h: today 10:44, platform 10:25, platform + lights 9:59. Gain 45.5 s (7.1%), 95% CI 17.9 to 79.6 s, median 33.8 s, faster on 18 of 24, best 336 s, worst -63.5 s. Platform alone: +19.2 s, not proven. Most lights are hypothetical and traffic is not calibrated.

### 3. Unity simulation: `C:\Users\abdou arabi\Documents\SytracSim`
- Player: `BuildV2\SytracSim.exe`. Keys: C chase camera, D details.
- Code: `Assets/Scripts/SimManager.cs`, `Assets/Resources/SytracVertexAlpha.shader`
- Backup and build: `Documents\SytracData\SimManager.before_view.cs`, `build_v2.ps1`
- Result: 24 of 30 runs faster, gain 19.5 s, one central route with a different traffic model. Use SUMO for numbers and Unity for visuals.

### 4. Published pages
- Twin page: https://claude.ai/artifact/DZtqSwGLhZsSmmntMZjHuh (older Arabic version)
- Explanation for a teammate: https://claude.ai/artifact/AUSrXx8YgfU7UkmVESJjT9 (older Arabic version)

## State

Working and tested: full mission from report to closing, role permissions, severity, suggestions, hospital alert, simulated lights, stage timing.

Not tested: real SMS (needs SMS Gateway credentials), real phone GPS (needs HTTPS through a host or tunnel), real lights (none connected). Login is one code per role, enough for a demo only.

## Next work

1. Improve the look of the dashboards using Tabler's own components and layouts. Keep the behaviour and run the tests after each change.
2. Build a manager dashboard from `/metrics`: averages per stage, incidents per day, slowest stage.
3. Add official accident statistics with their sources and the team section on `/` (see the TODO comment in `public/index.html`).
4. Bring `/twin` into the Track Twin identity.
5. Deploy on a Node host with a persistent disk, set `PUBLIC_URL`, test on a real phone.
6. Prepare the demo: start from an empty database, one critical incident, with all three screens open.

## Do not use

Do not use the owner's GitHub repositories `vessa-dashboard`, `ernconnect`, `moorly`, `opscom`, `resgrid`, `inetpublicsafety`, `ventus`, `govresponse` or `miovision` as a code base. Checked pages show broken or third-party content, including another company's logo and claims. Their ownership and licences are unverified.
