import React from 'react';
import { AlertTriangle, Phone, Hospital, ShieldAlert, X, HeartHandshake } from 'lucide-react';
import { FamilyMember } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember?: FamilyMember | null;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, activeMember }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-rose-100 overflow-hidden">
        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-700/80 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Emergency Assistance & Quick Help</h2>
              <p className="text-xs text-rose-100 mt-0.5">Rapid access to medical helplines and immediate care</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-rose-700/60 transition-colors text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-relaxed">
            <strong className="font-semibold block text-sm mb-0.5">Critical Emergency Notice</strong>
            If you or a family member are experiencing chest pain, severe shortness of breath, sudden weakness, stroke symptoms, or acute physical trauma, <strong>do not rely on an AI app</strong>. Contact emergency services or proceed to the nearest hospital emergency room immediately.
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Active Family Member Emergency Contact */}
          {activeMember && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Family Emergency Contact ({activeMember.name})
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Primary Contact Number
                  </div>
                  <div className="text-xs text-slate-500">
                    {activeMember.emergencyContact || '+91 98765 43211'} (Relationship: {activeMember.relationship})
                  </div>
                </div>
                <a
                  href={`tel:${activeMember.emergencyContact || '+919876543211'}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Contact
                </a>
              </div>
            </div>
          )}

          {/* National & Emergency Helplines */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Direct Emergency Helplines (India & Standard Emergency)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-white hover:border-rose-300 transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-800">112 — National Emergency</div>
                  <div className="text-[11px] text-slate-500">All-in-one Police, Fire & Medical</div>
                </div>
                <a
                  href="tel:112"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Call 112
                </a>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-white hover:border-rose-300 transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-800">108 — Medical Ambulance</div>
                  <div className="text-[11px] text-slate-500">Immediate Ambulance Dispatch</div>
                </div>
                <a
                  href="tel:108"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Call 108
                </a>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-800">102 — Maternity & Infant</div>
                  <div className="text-[11px] text-slate-500">Emergency Obstetric Care</div>
                </div>
                <a
                  href="tel:102"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Call 102
                </a>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-800">14416 — Tele-MANAS</div>
                  <div className="text-[11px] text-slate-500">24/7 Mental Health Helpline</div>
                </div>
                <a
                  href="tel:14416"
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Call 14416
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-slate-100 bg-slate-50/70 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                <Hospital className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Locate Nearest Hospital ER</div>
                <div className="text-[11px] text-slate-500">Open navigation to nearby emergency centers</div>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/nearest+hospital+emergency+room"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Open Maps
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-slate-400" />
            <span>Healthyfy Safety Protocols</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
