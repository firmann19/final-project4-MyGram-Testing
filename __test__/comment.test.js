const { sequelize } = require("../models");
const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../helpers/jwt");

let token = "";
let wrongToken = "token salah";

let photoId = "";
let wrongPhotoId = 123;

let commentId = "";

const userData = {
  id: 1,
  email: "firman@gmail.com",
  full_name: "Firman Ramadhan",
  username: "firman19",
  password: "19112001",
  profile_image_url: "http://photofirman.com",
  age: 21,
  phone_number: "081284858",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const photoData = {
  id: 1,
  title: "Photo Mas Firman",
  caption: "Foto  remaja",
  poster_image_url: "http://photomasfirman.com",
  UserId: 1,
};

beforeAll((done) => {
  //register
  request(app)
    .post("/users/register")
    .send(userData)
    .end(function (err, res) {
      if (err) {
        done(err);
      }

      request(app)
        .post("/users/login")
        .send(userData)
        .end(function (err, res) {
          if (err) {
            done(err);
          }
          token = res.body.token;

          request(app)
            .post("/photos")
            .set("token", token)
            .send(photoData)
            .end(function (err, res) {
              if (err) {
                done(err);
              }
              photoId = res.body.id;
              done();
            });
        });
    });
});

describe("POST - success /comments", () => {
  it("should send response with 201 status code", (done) => {
    request(app)
      .post("/comments")
      .set("token", token)
      .send({ comment: "wow that's cool", PhotoId: photoId })
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        commentId = res.body.comment.id;
        expect(res.status).toEqual(201);
        expect(res.body).toHaveProperty("comment");
        expect(res.body.comment).toHaveProperty("id");
        expect(res.body.comment).toHaveProperty("comment");
        expect(res.body.comment).toHaveProperty("UserId");
        expect(res.body.comment).toHaveProperty("PhotoId");
        expect(typeof res.body.comment.id).toEqual("number");
        expect(typeof res.body.comment.UserId).toEqual("number");
        expect(typeof res.body.comment.PhotoId).toEqual("number");

        done();
      });
  });
});

describe("POST - Failed /comments", () => {
  it("should send response with 401 status code", (done) => {
    request(app)
      .post(`/comments`)
      .set("token", wrongToken)
      .send({ comment: "", PhotoId: photoId })
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toEqual("string");

        done();
      });
  });
});

describe("GET - success /comments", () => {
  it("should send response with 200 status code", (done) => {
    request(app)
      .get(`/comments`)
      .set("token", token)
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty("comment");
        expect(Array.isArray(res.body.comment)).toEqual(true);
        expect(res.body.comment[0]).toHaveProperty("Photo");
        expect(res.body.comment[0]).toHaveProperty("User");

        done();
      });
  });
});

describe("GET - Failed /comments", () => {
  it("should send response with 401 status code", (done) => {
    request(app)
      .get(`/comments`)
      .set("token", wrongToken)
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toEqual("string");

        done();
      });
  });
});

describe("PUT - success /comments/:id", () => {
  it("should send response with 200 status code", (done) => {
    request(app)
      .put(`/comments/${commentId}`)
      .set("token", token)
      .send({ comment: "wow that's cool" })
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty("comment");
        expect(res.body.comment).toHaveProperty("id");
        expect(res.body.comment).toHaveProperty("comment");
        expect(res.body.comment).toHaveProperty("UserId");
        expect(res.body.comment).toHaveProperty("PhotoId");
        expect(typeof res.body.comment.id).toEqual("number");
        expect(typeof res.body.comment.UserId).toEqual("number");
        expect(typeof res.body.comment.PhotoId).toEqual("number");

        done();
      });
  });
});

describe("PUT - Failed /comments/:id", () => {
  it("should send response with 404 status code", (done) => {
    request(app)
      .put(`/comments/212`)
      .set("token", token)
      .send({ comment: "wow that's cool" })
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toEqual("string");

        done();
      });
  });
});

describe("DELETE - success /comments/:id", () => {
  it("should send response with 200 status code", (done) => {
    request(app)
      .delete(`/comments/${commentId}`)
      .set("token", token)
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toEqual("string");
        expect(res.body.message).toEqual(
          "Your comment has been successfully deleted"
        );

        done();
      });
  });
});

describe("DELETE - failed-3 /comments/:id", () => {
  it("should send response with 403 status code", (done) => {
    request(app)
      .delete(`/comments/212`)
      .set("token", token)
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toEqual("string");

        done();
      });
  });
});

afterAll((done) => {
  sequelize.queryInterface
    .bulkDelete("Comments", {})
    .then(() => {
      sequelize.queryInterface
        .bulkDelete("Users", {})
        .then(() => {
          return done();
        })
        .catch((err) => {
          done(err);
        });
    })
    .catch((err) => {
      done(err);
    });
});
