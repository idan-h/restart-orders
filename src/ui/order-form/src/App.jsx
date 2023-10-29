import Form from './components/Form/Form';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ThankYouMessage from "./components/ThankYouMessage/ThankYouMessage";
import SuppliersForm from "./components/suppliers-form/SuppliersForm";

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position='top-center'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path='/' element={<Form />} />
        <Route path='/:id' element={<Form updateForm={true} />} />
        <Route path='/suppliers-form' element={<SuppliersForm />} />
        <Route path='/suppliers-thank-you' element={<ThankYouMessage isSupplier={true} />} />
        <Route path='/suppliers-form/:id' element={<SuppliersForm updateForm={true} />} />
        <Route path='/thank-you' element={<ThankYouMessage />} />
      </Routes>
    </BrowserRouter>
  );
}
