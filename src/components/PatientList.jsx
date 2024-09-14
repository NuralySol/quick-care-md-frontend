
import { useEffect, useState } from 'react';
import { getPatients } from '../api.js';

const PatientList = () => {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const response = await getPatients();
            setPatients(response.data);
        }
        fetchData();
    }, []);

    return (
        <div>
            <h2>Patient List</h2>
            <ul>
                {patients.map((patient) => (
                    <li key={patient.id}>{patient.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default PatientList;