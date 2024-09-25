import { useEffect, useReducer, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctor, createPatient, getDiseases, assignTreatment, dischargePatient, getTreatmentOptions, getDischargedPatients } from '../api.js';
import './DoctorsDash.css'

// Define the initial state for the reducer
const initialState = {
    doctor: null,
    activePatients: [],
    dischargedPatients: [],
    diseases: [],
    treatmentOptionsList: [],
    error: ''
};

// Define the reducer function
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_DOCTOR':
            return {
                ...state,
                doctor: action.payload.doctor,
                activePatients: action.payload.doctor.patients.filter(patient => !patient.discharged),
            };
        case 'FETCH_DISCHARGED_PATIENTS':
            return {
                ...state,
                dischargedPatients: action.payload.dischargedPatients,
            };
        case 'FETCH_DISEASES':
            return {
                ...state,
                diseases: action.payload.diseases,
            };
        case 'FETCH_TREATMENT_OPTIONS':
            return {
                ...state,
                treatmentOptionsList: action.payload.treatmentOptionsList,
            };
        case 'ADD_PATIENT':
            return {
                ...state,
                activePatients: [...state.activePatients, action.payload.patient],
            };
        case 'DISCHARGE_PATIENT':
            return {
                ...state,
                activePatients: state.activePatients.filter(patient => patient.id !== action.payload.patientId),
                dischargedPatients: [...state.dischargedPatients, action.payload.dischargedPatient],
            };
        case 'ASSIGN_TREATMENT':
            return {
                ...state,
                activePatients: state.activePatients.map(patient =>
                    patient.id === action.payload.patientId
                        ? { ...patient, treatments: [...(patient.treatments ?? []), action.payload.treatment] }
                        : patient
                ),
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload.error,
            };
        default:
            return state;
    }
};

