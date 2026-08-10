import React, { useState } from 'react';
import {
  Users,
  Plus,
  UserPlus,
  Building2,
  MapPin,
  GraduationCap,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Student } from '../types';
import { STATE_PTI_CENTERS } from '../data/stateData';

interface StudentManagementProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onAddStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onStartMeetingForStudent: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onStartMeetingForStudent
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('4th Grade');
  const [state, setState] = useState('CA');
  const [schoolDistrict, setSchoolDistrict] = useState('');
  const [disabilityCategory, setDisabilityCategory] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setGrade('4th Grade');
    setState('CA');
    setSchoolDistrict('');
    setDisabilityCategory('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (st: Student) => {
    setEditingStudent(st);
    setName(st.name);
    setGrade(st.grade);
    setState(st.state);
    setSchoolDistrict(st.schoolDistrict);
    setDisabilityCategory(st.disabilityCategory || '');
    setNotes(st.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !schoolDistrict.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name,
        grade,
        state,
        schoolDistrict,
        disabilityCategory,
        notes
      });
    } else {
      onAddStudent({
        userId: 'user_demo_101',
        name,
        grade,
        state,
        schoolDistrict,
        disabilityCategory,
        notes
      });
    }
    setIsModalOpen(false);
  };

  const gradeOptions = [
    'Preschool / Pre-K',
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade',
    '9th Grade (High School)',
    '10th Grade',
    '11th Grade',
    '12th Grade',
    'Transition (Ages 18-22)'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            My Students / Children
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage profiles for each student in your family. Each profile maintains independent meeting histories and state-specific resources.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Another Student</span>
        </button>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((st) => {
          const isSelected = st.id === selectedStudentId;
          const pti = STATE_PTI_CENTERS[st.state];

          return (
            <div
              key={st.id}
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all relative ${
                isSelected ? 'border-2 border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active Student
                </span>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{st.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        {st.grade}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        {st.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => openEditModal(st)}
                      className="p-1.5 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {students.length > 1 && (
                      <button
                        onClick={() => onDeleteStudent(st.id)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900">District:</span> {st.schoolDistrict}
                    </div>
                  </div>

                  {st.disabilityCategory && (
                    <div className="bg-indigo-50/80 text-indigo-900 p-2 rounded-lg border border-indigo-100 font-medium text-[11px]">
                      <strong>Category:</strong> {st.disabilityCategory}
                    </div>
                  )}

                  {st.notes && (
                    <p className="text-slate-600 text-[11px] italic line-clamp-2">
                      "{st.notes}"
                    </p>
                  )}

                  {pti && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10.5px] text-slate-600">
                      <strong>State PTI:</strong> {pti.ptiName}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {!isSelected ? (
                  <button
                    onClick={() => onSelectStudent(st.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    Set as Active
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Active
                  </span>
                )}

                <button
                  onClick={() => onStartMeetingForStudent(st.id)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Prepare Packet</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                {editingStudent ? 'Edit Student Profile' : 'Add New Student'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Student Name or Initials *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya S."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Grade Level *</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {Object.keys(STATE_PTI_CENTERS).map((stCode) => (
                      <option key={stCode} value={stCode}>
                        {stCode} - {STATE_PTI_CENTERS[stCode].stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  School District Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oakland Unified School District"
                  value={schoolDistrict}
                  onChange={(e) => setSchoolDistrict(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Disability / Plan Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autism Spectrum, ADHD (504 Plan), Dyslexia, Speech/Language"
                  value={disabilityCategory}
                  onChange={(e) => setDisabilityCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Parent Notes or Key Strengths (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Maya excels at creative art and science; struggles with loud transitions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow cursor-pointer"
                >
                  {editingStudent ? 'Update Profile' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
