import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../context/authContext.js";
import { collectionData } from "../../../../firebase.js";
import { v4 as uuidv4 } from "uuid";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "./link.jsx";
import AddLink from "./addLink.jsx";
import "./css/styles.css";

const Links = () => {
  const [data, setData] = useState([]);
  const [hasLinks, setHasLinks] = useState(false);
  const { currentUser, admin } = useAuth();

  useEffect(() => {
    if (currentUser !== undefined) {
      const unsub = onSnapshot(doc(collectionData, "links", "links"), (doc) => {
        const data = doc.data();

        if (doc.exists() && data?.links) {
          setData(data);
          setHasLinks(true);
        }
      });

      return unsub;
    }
  }, []);

  return (
    <div className="links-container">
      <h2>Links</h2>
      {hasLinks
        ? data.links.map((link) => <Link info={link} key={uuidv4()} />)
        : null}
      {admin ? <AddLink /> : null}
    </div>
  );
};

export default Links;
