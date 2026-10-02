DELETE FROM episodes
WHERE series_id = (SELECT id FROM series WHERE code = 'HIMYM');

DELETE FROM series
WHERE code = 'HIMYM';
