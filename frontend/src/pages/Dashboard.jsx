import { useEffect, useState } from "react";
import {
  BusFront,
  Map,
  CalendarDays,
  Ticket,
  Clock3,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function MetricCard({ label, value, icon: Icon, detail }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <div className="metric-icon"><Icon size={20} /></div>
      </div>
      <div className="metric-value">{value ?? "—"}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading your dashboard...</div>;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Good day, {user?.name?.split(" ")[0] || "traveler"}.</h1>
          <p className="muted">
            {isAdmin
              ? "Here is your Blue Way operations overview."
              : "Here is an overview of your travel bookings."}
          </p>
        </div>
        <button className="button-secondary" onClick={loadDashboard}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert error-alert">
          {error}
          <button onClick={loadDashboard}>Try again</button>
        </div>
      )}

      {data && (
        <>
          <div className="metrics-grid">
            {isAdmin ? (
              <>
                <MetricCard label="Total buses" value={data.total_buses} icon={BusFront} detail="Registered fleet" />
                <MetricCard label="Total routes" value={data.total_routes} icon={Map} detail="Configured destinations" />
                <MetricCard label="Schedules" value={data.total_schedules} icon={CalendarDays} detail="Departure records" />
                <MetricCard label="Pending bookings" value={data.pending_bookings} icon={Clock3} detail="Awaiting review" />
              </>
            ) : (
              <>
                <MetricCard label="My bookings" value={data.my_bookings} icon={Ticket} detail="All your bookings" />
                <MetricCard label="Pending" value={data.my_pending_bookings} icon={Clock3} detail="Awaiting confirmation" />
                <MetricCard label="Confirmed" value={data.my_confirmed_bookings} icon={CheckCircle2} detail="Confirmed journeys" />
              </>
            )}
          </div>

          {isAdmin && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent bookings</h2>
                  <p className="muted">Latest booking activity in the database.</p>
                </div>
                <span className="live-badge">LIVE DATA</span>
              </div>

              {data.recent_bookings?.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Passenger</th>
                        <th>Journey</th>
                        <th>Seats</th>
                        <th>Total fare</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.passenger?.name || "Passenger"}</td>
                          <td>
                            {booking.schedule?.route?.origin || "—"} →{" "}
                            {booking.schedule?.route?.destination || "—"}
                          </td>
                          <td>{booking.seats}</td>
                          <td>₱{Number(booking.total_fare).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                          <td><span className={`status-pill status-${booking.status}`}>{booking.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No bookings have been recorded yet.</div>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}