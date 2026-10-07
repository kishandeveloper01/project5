import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Filter,
  Phone,
  ShieldCheck,
  X,
  CreditCard,
} from 'lucide-react';
import { Doctor } from '../types';
import { api } from '../api';

interface FindDoctorViewProps {
  doctors: Doctor[];
}

export const FindDoctorView: React.FC<FindDoctorViewProps> = ({ doctors }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);

  // Booking modal
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(tomorrow);
  const [bookingSlot, setBookingSlot] = useState('11:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const specialties = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Orthopedic',
    'Pediatrician',
    'Neurologist',
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpecialty =
      selectedSpecialty === 'All' || doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = !availableTodayOnly || doc.isAvailableToday;

    return matchesSpecialty && matchesSearch && matchesAvailability;
  });

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setBookingError('');
    try {
      await api.bookAppointment({ doctorId: selectedDoctor.id, date: bookingDate, slot: bookingSlot });
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(err.message || 'Could not book this slot.');
    }
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedDoctor(null);
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Find a Verified Doctor & Specialist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover suitable doctors based on medical specialty, distance, verified reviews, and real-time consultation availability.
          </p>
        </div>

        <div className="text-[11px] text-slate-400 font-medium bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Bengaluru, Karnataka (Auto-detected location)
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by specialty, doctor name, hospital, or symptoms (e.g. chest pain, skin rash)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Availability Toggle */}
          <div className="sm:col-span-4 flex items-center justify-between sm:justify-end gap-2">
            <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={availableTodayOnly}
                onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Available Today Only</span>
            </label>
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">No doctors match your filter criteria</div>
            <p className="text-xs text-slate-400">
              Try adjusting your specialty or search term to see more practitioners.
            </p>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-xs"
            >
              <div className="p-5 space-y-4">
                {/* Doctor Avatar & Top Info */}
                <div className="flex items-start gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    {doc.avatarUrl ? (
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white font-bold text-base">
                        {doc.name.charAt(4) || 'D'}
                      </div>
                    )}
                    {doc.isAvailableToday && (
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 truncate">
                        {doc.specialty}
                      </span>
                      {doc.isAvailableToday && (
                        <span className="text-[9px] font-semibold text-emerald-600">Today</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h3>
                    <div className="text-[11px] text-slate-500 truncate">{doc.qualification}</div>
                    <div className="text-[10px] text-slate-400">
                      {doc.experienceYears} years experience
                    </div>
                  </div>
                </div>

                {/* Rating & Distance */}
                <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-800 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{doc.rating}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({doc.reviewsCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{doc.distanceKm} km away</span>
                  </div>
                </div>

                {/* Hospital and Timings */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800 truncate">{doc.hospital}</div>
                  <div className="text-[11px] text-slate-500 truncate">{doc.address}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.availableTimings}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Fee & Book Button */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Consultation Fee</div>
                  <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                    ₹{doc.consultationFee}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Slot Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Book Doctor Consultation</h3>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your appointment with <strong>{selectedDoctor.name}</strong> on{' '}
                  <strong>{bookingDate}</strong> at <strong>{bookingSlot}</strong> has been scheduled.
                  A calendar reminder and SMS confirmation has been logged.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                    {selectedDoctor.avatarUrl ? (
                      <img
                        src={selectedDoctor.avatarUrl}
                        alt={selectedDoctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white font-bold">
                        D
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedDoctor.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {selectedDoctor.specialty} · {selectedDoctor.hospital}
                    </div>
                    <div className="text-xs font-extrabold text-emerald-700 mt-0.5">
                      Fee: ₹{selectedDoctor.consultationFee}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Consultation Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Available Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['10:30 AM', '11:00 AM', '11:45 AM', '04:30 PM', '05:15 PM', '06:00 PM'].map(
                      (slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setBookingSlot(slot)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                            bookingSlot === slot
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {slot}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  Includes in-clinic physical checkup or secure HD video follow-up through Healthyfy.
                </div>

                {bookingError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">{bookingError}</div>}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
