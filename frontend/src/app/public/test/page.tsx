'use client';
import React from 'react';
import styles from './table.module.css';

const TestPage = () => {
  return (
    <div className=" min-h-screen items-center justify-center flex w-full">
      <table className={` w-full max-w-[400px] ${styles.table}`}>
        <thead>
          <tr className={styles.mainth}>
            <th className={styles.th}>
              <div className={`${styles.td}`}>No</div>
            </th>
            <th className={styles.th}>
              <div className={`${styles.td}`}>Name</div>
            </th>
            <th className={styles.th}>
              <div className={`${styles.td} ${styles.lasttd}`}>Class</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((n, i) => (
            <tr key={i} className={''}>
              <td className={`${i === 0 && styles.firstR} `}>
                <div className={`${styles.td}`}>1</div>
              </td>
              <td className={`${i === 0 && styles.firstR}`}>
                <div className={`${styles.td}`}>John Doe</div>
              </td>
              <td className={`${i === 0 && styles.firstR}`}>
                <div className={`${styles.td} ${styles.lasttd}`}>SS1</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{``}</style>
    </div>
  );
};

export default TestPage;
