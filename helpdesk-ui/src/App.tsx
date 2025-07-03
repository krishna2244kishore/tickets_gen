import React, { useState, useEffect } from 'react';
import './App.css';
import Profile from './Profile';

const API_BASE = 'http://localhost:8000/api';

function SignIn({ onSignUp, onForgot, onSuccess }: { onSignUp: () => void; onForgot: () => void; onSuccess: (token: string, profile: {username: string, email: string}) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async () => {
    setMessage('');
    const res = await fetch(`${API_BASE}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      // Fetch user profile after login
      const userRes = await fetch(`${API_BASE}/users/`, {
        headers: { 'Authorization': `Bearer ${data.access}` }
      });
      let userProfile = null;
      if (userRes.ok) {
        const users = await userRes.json();
        console.log('Fetched users:', users.map((u: any) => u.username));
        console.log('Searching for username:', username);
        userProfile = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase()) || users[users.length-1];
      }
      if (!userProfile) {
        setMessage('User profile not found. Usernames in system: ' + (userRes.ok ? (await userRes.json()).map((u: any) => u.username).join(', ') : 'none'));
        return;
      }
      setMessage('Sign in successful!');
      onSuccess(data.access, userProfile);
    } else {
      setMessage('Invalid credentials');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-box">
        <div className="auth-title">Helpdesk System</div>
        <input className="auth-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="auth-input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="auth-btn signin-btn" onClick={handleSignIn}>Sign In</button>
        {message && <div style={{color: message.includes('success') ? 'green' : 'red', marginBottom: 8}}>{message}</div>}
        <div className="auth-links">
          <span className="auth-link" onClick={onForgot}>Forgot password?</span>
          <span className="auth-link" onClick={onSignUp}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}

function SignUp({ onSignIn, onForgot }: { onSignIn: () => void; onForgot: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSignUp = async () => {
    setMessage('');
    setSignUpSuccess(false);
    const res = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });
    if (res.ok) {
      setMessage('Sign up successful! Please login.');
      setSignUpSuccess(true);
    } else {
      let data = null;
      try {
        data = await res.json();
        console.log('Sign up error response:', data);
      } catch (e) {
        console.log('Sign up error (non-JSON):', e);
      }
      let errorMsg = 'Sign up failed. Please try a different username and check your details.';
      if (data) {
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.username) {
          if (Array.isArray(data.username)) {
            errorMsg = data.username.join(' ');
          } else {
            errorMsg = data.username;
          }
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        }
      }
      setMessage(errorMsg);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-box">
        <div className="auth-title">Helpdesk System</div>
        <div className="auth-subtitle">Sign up here</div>
        <input className="auth-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="auth-input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input className="auth-input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="auth-btn signup-btn" onClick={handleSignUp} disabled={signUpSuccess}>Sign Up</button>
        {message && <div style={{color: message.includes('success') ? 'green' : 'red', marginBottom: 8, fontWeight: message.includes('success') ? 'bold' : 'normal'}}>{message}</div>}
        {signUpSuccess && (
          <button className="auth-btn signin-btn" style={{marginTop: 8}} onClick={onSignIn}>Go to Login</button>
        )}
        <div className="auth-links">
          <span className="auth-link" onClick={onForgot}>Forgot password?</span>
          <span className="auth-link" onClick={onSignIn}>Sign In</span>
        </div>
      </div>
    </div>
  );
}

function ForgotPassword({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');
    const res = await fetch(`${API_BASE}/password-reset/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
    } else {
      setMessage('Failed to send reset email');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-box">
        <div className="auth-desc">Don't worry. Enter your email below and we will send you a link to change password.</div>
        <input className="auth-input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="auth-btn submit-btn" onClick={handleSubmit}>Submit</button>
        {message && <div style={{color: 'green', marginBottom: 8}}>{message}</div>}
        <button className="auth-btn signin-btn" onClick={onSignIn}>Sign In</button>
      </div>
    </div>
  );
}

function NewTicketForm({ onSubmit }: { onSubmit: (ticket: any) => Promise<string | null> }) {
  const [form, setForm] = useState({
    ticketNo: '',
    date: '',
    subject: '',
    category: '',
    description: '',
    type: '',
    priority: '',
  });
  const [formError, setFormError] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ticketNo || !form.subject || !form.category || !form.priority || !form.description) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError('');
    const error = await onSubmit({
      ticketNo: form.ticketNo,
      subject: form.subject,
      status: 'In Progress',
      supportBy: 'Tech support',
      date: form.date || new Date().toISOString(),
      rate: 0,
      category: form.category,
      type: form.type,
      priority: form.priority,
      description: form.description,
    });
    if (!error) {
      setForm({ ticketNo: '', date: '', subject: '', category: '', description: '', type: '', priority: '' });
    } else {
      setFormError(error);
    }
  };
  return (
    <div style={{ background: '#f4fafd', minHeight: '100vh', padding: '32px 0' }}>
      <form className="new-ticket-form" onSubmit={handleSubmit} style={{ maxWidth: 540, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32, marginTop: 32 }}>
        <div style={{ background: '#53d1c2', borderRadius: '12px 12px 0 0', padding: '18px 0', margin: '-32px -32px 24px -32px', textAlign: 'center', color: '#222', fontWeight: 700, fontSize: '1.7rem', letterSpacing: 1 }}>Create New Ticket</div>
        {formError && <div style={{ color: 'red', marginBottom: 12 }}>{formError}</div>}
        <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Ticket No.*<br /><input name="ticketNo" value={form.ticketNo} onChange={handleChange} className="nt-input" style={{ width: '100%', marginTop: 4 }} /></label>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Date<br /><input name="date" value={form.date} onChange={handleChange} className="nt-input" style={{ width: '100%', marginTop: 4 }} /></label>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500 }}>Subject*<br /><input name="subject" value={form.subject} onChange={handleChange} className="nt-input" style={{ width: '100%', marginTop: 4 }} /></label>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 500 }}>Category*<br /><input name="category" value={form.category} onChange={handleChange} className="nt-input" style={{ width: '100%', marginTop: 4 }} /></label>
            <label style={{ fontWeight: 500 }}>Type<br /><input name="type" value={form.type} onChange={handleChange} className="nt-input" style={{ width: '100%', marginTop: 4 }} /></label>
            <label style={{ fontWeight: 500 }}>Priority*<br /><input name="priority" value={form.priority} onChange={handleChange} className="nt-input" style={{ width: '100%', marginTop: 4 }} /></label>
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontWeight: 500 }}>Description*<br /><textarea name="description" value={form.description} onChange={handleChange} className="nt-input" style={{ width: '100%', minHeight: 100, marginTop: 4, resize: 'vertical' }} /></label>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 18, width: 260, background: '#fafafa' }}>
              <div style={{ marginBottom: 8 }}><input type="checkbox" /> I'm not a robot</div>
              <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="captcha" style={{ height: 32 }} />
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <button type="submit" className="auth-btn" style={{ background: '#53d1c2', color: '#222', width: 140, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>Submit</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function MyTicketTable({ tickets, onEditTicket, showUserColumn }: { tickets: any[], onEditTicket: (ticket: any) => void, showUserColumn?: boolean }) {
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [detailsTicket, setDetailsTicket] = useState<any | null>(null);
  const [localTickets, setLocalTickets] = useState(tickets);
  useEffect(() => { setLocalTickets(tickets); }, [tickets]);
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB');
  };
  const statusStyle = (status: string) => {
    if (status === 'In Progress') return {background:'#19e86a', color:'#222'};
    if (status === 'On hold') return {background:'#3386f6', color:'#fff'};
    if (status === 'Closed') return {background:'#222', color:'#fff'};
    if (status === 'Pending') return {background:'#f64d4d', color:'#fff'};
    return {background:'#eee', color:'#222'};
  };
  const handleRate = async (ticket: any, rate: number) => {
    if (ticket.status !== 'Closed') return;
    setLocalTickets(ts => ts.map(t => t.id === ticket.id ? { ...t, rate } : t));
    try {
      await fetch(`${API_BASE}/tickets/${ticket.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ rate })
      });
    } catch {}
  };
  const filtered = localTickets.filter(t => t.ticketNo.includes(search) || t.subject.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / entries);
  const paginated = filtered.slice((page-1)*entries, page*entries);
  return (
    <div style={{maxWidth:900, margin:'0 auto', background:'#fff', borderRadius:8, padding:24, marginTop:16}}>
      <h2 style={{textAlign:'center', fontFamily:'serif'}}>My Ticket</h2>
      <div style={{display:'flex', alignItems:'center', marginBottom:8}}>
        <input placeholder="Find ticket" className="nt-input" style={{width:180, marginRight:8}} value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} />
        <button style={{fontSize:20, background:'#eee', border:'1px solid #bbb', borderRadius:4, padding:'2px 10px', cursor:'pointer'}}>🔍</button>
        <span style={{marginLeft:24}}>Show: <select value={entries} onChange={e => {setEntries(Number(e.target.value)); setPage(1);}}><option>5</option><option>10</option><option>20</option></select> Entries</span>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', marginTop:8, fontSize:'1rem'}}>
        <thead>
          {showUserColumn ? (
            <tr style={{background:'#f5f5f5', fontWeight:600}}>
              <th style={{padding:'8px'}}>Ticket No.</th>
              <th style={{padding:'8px'}}>Subject</th>
              <th style={{padding:'8px'}}>Category</th>
              <th style={{padding:'8px'}}>Priority</th>
              <th style={{padding:'8px'}}>Date</th>
              <th style={{padding:'8px'}}>Status</th>
              <th style={{padding:'8px'}}>Person in charge</th>
              <th style={{padding:'8px'}}>Action</th>
            </tr>
          ) : (
            <tr style={{background:'#f5f5f5', fontWeight:600}}>
              <th style={{padding:'8px'}}>Ticket No.</th>
              <th style={{padding:'8px'}}>Subject</th>
              <th style={{padding:'8px'}}>Category</th>
              <th style={{padding:'8px'}}>Priority</th>
              <th style={{padding:'8px'}}>Date</th>
              <th style={{padding:'8px'}}>Status</th>
              <th style={{padding:'8px'}}>Rate</th>
            </tr>
          )}
        </thead>
        <tbody>
          {paginated.map((t, i) => (
            showUserColumn ? (
              <tr key={i} style={{background: i%2 ? '#f9f9f9' : '#fff'}}>
                <td style={{padding:'8px'}}><button style={{color:'#3386f6', textDecoration:'underline', background:'none', border:'none', cursor:'pointer'}} onClick={()=>setDetailsTicket(t)}>{t.ticketNo}</button></td>
                <td style={{padding:'8px'}}>{t.subject}</td>
                <td style={{padding:'8px'}}>{t.category}</td>
                <td style={{padding:'8px'}}>{t.priority}</td>
                <td style={{padding:'8px'}}>{formatDate(t.date)}</td>
                <td style={{padding:'8px'}}><span style={{...statusStyle(t.status), borderRadius:6, padding:'2px 12px', fontWeight:'bold', display:'inline-block', minWidth:80, textAlign:'center'}}>{t.status}</span></td>
                <td style={{padding:'8px'}}>{t.supportBy}</td>
                <td style={{padding:'8px', textAlign:'center'}}>
                  <button title="Edit" style={{background:'none', border:'none', cursor:'pointer', fontSize:18, marginRight:6}} onClick={()=>onEditTicket(t)}>✏️</button>
                  <button title="Assign" style={{background:'none', border:'none', cursor:'pointer', fontSize:18, marginRight:6}}>👥</button>
                  <button title="Download" style={{background:'none', border:'none', cursor:'pointer', fontSize:18}}>⬇️</button>
                </td>
              </tr>
            ) : (
              <tr key={i} style={{background: i%2 ? '#f9f9f9' : '#fff'}}>
                <td style={{padding:'8px'}}><button style={{color:'#3386f6', textDecoration:'underline', background:'none', border:'none', cursor:'pointer'}} onClick={()=>setDetailsTicket(t)}>{t.ticketNo}</button></td>
                <td style={{padding:'8px'}}>{t.subject}</td>
                <td style={{padding:'8px'}}>{t.category}</td>
                <td style={{padding:'8px'}}>{t.priority}</td>
                <td style={{padding:'8px'}}>{formatDate(t.date)}</td>
                <td style={{padding:'8px'}}><span style={{...statusStyle(t.status), borderRadius:6, padding:'2px 12px', fontWeight:'bold', display:'inline-block', minWidth:80, textAlign:'center'}}>{t.status}</span></td>
                <td style={{padding:'8px', textAlign:'center'}}>
                  {[1,2,3,4,5].map(star => (
                    <span
                      key={star}
                      style={{color: star <= (t.rate || 0) ? '#f6c244' : '#ccc', fontSize:'1.2em', cursor: t.status === 'Closed' ? 'pointer' : 'not-allowed', transition:'color 0.2s'}}
                      onClick={() => t.status === 'Closed' ? handleRate(t, star) : null}
                      title={t.status === 'Closed' ? `Rate ${star}` : 'You can only rate closed tickets'}
                    >
                      ★
                    </span>
                  ))}
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
      <div style={{marginTop:8, fontSize:13}}>Showing {(filtered.length === 0 ? 0 : (page-1)*entries+1)} to {Math.min(page*entries, filtered.length)} of {filtered.length} entries</div>
      <div style={{textAlign:'right', fontSize:18, marginTop:4}}>
        <button disabled={page===1} onClick={()=>setPage(page-1)} style={{marginRight:8}}>&lt;&lt;</button>
        {page} / {totalPages || 1}
        <button disabled={page===totalPages || totalPages===0} onClick={()=>setPage(page+1)} style={{marginLeft:8}}>&gt;&gt;</button>
      </div>
      {detailsTicket && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#0008', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={e => { if (e.target === e.currentTarget) setDetailsTicket(null); }}>
          <div style={{background:'#fff', borderRadius:8, padding:32, minWidth:400, maxWidth:500, boxShadow:'0 4px 24px #0003'}}>
            <h2 style={{textAlign:'center', fontFamily:'serif'}}>Ticket Details</h2>
            <div style={{marginBottom:16, lineHeight:1.7}}>
              <div><b>Ticket No:</b> {detailsTicket.ticketNo}</div>
              <div><b>Date:</b> {detailsTicket.date || '-'}</div>
              <div><b>Name:</b> {detailsTicket.user_username || '-'}</div>
              <div><b>Dept:</b> {detailsTicket.department || '-'}</div>
              <div><b>Title:</b> {detailsTicket.subject || '-'}</div>
              <div><b>Description:</b> {detailsTicket.description || '-'}</div>
              <div><b>Category:</b> {detailsTicket.category || '-'}</div>
              <div><b>Type:</b> {detailsTicket.type || '-'}</div>
              <div><b>Priority:</b> {detailsTicket.priority || '-'}</div>
              <div><b>Status:</b> {detailsTicket.status || '-'}</div>
              <div><b>Attachment:</b> {detailsTicket.attachment || '-'}</div>
            </div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#7d8cff', color:'#fff', border:'none', borderRadius:6, padding:'8px 32px', fontSize:'1.1rem'}} onClick={()=>alert('Update feature coming soon!')}>Update</button>
              <button style={{background:'#19e86a', color:'#fff', border:'none', borderRadius:6, padding:'8px 32px', fontSize:'1.1rem'}} onClick={()=>setDetailsTicket(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCards({ tickets }: { tickets: any[] }) {
  const total = tickets.length;
  const solved = tickets.filter(t => t.status === 'Closed').length;
  const awaiting = tickets.filter(t => t.status === 'On hold').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  return (
    <div style={{textAlign:'center'}}>
      <h2 style={{marginTop: '24px', fontFamily: 'serif'}}>Dashboard</h2>
      <div style={{display:'flex', justifyContent:'center', gap:'24px', marginTop:'32px'}}>
        <div style={{background:'#3386f6', color:'#fff', borderRadius:'16px', width:'180px', height:'140px', boxShadow:'4px 6px 6px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:'8px'}}>Total Tickets</div>
          <div style={{fontSize:'2.8rem', fontWeight:'bold'}}>{total}</div>
        </div>
        <div style={{background:'#19e86a', color:'#222', borderRadius:'16px', width:'180px', height:'140px', boxShadow:'4px 6px 6px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:'8px'}}>Total Solved</div>
          <div style={{fontSize:'2.8rem', fontWeight:'bold'}}>{solved}</div>
        </div>
        <div style={{background:'#f64d4d', color:'#222', borderRadius:'16px', width:'180px', height:'140px', boxShadow:'4px 6px 6px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:'8px'}}>Total Awaiting Approval</div>
          <div style={{fontSize:'2.8rem', fontWeight:'bold'}}>{awaiting}</div>
        </div>
        <div style={{background:'#fff86a', color:'#222', borderRadius:'16px', width:'180px', height:'140px', boxShadow:'4px 6px 6px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:'8px'}}>Total in Progress</div>
          <div style={{fontSize:'2.8rem', fontWeight:'bold'}}>{inProgress}</div>
        </div>
      </div>
    </div>
  );
}

// Custom dashboard for teamop
function TeamOpDashboard({ tickets }: { tickets: any[] }) {
  const total = tickets.length;
  const solved = tickets.filter(t => t.status === 'Solved' || t.status === 'Closed').length;
  const awaiting = tickets.filter(t => t.status === 'Awaiting Approval').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  // For demo, static numbers for team members and feedback
  const techSupportCount = 3;
  const opTeamCount = 4;
  const avgFeedback = 4; // out of 5
  return (
    <div style={{padding: '0 0 32px 0'}}>
      <h2 style={{textAlign:'center', fontFamily:'serif', marginTop: 16}}>Dashboard</h2>
      {/* Stat cards row */}
      <div style={{display:'flex', justifyContent:'center', gap:24, marginTop:32}}>
        <div style={{background:'#3386f6', color:'#fff', borderRadius:16, width:160, height:120, boxShadow:'0 4px 12px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:8}}>Total Tickets</div>
          <div style={{fontSize:'2.4rem', fontWeight:'bold'}}>{total}</div>
        </div>
        <div style={{background:'#19e86a', color:'#222', borderRadius:16, width:160, height:120, boxShadow:'0 4px 12px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:8}}>Total Solved</div>
          <div style={{fontSize:'2.4rem', fontWeight:'bold'}}>{solved}</div>
        </div>
        <div style={{background:'#ff5c5c', color:'#fff', borderRadius:16, width:160, height:120, boxShadow:'0 4px 12px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:8}}>Total Awaiting Approval</div>
          <div style={{fontSize:'2.4rem', fontWeight:'bold'}}>{awaiting}</div>
        </div>
        <div style={{background:'#ffe066', color:'#222', borderRadius:16, width:160, height:120, boxShadow:'0 4px 12px #0002', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:'1.1rem', marginBottom:8}}>Total in Progress</div>
          <div style={{fontSize:'2.4rem', fontWeight:'bold'}}>{inProgress}</div>
        </div>
      </div>
      {/* Second row: chart and team info */}
      <div style={{display:'flex', justifyContent:'center', gap:32, marginTop:32}}>
        {/* Bar chart placeholder */}
        <div style={{background:'#eaf6fb', borderRadius:12, minWidth:260, minHeight:140, flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="120" height="90" viewBox="0 0 120 90">
            {/* X-axis */}
            <line x1="15" y1="75" x2="105" y2="75" stroke="#0b3556" strokeWidth="6" strokeLinecap="round" />
            {/* Bars - only stroke, no fill */}
            <rect x="28" y="55" width="14" height="20" rx="4" fill="none" stroke="#0b3556" strokeWidth="6" />
            <rect x="54" y="35" width="14" height="40" rx="4" fill="none" stroke="#0b3556" strokeWidth="6" />
            <rect x="80" y="15" width="14" height="60" rx="4" fill="none" stroke="#0b3556" strokeWidth="6" />
          </svg>
        </div>
        {/* Team info and feedback */}
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:16}}>
          <div style={{display:'flex', gap:16}}>
            <div style={{background:'#fff', borderRadius:12, flex:1, minHeight:80, boxShadow:'0 2px 8px #0001', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:12}}>
              <div style={{fontSize:36, marginBottom:4}}>🎧</div>
              <div style={{fontWeight:600, fontSize:18}}>{techSupportCount} Technical Supports</div>
            </div>
            <div style={{background:'#fff', borderRadius:12, flex:1, minHeight:80, boxShadow:'0 2px 8px #0001', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:12}}>
              <div style={{fontSize:36, marginBottom:4}}>👥</div>
              <div style={{fontWeight:600, fontSize:18}}>{opTeamCount} Operation Team</div>
            </div>
          </div>
          <div style={{background:'#b2e5e5', borderRadius:12, minHeight:60, boxShadow:'0 2px 8px #0001', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:8, marginTop:8}}>
            <div style={{fontWeight:600, fontSize:18, marginBottom:4}}>Customer Feedback</div>
            <div>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{color: star <= avgFeedback ? '#f6c244' : '#ccc', fontSize:'1.5em'}}>★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ticket Approval Table for teamop
function TicketApprovalTable({ tickets, onTicketClick, token }: { tickets: any[], onTicketClick: (ticket: any) => void, token: string | null }) {
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState(10);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [localTickets, setLocalTickets] = useState<any[]>(tickets);
  useEffect(() => { setLocalTickets(tickets); }, [tickets]);

  // Only show tickets not created by teamop
  const filtered = localTickets.filter(t => t.user_username !== 'teamop' && t.ticketNo && t.subject)
    .filter(t =>
      t.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
    );

  const handleAction = async (ticket: any, status: string) => {
    if (!token) return;
    setActionLoading(ticket.id);
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticket.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setLocalTickets(tks => tks.map(t => t.id === ticket.id ? { ...t, status } : t));
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Status badge color
  const statusBadge = (status: string) => {
    if (status === 'Approved') return {background:'#19e86a', color:'#fff'};
    if (status === 'Rejected') return {background:'#f64d4d', color:'#fff'};
    return {background:'#eee', color:'#222'};
  };

  return (
    <div style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', marginTop:32, overflow:'hidden', maxWidth:1100, marginLeft:'auto', marginRight:'auto'}}>
      <div style={{background:'#3386f6', color:'#fff', padding:'18px 32px', fontSize:'1.4em', fontWeight:700, letterSpacing:1}}>Ticket Approval</div>
      <div style={{display:'flex', alignItems:'center', gap:16, padding:'18px 32px 8px 32px', flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Find ticket"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{padding:'8px 16px', borderRadius:8, border:'1px solid #bbb', marginRight:8, boxShadow:'2px 2px 4px #0001', fontSize:16, minWidth:180}}
        />
        <span style={{marginRight:8, fontWeight:500}}>Show:</span>
        <select value={showCount} onChange={e => setShowCount(Number(e.target.value))} style={{marginRight:8, padding:'8px 12px', borderRadius:8, border:'1px solid #bbb', fontSize:16}}>
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span style={{fontWeight:500}}>Entries</span>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, marginTop:8, fontSize:'1rem', minWidth:900}}>
          <thead>
            <tr style={{background:'#f5f5f5', fontWeight:600}}>
              <th style={{padding:'14px 8px'}}>Ticket No.</th>
              <th style={{padding:'14px 8px'}}>Subject</th>
              <th style={{padding:'14px 8px'}}>Category</th>
              <th style={{padding:'14px 8px'}}>Priority</th>
              <th style={{padding:'14px 8px'}}>Date</th>
              <th style={{padding:'14px 8px'}}>Action</th>
              <th style={{padding:'14px 8px'}}>Assign to</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showCount).map((t, i) => (
              <tr key={t.ticketNo} style={{background: i%2 ? '#f7faff' : '#fff', transition:'background 0.2s', cursor:'pointer'}} onMouseOver={e => (e.currentTarget.style.background='#eaf6fb')} onMouseOut={e => (e.currentTarget.style.background=i%2 ? '#f7faff' : '#fff')}>
                <td style={{padding:'12px 8px', color:'#3386f6', textDecoration:'underline'}} onClick={() => onTicketClick(t)}>{t.ticketNo}</td>
                <td style={{padding:'12px 8px'}}>{t.subject}</td>
                <td style={{padding:'12px 8px'}}>{t.category}</td>
                <td style={{padding:'12px 8px'}}>{t.priority}</td>
                <td style={{padding:'12px 8px'}}>{t.date ? t.date.split('T')[0].split('-').reverse().join('/') : '-'}</td>
                <td style={{padding:'12px 8px', textAlign:'center'}}>
                  {t.status === 'Approved' ? (
                    <span style={{...statusBadge('Approved'), borderRadius:8, padding:'4px 18px', fontWeight:600, fontSize:15}}>Approved</span>
                  ) : t.status === 'Rejected' ? (
                    <span style={{...statusBadge('Rejected'), borderRadius:8, padding:'4px 18px', fontWeight:600, fontSize:15}}>Rejected</span>
                  ) : (
                    <>
                      <span
                        style={{color:'#19e86a', fontSize:'1.7em', marginRight:16, cursor: actionLoading === t.id ? 'wait' : 'pointer', opacity: actionLoading === t.id ? 0.5 : 1, verticalAlign:'middle'}}
                        onClick={() => actionLoading ? null : handleAction(t, 'Approved')}
                        title="Approve"
                      >✔️</span>
                      <span
                        style={{color:'#f64d4d', fontSize:'1.7em', cursor: actionLoading === t.id ? 'wait' : 'pointer', opacity: actionLoading === t.id ? 0.5 : 1, verticalAlign:'middle'}}
                        onClick={() => actionLoading ? null : handleAction(t, 'Rejected')}
                        title="Reject"
                      >✖️</span>
                    </>
                  )}
                </td>
                <td style={{padding:'12px 8px'}}>
                  <select style={{padding:'8px 12px', borderRadius:8, border:'1px solid #bbb', fontSize:15, background:'#f7faff'}}>
                    <option>▼</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{margin:'16px 32px', fontSize:'1em', color:'#555'}}>Showing 1 to {Math.min(showCount, filtered.length)} of {filtered.length} entries</div>
    </div>
  );
}

function TeamTechDashboard({ tickets }: { tickets: any[] }) {
  const total = tickets.length;
  const solved = tickets.filter(t => t.status === 'Solved').length;
  const awaiting = tickets.filter(t => t.status === 'Awaiting Approval').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  return (
    <div>
      <h2 style={{textAlign:'center', fontFamily:'serif'}}>Dashboard</h2>
      <div style={{display:'flex', gap:24, justifyContent:'center', margin:'2em 0'}}>
        <div style={{background:'#3386f6', color:'#fff', borderRadius:16, padding:24, minWidth:160, textAlign:'center', boxShadow:'0 2px 8px #0001'}}>
          <div style={{fontSize:18, fontWeight:600}}>Total Tickets</div>
          <div style={{fontSize:36, fontWeight:700}}>{total}</div>
        </div>
        <div style={{background:'#53d1c2', color:'#fff', borderRadius:16, padding:24, minWidth:160, textAlign:'center', boxShadow:'0 2px 8px #0001'}}>
          <div style={{fontSize:18, fontWeight:600}}>Total Solved</div>
          <div style={{fontSize:36, fontWeight:700}}>{solved}</div>
        </div>
        <div style={{background:'#ff5c5c', color:'#fff', borderRadius:16, padding:24, minWidth:160, textAlign:'center', boxShadow:'0 2px 8px #0001'}}>
          <div style={{fontSize:18, fontWeight:600}}>Total Awaiting Approval</div>
          <div style={{fontSize:36, fontWeight:700}}>{awaiting}</div>
        </div>
        <div style={{background:'#ffe066', color:'#222', borderRadius:16, padding:24, minWidth:160, textAlign:'center', boxShadow:'0 2px 8px #0001'}}>
          <div style={{fontSize:18, fontWeight:600}}>Total In Progress</div>
          <div style={{fontSize:36, fontWeight:700}}>{inProgress}</div>
        </div>
      </div>
      <div style={{display:'flex', gap:24, justifyContent:'center', margin:'2em 0'}}>
        <div style={{background:'#eaf6fb', borderRadius:12, flex:1, minHeight:180, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="120" height="90" viewBox="0 0 120 90">
            {/* X-axis */}
            <line x1="15" y1="75" x2="105" y2="75" stroke="#0b3556" strokeWidth="6" strokeLinecap="round" />
            {/* Bars - only stroke, no fill */}
            <rect x="28" y="55" width="14" height="20" rx="4" fill="none" stroke="#0b3556" strokeWidth="6" />
            <rect x="54" y="35" width="14" height="40" rx="4" fill="none" stroke="#0b3556" strokeWidth="6" />
            <rect x="80" y="15" width="14" height="60" rx="4" fill="none" stroke="#0b3556" strokeWidth="6" />
          </svg>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:16, flex:1}}>
          <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 8px #0001', padding:24, display:'flex', alignItems:'center', gap:24}}>
            <span style={{fontSize:48}}>🎧</span>
            <div>
              <div style={{fontSize:28, fontWeight:700}}>3</div>
              <div style={{fontSize:16}}>Technical Supports</div>
            </div>
            <span style={{fontSize:48}}>🛠️</span>
            <div>
              <div style={{fontSize:28, fontWeight:700}}>4</div>
              <div style={{fontSize:16}}>Operation Team</div>
            </div>
          </div>
          <div style={{background:'#53d1c2', borderRadius:12, padding:16, textAlign:'center', color:'#222', fontWeight:600, fontSize:18}}>
            Customer Feedback<br/>
            <span style={{fontSize:28, color:'#ffe066'}}>★★★★☆</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add AdminPage component
function AdminPage({ onLogin, isLoggedIn, onLogout, tab, setTab }: { onLogin: (u: string, p: string) => void, isLoggedIn: boolean, onLogout: () => void, tab?: 'user' | 'op' | 'tech', setTab?: (k: 'user' | 'op' | 'tech') => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState(10);
  const demoData = [
    { id: 'ABC123', name: 'Abu', dept: 'IT', spec: 'Software' },
    { id: 'ABC124', name: 'Ahmad', dept: 'Software', spec: 'Networking' },
    { id: 'ABC125', name: 'Ali', dept: 'Technical', spec: 'Hardware' },
  ];
  const filtered = demoData.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      if (username === 'admin') { // Only allow admin user
        localStorage.setItem('token', data.access);
        localStorage.setItem('isAdmin', 'true');
        onLogin(username, password);
        setUsername('');
        setPassword('');
        setError('');
      } else {
        setError('Not an admin account');
      }
    } catch {
      setError('Invalid credentials');
    }
  };
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError('');
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };
  if (isLoggedIn) {
    return (
      <div style={{maxWidth:900, margin:'40px auto', background:'#fff', borderRadius:12, boxShadow:'0 4px 24px #0001', padding:32}}>
        <h2 style={{color:'#222', fontFamily:'serif', borderBottom:'2px solid #1ccfc9', paddingBottom:12, marginBottom:24}}>Database</h2>
        {/* Tab bar */}
        <div style={{display:'flex', borderBottom:'2px solid #1ccfc9', marginBottom:16}}>
          <div onClick={()=>setTab && setTab('user')} style={{flex:1, textAlign:'center', padding:'10px 0', cursor:'pointer', background:tab==='user'?'#eaf6fb':'#fff', color:tab==='user'?'#1ccfc9':'#222', fontWeight:tab==='user'?700:600}}>User</div>
          <div onClick={()=>setTab && setTab('op')} style={{flex:1, textAlign:'center', padding:'10px 0', cursor:'pointer', background:tab==='op'?'#eaf6fb':'#fff', color:tab==='op'?'#1ccfc9':'#222', fontWeight:tab==='op'?700:600}}>Operation Team</div>
          <div onClick={()=>setTab && setTab('tech')} style={{flex:1, textAlign:'center', padding:'10px 0', cursor:'pointer', background:tab==='tech'?'#eaf6fb':'#fff', color:tab==='tech'?'#1ccfc9':'#222', fontWeight:tab==='tech'?700:600}}>Technical Support</div>
        </div>
        {/* Search and show controls */}
        <div style={{display:'flex', alignItems:'center', marginBottom:16, gap:16}}>
          <div>Show <select value={showCount} onChange={e=>setShowCount(Number(e.target.value))} style={{border:'1px solid #1ccfc9', borderRadius:4, padding:'2px 8px'}}><option>10</option><option>25</option><option>50</option></select> entries</div>
          <div style={{flex:1}}></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find ticket" style={{border:'1px solid #bbb', borderRadius:4, padding:'6px 12px', minWidth:180}} />
        </div>
        {/* Table */}
        <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:16}}>
          <thead>
            <tr style={{background:'#eaf6fb', color:'#1ccfc9', fontWeight:700}}>
              <th style={{padding:'12px 8px', borderTopLeftRadius:8}}> <input type="checkbox" /> </th>
              <th style={{padding:'12px 8px'}}>Staff ID</th>
              <th style={{padding:'12px 8px'}}>Name</th>
              <th style={{padding:'12px 8px'}}>Department</th>
              <th style={{padding:'12px 8px'}}>Speciality</th>
              <th style={{padding:'12px 8px', borderTopRightRadius:8}}>Setting</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showCount).map((d, i) => (
              <tr key={d.id} style={{background: i%2 ? '#f7faff' : '#fff', transition:'background 0.2s', cursor:'pointer'}}>
                <td style={{padding:'12px 8px'}}><input type="checkbox" /></td>
                <td style={{padding:'12px 8px'}}>{d.id}</td>
                <td style={{padding:'12px 8px'}}>{d.name}</td>
                <td style={{padding:'12px 8px'}}>{d.dept}</td>
                <td style={{padding:'12px 8px'}}>{d.spec}</td>
                <td style={{padding:'12px 8px'}}>
                  <span style={{color:'#1ccfc9', fontSize:22, marginRight:12, cursor:'pointer'}} title="Edit">✏️</span>
                  <span style={{color:'#f44336', fontSize:22, cursor:'pointer'}} title="Delete">🗑️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:8, fontSize:13}}>Showing 1 to {Math.min(showCount, filtered.length)} of {filtered.length} entries</div>
        <div style={{textAlign:'right', fontSize:18, marginTop:4}}>
          <span style={{marginRight:8}}>&lt;&lt;</span>
          <span>1 / 1</span>
          <span style={{marginLeft:8}}>&gt;&gt;</span>
        </div>
      </div>
    );
  }
  // Login form
  return (
    <div style={{background:'#eaf6fb', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <form onSubmit={handleSubmit} style={{background:'#fff', borderRadius:12, boxShadow:'0 4px 24px #0001', padding:32, minWidth:340}}>
        <h2 style={{color:'#1ccfc9', fontFamily:'serif', borderBottom:'2px solid #1ccfc9', paddingBottom:12, marginBottom:24}}>Admin Login</h2>
        <div style={{marginBottom:16}}>
          <label style={{fontWeight:600}}>Username<br/>
            <input value={username} onChange={handleUsernameChange} style={{width:'100%', padding:'8px', border:'1px solid #1ccfc9', borderRadius:4}} />
          </label>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{fontWeight:600}}>Password<br/>
            <input type="password" value={password} onChange={handlePasswordChange} style={{width:'100%', padding:'8px', border:'1px solid #1ccfc9', borderRadius:4}} />
          </label>
        </div>
        {error && <div style={{color:'#f44336', marginBottom:12}}>{error}</div>}
        <button type="submit" style={{background:'#1ccfc9', color:'#fff', border:'none', borderRadius:6, padding:'10px 0', width:'100%', fontWeight:600, fontSize:18, cursor:'pointer'}}>Login</button>
      </form>
    </div>
  );
}

// --- SIDEBAR COMPONENT ---
function Sidebar({ selectedMenu, setSelectedMenu, isAdmin, isTeamHead, adminTab, setAdminTab }: { selectedMenu: string, setSelectedMenu: (k: string) => void, isAdmin: boolean, isTeamHead?: boolean, adminTab?: 'user' | 'op' | 'tech', setAdminTab?: (k: 'user' | 'op' | 'tech') => void }) {
  if (isTeamHead) {
    // Render nothing for sidebar for Team Head, buttons will be in main content
    return null;
  }
  return (
    <div className="sidebar">
      <div style={{flex:1, padding:'18px 0'}}>
        <div
          onClick={()=>setSelectedMenu('dashboard')}
          className={`sidebar-item${selectedMenu==='dashboard' ? ' active' : ''}`}
        >
          <span className="icon-placeholder">🏠</span> Dashboard
        </div>
        {/* Always show Database button for admin */}
        {isAdmin && (
          <>
            <div
              onClick={()=>setSelectedMenu('admin')}
              className={`sidebar-item${selectedMenu==='admin' ? ' active' : ''}`}
            >
              <span className="icon-placeholder">🗄️</span> Database
            </div>
            {/* Sub-items for admin database */}
            {selectedMenu==='admin' && setAdminTab && (
              <div style={{marginLeft:36, marginTop:4}}>
                <div onClick={()=>setAdminTab('user')} style={{padding:'6px 0', color:adminTab==='user'?'#1ccfc9':'#444', fontWeight:adminTab==='user'?700:500, cursor:'pointer'}}>User</div>
                <div onClick={()=>setAdminTab('op')} style={{padding:'6px 0', color:adminTab==='op'?'#1ccfc9':'#444', fontWeight:adminTab==='op'?700:500, cursor:'pointer'}}>Operation Team</div>
                <div onClick={()=>setAdminTab('tech')} style={{padding:'6px 0', color:adminTab==='tech'?'#1ccfc9':'#444', fontWeight:adminTab==='tech'?700:500, cursor:'pointer'}}> <span style={{fontSize:16}}>🛠️</span> Technical Support</div>
              </div>
            )}
          </>
        )}
        {/* Settings Button */}
        <div
          onClick={()=>setSelectedMenu('setting')}
          className={`sidebar-item${selectedMenu==='setting' ? ' active' : ''}`}
          style={{marginTop:32}}
        >
          <span className="icon-placeholder">⚙️</span> Settings
        </div>
        {/* User Log History Button */}
        <div
          onClick={()=>setSelectedMenu('userloghistory')}
          className={`sidebar-item${selectedMenu==='userloghistory' ? ' active' : ''}`}
        >
          <span className="icon-placeholder">📝</span> User Log History
        </div>
      </div>
    </div>
  );
}
// --- APP COMPONENT ---
function App() {
  const [authPage, setAuthPage] = useState<'none' | 'signin' | 'signup' | 'forgot'>(localStorage.getItem('token') ? 'none' : 'signin');
  console.log('authPage:', authPage);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<{username: string, email: string} | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketError, setTicketError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [remark, setRemark] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMember, setTeamMember] = useState('');
  const [closeLoading, setCloseLoading] = useState(false);
  const [detailsTicket, setDetailsTicket] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'user'|'op'|'tech'>('user');
  const [users, setUsers] = useState<any[]>([]);

  // Load token and profile from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedProfile = localStorage.getItem('profile');
    if (storedToken) {
      setToken(storedToken);
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
          if (parsedProfile.is_superuser) {
            setIsAdmin(true);
            setSelectedMenu('admin');
          } else {
            setIsAdmin(false);
            setSelectedMenu('dashboard');
          }
        } catch {}
      }
      setAuthPage('none');
    } else {
      setIsAdmin(false);
      setAuthPage('signin');
    }
  }, []);

  // Save token to localStorage on login
  const handleLogin = (jwt: string, userProfile: any) => {
    setToken(jwt);
    setProfile(userProfile);
    localStorage.setItem('token', jwt);
    localStorage.setItem('profile', JSON.stringify(userProfile));
    if (userProfile.is_superuser) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setSelectedMenu('admin');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      setSelectedMenu('dashboard');
    }
    setAuthPage('none');
  };

  // Logout function
  const handleLogout = () => {
    setToken(null);
    setProfile(null);
    setTickets([]);
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    setSelectedMenu(null);
    setTicketError('');
    setAuthPage('signin');
  };

  // Fetch tickets from backend
  const fetchTickets = async (jwt: string) => {
    setTicketError('');
    try {
      const res = await fetch(`${API_BASE}/tickets/`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (res.status === 401) {
        setTicketError('Session expired or unauthorized. Please log in again.');
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      } else {
        setTickets([]);
        setTicketError('Failed to fetch tickets.');
      }
    } catch (err) {
      setTickets([]);
      setTicketError('Network error. Please try again.');
    }
  };

  // Fetch tickets when token changes
  useEffect(() => {
    if (token) {
      fetchTickets(token);
    }
  }, [token]);

  // Create new ticket via backend
  const handleNewTicket = async (ticket: any): Promise<string | null> => {
    if (!token) {
      return 'Not authenticated. Please log in again.';
    }
    try {
      const res = await fetch(`${API_BASE}/tickets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticket)
      });
      if (res.ok) {
        setTicketError('');
        fetchTickets(token);
        return null;
      } else {
        const data = await res.json().catch(() => ({}));
        if (data && typeof data === 'object') {
          return data.detail || Object.values(data).join(' ') || 'Failed to create ticket.';
        }
        return 'Failed to create ticket.';
      }
    } catch (e) {
      return 'Failed to create ticket.';
    }
  };

  const myTickets = profile ? tickets : [];

  // Update isTeamOp and add isTeamTech
  const isTeamOp = profile && profile.username === 'teamop';
  const isTeamTech = profile && profile.username === 'teamtech';
  const isTeamHead = profile && profile.username === 'teamhead';

  // Only show Admin in sidebar if isAdmin is true
  const sidebarItems = isAdmin
    ? [
        { key: 'admin', label: 'Admin' },
      ]
    : isTeamOp
      ? [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'ticketapproval', label: 'Ticket Approval' },
          { key: 'myticket', label: 'My Ticket' },
          { key: 'performance', label: 'Performance' },
        ]
      : isTeamTech
        ? [
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'myticket', label: 'My Ticket' },
            { key: 'performance', label: 'Performance' },
          ]
        : isTeamHead
          ? [
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'myticket', label: 'My Ticket' },
              { key: 'performance', label: 'Performance' },
            ]
          : [
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'newticket', label: 'New Ticket' },
              { key: 'myticket', label: 'My Ticket' },
            ];

  // Reset modal fields when opening/closing
  useEffect(() => {
    if (selectedTicket && (isTeamOp || isTeamTech)) {
      setRemark('');
      setTeamName('');
      setTeamMember('');
    }
  }, [selectedTicket, isTeamOp, isTeamTech]);

  // Ensure Team Head always defaults to 'database' menu
  useEffect(() => {
    if (isTeamHead && !selectedMenu) {
      setSelectedMenu('database');
    }
  }, [isTeamHead, selectedMenu]);

  const handleCloseTicket = async () => {
    setCloseLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tickets/${selectedTicket.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Closed', remark, team_name: teamName, team_member: teamMember })
      });
      if (res.ok) {
        await fetchTickets(token!);
        setSelectedTicket(null);
        if (isTeamTech) {
          setSelectedMenu('myticket');
        } else {
          setSelectedMenu('dashboard');
        }
      }
    } finally {
      setCloseLoading(false);
    }
  };

  // Admin login handler
  const handleAdminLogin = (username: string, password: string) => {
    setIsAdmin(true);
    setSelectedMenu('admin');
  };
  // Admin logout handler
  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    setSelectedMenu('dashboard');
  };

  // Render admin page if selected
  if (isAdmin) {
    return (
      <div style={{display:'flex'}}>
        <Sidebar selectedMenu={selectedMenu || 'admin'} setSelectedMenu={setSelectedMenu} isAdmin={isAdmin} isTeamHead={!!isTeamHead} adminTab={adminTab} setAdminTab={setAdminTab as (k: 'user' | 'op' | 'tech') => void} />
        <div style={{flex:1}}>
          {selectedMenu === 'admin' ? (
            <AdminPage onLogin={handleAdminLogin} isLoggedIn={isAdmin} onLogout={handleAdminLogout} tab={adminTab} setTab={setAdminTab as (k: 'user' | 'op' | 'tech') => void} />
          ) : (
            <div style={{padding:40}}>Welcome, Admin!</div>
          )}
        </div>
      </div>
    );
  }

  if (authPage === 'signin') {
    return <SignIn onSignUp={() => setAuthPage('signup')} onForgot={() => setAuthPage('forgot')} onSuccess={handleLogin} />;
  }
  if (authPage === 'signup') {
    return <SignUp onSignIn={() => setAuthPage('signin')} onForgot={() => setAuthPage('forgot')} />;
  }
  if (authPage === 'forgot') {
    return <ForgotPassword onSignIn={() => setAuthPage('signin')} />;
  }

  return (
    <div className="main-wrapper">
      <header className="header">
        <div className="header-title"><span className="helpdesk-title">Helpdesk</span></div>
        <div className="header-center"></div>
        <div className="header-icons">
          <button className="icon-btn">EN</button>
          <button className="icon-btn">HI</button>
          <span className="icon-placeholder">🔔</span>
          <span className="icon-placeholder" style={{cursor:'pointer'}} onClick={() => setShowProfile((v) => !v)}>👤</span>
          <button className="icon-btn signout-icon-btn" onClick={handleLogout} title="Sign Out" style={{marginLeft:12}}>
            <span style={{fontSize:'1.3em'}}>🚪</span>
          </button>
        </div>
      </header>
      <div className="body-area">
        {isTeamHead ? null : (
        <aside className="sidebar">
          <nav>
            {sidebarItems.map(item => (
              <div
                key={item.key}
                className={`sidebar-item${selectedMenu === item.key ? ' active' : ''}`}
                onClick={() => setSelectedMenu(item.key)}
                style={{ cursor: 'pointer' }}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>
        )}
        <main className="content">
          {ticketError && <div style={{color:'red', marginBottom:8}}>{ticketError}</div>}
          {/* Show Profile modal overlay if showProfile is true */}
          {showProfile && profile && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.15)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ position: 'relative', minWidth: 600, minHeight: 400 }}>
                <Profile user={{
                  username: profile.username,
                  email: profile.email,
                  contact: '-',
                  department: '-',
                }} />
                <button onClick={() => setShowProfile(false)} style={{ position: 'absolute', top: 10, right: 10, background: '#eee', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 20, cursor: 'pointer' }}>×</button>
              </div>
            </div>
          )}
          {/* Hide main content when profile is open */}
          {!showProfile && (
            isTeamHead ? (
              <TeamHeadDashboard tickets={tickets} selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} token={token} users={users} />
            ) : (
            selectedMenu === 'dashboard' && (
              !token || !profile ? (
                <div style={{textAlign:'center', fontSize:'1.5rem', marginTop:'3em'}}>Please login</div>
              ) : isTeamOp ? (
                <TeamOpDashboard tickets={tickets} />
              ) : profile?.username === 'teamtech' ? (
                <TeamTechDashboard tickets={tickets} />
              ) : (
                <DashboardCards tickets={tickets} />
                )
              )
            )
          )}
          {selectedMenu === 'newticket' && <NewTicketForm onSubmit={handleNewTicket} />}
          {selectedMenu === 'myticket' && (
            (isTeamOp || isTeamTech) ? (
              <MyTicketTable 
                tickets={tickets.filter(t => t.user_username !== profile?.username)} 
                onEditTicket={setSelectedTicket} 
                showUserColumn={true}
              />
            ) : (
              <MyTicketTable 
                tickets={tickets.filter(t => t.user_username === profile?.username)} 
                onEditTicket={setSelectedTicket} 
                showUserColumn={false}
              />
            )
          )}
          {selectedMenu === 'ticketapproval' && isTeamOp && (
            <TicketApprovalTable tickets={tickets} onTicketClick={setSelectedTicket} token={token} />
          )}
          {selectedMenu === 'performance' && isTeamOp && (
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginTop:'2em'}}>
              {/* Left Card */}
              <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #0001', padding:32, minWidth:400, maxWidth:500, marginLeft:'2em'}}>
                <div style={{display:'flex', alignItems:'center', gap:24}}>
                  <div style={{width:80, height:80, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48}}>
                    <span role="img" aria-label="user">👤</span>
                  </div>
                  <div>
                    <div style={{fontSize:'1.6em', fontWeight:600}}>Operation Name</div>
                    <div style={{background:'#f5f5f5', borderRadius:8, padding:'8px 16px', marginTop:8, fontSize:'1em'}}>
                      Contact No: 0123456789<br/>
                      Department: ABC
                    </div>
                  </div>
                </div>
                <div style={{background:'#f5f5f5', borderRadius:8, padding:20, marginTop:24, fontSize:'1.1em'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div><b>Total Ticket Handle</b></div>
                    <div style={{fontWeight:700, fontSize:'1.2em'}}>{tickets.length}</div>
                  </div>
                  <div style={{marginTop:8}}>Ticket Solved <span style={{float:'right'}}>{tickets.filter(t=>t.status==='Solved').length}</span></div>
                  <div>Ticket Pending <span style={{float:'right'}}>{tickets.filter(t=>t.status==='Pending').length}</span></div>
                  <div>Ticket in progress <span style={{float:'right'}}>{tickets.filter(t=>t.status==='In Progress').length}</span></div>
                  <div style={{marginTop:8}}>Rating
                    <span style={{marginLeft:8, color:'#f6c244', fontSize:'1.2em'}}>
                      {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
                    </span>
                  </div>
                </div>
              </div>
              {/* Right List */}
              <div style={{flex:1, marginLeft:40, marginRight:'2em'}}>
                <div style={{marginBottom:24}}>
                  <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
                    <div style={{width:60, height:60, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32}}>
                      <span role="img" aria-label="user">👤</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:'1.1em'}}>Operation Name 1</div>
                      <button style={{background:'#2ad1b6', color:'#fff', border:'none', borderRadius:20, padding:'8px 24px', fontWeight:600, cursor:'pointer'}}>View details</button>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
                    <div style={{width:60, height:60, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32}}>
                      <span role="img" aria-label="user">👤</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:'1.1em'}}>Operation Name 2</div>
                      <button style={{background:'#2ad1b6', color:'#fff', border:'none', borderRadius:20, padding:'8px 24px', fontWeight:600, cursor:'pointer'}}>View details</button>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
                    <div style={{width:60, height:60, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32}}>
                      <span role="img" aria-label="user">👤</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:'1.1em'}}>Operation Name 3</div>
                      <button style={{background:'#2ad1b6', color:'#fff', border:'none', borderRadius:20, padding:'8px 24px', fontWeight:600, cursor:'pointer'}}>View details</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedMenu === 'performance' && isTeamTech && (
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginTop:'2em'}}>
              {/* Left Card */}
              <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #0001', padding:32, minWidth:400, maxWidth:500, marginLeft:'2em'}}>
                <div style={{display:'flex', alignItems:'center', gap:24}}>
                  <div style={{width:80, height:80, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48}}>
                    <span role="img" aria-label="user">👤</span>
                  </div>
                  <div>
                    <div style={{fontSize:'1.3em', fontWeight:600}}>Technical Support Name</div>
                    <div style={{background:'#f5f5f5', borderRadius:8, padding:'8px 16px', marginTop:8, fontSize:'1em'}}>
                      Contact No: 0123456789<br/>
                      Department: ABC
                    </div>
                  </div>
                </div>
                <div style={{background:'#f5f5f5', borderRadius:8, padding:20, marginTop:24, fontSize:'1.1em'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div><b>Total Ticket Handle</b></div>
                    <div style={{fontWeight:700, fontSize:'1.2em'}}>{tickets.length}</div>
                  </div>
                  <div style={{marginTop:8}}>Ticket Solved <span style={{float:'right'}}>{tickets.filter(t=>t.status==='Closed').length}</span></div>
                  <div>Ticket Pending <span style={{float:'right'}}>{tickets.filter(t=>t.status==='Pending').length}</span></div>
                  <div>Ticket in progress <span style={{float:'right'}}>{tickets.filter(t=>t.status==='In Progress').length}</span></div>
                  <div style={{marginTop:8}}>Rating
                    <span style={{marginLeft:8, color:'#f6c244', fontSize:'1.2em'}}>
                      {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
                    </span>
                  </div>
                </div>
              </div>
              {/* Right List */}
              <div style={{flex:1, marginLeft:40, marginRight:'2em'}}>
                <div style={{marginBottom:24}}>
                  <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
                    <div style={{width:60, height:60, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32}}>
                      <span role="img" aria-label="user">👤</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:'1.1em'}}>Technical Support 1</div>
                      <button style={{background:'#2ad1b6', color:'#fff', border:'none', borderRadius:20, padding:'8px 24px', fontWeight:600, cursor:'pointer'}}>View details</button>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
                    <div style={{width:60, height:60, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32}}>
                      <span role="img" aria-label="user">👤</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:'1.1em'}}>Technical Support 2</div>
                      <button style={{background:'#2ad1b6', color:'#fff', border:'none', borderRadius:20, padding:'8px 24px', fontWeight:600, cursor:'pointer'}}>View details</button>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
                    <div style={{width:60, height:60, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32}}>
                      <span role="img" aria-label="user">👤</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:'1.1em'}}>Technical Support 3</div>
                      <button style={{background:'#2ad1b6', color:'#fff', border:'none', borderRadius:20, padding:'8px 24px', fontWeight:600, cursor:'pointer'}}>View details</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedMenu === 'performance' && !isTeamOp && (
            <div style={{textAlign:'center', marginTop:'3em'}}>
              <h2>Performance</h2>
              <div style={{color:'#888'}}>Team performance metrics and charts will appear here.</div>
            </div>
          )}
          {selectedMenu === 'admin' && (
            <AdminPage onLogin={handleAdminLogin} isLoggedIn={isAdmin} onLogout={handleAdminLogout} tab={adminTab} setTab={setAdminTab as (k: 'user' | 'op' | 'tech') => void} />
          )}
        </main>
      </div>
      <footer className="footer">
        <div className="footer-left"></div>
        <div className="footer-center"></div>
      </footer>
      {(isTeamOp || isTeamTech) && selectedTicket && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#0008', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}} 
          onClick={e => { if (e.target === e.currentTarget) setSelectedTicket(null); }}>
          <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 24px #0003', padding:0, minWidth:540, maxWidth:700, width:'40vw', border:'4px solid #3fa9f5', display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div style={{padding:'24px 0 0 0', textAlign:'center', fontFamily:'serif', fontSize:'1.5em', fontWeight:600}}>My Ticket - Close Ticket</div>
            <div style={{background:'#53d1c2', borderRadius:16, margin:'32px 32px 32px 32px', padding:'32px 32px 24px 32px', minWidth:420, minHeight:220, display:'flex', flexDirection:'column', alignItems:'center', gap:24}}>
              <div style={{display:'flex', width:'100%', gap:16}}>
                <input value={selectedTicket.ticketNo} readOnly placeholder="Ticket No." style={{flex:1, background:'#fff', border:'1px solid #bbb', borderRadius:6, padding:10, fontSize:16, fontWeight:500}} />
                <textarea placeholder="Remark" value={remark} onChange={e=>setRemark(e.target.value)} style={{flex:2, background:'#fff', border:'1px solid #bbb', borderRadius:6, padding:10, fontSize:16, minHeight:60, resize:'none'}} />
              </div>
              <div style={{display:'flex', width:'100%', gap:16}}>
                <input placeholder="Team name" value={teamName} onChange={e=>setTeamName(e.target.value)} style={{flex:1, background:'#fff', border:'1px solid #bbb', borderRadius:6, padding:10, fontSize:16}} />
                <div style={{flex:1, display:'flex', alignItems:'center', gap:8}}>
                  <input placeholder="Team Member" value={teamMember} onChange={e=>setTeamMember(e.target.value)} style={{flex:1, background:'#fff', border:'1px solid #bbb', borderRadius:6, padding:10, fontSize:16}} />
                  <span style={{fontSize:22, marginLeft:4}}>👥</span>
                </div>
              </div>
              <button onClick={handleCloseTicket} disabled={closeLoading} style={{background:'#222', color:'#fff', border:'none', borderRadius:6, padding:'12px 38px', fontSize:18, fontWeight:600, boxShadow:'0 2px 8px #0002', marginTop:12, width:'100%'}}>{closeLoading ? 'Closing...' : 'Close Ticket'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamHeadDashboard({ tickets, selectedMenu, setSelectedMenu, token, users }: { tickets: any[], selectedMenu: string | null, setSelectedMenu: (k: string | null) => void, token: string | null, users: any[] }) {
  // Sidebar state
  const [sidebarMenu, setSidebarMenu] = useState<'dashboard'|'database'|'setting'|'userloghistory'>('dashboard');
  const [tab, setTab] = useState<'user'|'op'|'tech'>('user');
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [logHistory, setLogHistory] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState('');
  useEffect(() => {
    if (sidebarMenu === 'userloghistory') {
      setLogLoading(true);
      setLogError('');
      fetch('http://localhost:8000/api/userloghistory/', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => { setLogHistory(data); setLogLoading(false); })
        .catch(() => { setLogError('Failed to fetch user log history.'); setLogLoading(false); });
    }
  }, [sidebarMenu, token]);
  // Filtered data for each tab (replace with real data as needed)
  const filteredUser = tickets.filter(t => t.ticketNo.includes(search) || t.subject?.toLowerCase().includes(search.toLowerCase()));
  const totalPagesUser = Math.ceil(filteredUser.length / entries);
  const paginatedUser = filteredUser.slice((page-1)*entries, page*entries);
  return (
    <div style={{display:'flex', minHeight:'80vh'}}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#C0C0C0',
        height: 'calc(100vh - 130px)', // 80px header + 50px footer
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        margin: '0 0 0 24px', // Remove top/bottom margin
        boxShadow: '2px 0 16px #0001',
        padding: '0 0 0 0',
      }}>
        <div style={{flex:1, padding:'18px 0'}}>
          <div onClick={()=>setSidebarMenu('dashboard')} style={{
            display:'flex', alignItems:'center', gap:16, padding:'14px 32px', cursor:'pointer',
            background:sidebarMenu==='dashboard'?'#fff':'transparent',
            color:sidebarMenu==='dashboard'?'#3386f6':'#fff',
            fontWeight:sidebarMenu==='dashboard'?700:500,
            fontSize:18,
            borderRadius:12,
            margin:'0 18px 16px 18px',
            boxShadow:sidebarMenu==='dashboard'?'0 2px 8px #0002':'none',
            transition:'all 0.2s',
          }}><span style={{fontSize:26}}>🏠</span> Dashboard</div>
          <div onClick={()=>setSidebarMenu('database')} style={{
            display:'flex', alignItems:'center', gap:16, padding:'14px 32px', cursor:'pointer',
            background:sidebarMenu==='database'?'#fff':'transparent',
            color:sidebarMenu==='database'?'#3386f6':'#fff',
            fontWeight:sidebarMenu==='database'?700:500,
            fontSize:18,
            borderRadius:12,
            margin:'0 18px 16px 18px',
            boxShadow:sidebarMenu==='database'?'0 2px 8px #0002':'none',
            transition:'all 0.2s',
          }}><span style={{fontSize:26}}>🗄️</span> Database</div>
          {sidebarMenu==='database' && (
            <div style={{marginLeft:48, marginTop:4}}>
              <div onClick={()=>setTab('user')} style={{padding:'8px 0', color:tab==='user'?'#1ccfc9':'#fff', fontWeight:tab==='user'?700:500, cursor:'pointer', fontSize:16}}> <span style={{fontSize:18}}>👤</span> User</div>
              <div onClick={()=>setTab('op')} style={{padding:'8px 0', color:tab==='op'?'#1ccfc9':'#fff', fontWeight:tab==='op'?700:500, cursor:'pointer', fontSize:16}}>Operation Team</div>
              <div onClick={()=>setTab('tech')} style={{padding:'8px 0', color:tab==='tech'?'#1ccfc9':'#fff', fontWeight:tab==='tech'?700:500, cursor:'pointer', fontSize:16}}> <span style={{fontSize:18}}>🛠️</span> Technical Support</div>
      </div>
          )}
          <div onClick={()=>setSidebarMenu('setting')} style={{
            marginTop:32, color:sidebarMenu==='setting'?'#3386f6':'#fff', fontSize:18, padding:'14px 32px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', fontWeight:sidebarMenu==='setting'?700:500, borderRadius:12, background:sidebarMenu==='setting'?'#fff':'transparent', boxShadow:sidebarMenu==='setting'?'0 2px 8px #0002':'none', margin:'0 18px 16px 18px', transition:'all 0.2s',
          }}><span style={{fontSize:24}}>⚙️</span> Setting</div>
          <div onClick={()=>setSidebarMenu('userloghistory')} style={{
            marginTop:8, color:sidebarMenu==='userloghistory'?'#3386f6':'#fff', fontSize:18, padding:'14px 32px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', fontWeight:sidebarMenu==='userloghistory'?700:500, borderRadius:12, background:sidebarMenu==='userloghistory'?'#fff':'transparent', boxShadow:sidebarMenu==='userloghistory'?'0 2px 8px #0002':'none', margin:'0 18px 16px 18px', transition:'all 0.2s',
          }}><span style={{fontSize:24}}>📄</span> User Log History</div>
        </div>
      </aside>
      {/* Main content */}
      <main style={{flex:1, padding:'32px 0 0 0'}}>
        {sidebarMenu==='database' && (
          <>
            <div style={{fontSize:'1.6em', fontWeight:700, textAlign:'left', marginLeft:32, marginBottom:16}}>Database</div>
            <div style={{display:'flex', gap:0, marginLeft:32, marginBottom:0}}>
              <button onClick={()=>setTab('user')} style={{flex:1, background:tab==='user'?'#3fd0c9':'#e0e0e0', color:tab==='user'?'#fff':'#222', border:'none', borderRadius:'6px 6px 0 0', padding:'10px 24px', fontWeight:600, fontSize:16, cursor:'pointer'}}>User</button>
              <button onClick={()=>setTab('op')} style={{flex:1, background:tab==='op'?'#3fd0c9':'#e0e0e0', color:tab==='op'?'#fff':'#222', border:'none', borderRadius:'6px 6px 0 0', padding:'10px 24px', fontWeight:600, fontSize:16, cursor:'pointer'}}>Operation Team</button>
              <button onClick={()=>setTab('tech')} style={{flex:1, background:tab==='tech'?'#3fd0c9':'#e0e0e0', color:tab==='tech'?'#fff':'#222', border:'none', borderRadius:'6px 6px 0 0', padding:'10px 24px', fontWeight:600, fontSize:16, cursor:'pointer'}}>Technical Support</button>
            </div>
            <div style={{background:'#fff', borderRadius:'0 0 8px 8px', boxShadow:'0 2px 8px #0001', margin:'0 2.5%', width:'95%', minHeight:200, borderTop:'2px solid #3fd0c9'}}>
              {tab === 'user' && (
                <table style={{width:'100%', borderCollapse:'collapse', margin:'0 auto', marginTop:8, fontSize:'1rem'}}>
        <thead>
          <tr style={{background:'#f5f5f5', fontWeight:600}}>
                      <th style={{padding:'8px'}}>Username</th>
                      <th style={{padding:'8px'}}>Email</th>
            <th style={{padding:'8px'}}>Department</th>
                      <th style={{padding:'8px'}}>Access Level</th>
          </tr>
        </thead>
        <tbody>
                    {users.filter(u => u.username !== 'teamop' && u.username !== 'teamtech' && u.username !== 'teamhead').map((u, i) => (
                      <tr key={u.id} style={{background: i%2 ? '#f9f9f9' : '#fff'}}>
                        <td style={{padding:'8px'}}>{u.username}</td>
                        <td style={{padding:'8px'}}>{u.email}</td>
                        <td style={{padding:'8px'}}>{u.department || '-'}</td>
                        <td style={{padding:'8px'}}>{u.accessLevel || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {tab === 'op' && (
                <table style={{width:'100%', borderCollapse:'collapse', margin:'0 auto', marginTop:8, fontSize:'1rem'}}>
                  <thead>
                    <tr style={{background:'#f5f5f5', fontWeight:600}}>
                      <th style={{padding:'8px'}}>Username</th>
                      <th style={{padding:'8px'}}>Email</th>
                      <th style={{padding:'8px'}}>Department</th>
                      <th style={{padding:'8px'}}>Access Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.username === 'teamop').map((u, i) => (
                      <tr key={u.id} style={{background: i%2 ? '#f9f9f9' : '#fff'}}>
                        <td style={{padding:'8px'}}>{u.username}</td>
                        <td style={{padding:'8px'}}>{u.email}</td>
                        <td style={{padding:'8px'}}>{u.department || '-'}</td>
                        <td style={{padding:'8px'}}>{u.accessLevel || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {tab === 'tech' && (
                <table style={{width:'100%', borderCollapse:'collapse', margin:'0 auto', marginTop:8, fontSize:'1rem'}}>
                  <thead>
                    <tr style={{background:'#f5f5f5', fontWeight:600}}>
                      <th style={{padding:'8px'}}>Username</th>
                      <th style={{padding:'8px'}}>Email</th>
                      <th style={{padding:'8px'}}>Department</th>
                      <th style={{padding:'8px'}}>Access Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.username === 'teamtech').map((u, i) => (
                      <tr key={u.id} style={{background: i%2 ? '#f9f9f9' : '#fff'}}>
                        <td style={{padding:'8px'}}>{u.username}</td>
                        <td style={{padding:'8px'}}>{u.email}</td>
                        <td style={{padding:'8px'}}>{u.department || '-'}</td>
                        <td style={{padding:'8px'}}>{u.accessLevel || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        {sidebarMenu==='setting' && (
          <TeamHeadSettings />
        )}
        {sidebarMenu==='userloghistory' && (
          <div style={{padding:40, textAlign:'center'}}>
            <h2>User Log History</h2>
            {logLoading ? <div>Loading...</div> : logError ? <div style={{color:'red'}}>{logError}</div> : (
              <table style={{width:'100%', borderCollapse:'collapse', margin:'0 auto', marginTop:8, fontSize:'1rem'}}>
                <thead>
                  <tr style={{background:'#f5f5f5', fontWeight:600}}>
                    <th style={{padding:'8px'}}>User</th>
                    <th style={{padding:'8px'}}>Action</th>
                    <th style={{padding:'8px'}}>Timestamp</th>
                    <th style={{padding:'8px'}}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logHistory.length === 0 ? (
                    <tr><td colSpan={4} style={{padding:16, color:'#888'}}>No log history found.</td></tr>
                  ) : logHistory.map((log, i) => (
            <tr key={i} style={{background: i%2 ? '#f9f9f9' : '#fff'}}>
                      <td style={{padding:'8px'}}>{log.user}</td>
                      <td style={{padding:'8px'}}>{log.action}</td>
                      <td style={{padding:'8px'}}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{padding:'8px'}}>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
            )}
          </div>
        )}
        {sidebarMenu==='dashboard' && (
          // Show TeamOpDashboard for Team Head dashboard
          <div style={{padding:40, textAlign:'center'}}>
            <TeamOpDashboard tickets={tickets} />
          </div>
        )}
      </main>
    </div>
  );
}

function TeamHeadSettings() {
  const [open, setOpen] = React.useState({
    general: true,
    connect: false,
    email: false,
    authorization: false,
    notification: false,
  });
  const [lang, setLang] = React.useState('EN');
  const [dataBackup, setDataBackup] = React.useState(true);
  const [goDash, setGoDash] = React.useState(true);
  const [superController, setSuperController] = React.useState(true);
  const [enableSMTP, setEnableSMTP] = React.useState(true);
  const [editAuth, setEditAuth] = React.useState(true);
  const [authLevel, setAuthLevel] = React.useState('');
  const [enableNotif, setEnableNotif] = React.useState(true);
  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>
      <div className="settings-card">
        {/* General */}
        <div className="settings-section">
          <div className="settings-section-header" onClick={()=>setOpen(o=>({...o, general:!o.general}))}>
            <span>General</span> <span className="settings-section-arrow">{open.general ? '▼' : '▶'}</span>
          </div>
          {open.general && (
            <div className="settings-section-content">
              <div className="settings-row">
                <span>Language</span>
                <select value={lang} onChange={e=>setLang(e.target.value)}>
                  <option value="EN">EN</option>
                  <option value="FR">FR</option>
                </select>
              </div>
              <div className="settings-row">
                <span>Data Backup</span>
                <input type="checkbox" checked={dataBackup} onChange={e=>setDataBackup(e.target.checked)} />
              </div>
            </div>
          )}
        </div>
        {/* Connect To */}
        <div className="settings-section">
          <div className="settings-section-header" onClick={()=>setOpen(o=>({...o, connect:!o.connect}))}>
            <span>Connect To</span> <span className="settings-section-arrow">{open.connect ? '▼' : '▶'}</span>
          </div>
          {open.connect && (
            <div className="settings-section-content">
              <div className="settings-row">
                <span>GoDash</span>
                <input type="checkbox" checked={goDash} onChange={e=>setGoDash(e.target.checked)} />
              </div>
              <div className="settings-row">
                <span>SuperController</span>
                <input type="checkbox" checked={superController} onChange={e=>setSuperController(e.target.checked)} />
              </div>
            </div>
          )}
        </div>
        {/* Email */}
        <div className="settings-section">
          <div className="settings-section-header" onClick={()=>setOpen(o=>({...o, email:!o.email}))}>
            <span>Email</span> <span className="settings-section-arrow">{open.email ? '▼' : '▶'}</span>
          </div>
          {open.email && (
            <div className="settings-section-content">
              <div className="settings-row">
                <span>Enable SMTP</span>
                <input type="checkbox" checked={enableSMTP} onChange={e=>setEnableSMTP(e.target.checked)} />
              </div>
            </div>
          )}
        </div>
        {/* Authorization */}
        <div className="settings-section">
          <div className="settings-section-header" onClick={()=>setOpen(o=>({...o, authorization:!o.authorization}))}>
            <span>Authorization</span> <span className="settings-section-arrow">{open.authorization ? '▼' : '▶'}</span>
          </div>
          {open.authorization && (
            <div className="settings-section-content">
              <div className="settings-row">
                <span>Edit authorization</span>
                <input type="checkbox" checked={editAuth} onChange={e=>setEditAuth(e.target.checked)} />
              </div>
              <div className="settings-row">
                <span>Authority Level</span>
                <select value={authLevel} onChange={e=>setAuthLevel(e.target.value)}>
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
          )}
        </div>
        {/* Notification */}
        <div className="settings-section">
          <div className="settings-section-header" onClick={()=>setOpen(o=>({...o, notification:!o.notification}))}>
            <span>Notification</span> <span className="settings-section-arrow">{open.notification ? '▼' : '▶'}</span>
          </div>
          {open.notification && (
            <div className="settings-section-content">
              <div className="settings-row">
                <span>Enable Notification</span>
                <input type="checkbox" checked={enableNotif} onChange={e=>setEnableNotif(e.target.checked)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
