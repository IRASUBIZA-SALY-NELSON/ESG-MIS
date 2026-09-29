import React, { FC } from 'react';
import { Table } from '@mantine/core';

interface Props {
  data: any;
}

const ExcelImportPreviewer: FC<Props> = ({ data }) => {
  let columnNames: any = [];
  columnNames = Object.keys(data[0]);
  console.log(columnNames);

  const excludedProperties = ['Timestamp'];
  const filteredData = data.map((element: any) => {
    const filteredObject: any = {};
    columnNames.forEach((property: any) => {
      if (!excludedProperties.includes(property)) {
        filteredObject[property] = element[property];
      }
    });
    return filteredObject;
  });
  const rows = filteredData.map((element: any, index: any) => (
    <Table.Tr key={index}>
      {Object.values(element).map((colName: any, colIndex: any) => (
        <Table.Td className=" whitespace-nowrap p-2" key={colIndex}>
          {colName}
        </Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <div className="flex w-full overflow-x-auto py-4">
      <Table striped="even">
        <Table.Thead>
          <Table.Tr>
            {Object.keys(filteredData[0]).map((colName: any, colIndex: any) => (
              <Table.Th className=" whitespace-nowrap p-2" key={colIndex}>
                {colName}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default ExcelImportPreviewer;
