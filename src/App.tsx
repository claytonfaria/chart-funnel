import { useEffect, useRef } from "react";
import "./App.css";
import { Chart, ChartOptions, registerables } from "chart.js";

function App() {
  // Absolute value
  const EMAILS_SENT = 333;

  const data = {
    labels: ["Email sent", "Received", "Clicked", "Add to cart", "Purchased"],
    datasets: [
      {
        label: "Weekly Sales",
        // this one here draws the bars in the center, to make it work with our number, we need to test how to calculate it to be centered
        data: [
          [0, 100], // bar starts on zero to 100
          [20, 80],
          [30, 70], // bar starts on 30 and goes to 70
          [40, 60],
          [45, 55], // tricky part is those pairs should be calculated on the fly based on the actual data, for example, in this case  "purchased"
        ],
        backgroundColor: [
          "rgba(255, 26, 104, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 26, 104, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  //funnel chart plugin block

  const funnelChart = {
    id: "funnelChart",
    beforeDatasetsDraw(chart: Chart, args: any, pluginOptions: any) {
      const {
        ctx,
        data,
        chartArea: { left },
      } = chart;

      ctx.save();

      for (let i = 0; i < chart.getDatasetMeta(0).data.length - 1; i++) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(102,102,102,1)";
        ctx.strokeStyle = "rgba(102,102,102,1)";

        ctx.moveTo(
          chart.getDatasetMeta(0).data[i].base,
          chart.getDatasetMeta(0).data[i].y +
            chart.getDatasetMeta(0).data[i].height / 2
        );
        ctx.lineTo(
          chart.getDatasetMeta(0).data[i].x,
          chart.getDatasetMeta(0).data[i].y +
            chart.getDatasetMeta(0).data[i].height / 2
        );

        ctx.lineTo(
          chart.getDatasetMeta(0).data[i + 1].x,
          chart.getDatasetMeta(0).data[i + 1].y -
            chart.getDatasetMeta(0).data[i + 1].height / 2
        );

        ctx.lineTo(
          chart.getDatasetMeta(0).data[i + 1].base,
          chart.getDatasetMeta(0).data[i + 1].y -
            chart.getDatasetMeta(0).data[i + 1].height / 2
        );

        ctx.closePath();

        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }

      for (let j = 0; j < chart.getDatasetMeta(0).data.length; j++) {
        const datapointPercentage =
          data.datasets[0].data[j][1] - data.datasets[0].data[j][0];
        const quantity = (EMAILS_SENT * datapointPercentage) / 100;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 15px sans-serif";
        ctx.fillStyle = "rgba(102,102,102,1)";
        ctx.fillText(
          `${quantity} (${datapointPercentage}%)`,
          (chart.getDatasetMeta(0).data[0].x - left) / 2 + left,
          chart.getDatasetMeta(0).data[j].y
        );
      }
    },
  };

  Chart.register(...registerables);

  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const ctx = chartRef.current;
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data,
      options,
      plugins: [funnelChart],
    });
    return () => chartInstance.current.destroy();
  }, []);

  return (
    <div className="chartCard">
      <div className="chartBox">
        <canvas aria-label="chart" ref={chartRef} />
      </div>
    </div>
  );
}

export default App;
