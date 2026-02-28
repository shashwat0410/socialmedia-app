import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usersAPI, postsAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, Icons, SkeletonPost, EmptyState, Spinner, Modal, formatTime } from '../components/common';
import { PostCard } from '../components/posts';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════
//  PROFILE PAGE
// ════════════════════════════════════════════
export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwn = currentUser?.userName === username;

  useEffect(() => {
    setLoading(true);
    usersAPI.getProfile(username).then(res => {
      const p = res.data.data;
      setProfile(p);
      setFollowing(p.isFollowedByCurrentUser);
    }).catch(() => {
      toast.error('User not found', { className: 'toast-custom' });
    }).finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    setPostsLoading(true);
    usersAPI.getUserPosts(profile.id, { page: 1, pageSize: 20 }).then(res => {
      setPosts(res.data.data.items || []);
    }).finally(() => setPostsLoading(false));
  }, [profile]);

  const handleFollow = async () => {
    setFollowing(f => !f);
    setProfile(p => ({ ...p, followersCount: following ? p.followersCount - 1 : p.followersCount + 1 }));
    try {
      await usersAPI.toggleFollow(profile.id);
      toast.success(following ? `Unfollowed @${profile.userName}` : `Now following @${profile.userName}`, { className: 'toast-custom' });
    } catch {
      setFollowing(f => !f);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>
  );

  if (!profile) return (
    <div style={{ padding: 40 }}>
      <EmptyState icon={<Icons.User style={{ width: 48, height: 48 }} />} title="User not found" description="This profile doesn't exist." />
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Banner */}
      <div className="profile-banner">
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 60% 40%, rgba(232,168,48,0.15) 0%, transparent 60%),
                       linear-gradient(135deg, var(--black-3) 0%, var(--black-4) 100%)`
        }} />
      </div>

      {/* Profile info */}
      <div className="profile-info" style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ border: '3px solid var(--black)', borderRadius: '50%', marginTop: -50, position: 'relative' }}>
            <Avatar user={profile} size="xl" />
            {isOwn && (
              <div className="pulse-dot" style={{ position: 'absolute', bottom: 6, right: 6 }} />
            )}
          </div>
          <div style={{ paddingBottom: 6 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 2 }}>{profile.fullName}</h2>
            <div style={{ color: 'var(--gray-3)', fontSize: 14 }}>@{profile.userName}</div>
          </div>
        </div>

        <div style={{ paddingBottom: 6 }}>
          {isOwn ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(true)}>
              <Icons.Edit style={{ width: 15, height: 15 }} /> Edit Profile
            </button>
          ) : currentUser && (
            <button
              className={`btn btn-sm btn-follow ${following ? 'following' : 'btn-primary'}`}
              onClick={handleFollow}
            >
              {following ? (
                <><Icons.Check style={{ width: 14, height: 14 }} /> Following</>
              ) : (
                <><Icons.UserPlus style={{ width: 14, height: 14 }} /> Follow</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bio */}
      <div style={{ padding: '0 24px 20px' }}>
        {profile.bio && (
          <p style={{ fontSize: 14.5, color: 'var(--gray-4)', marginBottom: 12, lineHeight: 1.6 }}>{profile.bio}</p>
        )}
        <div style={{ display: 'flex', gap: 8, color: 'var(--gray-3)', fontSize: 12 }}>
          <span><Icons.Bell style={{ width: 13, height: 13, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
        {[
          { label: 'Posts', value: profile.postsCount || posts.length },
          { label: 'Followers', value: profile.followersCount },
          { label: 'Following', value: profile.followingCount },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="divider" style={{ margin: '0 0 20px' }} />

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 24px', gap: 4, marginBottom: 20 }}>
        {['posts'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ padding: '0 24px 40px' }}>
        {postsLoading ? (
          <div className="stagger">{Array.from({ length: 3 }).map((_, i) => <SkeletonPost key={i} />)}</div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Icons.Image style={{ width: 48, height: 48 }} />}
            title="No posts yet"
            description={isOwn ? "Share your first post!" : `@${username} hasn't posted yet.`}
          />
        ) : (
          <div className="feed-posts stagger">
            {posts.map(p => <PostCard key={p.id} post={p} onDelete={(id) => setPosts(ps => ps.filter(x => x.id !== id))} />)}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditModal}
        profile={profile}
        onClose={() => setShowEditModal(false)}
        onUpdated={(data) => {
          setProfile(p => ({ ...p, ...data }));
          updateLocalUser(data);
        }}
      />
    </div>
  );
}

