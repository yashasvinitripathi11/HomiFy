import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

// Get all posts based on query filters
export const getPosts = async (req, res) => {
  const { city, type, property, bedroom, minPrice, maxPrice } = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: city || undefined,
        type: type || undefined,
        property: property || undefined,
        bedroom: bedroom ? parseInt(bedroom) : undefined,
        price: {
          gte: minPrice ? parseInt(minPrice) : undefined,
          lte: maxPrice ? parseInt(maxPrice) : undefined,
        },
      },
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getPosts:", err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

// Get single post by ID, include user and postDetail
export const getPost = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies?.token;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: { username: true, avatar: true },
        },
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          return res.status(200).json({ ...post, isSaved: false });
        }

        const saved = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              postId: id,
              userId: payload.id,
            },
          },
        });

        res.status(200).json({ ...post, isSaved: !!saved });
      });
    } else {
      res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.error("Error in getPost:", err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

// Add new post
export const addPost = async (req, res) => {
  const { postData, postDetail } = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...postData,
        userId: tokenUserId,
        postDetail: {
          create: postDetail,
        },
      },
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error in addPost:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// Update post (incomplete implementation)
export const updatePost = async (req, res) => {
  try {
    // Implementation needed
    res.status(200).json({ message: "Update logic not implemented" });
  } catch (err) {
    console.error("Error in updatePost:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

// Delete post by ID
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await prisma.post.delete({ where: { id } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error in deletePost:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
