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
                console.log("Doctor response:", doctorResponse.data);
                const diseaseResponse = await getDiseases();  
                setDoctor(doctorResponse.data);
                setDiseases(diseaseResponse.data);
            } catch (error) {
                console.error('Error fetching doctor or diseases:', error);
            }
        };

        fetchDoctorAndDiseases();
    }, [id]);

    // Randomly assign diseases to a new patient
    const assignRandomDiseases = (diseaseList) => {
        const numDiseases = Math.floor(Math.random() * 3) + 1;
        const shuffledDiseases = diseaseList.sort(() => 0.5 - Math.random());
        return shuffledDiseases.slice(0, numDiseases);
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            // Assign random diseases
            const randomDiseases = assignRandomDiseases(diseases);
    
            // Ensure that disease IDs are valid and log them for debugging
            const diseaseIds = randomDiseases.map(disease => {
                if (disease && disease.disease_id) {  // Use disease.disease_id
                    return disease.disease_id;
                } else {
                    console.error("Invalid disease detected:", disease);  // Log if any invalid disease exists
                    return null;
                }
            }).filter(id => id !== null);  // Filter out any invalid IDs (null values)
    
            // If no valid disease IDs are present, handle it gracefully
            if (diseaseIds.length === 0) {
                setError('No valid diseases selected for the patient.');
                return;
            }
    
            const patientData = {
                name: newPatientName,
                doctor: doctor.id,
                disease: diseaseIds  // Send random diseases with the patient creation request
            };
    
            console.log("Patient data being sent to API:", patientData);
    
            // Send API request to create patient
            const response = await createPatient(patientData);
    
            alert(`Patient ${response.data.name} created successfully!`);
            console.log("Patient created successfully:", response.data);
    
            // Fetch the updated doctor and patients data after creating the patient
            const updatedDoctorResponse = await getDoctor(id);
            setDoctor(updatedDoctorResponse.data);
    
            setNewPatientName('');
        } catch (error) {
            setError('Failed to create patient.');
            console.error('Failed to create patient:', error);
        }
    };

    // Select a random treatment
    const assignRandomTreatment = () => {
        const randomIndex = Math.floor(Math.random() * valid_treatments.length);
        return valid_treatments[randomIndex];
    };

    // Handle treatment assignment
    const handleAssignTreatment = async (e) => {
        e.preventDefault();
        try {
            const randomTreatment = assignRandomTreatment();  // Get a random treatment

            const treatmentData = {
                treatment_id: randomTreatment.treatment_id,  // Use treatment_id
                treatment_options: randomTreatment.treatment_options,
                doctor: doctor.id,
                patient: selectedPatientId,
            };

            console.log("Treatment data being sent:", treatmentData);

            // Send API request to assign treatment
            const response = await assignTreatment(treatmentData);
            alert('Treatment assigned successfully!');
            console.log("Assigned treatment:", response.data);

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
                                        <li key={disease.disease_id}>  {/* Use disease.disease_id */}
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