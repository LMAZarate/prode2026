-- ============================================================
-- PRODE MUNDIAL 2026 — Partidos
-- Grupos A-L (48 partidos) + Eliminatorias (56 partidos = 32+16+8+4+2+1+1)
-- Equipos definitivos a confirmar; se usan clasificados tentativos.
-- ============================================================

insert into public.matches (phase, group_name, match_number, home_team, away_team, home_flag, away_flag, venue, city, match_date) values

-- GRUPO A
('group','A',1,'México','Polonia','🇲🇽','🇵🇱','Estadio Azteca','Ciudad de México','2026-06-11 18:00:00+00'),
('group','A',2,'Arabia Saudita','Argentina','🇸🇦','🇦🇷','AT&T Stadium','Dallas','2026-06-12 00:00:00+00'),
('group','A',3,'Polonia','Arabia Saudita','🇵🇱','🇸🇦','SoFi Stadium','Los Ángeles','2026-06-16 15:00:00+00'),
('group','A',4,'Argentina','México','🇦🇷','🇲🇽','MetLife Stadium','Nueva York','2026-06-16 21:00:00+00'),
('group','A',5,'Polonia','Argentina','🇵🇱','🇦🇷','Hard Rock Stadium','Miami','2026-06-21 20:00:00+00'),
('group','A',6,'México','Arabia Saudita','🇲🇽','🇸🇦','Estadio Azteca','Ciudad de México','2026-06-21 20:00:00+00'),

-- GRUPO B
('group','B',7,'Estados Unidos','Gales','🇺🇸','🏴󠁧󠁢󠁷󠁬󠁳󠁿','Rose Bowl','Los Ángeles','2026-06-12 18:00:00+00'),
('group','B',8,'Inglaterra','Irán','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇮🇷','MetLife Stadium','Nueva York','2026-06-13 15:00:00+00'),
('group','B',9,'Gales','Irán','🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇮🇷','BC Place','Vancouver','2026-06-17 15:00:00+00'),
('group','B',10,'Estados Unidos','Inglaterra','🇺🇸','🏴󠁧󠁢󠁥󠁮󠁧󠁿','AT&T Stadium','Dallas','2026-06-17 21:00:00+00'),
('group','B',11,'Gales','Inglaterra','🏴󠁧󠁢󠁷󠁬󠁳󠁿','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Levi''s Stadium','San José','2026-06-22 20:00:00+00'),
('group','B',12,'Irán','Estados Unidos','🇮🇷','🇺🇸','SoFi Stadium','Los Ángeles','2026-06-22 20:00:00+00'),

-- GRUPO C
('group','C',13,'Senegal','Países Bajos','🇸🇳','🇳🇱','Estadio Akron','Guadalajara','2026-06-13 18:00:00+00'),
('group','C',14,'Ecuador','Qatar','🇪🇨','🇶🇦','MetLife Stadium','Nueva York','2026-06-14 15:00:00+00'),
('group','C',15,'Países Bajos','Ecuador','🇳🇱','🇪🇨','Levi''s Stadium','San José','2026-06-18 15:00:00+00'),
('group','C',16,'Qatar','Senegal','🇶🇦','🇸🇳','Hard Rock Stadium','Miami','2026-06-18 21:00:00+00'),
('group','C',17,'Países Bajos','Qatar','🇳🇱','🇶🇦','AT&T Stadium','Dallas','2026-06-23 20:00:00+00'),
('group','C',18,'Ecuador','Senegal','🇪🇨','🇸🇳','Rose Bowl','Los Ángeles','2026-06-23 20:00:00+00'),

-- GRUPO D
('group','D',19,'Francia','Australia','🇫🇷','🇦🇺','MetLife Stadium','Nueva York','2026-06-14 18:00:00+00'),
('group','D',20,'Dinamarca','Túnez','🇩🇰','🇹🇳','BC Place','Vancouver','2026-06-15 15:00:00+00'),
('group','D',21,'Australia','Dinamarca','🇦🇺','🇩🇰','SoFi Stadium','Los Ángeles','2026-06-19 15:00:00+00'),
('group','D',22,'Francia','Túnez','🇫🇷','🇹🇳','Estadio Azteca','Ciudad de México','2026-06-19 21:00:00+00'),
('group','D',23,'Australia','Francia','🇦🇺','🇫🇷','AT&T Stadium','Dallas','2026-06-24 20:00:00+00'),
('group','D',24,'Túnez','Dinamarca','🇹🇳','🇩🇰','Hard Rock Stadium','Miami','2026-06-24 20:00:00+00'),

