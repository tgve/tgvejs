import React from 'react';
import { Table } from 'baseui/table';
import { Pagination } from 'baseui/pagination';

import { humanize } from '../utils';

export default function DataTable(props) {
  const [currentPage, setCurrentPage] = React.useState(0);

  const { data } = props;
  if (!data || data.length === 0) return null  
  const numPages = data.length > 10 ? Math.floor(data.length / 10) : 1
  
  const columns = Object.keys(data[0].properties)
    .map(each => humanize(each))

  const rows = data.slice(currentPage * 10, (currentPage * 10) + 10)
    .map(feature => Object.keys(feature.properties).map(e =>
      feature.properties[e]))

  return (
    <>
      <Pagination
        numPages={numPages}
        currentPage={currentPage}
        onPageChange={({ nextPage }) => {
          setCurrentPage(Math.min(Math.max(nextPage, 1), numPages));
        }}
      />
      <Table columns={columns} data={rows} />
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