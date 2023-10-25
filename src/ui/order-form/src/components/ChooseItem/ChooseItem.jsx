/* eslint-disable react/prop-types */
import { Edit, Plus, X } from 'react-feather';

const ChooseItem = ({ lable, itemType, selectedItems, setSelectedItems, setAvailableItems, setModalToOpen, setItemToEdit}) => {

  const toggleModal = (editItem, items) => {
    if (editItem) {
      setItemToEdit(editItem);
    } else {
      setItemToEdit(null);
    }
    return setModalToOpen(items);
  };

  const onRemoveItem = (newItem, selectedItems, setSelectedItems, setAvailableItems) => {
    setItemToEdit(null);
    setSelectedItems(
      selectedItems.filter((i) => i.product_number !== newItem.product_number)
    );
    setAvailableItems((currnet) => [...currnet, newItem]);
  };

  return (
    <div>
      <label>{lable}</label>
      <div className='items-container'>
        {selectedItems.map((item) => (
          <div key={item.product_number} className='item'>
            <div>{item.name}</div>
            <div className='options-container'>
              <div className='quantity'>{item.quantity}</div>
              <div className='option-buttons'>
                <Edit
                  className='edit-btn'
                  onClick={() => toggleModal(item, itemType)}
                />

                <X
                  className='remove-btn'
                  onClick={() => onRemoveItem(item, selectedItems, setSelectedItems, setAvailableItems)}
                />
              </div>
            </div>
          </div>
        ))}
        <div className='add-button-container'>
          <button type='button' onClick={() => setModalToOpen(itemType)}>
            <Plus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseItem;
