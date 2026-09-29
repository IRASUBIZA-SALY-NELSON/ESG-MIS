import React from 'react';
import styles from './table.module.css';

interface TableColumn<T> {
  name: string;
  get(row: T): React.ReactNode;
}

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
}

const CMDTable = <T,>({ columns, data }: Props<T>) => {
  return (
    <div className="my-2">
      <table className={`${styles.table}`}>
        <thead>
          <tr className={styles.mainth}>
            {columns.map((column, index) => (
              <th key={index} className={styles.th}>
                <div
                  className={`${styles.td} ${index === columns.length - 1 && styles.lasttd} text-[rgba(3,87,189,0.47)]`}
                >
                  {column.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={`${rowIndex === 0 && styles.firstR}`}>
                  <div
                    className={`${styles.td} ${colIndex === columns.length - 1 && styles.lasttd} !select-text`}
                  >
                    {column.get(row)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CMDTable;
