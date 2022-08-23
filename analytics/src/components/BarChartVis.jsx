import React from 'react'
import {
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
} from 'recharts'
import { COLORS } from '../constants'
import { grey } from '@material-ui/core/colors'


export default ({ data, lines, legend, layout = 'horizontal' }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout={layout}>
                {layout == 'vertical' ? <XAxis type="number" /> : <XAxis dataKey="seg" type="category" hide />}
                {layout == 'vertical' ? <YAxis dataKey="seg" type="category" hide /> : <YAxis type="number" />}
                <Tooltip
                    cursor={false}
                    itemStyle={{ color: '#fff' }}
                    contentStyle={{ background: grey[700], border: 0, borderRadius: 5 }}
                />
                {legend && <Legend />}
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