/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ThankYouMessage.css'

const ThankYouMessage = () => {
    const [orderId, setOrderId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let params = new URLSearchParams(window.location.search);
        let id = params.get('id') ?? '';
        setOrderId(id);
    }, []);

    const goToEdit = () => {
        navigate(`/${orderId}`, { replace: true });
    }

    return (
        <div className='background'>
            <div className='form-container'>
                <div className='header'>
                    <img src='/content/Logo.png' alt='LOGO' className='logo' />
                    <div className='title'>
                        הבקשה התקבלה בהצלחה
                    </div>
                    <div className='description'>
                        תודה שמילאת את הטופס, בקשתך מספר
                        <b>{' ' + orderId + ' '}</b>
                        התקבלה בהצלחה
                    </div>
                </div>
                <button className='submit-button' type='submit' onClick={goToEdit}>
                    עריכת בקשה
                </button>
            </div>
        </div>
    );
};

export default ThankYouMessage;
