/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import AddItemModal from '../addItemModal/AddItemModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorPage from '../ErrorPage/ErrorPage';
import Loader from '../Loader/Loader';
import ChooseItem from '../ChooseItem/ChooseItem';
import './SuppliersForm.css';
import Header from "./components/header/Header";
import TextField from "./components/text-field/TextField";
import PhoneField from "./components/phone-field/PhoneField";
import SimpleSelect from "./components/simple-select/SimpleSelect";
import {useSuppliersFormData} from "./hooks/use-suppliers-form-data";

const defaultValues = {
    supplier_name: '',
    contact_name: '',
    phone: '',
    sector: '',
    location: '',
};
const SuppliersForm = ({ updateForm }) => {
    const equipmentItems = 'equipmentItems';
    const confirmation = 'confirmation'
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalToOpen, setModalToOpen] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onBlur',
        defaultValues: defaultValues,
    });

    const { errorType, loading, items, sectors, setItems, setLoading } = useSuppliersFormData(updateForm, reset, setSelectedItems);
    const navigate = useNavigate();

    const { id } = useParams();



    const onSubmit = (data) => {
        const requestDetails = {
            supplier_name: data.supplier_name,
            sector: data.sector,
            contact_name: data.contact_name,
            phone: data.phone,
            location: data.location,
            subitems: selectedItems.map((item) => ({
                name: item.name,
                product_number: item.product_number,
                inventory: item.quantity,
                note: item.note,
            }))
        }

        if (updateForm) requestDetails.id = id;

        setLoading(true);

        fetch(
            'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/create_update_supplier',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestDetails),
            }
        ).then((res) => res.json().then((data) => {
            setLoading(false);

            if ('error' in data || 'message' in data) {
                toast.error('תקלה בעת שליחת הטופס, אנא נסו שוב במועד מאוחר יותר');
                return;
            }

            toast.success('הבקשה נשלחה בהצלחה');

            if (!updateForm) {
                return navigate(`/suppliers-thank-you?id=${data.id}`, { replace: true });
            } else {
                return navigate(`/suppliers-thank-you?id=${id}`, { replace: true });
            }
        })).catch(() => {
            setLoading(false);

            toast.error('תקלה בעת שליחת הטופס, אנא נסו שוב במועד מאוחר יותר');
        });
    }

    const getErrorPage = () => {
        let title, content;
        switch (errorType) {
            case 'error':
                title = 'שגיאה';
                content = 'אנא נסו שנית במועד מאוחר יותר.';
                break;
            case 'cancel':
                title = 'הזמנה זו בוטלה.';
                content = 'אנא שלחו טופס חדש בהתאם לצורך.';
                break;
            default:
                return;
        }
        return <ErrorPage title={title} content={content} />;
    };

    const onCancelForm = () => {
        setLoading(true);
        setModalToOpen(null);
        fetch(
            'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/create_update_supplier',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, is_cancel: true }),
            }
        )
            .then((res) =>
                res.json().then((data) => {
                    setLoading(false);

                    if ('error' in data) {
                        toast.error('תקלה בעת שליחת הטופס, אנא נסו שוב במועד מאוחר יותר');
                        return;
                    }
                    toast.success('הבקשה שלך בוטלה בהצלחה!');

                    window.location.reload(false);
                })
            )
            .catch(() => {
                setLoading(false);

                toast.error('תקלה בעת ביטל הטופס, אנא נסו שוב במועד מאוחר יותר');
            });
    };

    return (
        <div className={'suppliers-form'}>
            <div className='bg'>
                {loading && <Loader />}
                {errorType && getErrorPage()}
                <div className='form-container'>
                    <Header updateForm={updateForm} />
                    <form className='form' onSubmit={handleSubmit(onSubmit)}>
                        <div className='grid-container'>
                            <div className='field-container'>
                                <div className='field-title'>
                                    <label>שם ספק</label>
                                    <span className='required'>*</span>
                                    <div className='error-message'>{errors.supplier_name?.message}</div>
                                </div>
                                <TextField updateForm={updateForm} register={register} name={'supplier_name'} />
                            </div>
                            <div className='field-container'>
                                <div className='field-title'>
                                    <label>שם איש קשר</label>
                                    <span className='required'>*</span>
                                    <div className='error-message'>{errors.contact_name?.message}</div>
                                </div>
                                <TextField
                                    updateForm={updateForm}
                                    register={register}
                                    name={'contact_name'}
                                    placeholder={'שם מלא'}
                                />
                            </div>
                            <div className='field-container'>
                                <div className='field-title'>
                                    <label>מספר טלפון</label>
                                    <span className='required'>*</span>
                                    <div className='error-message'>{errors.phone?.message}</div>
                                </div>
                                <PhoneField name={'phone'} register={register} updateForm={updateForm} placeholder={'מספר טלפון'} />
                            </div>
                            <div className='field-container'>
                                <div className='field-title'>
                                    <label>כתובת</label>
                                    <span className='required'>*</span>
                                    <div className='error-message'>{errors.location?.message}</div>
                                </div>
                                <TextField
                                    updateForm={updateForm}
                                    register={register}
                                    name={'location'}
                                    placeholder={'כתובת'}
                                />
                            </div>
                            <div className='field-container'>
                                <div className='field-title'>
                                    <label>תחום</label>
                                    <span className='required'>*</span>
                                    <div className='error-message'>{errors.sector?.message}</div>
                                </div>
                                <SimpleSelect
                                    name={'sector'}
                                    register={register}
                                    watch={watch}
                                    options={sectors}
                                />
                            </div>
                            <ChooseItem
                                lable="בחירת פריטי ציוד:"
                                itemType={equipmentItems}
                                selectedItems={selectedItems}
                                setSelectedItems={setSelectedItems}
                                setAvailableItems={setItems}
                                setModalToOpen={setModalToOpen}
                                setItemToEdit={setItemToEdit}
                            />
                        </div>
                        <div className='form-btns'>
                            <button className='submit-button' type='submit'>
                                {updateForm ? 'עדכון בקשה' : 'שליחת בקשה'}
                            </button>
                            {updateForm && (
                                <button
                                    type='button'
                                    className='cancel-button'
                                    onClick={() => setModalToOpen(confirmation)}
                                >
                                    ביטול בקשה
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmationModal
                isModalOpen={modalToOpen === confirmation}
                onRequestClose={() => setModalToOpen(null)}
                onCancelForm={onCancelForm}
            />

            <AddItemModal
                isModalOpen={modalToOpen === equipmentItems}
                onRequestClose={() => setModalToOpen(null)}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                setAvailableItems={setItems}
                availableItems={items}
                itemToEdit={itemToEdit}
                setItemToEdit={setItemToEdit}
                includeNoteField={true}
            />
        </div>
    );
};

export default SuppliersForm;
