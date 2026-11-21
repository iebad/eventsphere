
function OrganizerFloorPlan({ eventId, booths, loading }) {
  if (!eventId) {
    return <p>Please select an expo first.</p>;
  }

  if (loading) {
    return <p>Loading floor plan...</p>;
  }

  if (booths.length === 0) {
    return <p>No booths available for this event.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Expo Floor Plan
      </h2>

      <div className="floor-plan">
        {booths.map((booth) => (
          <div
            key={booth._id}
            className={`booth ${booth.status}`}
            style={{
              gridRow: booth.row,
              gridColumn: booth.column,
            }}
          >
              <strong>{booth.boothNumber}</strong>

              <p>{booth.status}</p>

              <p>{booth.size}</p>

              {booth.assignedTo && (
                <div className="booth-tooltip">
                  <p>
                    <strong>Exhibitor:</strong>{" "}
                    {booth.assignedTo.username}
                  </p>
              
                  <p>
                    <strong>Company:</strong>{" "}
                    {booth.assignedTo.companyName || "Not provided"}
                  </p>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrganizerFloorPlan;
