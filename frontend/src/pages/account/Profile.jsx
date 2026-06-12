import { useState } from "react";
import api from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user.name, email: user.email });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/users/profile", profile);
      setUser(res.data.user);
      toast("Profile updated");
    } catch (err) { toast(err.userMessage, "error"); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) return toast("New passwords do not match", "error");
    try {
      await api.put("/users/password", pwd);
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password changed");
    } catch (err) { toast(err.userMessage, "error"); }
  };

  return (
    <>
      <div className="card-box">
        <h3>Profile</h3>
        <form className="form-grid" onSubmit={saveProfile}>
          <input required placeholder="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <input type="email" required placeholder="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <div className="full"><button className="btn btn-primary btn-sm">Save changes</button></div>
        </form>
      </div>
      <div className="card-box">
        <h3>Change Password</h3>
        <form className="form-grid" onSubmit={changePassword}>
          <input type="password" required placeholder="Current password" className="full" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
          <input type="password" required minLength={6} placeholder="New password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
          <input type="password" required placeholder="Confirm new password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
          <div className="full"><button className="btn btn-primary btn-sm">Update password</button></div>
        </form>
      </div>
    </>
  );
}
