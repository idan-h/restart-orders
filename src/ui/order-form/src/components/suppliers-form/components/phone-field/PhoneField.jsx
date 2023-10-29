/* eslint-disable react/prop-types */
export default function PhoneField({ register, updateForm, name, ...rest }) {
    return (
        <input
            disabled={updateForm}
            className='text-field'
            type='tel'
            {...register(name, {
                pattern: {
                    message: 'מספר טלפון זה אינו תקין',
                    value:
                        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,7}$/,
                },
                required: 'חובה',
                minLength: {
                    value: 6,
                    message: 'מספר טלפון זה אינו תקין',
                },
                maxLength: {
                    value: 14,
                    message: 'מספר טלפון זה אינו תקין',
                },
            })}
            {...rest}
        />
    )
}