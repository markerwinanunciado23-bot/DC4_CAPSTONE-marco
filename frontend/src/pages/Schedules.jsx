import { useEffect, useState } from "react";
import ResourceManager from "../components/ResourceManager";
import api from "../services/api";

export default function Schedules() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [busResponse, routeResponse] = await Promise.all([
          api.get("/buses", { params: { page: 1 } }),
          api.get("/routes", { params: { page: 1 } }),
        ]);

        setBuses(busResponse.data.data || []);
        setRoutes(routeResponse.data.data || []);
      } catch {
        setLoadError("Unable to load bus and route options.");
      }
    }

    loadOptions();
  }, []);

  return (
    <>
      {loadError && <div className="alert error-alert">{loadError}</div>}

      <ResourceManager
        title="Schedules"
        endpoint="/schedules"
        description="Set departures, arrival times, fares, and seat availability."
        fields={[
          {
            name: "bus_id",
            label: "Bus",
            type: "select",
            required: true,
            options: buses.map((bus) => ({
              value: String(bus.id),
              label: `${bus.name} (${bus.plate_number})`,
            })),
          },
          {
            name: "route_id",
            label: "Route",
            type: "select",
            required: true,
            options: routes.map((route) => ({
              value: String(route.id),
              label: `${route.origin} → ${route.destination}`,
            })),
          },
          {
            name: "departure_time",
            label: "Departure",
            type: "datetime-local",
            required: true,
          },
          {
            name: "arrival_time",
            label: "Arrival",
            type: "datetime-local",
            required: true,
          },
          {
            name: "fare",
            label: "Fare (₱)",
            type: "number",
            min: 0,
            step: "0.01",
            required: true,
          },
          {
            name: "available_seats",
            label: "Available seats",
            type: "number",
            min: 0,
            required: true,
          },
        ]}
        columns={[
          {
            key: "bus",
            label: "Bus",
            render: (schedule) => schedule.bus?.name || "—",
          },
          {
            key: "route",
            label: "Route",
            render: (schedule) =>
              `${schedule.route?.origin || "—"} → ${schedule.route?.destination || "—"}`,
          },
          {
            key: "departure_time",
            label: "Departure",
            render: (schedule) =>
              schedule.departure_time
                ? new Date(schedule.departure_time).toLocaleString()
                : "—",
          },
          {
            key: "fare",
            label: "Fare",
            render: (schedule) =>
              `₱${Number(schedule.fare).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}`,
          },
          { key: "available_seats", label: "Seats left" },
        ]}
      />
    </>
  );
}