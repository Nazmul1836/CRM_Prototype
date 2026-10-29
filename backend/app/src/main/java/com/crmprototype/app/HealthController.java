package com.crmprototype.app;

import com.crmprototype.app.generated.api.HealthApi;
import com.crmprototype.app.generated.model.HealthStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController implements HealthApi {

    @Override
    public ResponseEntity<HealthStatus> getHealth() {
        return ResponseEntity.ok(new HealthStatus("ok"));
    }
}
