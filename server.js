const express = require("express");
const multer = require("multer");
const path = require("path");
const jsonServer = require("json-server");
const cors = require("cors");
const fs = require("fs");

const server = jsonServer.create();
const router = jsonServer.router("db.json");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
server.use("/style", express.static("style/output.css"));
server.use(express.static("public"));
server.use(cors());
server.use(jsonServer.bodyParser);
server.use("/uploads", express.static("uploads"));

server.post("/items", upload.single("cover"), (req, res, next) => {
  const data = {
    ...req.body,
    cover: req.file ? req.file.filename : null,
  };
  req.body = data;
  next();
});

server.put("/items/:id", upload.single("cover"), (req, res, next) => {
  const oldItem = router.db
    .get("items")
    .find({ id: parseInt(req.params.id) })
    .value();

  if (req.file) {
    if (oldItem && oldItem.cover) {
      const oldImagePath = path.join(__dirname, "uploads", oldItem.cover);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error(`Error deleting old file ${oldItem.cover}.`, err);
          }
        });
      }
    }
    req.body.cover = req.file.filename;
  }

  next();
});

server.delete("/items/:id", (req, res, next) => {
  const item = router.db
    .get("items")
    .find({ id: parseInt(req.params.id) })
    .value();

  if (item && item.cover) {
    const filePath = path.join(__dirname, "./uploads", item.cover);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${item.cover}.`, err);
        }
        next(); // proceed to default delete behavior of json-server
      });
    } else {
      console.error(`File ${filePath} does not exist.`);
      next();
    }
  } else {
    next();
  }
});

server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});
