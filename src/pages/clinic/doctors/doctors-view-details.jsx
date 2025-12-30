import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    FiUser
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import DoctorProfileHeader from '@/components/clinic/DoctorProfileHeader';
import DoctorProfileContent from '@/components/clinic/DoctorProfileContent';
import EditDoctorModal from '@/components/clinic/EditDoctorModal';
import Footer from '@/components/shared/Footer';

// --- Helpers --------------------------------------------------

const stripDoctorPrefix = (name = '') =>
    String(name || '').replace(/^Dr\.\s*/i, '').trim();

const splitName = (rawName = '') => {
    const cleaned = stripDoctorPrefix(rawName);
    if (!cleaned) return { firstName: '', lastName: '' };
    const parts = cleaned.split(/\s+/);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
    };
};

const toHHMM = (t) => {
    if (!t) return '';
    const s = String(t);
    const m = s.match(/(\d{1,2}):(\d{2})/);
    if (!m) return '';
    const hh = m[1].padStart(2, '0');
    const mm = m[2];
    return `${hh}:${mm}`;
};

const to12hr = (hhmm = '') => {
    if (!hhmm) return '';
    const [hStr, mStr] = hhmm.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
};

const buildWorkingHoursFromAvailability = (availability = []) => {
    // availability: [{day, closed, startTime:"HH:MM:SS", endTime:"HH:MM:SS", is_clinic_time, is_video_time}...]
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const byDay = Object.fromEntries(days.map(d => [d, { offline: [], online: [] }]));

    availability.forEach((row) => {
        const day = row.day;
        if (!day || row.closed) return; // skip closed or invalid days
        
        const start = to12hr(toHHMM(row.startTime));
        const end = to12hr(toHHMM(row.endTime));
        if (!start || !end) return;
        
        const timeSlot = `${start} - ${end}`;
        
        // Determine slot type based on is_clinic_time and is_video_time
        if (row.is_clinic_time === true && row.is_video_time === false) {
            // Offline slot (clinic time)
            byDay[day].offline.push(timeSlot);
        } else if (row.is_video_time === true && row.is_clinic_time === false) {
            // Online slot (video time)
            byDay[day].online.push(timeSlot);
        } else if (row.is_clinic_time === true && row.is_video_time === true) {
            // Both - add to both categories
            byDay[day].offline.push(timeSlot);
            byDay[day].online.push(timeSlot);
        }
        // Note: if both are false, we don't add to either category
    });

    const workingHours = {};
    days.forEach((d) => {
        const slots = byDay[d];
        const offlineSlots = slots.offline;
        const onlineSlots = slots.online;
        
        // Format: "Offline: 10:00 AM - 2:00 PM | Online: 3:00 PM - 6:00 PM"
        const parts = [];
        
        if (offlineSlots.length > 0) {
            parts.push(`Offline: ${offlineSlots.join(', ')}`);
        }
        
        if (onlineSlots.length > 0) {
            parts.push(`Online: ${onlineSlots.join(', ')}`);
        }
        
        workingHours[d.toLowerCase()] = parts.length > 0 ? parts.join(' | ') : 'Closed';
    });

    return workingHours;
};

/**
 * Normalize a doctor object from backend into a single, rich model
 * that works for both the view components and EditDoctorModal.
 */
