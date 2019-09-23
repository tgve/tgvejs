import React from 'react';
import { Table } from 'react-bootstrap';
import { humanize } from '../utils';
import {Pagination} from 'baseui/pagination';

export default function DataTable(props) {
  const [limit, setLimit] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data } = props;
  if (!data || data.length === 0) return null
  console.log(data);
  const numPages = Math.floor(data.length / 10)
  return (
    <>
<Pagination
      numPages={numPages}
      currentPage={currentPage}
      onPageChange={({nextPage}) => {
        setCurrentPage(Math.min(Math.max(nextPage, 1), numPages));
      }}
    />
      <Table responsive variant="dark">
        <thead>
          <tr>
            {
              Object.keys(data[0].properties).
                map(each =>
                  <th style={{ wordWrap: "break-word" }}
                    key={each}>{humanize(each)}</th>
                )
            }
          </tr>
        </thead>
        <tbody>
          {
            data.slice(currentPage * 10, (currentPage * 10) + 10)
            .map((feature, i) => {
              return (<tr key={"featurre" + i}>
                {
                  feature.type === 'Feature' &&
                  Object.keys(feature.properties).map(e => {
                    return (<td key={e}>{feature.properties[e]}</td>)
                  })
                }
              </tr>)
            })
          }
        </tbody>
      </Table>
      <Pagination
      numPages={numPages}
      currentPage={currentPage}
      onPageChange={({nextPage}) => {
        setCurrentPage(Math.min(Math.max(nextPage, 1), numPages));
      }}
    />
    </>
  )
}