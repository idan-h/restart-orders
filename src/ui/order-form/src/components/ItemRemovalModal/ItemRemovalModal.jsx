/* eslint-disable react/prop-types */
import Modal from 'react-modal';
import './item-removal-modal.css';

const ItemRemovalModal = ({ isModalOpen, onRequestClose, onDeleteProduct }) => {
  return (
    <Modal
      isOpen={isModalOpen}
      ariaHideApp={false}
      onRequestClose={onRequestClose}
      overlayClassName='modal-overlay'
      className='confirmation-modal-container'
    >
      <div className='modal-content'>
        <div className='title'>אישור מחיקת מוצר</div>
        <div className='text'>האם אתם בטוחים שברצונכם למחוק מוצר זה?</div>
        <div className='buttons'>
          <button className='cancel-button' onClick={onRequestClose}>
            חזור
          </button>
          <button className='submit-button' onClick={onDeleteProduct}>
            מחק
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default ItemRemovalModal;
