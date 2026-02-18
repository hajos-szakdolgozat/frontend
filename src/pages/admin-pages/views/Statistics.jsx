import logo from "./images/logo.png";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

function Statistics() {
  // Statikus adat - később cserélhető
  const felhasznalokData = {
    labels: ["Január", "Február", "Március", "Április"],
    datasets: [
      {
        label: "Új felhasználók",
        data: [50, 75, 60, 90],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const aktivitásData = {
    labels: ["Aktív", "Inaktív", "Felfüggesztett"],
    datasets: [
      {
        label: "Felhasználók állapota",
        data: [120, 45, 15],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
        hoverOffset: 10,
      },
    ],
  };

  const lineData = {
    labels: ["Január", "Február", "Március", "Április"],
    datasets: [
      {
        label: "Felhasználói trend",
        data: [50, 75, 60, 90],
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.3,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
        pointBorderColor: "#fff",
      },
    ],
  };

  return (
    <div className="admin-content" style={{ fontFamily: "Arial, sans-serif" }}>
      <div
        className="admin-header"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        <img
          src={logo}
          alt="Logo"
          className="logo-kep"
          style={{ height: "60px" }}
        />
        <h2>Statisztika</h2>
      </div>

      <div style={{ width: "600px", margin: "50px auto" }}>
        <h3>Új felhasználók havonta (Bar)</h3>
        <Bar data={felhasznalokData} options={{ responsive: true }} />
      </div>

      <div style={{ width: "600px", margin: "50px auto" }}>
        <h3>Felhasználói trend (Line)</h3>
        <Line data={lineData} options={{ responsive: true }} />
      </div>

      <div style={{ width: "400px", margin: "50px auto" }}>
        <h3>Felhasználók állapota (Pie)</h3>
        <Pie data={aktivitásData} options={{ responsive: true }} />
      </div>
    </div>
  );
}

export default Statistics;
