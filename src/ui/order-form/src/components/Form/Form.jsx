/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import AddItemModal from '../AddItemModal/AddItemModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorPage from '../ErrorPage/ErrorPage';
import Loader from '../Loader/Loader';
import ChooseItem from '../ChooseItem/ChooseItem';
import './form.css';

const defaultValues = {
  name: '',
  phone: '',
  unit: '',
  job: '',
  email: '',
  location: '',
  tenant: '',
  subitems: [],
};
const Form = ({ updateForm }) => {
  const equipmentItems = 'equipmentItems'
  const sewingItems = 'sewingItems'
  const confirmation = 'confirmation'
  const [selectedEquipmentItems, setSelectedEquipmentItems] = useState([]);
  const [selectedSewingItems, setSelectedSewingItems] = useState([]);
  const [availableEquipmentItems, setAvailableEquipmentItems] = useState([]);
  const [availableSewingItems, setAvailableSewingItems] = useState([]);
  const [modalToOpen, setModalToOpen] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [isLoading, setIsLoading] = useState(updateForm); // set to true if updateForm is true, else false
  const [errorType, setErrorType] = useState('');
  const [formType, setFormType] = useState('IDF'); //noaa
  const navigate = useNavigate();

  const { id } = useParams();

  const itemTypes = [
    { type: 'equipment', setSelectedItems: setSelectedEquipmentItems, setAvailableItems: setAvailableEquipmentItems },
    { type: 'sewing', setSelectedItems: setSelectedSewingItems, setAvailableItems: setAvailableSewingItems }
  ];

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

  const fetchProducts = (currentType) => { //noaa
    fetch(
      `https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/get-products`
    )
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        if ('error' in data) {
          setErrorType('error');
          return;
        }

        data = data.filter(item => item.type.includes(currentType));

        itemTypes.forEach(({ type, setSelectedItems, setAvailableItems }) => {
          setAvailableItems([...data]);
        });
      })
      .catch((error) => {
        setIsLoading(false);

        console.error(`There was an error fetching the data: ${error}`);
        setErrorType('error');
        return;
      });
  }

  useEffect(() => {
    setIsLoading(true);

    if (updateForm) {
      fetch(
        'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/get-order?id=' +
          id
      )
        .then((res) => res.json())
        .then((data) => {
          if ('error' in data) {
            setErrorType('error');
            return;
          }
          if (data.is_cancel) {
            setErrorType('cancel');
            return;
          }
          const subitems = [...data.subitems];

          itemTypes.forEach(({ type, setSelectedItems, setAvailableItems }) => {
            setSelectedItems(subitems);

            setAvailableItems((currentAvailableItems) => {
              return currentAvailableItems.filter(
                (item) =>
                !data.subitems.some(
                  (subitem) => subitem.product_number === item.product_number
                )
            );
            });
          });

          let type = data.type ?? 'IDF';
          setFormType(type);
          reset(data);
          fetchProducts(type)

          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          setErrorType('error');
          console.error(`There was an error fetching the data: ${error}`);
          return;
        });
    }
    else {
      let params = new URLSearchParams(window.location.search);
      let type = params.get('type') ?? 'IDF';
      setFormType(type);
      fetchProducts(type)
    }
  }, []);

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
    setIsLoading(true);
    setModalToOpen(null);
    fetch(
      'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/create-update-order',
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
          setIsLoading(false);

          if ('error' in data) {
            toast.error('תקלה בעת שליחת הטופס, אנא נסו שוב במועד מאוחר יותר');
            return;
          }
          toast.success('הבקשה שלך בוטלה בהצלחה!');

          window.location.reload(false);
        })
      )
      .catch((error) => {
        setIsLoading(false);

        toast.error('תקלה בעת ביטל הטופס, אנא נסו שוב במועד מאוחר יותר');
      });
  };

  const onSubmit = (formData) => {
    formData.subitems = [...selectedEquipmentItems, ...selectedSewingItems];

    if (updateForm) {
      formData.id = id;
    } else {
      let params = new URLSearchParams(window.location.search);
      let tenant = params.get('tenant');
      formData.tenant = tenant;
      formData.type = formType;
    }
    setIsLoading(true);

    fetch(
      'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/create-update-order',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    )
      .then((res) =>
        res.json().then((data) => {
          setIsLoading(false);

          if ('error' in data) {
            toast.error('תקלה בעת שליחת הטופס, אנא נסו שוב במועד מאוחר יותר');
            return;
          }

          toast.success('הבקשה נשלחה בהצלחה');

          if (!updateForm) {
            return navigate(`/${data.id}`, { replace: true });
          }
        })
      )
      .catch((error) => {
        setIsLoading(false);

        toast.error('תקלה בעת שליחת הטופס, אנא נסו שוב במועד מאוחר יותר');
      });
  };

  return (
    <div className='background'>
      {isLoading && <Loader />}
      {getErrorPage()}
      <div className='form-container'>
        <div className='header'>
          <img src='/content/Logo.png' alt='LOGO' className='logo' />
          <div className='title'>
            {updateForm ? 'עדכון הזמנה' : (formType == 'EMR' ? 'דרישת ציוד לכח כוננות' : 'בקשה לתרומה לציוד לחימה ')}
          </div>
          <div className='description' hidden={updateForm || formType != 'IDF'}>
            טופס זה מיועד למשרתים פעילים בצה״ל סדיר ,מילואים וקבע. אם הינך אדם
            פרטי וברצונך לסייע לכח לוחם בהשלמת ציוד , אנא הפנה טופס זה לקצין
            האמל״ח או לגורם רלוונטי ביחידה. נא לרכז את כל הפריטים בטופס אחד
          </div>
          <div className='description' hidden={updateForm || formType != 'EMR'}>
            טופס זה מיועד לכחות כוננות קיימים ובהתהוות.
            אנו מבקשים שהטופס ימולא רק בידי איש הקשר הרלוונטי שאחראי באופן רשמי על הצטיידות כח הכוננות
          </div>
        </div>
        <form className='form' onSubmit={handleSubmit(onSubmit)}>
          <div className='grid-container'>
            <div className='field-container'>
              <div className='field-title'>
                <label>שם מלא</label>
                <span className='required'>*</span>
                <div className='error-message'>{errors.name?.message}</div>
              </div>
              <input
                disabled={updateForm}
                className='text-field'
                type='text'
                placeholder='שם מלא'
                {...register('name', { required: 'חובה' })}
              />
            </div>
            <div className='field-container'>
              <div className='field-title'>
                <label>מספר טלפון</label>
                <span className='required'>*</span>
                <div className='error-message'>{errors.phone?.message}</div>
              </div>
              <input
                disabled={updateForm}
                className='text-field'
                type='tel'
                placeholder='מספר טלפון'
                {...register('phone', updateForm? {} : {
                  pattern: {
                    message: 'מספר טלפון זה אינו תקין',
                    value:
                      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                  },
                  required: 'חובה',
                  minLength: {
                    value: 6,
                    message: 'מספר טלפון זה אינו תקין',
                  },
                  maxLength: {
                    value: 12,
                    message: 'מספר טלפון זה אינו תקין',
                  },
                })}
              />
            </div>

            <div className='field-container'>
              <div className='field-title'>
                <label>כתובת מייל</label>
                <span className='required'>*</span>
                <div className='error-message'>{errors.email?.message}</div>
              </div>
              <input
                disabled={updateForm}
                className='text-field'
                type='email'
                placeholder='כתובת מייל'
                {...register('email', updateForm? {} : {
                  required: 'חובה',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'כתובת מייל אינה תקינה',
                  },
                })}
              />
            </div>
            <div className='field-container'>
              <div className='field-title'>
                <label>{formType == 'EMR' ? "ישוב" : "יחידה"}</label>
                <span className='required'>*</span>
                <div className='error-message'>{errors.unit?.message}</div>
              </div>
              <input
                disabled={updateForm}
                className='text-field'
                type='text'
                placeholder={formType == 'EMR' ? "פרטים מלאים של הישוב" : "פרטים מלאים של היחידה"}
                {...register('unit', { required: 'חובה' })}
              />
            </div>
            <div className='field-container'>
              <div className='field-title'>
                <label>תפקיד</label>
                <span className='required'>*</span>
                <div className='error-message'>{errors.job?.message}</div>
              </div>
              <select
                className='select-field'
                defaultValue={watch('job')}
                {...register('job', { required: 'חובה' })}
              >
                <option disabled={true} value=''>
                  תפקיד
                </option>

                <option value='רבש"צ'>רבש"צ</option>
                <option value='קמב"צ'>קמב"צ</option>
                <option value='אחר'>אחר</option>
              </select>
            </div>
            <div className='field-container'>
              <div className='field-title'>
                <label>מיקום</label>
                <span className='required'>*</span>
                <div className='error-message'>{errors.location?.message}</div>
              </div>
              <select
                className='select-field'
                defaultValue={watch('location')}
                {...register('location', { required: 'חובה' })}
              >
                <option disabled={true} value=''>
                  מיקום
                </option>

                <option value='צפון'>צפון</option>
                <option value='דרום'>דרום</option>
                {
                  formType == 'EMR'
                  ? <option value='מרכז'>מרכז</option>
                  : <option value='אחר'>אחר</option>
                }
              </select>
            </div>
          </div>

          <ChooseItem
            lable="בחירת פריטי ציוד:"
            itemType={equipmentItems}
            selectedItems={selectedEquipmentItems}
            setSelectedItems={setSelectedEquipmentItems}
            setAvailableItems={setAvailableEquipmentItems}
            setModalToOpen={setModalToOpen}
            setItemToEdit={setItemToEdit}
          />

          <ChooseItem
            lable={"בחירת פריטי מתפרה:"}
            itemType={sewingItems}
            selectedItems={selectedSewingItems}
            setSelectedItems={setSelectedSewingItems}
            setAvailableItems={setAvailableSewingItems}
            setModalToOpen={setModalToOpen}
            setItemToEdit={setItemToEdit}
          />

          <div className='field-container'>
            <div className='field-title'>
              <label>הערות</label>
            </div>
            <textarea
              className='text-field'
              placeholder='הערות'
              cols='30'
              rows='5'
              {...register('note', {})}
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
      <ConfirmationModal
        isModalOpen={modalToOpen === confirmation}
        onRequestClose={() => setModalToOpen(null)}
        onCancelForm={onCancelForm}
      />

      <AddItemModal
        isModalOpen={modalToOpen === equipmentItems}
        onRequestClose={() => setModalToOpen(null)}
        selectedItems={selectedEquipmentItems}
        setSelectedItems={setSelectedEquipmentItems}
        setAvailableItems={setAvailableEquipmentItems}
        availableItems={availableEquipmentItems}
        itemToEdit={itemToEdit}
        setItemToEdit={setItemToEdit}
      />

      <AddItemModal
        isModalOpen={modalToOpen === sewingItems}
        onRequestClose={() => setModalToOpen(null)}
        selectedItems={selectedSewingItems}
        setSelectedItems={setSelectedSewingItems}
        setAvailableItems={setAvailableSewingItems}
        availableItems={availableSewingItems}
        itemToEdit={itemToEdit}
        setItemToEdit={setItemToEdit}
      />
    </div>
  );
};

export default Form;
