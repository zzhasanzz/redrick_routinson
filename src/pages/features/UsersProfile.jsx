import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./UserProfile.css";
import galleryIcon from "../../../images/gallery.png";
import facebookIcon from "../../../images/facebook.png";
import instagramIcon from "../../../images/instagram.png";
import linkedinIcon from "../../../images/linkedin.png";

const UsersProfile = () => {
    const currentUser = auth.currentUser;
    const [userData, setUserData] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewPic, setPreviewPic] = useState(null);
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);

    const [profileDetails, setProfileDetails] = useState({
        bio: "",
        skills: "",
        facebook: "",
        instagram: "",
        linkedin: "",
    });

    useEffect(() => {
        if (currentUser) {
            const fetchUserData = async () => {
                const userDocRef = doc(db, "users", currentUser.email);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                    const data = userSnapshot.data();
                    setUserData(data);
                    setProfileDetails({
                        bio: data.bio || "",
                        skills: data.skills || "",
                        facebook: data.facebook || "",
                        instagram: data.instagram || "",
                        linkedin: data.linkedin || "",
                    });
                }
            };
            fetchUserData();
        }
    }, [currentUser]);

    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                resizeImage(reader.result, 200, 200, (resizedImage) => {
                    setPreviewPic(resizedImage);
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const resizeImage = (base64Str, maxWidth, maxHeight, callback) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                const scaleFactor = Math.min(maxWidth / width, maxHeight / height);
                width *= scaleFactor;
                height *= scaleFactor;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL("image/jpeg", 0.7));
        };
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setUploading(true);

        const updatedData = {
            profilePic: previewPic || userData.profilePic,
            bio: profileDetails.bio,
            skills: profileDetails.skills,
            facebook: profileDetails.facebook,
            instagram: profileDetails.instagram,
            linkedin: profileDetails.linkedin,
        };

        await updateDoc(doc(db, "users", currentUser.email), updatedData);
        setUserData(updatedData);
        setPreviewPic(null);
        setUploading(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setPreviewPic(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setProfileDetails({
            bio: userData?.bio || "",
            skills: userData?.skills || "",
            facebook: userData?.facebook || "",
            instagram: userData?.instagram || "",
            linkedin: userData?.linkedin || "",
        });
        setIsEditing(false);
    };

    const toggleEditing = () => {
        setIsEditing((prev) => !prev);
    };

    const defaultLinks = {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
    };

    return (
        <>
            {/* Floating Social Media Icons */}
            <div className="social-icons">
                <a href={userData?.facebook || defaultLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <img src={facebookIcon} alt="Facebook" />
                </a>
                <a href={userData?.instagram || defaultLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <img src={instagramIcon} alt="Instagram" />
                </a>
                <a href={userData?.linkedin || defaultLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <img src={linkedinIcon} alt="LinkedIn" />
                </a>
            </div>

            {/* Social Media Links Input Box (Only in Edit Mode) */}
            {isEditing && (
                <div className="social-slider">
                    <input type="text" placeholder="Facebook URL" value={profileDetails.facebook} onChange={(e) => setProfileDetails({ ...profileDetails, facebook: e.target.value })} />
                    <input type="text" placeholder="Instagram URL" value={profileDetails.instagram} onChange={(e) => setProfileDetails({ ...profileDetails, instagram: e.target.value })} />
                    <input type="text" placeholder="LinkedIn URL" value={profileDetails.linkedin} onChange={(e) => setProfileDetails({ ...profileDetails, linkedin: e.target.value })} />
                </div>
            )}

            <div className="user-profile">
                {/* <h2>User Profile</h2> */}

                {/* Profile Picture Section */}
                <div className="profile-pic-container">
                    <label className="profile-label">
                        {isEditing && <input type="file" accept="image/*" onChange={handleProfilePicChange} disabled={uploading} className="file-input" ref={fileInputRef} />}
                        <div className="profile-img-wrapper">
                            {previewPic ? <img src={previewPic} alt="Preview" className="profile-img" /> : userData?.profilePic ? <img src={userData.profilePic} alt="Profile" className="profile-img" /> : <div className="no-profile-pic">No profile picture</div>}
                            {isEditing && <img src={galleryIcon} alt="Gallery Icon" className="gallery-icon" />}
                        </div>
                    </label>
                </div>

                {/* User Information Section */}
                <div className="user-info">
                    <p><strong>Name:</strong> {userData?.displayName || "N/A"}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    <p><strong>Department:</strong> {userData?.department || "N/A"}</p>
                    {/* <p><strong>Role:</strong> {userData?.role || "N/A"}</p> */}
                    <p><strong>Semester:</strong> {userData?.semester || "N/A"}</p>

                    {/* Bio & Skills Section */}
                    <div className="bio-skills-container">
                        {isEditing ? (
                            <>
                                <textarea placeholder="Write a short bio..." value={profileDetails.bio} onChange={(e) => setProfileDetails({ ...profileDetails, bio: e.target.value })} />
                                <input type="text" placeholder="Skills (comma-separated)" value={profileDetails.skills} onChange={(e) => setProfileDetails({ ...profileDetails, skills: e.target.value })} />
                            </>
                        ) : (
                            <>
                                <p><strong>Bio:</strong> {userData?.bio || "No bio available"}</p>
                                <p><strong>Skills:</strong> {userData?.skills || "No skills listed"}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Save & Edit Buttons */}
            <div className="btn-group">
                {isEditing && <button onClick={handleSave} disabled={uploading} className="save-btn">Save</button>}
                <button onClick={toggleEditing} className="edit-btn">{isEditing ? "Cancel" : "Edit"}</button>
            </div>
        </>
    );
};

export default UsersProfile;
