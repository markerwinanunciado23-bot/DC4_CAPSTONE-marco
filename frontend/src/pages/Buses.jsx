import ResourceManager from "../components/ResourceManager";

export default function Buses() {
  return (
    <ResourceManager
      title="Buses"
      endpoint="/buses"
      description="Manage the Blue Way fleet and operational status."
      fields={[
        { name: "name", label: "Bus name", required: true },
        { name: "plate_number", label: "Plate number", required: true },
        { name: "seat_capacity", label: "Seat capacity", type: "number", min: 1, required: true },
        {
          name: "status",
          label: "Operational status",
          type: "select",
          required: true,
          defaultValue: "active",
          options: [
            { value: "active", label: "Active" },
            { value: "maintenance", label: "Maintenance" },
            { value: "inactive", label: "Inactive" },
          ],
        },
      ]}
      columns={[
        { key: "name", label: "Bus name" },
        { key: "plate_number", label: "Plate number" },
        { key: "seat_capacity", label: "Seats" },
        {
          key: "status",
          label: "Status",
          render: (bus) => (
            <span className={`status-pill status-${bus.status}`}>
              {bus.status}
            </span>
          ),
        },
      ]}
    />
  );
}