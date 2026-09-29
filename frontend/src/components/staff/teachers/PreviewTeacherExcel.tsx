import React, { FC } from 'react';
import { Table } from '@mantine/core';

interface Props {
  data: any;
}

const PreviewTeacherExcel: FC<Props> = ({ data }) => {
  let columnNames: any = [];
  columnNames = Object.keys(data[0]);
  const excludedProperties = ['Timestamp', 'Are you a class teacher?'];
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
      {Object.values(element).map((value: any, colIndex) => (
        <Table.Td key={colIndex}>{value}</Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {Object.keys(filteredData[0]).map((property, colIndex) => (
            <Table.Th key={colIndex}>{property}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export default PreviewTeacherExcel;
