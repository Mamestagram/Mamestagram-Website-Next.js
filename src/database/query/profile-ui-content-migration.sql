-- Convert existing version 1 JSON layouts to the content-only version 2 format.
-- mysql --database=<database> < src/database/query/profile-ui-content-migration.sql
-- Version 2 layouts, NULL defaults, and theme settings are untouched.
-- A concurrent save is preserved by comparing the original JSON before updating.

DELIMITER //

DROP PROCEDURE IF EXISTS migrate_profile_ui_contents//
CREATE PROCEDURE migrate_profile_ui_contents()
BEGIN
	DECLARE finished BOOLEAN DEFAULT FALSE;
	DECLARE user_id BIGINT UNSIGNED;
	DECLARE source_document JSON;
	DECLARE area_document JSON;
	DECLARE content_document JSON;
	DECLARE contents JSON;
	DECLARE area_index INT;
	DECLARE content_index INT;
	DECLARE area_width DECIMAL(10, 8);
	DECLARE content_width DECIMAL(10, 8);
	DECLARE documents CURSOR FOR
		SELECT id, profile_ui FROM web_user_settings
		WHERE JSON_EXTRACT(profile_ui, '$.version') = 1
		ORDER BY id;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = TRUE;
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
		RESIGNAL;
	END;

	START TRANSACTION;
	OPEN documents;
	read_documents: LOOP
		FETCH documents INTO user_id, source_document;
		IF finished THEN LEAVE read_documents; END IF;
		IF COALESCE(JSON_TYPE(JSON_EXTRACT(source_document, '$.areas')), '') <> 'ARRAY'
			OR JSON_LENGTH(source_document, '$.areas') > 20 THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid legacy profile UI areas.';
		END IF;
		SET contents = JSON_ARRAY();
		SET area_index = 0;
		WHILE area_index < JSON_LENGTH(source_document, '$.areas') DO
			SET area_document = JSON_EXTRACT(source_document, CONCAT('$.areas[', area_index, ']'));
			SET area_width = JSON_UNQUOTE(JSON_EXTRACT(area_document, '$.width'));
			IF area_width IS NULL OR area_width < 0.01 OR area_width > 1
				OR COALESCE(JSON_UNQUOTE(JSON_EXTRACT(area_document, '$.arrangeDirection')), '') NOT IN ('horizontal', 'vertical')
				OR COALESCE(JSON_TYPE(JSON_EXTRACT(area_document, '$.contents')), '') <> 'ARRAY'
				OR JSON_LENGTH(area_document, '$.contents') > 40 THEN
				SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid legacy profile UI area.';
			END IF;
			SET content_index = 0;
			WHILE content_index < JSON_LENGTH(area_document, '$.contents') DO
				SET content_document = JSON_EXTRACT(area_document, CONCAT('$.contents[', content_index, ']'));
				SET content_width = IF(JSON_UNQUOTE(JSON_EXTRACT(area_document, '$.arrangeDirection')) = 'vertical',
					1, JSON_UNQUOTE(JSON_EXTRACT(content_document, '$.width')));
				IF content_width IS NULL OR content_width < 0.01 OR content_width > 1 THEN
					SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid legacy profile UI content width.';
				END IF;
				SET contents = JSON_ARRAY_APPEND(contents, '$', JSON_SET(JSON_REMOVE(content_document, '$.customized'),
					'$.order', JSON_LENGTH(contents) + 1,
					'$.width', GREATEST(0.01, ROUND(area_width * content_width, 2))));
				SET content_index = content_index + 1;
			END WHILE;
			SET area_index = area_index + 1;
		END WHILE;
		UPDATE web_user_settings
		SET profile_ui = JSON_OBJECT('version', 2, 'contents', contents)
		WHERE id = user_id AND profile_ui = source_document;
	END LOOP;
	CLOSE documents;
	COMMIT;
END//

CALL migrate_profile_ui_contents()//
DROP PROCEDURE migrate_profile_ui_contents//

DELIMITER ;

SELECT COUNT(*) AS remaining_version_1_layouts
FROM web_user_settings WHERE JSON_EXTRACT(profile_ui, '$.version') = 1;
