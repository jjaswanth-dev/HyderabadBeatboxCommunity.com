import React, { useState, useEffect } from "react";
import axios from "axios";

function EventsManager() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    description: "",
    details: "",
    location: "",
    image: "",
    ticketLink: "",
  });

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/events`
      );
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/events`,
        {
          ...newEvent,
          details: newEvent.details
            .split("\n")
            .map((d) => d.trim())
            .filter((d) => d.length > 0),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchEvents();
      setNewEvent({
        title: "",
        date: "",
        description: "",
        details: "",
        location: "",
        image: "",
        ticketLink: "",
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Removed duplicate useEffect and handleSubmit definitions

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto">
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Event Title"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="text"
            value={newEvent.image}
            onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
            placeholder="Event Image URL"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="text"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            placeholder="Event Date"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <textarea
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            placeholder="Description"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <textarea
            value={newEvent.details}
            onChange={(e) =>
              setNewEvent({ ...newEvent, details: e.target.value })
            }
            placeholder="Details (one per line)"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="text"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
            placeholder="Location"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="text"
            value={newEvent.ticketLink}
            onChange={(e) =>
              setNewEvent({ ...newEvent, ticketLink: e.target.value })
            }
            placeholder="Ticket Link (Optional)"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Event
          </button>
        </form>

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white bg-opacity-20 p-4 rounded-lg">
              <h3 className="text-xl text-white">{event.title}</h3>
              <p className="text-gray-300">{event.date}</p>
              <button
                onClick={() => handleDelete(event._id)}
                className="bg-red-600 text-white px-2 py-1 rounded-lg mt-2 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventsManager;