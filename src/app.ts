import * as path from "node:path";

import express, { Request, Response } from "express";
import { engine } from "express-handlebars";

import { configs } from "./configs/config";
import { read, write } from "./fs.service";
import { IUser } from "./interfaces/user.interface";

const app = express();

let errorState = "";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), "static")));
app.set("view engine", ".hbs");
app.engine(".hbs", engine({ defaultLayout: false }));
app.set("views", path.join(process.cwd(), "static"));

app.get("/login", async (req: Request, res: Response) => {
  res.render("login");
});
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes("@")) {
      throw new Error("wrong email");
    }

    const users = await read();
    const user = users.find((user) => user.email === email);
    if (!user || user.password !== password) {
      throw new Error("wrong email or password");
    }

    res.redirect("users");
  } catch (e) {
    res.redirect("/error");
    errorState = e.message;
  }
});

app.get("/register", async (req: Request, res: Response) => {
  res.render("register");
});
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, userName, password } = req.body;
    const age = Number(req.body.age);
    if (!age || !Number.isInteger(age) || age <= 0 || age > 100) {
      throw new Error("wrong age");
    }
    if (!email || !email.includes("@")) {
      throw new Error("wrong email");
    }
    if (!userName || userName.length <= 3) {
      throw new Error("wrong name");
    }
    const users = await read();

    const newUser: IUser = {
      id: users[users.length - 1].id + 1,
      userName,
      email,
      password,
      age,
    };
    users.push(newUser);
    await write(users);

    res.render("login");
  } catch (e) {
    res.redirect("/error");
    errorState = e.message;
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await read();
    res.render("users", { users });
  } catch (e) {
    res.redirect("/error");
    errorState = e.message;
  }
});

app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      throw new Error("wrong ID param");
    }

    const users = await read();
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error("user not found");
    }
    res.render("chosenUser", { user: users[index] });
  } catch (e) {
    res.redirect("/error");
    errorState = e.message;
  }
});
// app.delete("/users/:id", async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//
//     if (!Number.isInteger(id)) {
//       throw new Error("wrong ID param");
//     }
//
//     const users = await read();
//     const index = users.findIndex((user) => user.id === id);
//     if (index === -1) {
//       throw new Error("user not found");
//     }
//     users.splice(index, 1);
//     await write(users);
//
//     res.sendStatus(204);
//   } catch (e) {
//     res.status(400).json(e.message);
//   }
// });
// app.put("/users/:id", async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//     const { email, age, name } = req.body;
//
//     if (!Number.isInteger(id)) {
//       throw new Error("wrong ID param");
//     }
//
//     if (!age || !Number.isInteger(age) || age <= 0 || age > 100) {
//       throw new Error("wrong age");
//     }
//     if (!email || !email.includes("@")) {
//       throw new Error("wrong email");
//     }
//     if (!name || name.length <= 3) {
//       throw new Error("wrong name");
//     }
//
//     const users = await read();
//     const user = users.find((user) => user.id === id);
//     if (!user) {
//       throw new Error("user not found");
//     }
//     user.name = name;
//     user.age = age;
//     user.email = email;
//
//     await write(users);
//
//     res.status(201).json(user);
//   } catch (e) {
//     res.status(400).json(e.message);
//   }
// });

app.get("/error", async (req: Request, res: Response) => {
  res.render("error", { errorState });
});

const PORT = configs.PORT;
app.listen(PORT, () => {
  console.log(`Server has started on PORT ${PORT}`);
});
