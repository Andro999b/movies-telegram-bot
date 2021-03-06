import React from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { getColor } from '../utils'

export default ({ data, lines, legend }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <XAxis dataKey="seg" />
                <YAxis />
                <Tooltip />
                {legend && <Legend/> }
                {lines.map((line) =>
                    <Line 
                        key={line} 
                        type="monotone" 
                        dataKey={line} 
                        strokeWidth={2} 
                        stroke={getColor(line)} 
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    )
}