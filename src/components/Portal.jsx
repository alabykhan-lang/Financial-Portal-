import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SCHOOL_SHORT } from '../constants';
import Dash from './Dash';
import CashBook from './CashBook';
import Ledgers from './Ledgers';
import Analysis from './Analysis';
import ClassPortal from './ClassPortal';
import Lessons from './Lessons';
import ExamPortal from './ExamPortal';
import Sal from './Sal';
import Acct from './Acct';
import UserMgmt from './UserMgmt';
import Settings from './Settings';
import HomePage from './HomePage';

export default function Portal() {
  const { session, setSession, syncMsg } = useApp();
  const [tab, setTab] = useState('home');
  const [sbOpen, setSbOpen] = useState(false);
  const [showN, setShowN] = useState(false);

  const isAdmin = session?.role === 'admin' || session?.role === 'superadmin';

  const menu = [
    { id: 'home', t: 'Home', i: '🏠' },
    { id: 'dash', t: 'Dashboard', i: '📊', admin: true },
    { id: 'cashbook', t: 'Daily Cash Book', i: '📒' },
    { id: 'ledgers', t: 'Student Ledgers', i: '👤' },
    { id: 'analysis', t: 'Payment Analysis', i: '📋' },
    { id: 'classportal', t: 'Class Portal', i: '👥' },
    { id: 'lessons', t: 'Lesson Portal', i: '📅' },
    { id: 'exams', t: 'External Exams', i: '📝' },
    { id: 'sal', t: 'Salaries', i: '💰', admin: true },
    { id: 'acct', t: 'Accounting', i: '🏦', admin: true },
    { id: 'users', t: 'User Mgmt', i: '🔐', admin: true },
    { id: 'set', t: 'Settings', i: '⚙️', admin: true },
  ];

  const renderTab = () => {
    const sec = session?.section === 'both' ? 'A' : session?.section;
    switch (tab) {
      case 'home': return <HomePage setTab={setTab} />;
      case 'dash': return <Dash sec={session?.section === 'both' ? null : session?.section} />;
      case 'cashbook': return <CashBook sec={sec} />;
      case 'ledgers': return <Ledgers sec={sec} />;
      case 'analysis': return <Analysis sec={sec} />;
      case 'classportal': return <ClassPortal sec={sec} />;
      case 'lessons': return <Lessons sec={sec} />;
      case 'exams': return <ExamPortal />;
      case 'sal': return <Sal />;
      case 'acct': return <Acct />;
      case 'users': return <UserMgmt />;
      case 'set': return <Settings />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="pl">
      <div className={`sb-ov ${sbOpen ? 'open' : 'h'}`} onClick={() => setSbOpen(false)} />
      <aside className={`sb ${sbOpen ? 'open' : ''}`}>
        <div className="sb-hd">
          <div className="sb-lw">
            <div className="sb-logo"><img src={window.LOGO_80} alt="L" /></div>
            <div>
              <div className="sb-nm">{SCHOOL_SHORT}</div>
              <div className="sb-tg">Finance Portal v2.0</div>
            </div>
          </div>
          <div className="sb-rp">{session?.role === 'superadmin' ? 'Super Admin' : session?.role === 'admin' ? 'Administrator' : `Bursar - Section ${session?.section}`}</div>
        </div>
        <nav className="sb-nav">
          <div className="sb-lbl">Navigation</div>
          {menu.filter(m => !m.admin || isAdmin).map(m => (
            <div key={m.id} className={`ni2 ${tab === m.id ? 'act' : ''}`} onClick={() => { setTab(m.id); setSbOpen(false); }}>
              <span className="ni2-ic">{m.i}</span> {m.t}
            </div>
          ))}
        </nav>
        <div className="sb-ft">
          <div className="sb-usr">
            <div className="sb-av">{session?.name?.[0]}</div>
            <div className="sb-un">{session?.name}</div>
          </div>
          <button className="sb-lo" onClick={() => setSession(null)}>Logout</button>
        </div>
      </aside>

      <main className="pm">
        <header className="ptb">
          <button className="hbg" onClick={() => setSbOpen(true)}>☰</button>
          <div className="ptitle">{menu.find(m => m.id === tab)?.t}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{syncMsg}</div>
            </div>
          </div>
        </header>
        <div className="pc">{renderTab()}</div>
      </main>
    </div>
  );
}