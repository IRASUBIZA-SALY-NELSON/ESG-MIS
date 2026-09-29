'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJs,
  ArcElement,
  Tooltip,
  LineElement,
  CategoryScale,
  Filler,
  LinearScale,
  Legend,
  PointElement,
} from 'chart.js';

ChartJs.register(
  ArcElement,
  Tooltip,
  LineElement,
  PointElement,
  LinearScale,
  Legend,
  Filler,
  CategoryScale,
);

const StudentGraph = () => {
  const data = {
    labels: ['', '', '', '', '', '', '', '', '', '', '', ''],
    datasets: [
      {
        label: '',
        data: [60, 80, 70, 89.4, 75, 80, 78, 76, 60, 80, 76, 90, 80],
        tension: 0.1,
        borderColor: 'rgba(25, 188, 100, 0.63)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        // display: false,
        grid: {
          display: false,
        },
      },
      y: {
        // display: false,
        border: {
          // dash: [5],
        },
        grid: {
          drawTicks: false,
        },
        ticks: {
          display: false, // Hide y-axis scale numbers
        },
      },
    },
  };

  return (
    <div className="w-full relative flex justify-center items-center mt-4 bg-[#ffffff9d] h-[84%] rounded-lg">
      <p className="absolute text-[#00000067] left-[-0%] text-[9px] horizo-writing font-semibold">
        Grades (%)
      </p>
      <p className="absolute text-[#00000067] bottom-[2%] text-[9px] verti-writing font-semibold">
        Academic terms
      </p>
      <div className="w-[90%] h-[180px] mt-3">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default StudentGraph;
