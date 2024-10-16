import React, { useContext, useState, useEffect } from "react";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteField,
  onSnapshot,
} from "firebase/firestore";
import { collectionData, storage } from "../firebase.js";
import { useAuth } from "./authContext.js";
import { v4 as uuidv4 } from "uuid";
import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "./appContext.js";

const DocContext = React.createContext();

export const useDocs = () => {
  return useContext(DocContext);
};

export const DocProvider = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser, deepLink, setDeepLink } = useAuth();
  const { alertError } = useApp();
  const [docNames, setDocNames] = useState([]);
  const [allDocs, setAlldocs] = useState();
  const [allManuals, setAllManuals] = useState();
  const [manualNames, setManualNames] = useState([]);
  const [moderatorNames, setModeratorNames] = useState([]);
  // sections is only used when creating a new page
  const [sections, setSections] = useState([]);
  const [uploadingNewLayout, setUploadingNewLayout] = useState(false);
  const [loadingFIle, toggleLoadingFile] = useState(false);
  const [pageName, setPageName] = useState("");
  const [creatingNewPage, toggleCreatingNewPage] = useState(false);
  const [pdfDocName, setPdfDocName] = useState("");
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [docOnPreview, setDocOnPreview] = useState();
  const [queryName, setQueryName] = useState("");
  // used to refresh pdf viewer and get updated file
  const [newDocToPreview, toggleNewDocToPreview] = useState(false);
  const [currentURL, setCurrentURL] = useState("");

  const [currentDocument, setCurrentDocument] = useState("");

  const location = useLocation();

  const metadata = {
    contentType: "application/pdf",
  };

  const fetchDocs = () => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const documentNames = Object.keys(docSnap.data());
        setAlldocs(docSnap.data());
        setDocNames(documentNames.sort());
        resolve();
      } else {
        reject("no documents found");
      }
    });
  };

  /*
   *userNames Param is an array of names that have access to a specific page (called when editing moderators). This Function grabs all users from firebase and finds the same users that was passed into the function, then returns an array of obj that has their name & id together.
   */

  const getModeratorUids = (userNames) => {
    return new Promise(async (resolve, reject) => {
      const userIds = [];
      const querySnapshot = await getDocs(collection(collectionData, "users"));
      querySnapshot.forEach((doc) => {
        const user = doc.data();

        userNames.forEach((name) => {
          if (user.info.name === name) {
            userIds.push({ id: doc.id, name: name });
          }
        });
      });
      resolve(userIds);
    });
  };

  const fetchAllUsers = () => {
    return new Promise(async (resolve, reject) => {
      const querySnapshot = await getDocs(collection(collectionData, "users"));
      const users = [];
      querySnapshot.forEach((user) => {
        const data = user.data();
        users.push({ name: data.info.name, id: user.id });
      });
      resolve(users);
    });
  };

  // **Used to get url for PDF Viewer

  const fetchDocUrl = (path) => {
    return new Promise((resolve, reject) => {
      const pathReference = ref(storage, path);
      getDownloadURL(pathReference)
        .then((url) => {
          resolve(url);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const uploadNewSectionToDoc = async (docPage, section) => {
    const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
    const querySnapshot = await getDocs(
      collection(collectionData, `${queryName}`)
    );
    querySnapshot.forEach(async (doc) => {
      const document = doc.data();

      const keys = Object.keys(document);

      for (let index = 0; index < keys.length; index++) {
        if (keys[index] === docPage) {
          const page = keys[index];
          const doc = document[page];

          doc.sections.push(section);
          await updateDoc(docRef, document);
        }
      }
    });
  };

  const uploadDocsToSection = (docsToPreview, pageID, sectionIndex) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      const querySnapshot = await getDocs(
        collection(collectionData, `${queryName}`)
      );
      querySnapshot.forEach(async (doc) => {
        const document = doc.data();

        let currentPageName = "";

        for (const key in document) {
          if (Object.hasOwnProperty.call(document, key)) {
            const doc = document[key];

            if (doc.id === pageID) {
              currentPageName = key;
              const sectionToUpdate = doc.sections?.[sectionIndex];

              if (sectionToUpdate === undefined) {
                reject(
                  "The section you are trying to add files to no longer exists."
                );
                return;
              }

              for (let i = 0; i < docsToPreview.length; i++) {
                const randomId = uuidv4();
                const removeSpacesPath = docsToPreview[i].file.name
                  .replace(/ /g, "-")
                  .replace(".pdf", "");
                const docRef = ref(
                  storage,
                  `/${queryName}/${removeSpacesPath}-${randomId}.pdf`
                );

                const docName = docsToPreview[i].file.name.replace(".pdf", "");

                await uploadBytes(docRef, docsToPreview[i].file, metadata)
                  .then((res) => {
                    sectionToUpdate.docs.push({
                      name: docName,
                      path: res.ref._location.path_,
                      id: randomId,
                      allowPrint: docsToPreview[i].allowPrint,
                    });
                  })
                  .catch((error) => {
                    let data = JSON.stringify(error);
                    let errorCode = JSON.parse(data).code;
                    reject(errorCode);
                  });
              }

              const newDocs = document;

              newDocs[currentPageName].sections[sectionIndex] = sectionToUpdate;

              try {
                await updateDoc(docRef, newDocs);
                resolve("Files have been uploaded!");
              } catch (error) {
                let data = JSON.stringify(error);
                let errorCode = JSON.parse(data).code;
                reject(errorCode);
              }
            }
          }
        }

        if (currentPageName === "") {
          reject("The page you are trying to edit no longer exists");
        }
      });
    });
  };

  const updateFile = (id, info) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      const docSnap = await getDoc(docRef);

      const randomId = uuidv4();

      if (docSnap.exists()) {
        const data = docSnap.data();

        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            const page = data[key];

            page.sections.forEach((section, sectionIndex) => {
              section.docs.forEach(async (document, docIndex) => {
                if (id === document.id) {
                  if (info?.file) {
                    const pdfRef = ref(storage, `${document.path}`);
                    await deleteObject(pdfRef);
                    const removeSpacesPath = info.file.name
                      .replace(/ /g, "-")
                      .replace(".pdf", "");

                    const docRef = ref(
                      storage,
                      `/${queryName}/${removeSpacesPath}-${randomId}.pdf`
                    );
                    const newData = { ...data };

                    const docName = info.file.name.replace(".pdf", "");
                    await uploadBytes(docRef, info.file, metadata).then(
                      (res) => {
                        newData[key].sections[sectionIndex].docs[docIndex] = {
                          ...newData[key].sections[sectionIndex].docs[docIndex],
                          allowPrint: info.allowPrint,
                          path: res.ref._location.path_,
                          name: docName,
                        };
                      }
                    );
                    await updateNewDoc(newData);
                    setDocOnPreview(
                      newData[key].sections[sectionIndex].docs[docIndex]
                    );
                  } else {
                    const newData = { ...data };
                    newData[key].sections[sectionIndex].docs[docIndex] = {
                      ...newData[key].sections[sectionIndex].docs[docIndex],
                      allowPrint: info.allowPrint,
                    };
                    await updateNewDoc(newData);
                    setDocOnPreview(
                      newData[key].sections[sectionIndex].docs[docIndex]
                    );
                  }
                }
              });
            });
          }
        }
        resolve();
      }
    });
  };

  const updateNewDoc = (newData) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      await updateDoc(docRef, newData);
      resolve();
    });
  };

  const getStoragePath = (id) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      if (docSnap.exists()) {
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            const page = data[key];

            page.sections.forEach((section) => {
              section.docs.forEach((doc) => {
                if (doc.id === id) {
                  resolve(doc.path);
                  return;
                }
              });
            });
          }
        }
        reject("File no longer exists");
      }
    });
  };

  const updateSectionTitle = (pageID, sectionIndex, newTitle) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      const newData = { ...data };

      if (docSnap.exists()) {
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            const page = data[key];

            if (page.id === pageID) {
              if (newData[key].sections?.[sectionIndex] === undefined) {
                reject("The section you are trying to edit no longer exists");
              } else if (newData[key] === undefined) {
                reject("The page you are trying to edit no longer exists");
                navigate("/dashboard");
              } else {
                newData[key].sections[sectionIndex].title = newTitle;
                await updateDoc(docRef, newData);
                resolve();
              }
            }
          }
        }
      }
    });
  };

  const updatePageSettings = (defaultPageName, newPageName) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      const querySnapshot = await getDocs(
        collection(collectionData, `${queryName}`)
      );
      const allUsers = await fetchAllUsers();
      querySnapshot.forEach(async (doc) => {
        const document = doc.data();
        let allDocuments = document;

        let updatedModerators = [];

        allUsers.forEach((user) => {
          moderatorNames.forEach((newMod) => {
            if (user.name === newMod) {
              updatedModerators.push({ id: user.id, name: user.name });
            }
          });
        });

        let onNewPage = false;

        const removeSpacesName = newPageName.replaceAll(" ", "-");
        const removeSpacesDefaultName = defaultPageName.replaceAll(" ", "-");

        if (removeSpacesName !== removeSpacesDefaultName) {
          for (const key in allDocuments) {
            if (Object.hasOwnProperty.call(allDocuments, key)) {
              if (key === removeSpacesName) {
                reject("Page name already exists");
                return;
              }
            }
          }
          onNewPage = true;
          allDocuments[removeSpacesName] = allDocuments[defaultPageName];
          delete allDocuments[defaultPageName];
          allDocuments[removeSpacesName].moderators = updatedModerators;

          await updateDoc(docRef, {
            [defaultPageName]: deleteField(),
          });
        } else {
          allDocuments[defaultPageName].moderators = updatedModerators;
        }

        await updateDoc(docRef, allDocuments);

        if (onNewPage) {
          navigate(`${queryName}/${removeSpacesName}`);
        }

        resolve();
      });
    });
  };

  const deleteDocCount = (docID) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "users", `${currentUser.uid}`);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      const indexOfDoc = data.docCount.findIndex(
        (value) => value.docID === docID
      );
      data.docCount.splice(indexOfDoc, 1);

      updateDoc(docRef, data);
      resolve();
    });
  };

  const deleteDocs = (sectionIndex) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
      const querySnapshot = await getDocs(
        collection(collectionData, `${queryName}`)
      );
      querySnapshot.forEach(async (res) => {
        const data = res.data();
        const allDocuments = data;

        if (allDocuments[pageName] === undefined) {
          reject("The page you are trying to edit no longer exists");
          navigate("/dashboard");
          return;
        }

        if (allDocuments[pageName].sections[sectionIndex] === undefined) {
          reject("The section you are trying to edit no longer exists");
          return;
        }
        const docsArray = allDocuments[pageName].sections[sectionIndex].docs;

        docsArray.forEach(async (doc) => {
          filesToDelete.forEach(async (file) => {
            if (file.path === doc.path) {
              await deleteDocCount(doc.id);
              const pdfRef = ref(storage, `${file.path}`);
              try {
                await deleteObject(pdfRef);
              } catch (error) {
                let data = JSON.stringify(error);
                let errorCode = JSON.parse(data).code;
                reject(errorCode);
              }
            }
          });
          setFilesToDelete([]);
        });

        const updatedDocs = docsArray.filter(
          ({ path: id1 }) => !filesToDelete.some(({ path: id2 }) => id2 === id1)
        );

        delete allDocuments[pageName].sections[sectionIndex].docs;
        allDocuments[pageName].sections[sectionIndex].docs = updatedDocs;

        await updateDoc(docRef, allDocuments);
        resolve();
      });
    });
  };

  // Also delete DocCount from every user that had the deleted page docs/manuals

  const deletePage = async (page) => {
    const docRef = doc(collectionData, `${queryName}`, `${queryName}`);

    let pageToDelete;

    if (queryName === "manuals") {
      pageToDelete = allManuals[page];
    } else {
      pageToDelete = allDocs[page];
    }
    const sections = pageToDelete.sections;

    for (let i = 0; i < sections.length; i++) {
      for (let index = 0; index < sections[i].docs.length; index++) {
        const doc = sections[i].docs[index];
        await deleteDocCount(doc.id);
        const pdfRef = ref(storage, `${doc.path}`);

        await deleteObject(pdfRef)
          .then(() => {
            console.log("file deleted");
          })
          .catch((error) => {
            alertError(`There was an error trying to delete file`);
          });
      }
    }

    const querySnapshot = await getDocs(
      collection(collectionData, `${queryName}`)
    );
    querySnapshot.forEach(async (doc) => {
      await updateDoc(docRef, {
        [page]: deleteField(),
      });
      navigate("/dashboard");
    });
  };

  const deleteSection = (pageID, sectionIndex) => {
    const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
    return new Promise(async (resolve, reject) => {
      const querySnapshot = await getDocs(
        collection(collectionData, `${queryName}`)
      );
      querySnapshot.forEach(async (doc) => {
        const document = doc.data();
        let nameOfPage = "";

        for (const key in document) {
          if (Object.hasOwnProperty.call(document, key)) {
            const doc = document[key];
            if (doc.id === pageID) {
              nameOfPage = key;
            }
          }
        }

        if (nameOfPage === "") {
          reject("The page you are trying to edit no longer exists");
          navigate("/dashboard");
          return;
        }

        const docsToEdit = document?.[nameOfPage].sections[sectionIndex]?.docs;

        if (docsToEdit === undefined) {
          reject("There was a problem trying to delete section");
          return;
        } else {
          document[nameOfPage].sections[sectionIndex].docs.forEach(
            async (doc, i) => {
              const pdfRef = ref(storage, `${doc.path}`);
              deleteObject(pdfRef)
                .then(() => {
                  console.log("file deleted");
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          );

          for (let i = 0; i < document[nameOfPage].sections.length; i++) {
            for (
              let index = 0;
              index < document[nameOfPage].sections[i].docs.length;
              index++
            ) {
              await deleteDocCount(
                document[nameOfPage].sections[i].docs[index].id
              );
            }
          }

          let newSections = document[nameOfPage].sections.filter(
            (section, i) => i !== sectionIndex
          );

          document[nameOfPage].sections = newSections;
          await updateDoc(docRef, document);
          resolve("Section succefully deleted");
        }
      });
    });
  };

  const submitNewPageLayout = async (newPageName) => {
    setUploadingNewLayout(true);
    const newPageLayout = {};
    const pageSections = [];
    for (let index = 0; index < sections.length; index++) {
      const sectionToUpload = { title: sections[index].title, docs: [] };

      for (let i = 0; i < sections[index].docs.length; i++) {
        const randomId = uuidv4();
        const removeSpacesPath = sections[index].docs[i].name
          .replace(/ /g, "-")
          .replace(".pdf", "");
        const docRef = ref(
          storage,
          `/${queryName}/${removeSpacesPath}-${randomId}.pdf`
        );

        const doc = sections[index].docs[i];

        const docName = doc.name.replace(".pdf", "");
        await uploadBytes(docRef, doc.file, metadata)
          .then((res) => {
            sectionToUpload.docs.push({
              name: docName,
              path: res.ref._location.path_,
              id: randomId,
              allowPrint: sections[index].docs[i].allowPrint,
            });
          })
          .catch((error) => {
            const errorMessage = error.message;
            alertError(errorMessage);
            return error;
          });
      }
      pageSections.push(sectionToUpload);
    }

    const docRef = doc(collectionData, `${queryName}`, `${queryName}`);
    const moderatorIds = await getModeratorUids(moderatorNames);

    const removeSpacesName = newPageName.replace(/ /g, "-");

    newPageLayout[removeSpacesName] = {
      sections: pageSections,
      moderators: moderatorIds,
      id: uuidv4(),
    };

    await updateDoc(docRef, newPageLayout);

    setUploadingNewLayout(false);
  };

  const addSectionsToNewPage = (section) => {
    setSections([...sections, section]);
  };

  // These two useEffects are used to allow for users to refresh while viewing a PDF and still be on the same page.

  // They also allow for the user to click a link outside the app and be redirected to the document via url.

  useEffect(() => {
    if (allDocs !== undefined) {
      const documentID = deepLink.split("/")[4];
      Object.keys(allDocs).forEach((key, i) => {
        allDocs[key].sections.forEach((section) => {
          section.docs.forEach((doc) => {
            if (deepLink !== "") {
              if (deepLink.includes("docs") || deepLink.includes("training")) {
                if (doc.id === documentID) {
                  const link = deepLink.split("/");
                  if (link[2] === "dashboard") {
                    link[2] = key;
                  }
                  const newLink = link.join("/");

                  // when docOnPreview is undefined, is when the app first loads. This allows for the app not to redirect a user to a PDF file they're currently viewing.

                  if (docOnPreview === undefined) {
                    setQueryName("docs");
                    setDocOnPreview(doc);
                    setPdfDocName(doc.name);
                    setCurrentDocument(doc.id);
                    toggleLoadingFile(true);
                    navigate(newLink);
                    setDeepLink("");
                  }
                }
              }
            }
          });
        });
      });
    }
  }, [allDocs]);

  useEffect(() => {
    if (allManuals !== undefined) {
      const documentID = deepLink.split("/")[4];
      Object.keys(allManuals).forEach((key, i) => {
        allManuals[key].sections.forEach((section) => {
          section.docs.forEach((doc) => {
            if (deepLink !== "") {
              if (
                deepLink.includes("manuals") ||
                deepLink.includes("training")
              ) {
                if (doc.id === documentID) {
                  const link = deepLink.split("/");
                  if (link[2] === "dashboard") {
                    link[2] = key;
                  }
                  const newLink = link.join("/");

                  if (docOnPreview === undefined) {
                    setQueryName("manuals");
                    setDocOnPreview(doc);
                    setPdfDocName(doc.name);
                    setCurrentDocument(doc.id);
                    toggleLoadingFile(true);
                    navigate(newLink);
                    setDeepLink("");
                  }
                }
              }
            }
          });
        });
      });
    }
  }, [allManuals]);

  useEffect(() => {
    if (currentUser !== undefined) {
      const unsub = onSnapshot(doc(collectionData, "docs", "docs"), (doc) => {
        const data = doc.data();
        const documentNames = Object.keys(doc.data());
        setAlldocs(data);
        setDocNames(documentNames.sort());
      });
      return unsub;
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser !== undefined) {
      const unsub = onSnapshot(
        doc(collectionData, "manuals", "manuals"),
        (manual) => {
          const data = manual.data();
          const documentNames = Object.keys(manual.data());
          setAllManuals(data);
          setManualNames(documentNames.sort());
        }
      );
      return unsub;
    }
  }, [currentUser]);

  useEffect(() => {
    const onRoute = (name) => location.pathname.includes(name);

    if (onRoute("manuals")) {
      setQueryName("manuals");
    }

    if (onRoute("docs")) {
      setQueryName("docs");
    }
  }, [location]);

  const value = {
    docNames,
    allDocs,
    setPageName,
    pageName,
    fetchDocs,
    setModeratorNames,
    addSectionsToNewPage,
    sections,
    setSections,
    submitNewPageLayout,
    uploadingNewLayout,
    setUploadingNewLayout,
    uploadNewSectionToDoc,
    creatingNewPage,
    toggleCreatingNewPage,
    uploadDocsToSection,
    deletePage,
    deleteSection,
    moderatorNames,
    getModeratorUids,
    updatePageSettings,
    deleteDocs,
    setFilesToDelete,
    filesToDelete,
    fetchDocUrl,
    loadingFIle,
    toggleLoadingFile,
    pdfDocName,
    setPdfDocName,
    docOnPreview,
    setDocOnPreview,
    updateFile,
    getStoragePath,
    newDocToPreview,
    toggleNewDocToPreview,
    updateSectionTitle,
    queryName,
    allManuals,
    manualNames,
    setQueryName,
  };

  return <DocContext.Provider value={value}>{children}</DocContext.Provider>;
};
