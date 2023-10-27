/* eslint-disable react/prop-types */
export default function SimpleSelect({ register, name, watch, options }) {
    return (
        <select
            className='select-field'
            defaultValue={watch(name)}
            {...register(name, { required: 'חובה' })}
        >
            <option disabled={true} value=''>
                תחום
            </option>

            { options.map((option) => {
                return <option key={option.value} value={option.value}>{option.label}</option>
            })}
        </select>
    )
}