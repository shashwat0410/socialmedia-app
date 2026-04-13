import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, usersAPI } from '../api/api';
import { PostCard, CreatePostBox } from '../components/posts';
import { Avatar, Icons, SkeletonPost, EmptyState, Spinner } from '../components/common';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function SuggestedUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState({});

  useEffect(() => {
    usersAPI.search({ page: 1, pageSize: 5 }).then(res => {
      setUsers((res.data.data.items || []).filter(u => u.id !== user?.id));
    }).catch(() => {});
  }, [user]);

  const handleFollow = async (u) => {
    setFollowing(f => ({ ...f, [u.id]: !f[u.id] }));
    try {
      await usersAPI.toggleFollow(u.id);
      toast.success(following[u.id] ? `Unfollowed @${u.userName}` : `Following @${u.userName}`, { className: 'toast-custom' });
    } catch {
      setFollowing(f => ({ ...f, [u.id]: !f[u.id] }));
    }
  };

  if (!users.length) return null;

  return (
    <div className="aside-widget">
      <h4>Who to Follow</h4>
      <div className="stagger">
        {users.slice(0, 4).map(u => (
          <div key={u.id} className="suggested-user">
            <div className="suggested-user-info">
              <Link to={`/profile/${u.userName}`}><Avatar user={u} size="sm" /></Link>
              <div>
                <Link to={`/profile/${u.userName}`} className="suggested-user-name" style={{ textDecoration: 'none' }}>{u.fullName}</Link>
                <div className="suggested-user-handle">@{u.userName}</div>
              </div>
            </div>
            <button
              className={`btn btn-sm btn-follow ${following[u.id] ? 'following' : 'btn-ghost'}`}
              onClick={() => handleFollow(u)}
            >
              {following[u.id] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
      <Link to="/explore" style={{ display: 'block', marginTop: 14, fontSize: 13, color: 'var(--amber)', textAlign: 'center' }}>
        Explore more people →
      </Link>
    </div>
  );
}

function TrendingWidget() {
  const trends = [
    { tag: '#WebDevelopment', count: '2.4K posts' },
    { tag: '#ReactJS', count: '1.8K posts' },
    { tag: '#DotNetCore', count: '956 posts' },
    { tag: '#OpenSource', count: '3.1K posts' },
    { tag: '#TechLife', count: '780 posts' },
  ];

  return (
    <div className="aside-widget">
      <h4>Trending</h4>
      {trends.map(t => (
        <div key={t.tag} className="trend-item">
          <div className="trend-tag">{t.tag}</div>
          <div className="trend-count">{t.count}</div>
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState(isAuthenticated ? 'feed' : 'explore');

  const loadPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const fn = feedType === 'feed' && isAuthenticated ? postsAPI.getFeed : postsAPI.getAll;
      const res = await fn({ page: pageNum, pageSize: 10 });
      const data = res.data.data;
      const newPosts = data.items || [];

      setPosts(p => reset || pageNum === 1 ? newPosts : [...p, ...newPosts]);
      setHasMore(data.hasNextPage);
      setPage(pageNum);
    } catch {
      toast.error('Failed to load posts', { className: 'toast-custom' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [feedType, isAuthenticated]);

  useEffect(() => { loadPosts(1, true); }, [loadPosts]);

  const handleNewPost = (post) => setPosts(p => [post, ...p]);
  const handleDeletePost = (id) => setPosts(p => p.filter(x => x.id !== id));

  return (
    <div className="feed-layout page-enter">
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--black-2)', padding: 6, borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {isAuthenticated && (
            <button
              className={`btn btn-sm ${feedType === 'feed' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}
              onClick={() => setFeedType('feed')}
            >
              Following
            </button>
          )}
          <button
            className={`btn btn-sm ${feedType === 'explore' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
            onClick={() => setFeedType('explore')}
          >
            Explore
          </button>
        </div>

        {isAuthenticated && <CreatePostBox onCreated={handleNewPost} />}

        <div className="feed-posts">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonPost key={i} />)
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<Icons.Compass style={{ width: 48, height: 48 }} />}
              title="Nothing here yet"
              description={feedType === 'feed' ? "Follow some people to see their posts in your feed." : "Be the first to post something!"}
            />
          ) : (
            posts.map((post, i) => (
              <div key={post.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <PostCard post={post} onDelete={handleDeletePost} />
              </div>
            ))
          )}
        </div>

        {hasMore && !loading && (
          <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 32 }}>
            <button
              className="btn btn-ghost"
              onClick={() => loadPosts(page + 1)}
              disabled={loadingMore}
            >
              {loadingMore ? <Spinner size="sm" /> : 'Load more posts'}
            </button>
          </div>
        )}
      </div>

      <aside className="feed-aside">
        {isAuthenticated && (
          <div className="aside-widget" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar user={user} size="md" />
              <div>
                <Link to={`/profile/${user?.userName}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-5)', textDecoration: 'none' }}>{user?.fullName}</Link>
                <div style={{ fontSize: 12, color: 'var(--gray-2)' }}>@{user?.userName}</div>
              </div>
            </div>
          </div>
        )}
        <SuggestedUsers />
        <TrendingWidget />
      </aside>
    </div>
  );
}
