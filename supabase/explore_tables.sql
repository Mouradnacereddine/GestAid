-- Affiche la structure des tables principales
\d+ profiles;
\d+ agencies;
\d+ admin_signup_requests;

-- Affiche les 10 premiers enregistrements de chaque table
SELECT * FROM profiles LIMIT 10;
SELECT * FROM agencies LIMIT 10;
SELECT * FROM admin_signup_requests LIMIT 10;
