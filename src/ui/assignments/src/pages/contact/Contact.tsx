import { AppHeader } from "../../components/AppHeader";


export const Contact = () => {
  return (
    <>
      <AppHeader />
      <div className="app-page">
        <h4>איש קשר - איתי מטלון</h4>
        <p><a href="https://api.whatsapp.com/send?phone=00972523129045" target='_blank'>972-52-3129045+</a></p>
        <p><a href="mailto:itai@restartglobal.org">itai@restartglobal.org</a></p>
      </div>
    </>
  );
};
