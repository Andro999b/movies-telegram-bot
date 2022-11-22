import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { getColor } from '../utils'
import { COLORS } from '../constants'
import { PieData } from '../types'

interface Props {
  data: PieData[],
  legend?: boolean
  sequenceColors?: boolean
}

const PieChatVis: React.FC<Props> = ({
  data,
  legend = true,
  sequenceColors = false
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} nameKey="key" dataKey="value">
          {data.map((_, index) => <Cell key={index} fill={sequenceColors ? COLORS[index % COLORS.length] : getColor(data[index].key)} />
          )}
        </Pie>
        {legend && <Legend formatter={(value, _, index): string => `${value} (${data[index!].value})`} />}
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PieChatVis
