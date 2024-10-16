import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Section from "./components/section";
import "./css/styles.css";
import { useAuth } from "../../context/authContext";
import SectionSkeleton from "./components/sectionSkeleton.jsx";

const DocRoute = ({ docs }) => {
  const [moderator, setModerator] = useState(false);
  const { currentUser, admin } = useAuth();

  useEffect(() => {
    docs.moderators.forEach((moderator) => {
      if (moderator.id === currentUser.uid) {
        setModerator(true);
      }
    });
    window.scrollTo(0, 1);
  }, []);
  return (
    <>
      <div className="doc-route-container">
        {docs.sections.map((doc, i) => (
          <Section
            key={uuidv4()}
            docs={doc}
            pageID={docs.id}
            sectionIndex={i}
            moderator={moderator}
          />
        ))}
        {currentUser && (admin || moderator) ? <SectionSkeleton /> : null}
      </div>
    </>
  );
};

export default DocRoute;
