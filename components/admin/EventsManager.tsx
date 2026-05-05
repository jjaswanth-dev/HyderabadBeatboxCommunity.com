"use client";

import { useState, useEffect } from "react";

export default function EventsManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "", date: "", description: "", details: "", location: "", image: "", ticketLink: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...newEvent,
          details: newEvent.details.split("\n").map((d) => d.trim()).filter((d) => d.length > 0),
        }),
      });
      fetchEvents();
      setNewEvent({ title: "", date: "", description: "", details: "", location: "", image: "", ticketLink: "" });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="glass-effect border border-white/10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto">
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event Title" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <input type="text" value={newEvent.image} onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })} placeholder="Event Image URL" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <input type="text" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} placeholder="Event Date" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Description" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <textarea value={newEvent.details} onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })} placeholder="Details (one per line)" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Location" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <input type="text" value={newEvent.ticketLink} onChange={(e) => setNewEvent({ ...newEvent, ticketLink: e.target.value })} placeholder="Ticket Link (Optional)" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold uppercase tracking-wider shadow-lg">Add Event</button>
        </form>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-xl text-white font-bold">{event.title}</h3>
                <p className="text-white/60">{event.date}</p>
              </div>
              <button onClick={() => handleDelete(event._id)} className="bg-red-600/80 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
