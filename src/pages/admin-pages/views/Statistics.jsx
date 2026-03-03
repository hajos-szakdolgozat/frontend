import logo from "./images/logo.png";
import { useMemo } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import useFetch from "../../../hooks/useFetch";
import { extractList } from "./adminUtils";
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
  const { fetchedData: usersResponse, loading: usersLoading, error: usersError } = useFetch("/api/users");
  const { fetchedData: boatsResponse, loading: boatsLoading, error: boatsError } = useFetch("/api/boats");
  const {
    fetchedData: transactionsResponse,
    loading: transactionsLoading,
    error: transactionsError,
  } = useFetch("/api/transactions");

  const users = useMemo(() => extractList(usersResponse), [usersResponse]);
  const boats = useMemo(() => extractList(boatsResponse), [boatsResponse]);
  const transactions = useMemo(
    () => extractList(transactionsResponse),
    [transactionsResponse],
  );

  const monthlyBuckets = useMemo(() => {
    const labels = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];
    const userCounts = Array(12).fill(0);
    const transactionCounts = Array(12).fill(0);

    users.forEach((item) => {
      const createdAt = item?.created_at ? new Date(item.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      userCounts[createdAt.getMonth()] += 1;
    });

    transactions.forEach((item) => {
      const createdAt = item?.created_at ? new Date(item.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      transactionCounts[createdAt.getMonth()] += 1;
    });

    return { labels, userCounts, transactionCounts };
  }, [users, transactions]);

  const userRoleDistribution = useMemo(() => {
    let admins = 0;
    let renters = 0;
    let owners = 0;

    users.forEach((item) => {
      const role = String(item?.role || "").toLowerCase();
      if (role.includes("admin")) admins += 1;
      else if (role.includes("owner") || role.includes("berbeado") || role.includes("host")) owners += 1;
      else renters += 1;
    });

    return { admins, renters, owners };
  }, [users]);

  const boatActivityDistribution = useMemo(() => {
    const active = boats.filter((item) => item?.is_active).length;
    const inactive = boats.length - active;
    return { active, inactive };
  }, [boats]);

  if (usersLoading || boatsLoading || transactionsLoading) {
    return <div className="admin-content">Betöltés...</div>;
  }

  if (usersError || boatsError || transactionsError) {
    return (
      <div className="admin-content">
        {usersError || boatsError || transactionsError}
      </div>
    );
  }

  const felhasznalokData = {
    labels: monthlyBuckets.labels,
    datasets: [
      {
        label: "Új felhasználók",
        data: monthlyBuckets.userCounts,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const aktivitásData = {
    labels: ["Admin", "Bérlő", "Bérbeadó"],
    datasets: [
      {
        label: "Felhasználói szerepek",
        data: [
          userRoleDistribution.admins,
          userRoleDistribution.renters,
          userRoleDistribution.owners,
        ],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
        hoverOffset: 10,
      },
    ],
  };

  const lineData = {
    labels: monthlyBuckets.labels,
    datasets: [
      {
        label: "Tranzakciók trendje",
        data: monthlyBuckets.transactionCounts,
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.3,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
        pointBorderColor: "#fff",
      },
    ],
  };

  const hajoAktivitasData = {
    labels: ["Aktív", "Inaktív"],
    datasets: [
      {
        label: "Hirdetések állapota",
        data: [boatActivityDistribution.active, boatActivityDistribution.inactive],
        backgroundColor: ["#36A2EB", "#FFCE56"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="admin-content stats-page">
      <div className="admin-header">
        <img src={logo} alt="Logo" className="logo-kep" />
        <div className="stats-heading">
          <h2>Statisztikák</h2>
          <p>Admin áttekintő dashboard</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>{users.length}</strong>
            <p>Felhasználók</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <strong>{boats.length}</strong>
            <p>Összes hirdetés</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <strong>{boatActivityDistribution.active}</strong>
            <p>Aktív hajó</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <strong>{transactions.length}</strong>
            <p>Tranzakciók</p>
          </div>
        </div>
      </div>

      <div className="stats-charts-grid">
        <article className="stats-chart-card stats-chart-card--wide">
          <h3>Új felhasználók havonta</h3>
          <div className="stats-chart-body">
            <Bar data={felhasznalokData} options={chartOptions} />
          </div>
        </article>

        <article className="stats-chart-card stats-chart-card--wide">
          <h3>Tranzakciók trendje</h3>
          <div className="stats-chart-body">
            <Line data={lineData} options={chartOptions} />
          </div>
        </article>

        <article className="stats-chart-card">
          <h3>Felhasználói szerepek</h3>
          <div className="stats-chart-body stats-chart-body--small">
            <Pie data={aktivitásData} options={chartOptions} />
          </div>
        </article>

        <article className="stats-chart-card">
          <h3>Hirdetések állapota</h3>
          <div className="stats-chart-body stats-chart-body--small">
            <Pie data={hajoAktivitasData} options={chartOptions} />
          </div>
        </article>
      </div>
    </div>
  );
}

export default Statistics;
