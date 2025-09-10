import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

// Home Route (/, /home)
router.get(["/", "/home"], async (req, res) => {
  try {
    const locals = {
      title: "Home",
      description: "Welcome to the Minimal Blog",
    };

    let perPage = 5;
    let page = req.query.page || 1;

    const data = await Post.find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const count = await Post.countDocuments();
    const totalPages = Math.ceil(count / perPage);
    const nextPage = (parseInt(page) + 1);
    const hasNextPage = nextPage <= totalPages;
    const prevPage = (parseInt(page) - 1);
    const hasPrevPage = prevPage >= 1;

    res.render("index", { locals, data,  current: page, nextPage: hasNextPage ? nextPage : null, prevPage: hasPrevPage ? prevPage : null, currentRoute: "/" });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
});

// Get Single Post
router.get("/post/:id", async (req, res) => {
  try {
   
    let slug = req.params.id;

    const data = await Post.findById(slug);

     const locals = {
      title: data.title,
      description: data.description,
      currentRoute: "/post/" + slug
    };

    res.render("post", { locals, data, currentRoute: "/post/" + slug });
  
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
});

router.post("/search", async (req, res) => {
  const locals = {
    title: "Search",
    description: "Search Results",
  };
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", { locals, data, searchTerm, currentRoute: "/search" });
  } catch (error) {
    console.error("Error searching posts:", error);
  }
});

router.get("/about", (req, res) => {
  const locals = {
    title: "About",
    description: "Learn more about the Minimal Blog",
    currentRoute: "/about"
  };
  res.render("about", { locals, currentRoute: "/about" });
});

router.get("/contact", (req, res) => {
  const locals = {
    title: "Contact",
    description: "Get in touch with us",
    currentRoute: "/contact"
  };
  res.render("contact", { locals, currentRoute: "/contact" });
});

export default router;
