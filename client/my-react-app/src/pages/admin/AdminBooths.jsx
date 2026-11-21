import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import OrganizerFloorPlan from "../../components/OrganizerFloorPlan";
import "./AdminBooths.css";

const initialForm = {
  boothNumber: "",
  size: "medium",
  price: "",
  row: "1",
  column: "1",
};

const AdminBooths = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [booths, setBooths] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      const { data } = await api.get("/admin/events");
      const eventList = Array.isArray(data) ? data : data.events || [];

      setEvents(eventList);

      if (eventList.length > 0) {
        setSelectedEvent((current) => current || eventList[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events");
    }
  };

  const fetchBooths = async () => {
    if (!selectedEvent) {
      setBooths([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        `/events/${selectedEvent}/booths`
      );

      setBooths(data.booths || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load booths");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchBooths();
  }, [selectedEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEvent) {
      alert("Please select an event first");
      return;
    }

    const price = Number(form.price);
    const row = Number(form.row);
    const column = Number(form.column);

    if (
      !form.boothNumber.trim() ||
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(row) ||
      row < 1 ||
      !Number.isInteger(column) ||
      column < 1
    ) {
      alert("Please enter valid booth details");
      return;
    }

    const payload = {
      boothNumber: form.boothNumber.trim(),
      size: form.size,
      price,
      row,
      column,
    };

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await api.patch(
          `/events/${selectedEvent}/booths/${editingId}`,
          payload
        );
        alert("Booth updated successfully");
      } else {
        await api.post(
          `/events/${selectedEvent}/booths`,
          payload
        );
        alert("Booth created successfully");
      }

      resetForm();
      await fetchBooths();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (booth) => {
    setEditingId(booth._id);
    setForm({
      boothNumber: booth.boothNumber || "",
      size: booth.size || "medium",
      price: String(booth.price ?? ""),
      row: String(booth.row ?? 1),
      column: String(booth.column ?? 1),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (boothId) => {
    if (!window.confirm("Are you sure you want to delete this booth?")) {
      return;
    }

    try {
      await api.delete(
        `/events/${selectedEvent}/booths/${boothId}`
      );

      alert("Booth deleted successfully");
      await fetchBooths();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete booth");
    }
  };

  const stats = useMemo(
    () => ({
      total: booths.length,
      available: booths.filter((b) => b.status === "available").length,
      reserved: booths.filter((b) => b.status === "reserved").length,
      occupied: booths.filter((b) => b.status === "occupied").length,
    }),
    [booths]
  );

  const filteredBooths =
    filter === "all"
      ? booths
      : booths.filter((booth) => booth.status === filter);

  return (
    <div className="admin-booths">
      <div className="booths-header">
        <div>
          <h1>Booth Management</h1>
          <p>Create, manage and monitor event booth spaces.</p>
        </div>

        <button
          type="button"
          onClick={fetchBooths}
          disabled={!selectedEvent || loading}
        >
          Refresh
        </button>
      </div>

      <div className="booth-event-selector">
        <label htmlFor="eventSelect">Select Event</label>
        <select
          id="eventSelect"
          value={selectedEvent}
          onChange={(e) => {
            setSelectedEvent(e.target.value);
            resetForm();
            setFilter("all");
          }}
        >
          {events.length === 0 && (
            <option value="">No events available</option>
          )}

          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title || event.name}
            </option>
          ))}
        </select>
      </div>

      <div className="booth-stats">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className={`stat-card ${key === "total" ? "" : key}`}
          >
            <h3>{key.charAt(0).toUpperCase() + key.slice(1)} Booths</h3>
            <p>{value}</p>
          </div>
        ))}
      </div>

      <OrganizerFloorPlan
        eventId={selectedEvent}
        booths={booths}
        loading={loading}
      />

      <div className="booth-form-card">
        <h2>{editingId ? "Update Booth" : "Create New Booth"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="boothNumber">Booth Number</label>
            <input
              id="boothNumber"
              name="boothNumber"
              value={form.boothNumber}
              onChange={handleChange}
              placeholder="Example: A-101"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="size">Booth Size</label>
            <select
              id="size"
              name="size"
              value={form.size}
              onChange={handleChange}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter booth price"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="row">Row</label>
            <input
              id="row"
              type="number"
              name="row"
              min="1"
              step="1"
              value={form.row}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="column">Column</label>
            <input
              id="column"
              type="number"
              name="column"
              min="1"
              step="1"
              value={form.column}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving || !selectedEvent}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Booth"
                  : "Create Booth"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="booth-list-card">
        <div className="booth-list-header">
          <h2>All Booths</h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Booths</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>

        {error && <p className="booth-error">{error}</p>}

        {loading ? (
          <p>Loading booths...</p>
        ) : !selectedEvent ? (
          <p>Please create an event first.</p>
        ) : filteredBooths.length === 0 ? (
          <p>No booths found for this event.</p>
        ) : (
          <div className="booth-table-wrapper">
            <table className="booth-table">
              <thead>
                <tr>
                  <th>Booth Number</th>
                  <th>Size</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Assigned Exhibitor</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooths.map((booth) => (
                  <tr key={booth._id}>
                    <td>{booth.boothNumber}</td>
                    <td>{booth.size}</td>
                    <td>{Number(booth.price).toLocaleString()}</td>
                    <td>
                      <span className={`booth-status ${booth.status}`}>
                        {booth.status}
                      </span>
                    </td>
                    <td>
                      {booth.assignedTo?.username ||
                        booth.assignedTo?.email ||
                        "Not assigned"}
                    </td>
                    <td>
                      <div className="booth-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(booth)}
                          disabled={booth.status !== "available"}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(booth._id)}
                          disabled={booth.status !== "available"}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBooths;