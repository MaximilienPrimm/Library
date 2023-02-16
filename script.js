// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAuth } from "firebase/auth";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyABGusop_K3NOnq6UTXSlbR9SoriSCg-Jk",
//   authDomain: "library-241fd.firebaseapp.com",
//   projectId: "library-241fd",
//   storageBucket: "library-241fd.appspot.com",
//   messagingSenderId: "567922173320",
//   appId: "1:567922173320:web:8f5ddc2e6e83c11f94863d",
// };

// // Initialize Firebase
// const firebase = initializeApp(firebaseConfig);

// Data structures
class Book {
  constructor(
    title = "Unknown",
    author = "Unknown",
    pages = "0",
    isRead = false
  ) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
  }
}

class Library {
  constructor() {
    this.books = [];
  }

  addBook(newBook) {
    if (!this.isInLibrary(newBook)) {
      this.books.push(newBook);
    }
  }

  removeBook(title) {
    this.books = this.books.filter((book) => book.title !== title);
  }

  getBook(title) {
    return this.books.find((book) => book.title === title);
  }

  isInLibrary(newBook) {
    return this.books.some((book) => book.title === newBook.title);
  }
}

const library = new Library();

// Interfaces
const accountBtn = document.getElementById("accountBtn");
const accountModal = document.getElementById("accountModal");
const formModal = document.getElementById("formModal");
const addBookModal = document.getElementById("addBookModal");
const errorMsg = document.getElementById("errorMsg");
const loggedIn = document.getElementById("loggedIn");
const loggedOut = document.getElementById("loggedOut");
const loadingRing = document.getElementById("loadingRing");
const formBook = document.getElementById("bookForm");
const createBook = document.getElementById("createBook");
const booksGrid = document.getElementById("booksGrid");
const overlay = document.getElementById("overlay");
// Functions
const setupNavbar = (user) => {
  if (user) {
    loggedIn.classList.add("active");
    loggedOut.classList.remove("active");
  } else {
    loggedIn.classList.remove("active");
    loggedOut.classList.add("active");
  }
  loadingRing.classList.remove("active");
};

const setupAccountModal = (user) => {
  if (user) {
    accountModal.innerHTML = `
      <p>Logged in as</p>
      <p><strong>${user.email.split("@")[0]}</strong></p>`;
  } else {
    accountModal.innerHTML = "";
  }
};

const openNewBookModal = () => {
  formBook.reset();
  formModal.classList.add("active");
  overlay.classList.add("active");
};

const closeNewBookModal = () => {
  formModal.classList.remove("active");
  overlay.classList.remove("active");
};

const closeAllModals = () => {
  closeNewBookModal();
  closeAccountModal();
};

const openAccountModal = () => {
  accountModal.classList.add("active");
  overlay.classList.add("active");
};

const closeAccountModal = () => {
  accountModal.classList.remove("active");
  overlay.classList.remove("active");
};

const getBookFromInput = () => {
  const title = formBook.bookTitle.value;
  const author = formBook.bookAuthor.value;
  const pages = formBook.bookPages.value;
  const isReaded = formBook.bookIsReaded.value;
  return new Book(title, author, pages, isReaded);
};

const newBook = (e) => {
  e.preventDefault();
  const newBook = getBookFromInput();
  library.addBook(newBook);
  saveLocal();
  updateBooksGrid();
  closeNewBookModal();
};

const handleKeyboardInput = (e) => {
  if (e.key === "Escape") closeAllModals();
};

const updateBooksGrid = () => {
  resetBooksGrid();
  for (let book of library.books) {
    createBookCard(book);
  }
};

const resetBooksGrid = () => {
  booksGrid.innerHTML = "";
};

const removeBook = (e) => {
  const title = e.target.parentNode.parentNode.firstChild.innerHTML.replaceAll(
    '"',
    ""
  );

  if (auth.currentUser) {
    removeBookDB(title);
  } else {
    library.removeBook(title);
    saveLocal();
    updateBooksGrid();
  }
};

