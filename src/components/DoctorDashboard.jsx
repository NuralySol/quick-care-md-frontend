import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { getDoctor, createPatient, getDiseases, assignTreatment } from '../api.js';

const DoctorDashboard = () => {
    const [doctor, setDoctor] = useState(null);
    const [diseases, setDiseases] = useState([]);
    const [newPatientName, setNewPatientName] = useState('');
    const [treatmentOptions, setTreatmentOptions] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [error, setError] = useState('');
    const { id } = useParams();

    useEffect(() => {
        const fetchDoctorAndDiseases = async () => {
            try {
                const doctorResponse = await getDoctor(id);
                const diseaseResponse = await getDiseases();  
                setDoctor(doctorResponse.data);
                setDiseases(diseaseResponse.data);
            } catch (error) {
                console.error('Error fetching doctor or diseases:', error);
            }
        };

        fetchDoctorAndDiseases();
    }, [id]);

    const assignRandomDiseases = (diseaseList) => {
        const numDiseases = Math.floor(Math.random() * 3) + 1;
        const shuffledDiseases = diseaseList.sort(() => 0.5 - Math.random());
        return shuffledDiseases.slice(0, numDiseases);
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            const randomDiseases = assignRandomDiseases(diseases);
            const diseaseIds = randomDiseases.map(disease => disease?.disease_id).filter(Boolean);
    
            if (diseaseIds.length === 0) {
                setError('No valid diseases selected for the patient.');
                return;
            }
    
            const patientData = {
                name: newPatientName,
                doctor: doctor.id,
                disease: diseaseIds
            };
    
            const response = await createPatient(patientData);
            alert(`Patient ${response.data.name} created successfully!`);
            const updatedDoctorResponse = await getDoctor(id);
            setDoctor(updatedDoctorResponse.data);
            setNewPatientName('');
        } catch (error) {
            setError('Failed to create patient.');
            console.error('Failed to create patient:', error);
        }
    };

    const handleAssignTreatment = async (e) => {
        e.preventDefault();
        try {
            const randomTreatment = assignRandomTreatment();
            const treatmentData = {
                treatment_id: randomTreatment.treatment_id,
                treatment_options: randomTreatment.treatment_options,
                doctor: doctor.id,
                patient: selectedPatientId,
            };

            await assignTreatment(treatmentData);
            alert('Treatment assigned successfully!');
            setTreatmentOptions('');
        } catch (error) {
            setError('Failed to assign treatment.');
            console.error('Failed to assign treatment:', error);
        }
    };

    if (!doctor) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', backgroundColor: '#87CEEB', padding: '20px', height: '100vh' }}>
                <h2>Doctor Panel</h2>
                <h3 style={{ marginTop: '20px' }}>{doctor.name}</h3> {/* Displaying the doctor's name */}
                <ul style={{ listStyle: 'none', padding: '0' }}>
                    <li>
                        <Link to="/" style={{ width: '100%', display: 'block', padding: '10px', textAlign: 'center', textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px' }}>
                            Logout
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div style={{ padding: '20px' }}>
                <h2>Doctor Dashboard</h2>
                <strong>{doctor.name}</strong> - {doctor.specialty || 'General Doctor'}

                <h4>Patients:</h4>
                <ul>
                    {doctor.patient_set && doctor.patient_set.map((patient) => (
                        <li key={patient.id}>
                            {patient.name} (Admitted: {new Date(patient.time_admitted).toLocaleDateString()})
                            <ul>
                                <li>Diseases:
                                    <ul>
                                        {patient.disease && patient.disease.map((disease) => (
                                            <li key={disease.disease_id}>
                                                {disease.name} - Terminal: {disease.is_terminal ? 'Yes' : 'No'}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setSelectedPatientId(patient.id)}>
                                        Assign Treatment
                                    </button>
                                </li>
                            </ul>
                        </li>
                    ))}
                </ul>

                {/* Create a new patient form */}
                <h3>Create a New Patient</h3>
                <form onSubmit={handleCreatePatient}>
                    <label>Patient Name:</label>
                    <input
                        type="text"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        required
                    />
                    <button type="submit">Create Patient</button>
                </form>

                {/* Assign treatment to the selected patient */}
                {selectedPatientId && (
                    <div>
                        <h3>Assign Treatment</h3>
                        <form onSubmit={handleAssignTreatment}>
                            <label>Treatment Options:</label>
                            <input
                                type="text"
                                value={treatmentOptions}
                                onChange={(e) => setTreatmentOptions(e.target.value)}
                                required
                            />
                            <button type="submit">Assign Treatment</button>
                        </form>
                    </div>
                )}

                {/* Show error messages */}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
};

export default DoctorDashboard;
