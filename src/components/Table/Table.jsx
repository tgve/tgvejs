import React from 'react';
import { Table } from 'baseui/table';
import {Pagination} from 'baseui/pagination';

import { humanize } from '../../utils';

export default function DataTable(props) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data } = props;
  if (!data || data.length === 0) return null
  const numPages = Math.floor(data.length / 10)

  const columns = [];
  const rows = [];
  Object.keys(data[0].properties).forEach(each => 
    columns.push(humanize(each)))
  
  data.slice(currentPage * 10, (currentPage * 10) + 10)
    .forEach(feature => {
      const row = [];
      if (feature.type === 'Feature') {
        Object.keys(feature.properties).forEach(e =>
          row.push(feature.properties[e])
        )
        console.log(row);
        rows.push(row)
      }
    })
  console.log(rows);
  
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