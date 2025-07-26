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
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    recurring_days: [],
  });
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [showEditRecurring, setShowEditRecurring] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      // Fix #3: Make sure teacher_id is correctly set on edit
      teacher_id: cls.teacher_id !== undefined && cls.teacher_id !== null ? cls.teacher_id : '',
      start_date: cls.start_time?.slice(0, 10) || '',
      start_time: cls.start_time?.slice(11, 16) || '',
      end_date: cls.end_time?.slice(0, 10) || '',
      end_time: cls.end_time?.slice(11, 16) || '',
      recurring_days: cls.recurring_days ? cls.recurring_days.split(',') : [],
    });
    setShowEditRecurring(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setShowEditRecurring(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleAddRecurringDay = (day) => {
    setAddForm(prev => {
      const current = prev.recurring_days;
      if (current.includes(day)) {
        return { ...prev, recurring_days: current.filter(d => d !== day) };
      } else {
        return { ...prev, recurring_days: [...current, day] };
      }
    });
  };

  const toggleEditRecurringDay = (day) => {
    setEditForm(prev => {
      const current = prev.recurring_days;
      if (current.includes(day)) {
        return { ...prev, recurring_days: current.filter(d => d !== day) };
      } else {
        return { ...prev, recurring_days: [...current, day] };
      }
    });
  };

  const combineLocalDatetime = (date, time) => {
    if (!date || !time) return null;
    return `${date} ${time}:00`;
  };

  // Convert 24h time string "HH:mm" to 12h "h:mm AM/PM"
  const to12HourTime = (time24) => {
    if (!time24) return '';
    const [hourStr, min] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${min} ${ampm}`;
  };

  // Fix #2: show time even if no date exists
  const formatDateTime = (dt) => {
  if (!dt) return '';

  // Expecting format "YYYY-MM-DD HH:mm:ss"
  const date = dt.slice(0, 10);
  const time24 = dt.slice(11, 16);

  const isValidDate = date && date !== '0000-00-00' && date !== '1970-01-01';
  const isValidTime = time24 && time24 !== '00:00';

  if (!isValidDate && isValidTime) {
    return to12HourTime(time24);
  }

  if (isValidDate && isValidTime) {
    return `${date} ${to12HourTime(time24)}`;
  }

  if (isValidDate && !isValidTime) {
    return date;
  }

  return '';
};


  const saveEdit = async () => {
    try {
      const startDatetime = combineLocalDatetime(editForm.start_date, editForm.start_time);
      const endDatetime = combineLocalDatetime(editForm.end_date, editForm.end_time);

      const res = await fetch(`http://localhost:3000/api/classes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          grade_level: editForm.grade_level,
          teacher_id: editForm.teacher_id,
          start_time: startDatetime,
          end_time: endDatetime,
          recurring_days: editForm.recurring_days.join(','),
        }),
      });

      if (!res.ok) throw new Error('Failed to update class');
      setEditingId(null);
      fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const addClass = async () => {
    try {
      const startDatetime = combineLocalDatetime(addForm.start_date, addForm.start_time);
      const endDatetime = combineLocalDatetime(addForm.end_date, addForm.end_time);

      const res = await fetch('http://localhost:3000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          grade_level: addForm.grade_level,
          teacher_id: addForm.teacher_id,
          start_time: startDatetime,
          end_time: endDatetime,
          recurring_days: addForm.recurring_days.join(','),
        }),
      });

      if (!res.ok) throw new Error('Failed to add class');

      setAddForm({
        name: '',
        grade_level: '',
        teacher_id: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        recurring_days: [],
      });
      setShowAddForm(false);
      setShowAddRecurring(false);
      fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/classes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete class');
      setEditingId(null);
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
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th style={thStyle}>Class Name</th>
                  <th style={thStyle}>Grade</th>
                  <th style={thStyle}>Teacher</th>
                  <th style={thStyle}>Start Time</th>
                  <th style={thStyle}>End Time</th>
                  <th style={thStyle}>Recurring Days</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(c =>
                  editingId === c.id ? (
                    <tr key={c.id} style={{ backgroundColor: '#f9f9f9' }}>
                      <td style={tdStyle}>
                        <input name="name" value={editForm.name} onChange={handleEditChange} style={inputStyle} />
                      </td>
                      <td style={tdStyle}>
                        <input name="grade_level" value={editForm.grade_level} onChange={handleEditChange} style={inputStyle} />
                      </td>
                      <td style={tdStyle}>
                        <select name="teacher_id" value={editForm.teacher_id} onChange={handleEditChange} style={inputStyle}>
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
                          name="start_date"
                          type="date"
                          value={editForm.start_date}
                          onChange={handleEditChange}
                          style={{ ...inputStyle, marginBottom: 6 }}
                        />
                        <input
                          name="start_time"
                          type="time"
                          value={editForm.start_time}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          name="end_date"
                          type="date"
                          value={editForm.end_date}
                          onChange={handleEditChange}
                          style={{ ...inputStyle, marginBottom: 6 }}
                        />
                        <input
                          name="end_time"
                          type="time"
                          value={editForm.end_time}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            type="button"
                            onClick={() => setShowEditRecurring(prev => (prev === c.id ? false : c.id))}
                            style={{ ...editButtonStyle, minWidth: 90 }}
                          >
                            {editForm.recurring_days.length > 0
                              ? editForm.recurring_days.join(', ')
                              : 'Select days'}
                          </button>
                          {showEditRecurring === c.id && (
                            <div style={submenuStyle}>
                              {daysOfWeek.map(day => (
                                <label key={day} style={{ display: 'block', cursor: 'pointer', padding: '4px 8px' }}>
                                  <input
                                    type="checkbox"
                                    checked={editForm.recurring_days.includes(day)}
                                    onChange={() => toggleEditRecurringDay(day)}
                                  />{' '}
                                  {day}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={saveEdit} style={saveBtnStyle}>
                          Save
                        </button>{' '}
                        <button onClick={cancelEditing} style={cancelBtnStyle}>
                          Cancel
                        </button>{' '}
                        <button onClick={() => deleteClass(c.id)} style={deleteBtnStyle}>
                          Delete
                        </button>
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
                      <td style={tdStyle}>{formatDateTime(c.start_time)}</td>
                      <td style={tdStyle}>{formatDateTime(c.end_time)}</td>
                      <td style={tdStyle}>{c.recurring_days ? c.recurring_days : '—'}</td>
                      <td style={tdStyle}>
                        <button onClick={() => startEditing(c)} style={editButtonStyle}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!showAddForm ? (
              <button onClick={() => setShowAddForm(true)} style={addNewBtnStyle}>
                + Add New Class
              </button>
            ) : (
              <div style={addFormContainer}>
                <h3 style={{ marginBottom: 12 }}>Add New Class</h3>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Name:</label>
                  <input name="name" value={addForm.name} onChange={handleAddChange} type="text" style={inputStyle} />
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Grade Level:</label>
                  <input
                    name="grade_level"
                    value={addForm.grade_level}
                    onChange={handleAddChange}
                    type="text"
                    style={inputStyle}
                  />
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Teacher:</label>
                  <select name="teacher_id" value={addForm.teacher_id} onChange={handleAddChange} style={inputStyle}>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>Start Date/Time:</label>
                  <input name="start_date" type="date" value={addForm.start_date} onChange={handleAddChange} style={inputStyle} />
                  <input name="start_time" type="time" value={addForm.start_time} onChange={handleAddChange} style={inputStyle} />
                </div>
                <div style={formRowStyle}>
                  <label style={labelStyle}>End Date/Time:</label>
                  <input name="end_date" type="date" value={addForm.end_date} onChange={handleAddChange} style={inputStyle} />
                  <input name="end_time" type="time" value={addForm.end_time} onChange={handleAddChange} style={inputStyle} />
                </div>

                {/* Fix #1: wrap recurring days button in formRowStyle with label to align properly */}
                <div style={{ ...formRowStyle, alignItems: 'flex-start' }}>
                  <label style={labelStyle}>Recurring Days:</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddRecurring(prev => !prev)}
                      style={{ ...editButtonStyle, minWidth: 140, textAlign: 'left' }}
                    >
                      {addForm.recurring_days.length > 0
                        ? addForm.recurring_days.join(', ')
                        : 'Select recurring days'}
                    </button>
                    {showAddRecurring && (
                      <div style={submenuStyle}>
                        {daysOfWeek.map(day => (
                          <label key={day} style={{ display: 'block', cursor: 'pointer', padding: '4px 8px' }}>
                            <input
                              type="checkbox"
                              checked={addForm.recurring_days.includes(day)}
                              onChange={() => toggleAddRecurringDay(day)}
                            />{' '}
                            {day}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button onClick={addClass} style={saveBtnStyle}>
                    Save New Class
                  </button>{' '}
                  <button onClick={() => setShowAddForm(false)} style={cancelBtnStyle}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 16px',
  fontWeight: 'bold',
  borderBottom: '2px solid #ddd',
};
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #eee', verticalAlign: 'top' };
const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  fontSize: '14px',
  borderRadius: 4,
  border: '1px solid #ccc',
  marginBottom: 4,
};
const editButtonStyle = {
  backgroundColor: '#4caf50',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  cursor: 'pointer',
  borderRadius: 4,
};
const saveBtnStyle = {
  backgroundColor: '#2196f3',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: 6,
  fontWeight: 'bold',
};
const cancelBtnStyle = {
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: 6,
  fontWeight: 'bold',
};
const deleteBtnStyle = {
  backgroundColor: '#9c27b0',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  cursor: 'pointer',
  borderRadius: 4,
};
const addNewBtnStyle = {
  backgroundColor: '#673ab7',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  cursor: 'pointer',
  borderRadius: 6,
  fontWeight: 'bold',
};
const formRowStyle = {
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};
const labelStyle = {
  minWidth: 100,
  fontWeight: 'bold',
};
const addFormContainer = {
  border: '1px solid #ddd',
  borderRadius: 6,
  padding: 20,
  maxWidth: 600,
};
const submenuStyle = {
  position: 'absolute',
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  borderRadius: 4,
  padding: 8,
  top: '100%',
  left: 0,
  zIndex: 10,
  minWidth: 120,
  maxHeight: 160,
  overflowY: 'auto',
};
