import React, { useState } from 'react';

interface ProfileProps {
  user: {
    username: string;
    email: string;
    contact?: string;
    department?: string;
    realName?: string;
    accessLevel?: string;
    projectAccessLevel?: string;
  };
  onClose?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState({ ...user });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowThankYou(true);
    setFeedback('');
    setRating(0);
  };

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          contact: editUser.contact,
          department: editUser.department,
          realName: editUser.realName,
          accessLevel: editUser.accessLevel,
          projectAccessLevel: editUser.projectAccessLevel,
        }),
      });
      if (!res.ok) {
        let msg = 'Failed to update profile';
        try {
          const data = await res.json();
          console.error('Profile update error:', data);
          if (data && typeof data === 'object') {
            msg = Object.values(data).join(' ');
          }
        } catch (e) {
          // Not JSON
        }
        setError(msg);
        return;
      }
      setEditMode(false);
      // Optionally update local state here
    } catch (err) {
      setError('Failed to update profile');
    }
  }

  function handleDummyUpdate(e: React.FormEvent) {
    e.preventDefault();
    setEditMode(false);
    // Do not setShowThankYou(true);
  }

  return (
    <div style={{ padding: '2rem', background: '#aeeeee', minHeight: '70vh', borderRadius: '0 0 8px 8px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontFamily: 'serif', marginBottom: '1rem' }}>User Profile</h2>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* User Info Card */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: '2rem 2.5rem', minWidth: 250, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* Edit Button (Pencil Icon) */}
          <button onClick={() => setEditMode(true)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }} title="Edit Profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
          </button>
          {/* User Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#ddd"><circle cx="12" cy="8" r="4"/><ellipse cx="12" cy="17" rx="7" ry="5"/></svg>
          </div>
          {/* User Info */}
          <div style={{ textAlign: 'left', width: '100%' }}>
            <div>Username<br/>{user.username}</div>
            <div style={{ marginTop: 8 }}>Contact Number<br/>{user.contact}</div>
            <div style={{ marginTop: 8 }}>Email<br/>{user.email}</div>
            <div style={{ marginTop: 8 }}>Department<br/>{user.department}</div>
          </div>
          {/* Edit Modal */}
          {editMode && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0005', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 10, padding: '2.5rem 2rem', minWidth: 700, boxShadow: '0 2px 12px #0002', position: 'relative', width: 800 }}>
                {/* Cross button */}
                <button onClick={() => setEditMode(false)} style={{ position: 'absolute', top: 16, right: 16, background: '#eee', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 20, cursor: 'pointer', zIndex: 10 }} title="Close">×</button>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                  <button style={{ background: '#4fd1c5', color: '#222', border: 'none', borderRadius: '6px 6px 0 0', padding: '10px 32px', fontWeight: 600, fontSize: 18, marginRight: 12, boxShadow: '0 2px 4px #0001' }}>Edit Account</button>
                </div>
                <form onSubmit={handleDummyUpdate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', rowGap: 12, columnGap: 0, alignItems: 'center' }}>
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Username</label>
                    <input type="text" value={editUser.username} disabled style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Current Password</label>
                    <input type="password" value={passwords.current} disabled style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>New Password</label>
                    <input type="password" value={passwords.new} disabled style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Confirm Password</label>
                    <input type="password" value={passwords.confirm} disabled style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Email</label>
                    <input type="email" value={editUser.email} disabled style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Real Name</label>
                    <input type="text" value={editUser.realName || ''} onChange={e => setEditUser({ ...editUser, realName: e.target.value })} style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Access Level</label>
                    <input type="text" value={editUser.accessLevel || ''} onChange={e => setEditUser({ ...editUser, accessLevel: e.target.value })} style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Project Access Level</label>
                    <input type="text" value={editUser.projectAccessLevel || ''} onChange={e => setEditUser({ ...editUser, projectAccessLevel: e.target.value })} style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Contact Number</label>
                    <input type="text" value={editUser.contact || ''} onChange={e => setEditUser({ ...editUser, contact: e.target.value })} style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                    <label style={{ background: '#aaa', color: '#fff', padding: '8px 12px', borderRadius: 2, fontWeight: 400 }}>Department</label>
                    <input type="text" value={editUser.department || ''} onChange={e => setEditUser({ ...editUser, department: e.target.value })} style={{ width: '100%', padding: 8, border: 'none', borderBottom: '2px solid #ccc', background: '#eee' }} />
                  </div>
                  {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
                  <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-start' }}>
                    <button type="submit" style={{ background: '#4fd1c5', color: '#222', border: 'none', borderRadius: 4, padding: '10px 32px', fontWeight: 600, fontSize: 16 }}>Update User</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        {/* Feedback Card */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '10px', boxShadow: '2px 2px 8px #ccc', padding: '2rem', minWidth: '320px', alignSelf: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center', fontSize: '1.1rem' }}>Give Your Feedback</div>
          <textarea
            placeholder="[Lorem Ipsum]"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            style={{ width: '100%', minHeight: '60px', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc', padding: '0.5rem', fontFamily: 'serif', fontSize: '1rem' }}
          />
          <div style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
            {[1,2,3,4,5].map(star => (
              <span
                key={star}
                style={{ fontSize: '1.7rem', cursor: 'pointer', color: star <= rating ? '#f5b301' : '#ccc', marginRight: 2 }}
                onClick={() => setRating(star)}
              >★</span>
            ))}
          </div>
          <button type="submit" style={{ background: '#4dd0e1', color: '#fff', border: 'none', borderRadius: '5px', padding: '0.7rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '1.1rem', boxShadow: '0 2px 6px #0001' }}>
            Submit Feedback
          </button>
        </form>
        {/* Thank You Popup */}
        {showThankYou && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.15)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '2.5rem 3rem', boxShadow: '0 2px 16px #0002', textAlign: 'center', minWidth: 300 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: '1.2rem', marginBottom: 18 }}>Thank you for your feedback!</div>
              <button onClick={() => setShowThankYou(false)} style={{ background: '#4dd0e1', color: '#fff', border: 'none', borderRadius: '5px', padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 