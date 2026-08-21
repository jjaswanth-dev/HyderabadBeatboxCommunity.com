"use client";

import { useState, useEffect } from "react";

export default function EventsManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "", date: "", description: "", details: "", location: "", image: "", ticketLink: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const startEdit = (event: any) => {
    setEditingId(event._id);
    setNewEvent({
      title: event.title || "",
      date: event.date || "",
      description: event.description || "",
      details: Array.isArray(event.details) ? event.details.join("\n") : (event.details || ""),
      location: event.location || "",
      image: event.image || "",
      ticketLink: event.ticketLink || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewEvent({ title: "", date: "", description: "", details: "", location: "", image: "", ticketLink: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...newEvent,
          details: newEvent.details.split("\n").map((d) => d.trim()).filter((d) => d.length > 0),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save event");
      }

      fetchEvents();
      cancelEdit();
    } catch (error: any) {
      console.error(editingId ? "Error updating event:" : "Error creating event:", error);
      alert(error.message || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete event");
      }
      fetchEvents();
      if (editingId === id) {
        cancelEdit();
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      alert(error.message || "An error occurred");
    }
  };

  return (
    <div className="glass-effect border border-white/10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {editingId ? "Edit Event" : "Add New Event"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event Title" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" required />
            <input type="text" value={newEvent.image} onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })} placeholder="Event Image URL" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" required />
            <input type="text" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} placeholder="Event Date" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" required />
            <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Description" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" required />
            <textarea value={newEvent.details} onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })} placeholder="Details (one per line)" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
            <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Location" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" required />
            <input type="text" value={newEvent.ticketLink} onChange={(e) => setNewEvent({ ...newEvent, ticketLink: e.target.value })} placeholder="Ticket Link (Optional)" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold uppercase tracking-wider shadow-lg">
                {editingId ? "Update Event" : "Add Event"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-bold uppercase tracking-wider shadow-lg">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Existing Events</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-xl text-white font-bold">{event.title}</h3>
                  <p className="text-white/60">{event.date}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(event)} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(event._id)} className="bg-red-600/80 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
