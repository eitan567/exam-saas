import React, { useMemo } from 'react';
import { SnapshotReport } from '@/app/utils/formSnapshotReport';
import Card from '../Card';

interface ChartProps {
  data: number[];
  labels: string[];
  height?: number;
  barColor?: string;
}

const BarChart: React.FC<ChartProps> = ({
  data,
  labels,
  height = 200,
  barColor = 'bg-blue-500 dark:bg-blue-400',
}) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <div className="absolute inset-0 flex items-end justify-between gap-2">
        {data.map((value, index) => {
          const percentage = (value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full relative" style={{ height: `${percentage}%` }}>
                <div className={`absolute inset-x-2 inset-y-0 ${barColor} rounded-t-md transition-all duration-300`} />
              </div>
              <div className="mt-2 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                {labels[index]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DonutChartProps {
  data: number[];
  labels: string[];
  colors: string[];
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  labels,
  colors,
  size = 200,
}) => {
  const total = data.reduce((a, b) => a + b, 0);
  let currentAngle = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((value, index) => {
          const angle = (value / total) * 360;
          const pathData = describeArc(50, 50, 40, currentAngle, currentAngle + angle);
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill="none"
              className={colors[index]}
              strokeWidth="20"
              stroke="currentColor"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-2xl font-bold">{total}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {labels.map((label, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
            <span className="text-sm">{label} ({data[index]})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function for drawing donut chart arcs
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

interface FormSnapshotChartsProps<T extends Record<string, any>> {
  report: SnapshotReport<T>;
  className?: string;
}

function FormSnapshotCharts<T extends Record<string, any>>({
  report,
  className = '',
}: FormSnapshotChartsProps<T>) {
  const changesByVersion = useMemo(() => {
    const changes: Record<string, number> = {};
    report.snapshots.forEach(snapshot => {
      if (snapshot.changes) {
        changes[snapshot.snapshot.version] = Object.keys(snapshot.changes).length;
      }
    });
    return changes;
  }, [report.snapshots]);

  const importanceCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    report.snapshots.forEach(snapshot => {
      counts[snapshot.importance]++;
    });
    return counts;
  }, [report.snapshots]);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <h3 className="text-lg font-medium mb-4">Changes by Version</h3>
        <BarChart
          data={Object.values(changesByVersion)}
          labels={Object.keys(changesByVersion)}
          height={250}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-medium mb-4">Changes by Importance</h3>
        <div className="flex justify-center">
          <DonutChart
            data={[importanceCounts.high, importanceCounts.medium, importanceCounts.low]}
            labels={['High', 'Medium', 'Low']}
            colors={[
              'text-red-500 dark:text-red-400',
              'text-yellow-500 dark:text-yellow-400',
              'text-green-500 dark:text-green-400'
            ]}
            size={300}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-medium mb-4">Timeline Distribution</h3>
        <BarChart
          data={report.snapshots.map((_, i) => i + 1)}
          labels={report.snapshots.map(s => 
            new Date(s.snapshot.timestamp).toLocaleDateString()
          )}
          barColor="bg-purple-500 dark:bg-purple-400"
          height={200}
        />
      </Card>
    </div>
  );
}

export default FormSnapshotCharts;