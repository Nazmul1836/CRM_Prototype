package com.crmprototype.shared.testsupport;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

/**
 * Base class for integration tests that need a real PostgreSQL instance. Starts a throwaway
 * embedded PostgreSQL (no Docker, no local install required) once per test class.
 */
public abstract class AbstractIntegrationTest {

    private static EmbeddedPostgres embeddedPostgres;

    @BeforeAll
    static void startEmbeddedPostgres() throws IOException {
        embeddedPostgres = EmbeddedPostgres.builder().start();
    }

    @AfterAll
    static void stopEmbeddedPostgres() throws IOException {
        if (embeddedPostgres != null) {
            embeddedPostgres.close();
        }
    }

    protected static DataSource dataSource() {
        return embeddedPostgres.getPostgresDatabase();
    }

    protected static String jdbcUrl() {
        return embeddedPostgres.getJdbcUrl("postgres", "postgres");
    }

    protected static Connection connection() throws SQLException {
        return dataSource().getConnection();
    }
}
