
import { useEffect, useState } from 'react';
import { getDiseases } from '../api.js';

const DiseaseList = () => {
    const [diseases, setDiseases] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const response = await getDiseases();
            setDiseases(response.data);
        }
        fetchData();
    }, []);

    return (
        <div>
            <h2>Disease List</h2>
            <ul>
                {diseases.map((disease) => (
                    <li key={disease.id}>{disease.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default DiseaseList;