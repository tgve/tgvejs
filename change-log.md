## Change log
- `1.5.1`
  - Add two callbacks to TGVE: `onViewStateChange` and `onStateChange`. See `README` for API details.
  - Legend supports categorical data
  - Barvis custom layer color handling fix
  - Minor improvements and changes

- `1.5.0`
  - Add support for reading Shapefiles via shapefile.js
  - Read separate geography & data file from local machine
  - Other minor performance improvements.

- `1.4.8`
  - Mainly performance improvements (viewport)

- `1.4.7`
  - Fix colouring various layers
  - Add popup as well as hover
  - Clipping of geography based on map screen boundary
  - Other improvements

- `1.4.6`
  - Mainly tests. Snapshot testing both using React and adding puppeteer as the UI testing suite.
  - New API added `select`.
  - Removed react-bootstrap dependency and use baseui
  - API variables related to data source are now preserved in the URL updates.
  - API variable names consistency.
  - Other improvements and bug fixes.

- `1.4.5`
  - Data sources can now be `script` with `type="application/json`.
  - Various fixes and improvements.
  - Coloring for `linestring` geojson types.
- `1.4.0`
  - Stable release
- `1.3.5-beta.0`
  - The TGVE now accepts the API variables as URL query parameters.
- `1.3.4.beta.4`
  - Minor issues and post tgver package Tests
  - Path layer API in
- `1.3.4.beta.0`
  - API value `hideChartGenerator` is one of the few from the wider and potentially `hideSidebar`.
  - Added basic version of "screenshot" or save. The future plan for this is a full analytic report (PDF) generation.
  - Minor fixes and changes
- `1.3.3-beta.0`
  - More APIs as TGVE is in showcase driven development.
  - Added `viewport` API JSON variable.
- `1.3.2-beta.0`
  - Better history management and respects host paths.
- `1.3.1-beta.0`
  - Preparing to remove the `beta` tag.
  - TGVE has now been migrated to its organisation on github.com
  - Added two new API variables (`dark`, `leftSidebarContent`)
  - Lots of improvements and minor fixes
- `1.3.0-beta.2`
  - Minor fix for initial analysis of data column name.
- `1.1.0-beta.0`
  - support for separating data from geography.
  - minor improvements elsewhere
