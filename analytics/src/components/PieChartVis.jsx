import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { COLORS } from '../constants'

export default ({ data }) => {

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} nameKey="name" dataKey="value">
                    {data.map((_, index) =>
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    )}
                </Pie>
                <Legend formatter={(value, _, index) => `${value} (${data[index].value})`}/>
                <Tooltip/>
            </PieChart>
        </ResponsiveContainer>
    )
}