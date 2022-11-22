import React from 'react'
import {
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area
} from 'recharts'
import { getColor } from '../utils'
import { ChartData } from '../types/index.js'

interface Props {
  data: ChartData
  lines: string[]
  stacked?: boolean
  legend?: boolean
}

const AreaChartVis: React.FC<Props> = ({ data, lines, stacked, legend }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis dataKey="seg" />
        <YAxis />
        <Tooltip />
        {legend && <Legend />}
        {lines.map((line, index) => <Area
          key={line}
          dataKey={(obj): number => obj[line] ?? 0}
          name={line}
          type="monotone"
          stackId={stacked ? '1' : index}
          stroke={getColor(line)}
          fillOpacity={.6}
          fill={getColor(line)} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
export default AreaChartVis
