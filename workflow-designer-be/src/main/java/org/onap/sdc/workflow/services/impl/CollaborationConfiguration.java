package org.onap.sdc.workflow.services.impl;

import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.ItemManagerFactory;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.VersioningManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CollaborationConfiguration {

    @Bean
    public ItemManager itemManager() {
        return ItemManagerFactory.getInstance().createInterface();
    }

    @Bean
    public VersioningManager versioningManager() {
        return VersioningManagerFactory.getInstance().createInterface();
    }
}
