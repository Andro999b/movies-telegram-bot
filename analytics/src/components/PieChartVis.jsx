import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { colors } from '../constants'

export default ({ data }) => {

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} nameKey="name" dataKey="value">
                    {data.map((_, index) =>
                        <Cell key={index} fill={colors[index % colors.length]} />
                    )}
                </Pie>
                <Legend formatter={(value, _, index) => `${value} (${data[index].value})`}/>
                <Tooltip/>
            </PieChart>
        </ResponsiveContainer>
    )
}