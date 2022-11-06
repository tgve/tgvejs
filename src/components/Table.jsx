import React from 'react';
import { Table } from 'baseui/table-semantic';
import { Pagination } from 'baseui/pagination';

import { humanize } from '../utils/utils';

export default function DataTable(props) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data } = props;
  if (!data || data.length === 0) return null

  const PR = data.length > 10 ? 10 : 0;
  const numPages = data.length > 10 ? Math.floor(data.length / PR) : 1;
  const firstFeatureProps = Object.keys(data[0].properties)

  const columns = firstFeatureProps.map(each => humanize(each))
  const rows = data.slice(currentPage * PR,
    ((currentPage * PR) + PR) || data.length
    )
    .map(feature => firstFeatureProps.map(e =>
      feature.properties[e] || ""))
  const overrides = {
    Root: {
      style: {
        maxWidth: '70vh',
      },
    },
  };
  return (
    <>
      <Pagination
        numPages={numPages}
        currentPage={currentPage}
        onPageChange={({ nextPage }) => {
          setCurrentPage(Math.min(Math.max(nextPage, 1), numPages));
        }}
      />
      <Table
        overrides={overrides}
        columns={columns} data={rows} />
      {/* // not nice 1000px */}
      <Pagination
        numPages={numPages}
        currentPage={currentPage}
        onPageChange={({ nextPage }) => {
          setCurrentPage(Math.min(Math.max(nextPage, 1), numPages));
        }}
      />
    </>
  )
}
