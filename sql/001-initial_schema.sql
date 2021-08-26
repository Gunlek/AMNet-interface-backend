CREATE TABLE access (
    access_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    access_description VARCHAR(255) NOT NULL,
    access_mac VARCHAR(255) NOT NULL,
    access_user INT NOT NULL,
    access_state VARCHAR(255) NOT NULL
);

CREATE TABLE materials (
    material_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    material_user VARCHAR(255) NOT NULL,
    material_description VARCHAR(255) NOT NULL,
    material_state VARCHAR(255) NOT NULL
);

CREATE TABLE reset_token (
    token_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    token_user INT NOT NULL,
    token_value INT NOT NULL
);

CREATE TABLE settings (
    setting_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    setting_value VARCHAR(255) NOT NULL,
    setting_name VARCHAR(255) NOT NULL,
    setting_type VARCHAR(255) NOT NULL
);

CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    ticket_subject VARCHAR(255) NOT NULL,
    ticket_state INT NOT NULL,
    ticket_user INT NOT NULL
);

CREATE TABLE tickets_discuss (
    discuss_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    discuss_ticket INT NOT NULL,
    discuss_user INT NOT NULL,
    discuss_message VARCHAR(255) NOT NULL,
    discuss_order INT NOT NULL
);

CREATE TABLE users (
    user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    user_firstname VARCHAR(255) NOT NULL,
    user_lastname VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_bucque VARCHAR(255) NOT NULL,
    user_fams VARCHAR(255) NOT NULL,
    user_proms VARCHAR(255) NOT NULL,
    user_campus VARCHAR(255) NOT NULL DEFAULT(" "),
    user_pay_status INT NOT NULL DEFAULT(0),
    user_rank VARCHAR(255) NOT NULL
)