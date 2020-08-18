import React from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { COLORS } from '../constants'

export default ({ data, lines, legend }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <XAxis dataKey="seg" />
                <YAxis />
                <Tooltip />
                {legend && <Legend/> }
                {lines.map((line, index) =>
                    <Line 
                        key={line} 
                        type="monotone" 
                        dataKey={line} 
                        strokeWidth={2} 
                        stroke={COLORS[index % COLORS.length]} 
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    )
}