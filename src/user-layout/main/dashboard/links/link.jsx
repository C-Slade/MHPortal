import React, { useEffect } from "react";
import { collectionData } from "../../../../firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../../../context/authContext.js";
import link_icon from "../../../../assets/external-link.png";
import bin_icon from "../../../../assets/bin.png";

const Link = ({ info }) => {
  const { admin } = useAuth();
  const deleteLink = async () => {
    const docRef = doc(collectionData, "links", "links");
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    if (docSnap.exists()) {
      let copyOfData = data;

      copyOfData.links.forEach((copyOfLink, index) => {
        if (copyOfLink.name === info.name) {
          copyOfData.links.splice(index, 1);
        }
      });

      await updateDoc(docRef, copyOfData);
    }
  };

  const getTranferProtocol = () => {
    if (info.link.includes("https") || info.link.includes("http")) {
      return info.link;
    } else {
      return `https://${info.link}`;
    }
  };
  return (
    <div className="link-container">
      <a
        href={getTranferProtocol()}
        className="link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={link_icon} alt="Link" /> <h4>{info.name}</h4>
      </a>
      {admin ? (
        <img
          src={bin_icon}
          alt="delete link"
          className="deleteLink"
          onClick={deleteLink}
        />
      ) : null}
    </div>
  );
};

export default Link;
