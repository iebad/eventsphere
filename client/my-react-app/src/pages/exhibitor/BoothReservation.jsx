import { useEffect, useState } from "react";
import {
  MapPin,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../api/axios";

const BoothReservation = () => {
  const [applications, setApplications] = useState([]);
  const [booths, setBooths] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [boothsLoading, setBoothsLoading] = useState(false);
  const [reserving, setReserving] = useState(false);

  const selectedApplication = applications.find(
    (app) => app.event?._id === selectedEvent
  );

  const hasReservedBooth = booths.some((booth) => booth.isMyBooth);

  // Fetch approved applications
  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/exhibitor/my-applications");

      const approved = (data.applications || []).filter(
        (app) => app.status === "approved" && app.event
      );

      setApplications(approved);

      setSelectedEvent((current) =>
        approved.some((app) => app.event._id === current)
          ? current
          : approved[0]?.event?._id || ""
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load applications."
      );
    }
  };

  // Fetch floor plan
  const fetchBooths = async (eventId) => {
    if (!eventId) {
      setBooths([]);
      return;
    }

    try {
      setBoothsLoading(true);

      const { data } = await api.get(
        `/events/${eventId}/booths/floor-plan`
      );

      setBooths(data.booths || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load floor plan."
      );
    } finally {
      setBoothsLoading(false);
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      await fetchApplications();
      setLoading(false);
    };

    loadApplications();
  }, []);

  useEffect(() => {
    fetchBooths(selectedEvent);
  }, [selectedEvent]);

  // Reserve booth
  const handleReserve = async (boothId) => {
    if (!selectedEvent || reserving) return;

    if (!window.confirm("Are you sure you want to reserve this booth?")) {
      return;
    }

    try {
      setReserving(true);

      const { data } = await api.post(
        `/events/${selectedEvent}/booths/${boothId}/reserve`
      );

      toast.success(data.message || "Booth reserved successfully!");

      await fetchApplications();
      await fetchBooths(selectedEvent);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Booth reservation failed."
      );

      await fetchBooths(selectedEvent);
    } finally {
      setReserving(false);
    }
  };

  const refreshData = async () => {
    await fetchApplications();
    await fetchBooths(selectedEvent);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Booth Reservation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View the floor plan and reserve your booth.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* No approved applications */}
      {applications.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <AlertCircle
            className="mx-auto mb-3 text-amber-500"
            size={32}
          />
          <h2 className="font-bold">No Approved Applications</h2>
          <p className="mt-2 text-sm text-slate-500">
            You need an approved event application to reserve a booth.
          </p>
        </div>
      ) : (
        <>
          {/* Event selection */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-3 font-bold">Select Event</h2>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              {applications.map((app) => (
                <option key={app._id} value={app.event._id}>
                  {app.event.title}
                </option>
              ))}
            </select>

            {selectedApplication?.event && (
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <MapPin size={17} />
                  {selectedApplication.event.location || "N/A"}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays size={17} />
                  {selectedApplication.event.startDate
                    ? new Date(
                        selectedApplication.event.startDate
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            )}
          </div>

          {/* Floor plan */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-2 text-xl font-bold">
              Event Floor Plan
            </h2>

            <div className="mb-5 flex flex-wrap gap-4 text-sm">
              <span>🟢 Available</span>
              <span>🟡 Reserved</span>
              <span>🔴 Occupied</span>

              <span className="flex items-center gap-2">
                <CheckCircle size={20} className="text-indigo-600" />
                Your booth
              </span>
            </div>

            {!hasReservedBooth && (
              <p className="mb-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">
                You haven't reserved a booth yet. Select an available
                booth below.
              </p>
            )}

            {boothsLoading ? (
              <div className="py-10 text-center">
                <Loader2 className="mx-auto animate-spin text-indigo-600" />
              </div>
            ) : booths.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                No booths available for this event.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {booths.map((booth) => (
                  <div
                    key={booth._id}
                    className={`group relative flex min-h-24 flex-col items-center justify-center rounded-lg border-2 p-3 text-center ${
                      booth.isMyBooth
                        ? "border-indigo-600 bg-indigo-100"
                        : booth.status === "available"
                        ? "border-green-500 bg-green-50"
                        : booth.status === "reserved"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    {booth.isMyBooth && (
                      <CheckCircle
                        size={20}
                        className="absolute right-2 top-2 text-indigo-600"
                      />
                    )}

                    <strong>{booth.boothNumber}</strong>

                    <span className="text-xs capitalize">
                      {booth.status}
                    </span>

                    <span className="text-xs capitalize">
                      {booth.size}
                    </span>

                    {/* Exhibitor hover information */}
                    {booth.assignedTo && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-52 -translate-x-1/2 rounded-lg bg-slate-900 p-3 text-left text-white shadow-xl group-hover:block">
                        <p className="font-semibold">
                          {booth.assignedTo.username ||
                            booth.assignedTo.name ||
                            "Exhibitor"}
                        </p>

                        <p className="mt-1 text-xs text-slate-300">
                          {booth.assignedTo.companyName ||
                            "Company not provided"}
                        </p>
                      </div>
                    )}

                    {/* Reserve button */}
                    {booth.status === "available" &&
                      !hasReservedBooth && (
                        <button
                          type="button"
                          onClick={() => handleReserve(booth._id)}
                          disabled={reserving}
                          className="mt-2 rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {reserving ? "Reserving..." : "Reserve"}
                        </button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reservation confirmation */}
          {hasReservedBooth && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
              <CheckCircle size={22} />
              <p className="text-sm font-semibold">
                You have successfully reserved a booth for this event.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoothReservation;