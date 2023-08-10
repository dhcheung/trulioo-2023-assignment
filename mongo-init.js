db = new Mongo().getDB("loginservice");
db.createCollection("users")
db.createCollection('sessions');

db.createUser(
    {
        user: "loginservice",
        pwd: "TpqrtxpQVCnAaNzSfX4eYWqC",
        roles: [
            {
                role: "readWrite",
                db: "loginservice"
            }
        ]
    }
);
