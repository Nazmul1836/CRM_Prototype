package com.crmprototype.shared.testsupport;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import org.junit.jupiter.api.Test;

/**
 * Gate check for WP0.2: the embedded PostgreSQL used by tests must support pg_trgm, the same
 * extension the portable dev database relies on. If this fails, stop and report back rather than
 * changing approach.
 */
class PgTrgmAvailabilityTest extends AbstractIntegrationTest {

  @Test
  void pgTrgmExtensionCanBeCreated() throws Exception {
    try (Connection connection = connection();
        Statement statement = connection.createStatement()) {
      statement.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm");

      try (ResultSet rs =
          statement.executeQuery("SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'")) {
        assertThat(rs.next()).isTrue();
        assertThat(rs.getString("extname")).isEqualTo("pg_trgm");
      }
    }
  }
}
