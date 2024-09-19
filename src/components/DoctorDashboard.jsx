
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import { getDoctors, deleteDoctor } from '../api.js';

const DoctorDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [loggedInDoctor, setLoggedInDoctor] = useState('');

    useEffect(() => {
        fetchDoctors();
        
        const doctorData = localStorage.getItem('doctor');
        if (doctorData) {
            setLoggedInDoctor(JSON.parse(doctorData));
        }
    }, []);

    const fetchDoctors = async () => {
        const response = await getDoctors();
        setDoctors(response.data);
    };

    const handleDelete = async (id) => {
        await deleteDoctor(id);
        fetchDoctors();
    };

  
    const styles = {
        container: {
            backgroundColor:'#ADD8E6',
        },
        
        
        doctorDashboardTitle: {
            position: 'absolute',
            left: '63%',
            transform: 'translateX(-50%)', 
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            marginTop: '40px',
           
        },
        quickCareTitle: {
            position: 'absolute',
            right: '400px', 
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#008000', 

            
        },
        sidebar: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', 
            width: '300px',
            borderRight: '1px solid #ddd',
            padding: '20px',
            backgroundColor: '#FFC0CB', 
            height: '100vh',
        },
        sidebarList: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', 
            listStyleType: 'none', 
            padding: '0', 
            margin: '0',
            flexGrow: 1, 
        },
        listItemButton: {
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            marginBottom: '20px', 
            cursor: 'pointer',
            width: '100%', 
            textAlign: 'center', 
            borderRadius: '5px',
        },
        logoutButton: {
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            padding: '10px 0',
            width: '100%', 
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '30px', 
            borderRadius: '5px',
        },
        helpModuleButton: {
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            width: '100%', 
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '5px',
        },
        mainContent: {
            padding: '20px',
            flex: 1,
        },
        listItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #ddd',
        },
        button: {
            marginLeft: '10px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            cursor: 'pointer',
        },
        dashboardLayout: {
            display: 'flex',
            width: '100%',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                
                <span style={styles.doctorDashboardTitle}>Doctor Dashboard</span>
                
               
                <span style={styles.quickCareTitle}>Quick Care MD</span>
            </div>
            <div style={styles.dashboardLayout}>
                
                <div style={styles.sidebar}>
                    <ul style={styles.sidebarList}>
                        <li><button style={styles.listItemButton}>Patient Management</button></li>
                        <li><button style={styles.listItemButton}>Treatment Management</button></li>
                        <li><button style={styles.listItemButton}>Disease List</button></li>
                    </ul>

                    
                    <Link to="/">
                        <button style={styles.logoutButton}>Logout</button>
                    </Link>
                    
                   
                    <button style={styles.helpModuleButton}>Help Module</button>
                </div>
                
                
                <div style={styles.mainContent}>
                    <ul>
                        {doctors.map((doctor) => (
                            <li key={doctor.id} style={styles.listItem}>
                                {doctor.name} - {doctor.specialty}
                                <button style={styles.button} onClick={() => handleDelete(doctor.id)}>Fire Doctor</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
