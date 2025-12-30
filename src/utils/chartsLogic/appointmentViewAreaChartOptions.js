export const appointmentViewAreaChartOptions = ({ categories = [], series = [] } = {}) => {
    // Determine a nice y-axis max based on provided series
    const maxValue = Math.max(1, ...series.flatMap(s => s.data || []));
    const yMax = Math.ceil(maxValue * 1.2);
    const chartOptions = {
        chart: {
            stacked: !1,
            toolbar: { show: !1 }
        },
        xaxis: {
            categories: categories,
            axisBorder: { show: !1 },
            axisTicks: { show: !1 },
            labels: {
                style: {
                    fontSize: "10px",
                    colors: "#64748b"
                }
            }
        },
        yaxis: {
            min: 0,
            max: yMax,
            tickAmount: 4,
            labels: {
                formatter: function (e) {
                    return Math.round(e);
                },
                offsetX: -15,
                offsetY: 0,
                style: {
                    fontSize: "10px",
                    color: "#64748b"
                },
            },
        },
        stroke: {
            curve: "smooth",
            width: [1, 1, 1, 1],
            dashArray: [3, 3, 3, 3],
            lineCap: "round"
        },
        grid: {
            padding: { left: 0, right: 0 },
            strokeDashArray: 3,
            borderColor: "#ebebf3",
            row: {
                colors: ["#ebebf3", "transparent"],
                opacity: 0.02
            }
        },
        legend: { show: !1 },
        colors: ["#3454d1", "#25b865"],
        dataLabels: { enabled: !1 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        },
        series: series,
        tooltip: {
            y: {
                formatter: function (e) {
                    return Math.round(e);
                },
            },
            style: { fontSize: "12px", fontFamily: "Inter" },
        },
    }
    return chartOptions
}