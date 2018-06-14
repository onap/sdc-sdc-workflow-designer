package org.onap.sdc.workflow.persistence.types;

import static org.springframework.data.cassandra.core.cql.PrimaryKeyType.PARTITIONED;

import lombok.Data;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.mapping.Table;

@Table("unique_value")
@Data
public class UniqueValueEntity {

    @PrimaryKeyColumn(ordinal = 0, type = PARTITIONED)
    private String type;

    @PrimaryKeyColumn(ordinal = 1, type = PARTITIONED)
    private String value;

    public UniqueValueEntity(String type, String value) {
        this.type = type;
        this.value = value;
    }
}