// DoctorDashboard Component
const DoctorDashboard = () => {
    const { id } = useParams(); // Doctor ID from the route
    const [newPatientName, setNewPatientName] = useState('');
    const [selectedDiseases, setSelectedDiseases] = useState([]);
    const [selectedTreatmentOption, setSelectedTreatmentOption] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    // Use useReducer to handle the state
    const [state, dispatch] = useReducer(reducer, initialState);

    // Fetch doctor and other related data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const doctorResponse = await getDoctor(id);
                const diseaseResponse = await getDiseases();
                const treatmentOptionsResponse = await getTreatmentOptions();
                const dischargedPatientsResponse = await getDischargedPatients();

                dispatch({
                    type: 'FETCH_DOCTOR',
                    payload: { doctor: doctorResponse.data },
                });
                dispatch({
                    type: 'FETCH_DISEASES',
                    payload: { diseases: diseaseResponse.data },
                });
                dispatch({
                    type: 'FETCH_TREATMENT_OPTIONS',
                    payload: { treatmentOptionsList: treatmentOptionsResponse.data },
                });
                dispatch({
                    type: 'FETCH_DISCHARGED_PATIENTS',
                    payload: { dischargedPatients: dischargedPatientsResponse.data },
                });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: { error: 'Error fetching data' } });
                console.error('Error fetching data:', error);
            }
        };

        fetchInitialData();
    }, [id]);

    // Handle creating a new patient
    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            const diseaseObjects = state.diseases.filter(disease => selectedDiseases.includes(disease.disease_id));

            const patientData = {
                name: newPatientName,
                doctor: state.doctor.id,
                disease: diseaseObjects,
            };

            const response = await createPatient(patientData);

            dispatch({ type: 'ADD_PATIENT', payload: { patient: response.data } });
            setNewPatientName('');
            setSelectedDiseases([]);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: { error: 'Failed to create patient' } });
            console.error('Failed to create patient:', error);
        }
    };

    // Handle discharging a patient and removing them from the active view
    const handleDischargePatient = async (patientId) => {
        const patient = state.activePatients.find(p => p.id === patientId);

        if (!patient?.disease.length || !(patient?.treatments?.length)) {
            alert("Patient must have at least one disease and one treatment before discharge.");
            return;
        }

        try {
            const response = await dischargePatient(patientId);
            const dischargedPatient = response.data.discharge;

            dispatch({
                type: 'DISCHARGE_PATIENT',
                payload: {
                    patientId,
                    dischargedPatient,
                },
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: { error: 'Failed to discharge patient' } });
            console.error('Failed to discharge patient:', error);
        }
    };

    // Handle assigning a treatment to a patient
    const handleAssignTreatment = async (e) => {
        e.preventDefault();
        try {
            const treatmentData = {
                treatment_options: selectedTreatmentOption,
                doctor: state.doctor.id,
                patient: selectedPatientId,
            };

            const response = await assignTreatment(treatmentData);
            dispatch({
                type: 'ASSIGN_TREATMENT',
                payload: {
                    patientId: selectedPatientId,
                    treatment: response.data,
                },
            });

            setSelectedTreatmentOption('');
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: { error: 'Failed to assign treatment' } });
            console.error('Failed to assign treatment:', error);
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

    // Render the UI
    if (!state.doctor) {
        return <div>Loading...</div>;
    }

    return (
        <div className='dashboard-container'>
            {/* Hospital name */}
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>QuickCare Md</h1>

            {/* Add home button */}
            <div style={{ textAlign: 'right' }}>
                <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                    Home
                </Link>
            </div>

            <h2>Doctor Dashboard</h2>
            <strong>{state.doctor.name}</strong> - {state.doctor.specialty || 'General Doctor'}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Active Patients List */}
                <div>
                    <h4>Active Patients:</h4>
                    <ul>
                        {state.activePatients.map((patient) => (
                            <li key={patient.id}>
                                <strong>{patient.name}</strong> (Admitted: {new Date(patient.time_admitted).toLocaleDateString()})
                                <ul>
                                    <li><strong>Diseases:</strong>
                                        <ul>
                                            {patient.disease?.map((disease) => (
                                                <li key={disease.disease_id}>
                                                    {disease.name} - Terminal: {disease.is_terminal ? 'Yes' : 'No'}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                    <li><strong>Treatments:</strong>
                                        <ul>
                                            {patient.treatments?.map((treatment) => (
                                                <li key={treatment.treatment_id}>
                                                    {treatment.treatment_options} - Success: {treatment.success ? 'Yes' : 'No'}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                    <li>
                                        <button onClick={() => setSelectedPatientId(patient.id)}>
                                            Assign Treatment
                                        </button>
                                        <button
                                            onClick={() => handleDischargePatient(patient.id)}
                                            disabled={!(patient.disease?.length && patient.treatments?.length)}  // Disable button if no disease or treatment
                                        >
                                            Discharge Patient
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Discharged Patients List */}
                <div>
                    <h4>Discharged Patients:</h4>
                    <ul>
                        {state.dischargedPatients.map((patient) => (
                            <li key={patient.discharge_id}>
                                <strong>{patient.patient_name}</strong> - Status: <em>Discharged</em>
                                <ul>
                                    <li><strong>Diseases:</strong>
                                        <ul>
                                            {patient.disease?.map((disease) => (
                                                <li key={disease.disease_id}>
                                                    {disease.name} - Terminal: {disease.is_terminal ? 'Yes' : 'No'}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                    <li><strong>Treatments Received:</strong>
                                        <ul>
                                            {patient.treatments?.map((treatment) => (
                                                <li key={treatment.treatment_id}>
                                                    {treatment.treatment_options} - Success: {treatment.success ? 'Yes' : 'No'}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

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
                    {state.diseases.map(disease => (
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
                            {state.treatmentOptionsList.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <button type="submit">Assign Treatment</button>
                    </form>
                </div>
            )}

            {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
        </div>
    );
};

export default DoctorDashboard;
