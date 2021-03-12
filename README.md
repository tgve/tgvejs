
# eAtlas · [![Node CI](https://github.com/layik/eAtlas/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/layik/eAtlas/actions?query=workflow%3A%22Node+CI%22)

This is the npm package from eAtlas project.

Currently these variables can be passed to the eAtlas app:

  - `data` which is expected to be a valid geojson object (json).

  - `defaultURL` which is meant to returing a valide geojson object
    (json) when queried.

  - `geographyURL`, if provided and both on initialization and when
    `reset` button is pressed, data is fetched separately using this
    variable and `defaultURL` variables.

  - `geographyColumn` a matching column between data return from
    `defaultURL` and `geographyURL`. This is the joining column that
    will result in dynamically generating `geojson` data for eAtlas to
    consume.

  - `column` if provided, and if the geometry is of particular type
    which would need a column, it would be used. Defaults on to the
    second column as often first column is an ID of sort.

None of the above is necessary and in the current release “Add data”
button will allow loading data into eAtlas.

See the main repo for more about the project.

## Using github pages

See the main repo guide for more details but you can use a template
([`layik/eatlas-template`](https://github.com/layik/eatlas-template))
repo to publish your data using eAtlas.

## Development

See the main repo for more details but the package is a fork from a
`create-react-app` boilerplate.

## Tests

The package follows `create-react-app` testing kits and uses mainly
`jest`. Run `npm run test`.

## Change log

  - support for separating data from geography.
  - minor improvements elsewhere
