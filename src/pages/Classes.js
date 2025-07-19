import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    grade_level: '',
    teacher_id: '',
    start_time: '',
    end_time: '',
  });

  // Fetch classes
  const fetchClasses = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Fetch teachers for dropdown
  const fetchTeachers = () => {
    fetch('http://localhost:3000/api/teachers')
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
      });
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const startEditing = (cls) => {
    setEditingId(cls.id);
    setEditForm({
      name: cls.name || '',
      grade_level: cls.grade_level || '',
      teacher_id: cls.teacher_id || '',
      start_time: cls.start_time || '',
      end_time: cls.end_time || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/classes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update class');
      setEditingId(null);
      fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const addClass = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error('Failed to add class');
      setAddForm({
        name: '',
        grade_level: '',
        teacher_id: '',
        start_time: '',
        end_time: '',
      });
      setShowAddForm(false);
      fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '40px' }}>
        <h1 style={{ marginBottom: 20 }}>Class List</h1>
        {loading ? (
          <p>Loading classes...</p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th style={thStyle}>Class Name</th>
                  <th style={thStyle}>Grade</th>
                  <th style={thStyle}>Teacher</th>
                  <th style={thStyle}>Start Time</th>
                  <th style={thStyle}>End Time</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(c =>
                  editingId === c.id ? (
                    <tr key={c.id} style={{ backgroundColor: '#f9f9f9' }}>
                      <td style={tdStyle}>
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          name="grade_level"
                          value={editForm.grade_level}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <select
                          name="teacher_id"
                          value={editForm.teacher_id}
                          onChange={handleEditChange}
                          style={inputStyle}
                        >
                          <option value="">Select Teacher</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.first_name} {t.last_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <input
                          name="start_time"
                          placeholder="HH:MM:SS"
                          value={editForm.start_time || ''}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          name="end_time"
                          placeholder="HH:MM:SS"
                          value={editForm.end_time || ''}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <button onClick={saveEdit} style={saveBtnStyle}>Save</button>{' '}
                        <button onClick={cancelEditing} style={cancelBtnStyle}>Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={c.id}>
                      <td style={tdStyle}>{c.name}</td>
                      <td style={tdStyle}>{c.grade_level}</td>
                      <td style={tdStyle}>
                        {c.teacher_first_name && c.teacher_last_name
                          ? `${c.teacher_first_name} ${c.teacher_last_name}`
                          : 'N/A'}
                      </td>
                      <td style={tdStyle}>{c.start_time?.slice(0, 8)}</td>
                      <td style={tdStyle}>{c.end_time?.slice(0, 8)}</td>
                      <td style={tdStyle}>
                        <button onClick={() => startEditing(c)} style={editButtonStyle}>Edit</button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!showAddForm ? (
              <button onClick={() => setShowAddForm(true)} style={addNewBtnStyle}>+ Add New Class</button>
            ) : (
              <div style={addFormContainer}>
                <h3 style={{ marginBottom: 12 }}>Add New Class</h3>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Name:</label>
                  <input name="name" value={addForm.name} onChange={handleAddChange} type="text" style={inputStyle} />
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Grade Level:</label>
                  <input name="grade_level" value={addForm.grade_level} onChange={handleAddChange} type="text" style={inputStyle} />
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Teacher:</label>
                  <select
                    name="teacher_id"
                    value={addForm.teacher_id}
                    onChange={handleAddChange}
                    style={inputStyle}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Start Time:</label>
                  <input name="start_time" value={addForm.start_time} onChange={handleAddChange} placeholder="HH:MM:SS" type="text" style={inputStyle} />
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>End Time:</label>
                  <input name="end_time" value={addForm.end_time} onChange={handleAddChange} placeholder="HH:MM:SS" type="text" style={inputStyle} />
                </div>
                <button onClick={addClass} style={saveBtnStyle}>Save New Class</button>{' '}
                <button onClick={() => setShowAddForm(false)} style={cancelBtnStyle}>Cancel</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Styles (same as before)
const thStyle = { textAlign: 'left', padding: '12px 16px', fontWeight: 'bold', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #eee' };
const inputStyle = { width: '100%', padding: '6px 8px', fontSize: '14px', borderRadius: 4, border: '1px solid #ccc' };
const editButtonStyle = { backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: 4 };
const saveBtnStyle = { backgroundColor: '#2196f3', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: 6, fontWeight: 'bold' };
const cancelBtnStyle = { backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: 6, fontWeight: 'bold' };
const addNewBtnStyle = { backgroundColor: '#6200ee', color: 'white', border: 'none', padding: '12px 20px', fontSize: 16, cursor: 'pointer', borderRadius: 6, fontWeight: 'bold' };
const formRowStyle = { marginBottom: 16, display: 'flex', alignItems: 'center' };
const labelStyle = { width: 140, marginRight: 12, fontWeight: '600' };
const addFormContainer = { border: '1px solid #ccc', padding: 24, marginTop: 10, maxWidth: 600, borderRadius: 8, backgroundColor: '#fafafa' };
