import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Heading,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  Collapse,
  useDisclosure,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Badge,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody
} from "@chakra-ui/react";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  where,
} from "firebase/firestore";
import {
  FaThumbsUp,
  FaHeart,
  FaLaugh,
  FaAngry,
  FaPlus,
  FaComment,
  FaReply,
  FaEllipsisV,
  FaTrash,
  FaFlag,
  FaBell,
  FaPaperPlane,
} from "react-icons/fa";
import forumBG from "../../assets/forumBG.png";

const Forum = () => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { isOpen: isPostFormOpen, onToggle: onTogglePostForm } = useDisclosure();
  const {
    isOpen: isNotificationDrawerOpen,
    onOpen: onOpenNotificationDrawer,
    onClose: onCloseNotificationDrawer,
  } = useDisclosure();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const postsRef = collection(db, "forumPosts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsArray);
    });

    // Fetch notifications for the current user
    if (currentUser) {
      const notificationsRef = collection(db, "users", currentUser.uid, "notifications");
      const notificationsQuery = query(notificationsRef, orderBy("timestamp", "desc"));

      const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsArray);

        // Count unread notifications
        const unreadCount = notificationsArray.filter((notification) => !notification.read).length;
        setUnreadNotifications(unreadCount);
      });

      return () => {
        unsubscribePosts();
        unsubscribeNotifications();
      };
    }

    return () => unsubscribePosts();
  }, [currentUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Stores base64-encoded image data
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageOpen(true);
  };

  const handleTogglePostForm = () => {
    setTitle("");  // ✅ Reset title
    setContent("");  // ✅ Reset content
    setImage(null);  // ✅ Clear image preview

    // ✅ Reset file input manually
    const fileInput = document.getElementById("image-upload-input");
    if (fileInput) {
      fileInput.value = "";
    }

    onTogglePostForm();  // ✅ Toggle the form visibility
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await addDoc(collection(db, "forumPosts"), {
        title,
        content,
        image,  // ✅ Store the base64 image directly in Firestore
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorPhotoURL: currentUser.photoURL || null,
        reports: [],
      });

      // ✅ Reset fields after submission
      setTitle("");
      setContent("");
      setImage(null);

      // ✅ Reset file input manually
      const fileInput = document.getElementById("image-upload-input");
      if (fileInput) {
        fileInput.value = "";
      }

      onTogglePostForm();  // ✅ Close the form
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };



  const handleMarkAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid, "notifications", notificationId), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read: ", error);
    }
  };

  return (
    <Box
      position="relative"
      minH="100vh"
      _before={{
        content: `""`,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `url(${forumBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: -1,
      }}
    >
      <Box
        p={4}
        maxW="1000px"
        mx="auto"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Heading fontSize="2xl" fontWeight="bold" color="teal.500" paddingBottom="60px">
            Welcome {currentUser?.displayName || currentUser?.email || "User"}!
          </Heading>
          <HStack spacing={65}>
            <Button
              onClick={handleTogglePostForm}
              colorScheme="teal"
              variant="ghost"
              textColor="teal"
              size="lg"
              leftIcon={<FaPlus />}
              border="transparent"
            >
              {isPostFormOpen ? "Hide Post Form" : "Create New Post"}
            </Button>

            <IconButton
              icon={<FaBell />}
              aria-label="Notifications"
              onClick={onOpenNotificationDrawer}
              position="relative"
              variant="ghost"
              colorScheme="teal"
              border="transparent"
              width="70px"
              height="70px"
              size="lg"
            >
              {unreadNotifications > 0 && (
                <Badge
                  colorScheme="red"
                  borderRadius="full"
                  position="absolute"
                  top="0"
                  right="0"
                  fontSize="xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </IconButton>
          </HStack>
        </Flex>

        <Drawer placement="right" onClose={onCloseNotificationDrawer} isOpen={isNotificationDrawerOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Notifications</DrawerHeader>
            <DrawerBody>
              <VStack align="stretch" spacing={4}>
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={notification.read ? "white" : "gray.50"}
                    fontWeight={notification.read ? "normal" : "bold"}
                    onClick={() => handleMarkAsRead(notification.id)}
                    cursor="pointer"
                  >
                    <Text>{notification.message}</Text>
                    {notification.type === "reaction" && (
                      <Text fontSize="sm" color="gray.500">
                        Post: {notification.postTitle}
                      </Text>
                    )}
                    {notification.type === "comment" && (
                      <Text fontSize="sm" color="gray.500">
                        Post: {notification.postTitle}
                      </Text>
                    )}
                    {notification.type === "reply" && (
                      <Text fontSize="sm" color="gray.500">
                        Comment: {notification.commentText}
                      </Text>
                    )}
                    {notification.type === "post_deleted" && (
                      <Text fontSize="sm" color="gray.500">
                        Post: {notification.postTitle}
                      </Text>
                    )}
                    <Text fontSize="xs" color="gray.500">
                      {notification.timestamp?.toDate().toLocaleString() || "Just now"}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Collapse in={isPostFormOpen} animateOpacity>
          <Box mb={6} borderWidth="1px" borderRadius="lg" p={4} bg="white" boxShadow="md">
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="lg"
                  variant="outline"
                  required
                />
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  size="lg"
                  variant="outline"
                  required
                  rows={4}
                />
                <Input
                  id="image-upload-input"  // ✅ Add this ID to reset input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  height = "50px"
                />

                {image && (
                  <Box
                    mt={4}
                    width="250px"   // ✅ Set a fixed width
                    height="250px"  // ✅ Set a fixed height
                    borderRadius="8px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="white"  // ✅ Ensure background is white
                    border="1px solid gray"  // ✅ Add a light border
                    overflow="hidden"
                  >
                    <Image
                      src={image}
                      alt="Image Preview"
                      maxWidth="100%"  // ✅ Prevent overflow
                      maxHeight="100%" // ✅ Prevent overflow
                      objectFit="contain" // ✅ Keep aspect ratio, white space if needed
                    />
                  </Box>
                )}


                <Button type="submit" colorScheme="teal" size="medium">
                  Post
                </Button>
              </VStack>
            </form>
          </Box>
        </Collapse>

        <VStack spacing={6} align="stretch">
          {posts.map((post) => (
            <Post key={post.id} post={post} handleImageClick={handleImageClick} />
          ))}
        </VStack>

        <Modal isOpen={isImageOpen} onClose={() => setIsImageOpen(false)} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody display="flex" justifyContent="center">
              <Image
                src={selectedImage}
                alt="Enlarged Image"
                maxWidth="90vw"
                maxHeight="90vh"
                objectFit="contain"
              />
            </ModalBody>
          </ModalContent>
        </Modal>

      </Box>
    </Box>
  );
};

const Post = ({ post, handleImageClick }) => {
  const { currentUser } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const { isOpen: isCommentSectionOpen, onToggle: onToggleCommentSection } = useDisclosure();
  const { isOpen: isCommentFormOpen, onToggle: onToggleCommentForm } = useDisclosure();
  const [reactions, setReactions] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const commentsRef = collection(db, "forumPosts", post.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const commentsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        replies: [],
      }));
      setComments(commentsArray);
    });

    const reactionsRef = collection(db, "forumPosts", post.id, "reactions");
    const unsubscribeReactions = onSnapshot(reactionsRef, (snapshot) => {
      const reactionsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReactions(reactionsArray);
    });

    return () => {
      unsubscribeComments();
      unsubscribeReactions();
    };
  }, [post.id]);

  const handleReaction = async (reactionType) => {
    const reactionRef = collection(db, "forumPosts", post.id, "reactions");
    const userReactionQuery = query(reactionRef, where("uid", "==", currentUser.uid));
    const userReactionSnapshot = await getDocs(userReactionQuery);

    if (!userReactionSnapshot.empty) {
      // If the user has already reacted, update the reaction
      const userReactionDoc = userReactionSnapshot.docs[0];
      if (userReactionDoc.data().reaction === reactionType) {
        // If the same reaction is clicked again, remove the reaction
        await deleteDoc(userReactionDoc.ref);
      } else {
        // Update the reaction type
        await updateDoc(userReactionDoc.ref, {
          reaction: reactionType,
          timestamp: serverTimestamp(),
        });
      }
    } else {
      // If the user hasn't reacted yet, add a new reaction
      await addDoc(reactionRef, {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        reaction: reactionType,
        timestamp: serverTimestamp(),
      });

      // Send notification to the post owner
      if (post.authorId !== currentUser.uid) {
        await addDoc(collection(db, "users", post.authorId, "notifications"), {
          type: "reaction",
          message: `${currentUser.displayName || currentUser.email} reacted with ${reactionType} to your post: "${post.title}".`,
          timestamp: serverTimestamp(),
          read: false,
          postId: post.id,
          postTitle: post.title,
        });
      }
    }
  };

  // Get the current user's reaction
  const currentUserReaction = reactions.find((reaction) => reaction.uid === currentUser.uid)?.reaction;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput) return;
    try {
      await addDoc(collection(db, "forumPosts", post.id, "comments"), {
        comment: commentInput,
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorPhotoURL: currentUser.photoURL || null,
      });

      // Send notification to the post owner
      if (post.authorId !== currentUser.uid) {
        await addDoc(collection(db, "users", post.authorId, "notifications"), {
          type: "comment",
          message: `${currentUser.displayName || currentUser.email} commented on your post: "${post.title}".`,
          timestamp: serverTimestamp(),
          read: false,
          postId: post.id,
          postTitle: post.title,
        });
      }

      setCommentInput("");
      onToggleCommentForm();
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deleteDoc(doc(db, "forumPosts", post.id));
      toast({
        title: "Post deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting post: ", error);
      toast({
        title: "Error deleting post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReportPost = async () => {
    try {
      const postRef = doc(db, "forumPosts", post.id);
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) return;

      const reports = postDoc.data().reports || [];
      if (!reports.includes(currentUser.uid)) {
        await updateDoc(postRef, {
          reports: [...reports, currentUser.uid],
        });

        // Check if 50% of viewers have reported the post
        const viewersCount = postDoc.data().viewers || 1; // Assuming view count is tracked
        if (reports.length + 1 >= viewersCount / 2) {
          await deleteDoc(postRef);
          // Notify the post creator
          await addDoc(collection(db, "users", post.authorId, "notifications"), {
            type: "post_deleted",
            message: `Your post "${post.title}" has been deleted due to mass reports.`,
            timestamp: serverTimestamp(),
            read: false,
            postId: post.id,
            postTitle: post.title,
          });
        }
      }
    } catch (error) {
      console.error("Error reporting post: ", error);
    }
  };

  const ReactionsDisplay = () => (
    <Popover trigger="hover" placement="top">
      <PopoverTrigger>
        <Text fontSize="sm" color="gray.500" cursor="pointer">
          {reactions.length} Reactions
        </Text>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>
          <VStack align="stretch" spacing={2}>
            {reactions.map((reaction) => (
              <HStack key={reaction.id} spacing={2}>
                <Avatar size="xs" src={reaction.photoURL} name={reaction.name} />
                <Text fontSize="sm">
                  {reaction.name}
                  <Text as="span" fontSize="xs" color="gray.500" ml={1}>
                    ({reaction.reaction})
                  </Text>
                </Text>
              </HStack>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );

  const CommentersDisplay = () => (
    <Popover trigger="hover" placement="top">
      <PopoverTrigger>
        <Text fontSize="sm" color="gray.500" cursor="pointer">
          {comments.length} Comments
        </Text>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>
          <VStack align="stretch" spacing={2}>
            {comments.map((comment) => (
              <HStack key={comment.id} spacing={2}>
                <Avatar size="xs" src={comment.authorPhotoURL} name={comment.authorName} />
                <Text fontSize="sm">{comment.authorName}</Text>
              </HStack>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="md">
      <Flex align="center" mb={4}>
        <Avatar size="md" src={post.authorPhotoURL} name={post.authorName} mr={2} />
        <Box>
          <Text fontWeight="bold">{post.authorName}</Text>
          <Text fontSize="sm" color="gray.500">
            {post.createdAt?.toDate().toLocaleString() || "Just now"}
          </Text>
        </Box>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FaEllipsisV />}
            variant="ghost"
            colorScheme="teal"
            ml="auto"
            height="30px"
            width="30px"
            size="small"
            border="transparent"
          />
          <MenuList>
            {post.authorId === currentUser.uid ? (
              <MenuItem
                icon={<FaTrash />}
                onClick={handleDeletePost}
                size="small"
                _hover={{ bg: "teal.100" }}
                border="transparent"
              >
                Delete Post
              </MenuItem>
            ) : (
              <MenuItem
                icon={<FaFlag />}
                onClick={handleReportPost}
                size="small"
                _hover={{ bg: "teal.100" }}
                border="transparent"
              >
                Report Post
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Flex>
      <Heading size="md" mb={2}>{post.title}</Heading>
      <Text mb={4}>{post.content}</Text>
      {post.image && (
        <Box
          mt={2}
          width="400px"
          height="400px"
          borderRadius="8px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          backgroundColor="white"
          border="transparent"
          overflow="hidden"
          mx="auto"
          cursor="pointer" // ✅ Make the image clickable
          onClick={() => handleImageClick(post.image)} // ✅ Open modal when clicked
        >
          <Image
            src={post.image}
            alt="Uploaded Post"
            maxWidth="100%"
            maxHeight="100%"
            objectFit="contain"
          />
        </Box>
      )}


      <HStack spacing={4} mb={4}>
        <HStack spacing={1}>
          <IconButton
            aria-label="Like"
            icon={<FaThumbsUp />}
            border="transparent"
            size="lg"
            variant={currentUserReaction === "like" ? "solid" : "ghost"}
            colorScheme={currentUserReaction === "like" ? "teal" : "gray"}
            onClick={() => handleReaction("like")}
          />
          <IconButton
            aria-label="Love"
            icon={<FaHeart />}
            border="transparent"
            size="lg"
            variant={currentUserReaction === "love" ? "solid" : "ghost"}
            colorScheme={currentUserReaction === "love" ? "red" : "gray"}
            onClick={() => handleReaction("love")}
          />
          <IconButton
            aria-label="Haha"
            icon={<FaLaugh />}
            border="transparent"
            size="lg"
            variant={currentUserReaction === "haha" ? "solid" : "ghost"}
            colorScheme={currentUserReaction === "haha" ? "yellow" : "gray"}
            onClick={() => handleReaction("haha")}
          />
          <IconButton
            aria-label="Angry"
            icon={<FaAngry />}
            border="transparent"
            size="lg"
            variant={currentUserReaction === "angry" ? "solid" : "ghost"}
            colorScheme={currentUserReaction === "angry" ? "orange" : "gray"}
            onClick={() => handleReaction("angry")}
          />
        </HStack>

        <ReactionsDisplay />
        <CommentersDisplay />

        <Button
          onClick={onToggleCommentForm}
          size="lg"
          colorScheme="teal"
          variant="ghost"
          border="transparent"
          leftIcon={<FaComment />}
        >
          {/* {isCommentFormOpen ? "Hide Comment" : "Add Comment"} */}
        </Button>
      </HStack>

      <Collapse in={isCommentFormOpen} animateOpacity>
        <form onSubmit={handleCommentSubmit}>
          <HStack mt={4} align="baseline">
            <Input
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              size="sm"
            />
            <IconButton
              icon={<FaPaperPlane />}
              type="submit"
              size="sm"
              colorScheme="teal"
              aria-label="Submit comment"
              flex="1"
            />
          </HStack>
        </form>
      </Collapse>

      <Button
        onClick={onToggleCommentSection}
        size="sm"
        colorScheme="teal"
        variant="ghost"
        border="transparent"
        mt={2}
      >
        {isCommentSectionOpen ? "Hide Comments" : "Show Comments"}
      </Button>

      <Collapse in={isCommentSectionOpen} animateOpacity>
        <Box mt={4} borderTop="1px" pt={2}>
          {comments.map((comment) => (
            <Comment key={comment.id} postId={post.id} comment={comment} post={post} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

const Comment = ({ postId, comment, post }) => {
  const { currentUser } = useContext(AuthContext);
  const [replies, setReplies] = useState([]);
  const [replyInput, setReplyInput] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const repliesRef = collection(db, "forumPosts", postId, "comments", comment.id, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repliesArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReplies(repliesArray);
    });

    return () => unsubscribe();
  }, [postId, comment.id]);

  const handleReplySubmit = async (replyInput) => {
    if (!replyInput) return;
    try {
      await addDoc(collection(db, "forumPosts", postId, "comments", comment.id, "replies"), {
        comment: replyInput,
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorPhotoURL: currentUser.photoURL || null,
        parentCommentId: comment.id,
        
      });

      // Send notification to the comment writer
      if (comment.authorId !== currentUser.uid) {
        await addDoc(collection(db, "users", comment.authorId, "notifications"), {
          type: "reply",
          message: `${currentUser.displayName || currentUser.email} replied to your comment "${comment.comment}" on the post "${post.title}".`,
          timestamp: serverTimestamp(),
          read: false,
          postId: postId,
          postTitle: post.title,
          commentId: comment.id,
          commentText: comment.comment,
        });
      }

      setReplyInput("");
      setShowReplyForm(false); // Hide the reply form after submission
    } catch (error) {
      console.error("Error adding reply: ", error);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await deleteDoc(doc(db, "forumPosts", postId, "comments", comment.id));
      toast({
        title: "Comment deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting comment: ", error);
      toast({
        title: "Error deleting comment.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteDoc(doc(db, "forumPosts", postId, "comments", comment.id, "replies", replyId));
      toast({
        title: "Reply deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting reply: ", error);
      toast({
        title: "Error deleting reply.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={2} borderWidth="1px" borderRadius="md" mb={2} bg="gray.50">
      <Flex align="center" mb={2}>
        <Avatar size="sm" src={comment.authorPhotoURL} name={comment.authorName} mr={2} />
        <Text fontSize="sm" fontWeight="bold">{comment.authorName}</Text>
        {comment.authorId === currentUser.uid && (
          <IconButton
            icon={<FaTrash />}
            size="xs"
            colorScheme="teal"
            variant="ghost"
            ml="auto"
            border="transparent"
            onClick={handleDeleteComment}
          />
        )}
      </Flex>
      <Text fontSize="sm" ml={10}>{comment.comment}</Text>
      <Text fontSize="xs" color="gray.500" ml={10} mt={1}>
        {comment.createdAt?.toDate().toLocaleString() || "Just now"}
      </Text>

      <HStack ml={10} mt={2} spacing={2}>
        <Button
          size="xs"
          mt={1}
          leftIcon={<FaReply />}
          onClick={() => setShowReplyForm(!showReplyForm)}
          variant="ghost"
          colorScheme="teal"
          border="transparent"
        >
          Reply
        </Button>
      </HStack>

      {showReplyForm && (
        <HStack mt={2} align="baseline">
          <Input
            placeholder="Write a reply..."
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            size="sm"
            required
          />
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => handleReplySubmit(replyInput)}
          >
            Submit
          </Button>
        </HStack>
      )}

      {replies.length > 0 && (
        <Box pl={10} mt={2} borderLeft="2px" borderColor="gray.200">
          {replies.map((reply) => (
            <Box key={reply.id} p={2} borderWidth="1px" borderRadius="md" mb={2} bg="gray.100">
              <Flex align="center" mb={2}>
                <Avatar size="sm" src={reply.authorPhotoURL} name={reply.authorName} mr={2} />
                <Text fontSize="sm" fontWeight="bold">{reply.authorName}</Text>
                {reply.authorId === currentUser.uid && (
                  <IconButton
                    icon={<FaTrash />}
                    size="xs"
                    colorScheme="teal"
                    variant="ghost"
                    ml="auto"
                    border="transparent"
                    onClick={() => handleDeleteReply(reply.id)}
                  />
                )}
              </Flex>
              <Text fontSize="sm" ml={10}>{reply.comment}</Text>
              <Text fontSize="xs" color="gray.500" ml={10} mt={1}>
                {reply.createdAt?.toDate().toLocaleString() || "Just now"}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Forum;
