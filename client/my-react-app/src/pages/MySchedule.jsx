
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, Clock, MapPin, BookmarkX } from "lucide-react";
import api from "../../api/axios.js";

const MySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const response = await api.get("/sessions/my-schedule");

      setSchedule(response.data.schedule || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load schedule"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleRemoveBookmark = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}/bookmark`);

      setSchedule((previous) =>
        previous.filter(
          (item) => item.session?._id !== sessionId
        )
      );

      toast.success("Session removed from your schedule");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove session"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading your schedule...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          My Schedule
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Your bookmarked sessions and workshops.
        </p>
      </div>

      {schedule.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <CalendarDays className="mx-auto mb-4 h-10 w-10 text-slate-400" />

          <h2 className="text-lg font-semibold text-slate-900">
            No bookmarked sessions
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Browse an event schedule and bookmark sessions
            you're interested in.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedule.map((item) => {
            const session = item.session;

            if (!session) return null;

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {session.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {session.event?.title || "Event"}
                    </p>

                    {session.description && (
                      <p className="mt-3 text-sm text-slate-600">
                        {session.description}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />

                        {new Date(session.startTime).toLocaleString()}
                      </p>

                      {session.event?.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />

                          {session.event.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBookmark(session._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <BookmarkX className="h-4 w-4" />

                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySchedule;
