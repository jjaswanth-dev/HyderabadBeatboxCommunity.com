"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import { Trophy, Search, Check, Crown, Flame, ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";
import { DEFAULT_25_BEATBOXERS } from "@/lib/draw24Defaults";

interface BeatboxerItem {
  id: number;
  name: string;
  status: string;
}

export default function Draw24Page() {
  const [data, setData] = useState<{
    title: string;
    beatboxers: BeatboxerItem[];
  }>({
    title: "Hyderabad Beatbox Championship 2026",
    beatboxers: DEFAULT_25_BEATBOXERS,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadDrawData() {
      try {
        const res = await fetch("/api/draw-24");
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.beatboxers) && json.beatboxers.length > 0) {
            setData({
              title: json.title || "Hyderabad Beatbox Championship 2026",
              beatboxers: json.beatboxers,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load Draw 24 data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDrawData();
  }, []);

  const rosterList = data.beatboxers || DEFAULT_25_BEATBOXERS;

  const filteredBeatboxers = useMemo(() => {
    if (!searchQuery.trim()) return rosterList;
    const q = searchQuery.toLowerCase();
    return rosterList.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        String(b.id).includes(q) ||
        `#${String(b.id).padStart(2, "0")}`.toLowerCase().includes(q)
    );
  }, [rosterList, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-[#FDE047] selection:text-black font-sans">
      <Header />

      {/* Hero Banner styled after Championship Hub */}
      <section className="pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#151515] border-2 border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-[#FDE047] text-black font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <Crown className="w-3.5 h-3.5" /> OFFICIAL SELECTION
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                National Top 25 Roster
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-mono bg-[#202020] border border-neutral-700/80 px-2.5 py-1 rounded-md">
                Draw 25 &bull; {data.title}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Official qualified contenders selected from nationwide wildcards to compete in the National Championship eliminations and battle tournament.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#202020] border border-neutral-700 text-xs font-bold text-white shrink-0 self-start sm:self-auto">
              <Trophy className="w-4 h-4 text-[#FDE047]" />
              <span>{rosterList.length} Qualified Contenders</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-4">
        {/* Search & Info Bar */}
        <div className="bg-[#151515] border border-neutral-800 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-neutral-300 font-medium flex items-center gap-2">
            <span>Division:</span>
            <span className="bg-[#FDE047] text-black font-black px-2 py-0.5 rounded text-[11px] uppercase">
              National Division
            </span>
            <span className="text-neutral-500 hidden sm:inline">&bull; Official Seed Order</span>
          </div>

          {/* Search Box matching Championship Leaderboard */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contender or seed #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-neutral-700 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Leaderboard Style Table matching Championship Hub */}
        <div className="border border-neutral-800 bg-[#141414] overflow-hidden rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1c1c1c] text-neutral-300 font-bold text-[11px] uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 w-20">Seed #</th>
                  <th className="py-3 px-4 w-32">Contender ID</th>
                  <th className="py-3 px-4">Beatboxer Name</th>
                  <th className="py-3 px-4 text-center w-36">Category</th>
                  <th className="py-3 px-4 text-right w-44">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredBeatboxers.map((contender, index) => {
                  const seedNum = contender.id || index + 1;
                  const formattedNum = `#${String(seedNum).padStart(2, "0")}`;

                  return (
                    <tr
                      key={contender.id || index}
                      className="transition-colors hover:bg-neutral-800/30"
                    >
                      {/* Seed Medal / Badge */}
                      <td className="py-3.5 px-4 font-black text-sm">
                        {seedNum === 1 ? (
                          <span className="bg-[#FDE047] text-black px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1 shadow-sm">
                            🥇 1
                          </span>
                        ) : seedNum === 2 ? (
                          <span className="bg-neutral-200 text-black px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1">
                            🥈 2
                          </span>
                        ) : seedNum === 3 ? (
                          <span className="bg-[#f97316] text-black px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1">
                            🥉 3
                          </span>
                        ) : (
                          <span className="bg-[#202020] text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-md font-mono font-bold text-xs">
                            #{seedNum}
                          </span>
                        )}
                      </td>

                      {/* Contender ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-400">
                        {formattedNum}
                      </td>

                      {/* Beatboxer Name */}
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        <span className="text-white hover:text-[#FDE047] transition-colors">
                          {contender.name}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-center font-mono text-neutral-400 text-xs">
                        <span className="bg-[#1a1a1a] border border-neutral-800 px-2.5 py-1 rounded-md text-[11px] text-neutral-300">
                          National Solo
                        </span>
                      </td>

                      {/* Confirmed Status Pill */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                          <Check className="w-3 h-3 stroke-[3]" /> Confirmed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBeatboxers.length === 0 && (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No contenders found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </section>

      {/* Clean Modern Footer */}
      <footer className="border-t border-neutral-800 bg-[#0a0a0a] py-6 text-center text-xs text-neutral-500 mt-auto">
        <p>&copy; {new Date().getFullYear()} Hyderabad Beatbox Community. All rights reserved.</p>
      </footer>
    </div>
  );
}
