-- Script de migración de desarrollo a producción
-- Generado el: 2025-08-27T14:58:52.186Z
-- Total de registros: 123

-- Limpiar datos existentes (CUIDADO: esto eliminará todos los datos actuales)
-- Descomenta las siguientes líneas solo si estás seguro
-- TRUNCATE TABLE pagos CASCADE;
-- TRUNCATE TABLE apartments CASCADE;  
-- TRUNCATE TABLE users CASCADE;
-- TRUNCATE TABLE tasas_cambio CASCADE;
-- DELETE FROM session;

-- ================================================
-- INSERTAR USUARIOS
-- ================================================

INSERT INTO users (
  id, email, first_name, last_name, profile_image_url, 
  primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
  telefono, correo, contrasena, identificacion, tipo_usuario, tipo_identificacion, 
  id_apartamento, created_at, updated_at
) VALUES
  ('4beb4162-5b58-4ad0-a146-7f415933a7a1', NULL, NULL, NULL, NULL, 'Admin', NULL, 'Sistema', NULL, '1234567890', 'admin@condominio.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin001', 'admin', 'cedula', NULL, 'Thu Aug 21 2025 18:46:26 GMT+0000 (Coordinated Universal Time)', 'Thu Aug 21 2025 18:46:26 GMT+0000 (Coordinated Universal Time)'),
  ('fcef8bd2-957d-4716-9a99-f9c958896387', NULL, NULL, NULL, NULL, 'luis', 'eduardo', 'mesa', 'arboleda', '04127375736', 'luis@bluepaperclip.com', '$2b$10$71.M5qi1ON2DWUEuDE2Gt.rWWxAHWeoMi4aaV6uk8IX.LHk4LkGHW', '26272385', 'propietario', 'cedula', 52, 'Thu Aug 21 2025 19:07:42 GMT+0000 (Coordinated Universal Time)', 'Thu Aug 21 2025 20:12:54 GMT+0000 (Coordinated Universal Time)'),
  ('c43cc60b-61a8-440e-b31c-d4f784ad66fe', NULL, NULL, NULL, NULL, 'Carlos', 'adsa', 'Abreu', 'asdssda', '04127375736', 'Carlos@bluepaperclip.com', '$2b$10$uwy2Ir6oQMncOZWqGgL3XetD23WAU131mq9hpFsQCQ2oV6imasYVW', '26212312', 'propietario', 'cedula', 56, 'Thu Aug 21 2025 19:13:37 GMT+0000 (Coordinated Universal Time)', 'Thu Aug 21 2025 19:25:04 GMT+0000 (Coordinated Universal Time)'),
  ('7400b8c5-e856-4c57-a8f9-2b3490cf3f0a', NULL, NULL, NULL, NULL, 'Alem', 'asdsadsa', 'Ruiz', 'asdsasasa', '0412755492', 'alem@bluepaperclip.com', '$2b$10$dnoQrq3Z6lEPS1xDweUNRefMEeazzi2La6sZaXD6VzVc2BHpkSLea', '213212112', 'propietario', 'cedula', 55, 'Thu Aug 21 2025 19:16:11 GMT+0000 (Coordinated Universal Time)', 'Thu Aug 21 2025 20:12:50 GMT+0000 (Coordinated Universal Time)'),
  ('b02d5f30-0796-422b-aa50-84564da69bf4', NULL, NULL, NULL, NULL, 'Mauricio', 'asdas', 'Bernal', 'asdassda', '04121949432', 'mauricio@bluepaperclip.com', '$2b$10$5.eGf.C08TR6FGrCP4wK0eYmDbysr4CUr1KLgUx1b62dYbEy1zK12', '26272388', 'propietario', 'cedula', 58, 'Thu Aug 21 2025 19:28:51 GMT+0000 (Coordinated Universal Time)', 'Thu Aug 21 2025 20:31:44 GMT+0000 (Coordinated Universal Time)'),
  ('60421359-f38e-40de-b9ba-7fd566c1ce71', NULL, NULL, NULL, NULL, 'Cristobal', NULL, 'Valero Vernet', NULL, '041273757362', 'Cristobal@bluepaperclip.com', '$2b$10$1VqSur12j.dz/3PN0D4t8OV1kgXzOhgjOBioVumhNqFel5GLczEZG', '484885', 'propietario', 'cedula', 59, 'Thu Aug 21 2025 20:38:53 GMT+0000 (Coordinated Universal Time)', 'Thu Aug 21 2025 20:41:24 GMT+0000 (Coordinated Universal Time)'),
  ('08a19d38-f214-4fb7-860b-994f051032ab', NULL, NULL, NULL, NULL, 'Pietro', NULL, 'Mazorca', NULL, '489984489', 'Mazorca@bluepaperclip.com', '$2b$10$MMrHvPRSiIvklDlRWTLUbui4uAe8fInIJh9MEkt1RYLiEsjMlehp.', '46546546', 'propietario', 'cedula', 62, 'Tue Aug 26 2025 18:50:47 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:20:33 GMT+0000 (Coordinated Universal Time)'),
  ('53d9a0a2-0055-4f53-b150-b715bfdbf93b', NULL, NULL, NULL, NULL, 'Totomi ', NULL, 'hashimoto', NULL, '45481656', 'totomi@bluepaperclip.com', '$2b$10$xdxyp0HT7o7NVFPQePnuT.S8Lk2BewdYygtV5ZXNsM3v0X.L/x.ZG', '1231221', 'propietario', 'cedula', 60, 'Tue Aug 26 2025 18:51:27 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:52:38 GMT+0000 (Coordinated Universal Time)'),
  ('e630939e-c934-415e-850c-2684c296f88c', NULL, NULL, NULL, NULL, 'Carlos', NULL, 'Bananini', NULL, '0412789562', 'carlos2@bluepaperclip.com', '$2b$10$vPKQlhxctL1FVQZG48Vef.PLRoJAii3A4fZD2Torc6dK07g1fM0d.', '4864845', 'propietario', 'cedula', NULL, 'Tue Aug 26 2025 19:57:26 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:57:26 GMT+0000 (Coordinated Universal Time)'),
  ('1b27f37d-d796-455b-b245-c95f14cf33ca', NULL, NULL, NULL, NULL, 'asdsadsa', NULL, 'asdsadsa', NULL, '21321321', 'sadas@bluepaperclip.com', '$2b$10$1D/E7IgdBD1ODHY8AprbfukRsi6.CQBSA9t7MiVIwsbWOjrEwYjni', '12312321', 'propietario', 'cedula', NULL, 'Tue Aug 26 2025 19:58:15 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:58:15 GMT+0000 (Coordinated Universal Time)'),
  ('a14b1745-00e5-44a9-a6f2-9a7baa799ca5', NULL, NULL, NULL, NULL, 'testttttt', NULL, 'testttttt', NULL, '15664846', 'testttttt@bluepaperclip.com', '$2b$10$9mRVQiV3vuFq4ChhJMnB5e52.IfEuU9LJV2Qqn5MH/Z9ZMMlK7Kt2', '458644685', 'propietario', 'cedula', NULL, 'Tue Aug 26 2025 20:00:50 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 20:00:50 GMT+0000 (Coordinated Universal Time)'),
  ('2026ddf8-67e2-4959-b528-ffe8db779622', NULL, NULL, NULL, NULL, 'testttttt2222222222', NULL, 'testttttt222222222222', NULL, '04127375736', 'testttttt121@bluepaperclip.com', '$2b$10$ozBYlbhhyOi.lZ36TPQmWe4HQAihayo0id5Lr8QRv1DuV51sMVvH.', '26272385123', 'propietario', 'cedula', 64, 'Tue Aug 26 2025 20:03:24 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 20:03:40 GMT+0000 (Coordinated Universal Time)');

