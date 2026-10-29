package com.crmprototype.app;

import static org.assertj.core.api.Assertions.assertThat;

import com.crmprototype.shared.testsupport.AbstractIntegrationTest;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Proves that Flyway migrations run when the backend starts, against a real (embedded, no Docker)
 * PostgreSQL instance instead of the developer's portable database.
 */
@SpringBootTest
class FlywayMigrationIntegrationTest extends AbstractIntegrationTest {

  @DynamicPropertySource
  static void datasourceProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", FlywayMigrationIntegrationTest::jdbcUrl);
    registry.add("spring.datasource.username", () -> "postgres");
    registry.add("spring.datasource.password", () -> "postgres");
  }

  @Test
  void migrationsRunAndPgTrgmIsEnabled() throws Exception {
    try (Connection connection = connection();
        Statement statement = connection.createStatement()) {
      try (ResultSet rs =
          statement.executeQuery(
              "SELECT version FROM flyway_schema_history WHERE success = true")) {
        assertThat(rs.next()).isTrue();
        assertThat(rs.getString("version")).isEqualTo("1");
      }

      try (ResultSet rs =
          statement.executeQuery("SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'")) {
        assertThat(rs.next()).isTrue();
      }
    }
  }
}
