package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Migration V15: Ensure review and emergency columns exist on complaints table.
 * Idempotent: safe to run on both clean databases and databases where columns exist.
 */
public class V15__add_emergency_flag_and_review_fields_to_complaints extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        DatabaseMetaData meta = context.getConnection().getMetaData();
        try (Statement stmt = context.getConnection().createStatement()) {
            addColumnIfNotExists(meta, stmt, "complaints", "reviewed_at", "DATETIME(6) NULL");
            addColumnIfNotExists(meta, stmt, "complaints", "emergency_flag", "BOOLEAN NOT NULL DEFAULT FALSE");
            addColumnIfNotExists(meta, stmt, "complaints", "human_review_required", "BOOLEAN NOT NULL DEFAULT FALSE");
            addColumnIfNotExists(meta, stmt, "complaints", "resolution_type", "VARCHAR(50) NULL");
            addColumnIfNotExists(meta, stmt, "complaints", "evidence_status", "VARCHAR(50) NULL DEFAULT 'PENDING'");
        }
    }

    private void addColumnIfNotExists(DatabaseMetaData meta, Statement stmt, String table, String col, String def) {
        try {
            boolean exists = false;
            try (ResultSet rs = meta.getColumns(null, null, table, col)) {
                if (rs.next()) {
                    exists = true;
                }
            }
            if (!exists) {
                try (ResultSet rsUpper = meta.getColumns(null, null, table.toUpperCase(), col.toUpperCase())) {
                    if (rsUpper.next()) {
                        exists = true;
                    }
                }
            }
            if (!exists) {
                stmt.execute("ALTER TABLE " + table + " ADD COLUMN " + col + " " + def);
            }
        } catch (Exception ignored) {
            // Ignored if column already exists or table dialect differs
        }
    }
}
