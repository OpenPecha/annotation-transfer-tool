import { Route, Routes } from "react-router-dom";

import { AnnotationTransferApp } from "@/app/annotation-transfer/AnnotationTransferApp";
import { PydurmaApp } from "@/app/pydurma/PydurmaApp";
import { ToolSelector } from "@/app/ToolSelector";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ToolSelector />} />
      <Route path="/annotation-transfer" element={<AnnotationTransferApp />} />
      <Route path="/pydurma" element={<PydurmaApp />} />
    </Routes>
  );
}
