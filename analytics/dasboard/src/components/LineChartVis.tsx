import React from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartData } from '../types'
import { getColor } from '../utils'

interface Props {
  data: ChartData
  lines: string[]
  legend?: string
}

const LineChartVis: React.FC<Props> = ({ data, lines, legend }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="seg" />
        <YAxis />
        <Tooltip />
        {legend && <Legend />}
        {lines.map((line) => <Line
          key={line}
          type="monotone"
          dataKey={(obj): number => obj[line] ?? 0}
          name={line}
          strokeWidth={2}
          stroke={getColor(line)} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default LineChartVis
