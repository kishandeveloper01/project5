import React, { useState } from 'react';
import {
  Users,
  Plus,
  Pill,
  AlertCircle,
  Phone,
  FileText,
  Calendar,
  Trash2,
  Edit,
  Clock,
  HeartPulse,
  Activity,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { api } from '../api';
import { FamilyMember, MedicalReport } from '../types';

interface FamilyRecordsViewProps {
  familyMembers: FamilyMember[];
  activeMember: FamilyMember | null;
  onSelectMember: (member: FamilyMember) => void;
  onRefreshFamily: () => void;
  records: MedicalReport[];
  onOpenReportDetails: (report: MedicalReport) => void;
}

export const FamilyRecordsView: React.FC<FamilyRecordsViewProps> = ({
  familyMembers,
  activeMember,
  onSelectMember,
  onRefreshFamily,
  records,
  onOpenReportDetails,
}) => {
  const currentMember = activeMember || familyMembers[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  // New member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRel, setNewMemberRel] = useState<'Father' | 'Mother' | 'Sister' | 'Brother' | 'Child' | 'Spouse' | 'Other'>('Mother');
  const [newMemberAge, setNewMemberAge] = useState(50);
  const [newMemberGender, setNewMemberGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newMemberBlood, setNewMemberBlood] = useState('B+');
  const [newMemberAllergies, setNewMemberAllergies] = useState('');
  const [newMemberConditions, setNewMemberConditions] = useState('');
  const [newMemberMedications, setNewMemberMedications] = useState('');
  const [newMemberEmergency, setNewMemberEmergency] = useState('+91 98765 43210');
  const [newMemberNotes, setNewMemberNotes] = useState('');

  // New manual record form state
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordType, setNewRecordType] = useState('General Lab Report');
  const [newRecordDate, setNewRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecordLab, setNewRecordLab] = useState('City Diagnostic Center');
  const [newRecordSummary, setNewRecordSummary] = useState('');

  const memberRecords = records.filter(
    (r) =>
      r.memberId === currentMember?.id &&
      (searchQuery === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      const created = await api.createFamilyMember({
        name: newMemberName,
        relationship: newMemberRel,
        age: Number(newMemberAge),
        gender: newMemberGender,
        bloodGroup: newMemberBlood,
        allergies: newMemberAllergies.split(',').map((s) => s.trim()).filter(Boolean),
        existingConditions: newMemberConditions.split(',').map((s) => s.trim()).filter(Boolean),
        medications: newMemberMedications.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyContact: newMemberEmergency,
        notes: newMemberNotes,
      });
      onRefreshFamily();
      onSelectMember(created);
      setIsAddMemberOpen(false);
      // Reset
      setNewMemberName('');
    } catch (err: any) {
      alert('Error creating family member: ' + err.message);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordTitle.trim() || !currentMember) return;

    try {
      await api.saveRecord({
        memberId: currentMember.id,
        memberName: currentMember.name,
        title: newRecordTitle,
        reportType: newRecordType,
        date: newRecordDate,
        laboratory: newRecordLab,
        summary: newRecordSummary || 'Health record documented by user.',
        values: [
          { testName: 'Clinical Status', result: 'Logged', referenceRange: 'Routine', status: 'Within range' },
        ],
        aiExplanation: 'Record recorded into family medical timeline.',
        possibleIndications: ['Routine health record documentation'],
        suggestedQuestions: ['Discuss updates with doctor at next visit'],
        nextSteps: ['Keep updated copies'],
        isUrgent: false,
        disclaimer: 'Informational health record.',
      });
      onRefreshFamily();
      setIsAddRecordOpen(false);
      setNewRecordTitle('');
      setNewRecordSummary('');
    } catch (err: any) {
      alert('Error saving record: ' + err.message);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this family member profile?')) return;
    try {
      await api.deleteFamilyMember(id);
      onRefreshFamily();
    } catch (err: any) {
      alert('Failed to delete member: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Family Health Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize separate medical profiles, chronic conditions, prescriptions, and timelines for each family member.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddRecordOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Family Member Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {familyMembers.map((member) => {
          const isSelected = currentMember?.id === member.id;
          return (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl text-white flex items-center justify-center text-sm font-bold ${member.avatarColor}`}
                >
                  {member.name.charAt(0)}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {member.relationship}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">{member.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {member.age} yrs · Blood: <strong className="text-slate-700">{member.bloodGroup}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Member Profile Detailed Card */}
      {currentMember && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center text-base font-bold shadow-xs ${currentMember.avatarColor}`}
              >
                {currentMember.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{currentMember.name}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    {currentMember.relationship}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {currentMember.age} years old · {currentMember.gender} · Blood Group: {currentMember.bloodGroup}
                </div>
              </div>
            </div>

            {currentMember.relationship !== 'Self' && (
              <button
                onClick={() => handleDeleteMember(currentMember.id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Profile</span>
              </button>
            )}
          </div>

          {/* Health Profile Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Chronic Conditions */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Existing Conditions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentMember.existingConditions.length > 0 ? (
                  currentMember.existingConditions.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-medium">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None reported</span>
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Active Prescriptions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentMember.medications.length > 0 ? (
                  currentMember.medications.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-medium">
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No active medications</span>
                )}
              </div>
            </div>

            {/* Allergies & Emergency */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Allergies & Emergency</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <strong className="text-slate-800">Allergies: </strong>
                  {currentMember.allergies.join(', ') || 'No known drug allergies'}
                </div>
                <div>
                  <strong className="text-slate-800">SOS Contact: </strong>
                  {currentMember.emergencyContact || '+91 98765 43211'}
                </div>
              </div>
            </div>
          </div>

          {currentMember.notes && (
            <div className="text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <strong className="text-slate-800">Physician Notes / Lifestyle Context: </strong>
              {currentMember.notes}
            </div>
          )}
        </div>
      )}

      {/* Complete Health Timeline for Selected Member */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Health Timeline & Diagnostics ({currentMember?.name})
            </h3>
          </div>

          {/* Search Timeline */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or tests..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
          </div>
        </div>

        {memberRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">No medical records found for {currentMember?.name}</div>
            <p className="text-xs text-slate-400">
              Upload a lab report or add a health consultation entry to start building their timeline.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {memberRecords.map((rec) => (
              <div
                key={rec.id}
                className="relative bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 hover:border-slate-300 transition-colors"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[27px] top-6 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-slate-100"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mr-2">
                      {rec.reportType}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium tabular-nums flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rec.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {rec.summary}
                </p>

                {/* Values Mini Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {rec.values.slice(0, 4).map((val, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                      <div className="text-[10px] text-slate-500 truncate">{val.testName}</div>
                      <div className="font-bold text-slate-800 tabular-nums">{val.result}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Laboratory: {rec.laboratory || 'MaxCare Lab'}
                  </span>
                  <button
                    onClick={() => onOpenReportDetails(rec)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View AI Breakdown</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Family Member */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Family Member</h3>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMemberRel}
                    onChange={(e) => setNewMemberRel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Child">Child</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMemberGender}
                    onChange={(e) => setNewMemberGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newMemberBlood}
                    onChange={(e) => setNewMemberBlood(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Conditions (comma-separated)</label>
                <input
                  type="text"
                  value={newMemberConditions}
                  onChange={(e) => setNewMemberConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Hypothyroidism"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Active Prescriptions (comma-separated)</label>
                <input
                  type="text"
                  value={newMemberMedications}
                  onChange={(e) => setNewMemberMedications(e.target.value)}
                  placeholder="e.g. Amlodipine 5mg, Thyroxine 25mcg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={newMemberAllergies}
                  onChange={(e) => setNewMemberAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={newMemberEmergency}
                  onChange={(e) => setNewMemberEmergency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Health Notes / History</label>
                <textarea
                  rows={2}
                  value={newMemberNotes}
                  onChange={(e) => setNewMemberNotes(e.target.value)}
                  placeholder="General wellness habits, dietary needs, or past surgeries..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Record */}
      {isAddRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Health Record for {currentMember.name}</h3>
              <button
                onClick={() => setIsAddRecordOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Title</label>
                <input
                  type="text"
                  required
                  value={newRecordTitle}
                  onChange={(e) => setNewRecordTitle(e.target.value)}
                  placeholder="e.g. Annual Health Checkup 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newRecordType}
                    onChange={(e) => setNewRecordType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  >
                    <option value="General Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Doctor Visit">Doctor Visit</option>
                    <option value="Vaccination">Vaccination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newRecordDate}
                    onChange={(e) => setNewRecordDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory or Hospital</label>
                <input
                  type="text"
                  value={newRecordLab}
                  onChange={(e) => setNewRecordLab(e.target.value)}
                  placeholder="e.g. Manipal Hospital, Bengaluru"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Observations</label>
                <textarea
                  rows={3}
                  value={newRecordSummary}
                  onChange={(e) => setNewRecordSummary(e.target.value)}
                  placeholder="Key doctor advice, dosage instructions, or findings..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
