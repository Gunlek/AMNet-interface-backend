INSERT INTO users (
    user_name,
    user_firstname,
    user_lastname,
    user_email,
    user_phone,
    user_password,
    user_bucque,
    user_fams,
    user_proms,
    user_campus,
    user_pay_status,
    user_notification,
    user_rank
)
VALUES (
    "dev",
    "dev firstname",
    "dev lastname",
    "dev@dev.com",
    "0000000000",
    bcrypt("password"),
    "dev bucque",
    "58",
    "218",
    "li",
    "0",
    "1",
    "admin"
)