import Chart from "chart.js";

export function getBarOptions(numQuestionnaires: number): Chart.ChartOptions {
  return {
    tooltips: {
      enabled: false,
    },
    hover: {
      animationDuration: 0,
    },
    layout: {
      padding: {
        left: 0,
        right: 15,
        top: 0,
        bottom: 0,
      },
    },
    scales: {
      xAxes: [
        {
          display: false,
          ticks: {
            beginAtZero: true,
            fontFamily: "'Open Sans Bold', sans-serif",
            fontSize: 11,
          },
          scaleLabel: {
            display: false,
          },
          gridLines: {
            display: false,
          },
          stacked: true,
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
            color: "#fff",
            zeroLineColor: "#fff",
            zeroLineWidth: 0,
          },
          ticks: {
            fontFamily: "'Open Sans Bold', sans-serif",
            fontSize: 11,
          },
          stacked: true,
        },
      ],
    },
    legend: {
      onClick: (e) => e.preventDefault(),
      display: true,
      position: "bottom",
      align: "start",
      fullWidth: true,
      labels: {
        boxWidth: 20,
      },
    },
  };
}
