CREATE TABLE acccess (
    access_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    access_description VARCHAR NOT NULL,
    access_mac VARCHAR NOT NULL,
    access_user INT NOT NULL,
    access_state VARCHAR NOT NULL
);

CREATE TABLE materials (
    material_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    material_user VARCHAR NOT NULL,
    material_description VARCHAR NOT NULL,
    material_state VARCHAR NOT NULL
);

CREATE TABLE reset_token (
    token_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    token_user INT NOT NULL,
    token_value INT NOT NULL
);

CREATE TABLE settings (
    setting_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    setting_value VARCHAR NOT NULL,
    setting_name VARCHAR NOT NULL,
    setting_type VARCHAR NOT NULL
);

CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    ticket_subject VARCHAR NOT NULL,
    ticket_state INT NOT NULL,
    ticket_user INT NOT NULL
);

CREATE TABLE tickets_discuss (
    discuss_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    discuss_ticket INT NOT NULL,
    discuss_user INT NOT NULL,
    discuss_message VARCHAR NOT NULL,
    discuss_order INT NOT NULL
);

CREATE TABLE users (
    user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_name VARCHAR NOT NULL,
    user_firstname VARCHAR NOT NULL,
    user_lastname VARCHAR NOT NULL,
    user_email VARCHAR NOT NULL,
    user_phone VARCHAR NOT NULL,
    user_password VARCHAR NOT NULL,
    user_bucque VARCHAR NOT NULL,
    user_fams VARCHAR NOT NULL,
    user_proms VARCHAR NOT NULL,
    user_campus VARCHAR NOT NULL DEFAULT(" "),
    user_pay_status INT NOT NULL DEFAULT(0),
    user_rank VARCHAR NOT NULL
)