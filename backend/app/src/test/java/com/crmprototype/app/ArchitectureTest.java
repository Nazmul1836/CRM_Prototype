package com.crmprototype.app;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/**
 * Keeps the module boundaries from the technical design's repository layout real: each module
 * (access, audit, ...) has its own api/internal/web packages, and nothing outside a module may
 * reach into that module's internal package.
 */
class ArchitectureTest {

  private static final String BASE_PACKAGE = "com.crmprototype";

  private static final List<String> MODULES =
      List.of(
          "access",
          "audit",
          "collab",
          "importexport",
          "intelligence",
          "interactions",
          "lists",
          "platform",
          "query",
          "records",
          "schema");

  @Test
  void applicationModulesAreValid() {
    ApplicationModules.of(BASE_PACKAGE).verify();
  }

  @Test
  void noModuleUsesAnotherModulesInternalPackage() {
    JavaClasses classes =
        new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages(BASE_PACKAGE);

    for (String module : MODULES) {
      noClasses()
          .that()
          .resideOutsideOfPackage(BASE_PACKAGE + "." + module + "..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage(BASE_PACKAGE + "." + module + ".internal..")
          .check(classes);
    }
  }
}