-- ================================================
-- INSERTAR APARTAMENTOS
-- ================================================

INSERT INTO apartments (id, piso, numero, alicuota, created_at, updated_at) VALUES
  (52, 1, '01-A', '2.05', 'Thu Aug 21 2025 19:08:42 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:34:36 GMT+0000 (Coordinated Universal Time)'),
  (55, 1, '01-B', '2.05', 'Thu Aug 21 2025 19:24:38 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:34:45 GMT+0000 (Coordinated Universal Time)'),
  (56, 1, '01-C', '2.05', 'Thu Aug 21 2025 19:25:04 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:34:54 GMT+0000 (Coordinated Universal Time)'),
  (59, 1, '01-D', '2.05', 'Thu Aug 21 2025 20:41:23 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:34:59 GMT+0000 (Coordinated Universal Time)'),
  (58, 2, '02-A', '2.05', 'Thu Aug 21 2025 20:31:44 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:35:02 GMT+0000 (Coordinated Universal Time)'),
  (60, 2, '02-B', '2.05', 'Tue Aug 26 2025 16:57:32 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:52:39 GMT+0000 (Coordinated Universal Time)'),
  (61, 2, '02-C', '2.05', 'Tue Aug 26 2025 16:57:58 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:20:29 GMT+0000 (Coordinated Universal Time)'),
  (62, 2, '02-D', '2.05', 'Tue Aug 26 2025 16:58:13 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:20:33 GMT+0000 (Coordinated Universal Time)'),
  (63, 3, '03-A', '2.05', 'Tue Aug 26 2025 18:35:49 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 18:35:49 GMT+0000 (Coordinated Universal Time)'),
  (64, 3, '03-B', '2.05', 'Tue Aug 26 2025 19:24:43 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 20:03:40 GMT+0000 (Coordinated Universal Time)'),
  (65, 3, '03-C', '2.05', 'Tue Aug 26 2025 19:25:56 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:25:56 GMT+0000 (Coordinated Universal Time)'),
  (67, 3, '03-D', '2.05', 'Tue Aug 26 2025 19:27:00 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:27:00 GMT+0000 (Coordinated Universal Time)'),
  (68, 4, '04-A', '2.05', 'Tue Aug 26 2025 19:27:15 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:27:15 GMT+0000 (Coordinated Universal Time)'),
  (69, 4, '04-B', '2.05', 'Tue Aug 26 2025 19:27:37 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:27:37 GMT+0000 (Coordinated Universal Time)'),
  (70, 4, '04-C', '2.05', 'Tue Aug 26 2025 19:27:50 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:27:50 GMT+0000 (Coordinated Universal Time)'),
  (71, 4, '04-D', '2.05', 'Tue Aug 26 2025 19:28:05 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:28:05 GMT+0000 (Coordinated Universal Time)'),
  (72, 5, '05-A', '2.05', 'Tue Aug 26 2025 19:28:23 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:28:23 GMT+0000 (Coordinated Universal Time)'),
  (73, 5, '05-B', '2.05', 'Tue Aug 26 2025 19:28:38 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:28:38 GMT+0000 (Coordinated Universal Time)'),
  (74, 5, '05-C', '2.05', 'Tue Aug 26 2025 19:29:04 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:29:04 GMT+0000 (Coordinated Universal Time)'),
  (76, 5, '05-D', '2.05', 'Tue Aug 26 2025 19:29:47 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:29:47 GMT+0000 (Coordinated Universal Time)'),
  (77, 6, '06-A', '2.05', 'Tue Aug 26 2025 19:30:04 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:30:04 GMT+0000 (Coordinated Universal Time)'),
  (78, 6, '06-B', '2.05', 'Tue Aug 26 2025 19:30:20 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:30:20 GMT+0000 (Coordinated Universal Time)'),
  (79, 6, '06-C', '2.05', 'Tue Aug 26 2025 19:30:36 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:30:36 GMT+0000 (Coordinated Universal Time)'),
  (80, 6, '06-D', '2.05', 'Tue Aug 26 2025 19:30:46 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:30:46 GMT+0000 (Coordinated Universal Time)'),
  (81, 7, '07-A', '2.05', 'Tue Aug 26 2025 19:31:00 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:31:00 GMT+0000 (Coordinated Universal Time)'),
  (82, 7, '07-B', '2.05', 'Tue Aug 26 2025 19:31:11 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:31:11 GMT+0000 (Coordinated Universal Time)'),
  (83, 7, '07-C', '2.05', 'Tue Aug 26 2025 19:31:22 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:31:22 GMT+0000 (Coordinated Universal Time)'),
  (84, 7, '07-D', '2.05', 'Tue Aug 26 2025 19:31:32 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:31:32 GMT+0000 (Coordinated Universal Time)'),
  (85, 8, '08-A', '2.05', 'Tue Aug 26 2025 19:32:16 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:32:16 GMT+0000 (Coordinated Universal Time)'),
  (86, 8, '08-B', '2.05', 'Tue Aug 26 2025 19:32:29 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:32:29 GMT+0000 (Coordinated Universal Time)'),
  (87, 8, '08-C', '2.05', 'Tue Aug 26 2025 19:32:44 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:32:44 GMT+0000 (Coordinated Universal Time)'),
  (88, 8, '08-D', '2.05', 'Tue Aug 26 2025 19:32:53 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:32:53 GMT+0000 (Coordinated Universal Time)'),
  (89, 9, '09-A', '2.05', 'Tue Aug 26 2025 19:33:14 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:33:14 GMT+0000 (Coordinated Universal Time)'),
  (90, 9, '09-B', '2.05', 'Tue Aug 26 2025 19:33:26 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:33:26 GMT+0000 (Coordinated Universal Time)'),
  (91, 9, '09-C', '2.05', 'Tue Aug 26 2025 19:33:40 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:33:40 GMT+0000 (Coordinated Universal Time)'),
  (92, 9, '09-D', '2.05', 'Tue Aug 26 2025 19:33:50 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:33:50 GMT+0000 (Coordinated Universal Time)'),
  (93, 10, '10-A', '2.05', 'Tue Aug 26 2025 19:34:05 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:34:05 GMT+0000 (Coordinated Universal Time)'),
  (94, 10, '10-B', '2.05', 'Tue Aug 26 2025 19:34:20 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:34:20 GMT+0000 (Coordinated Universal Time)'),
  (95, 10, '10-C', '2.05', 'Tue Aug 26 2025 19:34:32 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:34:32 GMT+0000 (Coordinated Universal Time)'),
  (96, 10, '10-D', '2.05', 'Tue Aug 26 2025 19:35:05 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:35:05 GMT+0000 (Coordinated Universal Time)'),
  (97, 11, '11-A', '2.05', 'Tue Aug 26 2025 19:35:30 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:35:30 GMT+0000 (Coordinated Universal Time)'),
  (98, 11, '11-B', '2.05', 'Tue Aug 26 2025 19:35:44 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:35:44 GMT+0000 (Coordinated Universal Time)'),
  (99, 11, '11-C', '2.05', 'Tue Aug 26 2025 19:35:56 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:35:56 GMT+0000 (Coordinated Universal Time)'),
  (100, 11, '11-D', '2.05', 'Tue Aug 26 2025 19:36:19 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:36:19 GMT+0000 (Coordinated Universal Time)'),
  (101, 12, 'PH-A', '2.45', 'Tue Aug 26 2025 19:37:09 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:37:09 GMT+0000 (Coordinated Universal Time)'),
  (102, 12, 'PH-B', '2.45', 'Tue Aug 26 2025 19:37:23 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:37:23 GMT+0000 (Coordinated Universal Time)'),
  (103, 12, 'PH-C', '2.45', 'Tue Aug 26 2025 19:37:33 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:37:33 GMT+0000 (Coordinated Universal Time)'),
  (104, 12, 'PH-D', '2.45', 'Tue Aug 26 2025 19:37:44 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:37:44 GMT+0000 (Coordinated Universal Time)');

