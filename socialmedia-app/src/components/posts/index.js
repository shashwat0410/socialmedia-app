import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postsAPI } from '../../api/api';
import { Avatar, Icons, formatTime, Spinner, Modal } from '../common';
import { useAuth } from '../../context/AuthContext';

// ════════════════════════════════════════════
//  POST CARD
// ════════════════════════════════════════════
export function PostCard({ post: initialPost, onDelete }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const isOwner = user?.id === post.author?.id;

  const handleLike = async () => {
    const wasLiked = post.isLikedByCurrentUser;
    setLikeAnim(true);
    setPost(p => ({
      ...p,
      isLikedByCurrentUser: !wasLiked,
      likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1
    }));
    setTimeout(() => setLikeAnim(false), 400);
    try {
      await postsAPI.toggleLike(post.id);
    } catch {
      setPost(p => ({
        ...p,
        isLikedByCurrentUser: wasLiked,
        likesCount: wasLiked ? p.likesCount + 1 : p.likesCount - 1
      }));
    }
  };

  const handleDelete = async () => {
    try {
      await postsAPI.delete(post.id);
      toast.success('Post deleted', { className: 'toast-custom' });
      onDelete?.(post.id);
    } catch {
      toast.error('Failed to delete', { className: 'toast-custom' });
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <article className="post-card">
        <div className="post-header">
          <div className="post-author">
            <Link to={`/profile/${post.author?.userName}`}>
              <Avatar user={post.author} size="md" />
            </Link>
            <div>
              <Link to={`/profile/${post.author?.userName}`} className="post-author-name">{post.author?.fullName}</Link>
              <div className="post-time">@{post.author?.userName} · {formatTime(post.createdAt)}</div>
            </div>
          </div>
          {isOwner && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-icon" style={{ padding: 7 }} onClick={() => setShowEdit(true)}>
                <Icons.Edit style={{ width: 15, height: 15 }} />
              </button>
              <button className="btn-icon" style={{ padding: 7, color: 'var(--rose)' }} onClick={() => setShowDeleteConfirm(true)}>
                <Icons.Trash2 style={{ width: 15, height: 15 }} />
              </button>
            </div>
          )}
        </div>

        <p className="post-content">{post.content}</p>

        {post.imageUrl && (
          <img src={post.imageUrl} alt="Post" className="post-image" loading="lazy" />
        )}

        <div className="post-actions">
          <button
            className={`action-btn ${post.isLikedByCurrentUser ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Icons.Heart
              filled={post.isLikedByCurrentUser}
              className={likeAnim ? 'heart-burst' : ''}
              style={{ width: 17, height: 17 }}
            />
            {post.likesCount > 0 && <span>{post.likesCount}</span>}
          </button>

          <button className="action-btn" onClick={() => setShowComments(v => !v)}>
            <Icons.MessageCircle />
            {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
          </button>

          <button className="action-btn" onClick={() => {
            navigator.clipboard?.writeText(window.location.origin + `/post/${post.id}`);
            toast.success('Link copied!', { className: 'toast-custom' });
          }}>
            <Icons.Share2 />
          </button>
        </div>

        {showComments && (
          <div style={{ marginTop: 16 }}>
            <CommentSection postId={post.id} onCommentAdded={() => setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }))} />
          </div>
        )}
      </article>

      {/* Delete confirm */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Post">
        <p style={{ color: 'var(--gray-4)', marginBottom: 24 }}>
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>

      {/* Edit modal */}
      <EditPostModal
        open={showEdit}
        post={post}
        onClose={() => setShowEdit(false)}
        onUpdated={(updated) => setPost(p => ({ ...p, ...updated }))}
      />
    </>
  );
}

// ── Edit Post Modal ─────────────────────────────────────────
function EditPostModal({ open, post, onClose, onUpdated }) {
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await postsAPI.update(post.id, { content, imageUrl: imageUrl || null });
      onUpdated({ content, imageUrl: imageUrl || null, updatedAt: new Date().toISOString() });
      toast.success('Post updated!', { className: 'toast-custom' });
      onClose();
    } catch {
      toast.error('Failed to update post', { className: 'toast-custom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Post">
      <textarea
        className="form-control"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <input
        className="form-control"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{ marginBottom: 20 }}
      />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading || !content.trim()}>
          {loading ? <Spinner size="sm" /> : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════
//  COMMENT SECTION
// ════════════════════════════════════════════
export function CommentSection({ postId, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    postsAPI.getComments(postId, { page: 1, pageSize: 20 }).then(res => {
      setComments(res.data.data.items || []);
    }).finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await postsAPI.addComment(postId, { content: text });
      setComments(c => [res.data.data, ...c]);
      setText('');
      onCommentAdded?.();
    } catch {
      toast.error('Failed to add comment', { className: 'toast-custom' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
      {user && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <Avatar user={user} size="sm" />
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="form-control"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ flex: 1, padding: '9px 14px', borderRadius: 'var(--radius-full)' }}
            />
            <button className="btn btn-primary btn-sm" disabled={!text.trim() || submitting} type="submit">
              {submitting ? <Spinner size="sm" /> : <Icons.Check />}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><Spinner size="sm" /></div>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--gray-2)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No comments yet. Be first!</p>
      ) : (
        <div className="stagger">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <Avatar user={c.author} size="sm" />
              <div className="comment-content">
                <div className="comment-author">{c.author?.fullName} <span style={{ color: 'var(--gray-2)', fontWeight: 400 }}>@{c.author?.userName}</span></div>
                <div className="comment-text">{c.content}</div>
                <div className="comment-time">{formatTime(c.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
//  CREATE POST BOX
// ════════════════════════════════════════════
export function CreatePostBox({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await postsAPI.create({ content, imageUrl: imageUrl || null });
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      onCreated?.(res.data.data);
      toast.success('Post published!', { className: 'toast-custom' });
    } catch {
      toast.error('Failed to create post', { className: 'toast-custom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compose-box">
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar user={user} size="md" />
        <div style={{ flex: 1 }}>
          <textarea
            className="compose-input"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleSubmit(e);
            }}
          />

          {showImageInput && (
            <input
              className="form-control"
              placeholder="Paste image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ marginBottom: 12, fontSize: 13 }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setShowImageInput(v => !v)}
              style={{ color: showImageInput ? 'var(--amber)' : 'var(--gray-3)' }}
            >
              <Icons.Image />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {content.length > 0 && (
                <span style={{ fontSize: 12, color: content.length > 1800 ? 'var(--rose)' : 'var(--gray-2)' }}>
                  {2000 - content.length}
                </span>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={!content.trim() || loading}
              >
                {loading ? <Spinner size="sm" /> : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
