import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Label, LabelList } from "recharts";

export function LineGraph({
    data,
    dataKey,
    dataName,
    title,
    lineColor = "#8884d8", // ✅ Customizable line color
    showGrid = true, // ✅ Toggle grid display
    showLegend = true, // ✅ Toggle legend
    showLabels = true, // ✅ Show/hide data labels
    yAxisMax = null,
    xAxisLabel = "X-Axis",
    yAxisLabel = "Y-Axis",
    showXAxisLabel = true,
    showYAxisLabel = true,
    lineType = "monotone", // ✅ Customize line type
    graphWidth = "100%", // ✅ Custom graph width
    graphHeight = 300, // ✅ Custom graph height
}) {

    const calculatedMax = yAxisMax || Math.ceil(Math.max(...data.map(item => item[dataKey])) * 1.2);

    return (
        <div className="p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
            <ResponsiveContainer width={graphWidth} height={graphHeight}>
                <LineChart data={data} margin={{ top: 50, right: 40, left: 20 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />} {/* ✅ Toggle Grid */}

                    <XAxis dataKey={dataName}
                        tick={{ fontSize: 14 }}
                        interval={0}  >
                        {showXAxisLabel && <Label value={xAxisLabel} offset={-5} position="insideBottom" />}
                    </XAxis>

                    <YAxis domain={[0, calculatedMax]}>
                        {showYAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" />}
                    </YAxis>

                    <Tooltip />
                    {showLegend && <Legend />} {/* ✅ Toggle Legend */}

                    {/* ✅ Line Graph with Labels */}
                    <Line
                        type={lineType}
                        dataKey={dataKey}
                        stroke={lineColor}
                        strokeWidth={2}
                        dot={{ r: 4 }} // ✅ Customize dot size
                    >
                        {showLabels && <LabelList dataKey={dataKey} position="top" dy={-10} />} {/* ✅ Display labels */}
                    </Line>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function BarGraph({
    data,
    dataKey,
    title,
    total,
    dataName,
    barWidth = 50,
    xAxisLabel = "X-Axis",
    yAxisLabel = "Y-Axis",
    yAxisMax = null,
    showGrid = true,
    showLegend = true,
    showLabels = false,
    showXAxisLabel = true,
    showYAxisLabel = true,
    barColor = "#82ca9d",
    graphWidth = "100%",
}) {

    const calculatedTotal = total ?? data.reduce((acc, item) => acc + item[dataKey], 0);
    const calculatedMax = yAxisMax || Math.ceil(Math.max(...data.map(item => item[dataKey])) * 1.4);

    // Automated insight generation
    const highestValue = Math.max(...data.map(item => item[dataKey]));
    const lowestValue = Math.min(...data.map(item => item[dataKey]));
    const mostCommon = data.reduce((prev, current) => (prev[dataKey] > current[dataKey] ? prev : current), {});
    const leastCommon = data.reduce((prev, current) => (prev[dataKey] < current[dataKey] ? prev : current), {});

    // Generate insight text
    const insightText = `
        The highest value is ${highestValue}, observed in ${mostCommon[dataName]}.
        The lowest value is ${lowestValue}, observed in ${leastCommon[dataName]}.
        The total number of registrants is ${calculatedTotal}.
        ${highestValue > calculatedTotal * 0.4 ? "Action: Consider focusing more resources on " + mostCommon[dataName] + "." : ""}
        ${lowestValue < calculatedTotal * 0.1 ? "Note: " + leastCommon[dataName] + " has significantly fewer participants." : ""}
    `;

    return (
        <div className="p-4 bg-white rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-black">{title}</h3>
                <span className="text-white bg-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                    Total: {calculatedTotal}
                </span>
            </div>
            <ResponsiveContainer width={graphWidth} height={300}>
                <BarChart data={data} margin={{ top: 50, right: 40, left: 20 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                    <XAxis dataKey={dataName} tick={{ fontSize: 14 }} interval={0}>
                        {showXAxisLabel && <Label value={xAxisLabel} offset={-5} position="insideBottom" />}
                    </XAxis>
                    <YAxis domain={[0, calculatedMax]}>
                        {showYAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" />}
                    </YAxis>
                    {showLegend && <Legend />}
                    <Bar dataKey={dataKey} fill={barColor} barSize={barWidth}>
                        {showLabels && <LabelList dataKey={dataKey} position="top" />}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            {/* Insight Section */}
            <div className="mt-4 p-2 bg-gray-100 rounded-md text-sm text-gray-700">
                <p><strong>Insight:</strong> {insightText}</p>
            </div>
        </div>
    );
}


export function PieGraph({
    data,
    dataKey,
    dataName,
    title,
    colors = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"], // ✅ Custom colors
    showLegend = true,
    showLabels = true,
    outerRadius = 100, // ✅ Customizable pie size
    graphWidth = "100%", // ✅ Customizable width
    graphHeight = 300, // ✅ Customizable height
}) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
            <ResponsiveContainer width={graphWidth} height={graphHeight}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={dataName}
                        cx="50%"
                        cy="50%"
                        outerRadius={outerRadius}
                        fill={colors[0]}
                        label={showLabels}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    {showLegend && <Legend />} {/* ✅ Toggle Legend */}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