const toggleRead = (e) => {
  const title = e.target.parentNode.parentNode.firstChild.innerHTML.replaceAll(
    '"',
    ""
  );
  const book = library.getBook(title);

  if (auth.currentUser) {
    toggleBookIsReadDB(book);
  } else {
    book.isRead = !book.isRead;
    saveLocal();
    updateBooksGrid();
  }
};

const createBookCard = (book) => {
  const bookCard = document.createElement("div");
  const title = document.createElement("p");
  const author = document.createElement("p");
  const pages = document.createElement("p");
  const buttonGroup = document.createElement("div");
  const readBtn = document.createElement("button");
  const removeBtn = document.createElement("button");

  bookCard.classList.add("book-card");
  buttonGroup.classList.add("button-group");
  readBtn.classList.add("btn");
  removeBtn.classList.add("btn");
  readBtn.onclick = toggleRead;
  removeBtn.onclick = removeBook;

  title.textContent = `"${book.title}"`;
  author.textContent = book.author;
  pages.textContent = `${book.pages} pages`;
  removeBtn.textContent = "Remove";

  if (book.isRead) {
    readBtn.textContent = "Read";
    readBtn.classList.add("btn-light-green");
  } else {
    readBtn.textContent = "Not read";
    readBtn.classList.add("btn-light-red");
  }

  bookCard.appendChild(title);
  bookCard.appendChild(author);
  bookCard.appendChild(pages);
  buttonGroup.appendChild(readBtn);
  buttonGroup.appendChild(removeBtn);
  bookCard.appendChild(buttonGroup);
  booksGrid.appendChild(bookCard);
};

// Actions
accountBtn.onclick = openAccountModal;
addBookModal.onclick = openNewBookModal;
formBook.onsubmit = newBook;
overlay.onclick = closeAllModals;
window.onkeydown = handleKeyboardInput;

// Local Storage

const saveLocal = () => {
  localStorage.setItem("library", JSON.stringify(library.books));
};

const restoreLocal = () => {
  const books = JSON.parse(localStorage.getItem("library"));
  if (books) {
    library.books = books.map((book) => JSONToBook(book));
  } else {
    library.books = [];
  }
};

// Auth
const auth = firebase.auth();
const logInBtn = document.getElementById("logInBtn");
const logOutBtn = document.getElementById("logOutBtn");

auth.onAuthStateChanged(async (user) => {
  if (user) {
    setupRealTimeListener();
  } else {
    if (unsubscribe) unsubscribe();
    restoreLocal();
    updateBooksGrid();
  }
  setupAccountModal(user);
  setupNavbar(user);
});

const signIn = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

const signOut = () => {
  auth.signOut();
};

logInBtn.onclick = signIn;
logOutBtn.onclick = signOut;

// Firestore

const db = firebase.firestore();
let unsubscribe;

const setupRealTimeListener = () => {
  unsubscribe = db
    .collection("books")
    .where("ownerId", "==", auth.currentUser.uid)
    .orderBy("createdAt")
    .onSnapshot((snapshot) => {
      library.books = docsToBooks(snapshot.docs);
      updateBooksGrid();
    });
};

const addBookDB = (newBook) => {
  db.collection("books").add(bookToDoc(newBook));
};

const removeBookDB = async (title) => {
  db.collection("books")
    .doc(await getBookIdDB(title))
    .delete();
};

const toggleBookIsReadDB = async (book) => {
  db.collection("books")
    .doc(await getBookIdDB(book.title))
    .update({ isRead: !book.isRead });
};

const getBookIdDB = async (title) => {
  const snapshot = await db
    .collection("books")
    .where("ownerId", "==", auth.currentUser.uid)
    .where("title", "==", title)
    .get();
  const bookId = snapshot.docs.map((doc) => doc.id).join("");
  return bookId;
};

// Utils

const docsToBooks = (docs) => {
  return docs.map((doc) => {
    return new Book(
      doc.data().title,
      doc.data().author,
      doc.data().pages,
      doc.data().isRead
    );
  });
};

const JSONToBook = (book) => {
  return new Book(book.title, book.author, book.pages, book.isRead);
};

const bookToDoc = (book) => {
  return {
    ownerId: auth.currentUser.uid,
    title: book.title,
    author: book.author,
    pages: book.pages,
    isRead: book.isRead,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
};
