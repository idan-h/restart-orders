/* eslint-disable react/prop-types */

export default function Header({ updateForm }) {
    return (
        <div className='header'>
            <img src='/content/Logo.png' alt='LOGO' className='logo' />
            <div className='title'>
                {updateForm ? 'עדכון הזמנה' : 'טופס ספקים לציוד לחימה'}
            </div>
        </div>
    )
}