import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';  
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
                const diseaseResponse = await getDiseases();  // Fetch diseases from static API call
                setDoctor(doctorResponse.data);
                setDiseases(diseaseResponse.data);  // Store diseases with treatments
            } catch (error) {
                console.error('Error fetching doctor or diseases:', error);
            }
        };

        fetchDoctorAndDiseases();
    }, [id]);

    // Randomly assign diseases to a new patient
    const assignRandomDiseases = (diseaseList) => {
        const numDiseases = Math.floor(Math.random() * 3) + 1;  // Randomly assign 1 to 3 diseases
        const shuffledDiseases = diseaseList.sort(() => 0.5 - Math.random());
        return shuffledDiseases.slice(0, numDiseases);
    };

    // Function to create a new patient and assign random diseases
    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            const randomDiseases = assignRandomDiseases(diseases);  // Assign random diseases
            const diseaseIds = randomDiseases.map(disease => disease.id);  // Get disease IDs

            const patientData = {
                name: newPatientName,
                doctor: doctor.id,
                diseases: diseaseIds,  // Send random diseases with the patient creation request
            };

            const response = await createPatient(patientData);
            alert(`Patient ${response.data.name} created successfully!`);
            setDoctor((prevDoctor) => ({
                ...prevDoctor,
                patient_set: [...prevDoctor.patient_set, response.data]
            }));
            setNewPatientName('');
        } catch (error) {
            setError('Failed to create patient.');
            console.error('Failed to create patient:', error);
        }
    };

    // Function to assign treatment to a patient
    const handleAssignTreatment = async (e) => {
        e.preventDefault();
        try {
            const response = await assignTreatment(selectedPatientId, {
                treatment_options: treatmentOptions,
                doctor: doctor.id,
            });
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
        <div>
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
                                        <li key={disease.id}>
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
    );
};

export default DoctorDashboard;