import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Section from "./components/section";
import "./css/styles.css";
import { useAuth } from "../../context/authContext";
import SectionSkeleton from "./components/sectionSkeleton.jsx";
import { useDocs } from "../../context/docContext";

const DocRoute = ({ docs, title }) => {
  const [docsToShow, setDocsToShow] = useState();
  const [moderator, setModerator] = useState(false);
  const { currentUser, admin } = useAuth();
  const { allDocs } = useDocs();

  useEffect(() => {
    console.log("render docROute");
    docs.moderators.forEach((moderator) => {
      if (moderator.id === currentUser.uid) {
        setModerator(true);
      }
    });
    setDocsToShow(docs.sections);
    window.scrollTo(0, 1);
  }, []);
  return (
    <>
      <div className="doc-route-container">
        {docsToShow
          ? docsToShow.map((doc, i) => (
              <Section
                key={uuidv4()}
                docs={doc}
                pageID={docs.id}
                sectionIndex={i}
                moderator={moderator}
              />
            ))
          : null}
        {currentUser && (admin || moderator) ? <SectionSkeleton /> : null}
      </div>
    </>
  );
};

export default DocRoute;
