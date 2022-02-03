## Roadmap

The current version of the app has limited functionality. However, these are
on the horizon:

  - Multiple layers: Currently adding data replaces what is already in
    the application.

  - Smarter filtering: currently the filtering relies on matching
    key-value pairs, this can be extended to ranges and more. One other
    area of filtering is spatial filtering. The required
    packages/libraries are there and there is already a basic example of
    filtering “lines” implemented.

  - Basic data wrangling: one of the showcases “hard-coded” in the
    application does a simple conversion of seconds to minutes column to
    generate meaningful
    [isochrones](https://en.wikipedia.org/wiki/Isochrone_map).

  - Reconsider `geojson` as the central data format of the application
    and how buffer (unit arrays) can boost performance of TGVE.

  - More configuration options, for disabling the sidebar, defining sidebar contents, and customizing the default visualizations.