function EditProfileModal({ open, profile, onClose, onUpdated }) {
  const [form, setForm] = useState({ fullName: profile.fullName, bio: profile.bio || '', profilePictureUrl: profile.profilePictureUrl || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await usersAPI.updateProfile(form);
      onUpdated(form);
      toast.success('Profile updated!', { className: 'toast-custom' });
      onClose();
    } catch {
      toast.error('Failed to update profile', { className: 'toast-custom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input className="form-control" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Bio</label>
        <textarea className="form-control" rows={3} placeholder="Tell the world about yourself..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Profile Picture URL</label>
        <input className="form-control" placeholder="https://..." value={form.profilePictureUrl} onChange={e => setForm(f => ({ ...f, profilePictureUrl: e.target.value }))} />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════
//  EXPLORE PAGE
// ════════════════════════════════════════════
export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('posts');
  const [following, setFollowing] = useState({});
  const { user: currentUser } = useAuth();

  const search = useCallback(async (q) => {
    setLoading(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        usersAPI.search({ search: q, page: 1, pageSize: 10 }),
        postsAPI.getAll({ search: q, page: 1, pageSize: 20 }),
      ]);
      setUsers((usersRes.data.data.items || []).filter(u => u.id !== currentUser?.id));
      setPosts(postsRes.data.data.items || []);
    } catch {
      toast.error('Search failed', { className: 'toast-custom' });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { search(query); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    search(query);
  };

  const handleFollow = async (u) => {
    setFollowing(f => ({ ...f, [u.id]: !f[u.id] }));
    try {
      await usersAPI.toggleFollow(u.id);
    } catch {
      setFollowing(f => ({ ...f, [u.id]: !f[u.id] }));
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 6, color: 'var(--white)' }}>
          Explore
        </h2>
        <p style={{ color: 'var(--gray-3)', fontSize: 14 }}>Discover people and stories</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div className="input-wrapper" style={{ flex: 1 }}>
          <Icons.Search className="input-icon" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--gray-2)' }} />
          <input
            className="form-control"
            placeholder="Search people, topics..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 44, borderRadius: 'var(--radius-full)' }}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Search'}
        </button>
      </form>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['posts', 'people'].map(t => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t === 'posts' ? `Posts (${posts.length})` : `People (${users.length})`}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="stagger">{Array.from({ length: 4 }).map((_, i) => <SkeletonPost key={i} />)}</div>
      ) : tab === 'posts' ? (
        posts.length === 0 ? (
          <EmptyState
            icon={<Icons.Search style={{ width: 48, height: 48 }} />}
            title="No posts found"
            description={query ? `No posts match "${query}"` : "Start searching for posts!"}
          />
        ) : (
          <div className="feed-posts stagger">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )
      ) : (
        users.length === 0 ? (
          <EmptyState
            icon={<Icons.User style={{ width: 48, height: 48 }} />}
            title="No users found"
            description={query ? `No users match "${query}"` : "Start searching for people!"}
          />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map(u => (
              <div key={u.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Link to={`/profile/${u.userName}`}><Avatar user={u} size="md" /></Link>
                  <div>
                    <Link to={`/profile/${u.userName}`} style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--gray-5)', textDecoration: 'none' }}>{u.fullName}</Link>
                    <div style={{ fontSize: 12.5, color: 'var(--gray-3)' }}>@{u.userName}</div>
                  </div>
                </div>
                {currentUser && currentUser.id !== u.id && (
                  <button
                    className={`btn btn-sm btn-follow ${following[u.id] ? 'following' : 'btn-ghost'}`}
                    onClick={() => handleFollow(u)}
                  >
                    {following[u.id] ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ════════════════════════════════════════════
//  SETTINGS PAGE
// ════════════════════════════════════════════
export function SettingsPage() {
  const { user, logout, updateLocalUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', bio: '' });
  const [loading, setLoading] = useState(false);
  const navigate = (() => { try { return require('react-router-dom').useNavigate(); } catch { return () => {}; } })();

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersAPI.updateProfile(form);
      updateLocalUser({ fullName: form.fullName });
      toast.success('Settings saved!', { className: 'toast-custom' });
    } catch {
      toast.error('Failed to save settings', { className: 'toast-custom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 600, margin: '0 auto', padding: 28 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 6, color: 'var(--white)' }}>Settings</h2>
      <p style={{ color: 'var(--gray-3)', fontSize: 14, marginBottom: 28 }}>Manage your account preferences</p>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Profile Information</h3>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-control" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Write something about yourself..." />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Save Changes'}
        </button>
      </div>

      <div className="card" style={{ padding: 24, borderColor: 'rgba(232,93,117,0.1)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 8, color: 'var(--rose)' }}>Danger Zone</h3>
        <p style={{ fontSize: 13.5, color: 'var(--gray-3)', marginBottom: 16 }}>Sign out of your account on this device.</p>
        <button className="btn btn-danger btn-sm" onClick={async () => { await logout(); navigate('/login'); }}>
          <Icons.LogOut style={{ width: 14, height: 14 }} /> Sign Out
        </button>
      </div>
    </div>
  );
}
