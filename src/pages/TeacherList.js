import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function TeacherList() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherSchedules, setTeacherSchedules] = useState({});
  const [view, setView] = useState(Views.WEEK);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        const teachersWithName = data.map((t) => ({
          ...t,
          name: t.name || (t.first_name && t.last_name ? `${t.first_name} ${t.last_name}` : ""),
        }));
        setTeachers(teachersWithName);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching teachers:", err);
        setLoading(false);
      });
  }, []);

  const fetchEventsForUser = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3000/myCalendar?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch calendar events");
      const data = await res.json();

      const formatted = data.map((event) => ({
        id: event.idcalendar,
        title: event.class_name,
        start: moment.tz(event.start_time, "America/Chicago").toDate(),
        end: moment.tz(event.end_time, "America/Chicago").toDate(),
      }));

      setTeacherSchedules((prev) => ({
        ...prev,
        [userId]: formatted,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to load calendar events");
    }
  };

  useEffect(() => {
    if (selectedTeacher) {
      fetchEventsForUser(selectedTeacher.id);
      setDeleteMode(false);
      setSelectedForDelete([]);
    }
  }, [selectedTeacher]);

  const filteredTeachers = teachers.filter(
    (teacher) => teacher.name && teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSelectSlot = async ({ start, end }) => {
    const title = window.prompt("Enter event title:");
    if (!title) return;

    const classId = 1;

    try {
      const startCST = moment(start).tz("America/Chicago").format("YYYY-MM-DD HH:mm:ss");
      const endCST = moment(end).tz("America/Chicago").format("YYYY-MM-DD HH:mm:ss");

      const res = await fetch("http://localhost:3000/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: startCST,
          end_time: endCST,
          class_id: classId,
          class_name: title,
        }),
      });

      if (!res.ok) throw new Error("Failed to add event");

      const newEvent = await res.json();

      setTeacherSchedules((prev) => {
        const currentEvents = prev[selectedTeacher.id] || [];
        return {
          ...prev,
          [selectedTeacher.id]: [
            ...currentEvents,
            {
              id: newEvent.idcalendar,
              title,
              start: moment.tz(newEvent.start_time, "America/Chicago").toDate(),
              end: moment.tz(newEvent.end_time, "America/Chicago").toDate(),
            },
          ],
        };
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectEvent = (event) => {
    if (deleteMode) {
      if (selectedForDelete.includes(event.id)) {
        setSelectedForDelete(selectedForDelete.filter((id) => id !== event.id));
      } else {
        setSelectedForDelete([...selectedForDelete, event.id]);
      }
    } else {
      if (window.confirm(`Delete the event: "${event.title}"?`)) {
        fetch(`http://localhost:3000/calendar/${event.id}`, {
          method: "DELETE",
        })
          .then(() => {
            setTeacherSchedules((prev) => {
              const currentEvents = prev[selectedTeacher.id] || [];
              const updatedEvents = currentEvents.filter((e) => e.id !== event.id);
              return {
                ...prev,
                [selectedTeacher.id]: updatedEvents,
              };
            });
          })
          .catch((err) => {
            console.error("Failed to delete event", err);
            alert("Failed to delete event");
          });
      }
    }
  };

  const handleDeleteModeToggle = () => {
    setDeleteMode(!deleteMode);
    setSelectedForDelete([]);
  };

  const handleSelectAll = () => {
    const allEvents = teacherSchedules[selectedTeacher.id] || [];
    if (selectedForDelete.length === allEvents.length) {
      setSelectedForDelete([]);
    } else {
      setSelectedForDelete(allEvents.map((e) => e.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedForDelete.length === 0) {
      alert("No events selected");
      return;
    }
    if (!window.confirm(`Delete ${selectedForDelete.length} selected events?`)) return;

    Promise.all(
      selectedForDelete.map((id) =>
        fetch(`http://localhost:3000/calendar/${id}`, {
          method: "DELETE",
        })
      )
    )
      .then(() => {
        setTeacherSchedules((prev) => {
          const currentEvents = prev[selectedTeacher.id] || [];
          const updatedEvents = currentEvents.filter((e) => !selectedForDelete.includes(e.id));
          return {
            ...prev,
            [selectedTeacher.id]: updatedEvents,
          };
        });
        setSelectedForDelete([]);
        setDeleteMode(false);
      })
      .catch((err) => {
        console.error("Failed to delete events", err);
        alert("Failed to delete events");
      });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar onLogout={handleLogout} />
      <div style={{ flex: 1, backgroundColor: "white", padding: "40px", overflowY: "auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
          View Teacher Schedules
        </h1>

        <p style={{ marginBottom: "20px" }}>
          To add an event, select a time slot in the calendar and enter a title.
          To delete events, click the "Delete Events" button below.
        </p>

        {loading ? (
          <p>Loading teachers...</p>
        ) : !selectedTeacher ? (
          <div>
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchStyle}
            />
            <p style={{ marginBottom: "15px", marginTop: "10px" }}>
              Select a teacher to view their schedule:
            </p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <li key={teacher.id} style={{ marginBottom: "10px" }}>
                    <button
                      style={buttonStyle}
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      {teacher.name}
                    </button>
                  </li>
                ))
              ) : (
                <li>No teachers found.</li>
              )}
            </ul>
          </div>
        ) : (
          <div>
            <button
              style={{
                ...buttonStyle,
                marginBottom: "20px",
                backgroundColor: "#95a5a6",
              }}
              onClick={() => {
                setSelectedTeacher(null);
                setDeleteMode(false);
                setSelectedForDelete([]);
              }}
            >
              ← Back to Teacher List
            </button>

            <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
              {selectedTeacher.name}'s Calendar
            </h2>

            <div style={{ marginBottom: "10px" }}>
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: "#c0392b",
                  marginRight: "10px",
                }}
                onClick={handleDeleteModeToggle}
              >
                {deleteMode ? "Cancel Delete" : "Delete Events"}
              </button>

              {deleteMode && (
                <>
                  <button
                    style={{ ...buttonStyle, backgroundColor: "#34495e", marginRight: "10px" }}
                    onClick={handleSelectAll}
                  >
                    {selectedForDelete.length === (teacherSchedules[selectedTeacher.id] || []).length
                      ? "Unselect All"
                      : "Select All"}
                  </button>
                  <button
                    style={{ ...buttonStyle, backgroundColor: "#c0392b" }}
                    onClick={handleDeleteSelected}
                  >
                    Delete Selected
                  </button>
                </>
              )}
            </div>

            <Calendar
              localizer={localizer}
              events={teacherSchedules[selectedTeacher.id] || []}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              views={["month", "week", "day"]}
              view={view}
              onView={(newView) => setView(newView)}
              defaultDate={new Date()}
              eventPropGetter={(event) => {
                if (deleteMode && selectedForDelete.includes(event.id)) {
                  return { style: { backgroundColor: "#e74c3c" } };
                }
                return {};
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 15px",
  backgroundColor: "#2980b9",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const searchStyle = {
  padding: "10px",
  width: "100%",
  maxWidth: "400px",
  fontSize: "16px",
  marginBottom: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};
