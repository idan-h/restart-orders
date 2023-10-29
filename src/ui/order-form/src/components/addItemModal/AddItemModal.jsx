/* eslint-disable react/prop-types */
// eslint-disable-next-line react/prop-types
import Modal from 'react-modal';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import './add-item-modal.css';

const AddItemModal = ({
  selectedItems,
  setSelectedItems,
  setAvailableItems,
  availableItems,
  isModalOpen,
  onRequestClose,
  itemToEdit,
  setItemToEdit,
  includeNoteField = false,
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [inputQuantity, setInputQuantity] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setSelectedItem(itemToEdit);
      setInputQuantity(itemToEdit.quantity);
      includeNoteField && setNote(itemToEdit.note);
    }
  }, [itemToEdit]);

  const onAddItem = (newItem, availableItems, setAvailableItems, setSelectedItems) => {
    setAvailableItems(
      availableItems.filter((i) => i.product_number !== newItem.product_number)
    );
    setSelectedItems((currnet) => [...currnet, newItem]);
    setItemToEdit(null);
  };

  const onEditItem = (updatedItem, selectedItems, setSelectedItems, availableItems, setAvailableItems) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.product_number === itemToEdit.product_number ? updatedItem : item
      )
    );

    setAvailableItems(
      availableItems.filter(
        (i) => i.product_number !== updatedItem.product_number
      )
    );
    if (itemToEdit.product_number !== updatedItem.product_number) {
      setAvailableItems((currnet) => [...currnet, itemToEdit]);
    }

    setItemToEdit(null);
  };

  const closeModal = () => {
    setInputQuantity(1);
    setSelectedItem(null);
    setItemToEdit(null);
    onRequestClose();
  };

  const handleOnChange = (itemName) => {
    setInputQuantity(1);
    const item = availableItems.find((i) => i.name === itemName) || itemToEdit;
    setSelectedItem({ ...item, quantity: 1 });
  };

  const handleConfirm = () => {
    const finalItem = {
      ...selectedItem,
      quantity: inputQuantity <= 0 ? 1 : inputQuantity,
      note: includeNoteField ? note : undefined,
    };
    itemToEdit ? onEditItem(finalItem, selectedItems, setSelectedItems, availableItems, setAvailableItems) : onAddItem(finalItem, availableItems, setAvailableItems, setSelectedItems);
    setInputQuantity(1);
    setSelectedItem(null);
    setNote('');
    onRequestClose();
  };

  const updateQuantity = (quanity) => {
    setInputQuantity(quanity);
  };

  const itemOptions = [
    {
      label: 'בחר פריט',
      value: '',
      isDisabled: true,
    },
    itemToEdit
      ? {
          label: itemToEdit.name,
          value: itemToEdit.name,
        }
      : null,
    ...availableItems.map((item) => ({
      label: item.name,
      value: item.name,
      className: 'option',
      key: item.product_number,
    })),
  ].filter((option) => option !== null);

  return (
    <Modal
      isOpen={isModalOpen}
      ariaHideApp={false}
      onRequestClose={closeModal}
      overlayClassName='modal-overlay'
      className='modal-container'
    >
      <div className='modal-content'>
        <div className='title'>הוספת/עדכון פריט</div>
        <div className='modal-form'>
          <div className='fields'>
            <Select
              required={selectedItems.length === 0}
              className="select-field"
              value={itemOptions.find((item) => item.value === (selectedItem?.name || ''))}
              onChange={(selectedOption) => handleOnChange(selectedOption.value)}
              options={itemOptions}
              isSearchable={true}
              isClearable={false}
              placeholder="בחר פריט"
            />
            {selectedItem ? (
              <input
                type='number'
                min={1}
                max={99}
                value={inputQuantity}
                onChange={(e) => updateQuantity(e.target.value)}
                className='quantity-input'
              />
            ) : null}

          </div>
          {selectedItem && includeNoteField ? (
              <textarea
                  placeholder={'הערות לגבי המוצר שבחרתם'}
                  className={'note-input'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
              />
          ) : null}
          <button
            onClick={handleConfirm}
            disabled={!selectedItem}
            className='submit-button'
          >
            {itemToEdit ? 'עדכן' : 'הוסף'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default AddItemModal;
