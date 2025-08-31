-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : amnet-db
-- Généré le : dim. 31 août 2025 à 13:50
-- Version du serveur : 8.0.43
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `amnet_birse`
--

-- --------------------------------------------------------

--
-- Structure de la table `access`
--

CREATE TABLE `access` (
  `access_id` int NOT NULL,
  `access_description` varchar(255) NOT NULL,
  `access_mac` varchar(255) NOT NULL,
  `access_proof` varchar(255) NOT NULL,
  `access_user` int NOT NULL,
  `access_state` varchar(255) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `admin_actions`
--

CREATE TABLE `admin_actions` (
  `id` int NOT NULL,
  `action_type` varchar(255) NOT NULL,
  `action_user` int NOT NULL,
  `action_data` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `documents`
--

CREATE TABLE `documents` (
  `document_id` int NOT NULL,
  `document_title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `document_path` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `documents`
--

INSERT INTO `documents` (`document_id`, `document_title`, `document_path`) VALUES
(1, 'reglement_interieur', '/uploads/reglement_interieur-1635518917684.pdf'),
(2, 'statuts', '/uploads/statuts-1630185492493.pdf');

-- --------------------------------------------------------

--
-- Structure de la table `lydia_transactions`
--

CREATE TABLE `lydia_transactions` (
  `id` int NOT NULL,
  `request_ticket` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `request_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `request_uuid` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `request_amount` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `request_payer_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `materials`
--

CREATE TABLE `materials` (
  `material_id` int NOT NULL,
  `material_user` varchar(255) NOT NULL,
  `material_description` varchar(255) NOT NULL,
  `material_state` varchar(255) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `reset_token`
--

CREATE TABLE `reset_token` (
  `token_id` int NOT NULL,
  `token_user` int NOT NULL,
  `token_value` varchar(256) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `settings`
--

CREATE TABLE `settings` (
  `setting_id` int NOT NULL,
  `setting_value` text NOT NULL,
  `setting_name` varchar(255) NOT NULL,
  `setting_type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `settings`
--

INSERT INTO `settings` (`setting_id`, `setting_value`, `setting_name`, `setting_type`) VALUES
(1, '<h1 style=\"font-size:30px;\">Bienvenue dans l\'AMNet !</h1><br/><br/>Branchez vous en filaire pour accéder au plein potentiel de l\'AMNet pour télécharger et jouer.<br/>Le lien du <a href=https://portail.amnet.fr:8003/index.php?zone=lan_birse>Portail Captif</a> s\'il n\'apparaît pas tout seul.', 'news_message', 'news'),
(3, '5KRIJ4W8PslwRPtktqLxjwfAtJBGSay2pub0pblRzHEkDDrLS0lRC2mmDg', 'api_token', 'api'),
(4, '220', 'active_proms', 'proms'),
(5, '5fd8dd2f8fd3c440503375', 'lydia_token', 'lydia'),
(6, '35', 'lydia_cotiz', 'amount'),
(7, '', 'usins_state', 'usins_state'),
(8, '1', 'guest_access', 'guest_access'),
(9, 'Hard Win\'s;Mac Nhat\'s', 'admin_pseudos', 'names'),
(10, '58;47-102', 'admin_nums', 'nums');

-- --------------------------------------------------------

--
-- Structure de la table `tickets`
--

CREATE TABLE `tickets` (
  `ticket_id` int NOT NULL,
  `ticket_subject` varchar(255) NOT NULL,
  `ticket_state` int NOT NULL DEFAULT '0',
  `ticket_user` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `tickets_discuss`
--

CREATE TABLE `tickets_discuss` (
  `discuss_id` int NOT NULL,
  `discuss_ticket` int NOT NULL,
  `discuss_user` int NOT NULL,
  `discuss_message` varchar(512) NOT NULL,
  `discuss_order` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_firstname` varchar(255) NOT NULL,
  `user_lastname` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_phone` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_bucque` varchar(255) NOT NULL,
  `user_fams` varchar(255) NOT NULL,
  `user_campus` varchar(255) NOT NULL DEFAULT ' ',
  `user_proms` varchar(255) NOT NULL,
  `user_rank` varchar(255) NOT NULL DEFAULT 'user',
  `user_is_gadz` int NOT NULL DEFAULT '0',
  `user_pay_status` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `access`
--
ALTER TABLE `access`
  ADD PRIMARY KEY (`access_id`);

--
-- Index pour la table `admin_actions`
--
ALTER TABLE `admin_actions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`);

--
-- Index pour la table `lydia_transactions`
--
ALTER TABLE `lydia_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`material_id`);

--
-- Index pour la table `reset_token`
--
ALTER TABLE `reset_token`
  ADD PRIMARY KEY (`token_id`);

--
-- Index pour la table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_id`);

--
-- Index pour la table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`ticket_id`);

--
-- Index pour la table `tickets_discuss`
--
ALTER TABLE `tickets_discuss`
  ADD PRIMARY KEY (`discuss_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `access`
--
ALTER TABLE `access`
  MODIFY `access_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT pour la table `admin_actions`
--
ALTER TABLE `admin_actions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=392;

--
-- AUTO_INCREMENT pour la table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `lydia_transactions`
--
ALTER TABLE `lydia_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT pour la table `materials`
--
ALTER TABLE `materials`
  MODIFY `material_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT pour la table `reset_token`
--
ALTER TABLE `reset_token`
  MODIFY `token_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

--
-- AUTO_INCREMENT pour la table `settings`
--
ALTER TABLE `settings`
  MODIFY `setting_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `ticket_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `tickets_discuss`
--
ALTER TABLE `tickets_discuss`
  MODIFY `discuss_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=462;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
