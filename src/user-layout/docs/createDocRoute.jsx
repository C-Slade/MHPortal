import React from "react";
import SectionSkeleton from "./components/sectionSkeleton";
import { v4 as uuidv4 } from "uuid";
import { useDocs } from "../../context/docContext";
import PreviewSection from "./components/previewSection";

const CreateDocRoute = () => {
  const { sections } = useDocs();

  return (
    <>
      <div className="doc-route-container create-page">
        {sections
          ? sections.map((section, i) => (
              <PreviewSection key={uuidv4()} docs={section} id={i} />
            ))
          : null}
        <SectionSkeleton />
      </div>
    </>
  );
};

export default CreateDocRoute;
