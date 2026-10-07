import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  AlertTriangle,
  User as UserIcon,
  ChevronDown,
  Check,
  Sparkles,
  LogOut,
  Users,
  HeartPulse,
  Menu,
} from 'lucide-react';
import { User, FamilyMember, NotificationItem } from '../types';

interface HeaderProps {
  user: User | null;
  familyMembers: FamilyMember[];
  activeMember: FamilyMember | null;
  onSelectMember: (member: FamilyMember) => void;
  notifications: NotificationItem[];
  onOpenEmergency: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onToggleMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  familyMembers,
  activeMember,
  onSelectMember,
  notifications,
  onOpenEmergency,
  onOpenAuth,
  onLogout,
  onNavigate,
  onToggleMobileNav,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const memberRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (memberRef.current && !memberRef.current.contains(e.target as Node)) {
        setMemberDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileNav}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Healthyfy Logo */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Healthyfy
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:block -mt-1 tracking-wide">
                Your Health. Smarter. Simpler.
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Active Family Member Switcher */}
        {user && familyMembers.length > 0 && (
          <div className="relative hidden md:block" ref={memberRef}>
            <button
              onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Viewing:</span>
              <span className="text-slate-900 font-bold max-w-[130px] truncate">
                {activeMember ? activeMember.name : 'Select Member'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {memberDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Family Member
                </div>
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      onSelectMember(member);
                      setMemberDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${member.avatarColor}`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{member.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {member.relationship} · {member.age} yrs · {member.bloodGroup}
                        </div>
                      </div>
                    </div>
                    {activeMember?.id === member.id && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                  <button
                    onClick={() => {
                      onNavigate('family');
                      setMemberDropdownOpen(false);
                    }}
                    className="w-full py-1 text-center text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                  >
                    Manage Family Profiles →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Section: Emergency Button, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full text-xs font-bold transition-all shadow-xs group"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Emergency Help</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <span className="text-xs font-bold text-slate-800">Notifications & Alerts</span>
                  <span className="text-[11px] text-slate-500">{unreadCount} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                          !n.read ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Profile */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden lg:block max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                      <Sparkles className="w-3 h-3" />
                      Gemini 3.8 Active
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Account & Preferences
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold transition-colors shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
