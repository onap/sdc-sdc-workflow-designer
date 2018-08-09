package org.onap.sdc.workflow.api.types.activityspec;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import lombok.Data;

@Data
abstract class ActivitySpecBase {

    @NotBlank(message = "Mandatory name field is missing")
    @Pattern(regexp = "^[a-zA-Z0-9-]*$", message = "name should match with \"^[a-zA-Z0-9-]*$\" pattern")
    private String name;
    private List<String> categoryList;
}
