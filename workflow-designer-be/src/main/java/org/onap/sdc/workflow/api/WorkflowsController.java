package org.onap.sdc.workflow.api;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Collection;

@RestController
@RequestMapping("/workflows")
@Api(value = "Workflows kalsjkaj")
public class WorkflowsController {

  @GetMapping
  @ApiOperation(value = "List workflows", response = Collection.class)
  public Collection<String> list() {
    return Arrays.asList("a", "c");
  }

}
