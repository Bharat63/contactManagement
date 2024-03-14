// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone1: '',
    phone2: '',
    address: '',
  });


  const [editingContact, setEditingContact] = useState(null);

const handleEditClick = (contact) => {
   setEditingContact({ ...contact });
};

const handleEditFormSubmit = async () => {
   try {
      await axios.put(`https://contactlist-1.onrender.com/api/contacts/${editingContact.id}`, editingContact);
      setEditingContact(null);
      // Fetch all contacts after editing a contact
      fetchAllContacts();
   } catch (error) {
      console.error('Error editing contact:', error.message);
   }
};

const handleCancelEdit = () => {
   setEditingContact(null);
};

  useEffect(() => {
    // Fetch all contacts on component mount
    fetchAllContacts();
  }, []); // Empty dependency array to ensure it runs only once

  const fetchAllContacts = async () => {
    try {
      const response = await axios.get('https://contactlist-1.onrender.com/api/contacts');
      setContacts(response.data);
      console.log("received ->" + response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`https://contactlist-1.onrender.com/api/search?query=${searchQuery}`);
      setContacts(response.data);
      console.log("received ->" + response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Fetch contacts based on the search query
    fetchContacts();
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('https://contactlist-1.onrender.com/api/contacts', newContact);
      setShowAddForm(false);
      setNewContact({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone1: '',
        phone2: '',
        address: '',
      });
      // Fetch all contacts after adding a new contact
      fetchAllContacts();
    } catch (error) {
      console.error('Error adding contact:', error.message);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`https://contactlist-1.onrender.com/api/contacts/${id}`);
      // Fetch all contacts after deleting a contact
      fetchAllContacts();
    } catch (error) {
      console.error('Error deleting contact:', error.message);
    }
  };

  return (
    <div className="container">
      <h1 className="header">Contact List</h1>
       
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div>
        <button className="add-button" onClick={handleAddClick}>
          Add Contact
        </button>
      </div>

      {showAddForm && (
        <form className="add-form" onSubmit={handleAddFormSubmit}>
          <label>
            First Name:
            <input
              type="text"
              value={newContact.firstName}
              onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
              required
            />
          </label> <br />
          <label>
            Middle Name:
            <input
              type="text"
              value={newContact.middleName}
              onChange={(e) => setNewContact({ ...newContact, middleName: e.target.value })}
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              value={newContact.lastName}
              onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
          </label>
          <label>
            Phone Number 1:
            <input
              type="text"
              value={newContact.phone1}
              onChange={(e) => setNewContact({ ...newContact, phone1: e.target.value })}
              required
            />
          </label>
          <label>
            Phone Number 2:
            <input
              type="text"
              value={newContact.phone2}
              onChange={(e) => setNewContact({ ...newContact, phone2: e.target.value })}
            />
          </label>
          <label>
            Address:
            <textarea
              value={newContact.address}
              onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
            />
          </label>
          <button className="add-button" type="submit">
            Submit
          </button>
        </form>
      )}

      <div>
        <h2>All Contacts</h2>
        <ul className="contact-list">
  {contacts.map((contact) => (
    <li key={contact.id} className="contact-list-item">
      <span>
        {contact.firstName} {contact.lastName} - Call: {contact.phone1}, {contact.phone2}<br />
        Add: {contact.address} <br /> Email: {contact.email}
      </span>
      <button
        className="edit-button"
        onClick={() => handleEditClick(contact)}
      >
        Edit
      </button>
      <button
        className="delete-button"
        onClick={() => handleDeleteContact(contact.id)}
      >
        Delete
      </button>
      {editingContact && editingContact.id === contact.id && (
        <div>
          <label>
            First Name:
            <input
              type="text"
              value={editingContact.firstName}
              onChange={(e) => setEditingContact({ ...editingContact, firstName: e.target.value })}
              required
            />
          </label>
          <label>
            Middle Name:
            <input
              type="text"
              value={editingContact.middleName}
              onChange={(e) => setEditingContact({ ...editingContact, middleName: e.target.value })}
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              value={editingContact.lastName}
              onChange={(e) => setEditingContact({ ...editingContact, lastName: e.target.value })}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={editingContact.email}
              onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
            />
          </label>
          <label>
            Phone Number 1:
            <input
              type="text"
              value={editingContact.phone1}
              onChange={(e) => setEditingContact({ ...editingContact, phone1: e.target.value })}
              required
            />
          </label>
          <label>
            Phone Number 2:
            <input
              type="text"
              value={editingContact.phone2}
              onChange={(e) => setEditingContact({ ...editingContact, phone2: e.target.value })}
            />
          </label>
          <label>
            Address:
            <textarea
              value={editingContact.address}
              onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
            />
          </label>
          <button className="save-button" onClick={handleEditFormSubmit}>
            Save
          </button>
          <button className="cancel-button" onClick={handleCancelEdit}>
            Cancel
          </button>
        </div>
      )}
    </li>
  ))}
</ul>
      </div>
    </div>
  );
};

export default HomePage;
