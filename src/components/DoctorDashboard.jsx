
import { useEffect, useState } from 'react';
import { getDoctors, deleteDoctor } from '../api.js';

const DoctorDashboard = () => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        const response = await getDoctors();
        setDoctors(response.data);
    };

    const handleDelete = async (id) => {
        await deleteDoctor(id);
        fetchDoctors(); 
    };

    return (
        <div>
            <h2>Doctor Dashboard</h2>
            <ul>
                {doctors.map((doctor) => (
                    <li key={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                        <button onClick={() => handleDelete(doctor.id)}>Fire Doctor</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DoctorDashboard;