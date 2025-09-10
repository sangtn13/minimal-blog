import express from "express";
const router = express.Router();
import Post from "../models/Post.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

// Middleware to check authentication and set user in req and res.locals
const checkAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const { userId } = jwt.verify(token, jwtSecret);
      req.userId = userId;
      res.locals.user = { _id: userId }; 
    } catch (e) {
      res.clearCookie('token');
      req.userId = null;
      res.locals.user = null;
    }
  } else {
    req.userId = null;
    res.locals.user = null;
  }
  next();
};

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.session.toast = { type: 'error', message: 'Unauthorized access' };
    return res.redirect('/admin');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    req.session.toast = { type: 'error', message: 'Unauthorized access' };
    return res.redirect('/admin');
  }
};

// Admin Page Route
router.get("/admin", (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Admin Page",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.error("Error loading admin page:", error);
  }
});

// Admin Form Submission Route
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      req.session.toast = { type: 'error', message: 'Invalid credentials' };
      return res.redirect("/admin");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      req.session.toast = { type: 'error', message: 'Invalid credentials' };
      return res.redirect("/admin");
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error processing admin form:", error);
  }
});

// Dashboard Route
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Admin Page",
    };

    const data = await Post.find().lean();
    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (error) {
    console.error("Error loading admin page:", error);
  }
});

// Add Post Page Route
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Add New Post",
        };

        res.render('admin/add-post', { locals, layout: adminLayout });
    } catch (error) {
        console.error('Error loading add post page:', error);
    }
});

// Add Post Route
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const { title, body } = req.body;
        const newPost = new Post({ title, body });
        await newPost.save();
        req.session.toast = { type: 'success', message: 'Post added successfully' };
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error adding post:', error);
        req.session.toast = { type: 'error', message: 'Error adding post' };
        res.redirect('/dashboard');
    }
});

// Edit Post Page Route
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).lean();
        if (!post) {
          req.session.toast = { type: 'error', message: 'Post not found' };
          return res.redirect('/dashboard');
        }
        const locals = {

            title: 'Edit Post',
            description: 'Edit Post',
        };
        res.render('admin/edit-post', { locals, data: post, layout: adminLayout });
    } catch (error) {
        console.error('Error loading edit post page:', error);
        req.session.toast = { type: 'error', message: 'Error loading edit post page' };
        res.redirect('/dashboard');
    }
});

// Edit Post Route
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, body } = req.body;
        const post = await Post.findById(postId);
        if (!post) {
            req.session.toast = { type: 'error', message: 'Post not found' };
            return res.redirect('/dashboard');
        }
        post.title = title;
        post.body = body;
        post.updatedAt = Date.now();
        await post.save();
        req.session.toast = { type: 'success', message: 'Post updated successfully' };
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating post:', error);
        req.session.toast = { type: 'error', message: 'Error updating post' };
        res.redirect('/dashboard');
    }
});

// Delete Post Route
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            req.session.toast = { type: 'error', message: 'Post not found' };
            return res.redirect('/dashboard');
        }
        await Post.deleteOne({ _id: postId });
        req.session.toast = { type: 'success', message: 'Post deleted successfully' }; 
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error deleting post:', error);
        req.session.toast = { type: 'error', message: 'Error deleting post' };
        res.redirect('/dashboard');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// router.post('/register', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10);

//         try {
//             const user = new User({ username, password: hashedPassword });
//             await user.save();
//             res.status(201).json({ message: 'User registered successfully', user });
//         } catch (error) {
//             if (error.code === 11000) {
//                 res.status(409).json({ message: 'Username already exists' });
//             }
//             res.status(500).json({ message: 'Error registering user' });
//         }

//     } catch (error) {
//         console.error('Error registering user:', error);
//         res.status(500).json({ message: 'Error registering user' });
//     }
// });

export { checkAuth };
export default router;
