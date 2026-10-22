import ResourceManager from "../components/ResourceManager";

export default function Routes() {
  return (
    <ResourceManager
      title="Routes"
      endpoint="/routes"
      description="Maintain origins, destinations, and route details."
      fields={[
        { name: "origin", label: "Origin", required: true },
        { name: "destination", label: "Destination", required: true },
        {
          name: "description",
          label: "Route description",
          type: "textarea",
          nullable: true,
        },
      ]}
      columns={[
        { key: "origin", label: "Origin" },
        { key: "destination", label: "Destination" },
        { key: "description", label: "Description" },
        { key: "schedules_count", label: "Schedules" },
      ]}
    />
  );
}