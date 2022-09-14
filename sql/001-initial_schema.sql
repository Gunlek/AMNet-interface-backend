CREATE TABLE access (
    access_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    access_description VARCHAR(255) NOT NULL,
    access_mac VARCHAR(255) NOT NULL,
    access_user INT NOT NULL,
    access_state VARCHAR(255) NOT NULL,
    declined_reason TEXT NULL
);

CREATE TABLE materials (
    material_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    material_user VARCHAR(255) NOT NULL,
    material_description VARCHAR(255) NOT NULL,
    material_state VARCHAR(255) NOT NULL,
    declined_reason TEXT NULL
);

CREATE TABLE reset_token (
    token_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    token_user INT NOT NULL,
    token_value VARCHAR(255) NOT NULL
);

CREATE TABLE settings (
    setting_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    setting_value TEXT COLLATE UTF8_BIN NOT NULL,
    setting_name VARCHAR(255) NOT NULL,
    setting_type VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    user_firstname VARCHAR(255) NOT NULL,
    user_lastname VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_bucque TEXT COLLATE UTF8_BIN NOT NULL,
    user_fams VARCHAR(255) NOT NULL,
    user_proms VARCHAR(255) NOT NULL,
    user_campus VARCHAR(255) NOT NULL DEFAULT(" "),
    user_pay_status INT NOT NULL DEFAULT(0),
    user_is_gadz INT NOT NULL DEFAULT(0),
    user_notification INT NOT NULL DEFAULT(1),
    gadzflix_id VARCHAR(255) NOT NULL,
    user_rank VARCHAR(255) NOT NULL DEFAULT("user")
);