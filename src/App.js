import { useEffect, useState } from "react";
import "./App.css";
import { MdDeleteOutline } from "react-icons/md";
import { FaRegEdit, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import axios from "axios";

import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
} from "react-icons/md";

function App() {
  const [membersData, setMembersData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [selectedRows, setSelectedRows] = useState([]);
  const [isHeaderCheckboxChecked, setIsHeaderCheckboxChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleChange = (event, memberId) => {
    if (event.target.checked) {
      // If header checkbox is checked, select all rows on the current page
      if (memberId === "header") {
        const currentPageEntries = membersData.slice(
          (currentPage - 1) * entriesPerPage,
          currentPage * entriesPerPage
        );
        const uniqueIds = new Set([
          ...selectedRows,
          ...currentPageEntries.map((entry) => entry.id),
        ]);
        setSelectedRows(Array.from(uniqueIds));
        setIsHeaderCheckboxChecked(true);
      } else {
        // Individual row checkbox is checked, add to selectedRows
        setSelectedRows((prevSelectedRows) => {
          const uniqueIds = new Set([...prevSelectedRows, memberId]);
          return Array.from(uniqueIds);
        });
      }
    } else {
      // If checkbox is unchecked, remove from selectedRows
      if (memberId === "header") {
        // If header checkbox is unchecked, remove all entries of the current page
        const currentPageEntries = membersData.slice(
          (currentPage - 1) * entriesPerPage,
          currentPage * entriesPerPage
        );
        setSelectedRows(
          selectedRows.filter(
            (id) => !currentPageEntries.map((entry) => entry.id).includes(id)
          )
        );
        setIsHeaderCheckboxChecked(false);
      } else {
        // Individual row checkbox is unchecked, remove from selectedRows
        setSelectedRows(selectedRows.filter((id) => id !== memberId));
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
        );
        setMembersData(res.data);
      } catch (e) {
        console.log("Error while fetching data", e);
      }
    };

    fetchData();
  }, []);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = membersData.slice(indexOfFirstEntry, indexOfLastEntry);

  const handleDelete = () => {
    // Filter out the selected rows from membersData
    const updatedMembersData = membersData.filter(
      (entry) => !selectedRows.includes(entry.id)
    );

    // Clear selectedRows
    setSelectedRows([]);

    // Update membersData with the new array
    setMembersData(updatedMembersData);

    // Uncheck the header checkbox
    setIsHeaderCheckboxChecked(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when performing a new search
  };

  const totalFilteredEntries = membersData.filter(
    (entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPage = Math.ceil(totalFilteredEntries.length / entriesPerPage);

  const filteredEntries = totalFilteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const isSelected = (memberId) => selectedRows.includes(memberId);

  const handleEdit = (memberId) => {
    setEditMode(memberId);
    // Initialize editedData with existing data for the member being edited
    const memberToEdit = membersData.find((member) => member.id === memberId);
    setEditedData({
      name: memberToEdit.name,
      email: memberToEdit.email,
      role: memberToEdit.role,
    });
  };

  const handleSaveEdit = () => {
    // Update membersData with the edited data
    const updatedMembersData = membersData.map((member) => {
      if (member.id === editMode) {
        return { ...member, ...editedData };
      }
      return member;
    });
    setMembersData(updatedMembersData);
    setEditMode(null);
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditedData({});
  };

  const handleDeleteRow = (memberId) => {
    const updatedMembersData = membersData.filter(
      (entry) => entry.id !== memberId
    );

    setMembersData(updatedMembersData);

    setSelectedRows(selectedRows.filter((id) => id !== memberId));

    setIsHeaderCheckboxChecked(false); // Uncheck header checkbox after deleting individual row
  };

  return (
    <div className="main">
      <div className="top">
        <div className="search-bar">
          <input
            placeholder="Search"
            className="input-field"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="search-icon" />
        </div>

        <button className="delete-button" onClick={handleDelete}>
          <MdDeleteOutline />
        </button>
      </div>

      <table className="table">
        <thead className="table-head">
          <td>
            <input
              type="checkbox"
              onChange={(e) => handleChange(e, "header")}
              checked={isHeaderCheckboxChecked}
            />
          </td>

          <td>Name</td>
          <td>Email</td>
          <td>Role</td>
          <td>Actions</td>
        </thead>

        <tbody>
          {filteredEntries.map((memberData) => (
            <tr
              key={memberData.id}
              className={`table-row ${
                isSelected(memberData.id) ? "selected-row-gray" : ""
              }`}
            >
              <td>
                <input
                  type="checkbox"
                  onChange={(e) => handleChange(e, memberData.id)}
                />
              </td>
              <td>
                {editMode === memberData.id ? (
                  <input
                    type="text"
                    value={editedData.name || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                  />
                ) : (
                  <div>{memberData.name}</div>
                )}
              </td>
              <td>
                {editMode === memberData.id ? (
                  <input
                    type="text"
                    value={editedData.email || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                  />
                ) : (
                  <div>{memberData.email}</div>
                )}
              </td>
              <td>
                {editMode === memberData.id ? (
                  <input
                    type="text"
                    value={editedData.role || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, role: e.target.value })
                    }
                  />
                ) : (
                  <div>{memberData.role}</div>
                )}
              </td>

              <td className="action-td">
                <div className="action-section">
                  {editMode === memberData.id ? (
                    <div>
                      <button
                        className="edit-button"
                        onClick={() => handleSaveEdit(memberData.id)}
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="delete-button1"
                        onClick={handleCancelEdit}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(memberData.id)}
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        className="delete-button1"
                        onClick={() => handleDeleteRow(memberData.id)}
                      >
                        <MdDeleteOutline />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bottom">
        <div className="selected">
          <div>
            {selectedRows.length} of {totalFilteredEntries.length} row(s)
            selected
          </div>
        </div>

        <div className="pagination">
          {/* first page button */}
          <button
            className="first-page btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>

          {/* prev page button */}
          <button
            className="previous-page btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft />
          </button>

          {/* all buttons of pages */}
          {Array.from({ length: totalPage }, (_, index) => (
            <div className="pagination-list">
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={
                  currentPage === index + 1 ? "active-page btn" : "btn"
                }
              >
                {index + 1}
              </button>
            </div>
          ))}

          {/* next page button */}
          <button
            className="next-page btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPage}
          >
            <MdKeyboardArrowRight />
          </button>

          {/* last page button */}
          <button
            className="last-page btn"
            onClick={() => setCurrentPage(totalPage)}
            disabled={currentPage === totalPage}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