-- ================================================
-- INSERTAR PAGOS
-- ================================================

INSERT INTO pagos (
  id, id_usuario, id_apartamento, monto, monto_bs, tasa_cambio, 
  fecha_vencimiento, fecha_pago, estado, metodo_pago, concepto, 
  comprobante_url, fecha_operacion, cedula_rif, tipo_operacion, 
  correo_electronico, created_at, updated_at
) VALUES
  ('40ae28c9-2bc1-450d-9d21-b040f3e09fa0', '2026ddf8-67e2-4959-b528-ffe8db779622', 64, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 20:03:40 GMT+0000 (Coordinated Universal Time)'),
  ('f69749c3-bd2e-441c-ae47-58d34a0180b9', NULL, 65, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('174dc908-7c19-45f5-abbb-e49249fed68e', NULL, 68, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('7fb0adeb-ecd0-4bba-a879-277ea8e0dd5b', 'b02d5f30-0796-422b-aa50-84564da69bf4', 58, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('bcc798d6-ad22-4b1a-baa0-1d791b8f5683', NULL, 67, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('5e781229-d1b2-473e-a7b9-28e10f233c8e', 'fcef8bd2-957d-4716-9a99-f9c958896387', 52, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('a6a720e3-a5f6-450a-84d6-16c0b83b3669', NULL, 61, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('aa2a6024-6ee0-417f-ba3b-c03591c4032e', '08a19d38-f214-4fb7-860b-994f051032ab', 62, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('6d1bfb76-2f8b-41b4-9c0b-b66891400b32', '60421359-f38e-40de-b9ba-7fd566c1ce71', 59, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('447167ea-5a45-487c-9330-244aa6ab9024', NULL, 63, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('8a86e226-7ef8-47c3-9acb-a5ff8eb637c1', '7400b8c5-e856-4c57-a8f9-2b3490cf3f0a', 55, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('afda1d89-0e31-476d-89c0-1eec2730927b', 'c43cc60b-61a8-440e-b31c-d4f784ad66fe', 56, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('9abc2279-b1f2-4712-907b-c6fc2bea38fc', '53d9a0a2-0055-4f53-b150-b715bfdbf93b', 60, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('0ebc73de-a398-444e-b625-ba7181755ec5', NULL, 69, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('b9f568c0-0ba6-4ef3-a0d7-fbe73ba94a51', NULL, 70, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('4f5fb873-b9a8-4aae-92fe-bc83ef426af0', NULL, 72, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('dbdd66d4-c10e-4182-8028-ed70868f7adb', NULL, 71, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('1d9f0ae5-6c0e-4064-8ea1-3a69ee85dc93', NULL, 73, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('9254f9be-9305-44ce-96b8-6824911ca3a6', NULL, 74, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('fab2cd05-3db5-4a90-a0c1-ce9b96e32adb', NULL, 76, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('d7727e52-1818-449e-95e8-2003de492127', NULL, 77, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('bcc28cb8-f5d0-4f3d-83bd-c3153a97a7fb', NULL, 78, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('b737a05a-73e2-45a9-a2ae-656157c75cbe', NULL, 79, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('fd1289fd-3de7-4736-86aa-5d7ef8012a31', NULL, 80, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('dc4851bf-4c3e-4488-a94d-0c878a8ad65a', NULL, 81, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('0c8eeb94-63da-4303-b3c5-a81c81334ceb', NULL, 91, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('d6270ca8-ca4a-49ed-bc70-36c6be9e5cca', NULL, 100, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('b167e822-8ed3-4542-9e30-4aabbfc13ec8', NULL, 83, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('e18941df-8e62-458e-81a2-06025ddb0d6e', NULL, 92, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('a1ab421c-c0ab-451f-a4fa-3971c2eedc9d', NULL, 102, '245.00', '35044.33', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('f3d18bfe-5dd4-4dc3-a213-4ae5c5570347', NULL, 82, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('c67deb50-4403-4d8b-8dc3-bfc40f619884', NULL, 93, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('c5467d11-829e-42e1-ab2c-ce2951a1a862', NULL, 104, '245.00', '35044.33', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('8ba91def-95b7-46de-8d4d-99d784aebd47', NULL, 84, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('c7bdae79-90d2-4799-aca3-4f940c8b4a9d', NULL, 94, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('50d51222-5a05-4290-9555-9ee0316aa53a', NULL, 103, '245.00', '35044.33', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('29a75532-702a-488b-8ae8-2371e4402335', NULL, 85, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('b6d2b1cc-391d-426b-adc6-a0f00d15f1c6', NULL, 95, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('10a4ca0d-e732-46e7-835b-127f94b35972', NULL, 86, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('6d7707d7-6cc5-403f-b6ff-894d93c39035', NULL, 96, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('420d5e91-fb6b-4e5d-b26e-a90b8ac0e909', NULL, 88, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('46db0bb3-ab27-4a5b-9200-43abcc4622ae', NULL, 97, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('95d4ed26-3673-4dd0-81a3-62654fe51cb8', NULL, 87, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('17fac2dd-9cd9-409f-872e-a29bf381342e', NULL, 99, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('e68e5f16-2fe2-463b-9ced-d1db3bd83029', NULL, 90, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('291b6f88-4dc1-4c9e-9412-d59340129b31', NULL, 101, '245.00', '35044.33', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('c8da4448-d9e5-4501-9d69-2c5cc522c10a', NULL, 89, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)'),
  ('5cd30737-cf1b-4b46-abc6-7f7918e26877', NULL, 98, '205.00', '29322.81', '143.03810000', 'Sun Aug 31 2025 00:00:00 GMT+0000 (Coordinated Universal Time)', NULL, 'pendiente', 'sin_especificar', 'Agosto', NULL, NULL, NULL, NULL, NULL, 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)', 'Tue Aug 26 2025 19:56:07 GMT+0000 (Coordinated Universal Time)');

-- ================================================
-- INSERTAR TASAS DE CAMBIO
-- ================================================

INSERT INTO tasas_cambio (id, fecha, moneda, valor, fuente, "createdAt") VALUES
  (26, 'Wed Aug 27 2025 13:12:25 GMT+0000 (Coordinated Universal Time)', 'USD', '144.37320000', 'BCV', NOW()),
  (30, 'Wed Aug 27 2025 13:12:25 GMT+0000 (Coordinated Universal Time)', 'RUB', '1.73247840', 'BCV', NOW()),
  (29, 'Wed Aug 27 2025 13:12:25 GMT+0000 (Coordinated Universal Time)', 'TRY', '3.46495680', 'BCV', NOW()),
  (28, 'Wed Aug 27 2025 13:12:25 GMT+0000 (Coordinated Universal Time)', 'CNY', '20.21224800', 'BCV', NOW()),
  (27, 'Wed Aug 27 2025 13:12:25 GMT+0000 (Coordinated Universal Time)', 'EUR', '168.91664400', 'BCV', NOW()),
  (12, 'Tue Aug 26 2025 14:58:56 GMT+0000 (Coordinated Universal Time)', 'EUR', '167.33884280', 'BCV', NOW()),
  (13, 'Tue Aug 26 2025 14:58:56 GMT+0000 (Coordinated Universal Time)', 'CNY', '20.00784714', 'BCV', NOW()),
  (14, 'Tue Aug 26 2025 14:58:56 GMT+0000 (Coordinated Universal Time)', 'TRY', '3.48960229', 'BCV', NOW()),
  (15, 'Tue Aug 26 2025 14:58:56 GMT+0000 (Coordinated Universal Time)', 'RUB', '1.77245837', 'BCV', NOW()),
  (11, 'Tue Aug 26 2025 14:58:46 GMT+0000 (Coordinated Universal Time)', 'USD', '143.03810000', 'BCV', NOW()),
  (20, 'Mon Aug 25 2025 16:51:14 GMT+0000 (Coordinated Universal Time)', 'RUB', '1.76040135', 'BCV', NOW()),
  (19, 'Mon Aug 25 2025 16:51:14 GMT+0000 (Coordinated Universal Time)', 'TRY', '3.45980789', 'BCV', NOW()),
  (18, 'Mon Aug 25 2025 16:51:14 GMT+0000 (Coordinated Universal Time)', 'CNY', '19.78998535', 'BCV', NOW()),
  (17, 'Mon Aug 25 2025 16:51:14 GMT+0000 (Coordinated Universal Time)', 'EUR', '166.27846769', 'BCV', NOW()),
  (16, 'Mon Aug 25 2025 16:51:14 GMT+0000 (Coordinated Universal Time)', 'USD', '141.88430000', 'BCV', NOW());

-- ================================================
-- ACTUALIZAR SECUENCIAS
-- ================================================

-- Actualizar secuencia de apartamentos
SELECT setval('apartments_id_seq', COALESCE((SELECT MAX(id) FROM apartments), 1));

-- Actualizar secuencia de tasas de cambio
SELECT setval('tasas_cambio_id_seq', COALESCE((SELECT MAX(id) FROM tasas_cambio), 1));

-- Verificar datos insertados
SELECT 'Usuarios insertados: ' || COUNT(*) FROM users;
SELECT 'Apartamentos insertados: ' || COUNT(*) FROM apartments;  
SELECT 'Pagos insertados: ' || COUNT(*) FROM pagos;
SELECT 'Tasas de cambio insertadas: ' || COUNT(*) FROM tasas_cambio;
