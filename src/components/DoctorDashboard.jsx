import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoctor, createPatient, getDiseases, assignTreatment, dischargePatient, getTreatmentOptions } from '../api.js';

// DoctorDashboard Component
const DoctorDashboard = () => {
    const [doctor, setDoctor] = useState(null);
    const [diseases, setDiseases] = useState([]);
    const [newPatientName, setNewPatientName] = useState('');
    const [selectedDiseases, setSelectedDiseases] = useState([]);
    const [treatmentOptionsList, setTreatmentOptionsList] = useState([]);
    const [selectedTreatmentOption, setSelectedTreatmentOption] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [error, setError] = useState('');
    const { id } = useParams();

    // Fetch doctor and diseases on component mount
    useEffect(() => {
        const fetchDoctorAndDiseases = async () => {
            try {
                const doctorResponse = await getDoctor(id);
                const diseaseResponse = await getDiseases();
                const treatmentOptionsResponse = await getTreatmentOptions();

                setDoctor(doctorResponse.data);
                setDiseases(diseaseResponse.data);
                setTreatmentOptionsList(treatmentOptionsResponse.data);  // Fetch and set available treatments
            } catch (error) {
                console.error('Error fetching doctor or diseases:', error);
            }
        };

        fetchDoctorAndDiseases();
    }, [id]);

    // Handle creating a new patient
    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            // Filter selected disease objects from the diseases list
            const diseaseObjects = diseases.filter(disease => selectedDiseases.includes(disease.disease_id));

            const patientData = {
                name: newPatientName,
                doctor: doctor.id,
                disease: diseaseObjects,  // Pass full disease objects
            };

            console.log("Creating patient with data:", patientData);  // Log the patient data

            const response = await createPatient(patientData);
            alert(`Patient ${response.data.name} created successfully!`);

            const updatedDoctorResponse = await getDoctor(id);
            setDoctor(updatedDoctorResponse.data);
            setNewPatientName('');
            setSelectedDiseases([]); // Clear the selected diseases after patient creation
        } catch (error) {
            setError('Failed to create patient.');
            console.error('Failed to create patient:', error);
        }
    };

    // Handle assigning a treatment to a patient
    const handleAssignTreatment = async (e) => {
        e.preventDefault();
        try {
            const treatmentData = {
                treatment_options: selectedTreatmentOption,  // Selected treatment
                doctor: doctor.id,  // Doctor ID
                patient: selectedPatientId,  // Selected patient ID
            };

            const response = await assignTreatment(treatmentData);

            if (response.data.success) {
                alert('Valid Treatment assigned successfully!');
            } else {
                alert('Invalid Treatment assigned!');
            }

            setSelectedTreatmentOption(''); // Reset selection after assignment
        } catch (error) {
            setError('Failed to assign treatment.');
            console.error('Failed to assign treatment:', error.response?.data);
        }
    };

    // Handle discharging a patient and removing them from the view
    const handleDischargePatient = async (patientId) => {
        try {
            const response = await dischargePatient(patientId);
            alert(`Patient ${response.data.discharge.patient.name} has been successfully discharged.`);

            // Filter out the discharged patient from the doctor.patients array
            const updatedPatients = doctor.patients.filter(patient => patient.id !== patientId);
            setDoctor(prevDoctor => ({ ...prevDoctor, patients: updatedPatients }));
        } catch (error) {
            setError('Failed to discharge patient.');
            console.error('Error discharging patient:', error);
        }
    };

    // Handle disease selection
    const handleDiseaseSelection = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(Number(options[i].value)); // Collect selected disease IDs
            }
        }
        setSelectedDiseases(selected); // Update state
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
                {doctor.patients && doctor.patients
                    .map((patient) => (
                        <li key={patient.id}>
                            <strong>{patient.name}</strong> (Admitted: {new Date(patient.time_admitted).toLocaleDateString()})
                            <ul>
                                <li><strong>Diseases:</strong>
                                    <ul>
                                        {patient.disease && patient.disease.map((disease) => (
                                            <li key={disease.disease_id}>
                                                {disease.name} - Terminal: {disease.is_terminal ? 'Yes' : 'No'}
                                                <ul>
                                                    {patient.treatments?.filter(treatment => treatment.disease?.disease_id === disease.disease_id).map(treatment => (
                                                        <li key={treatment.treatment_id}>
                                                            Treatment: {treatment.treatment_options} - Success: {treatment.success ? 'Yes' : 'No'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setSelectedPatientId(patient.id)}>
                                        Assign Treatment
                                    </button>
                                    <button onClick={() => handleDischargePatient(patient.id)}>
                                        Discharge Patient
                                    </button>
                                </li>
                            </ul>
                        </li>
                    ))}
            </ul>

            <h3>Create a New Patient</h3>
            <form onSubmit={handleCreatePatient}>
                <label>Patient Name:</label>
                <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    required
                />
                <select multiple={true} value={selectedDiseases} onChange={handleDiseaseSelection}>
                    {diseases.map(disease => (
                        <option key={disease.disease_id} value={disease.disease_id}>
                            {disease.name}
                        </option>
                    ))}
                </select>
                <button type="submit">Create Patient</button>
            </form>

            {selectedPatientId && (
                <div>
                    <h3>Assign Treatment</h3>
                    <form onSubmit={handleAssignTreatment}>
                        <label>Treatment Options:</label>
                        <select
                            value={selectedTreatmentOption}
                            onChange={(e) => setSelectedTreatmentOption(e.target.value)}
                            required
                        >
                            <option value="">Select Treatment</option>
                            {treatmentOptionsList.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <button type="submit">Assign Treatment</button>
                    </form>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default DoctorDashboard;