const normalizeDoctor = (raw = {}, idFallback = null) => {
    // id
    const id =
        raw.id ??
        raw.doctor_id ??
        raw.doctorId ??
        idFallback;

    // first/last name
    const firstName =
        raw.firstName ??
        (raw.name ? splitName(raw.name).firstName : '') ??
        '';
    const lastName =
        raw.lastName ??
        (raw.name ? splitName(raw.name).lastName : '') ??
        '';

    // name for display
    const displayName =
        raw.name ??
        raw.doctor_name ??
        (firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unknown Doctor');

    // email/phone across variants
    const drEmail = raw.drEmail ?? raw.email ?? raw.doctor_email ?? '';
    const drPhone = raw.drPhone ?? raw.phone ?? raw.doctor_phone ?? raw.contact ?? '';

    // speciality / qualification variants
    const drSpeciality = raw?.drSpeciality?.join(', ') ;
    const drQualification =  raw?.qualification?.join(', ') ;

    // experience variants (can be number or string)
    const experience =
        raw.experience ??
        raw.years_experience ??
        raw.doctor_experience ??
        '0';

    // status + misc
    const status = raw.status ?? raw.doctor_status ?? 'Active';
    const rating = raw.rating ?? raw.doctor_rating ?? 4.5;
    const appointments = raw.appointments ?? raw.total_appointments ?? raw.doctor_appointments ?? 0;
    const patients = raw.patients ?? raw.total_patients ?? raw.doctor_patients ?? 0;
    const lastActive = raw.lastActive ?? raw.last_active ?? raw.updated_at ?? '';

    // address bits
    const address = raw.address ?? raw.doctor_address ?? '';
    const city = raw.city ?? raw.doctor_city ?? '';
    const state = raw.state ?? raw.doctor_state ?? '';
    const zipCode = raw.zipCode ?? raw.zip_code ?? raw.doctor_zip ?? '';

    // bio
    const bio = raw.bio ?? raw.biography ?? raw.doctor_bio ?? 'No biography available for this doctor.';

    // arrays (optional)
    const education = raw.education ?? raw.education_history ?? raw.doctor_education ?? [];
    const certifications = raw.certifications ?? raw.certificates ?? raw.doctor_certifications ?? [];
    const languages = raw.languages ?? raw.spoken_languages ?? raw.doctor_languages ?? [];

    // buffers
    const startBufferTime = raw.startBufferTime ?? 0;
    const endBufferTime = raw.endBufferTime ?? 0;

    // availability (as given by your backend for editing)
    const availability = Array.isArray(raw.availability) ? raw.availability : [];

    // working hours for display (derived from availability when possible)
    console.log(`availability ====================`, availability);
    const workingHours =
        raw.workingHours ??
        raw.schedule ??
        raw.doctor_schedule ??
        (availability.length ? buildWorkingHoursFromAvailability(availability) : {
            monday: 'Closed',
            tuesday: 'Closed',
            wednesday: 'Closed',
            thursday: 'Closed',
            friday: 'Closed',
            saturday: 'Closed',
            sunday: 'Closed',
        });

    return {
        // IDs / names
        id,
        name: displayName,
        firstName,
        lastName,

        // contact (keep both unified & dr* keys for downstream consumers)
        email: drEmail,
        phone: drPhone,
        drEmail,
        drPhone,

        // pro info
        specialty: drSpeciality,
        speciality: drSpeciality,
        drSpeciality,
        qualification: drQualification,
        drQualification,
        experience,
        status,

        // stats
        rating,
        appointments,
        patients,
        lastActive,

        // address / bio
        address,
        city,
        state,
        zipCode,
        bio,

        // extras
        education,
        certifications,
        languages,

        // buffers
        startBufferTime,
        endBufferTime,

        // scheduling
        availability,
        workingHours,
    };
};

// --- Component ------------------------------------------------

const DoctorsViewDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    useEffect(() => {
        fetchDoctorDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchDoctorDetails = async () => {
        setLoading(true);
        try {
          // 1) Fetch list (your backend provides list endpoint)
          const res = await fetch('https://bkdemo1.clinicpro.cc/doctor/doctor-list');
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const list = await res.json();

          // 2) Find by multiple possible id keys (== to allow string/number match)
          const raw =
              Array.isArray(list)
                  ? list.find(d => d?.id == id || d?.doctor_id == id || d?.doctorId == id)
                  : null;

          if (!raw) {
              setDoctor(null);
              return;
          }

          // 3) Normalize
          const normalized = normalizeDoctor(raw, id);
          setDoctor(normalized);
      } catch (err) {
          console.error('Error fetching doctor details:', err);
            //   toast.error('Failed to load doctor details');
          setDoctor(null);
      } finally {
          setLoading(false);
      }
    };

    const handleEditClick = (doctorToEdit) => {
        setEditingDoctor(doctorToEdit); // already normalized (has dr* fields + availability)
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingDoctor(null);
    };

    const handleSaveDoctor = async (updatedDoctorFromAPI) => {
    // After successful update (modal PUT), refresh the data from backend
        await fetchDoctorDetails();
        handleCloseEditModal();
        toast.success('Doctor profile updated successfully!');
    };

    // --- Render states -----------------------------------------

    if (loading) {
        return (
            <>
                <PageHeader>
                    <DoctorProfileHeader doctor={null} loading={true} />
                </PageHeader>
                <div className="main-content">
                    <div className="row">
                        <div className="col-12">
                            <div className="card stretch stretch-full">
                                <div className="card-body">
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Loading doctor profile...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!doctor) {
        return (
            <>
                <PageHeader>
                    <DoctorProfileHeader doctor={null} loading={false} />
                </PageHeader>
                <div className="main-content">
                    <div className="row">
                        <div className="col-12">
                            <div className="card stretch stretch-full">
                                <div className="card-body">
                                    <div className="text-center py-5">
                                        <FiUser size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted">Doctor not found</h5>
                                        <p className="text-muted">
                                            The doctor you're looking for doesn't exist or has been removed.
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/clinic/doctors')}
                                        >
                                            Back to Doctors List
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <PageHeader>
                <DoctorProfileHeader doctor={doctor} loading={false} onEditClick={handleEditClick} />
            </PageHeader>

            <div className="main-content">
                <div className="row">
                    <DoctorProfileContent doctor={doctor} onEditClick={handleEditClick} />
                </div>
            </div>

            {/* Edit Doctor Modal */}
            <EditDoctorModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                doctor={editingDoctor}
                onSave={handleSaveDoctor}
            />

            <Footer />
        </>
    );
};

export default DoctorsViewDetails;