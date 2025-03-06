import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import "./UserProfile.css";
import galleryIcon from "../../../images/gallery.png";
import facebookIcon from "../../../images/facebook.png";
import instagramIcon from "../../../images/instagram.png";
import linkedinIcon from "../../../images/linkedin.png";
import { useParams } from "react-router-dom";
import { Box, Heading, Text, Image, VStack, HStack, Divider, Badge } from "@chakra-ui/react";
import { FaThumbsUp, FaComment } from "react-icons/fa"; // Icons for reactions & comments


const UsersProfile = () => {
    const { email } = useParams();
    const currentUser = auth.currentUser;
    const [userData, setUserData] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewPic, setPreviewPic] = useState(null);
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [userPosts, setUserPosts] = useState([]);


    const [profileDetails, setProfileDetails] = useState({
        bio: "",
        skills: "",
        facebook: "",
        instagram: "",
        linkedin: "",
    });

    useEffect(() => {
        if (email) {
            console.log("Fetching data for email:", email);  // Debugging log
            const fetchUserData = async () => {
                const userDocRef = doc(db, "users", email);
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
                } else {
                    console.log("User not found in Firestore.");
                }
            };
            const fetchUserPosts = async () => {
                const postsRef = collection(db, "forumPosts");
                const q = query(postsRef, where("authorEmail", "==", email));

                const querySnapshot = await getDocs(q);

                const postsArray = [];
                for (let docSnap of querySnapshot.docs) {
                    const postData = docSnap.data();

                    // Fetch reactions count
                    const reactionsRef = collection(db, "forumPosts", docSnap.id, "reactions");
                    const reactionsSnap = await getDocs(reactionsRef);
                    postData.reactionsCount = reactionsSnap.size;  // Store reactions count

                    // Fetch comments count
                    const commentsRef = collection(db, "forumPosts", docSnap.id, "comments");
                    const commentsSnap = await getDocs(commentsRef);
                    postData.commentsCount = commentsSnap.size;  // Store comments count

                    postsArray.push({ id: docSnap.id, ...postData });
                }

                setUserPosts(postsArray);
                console.log("Final posts array:", postsArray);
            };
            fetchUserData();
            fetchUserPosts();
        }
    }, [email]);

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
            id: userData?.id || "N/A",
            displayName: userData?.displayName || "N/A",
            semester: userData?.semester || "N/A",
            academicYear: userData?.academicYear || "2023-2024",
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
            {isEditing && (
                <div className="social-slider">
                    <input type="text" placeholder="Facebook URL" value={profileDetails.facebook} onChange={(e) => setProfileDetails({ ...profileDetails, facebook: e.target.value })} />
                    <input type="text" placeholder="Instagram URL" value={profileDetails.instagram} onChange={(e) => setProfileDetails({ ...profileDetails, instagram: e.target.value })} />
                    <input type="text" placeholder="LinkedIn URL" value={profileDetails.linkedin} onChange={(e) => setProfileDetails({ ...profileDetails, linkedin: e.target.value })} />
                </div>
            )}

            <div className="user-profile-container">
                <label className="profile-label">
                    {isEditing && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            disabled={uploading}
                            className="file-input"
                            ref={fileInputRef}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}

                    <div className="profile-img-wrapper">
                        {previewPic ? (
                            <img src={previewPic} alt="Preview" className="profile-img" />
                        ) : userData?.profilePic ? (
                            <img src={userData.profilePic} alt="Profile" className="profile-img" />
                        ) : (
                            <div className="no-profile-pic">No profile picture</div>
                        )}

                        {isEditing && (<img
                            src={galleryIcon}
                            alt="Select Image"
                            className="gallery-icon"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        />)}

                    </div>
                </label>

                <div className="user-info-grid">
                    <div className="info-group">
                        <p><strong>Student ID</strong></p>
                        <p className="highlighted-text">{userData?.id || "N/A"}</p>
                    </div>
                    <div className="info-group">
                        <p><strong>Current AY</strong></p>
                        <p className="highlighted-text">{userData?.academicYear || "2023-2024"}</p>
                    </div>
                    <div className="info-group">
                        <p><strong>Student Name</strong></p>
                        <p className="bold-text">{userData?.displayName || "N/A"}</p>
                    </div>
                    <div className="info-group">
                        <p><strong>Current Semester</strong></p>
                        <p className="bold-text">{userData?.semester || "N/A"}</p>
                    </div>
                </div>
            </div>
            <div className="bio-skills-container">
                {isEditing ? (
                    <>
                        <textarea placeholder="Write a short bio..." value={profileDetails.bio} onChange={(e) => setProfileDetails({ ...profileDetails, bio: e.target.value })} />
                        <input type="text" placeholder="Skills (comma-separated)" value={profileDetails.skills} onChange={(e) => setProfileDetails({ ...profileDetails, skills: e.target.value })} />
                    </>
                ) : (
                    <>
                        <p><strong>Bio:</strong> {userData?.bio || "No bio available"}</p>
                        <p className="skills-heading">
                            <strong>Skills:</strong>
                            <div className="skills-container">
                                {userData?.skills
                                    ? userData.skills.split(",").map((skill, index) => (
                                        <span key={index} className="skill-block">{skill.trim()}</span>
                                    ))
                                    : <span>No skills listed</span>
                                }
                            </div>
                        </p>
                    </>
                )}
            </div>
            <div className="user-posts-container">
                <Heading size="lg" textAlign="center" color="teal.500" mb={6}>
                    User's Forum Posts
                </Heading>

                <VStack spacing={6} align="stretch" width="100%">
                    {userPosts.length === 0 ? (
                        <Text textAlign="center" color="gray.500">
                            No posts available
                        </Text>
                    ) : (
                        userPosts.map((post) => (
                            <Box
                                key={post.id}
                                p={5}
                                borderWidth="1px"
                                borderRadius="lg"
                                bg="white"
                                boxShadow="md"
                                width="100%"
                                maxW="600px"
                                mx="auto"
                            >
                                {/* Post Title */}
                                <Heading size="md" mb={2} color="gray.700">
                                    {post.title}
                                </Heading>

                                {/* Post Content */}
                                <Text mb={4} color="gray.600">
                                    {post.content}
                                </Text>

                                {/* Display Image if Available */}
                                {post.image && (
                                    <Box
                                        mt={2}
                                        borderRadius="md"
                                        overflow="hidden"
                                        display="flex"
                                        justifyContent="center"
                                    >
                                        <Image src={post.image} alt="Post Image" maxH="300px" objectFit="cover" />
                                    </Box>
                                )}

                                <Divider my={4} />

                                {/* Stats: Reactions & Comments */}
                                <HStack justify="space-between" color="gray.500">
                                    <HStack>
                                        <FaThumbsUp />
                                        <Text fontSize="sm">{post.reactionsCount} Reactions</Text>
                                    </HStack>
                                    <HStack>
                                        <FaComment />
                                        <Text fontSize="sm">{post.commentsCount} Comments</Text>
                                    </HStack>
                                </HStack>
                            </Box>
                        ))
                    )}
                </VStack>
            </div>


        </>
    );
};

export default UsersProfile;


