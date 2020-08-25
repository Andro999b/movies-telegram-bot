import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { getColor } from '../utils'

export default ({ data, legend = true }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} nameKey="key" dataKey="value">
                    {data.map((_, index) =>
                        <Cell key={index} fill={getColor(data[index].key)} />
                    )}
                </Pie>
                {legend && <Legend formatter={(value, _, index) => `${value} (${data[index].value})`} />}
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    )
}