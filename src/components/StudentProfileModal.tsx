import React, { useState } from 'react';
import { User, GraduationCap, Building2, Check, Sparkles, X } from 'lucide-react';
import { UserProfile } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const DEPARTMENTS = [
  { code: 'CS', name: 'Computer Science & Engineering (CS)', desc: 'AI, Data, Software & Systems' },
  { code: 'ECE', name: 'Electronics & Communication (ECE)', desc: 'VLSI, Communications & Embedded' },
  { code: 'EEE', name: 'Electrical & Electronics (EEE)', desc: 'Power Systems, Machines & Renewable' },
  { code: 'MECH', name: 'Mechanical Engineering (MECH)', desc: 'Thermal, Robotics & CAD/CAM' },
  { code: 'CIVIL', name: 'Civil Engineering (CIVIL)', desc: 'Structures, Survey & Geotechnical' },
  { code: 'MCA', name: 'Master of Computer Applications (MCA)', desc: 'Cloud, App Architecture & Computing' },
  { code: 'MTECH', name: 'Master of Technology (M.Tech)', desc: 'Advanced Research & PG Programs' },
  { code: 'ALL', name: 'College-Wide (Show All Departments)', desc: 'Campus-wide circulars & all branches' },
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentProfile.name || 'Student');
  const [department, setDepartment] = useState(currentProfile.department || 'CS');
  const [year, setYear] = useState(currentProfile.year || '3rd Year');
  const [isHosteller, setIsHosteller] = useState(currentProfile.isHosteller ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Student',
      department,
      year,
      isHosteller,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-cyan-950/30 p-6 sm:p-7">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Student Profile & Branch
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cleanses notices for other departments from your feed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aditya Nair"
              className="w-full px-3.5 py-2 text-sm bg-slate-950/60 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-xl text-white font-medium placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
              Department / Branch (7 College Faculties)
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-950/60 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-xl text-white font-medium cursor-pointer transition-colors"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.code} value={dept.code} className="bg-slate-900 text-white">
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Irrelevant circulars for other faculties will be hidden from your main feed while general college-wide circulars stay visible.
            </p>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
              Academic Year
            </label>
            <div className="grid grid-cols-3 gap-2">
              {YEARS.slice(0, 4).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                    year === y
                      ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 border-cyan-400 font-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/60 text-slate-300 border-white/5 hover:border-white/20'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Hosteller toggle */}
          <div className="pt-2">
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={isHosteller}
                onChange={(e) => setIsHosteller(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span>I reside in a campus hostel (include mess & hostel clearance notices)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-slate-950 font-bold" />
              <span>Save & Filter Feed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
