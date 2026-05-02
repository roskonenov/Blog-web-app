import bcrypt from "bcryptjs";

const users = [
    {
        id: 1,
        name: "admin",
        password: bcrypt.hashSync("adminPass", 8)
    },
    {
        id: 2,
        name: "user",
        password: bcrypt.hashSync("userPass", 8)
    }
];

export default users;