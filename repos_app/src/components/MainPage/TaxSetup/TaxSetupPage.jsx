import { useState } from "react";
import TaxMasterPage from "./TaxMaster/TaxMasterPage";
import TaxGroupPage from "./TaxGroup/TaxGroupPage";

const TaxSetupPage = () => {
  const [enable, setEnable] = useState(true);
  return (
    <div>
      {enable ? (
        <>
          <TaxMasterPage setEnable={setEnable} />
        </>
      ) : (
        <>
          <TaxGroupPage setEnable={setEnable} />
        </>
      )}
    </div>
  );
};

export default TaxSetupPage;
