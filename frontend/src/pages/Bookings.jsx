import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, Ticket } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Bookings() {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState("");
  const [seats, setSeats] = useState(1);
  const [searchStatus, setSearchStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/bookings", {
        params: {
          page,
          ...(searchStatus ? { status: searchStatus } : {}),
        },
      });

      setBookings(response.data.data || []);
      setLastPage(response.data.meta?.last_page || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [page, searchStatus]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    api.get("/schedules")
      .then((response) => {
        setSchedules(
          (response.data.data || []).filter(
            (schedule) =>
              schedule.available_seats > 0 &&
              schedule.bus?.status === "active"
          )
        );
      })
      .catch(() => setError("Could not load available schedules."));
  }, []);

  async function createBooking(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!scheduleId || Number(seats) < 1 || Number(seats) > 10) {
      setError("Choose a schedule and enter between 1 and 10 seats.");
      return;
    }

    setSaving(true);

    try {
      await api.post("/bookings", {
        schedule_id: Number(scheduleId),
        seats: Number(seats),
      });

      setSuccess("Booking submitted. Its initial status is pending.");
      setScheduleId("");
      setSeats(1);
      await loadBookings();

      const response = await api.get("/schedules");
      setSchedules(
        (response.data.data || []).filter(
          (schedule) =>
            schedule.available_seats > 0 &&
            schedule.bus?.status === "active"
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.errors?.seats?.[0] ||
        err.response?.data?.errors?.schedule_id?.[0] ||
        err.response?.data?.message ||
        "Booking failed."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(booking, status) {
    setError("");
    setSuccess("");

    try {
      await api.patch(`/bookings/${booking.id}/status`, { status });
      setSuccess(`Booking #${booking.id} updated to ${status}.`);
      await loadBookings();
    } catch (err) {
      setError(
        err.response?.data?.errors?.status?.[0] ||
        err.response?.data?.message ||
        "Could not update booking status."
      );
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">TRAVEL MANAGEMENT</span>
          <h1>{isAdmin ? "Booking Management" : "My Bookings"}</h1>
          <p className="muted">
            {isAdmin
              ? "Review passenger requests and manage their status."
              : "Reserve seats and follow the status of your journeys."}
          </p>
        </div>
        <button className="button-secondary" onClick={loadBookings}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="alert error-alert">{error}</div>}
      {success && <div className="alert success-alert">{success}</div>}

      {!isAdmin && (
        <section className="panel booking-form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NEW RESERVATION</span>
              <h2>Book a journey</h2>
            </div>
            <Ticket size={24} />
          </div>

          <form className="booking-form" onSubmit={createBooking}>
            <label>
              Select schedule
              <select
                value={scheduleId}
                onChange={(event) => setScheduleId(event.target.value)}
                required
              >
                <option value="">Choose your destination</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.route?.origin} → {schedule.route?.destination}
                    {" · "}
                    {new Date(schedule.departure_time).toLocaleString()}
                    {" · ₱"}
                    {Number(schedule.fare).toFixed(2)}
                    {" · "}
                    {schedule.available_seats} seats left
                  </option>
                ))}
              </select>
            </label>

            <label>
              Seats
              <input
                type="number"
                min="1"
                max="10"
                value={seats}
                onChange={(event) => setSeats(event.target.value)}
                required
              />
            </label>

            <button className="button-primary" disabled={saving}>
              {saving ? "Submitting..." : "Submit booking"}
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{isAdmin ? "Passenger reservations" : "Booking history"}</h2>
            <p className="muted">Records returned by the Blue Way API.</p>
          </div>

          <select
            className="filter-select"
            value={searchStatus}
            onChange={(event) => {
              setSearchStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="page-loading">Loading bookings...</div>
        ) : bookings.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  {isAdmin && <th>Passenger</th>}
                  <th>Journey</th>
                  <th>Departure</th>
                  <th>Seats</th>
                  <th>Total fare</th>
                  <th>Status</th>
                  {isAdmin && <th>Update status</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>BW-{String(booking.id).padStart(4, "0")}</td>
                    {isAdmin && <td>{booking.passenger?.name || "—"}</td>}
                    <td>
                      {booking.schedule?.origin ||
                        booking.schedule?.route?.origin ||
                        "—"}
                      {" → "}
                      {booking.schedule?.destination ||
                        booking.schedule?.route?.destination ||
                        "—"}
                    </td>
                    <td>
                      {booking.schedule?.departure_time
                        ? new Date(booking.schedule.departure_time).toLocaleString()
                        : "—"}
                    </td>
                    <td>{booking.seats}</td>
                    <td>₱{Number(booking.total_fare).toFixed(2)}</td>
                    <td>
                      <span className={`status-pill status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="table-actions">
                          {booking.status === "pending" && (
                            <>
                              <button
                                className="button-small"
                                onClick={() => updateStatus(booking, "confirmed")}
                              >
                                <Check size={14} /> Confirm
                              </button>
                              <button
                                className="button-small button-danger"
                                onClick={() => updateStatus(booking, "cancelled")}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {booking.status === "confirmed" && (
                            <>
                              <button
                                className="button-small"
                                onClick={() => updateStatus(booking, "completed")}
                              >
                                Complete
                              </button>
                              <button
                                className="button-small button-danger"
                                onClick={() => updateStatus(booking, "cancelled")}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No bookings match your filter.</div>
        )}

        <div className="pagination">
          <span>Page {page} of {lastPage}</span>
          <div>
            <button
              className="button-secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <button
              className="button-secondary"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}