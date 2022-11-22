import React from 'react'
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from 'recharts'
import { COLORS } from '../constants'
import { grey } from '@mui/material/colors'
import { ChartData, Counting, Unique } from '../types'

interface Props {
  data: ChartData<Counting | Unique>
  lines?: string[]
  legend?: boolean
  layout?: 'horizontal' | 'vertical'
}

const BarChartVis: React.FC<Props> = ({ data, lines, legend, layout = 'horizontal' }) => {
  if (!lines) {
    lines = data.map(({ seg }) => seg)
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={layout}>
        {layout == 'vertical' ? <XAxis type="number" /> : <XAxis dataKey="seg" type="category" hide />}
        {layout == 'vertical' ? <YAxis dataKey="seg" type="category" hide /> : <YAxis type="number" />}
        <Tooltip cursor={false} />
        {legend && <Legend />}
        {lines.map((line, index) => <Bar
          key={line}
          dataKey={line}
          stackId="1"
          fill={COLORS[index % COLORS.length]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default BarChartVis