-- GRUPO E
('group','E',25,'Japón','Costa Rica','🇯🇵','🇨🇷','Levi''s Stadium','San José','2026-06-15 18:00:00+00'),
('group','E',26,'Alemania','España','🇩🇪','🇪🇸','MetLife Stadium','Nueva York','2026-06-16 00:00:00+00'),
('group','E',27,'Costa Rica','Alemania','🇨🇷','🇩🇪','Rose Bowl','Los Ángeles','2026-06-20 15:00:00+00'),
('group','E',28,'España','Japón','🇪🇸','🇯🇵','BC Place','Vancouver','2026-06-20 21:00:00+00'),
('group','E',29,'Costa Rica','España','🇨🇷','🇪🇸','Estadio Akron','Guadalajara','2026-06-25 20:00:00+00'),
('group','E',30,'Alemania','Japón','🇩🇪','🇯🇵','SoFi Stadium','Los Ángeles','2026-06-25 20:00:00+00'),

-- GRUPO F
('group','F',31,'Marruecos','Croacia','🇲🇦','🇭🇷','AT&T Stadium','Dallas','2026-06-16 15:00:00+00'),
('group','F',32,'Bélgica','Canadá','🇧🇪','🇨🇦','BC Place','Vancouver','2026-06-16 21:00:00+00'),
('group','F',33,'Croacia','Bélgica','🇭🇷','🇧🇪','Levi''s Stadium','San José','2026-06-21 15:00:00+00'),
('group','F',34,'Canadá','Marruecos','🇨🇦','🇲🇦','Hard Rock Stadium','Miami','2026-06-21 21:00:00+00'),
('group','F',35,'Croacia','Canadá','🇭🇷','🇨🇦','MetLife Stadium','Nueva York','2026-06-26 20:00:00+00'),
('group','F',36,'Marruecos','Bélgica','🇲🇦','🇧🇪','Estadio Azteca','Ciudad de México','2026-06-26 20:00:00+00'),

-- GRUPO G
('group','G',37,'Brasil','Serbia','🇧🇷','🇷🇸','Rose Bowl','Los Ángeles','2026-06-17 18:00:00+00'),
('group','G',38,'Suiza','Camerún','🇨🇭','🇨🇲','AT&T Stadium','Dallas','2026-06-18 00:00:00+00'),
('group','G',39,'Serbia','Suiza','🇷🇸','🇨🇭','BC Place','Vancouver','2026-06-22 15:00:00+00'),
('group','G',40,'Camerún','Brasil','🇨🇲','🇧🇷','Estadio Akron','Guadalajara','2026-06-22 21:00:00+00'),
('group','G',41,'Serbia','Camerún','🇷🇸','🇨🇲','SoFi Stadium','Los Ángeles','2026-06-27 20:00:00+00'),
('group','G',42,'Brasil','Suiza','🇧🇷','🇨🇭','MetLife Stadium','Nueva York','2026-06-27 20:00:00+00'),

-- GRUPO H
('group','H',43,'Portugal','Ghana','🇵🇹','🇬🇭','Estadio Azteca','Ciudad de México','2026-06-18 18:00:00+00'),
('group','H',44,'Uruguay','Corea del Sur','🇺🇾','🇰🇷','Hard Rock Stadium','Miami','2026-06-19 00:00:00+00'),
('group','H',45,'Ghana','Uruguay','🇬🇭','🇺🇾','Rose Bowl','Los Ángeles','2026-06-23 15:00:00+00'),
('group','H',46,'Corea del Sur','Portugal','🇰🇷','🇵🇹','AT&T Stadium','Dallas','2026-06-23 21:00:00+00'),
('group','H',47,'Ghana','Corea del Sur','🇬🇭','🇰🇷','Levi''s Stadium','San José','2026-06-28 20:00:00+00'),
('group','H',48,'Portugal','Uruguay','🇵🇹','🇺🇾','BC Place','Vancouver','2026-06-28 20:00:00+00'),

