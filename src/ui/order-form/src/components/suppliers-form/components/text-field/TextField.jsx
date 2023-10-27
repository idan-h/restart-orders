/* eslint-disable react/prop-types */
export default function TextField({ register, updateForm, name, ...rest }) {
    return (
        <input
            disabled={updateForm}
            className='text-field'
            type='text'
            {...register(name, { required: 'חובה' })}
            {...rest}
        />
    )
}