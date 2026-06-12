import { useState, useEffect } from 'react';
import usersService from '../services/usersService';

const ProfileView = ({ username }) => {
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [update, setUpdate] = useState(false);

    useEffect(() => {
        usersService.getMe(username)
        .then(data => {
            setProfileData(data);
        })
        .catch(error => {
            console.error("Error al obtener los datos del perfil:", error);
        });
    }, [update]);

    const handleUpdate = (updatedData) => {
        setIsEditing(false);
        usersService.updateMe(username, updatedData).then(() => setUpdate(!update))
        .catch(error => {
            console.error("Error al actualizar los datos del perfil:", error);
        });
    };

    if (!profileData) return <p>Cargando...</p>;

    return (
        <div>
        <h2>PERFIL</h2>
            <UserProfileDisplay 
            user={profileData} 
            onEditClick={() => setIsEditing(true)} 
            />
        {isEditing && (
            <UserProfileEditForm 
            user={profileData} 
            onCancel={() => setIsEditing(false)} 
            onSave={handleUpdate} 
            />
        )}
        </div>
    );
};

const UserProfileDisplay = ({ user, onEditClick}) => {
    return (
        <div>
        <h3>Información del Usuario</h3>
        <ul>
            <li><strong>ID:</strong> {user.id}</li>
            <li><strong>Nombre de usuario:</strong> {user.username}</li>
            <li><strong>Correo electrónico:</strong> {user.email}</li>
            <li><strong>Rol / Permisos:</strong> {user.role}</li>
        </ul>
        <button onClick={onEditClick}>Editar Datos</button>
        </div>
    );
};

const UserProfileEditForm = ({ user, onCancel, onSave }) => {
    // Estados internos del formulario inicializados con los datos actuales
    const [email, setEmail] = useState(user.email);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Enviamos los datos nuevos hacia el componente padre
        onSave({ newEmail: email });
    };

    return (
        <form onSubmit={handleSubmit}>
        <h3>Modificar Datos del Perfil</h3>
        <div>
            <label>Correo electrónico: </label>
            <input 
            type="email" 
            value={email} 
            onChange={({ target }) => setEmail(target.value)} 
            required 
            />
        </div>
        <br />
        <button type="submit">Guardar Cambios</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>
            Cancelar
        </button>
        </form>
    );
};

export default ProfileView;