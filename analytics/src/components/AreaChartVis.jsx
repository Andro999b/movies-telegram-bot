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

export default ({ data, lines, stacked, legend }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <XAxis dataKey="seg" />
                <YAxis />
                <Tooltip />
                {legend && <Legend/> }
                {lines.map((line, index) =>
                    <Area 
                        key={line} 
                        dataKey={line} 
                        type="monotone"
                        stackId={stacked ? '1' : index} 
                        stroke={getColor(line)} 
                        fillOpacity={.6} 
                        fill={getColor(line)} 
                    />
                )}
            </AreaChart>
        </ResponsiveContainer>
    )
}