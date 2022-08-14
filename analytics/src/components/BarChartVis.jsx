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

export default ({ data, lines, legend, layout = 'horizontal' }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout={layout}>
                <XAxis dataKey="seg" />
                <YAxis />
                <Tooltip />
                {legend && <Legend/> }
                {lines.map((line, index) =>
                    <Bar 
                        key={line} 
                        dataKey={line} 
                        stackId="1"
                        fill={COLORS[index % COLORS.length]} 
                    />
                )}
            </BarChart>
        </ResponsiveContainer>
    )
}