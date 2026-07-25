import { useState } from "react";
import { USERS, type User } from "./users";

// Sign-in gate. Purely client-side; no password/auth. Signing in as a name
// that isn't in USERS still works but shows an empty library — enough to
// establish per-user state locally.
export function SignIn({ onSignIn }: { onSignIn: (user: User) => void }) {
  const [name, setName] = useState("");

  function submitCustom(e: React.FormEvent) {
    e.preventDefault();
    const id = name.trim().toLowerCase();
    if (!id) return;
    onSignIn({ id, displayName: name.trim(), articleIds: [] });
  }

  return (
    <div className="signin">
      <div className="signin-card">
        <div className="signin-brand">
          <span className="logo">読</span>
          <div>
            <h1>Yomu</h1>
            <p>日本語リーダー</p>
          </div>
        </div>

        <p className="signin-lead">ユーザーを選んでサインイン</p>

        <div className="signin-users">
          {USERS.map((u) => (
            <button key={u.id} className="signin-user" onClick={() => onSignIn(u)}>
              <span className="su-avatar">{u.displayName.slice(0, 1)}</span>
              <span className="su-name">{u.displayName}</span>
              <span className="su-meta">{u.articleIds.length} 記事</span>
            </button>
          ))}
        </div>

        <div className="signin-divider">
          <span>または</span>
        </div>

        <form className="signin-custom" onSubmit={submitCustom}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="新しい名前でサインイン"
            aria-label="ユーザー名"
          />
          <button type="submit" disabled={!name.trim()}>
            開く
          </button>
        </form>

        <p className="signin-note">
          パスワードはありません。名前はこの端末にだけ保存されます。
        </p>
      </div>
    </div>
  );
}
