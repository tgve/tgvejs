12 March, 2021

# eAtlas · [![Node CI](https://github.com/layik/eAtlas/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/layik/eAtlas/actions?query=workflow%3A%22Node+CI%22)

This is the npm package from eAtlas project.

Currently these variables can be passed to the eAtlas app, each can be passed as an environment variable like `REACT_APP_LAYER_NAME` or when using eAtlas as a component `<Eatlas layerName="geojson">`:

  - `data` valid geojson object.

  - `defaultURL` which returns a valid geojson object when `fetched`. It
    can be used to fetch CSVs which is converted to `geojson` by eAtlas
    after fetching.

  - `geographyURL` which returns a valid `geojson` dataset. If this
    variable is provided, data is fetched separately along with
    `defaultURL`, eAtlas uses the `geographyColumn` to join them. eAtlas
    does this oth on initialization and when `reset` button is pressed.

  - `geographyColumn` a column name which is shared between data return
    from `defaultURL` and `geographyURL`. This is the joining column
    that will result in dynamically generating `geojson` data for eAtlas
    to consume.

  - `column` if provided, and if the geometry is of particular type
    which would need a column, it would be used. Defaults on to the
    second column as often first column is an ID of sort.

  - `layerName` if provided, and if the given name is in the list of DeckGL layers supported by eAtlas, will be passed to generate the layer with the name given.

None of the above is necessary and in the current release “Add data”
button will allow loading data into eAtlas.

See the main repo for more about the project.

## Using github pages

See the main [repo
guide](https://github.com/layik/eAtlas/blob/master/notes/guide.md) for
more details but you can use a template
([`layik/eatlas-template`](https://github.com/layik/eatlas-template))
repo to publish your data using eAtlas.

## Development

See the main repo for more details but the package is a fork from a
`create-react-app` boilerplate.

## Tests

The package follows `create-react-app` testing kits and uses mainly
`jest`. Run `npm run test`.

## Change log

  - `1.1.0-beta.0`
      - support for separating data from geography.
      - minor improvements elsewhere
