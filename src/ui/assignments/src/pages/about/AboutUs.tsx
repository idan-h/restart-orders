import { AddCircle28Regular, Checkmark28Regular } from "@fluentui/react-icons";

import { Microsoft, Monday, Restart, Oracle, Firma } from "./images";
import { LoginHeader } from "../../components/header";
import { pageStyle } from "../sharedStyles";

const TextLine = (text: string) => {
  return (
    <div style={{ marginTop: "10px", display: "flex" }}>
      <AddCircle28Regular style={{ minWidth: "28px", marginLeft: "5px" }} />
      {text}
    </div>
  );
};

const TextLine2 = (text: string) => {
  return (
    <div style={{ marginTop: "5px", display: "flex" }}>
      <Checkmark28Regular style={{ minWidth: "28px", marginLeft: "5px" }} />
      {text}
    </div>
  );
};

export const AboutUs = () => {
  return (
    <>
      <LoginHeader />
      <div style={pageStyle}>
        <h1 style={{ textAlign: "center" }}>מי אנחנו</h1>
        <p>
          <b style={{ marginBottom: "10px" }}>
            פלטפורמה ללא מטרות רווח שמאחדת בין הבקשות בשטח לבין הספקים
          </b>
          {TextLine("קיבוץ ובקרה של הבקשות בשטח במקום אחד")}
          {TextLine(
            "עבודה משותפת עם עמותות, ספקים ותורמים על מנת ליצור מערכת משותפת של אספקת הציוד לחיילים בצורה היעילה ביותר"
          )}
          {TextLine("אוטובוס הקסמים- אמלחייה ניידת לתיקון הציוד שלכם")}
          {TextLine("איסוף תרומות לקניית הציוד")}
        </p>

        <h1 style={{ textAlign: "center" }}>איך זה יעבוד</h1>
        <p>
          {TextLine2("איסוף הדרישות מהשטח")}
          {TextLine2("בחירת הביקוש אותו תוכל לספק")}
          {TextLine2("שינוע וסיפוק הציוד לחיילים")}
        </p>

        <p style={{ textAlign: "center", marginTop: "25px" }}>
          <a href="https://restartglobal.org/home">
            <div>
              <img style={{ height: "80px" }} src={Restart} alt="restart"></img>
            </div>
            לאתר עמותת Restart
          </a>
        </p>

        <p>
          <div style={{ margin: "-10px 0px 15px" }}>שותפים</div>

          <div
            style={{
              textAlign: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <img style={{ height: "60px" }} src={Firma} alt="Firma"></img>
            <img style={{ height: "60px" }} src={Oracle} alt="Oracle"></img>
            <img style={{ height: "60px" }} src={Monday} alt="Monday"></img>
            <img
              style={{ height: "60px" }}
              src={Microsoft}
              alt="Microsoft"
            ></img>
          </div>
        </p>
      </div>
    </>
  );
};