-- GRUPO I
('group','I',49,'Colombia','Perú','🇨🇴','🇵🇪','MetLife Stadium','Nueva York','2026-06-19 18:00:00+00'),
('group','I',50,'Argelia','Nigeria','🇩🇿','🇳🇬','Estadio Akron','Guadalajara','2026-06-20 00:00:00+00'),
('group','I',51,'Perú','Argelia','🇵🇪','🇩🇿','SoFi Stadium','Los Ángeles','2026-06-24 15:00:00+00'),
('group','I',52,'Nigeria','Colombia','🇳🇬','🇨🇴','Hard Rock Stadium','Miami','2026-06-24 21:00:00+00'),
('group','I',53,'Perú','Nigeria','🇵🇪','🇳🇬','Rose Bowl','Los Ángeles','2026-06-29 20:00:00+00'),
('group','I',54,'Argelia','Colombia','🇩🇿','🇨🇴','AT&T Stadium','Dallas','2026-06-29 20:00:00+00'),

-- GRUPO J
('group','J',55,'Chile','Irlanda','🇨🇱','🇮🇪','BC Place','Vancouver','2026-06-20 18:00:00+00'),
('group','J',56,'Bélgica','Turquía','🇧🇪','🇹🇷','Levi''s Stadium','San José','2026-06-21 00:00:00+00'),
('group','J',57,'Irlanda','Bélgica','🇮🇪','🇧🇪','MetLife Stadium','Nueva York','2026-06-25 15:00:00+00'),
('group','J',58,'Turquía','Chile','🇹🇷','🇨🇱','Estadio Azteca','Ciudad de México','2026-06-25 21:00:00+00'),
('group','J',59,'Irlanda','Turquía','🇮🇪','🇹🇷','Estadio Akron','Guadalajara','2026-06-30 20:00:00+00'),
('group','J',60,'Bélgica','Chile','🇧🇪','🇨🇱','SoFi Stadium','Los Ángeles','2026-06-30 20:00:00+00'),

-- GRUPO K
('group','K',61,'Egipto','Nueva Zelanda','🇪🇬','🇳🇿','Hard Rock Stadium','Miami','2026-06-21 18:00:00+00'),
('group','K',62,'Portugal','Ghana','🇵🇹','🇬🇭','Rose Bowl','Los Ángeles','2026-06-22 00:00:00+00'),
('group','K',63,'Nueva Zelanda','Portugal','🇳🇿','🇵🇹','BC Place','Vancouver','2026-06-26 15:00:00+00'),
('group','K',64,'Ghana','Egipto','🇬🇭','🇪🇬','AT&T Stadium','Dallas','2026-06-26 21:00:00+00'),
('group','K',65,'Nueva Zelanda','Ghana','🇳🇿','🇬🇭','MetLife Stadium','Nueva York','2026-07-01 20:00:00+00'),
('group','K',66,'Egipto','Portugal','🇪🇬','🇵🇹','Levi''s Stadium','San José','2026-07-01 20:00:00+00'),

-- GRUPO L
('group','L',67,'Australia','Honduras','🇦🇺','🇭🇳','Estadio Akron','Guadalajara','2026-06-22 18:00:00+00'),
('group','L',68,'España','Costa de Marfil','🇪🇸','🇨🇮','SoFi Stadium','Los Ángeles','2026-06-23 00:00:00+00'),
('group','L',69,'Honduras','España','🇭🇳','🇪🇸','Hard Rock Stadium','Miami','2026-06-27 15:00:00+00'),
('group','L',70,'Costa de Marfil','Australia','🇨🇮','🇦🇺','Rose Bowl','Los Ángeles','2026-06-27 21:00:00+00'),
('group','L',71,'Honduras','Costa de Marfil','🇭🇳','🇨🇮','BC Place','Vancouver','2026-07-02 20:00:00+00'),
('group','L',72,'España','Australia','🇪🇸','🇦🇺','AT&T Stadium','Dallas','2026-07-02 20:00:00+00'),

-- RONDA DE 32 (R32) — 32 partidos (ganadores y mejores terceros por definir)
('r32',null,73,'1A','2B','🏆','🏆','MetLife Stadium','Nueva York','2026-07-04 18:00:00+00'),
('r32',null,74,'1C','2D','🏆','🏆','SoFi Stadium','Los Ángeles','2026-07-04 21:00:00+00'),
('r32',null,75,'1E','2F','🏆','🏆','AT&T Stadium','Dallas','2026-07-05 18:00:00+00'),
('r32',null,76,'1G','2H','🏆','🏆','Hard Rock Stadium','Miami','2026-07-05 21:00:00+00'),
('r32',null,77,'1I','2J','🏆','🏆','Rose Bowl','Los Ángeles','2026-07-06 18:00:00+00'),
('r32',null,78,'1K','2L','🏆','🏆','BC Place','Vancouver','2026-07-06 21:00:00+00'),
('r32',null,79,'1B','2A','🏆','🏆','Levi''s Stadium','San José','2026-07-07 18:00:00+00'),
('r32',null,80,'1D','2C','🏆','🏆','Estadio Azteca','Ciudad de México','2026-07-07 21:00:00+00'),
('r32',null,81,'1F','2E','🏆','🏆','Estadio Akron','Guadalajara','2026-07-08 18:00:00+00'),
('r32',null,82,'1H','2G','🏆','🏆','MetLife Stadium','Nueva York','2026-07-08 21:00:00+00'),
('r32',null,83,'1J','2I','🏆','🏆','SoFi Stadium','Los Ángeles','2026-07-09 18:00:00+00'),
('r32',null,84,'1L','2K','🏆','🏆','AT&T Stadium','Dallas','2026-07-09 21:00:00+00'),
('r32',null,85,'3A/B/C/D','3E/F/G/H','🏆','🏆','Hard Rock Stadium','Miami','2026-07-10 18:00:00+00'),
('r32',null,86,'3I/J/K/L','3A/B/E/F','🏆','🏆','Rose Bowl','Los Ángeles','2026-07-10 21:00:00+00'),
('r32',null,87,'3C/D/G/H','3B/C/F/G','🏆','🏆','BC Place','Vancouver','2026-07-11 18:00:00+00'),
('r32',null,88,'3A/D/I/L','3J/K','🏆','🏆','Levi''s Stadium','San José','2026-07-11 21:00:00+00'),

-- OCTAVOS DE FINAL (R16)
('r16',null,89,'G73','G74','🏆','🏆','MetLife Stadium','Nueva York','2026-07-14 18:00:00+00'),
('r16',null,90,'G75','G76','🏆','🏆','SoFi Stadium','Los Ángeles','2026-07-14 21:00:00+00'),
('r16',null,91,'G77','G78','🏆','🏆','AT&T Stadium','Dallas','2026-07-15 18:00:00+00'),
('r16',null,92,'G79','G80','🏆','🏆','Hard Rock Stadium','Miami','2026-07-15 21:00:00+00'),
('r16',null,93,'G81','G82','🏆','🏆','Rose Bowl','Los Ángeles','2026-07-16 18:00:00+00'),
('r16',null,94,'G83','G84','🏆','🏆','BC Place','Vancouver','2026-07-16 21:00:00+00'),
('r16',null,95,'G85','G86','🏆','🏆','Levi''s Stadium','San José','2026-07-17 18:00:00+00'),
('r16',null,96,'G87','G88','🏆','🏆','Estadio Azteca','Ciudad de México','2026-07-17 21:00:00+00'),

-- CUARTOS DE FINAL (QF)
('qf',null,97,'G89','G90','🏆','🏆','MetLife Stadium','Nueva York','2026-07-21 18:00:00+00'),
('qf',null,98,'G91','G92','🏆','🏆','SoFi Stadium','Los Ángeles','2026-07-21 21:00:00+00'),
('qf',null,99,'G93','G94','🏆','🏆','AT&T Stadium','Dallas','2026-07-22 18:00:00+00'),
('qf',null,100,'G95','G96','🏆','🏆','Hard Rock Stadium','Miami','2026-07-22 21:00:00+00'),

-- SEMIFINALES (SF)
('sf',null,101,'G97','G98','🏆','🏆','MetLife Stadium','Nueva York','2026-07-26 20:00:00+00'),
('sf',null,102,'G99','G100','🏆','🏆','SoFi Stadium','Los Ángeles','2026-07-27 20:00:00+00'),

-- TERCER PUESTO
('3rd',null,103,'Perdedor SF1','Perdedor SF2','🏆','🏆','AT&T Stadium','Dallas','2026-07-30 20:00:00+00'),

-- FINAL
('final',null,104,'Ganador SF1','Ganador SF2','🏆','🏆','MetLife Stadium','Nueva York','2026-08-01 20:00:00+00');
